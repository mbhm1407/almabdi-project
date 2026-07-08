import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../lib/errors.js';
import type { Role } from '@smj/shared';

/**
 * Role-based access control. Requires the authenticated user to hold at least
 * one of the allowed roles. Must run after {@link requireAuth}.
 */
export function requireRole(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    const hasRole = req.user.roles.some((r) => allowed.includes(r));
    if (!hasRole) {
      next(new ForbiddenError(`Requires one of roles: ${allowed.join(', ')}`));
      return;
    }
    next();
  };
}
