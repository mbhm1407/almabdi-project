# Troubleshooting Guide

Every API response includes an **`x-request-id`** header (and error bodies
include `requestId`). Quote it when investigating — it correlates client, server
logs and Application Insights.

## Authentication / access

| Symptom | Likely cause | Resolution |
|---|---|---|
| `401` on every call | Token audience/issuer mismatch | Verify `ENTRA_API_CLIENT_ID` and the Application ID URI `api://<APP_DOMAIN>/<CLIENT_ID>` |
| `401` "انتهت صلاحية الجلسة" | Token expired | Refresh the tab / re-consent |
| `403` "صلاحيات غير كافية" | Missing role | Assign the required app role in Entra |
| Consent loop | Scope not pre-authorized | Pre-authorize Teams client ids; grant admin consent |

## Transcription

| Symptom | Likely cause | Resolution |
|---|---|---|
| Nothing captured | Mic permission denied | Allow microphone in Teams/browser (`devicePermissions: media`) |
| "خدمة التوثيق غير متاحة" | Speech circuit open / key/region wrong | Check `AZURE_SPEECH_KEY`/`REGION` and Azure Speech status |
| Frequent reconnect banners | Unstable network to Azure Speech | Check egress to `*.cognitiveservices.azure.com` (wss) |
| Wrong speaker labels | Diarization guess | Use the speaker edit popover to assign name + role |

## Data / persistence

| Symptom | Likely cause | Resolution |
|---|---|---|
| `/health/ready` fails | SQL unreachable | Check SQL firewall/VNet, credentials or managed-identity grants |
| "تعذّر حفظ النص" | Transient SQL/network fault | Auto-retries; text is re-queued + backed up locally |
| Recording won't play/download | SAS expired | Reopen the recordings panel to mint a fresh SAS |
| `502 UPSTREAM_ERROR` | Azure Speech/Blob upstream failure | Check Azure status; retry |

## Teams / manifest

| Symptom | Likely cause | Resolution |
|---|---|---|
| App won't sideload | Invalid manifest | Run `node scripts/validate-manifest.mjs`; fill `${{...}}` tokens |
| Blank side panel | CSP/frame-ancestors | Ensure client served over HTTPS on `APP_DOMAIN`; CSP allows Teams |
| SSO fails silently | `webApplicationInfo` mismatch | `resource` must equal `api://<APP_DOMAIN>/<CLIENT_ID>` |

## Build / CI

| Symptom | Likely cause | Resolution |
|---|---|---|
| Bundle-size warning | Large chunk | Speech SDK is lazy-loaded; vendors split — check `manualChunks` |
| E2E can't find browser | Playwright browser missing | `npx playwright install --with-deps chromium` (CI does this) |
| `npm audit` moderate | Transitive Speech SDK `uuid` | Accepted; awaiting upstream SDK fix |

## Diagnostics checklist

1. Capture the `x-request-id` from the failing response.
2. Search server logs / Application Insights for that `reqId`.
3. Check `/health/live` and `/health/ready`.
4. Confirm env vars and Azure resource health.

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
