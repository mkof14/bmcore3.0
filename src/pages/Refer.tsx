import { Copy, Mail, Share2, Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';

interface ReferProps {
  onNavigate: (page: string) => void;
}

const STEPS = ['share', 'discount', 'credit'] as const;
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

type ProgramId = 'invite' | 'ambassador';

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

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Refer({ onNavigate }: ReferProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeProgram, setActiveProgram] = useState<ProgramId>('invite');
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

  const referralCode = 'BIOMATH-USER123';
  const referralLink = `https://biomathcore.com/signup?ref=${referralCode}`;

  const stats = {
    totalReferred: 8,
    creditsEarned: 80,
    activeReferrals: 6,
  };

  useEffect(() => {
    const syncFromHash = () => {
      const id = window.location.hash.replace(/^#/, '');
      if (id === 'invite' || id === 'ambassador') {
        setActiveProgram(id);
        window.setTimeout(() => scrollToSection(id), 80);
      }
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  useEffect(() => {
    const sections: ProgramId[] = ['invite', 'ambassador'];
    const observers: IntersectionObserver[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) setActiveProgram(id);
        },
        { rootMargin: '-35% 0px -50% 0px', threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setEmail('');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const shareToSocial = (network: string) => {
    const text = encodeURIComponent(t('programs.referral.shareText'));
    const url = encodeURIComponent(referralLink);

    const urls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
    };

    window.open(urls[network], '_blank', 'width=600,height=400');
  };

  const handleAmbassadorSubmit = (e: React.FormEvent) => {
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

  const handleAmbassadorChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const jumpTo = (id: ProgramId) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveProgram(id);
    const next = `/refer#${id}`;
    window.history.pushState({ page: 'refer', data: null }, '', next);
    scrollToSection(id);
  };

  const inputClassName =
    'w-full border border-[var(--bm-border)] bg-page px-4 py-3 text-gray-900 transition-colors focus:border-orange-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 dark:text-neutral-100';

  const tabClass = (id: ProgramId) =>
    activeProgram === id
      ? 'border-orange-500 bg-orange-500/10 text-orange-700 dark:border-orange-400 dark:bg-orange-500/15 dark:text-orange-300'
      : 'border-[var(--bm-border)] bg-transparent text-gray-700 hover:border-orange-400/60 hover:text-orange-600 dark:text-neutral-300 dark:hover:text-orange-400';

  return (
    <div className="min-h-screen bg-page transition-colors">
      <div className="pt-20 pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <BackButton onNavigate={onNavigate} />

          {/* Shared Refer intro + program picker */}
          <section className="border-b border-[var(--bm-border)] pb-10 pt-8 lg:pb-12 lg:pt-10">
            <SectionLabel>{t('programs.page.label')}</SectionLabel>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-5xl md:text-[3.25rem] md:leading-[1.12]">
              {t('programs.page.title')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-lg">
              {t('programs.page.body')}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5">
              <a
                href="/refer#invite"
                onClick={jumpTo('invite')}
                className={`group block border p-6 transition-colors sm:p-7 ${
                  activeProgram === 'invite'
                    ? 'border-orange-500/70 bg-orange-500/[0.06] dark:border-orange-400/60 dark:bg-orange-500/10'
                    : 'border-[var(--bm-border)] bg-[var(--bm-surface)] hover:border-orange-400/50'
                }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-600 dark:text-orange-400">
                  01
                </p>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                  {t('programs.page.inviteCardTitle')}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                  {t('programs.page.inviteCardBody')}
                </p>
                <span className="mt-5 inline-block text-sm font-semibold text-orange-700 transition-colors group-hover:text-orange-600 dark:text-orange-400">
                  {t('programs.page.inviteCta')} →
                </span>
              </a>

              <a
                href="/refer#ambassador"
                onClick={jumpTo('ambassador')}
                className={`group block border p-6 transition-colors sm:p-7 ${
                  activeProgram === 'ambassador'
                    ? 'border-orange-500/70 bg-orange-500/[0.06] dark:border-orange-400/60 dark:bg-orange-500/10'
                    : 'border-[var(--bm-border)] bg-[var(--bm-surface)] hover:border-orange-400/50'
                }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-600 dark:text-orange-400">
                  02
                </p>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                  {t('programs.page.ambassadorCardTitle')}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                  {t('programs.page.ambassadorCardBody')}
                </p>
                <span className="mt-5 inline-block text-sm font-semibold text-orange-700 transition-colors group-hover:text-orange-600 dark:text-orange-400">
                  {t('programs.page.ambassadorCta')} →
                </span>
              </a>
            </div>
          </section>

          {/* Sticky in-page subnav */}
          <nav
            className="sticky top-16 z-20 -mx-4 mt-0 border-b border-[var(--bm-border)] bg-page/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
            aria-label={t('programs.page.navAria')}
          >
            <div className="flex flex-wrap gap-2">
              <a
                href="/refer#invite"
                onClick={jumpTo('invite')}
                aria-current={activeProgram === 'invite' ? 'true' : undefined}
                className={`inline-flex items-center border px-4 py-2 text-sm font-semibold transition-colors ${tabClass('invite')}`}
              >
                {t('programs.page.inviteShort')}
              </a>
              <a
                href="/refer#ambassador"
                onClick={jumpTo('ambassador')}
                aria-current={activeProgram === 'ambassador' ? 'true' : undefined}
                className={`inline-flex items-center border px-4 py-2 text-sm font-semibold transition-colors ${tabClass('ambassador')}`}
              >
                {t('programs.page.ambassadorShort')}
              </a>
            </div>
          </nav>

          {/* ── Program 1: Invite a friend ── */}
          <div
            id="invite"
            className="scroll-mt-36 border border-[var(--bm-border)] bg-[var(--bm-surface)]/40 px-5 py-2 sm:px-8 lg:px-10 dark:bg-[var(--bm-surface)]/20"
          >
            <section className="border-b border-[var(--bm-border)] pb-14 pt-10 lg:pb-16 lg:pt-12">
              <div className="mb-4 inline-flex items-center border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-700 dark:text-orange-300">
                {t('programs.page.programBadge', { n: 1 })}
              </div>
              <SectionLabel>{t('programs.referral.label')}</SectionLabel>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl md:text-[2.75rem] md:leading-[1.12]">
                {t('programs.referral.heroTitle')}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-lg">
                {t('programs.referral.heroSubtitle')}
              </p>
            </section>

            <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
              <SectionLabel>{t('programs.referral.statsLabel')}</SectionLabel>
              <dl className="grid gap-8 sm:grid-cols-3">
                <div className="border-t border-[var(--bm-border)] pt-5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-neutral-500">
                    {t('programs.referral.totalReferred')}
                  </dt>
                  <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                    {stats.totalReferred}
                  </dd>
                </div>
                <div className="border-t border-[var(--bm-border)] pt-5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-neutral-500">
                    {t('programs.referral.creditsEarned')}
                  </dt>
                  <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                    ${stats.creditsEarned}
                  </dd>
                </div>
                <div className="border-t border-[var(--bm-border)] pt-5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-neutral-500">
                    {t('programs.referral.activeReferrals')}
                  </dt>
                  <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                    {stats.activeReferrals}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
              <SectionLabel>{t('programs.referral.howLabel')}</SectionLabel>
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                    {t('programs.referral.howTitle')}
                  </h3>
                  <ol className="mt-8 space-y-6">
                    {STEPS.map((step, index) => (
                      <li key={step} className="flex gap-4">
                        <span className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-neutral-100">
                            {t(`programs.referral.steps.${step}.title`)}
                          </p>
                          <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                            {t(`programs.referral.steps.${step}.body`)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="border border-[var(--bm-border)] bg-page p-6 sm:p-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {t('programs.referral.rewardTitle')}
                  </h3>
                  <dl className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between gap-4 border-b border-[var(--bm-border)] pb-3">
                      <dt className="text-gray-600 dark:text-neutral-400">
                        {t('programs.referral.perReferral')}
                      </dt>
                      <dd className="font-semibold text-gray-900 dark:text-neutral-100">$10</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-[var(--bm-border)] pb-3">
                      <dt className="text-gray-600 dark:text-neutral-400">
                        {t('programs.referral.friendDiscount')}
                      </dt>
                      <dd className="font-semibold text-gray-900 dark:text-neutral-100">$5</dd>
                    </div>
                  </dl>
                  <ul className="mt-4 space-y-1 text-sm text-gray-500 dark:text-neutral-500">
                    {stringList(t('programs.referral.notes', { returnObjects: true })).map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
              <SectionLabel>{t('programs.referral.shareLabel')}</SectionLabel>
              <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                {t('programs.referral.codeTitle')}
              </h3>

              <div className="mt-8 border border-[var(--bm-border)] bg-page p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-neutral-500">
                      {t('programs.referral.permanentCode')}
                    </p>
                    <p className="mt-2 font-mono text-2xl font-semibold text-gray-900 dark:text-neutral-100">
                      {referralCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? t('programs.referral.copied') : t('programs.referral.copy')}
                  </button>
                </div>

                <div className="mt-6 border-t border-[var(--bm-border)] pt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-neutral-500">
                    {t('programs.referral.shareLink')}
                  </p>
                  <p className="mt-2 break-all font-mono text-sm text-gray-700 dark:text-neutral-300">
                    {referralLink}
                  </p>
                </div>

                <div className="mt-8 border-t border-[var(--bm-border)] pt-8">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                    {t('programs.referral.inviteTitle')}
                  </h4>
                  <form onSubmit={handleSendInvite} className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('programs.referral.invitePlaceholder')}
                      required
                      className={inputClassName}
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
                    >
                      <Mail className="h-4 w-4" />
                      {t('programs.referral.send')}
                    </button>
                  </form>
                  {showSuccess && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                      <Check className="h-4 w-4" />
                      {t('programs.referral.inviteSent')}
                    </p>
                  )}
                </div>

                <div className="mt-8 border-t border-[var(--bm-border)] pt-8">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                    {t('programs.referral.socialTitle')}
                  </h4>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {(['twitter', 'facebook', 'linkedin', 'whatsapp'] as const).map((network) => (
                      <button
                        key={network}
                        type="button"
                        onClick={() => shareToSocial(network)}
                        className="bm-link"
                      >
                        <Share2 className="h-4 w-4" />
                        {network === 'twitter'
                          ? 'X'
                          : network.charAt(0).toUpperCase() + network.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="py-14 lg:py-16">
              <SectionLabel>{t('programs.referral.detailsLabel')}</SectionLabel>
              <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                {t('programs.referral.detailsTitle')}
              </h3>
              <div className="mt-10 grid gap-10 sm:grid-cols-2">
                <div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                    {t('programs.referral.eligibility')}
                  </h4>
                  <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-neutral-400">
                    {stringList(t('programs.referral.eligibilityItems', { returnObjects: true })).map(
                      (item) => (
                        <li key={item}>{item}</li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                    {t('programs.referral.fraud')}
                  </h4>
                  <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-neutral-400">
                    {stringList(t('programs.referral.fraudItems', { returnObjects: true })).map(
                      (item) => (
                        <li key={item}>{item}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              <p className="mt-10 border-t border-[var(--bm-border)] pt-8 text-center text-sm text-gray-600 dark:text-neutral-400">
                <span className="font-medium text-gray-900 dark:text-neutral-100">
                  {t('programs.referral.upgradeQuestion')}
                </span>{' '}
                {t('programs.referral.upgradePrefix')}{' '}
                <a
                  href="/refer#ambassador"
                  onClick={jumpTo('ambassador')}
                  className="font-medium text-orange-700 transition-colors hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  {t('programs.referral.upgradeLink')}
                </a>{' '}
                {t('programs.referral.upgradeSuffix')}
              </p>
            </section>
          </div>

          {/* Visual break between programs */}
          <div className="my-12 flex items-center gap-4 lg:my-16" aria-hidden>
            <div className="h-px flex-1 bg-[var(--bm-border)]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-400 dark:text-neutral-500">
              {t('programs.page.separator')}
            </span>
            <div className="h-px flex-1 bg-[var(--bm-border)]" />
          </div>

          {/* ── Program 2: Ambassador ── */}
          <div
            id="ambassador"
            className="scroll-mt-36 border border-[var(--bm-border)] bg-page px-5 py-2 sm:px-8 lg:px-10"
          >
            <section className="border-b border-[var(--bm-border)] pb-14 pt-10 lg:pb-16 lg:pt-12">
              <div className="mb-4 inline-flex items-center border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-700 dark:text-orange-300">
                {t('programs.page.programBadge', { n: 2 })}
              </div>
              <SectionLabel>{t('programs.ambassador.label')}</SectionLabel>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl md:text-[2.75rem] md:leading-[1.12]">
                {t('programs.ambassador.heroTitle')}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-lg">
                {t('programs.ambassador.heroSubtitle')}
              </p>
            </section>

            <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
              <SectionLabel>{t('programs.ambassador.pathsLabel')}</SectionLabel>
              <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                {t('programs.ambassador.pathsTitle')}
              </h3>
              <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-12">
                {PATHS.map((item, index) => (
                  <article key={item} className="border-t border-[var(--bm-border)] pt-5">
                    <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <h4 className="mt-2 text-lg font-semibold text-gray-900 dark:text-neutral-100">
                      {t(`programs.ambassador.paths.${item}.title`)}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                      {t(`programs.ambassador.paths.${item}.body`)}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
              <SectionLabel>{t('programs.ambassador.rewardsLabel')}</SectionLabel>
              <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                {t('programs.ambassador.rewardsTitle')}
              </h3>
              <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-3">
                {REWARDS.map((item) => (
                  <li key={item} className="flex gap-4">
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                    />
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                        {t(`programs.ambassador.rewards.${item}.title`)}
                      </h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                        {t(`programs.ambassador.rewards.${item}.body`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
              <SectionLabel>{t('programs.ambassador.benefitsLabel')}</SectionLabel>
              <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                {t('programs.ambassador.benefitsTitle')}
              </h3>
              <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                {BENEFITS.map((item) => (
                  <li key={item} className="flex gap-4">
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                    />
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                        {t(`programs.ambassador.benefits.${item}.title`)}
                      </h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                        {t(`programs.ambassador.benefits.${item}.body`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
              <SectionLabel>{t('programs.ambassador.guidelinesLabel')}</SectionLabel>
              <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                {t('programs.ambassador.guidelinesTitle')}
              </h3>
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

            <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
              <SectionLabel>{t('programs.ambassador.applyLabel')}</SectionLabel>
              <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                {t('programs.ambassador.applyTitle')}
              </h3>

              <div className="mt-8 border border-[var(--bm-border)] bg-[var(--bm-surface)] p-6 sm:p-8">
                {submitted ? (
                  <div className="py-10 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-600 dark:text-orange-400">
                      {t('programs.ambassador.submitted')}
                    </p>
                    <h4 className="mt-3 text-xl font-semibold text-gray-900 dark:text-neutral-100">
                      {t('programs.ambassador.receivedTitle')}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                      {t('programs.ambassador.receivedBody')}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleAmbassadorSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300">
                          {t('programs.ambassador.form.fullName')}
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleAmbassadorChange}
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
                          onChange={handleAmbassadorChange}
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
                          onChange={handleAmbassadorChange}
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
                          onChange={handleAmbassadorChange}
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
                            onChange={handleAmbassadorChange}
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
                            onChange={handleAmbassadorChange}
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
                        onChange={handleAmbassadorChange}
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
                        onChange={handleAmbassadorChange}
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
    </div>
  );
}
