import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../src/middleware/validate.js';
import { BadRequestError } from '../src/lib/errors.js';

function makeReq(part: 'body' | 'query' | 'params', value: unknown): Request {
  return { [part]: value } as unknown as Request;
}

describe('validate middleware', () => {
  it('narrows and coerces a valid body, then calls next()', () => {
    const schema = z.object({ meetingId: z.string(), meetingTitle: z.string() });
    const req = makeReq('body', { meetingId: 'm-1', meetingTitle: 'جلسة', extra: 'ignored' });
    const next = vi.fn();
    validate(schema, 'body')(req, {} as Response, next);
    expect(next).toHaveBeenCalledWith();
    // Unknown keys are stripped by Zod.
    expect(req.body).toEqual({ meetingId: 'm-1', meetingTitle: 'جلسة' });
  });

  it('coerces query params (the previously untested path)', () => {
    const schema = z.object({ limit: z.coerce.number().int().min(1).max(500).default(100) });
    const req = makeReq('query', { limit: '25' });
    const next = vi.fn();
    validate(schema, 'query')(req, {} as Response, next);
    expect(next).toHaveBeenCalledWith();
    expect((req.query as { limit: number }).limit).toBe(25);
  });

  it('rejects invalid input with a BadRequestError carrying field details', () => {
    const schema = z.object({ meetingId: z.string().min(1) });
    const req = makeReq('body', { meetingId: '' });
    const next = vi.fn();
    validate(schema, 'body')(req, {} as Response, next);
    const err = next.mock.calls[0]?.[0];
    expect(err).toBeInstanceOf(BadRequestError);
    expect((err as BadRequestError).details?.length).toBeGreaterThan(0);
    expect((err as BadRequestError).details?.[0]?.path).toBe('meetingId');
  });

  it('validates uuid params', () => {
    const schema = z.object({ sessionId: z.string().uuid() });
    const bad = makeReq('params', { sessionId: 'not-a-uuid' });
    const next = vi.fn();
    validate(schema, 'params')(bad, {} as Response, next);
    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(BadRequestError);
  });
});
