import { getPool } from './pool.js';
import { logger } from '../../lib/logger.js';

/**
 * Idempotent schema bootstrap. Creates the tables the app needs if they do not
 * already exist. Safe to run on every startup.
 */
const DDL = `
IF OBJECT_ID('dbo.Sessions', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Sessions (
    id               UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    meetingId        NVARCHAR(256)    NOT NULL,
    meetingTitle     NVARCHAR(512)    NOT NULL,
    tenantId         NVARCHAR(128)    NOT NULL,
    createdBy        NVARCHAR(128)    NOT NULL,
    status           NVARCHAR(16)     NOT NULL,
    locale           NVARCHAR(16)     NOT NULL DEFAULT 'ar-SA',
    startedAt        DATETIMEOFFSET   NOT NULL,
    stoppedAt        DATETIMEOFFSET   NULL,
    recordingBlobName NVARCHAR(1024)  NULL
  );
  CREATE INDEX IX_Sessions_meetingId ON dbo.Sessions (meetingId);
  CREATE INDEX IX_Sessions_tenant ON dbo.Sessions (tenantId);
END;

IF OBJECT_ID('dbo.TranscriptSegments', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.TranscriptSegments (
    id           UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    sessionId    UNIQUEIDENTIFIER NOT NULL,
    speakerId    NVARCHAR(128)    NOT NULL,
    speakerLabel NVARCHAR(128)    NOT NULL,
    text         NVARCHAR(MAX)    NOT NULL,
    timestamp    DATETIMEOFFSET   NOT NULL,
    offsetMs     BIGINT           NOT NULL,
    durationMs   BIGINT           NOT NULL,
    isFinal      BIT              NOT NULL,
    CONSTRAINT FK_Segments_Session FOREIGN KEY (sessionId)
      REFERENCES dbo.Sessions (id) ON DELETE CASCADE
  );
  CREATE INDEX IX_Segments_session ON dbo.TranscriptSegments (sessionId, offsetMs);
  CREATE FULLTEXT CATALOG smj_ft AS DEFAULT;
END;

IF OBJECT_ID('dbo.AuditLog', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.AuditLog (
    id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    at         DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    actorId    NVARCHAR(128)    NOT NULL,
    actorName  NVARCHAR(256)    NOT NULL,
    tenantId   NVARCHAR(128)    NOT NULL,
    action     NVARCHAR(64)     NOT NULL,
    resource   NVARCHAR(256)    NULL,
    outcome    NVARCHAR(16)     NOT NULL,
    ipAddress  NVARCHAR(64)     NULL,
    metadata   NVARCHAR(MAX)    NULL
  );
  CREATE INDEX IX_Audit_tenant_at ON dbo.AuditLog (tenantId, at DESC);
END;
`;

export async function ensureSchema(): Promise<void> {
  const pool = await getPool();
  // Full-text catalog creation can fail if the feature is unavailable; run the
  // core DDL first, and downgrade the full-text index to a plain LIKE search.
  const coreDdl = DDL.replace(/\s*CREATE FULLTEXT CATALOG smj_ft AS DEFAULT;\s*/g, '\n');
  await pool.request().batch(coreDdl);
  logger.info('Database schema is ready');
}
