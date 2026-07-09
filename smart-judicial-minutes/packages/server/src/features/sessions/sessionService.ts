import { randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';
import { NotFoundError } from '../../lib/errors.js';
import { sessionRepository } from './sessionRepository.js';
import type { AuthenticatedUser, CreateSessionInput, TranscriptionSession } from '@smj/shared';

/** Trims an optional string field, mapping empty/absent values to null. */
function normalizeOptional(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Session lifecycle: a session is opened when the clerk presses "Start Live
 * Transcript" and closed when they press "Stop". All access is tenant-scoped.
 */
export const sessionService = {
  async start(user: AuthenticatedUser, input: CreateSessionInput): Promise<TranscriptionSession> {
    const session: TranscriptionSession = {
      id: randomUUID(),
      meetingId: input.meetingId,
      meetingTitle: input.meetingTitle,
      caseNumber: normalizeOptional(input.caseNumber),
      circuitName: normalizeOptional(input.circuitName),
      judgeName: normalizeOptional(input.judgeName),
      tenantId: user.tenantId,
      createdBy: user.id,
      status: 'active',
      locale: env.SPEECH_LOCALE,
      startedAt: new Date().toISOString(),
      stoppedAt: null,
      recordingBlobName: null,
    };
    return sessionRepository.create(session);
  },

  async stop(user: AuthenticatedUser, sessionId: string): Promise<TranscriptionSession> {
    const session = await this.getOrThrow(user, sessionId);
    if (session.status === 'active') {
      const stoppedAt = new Date().toISOString();
      await sessionRepository.stop(sessionId, user.tenantId, stoppedAt);
      return { ...session, status: 'stopped', stoppedAt };
    }
    return session;
  },

  async getOrThrow(user: AuthenticatedUser, sessionId: string): Promise<TranscriptionSession> {
    const session = await sessionRepository.findById(sessionId, user.tenantId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }
    return session;
  },

  listByMeeting(user: AuthenticatedUser, meetingId: string): Promise<TranscriptionSession[]> {
    return sessionRepository.listByMeeting(meetingId, user.tenantId);
  },
};
