# Maintenance Guide

## Routine cadence

| Task | Frequency |
|---|---|
| Review dependency audit (`npm audit`) | Weekly / on CI alert |
| Apply patch updates (non-breaking) | Monthly |
| Review audit log & access | Monthly |
| Rotate secrets (Speech key, SQL creds) | Per policy (e.g. 90 days) |
| DR failover drill (staging) | Quarterly |
| Recording retention / lifecycle review | Quarterly |
| Minor/major dependency upgrades | Quarterly, in a branch |

## Dependency updates

```bash
npm outdated
npm update            # respect semver ranges
npm run lint && npm run typecheck && npm test && npm run build
npm run e2e --workspace @smj/client
```

Major upgrades (Fluent UI, Teams SDK, Speech SDK, Express) go in a dedicated
branch with full gate + E2E verification before merge.

## Secret rotation

1. Create the new secret in Azure (Speech key regenerate / new SQL password).
2. Update Key Vault / app settings.
3. Restart the server (STS token cache refreshes automatically).
4. Confirm `/health/ready` and a live transcription smoke test.

## Database maintenance

- Monitor index health on `IX_Segments_session`, `IX_Bookmarks_session`,
  `IX_Audit_tenant_at`.
- Archive/purge old sessions and audit rows per retention policy (deleting a
  session cascades to its segments and bookmarks).
- Schema changes must remain **additive** (add-if-missing) to preserve
  forward/backward compatibility.

## Releases

1. Update `CHANGELOG.md` and bump versions (`package.json` + `APP_VERSION` +
   manifest `version`).
2. Run all gates + E2E.
3. Tag the release; CI builds and publishes images and the Teams package
   artifact.
4. Follow [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Monitoring hygiene

- Keep dashboards for 5xx rate, readiness, Speech circuit state, SQL retries.
- Alert thresholds should be reviewed after each release.

## Backups

- Verify Azure SQL PITR/LTR retention and Blob soft-delete/versioning remain
  enabled (see [`BACKUP_RESTORE.md`](BACKUP_RESTORE.md)).

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
