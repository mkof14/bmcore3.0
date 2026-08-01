/** Natural-sounding browser TTS helpers for Health Guide — native voice only. */

/** Preferred native voice names by BCP-47 base language. */
const NATIVE_VOICE_PREFERENCE: Record<string, string[]> = {
  en: [
    'google us english',
    'microsoft aria',
    'microsoft jenny',
    'samantha',
    'karen',
    'moira',
    'ava',
    'allison',
    'zoe',
  ],
  es: ['google español', 'microsoft elvira', 'microsoft sabina', 'paulina', 'monica', 'jorge'],
  fr: ['google français', 'microsoft denise', 'microsoft hortense', 'thomas', 'amelie', 'aurelie'],
  de: ['google deutsch', 'microsoft katja', 'microsoft hedda', 'anna', 'petra'],
  ja: ['google 日本語', 'kyoko', 'otoiya', 'microsoft nanami', 'microsoft haruka'],
  he: ['microsoft avri', 'carmit', 'microsoft hila'],
  zh: ['google 普通话', 'ting-ting', 'meijia', 'sin-ji', 'microsoft xiaoxiao', 'microsoft xiaoyi'],
  ar: ['microsoft naayf', 'tarik', 'maged', 'microsoft salma', 'microsoft zariyah'],
  uk: ['microsoft ostap', 'microsoft polina', 'lesya'],
  ru: ['milena', 'microsoft irina', 'microsoft svetlana', 'yuri', 'katya', 'google русский'],
};

const NATURAL_TOKENS = [
  'neural',
  'natural',
  'premium',
  'enhanced',
  'online',
  'wavenet',
  'studio',
  'generative',
  'super',
];

const ROBOTIC_TOKENS = [
  'compact',
  'espeak',
  'dummy',
  'robot',
  'microsoft david',
  'microsoft mark',
  'microsoft sam',
  'fred',
  'whisper',
];

function scoreNativeVoice(voice: SpeechSynthesisVoice, lang: string): number {
  const name = voice.name.toLowerCase();
  const base = lang.split('-')[0].toLowerCase();
  const voiceLang = voice.lang.toLowerCase();
  let score = 0;

  // Hard preference: exact locale, then same language family only.
  if (voiceLang === lang.toLowerCase()) score += 80;
  else if (voiceLang.startsWith(`${base}-`) || voiceLang === base) score += 55;
  else return -1000;

  if (NATURAL_TOKENS.some((token) => name.includes(token))) score += 100;
  if (name.includes('google')) score += 75;

  const preferred = NATIVE_VOICE_PREFERENCE[base] ?? [];
  preferred.forEach((hint, index) => {
    if (name.includes(hint)) score += 70 - index;
  });

  if (voice.localService) score += 8;
  if (ROBOTIC_TOKENS.some((token) => name.includes(token))) score -= 140;
  if (/(female|woman|aria|jenny|samantha|irina|milena|elvira|denise|katja|kyoko|xiaoxiao)/i.test(voice.name)) {
    score += 15;
  }

  return score;
}

/** Pick a native voice for `lang`. Never returns a foreign-accent voice. */
export function pickNaturalVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const base = lang.split('-')[0].toLowerCase();
  const native = voices.filter((v) => v.lang.toLowerCase().startsWith(base));
  if (!native.length) return null;

  return [...native].sort((a, b) => scoreNativeVoice(b, lang) - scoreNativeVoice(a, lang))[0] ?? null;
}

/** Clean assistant copy into spoken sentences (less robotic than raw bullets). */
export function toSpokenScript(text: string): string {
  const cleaned = text
    .replace(/[📊🎯•●▪︎]/g, '')
    .replace(/\*\*/g, '')
    .replace(/Tip:.*$/gim, '')
    .replace(/Consejo:.*$/gim, '')
    .replace(/Astuce\s*:.*$/gim, '')
    .replace(/Tipp:.*$/gim, '')
    .replace(/Подсказка:.*$/gim, '')
    .replace(/Порада:.*$/gim, '')
    .replace(/نصيحة:.*$/gim, '')
    .replace(/טיפ:.*$/gim, '')
    .replace(/ヒント：.*$/gim, '')
    .replace(/提示：.*$/gim, '')
    .replace(/\n+/g, '. ')
    .replace(/\s*[-–—]\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/\.(\s*\.)+/g, '.')
    .trim();

  if (!cleaned) return '';

  const sentences = cleaned
    .split(/(?<=[.!?。！？…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const picked: string[] = [];
  let total = 0;
  for (const sentence of sentences) {
    if (total + sentence.length > 380 && picked.length >= 2) break;
    picked.push(sentence);
    total += sentence.length;
    if (picked.length >= 4) break;
  }

  return picked.join(' ').trim();
}

function splitChunks(script: string): string[] {
  const parts = script
    .split(/(?<=[.!?。！？…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!parts.length) return script ? [script] : [];

  const chunks: string[] = [];
  let buf = '';
  for (const part of parts) {
    if ((buf + ' ' + part).trim().length > 160 && buf) {
      chunks.push(buf.trim());
      buf = part;
    } else {
      buf = buf ? `${buf} ${part}` : part;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

export type SpeakOptions = {
  lang: string;
  muted?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
};

let activeGeneration = 0;

export function cancelHealthGuideSpeech() {
  activeGeneration += 1;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speak with a native-language system voice only (no foreign accents).
 */
export function speakNaturally(text: string, options: SpeakOptions): void {
  if (options.muted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onEnd?.();
    return;
  }

  const script = toSpokenScript(text);
  if (!script) {
    options.onEnd?.();
    return;
  }

  const generation = ++activeGeneration;
  window.speechSynthesis.cancel();

  try {
    window.speechSynthesis.resume();
  } catch {
    /* ignore */
  }

  const voice = pickNaturalVoice(options.lang);
  const chunks = splitChunks(script);
  let index = 0;
  let started = false;

  const speakNext = () => {
    if (generation !== activeGeneration) return;
    if (index >= chunks.length) {
      options.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    index += 1;
    utterance.lang = options.lang;
    // Slightly slower + softer pitch reads more human on most OS voices.
    utterance.rate = 0.9;
    utterance.pitch = 0.96;
    utterance.volume = 1;
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || options.lang;
    }

    utterance.onstart = () => {
      if (!started) {
        started = true;
        options.onStart?.();
      }
    };
    utterance.onerror = () => {
      if (generation !== activeGeneration) return;
      options.onEnd?.();
    };
    utterance.onend = () => {
      if (generation !== activeGeneration) return;
      window.setTimeout(speakNext, 140);
    };

    window.speechSynthesis.speak(utterance);
  };

  window.setTimeout(speakNext, 60);
}

export function warmUpSpeechVoices(): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return () => undefined;
  }
  const synth = window.speechSynthesis;
  const touch = () => {
    void synth.getVoices();
  };
  touch();
  synth.addEventListener('voiceschanged', touch);
  return () => synth.removeEventListener('voiceschanged', touch);
}
