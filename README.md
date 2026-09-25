# Mass Capper

Mass Capper turns batches of JPG/PNG start frames into MiniMax H3 I2VA video prompts. It uses Grok for image understanding, stores the original images in Google Drive, and appends every prompt to one Google Sheet.

## What it does

- Google OAuth login restricted to one allowed email address
- One multi-file selection with up to 100 images
- JPG, JPEG and PNG only; maximum 20 MiB per image
- Grok `grok-4.7` image understanding with `instructions.md` as the system instructions
- A new Google Drive subfolder for every batch
- One persistent `Mass Capper Results` spreadsheet
- Per-file progress, prompt copying, Drive links and clear errors
- Three concurrent files by default, configurable from Render

## Google Sheet columns

1. Input image
2. Video prompt
3. File name
4. Drive file
5. Batch ID
6. Status
7. Created at
8. Model
9. Batch position
10. Error

Drive files remain private by default. In that mode, the first column contains an `Open image` link. Set `PUBLIC_DRIVE_PREVIEWS=true` to show thumbnails using `IMAGE(...)`; this also gives anyone who possesses the unguessable Drive URL read access to each uploaded image.

## Local setup

Requirements: Node.js 20+, an xAI API key and a Google Cloud OAuth client.

```bash
npm install
copy .env.example .env
npm run dev
```

Fill in `.env` before signing in. Never commit that file.

## Google Cloud setup

1. Create or select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Google Drive API** and **Google Sheets API**.
3. Configure the OAuth consent screen. For a personal app in testing, add the intended Google account as a test user.
4. Create an **OAuth client ID** with application type **Web application**.
5. Add the local redirect URI:

   ```text
   http://localhost:3000/auth/google/callback
   ```

6. After Render provides the production hostname, add this second redirect URI:

   ```text
   https://YOUR-RENDER-HOST/auth/google/callback
   ```

The app requests `drive.file`, `spreadsheets`, identity and email scopes. `drive.file` limits the app to files it created or that were explicitly opened with the app.

## Render deployment

The repository contains `render.yaml` for a Render Blueprint deployment.

The Blueprint uses Render's free web-service plan. Free services spin down after inactivity, so the first page load after a quiet period can take roughly a minute and the Google session might need to be renewed after a restart.

1. In Render, create a new Blueprint and select this GitHub repository.
2. Once the service URL exists, add its callback URL to the Google OAuth client.
3. Configure the following secret environment variables in Render:

   | Variable | Value |
   | --- | --- |
   | `APP_URL` | `https://YOUR-RENDER-HOST` |
   | `GOOGLE_REDIRECT_URI` | `https://YOUR-RENDER-HOST/auth/google/callback` |
   | `GOOGLE_CLIENT_ID` | OAuth client ID |
   | `GOOGLE_CLIENT_SECRET` | OAuth client secret |
   | `ALLOWED_GOOGLE_EMAIL` | The only Google account allowed into the panel |
   | `XAI_API_KEY` | xAI API key |

`SESSION_SECRET` is generated automatically by the Blueprint. Leave `PUBLIC_DRIVE_PREVIEWS=false` unless link-accessible images are acceptable.

## Other environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `XAI_MODEL` | `grok-4.7` | xAI vision-capable model |
| `XAI_REASONING_EFFORT` | `low` | Reasoning effort for prompt generation |
| `DRIVE_ROOT_FOLDER_NAME` | `Mass Capper` | Root Drive folder |
| `SPREADSHEET_NAME` | `Mass Capper Results` | Persistent spreadsheet name |
| `CLIENT_CONCURRENCY` | `3` | Simultaneous image jobs, clamped to 1–5 |

## Security and operational notes

- API keys and OAuth secrets are server-side only.
- The app validates OAuth state and checks the verified Google email.
- Files are uploaded one at a time per worker rather than sending the whole batch in one HTTP request.
- Images are held in server memory only for the duration of one request.
- xAI request/response storage is disabled with `store: false`.
- The default in-memory session store is suitable for one Render instance. Signing in again after a restart is expected.
- Start with 2–3 images to confirm API access and prompt quality before processing a batch of 100.

## Tests

```bash
npm test
```
