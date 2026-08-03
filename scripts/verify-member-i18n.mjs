#!/usr/bin/env node
/** Count sameAsEn values under member namespaces (excluding allowlist). */
import { readFileSync } from 'fs';
import { join } from 'path';

const localesDir = join(process.cwd(), 'src/locales');
const en = JSON.parse(readFileSync(join(localesDir, 'en/member.json'), 'utf8')).member;

const NAMESPACES = [
  'dashboard', 'common', 'reports', 'medicalFiles', 'blackBox', 'billing',
  'profile', 'reportSettings', 'support', 'healthGuide', 'signalHub',
  'reminders', 'secondOpinion', 'system', 'referral', 'devices',
];

const ALLOWLIST = new Set([
  'Health Guide', 'Demo', 'PDF', 'Normal', 'Email', 'Status', 'Plan',
  'Human Data Model', 'Apple Watch', 'Fitbit', 'Oura', 'Oura Ring',
  'WHOOP', 'Garmin', 'Black Box', 'BioMath Core', 'AES-256-GCM', 'HIPAA',
  'GDPR', 'EST', 'Pro', 'Basic', 'Core', 'Daily', 'Max', 'URL', 'O+',
  'N/A', 'Chat', 'Coaching', 'Black Box Storage', 'CGM (Dexcom/Libre)',
  '2', '85%', '78%',
]);

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, key));
    else out[key] = v;
  }
  return out;
}

const enFlat = flatten(en);

function isAllowed(val, key) {
  if (!val || typeof val !== 'string') return true;
  if (ALLOWLIST.has(val)) return true;
  if (key.includes('deviceTypes.')) return true;
  if (/^[A-Z]{2,3}$/.test(val)) return true;
  if (/^https?:\/\//.test(val)) return true;
  if (/^[0-9+\-().\s%$]+$/.test(val)) return true;
  return false;
}

export function countSameAsEn(lang) {
  const data = JSON.parse(readFileSync(join(localesDir, lang, 'member.json'), 'utf8')).member;
  const flat = flatten(data);
  let same = 0;
  let total = 0;
  const samples = [];
  for (const [k, enVal] of Object.entries(enFlat)) {
    const ns = k.split('.')[0];
    if (!NAMESPACES.includes(ns)) continue;
    total++;
    const locVal = flat[k];
    if (locVal === enVal && !isAllowed(enVal, k)) {
      same++;
      if (samples.length < 8) samples.push(`${k}: ${enVal}`);
    }
  }
  return { same, total, samples };
}

const langs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['ja', 'he', 'zh', 'ar', 'uk', 'ru', 'es', 'fr', 'de'];

for (const lang of langs) {
  const r = countSameAsEn(lang);
  console.log(`${lang}: ${r.same} sameAsEn / ${r.total} keys`);
  if (r.samples.length) console.log(`  samples: ${r.samples.join(' | ')}`);
}
