import { Router } from 'express';
import { z } from 'zod';
import { createBookmarkSchema } from '@smj/shared';
import { requireRole } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { bookmarkService } from './bookmarkService.js';
import { auditService } from '../audit/auditService.js';

const sessionParamSchema = z.object({ sessionId: z.string().uuid() });
const bookmarkParamSchema = z.object({
  sessionId: z.string().uuid(),
  bookmarkId: z.string().uuid(),
});

/** Bookmark routes, mounted under /api/sessions/:sessionId/bookmarks. */
export const bookmarkRouter = Router({ mergeParams: true });

// Auth is applied by the parent session router.

bookmarkRouter.post(
  '/',
  requireRole('clerk', 'admin'),
  validate(sessionParamSchema, 'params'),
  validate(createBookmarkSchema, 'body'),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params as unknown as z.infer<typeof sessionParamSchema>;
    const body = req.body as z.infer<typeof createBookmarkSchema>;
    const bookmark = await bookmarkService.add(req.user!, sessionId, body);
    await auditService.record(req, 'bookmark.add', 'success', sessionId);
    res.status(201).json({ bookmark });
  }),
);

bookmarkRouter.get(
  '/',
  validate(sessionParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params as unknown as z.infer<typeof sessionParamSchema>;
    const bookmarks = await bookmarkService.list(req.user!, sessionId);
    res.json({ bookmarks });
  }),
);

bookmarkRouter.delete(
  '/:bookmarkId',
  requireRole('clerk', 'admin'),
  validate(bookmarkParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const { sessionId, bookmarkId } = req.params as unknown as z.infer<typeof bookmarkParamSchema>;
    await bookmarkService.remove(req.user!, sessionId, bookmarkId);
    await auditService.record(req, 'bookmark.remove', 'success', sessionId);
    res.status(204).send();
  }),
);
