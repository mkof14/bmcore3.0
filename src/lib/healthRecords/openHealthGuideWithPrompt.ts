export const PENDING_HEALTH_GUIDE_PROMPT_KEY = 'bmcore.pendingHealthGuidePrompt';

/** Open floating Health Guide with an optional prefilled grounded prompt. */
export function openHealthGuideWithPrompt(prompt?: string): void {
  if (prompt?.trim()) {
    try {
      sessionStorage.setItem(PENDING_HEALTH_GUIDE_PROMPT_KEY, prompt.trim());
    } catch {
      /* ignore */
    }
  }
  window.dispatchEvent(new CustomEvent('open-ai-assistant'));
}

export function consumePendingHealthGuidePrompt(): string | null {
  try {
    const value = sessionStorage.getItem(PENDING_HEALTH_GUIDE_PROMPT_KEY);
    if (value) sessionStorage.removeItem(PENDING_HEALTH_GUIDE_PROMPT_KEY);
    return value;
  } catch {
    return null;
  }
}
