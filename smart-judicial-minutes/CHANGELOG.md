# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/) and the project follows
[Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-07-09

First production release (RC1) — a Microsoft Teams meeting app that produces a
live Arabic transcript for the court clerk.

### Added

- **Live Arabic transcription** (Azure AI Speech, `ar-SA`, Conversation
  Transcription with speaker diarization); start / stop / pause / resume.
- **Official opening screen** (case number, circuit, judge, clerk, date, time)
  and courtroom header (Ministry identity, duration, status, current speaker).
- **Judicial roles** per speaker; transcript blocks show name + role + timestamp.
- **Judicial bookmarks** persisted to Azure SQL; jump transcript + audio.
- **Hearing statistics** (duration, speakers, words, phrases, last update,
  connection & speech-service status).
- **Search** with match count, next/previous navigation and highlight-all.
- **Copy** line / whole transcript; **Print**; **Export** to PDF / DOCX / TXT
  (RTL, with title, case number, circuit, judge, date and duration).
- **Audio recording** to Azure Blob Storage with playback (SAS) + download.
- **Ministry of Justice green theme**, RTL throughout, dark mode, responsive
  side-panel layout, `prefers-reduced-motion` support.
- **About dialog** with version and authorship.

### Security

- Microsoft Entra ID / Teams SSO token validation (JWKS: signature, audience,
  issuer, expiry); RBAC (`clerk` / `viewer` / `admin`); tenant-scoped access.
- Helmet CSP (`frame-ancestors` scoped to Teams), HSTS, Referrer-Policy,
  Permissions-Policy; CORS allow-list; global rate limiting.
- Zod validation on every input; parameterized SQL; escaped exports/print.
- Speech key server-side only; short-lived SAS for recordings; audit log.

### Reliability & performance

- Azure SQL connection retry + timeouts; Blob exponential retry; Speech STS
  circuit breaker + retry; correlation ids (`x-request-id`) in logs & errors.
- Client Speech auto-reconnect with backoff; offline detection; crash-safe
  local backup of unsaved segments.
- Lazy-loaded Speech SDK, split vendor chunks, virtualized transcript,
  memoized rows.

### Tooling

- Strict TypeScript, ESLint, Prettier, Vitest (unit/integration), Playwright
  (E2E), Docker, GitHub Actions (lint/format/typecheck/coverage/manifest/
  build/e2e/audit/docker).

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
