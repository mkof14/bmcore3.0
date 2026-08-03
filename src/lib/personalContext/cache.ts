import type { PersonalContext } from './types';

const SESSION_CACHE = new Map<string, { at: number; value: PersonalContext }>();
const TTL_MS = 30_000;

export function getCachedPersonalContext(userId: string): PersonalContext | null {
  const hit = SESSION_CACHE.get(userId);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) {
    SESSION_CACHE.delete(userId);
    return null;
  }
  return hit.value;
}

export function setCachedPersonalContext(userId: string, value: PersonalContext): void {
  SESSION_CACHE.set(userId, { at: Date.now(), value });
}

export function invalidatePersonalContextCache(userId?: string): void {
  if (userId) SESSION_CACHE.delete(userId);
  else SESSION_CACHE.clear();
}
