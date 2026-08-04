import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { twoModelsDemoData } from './twoModelsDemoData';

interface Props {
  dark: boolean;
}

export default function ConfirmedState({ dark }: Props) {
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
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-emerald-50 text-emerald-600'
          }`}
          aria-hidden
        >
          <Check className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <div className="min-w-0">
          <h3
            className={`text-base font-semibold tracking-tight sm:text-lg ${
              dark ? 'text-neutral-100' : 'text-neutral-900'
            }`}
          >
            {t('home.twoModels.confirmed.title')}
          </h3>
          <p
            className={`mt-2 text-sm leading-relaxed ${
              dark ? 'text-neutral-300' : 'text-neutral-700'
            }`}
          >
            {t(twoModelsDemoData.confirmed.bodyKey)}
          </p>
          <p
            className={`mt-3 text-xs leading-relaxed ${
              dark ? 'text-neutral-500' : 'text-neutral-500'
            }`}
          >
            {t('home.twoModels.confirmed.caption')}
          </p>
        </div>
      </div>
    </div>
  );
}
