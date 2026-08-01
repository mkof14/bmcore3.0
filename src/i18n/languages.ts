export type AppLanguage =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'ja'
  | 'he'
  | 'zh'
  | 'ar'
  | 'uk'
  | 'ru';

export type LanguageMeta = {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  speechLang: string;
};

/** Base language is English. Order used in the language menu. */
export const LANGUAGES: LanguageMeta[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸', dir: 'ltr', speechLang: 'en-US' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸', dir: 'ltr', speechLang: 'es-ES' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷', dir: 'ltr', speechLang: 'fr-FR' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', flag: '🇩🇪', dir: 'ltr', speechLang: 'de-DE' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', flag: '🇯🇵', dir: 'ltr', speechLang: 'ja-JP' },
  { code: 'he', label: 'Hebrew', nativeLabel: 'עברית', flag: '🇮🇱', dir: 'rtl', speechLang: 'he-IL' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', flag: '🇨🇳', dir: 'ltr', speechLang: 'zh-CN' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', flag: '🇸🇦', dir: 'rtl', speechLang: 'ar-SA' },
  { code: 'uk', label: 'Ukrainian', nativeLabel: 'Українська', flag: '🇺🇦', dir: 'ltr', speechLang: 'uk-UA' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', flag: '🇷🇺', dir: 'ltr', speechLang: 'ru-RU' },
];

export const DEFAULT_LANGUAGE: AppLanguage = 'en';
export const LANGUAGE_STORAGE_KEY = 'bmcore-language';

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  return Boolean(value && LANGUAGES.some((lang) => lang.code === value));
}

export function getLanguageMeta(code: AppLanguage): LanguageMeta {
  return LANGUAGES.find((lang) => lang.code === code) ?? LANGUAGES[0];
}
