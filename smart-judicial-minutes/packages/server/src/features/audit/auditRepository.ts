import { getPool, sql } from '../../infrastructure/db/pool.js';

export interface AuditEntry {
  actorId: string;
  actorName: string;
  tenantId: string;
  action: string;
  resource?: string | null;
  outcome: 'success' | 'failure';
  ipAddress?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface AuditRecord extends AuditEntry {
  id: number;
  at: string;
}

/** Persistence for the tamper-evident audit trail. */
export const auditRepository = {
  async insert(entry: AuditEntry): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('actorId', sql.NVarChar(128), entry.actorId)
      .input('actorName', sql.NVarChar(256), entry.actorName)
      .input('tenantId', sql.NVarChar(128), entry.tenantId)
      .input('action', sql.NVarChar(64), entry.action)
      .input('resource', sql.NVarChar(256), entry.resource ?? null)
      .input('outcome', sql.NVarChar(16), entry.outcome)
      .input('ipAddress', sql.NVarChar(64), entry.ipAddress ?? null)
      .input(
        'metadata',
        sql.NVarChar(sql.MAX),
        entry.metadata ? JSON.stringify(entry.metadata) : null,
      )
      .query(
        `INSERT INTO dbo.AuditLog (actorId, actorName, tenantId, action, resource, outcome, ipAddress, metadata)
         VALUES (@actorId, @actorName, @tenantId, @action, @resource, @outcome, @ipAddress, @metadata)`,
      );
  },

  async list(tenantId: string, limit: number): Promise<AuditRecord[]> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('tenantId', sql.NVarChar(128), tenantId)
      .input('limit', sql.Int, limit)
      .query(
        `SELECT TOP (@limit) id, at, actorId, actorName, tenantId, action, resource, outcome, ipAddress, metadata
         FROM dbo.AuditLog WHERE tenantId = @tenantId ORDER BY at DESC`,
      );
    return result.recordset.map((r: Record<string, unknown>) => ({
      id: r.id as number,
      at: new Date(r.at as string).toISOString(),
      actorId: r.actorId as string,
      actorName: r.actorName as string,
      tenantId: r.tenantId as string,
      action: r.action as string,
      resource: (r.resource as string | null) ?? null,
      outcome: r.outcome as 'success' | 'failure',
      ipAddress: (r.ipAddress as string | null) ?? null,
      metadata: r.metadata ? (JSON.parse(r.metadata as string) as Record<string, unknown>) : null,
    }));
  },
};
