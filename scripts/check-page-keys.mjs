import { readFileSync } from 'node:fs';

const LANGS = ['en', 'es', 'fr', 'de', 'ja', 'he', 'zh', 'ar', 'uk', 'ru'];

const KEYS = [
  'faq.label', 'faq.heroTitle', 'faq.heroSubtitle', 'faq.seoTitle', 'faq.seoDescription',
  'faq.sections', 'faq.categoriesOrg.question', 'faq.categoriesOrg.answer',
  'faq.hdmQuestion', 'faq.categoryQuestion',
  'faq.catalogRef.title', 'faq.catalogRef.subtitle',
  'faq.cta.title', 'faq.cta.body', 'faq.cta.button',

  'about.label', 'about.title', 'about.subtitle', 'about.seoTitle', 'about.seoDescription',
  'about.mission.label', 'about.mission.title', 'about.mission.body',
  'about.origins.label', 'about.origins.title', 'about.origins.p1', 'about.origins.p2', 'about.origins.p3',
  'about.signalNote', 'about.stats',
  'about.team.label', 'about.team.title', 'about.team.subtitle',
  'about.team.p1', 'about.team.p2', 'about.team.quote', 'about.team.p3', 'about.team.p4',
  'about.engine.label', 'about.engine.title', 'about.engine.subtitle', 'about.engine.items',
  'about.philosophy.label', 'about.philosophy.title', 'about.philosophy.subtitle', 'about.philosophy.items',
  'about.highlights.label', 'about.highlights.title', 'about.highlights.subtitle', 'about.highlights.items',
  'about.audience.label', 'about.audience.title', 'about.audience.subtitle', 'about.audience.items',
  'about.cta.title', 'about.cta.description', 'about.cta.primary', 'about.cta.secondary',

  'pricing.label', 'pricing.title', 'pricing.subtitle', 'pricing.seoTitle', 'pricing.seoDescription',
  'pricing.monthly', 'pricing.yearly', 'pricing.mostPopular', 'pricing.getStarted',
  'pricing.perMonth', 'pricing.perYear', 'pricing.trialNote', 'pricing.paymentCancelled',
  'pricing.compare.label', 'pricing.compare.title', 'pricing.compare.featureColumn', 'pricing.compare.included',
  'pricing.testimonials.label', 'pricing.testimonials.title', 'pricing.testimonials.items',
  'pricing.why.label', 'pricing.why.title', 'pricing.why.items',
  'pricing.faq.label', 'pricing.faq.title', 'pricing.faq.items',
  'pricing.faq.moreTitle', 'pricing.faq.moreLink',
  'pricing.closing.title', 'pricing.closing.description',
  'pricing.closing.primary', 'pricing.closing.secondary', 'pricing.closing.note',
  'pricing.errors.title', 'pricing.errors.dismiss', 'pricing.errors.notAuthenticated',
  'pricing.errors.processingUnavailable', 'pricing.errors.notConfigured',
  'pricing.errors.configError', 'pricing.errors.checkoutFailed',
  ...['core', 'daily', 'max'].flatMap((p) =>
    ['name', 'description', 'categories', 'features'].map((f) => `pricing.plans.${p}.${f}`)),
  ...['basic', 'advanced', 'all20', 'n3', 'n10', 'gb10', 'gb50', 'gb200', 'monthly', 'daily',
    'realtime', 'email', 'priorityEmail', 'priority247', 'upTo2', 'upTo5', 'unlimited']
    .map((v) => `pricing.compare.values.${v}`),
  ...['dashboard', 'categories', 'storage', 'reports', 'support', 'encryption', 'devices',
    'assistant', 'labs', 'genetics', 'predictive', 'customReports', 'family', 'api']
    .map((r) => `pricing.compare.rows.${r}`),
];

function mergeDeep(...parts) {
  const out = {};
  for (const part of parts) {
    if (!part) continue;
    for (const [key, value] of Object.entries(part)) {
      const isPlain = (v) => v && typeof v === 'object' && !Array.isArray(v);
      out[key] = isPlain(value) && isPlain(out[key]) ? mergeDeep(out[key], value) : value;
    }
  }
  return out;
}

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const get = (obj, path) => path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);

let failures = 0;
for (const lang of LANGS) {
  const bundle = mergeDeep(
    read(`src/locales/${lang}.json`),
    read(`src/locales/${lang}/about.json`),
    read(`src/locales/${lang}/faq.json`),
    read(`src/locales/${lang}/pricing.json`)
  );
  const missing = KEYS.filter((k) => {
    const v = get(bundle, k);
    return v == null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && !v.length);
  });
  if (missing.length) {
    failures += missing.length;
    console.log(`${lang}: missing ${missing.length} ->`, missing.slice(0, 10));
  }
}

console.log(failures === 0 ? `OK: ${KEYS.length} keys resolve in all ${LANGS.length} languages` : `FAILURES: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
