const $ = (selector) => document.querySelector(selector);
const state = { files: [], rows: [], limits: null, running: false, batch: null };

async function api(url, options = {}) {
  const response = await fetch(url, options);
  const payload = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || `Request failed (${response.status})`);
  return payload;
}

function show(id) { $(id).classList.remove('hidden'); }
function hide(id) { $(id).classList.add('hidden'); }

async function boot() {
  const session = await api('/api/session');
  state.limits = session.limits;
  if (!session.configured) {
    $('#missingConfig').textContent = session.missing.join('\n');
    show('#setupView');
    return;
  }
  if (!session.authenticated) {
    show('#loginView');
    return;
  }
  $('#userArea').innerHTML = `
    <div class="user"><img src="${escapeAttribute(session.user.picture || '')}" alt=""><span>${escapeHtml(session.user.name || session.user.email)}</span><button id="logoutButton" type="button">Uitloggen</button></div>`;
  $('#logoutButton').addEventListener('click', async () => {
    await api('/auth/logout', { method: 'POST' });
    location.reload();
  });
  show('#appView');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function escapeAttribute(value) { return escapeHtml(value); }

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function validateFiles(inputFiles) {
  const files = [...inputFiles];
  if (files.length > state.limits.maxFiles) throw new Error(`Selecteer maximaal ${state.limits.maxFiles} afbeeldingen.`);
  for (const file of files) {
    if (!['image/jpeg', 'image/png'].includes(file.type)) throw new Error(`${file.name} is geen JPG- of PNG-bestand.`);
    if (file.size > state.limits.maxFileBytes) throw new Error(`${file.name} is groter dan 20 MiB.`);
  }
  return files;
}

function selectFiles(inputFiles) {
  if (state.running) return;
  try {
    state.files = validateFiles(inputFiles);
    $('#selectionCount').textContent = `${state.files.length} ${state.files.length === 1 ? 'bestand' : 'bestanden'}`;
    $('#selectionSize').textContent = `${formatBytes(state.files.reduce((sum, file) => sum + file.size, 0))} totaal`;
    state.files.length ? show('#batchActions') : hide('#batchActions');
  } catch (error) {
    alert(error.message);
  }
}

function makeRows() {
  $('#results').replaceChildren();
  state.rows = state.files.map((file, index) => {
    const node = $('#resultTemplate').content.firstElementChild.cloneNode(true);
    const thumb = node.querySelector('.thumb');
    const url = URL.createObjectURL(file);
    thumb.src = url;
    thumb.alt = `Voorvertoning van ${file.name}`;
    thumb.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
    node.querySelector('.file-name').textContent = `${String(index + 1).padStart(2, '0')} · ${file.name}`;
    const row = { file, node, status: 'waiting' };
    node.querySelector('.copy-button').addEventListener('click', async () => {
      await navigator.clipboard.writeText(node.querySelector('.prompt').value);
      const button = node.querySelector('.copy-button');
      button.textContent = 'Gekopieerd';
      setTimeout(() => { button.textContent = 'Kopieer prompt'; }, 1200);
    });
    node.querySelector('.retry-button').addEventListener('click', async () => {
      if (!state.batch || row.status !== 'error') return;
      row.node.querySelector('.retry-button').classList.add('hidden');
      await processRow(row, state.batch, index + 1);
    });
    $('#results').append(node);
    return row;
  });
}

function setRowStatus(row, status, message) {
  row.status = status;
  const badge = row.node.querySelector('.status');
  badge.className = `status ${status}`;
  badge.textContent = ({ waiting: 'Wachtend', running: 'Bezig', done: 'Klaar', error: 'Mislukt' })[status];
  if (status === 'error') row.node.querySelector('.prompt').value = message;
  row.node.querySelector('.retry-button').classList.toggle('hidden', status !== 'error');
}

function updateProgress() {
  const complete = state.rows.filter((row) => ['done', 'error'].includes(row.status)).length;
  const failed = state.rows.filter((row) => row.status === 'error').length;
  $('#progressCount').textContent = `${complete} / ${state.rows.length}`;
  $('#progressBar').style.width = `${state.rows.length ? (complete / state.rows.length) * 100 : 0}%`;
  $('#progressLabel').textContent = complete === state.rows.length
    ? (failed ? `Klaar met ${failed} fout${failed === 1 ? '' : 'en'}` : 'Batch voltooid')
    : 'Prompts genereren…';
}

async function processRow(row, batch, position) {
  setRowStatus(row, 'running');
  const body = new FormData();
  body.append('image', row.file);
  body.append('position', String(position));
  try {
    const result = await api(`/api/batches/${encodeURIComponent(batch.batchId)}/process`, { method: 'POST', body });
    row.node.querySelector('.prompt').value = result.prompt;
    const copy = row.node.querySelector('.copy-button');
    copy.disabled = false;
    const drive = row.node.querySelector('.drive-link');
    drive.href = result.driveUrl;
    drive.classList.remove('hidden');
    setRowStatus(row, 'done');
  } catch (error) {
    setRowStatus(row, 'error', error.message);
  } finally {
    updateProgress();
  }
}

async function startBatch() {
  if (state.running || !state.files.length) return;
  state.running = true;
  $('#startButton').disabled = true;
  $('#fileInput').disabled = true;
  makeRows();
  show('#progressPanel');
  $('#progressPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const batch = await api('/api/batches', { method: 'POST' });
    state.batch = batch;
    for (const selector of ['#sheetLink', '#sheetLinkTop']) {
      const link = $(selector);
      link.href = batch.spreadsheetUrl;
      link.classList.remove('hidden');
    }
    const queue = state.rows.map((row, index) => ({ row, position: index + 1 }));
    const worker = async () => {
      while (queue.length) {
        const item = queue.shift();
        await processRow(item.row, batch, item.position);
      }
    };
    await Promise.all(Array.from({ length: Math.min(state.limits.concurrency, queue.length) }, worker));
  } catch (error) {
    state.rows.filter((row) => row.status === 'waiting').forEach((row) => setRowStatus(row, 'error', error.message));
    updateProgress();
  } finally {
    state.running = false;
    $('#startButton').disabled = false;
    $('#startButton').textContent = 'Nieuwe batch verwerken';
    $('#fileInput').disabled = false;
  }
}

$('#fileInput').addEventListener('change', (event) => selectFiles(event.target.files));
$('#startButton').addEventListener('click', startBatch);
const dropzone = $('#dropzone');
for (const eventName of ['dragenter', 'dragover']) {
  dropzone.addEventListener(eventName, (event) => { event.preventDefault(); dropzone.classList.add('dragging'); });
}
for (const eventName of ['dragleave', 'drop']) {
  dropzone.addEventListener(eventName, (event) => { event.preventDefault(); dropzone.classList.remove('dragging'); });
}
dropzone.addEventListener('drop', (event) => selectFiles(event.dataTransfer.files));

boot().catch((error) => {
  document.body.innerHTML = `<main class="shell"><section class="center-card"><h1>Er ging iets mis.</h1><p>${escapeHtml(error.message)}</p></section></main>`;
});
