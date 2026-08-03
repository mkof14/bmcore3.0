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
  /** Compact control for header; fuller label for footer */
  variant?: 'header' | 'footer';
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
        className={`inline-flex items-center gap-2 rounded-md border border-[var(--bm-border)] bg-[var(--bm-surface)] text-sm font-medium text-gray-800 transition-colors hover:border-orange-500/40 dark:text-neutral-100 disabled:cursor-wait disabled:opacity-70 ${
          variant === 'footer' ? 'px-3 py-2' : 'px-2.5 py-1.5'
        }`}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin text-orange-500" aria-hidden />
        ) : (
          <span aria-hidden className="text-base leading-none">
            {current.flag}
          </span>
        )}
        <span className={variant === 'header' ? 'hidden sm:inline' : undefined}>
          {busy ? t('nav.languageSwitching') : current.nativeLabel}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-500 transition-transform dark:text-neutral-400 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('nav.language')}
          className={`absolute z-[60] mt-2 max-h-72 w-56 overflow-auto border border-[var(--bm-border)] bg-[var(--bm-surface)] py-1 shadow-lg ${
            variant === 'footer' ? 'bottom-full mb-2 mt-0 left-0' : 'right-0'
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
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors disabled:opacity-60 ${
                    active
                      ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
                      : 'text-gray-800 hover:bg-page dark:text-neutral-100'
                  }`}
                >
                  <span aria-hidden className="text-base leading-none">
                    {lang.flag}
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium">{lang.nativeLabel}</span>
                    <span className="block text-xs text-gray-500 dark:text-neutral-500">
                      {lang.label}
                    </span>
                  </span>
                  {active && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
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
