import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { requireRole } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { auditService } from './auditService.js';

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

/** Audit log is admin-only. */
export const auditRouter = Router();

auditRouter.get(
  '/',
  requireAuth(),
  requireRole('admin'),
  validate(listQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const { limit } = req.query as unknown as z.infer<typeof listQuerySchema>;
    const entries = await auditService.list(req.user!, limit);
    res.json({ entries });
  }),
);
