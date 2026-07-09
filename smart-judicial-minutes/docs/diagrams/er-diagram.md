# Database ER Diagram

```mermaid
erDiagram
  SESSIONS ||--o{ TRANSCRIPT_SEGMENTS : contains
  SESSIONS ||--o{ BOOKMARKS : contains

  SESSIONS {
    uniqueidentifier id PK
    nvarchar meetingId
    nvarchar meetingTitle
    nvarchar caseNumber "nullable"
    nvarchar circuitName "nullable"
    nvarchar judgeName "nullable"
    nvarchar tenantId
    nvarchar createdBy
    nvarchar status "active|stopped"
    nvarchar locale
    datetimeoffset startedAt
    datetimeoffset stoppedAt "nullable"
    nvarchar recordingBlobName "nullable"
  }

  TRANSCRIPT_SEGMENTS {
    uniqueidentifier id PK
    uniqueidentifier sessionId FK
    nvarchar speakerId
    nvarchar speakerLabel
    nvarchar speakerRole "default unassigned"
    nvarchar_max text
    datetimeoffset timestamp
    bigint offsetMs
    bigint durationMs
    bit isFinal
  }

  BOOKMARKS {
    uniqueidentifier id PK
    uniqueidentifier sessionId FK
    nvarchar label
    bigint offsetMs
    datetimeoffset timestamp
  }

  AUDIT_LOG {
    bigint id PK
    datetimeoffset at
    nvarchar actorId
    nvarchar actorName
    nvarchar tenantId
    nvarchar action
    nvarchar resource "nullable"
    nvarchar outcome "success|failure"
    nvarchar ipAddress "nullable"
    nvarchar_max metadata "nullable, JSON"
  }
```

## Constraints & indexes

- `TranscriptSegments.sessionId` → `Sessions.id` **ON DELETE CASCADE**;
  `Bookmarks.sessionId` → `Sessions.id` **ON DELETE CASCADE**.
- Indexes: `Sessions(meetingId)`, `Sessions(tenantId)`,
  `TranscriptSegments(sessionId, offsetMs)`, `Bookmarks(sessionId, offsetMs)`,
  `AuditLog(tenantId, at DESC)`.
- `AuditLog` is standalone (no FK) so audit survives session deletion.
- Schema is created idempotently on startup with **additive** migrations.

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
