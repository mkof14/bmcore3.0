-- Promote a user to admin (operator / service-role / SQL editor only).
-- The browser client must NEVER run this. See DEPLOYMENT_GUIDE.md → Granting admin access.
--
-- Usage: replace 'your-email@example.com' with the user's auth email.

-- Check current status
SELECT id, email, is_admin, role, created_at
FROM public.profiles
WHERE email = 'your-email@example.com';

-- Promote (auth.uid() is null in SQL editor → privilege trigger allows this)
UPDATE public.profiles
SET
  is_admin = true,
  role = 'superadmin',
  updated_at = now()
WHERE email = 'your-email@example.com';

-- Keep legacy admin_cache in sync when that table exists
DO $$
BEGIN
  IF to_regclass('public.admin_cache') IS NOT NULL THEN
    INSERT INTO public.admin_cache (user_id, is_admin, is_super_admin)
    SELECT id, true, true
    FROM public.profiles
    WHERE email = 'your-email@example.com'
    ON CONFLICT (user_id) DO UPDATE
    SET
      is_admin = true,
      is_super_admin = true;
  END IF;
END $$;

-- Verify
SELECT id, email, is_admin, role, updated_at
FROM public.profiles
WHERE email = 'your-email@example.com';

-- List all admins
SELECT id, email, is_admin, role, created_at, updated_at
FROM public.profiles
WHERE is_admin = true
ORDER BY created_at DESC;

-- Optional revoke:
-- UPDATE public.profiles
-- SET is_admin = false, role = 'user', updated_at = now()
-- WHERE email = 'your-email@example.com';
