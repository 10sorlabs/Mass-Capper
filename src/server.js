import 'dotenv/config';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import { config, configurationStatus } from './config.js';
import { googleAuthForRequest, installAuthRoutes, requireAuth } from './auth.js';
import { createVideoPrompt } from './grok.js';
import { appendResult, createBatch, uploadImage } from './google-storage.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://lh3.googleusercontent.com'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(express.json({ limit: '100kb' }));
app.use(session({
  name: 'mass-capper.sid',
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 12 * 60 * 60 * 1000,
  },
}));

installAuthRoutes(app);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const allowed = new Set(['image/jpeg', 'image/png']);
    callback(allowed.has(file.mimetype) ? null : new Error('Alleen JPG, JPEG en PNG zijn toegestaan.'), allowed.has(file.mimetype));
  },
});

const apiLimiter = rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false });
app.use('/api', apiLimiter);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/api/session', (req, res) => {
  const status = configurationStatus();
  res.json({
    authenticated: Boolean(req.session?.user),
    user: req.session?.user || null,
    configured: status.ready,
    missing: status.ready ? [] : status.missing,
    limits: { maxFiles: 100, maxFileBytes: 20 * 1024 * 1024, concurrency: config.clientConcurrency },
    publicDrivePreviews: config.publicDrivePreviews,
  });
});

app.post('/api/batches', requireAuth, async (req, res, next) => {
  try {
    const now = new Date();
    const stamp = now.toISOString().replace(/[:.]/g, '-');
    const shortId = crypto.randomBytes(4).toString('hex');
    const batchId = `${stamp}_${shortId}`;
    const auth = googleAuthForRequest(req);
    const batch = await createBatch(auth, batchId);
    req.session.batches ||= {};
    req.session.batches[batchId] = batch;
    req.session.save(() => res.status(201).json({ batchId, ...batch }));
  } catch (error) {
    next(error);
  }
});

app.post('/api/batches/:batchId/process', requireAuth, upload.single('image'), async (req, res, next) => {
  let auth;
  let driveFile;
  let position = 1;
  try {
    if (!req.file) return res.status(400).json({ error: 'Geen afbeelding ontvangen.' });
    const batch = req.session.batches?.[req.params.batchId];
    if (!batch) return res.status(404).json({ error: 'Batch niet gevonden of sessie verlopen.' });

    position = Math.max(1, Number(req.body.position || 1));
    auth = googleAuthForRequest(req);
    driveFile = await uploadImage(auth, batch.folderId, req.file);
    const generated = await createVideoPrompt(req.file);
    const updatedRange = await appendResult(auth, {
      spreadsheetId: batch.spreadsheetId,
      driveFile,
      prompt: generated.prompt,
      fileName: req.file.originalname,
      batchId: req.params.batchId,
      model: generated.model,
      position,
    });
    res.json({
      fileName: req.file.originalname,
      prompt: generated.prompt,
      model: generated.model,
      driveUrl: driveFile.webViewLink || `https://drive.google.com/file/d/${driveFile.id}/view`,
      spreadsheetUrl: batch.spreadsheetUrl,
      updatedRange,
    });
  } catch (error) {
    const batch = req.session.batches?.[req.params.batchId];
    if (auth && batch && req.file) {
      try {
        await appendResult(auth, {
          spreadsheetId: batch.spreadsheetId,
          driveFile,
          prompt: '',
          fileName: req.file.originalname,
          batchId: req.params.batchId,
          model: config.xaiModel,
          position,
          status: 'Failed',
          error: error.message,
        });
      } catch (recordError) {
        console.error('Could not record failed item in Google Sheets:', recordError);
      }
    }
    next(error);
  }
});

app.use(express.static(path.resolve(here, '../public'), { extensions: ['html'] }));

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'De afbeelding is groter dan 20 MiB.' });
  }
  const status = error.status || error.statusCode || 500;
  const safeMessage = status >= 500 && process.env.NODE_ENV === 'production'
    ? 'De verwerking is mislukt. Controleer de serverlog voor details.'
    : error.message;
  res.status(status).json({ error: safeMessage || 'Onbekende fout.' });
});

app.listen(config.port, () => {
  console.log(`Mass Capper listening on ${config.appUrl}`);
});
