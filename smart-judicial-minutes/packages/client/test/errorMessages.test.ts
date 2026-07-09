import { describe, expect, it } from 'vitest';
import { toFriendlyError } from '../src/services/errorMessages';
import { ApiClientError } from '../src/services/apiClient';

describe('toFriendlyError', () => {
  it('maps 401 to a token-expiry message', () => {
    const friendly = toFriendlyError(new ApiClientError(401, 'UNAUTHORIZED', 'no'));
    expect(friendly.title).toContain('انتهت');
    expect(friendly.recoverable).toBe(true);
  });

  it('maps 403 to a non-recoverable permission message', () => {
    const friendly = toFriendlyError(new ApiClientError(403, 'FORBIDDEN', 'no'));
    expect(friendly.recoverable).toBe(false);
  });

  it('maps 502 to an Azure-unavailable message', () => {
    const friendly = toFriendlyError(new ApiClientError(502, 'UPSTREAM_ERROR', 'no'));
    expect(friendly.message).toContain('Azure');
  });

  it('detects microphone/permission failures', () => {
    const friendly = toFriendlyError(new Error('NotAllowedError: Permission denied'));
    expect(friendly.title).toContain('الميكروفون');
  });

  it('detects network failures', () => {
    const friendly = toFriendlyError(new Error('Failed to fetch'));
    expect(friendly.title).toContain('الشبكة');
  });

  it('detects speech disconnects', () => {
    const friendly = toFriendlyError(new Error('WebSocket error 1006'));
    expect(friendly.title).toContain('النسخ');
  });
});
