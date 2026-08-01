import type { TFunction } from 'i18next';

type LocalizableCatalogItem = {
  id: string;
  name: string;
  description: string;
};

function translatedField(t: TFunction, key: string, fallback: string): string {
  const value = t(key, { defaultValue: fallback });
  return typeof value === 'string' ? value : fallback;
}

export function localizeCategory<T extends LocalizableCatalogItem>(
  t: TFunction,
  category: T,
): T {
  const key = `servicesData.categories.${category.id}`;
  return {
    ...category,
    name: translatedField(t, `${key}.name`, category.name),
    description: translatedField(t, `${key}.description`, category.description),
  };
}

export function localizeService<T extends LocalizableCatalogItem>(
  t: TFunction,
  categoryId: string,
  service: T,
): T {
  const key = `servicesData.categories.${categoryId}.services.${service.id}`;
  return {
    ...service,
    name: translatedField(t, `${key}.name`, service.name),
    description: translatedField(t, `${key}.description`, service.description),
  };
}
