import { readFileSync } from 'node:fs';

const LANGS = ['en', 'es', 'fr', 'de', 'ja', 'he', 'zh', 'ar', 'uk', 'ru'];
const PACKS = [
  'faq',
  'about',
  'pricing',
  'howItWorks',
  'investors',
  'partnership',
  'privacyTrust',
  'science',
  'services',
  'summary',
  'whyTwoModels',
];

function shape(value, prefix, out) {
  if (Array.isArray(value)) {
    out.push(`${prefix}[]:${value.length}`);
    value.forEach((entry, i) => shape(entry, `${prefix}[${i}]`, out));
    return out;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value).sort()) shape(value[key], `${prefix}.${key}`, out);
    return out;
  }
  out.push(prefix);
  return out;
}

function placeholders(value, found = new Set()) {
  if (typeof value === 'string') {
    for (const m of value.matchAll(/\{\{(\w+)\}\}|<(\/?[a-z0-9]+)>/g)) found.add(m[0]);
    return found;
  }
  if (Array.isArray(value)) {
    value.forEach((v) => placeholders(v, found));
    return found;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => placeholders(v, found));
  }
  return found;
}

let failures = 0;
for (const pack of PACKS) {
  const baseline = JSON.parse(readFileSync(`src/locales/en/${pack}.json`, 'utf8'));
  const baseShape = shape(baseline, '', []).join('\n');
  const baseTags = [...placeholders(baseline)].sort().join(' ');

  for (const lang of LANGS.slice(1)) {
    const data = JSON.parse(readFileSync(`src/locales/${lang}/${pack}.json`, 'utf8'));
    const langShape = shape(data, '', []).join('\n');
    if (langShape !== baseShape) {
      failures += 1;
      const a = baseShape.split('\n');
      const b = new Set(langShape.split('\n'));
      const missing = a.filter((k) => !b.has(k));
      const extra = langShape.split('\n').filter((k) => !new Set(a).has(k));
      console.log(`SHAPE MISMATCH ${lang}/${pack}.json`);
      if (missing.length) console.log('  missing:', missing.slice(0, 8));
      if (extra.length) console.log('  extra  :', extra.slice(0, 8));
    }
    const langTags = [...placeholders(data)].sort().join(' ');
    if (langTags !== baseTags) {
      failures += 1;
      console.log(`TAG MISMATCH ${lang}/${pack}.json`);
      console.log('  en  :', baseTags);
      console.log(`  ${lang}  :`, langTags);
    }
  }
}

console.log(failures === 0 ? 'OK: all packs match the English structure' : `FAILURES: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
