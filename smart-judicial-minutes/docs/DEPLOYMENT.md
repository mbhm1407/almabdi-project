# Deployment Guide

Production deployment of **المحضر الذكي — Smart Judicial Minutes**. Prerequisite:
the Azure resources from [`AZURE_SETUP.md`](AZURE_SETUP.md) are provisioned and
the environment variables from [`PRODUCTION.md`](PRODUCTION.md) are available.

## Topology

```
Teams client ──HTTPS──▶ Client (nginx static SPA)
                           │
Teams client ──Bearer──▶ Server (Express API) ──▶ Azure SQL / Blob / Speech STS
```

Both are container images built from this repo. Recommended hosts: **Azure
Container Apps** or **App Service (Linux containers)**.

## 1. Build images

```bash
docker build -f packages/server/Dockerfile -t smj-server:1.0.0 .
docker build -f packages/client/Dockerfile -t smj-client:1.0.0 .
```

Push to your registry (e.g. Azure Container Registry).

## 2. Local smoke test

```bash
docker compose up --build
# API  -> http://localhost:3978/health/live
# SPA  -> http://localhost:8080
```

## 3. Deploy the server

- Set all environment variables (prefer **Managed Identity** for SQL and Blob:
  `SQL_USE_MANAGED_IDENTITY=true`, omit `BLOB_CONNECTION_STRING`).
- Enable **HTTPS only**; the platform terminates TLS.
- Expose port `3978`.
- Health probes: liveness `GET /health/live`, readiness `GET /health/ready`.
- The database schema + additive migrations are created automatically on first
  start (idempotent `ensureSchema()`), so grant DDL rights on the first deploy.

## 4. Deploy the client

- Serve the `smj-client` image (nginx) behind HTTPS on your `APP_DOMAIN`.
- The image already sets a CSP with `frame-ancestors` for Teams hosts.
- If the API is on a different origin, set `VITE_API_BASE_URL` at build time and
  rebuild the client image.

## 5. Configure Entra & CORS

- `CORS_ORIGINS` must include the Teams host(s) and the client origin.
- `ENTRA_API_CLIENT_ID` must equal the API app registration id; the Application
  ID URI must be `api://<APP_DOMAIN>/<CLIENT_ID>`.

## 6. Package & publish the Teams app

See [`TEAMS_INSTALLATION.md`](TEAMS_INSTALLATION.md).

## 7. Post-deploy verification

- `GET /health/ready` returns `{"status":"ready"}` (SQL reachable).
- Sideload the Teams package, add it to a meeting, press **بدء التوثيق**, and
  confirm live Arabic text, save, export, and recording playback.
- Confirm every response carries an `x-request-id` header.

## Rollback

Images are versioned; redeploy the previous tag. The database uses only additive
migrations, so older images remain compatible with a newer schema.

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
