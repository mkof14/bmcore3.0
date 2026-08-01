import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';
import { tList } from '../i18n/tList';

interface NavigationProps {
  onNavigate: (page: string) => void;
}

type Commitment = { title: string; body: string };
type Policy = { title: string; description: string };
type Stat = { value: string; label: string };

const POLICY_PAGES = [
  'privacy-policy',
  'hipaa-notice',
  'gdpr',
  'security',
  'data-privacy',
  'trust-safety',
];

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
      {children}
    </p>
  );
}

export default function PrivacyTrust({ onNavigate }: NavigationProps) {
  const { t } = useTranslation();

  const commitments = tList<Commitment>(t, 'privacyTrust.commitments.items');
  const policies = tList<Policy>(t, 'privacyTrust.policies.items');
  const stats = tList<Stat>(t, 'privacyTrust.control.stats');

  return (
    <div className="min-h-screen bg-page transition-colors">
      <SEO
        title={t('privacyTrust.seo.title')}
        description={t('privacyTrust.seo.description')}
        keywords={[
          'biomath core privacy',
          'health data security',
          'HIPAA compliance',
          'GDPR health data',
          'data ownership',
        ]}
        page="privacy-trust"
      />

      <div className="pt-20 pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <BackButton onNavigate={onNavigate} />

          {/* Hero */}
          <section className="border-b border-[var(--bm-border)] pb-14 pt-8 lg:pb-16 lg:pt-10">
            <SectionLabel>{t('privacyTrust.hero.label')}</SectionLabel>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-5xl md:text-[3.25rem] md:leading-[1.12]">
              {t('privacyTrust.hero.title')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-lg">
              {t('privacyTrust.hero.body')}
            </p>
          </section>

          {/* Commitments */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('privacyTrust.commitments.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('privacyTrust.commitments.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('privacyTrust.commitments.body')}
            </p>

            <ol className="m-0 mt-10 grid list-none gap-8 p-0 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-10">
              {commitments.map((item, i) => (
                <li key={item.title} className="border-t border-[var(--bm-border)] pt-5">
                  <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* Policies */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('privacyTrust.policies.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('privacyTrust.policies.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('privacyTrust.policies.body')}
            </p>

            <div className="mt-10 grid gap-px overflow-hidden border border-[var(--bm-border)] bg-[var(--bm-border)] sm:grid-cols-2 lg:grid-cols-3">
              {policies.map((policy, i) => {
                const page = POLICY_PAGES[i];
                return (
                  <button
                    key={page ?? policy.title}
                    type="button"
                    onClick={() => page && onNavigate(page)}
                    className="bg-page px-6 py-7 text-left transition-colors hover:bg-[var(--bm-surface)] sm:px-7 sm:py-8 dark:bg-[var(--bm-page)]"
                  >
                    <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                      {policy.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                      {policy.description}
                    </p>
                    <span className="mt-4 inline-block text-sm font-semibold text-orange-700 transition-colors group-hover:text-orange-600 dark:text-orange-400">
                      {t('privacyTrust.policies.readMore')}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Data control stats */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('privacyTrust.control.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('privacyTrust.control.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('privacyTrust.control.body')}
            </p>

            <dl className="mt-10 grid gap-8 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="border-t border-[var(--bm-border)] pt-5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-neutral-500">
                    {stat.label}
                  </dt>
                  <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Contact */}
          <section className="py-14 lg:py-16">
            <div className="border border-[var(--bm-border)] bg-[var(--bm-surface)] px-6 py-12 sm:px-10">
              <SectionLabel>{t('privacyTrust.contact.label')}</SectionLabel>
              <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl">
                {t('privacyTrust.contact.title')}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
                {t('privacyTrust.contact.body')}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="mt-8 bg-orange-500 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
              >
                {t('privacyTrust.contact.cta')}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
