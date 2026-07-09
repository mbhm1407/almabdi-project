import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

const HEADER = 'x-request-id';
/** Only accept caller-supplied ids that look safe (uuid-ish, bounded length). */
const SAFE_ID = /^[A-Za-z0-9._-]{1,128}$/;

/**
 * Assigns a correlation id to every request. Reuses a valid inbound
 * `x-request-id` (so a trace can span the gateway → API), otherwise generates a
 * UUID. The id is exposed on `req.id`, echoed in the response header, and picked
 * up by the HTTP logger and error handler for end-to-end tracing.
 */
export function requestId() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const inbound = req.headers[HEADER];
    const candidate = Array.isArray(inbound) ? inbound[0] : inbound;
    const id = candidate && SAFE_ID.test(candidate) ? candidate : randomUUID();
    req.id = id;
    res.setHeader(HEADER, id);
    next();
  };
}
