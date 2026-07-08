import type { Request } from 'express';
import { auditRepository, type AuditEntry } from './auditRepository.js';
import { logger } from '../../lib/logger.js';
import type { AuthenticatedUser } from '@smj/shared';

/**
 * Records security-relevant actions. Auditing must never break the primary
 * request path, so failures are logged but not propagated.
 */
export const auditService = {
  async record(
    req: Request,
    action: string,
    outcome: 'success' | 'failure',
    resource?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const user = req.user;
    if (!user) return;
    const entry: AuditEntry = {
      actorId: user.id,
      actorName: user.name,
      tenantId: user.tenantId,
      action,
      resource: resource ?? null,
      outcome,
      ipAddress: req.ip ?? null,
      metadata: metadata ?? null,
    };
    try {
      await auditRepository.insert(entry);
    } catch (err) {
      logger.error({ err, action }, 'Failed to write audit entry');
    }
  },

  list(user: AuthenticatedUser, limit: number) {
    return auditRepository.list(user.tenantId, limit);
  },
};
