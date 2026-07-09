import type { NextFunction, Request, Response } from 'express';
import { authenticate } from '../infrastructure/auth/entraTokenVerifier.js';
import { UnauthorizedError } from '../lib/errors.js';
import type { AuthenticatedUser } from '@smj/shared';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Validates the Entra ID bearer token from Teams SSO and attaches the resolved
 * principal to `req.user`. Rejects anything without a valid token.
 */
export function requireAuth() {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const header = req.headers.authorization;
      if (!header || !header.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing bearer token');
      }
      const token = header.slice('Bearer '.length).trim();
      req.user = await authenticate(token);
      next();
    } catch (err) {
      next(err);
    }
  };
}
