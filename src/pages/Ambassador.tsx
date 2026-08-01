import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';

interface AmbassadorProps {
  onNavigate: (page: string) => void;
}

const PATHS = ['organic', 'direct'] as const;

const REWARDS = ['higher', 'priority', 'tools'] as const;

const BENEFITS = [
  'enhanced',
  'dashboard',
  'materials',
  'support',
  'features',
  'revenue',
] as const;

const AUDIENCE_OPTIONS = ['users', 'clients', 'followers', 'community', 'other'] as const;

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
      {children}
    </p>
  );
}

export default function Ambassador({ onNavigate }: AmbassadorProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    audienceType: '',
    hasReferrals: '',
    motivation: '',
    socialLink: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        fullName: '',
        email: '',
        country: '',
        audienceType: '',
        hasReferrals: '',
        motivation: '',
        socialLink: '',
      });
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const inputClassName =
    'w-full border border-[var(--bm-border)] bg-page px-4 py-3 text-gray-900 transition-colors focus:border-orange-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 dark:text-neutral-100';

  return (
    <div className="min-h-screen bg-page transition-colors">
      <div className="pt-20 pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <BackButton onNavigate={onNavigate} />

          {/* Hero */}
          <section className="border-b border-[var(--bm-border)] pb-14 pt-8 lg:pb-16 lg:pt-10">
            <SectionLabel>{t('programs.ambassador.label')}</SectionLabel>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-5xl md:text-[3.25rem] md:leading-[1.12]">
              {t('programs.ambassador.heroTitle')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-lg">
              {t('programs.ambassador.heroSubtitle')}
            </p>
          </section>

          {/* What makes an ambassador */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('programs.ambassador.pathsLabel')}</SectionLabel>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
              {t('programs.ambassador.pathsTitle')}
            </h2>
            <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-12">
              {PATHS.map((item, index) => (
                <article key={item} className="border-t border-[var(--bm-border)] pt-5">
                  <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {t(`programs.ambassador.paths.${item}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                    {t(`programs.ambassador.paths.${item}.body`)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Reward highlights */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('programs.ambassador.rewardsLabel')}</SectionLabel>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
              {t('programs.ambassador.rewardsTitle')}
            </h2>
            <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-3">
              {REWARDS.map((item) => (
                <li key={item} className="flex gap-4">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                      {t(`programs.ambassador.rewards.${item}.title`)}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                      {t(`programs.ambassador.rewards.${item}.body`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Full benefits */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('programs.ambassador.benefitsLabel')}</SectionLabel>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
              {t('programs.ambassador.benefitsTitle')}
            </h2>
            <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {BENEFITS.map((item) => (
                <li key={item} className="flex gap-4">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                      {t(`programs.ambassador.benefits.${item}.title`)}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                      {t(`programs.ambassador.benefits.${item}.body`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Responsibilities */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('programs.ambassador.guidelinesLabel')}</SectionLabel>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
              {t('programs.ambassador.guidelinesTitle')}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('programs.ambassador.guidelinesIntro')}
            </p>
            <ul className="mt-8 space-y-3">
              {stringList(
                t('programs.ambassador.responsibilities', { returnObjects: true })
              ).map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]"
                >
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Application form */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('programs.ambassador.applyLabel')}</SectionLabel>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
              {t('programs.ambassador.applyTitle')}
            </h2>

            <div className="mt-8 border border-[var(--bm-border)] bg-[var(--bm-surface)] p-6 sm:p-8">
              {submitted ? (
                <div className="py-10 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {t('programs.ambassador.submitted')}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-gray-900 dark:text-neutral-100">
                    {t('programs.ambassador.receivedTitle')}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                    {t('programs.ambassador.receivedBody')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300">
                        {t('programs.ambassador.form.fullName')}
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300">
                        {t('programs.ambassador.form.email')}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300">
                        {t('programs.ambassador.form.country')}
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300">
                        {t('programs.ambassador.form.audience')}
                      </label>
                      <select
                        name="audienceType"
                        value={formData.audienceType}
                        onChange={handleChange}
                        required
                        className={inputClassName}
                      >
                        <option value="">{t('programs.ambassador.form.selectType')}</option>
                        {AUDIENCE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {t(`programs.ambassador.form.audienceOptions.${option}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300">
                      {t('programs.ambassador.form.hasReferrals')}
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="hasReferrals"
                          value="yes"
                          checked={formData.hasReferrals === 'yes'}
                          onChange={handleChange}
                          required
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-gray-700 dark:text-neutral-300">
                          {t('programs.ambassador.form.yes')}
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="hasReferrals"
                          value="no"
                          checked={formData.hasReferrals === 'no'}
                          onChange={handleChange}
                          required
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-gray-700 dark:text-neutral-300">
                          {t('programs.ambassador.form.no')}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300">
                      {t('programs.ambassador.form.motivation')}
                    </label>
                    <textarea
                      name="motivation"
                      value={formData.motivation}
                      onChange={handleChange}
                      required
                      rows={4}
                      className={`${inputClassName} resize-none`}
                      placeholder={t('programs.ambassador.form.motivationPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300">
                      {t('programs.ambassador.form.socialLink')}
                    </label>
                    <input
                      type="url"
                      name="socialLink"
                      value={formData.socialLink}
                      onChange={handleChange}
                      placeholder="https://"
                      className={inputClassName}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
                  >
                    {t('programs.ambassador.form.submit')}
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Footer note */}
          <section className="py-10">
            <p className="text-center text-sm text-gray-600 dark:text-neutral-400">
              <span className="font-medium text-gray-900 dark:text-neutral-100">
                {t('programs.ambassador.footerQuestion')}
              </span>{' '}
              {t('programs.ambassador.footerPrefix')}{' '}
              <button
                type="button"
                onClick={() => onNavigate('member')}
                className="font-medium text-orange-700 transition-colors hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
              >
                {t('programs.ambassador.footerLink')}
              </button>{' '}
              {t('programs.ambassador.footerSuffix')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
