import { z } from 'zod';

/**
 * Judicial roles a speaker can hold in a hearing. Kept deliberately small and
 * courtroom-specific. `unassigned` is the default until the clerk maps a
 * diarized speaker to a participant.
 */
export const judicialRoleSchema = z.enum([
  'judge',
  'clerk',
  'plaintiff',
  'defendant',
  'lawyer',
  'witness',
  'observer',
  'unassigned',
]);

export type JudicialRole = z.infer<typeof judicialRoleSchema>;

/** Arabic display labels for each judicial role. */
export const JUDICIAL_ROLE_LABELS_AR: Record<JudicialRole, string> = {
  judge: 'القاضي',
  clerk: 'كاتب الضبط',
  plaintiff: 'المدعي',
  defendant: 'المدعى عليه',
  lawyer: 'المحامي',
  witness: 'الشاهد',
  observer: 'حاضر',
  unassigned: 'غير محدد',
};

/** Ordered list of assignable roles (excludes the `unassigned` placeholder). */
export const ASSIGNABLE_JUDICIAL_ROLES: JudicialRole[] = [
  'judge',
  'clerk',
  'plaintiff',
  'defendant',
  'lawyer',
  'witness',
  'observer',
];

/** Returns the Arabic label for a role, falling back to the placeholder. */
export function judicialRoleLabel(role: JudicialRole | null | undefined): string {
  return JUDICIAL_ROLE_LABELS_AR[role ?? 'unassigned'];
}
