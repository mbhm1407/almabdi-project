import { Router } from 'express';
import { z } from 'zod';
import { createSessionSchema } from '@smj/shared';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { requireRole } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { sessionService } from './sessionService.js';
import { auditService } from '../audit/auditService.js';
import { transcriptRouter } from '../transcripts/transcriptRoutes.js';
import { recordingRouter } from '../recordings/recordingRoutes.js';
import { bookmarkRouter } from '../bookmarks/bookmarkRoutes.js';

const idParamSchema = z.object({ sessionId: z.string().uuid() });
const listQuerySchema = z.object({ meetingId: z.string().min(1).max(256) });

export const sessionRouter = Router();

sessionRouter.use(requireAuth());

// Start Live Transcript — the clerk's one-button action.
sessionRouter.post(
  '/',
  requireRole('clerk', 'admin'),
  validate(createSessionSchema, 'body'),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof createSessionSchema>;
    const session = await sessionService.start(req.user!, body);
    await auditService.record(req, 'session.start', 'success', session.id, {
      meetingId: session.meetingId,
    });
    res.status(201).json({ session });
  }),
);

// List prior sessions for the current meeting (so the clerk can reopen one).
sessionRouter.get(
  '/',
  validate(listQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const { meetingId } = req.query as unknown as z.infer<typeof listQuerySchema>;
    const sessions = await sessionService.listByMeeting(req.user!, meetingId);
    res.json({ sessions });
  }),
);

sessionRouter.get(
  '/:sessionId',
  validate(idParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params as unknown as z.infer<typeof idParamSchema>;
    const session = await sessionService.getOrThrow(req.user!, sessionId);
    res.json({ session });
  }),
);

// Stop transcription.
sessionRouter.post(
  '/:sessionId/stop',
  requireRole('clerk', 'admin'),
  validate(idParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params as unknown as z.infer<typeof idParamSchema>;
    const session = await sessionService.stop(req.user!, sessionId);
    await auditService.record(req, 'session.stop', 'success', sessionId);
    res.json({ session });
  }),
);

// Nested transcript + recording + bookmark routes.
sessionRouter.use('/:sessionId', transcriptRouter);
sessionRouter.use('/:sessionId/recording', recordingRouter);
sessionRouter.use('/:sessionId/bookmarks', bookmarkRouter);
