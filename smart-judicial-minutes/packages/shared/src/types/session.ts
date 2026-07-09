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
  /** Court case number this hearing belongs to (e.g. "٤٣٥/٢/ق"). Optional. */
  caseNumber: z.string().max(128).nullable(),
  /** Name of the judicial circuit hearing the case (اسم الدائرة). Optional. */
  circuitName: z.string().max(256).nullable(),
  /** Name of the presiding judge (القاضي). Optional. */
  judgeName: z.string().max(256).nullable(),
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
  caseNumber: z.string().max(128).nullish(),
  circuitName: z.string().max(256).nullish(),
  judgeName: z.string().max(256).nullish(),
});
export type CreateSessionInput = z.infer<typeof createSessionSchema>;

/**
 * Elapsed hearing duration in milliseconds. Uses the recorded stop time when the
 * session has ended, otherwise measures against `now`.
 */
export function sessionDurationMs(session: TranscriptionSession, now: number = Date.now()): number {
  const start = new Date(session.startedAt).getTime();
  const end = session.stoppedAt ? new Date(session.stoppedAt).getTime() : now;
  return Math.max(0, end - start);
}

/** Formats a millisecond duration as HH:MM:SS. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
