import { getPool, sql } from '../../infrastructure/db/pool.js';
import type { JudicialRole, TranscriptSegment } from '@smj/shared';

function mapRow(r: Record<string, unknown>): TranscriptSegment {
  return {
    id: r.id as string,
    sessionId: r.sessionId as string,
    speakerId: r.speakerId as string,
    speakerLabel: r.speakerLabel as string,
    speakerRole: ((r.speakerRole as string | null) ?? 'unassigned') as JudicialRole,
    text: r.text as string,
    timestamp: new Date(r.timestamp as string).toISOString(),
    offsetMs: Number(r.offsetMs),
    durationMs: Number(r.durationMs),
    isFinal: Boolean(r.isFinal),
  };
}

export const segmentRepository = {
  /**
   * Upserts a batch of final segments. Interim results share an id with their
   * final result, so we MERGE to keep exactly one row per utterance.
   */
  async upsertBatch(segments: TranscriptSegment[]): Promise<void> {
    if (segments.length === 0) return;
    const pool = await getPool();
    // Upsert each utterance inside a single transaction. A MERGE keyed on the
    // client-generated id makes re-sends of the same utterance idempotent.
    const tx = pool.transaction();
    await tx.begin();
    try {
      for (const s of segments) {
        await tx
          .request()
          .input('id', sql.UniqueIdentifier, s.id)
          .input('sessionId', sql.UniqueIdentifier, s.sessionId)
          .input('speakerId', sql.NVarChar(128), s.speakerId)
          .input('speakerLabel', sql.NVarChar(128), s.speakerLabel)
          .input('speakerRole', sql.NVarChar(32), s.speakerRole)
          .input('text', sql.NVarChar(sql.MAX), s.text)
          .input('timestamp', sql.DateTimeOffset, s.timestamp)
          .input('offsetMs', sql.BigInt, s.offsetMs)
          .input('durationMs', sql.BigInt, s.durationMs)
          .input('isFinal', sql.Bit, s.isFinal).query(`
            MERGE dbo.TranscriptSegments AS target
            USING (SELECT @id AS id) AS src
              ON target.id = src.id AND target.sessionId = @sessionId
            WHEN MATCHED THEN UPDATE SET
              speakerId = @speakerId, speakerLabel = @speakerLabel, speakerRole = @speakerRole, text = @text,
              timestamp = @timestamp, offsetMs = @offsetMs, durationMs = @durationMs, isFinal = @isFinal
            WHEN NOT MATCHED THEN INSERT
              (id, sessionId, speakerId, speakerLabel, speakerRole, text, timestamp, offsetMs, durationMs, isFinal)
              VALUES (@id, @sessionId, @speakerId, @speakerLabel, @speakerRole, @text, @timestamp, @offsetMs, @durationMs, @isFinal);
          `);
      }
      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  },

  async listBySession(sessionId: string): Promise<TranscriptSegment[]> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('sessionId', sql.UniqueIdentifier, sessionId)
      .query(
        'SELECT * FROM dbo.TranscriptSegments WHERE sessionId = @sessionId ORDER BY offsetMs ASC',
      );
    return result.recordset.map(mapRow);
  },

  async search(sessionId: string, term: string): Promise<TranscriptSegment[]> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('sessionId', sql.UniqueIdentifier, sessionId)
      .input('term', sql.NVarChar(400), `%${term}%`)
      .query(
        `SELECT * FROM dbo.TranscriptSegments
         WHERE sessionId = @sessionId AND text LIKE @term
         ORDER BY offsetMs ASC`,
      );
    return result.recordset.map(mapRow);
  },
};
