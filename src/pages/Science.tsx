import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { tList } from '../i18n/tList';

type Pillar = { title: string; body: string };
type MathModel = { name: string; description: string; interpretation: string };
type PipelineStep = { title: string; body: string };
type ApproachItem = { title: string; body: string };

/** Notation is language-neutral and stays outside the locale packs. */
const EQUATIONS = ['dS/dt = α·I − β·R', 'M(t) = f(G, A, N, H)', 'I = Σ(wi · fi) + ge', 'E = E₀ + ΔS + ΔN − ΔW'];

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
      {children}
    </p>
  );
}

function SectionHeading({
  id,
  title,
  subtitle,
}: {
  id?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-10 max-w-2xl lg:mb-12">
      <h2
        id={id}
        className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl"
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-lg">
          {subtitle}
        </p>
      )}
    </header>
  );
}

export default function Science() {
  const { t } = useTranslation();

  const pillars = tList<Pillar>(t, 'science.pillars.items');
  const models = tList<MathModel>(t, 'science.models.items');
  const pipeline = tList<PipelineStep>(t, 'science.pipeline.items');
  const approach = tList<ApproachItem>(t, 'science.approach.items');
  const researchTopics = tList<string>(t, 'science.research.topics');

  return (
    <div className="min-h-screen bg-page transition-colors">
      <SEO
        title={t('science.seo.title')}
        description={t('science.seo.description')}
        keywords={[
          'biomathematics',
          'health modeling',
          'systems biology',
          'predictive analytics',
          'genomic analysis',
          'physiological dynamics',
          'computational biology',
        ]}
        url="/science"
      />

      <div className="pt-20 pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <section className="border-b border-[var(--bm-border)] pb-14 pt-8 lg:pb-16 lg:pt-10">
            <SectionLabel>{t('science.hero.label')}</SectionLabel>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-5xl md:text-[3.25rem] md:leading-[1.12]">
              {t('science.hero.title')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-lg">
              {t('science.hero.body')}
            </p>
          </section>

          {/* Pillars */}
          <section
            className="border-b border-[var(--bm-border)] py-14 lg:py-16"
            aria-labelledby="science-pillars"
          >
            <SectionLabel>{t('science.pillars.label')}</SectionLabel>
            <SectionHeading
              id="science-pillars"
              title={t('science.pillars.title')}
              subtitle={t('science.pillars.subtitle')}
            />

            <ol className="m-0 grid list-none gap-8 p-0 sm:gap-10 md:grid-cols-2 md:gap-x-12 md:gap-y-12">
              {pillars.map((pillar, i) => (
                <li key={pillar.title} className="border-t border-[var(--bm-border)] pt-5">
                  <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                    {pillar.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* Mathematical Models */}
          <section
            className="border-b border-[var(--bm-border)] py-14 lg:py-16"
            aria-labelledby="science-models"
          >
            <SectionLabel>{t('science.models.label')}</SectionLabel>
            <SectionHeading
              id="science-models"
              title={t('science.models.title')}
              subtitle={t('science.models.subtitle')}
            />

            <div className="space-y-0">
              {models.map((model, i) => (
                <article
                  key={model.name}
                  className="border-t border-[var(--bm-border)] py-8 first:border-t-0 first:pt-0"
                >
                  <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-neutral-100">
                    {model.name}
                  </h3>
                  <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-gray-700 dark:text-neutral-300">
                    {model.description}
                  </p>
                  <div className="mt-6 grid gap-6 md:grid-cols-2 md:gap-10">
                    <div className="border border-[var(--bm-border)] bg-[var(--bm-surface)] px-5 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-neutral-500">
                        {t('science.models.simplifiedForm')}
                      </p>
                      <code
                        dir="ltr"
                        className="mt-2 block font-mono text-base font-semibold text-gray-900 dark:text-neutral-100"
                      >
                        {EQUATIONS[i]}
                      </code>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-neutral-500">
                        {t('science.models.interpretationLabel')}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                        {model.interpretation}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Pipeline */}
          <section
            className="border-b border-[var(--bm-border)] py-14 lg:py-16"
            aria-labelledby="science-pipeline"
          >
            <SectionLabel>{t('science.pipeline.label')}</SectionLabel>
            <SectionHeading
              id="science-pipeline"
              title={t('science.pipeline.title')}
              subtitle={t('science.pipeline.subtitle')}
            />

            <div className="grid gap-10 md:grid-cols-3 md:gap-8">
              {pipeline.map((step, i) => (
                <article key={step.title}>
                  <span
                    aria-hidden
                    className="mb-4 block h-px w-8 bg-orange-500/70 dark:bg-orange-400/55"
                  />
                  <p className="mb-2 text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                    {step.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Why Biomathematics + Research */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <div className="grid gap-14 md:grid-cols-2 md:gap-12">
              <div>
                <SectionLabel>{t('science.approach.label')}</SectionLabel>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl">
                  {t('science.approach.title')}
                </h2>
                <ul className="mt-6 space-y-5">
                  {approach.map((item) => (
                    <li key={item.title} className="border-t border-[var(--bm-border)] pt-4">
                      <h3 className="font-semibold text-gray-900 dark:text-neutral-100">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                        {item.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <SectionLabel>{t('science.research.label')}</SectionLabel>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl">
                  {t('science.research.title')}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                  {t('science.research.body')}
                </p>
                <ul className="mt-6 space-y-3">
                  {researchTopics.map((topic) => (
                    <li key={topic} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                      />
                      <span className="text-sm leading-relaxed text-gray-700 dark:text-neutral-300">
                        {topic}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Closing */}
          <section className="py-14 lg:py-16">
            <div className="border border-[var(--bm-border)] bg-[var(--bm-surface)] px-6 py-12 text-center sm:px-10">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl">
                {t('science.closing.title')}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
                {t('science.closing.body')}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
