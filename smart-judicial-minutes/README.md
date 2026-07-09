# المحضر الذكي — Smart Judicial Minutes

A **Microsoft Teams meeting app** that helps the court clerk capture everything
said during a Teams hearing as a **live Arabic transcript**. It runs inside the
Teams **meeting side panel** and does one thing well:

> The clerk presses **«بدء النسخ المباشر» (Start Live Transcript)** and every
> spoken sentence appears instantly — with speaker name and timestamp — as the
> clerk's reference while writing the official minutes.

This app is **not** a case-management system. It does not create or approve
official minutes, manage court workflow, or integrate with judicial systems.
Its only job is fast, accurate live transcription of the hearing.

---

## Features

| # | Feature | Where |
|---|---------|-------|
| 1 | Start transcription | Meeting side panel toolbar |
| 2 | Stop transcription | Meeting side panel toolbar |
| 3 | Live Arabic transcript (`ar-SA`) | Azure AI Speech — Conversation Transcription |
| 4 | Speaker name (diarization, editable) | Per line |
| 5 | Timestamp | Per line |
| 6 | Search transcript | Toolbar (client filter + server search API) |
| 7 | Save transcript | Azure SQL (auto-persisted as you speak) |
| 8 | Save audio recording | Azure Blob Storage |
| 9 | Export as **PDF / DOCX / TXT** | Toolbar export menu |
| 10 | Dark mode | Header toggle + follows Teams theme |
| 11 | RTL | Whole UI is right-to-left |
| 12 | Responsive UI | Fluent UI v9, fits the side panel |

### Judicial enhancements

Built for a Ministry of Justice hearing, the app adds a courtroom-focused layer
on top of the core transcription:

- **Case number** captured at setup and printed on every export.
- **Judicial roles** — assign each speaker to Judge / Clerk / Plaintiff /
  Defendant / Lawyer / Witness / Observer. Lines show the real Teams display
  name **and** the role (`القاضي — أحمد الحربي`).
- **Pre-hearing setup** — the clerk confirms the title, enters the case number,
  and prepares the participant roster before starting.
- **Pause / resume** transcription without ending the session.
- **Current speaker**, **elapsed time**, and a clear **recording indicator** in
  the header.
- **Search with next / previous navigation** and highlight-all matches.
- **Copy** a single line or the entire transcript.
- **Recordings panel** — play / pause / download with duration and size.
- **Friendly error dialogs** for speech disconnects, network loss, Azure
  unavailability, permission denied, and token expiry.
- **Virtualized transcript** so long hearings stay smooth.
- **Large, readable Arabic** typography and a distraction-free layout that shows
  only the essential controls while recording.

### Ministry-grade production hardening

- **Official Ministry of Justice identity** — a green Fluent UI v9 brand ramp,
  Arabic-first copy centralized in one place, the ⚖️ emblem and «وزارة العدل»
  wordmark, with all developer/English terminology removed.
- **Official opening screen** — case number, circuit (الدائرة), judge, clerk,
  hearing date and start time, then one large **بدء التوثيق** button.
- **Courtroom header** — ministry identity, case number, circuit, live duration,
  status, current speaker and recording state.
- **Judicial bookmarks** (📌 إضافة علامة) — labelled moments persisted to Azure
  SQL; clicking one jumps the transcript and seeks audio playback.
- **Hearing statistics** — duration, speakers, words, phrases, last update,
  connection status and speech-service status.
- **Print** a professional RTL, escaped, ministry-branded transcript.
- **Reliability** — automatic Speech reconnection with backoff, offline
  detection, and a crash-safe local backup of unsaved segments so transcript
  text is never lost.
- **Performance** — the Azure Speech SDK is lazy-loaded (out of the initial
  bundle) and vendors are split into cacheable chunks; the transcript is
  virtualized and rows are memoized.

## Tech stack

- **Frontend:** React + TypeScript + **Fluent UI v9**, **Microsoft Teams JS SDK v2**,
  Azure Speech SDK (browser), Vite.
- **Backend:** Node.js + **Express** + TypeScript, REST API.
- **Speech:** **Azure AI Speech** — `ConversationTranscriber`, locale `ar-SA`.
- **Data:** **Azure SQL** (transcript + sessions + audit), **Azure Blob Storage**
  (audio recordings).
- **Auth:** **Microsoft Entra ID** with **Teams SSO**, RBAC, audited.
- **Quality:** strict TypeScript, ESLint, Prettier, Vitest, Docker, GitHub Actions.

## Repository layout

```
smart-judicial-minutes/
├── packages/
│   ├── shared/     # Domain types + Zod schemas shared by client & server
│   ├── server/     # Express REST API (clean, feature-based architecture)
│   │   └── src/
│   │       ├── config/          # Validated env
│   │       ├── middleware/      # auth, rbac, validation, errors
│   │       ├── infrastructure/  # db (Azure SQL), blob, Entra token verifier
│   │       └── features/        # sessions, transcripts, recordings, speech, audit, health
│   └── client/     # React + Fluent UI v9 Teams tab
│       └── src/
│           ├── teams/           # Teams SDK init, SSO, config
│           ├── services/        # API client, Speech transcriber, audio recorder
│           ├── theme/           # Fluent themes, dark mode, RTL
│           └── features/transcript/  # The single page + components + hook
├── teams-app/      # Teams app package (manifest + icons) and zip builder
├── scripts/        # Icon generator, Teams package builder
└── .github/workflows/ci.yml
```

Documentation:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — design and data flow.
- [`docs/PRODUCTION.md`](docs/PRODUCTION.md) — deployment, Azure setup, env vars,
  reliability, monitoring, troubleshooting and recovery procedures.
- [`docs/API.md`](docs/API.md) — REST API reference.

## Getting started (local development)

Requires Node.js 20+.

```bash
cd smart-judicial-minutes
npm install

# configure the backend
cp packages/server/.env.example packages/server/.env
# edit packages/server/.env with your Azure + Entra values

# configure the client (optional; defaults to the dev proxy)
cp packages/client/.env.example packages/client/.env

npm run dev        # runs the API (:3978) and the Vite dev server (:5173)
```

Teams only loads tab content over HTTPS. For local testing, expose the client
dev server through a tunnel (e.g. `dev tunnels` or ngrok) and set that HTTPS
host as `APP_DOMAIN` when building the Teams package.

## Quality gates

```bash
npm run lint          # ESLint
npm run format:check  # Prettier
npm run typecheck     # tsc --noEmit across workspaces
npm test              # Vitest (server + client)
npm run build         # build shared, server, client
```

## Docker

```bash
docker compose up --build
# API  -> http://localhost:3978
# SPA  -> http://localhost:8080
```

## Azure resources you need

1. **Entra ID app registration** (single app used for both the tab and the API):
   - Expose an API scope `access_as_user`.
   - Add the Teams client IDs as pre-authorized apps for SSO.
   - Set the Application ID URI to `api://<APP_DOMAIN>/<CLIENT_ID>`.
   - (Optional) Define app roles `admin` / `clerk` / `viewer` for RBAC.
2. **Azure AI Speech** resource (any region that supports `ar-SA`).
3. **Azure SQL** database (tables are created automatically on first start).
4. **Azure Storage** account with a blob container for recordings.

Put the values in `packages/server/.env` (see `.env.example`).

## Building & installing the Teams app

```bash
# 1. (re)generate icons if needed
python3 scripts/make-icons.py

# 2. fill the manifest placeholders (${{...}}) — TEAMS_APP_ID, APP_DOMAIN,
#    ENTRA_API_CLIENT_ID — then build the package
node scripts/package-teams-app.mjs      # -> teams-app/appPackage.zip
```

Upload `teams-app/appPackage.zip` in Teams → **Apps → Manage your apps →
Upload an app**, then add it to a meeting. During a hearing, open the app in the
meeting side panel and press **بدء النسخ المباشر**.

## Security

- Teams SSO tokens are validated against the tenant JWKS (audience + issuer
  strictly checked) on every request.
- Role-based access control (`clerk` / `viewer` / `admin`).
- `helmet` security headers (with `frame-ancestors` scoped to Teams hosts),
  CORS allow-list, and global rate limiting.
- All input validated with Zod at the edge.
- Security-relevant actions written to an **audit log** in Azure SQL.
- The Azure Speech subscription key never reaches the browser — the backend
  issues short-lived STS tokens instead.
