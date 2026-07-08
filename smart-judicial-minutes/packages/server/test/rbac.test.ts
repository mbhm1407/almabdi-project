import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { requireRole } from '../src/middleware/rbac.js';
import { ForbiddenError, UnauthorizedError } from '../src/lib/errors.js';
import type { AuthenticatedUser } from '@smj/shared';

function makeReq(roles: AuthenticatedUser['roles'] | null): Request {
  return {
    user: roles ? { id: 'u1', tenantId: 't1', name: 'Clerk', email: 'c@x.com', roles } : undefined,
  } as unknown as Request;
}

describe('requireRole', () => {
  it('calls next() when the user has an allowed role', () => {
    const next = vi.fn();
    requireRole('clerk', 'admin')(makeReq(['clerk']), {} as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects with Forbidden when the role is missing', () => {
    const next = vi.fn();
    requireRole('admin')(makeReq(['clerk']), {} as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('rejects with Unauthorized when there is no user', () => {
    const next = vi.fn();
    requireRole('clerk')(makeReq(null), {} as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
