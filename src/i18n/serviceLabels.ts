import type { TFunction } from 'i18next';

/**
 * Translated labels for the service catalog defined in `src/data/services.ts`.
 * IDs stay stable — only names and descriptions are localized, under the
 * `servicesData.*` keys shipped in `src/locales/{lang}/servicesCatalogData.json`.
 * The English value from the data file is used as fallback so a missing key
 * never surfaces a raw key path in the UI.
 */

function resolve(t: TFunction, key: string, fallback: string): string {
  const value = t(key, { defaultValue: fallback });
  return typeof value === 'string' && value && value !== key ? value : fallback;
}

export function tCategory(t: TFunction, categoryId: string, fallback = ''): string {
  return resolve(t, `servicesData.categories.${categoryId}.name`, fallback);
}

export function tCategoryDescription(t: TFunction, categoryId: string, fallback = ''): string {
  return resolve(t, `servicesData.categories.${categoryId}.description`, fallback);
}

export function tService(
  t: TFunction,
  categoryId: string,
  serviceId: string,
  fallback = '',
): string {
  return resolve(t, `servicesData.categories.${categoryId}.services.${serviceId}.name`, fallback);
}

export function tServiceDescription(
  t: TFunction,
  categoryId: string,
  serviceId: string,
  fallback = '',
): string {
  return resolve(
    t,
    `servicesData.categories.${categoryId}.services.${serviceId}.description`,
    fallback,
  );
}
