import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedUser, TranscriptionSession } from '@smj/shared';

const blob = vi.hoisted(() => ({
  uploadRecording: vi.fn().mockResolvedValue('blob'),
  getDownloadUrl: vi.fn().mockResolvedValue('https://sas.example/recording'),
}));
const sessions = vi.hoisted(() => ({ getOrThrow: vi.fn() }));
const repo = vi.hoisted(() => ({ setRecording: vi.fn() }));

vi.mock('../src/infrastructure/blob/blobService.js', () => ({ blobService: blob }));
vi.mock('../src/features/sessions/sessionService.js', () => ({ sessionService: sessions }));
vi.mock('../src/features/sessions/sessionRepository.js', () => ({ sessionRepository: repo }));

const user: AuthenticatedUser = {
  id: 'clerk-1',
  tenantId: 'tenant-1',
  name: 'Clerk',
  email: 'c@x.com',
  roles: ['clerk'],
};

const baseSession: TranscriptionSession = {
  id: '11111111-1111-1111-1111-111111111111',
  meetingId: 'm-1',
  meetingTitle: 'جلسة',
  caseNumber: null,
  circuitName: null,
  judgeName: null,
  tenantId: 'tenant-1',
  createdBy: 'clerk-1',
  status: 'stopped',
  locale: 'ar-SA',
  startedAt: '2026-07-08T09:00:00.000Z',
  stoppedAt: '2026-07-08T09:30:00.000Z',
  recordingBlobName: null,
};

beforeEach(() => {
  vi.stubEnv('ENTRA_TENANT_ID', 'tenant');
  vi.stubEnv('ENTRA_API_CLIENT_ID', 'client');
  vi.stubEnv('AZURE_SPEECH_KEY', 'key');
  vi.stubEnv('AZURE_SPEECH_REGION', 'westeurope');
  vi.stubEnv('SQL_SERVER', 'sql');
  vi.stubEnv('SQL_DATABASE', 'db');
  vi.stubEnv('SQL_USER', 'u');
  vi.stubEnv('SQL_PASSWORD', 'p');
  vi.stubEnv('BLOB_ACCOUNT_NAME', 'acct');
  vi.stubEnv('LOG_LEVEL', 'silent');
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('recordingService.save', () => {
  it('uploads under a tenant/session path and records the blob name', async () => {
    sessions.getOrThrow.mockResolvedValue(baseSession);
    const { recordingService } = await import('../src/features/recordings/recordingService.js');
    const result = await recordingService.save(
      user,
      baseSession.id,
      Buffer.from('x'),
      'audio/webm',
    );
    expect(result.blobName).toBe(`tenant-1/${baseSession.id}/recording.webm`);
    expect(blob.uploadRecording).toHaveBeenCalledWith(
      result.blobName,
      expect.any(Buffer),
      'audio/webm',
    );
    expect(repo.setRecording).toHaveBeenCalledWith(baseSession.id, 'tenant-1', result.blobName);
  });

  it('maps content type to the correct extension', async () => {
    sessions.getOrThrow.mockResolvedValue(baseSession);
    const { recordingService } = await import('../src/features/recordings/recordingService.js');
    const result = await recordingService.save(user, baseSession.id, Buffer.from('x'), 'audio/mp4');
    expect(result.blobName).toMatch(/\.m4a$/);
  });
});

describe('recordingService.getDownloadUrl', () => {
  it('returns a SAS url when a recording exists', async () => {
    sessions.getOrThrow.mockResolvedValue({
      ...baseSession,
      recordingBlobName: 'tenant-1/x/recording.webm',
    });
    const { recordingService } = await import('../src/features/recordings/recordingService.js');
    await expect(recordingService.getDownloadUrl(user, baseSession.id)).resolves.toContain(
      'https://',
    );
  });

  it('throws NotFound when no recording is saved', async () => {
    sessions.getOrThrow.mockResolvedValue(baseSession);
    const { recordingService } = await import('../src/features/recordings/recordingService.js');
    await expect(recordingService.getDownloadUrl(user, baseSession.id)).rejects.toThrow(
      /no recording/i,
    );
  });
});
