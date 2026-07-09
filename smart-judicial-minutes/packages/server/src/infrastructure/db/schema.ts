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
    caseNumber       NVARCHAR(128)    NULL,
    circuitName      NVARCHAR(256)    NULL,
    judgeName        NVARCHAR(256)    NULL,
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

-- Additive migrations for databases created before these columns existed.
IF COL_LENGTH('dbo.Sessions', 'caseNumber') IS NULL
  ALTER TABLE dbo.Sessions ADD caseNumber NVARCHAR(128) NULL;
IF COL_LENGTH('dbo.Sessions', 'circuitName') IS NULL
  ALTER TABLE dbo.Sessions ADD circuitName NVARCHAR(256) NULL;
IF COL_LENGTH('dbo.Sessions', 'judgeName') IS NULL
  ALTER TABLE dbo.Sessions ADD judgeName NVARCHAR(256) NULL;

IF OBJECT_ID('dbo.TranscriptSegments', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.TranscriptSegments (
    id           UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    sessionId    UNIQUEIDENTIFIER NOT NULL,
    speakerId    NVARCHAR(128)    NOT NULL,
    speakerLabel NVARCHAR(128)    NOT NULL,
    speakerRole  NVARCHAR(32)     NOT NULL DEFAULT 'unassigned',
    text         NVARCHAR(MAX)    NOT NULL,
    timestamp    DATETIMEOFFSET   NOT NULL,
    offsetMs     BIGINT           NOT NULL,
    durationMs   BIGINT           NOT NULL,
    isFinal      BIT              NOT NULL,
    CONSTRAINT FK_Segments_Session FOREIGN KEY (sessionId)
      REFERENCES dbo.Sessions (id) ON DELETE CASCADE
  );
  CREATE INDEX IX_Segments_session ON dbo.TranscriptSegments (sessionId, offsetMs);
END;

-- Additive migration for databases created before speakerRole existed.
IF COL_LENGTH('dbo.TranscriptSegments', 'speakerRole') IS NULL
  ALTER TABLE dbo.TranscriptSegments ADD speakerRole NVARCHAR(32) NOT NULL
    CONSTRAINT DF_Segments_speakerRole DEFAULT 'unassigned';

IF OBJECT_ID('dbo.Bookmarks', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Bookmarks (
    id        UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    sessionId UNIQUEIDENTIFIER NOT NULL,
    label     NVARCHAR(256)    NOT NULL,
    offsetMs  BIGINT           NOT NULL,
    timestamp DATETIMEOFFSET   NOT NULL,
    CONSTRAINT FK_Bookmarks_Session FOREIGN KEY (sessionId)
      REFERENCES dbo.Sessions (id) ON DELETE CASCADE
  );
  CREATE INDEX IX_Bookmarks_session ON dbo.Bookmarks (sessionId, offsetMs);
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
  await pool.request().batch(DDL);
  logger.info('Database schema is ready');
}
