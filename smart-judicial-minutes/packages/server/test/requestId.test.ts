import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { requestId } from '../src/middleware/requestId.js';

function run(headers: Record<string, string | string[] | undefined>) {
  const req = { headers } as unknown as Request;
  const setHeader = vi.fn();
  const res = { setHeader } as unknown as Response;
  const next = vi.fn();
  requestId()(req, res, next);
  return { req, setHeader, next };
}

describe('requestId', () => {
  it('generates a uuid when no id is supplied', () => {
    const { req, setHeader, next } = run({});
    expect(req.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(setHeader).toHaveBeenCalledWith('x-request-id', req.id);
    expect(next).toHaveBeenCalledOnce();
  });

  it('reuses a safe inbound x-request-id', () => {
    const { req } = run({ 'x-request-id': 'trace-abc_123' });
    expect(req.id).toBe('trace-abc_123');
  });

  it('rejects an unsafe inbound id and generates a new one', () => {
    const { req } = run({ 'x-request-id': 'bad id <script>' });
    expect(req.id).not.toBe('bad id <script>');
    expect(req.id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('takes the first value when the header is an array', () => {
    const { req } = run({ 'x-request-id': ['first-id', 'second'] });
    expect(req.id).toBe('first-id');
  });
});
