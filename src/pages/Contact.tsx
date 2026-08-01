import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MessageCircle, Building2, Clock3, Send } from 'lucide-react';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';
import LiveSupportChat from '../components/LiveSupportChat';

interface ContactProps {
  onNavigate: (page: string) => void;
}

const CHANNELS = [
  {
    index: '01',
    key: 'email',
    icon: Mail,
    body: 'contact@biomathcore.com',
    href: 'mailto:contact@biomathcore.com',
  },
  { index: '02', key: 'chat', icon: MessageCircle },
  {
    index: '03',
    key: 'enterprise',
    icon: Building2,
    body: 'enterprise@biomathcore.com',
    href: 'mailto:enterprise@biomathcore.com',
  },
] as const;

const RESPONSE_TIMES = ['general', 'enterprise', 'support'] as const;

const SUBJECTS = [
  'general',
  'enterprise',
  'api',
  'investment',
  'partnership',
  'support',
] as const;

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
      {children}
    </p>
  );
}

export default function Contact({ onNavigate }: ContactProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });

  const [chatOpen, setChatOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
      });
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const inputClassName =
    'w-full rounded-lg border border-[var(--bm-border)] bg-page px-4 py-3 text-gray-900 transition-colors focus:border-orange-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 dark:text-neutral-100';

  return (
    <div className="min-h-screen bg-page text-gray-900 transition-colors dark:text-neutral-100">
      <SEO
        title={t('contactExtra.seoTitle')}
        description={t('contactExtra.seoDescription')}
        keywords={[
          'contact biomath core',
          'health support',
          'customer service',
          'business inquiries',
          'partnership opportunities',
        ]}
        url="/contact"
      />

      <div className="pb-16 pt-20">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <BackButton onNavigate={onNavigate} />

          <section className="border-b border-[var(--bm-border)] pb-12 pt-8 lg:pb-14 lg:pt-10">
            <SectionLabel>{t('contact.label')}</SectionLabel>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-5xl md:text-[3.25rem] md:leading-[1.12]">
              {t('contact.heroTitle')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-300 sm:text-lg">
              {t('contact.heroSubtitle')}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-neutral-300">
              {t('contactExtra.howToReach')}
            </p>
          </section>

          <section className="border-b border-[var(--bm-border)] py-10 lg:py-12">
            <SectionLabel>{t('contactExtra.choosePathLabel')}</SectionLabel>
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
              {t('contactExtra.choosePathTitle')}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {CHANNELS.map((channel) => {
                const Icon = channel.icon;
                return (
                  <article
                    key={channel.key}
                    className="flex h-full flex-col rounded-2xl border border-[var(--bm-border)] bg-surface p-5 shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-page text-orange-600 dark:text-orange-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                        {channel.index}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                      {t(`contactExtra.channels.${channel.key}.title`)}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600 dark:text-neutral-300">
                      {t(`contactExtra.channels.${channel.key}.body`)}
                    </p>
                    {'href' in channel ? (
                      <a
                        href={channel.href}
                        className="mt-4 inline-flex text-sm font-semibold text-orange-700 transition-colors hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                      >
                        {channel.body}
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setChatOpen(!chatOpen)}
                        className="mt-4 inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
                      >
                        {chatOpen
                          ? t('contactExtra.channels.chat.close')
                          : t('contactExtra.channels.chat.open')}
                      </button>
                    )}
                    <p className="mt-3 text-xs text-gray-500 dark:text-neutral-400">
                      {t(`contactExtra.channels.${channel.key}.note`)}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="border-b border-[var(--bm-border)] py-8 lg:py-10">
            <div className="rounded-xl border border-[var(--bm-border)] bg-surface px-5 py-4 sm:px-6">
              <p className="text-sm leading-relaxed text-gray-700 dark:text-neutral-300">
                <span className="font-semibold text-gray-900 dark:text-neutral-100">
                  {t('contact.noteLabel')}
                </span>{' '}
                {t('contact.noteBody')}
              </p>
            </div>
          </section>

          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <div className="grid gap-12 lg:grid-cols-3 lg:gap-14">
              <div className="lg:col-span-2">
                <SectionLabel>{t('contact.messageLabel')}</SectionLabel>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                  {t('contact.sendMessage')}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-neutral-300">
                  {t('contactExtra.formIntro')}
                </p>

                <div className="mt-8 rounded-2xl border border-[var(--bm-border)] bg-surface p-6 shadow-sm sm:p-8">
                  {submitted ? (
                    <div className="py-10 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                        <Send className="h-5 w-5" />
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-600 dark:text-orange-400">
                        {t('contactExtra.sent')}
                      </p>
                      <h3 className="mt-3 text-xl font-semibold text-gray-900 dark:text-neutral-100">
                        {t('contactExtra.receivedTitle')}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-300">
                        {t('contactExtra.receivedBody')}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300"
                          >
                            {t('contactExtra.form.name')}
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className={inputClassName}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300"
                          >
                            {t('contactExtra.form.email')}
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={inputClassName}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="company"
                          className="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300"
                        >
                          {t('contactExtra.form.company')}
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="subject"
                          className="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300"
                        >
                          {t('contactExtra.form.subject')}
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className={inputClassName}
                        >
                          <option value="">{t('contactExtra.form.selectSubject')}</option>
                          {SUBJECTS.map((subject) => (
                            <option key={subject} value={subject}>
                              {t(`contactExtra.form.subjects.${subject}`)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="message"
                          className="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300"
                        >
                          {t('contactExtra.form.message')}
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className={`${inputClassName} resize-none`}
                          placeholder={t('contactExtra.form.messagePlaceholder')}
                        />
                      </div>

                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
                      >
                        <Send className="h-4 w-4" />
                        {t('contactExtra.form.submit')}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <aside className="space-y-8">
                <div className="rounded-2xl border border-[var(--bm-border)] bg-surface p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Clock3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <SectionLabel>{t('contactExtra.responseLabel')}</SectionLabel>
                  </div>
                  <dl className="space-y-0">
                    {RESPONSE_TIMES.map((item) => (
                      <div
                        key={item}
                        className="flex items-baseline justify-between gap-4 border-t border-[var(--bm-border)] py-3.5 first:border-t-0 first:pt-0"
                      >
                        <dt className="text-sm text-gray-600 dark:text-neutral-300">
                          {t(`contactExtra.response.${item}`)}
                        </dt>
                        <dd className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
                          {t(`contactExtra.response.${item}Value`)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="rounded-2xl border border-[var(--bm-border)] bg-page p-5">
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-neutral-300">
                    {t('contactExtra.sidebarTip')}
                  </p>
                </div>
              </aside>
            </div>
          </section>

          <section className="py-14 lg:py-16">
            <div className="rounded-2xl border border-[var(--bm-border)] bg-surface px-6 py-10 shadow-sm sm:px-10">
              <SectionLabel>{t('contactExtra.partnershipsLabel')}</SectionLabel>
              <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl">
                {t('contactExtra.partnershipsTitle')}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-300">
                {t('contactExtra.partnershipsBody')}
              </p>
              <a
                href="mailto:enterprise@biomathcore.com"
                className="mt-6 inline-block rounded-lg bg-orange-500 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
              >
                enterprise@biomathcore.com
              </a>
            </div>
          </section>
        </div>
      </div>

      <LiveSupportChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
