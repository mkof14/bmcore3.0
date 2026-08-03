#!/usr/bin/env node
/**
 * Verify marketing prerender shells contain title, description, H1, and bm-prerender marker.
 * Run after `node scripts/prerender.mjs` (invoked from npm run build).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRERENDER_ROUTES } from './prerender-routes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');

/**
 * Priority marketing routes — always verified first.
 * Entire PRERENDER_ROUTES list is hard-fail (missing file / bad title / description / H1 / marker).
 */
const PRIORITY = [
  '/',
  '/about',
  '/pricing',
  '/science',
  '/how-it-works',
  '/blog',
  '/why-two-models',
  '/learning-center',
  '/contact',
  '/faq',
  '/privacy-trust',
  '/services',
  '/services-catalog',
  '/investors',
  '/media',
  '/partnership',
];

function fileFor(routePath) {
  if (routePath === '/') return path.join(DIST, 'index.html');
  return path.join(DIST, routePath.replace(/^\//, ''), 'index.html');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeReg(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function checkHtml(file, route) {
  const errors = [];
  if (!fs.existsSync(file)) {
    return [`missing file ${path.relative(process.cwd(), file)}`];
  }
  const html = fs.readFileSync(file, 'utf8');
  const titleEsc = escapeHtml(route.title);
  const h1Esc = escapeHtml(route.h1);
  const descEsc = escapeHtml(route.description);

  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push('missing <title>');
  if (!new RegExp(`<title>${escapeReg(titleEsc)}</title>`, 'i').test(html)) {
    errors.push(`title mismatch (expected “${route.title}”)`);
  }
  if (!/name=["']description["'][^>]*content=["'][^"']+["']/i.test(html)) {
    errors.push('missing meta description');
  }
  // Description is attribute-escaped; match a stable prefix of the escaped string.
  if (!html.includes(descEsc.slice(0, Math.min(48, descEsc.length)))) {
    errors.push('description content not found');
  }
  if (!new RegExp(`<h1[^>]*>\\s*${escapeReg(h1Esc)}\\s*</h1>`, 'i').test(html)) {
    errors.push(`missing H1 “${route.h1}”`);
  }
  if (!/<noscript>[\s\S]*?<h1[\s\S]*?<\/h1>[\s\S]*?<\/noscript>/i.test(html)) {
    errors.push('missing noscript H1 block (bots without JS)');
  }
  if (!/name=["']bm-prerender["']/i.test(html)) {
    errors.push('missing bm-prerender marker');
  }
  if (!/property=["']og:title["']/i.test(html)) {
    errors.push('missing og:title');
  }
  if (!/rel=["']canonical["']/i.test(html)) {
    errors.push('missing canonical link');
  }
  return errors;
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error('[verify-prerender] dist/ missing — run vite build + prerender first');
    process.exit(1);
  }

  const byPath = new Map(PRERENDER_ROUTES.map((r) => [r.path, r]));
  let failed = 0;

  for (const p of PRIORITY) {
    if (!byPath.has(p)) {
      console.error(`[verify-prerender] PRIORITY route ${p} missing from PRERENDER_ROUTES`);
      failed += 1;
    }
  }

  // Hard-fail every marketing shell (priority first for clearer CI logs).
  const ordered = [
    ...PRIORITY.filter((p) => byPath.has(p)).map((p) => byPath.get(p)),
    ...PRERENDER_ROUTES.filter((r) => !PRIORITY.includes(r.path)),
  ];

  for (const route of ordered) {
    const errs = checkHtml(fileFor(route.path), route);
    if (errs.length) {
      console.error(`[verify-prerender] FAIL ${route.path}:`);
      for (const e of errs) console.error(`  - ${e}`);
      failed += 1;
    } else {
      console.log(`[verify-prerender] OK ${route.path}`);
    }
  }

  if (failed) {
    console.error(`[verify-prerender] ${failed} check(s) failed — refusing to ship broken prerender`);
    process.exit(1);
  }
  console.log(`[verify-prerender] All ${PRERENDER_ROUTES.length} marketing shells verified`);
}

main();
