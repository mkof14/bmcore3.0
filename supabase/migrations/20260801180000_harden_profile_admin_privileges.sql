/*
  # Harden profile admin privileges (P0.3)

  Goals:
  - Users cannot self-elevate via profiles.is_admin or elevated role values
  - profiles.is_admin is the operator-facing source of truth for admin
  - is_admin_cached() reads profiles.is_admin (and legacy admin_cache) so SQL promote works for RLS
  - Operators grant admin via SQL / Dashboard / service role — never from the browser client

  Verify after apply (as a normal authenticated user JWT):
    UPDATE profiles SET is_admin = true WHERE id = auth.uid();  -- must fail
    UPDATE profiles SET role = 'superadmin' WHERE id = auth.uid();  -- must fail
*/

-- Source of truth: profiles.is_admin (plus legacy admin_cache for older role tables)
CREATE OR REPLACE FUNCTION public.is_admin_cached(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    COALESCE(
      (SELECT p.is_admin FROM public.profiles p WHERE p.id = check_user_id),
      false
    )
    OR COALESCE(
      (
        SELECT ac.is_admin OR ac.is_super_admin
        FROM public.admin_cache ac
        WHERE ac.user_id = check_user_id
      ),
      false
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_cached(uuid) TO authenticated;

-- Block privilege column changes unless caller is already admin or has no JWT (service role / SQL editor)
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  elevated text[] := ARRAY['admin', 'superadmin', 'super_admin'];
  caller uuid := auth.uid();
  caller_is_admin boolean := false;
BEGIN
  IF caller IS NOT NULL THEN
    -- Read OLD row state via is_admin_cached (SECURITY DEFINER; no RLS recursion)
    caller_is_admin := public.is_admin_cached(caller);
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF COALESCE(NEW.is_admin, false) = true
       OR (NEW.role IS NOT NULL AND NEW.role = ANY (elevated)) THEN
      IF caller IS NULL OR caller_is_admin THEN
        RETURN NEW;
      END IF;
      NEW.is_admin := false;
      IF NEW.role IS NOT NULL AND NEW.role = ANY (elevated) THEN
        NEW.role := 'user';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
       OR NEW.role IS DISTINCT FROM OLD.role THEN
      -- No JWT: service role / dashboard SQL as superuser typically has auth.uid() null
      IF caller IS NULL THEN
        RETURN NEW;
      END IF;
      IF caller_is_admin THEN
        RETURN NEW;
      END IF;
      RAISE EXCEPTION
        'privilege escalation denied: is_admin and elevated role may only be changed by an existing admin or service role';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- Own-profile UPDATE: cannot leave the row with elevated privileges
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND COALESCE(is_admin, false) = false
    AND (role IS NULL OR role NOT IN ('admin', 'superadmin', 'super_admin'))
  );

-- Own-profile INSERT: cannot create an elevated profile
DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
    AND COALESCE(is_admin, false) = false
    AND (role IS NULL OR role NOT IN ('admin', 'superadmin', 'super_admin'))
  );

COMMENT ON FUNCTION public.prevent_profile_privilege_escalation() IS
  'P0.3: Blocks client self-elevation of profiles.is_admin / elevated role. Grant admin via SQL (scripts/promote-admin.sql) or service role.';
