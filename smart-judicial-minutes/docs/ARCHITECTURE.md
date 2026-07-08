# Architecture

## Goal & scope

Smart Judicial Minutes is a **single-purpose Microsoft Teams meeting app**: turn
Arabic speech in a Teams hearing into a live, searchable, exportable transcript
for the court clerk. It is intentionally small — no case management, no workflow,
no official-minutes generation.

## High-level flow

```
┌────────────────────── Microsoft Teams (meeting side panel) ──────────────────────┐
│                                                                                   │
│   React + Fluent UI v9 tab  ──(Teams SSO token)──▶  Express REST API              │
│        │                                                  │                       │
│        │ 1. GET /api/speech/token                         │  validates Entra ID   │
│        │◀──────────── short-lived STS token ──────────────│  token (JWKS)         │
│        │                                                  │                       │
│        │ 2. mic audio ──▶ Azure AI Speech (direct WSS)    │                       │
│        │◀── transcribing/transcribed events (ar-SA) ──    │                       │
│        │                                                  │                       │
│        │ 3. POST /api/sessions/:id/segments (batched)     │──▶ Azure SQL          │
│        │ 4. POST /api/sessions/:id/recording (on stop)    │──▶ Azure Blob Storage │
│        │ 5. GET  /api/sessions/:id/export?format=pdf|docx|txt                     │
│        │                                                  │──▶ Audit log (SQL)    │
└───────────────────────────────────────────────────────────────────────────────────┘
```

1. The clerk opens the app in the meeting side panel and presses **Start Live
   Transcript**.
2. The tab requests a **short-lived Azure Speech token** from the backend
   (the subscription key stays server-side).
3. The browser Speech SDK opens a direct, secure connection to Azure AI Speech
   and streams microphone audio. `ConversationTranscriber` returns diarized
   utterances (speaker id + text + offset + duration) in `ar-SA`.
4. Interim results render immediately; finalized utterances are **batched and
   persisted** to Azure SQL every few seconds.
5. On **Stop**, the recorded audio (captured in parallel with `MediaRecorder`)
   is uploaded to Blob Storage and the session is closed.
6. The clerk can search the transcript and export it as PDF/DOCX/TXT.

## Backend — clean, feature-based architecture

Each feature is a vertical slice with a clear separation between transport
(routes), application logic (services), and persistence (repositories):

```
features/
  sessions/     sessionRoutes → sessionService → sessionRepository
  transcripts/  transcriptRoutes → transcriptService → segmentRepository + exportService
  recordings/   recordingRoutes → recordingService → blobService
  speech/       speechRoutes → speechService (Azure STS)
  audit/        auditRoutes → auditService → auditRepository
  health/       liveness / readiness probes
infrastructure/
  db/           Azure SQL pool + idempotent schema bootstrap
  blob/         Azure Blob Storage (SAS download URLs)
  auth/         Entra ID token verification (JWKS)
middleware/     requireAuth, requireRole (RBAC), validate (Zod), error handler
config/         env.ts — fail-fast, validated configuration
```

**SOLID / Clean Architecture** principles applied:
- Routes depend on services; services depend on repository/infra abstractions.
- `infrastructure` isolates all Azure/SQL specifics behind small interfaces.
- The domain contract (types + Zod schemas) lives in `@smj/shared`, so the
  client and server agree on shapes and validation.
- Cross-cutting concerns (auth, validation, errors, audit) are middleware/services,
  not sprinkled through handlers.

## Frontend — one screen, many small pieces

`TranscriptPage` is the only screen. It composes:

- `MeetingHeader` — meeting info, live status, dark-mode toggle.
- `TranscriptToolbar` — Start/Stop, search, saving indicator, export menu.
- `TranscriptList` → `SegmentRow` — the live, auto-scrolling transcript with
  editable speaker labels.

State and side effects are centralized in the **`useTranscription`** hook, which
owns the session lifecycle, the Azure Speech transcriber, the audio recorder,
the in-memory segment list, and the periodic persistence flush.

Teams integration lives in `teams/teamsClient.ts`: SDK init, meeting context,
frame-context detection (content vs. settings), SSO token acquisition, and the
tab configuration save handler.

## Data model (Azure SQL)

- **Sessions** — one row per hearing capture (meeting id, tenant, clerk, status,
  timestamps, recording blob name).
- **TranscriptSegments** — one row per utterance (speaker, text, timestamp,
  offset, duration), FK to Sessions, upserted by client-generated id so re-sends
  are idempotent.
- **AuditLog** — actor, action, resource, outcome, ip, timestamp.

## Security model

- **Authentication:** Teams SSO issues an Entra ID access token whose audience is
  this app's registration. Every API call carries it as a bearer token; the
  backend verifies signature (tenant JWKS), audience, issuer and expiry.
- **Authorization:** RBAC via `requireRole`. Roles derive from Entra app-role
  claims; any authenticated user is at least a `clerk`.
- **Transport & headers:** HTTPS everywhere, `helmet` (CSP with `frame-ancestors`
  limited to Teams/Office hosts), strict CORS allow-list.
- **Abuse protection:** global rate limiting; request body size caps.
- **Input validation:** Zod schemas validate params/query/body at the edge.
- **Secret hygiene:** the Speech subscription key never leaves the server; the
  browser only ever holds a ~10-minute STS token. Azure SQL and Blob support
  managed-identity auth for zero-secret production deployments.
- **Auditability:** session start/stop, exports, recording saves and token
  issuance are written to the audit log.
