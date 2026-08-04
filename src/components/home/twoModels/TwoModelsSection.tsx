import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmedState from './ConfirmedState';
import DiffersState from './DiffersState';
import {
  TWO_MODELS_DEFAULT_VIEW,
  type TwoModelsView,
} from './twoModelsDemoData';

interface Props {
  dark: boolean;
  onNavigate: (page: string, data?: string) => void;
}

function toggleClass(active: boolean, dark: boolean): string {
  const base =
    'rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2';
  if (active) {
    return `${base} ${
      dark
        ? 'bg-orange-500/15 text-orange-300'
        : 'bg-orange-50 text-orange-700'
    }`;
  }
  return `${base} ${
    dark
      ? 'text-neutral-400 hover:text-neutral-200'
      : 'text-neutral-600 hover:text-neutral-900'
  }`;
}

export default function TwoModelsSection({ dark, onNavigate }: Props) {
  const { t } = useTranslation();
  const [view, setView] = useState<TwoModelsView>(TWO_MODELS_DEFAULT_VIEW);
  const headingId = useId();
  const panelId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={`border-t px-4 py-14 sm:px-6 lg:px-8 lg:py-16 ${
        dark ? 'border-white/10' : 'border-neutral-200'
      }`}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="mx-auto mb-8 max-w-2xl text-center lg:mb-10">
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.32em] ${
              dark ? 'text-orange-400' : 'text-orange-600'
            }`}
          >
            {t('home.twoModels.eyebrow')}
          </p>
          <h2
            id={headingId}
            className={`mt-3 text-3xl font-semibold tracking-tight sm:text-4xl ${
              dark ? 'text-neutral-100' : 'text-neutral-900'
            }`}
          >
            {t('home.twoModels.headline')}
          </h2>
          <p
            className={`mx-auto mt-4 max-w-xl text-base leading-relaxed ${
              dark ? 'text-neutral-400' : 'text-neutral-600'
            }`}
          >
            {t('home.twoModels.subhead')}
          </p>
        </header>

        <div
          role="group"
          aria-label={t('home.twoModels.eyebrow')}
          className={`mx-auto mb-6 flex w-fit items-center gap-1 rounded-2xl border p-1 ${
            dark ? 'border-white/10 bg-white/[0.03]' : 'border-neutral-200 bg-neutral-50/80'
          }`}
        >
          <button
            type="button"
            aria-pressed={view === 'confirmed'}
            aria-controls={panelId}
            onClick={() => setView('confirmed')}
            className={toggleClass(view === 'confirmed', dark)}
          >
            {t('home.twoModels.toggle.most')}
          </button>
          <button
            type="button"
            aria-pressed={view === 'differs'}
            aria-controls={panelId}
            onClick={() => setView('differs')}
            className={toggleClass(view === 'differs', dark)}
          >
            {t('home.twoModels.toggle.rare')}
          </button>
        </div>

        <div id={panelId} className="mx-auto max-w-3xl">
          {view === 'confirmed' ? (
            <ConfirmedState dark={dark} />
          ) : (
            <DiffersState dark={dark} />
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => onNavigate('why-two-models')}
            className={`text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
              dark
                ? 'text-orange-400 hover:text-orange-300'
                : 'text-orange-600 hover:text-orange-700'
            }`}
          >
            {t('home.twoModels.cta')}
          </button>
        </div>
      </div>
    </section>
  );
}
