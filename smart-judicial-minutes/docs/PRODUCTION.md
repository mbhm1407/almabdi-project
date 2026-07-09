# Production & Operations Guide

This guide covers deploying and operating **المحضر الذكي — Smart Judicial Minutes**
as an enterprise Microsoft Teams application for the Ministry of Justice.

## Architecture recap

- **Client** (`@smj/client`) — React + Fluent UI v9 Teams tab (meeting side panel).
- **Server** (`@smj/server`) — Express REST API.
- **Shared** (`@smj/shared`) — domain types + Zod schemas.
- **Azure**: AI Speech (transcription), SQL (transcript/sessions/bookmarks/audit),
  Blob Storage (audio recordings), Entra ID (auth).

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full design and data flow.

## Environment variables (server)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | no | `development` \| `test` \| `production` |
| `PORT` | no | Listen port (default 3978) |
| `CORS_ORIGINS` | no | Comma-separated allow-list (Teams host) |
| `ENTRA_TENANT_ID` | **yes** | Entra tenant id |
| `ENTRA_API_CLIENT_ID` | **yes** | API app registration (token audience) |
| `ENTRA_API_SCOPE` | no | Exposed scope (default `access_as_user`) |
| `AZURE_SPEECH_KEY` | **yes** | Speech key (server-only, never sent to browser) |
| `AZURE_SPEECH_REGION` | **yes** | Speech region |
| `SPEECH_LOCALE` | no | Recognition locale (default `ar-SA`) |
| `SQL_SERVER` / `SQL_DATABASE` | **yes** | Azure SQL target |
| `SQL_USER` / `SQL_PASSWORD` | conditionally | Required unless managed identity |
| `SQL_USE_MANAGED_IDENTITY` | no | `true` to use managed identity |
| `SQL_ENCRYPT` | no | `true` (default) |
| `BLOB_ACCOUNT_NAME` | **yes** | Storage account for recordings |
| `BLOB_CONTAINER` | no | Container name (default `recordings`) |
| `BLOB_CONNECTION_STRING` | no | Optional; otherwise managed identity |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | no | Rate-limit tuning |
| `LOG_LEVEL` | no | `info` (default); `silent` disables logs |

Secrets should live in **Azure Key Vault** and be surfaced as app settings /
container secrets — never committed. In production, prefer **Managed Identity**
for SQL and Blob (`SQL_USE_MANAGED_IDENTITY=true`, no `BLOB_CONNECTION_STRING`)
so no credentials exist anywhere.

## Azure provisioning

1. **Entra ID app registration** (single app for tab + API): expose
   `access_as_user`, pre-authorize the Teams client ids, set the Application ID
   URI to `api://<APP_DOMAIN>/<CLIENT_ID>`, optionally define app roles
   `admin`/`clerk`/`viewer`.
2. **Azure AI Speech** resource in a region that supports `ar-SA`.
3. **Azure SQL** database. Tables and additive migrations are created on first
   start by `ensureSchema()` (idempotent). Grant the app identity `db_datareader`
   + `db_datawriter` (and DDL rights on first deploy).
4. **Azure Storage** account + blob container; apply a lifecycle rule to expire
   or archive old recordings per retention policy.

## Deployment

```bash
# Container images
docker build -f packages/server/Dockerfile -t smj-server .
docker build -f packages/client/Dockerfile -t smj-client .
docker compose up            # local smoke test
```

Deploy `smj-server` to Azure Container Apps / App Service (set env vars, enable
Managed Identity, enable HTTPS-only). Host `smj-client` behind HTTPS (the nginx
image serves the static SPA and sets CSP `frame-ancestors` for Teams).

Health probes:

- Liveness: `GET /health/live`
- Readiness: `GET /health/ready` (verifies Azure SQL connectivity)

## Reliability behavior

- **Azure SQL**: connection acquisition is retried with exponential backoff;
  pool + request timeouts are bounded.
- **Azure Blob**: exponential retry policy on every operation.
- **Azure Speech STS**: token requests are retried and guarded by a **circuit
  breaker** that fails fast when Speech is down.
- **Client**: the Speech SDK auto-reconnects with backoff after transient
  disconnects; offline is detected; unsaved segments are mirrored to
  `localStorage` and the server persists every few seconds — transcript text is
  never lost across a disconnect, refresh, or crash.

## Monitoring

- Structured JSON logs (pino) with a **correlation id** per request
  (`x-request-id`, echoed to clients and included in error bodies). Ship logs to
  **Azure Monitor / Application Insights**; pivot on `reqId`.
- Security-relevant actions (session start/stop, exports, recording saves,
  bookmark changes, token issuance) are written to the `AuditLog` table.
- Alert on: readiness failures, elevated 5xx, Speech circuit-open events, SQL
  connection retries.

## Troubleshooting

| Symptom | Likely cause | Action |
|---|---|---|
| 401 on every call | Token audience/issuer mismatch | Verify `ENTRA_API_CLIENT_ID` and Application ID URI |
| `readiness` fails | SQL unreachable / firewall | Check SQL firewall + identity grants |
| "خدمة التوثيق غير متاحة" | Speech circuit open | Check Speech key/region + Azure status |
| No audio on stop | Mic permission denied | Grant mic permission in Teams/browser |
| Recording won't play | SAS expired | Reopen the recordings panel to mint a fresh SAS |

## Recovery procedures

- **Browser refresh / Teams reconnect mid-hearing**: the session row and already
  persisted segments remain in Azure SQL; reopening the tab shows them. Unsaved
  segments are recovered from `localStorage`.
- **Speech outage**: the client keeps retrying; when Speech returns, capture
  resumes automatically without losing prior text.
- **API outage**: the client re-queues unsaved segments and retries; nothing is
  dropped once connectivity returns.


---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
