import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The env module validates process.env at import time, so provide the minimum
// required configuration before importing anything that pulls it in.
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
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('speechService', () => {
  it('exchanges the subscription key for a token and caches it', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('issued-token'),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { speechService } = await import('../src/features/speech/speechService.js');

    const first = await speechService.issueToken();
    const second = await speechService.issueToken();

    expect(first.token).toBe('issued-token');
    expect(first.region).toBe('westeurope');
    expect(first.locale).toBe('ar-SA');
    expect(first.expiresInSeconds).toBeGreaterThan(0);
    // Second call is served from cache — no additional network request.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second.token).toBe('issued-token');
  });

  it('throws an upstream error when Azure rejects the request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    const { speechService } = await import('../src/features/speech/speechService.js');
    await expect(speechService.issueToken()).rejects.toThrow(/speech token/i);
  });
});
