import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import BackButton from '../components/BackButton';
import PageHero from '../components/PageHero';
import { pageHeroUrl } from '../data/pageHeroes';
import { tList } from '../i18n/tList';

interface HowItWorksProps {
  onNavigate?: (page: string) => void;
}

type TitledBody = { title: string; body: string };
type TitledBodyItems = TitledBody & { items: string[] };
type Faq = { question: string; answer: string };

const NAV_SECTION_IDS = [
  'overview',
  'signup',
  'connect',
  'records',
  'analyze',
  'reports',
  'action',
  'black-box',
  'dual-ai',
  'categories',
  'learning',
  'faq',
  'security',
];

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

function DotList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 space-y-2.5 p-0">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700 dark:text-neutral-300">
          <span
            aria-hidden
            className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function HowItWorks({ onNavigate }: HowItWorksProps) {
  const { t } = useTranslation();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navLabels = tList<string>(t, 'howItWorks.nav.items');
  const highlights = tList<TitledBody>(t, 'howItWorks.highlights.items');
  const blackBoxFeatures = tList<TitledBody>(t, 'howItWorks.blackBox.features');
  const blackBoxCategories = tList<TitledBody>(t, 'howItWorks.blackBox.categories');
  const dualBenefits = tList<TitledBody>(t, 'howItWorks.dual.items');
  const categories = tList<TitledBodyItems>(t, 'howItWorks.categories.items');
  const moreCategories = tList<string>(t, 'howItWorks.categories.more');
  const learning = tList<TitledBodyItems>(t, 'howItWorks.learning.items');
  const faqs = tList<Faq>(t, 'howItWorks.faq.items');
  const protection = tList<string>(t, 'howItWorks.security.protection');
  const control = tList<string>(t, 'howItWorks.security.control');

  const steps = [
    {
      id: 'signup',
      title: t('howItWorks.steps.signup.title'),
      summary: t('howItWorks.steps.signup.summary'),
      pointsHeading: t('howItWorks.steps.signup.pointsHeading'),
      points: tList<TitledBody>(t, 'howItWorks.steps.signup.points'),
      checklist: tList<string>(t, 'howItWorks.steps.signup.checklist'),
    },
    {
      id: 'connect',
      title: t('howItWorks.steps.connect.title'),
      summary: t('howItWorks.steps.connect.summary'),
      pointsHeading: t('howItWorks.steps.connect.pointsHeading'),
      points: tList<TitledBody>(t, 'howItWorks.steps.connect.points'),
      checklist: tList<string>(t, 'howItWorks.steps.connect.checklist'),
    },
    {
      id: 'records',
      title: t('howItWorks.steps.records.title'),
      summary: t('howItWorks.steps.records.summary'),
      pointsHeading: t('howItWorks.steps.records.pointsHeading'),
      points: tList<TitledBody>(t, 'howItWorks.steps.records.points'),
      checklist: tList<string>(t, 'howItWorks.steps.records.checklist'),
    },
    {
      id: 'analyze',
      title: t('howItWorks.steps.analyze.title'),
      summary: t('howItWorks.steps.analyze.summary'),
      dual: {
        primary: {
          title: t('howItWorks.steps.analyze.primary.title'),
          body: t('howItWorks.steps.analyze.primary.body'),
          items: tList<string>(t, 'howItWorks.steps.analyze.primary.items'),
        },
        secondary: {
          title: t('howItWorks.steps.analyze.secondary.title'),
          body: t('howItWorks.steps.analyze.secondary.body'),
          items: tList<string>(t, 'howItWorks.steps.analyze.secondary.items'),
        },
      },
      note: t('howItWorks.steps.analyze.note'),
    },
    {
      id: 'reports',
      title: t('howItWorks.steps.reports.title'),
      summary: t('howItWorks.steps.reports.summary'),
      reports: tList<TitledBodyItems>(t, 'howItWorks.steps.reports.items'),
    },
    {
      id: 'action',
      title: t('howItWorks.steps.action.title'),
      summary: t('howItWorks.steps.action.summary'),
      actions: tList<TitledBody>(t, 'howItWorks.steps.action.items'),
    },
  ];

  return (
    <div className="min-h-screen bg-page transition-colors">
      <SEO
        title={t('howItWorks.seo.title')}
        description={t('howItWorks.seo.description')}
        keywords={['how it works', 'health analytics', 'biomath core system', 'human data model']}
        page="how-it-works"
      />

      <div className="pt-16" id="overview">
        <PageHero
          imageSrc={pageHeroUrl('how-it-works')}
          label={t('howItWorks.hero.label')}
          title={t('howItWorks.hero.title')}
          subtitle={t('howItWorks.hero.body')}
        >
          <nav
            aria-label={t('howItWorks.nav.ariaLabel')}
            className="flex flex-wrap gap-x-4 gap-y-2 border-t border-white/20 pt-6"
          >
            {NAV_SECTION_IDS.map((sectionId, i) => (
              <span key={sectionId} className="inline-flex items-center gap-4">
                {i > 0 && <span className="hidden text-white/40 sm:inline">·</span>}
                <button
                  type="button"
                  onClick={() => scrollToSection(sectionId)}
                  className="text-sm font-medium text-neutral-200 transition-colors hover:text-orange-300"
                >
                  {navLabels[i]}
                </button>
              </span>
            ))}
          </nav>
        </PageHero>
      </div>

      <div className="pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          {onNavigate && (
            <div className="pt-6">
              <BackButton onNavigate={onNavigate} />
            </div>
          )}

          {/* Highlights */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('howItWorks.highlights.label')}</SectionLabel>
            <SectionHeading
              title={t('howItWorks.highlights.title')}
              subtitle={t('howItWorks.highlights.subtitle')}
            />
            <ol className="m-0 grid list-none gap-8 p-0 sm:gap-10 md:grid-cols-3 md:gap-8">
              {highlights.map((item, i) => (
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

          {/* Steps 1–5 */}
          {steps.map((step, stepIndex) => (
            <section
              key={step.id}
              id={step.id}
              className="scroll-mt-24 border-b border-[var(--bm-border)] py-14 lg:py-16"
            >
              <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                {String(stepIndex + 1).padStart(2, '0')}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
                {step.title}
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-gray-700 dark:text-neutral-300 sm:text-base">
                {step.summary}
              </p>

              {'points' in step && step.points && (
                <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-12">
                  <div>
                    {(step.id === 'signup' || step.id === 'records') && (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                          {step.pointsHeading}
                        </h3>
                        <ul className="mt-5 space-y-4">
                          {step.points.map((point) => (
                            <li key={point.title} className="border-t border-[var(--bm-border)] pt-4">
                              <p className="font-medium text-gray-900 dark:text-neutral-100">
                                {point.title}
                              </p>
                              <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                                {point.body}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {step.id === 'connect' && (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                          {step.pointsHeading}
                        </h3>
                        <div className="mt-5 grid gap-px overflow-hidden border border-[var(--bm-border)] bg-[var(--bm-border)] sm:grid-cols-2">
                          {step.points.map((point) => (
                            <article
                              key={point.title}
                              className="bg-page px-5 py-5 dark:bg-[var(--bm-page)]"
                            >
                              <p className="font-medium text-gray-900 dark:text-neutral-100">
                                {point.title}
                              </p>
                              <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                                {point.body}
                              </p>
                            </article>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  {'checklist' in step && step.checklist && (
                    <div className="border border-[var(--bm-border)] bg-[var(--bm-surface)] px-6 py-6 sm:px-7">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-neutral-500">
                        {t('howItWorks.steps.checklistLabel')}
                      </p>
                      <div className="mt-4">
                        <DotList items={step.checklist} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {'dual' in step && step.dual && (
                <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-12">
                  {[step.dual.primary, step.dual.secondary].map((model) => (
                    <article key={model.title} className="border-t border-[var(--bm-border)] pt-5">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                        {model.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                        {model.body}
                      </p>
                      <ul className="mt-4 space-y-2">
                        {model.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-neutral-300"
                          >
                            <span
                              aria-hidden
                              className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              )}
              {'note' in step && step.note && (
                <div className="mt-8 border-l-2 border-orange-500/70 pl-5 dark:border-orange-400/55">
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-neutral-300 sm:text-[15px]">
                    {step.note}
                  </p>
                </div>
              )}

              {'reports' in step && step.reports && (
                <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
                  {step.reports.map((report) => (
                    <article key={report.title} className="border-t border-[var(--bm-border)] pt-5">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                        {report.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                        {report.body}
                      </p>
                      <ul className="mt-4 space-y-1.5">
                        {report.items.map((item) => (
                          <li
                            key={item}
                            className="text-xs leading-relaxed text-gray-500 dark:text-neutral-500"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              )}

              {'actions' in step && step.actions && (
                <ul className="mt-10 grid list-none gap-8 p-0 sm:grid-cols-2">
                  {step.actions.map((action) => (
                    <li key={action.title} className="flex gap-4">
                      <span
                        aria-hidden
                        className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                      />
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                          {action.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                          {action.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* Health Black Box */}
          <section id="black-box" className="scroll-mt-24 border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('howItWorks.blackBox.label')}</SectionLabel>
            <SectionHeading
              title={t('howItWorks.blackBox.title')}
              subtitle={t('howItWorks.blackBox.summary')}
            />
            <div className="grid gap-12 md:grid-cols-2 md:gap-14">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                  {t('howItWorks.blackBox.featuresHeading')}
                </h3>
                <ul className="mt-5 space-y-4">
                  {blackBoxFeatures.map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-neutral-100">{item.title}</p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                  {t('howItWorks.blackBox.categoriesHeading')}
                </h3>
                <div className="mt-5 space-y-0">
                  {blackBoxCategories.map((cat) => (
                    <div
                      key={cat.title}
                      className="border-t border-[var(--bm-border)] py-4 first:border-t-0 first:pt-0"
                    >
                      <p className="font-medium text-gray-900 dark:text-neutral-100">{cat.title}</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">{cat.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 border-l-2 border-orange-500/70 pl-5 dark:border-orange-400/55">
              <p className="text-sm leading-relaxed text-gray-700 dark:text-neutral-300 sm:text-[15px]">
                {t('howItWorks.blackBox.note')}
              </p>
            </div>
          </section>

          {/* Dual models */}
          <section id="dual-ai" className="scroll-mt-24 border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('howItWorks.dual.label')}</SectionLabel>
            <SectionHeading
              title={t('howItWorks.dual.title')}
              subtitle={t('howItWorks.dual.subtitle')}
            />
            <div className="grid gap-10 md:grid-cols-3 md:gap-8">
              {dualBenefits.map((item, index) => (
                <article key={item.title}>
                  <span
                    aria-hidden
                    className="mb-4 block h-px w-8 bg-orange-500/70 dark:bg-orange-400/55"
                  />
                  <p className="mb-2 text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {String(index + 1).padStart(2, '0')}
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
            <p className="mt-10 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
              <Trans
                i18nKey="howItWorks.dual.more"
                components={{
                  link: (
                    <button
                      type="button"
                      onClick={() => onNavigate?.('why-two-models')}
                      className="font-semibold text-orange-700 transition-colors hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                    />
                  ),
                }}
              />
            </p>
          </section>

          {/* Categories */}
          <section id="categories" className="scroll-mt-24 border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('howItWorks.categories.label')}</SectionLabel>
            <SectionHeading
              title={t('howItWorks.categories.title')}
              subtitle={t('howItWorks.categories.subtitle')}
            />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <article key={cat.title} className="border-t border-[var(--bm-border)] pt-5">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                    {cat.body}
                  </p>
                  <ul className="mt-3 space-y-1">
                    {cat.items.map((item) => (
                      <li key={item} className="text-xs text-gray-500 dark:text-neutral-500">
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div className="mt-10 border border-[var(--bm-border)] bg-[var(--bm-surface)] px-6 py-6 sm:px-7">
              <p className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                {t('howItWorks.categories.moreTitle')}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-neutral-400 md:grid-cols-4">
                {moreCategories.map((cat) => (
                  <span key={cat}>{cat}</span>
                ))}
              </div>
            </div>
          </section>

          {/* Learning Center */}
          <section id="learning" className="scroll-mt-24 border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('howItWorks.learning.label')}</SectionLabel>
            <SectionHeading
              title={t('howItWorks.learning.title')}
              subtitle={t('howItWorks.learning.subtitle')}
            />
            <div className="grid gap-10 md:grid-cols-2 md:gap-12">
              {learning.map((item) => (
                <article key={item.title} className="border-t border-[var(--bm-border)] pt-5">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                    {item.body}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {item.items.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-neutral-300"
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
            <div className="mt-10 flex flex-col gap-4 border border-[var(--bm-border)] bg-[var(--bm-surface)] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <p className="font-semibold text-gray-900 dark:text-neutral-100">
                  {t('howItWorks.learning.ctaTitle')}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                  {t('howItWorks.learning.ctaBody')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate?.('learning-center')}
                className="bm-cta-primary sm:flex-shrink-0"
              >
                {t('howItWorks.learning.ctaButton')}
              </button>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-24 border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('howItWorks.faq.label')}</SectionLabel>
            <SectionHeading
              title={t('howItWorks.faq.title')}
              subtitle={t('howItWorks.faq.subtitle')}
            />
            <div className="mx-auto max-w-3xl divide-y divide-[var(--bm-border)] border-y border-[var(--bm-border)]">
              {faqs.map((faq, index) => {
                const open = openFAQ === index;
                return (
                  <div key={faq.question}>
                    <button
                      type="button"
                      onClick={() => setOpenFAQ(open ? null : index)}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-orange-600 dark:hover:text-orange-400"
                      aria-expanded={open}
                    >
                      <span className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform dark:text-neutral-500 ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {open && (
                      <p className="pb-5 pr-10 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mx-auto mt-10 max-w-3xl border-l-2 border-orange-500/70 pl-5 dark:border-orange-400/55">
              <p className="text-base leading-relaxed text-gray-700 dark:text-neutral-300">
                {t('howItWorks.faq.moreText')}
              </p>
              <button
                type="button"
                onClick={() => onNavigate?.('faq')}
                className="mt-2 text-sm font-semibold text-orange-700 transition-colors hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
              >
                {t('howItWorks.faq.moreCta')}
              </button>
            </div>
          </section>

          {/* Security */}
          <section id="security" className="scroll-mt-24 border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('howItWorks.security.label')}</SectionLabel>
            <SectionHeading
              title={t('howItWorks.security.title')}
              subtitle={t('howItWorks.security.subtitle')}
            />
            <div className="grid gap-10 md:grid-cols-2 md:gap-12">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                  {t('howItWorks.security.protectionHeading')}
                </h3>
                <ul className="mt-5 space-y-3">
                  {protection.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-neutral-300"
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                  {t('howItWorks.security.controlHeading')}
                </h3>
                <ul className="mt-5 space-y-3">
                  {control.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-neutral-300"
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
            <div className="mt-8">
              <button
                type="button"
                onClick={() => onNavigate?.('privacy-trust')}
                className="text-sm font-semibold text-orange-700 transition-colors hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
              >
                {t('howItWorks.security.moreCta')}
              </button>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="py-14 lg:py-16">
            <div className="border border-[var(--bm-border)] bg-[var(--bm-surface)] px-6 py-12 text-center sm:px-10">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl">
                {t('howItWorks.closing.title')}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
                {t('howItWorks.closing.body')}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
                <button
                  type="button"
                  onClick={() => onNavigate?.('signup')}
                  className="bm-cta-primary w-full sm:w-auto"
                >
                  {t('howItWorks.closing.ctaTrial')}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.('pricing')}
                  className="bm-link"
                >
                  {t('howItWorks.closing.ctaPricing')}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
