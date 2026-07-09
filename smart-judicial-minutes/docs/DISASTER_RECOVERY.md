# Disaster Recovery Guide

Objectives (recommended, adjust to Ministry policy):

- **RPO** (max data loss): ≤ 5 minutes for transcripts (server persists every
  ~4s; client mirrors unsaved segments locally).
- **RTO** (max downtime): ≤ 30 minutes for the stateless app tier.

## Failure scenarios & responses

| Scenario | Impact | Automatic behavior | Operator action |
|---|---|---|---|
| App container crash | Brief API/UI outage | Orchestrator restarts container; stateless | Verify `/health/ready`; scale out |
| Azure SQL transient fault | Save retries | Connection retry + backoff | Monitor; check SQL health/firewall |
| Azure SQL outage | No persistence | Client re-queues + local backup | Fail over to geo-replica; restore (see Backup guide) |
| Azure Blob outage | Recording save/download fails | Exponential retry | Retry later; recording is non-blocking |
| Azure Speech outage | Transcription stops | Circuit breaker + client auto-reconnect | Check Azure status; text resumes on recovery |
| Network interruption (client) | Live capture pauses | Offline banner; local backup; reconnect | None; resumes automatically |
| Region outage | Full outage | — | Redeploy app to paired region; point to geo-replicated SQL + RA-GRS Blob |

## Recovery building blocks

- **Stateless app tier:** server and client hold no durable state — redeploy the
  container images to recover.
- **Data tier:** Azure SQL (transcripts/sessions/bookmarks/audit) and Blob
  (recordings). Enable **geo-replication** (SQL active geo-replication /
  auto-failover group) and **RA-GRS** storage for cross-region durability.
- **Client-side safety net:** unsaved segments are mirrored to `localStorage`
  and re-sent on reconnect; a browser refresh or Teams reconnect does not lose
  already-persisted text.

## Region failover (outline)

1. Promote the SQL geo-replica / trigger the auto-failover group.
2. Repoint `SQL_SERVER` (and Blob account if paired) to the secondary.
3. Redeploy `smj-server` / `smj-client` images in the paired region.
4. Update DNS / Front Door to the secondary endpoint.
5. Verify `/health/ready` and run the post-deploy checklist.

## Testing DR

- Run a **quarterly** failover drill against a staging environment.
- Validate: readiness after restart, transcript persistence during a simulated
  SQL blip, and recording upload retry after a Blob blip.

See also: [`BACKUP_RESTORE.md`](BACKUP_RESTORE.md).

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
