import type { TFunction } from 'i18next';

/** Read an array value from a locale pack. Returns [] when the key is missing. */
export function tList<T>(t: TFunction, key: string): T[] {
  const value = t(key, { returnObjects: true }) as unknown;
  return Array.isArray(value) ? (value as T[]) : [];
}
