/**
 * Admin access helpers (UI + mock login).
 * Passwords are NEVER stored here — authenticate via Supabase Sign In.
 *
 * Production admin is granted ONLY in the database (profiles.is_admin / role).
 * The browser must never write is_admin or elevated roles.
 * Email allowlist is for local mock sign-in DX only — not a privilege grant.
 */

export const SUPERADMIN_EMAILS = ['dnainform@gmail.com'];

const ELEVATED_ROLES = new Set(['admin', 'superadmin', 'super_admin']);

export function normalizeEmail(email?: string | null): string {
  return (email || '').trim().toLowerCase();
}

/** True when email is listed for local mock login convenience. */
export function isSuperadminEmail(email?: string | null): boolean {
  const e = normalizeEmail(email);
  if (!e) return false;
  if (SUPERADMIN_EMAILS.includes(e)) return true;
  const fromEnv = (import.meta.env.VITE_SUPERADMIN_EMAILS as string | undefined) || '';
  return fromEnv
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
    .includes(e);
}

/**
 * Client-side admin UI gate — DB flags only.
 * Email allowlist must NOT grant access (defense-in-depth: never trust client identity alone).
 */
export function hasAdminUiAccess(opts: {
  email?: string | null;
  isAdmin?: boolean | null;
  role?: string | null;
}): boolean {
  if (opts.isAdmin === true) return true;
  if (opts.role && ELEVATED_ROLES.has(opts.role)) return true;
  return false;
}

export function isElevatedRole(role?: string | null): boolean {
  return !!role && ELEVATED_ROLES.has(role);
}
