export interface RetryOptions {
  /** Maximum number of attempts (including the first). */
  attempts?: number;
  /** Base delay in ms for exponential backoff. */
  baseDelayMs?: number;
  /** Upper bound for a single backoff delay. */
  maxDelayMs?: number;
  /** Decides whether a given error is worth retrying. Defaults to always. */
  isRetryable?: (error: unknown) => boolean;
  /** Called before each retry, for logging/metrics. */
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
  /** Injectable sleep (tests pass a no-op). */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Runs an async operation with bounded exponential backoff + jitter. Used for
 * transient failures talking to Azure SQL, Blob storage and the Speech STS.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 200;
  const maxDelayMs = options.maxDelayMs ?? 5_000;
  const isRetryable = options.isRetryable ?? (() => true);
  const sleep = options.sleep ?? defaultSleep;

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt >= attempts || !isRetryable(error)) break;
      const backoff = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
      const jitter = Math.floor(Math.random() * (backoff / 2));
      const delayMs = backoff + jitter;
      options.onRetry?.(error, attempt, delayMs);
      await sleep(delayMs);
    }
  }
  throw lastError;
}
