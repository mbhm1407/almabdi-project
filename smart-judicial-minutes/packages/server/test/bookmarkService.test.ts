import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedUser, TranscriptionSession } from '@smj/shared';

const repo = vi.hoisted(() => ({
  upsert: vi.fn(),
  listBySession: vi.fn(),
  remove: vi.fn(),
}));
const sessions = vi.hoisted(() => ({ getOrThrow: vi.fn() }));

vi.mock('../src/features/bookmarks/bookmarkRepository.js', () => ({ bookmarkRepository: repo }));
vi.mock('../src/features/sessions/sessionService.js', () => ({ sessionService: sessions }));

const user: AuthenticatedUser = {
  id: 'clerk-1',
  tenantId: 'tenant-1',
  name: 'Clerk',
  email: 'c@x.com',
  roles: ['clerk'],
};

const session = { id: '11111111-1111-1111-1111-111111111111' } as TranscriptionSession;

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
  sessions.getOrThrow.mockResolvedValue(session);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('bookmarkService', () => {
  it('verifies session ownership before adding a bookmark', async () => {
    const { bookmarkService } = await import('../src/features/bookmarks/bookmarkService.js');
    const bookmark = await bookmarkService.add(user, session.id, {
      id: '22222222-2222-2222-2222-222222222222',
      label: 'بداية الدعوى',
      offsetMs: 12000,
      timestamp: '2026-07-08T09:14:00.000Z',
    });
    expect(sessions.getOrThrow).toHaveBeenCalledWith(user, session.id);
    expect(bookmark.sessionId).toBe(session.id);
    expect(repo.upsert).toHaveBeenCalledOnce();
  });

  it('rejects when the session is not owned by the caller', async () => {
    sessions.getOrThrow.mockRejectedValueOnce(new Error('Session not found'));
    const { bookmarkService } = await import('../src/features/bookmarks/bookmarkService.js');
    await expect(
      bookmarkService.list(user, '33333333-3333-3333-3333-333333333333'),
    ).rejects.toThrow(/not found/i);
    expect(repo.listBySession).not.toHaveBeenCalled();
  });

  it('removes a bookmark scoped to its session', async () => {
    const { bookmarkService } = await import('../src/features/bookmarks/bookmarkService.js');
    await bookmarkService.remove(user, session.id, '22222222-2222-2222-2222-222222222222');
    expect(repo.remove).toHaveBeenCalledWith('22222222-2222-2222-2222-222222222222', session.id);
  });
});
