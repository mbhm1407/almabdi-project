import { describe, expect, it, vi } from 'vitest';
import { withRetry } from '../src/lib/retry.js';

const noSleep = () => Promise.resolve();

describe('withRetry', () => {
  it('returns immediately on first success', async () => {
    const op = vi.fn().mockResolvedValue('ok');
    await expect(withRetry(op, { sleep: noSleep })).resolves.toBe('ok');
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('retries transient failures then succeeds', async () => {
    const op = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue('ok');
    await expect(withRetry(op, { attempts: 3, sleep: noSleep })).resolves.toBe('ok');
    expect(op).toHaveBeenCalledTimes(3);
  });

  it('throws the last error after exhausting attempts', async () => {
    const op = vi.fn().mockRejectedValue(new Error('always'));
    await expect(withRetry(op, { attempts: 2, sleep: noSleep })).rejects.toThrow('always');
    expect(op).toHaveBeenCalledTimes(2);
  });

  it('does not retry when isRetryable returns false', async () => {
    const op = vi.fn().mockRejectedValue(new Error('fatal'));
    await expect(
      withRetry(op, { attempts: 5, sleep: noSleep, isRetryable: () => false }),
    ).rejects.toThrow('fatal');
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('invokes onRetry before each backoff', async () => {
    const onRetry = vi.fn();
    const op = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue('ok');
    await withRetry(op, { attempts: 3, sleep: noSleep, onRetry });
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1, expect.any(Number));
  });
});
