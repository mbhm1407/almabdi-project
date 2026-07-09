import { z } from 'zod';

/** Lifecycle state of a transcription session. */
export const sessionStatusSchema = z.enum(['active', 'stopped']);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

/**
 * A transcription session maps 1:1 to a Teams meeting the clerk is capturing.
 * It groups all transcript segments and (optionally) the audio recording.
 */
export const transcriptionSessionSchema = z.object({
  id: z.string().uuid(),
  /** Teams meeting id (Graph online meeting id / chat id) this session is bound to. */
  meetingId: z.string().min(1).max(256),
  /** Display title of the meeting/hearing, shown in the header. */
  meetingTitle: z.string().min(1).max(512),
  /** Teams tenant id the meeting belongs to. */
  tenantId: z.string().min(1).max(128),
  /** Entra object id of the clerk who created the session. */
  createdBy: z.string().min(1).max(128),
  status: sessionStatusSchema,
  /** BCP-47 recognition locale. Fixed to ar-SA for this app. */
  locale: z.string().default('ar-SA'),
  startedAt: z.string().datetime(),
  stoppedAt: z.string().datetime().nullable(),
  /** Blob name of the saved audio recording, if any. */
  recordingBlobName: z.string().max(1024).nullable(),
});

export type TranscriptionSession = z.infer<typeof transcriptionSessionSchema>;

export const createSessionSchema = z.object({
  meetingId: z.string().min(1).max(256),
  meetingTitle: z.string().min(1).max(512),
});
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
