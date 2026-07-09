# Azure Setup Guide

Provision the Azure resources the application depends on. All resources should
live in the same region where possible, and secrets should be stored in
**Azure Key Vault**.

## 1. Microsoft Entra ID app registration (Teams SSO)

One registration serves both the tab and the API.

1. **App registrations → New registration** → name it, single tenant.
2. **Expose an API**:
   - Set **Application ID URI** to `api://<APP_DOMAIN>/<CLIENT_ID>`.
   - Add a scope `access_as_user` (admins + users consent).
   - **Pre-authorize** the Teams client application ids so SSO issues tokens
     silently:
     - `1fec8e78-bce4-4aaf-ab1b-5451cc387264` (Teams desktop/mobile)
     - `5e3ce6c0-2b1f-4285-8d4b-75ee78787346` (Teams web)
3. **API permissions**: Microsoft Graph `openid`, `profile`, `email`
   (delegated). Grant admin consent.
4. (Optional) **App roles**: define `admin`, `clerk`, `viewer` and assign users
   for fine-grained RBAC (any authenticated user is a `clerk` by default).
5. Note the **Tenant ID** and **Client ID** → `ENTRA_TENANT_ID`,
   `ENTRA_API_CLIENT_ID`.

## 2. Azure AI Speech

1. Create a **Speech** resource in a region that supports `ar-SA`.
2. Copy **Key** and **Region** → `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`.
   The key stays server-side; the browser only ever receives short-lived STS
   tokens minted by the API.

## 3. Azure SQL Database

1. Create an **Azure SQL** server + database (e.g. `smartjudicialminutes`).
2. Networking: allow the app's outbound IP / VNet; enable "Allow Azure services"
   only if appropriate.
3. Auth options:
   - **SQL auth**: create a contained user → `SQL_USER`, `SQL_PASSWORD`.
   - **Managed identity** (recommended): assign the app's identity
     `db_datareader` + `db_datawriter` (and DDL on first deploy); set
     `SQL_USE_MANAGED_IDENTITY=true`.
4. Tables (`Sessions`, `TranscriptSegments`, `Bookmarks`, `AuditLog`) and
   additive migrations are created on first start.

## 4. Azure Blob Storage

1. Create a **Storage account**; create a container (default `recordings`).
2. Auth options:
   - **Connection string** → `BLOB_CONNECTION_STRING` (SAS minted from the
     account key).
   - **Managed identity** (recommended): grant **Storage Blob Data Contributor**
     to the app identity; set only `BLOB_ACCOUNT_NAME` (user-delegation SAS).
3. Apply a **lifecycle rule** to archive/expire recordings per retention policy.

## 5. Observability (recommended)

- **Application Insights / Azure Monitor**: ingest the server's structured JSON
  logs; pivot on the `reqId` correlation id.
- Alerts: readiness failures, elevated 5xx, Speech circuit-open, SQL retries.

## 6. Secrets

Store `AZURE_SPEECH_KEY`, SQL credentials and any connection strings in
**Key Vault**; surface them as app settings / container secrets. Never commit
secrets.

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
