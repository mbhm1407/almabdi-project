# Installation Guide

This guide covers a **local / developer** installation. For production see
[`DEPLOYMENT.md`](DEPLOYMENT.md), [`AZURE_SETUP.md`](AZURE_SETUP.md) and
[`TEAMS_INSTALLATION.md`](TEAMS_INSTALLATION.md).

## 1. Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 20+ |
| npm | 10+ |
| Azure subscription | for Speech / SQL / Blob / Entra |
| Docker (optional) | for container builds |

## 2. Clone & install

```bash
git clone <repo-url>
cd smart-judicial-minutes
npm install
```

This installs all three workspaces (`@smj/shared`, `@smj/server`, `@smj/client`).

## 3. Configure the server

```bash
cp packages/server/.env.example packages/server/.env
```

Fill in the values (see [`PRODUCTION.md`](PRODUCTION.md) for the full table):
Entra (`ENTRA_TENANT_ID`, `ENTRA_API_CLIENT_ID`), Speech (`AZURE_SPEECH_KEY`,
`AZURE_SPEECH_REGION`), SQL (`SQL_SERVER`, `SQL_DATABASE`, `SQL_USER`,
`SQL_PASSWORD`), Blob (`BLOB_ACCOUNT_NAME`, optionally `BLOB_CONNECTION_STRING`).

## 4. Configure the client (optional)

```bash
cp packages/client/.env.example packages/client/.env
```

`VITE_API_BASE_URL` is empty by default (the dev server proxies `/api`).

## 5. Run

```bash
npm run dev          # API on :3978, client on :5173
```

Teams only loads tab content over HTTPS. For local Teams testing, expose the
client through a dev tunnel (e.g. `devtunnel` / ngrok) and use that HTTPS host
as `APP_DOMAIN` when building the Teams package.

## 6. Verify

```bash
npm run lint && npm run typecheck && npm test && npm run build
node scripts/validate-manifest.mjs
npm run e2e --workspace @smj/client
```

## 7. Build the Teams app package

```bash
python3 scripts/make-icons.py          # (re)generate icons if needed
node scripts/package-teams-app.mjs     # -> teams-app/appPackage.zip
```

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
