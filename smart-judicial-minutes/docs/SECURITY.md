# Security Architecture Document

## Overview

Smart Judicial Minutes is a Microsoft Teams meeting app handling sensitive
courtroom audio and transcripts. Security is enforced in depth across
authentication, authorization, transport, input handling, storage and auditing.

## Trust boundaries

```
Untrusted: meeting participants' speech, client input, inbound headers
Semi-trusted: Teams host (SSO token issuer)
Trusted: API server, Azure SQL, Azure Blob, Azure Speech (server-side key)
```

## Authentication

- **Microsoft Entra ID / Teams SSO.** The tab obtains an access token via
  `authentication.getAuthToken()`; the API validates it on every request.
- **Validation:** signature via the tenant **JWKS** endpoint (cached), plus
  strict **audience** (`ENTRA_API_CLIENT_ID` / `api://…`), **issuer**
  (tenant v1/v2), **RS256** algorithm and **expiry** (with small clock
  tolerance). Failing any check → `401`.
- No passwords, cookies or sessions are used → no session fixation/hijacking
  surface; tokens are short-lived and bearer-only.

## Authorization (RBAC)

- Roles `clerk` / `viewer` / `admin` derived from Entra `roles` claims; any
  authenticated user is at least `clerk`.
- Mutating routes require `clerk`/`admin`; audit is `admin`-only.
- **Tenant isolation:** every query is scoped by `tenantId`; nested resources
  resolve the parent session first. **IDOR is prevented** by keying
  segment/bookmark upserts on `id + sessionId`.

## Input validation & injection

- **Zod** validates body/query/params at the edge; unknown/oversized input is
  rejected (`400` with field details).
- **SQL injection:** all access uses parameterized `mssql` inputs — no string
  concatenation. NoSQL is not used.
- **Prototype pollution:** input is parsed into typed shapes via Zod, not merged
  into objects.
- **SSRF / path traversal:** no user-controlled URLs or file paths; blob names
  are derived from server-side ids; export filenames are sanitized.

## Output handling (XSS)

- The UI renders through React (auto-escaping). The **print** view builds HTML
  with explicit escaping (unit-tested). Exports (DOCX/PDF/TXT) escape/encode
  text appropriately.

## Transport & headers

- HTTPS everywhere. **Helmet** sets a strict **CSP** (`frame-ancestors` limited
  to Teams/Office hosts, `connect-src` limited to Azure Cognitive endpoints),
  **HSTS** (1y, includeSubDomains, preload), **Referrer-Policy**
  (`strict-origin-when-cross-origin`), `X-Content-Type-Options: nosniff`, and
  **Permissions-Policy** (`microphone=(self)`, camera/geolocation disabled).
  `X-Powered-By` is disabled.
- **CORS** is an explicit allow-list (`CORS_ORIGINS`).
- **Clickjacking:** framing is restricted to Teams hosts via CSP.

## Rate limiting & abuse

- Rate limiter (`express-rate-limit`) keyed **per authenticated user** (a hash of
  the bearer token), not per IP — so many users behind one corporate NAT egress
  are not throttled collectively. Unauthenticated requests fall back to the IP.
  Edge-level IP DoS protection is expected to be handled by Azure Front Door /
  API Management.
- Request body caps: JSON `2mb`; recording upload `500mb` with allow-listed
  audio content types; segment batches ≤ 500 (the client streams in ≤ 250 chunks).

## Secrets

- **No secrets reach the browser.** The Azure Speech subscription key stays
  server-side; the client receives only ~10-minute STS tokens. SQL/Blob
  credentials are server-only and should use **Managed Identity** + **Key
  Vault** in production. Recordings are served via **short-lived SAS** URLs.

## Logging & audit

- Structured logs **redact** authorization/cookie/token fields; each request has
  a correlation id (`x-request-id`). No sensitive transcript content is logged.
- Tamper-evident **audit log** records security-relevant actions with actor,
  tenant, action, outcome, IP and timestamp.

## Resilience as security

- Circuit breaker + retries prevent cascading failure and DoS amplification
  against Azure Speech; SQL/Blob retries bound transient failures.

## OWASP Top 10 mapping

| Risk | Mitigation |
|---|---|
| A01 Broken Access Control / IDOR | Tenant scoping; `id+sessionId` keying; RBAC |
| A02 Cryptographic Failures | HTTPS/HSTS; no secrets client-side; SAS |
| A03 Injection | Parameterized SQL; Zod; output escaping |
| A04 Insecure Design | Minimal surface; least privilege; audit |
| A05 Security Misconfiguration | Helmet, CORS allow-list, fail-fast env validation |
| A06 Vulnerable Components | CI dependency audit; pinned versions |
| A07 Auth Failures | Entra JWKS validation; short-lived bearer tokens |
| A08 Integrity Failures | Signed tokens; additive migrations; no dynamic eval |
| A09 Logging/Monitoring | Structured logs + correlation ids + audit trail |
| A10 SSRF | No user-controlled outbound requests |

## Token-validation hardening (post-deployment procedure)

The verifier (`infrastructure/auth/entraTokenVerifier.ts`) already strictly
validates **signature (RS256/JWKS), algorithm, audience, issuer, tenant (via the
tenant-scoped issuer) and expiry/nbf**. Two further defense-in-depth controls —
requiring the `scp` (delegated-scope) claim and explicitly rejecting ID tokens —
are **intentionally not enforced in code** because their compatibility depends on
the tenant's app-registration configuration (`accessTokenAcceptedVersion`,
exposed-scope name) and can only be confirmed with a real Teams SSO token. Enable
them **only after** completing this verification against the target tenant:

1. **Capture a real token.** In the deployed app (or a Teams test meeting) call
   `authentication.getAuthToken()` and copy the token, or decode a captured
   `Authorization: Bearer` value at <https://jwt.ms>.
2. **Confirm the claims** on the decoded token:
   - `aud` equals `ENTRA_API_CLIENT_ID` **or** `api://<APP_DOMAIN>/<CLIENT_ID>`.
   - `iss` matches `https://login.microsoftonline.com/<TENANT_ID>/v2.0` (or the
     v1 `https://sts.windows.net/<TENANT_ID>/`).
   - `tid` equals `ENTRA_TENANT_ID`.
   - `scp` is present and **contains** the exposed scope (default
     `access_as_user`). Note the exact value and `ver` (`1.0` vs `2.0`).
3. **Only if step 2 confirms `scp` is present with the expected value**, add a
   scope check after `jwt.verify` succeeds, e.g. reject when the space-delimited
   `scp` does not include `env.ENTRA_API_SCOPE`. This also rejects ID tokens
   (which carry no `scp`). Add a unit test over the pure claim-mapping with a
   payload that has / lacks the scope.
4. **Re-test SSO end to end** in Teams (desktop, web, mobile) before release; a
   too-strict scope check will silently break sign-in.

Until this tenant-specific verification is done, keeping `scp` unenforced is the
safe default — the audience + issuer + tenant + signature checks already bind the
token to this app and tenant.

## Known residual risk

- Two **moderate** transitive advisories via Microsoft's Speech SDK (`uuid`
  bounds-check). Not reachable with untrusted input in our usage; awaiting an
  upstream SDK release. Tracked by the CI dependency-audit job.
- **Recording upload buffers the audio in memory** (up to the 500 MB cap) before
  writing to Blob. This is an authenticated, once-per-hearing, per-user
  rate-limited operation, so it is not an acute vector, but under many concurrent
  uploads it adds memory pressure. Recommended enhancement: stream the request
  body directly to Blob (`uploadStream`) to bound memory — deferred because it
  requires validation against live Azure Blob.

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
