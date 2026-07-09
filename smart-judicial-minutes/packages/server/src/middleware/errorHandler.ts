import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import type { ApiError } from '@smj/shared';

/** Normalizes the correlation id (which pino-http types loosely) to a string. */
function reqId(req: Request): string | undefined {
  return req.id != null ? String(req.id) : undefined;
}

/** Terminal 404 handler for unmatched routes. */
export function notFoundHandler(req: Request, res: Response): void {
  const body: ApiError = {
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
      requestId: reqId(req),
    },
  };
  res.status(404).json(body);
}

/**
 * Central error handler. Known {@link AppError}s become structured responses;
 * anything else is logged and returned as an opaque 500 so internals never leak.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.path, reqId: reqId(req) }, err.message);
    } else {
      logger.warn({ code: err.code, path: req.path, reqId: reqId(req) }, err.message);
    }
    const body: ApiError = {
      error: { code: err.code, message: err.message, details: err.details, requestId: reqId(req) },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  logger.error({ err, path: req.path, reqId: reqId(req) }, 'Unhandled error');
  const body: ApiError = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId: reqId(req),
    },
  };
  res.status(500).json(body);
}
