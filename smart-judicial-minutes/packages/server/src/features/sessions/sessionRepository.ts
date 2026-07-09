import { getPool, sql } from '../../infrastructure/db/pool.js';
import type { TranscriptionSession } from '@smj/shared';

function mapRow(r: Record<string, unknown>): TranscriptionSession {
  return {
    id: r.id as string,
    meetingId: r.meetingId as string,
    meetingTitle: r.meetingTitle as string,
    caseNumber: (r.caseNumber as string | null) ?? null,
    circuitName: (r.circuitName as string | null) ?? null,
    judgeName: (r.judgeName as string | null) ?? null,
    tenantId: r.tenantId as string,
    createdBy: r.createdBy as string,
    status: r.status as TranscriptionSession['status'],
    locale: r.locale as string,
    startedAt: new Date(r.startedAt as string).toISOString(),
    stoppedAt: r.stoppedAt ? new Date(r.stoppedAt as string).toISOString() : null,
    recordingBlobName: (r.recordingBlobName as string | null) ?? null,
  };
}

export const sessionRepository = {
  async create(session: TranscriptionSession): Promise<TranscriptionSession> {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.UniqueIdentifier, session.id)
      .input('meetingId', sql.NVarChar(256), session.meetingId)
      .input('meetingTitle', sql.NVarChar(512), session.meetingTitle)
      .input('caseNumber', sql.NVarChar(128), session.caseNumber)
      .input('circuitName', sql.NVarChar(256), session.circuitName)
      .input('judgeName', sql.NVarChar(256), session.judgeName)
      .input('tenantId', sql.NVarChar(128), session.tenantId)
      .input('createdBy', sql.NVarChar(128), session.createdBy)
      .input('status', sql.NVarChar(16), session.status)
      .input('locale', sql.NVarChar(16), session.locale)
      .input('startedAt', sql.DateTimeOffset, session.startedAt)
      .query(
        `INSERT INTO dbo.Sessions (id, meetingId, meetingTitle, caseNumber, circuitName, judgeName, tenantId, createdBy, status, locale, startedAt)
         VALUES (@id, @meetingId, @meetingTitle, @caseNumber, @circuitName, @judgeName, @tenantId, @createdBy, @status, @locale, @startedAt)`,
      );
    return session;
  },

  async findById(id: string, tenantId: string): Promise<TranscriptionSession | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .input('tenantId', sql.NVarChar(128), tenantId)
      .query('SELECT * FROM dbo.Sessions WHERE id = @id AND tenantId = @tenantId');
    const row = result.recordset[0];
    return row ? mapRow(row) : null;
  },

  async listByMeeting(meetingId: string, tenantId: string): Promise<TranscriptionSession[]> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('meetingId', sql.NVarChar(256), meetingId)
      .input('tenantId', sql.NVarChar(128), tenantId)
      .query(
        'SELECT * FROM dbo.Sessions WHERE meetingId = @meetingId AND tenantId = @tenantId ORDER BY startedAt DESC',
      );
    return result.recordset.map(mapRow);
  },

  async stop(id: string, tenantId: string, stoppedAt: string): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .input('tenantId', sql.NVarChar(128), tenantId)
      .input('stoppedAt', sql.DateTimeOffset, stoppedAt)
      .query(
        `UPDATE dbo.Sessions SET status = 'stopped', stoppedAt = @stoppedAt
         WHERE id = @id AND tenantId = @tenantId`,
      );
  },

  async setRecording(id: string, tenantId: string, blobName: string): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .input('tenantId', sql.NVarChar(128), tenantId)
      .input('blobName', sql.NVarChar(1024), blobName)
      .query(
        'UPDATE dbo.Sessions SET recordingBlobName = @blobName WHERE id = @id AND tenantId = @tenantId',
      );
  },
};
