import { z } from 'zod';

/**
 * A judicial bookmark: a labelled moment in the hearing the clerk marks for
 * quick navigation (e.g. "بداية الدعوى"). Clicking it jumps the transcript — and
 * the audio playback — to that offset.
 */
export const bookmarkSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  /** Human label describing the moment. */
  label: z.string().min(1).max(256),
  /** Offset from the start of the session, in milliseconds. */
  offsetMs: z.number().int().nonnegative(),
  /** ISO-8601 wall-clock time of the bookmark. */
  timestamp: z.string().datetime(),
});

export type Bookmark = z.infer<typeof bookmarkSchema>;

/** Payload accepted when creating a bookmark (server assigns id + sessionId). */
export const createBookmarkSchema = bookmarkSchema.omit({ id: true, sessionId: true }).extend({
  id: z.string().uuid(),
});
export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
