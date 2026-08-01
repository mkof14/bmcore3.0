import { SUPERADMIN_EMAILS, isSuperadminEmail, normalizeEmail } from './adminAccess';
import { supabase } from './supabase';

/**
 * Mock-only member DX: listed emails may enter Member Zone without a paid plan.
 * Password is NEVER stored here — sign in through Supabase Auth as usual.
 */
const DEV_MEMBER_EMAILS = SUPERADMIN_EMAILS;
const isMockMode = import.meta.env.VITE_MOCK_MODE === '1';

/**
 * True when the user can use Member Zone (active plan, DB admin, or mock allowlist).
 */
export async function userHasMemberAccess(userId: string, email?: string | null): Promise<boolean> {
  try {
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('status')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .maybeSingle();

    if (sub) return true;

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.is_admin) return true;
    if (profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.role === 'super_admin') {
      return true;
    }

    // Email allowlist bypass is mock-only — never grant production member access by email alone.
    if (isMockMode && isSuperadminEmail(email)) return true;

    if (isMockMode) {
      const fromEnv = (import.meta.env.VITE_DEV_MEMBER_EMAILS as string | undefined) || '';
      if (
        fromEnv
          .split(',')
          .map((x) => normalizeEmail(x))
          .filter(Boolean)
          .includes(normalizeEmail(email))
      ) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('member access check failed', error);
    if (isMockMode && isSuperadminEmail(email)) return true;
    return false;
  }
}

export { DEV_MEMBER_EMAILS };
