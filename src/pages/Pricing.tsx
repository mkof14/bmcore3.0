import { useState, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import BackButton from '../components/BackButton';
import PageHero from '../components/PageHero';
import { pageHeroUrl } from '../data/pageHeroes';
import PaymentConfirmationModal from '../components/PaymentConfirmationModal';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { generateProductSchema, injectStructuredData } from '../lib/structuredData';

interface PricingProps {
  onNavigate: (page: string) => void;
}

type PlanId = 'core' | 'daily' | 'max';

type PlanDef = {
  id: PlanId;
  monthlyPrice: number;
  yearlyPrice: number;
  categoryCount: string;
  popular?: boolean;
};

type Plan = PlanDef & {
  name: string;
  description: string;
  categories: string;
  features: string[];
};

const PLAN_DEFS: PlanDef[] = [
  { id: 'core', monthlyPrice: 19, yearlyPrice: 190, categoryCount: '3' },
  { id: 'daily', monthlyPrice: 39, yearlyPrice: 390, categoryCount: '10', popular: true },
  { id: 'max', monthlyPrice: 79, yearlyPrice: 790, categoryCount: '20' },
];

/** String cells reference `pricing.compare.values.*`; booleans render as a dot or dash. */
const COMPARISON: ReadonlyArray<{
  key: string;
  core: boolean | string;
  daily: boolean | string;
  max: boolean | string;
}> = [
  { key: 'dashboard', core: 'basic', daily: 'advanced', max: 'advanced' },
  { key: 'categories', core: 'n3', daily: 'n10', max: 'all20' },
  { key: 'storage', core: 'gb10', daily: 'gb50', max: 'gb200' },
  { key: 'reports', core: 'monthly', daily: 'daily', max: 'realtime' },
  { key: 'support', core: 'email', daily: 'priorityEmail', max: 'priority247' },
  { key: 'encryption', core: true, daily: true, max: true },
  { key: 'devices', core: 'upTo2', daily: 'upTo5', max: 'unlimited' },
  { key: 'assistant', core: false, daily: true, max: true },
  { key: 'labs', core: false, daily: true, max: true },
  { key: 'genetics', core: false, daily: true, max: true },
  { key: 'predictive', core: false, daily: false, max: true },
  { key: 'customReports', core: false, daily: false, max: true },
  { key: 'family', core: false, daily: false, max: 'upTo5' },
  { key: 'api', core: false, daily: false, max: true },
];

type Testimonial = { quote: string; author: string; plan: string };
type Reason = { index: string; title: string; body: string };
type FaqEntry = { question: string; answer: string };

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

export default function Pricing({ onNavigate }: PricingProps) {
  const { t } = useTranslation();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'cancelled' | null>(null);

  const plans = useMemo<Plan[]>(
    () =>
      PLAN_DEFS.map((def) => {
        const features = t(`pricing.plans.${def.id}.features`, { returnObjects: true }) as unknown;
        return {
          ...def,
          name: t(`pricing.plans.${def.id}.name`),
          description: t(`pricing.plans.${def.id}.description`),
          categories: t(`pricing.plans.${def.id}.categories`),
          features: Array.isArray(features) ? (features as string[]) : [],
        };
      }),
    [t]
  );

  const testimonials = useMemo<Testimonial[]>(() => {
    const raw = t('pricing.testimonials.items', { returnObjects: true }) as unknown;
    return Array.isArray(raw) ? (raw as Testimonial[]) : [];
  }, [t]);

  const reasons = useMemo<Reason[]>(() => {
    const raw = t('pricing.why.items', { returnObjects: true }) as unknown;
    return Array.isArray(raw) ? (raw as Reason[]) : [];
  }, [t]);

  const faqs = useMemo<FaqEntry[]>(() => {
    const raw = t('pricing.faq.items', { returnObjects: true }) as unknown;
    return Array.isArray(raw) ? (raw as FaqEntry[]) : [];
  }, [t]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
      window.history.replaceState({}, '', '/pricing');
    }
  }, []);

  useEffect(() => {
    plans.forEach((plan) => {
      const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
      const productSchema = generateProductSchema({
        name: `BioMath Core ${plan.name} Plan`,
        description: plan.description,
        image: '/biomathcore_emblem_1024.png',
        price: price.toString(),
        currency: 'USD',
        availability: 'https://schema.org/InStock',
        rating: 4.8,
        reviewCount: 127,
      });
      injectStructuredData(productSchema);
    });
  }, [billingPeriod, plans]);

  const getPrice = (plan: Plan) =>
    billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

  const cellValue = (value: boolean | string) =>
    typeof value === 'boolean' ? value : t(`pricing.compare.values.${value}`);

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
      if (!user) {
        throw new Error('Not authenticated');
      }

      setError(t('pricing.errors.processingUnavailable'));
      setIsProcessing(false);
    } catch (err: any) {
      if (err.message && err.message.includes('REDIRECT')) {
        return;
      }

      if (err.message && err.message.includes('Stripe secret key not configured')) {
        setError(t('pricing.errors.notConfigured'));
      } else if (err.message && err.message.includes('Missing required environment variables')) {
        setError(t('pricing.errors.configError'));
      } else if (err.message === 'Not authenticated') {
        setError(t('pricing.errors.notAuthenticated'));
      } else {
        setError(err.message || t('pricing.errors.checkoutFailed'));
      }

      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-page text-gray-900 transition-colors dark:text-neutral-100">
      <SEO
        title={t('pricing.seoTitle')}
        description={t('pricing.seoDescription')}
        keywords={[
          'health analytics cost',
          'wellness subscription pricing',
          'health monitoring plans',
          'affordable health tracking',
          'AI health service cost',
        ]}
        url="/pricing"
      />

      <div className="pt-16">
        <PageHero
          imageSrc={pageHeroUrl('pricing')}
          label={t('pricing.label')}
          title={t('pricing.title')}
          subtitle={t('pricing.subtitle')}
        />
      </div>

      <div className="pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <div className="pt-6">
            <BackButton onNavigate={onNavigate} />
          </div>

          {paymentStatus === 'cancelled' && (
            <div className="mb-8 border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-center">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {t('pricing.paymentCancelled')}
              </p>
            </div>
          )}

          <section className="border-b border-[var(--bm-border)] pb-10 pt-4 text-center">
            <div className="inline-flex items-center border border-[var(--bm-border)] bg-[var(--bm-surface)] p-1">
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`px-7 py-2.5 text-sm font-semibold transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-gray-900 text-white dark:bg-neutral-100 dark:text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100'
                }`}
              >
                {t('pricing.monthly')}
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
                {t('pricing.yearly')}
                <span className="ml-2 text-[11px] font-medium text-orange-600 dark:text-orange-400">
                  −17%
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
                        {t('pricing.mostPopular')}
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
                        /{billingPeriod === 'monthly' ? t('pricing.perMonth') : t('pricing.perYear')}
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
                      {t('pricing.getStarted')}
                    </button>
                  </article>
                );
              })}
            </div>

            <p className="mt-8 text-center text-sm text-gray-600 dark:text-neutral-400">
              <Trans
                i18nKey="pricing.trialNote"
                components={{
                  b: <span className="font-medium text-gray-900 dark:text-neutral-100" />,
                }}
              />
            </p>
          </section>

          {/* Compare */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <header className="mb-10 max-w-2xl">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
                {t('pricing.compare.label')}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
                {t('pricing.compare.title')}
              </h2>
            </header>

            <div className="overflow-hidden border border-[var(--bm-border)] bg-[var(--bm-surface)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-[var(--bm-border)] bg-page">
                      <th className="px-5 py-4 text-left text-sm font-semibold text-gray-900 dark:text-neutral-100 sm:px-6">
                        {t('pricing.compare.featureColumn')}
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 dark:text-neutral-100">
                        {t('pricing.plans.core.name')}
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-orange-600 dark:text-orange-400">
                        {t('pricing.plans.daily.name')}
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 dark:text-neutral-100">
                        {t('pricing.plans.max.name')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((feature) => (
                      <tr
                        key={feature.key}
                        className="border-b border-[var(--bm-border)] last:border-0"
                      >
                        <td className="px-5 py-3.5 text-sm text-gray-900 dark:text-neutral-100 sm:px-6">
                          {t(`pricing.compare.rows.${feature.key}`)}
                        </td>
                        <td className="px-4 py-3.5 text-center text-sm">
                          <CellValue
                            value={cellValue(feature.core)}
                            includedLabel={t('pricing.compare.included')}
                          />
                        </td>
                        <td className="px-4 py-3.5 text-center text-sm">
                          <CellValue
                            value={cellValue(feature.daily)}
                            includedLabel={t('pricing.compare.included')}
                          />
                        </td>
                        <td className="px-4 py-3.5 text-center text-sm">
                          <CellValue
                            value={cellValue(feature.max)}
                            includedLabel={t('pricing.compare.included')}
                          />
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
                {t('pricing.testimonials.label')}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
                {t('pricing.testimonials.title')}
              </h2>
            </header>

            <div className="grid gap-8 md:grid-cols-3 md:gap-10">
              {testimonials.map((item) => (
                <figure key={item.author} className="border-t border-[var(--bm-border)] pt-5">
                  <blockquote className="text-[15px] leading-relaxed text-gray-700 dark:text-neutral-300">
                    “{item.quote}”
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
                {t('pricing.why.label')}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
                {t('pricing.why.title')}
              </h2>
            </header>

            <div className="grid gap-10 md:grid-cols-3 md:gap-8">
              {reasons.map((item) => (
                <article key={item.index}>
                  <span
                    aria-hidden
                    className="mb-4 block h-px w-8 bg-orange-500/70 dark:bg-orange-400/55"
                  />
                  <p className="mb-2 text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {item.index}
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
                {t('pricing.faq.label')}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
                {t('pricing.faq.title')}
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
                {t('pricing.faq.moreTitle')}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('about')}
                className="mt-2 text-sm font-semibold text-orange-700 transition-colors hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
              >
                {t('pricing.faq.moreLink')}
              </button>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="py-14 lg:py-16">
            <div className="border border-[var(--bm-border)] bg-[var(--bm-surface)] px-6 py-12 text-center sm:px-10">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl">
                {t('pricing.closing.title')}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
                {t('pricing.closing.description')}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <button
                  type="button"
                  onClick={() => handleSelectPlan(plans[1])}
                  className="w-full bg-orange-500 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-400 sm:w-auto"
                >
                  {t('pricing.closing.primary')}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="w-full border border-[var(--bm-border)] bg-page px-8 py-3.5 text-sm font-semibold text-gray-900 transition-colors hover:border-orange-500/40 dark:text-neutral-100 sm:w-auto"
                >
                  {t('pricing.closing.secondary')}
                </button>
              </div>
            </div>

            <p className="mt-8 text-center text-xs tracking-wide text-gray-500 dark:text-neutral-500">
              {t('pricing.closing.note')}
            </p>
          </section>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md border border-red-500/30 bg-red-600 px-5 py-4 text-white shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="mb-1 font-semibold">{t('pricing.errors.title')}</div>
              <div className="text-sm">{error}</div>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-white/80 transition-colors hover:text-white"
              aria-label={t('pricing.errors.dismiss')}
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
