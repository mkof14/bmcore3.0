import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';
import { tList } from '../i18n/tList';

interface PartnershipProps {
  onNavigate: (page: string) => void;
}

type PartnershipType = { title: string; body: string; points: string[] };
type Reason = { title: string; body: string };
type Program = { title: string; body: string; action: string };

const TYPE_OPTION_VALUES = ['business', 'research', 'healthcare', 'technology', 'other'] as const;

const INQUIRY_SECTION_ID = 'partnership-inquiry';

/** Matches the order of `partnership.programs.items` in the locale packs. */
const PROGRAM_TARGETS = ['inquiry', 'referral', 'ambassador'] as const;

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
      {children}
    </p>
  );
}

const inputClassName =
  'w-full border border-[var(--bm-border)] bg-page px-4 py-3 text-gray-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 dark:text-neutral-100';

export default function Partnership({ onNavigate }: PartnershipProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    partnershipType: '',
    contactName: '',
    organization: '',
    email: '',
    phone: '',
    message: '',
  });

  const partnershipTypes = tList<PartnershipType>(t, 'partnership.types.items');
  const reasons = tList<Reason>(t, 'partnership.why.items');
  const programs = tList<Program>(t, 'partnership.programs.items');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const openProgram = (target: (typeof PROGRAM_TARGETS)[number]) => {
    if (target === 'inquiry') {
      document.getElementById(INQUIRY_SECTION_ID)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    onNavigate(target);
  };

  return (
    <div className="min-h-screen bg-page transition-colors">
      <SEO
        title={t('partnership.seo.title')}
        description={t('partnership.seo.description')}
        keywords={[
          'biomath core partnerships',
          'health technology partners',
          'clinical integration',
          'research collaboration',
          'digital health distribution',
        ]}
        url="/partnership"
      />

      <div className="pt-20 pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <BackButton onNavigate={onNavigate} />

          {/* Hero */}
          <section className="border-b border-[var(--bm-border)] pb-14 pt-8 lg:pb-16 lg:pt-10">
            <SectionLabel>{t('partnership.hero.label')}</SectionLabel>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-5xl md:text-[3.25rem] md:leading-[1.12]">
              {t('partnership.hero.title')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-lg">
              {t('partnership.hero.body')}
            </p>
          </section>

          {/* Partnership types */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('partnership.types.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('partnership.types.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('partnership.types.body')}
            </p>

            <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
              {partnershipTypes.map((item, i) => (
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
                  <ul className="mt-4 space-y-2.5">
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

          {/* Why partner */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('partnership.why.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('partnership.why.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('partnership.why.body')}
            </p>

            <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {reasons.map((item, i) => (
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
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Ways to take part */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('partnership.programs.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('partnership.programs.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('partnership.programs.body')}
            </p>

            <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
              {programs.map((item, i) => (
                <article key={item.title} className="flex flex-col border-t border-[var(--bm-border)] pt-5">
                  <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-neutral-100">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                    {item.body}
                  </p>
                  {PROGRAM_TARGETS[i] && (
                    <button
                      type="button"
                      onClick={() => openProgram(PROGRAM_TARGETS[i])}
                      className="mt-5 self-start text-sm font-medium text-orange-700 transition-colors hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 dark:text-orange-400 dark:hover:text-orange-300"
                    >
                      {item.action}
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>

          {/* Contact form */}
          <section id={INQUIRY_SECTION_ID} className="scroll-mt-24 py-14 lg:py-16">
            <SectionLabel>{t('partnership.form.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('partnership.form.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('partnership.form.body')}
            </p>

            <div className="mt-10 border border-[var(--bm-border)] bg-[var(--bm-surface)] p-6 sm:p-8 lg:p-10">
              <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
                <div className="mb-6">
                  <label
                    htmlFor="partnershipType"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-neutral-100"
                  >
                    {t('partnership.form.typeLabel')}
                  </label>
                  <select
                    id="partnershipType"
                    value={formData.partnershipType}
                    onChange={(e) =>
                      setFormData({ ...formData, partnershipType: e.target.value })
                    }
                    className={inputClassName}
                    required
                  >
                    <option value="">{t('partnership.form.typePlaceholder')}</option>
                    {TYPE_OPTION_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {t(`partnership.form.typeOptions.${value}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contactName"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-neutral-100"
                    >
                      {t('partnership.form.contactName')}
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      value={formData.contactName}
                      onChange={(e) =>
                        setFormData({ ...formData, contactName: e.target.value })
                      }
                      className={inputClassName}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="organization"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-neutral-100"
                    >
                      {t('partnership.form.organization')}
                    </label>
                    <input
                      id="organization"
                      type="text"
                      value={formData.organization}
                      onChange={(e) =>
                        setFormData({ ...formData, organization: e.target.value })
                      }
                      className={inputClassName}
                      required
                    />
                  </div>
                </div>

                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-neutral-100"
                    >
                      {t('partnership.form.email')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClassName}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-neutral-100"
                    >
                      {t('partnership.form.phone')}
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-neutral-100"
                  >
                    {t('partnership.form.message')}
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className={`${inputClassName} resize-none`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
                >
                  {t('partnership.form.submit')}
                </button>
              </form>

              <div className="mx-auto mt-10 max-w-2xl border-t border-[var(--bm-border)] pt-8 text-center">
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  {t('partnership.form.directLabel')}
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-neutral-100">
                  partnerships@biomathcore.com
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
