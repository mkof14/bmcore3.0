#!/usr/bin/env node
/**
 * Post-build SEO prerender for marketing routes.
 * Writes route-specific HTML shells (title, description, H1, JSON-LD) into dist/
 * so crawlers that skip JS still see real content. SPA assets remain for hydration.
 *
 * Usage: node scripts/prerender.mjs
 * Invoked automatically after `vite build` via package.json "build".
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BASE_URL,
  PRERENDER_ROUTES,
  organizationJsonLd,
  softwareApplicationJsonLd,
} from './prerender-routes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');
const INDEX = path.join(DIST, 'index.html');

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function absoluteUrl(routePath) {
  const base = BASE_URL.replace(/\/+$/, '');
  if (routePath === '/') return `${base}/`;
  return `${base}${routePath}`;
}

function setMeta(html, attr, name, content) {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${name}["'][^>]*>`,
    'i',
  );
  const tag = `<meta ${attr}="${name}" content="${escapeHtml(content)}" />`;
  if (re.test(html)) {
    return html.replace(re, tag);
  }
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function setLink(html, rel, href, extra = '') {
  const re = new RegExp(`<link[^>]+rel=["']${rel}["'][^>]*>`, 'i');
  const tag = `<link rel="${rel}"${extra} href="${escapeHtml(href)}" />`;
  if (rel === 'canonical' && re.test(html)) {
    return html.replace(re, tag);
  }
  if (rel === 'alternate') {
    // Replace first matching hreflang if present; else inject.
    return html.replace('</head>', `    ${tag}\n  </head>`);
  }
  if (re.test(html)) return html.replace(re, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function injectJsonLd(html, schemas) {
  const blocks = schemas
    .map(
      (schema) =>
        `<script type="application/ld+json">${JSON.stringify(schema)}</script>`,
    )
    .join('\n    ');
  // Remove existing ld+json from template to avoid stale Organization defaults.
  let next = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi,
    '',
  );
  return next.replace('</head>', `    ${blocks}\n  </head>`);
}

function injectNoscriptSeo(html, route) {
  const body = `
    <div style="max-width:720px;margin:48px auto;padding:0 24px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#111;">
      <p style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#c2410c;">BioMath Core</p>
      <h1 style="font-size:2rem;line-height:1.2;margin:12px 0 16px;">${escapeHtml(route.h1)}</h1>
      <p style="font-size:1.05rem;line-height:1.6;color:#374151;">${escapeHtml(route.description)}</p>
      <p style="margin-top:24px;font-size:0.95rem;"><a href="${escapeHtml(absoluteUrl('/pricing'))}">View pricing</a> · <a href="${escapeHtml(absoluteUrl('/science'))}">Science</a> · <a href="${escapeHtml(absoluteUrl('/about'))}">About</a></p>
    </div>`;

  // Prefer injecting into existing noscript; otherwise add before #root.
  if (/<noscript>[\s\S]*?<\/noscript>/i.test(html)) {
    return html.replace(
      /<noscript>[\s\S]*?<\/noscript>/i,
      `<noscript>${body}</noscript>`,
    );
  }
  return html.replace(
    '<div id="root"></div>',
    `<noscript>${body}</noscript>\n    <div id="root"></div>`,
  );
}

function applyRoute(html, route) {
  const url = absoluteUrl(route.path);
  let out = html;

  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(route.title)}</title>`);
  out = setMeta(out, 'name', 'description', route.description);
  if (route.keywords) {
    out = setMeta(out, 'name', 'keywords', route.keywords);
  }
  out = setMeta(out, 'property', 'og:title', route.title);
  out = setMeta(out, 'property', 'og:description', route.description);
  out = setMeta(out, 'property', 'og:url', url);
  out = setMeta(out, 'name', 'twitter:title', route.title);
  out = setMeta(out, 'name', 'twitter:description', route.description);
  out = setLink(out, 'canonical', url);

  // Honest hreflang: only real URL (no /es/ prefixes).
  out = out.replace(
    /<link rel="alternate" hreflang="en"[^>]*>/i,
    `<link rel="alternate" hreflang="en" href="${escapeHtml(url)}" />`,
  );
  out = out.replace(
    /<link rel="alternate" hreflang="x-default"[^>]*>/i,
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(url)}" />`,
  );

  const schemas = [organizationJsonLd()];
  if (route.path === '/') {
    schemas.push(softwareApplicationJsonLd());
  }
  out = injectJsonLd(out, schemas);
  out = injectNoscriptSeo(out, route);

  // Marker for ops/debugging.
  out = out.replace(
    '</head>',
    `    <meta name="bm-prerender" content="${escapeHtml(route.path)}" />\n  </head>`,
  );

  return out;
}

function writeRoute(route, html) {
  if (route.path === '/') {
    fs.writeFileSync(INDEX, html, 'utf8');
    return INDEX;
  }
  const dir = path.join(DIST, route.path.replace(/^\//, ''));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'index.html');
  fs.writeFileSync(file, html, 'utf8');
  return file;
}

function main() {
  if (!fs.existsSync(INDEX)) {
    console.error('[prerender] dist/index.html missing — run vite build first');
    process.exit(1);
  }

  const template = fs.readFileSync(INDEX, 'utf8');
  const written = [];

  for (const route of PRERENDER_ROUTES) {
    const html = applyRoute(template, route);
    written.push(writeRoute(route, html));
  }

  console.log(`[prerender] Wrote ${written.length} marketing HTML shells:`);
  for (const file of written) {
    console.log(`  - ${path.relative(process.cwd(), file)}`);
  }
}

main();
