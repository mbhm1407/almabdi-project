import { describe, expect, it, vi } from 'vitest';
import { CircuitBreaker } from '../src/lib/circuitBreaker.js';

describe('CircuitBreaker', () => {
  it('passes results through while closed', async () => {
    const breaker = new CircuitBreaker('t');
    await expect(breaker.execute(() => Promise.resolve(42))).resolves.toBe(42);
    expect(breaker.currentState).toBe('closed');
  });

  it('opens after the failure threshold and then fails fast', async () => {
    const breaker = new CircuitBreaker('t', { failureThreshold: 2, resetTimeoutMs: 1000 });
    const failing = () => Promise.reject(new Error('down'));
    await expect(breaker.execute(failing)).rejects.toThrow('down');
    await expect(breaker.execute(failing)).rejects.toThrow('down');
    expect(breaker.currentState).toBe('open');
    // Circuit is open: the operation is not even attempted.
    const op = vi.fn();
    await expect(breaker.execute(op)).rejects.toThrow(/is open/);
    expect(op).not.toHaveBeenCalled();
  });

  it('half-opens after the reset timeout and closes on success', async () => {
    let now = 0;
    const breaker = new CircuitBreaker('t', {
      failureThreshold: 1,
      resetTimeoutMs: 500,
      now: () => now,
    });
    await expect(breaker.execute(() => Promise.reject(new Error('x')))).rejects.toThrow('x');
    expect(breaker.currentState).toBe('open');

    now = 600; // advance past the reset window
    await expect(breaker.execute(() => Promise.resolve('recovered'))).resolves.toBe('recovered');
    expect(breaker.currentState).toBe('closed');
  });
});
