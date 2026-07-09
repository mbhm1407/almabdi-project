# API Reference

Base URL: the server origin (e.g. `https://api.example.gov.sa`). All `/api/*`
routes require a **Microsoft Entra ID bearer token** obtained via Teams SSO:

```
Authorization: Bearer <token>
```

Every response carries an `x-request-id` correlation header. Errors use a
consistent envelope:

```json
{ "error": { "code": "STRING", "message": "STRING", "details": [], "requestId": "..." } }
```

Roles: `clerk` (default for any authenticated user), `viewer` (read-only),
`admin`. Mutating endpoints require `clerk` or `admin`.

## Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health/live` | none | Liveness probe |
| GET | `/health/ready` | none | Readiness (checks Azure SQL) |

## Speech

| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/api/speech/token` | clerk, admin | Short-lived Azure Speech STS token (`{ token, region, locale, expiresInSeconds }`) |

## Sessions

| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/api/sessions` | clerk, admin | Start a session. Body: `{ meetingId, meetingTitle, caseNumber?, circuitName?, judgeName? }` |
| GET | `/api/sessions?meetingId=…` | any | List sessions for a meeting |
| GET | `/api/sessions/:sessionId` | any | Get one session |
| POST | `/api/sessions/:sessionId/stop` | clerk, admin | Stop a session |

## Transcript

| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/api/sessions/:sessionId/segments` | clerk, admin | Persist a batch (`{ segments: [...] }`, ≤500) |
| GET | `/api/sessions/:sessionId/segments` | any | Full transcript |
| GET | `/api/sessions/:sessionId/search?q=…` | any | Server-side search |
| GET | `/api/sessions/:sessionId/export?format=pdf\|docx\|txt` | any | Export (attachment) |

## Recording

| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/api/sessions/:sessionId/recording` | clerk, admin | Upload audio (raw body; `audio/webm\|ogg\|wav\|mpeg\|mp4`, ≤500 MB) |
| GET | `/api/sessions/:sessionId/recording` | any | Short-lived SAS download URL |

## Bookmarks

| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/api/sessions/:sessionId/bookmarks` | clerk, admin | Add (`{ id, label, offsetMs, timestamp }`) |
| GET | `/api/sessions/:sessionId/bookmarks` | any | List bookmarks |
| DELETE | `/api/sessions/:sessionId/bookmarks/:bookmarkId` | clerk, admin | Remove |

## Audit

| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/api/audit?limit=…` | admin | Recent audit entries (tenant-scoped) |

## Status codes

`200/201/204` success · `400` validation (`details[]`) · `401` unauthenticated ·
`403` forbidden · `404` not found · `429` rate limited · `502` upstream (Azure)
· `500` internal. All access is tenant-scoped: a session/bookmark/recording is
only reachable within the caller's Entra tenant.
