import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  getLanguageMeta,
  isAppLanguage,
  type AppLanguage,
} from './languages';
import { mergeDeep } from './mergeDeep';

type JsonModule = { default: Record<string, unknown> };
type JsonLoader = () => Promise<JsonModule>;

/** Base chrome JSON per language — loaded on demand (not in the main chunk). */
const baseLoaders: Record<AppLanguage, JsonLoader> = {
  en: () => import('../locales/en.json'),
  es: () => import('../locales/es.json'),
  fr: () => import('../locales/fr.json'),
  de: () => import('../locales/de.json'),
  ja: () => import('../locales/ja.json'),
  he: () => import('../locales/he.json'),
  zh: () => import('../locales/zh.json'),
  ar: () => import('../locales/ar.json'),
  uk: () => import('../locales/uk.json'),
  ru: () => import('../locales/ru.json'),
};

/** Page packs per language — lazy glob (no eager:true). */
const packGlobs: Record<AppLanguage, Record<string, JsonLoader>> = {
  en: import.meta.glob('../locales/en/*.json') as Record<string, JsonLoader>,
  es: import.meta.glob('../locales/es/*.json') as Record<string, JsonLoader>,
  fr: import.meta.glob('../locales/fr/*.json') as Record<string, JsonLoader>,
  de: import.meta.glob('../locales/de/*.json') as Record<string, JsonLoader>,
  ja: import.meta.glob('../locales/ja/*.json') as Record<string, JsonLoader>,
  he: import.meta.glob('../locales/he/*.json') as Record<string, JsonLoader>,
  zh: import.meta.glob('../locales/zh/*.json') as Record<string, JsonLoader>,
  ar: import.meta.glob('../locales/ar/*.json') as Record<string, JsonLoader>,
  uk: import.meta.glob('../locales/uk/*.json') as Record<string, JsonLoader>,
  ru: import.meta.glob('../locales/ru/*.json') as Record<string, JsonLoader>,
};

/**
 * Packs needed for chrome + Member Zone to feel instant on language switch.
 * Remaining packs (legal, servicesData, faq, …) hydrate in the background.
 */
const PRIORITY_PACK_RE = /\/(chrome|member|pages|devices|catalog|reportTemplates)\.json$/;

const loadedLanguages = new Set<AppLanguage>();
const criticalLoaded = new Set<AppLanguage>();
const inflightLoads = new Map<string, Promise<void>>();

/** Bumps when the user picks another language so stale work is ignored. */
let languageSwitchGeneration = 0;

function unwrapJson(mod: JsonModule | Record<string, unknown>): Record<string, unknown> {
  if (mod && typeof mod === 'object' && 'default' in mod && mod.default) {
    return mod.default as Record<string, unknown>;
  }
  return mod as Record<string, unknown>;
}

function packEntries(
  code: AppLanguage,
  mode: 'priority' | 'remainder' | 'all',
): Array<[string, JsonLoader]> {
  const entries = Object.entries(packGlobs[code] || {});
  if (mode === 'all') return entries;
  if (mode === 'priority') {
    return entries.filter(([path]) => PRIORITY_PACK_RE.test(path));
  }
  return entries.filter(([path]) => !PRIORITY_PACK_RE.test(path));
}

/** Yield so the language menu / Member Zone stay responsive during heavy JSON work. */
function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

async function loadPackBundle(
  code: AppLanguage,
  mode: 'priority' | 'remainder' | 'all',
): Promise<Record<string, unknown>> {
  const loaders = packEntries(code, mode);
  const mods: Record<string, unknown>[] = [];
  // Batch to avoid saturating the main thread with 20+ JSON parses at once.
  const BATCH = 4;
  for (let i = 0; i < loaders.length; i += BATCH) {
    const slice = loaders.slice(i, i + BATCH);
    const batchMods = await Promise.all(slice.map(([, load]) => load()));
    for (const mod of batchMods) mods.push(unwrapJson(mod));
    if (i + BATCH < loaders.length) await yieldToMain();
  }
  return mergeDeep({}, ...mods);
}

async function registerBundle(code: AppLanguage, bundle: Record<string, unknown>) {
  i18n.addResourceBundle(code, 'translation', bundle, true, true);
}

/**
 * Load only base + priority packs so changeLanguage can run quickly.
 * Idempotent for the critical set.
 */
async function ensureCriticalLoaded(code: AppLanguage): Promise<void> {
  if (loadedLanguages.has(code) || criticalLoaded.has(code)) return;

  const key = `critical:${code}`;
  const inflight = inflightLoads.get(key);
  if (inflight) {
    await inflight;
    return;
  }

  const promise = (async () => {
    const baseMod = await baseLoaders[code]();
    await yieldToMain();
    const packs = await loadPackBundle(code, 'priority');
    await registerBundle(code, mergeDeep(unwrapJson(baseMod), packs));
    criticalLoaded.add(code);
  })();

  inflightLoads.set(key, promise);
  try {
    await promise;
  } finally {
    inflightLoads.delete(key);
  }
}

/** Ensure a language bundle is fully registered with i18next (idempotent). */
export async function ensureLanguageLoaded(code: AppLanguage): Promise<void> {
  if (loadedLanguages.has(code)) return;

  const key = `full:${code}`;
  const inflight = inflightLoads.get(key);
  if (inflight) {
    await inflight;
    return;
  }

  const promise = (async () => {
    // Prefer upgrading from critical rather than reloading base+priority.
    if (!criticalLoaded.has(code)) {
      await ensureCriticalLoaded(code);
    }
    const remainder = await loadPackBundle(code, 'remainder');
    if (Object.keys(remainder).length > 0) {
      await registerBundle(code, remainder);
    }
    loadedLanguages.add(code);
    criticalLoaded.add(code);
  })();

  inflightLoads.set(key, promise);
  try {
    await promise;
  } finally {
    inflightLoads.delete(key);
  }
}

export function readStoredLanguage(): AppLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isAppLanguage(stored)) return stored;
    const legacy = localStorage.getItem('language');
    if (isAppLanguage(legacy)) return legacy;
  } catch {
    // private mode / blocked storage
  }
  return DEFAULT_LANGUAGE;
}

export function applyDocumentLanguage(code: AppLanguage) {
  if (typeof document === 'undefined') return;
  const meta = getLanguageMeta(code);
  document.documentElement.lang = code;
  document.documentElement.dir = meta.dir;
}

let initPromise: Promise<typeof i18n> | null = null;

/**
 * Bootstrap i18n: load active language (+ English fallback) before first paint of UI strings.
 * Safe to call multiple times; subsequent calls share the same promise.
 */
export function initI18n(): Promise<typeof i18n> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const lng = readStoredLanguage();
    applyDocumentLanguage(lng);

    if (!i18n.isInitialized) {
      await i18n.use(initReactI18next).init({
        resources: {},
        lng,
        fallbackLng: DEFAULT_LANGUAGE,
        partialBundledLanguages: true,
        interpolation: { escapeValue: false },
        returnNull: false,
        react: {
          useSuspense: false,
          // Re-render when background packs arrive after a fast language switch.
          bindI18n: 'languageChanged loaded',
          bindI18nStore: 'added removed',
        },
      });
    }

    // Boot: critical first for fast first paint, then finish full packs.
    const criticalLoads: Array<Promise<void>> = [ensureCriticalLoaded(lng)];
    if (lng !== DEFAULT_LANGUAGE) {
      criticalLoads.push(ensureCriticalLoaded(DEFAULT_LANGUAGE));
    }
    await Promise.all(criticalLoads);

    if (i18n.language !== lng) {
      await i18n.changeLanguage(lng);
    }

    // Finish remaining packs without blocking first paint.
    void ensureLanguageLoaded(lng);
    if (lng !== DEFAULT_LANGUAGE) {
      void ensureLanguageLoaded(DEFAULT_LANGUAGE);
    }

    scheduleLanguagePrefetch(lng);

    return i18n;
  })();

  return initPromise;
}

i18n.on('languageChanged', (lng) => {
  const code = isAppLanguage(lng) ? lng : DEFAULT_LANGUAGE;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch {
    // ignore
  }
  applyDocumentLanguage(code);
});

export default i18n;

/**
 * Switch UI language without freezing the Member Zone.
 * Applies critical packs first, changes language immediately, then hydrates the rest.
 */
export async function setAppLanguage(code: AppLanguage) {
  const generation = ++languageSwitchGeneration;

  // Apply dir/lang early so the header feels responsive even before packs finish.
  applyDocumentLanguage(code);
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch {
    // ignore
  }

  if (!loadedLanguages.has(code)) {
    await ensureCriticalLoaded(code);
    if (generation !== languageSwitchGeneration) return;
  }

  // English fallback for missing keys — never block the switch on a cold en load.
  if (code !== DEFAULT_LANGUAGE && !criticalLoaded.has(DEFAULT_LANGUAGE) && !loadedLanguages.has(DEFAULT_LANGUAGE)) {
    void ensureCriticalLoaded(DEFAULT_LANGUAGE).then(() => ensureLanguageLoaded(DEFAULT_LANGUAGE));
  }

  if (generation !== languageSwitchGeneration) return;
  await i18n.changeLanguage(code);

  // Background: finish large packs (legal, servicesData, …) without blocking UI.
  if (!loadedLanguages.has(code)) {
    void ensureLanguageLoaded(code);
  }

  scheduleLanguagePrefetch(code);
}

/** Warm nearby languages in idle time so the next switch is instant. */
function scheduleLanguagePrefetch(active: AppLanguage) {
  if (typeof window === 'undefined') return;
  const others = (
    ['en', 'ru', 'es', 'uk', 'de', 'fr', 'he', 'ar', 'ja', 'zh'] as AppLanguage[]
  ).filter((code) => code !== active && !loadedLanguages.has(code) && !criticalLoaded.has(code));

  const run = () => {
    const next = others.shift();
    if (!next) return;
    void ensureCriticalLoaded(next).finally(() => {
      if (others.length === 0) return;
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(() => run(), { timeout: 4000 });
      } else {
        setTimeout(run, 800);
      }
    });
  };

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => run(), { timeout: 5000 });
  } else {
    setTimeout(run, 1200);
  }
}
