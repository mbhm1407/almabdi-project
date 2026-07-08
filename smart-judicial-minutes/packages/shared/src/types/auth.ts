import { z } from 'zod';

/**
 * Role-based access control. The app deliberately has a tiny surface:
 * - clerk: can create sessions, capture and save transcripts/recordings (the primary user).
 * - viewer: read-only access to existing transcripts.
 * - admin: everything, plus access to audit logs.
 */
export const roleSchema = z.enum(['clerk', 'viewer', 'admin']);
export type Role = z.infer<typeof roleSchema>;

/** The authenticated principal resolved from a validated Entra ID token. */
export interface AuthenticatedUser {
  /** Entra object id (oid claim). */
  id: string;
  tenantId: string;
  name: string;
  email: string;
  roles: Role[];
}

export const ROLES: Record<Role, Role> = {
  clerk: 'clerk',
  viewer: 'viewer',
  admin: 'admin',
};
