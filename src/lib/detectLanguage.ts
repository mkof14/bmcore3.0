import type { AppLanguage } from '../i18n/languages';
import { LANGUAGES, isAppLanguage } from '../i18n/languages';

const LATIN_HINTS: Record<Exclude<AppLanguage, 'ja' | 'zh' | 'he' | 'ar' | 'uk' | 'ru'>, string[]> = {
  en: [' the ', ' and ', ' you ', ' my ', ' is ', ' are ', ' with ', ' for ', ' have ', ' sleep', ' tired', ' energy'],
  es: [' el ', ' la ', ' de ', ' que ', ' y ', ' en ', ' los ', ' una ', ' sueño', ' cansado', ' energía', ' salud'],
  fr: [' le ', ' la ', ' de ', ' et ', ' les ', ' des ', ' une ', ' je ', ' sommeil', ' fatigué', ' énergie', ' santé'],
  de: [' der ', ' die ', ' und ', ' ich ', ' ist ', ' das ', ' ein ', ' nicht ', ' schlaf', ' müde', ' energie', ' gesundheit'],
};

/**
 * Detect conversation language from free text / speech transcript.
 * Falls back to `fallback` (usually the UI language).
 */
export function detectAppLanguage(text: string, fallback: AppLanguage = 'en'): AppLanguage {
  const sample = ` ${text.trim()} `;
  if (!sample.trim()) return fallback;

  if (/[\u0590-\u05FF]/.test(sample)) return 'he';
  if (/[\u0600-\u06FF]/.test(sample)) return 'ar';
  if (/[\u3040-\u30FF]/.test(sample)) return 'ja';
  if (/[\u4E00-\u9FFF]/.test(sample)) return 'zh';

  if (/[іїєґІЇЄҐ]/.test(sample)) return 'uk';
  if (/[а-яА-ЯёЁ]/.test(sample)) {
    // Ukrainian without special letters still often has these tokens
    const lower = sample.toLowerCase();
    if (/\b(що|як|або|також|здоров|втом|сон)\b/.test(lower)) return 'uk';
    return 'ru';
  }

  const lower = sample.toLowerCase();
  let best: AppLanguage = fallback;
  let bestScore = 0;

  (Object.keys(LATIN_HINTS) as Array<keyof typeof LATIN_HINTS>).forEach((code) => {
    const score = LATIN_HINTS[code].reduce(
      (sum, hint) => sum + (lower.includes(hint) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = code;
    }
  });

  if (bestScore === 0) return fallback;
  return best;
}

export function speechLangForAppLanguage(code: AppLanguage): string {
  return LANGUAGES.find((l) => l.code === code)?.speechLang ?? 'en-US';
}

export function resolveFallbackLanguage(uiLang: string): AppLanguage {
  return isAppLanguage(uiLang) ? uiLang : 'en';
}
