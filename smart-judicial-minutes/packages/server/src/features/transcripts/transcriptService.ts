import { sessionService } from '../sessions/sessionService.js';
import { segmentRepository } from './segmentRepository.js';
import { exportService, type ExportResult } from './exportService.js';
import type {
  AuthenticatedUser,
  CreateSegmentInput,
  ExportFormat,
  TranscriptSegment,
} from '@smj/shared';

/**
 * Application service for transcript content. It always resolves the parent
 * session first (which enforces tenant ownership) before touching segments.
 */
export const transcriptService = {
  async appendSegments(
    user: AuthenticatedUser,
    sessionId: string,
    inputs: CreateSegmentInput[],
  ): Promise<number> {
    await sessionService.getOrThrow(user, sessionId);
    const segments: TranscriptSegment[] = inputs.map((i) => ({ ...i, sessionId }));
    await segmentRepository.upsertBatch(segments);
    return segments.length;
  },

  async getSegments(user: AuthenticatedUser, sessionId: string): Promise<TranscriptSegment[]> {
    await sessionService.getOrThrow(user, sessionId);
    return segmentRepository.listBySession(sessionId);
  },

  async search(
    user: AuthenticatedUser,
    sessionId: string,
    term: string,
  ): Promise<TranscriptSegment[]> {
    await sessionService.getOrThrow(user, sessionId);
    return segmentRepository.search(sessionId, term);
  },

  async export(
    user: AuthenticatedUser,
    sessionId: string,
    format: ExportFormat,
  ): Promise<ExportResult> {
    const session = await sessionService.getOrThrow(user, sessionId);
    const segments = await segmentRepository.listBySession(sessionId);
    return exportService.export(session, segments, format);
  },
};
