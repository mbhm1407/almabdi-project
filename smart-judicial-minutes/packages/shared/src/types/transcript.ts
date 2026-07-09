import { z } from 'zod';
import { judicialRoleSchema } from './roles.js';

/**
 * A single utterance captured during a hearing. Every line the clerk sees is one
 * of these: who spoke, when, and what was said (in Arabic).
 */
export const transcriptSegmentSchema = z.object({
  /** Stable identifier, generated client-side (UUID v4) so the UI can dedupe streamed results. */
  id: z.string().uuid(),
  /** Meeting/session this segment belongs to. */
  sessionId: z.string().uuid(),
  /**
   * Diarized speaker id coming from Azure Conversation Transcription
   * (e.g. "Guest-1"), or a clerk-assigned display label (e.g. "القاضي").
   */
  speakerId: z.string().min(1).max(128),
  /** Human-readable label shown in the UI. Defaults to speakerId until mapped. */
  speakerLabel: z.string().min(1).max(128),
  /** Judicial role assigned to the speaker (defaults to `unassigned`). */
  speakerRole: judicialRoleSchema.default('unassigned'),
  /** Recognized Arabic text. */
  text: z.string().max(8000),
  /** ISO-8601 timestamp of when the utterance started. */
  timestamp: z.string().datetime(),
  /** Offset from the start of the session, in milliseconds. */
  offsetMs: z.number().int().nonnegative(),
  /** Duration of the utterance, in milliseconds. */
  durationMs: z.number().int().nonnegative(),
  /** true once the recognizer produced a final (non-interim) result. */
  isFinal: z.boolean(),
});

export type TranscriptSegment = z.infer<typeof transcriptSegmentSchema>;

/** Payload accepted by the API when persisting recognized segments. */
export const createSegmentSchema = transcriptSegmentSchema.omit({ sessionId: true });
export type CreateSegmentInput = z.infer<typeof createSegmentSchema>;

export const createSegmentsBatchSchema = z.object({
  segments: z.array(createSegmentSchema).min(1).max(500),
});
export type CreateSegmentsBatchInput = z.infer<typeof createSegmentsBatchSchema>;
