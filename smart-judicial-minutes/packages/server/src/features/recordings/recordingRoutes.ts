import express, { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { BadRequestError } from '../../lib/errors.js';
import { recordingService } from './recordingService.js';
import { auditService } from '../audit/auditService.js';

const paramsSchema = z.object({ sessionId: z.string().uuid() });

const ALLOWED_TYPES = ['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mpeg', 'audio/mp4'];
const MAX_BYTES = 500 * 1024 * 1024; // 500 MB cap for a hearing recording

/** Recording routes, mounted under /api/sessions/:sessionId/recording. */
export const recordingRouter = Router({ mergeParams: true });

// Auth is already applied by the parent session router.

// Upload/save the meeting audio recording. Body is the raw audio bytes.
recordingRouter.post(
  '/',
  requireRole('clerk', 'admin'),
  validate(paramsSchema, 'params'),
  express.raw({ type: ALLOWED_TYPES, limit: MAX_BYTES }),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params as unknown as z.infer<typeof paramsSchema>;
    const contentType = req.headers['content-type']?.split(';')[0]?.trim() ?? '';
    if (!ALLOWED_TYPES.includes(contentType)) {
      throw new BadRequestError(`Unsupported audio content-type: ${contentType || 'none'}`);
    }
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      throw new BadRequestError('Request body must contain audio data');
    }
    const result = await recordingService.save(req.user!, sessionId, req.body, contentType);
    await auditService.record(req, 'recording.save', 'success', sessionId, {
      bytes: req.body.length,
    });
    res.status(201).json(result);
  }),
);

// Get a time-limited download URL for the saved recording.
recordingRouter.get(
  '/',
  validate(paramsSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params as unknown as z.infer<typeof paramsSchema>;
    const url = await recordingService.getDownloadUrl(req.user!, sessionId);
    res.json({ url });
  }),
);
