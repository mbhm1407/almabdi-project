import { sessionService } from '../sessions/sessionService.js';
import { sessionRepository } from '../sessions/sessionRepository.js';
import { blobService } from '../../infrastructure/blob/blobService.js';
import { NotFoundError } from '../../lib/errors.js';
import type { AuthenticatedUser } from '@smj/shared';

const EXTENSION_BY_TYPE: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
};

export const recordingService = {
  async save(
    user: AuthenticatedUser,
    sessionId: string,
    data: Buffer,
    contentType: string,
  ): Promise<{ blobName: string }> {
    const session = await sessionService.getOrThrow(user, sessionId);
    const ext = EXTENSION_BY_TYPE[contentType] ?? 'webm';
    const blobName = `${session.tenantId}/${sessionId}/recording.${ext}`;
    await blobService.uploadRecording(blobName, data, contentType);
    await sessionRepository.setRecording(sessionId, user.tenantId, blobName);
    return { blobName };
  },

  async getDownloadUrl(user: AuthenticatedUser, sessionId: string): Promise<string> {
    const session = await sessionService.getOrThrow(user, sessionId);
    if (!session.recordingBlobName) {
      throw new NotFoundError('No recording saved for this session');
    }
    return blobService.getDownloadUrl(session.recordingBlobName);
  },
};
