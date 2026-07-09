# Release Notes — v1.0.0

**المحضر الذكي — Smart Judicial Minutes**
Microsoft Teams meeting app for the Ministry of Justice.
Release date: 2026-07-09.

## Highlights

A production-ready Teams meeting app that gives the court clerk a **live Arabic
transcript** of a hearing — with speaker names, judicial roles and timestamps —
plus search, bookmarks, statistics, export, print and audio recording, all
inside the Teams meeting side panel.

## What's included

- **Live transcription** (Azure AI Speech, `ar-SA`) with start/stop/pause/resume
  and automatic reconnection.
- **Official opening screen** and **courtroom header** (Ministry identity, case
  number, circuit, judge, duration, status, current speaker).
- **Judicial roles**, **bookmarks** (jump transcript + audio), **statistics**,
  **search** (highlight + next/prev), **copy**, **print**, **export** to
  PDF/DOCX/TXT, **audio recording** with playback/download.
- **Ministry green theme**, full RTL, dark mode, accessibility
  (`prefers-reduced-motion`), responsive side-panel layout.
- **About dialog** with version and authorship.

## Security

Entra ID / Teams SSO (JWKS validation), RBAC, tenant isolation, Helmet CSP +
HSTS + Permissions-Policy, CORS allow-list, rate limiting, Zod validation,
parameterized SQL, escaped exports/print, server-side secrets, short-lived SAS,
audit log, correlation ids.

## Reliability & performance

SQL/Blob retries, Speech circuit breaker, client auto-reconnect + offline
backup, lazy-loaded Speech SDK, split vendor chunks, virtualized transcript.

## Quality

- **112 automated tests** — 106 unit/integration (Vitest) + 6 E2E (Playwright).
- Scale-tested: ~6-hour / 5,400-utterance export; 10,000-segment / 120-speaker
  helper operations.
- Gates: TypeScript, ESLint, Prettier, Vitest, Playwright, production build
  (0 warnings), manifest validation, dependency audit.

## Known issues

- Two **moderate** transitive advisories via Microsoft's Speech SDK (`uuid`
  bounds-check); not reachable with untrusted input — awaiting upstream fix.
- PDF Arabic shaping relies on the reader's substitution font (embedding a
  subsetted Arabic font is a planned enhancement).

## Verify after deployment (environment-gated)

Docker image build, live Teams + Azure Speech transcription, and real Azure
SQL/Blob/Entra behavior must be validated in the target environment (see
[`PRODUCTION_CHECKLIST.md`](PRODUCTION_CHECKLIST.md)).

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
