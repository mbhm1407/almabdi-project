# Administrator Manual

For Microsoft 365 / Teams administrators and application operators.

## Roles (RBAC)

| Role | Capabilities |
|---|---|
| `clerk` | Start/stop sessions, capture & save transcript, recordings, bookmarks, export. Default for any authenticated user. |
| `viewer` | Read-only access to existing transcripts/recordings. |
| `admin` | Everything, plus access to the **audit log** (`GET /api/audit`). |

Roles are derived from **Entra app-role claims** (`roles`). Assign users to the
`admin` / `viewer` app roles in the Entra app registration → **Enterprise
applications → Users and groups**. Any signed-in user without a role is a
`clerk`.

## Access model

All data is **tenant-scoped**: a session, transcript, bookmark or recording is
only reachable by users in the same Entra tenant, and only via a session the
caller owns/belongs to. Cross-session identifiers cannot be tampered with
(server enforces `id + sessionId`).

## Audit log

Security-relevant actions are written to `dbo.AuditLog`:
session start/stop, transcript export, recording save, bookmark add/remove,
and speech-token issuance — with actor, tenant, action, outcome, IP and time.
Admins can read recent entries via `GET /api/audit?limit=N`.

## Configuration

Environment variables are documented in [`PRODUCTION.md`](PRODUCTION.md). Key
operational knobs:

- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` — API rate limiting.
- `CORS_ORIGINS` — allowed origins (Teams host + client).
- `LOG_LEVEL` — `info` (default), `debug`, or `silent`.
- `SQL_USE_MANAGED_IDENTITY`, `BLOB_CONNECTION_STRING` — auth modes.

## Monitoring

- Structured JSON logs with correlation ids (`reqId`). Ship to Application
  Insights / Azure Monitor.
- Health: `GET /health/live` (liveness), `GET /health/ready` (SQL readiness).
- Recommended alerts: readiness failures, elevated 5xx, Speech circuit-open,
  SQL connection retries, rate-limit spikes.

## Teams app management

- Sideloading and org-wide publishing: see
  [`TEAMS_INSTALLATION.md`](TEAMS_INSTALLATION.md).
- Control availability via Teams admin **app permission/setup policies**.
- The app requires **microphone** permission (declared in the manifest).

## Data retention

- Transcripts/bookmarks live in Azure SQL; recordings in Blob Storage. Apply a
  **Blob lifecycle policy** and a SQL retention/archival job per Ministry policy.
- Deleting a session cascades to its transcript segments and bookmarks.

## Compliance notes

- The app captures meeting audio and speech. Ensure participants are notified
  per applicable policy; Teams' own recording/notification rules still apply.
- No secrets are exposed to the browser; recordings are served via short-lived
  SAS URLs only.

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
