import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { BadRequestError } from '../lib/errors.js';

type Source = 'body' | 'query' | 'params';

/**
 * Validates and narrows a request segment against a Zod schema. On success the
 * parsed (and coerced) value replaces the original, so handlers receive typed,
 * trusted input.
 */
export function validate(schema: ZodSchema, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      // req.query/params are read-only getters in Express 5-safe code paths; we
      // stash the validated value where handlers read it.
      (req as unknown as Record<string, unknown>)[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(
          new BadRequestError(
            'Validation failed',
            err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
          ),
        );
        return;
      }
      next(err);
    }
  };
}
