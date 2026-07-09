# Final Production Checklist

Legend: ✅ verified in repo/CI · ⚙️ configure per environment · 🔍 verify
after deployment.

## Code quality & build

- ✅ TypeScript: `tsc --noEmit` clean (all workspaces)
- ✅ ESLint: 0 errors / 0 warnings
- ✅ Prettier: all files formatted
- ✅ Vitest: 106 unit/integration tests pass
- ✅ Playwright: 6 E2E tests pass
- ✅ Production build: 0 warnings (Speech SDK lazy-loaded, vendors split)
- ✅ No `TODO`/`FIXME`/dead code/`console.*` in app source
- ✅ Teams manifest validation passes

## Security

- ✅ Entra ID / Teams SSO token validation (JWKS, audience, issuer, expiry)
- ✅ RBAC + tenant isolation + IDOR prevention
- ✅ Helmet CSP, HSTS, Referrer-Policy, Permissions-Policy, nosniff
- ✅ CORS allow-list; rate limiting; body-size caps
- ✅ Zod validation; parameterized SQL; escaped exports/print
- ✅ No secrets in the browser; short-lived SAS; audit log
- ✅ Dependency audit: 0 high/critical (2 accepted moderate transitive)
- ⚙️ Secrets stored in Key Vault; Managed Identity for SQL/Blob

## Reliability

- ✅ SQL connection retry + timeouts; Blob retry policy; Speech circuit breaker
- ✅ Client auto-reconnect + offline detection + local backup (never lose text)
- ✅ Health probes (`/health/live`, `/health/ready`)
- ✅ Correlation ids in logs and error bodies

## Configuration

- ⚙️ All required env vars set (see `PRODUCTION.md`)
- ⚙️ `CORS_ORIGINS` includes Teams host + client origin
- ⚙️ `ENTRA_API_CLIENT_ID` + Application ID URI match the manifest
- ⚙️ Manifest `${{...}}` tokens filled (`TEAMS_APP_ID`, `APP_DOMAIN`, client id)

## Azure

- ⚙️ Entra app registration (scope, pre-authorized Teams ids, app roles)
- ⚙️ Speech resource in an `ar-SA` region
- ⚙️ SQL database (grants / managed identity); geo-replication for DR
- ⚙️ Blob container; soft delete + versioning + lifecycle policy
- ⚙️ Application Insights / Azure Monitor wired to logs

## Deployment

- 🔍 Docker images build (CI job; local daemon not required)
- 🔍 `docker compose config` valid (verified) → images run
- 🔍 `/health/ready` returns `ready` against real SQL
- 🔍 Teams package sideloads and pins to the meeting side panel
- 🔍 Live smoke test: start → Arabic text → save → export → recording playback

## Operations

- ⚙️ Alerts: readiness, 5xx, Speech circuit-open, SQL retries
- ⚙️ Backup retention (SQL PITR/LTR, Blob soft-delete) enabled
- ⚙️ DR failover drill scheduled

## Sign-off

- 🔍 Security review sign-off
- 🔍 Accessibility review sign-off (WCAG 2.2 AA)
- 🔍 Ministry compliance / participant-notification review

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
