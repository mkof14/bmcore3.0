import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';
import PageHero from '../components/PageHero';
import { pageHeroUrl } from '../data/pageHeroes';
import SEO from '../components/SEO';
import CTASection from '../components/CTASection';

interface AboutProps {
  onNavigate: (page: string) => void;
}

type StatEntry = { label: string; value: string };
type IndexedEntry = { index: string; title: string; body: string };
type TitledEntry = { title: string; body: string };

const EXTERNAL_LINK_CLASS =
  'font-medium text-orange-700 underline decoration-orange-700/30 underline-offset-2 transition-colors hover:text-orange-600 dark:text-orange-400 dark:decoration-orange-400/30 dark:hover:text-orange-300';

const EMPHASIS_CLASS = 'font-medium text-gray-900 dark:text-neutral-100';

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
  subtitle: string;
}) {
  return (
    <header className="mb-10 max-w-2xl lg:mb-12">
      <h2
        id={id}
        className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl"
      >
        {title}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-lg">
        {subtitle}
      </p>
    </header>
  );
}

export default function About({ onNavigate }: AboutProps) {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const raw = t('about.stats', { returnObjects: true }) as unknown;
    return Array.isArray(raw) ? (raw as StatEntry[]) : [];
  }, [t]);

  const engine = useMemo(() => {
    const raw = t('about.engine.items', { returnObjects: true }) as unknown;
    return Array.isArray(raw) ? (raw as IndexedEntry[]) : [];
  }, [t]);

  const philosophy = useMemo(() => {
    const raw = t('about.philosophy.items', { returnObjects: true }) as unknown;
    return Array.isArray(raw) ? (raw as TitledEntry[]) : [];
  }, [t]);

  const highlights = useMemo(() => {
    const raw = t('about.highlights.items', { returnObjects: true }) as unknown;
    return Array.isArray(raw) ? (raw as TitledEntry[]) : [];
  }, [t]);

  const audiences = useMemo(() => {
    const raw = t('about.audience.items', { returnObjects: true }) as unknown;
    return Array.isArray(raw) ? (raw as TitledEntry[]) : [];
  }, [t]);

  const partners = useMemo(() => {
    const raw = t('about.partners.items', { returnObjects: true }) as unknown;
    return Array.isArray(raw)
      ? (raw as { name: string; body: string; href: string }[])
      : [];
  }, [t]);

  return (
    <div className="min-h-screen bg-page transition-colors">
      <SEO
        title={t('about.seoTitle')}
        description={t('about.seoDescription')}
        keywords={[
          'about biomath core',
          'health technology mission',
          'computational biology',
          'biomathematics',
          'preventive wellness',
          'health AI company',
        ]}
        url="/about"
      />

      <div className="pt-16">
        <PageHero
          imageSrc={pageHeroUrl('about')}
          label={t('about.label')}
          title={t('about.title')}
          subtitle={t('about.subtitle')}
        />
      </div>

      <div className="pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <div className="pt-6">
            <BackButton onNavigate={onNavigate} />
          </div>

          {/* Mission + Founder */}
          <section className="grid gap-12 border-b border-[var(--bm-border)] py-14 md:grid-cols-2 md:gap-14 lg:py-16">
            <article>
              <SectionLabel>{t('about.mission.label')}</SectionLabel>
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                {t('about.mission.title')}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-gray-700 dark:text-neutral-300 sm:text-base">
                <Trans
                  i18nKey="about.mission.body"
                  components={{ b: <span className={EMPHASIS_CLASS} /> }}
                />
              </p>
            </article>

            <article>
              <SectionLabel>{t('about.origins.label')}</SectionLabel>
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                {t('about.origins.title')}
              </h2>
              <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-gray-700 dark:text-neutral-300 sm:text-base">
                <p>{t('about.origins.p1')}</p>
                <p>
                  <Trans
                    i18nKey="about.origins.p2"
                    components={{
                      a1: (
                        <a
                          href="https://digitalinvest.com/#home"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={EXTERNAL_LINK_CLASS}
                        />
                      ),
                      a2: (
                        <a
                          href="https://biomathlife.com/#"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={EXTERNAL_LINK_CLASS}
                        />
                      ),
                    }}
                  />
                </p>
                <p>
                  <Trans
                    i18nKey="about.origins.p3"
                    components={{
                      a3: (
                        <a
                          href="https://www.healthcaretechoutlook.com/digital-invest-inc"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={EXTERNAL_LINK_CLASS}
                        />
                      ),
                    }}
                  />
                </p>
              </div>
            </article>
          </section>

          {/* Signal note + stats */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <div className="border-l-2 border-orange-500/70 pl-5 dark:border-orange-400/55">
              <p className="max-w-3xl text-base leading-relaxed text-gray-700 dark:text-neutral-300 sm:text-lg">
                {t('about.signalNote')}
              </p>
            </div>

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

          {/* Partnerships / trust assets (verifiable only) */}
          <section
            className="border-b border-[var(--bm-border)] py-14 lg:py-16"
            aria-labelledby="about-partners"
          >
            <SectionLabel>{t('about.partners.label')}</SectionLabel>
            <SectionHeading
              id="about-partners"
              title={t('about.partners.title')}
              subtitle={t('about.partners.subtitle')}
            />
            <ul className="m-0 grid list-none gap-8 p-0 md:grid-cols-3 md:gap-10">
              {partners.map((partner) => (
                <li key={partner.name} className="border-t border-[var(--bm-border)] pt-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    <a
                      href={partner.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={EXTERNAL_LINK_CLASS}
                    >
                      {partner.name}
                    </a>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                    {partner.body}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-10 max-w-2xl border-l-2 border-orange-500/70 pl-5 dark:border-orange-400/55">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-neutral-500">
                {t('about.advisors.label')}
              </p>
              <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-neutral-100">
                {t('about.advisors.title')}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                {t('about.advisors.subtitle')}
              </p>
              <p className="mt-3 text-sm font-medium text-gray-800 dark:text-neutral-300">
                {t('about.advisors.tba')}
              </p>
            </div>
          </section>

          {/* Team */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16" aria-labelledby="about-team">
            <SectionLabel>{t('about.team.label')}</SectionLabel>
            <SectionHeading
              id="about-team"
              title={t('about.team.title')}
              subtitle={t('about.team.subtitle')}
            />

            <div className="max-w-3xl space-y-5 text-[15px] leading-relaxed text-gray-700 dark:text-neutral-300 sm:text-base">
              <p>
                <Trans
                  i18nKey="about.team.p1"
                  components={{ b: <span className={EMPHASIS_CLASS} /> }}
                />
              </p>

              <p>
                <Trans
                  i18nKey="about.team.p2"
                  components={{ b: <span className={EMPHASIS_CLASS} /> }}
                />
              </p>

              <blockquote className="border border-[var(--bm-border)] bg-[var(--bm-surface)] px-5 py-5 sm:px-6">
                <p>
                  <Trans
                    i18nKey="about.team.quote"
                    components={{ b: <span className={EMPHASIS_CLASS} /> }}
                  />
                </p>
              </blockquote>

              <p>{t('about.team.p3')}</p>

              <p>{t('about.team.p4')}</p>
            </div>
          </section>

          {/* AI Engine */}
          <section
            className="border-b border-[var(--bm-border)] py-14 lg:py-16"
            aria-labelledby="about-engine"
          >
            <SectionLabel>{t('about.engine.label')}</SectionLabel>
            <SectionHeading
              id="about-engine"
              title={t('about.engine.title')}
              subtitle={t('about.engine.subtitle')}
            />

            <ol className="m-0 grid list-none gap-8 p-0 sm:gap-10 md:grid-cols-2 md:gap-x-12 md:gap-y-12">
              {engine.map((item) => (
                <li key={item.index} className="border-t border-[var(--bm-border)] pt-5">
                  <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {item.index}
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

          {/* Philosophy */}
          <section
            className="border-b border-[var(--bm-border)] py-14 lg:py-16"
            aria-labelledby="about-philosophy"
          >
            <SectionLabel>{t('about.philosophy.label')}</SectionLabel>
            <SectionHeading
              id="about-philosophy"
              title={t('about.philosophy.title')}
              subtitle={t('about.philosophy.subtitle')}
            />

            <div className="grid gap-10 md:grid-cols-3 md:gap-8">
              {philosophy.map((item, index) => (
                <article key={item.title} className="relative">
                  <span
                    aria-hidden
                    className="mb-4 block h-px w-8 bg-orange-500/70 dark:bg-orange-400/55"
                  />
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-neutral-500">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Highlights */}
          <section
            className="border-b border-[var(--bm-border)] py-14 lg:py-16"
            aria-labelledby="about-highlights"
          >
            <SectionLabel>{t('about.highlights.label')}</SectionLabel>
            <SectionHeading
              id="about-highlights"
              title={t('about.highlights.title')}
              subtitle={t('about.highlights.subtitle')}
            />

            <ul className="m-0 grid list-none gap-x-10 gap-y-8 p-0 sm:grid-cols-2">
              {highlights.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Who we serve */}
          <section className="py-14 lg:py-16" aria-labelledby="about-audience">
            <SectionLabel>{t('about.audience.label')}</SectionLabel>
            <SectionHeading
              id="about-audience"
              title={t('about.audience.title')}
              subtitle={t('about.audience.subtitle')}
            />

            <div className="grid gap-px overflow-hidden border border-[var(--bm-border)] bg-[var(--bm-border)] sm:grid-cols-2">
              {audiences.map((item) => (
                <article
                  key={item.title}
                  className="bg-page px-6 py-7 sm:px-7 sm:py-8 dark:bg-[var(--bm-page)]"
                >
                  <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <CTASection
            variant="secondary"
            title={t('about.cta.title')}
            description={t('about.cta.description')}
            primaryButtonText={t('about.cta.primary')}
            secondaryButtonText={t('about.cta.secondary')}
            onPrimaryClick={() => onNavigate('services')}
            onSecondaryClick={() => onNavigate('pricing')}
            showStats={false}
          />
        </div>
      </div>
    </div>
  );
}
