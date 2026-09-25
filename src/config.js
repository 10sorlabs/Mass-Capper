import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  port: Number(process.env.PORT || 3000),
  appUrl: process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`,
  sessionSecret: process.env.SESSION_SECRET || 'local-development-only-change-me',
  xaiApiKey: () => required('XAI_API_KEY'),
  xaiModel: process.env.XAI_MODEL || 'grok-4.7',
  xaiReasoningEffort: process.env.XAI_REASONING_EFFORT || 'low',
  googleClientId: () => required('GOOGLE_CLIENT_ID'),
  googleClientSecret: () => required('GOOGLE_CLIENT_SECRET'),
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/auth/google/callback`,
  allowedGoogleEmail: () => required('ALLOWED_GOOGLE_EMAIL').toLowerCase(),
  driveRootFolderName: process.env.DRIVE_ROOT_FOLDER_NAME || 'Mass Capper',
  spreadsheetName: process.env.SPREADSHEET_NAME || 'Mass Capper Results',
  publicDrivePreviews: process.env.PUBLIC_DRIVE_PREVIEWS === 'true',
  clientConcurrency: Math.max(1, Math.min(5, Number(process.env.CLIENT_CONCURRENCY || 3))),
  instructionsPath: path.resolve(here, '../instructions.md'),
};

export function configurationStatus() {
  const names = [
    'XAI_API_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'ALLOWED_GOOGLE_EMAIL',
  ];
  return {
    ready: names.every((name) => Boolean(process.env[name]?.trim())),
    missing: names.filter((name) => !process.env[name]?.trim()),
  };
}
