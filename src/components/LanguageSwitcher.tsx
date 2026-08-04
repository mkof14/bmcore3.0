import { useEffect, useRef, useState, startTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Loader2 } from 'lucide-react';
import {
  LANGUAGES,
  getLanguageMeta,
  isAppLanguage,
  type AppLanguage,
} from '../i18n/languages';
import { setAppLanguage } from '../i18n';

interface LanguageSwitcherProps {
  /** Placement hint for dropdown direction */
  variant?: 'header' | 'footer';
}

/** Short ISO-style codes shown beside the flag (language-neutral). */
function languageCodeLabel(code: AppLanguage): string {
  return code.toUpperCase();
}

export default function LanguageSwitcher({ variant = 'header' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<AppLanguage | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const switchSeq = useRef(0);

  const currentCode: AppLanguage = isAppLanguage(i18n.language)
    ? i18n.language
    : 'en';
  const current = getLanguageMeta(currentCode);
  const busy = pending !== null;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const select = (code: AppLanguage) => {
    if (code === currentCode || busy) {
      setOpen(false);
      return;
    }

    // Close immediately — never wait on locale I/O with the menu open.
    setOpen(false);
    setPending(code);
    const seq = ++switchSeq.current;

    startTransition(() => {
      void (async () => {
        try {
          await setAppLanguage(code);
        } finally {
          if (switchSeq.current === seq) setPending(null);
        }
      })();
    });
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => !busy && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-busy={busy}
        aria-label={busy ? t('nav.languageSwitching') : t('nav.language')}
        disabled={busy}
        className="inline-flex min-h-9 min-w-9 items-center gap-1.5 rounded-sm bg-transparent px-1.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-600 transition-colors hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bm-page)] disabled:cursor-wait disabled:opacity-70 dark:text-neutral-400 dark:hover:text-orange-400"
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" aria-hidden />
        ) : (
          <>
            <span aria-hidden className="text-base leading-none">
              {current.flag}
            </span>
            <span aria-hidden>{languageCodeLabel(currentCode)}</span>
          </>
        )}
        <ChevronDown
          className={`h-3 w-3 shrink-0 opacity-70 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
        <span className="sr-only">
          {busy ? t('nav.languageSwitching') : current.nativeLabel}
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('nav.language')}
          className={`absolute z-[60] mt-1.5 max-h-72 w-52 overflow-auto border border-[var(--bm-border)] bg-[var(--bm-surface)] py-1 shadow-lg ${
            variant === 'footer' ? 'bottom-full mb-1.5 mt-0 left-0' : 'right-0'
          }`}
        >
          {LANGUAGES.map((lang) => {
            const active = lang.code === currentCode;
            return (
              <li key={lang.code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => select(lang.code)}
                  disabled={busy}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500/40 disabled:opacity-60 ${
                    active
                      ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
                      : 'text-gray-800 hover:bg-page dark:text-neutral-100'
                  }`}
                >
                  <span aria-hidden className="text-base leading-none">
                    {lang.flag}
                  </span>
                  <span
                    aria-hidden
                    className="w-7 shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-neutral-500"
                  >
                    {languageCodeLabel(lang.code)}
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium">{lang.nativeLabel}</span>
                    <span className="block text-xs text-gray-500 dark:text-neutral-500">
                      {lang.label}
                    </span>
                  </span>
                  {active && (
                    <span
                      className="text-[10px] font-semibold text-orange-600 dark:text-orange-400"
                      aria-hidden
                    >
                      ✓
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
