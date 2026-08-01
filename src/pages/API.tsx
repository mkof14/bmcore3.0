import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';

interface APIProps {
  onNavigate: (page: string) => void;
}

const ENDPOINTS = [
  { method: 'GET', path: '/api/v1/user/profile', key: 'profile' },
  { method: 'GET', path: '/api/v1/user/metrics', key: 'metrics' },
  { method: 'GET', path: '/api/v1/user/insights', key: 'insights' },
  { method: 'POST', path: '/api/v1/data/sync', key: 'sync' },
  { method: 'GET', path: '/api/v1/predictions', key: 'predictions' },
  { method: 'GET', path: '/api/v1/reports', key: 'reports' },
];

const FEATURES = [
  { index: '01', key: 'auth' },
  { index: '02', key: 'rest' },
  { index: '03', key: 'security' },
  { index: '04', key: 'webhooks' },
];

const USE_CASES = [
  'insurance',
  'apps',
  'research',
  'corporate',
  'fitness',
  'clinical',
] as const;

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
      {children}
    </p>
  );
}

export default function API({ onNavigate }: APIProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-page text-gray-900 transition-colors dark:text-neutral-100">
      <SEO
        title={t('apiPage.seoTitle')}
        description={t('apiPage.seoDescription')}
        keywords={[
          'biomath core api',
          'health data api',
          'wellness api integration',
          'developer health api',
          'biomathematics api',
        ]}
        url="/api"
      />

      <div className="pt-20 pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <BackButton onNavigate={onNavigate} />

          {/* Hero */}
          <section className="border-b border-[var(--bm-border)] pb-12 pt-8 lg:pb-14 lg:pt-10">
            <SectionLabel>{t('apiPage.label')}</SectionLabel>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-5xl md:text-[3.25rem] md:leading-[1.12]">
              {t('apiPage.heroTitle')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-lg">
              {t('apiPage.heroSubtitle')}
            </p>
          </section>

          {/* Features */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('apiPage.capabilitiesLabel')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('apiPage.capabilitiesTitle')}
            </h2>

            <ol className="m-0 mt-10 grid list-none gap-8 p-0 sm:gap-10 md:grid-cols-2 md:gap-x-12 md:gap-y-12">
              {FEATURES.map((item) => (
                <li key={item.index} className="border-t border-[var(--bm-border)] pt-5">
                  <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {item.index}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {t(`apiPage.features.${item.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                    {t(`apiPage.features.${item.key}.body`)}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* Endpoints */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('apiPage.endpointsLabel')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('apiPage.endpointsTitle')}
            </h2>

            <div className="mt-10 space-y-0 border border-[var(--bm-border)] bg-[var(--bm-surface)]">
              {ENDPOINTS.map((endpoint, index) => (
                <div
                  key={endpoint.path}
                  className={`flex flex-col gap-3 px-5 py-5 sm:px-6 md:flex-row md:items-center md:gap-6 ${
                    index < ENDPOINTS.length - 1 ? 'border-b border-[var(--bm-border)]' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                        endpoint.method === 'GET'
                          ? 'bg-page text-gray-700 dark:text-neutral-300'
                          : 'bg-orange-500/10 text-orange-700 dark:text-orange-400'
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="font-mono text-sm text-gray-900 dark:text-neutral-100">
                      {endpoint.path}
                    </code>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-neutral-400 md:flex-1">
                    {t(`apiPage.endpoints.${endpoint.key}`)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Quick start */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('apiPage.quickStartLabel')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('apiPage.quickStartTitle')}
            </h2>

            <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-12">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                  {t('apiPage.authTitle')}
                </h3>
                <div className="mt-4 overflow-x-auto border border-[var(--bm-border)] bg-gray-900 px-5 py-5 dark:bg-[var(--bm-page)]">
                  <pre className="text-sm text-gray-100">
                    <code>{`curl -X GET \\
  https://api.biomathcore.com/v1/user/metrics \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
                  </pre>
                </div>
                <ul className="mt-6 space-y-3">
                  {stringList(t('apiPage.authSteps', { returnObjects: true })).map((step) => (
                    <li key={step} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                      />
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-neutral-300">
                        {step}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                  {t('apiPage.exampleTitle')}
                </h3>
                <div className="mt-4 overflow-x-auto border border-[var(--bm-border)] bg-gray-900 px-5 py-5 dark:bg-[var(--bm-page)]">
                  <pre className="text-sm text-gray-100">
                    <code>{`{
  "user_id": "usr_12345",
  "timestamp": "2025-10-19T10:30:00Z",
  "metrics": {
    "overall_wellness": 78,
    "stress_level": 45,
    "recovery_score": 82,
    "energy_availability": 71,
    "inflammatory_load": 32
  },
  "insights": [
    "Recovery is strong today",
    "Consider light activity"
  ]
}`}</code>
                  </pre>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="mt-6 w-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
                >
                  {t('apiPage.requestAccess')}
                </button>
              </div>
            </div>
          </section>

          {/* Use cases */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('apiPage.useCasesLabel')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('apiPage.useCasesTitle')}
            </h2>

            <ul className="mt-10 grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {USE_CASES.map((item) => (
                <li key={item} className="border-t border-[var(--bm-border)] pt-5">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                    {t(`apiPage.useCases.${item}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                    {t(`apiPage.useCases.${item}.body`)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Closing CTA */}
          <section className="py-14 lg:py-16">
            <div className="border border-[var(--bm-border)] bg-[var(--bm-surface)] px-6 py-12 sm:px-10">
              <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl">
                {t('apiPage.ctaTitle')}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
                {t('apiPage.ctaBody')}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="bg-orange-500 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
                >
                  {t('apiPage.contactSales')}
                </button>
                <button
                  type="button"
                  className="border border-[var(--bm-border)] bg-page px-7 py-3.5 text-sm font-semibold text-gray-900 transition-colors hover:border-orange-500/40 dark:text-neutral-100"
                >
                  {t('apiPage.viewDocs')}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
