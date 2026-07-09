import jwt, { type JwtHeader, type JwtPayload, type SigningKeyCallback } from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { env } from '../../config/env.js';
import { UnauthorizedError } from '../../lib/errors.js';
import type { AuthenticatedUser, Role } from '@smj/shared';

/**
 * Verifies Microsoft Entra ID (Azure AD) v2.0 access tokens issued for this API
 * via Teams SSO. Signing keys are fetched from the tenant JWKS endpoint and
 * cached. The token audience and issuer are strictly validated.
 */
const issuers: [string, ...string[]] = [
  `https://login.microsoftonline.com/${env.ENTRA_TENANT_ID}/v2.0`,
  `https://sts.windows.net/${env.ENTRA_TENANT_ID}/`,
];

const jwksClient = new JwksClient({
  jwksUri: `https://login.microsoftonline.com/${env.ENTRA_TENANT_ID}/discovery/v2.0/keys`,
  cache: true,
  cacheMaxAge: 24 * 60 * 60 * 1000,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function getSigningKey(header: JwtHeader, callback: SigningKeyCallback): void {
  if (!header.kid) {
    callback(new Error('Token header is missing a key id'));
    return;
  }
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err || !key) {
      callback(err ?? new Error('Signing key not found'));
      return;
    }
    callback(null, key.getPublicKey());
  });
}

/** Accept either the bare client id or the api://<clientId> form as audience. */
const acceptedAudiences: [string, ...string[]] = [
  env.ENTRA_API_CLIENT_ID,
  `api://${env.ENTRA_API_CLIENT_ID}`,
];

function verifyToken(token: string): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getSigningKey,
      {
        audience: acceptedAudiences,
        issuer: issuers,
        algorithms: ['RS256'],
        clockTolerance: 60,
      },
      (err: jwt.VerifyErrors | null, decoded: unknown) => {
        if (err || !decoded || typeof decoded === 'string') {
          reject(new UnauthorizedError('Invalid or expired access token'));
          return;
        }
        resolve(decoded as JwtPayload);
      },
    );
  });
}

/**
 * Maps Entra app-role / group claims to the app's RBAC roles. Any authenticated
 * user is at minimum a clerk (the app's primary and only interactive role);
 * `roles` claims elevate to admin/viewer as configured in the app registration.
 */
function mapRoles(payload: JwtPayload): Role[] {
  const claimRoles = Array.isArray(payload.roles) ? (payload.roles as string[]) : [];
  const roles = new Set<Role>();
  for (const r of claimRoles) {
    const normalized = r.toLowerCase();
    if (normalized === 'admin' || normalized === 'clerk' || normalized === 'viewer') {
      roles.add(normalized as Role);
    }
  }
  if (roles.size === 0) {
    roles.add('clerk');
  }
  return [...roles];
}

export async function authenticate(token: string): Promise<AuthenticatedUser> {
  const payload = await verifyToken(token);
  const id = (payload.oid ?? payload.sub) as string | undefined;
  const tid = payload.tid as string | undefined;
  if (!id || !tid) {
    throw new UnauthorizedError('Token is missing required identity claims');
  }
  const name = (payload.name as string) ?? 'Unknown';
  const email =
    (payload.preferred_username as string) ??
    (payload.upn as string) ??
    (payload.email as string) ??
    '';
  return { id, tenantId: tid, name, email, roles: mapRoles(payload) };
}
