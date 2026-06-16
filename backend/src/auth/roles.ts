/**
 * Roles used across the app for access control.
 *
 * - member:    a registered member (optional recovery account)
 * - reception: the reception dashboard device (Pi-provisioned device token, no human login)
 * - medical:   medical staff
 * - security:  security staff
 * - admin:     administrator (superset; may access all staff areas + manage accounts)
 */
export const ROLES = ['member', 'reception', 'medical', 'security', 'admin'] as const;

export type Role = (typeof ROLES)[number];

/** Roles that authenticate with a username/secret stored in the accounts table. */
export const STAFF_ROLES: Role[] = ['medical', 'security', 'admin'];
