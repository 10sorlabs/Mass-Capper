import crypto from 'node:crypto';
import { google } from 'googleapis';
import { config } from './config.js';

const scopes = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
];

export function createOAuthClient(tokens) {
  const client = new google.auth.OAuth2(
    config.googleClientId(),
    config.googleClientSecret(),
    config.googleRedirectUri,
  );
  if (tokens) client.setCredentials(tokens);
  return client;
}

export function installAuthRoutes(app) {
  app.get('/auth/google', (req, res, next) => {
    try {
      const oauth = createOAuthClient();
      const state = crypto.randomBytes(24).toString('hex');
      req.session.oauthState = state;
      res.redirect(oauth.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
        state,
      }));
    } catch (error) {
      next(error);
    }
  });

  app.get('/auth/google/callback', async (req, res, next) => {
    try {
      if (!req.query.state || req.query.state !== req.session.oauthState) {
        return res.status(400).send('Ongeldige OAuth state. Probeer opnieuw in te loggen.');
      }
      delete req.session.oauthState;

      const oauth = createOAuthClient();
      const { tokens } = await oauth.getToken(String(req.query.code || ''));
      oauth.setCredentials(tokens);
      const ticket = await oauth.verifyIdToken({
        idToken: tokens.id_token,
        audience: config.googleClientId(),
      });
      const profile = ticket.getPayload();
      const email = profile?.email?.toLowerCase();

      if (!profile?.email_verified || email !== config.allowedGoogleEmail()) {
        req.session.destroy(() => {});
        return res.status(403).send('Dit Google-account heeft geen toegang tot Mass Capper.');
      }

      req.session.user = { email, name: profile.name, picture: profile.picture };
      req.session.googleTokens = tokens;
      req.session.save(() => res.redirect('/'));
    } catch (error) {
      next(error);
    }
  });

  app.post('/auth/logout', (req, res) => {
    req.session.destroy(() => res.status(204).end());
  });
}

export function requireAuth(req, res, next) {
  if (!req.session?.user || !req.session?.googleTokens) {
    return res.status(401).json({ error: 'Niet ingelogd.' });
  }
  next();
}

export function googleAuthForRequest(req) {
  const oauth = createOAuthClient(req.session.googleTokens);
  oauth.on('tokens', (tokens) => {
    req.session.googleTokens = { ...req.session.googleTokens, ...tokens };
  });
  return oauth;
}
