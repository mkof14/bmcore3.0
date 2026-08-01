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

const loadedLanguages = new Set<AppLanguage>();
const inflightLoads = new Map<AppLanguage, Promise<void>>();

function unwrapJson(mod: JsonModule | Record<string, unknown>): Record<string, unknown> {
  if (mod && typeof mod === 'object' && 'default' in mod && mod.default) {
    return mod.default as Record<string, unknown>;
  }
  return mod as Record<string, unknown>;
}

async function buildLanguageBundle(code: AppLanguage): Promise<Record<string, unknown>> {
  const baseMod = await baseLoaders[code]();
  const packLoaders = Object.values(packGlobs[code] || {});
  const packMods = await Promise.all(packLoaders.map((load) => load()));
  const packs = packMods.map(unwrapJson);
  return mergeDeep(unwrapJson(baseMod), ...packs);
}

/** Ensure a language bundle is registered with i18next (idempotent). */
export async function ensureLanguageLoaded(code: AppLanguage): Promise<void> {
  if (loadedLanguages.has(code)) return;

  const inflight = inflightLoads.get(code);
  if (inflight) {
    await inflight;
    return;
  }

  const promise = (async () => {
    const bundle = await buildLanguageBundle(code);
    if (!i18n.hasResourceBundle(code, 'translation')) {
      i18n.addResourceBundle(code, 'translation', bundle, true, true);
    }
    loadedLanguages.add(code);
  })();

  inflightLoads.set(code, promise);
  try {
    await promise;
  } finally {
    inflightLoads.delete(code);
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
        react: { useSuspense: false },
      });
    }

    const loads: Array<Promise<void>> = [ensureLanguageLoaded(lng)];
    if (lng !== DEFAULT_LANGUAGE) {
      loads.push(ensureLanguageLoaded(DEFAULT_LANGUAGE));
    }
    await Promise.all(loads);

    if (i18n.language !== lng) {
      await i18n.changeLanguage(lng);
    }

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

export async function setAppLanguage(code: AppLanguage) {
  const loads: Array<Promise<void>> = [ensureLanguageLoaded(code)];
  if (code !== DEFAULT_LANGUAGE) {
    loads.push(ensureLanguageLoaded(DEFAULT_LANGUAGE));
  }
  await Promise.all(loads);
  await i18n.changeLanguage(code);
}
