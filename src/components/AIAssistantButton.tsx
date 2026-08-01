import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface AIAssistantButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export default function AIAssistantButton({ onClick, isOpen }: AIAssistantButtonProps) {
  const { t } = useTranslation();

  return (
    <div className="group fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6">
      <button
        type="button"
        onClick={onClick}
        className={`relative flex h-9 w-9 items-center justify-center overflow-hidden border transition-colors sm:h-10 sm:w-10 ${
          isOpen
            ? 'border-orange-500/50 bg-orange-500 text-white hover:bg-orange-400'
            : 'border-[var(--bm-border)] bg-[var(--bm-surface)] hover:border-orange-500/40'
        }`}
        aria-label={isOpen ? t('healthGuide.close') : t('healthGuide.open')}
      >
        {isOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <img
            src="/health-guide-avatar.webp"
            alt=""
            width={128}
            height={128}
            decoding="async"
            className="h-full w-full object-cover"
          />
        )}
        {!isOpen && (
          <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-[var(--bm-surface)]" />
        )}
      </button>

      {!isOpen && (
        <div className="pointer-events-none absolute bottom-12 right-0 hidden w-40 border border-[var(--bm-border)] bg-[var(--bm-surface)] px-2.5 py-1.5 opacity-0 shadow-md transition-opacity group-hover:opacity-100 sm:block">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
            {t('healthGuide.name')}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-gray-500 dark:text-neutral-400">
            {t('healthGuide.tooltipAsk')}
          </p>
        </div>
      )}
    </div>
  );
}
