import { Trans, useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';
import { tList } from '../i18n/tList';

interface BiomathCoreSummaryProps {
  onNavigate: (page: string) => void;
}

type GuideItem = { title: string; body: string };
type FlowItem = { title: string; body: string };
type PlanItem = { name: string; focus: string };
type DataItem = { title: string; body: string };

export default function BiomathCoreSummary({ onNavigate }: BiomathCoreSummaryProps) {
  const { t } = useTranslation();

  const guideItems = tList<GuideItem>(t, 'summary.guide.items');
  const flowItems = tList<FlowItem>(t, 'summary.flow.items');
  const plans = tList<PlanItem>(t, 'summary.plans.items');
  const dataItems = tList<DataItem>(t, 'summary.data.items');

  return (
    <div className="min-h-screen bg-page text-gray-900 transition-colors dark:text-neutral-100">
      <div className="pt-20 pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <BackButton onNavigate={onNavigate} />

          <section className="border-b border-[var(--bm-border)] pb-12 pt-8 text-center lg:pb-14 lg:pt-10">
            <picture>
              <source srcSet="/logo-header.webp?v=2" type="image/webp" />
              <img
                src="/logo-header.png?v=2"
                alt={t('summary.logoAlt')}
                className="mx-auto mb-6 h-16 w-16"
                width={64}
                height={64}
              />
            </picture>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
              {t('summary.label')}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-[3.5rem] md:leading-[1.1]">
              <span className="text-orange-600 dark:text-orange-400">BioMath</span>{' '}
              <span className="text-gray-900 dark:text-neutral-100">Core</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg font-medium text-gray-900 dark:text-neutral-100 sm:text-xl">
              {t('summary.healthIntelligence')}
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('summary.healthIntelligenceSub')}
            </p>
          </section>

          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
              {t('summary.principle.label')}
            </p>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('summary.principle.title')}
            </h2>
            <div className="mt-6 max-w-3xl space-y-4 text-[15px] leading-relaxed text-gray-700 dark:text-neutral-300 sm:text-base">
              <p>
                <Trans
                  i18nKey="summary.principle.p1"
                  components={{
                    strong: (
                      <span className="font-medium text-gray-900 dark:text-neutral-100" />
                    ),
                  }}
                />
              </p>
              <p>{t('summary.principle.p2')}</p>
            </div>
          </section>

          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
              {t('summary.guide.label')}
            </p>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('summary.guide.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('summary.guide.lead')}
            </p>
            <ol className="mt-10 grid list-none gap-8 p-0 md:grid-cols-2 md:gap-x-12 md:gap-y-10">
              {guideItems.map((item, i) => (
                <li key={item.title} className="border-t border-[var(--bm-border)] pt-5">
                  <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
              {t('summary.flow.label')}
            </p>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('summary.flow.title')}
            </h2>
            <ol className="relative m-0 mt-10 list-none space-y-0 p-0">
              <div
                className="pointer-events-none absolute bottom-4 left-[0.35rem] top-3 w-px bg-[var(--bm-border)]"
                aria-hidden
              />
              {flowItems.map((item, i) => (
                <li key={item.title} className="relative flex gap-5 pb-10 last:pb-0">
                  <span
                    aria-hidden
                    className="relative z-10 mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                  />
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.22em] text-orange-600 dark:text-orange-400">
                      {String(i + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-neutral-100">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
              {t('summary.plans.label')}
            </p>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('summary.plans.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('summary.plans.body')}
            </p>
            <dl className="mt-10 grid gap-8 sm:grid-cols-3">
              {plans.map((plan) => (
                <div key={plan.name} className="border-t border-[var(--bm-border)] pt-5">
                  <dt className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
                    {plan.name}
                  </dt>
                  <dd className="mt-2 text-sm text-gray-600 dark:text-neutral-400">{plan.focus}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 max-w-3xl border-l-2 border-orange-500/70 pl-5 text-[15px] leading-relaxed text-gray-700 dark:border-orange-400/55 dark:text-neutral-300">
              {t('summary.plans.note')}
            </p>
          </section>

          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
              {t('summary.data.label')}
            </p>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('summary.data.title')}
            </h2>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              {dataItems.map((item) => (
                <article key={item.title} className="border-t border-[var(--bm-border)] pt-5">
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

          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
              {t('summary.position.label')}
            </p>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('summary.position.title')}
            </h2>
            <div className="mt-6 max-w-3xl space-y-4 text-[15px] leading-relaxed text-gray-700 dark:text-neutral-300 sm:text-base">
              <p>{t('summary.position.p1')}</p>
              <p>{t('summary.position.p2')}</p>
            </div>
            <blockquote className="mt-8 max-w-2xl border border-[var(--bm-border)] bg-[var(--bm-surface)] px-5 py-5 text-[15px] leading-relaxed text-gray-700 dark:text-neutral-300 sm:px-6">
              {t('summary.position.quote')}
            </blockquote>
          </section>

          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
              {t('summary.closing.label')}
            </p>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('summary.closing.title')}
            </h2>
            <div className="mt-6 max-w-3xl space-y-4 text-[15px] leading-relaxed text-gray-700 dark:text-neutral-300 sm:text-base">
              <p>{t('summary.closing.p1')}</p>
              <p>{t('summary.closing.p2')}</p>
            </div>
          </section>

          <section className="py-14 lg:py-16">
            <div className="border border-[var(--bm-border)] bg-[var(--bm-surface)] px-6 py-10 sm:px-10">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                {t('summary.explore.title')}
              </h2>
              <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="bm-cta-primary"
                >
                  {t('summary.explore.viewServices')}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('pricing')}
                  className="bm-link"
                >
                  {t('summary.explore.seePricing')}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('signup')}
                  className="bm-link"
                >
                  {t('summary.explore.getStarted')}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('summary-text')}
                  className="bm-link"
                >
                  {t('summary.explore.readSummary')}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
