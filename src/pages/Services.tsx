import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';
import PaymentConfirmationModal from '../components/PaymentConfirmationModal';
import { supabase } from '../lib/supabase';
import { startCheckout } from '../lib/pay';
import SEO from '../components/SEO';
import { tList } from '../i18n/tList';

interface ServicesProps {
  onNavigate: (page: string) => void;
}

type PlanCopy = {
  name: string;
  description: string;
  categories: string;
  features: string[];
};

type Plan = PlanCopy & {
  id: string;
  monthlyPrice: number;
  yearlyPrice: number;
  categoryCount: string;
  popular?: boolean;
};

const PLAN_META = [
  { id: 'core', monthlyPrice: 19, yearlyPrice: 190, categoryCount: '3', popular: false },
  { id: 'daily', monthlyPrice: 39, yearlyPrice: 390, categoryCount: '10', popular: true },
  { id: 'max', monthlyPrice: 79, yearlyPrice: 790, categoryCount: '20', popular: false },
];

type ComparisonRow = {
  name: string;
  core: boolean | string;
  daily: boolean | string;
  max: boolean | string;
};

type Testimonial = { quote: string; author: string; plan: string };
type Reason = { title: string; body: string };
type Faq = { question: string; answer: string };

function CellValue({ value, includedLabel }: { value: boolean | string; includedLabel: string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <span
        aria-label={includedLabel}
        className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500 dark:bg-orange-400"
      />
    ) : (
      <span className="text-gray-400 dark:text-neutral-600">—</span>
    );
  }
  return <span className="text-gray-700 dark:text-neutral-300">{value}</span>;
}

export default function Services({ onNavigate }: ServicesProps) {
  const { t } = useTranslation();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planCopy = tList<PlanCopy>(t, 'services.plans.items');
  const plans: Plan[] = PLAN_META.map((meta, i) => ({
    ...meta,
    name: planCopy[i]?.name ?? '',
    description: planCopy[i]?.description ?? '',
    categories: planCopy[i]?.categories ?? '',
    features: planCopy[i]?.features ?? [],
  }));

  const comparison = tList<ComparisonRow>(t, 'services.compare.rows');
  const testimonials = tList<Testimonial>(t, 'services.testimonials.items');
  const reasons = tList<Reason>(t, 'services.why.items');
  const faqs = tList<Faq>(t, 'services.faq.items');
  const includedLabel = t('services.compare.included');

  const getPrice = (plan: Plan) =>
    billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

  async function createSubscription(
    _userId: string,
    planId: string,
    period: 'monthly' | 'yearly'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('stripe_price_id_monthly, stripe_price_id_annual')
        .eq('id', planId)
        .maybeSingle();

      if (planError) throw planError;

      const priceId =
        period === 'monthly' ? plan?.stripe_price_id_monthly : plan?.stripe_price_id_annual;
      if (!priceId) {
        throw new Error(t('services.errors.priceNotConfigured'));
      }

      await startCheckout(priceId);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : t('services.errors.subscriptionFailed'),
      };
    }
  }

  async function handleSelectPlan(plan: Plan) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      onNavigate('signin');
      return;
    }

    setSelectedPlan(plan);
    setShowConfirmation(true);
    setError(null);
  }

  async function handleConfirmPayment() {
    if (!selectedPlan) return;

    setIsProcessing(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(t('services.errors.notAuthenticated'));

      const result = await createSubscription(user.id, selectedPlan.id, billingPeriod);

      if (!result.success) {
        throw new Error(result.error || t('services.errors.subscriptionFailed'));
      }

      setShowConfirmation(false);
      setSelectedPlan(null);
      onNavigate('member-zone');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('services.errors.paymentFailed'));
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-page text-gray-900 transition-colors dark:text-neutral-100">
      <SEO
        title={t('services.seo.title')}
        description={t('services.seo.description')}
        keywords={[
          'health analytics pricing',
          'subscription plans',
          'health monitoring service',
          'wellness plans',
          'AI health tracking cost',
          'personalized health service',
        ]}
        url="/services"
      />

      <div className="pt-20 pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <BackButton onNavigate={onNavigate} />

          {/* Hero */}
          <section className="border-b border-[var(--bm-border)] pb-12 pt-8 text-center lg:pb-14 lg:pt-10">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
              {t('services.hero.label')}
            </p>
            <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-5xl md:text-[3.25rem] md:leading-[1.12]">
              {t('services.hero.title')}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-lg">
              {t('services.hero.body')}
            </p>

            <div className="mt-9 inline-flex items-center border border-[var(--bm-border)] bg-[var(--bm-surface)] p-1">
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`px-7 py-2.5 text-sm font-semibold transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-gray-900 text-white dark:bg-neutral-100 dark:text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100'
                }`}
              >
                {t('services.hero.monthly')}
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('yearly')}
                className={`px-7 py-2.5 text-sm font-semibold transition-colors ${
                  billingPeriod === 'yearly'
                    ? 'bg-gray-900 text-white dark:bg-neutral-100 dark:text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100'
                }`}
              >
                {t('services.hero.yearly')}
                <span className="ml-2 text-[11px] font-medium text-orange-600 dark:text-orange-400">
                  {t('services.hero.yearlySaving')}
                </span>
              </button>
            </div>
          </section>

          {/* Plans */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <div className="grid gap-6 md:grid-cols-3 md:gap-5 lg:gap-6">
              {plans.map((plan) => {
                const price = getPrice(plan);
                const isPopular = Boolean(plan.popular);

                return (
                  <article
                    key={plan.id}
                    className={`relative flex flex-col border bg-[var(--bm-surface)] p-7 sm:p-8 ${
                      isPopular
                        ? 'border-orange-500/55 dark:border-orange-400/45'
                        : 'border-[var(--bm-border)]'
                    }`}
                  >
                    {isPopular && (
                      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-600 dark:text-orange-400">
                        {t('services.plans.mostPopular')}
                      </p>
                    )}

                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                      {plan.name}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                      {plan.description}
                    </p>

                    <div className="mt-6 flex items-baseline gap-1.5">
                      <span className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-5xl">
                        ${price}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-neutral-500">
                        {billingPeriod === 'monthly'
                          ? t('services.plans.perMonth')
                          : t('services.plans.perYear')}
                      </span>
                    </div>

                    <div className="mt-6 border-t border-[var(--bm-border)] pt-5">
                      <p className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                        {plan.categoryCount}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-500">
                        {plan.categories}
                      </p>
                    </div>

                    <ul className="mt-6 flex-1 space-y-2.5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700 dark:text-neutral-300"
                        >
                          <span
                            aria-hidden
                            className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan)}
                      className={`mt-8 w-full py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 ${
                        isPopular
                          ? 'bg-orange-500 text-white hover:bg-orange-400'
                          : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-gray-900 dark:hover:bg-white'
                      }`}
                    >
                      {t('services.plans.getStarted')}
                    </button>
                  </article>
                );
              })}
            </div>

            <p className="mt-8 text-center text-sm text-gray-600 dark:text-neutral-400">
              <Trans
                i18nKey="services.plans.trialNote"
                components={{
                  strong: <span className="font-medium text-gray-900 dark:text-neutral-100" />,
                }}
              />
            </p>
          </section>

          {/* Compare */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <header className="mb-10 max-w-2xl">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
                {t('services.compare.label')}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
                {t('services.compare.title')}
              </h2>
            </header>

            <div className="overflow-hidden border border-[var(--bm-border)] bg-[var(--bm-surface)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-[var(--bm-border)] bg-page">
                      <th className="px-5 py-4 text-left text-sm font-semibold text-gray-900 dark:text-neutral-100 sm:px-6">
                        {t('services.compare.featureHeader')}
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 dark:text-neutral-100">
                        {plans[0]?.name}
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-orange-600 dark:text-orange-400">
                        {plans[1]?.name}
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 dark:text-neutral-100">
                        {plans[2]?.name}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((feature) => (
                      <tr
                        key={feature.name}
                        className="border-b border-[var(--bm-border)] last:border-0"
                      >
                        <td className="px-5 py-3.5 text-sm text-gray-900 dark:text-neutral-100 sm:px-6">
                          {feature.name}
                        </td>
                        <td className="px-4 py-3.5 text-center text-sm">
                          <CellValue value={feature.core} includedLabel={includedLabel} />
                        </td>
                        <td className="px-4 py-3.5 text-center text-sm">
                          <CellValue value={feature.daily} includedLabel={includedLabel} />
                        </td>
                        <td className="px-4 py-3.5 text-center text-sm">
                          <CellValue value={feature.max} includedLabel={includedLabel} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <header className="mb-10 max-w-2xl">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
                {t('services.testimonials.label')}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
                {t('services.testimonials.title')}
              </h2>
            </header>

            <div className="grid gap-8 md:grid-cols-3 md:gap-10">
              {testimonials.map((item) => (
                <figure key={item.author} className="border-t border-[var(--bm-border)] pt-5">
                  <blockquote className="text-[15px] leading-relaxed text-gray-700 dark:text-neutral-300">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-gray-900 dark:text-neutral-100">
                      {item.author}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
                      {item.plan}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          {/* Why */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <header className="mb-10 max-w-2xl">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
                {t('services.why.label')}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
                {t('services.why.title')}
              </h2>
            </header>

            <div className="grid gap-10 md:grid-cols-3 md:gap-8">
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

          {/* FAQ */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <header className="mb-10 max-w-2xl">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
                {t('services.faq.label')}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
                {t('services.faq.title')}
              </h2>
            </header>

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

            <div className="mx-auto mt-12 max-w-3xl border-l-2 border-orange-500/70 pl-5 dark:border-orange-400/55">
              <p className="text-base leading-relaxed text-gray-700 dark:text-neutral-300">
                {t('services.faq.moreText')}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('about')}
                className="mt-2 text-sm font-semibold text-orange-700 transition-colors hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
              >
                {t('services.faq.moreCta')}
              </button>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="py-14 lg:py-16">
            <div className="border border-[var(--bm-border)] bg-[var(--bm-surface)] px-6 py-12 text-center sm:px-10">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl">
                {t('services.closing.title')}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
                {t('services.closing.body')}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
                <button
                  type="button"
                  onClick={() => {
                    const daily = plans[1];
                    if (daily) handleSelectPlan(daily);
                  }}
                  className="bm-cta-primary w-full sm:w-auto"
                >
                  {t('services.closing.ctaTrial')}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="bm-link"
                >
                  {t('services.closing.ctaContact')}
                </button>
              </div>
            </div>

            <p className="mt-8 text-center text-xs tracking-wide text-gray-500 dark:text-neutral-500">
              {t('services.closing.footnote')}
            </p>
          </section>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md border border-red-500/30 bg-red-600 px-5 py-4 text-white shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="mb-1 font-semibold">{t('services.errors.title')}</div>
              <div className="text-sm">{error}</div>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-white/80 transition-colors hover:text-white"
              aria-label={t('services.errors.dismiss')}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {selectedPlan && (
        <PaymentConfirmationModal
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            setSelectedPlan(null);
          }}
          onConfirm={handleConfirmPayment}
          plan={{
            name: selectedPlan.name,
            price:
              billingPeriod === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice,
            billingPeriod,
            categories: selectedPlan.categories,
            features: selectedPlan.features,
          }}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
