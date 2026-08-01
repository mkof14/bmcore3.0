import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, ArrowRight, CheckCircle, Info, Hexagon, Layers, Crown } from 'lucide-react';
import { Heart, Brain, Users, Activity, Sun, Moon, Shield, Apple, Leaf, Eye, Tablet, Hourglass, Dumbbell, Flower2, User, Droplets, HeartHandshake, Smartphone, Fingerprint, Target, Blend } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { serviceCategories, serviceDetailPath } from '../../data/services';
import ReportBrandHeader from '../../components/report/ReportBrandHeader';
import { localizeCategory, localizeService } from '../../lib/localizeServices';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart, Brain, Users, Activity, Sun, Moon, Shield, Apple, Leaf,
  Eye, Tablet, Hourglass, Dumbbell, Flower2, User, Droplets,
  HeartHandshake, Smartphone, Fingerprint, Target, Blend
};

const categoryColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  'critical-health': { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-500/30', icon: 'text-orange-600 dark:text-orange-400' },
  'everyday-wellness': { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-500/30', icon: 'text-green-600 dark:text-green-400' },
  'longevity': { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-500/30', icon: 'text-pink-600 dark:text-pink-400' },
  'mental-wellness': { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-500/30', icon: 'text-cyan-600 dark:text-cyan-400' },
  'fitness-performance': { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-500/30', icon: 'text-yellow-600 dark:text-yellow-400' },
  'womens-health': { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-500/30', icon: 'text-pink-600 dark:text-pink-400' },
  'mens-health': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/30', icon: 'text-blue-600 dark:text-blue-400' },
  'beauty-skincare': { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-500/30', icon: 'text-pink-600 dark:text-pink-400' },
  'nutrition-diet': { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-500/30', icon: 'text-green-600 dark:text-green-400' },
  'sleep-recovery': { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-500/30', icon: 'text-indigo-600 dark:text-indigo-400' },
  'environmental-health': { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-500/30', icon: 'text-teal-600 dark:text-teal-400' },
  'family-health': { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-500/30', icon: 'text-orange-600 dark:text-orange-400' },
  'preventive-medicine': { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-500/30', icon: 'text-cyan-600 dark:text-cyan-400' },
  'biohacking': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/30', icon: 'text-blue-600 dark:text-blue-400' },
  'senior-care': { bg: 'bg-amber-800/10', text: 'text-amber-900 dark:text-amber-500', border: 'border-amber-300 dark:border-amber-700/40', icon: 'text-amber-800 dark:text-amber-500' },
  'eye-health': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/30', icon: 'text-blue-600 dark:text-blue-400' },
  'digital-therapeutics': { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-500/30', icon: 'text-indigo-600 dark:text-indigo-400' },
  'general-sexual': { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-500/30', icon: 'text-red-600 dark:text-red-400' },
  'mens-sexual-health': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/30', icon: 'text-blue-600 dark:text-blue-400' },
  'womens-sexual-health': { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-500/30', icon: 'text-pink-600 dark:text-pink-400' },
};

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  tier_level: number;
  monthly_price_cents: number;
  value_message: string;
}

interface CatalogSectionProps {
  onSectionChange?: (section: string) => void;
  onOpenService?: (servicePath: string) => void;
}

export default function CatalogSection({ onSectionChange, onOpenService }: CatalogSectionProps) {
  const { t } = useTranslation();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const localizedCategories = useMemo(
    () =>
      serviceCategories.map((category) => ({
        ...localizeCategory(t, category),
        services: category.services.map((service) =>
          localizeService(t, category.id, service),
        ),
      })),
    [t],
  );

  useEffect(() => {
    loadPlansAndSubscription();
  }, []);

  const loadPlansAndSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let hadError = false;

      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('tier_level');

      if (plansError) {
        setError('Unable to load subscription plans.');
        showNotification('error', 'Catalog data load failed');
        hadError = true;
      }

      if (plansData) {
        setPlans(plansData);
      }

      if (user) {
        const { data: subData, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (subError) {
          setError('Unable to load your subscription.');
          showNotification('error', 'Catalog data load failed');
          hadError = true;
        }

        setUserSubscription(subData);
      }
      if (!hadError) {
        setError(null);
      }
    } catch (error) {
      showNotification('error', 'Catalog data load failed');
      setError('Catalog data load failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUpgrade = async () => {
    if (selectedCount === 0) {
      showNotification('error', 'Please select at least one category to upgrade');
      return;
    }

    setUpgrading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showNotification('error', 'Please sign in to upgrade');
        setUpgrading(false);
        return;
      }

      showNotification('success', `Redirecting to pricing page for ${currentPlan} plan...`);

      // Redirect to pricing page (public page, not member section)
      setTimeout(() => {
        window.history.pushState({ page: 'pricing' }, '', '/pricing');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 1500);

    } catch (error) {
      showNotification('error', 'Failed to process upgrade. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const selectedCount = selectedCategories.size;
  const corePrice = 1900;
  const dailyPrice = 3900;
  const maxPrice = 7900;

  let currentPlan = 'Free';
  let currentPrice = 0;
  let progress = 0;

  if (selectedCount === 0) {
    currentPlan = 'Free';
    currentPrice = 0;
    progress = 0;
  } else if (selectedCount <= 3) {
    currentPlan = 'Core';
    currentPrice = corePrice;
    progress = (selectedCount / 3) * 33;
  } else if (selectedCount <= 10) {
    currentPlan = 'Daily';
    currentPrice = dailyPrice;
    progress = 33 + ((selectedCount - 3) / 7) * 33;
  } else {
    currentPlan = 'Max';
    currentPrice = maxPrice;
    progress = 66 + ((selectedCount - 10) / 10) * 34;
  }

  progress = Math.min(100, progress);

  const getPlanIcon = (plan: string) => {
    if (plan === 'Core') return (
      <div className="relative">
        <Hexagon className="h-5 w-5" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full"></div>
      </div>
    );
    if (plan === 'Daily') return (
      <div className="relative">
        <Layers className="h-5 w-5" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full"></div>
      </div>
    );
    if (plan === 'Max') return (
      <div className="relative">
        <Crown className="h-5 w-5" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-slate-400 rounded-full"></div>
      </div>
    );
    return null;
  };

  const getPlanColor = (plan: string) => {
    if (plan === 'Core') return 'from-orange-500 to-orange-600';
    if (plan === 'Daily') return 'from-blue-500 to-blue-600';
    if (plan === 'Max') return 'from-slate-700 to-slate-800';
    return 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-8">
      {notification && (
        <div className={`fixed top-20 right-6 z-50 p-4 rounded-lg border-2 shadow-lg animate-in slide-in-from-right ${
          notification.type === 'success'
            ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/50 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-400'
        }`}>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <section className="text-center mb-8">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {t('member.catalog.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-2">
          {t('member.catalog.subtitle')}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          {t('member.catalog.hint')}
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gradient-to-br dark:from-[var(--bm-surface)] dark:to-gray-800 sm:p-8">
          <ReportBrandHeader variant="strip" subtitle="Full Services" className="mb-4" />
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('member.catalog.openService')}</h3>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Full commercial workspace: questions, dual AI second opinion, FAQ, learning, reports, and exports.
            </p>
          </div>

          <div className="space-y-6">
            {localizedCategories.map((category) => {
              const colors = categoryColors[category.id] || categoryColors['critical-health'];
              return (
                <div key={category.id}>
                  <h4 className={`mb-3 text-sm font-bold ${colors.text}`}>{category.name}</h4>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {category.services.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => onOpenService?.(serviceDetailPath(category.id, service.id))}
                        className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-left transition hover:border-orange-300 hover:bg-white dark:border-gray-700 dark:bg-[var(--bm-surface)]/50 dark:hover:border-orange-500/40"
                      >
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{service.name}</div>
                        <div className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                          {service.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>


      <div className="group relative bg-white/90 dark:bg-gradient-to-br dark:from-[var(--bm-surface)] dark:via-gray-800 dark:to-[var(--bm-surface)] border border-slate-200 dark:border-gray-700/50 rounded-2xl p-6 hover:border-orange-600/50 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-md">
        <ReportBrandHeader variant="strip" subtitle="Plan Calculator" className="mb-4" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t('member.catalog.planCalculator')}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('member.catalog.planCalculatorHint')}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                ${(currentPrice / 100).toFixed(0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-500">per month</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {selectedCount} of 20 categories selected
                </span>
                {selectedCount > 0 && (
                  <button
                    onClick={() => setSelectedCategories(new Set())}
                    className="text-xs px-3 py-1.5 bg-red-100 dark:bg-red-500/30 hover:bg-red-200 dark:hover:bg-red-500/50 text-red-700 dark:text-red-300 font-semibold rounded-md border border-red-200 dark:border-red-500/50 transition-all hover:scale-105 shadow-sm"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <span className={`text-xs font-bold ${currentPlan === 'Free' ? 'text-gray-500' : 'bg-gradient-to-r ' + getPlanColor(currentPlan) + ' bg-clip-text text-transparent'}`}>
                {currentPlan} Plan
              </span>
            </div>
            <div className="relative h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getPlanColor(currentPlan)} transition-all duration-500 ease-out shadow-lg`}
                style={{ width: `${progress}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-bold">
                <span className={selectedCount > 0 ? 'text-white drop-shadow-lg' : 'text-gray-500 dark:text-gray-600'}>Core</span>
                <span className={selectedCount > 3 ? 'text-white drop-shadow-lg' : 'text-gray-500 dark:text-gray-600'}>Daily</span>
                <span className={selectedCount > 10 ? 'text-white drop-shadow-lg' : 'text-gray-500 dark:text-gray-600'}>Max</span>
              </div>
            </div>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            <div className={`group/card relative bg-white/90 dark:bg-gradient-to-b dark:from-gray-800/50 dark:to-[var(--bm-surface)]/50 border-2 rounded-lg p-3 transition-all duration-300 overflow-hidden shadow-sm ${selectedCount <= 3 && selectedCount > 0 ? 'border-orange-500 shadow-lg shadow-orange-500/20' : 'border-slate-200 dark:border-gray-700/40 hover:border-orange-600/40'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-900/0 to-orange-900/5 opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover/card:shadow-lg group-hover/card:shadow-orange-600/30 transition-all">
                  <Hexagon className={`h-5 w-5 text-white`} />
                </div>
                <h3 className={`text-center font-bold text-base mb-0.5 ${selectedCount <= 3 && selectedCount > 0 ? 'text-orange-500' : 'text-gray-900 dark:text-white'}`}>Core</h3>
                <div className="text-center">
                  <div className={`text-xl font-bold mb-0.5 ${selectedCount <= 3 && selectedCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-400'}`}>$19</div>
                  <p className="text-[10px] text-gray-600 dark:text-gray-500 mb-2">per month</p>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-[9px] text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-2.5 h-2.5 text-orange-600 flex-shrink-0" />
                      <span>Any 3 categories</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[9px] text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-2.5 h-2.5 text-orange-600 flex-shrink-0" />
                      <span>Basic AI insights</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`group/card relative bg-white/90 dark:bg-gradient-to-b dark:from-gray-800/50 dark:to-[var(--bm-surface)]/50 border-2 rounded-lg p-3 transition-all duration-300 overflow-hidden shadow-sm ${selectedCount > 3 && selectedCount <= 10 ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-slate-200 dark:border-gray-700/40 hover:border-blue-600/40'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/0 to-blue-900/5 opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover/card:shadow-lg group-hover/card:shadow-blue-600/30 transition-all">
                  <Layers className={`h-5 w-5 text-white`} />
                </div>
                <h3 className={`text-center font-bold text-base mb-0.5 ${selectedCount > 3 && selectedCount <= 10 ? 'text-blue-600' : 'text-gray-900 dark:text-white'}`}>Daily</h3>
                <div className="text-center">
                  <div className={`text-xl font-bold mb-0.5 ${selectedCount > 3 && selectedCount <= 10 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-400'}`}>$39</div>
                  <p className="text-[10px] text-gray-600 dark:text-gray-500 mb-2">per month</p>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-[9px] text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-2.5 h-2.5 text-blue-600 flex-shrink-0" />
                      <span>4-10 categories</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[9px] text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-2.5 h-2.5 text-blue-600 flex-shrink-0" />
                      <span>Advanced analytics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`group/card relative bg-white/90 dark:bg-gradient-to-b dark:from-gray-800/50 dark:to-[var(--bm-surface)]/50 border-2 rounded-lg p-3 transition-all duration-300 overflow-hidden shadow-sm ${selectedCount > 10 ? 'border-slate-600 shadow-lg shadow-slate-500/20' : 'border-slate-200 dark:border-gray-700/40 hover:border-slate-600/40'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/0 to-slate-900/10 opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover/card:shadow-lg group-hover/card:shadow-slate-600/30 transition-all">
                  <Crown className={`h-5 w-5 text-white`} />
                </div>
                <h3 className={`text-center font-bold text-base mb-0.5 ${selectedCount > 10 ? 'text-slate-700 dark:text-slate-300' : 'text-gray-900 dark:text-white'}`}>Max</h3>
                <div className="text-center">
                  <div className={`text-xl font-bold mb-0.5 ${selectedCount > 10 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-400'}`}>$79</div>
                  <p className="text-[10px] text-gray-600 dark:text-gray-500 mb-2">per month</p>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-[9px] text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-2.5 h-2.5 text-slate-600 flex-shrink-0" />
                      <span>All 20 categories</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[9px] text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-2.5 h-2.5 text-slate-600 flex-shrink-0" />
                      <span>Premium features</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {selectedCount > 0 && (
            <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
              currentPlan === 'Core' ? 'border-orange-300 bg-orange-50 dark:border-orange-500 dark:bg-orange-500/10' :
              currentPlan === 'Daily' ? 'border-blue-300 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10' :
              'border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-500/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getPlanIcon(currentPlan)}
                  <div>
                    <div className="font-bold text-base text-gray-900 dark:text-white">{currentPlan} Plan Selected</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{selectedCount} categories • ${(currentPrice / 100).toFixed(0)}/month</div>
                  </div>
                </div>
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${getPlanColor(currentPlan)} text-white font-bold rounded-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span>{upgrading ? 'Processing...' : 'Upgrade Now'}</span>
                  {!upgrading && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{t('member.catalog.selectTitle')}</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Click categories to add them to your plan. Each includes multiple AI services.
        </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {localizedCategories.map((category) => {
            const Icon = iconMap[category.icon] || Activity;
            const colors = categoryColors[category.id] || categoryColors['critical-health'];
            const isSelected = selectedCategories.has(category.id);

            return (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`group/item relative bg-white/90 dark:bg-gradient-to-b dark:from-gray-800/50 dark:to-[var(--bm-surface)]/50 border-2 rounded-xl p-5 transition-all duration-300 hover:scale-105 overflow-hidden shadow-sm ${
                  isSelected
                    ? `${colors.border} shadow-lg`
                    : 'border-slate-200 dark:border-gray-700/40 hover:border-gray-300 dark:hover:border-gray-600/60'
                }`}
              >
                <ReportBrandHeader variant="strip" subtitle={category.name} className="mb-3" />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-900/0 to-orange-900/5 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>

                {isSelected && (
                  <div className="absolute top-3 right-3 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}

                <div className="relative flex flex-col items-center text-center space-y-3">
                  <div className={`w-14 h-14 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center group-hover/item:shadow-lg transition-all`}>
                    <Icon className={`h-7 w-7 ${colors.icon}`} />
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm mb-1 ${isSelected ? colors.text : 'text-gray-900 dark:text-gray-300'}`}>
                      {category.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-500">
                      {category.services.length} services
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selectedCount > 0 && (
        <section className="bg-white dark:bg-gradient-to-br dark:from-[var(--bm-surface)] dark:to-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
          <ReportBrandHeader variant="strip" subtitle="Selected Categories" className="mb-4" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('member.catalog.selectedTitle')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('member.catalog.selectedSubtitle')}</p>
            </div>
            <div className="px-4 py-2 bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30 rounded-lg">
              <span className="text-green-700 dark:text-green-400 font-bold">{selectedCount} selected</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {Array.from(selectedCategories).map((categoryId) => {
              const category = localizedCategories.find(c => c.id === categoryId);
              if (!category) return null;

              const Icon = iconMap[category.icon] || Activity;
              const colors = categoryColors[categoryId] || categoryColors['critical-health'];

              return (
                <div
                  key={categoryId}
                  className={`group flex items-center space-x-3 pl-4 pr-3 py-3 rounded-full ${colors.bg} border ${colors.border} hover:shadow-lg transition-all`}
                >
                  <Icon className={`h-5 w-5 ${colors.icon}`} />
                  <span className={`text-sm font-semibold ${colors.text}`}>{category.name}</span>
                  <button
                    onClick={() => toggleCategory(categoryId)}
                    className="ml-2 p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-300" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="bg-white dark:bg-gradient-to-br dark:from-[var(--bm-surface)] dark:via-gray-800 dark:to-[var(--bm-surface)] border border-gray-200 dark:border-gray-700/50 rounded-2xl p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('member.catalog.nextSteps')}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              After you upgrade, we'll guide you through health questionnaires that help personalize your insights.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
