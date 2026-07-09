import { getPool, sql } from '../../infrastructure/db/pool.js';
import type { Bookmark } from '@smj/shared';

function mapRow(r: Record<string, unknown>): Bookmark {
  return {
    id: r.id as string,
    sessionId: r.sessionId as string,
    label: r.label as string,
    offsetMs: Number(r.offsetMs),
    timestamp: new Date(r.timestamp as string).toISOString(),
  };
}

export const bookmarkRepository = {
  async upsert(bookmark: Bookmark): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.UniqueIdentifier, bookmark.id)
      .input('sessionId', sql.UniqueIdentifier, bookmark.sessionId)
      .input('label', sql.NVarChar(256), bookmark.label)
      .input('offsetMs', sql.BigInt, bookmark.offsetMs)
      .input('timestamp', sql.DateTimeOffset, bookmark.timestamp).query(`
        MERGE dbo.Bookmarks AS target
        USING (SELECT @id AS id) AS src
          ON target.id = src.id AND target.sessionId = @sessionId
        WHEN MATCHED THEN UPDATE SET label = @label, offsetMs = @offsetMs, timestamp = @timestamp
        WHEN NOT MATCHED THEN INSERT (id, sessionId, label, offsetMs, timestamp)
          VALUES (@id, @sessionId, @label, @offsetMs, @timestamp);
      `);
  },

  async listBySession(sessionId: string): Promise<Bookmark[]> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('sessionId', sql.UniqueIdentifier, sessionId)
      .query('SELECT * FROM dbo.Bookmarks WHERE sessionId = @sessionId ORDER BY offsetMs ASC');
    return result.recordset.map(mapRow);
  },

  async remove(id: string, sessionId: string): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .input('sessionId', sql.UniqueIdentifier, sessionId)
      .query('DELETE FROM dbo.Bookmarks WHERE id = @id AND sessionId = @sessionId');
  },
};
