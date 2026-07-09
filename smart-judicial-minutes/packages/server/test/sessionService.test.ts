import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedUser, TranscriptionSession } from '@smj/shared';

// The repository talks to Azure SQL; mock it so we can unit-test the service.
const repo = vi.hoisted(() => ({
  create: vi.fn(),
  findById: vi.fn(),
  listByMeeting: vi.fn(),
  stop: vi.fn(),
  setRecording: vi.fn(),
}));

vi.mock('../src/features/sessions/sessionRepository.js', () => ({
  sessionRepository: repo,
}));

const user: AuthenticatedUser = {
  id: 'clerk-1',
  tenantId: 'tenant-1',
  name: 'Clerk',
  email: 'c@x.com',
  roles: ['clerk'],
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
  repo.create.mockImplementation((s: TranscriptionSession) => Promise.resolve(s));
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('sessionService.start', () => {
  it('creates an active session scoped to the caller tenant with a trimmed case number', async () => {
    const { sessionService } = await import('../src/features/sessions/sessionService.js');
    const session = await sessionService.start(user, {
      meetingId: 'm-1',
      meetingTitle: 'جلسة',
      caseNumber: '  ٤٣٥/٢/ق  ',
    });
    expect(session.status).toBe('active');
    expect(session.tenantId).toBe('tenant-1');
    expect(session.createdBy).toBe('clerk-1');
    expect(session.caseNumber).toBe('٤٣٥/٢/ق');
    expect(repo.create).toHaveBeenCalledOnce();
  });

  it('stores a null case number when none is provided', async () => {
    const { sessionService } = await import('../src/features/sessions/sessionService.js');
    const session = await sessionService.start(user, { meetingId: 'm-1', meetingTitle: 'جلسة' });
    expect(session.caseNumber).toBeNull();
  });
});

describe('sessionService.getOrThrow', () => {
  it('throws NotFound when the session does not belong to the tenant', async () => {
    repo.findById.mockResolvedValue(null);
    const { sessionService } = await import('../src/features/sessions/sessionService.js');
    await expect(
      sessionService.getOrThrow(user, '11111111-1111-1111-1111-111111111111'),
    ).rejects.toThrow(/not found/i);
  });
});

describe('sessionService.stop', () => {
  it('marks an active session stopped and records the stop time', async () => {
    const existing: TranscriptionSession = {
      id: '11111111-1111-1111-1111-111111111111',
      meetingId: 'm-1',
      meetingTitle: 'جلسة',
      caseNumber: null,
      tenantId: 'tenant-1',
      createdBy: 'clerk-1',
      status: 'active',
      locale: 'ar-SA',
      startedAt: '2026-07-08T09:00:00.000Z',
      stoppedAt: null,
      recordingBlobName: null,
    };
    repo.findById.mockResolvedValue(existing);
    const { sessionService } = await import('../src/features/sessions/sessionService.js');
    const stopped = await sessionService.stop(user, existing.id);
    expect(stopped.status).toBe('stopped');
    expect(stopped.stoppedAt).not.toBeNull();
    expect(repo.stop).toHaveBeenCalledOnce();
  });
});
