import { Router } from 'express';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { requireRole } from '../../middleware/rbac.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { speechService } from './speechService.js';
import { auditService } from '../audit/auditService.js';

export const speechRouter = Router();

/**
 * Issues a short-lived Azure Speech token to the clerk's browser so it can start
 * real-time Arabic conversation transcription.
 */
speechRouter.get(
  '/token',
  requireAuth(),
  requireRole('clerk', 'admin'),
  asyncHandler(async (req, res) => {
    const token = await speechService.issueToken();
    await auditService.record(req, 'speech.token.issue', 'success');
    res.json(token);
  }),
);
