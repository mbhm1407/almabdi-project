# Backup & Restore Guide

## What to back up

| Data | Store | Contains |
|---|---|---|
| Transcripts, sessions, bookmarks, audit | **Azure SQL** | All textual hearing data |
| Audio recordings | **Azure Blob** | `<tenant>/<session>/recording.<ext>` |
| App configuration | Key Vault / app settings | Env vars, secrets |
| Teams app package | Repo / artifact | `teams-app/appPackage.zip` |

The application tier is **stateless** (container images) and is rebuilt from the
repository — no backup required beyond source control.

## Azure SQL

**Automated (recommended):**

- Azure SQL keeps automatic backups with **Point-in-Time Restore (PITR)** —
  configure retention (e.g. 7–35 days) and **Long-Term Retention (LTR)** for
  weekly/monthly/yearly archives per Ministry policy.
- Enable **active geo-replication** or an **auto-failover group** for DR.

**Restore:**

```text
Azure Portal → SQL database → Restore → pick a point in time / LTR backup
→ restore to a new database → repoint SQL_DATABASE / SQL_SERVER → verify /health/ready
```

**Manual export (optional):** export a `.bacpac` for offline archival.

## Azure Blob (recordings)

- Enable **soft delete** (blob + container) and **versioning**.
- Use **RA-GRS** for cross-region redundancy.
- **Lifecycle policy**: transition to Cool/Archive and expire per retention.

**Restore:** undelete a soft-deleted blob/version, or copy from the secondary
(RA-GRS) endpoint.

## Configuration & secrets

- Secrets live in **Key Vault** (enable soft delete + purge protection).
- Keep an inventory of app settings; treat `.env` as ephemeral and never commit
  it.

## Verify a restore

1. Point a staging server at the restored SQL database.
2. `GET /health/ready` → `ready`.
3. Open a previously recorded session; confirm transcript and (if applicable)
   recording playback via SAS.

## Schema compatibility

Migrations are **additive** (`ensureSchema()` adds columns/tables if missing),
so a newer app can run against an older restored database, and an older app runs
against a newer schema.

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
