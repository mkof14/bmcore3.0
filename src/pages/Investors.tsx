import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';
import PageHero from '../components/PageHero';
import { pageHeroUrl } from '../data/pageHeroes';
import SEO from '../components/SEO';
import { tList } from '../i18n/tList';

interface InvestorsProps {
  onNavigate: (page: string) => void;
}

type Partner = { title: string; body: string; offer: string };
type Stat = { label: string; value: string };
type TitledBody = { title: string; body: string };
type ModelItem = { title: string; points: string[] };
type MarketItem = { value: string; label: string };
type RoadmapItem = { year: string; title: string; body: string };

const LEGAL_PAGES = [
  'privacy-policy',
  'terms-of-service',
  'disclaimer',
  'hipaa-notice',
  'security',
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
      {children}
    </p>
  );
}

export default function Investors({ onNavigate }: InvestorsProps) {
  const { t } = useTranslation();

  const partners = tList<Partner>(t, 'investors.partners.items');
  const productStats = tList<Stat>(t, 'investors.traction.stats');
  const businessPoints = tList<TitledBody>(t, 'investors.traction.points');
  const tech = tList<TitledBody>(t, 'investors.technology.items');
  const model = tList<ModelItem>(t, 'investors.model.items');
  const market = tList<MarketItem>(t, 'investors.market.items');
  const roadmap = tList<RoadmapItem>(t, 'investors.roadmap.items');
  const engine = tList<TitledBody>(t, 'investors.engine.items');
  const timing = tList<TitledBody>(t, 'investors.timing.items');
  const legalLinks = tList<string>(t, 'investors.trust.links');

  return (
    <div className="min-h-screen bg-page text-gray-900 transition-colors dark:text-neutral-100">
      <SEO
        title={t('investors.seo.title')}
        description={t('investors.seo.description')}
        keywords={[
          'biomath core investors',
          'healthtech investment',
          'digital health',
          'AI health intelligence',
          'wellness analytics business',
        ]}
        url="/investors"
      />

      <div className="pt-16">
        <PageHero
          imageSrc={pageHeroUrl('investors')}
          label={t('investors.hero.label')}
          title={t('investors.hero.title')}
          subtitle={t('investors.hero.body')}
        >
          <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-neutral-200">
            {t('investors.hero.body2')}
          </p>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center justify-center border border-white/45 bg-transparent px-7 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-gray-900"
            >
              {t('investors.hero.ctaContact')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('biomath-core-summary')}
              className="text-sm font-medium text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {t('investors.hero.ctaSummary')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="text-sm font-medium text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {t('investors.hero.ctaAbout')}
            </button>
          </div>
        </PageHero>
      </div>

      <div className="pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <div className="pt-6">
            <BackButton onNavigate={onNavigate} />
          </div>

          {/* Partners */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('investors.partners.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('investors.partners.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('investors.partners.body')}
            </p>

            <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-x-12 md:gap-y-12">
              {partners.map((item, i) => (
                <article key={item.title} className="border-t border-[var(--bm-border)] pt-5">
                  <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-neutral-100">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                    {item.body}
                  </p>
                  <div className="mt-4 border-l-2 border-orange-500/60 pl-4 dark:border-orange-400/50">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-neutral-500">
                      {t('investors.partners.offerLabel')}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-700 dark:text-neutral-300">
                      {item.offer}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Traction */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('investors.traction.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('investors.traction.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('investors.traction.body')}
            </p>

            <div className="mt-10 grid gap-12 md:grid-cols-2 md:gap-14">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                  {t('investors.traction.productStatusTitle')}
                </h3>
                <dl className="mt-5 space-y-0">
                  {productStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-baseline justify-between gap-4 border-t border-[var(--bm-border)] py-4"
                    >
                      <dt className="text-sm text-gray-600 dark:text-neutral-400">{stat.label}</dt>
                      <dd className="text-right text-lg font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                  {t('investors.traction.businessModelTitle')}
                </h3>
                <ul className="mt-5 space-y-5">
                  {businessPoints.map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-neutral-100">{item.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                          {item.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Technology */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('investors.technology.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('investors.technology.title')}
            </h2>

            <ul className="mt-10 grid list-none gap-8 p-0 sm:grid-cols-2">
              {tech.map((item) => (
                <li key={item.title} className="border-t border-[var(--bm-border)] pt-5">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Business model */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('investors.model.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('investors.model.title')}
            </h2>

            <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
              {model.map((item, i) => (
                <article key={item.title}>
                  <span
                    aria-hidden
                    className="mb-4 block h-px w-8 bg-orange-500/70 dark:bg-orange-400/55"
                  />
                  <p className="mb-2 text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {item.title}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {item.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-600 dark:text-neutral-400"
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

          {/* Market */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('investors.market.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('investors.market.title')}
            </h2>

            <dl className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {market.map((item) => (
                <div key={item.label} className="border-t border-[var(--bm-border)] pt-5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-neutral-500">
                    {item.label}
                  </dt>
                  <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Roadmap */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('investors.roadmap.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('investors.roadmap.title')}
            </h2>

            <ol className="relative m-0 mt-10 list-none space-y-0 p-0">
              <div
                className="pointer-events-none absolute bottom-3 left-[0.35rem] top-3 w-px bg-[var(--bm-border)]"
                aria-hidden
              />
              {roadmap.map((item) => (
                <li key={item.year} className="relative flex gap-5 pb-10 last:pb-0">
                  <span
                    aria-hidden
                    className="relative z-10 mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                  />
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.22em] text-orange-600 dark:text-orange-400">
                      {item.year}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-neutral-100">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Engine + Why */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <div className="grid gap-14 md:grid-cols-2 md:gap-12">
              <div>
                <SectionLabel>{t('investors.engine.label')}</SectionLabel>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl">
                  {t('investors.engine.title')}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                  {t('investors.engine.body')}
                </p>
                <ul className="mt-6 space-y-4">
                  {engine.map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                      />
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-neutral-300">
                        <span className="font-medium text-gray-900 dark:text-neutral-100">
                          {item.title}:
                        </span>{' '}
                        {item.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <SectionLabel>{t('investors.timing.label')}</SectionLabel>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl">
                  {t('investors.timing.title')}
                </h2>
                <ul className="mt-6 space-y-5">
                  {timing.map((item) => (
                    <li key={item.title} className="border-t border-[var(--bm-border)] pt-4">
                      <h3 className="font-semibold text-gray-900 dark:text-neutral-100">{item.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                        {item.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Trust */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('investors.trust.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('investors.trust.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('investors.trust.body')}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {legalLinks.map((label, i) => {
                const page = LEGAL_PAGES[i];
                return (
                  <span key={page ?? label} className="inline-flex items-center gap-4">
                    {i > 0 && <span className="text-gray-300 dark:text-neutral-600">·</span>}
                    <button
                      type="button"
                      onClick={() => page && onNavigate(page)}
                      className="font-semibold text-orange-700 transition-colors hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                    >
                      {label}
                    </button>
                  </span>
                );
              })}
            </div>
          </section>

          {/* Closing CTA */}
          <section className="py-14 lg:py-16">
            <div className="border border-[var(--bm-border)] bg-[var(--bm-surface)] px-6 py-12 sm:px-10">
              <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl">
                {t('investors.closing.title')}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
                {t('investors.closing.body')}
              </p>
              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="bm-cta-primary"
                >
                  {t('investors.hero.ctaContact')}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('biomath-core-summary')}
                  className="bm-link"
                >
                  {t('investors.hero.ctaSummary')}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="bm-link"
                >
                  {t('investors.hero.ctaAbout')}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
