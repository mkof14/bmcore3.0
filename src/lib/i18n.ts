/**
 * @deprecated Use `src/i18n` + `react-i18next` (`useTranslation` / `t`).
 * Kept as a thin re-export so older imports keep working during migration.
 */
export { default } from '../i18n';
export { setAppLanguage as setLanguage } from '../i18n';
export { DEFAULT_LANGUAGE, LANGUAGES, type AppLanguage } from '../i18n/languages';

import i18n from '../i18n';

export function getLanguage() {
  return i18n.language;
}

export function t(key: string) {
  return i18n.t(key);
}
