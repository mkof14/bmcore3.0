import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Load Vite-style env files into process.env without overriding shell/CI/Vercel values.
 * Needed because npm `prebuild` runs before Vite loads `.env*`.
 */
function loadEnvFile(filename) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!key) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

['.env', '.env.local', '.env.production', '.env.production.local'].forEach(loadEnvFile);

const requiredPublicEnv = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const mockMode = process.env.VITE_MOCK_MODE === '1';

if (mockMode) {
  console.log(
    '[env-check] VITE_MOCK_MODE=1 — skipping Supabase env validation (local/dev or explicit mock build only).',
  );
  process.exit(0);
}

const missing = requiredPublicEnv.filter((key) => {
  const value = process.env[key];
  return !value || value.trim() === '' || value.includes('your_supabase');
});

const url = process.env.VITE_SUPABASE_URL?.trim() ?? '';
let urlInvalid = false;
if (url && !missing.includes('VITE_SUPABASE_URL')) {
  try {
    const parsed = new URL(url);
    urlInvalid = parsed.protocol !== 'http:' && parsed.protocol !== 'https:';
  } catch {
    urlInvalid = true;
  }
}

if (missing.length > 0 || urlInvalid) {
  console.error('[env-check] Production/live build requires real Supabase credentials.');
  console.error('  Set these in Vercel → Project → Settings → Environment Variables');
  console.error('  (Production / Preview), or in `.env` / `.env.local` for local builds:');
  console.error('    VITE_SUPABASE_URL');
  console.error('    VITE_SUPABASE_ANON_KEY');
  console.error('');
  console.error('  For local UI-only work without Supabase, use:');
  console.error('    VITE_MOCK_MODE=1   (in .env)  or  npm run build:mock / npm run dev');
  console.error('  Do NOT set VITE_MOCK_MODE on Vercel Production.');
  if (missing.length > 0) {
    console.error('');
    console.error('  Missing or placeholder:');
    missing.forEach((key) => console.error(`    - ${key}`));
  }
  if (urlInvalid) {
    console.error('');
    console.error(`  Invalid VITE_SUPABASE_URL: ${url}`);
  }
  process.exit(1);
}

console.log('[env-check] Required public environment variables are present.');
