import { GitCompareArrows } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { twoModelsDemoData } from './twoModelsDemoData';

interface Props {
  dark: boolean;
}

export default function DiffersState({ dark }: Props) {
  const { t } = useTranslation();

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 ${
        dark
          ? 'border-white/10 bg-white/[0.03]'
          : 'border-neutral-200 bg-neutral-50/80'
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            dark
              ? 'bg-amber-500/15 text-amber-400'
              : 'bg-amber-50 text-amber-600'
          }`}
          aria-hidden
        >
          <GitCompareArrows className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className={`text-base font-semibold tracking-tight sm:text-lg ${
              dark ? 'text-neutral-100' : 'text-neutral-900'
            }`}
          >
            {t('home.twoModels.differs.title')}
          </h3>
          <p
            className={`mt-2 text-sm leading-relaxed ${
              dark ? 'text-neutral-300' : 'text-neutral-700'
            }`}
          >
            {t(twoModelsDemoData.differs.framingKey)}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {twoModelsDemoData.differs.columns.map((col) => (
              <article
                key={col.id}
                className={`rounded-2xl border p-4 ${
                  dark
                    ? 'border-white/10 bg-black/20'
                    : 'border-neutral-200 bg-white/70'
                }`}
              >
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
                    dark ? 'text-orange-400/90' : 'text-orange-600'
                  }`}
                >
                  {t(col.labelKey)}
                </p>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    dark ? 'text-neutral-300' : 'text-neutral-700'
                  }`}
                >
                  {t(col.reasoningKey)}
                </p>
              </article>
            ))}
          </div>

          <p
            className={`mt-4 text-xs leading-relaxed ${
              dark ? 'text-neutral-500' : 'text-neutral-500'
            }`}
          >
            {t('home.twoModels.differs.caption')}
          </p>
        </div>
      </div>
    </div>
  );
}
