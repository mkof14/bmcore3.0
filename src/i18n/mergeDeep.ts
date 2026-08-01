/** Deep-merge plain objects (locale JSON modules). Arrays are replaced, not concatenated. */
export function mergeDeep<T extends Record<string, unknown>>(
  ...parts: Array<Record<string, unknown> | undefined | null>
): T {
  const out: Record<string, unknown> = {};
  for (const part of parts) {
    if (!part) continue;
    for (const [key, value] of Object.entries(part)) {
      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        out[key] &&
        typeof out[key] === 'object' &&
        !Array.isArray(out[key])
      ) {
        out[key] = mergeDeep(
          out[key] as Record<string, unknown>,
          value as Record<string, unknown>,
        );
      } else {
        out[key] = value;
      }
    }
  }
  return out as T;
}
