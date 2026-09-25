import { Readable } from 'node:stream';
import { google } from 'googleapis';
import { config } from './config.js';

const FOLDER_MIME = 'application/vnd.google-apps.folder';
const SHEET_MIME = 'application/vnd.google-apps.spreadsheet';

function escapeQuery(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function safeCellText(value) {
  const text = String(value ?? '');
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

async function findChild(drive, parentId, name, mimeType) {
  const result = await drive.files.list({
    q: `'${parentId}' in parents and name = '${escapeQuery(name)}' and mimeType = '${mimeType}' and trashed = false`,
    fields: 'files(id,name,webViewLink)',
    pageSize: 1,
  });
  return result.data.files?.[0] || null;
}

async function ensureFolder(drive, name, parentId = 'root') {
  const existing = await findChild(drive, parentId, name, FOLDER_MIME);
  if (existing) return existing;
  const result = await drive.files.create({
    requestBody: { name, mimeType: FOLDER_MIME, parents: [parentId] },
    fields: 'id,name,webViewLink',
  });
  return result.data;
}

async function ensureSpreadsheet(auth, drive, rootFolderId) {
  const existing = await findChild(drive, rootFolderId, config.spreadsheetName, SHEET_MIME);
  if (existing) return existing;

  const sheets = google.sheets({ version: 'v4', auth });
  const created = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: config.spreadsheetName },
      sheets: [{
        properties: {
          title: 'Results',
          gridProperties: { frozenRowCount: 1 },
        },
      }],
    },
  });
  const id = created.data.spreadsheetId;
  await drive.files.update({ fileId: id, addParents: rootFolderId, removeParents: 'root', fields: 'id' });
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: 'Results!A1:J1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        'Input image', 'Video prompt', 'File name', 'Drive file',
        'Batch ID', 'Status', 'Created at', 'Model', 'Batch position', 'Error',
      ]],
    },
  });
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: id,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
            cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.92, green: 0.94, blue: 0.98 } } },
            fields: 'userEnteredFormat(textFormat,backgroundColor)',
          },
        },
        { updateDimensionProperties: { range: { sheetId: 0, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 180 }, fields: 'pixelSize' } },
        { updateDimensionProperties: { range: { sheetId: 0, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, properties: { pixelSize: 700 }, fields: 'pixelSize' } },
      ],
    },
  });
  return {
    id,
    name: config.spreadsheetName,
    webViewLink: `https://docs.google.com/spreadsheets/d/${id}/edit`,
  };
}

export async function ensureWorkspace(auth) {
  const drive = google.drive({ version: 'v3', auth });
  const root = await ensureFolder(drive, config.driveRootFolderName);
  const batches = await ensureFolder(drive, 'batches', root.id);
  const spreadsheet = await ensureSpreadsheet(auth, drive, root.id);
  return { drive, root, batches, spreadsheet };
}

export async function createBatch(auth, batchId) {
  const workspace = await ensureWorkspace(auth);
  const folder = await ensureFolder(workspace.drive, batchId, workspace.batches.id);
  return {
    folderId: folder.id,
    folderUrl: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`,
    spreadsheetId: workspace.spreadsheet.id,
    spreadsheetUrl: workspace.spreadsheet.webViewLink || `https://docs.google.com/spreadsheets/d/${workspace.spreadsheet.id}/edit`,
  };
}

export async function uploadImage(auth, folderId, file) {
  const drive = google.drive({ version: 'v3', auth });
  const created = await drive.files.create({
    requestBody: { name: file.originalname, parents: [folderId] },
    media: { mimeType: file.mimetype, body: Readable.from(file.buffer) },
    fields: 'id,name,webViewLink,webContentLink,thumbnailLink',
  });

  if (config.publicDrivePreviews) {
    await drive.permissions.create({
      fileId: created.data.id,
      requestBody: { type: 'anyone', role: 'reader' },
    });
  }
  return created.data;
}

export async function appendResult(auth, data) {
  const sheets = google.sheets({ version: 'v4', auth });
  const driveUrl = data.driveFile
    ? (data.driveFile.webViewLink || `https://drive.google.com/file/d/${data.driveFile.id}/view`)
    : '';
  const directUrl = data.driveFile ? `https://drive.google.com/uc?export=view&id=${data.driveFile.id}` : '';
  const imageCell = !data.driveFile
    ? safeCellText(data.fileName)
    : config.publicDrivePreviews
      ? `=IMAGE("${directUrl}",4,120,160)`
      : `=HYPERLINK("${driveUrl}","Open image")`;

  const result = await sheets.spreadsheets.values.append({
    spreadsheetId: data.spreadsheetId,
    range: 'Results!A:J',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    includeValuesInResponse: true,
    requestBody: {
      values: [[
        imageCell,
        safeCellText(data.prompt),
        safeCellText(data.fileName),
        driveUrl,
        safeCellText(data.batchId),
        safeCellText(data.status || 'Completed'),
        new Date().toISOString(),
        safeCellText(data.model || config.xaiModel),
        data.position,
        safeCellText(data.error || ''),
      ]],
    },
  });
  return result.data.updates?.updatedRange || null;
}
