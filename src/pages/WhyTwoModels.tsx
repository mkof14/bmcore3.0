import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { tList } from '../i18n/tList';

type ModelItem = { title: string; body: string; points: string[] };
type AdvantageItem = { title: string; body: string };

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
      {children}
    </p>
  );
}

function stepIndex(position: number) {
  return String(position + 1).padStart(2, '0');
}

export default function WhyTwoModels() {
  const { t } = useTranslation();

  const models = tList<ModelItem>(t, 'whyTwoModels.models.items');
  const advantages = tList<AdvantageItem>(t, 'whyTwoModels.advantages.items');
  const mathStrengths = tList<string>(t, 'whyTwoModels.secondOpinion.mathStrengths');
  const clinicalStrengths = tList<string>(t, 'whyTwoModels.secondOpinion.clinicalStrengths');

  return (
    <div className="min-h-screen bg-page transition-colors">
      <SEO
        title={t('whyTwoModels.seo.title')}
        description={t('whyTwoModels.seo.description')}
        keywords={[
          'dual health models',
          'biomathematical analysis',
          'clinical health model',
          'second opinion health',
          'explainable health insights',
        ]}
        page="why-two-models"
      />

      <div className="pt-20 pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <section className="border-b border-[var(--bm-border)] pb-14 pt-8 lg:pb-16 lg:pt-10">
            <SectionLabel>{t('whyTwoModels.hero.label')}</SectionLabel>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-5xl md:text-[3.25rem] md:leading-[1.12]">
              {t('whyTwoModels.hero.title')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-lg">
              {t('whyTwoModels.hero.body')}
            </p>
          </section>

          {/* The two models */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('whyTwoModels.models.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('whyTwoModels.models.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('whyTwoModels.models.body')}
            </p>

            <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-12">
              {models.map((item, i) => (
                <article
                  key={item.title}
                  className="border border-[var(--bm-border)] bg-[var(--bm-surface)] p-6 sm:p-8"
                >
                  <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {stepIndex(i)}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-neutral-100">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                    {item.body}
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {item.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700 dark:text-neutral-300"
                      >
                        <span
                          aria-hidden
                          className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          {/* Advantages */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('whyTwoModels.advantages.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('whyTwoModels.advantages.title')}
            </h2>

            <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
              {advantages.map((item, i) => (
                <article key={item.title}>
                  <span
                    aria-hidden
                    className="mb-4 block h-px w-8 bg-orange-500/70 dark:bg-orange-400/55"
                  />
                  <p className="mb-2 text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {stepIndex(i)}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Second opinion */}
          <section className="py-14 lg:py-16">
            <div className="border border-[var(--bm-border)] bg-[var(--bm-surface)] px-6 py-10 sm:px-10 sm:py-12">
              <SectionLabel>{t('whyTwoModels.secondOpinion.label')}</SectionLabel>
              <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl">
                {t('whyTwoModels.secondOpinion.title')}
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-700 dark:text-neutral-300">
                {t('whyTwoModels.secondOpinion.body')}
              </p>

              <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-12">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                    {t('whyTwoModels.secondOpinion.mathTitle')}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {mathStrengths.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-600 dark:text-neutral-400"
                      >
                        <span
                          aria-hidden
                          className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                    {t('whyTwoModels.secondOpinion.clinicalTitle')}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {clinicalStrengths.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-600 dark:text-neutral-400"
                      >
                        <span
                          aria-hidden
                          className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
