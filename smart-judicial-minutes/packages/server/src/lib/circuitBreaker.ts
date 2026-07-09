export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  /** Consecutive failures before the circuit opens. */
  failureThreshold?: number;
  /** How long the circuit stays open before allowing a trial call (ms). */
  resetTimeoutMs?: number;
  /** Injectable clock (tests control time). */
  now?: () => number;
}

/**
 * A minimal circuit breaker. After {@link CircuitBreakerOptions.failureThreshold}
 * consecutive failures it "opens" and fails fast for `resetTimeoutMs`, protecting
 * a struggling upstream (e.g. Azure Speech STS) from being hammered. A single
 * trial call in the half-open state closes the circuit on success.
 */
export class CircuitBreaker {
  private failures = 0;
  private state: CircuitState = 'closed';
  private openedAt = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly now: () => number;

  constructor(
    private readonly name: string,
    options: CircuitBreakerOptions = {},
  ) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 30_000;
    this.now = options.now ?? Date.now;
  }

  get currentState(): CircuitState {
    return this.state;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.now() - this.openedAt >= this.resetTimeoutMs) {
        this.state = 'half-open';
      } else {
        throw new Error(`Circuit "${this.name}" is open`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures += 1;
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
      this.openedAt = this.now();
    }
  }
}
