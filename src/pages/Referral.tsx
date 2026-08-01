import { Copy, Mail, Share2, Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';

interface ReferralProps {
  onNavigate: (page: string) => void;
}

const STEPS = ['share', 'discount', 'credit'] as const;

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

export default function Referral({ onNavigate }: ReferralProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const referralCode = 'BIOMATH-USER123';
  const referralLink = `https://biomathcore.com/signup?ref=${referralCode}`;

  const stats = {
    totalReferred: 8,
    creditsEarned: 80,
    activeReferrals: 6,
  };

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

  const inputClassName =
    'w-full border border-[var(--bm-border)] bg-page px-4 py-3 text-gray-900 transition-colors focus:border-orange-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 dark:text-neutral-100';

  return (
    <div className="min-h-screen bg-page transition-colors">
      <div className="pt-20 pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <BackButton onNavigate={onNavigate} />

          {/* Hero */}
          <section className="border-b border-[var(--bm-border)] pb-14 pt-8 lg:pb-16 lg:pt-10">
            <SectionLabel>{t('programs.referral.label')}</SectionLabel>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-5xl md:text-[3.25rem] md:leading-[1.12]">
              {t('programs.referral.heroTitle')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-lg">
              {t('programs.referral.heroSubtitle')}
            </p>
          </section>

          {/* Stats */}
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

          {/* How it works */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('programs.referral.howLabel')}</SectionLabel>
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                  {t('programs.referral.howTitle')}
                </h2>
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

              <div className="border border-[var(--bm-border)] bg-[var(--bm-surface)] p-6 sm:p-8">
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

          {/* Referral code + sharing */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('programs.referral.shareLabel')}</SectionLabel>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
              {t('programs.referral.codeTitle')}
            </h2>

            <div className="mt-8 border border-[var(--bm-border)] bg-[var(--bm-surface)] p-6 sm:p-8">
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
                <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                  {t('programs.referral.inviteTitle')}
                </h3>
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
                <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                  {t('programs.referral.socialTitle')}
                </h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {(['twitter', 'facebook', 'linkedin', 'whatsapp'] as const).map((network) => (
                    <button
                      key={network}
                      type="button"
                      onClick={() => shareToSocial(network)}
                      className="inline-flex items-center gap-2 border border-[var(--bm-border)] bg-page px-4 py-2 text-sm text-gray-700 transition-colors hover:border-orange-500/40 dark:text-neutral-300"
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

          {/* Program details */}
          <section className="py-14 lg:py-16">
            <SectionLabel>{t('programs.referral.detailsLabel')}</SectionLabel>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
              {t('programs.referral.detailsTitle')}
            </h2>
            <div className="mt-10 grid gap-10 sm:grid-cols-2">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                  {t('programs.referral.eligibility')}
                </h3>
                <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-neutral-400">
                  {stringList(t('programs.referral.eligibilityItems', { returnObjects: true })).map(
                    (item) => (
                      <li key={item}>{item}</li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">
                  {t('programs.referral.fraud')}
                </h3>
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
              <button
                type="button"
                onClick={() => onNavigate('ambassador')}
                className="font-medium text-orange-700 transition-colors hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
              >
                {t('programs.referral.upgradeLink')}
              </button>{' '}
              {t('programs.referral.upgradeSuffix')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
