# Vercel Deployment Guide

## Operator deploy checklist (production)

Use this before every Production deploy. Details below if you need them.

### 1) Vercel environment variables

**Current default (UI / mock deploy):** `vercel-build` runs `build:mock` (`VITE_MOCK_MODE=1`). Supabase keys are **not** required. Auth and admin use client mock fallbacks until you add real Supabase env and switch `vercel-build` back to `npm run build`.

**Required for a live Supabase Production / Preview (when you leave mock mode):**

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

**Recommended:**

```bash
VITE_APP_URL=https://YOUR_DOMAIN_OR_VERCEL_URL
VITE_CONFIG_LOCK=0
VITE_REQUIRE_EMAIL_VERIFICATION=1
```

**Optional analytics / ads:**

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FACEBOOK_PIXEL_ID=XXXXXXXXXXXXXXXX
```

**If Stripe checkout is enabled:**

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...   # or pk_test_... for a staging first pass
# plus VITE_STRIPE_PRICE_* monthly/yearly IDs and VITE_STRIPE_CURRENCY
```

**Mock vs live on Vercel:**

- **Now:** `package.json` `"vercel-build": "npm run build:mock"` and `vercel.json` `env.VITE_MOCK_MODE=1` — deploy works without `VITE_SUPABASE_*`.
- **When going live:** set real `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in Vercel, change `"vercel-build"` to `"npm run build"`, remove `VITE_MOCK_MODE` from `vercel.json` / dashboard (mock auth/admin shortcuts are unsafe for a real site).

### 2) Supabase migrations + edge function

Apply pending migrations on the production project (SQL editor, CLI, or CI), especially:

- `supabase/migrations/20260801170000_create_media_library.sql` — `media_items` + `media` storage bucket
- `supabase/migrations/20260801180000_harden_profile_admin_privileges.sql` — blocks client self-elevate of `is_admin` / elevated `role`

Then redeploy the `admin-db` edge function (allowlist includes `media_items`):

```bash
supabase functions deploy admin-db --project-ref YOUR_PROJECT_REF
```

Also ensure Stripe-related functions (`create-checkout-session`, `create-portal-session`, `stripe-webhook`) are deployed if payments are live.

### 3) Promote admin

1. User signs up / signs in against **real** Supabase (not mock).
2. In Supabase SQL editor, run `scripts/promote-admin.sql` with their email.
3. Reload `/admin` — access is DB-only (`profiles.is_admin` / RLS `is_admin_cached()`).

### 4) Deploy on Vercel

- Framework: Vite · Build: `npm run vercel-build` (currently `build:mock`) · Output: `dist` · Node `24.x`
- Mock deploy: no Supabase env needed. Live deploy: real `VITE_SUPABASE_*` and switch `vercel-build` to `npm run build`
- Deploy (git push to the production branch, or Vercel Deploy button)

### 5) Post-deploy smoke

- [ ] `/pricing` deep link loads (SPA rewrite OK; no blank 404)
- [ ] Auth: `/sign-in` / `/sign-up` against real Supabase; console has **no** `[supabase] Mock auth active`
- [ ] DevTools → Network → document response includes `Content-Security-Policy` (enforce, not Report-Only only); console has no CSP blocks for Stripe/Supabase/optional GA/Pixel
- [ ] Home primary CTA navigates correctly
- [ ] `/media` loads (empty list OK if no published rows yet)
- [ ] Non-admin user is denied `/admin` (or admin panel gate); promoted admin can enter
- [ ] Optional: Health Guide mic permission, Stripe test checkout redirect

### Human actions still required

Secrets, Supabase dashboard, custom domain, and Stripe live keys cannot be set from the repo — do those in Vercel / Supabase / DNS yourself. Do not commit `.env`.

---

## Prerequisites
- Vercel account (free): https://vercel.com/signup
- GitHub/GitLab account
- Your Stripe keys (Test Mode recommended for first deploy)
- Your Supabase credentials (already configured)

## Step 1: Prepare Git Repository

### Option A: Using GitHub
1. Go to https://github.com/new
2. Create a **PRIVATE** repository (recommended for security)
3. Name it: `bmcore3.0`
4. Do NOT initialize with README (we already have files)

### Option B: Using GitLab
1. Go to https://gitlab.com/projects/new
2. Create a **PRIVATE** repository
3. Name it: `bmcore3.0`

## Step 2: Download Project from Bolt.new

1. In Bolt.new, click the **Download** button (top right)
2. Save the ZIP file to your computer
3. Extract the ZIP file to a folder

## Step 3: Push to Git Repository

Open terminal in the extracted folder and run:

```bash
# Initialize Git (if not already)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - bmcore3.0"

# Add your remote repository (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/bmcore2.1-savem.git

# Push to repository
git push -u origin main
```

**Note:** If you get an error about branch name, try:
```bash
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### 4.0 Production vs mock mode

**Current Vercel deploy is UI/mock** until real Supabase env is added: `vercel-build` → `build:mock`, and `vercel.json` sets `VITE_MOCK_MODE=1`. Auth/admin are mock — not a live backend.

| Environment | `VITE_MOCK_MODE` | Supabase env vars |
|---|---|---|
| Local `npm run dev` | `1` in `.env` / `.env.local` (team default) | Optional while mocking |
| Local live build (`npm run build`) | unset / `0` | Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Local / Vercel mock build | `1` via `build:mock` / `vercel-build` | Not required |
| Vercel live (after cutover) | unset / `0`; `vercel-build` → `npm run build` | **Required** in Vercel env |

Mock mode uses client fallbacks for auth/queries and treats listed emails as superadmin for UI testing — unsafe once you run a real site. Live Production admin is DB-only (see **Granting admin access** below). Live builds without mock and without Supabase credentials **fail** at `prebuild` (`scripts/validate-build-env.mjs`).

### 4.0 Vercel Environment Checklist (Quick)

Set these in **Vercel → Project → Settings → Environment Variables** for **Production** and **Preview** (unless a Preview is intentionally mock-only).

Required for live Supabase:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Recommended:

```bash
VITE_APP_URL=https://YOUR_DOMAIN_OR_VERCEL_URL
VITE_CONFIG_LOCK=0
VITE_REQUIRE_EMAIL_VERIFICATION=1
```

Required if payments are enabled:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_OR_pk_live_KEY
```

Optional observability / ads:

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FACEBOOK_PIXEL_ID=XXXXXXXXXXXXXXXX
VITE_SENTRY_DSN=https://xxxxx@o0.ingest.sentry.io/0
```

**Cutover to live Supabase:** set real `VITE_SUPABASE_*` in Vercel, change `"vercel-build"` to `"npm run build"`, remove `env.VITE_MOCK_MODE` from `vercel.json`.

### 4.1 Import Project
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your `bmcore3.0` repository
4. Click **"Import"**

### 4.2 Configure Project
- **Framework Preset:** Vite
- **Build Command:** `npm run vercel-build` (currently `build:mock`; no Supabase keys required)
- **Output Directory:** `dist`
- **Install Command:** `npm ci`
- **Node.js Version:** `24.x`

### 4.2.1 Preflight Check (recommended)
UI/mock deploy (current default — no Supabase keys):

```bash
npm ci
npm run vercel-build
# or: npm run build:mock
```

Live Supabase build (after cutover):

```bash
npm ci
# Ensure VITE_MOCK_MODE is unset/0 and VITE_SUPABASE_* are set
npm run build
```

### 4.2.2 Post-Deploy Smoke Check

After deploy (fuller list at top → **Operator deploy checklist**):

1. Open `/` and verify app loads without blank screen; Home CTA works.
2. Deep-link `/pricing` (hard refresh) — SPA rewrite must serve the app, not a Vercel 404.
3. Sign in on `/sign-in` / `/sign-up` against **real** Supabase; console has **no** `[supabase] Mock auth active`.
4. Check document response has enforce `Content-Security-Policy`; no CSP console errors for Supabase/Stripe.
5. Open `/media` (empty published list is OK).
6. Non-admin denied `/admin`; after `scripts/promote-admin.sql`, admin can enter.

### 4.3 Add Environment Variables

Click **"Environment Variables"** and add placeholders with your real project values (never commit secrets):

```bash
# Supabase Configuration (required for Production / live Preview)
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# After first deploy
# VITE_APP_URL=https://your-app.vercel.app

# Stripe — TEST MODE recommended first
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY_HERE

# Stripe Price IDs (from Stripe Dashboard → Products)
VITE_STRIPE_PRICE_DAILY_MONTHLY=price_xxx
VITE_STRIPE_PRICE_CORE_MONTHLY=price_xxx
VITE_STRIPE_PRICE_MAX_MONTHLY=price_xxx
VITE_STRIPE_PRICE_DAILY_YEARLY=price_xxx
VITE_STRIPE_PRICE_CORE_YEARLY=price_xxx
VITE_STRIPE_PRICE_MAX_YEARLY=price_xxx

VITE_STRIPE_CURRENCY=usd

# Email (client provider hint; server keys stay server-side)
VITE_EMAIL_PROVIDER=mock
VITE_EMAIL_FROM=BioMath Core <no-reply@biomathcore.com>
VITE_EMAIL_REPLY_TO=support@biomathcore.com
```

**IMPORTANT:**
- Use Stripe **TEST keys** (start with `pk_test_`) for testing
- You'll add `VITE_APP_URL` / public URL in Step 5 after getting your Vercel URL
- Rotate any credentials that were previously pasted into docs or chat

### 4.4 Deploy
Click **"Deploy"** and wait 2-3 minutes.

## Step 5: Configure Public URL

After deployment completes:

1. Vercel will show your URL, something like: `https://bmcore3.0.vercel.app`
2. Go to **Settings → Environment Variables**
3. Add or update:
   ```
   VITE_APP_URL=https://bmcore3.0.vercel.app
   ```
   (Replace with your actual Vercel URL or custom domain. SEO / OG tags use this; there is no `VITE_PUBLIC_URL`.)
4. Click **"Save"**
5. Go to **Deployments** tab
6. Click **"Redeploy"** on the latest deployment

## Step 6: Configure Supabase Edge Functions

Your Edge Functions need to know about the Vercel URL:

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Edge Functions**
4. For each function (`create-checkout-session`, `create-portal-session`, `stripe-webhook`):
   - No changes needed - they read URLs from request body

## Step 7: Test Stripe Integration

1. Open your Vercel URL: `https://your-app.vercel.app`
2. Sign in with your account
3. Go to **Pricing** page
4. Click **"Get Started"** on any plan
5. You'll be redirected to Stripe Checkout
6. Use Stripe test card: `4242 4242 4242 4242`
7. Complete the payment
8. You should be redirected back to Member Zone!

**Test Cards (Stripe Test Mode):**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

## Step 8: Monitor and Debug

### View Logs
**Vercel Logs:**
- Dashboard → Your Project → Logs

**Supabase Edge Function Logs:**
- Dashboard → Edge Functions → Function Name → Logs

**Stripe Logs:**
- Dashboard → Developers → Logs

### Common Issues

**Issue: Redirect doesn't work after payment**
- Check that `VITE_APP_URL` / Stripe success/cancel URLs are set correctly in Vercel
- Verify the URL matches your Vercel deployment URL exactly

**Issue: "Invalid API Key" in Stripe**
- Make sure you're using the correct Stripe keys (test vs live)
- Verify keys are saved in Vercel environment variables

**Issue: Database errors**
- Supabase credentials should be the same as in Bolt.new
- Check Supabase RLS policies are enabled

## Step 9: Going Live (When Ready)

When you're ready for production:

1. **Switch to Stripe Live Mode:**
   - Update `VITE_STRIPE_PUBLISHABLE_KEY` to `pk_live_...`
   - Update all price IDs to live price IDs

2. **Update Domain (optional):**
   - In Vercel: Settings → Domains
   - Add your custom domain (e.g., biomathcore.com)
   - Update `VITE_APP_URL` to your custom domain

3. **Enable Email Provider:**
   - Update `VITE_EMAIL_PROVIDER` to `resend`, `sendgrid`, or `ses`
   - Add provider API keys

## Future Updates

After initial deployment, to update your live site:

```bash
# Make changes in Bolt.new
# Download updated code
# Extract and navigate to folder

git add .
git commit -m "Description of changes"
git push

# Vercel will automatically deploy!
```

## Granting admin access (safe)

Admin is **database-only**. The browser never writes `profiles.is_admin` or elevated `role` values.

1. Apply migrations (includes `20260801180000_harden_profile_admin_privileges.sql`).
2. User signs up / signs in normally (real Supabase — not mock).
3. In the **Supabase SQL editor** (or any service-role connection), run `scripts/promote-admin.sql` with their email:

```sql
UPDATE public.profiles
SET is_admin = true, role = 'superadmin', updated_at = now()
WHERE email = 'your@email.com';
```

4. They reload `/admin` — UI checks the profile row; RLS uses `is_admin_cached()`.

**Do not** rely on client email allowlists for production admin. `VITE_SUPERADMIN_EMAILS` / hardcoded emails are for **local mock login** only (`VITE_MOCK_MODE=1`).

**Operator audit (live DB):** confirm no authenticated user can self-elevate:

```sql
-- As a non-admin user JWT this must fail:
UPDATE public.profiles SET is_admin = true WHERE id = auth.uid();
UPDATE public.profiles SET role = 'superadmin' WHERE id = auth.uid();
```

## Security Checklist

- [ ] Repository is PRIVATE
- [ ] `.env` file is in `.gitignore`
- [ ] Using Stripe TEST mode for testing
- [ ] All secrets are in Vercel Dashboard, not in code
- [ ] `VITE_APP_URL` is set correctly
- [ ] Mock deploy OK as current default; for live cutover: `VITE_MOCK_MODE` unset and real `VITE_SUPABASE_*` set
- [ ] Migrations applied (`media_items` + admin privilege harden) and `admin-db` redeployed
- [ ] Edge Functions are deployed in Supabase
- [ ] RLS policies are enabled in database
- [ ] Admin granted only via SQL / service role (not client self-elevate)
- [ ] Live DB audited: users cannot UPDATE own `is_admin` / elevated `role`
- [ ] After deploy: DevTools → Network → document response includes `Content-Security-Policy` (not Report-Only only)
- [ ] Smoke Health Guide mic, Stripe checkout redirect, Supabase auth, and optional GA/Meta with consent — console has no CSP violations
- [ ] If a new third party is added, update the CSP allowlist in `vercel.json` and the matching `vite preview` headers in `vite.config.ts`

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase Edge Function logs
3. Check Stripe Dashboard logs
4. Check browser console for errors

---

**Ready to deploy? Follow the steps above!** 🚀

The entire process takes about 10-15 minutes.
