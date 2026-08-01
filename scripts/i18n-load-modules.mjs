/**
 * Dev helper: validate that every locales/{lang}/*.json pack exists for all languages.
 * Runtime loading is handled in src/i18n/index.ts via lazy import.meta.glob (per language).
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve('src/locales');
const langs = ['en', 'es', 'fr', 'de', 'ja', 'he', 'zh', 'ar', 'uk', 'ru'];
const packs = fs
  .readdirSync(path.join(root, 'en'))
  .filter((f) => f.endsWith('.json'))
  .sort();

let ok = true;
for (const lang of langs) {
  for (const pack of packs) {
    const p = path.join(root, lang, pack);
    if (!fs.existsSync(p)) {
      console.error('Missing', p);
      ok = false;
    }
  }
}
if (!ok) process.exit(1);
console.log(`OK: ${langs.length} langs × ${packs.length} packs`);
