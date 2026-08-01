/**
 * Verifies that every locale pack has the same keys — and the same legal-document
 * block structure — as the English base. Run with `node scripts/check-i18n-parity.mjs`.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const LOCALES = ['en', 'es', 'fr', 'de', 'ja', 'he', 'zh', 'ar', 'uk', 'ru'];
const ROOT = new URL('../src/locales/', import.meta.url).pathname;

function mergeDeep(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      mergeDeep(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function loadBundle(code) {
  const bundle = {};
  const baseFile = join(ROOT, `${code}.json`);
  if (existsSync(baseFile)) mergeDeep(bundle, JSON.parse(readFileSync(baseFile, 'utf8')));
  const dir = join(ROOT, code);
  if (existsSync(dir)) {
    for (const file of readdirSync(dir).filter((name) => name.endsWith('.json')).sort()) {
      mergeDeep(bundle, JSON.parse(readFileSync(join(dir, file), 'utf8')));
    }
  }
  return bundle;
}

function flatten(value, prefix = '', out = new Map()) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) flatten(child, prefix ? `${prefix}.${key}` : key, out);
  } else {
    out.set(prefix, value);
  }
  return out;
}

const bundles = Object.fromEntries(LOCALES.map((code) => [code, loadBundle(code)]));
const enKeys = flatten(bundles.en);
let problems = 0;

for (const code of LOCALES.filter((c) => c !== 'en')) {
  const keys = flatten(bundles[code]);

  for (const key of enKeys.keys()) {
    if (!keys.has(key)) {
      console.log(`[${code}] missing key: ${key}`);
      problems += 1;
    }
  }

  for (const [key, value] of keys) {
    const enValue = enKeys.get(key);
    if (enValue === undefined) continue;
    if (Array.isArray(enValue) !== Array.isArray(value)) {
      console.log(`[${code}] type mismatch: ${key}`);
      problems += 1;
    } else if (Array.isArray(enValue) && enValue.length !== value.length) {
      console.log(`[${code}] array length ${value.length} vs en ${enValue.length}: ${key}`);
      problems += 1;
    }
  }

  const enLegal = bundles.en.legal ?? {};
  const legal = bundles[code].legal ?? {};
  for (const [doc, content] of Object.entries(enLegal)) {
    if (!content || typeof content !== 'object' || !Array.isArray(content.body)) continue;
    const body = legal[doc]?.body;
    if (!Array.isArray(body)) continue;
    content.body.forEach((line, index) => {
      const enTag = line.split('|')[0];
      const tag = String(body[index] ?? '').split('|')[0];
      if (enTag !== tag) {
        console.log(`[${code}] legal.${doc}.body[${index}] tag "${tag}" should be "${enTag}"`);
        problems += 1;
      }
    });
  }
}

console.log(problems === 0 ? 'i18n parity OK' : `${problems} problem(s) found`);
process.exit(problems === 0 ? 0 : 1);
