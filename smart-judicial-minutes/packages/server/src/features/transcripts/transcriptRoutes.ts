import { Router } from 'express';
import { z } from 'zod';
import { createSegmentsBatchSchema, exportFormatSchema } from '@smj/shared';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { requireRole } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { transcriptService } from './transcriptService.js';
import { auditService } from '../audit/auditService.js';

const paramsSchema = z.object({ sessionId: z.string().uuid() });
const searchQuerySchema = z.object({ q: z.string().min(1).max(400) });
const exportQuerySchema = z.object({ format: exportFormatSchema });

/** Transcript routes, mounted under /api/sessions/:sessionId. */
export const transcriptRouter = Router({ mergeParams: true });

transcriptRouter.use(requireAuth());

// Persist recognized segments (streamed in small batches from the browser).
transcriptRouter.post(
  '/segments',
  requireRole('clerk', 'admin'),
  validate(paramsSchema, 'params'),
  validate(createSegmentsBatchSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params as unknown as z.infer<typeof paramsSchema>;
    const body = req.body as z.infer<typeof createSegmentsBatchSchema>;
    const count = await transcriptService.appendSegments(req.user!, sessionId, body.segments);
    res.status(201).json({ saved: count });
  }),
);

// Full transcript for a session.
transcriptRouter.get(
  '/segments',
  validate(paramsSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params as unknown as z.infer<typeof paramsSchema>;
    const segments = await transcriptService.getSegments(req.user!, sessionId);
    res.json({ segments });
  }),
);

// Server-side search within a session's transcript.
transcriptRouter.get(
  '/search',
  validate(paramsSchema, 'params'),
  validate(searchQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params as unknown as z.infer<typeof paramsSchema>;
    const { q } = req.query as unknown as z.infer<typeof searchQuerySchema>;
    const segments = await transcriptService.search(req.user!, sessionId, q);
    res.json({ segments });
  }),
);

// Export the transcript as pdf/docx/txt.
transcriptRouter.get(
  '/export',
  validate(paramsSchema, 'params'),
  validate(exportQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params as unknown as z.infer<typeof paramsSchema>;
    const { format } = req.query as unknown as z.infer<typeof exportQuerySchema>;
    const result = await transcriptService.export(req.user!, sessionId, format);
    await auditService.record(req, 'transcript.export', 'success', sessionId, { format });
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.buffer);
  }),
);
