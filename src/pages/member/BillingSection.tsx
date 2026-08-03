import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  Download,
  Search,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  Shield,
  Hexagon,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError, notifyUserInfo } from '../../lib/adminNotify';

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  plan_name: string;
  billing_period_start: string;
  billing_period_end: string;
  created_at: string;
  paid_at: string | null;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  billing_period: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  reports_used_this_period: number;
  is_trial: boolean;
  trial_end: string | null;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  monthly_price_cents: number;
  annual_price_cents: number;
  max_reports_per_month: number | null;
}

interface UsageStats {
  reportsUsed: number;
  reportsLimit: number;
  devicesConnected: number;
  storageUsed: number;
  storageLimit: number;
}

export default function BillingSection() {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      let planData: SubscriptionPlan | null = null;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load subscription
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trial', 'past_due'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setSubscription(subData);

      // Load plan details
      if (subData) {
        const { data } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', subData.plan_id)
          .single();

        planData = data;
        setPlan(data);
      }

      // Load invoices
      const { data: invoicesData } = await supabase
        .from('subscription_invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setInvoices(invoicesData || []);

      // Calculate total paid
      const total = (invoicesData || [])
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0);
      setTotalPaid(total);

      const [deviceConnections, userDevices, blackBoxFiles, medicalFiles] = await Promise.all([
        supabase
          .from('device_connections')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('user_devices')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('black_box_files')
          .select('file_size')
          .eq('user_id', user.id),
        supabase
          .from('medical_files')
          .select('file_size')
          .eq('user_id', user.id)
      ]);

      const storageBytes = [
        ...(blackBoxFiles.data || []),
        ...(medicalFiles.data || [])
      ].reduce((sum, file: { file_size?: number | null }) => sum + Number(file.file_size || 0), 0);

      const storageUsed = Number((storageBytes / (1024 * 1024 * 1024)).toFixed(2));
      const planId = (subData?.plan_id || '').toLowerCase();
      const storageLimitMap: Record<string, number> = {
        core: 10,
        daily: 50,
        max: 200
      };
      const storageLimit = storageLimitMap[planId] ?? 10;

      const deviceCount = Math.max(deviceConnections.count || 0, userDevices.count || 0);

      setUsageStats({
        reportsUsed: subData?.reports_used_this_period || 0,
        reportsLimit: planData?.max_reports_per_month ?? -1,
        devicesConnected: deviceCount,
        storageUsed,
        storageLimit
      });

    } catch (error) {
      notifyUserError('Billing data load failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inv.plan_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-900/30 border-green-600/30 text-green-400';
      case 'pending': return 'bg-yellow-900/30 border-yellow-600/30 text-yellow-400';
      case 'failed': return 'bg-red-900/30 border-red-600/30 text-red-400';
      default: return 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-gray-700/30 dark:border-gray-600/30 dark:text-neutral-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId.toLowerCase()) {
      case 'core': return <Shield className="h-8 w-8" />;
      case 'daily': return <Zap className="h-8 w-8" />;
      case 'max': return <Hexagon className="h-8 w-8" />;
      default: return <CreditCard className="h-8 w-8" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId.toLowerCase()) {
      case 'core': return 'from-orange-900/30 via-orange-800/20 border-orange-600/30 text-orange-400';
      case 'daily': return 'from-blue-900/30 via-blue-800/20 border-blue-600/30 text-blue-400';
      case 'max': return 'from-purple-900/30 via-purple-800/20 border-purple-600/30 text-purple-400';
      default: return 'from-slate-100 via-slate-50 border-slate-200 text-slate-600 dark:from-[var(--bm-surface)]/30 dark:via-gray-800/20 dark:border-gray-600/30 dark:text-neutral-300';
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilRenewal = () => {
    if (!subscription) return 0;
    const today = new Date();
    const renewalDate = new Date(subscription.current_period_end);
    const diffTime = renewalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const handleManageBilling = async () => {
    notifyUserInfo('Billing portal is currently unavailable. Please contact support.');
  };

  const handleUpgradePlan = () => {
    // Navigate to pricing page to select a new plan
    window.history.pushState({ page: 'pricing' }, '', '/pricing');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        <p className="text-sm member-muted">{t('member.billing.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Help Banner */}
      {!subscription && (
        <div className="mb-6 member-card border-l-4 border-l-blue-500 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="member-heading font-semibold mb-1">{t('member.billing.noSubscription')}</h3>
            <p className="text-sm member-body mb-3">
              {t('member.billing.noSubscriptionBody')}
            </p>
            <button
              onClick={handleUpgradePlan}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-all"
            >
              {t('member.billing.viewPlans')}
            </button>
          </div>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="member-card p-6 shadow-lg">
        <h3 className="member-heading mb-4">{t('member.billing.currentPlan')}</h3>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`bg-gradient-to-br ${getPlanColor(subscription?.plan_id || '')} to-gray-900 border rounded-xl p-4`}>
              {getPlanIcon(subscription?.plan_id || '')}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-semibold member-heading">
                  {plan?.name || t('member.billing.noPlan')}
                </h2>
                {subscription?.is_trial && (
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-xs font-semibold rounded-full">
                    {t('member.billing.trial')}
                  </span>
                )}
                {subscription?.cancel_at_period_end && (
                  <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-semibold rounded-full">
                    {t('member.billing.canceling')}
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-neutral-300 mb-1">
                {formatPrice(
                  subscription?.billing_period === 'annual'
                    ? plan?.annual_price_cents || 0
                    : plan?.monthly_price_cents || 0
                )}
                /{subscription?.billing_period || t('member.common.month')}
              </p>
              <p className="text-sm member-muted">
                {subscription?.status === 'active' ? t('member.billing.activeSince') + ' ' : t('member.billing.statusLabel') + ': '}
                {subscription ? formatDate(subscription.current_period_start) : t('member.common.na')}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpgradePlan}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2 group"
              title="View all available plans and upgrade to access more features"
            >
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              {t('member.billing.upgradePlanBtn')}
            </button>
            <button
              onClick={handleManageBilling}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-gray-700 dark:text-neutral-200 rounded-lg font-semibold transition-all flex items-center gap-2 group"
            >
              <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              {t('member.billing.manageBilling')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid - Your subscription metrics at a glance */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Next Billing - When your card will be charged next */}
        <div className="member-card border-emerald-200 p-4 shadow-lg">
          <h4 className="member-heading text-sm mb-3">{t('member.billing.nextBilling')}</h4>
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <span className="text-xs text-emerald-700 font-semibold">
              {t('member.billing.daysAway', { count: getDaysUntilRenewal() })}
            </span>
          </div>
          <p className="text-xs member-muted mb-1">{t('member.billing.nextBillingDate')}</p>
          <p className="text-lg font-semibold member-heading">
            {subscription ? formatDate(subscription.current_period_end) : t('member.billing.noSubscriptionLabel')}
          </p>
          <p className="text-xs member-muted mt-1">
            {subscription ? t('member.billing.willBeCharged', {
              amount: formatPrice(
                subscription?.billing_period === 'annual'
                  ? plan?.annual_price_cents || 0
                  : plan?.monthly_price_cents || 0
              )
            }) : t('member.billing.selectPlan')}
          </p>
        </div>

        <div className="member-card border-blue-200 p-4 shadow-lg">
          <h4 className="member-heading text-sm mb-3">{t('member.billing.totalPaidLifetime')}</h4>
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-lg font-semibold member-heading">${totalPaid.toFixed(2)}</p>
          <p className="text-xs member-muted mt-1">
            {t('member.billing.successfulPayments', { count: invoices.filter(i => i.status === 'paid').length })}
          </p>
        </div>

        <div className="member-card border-purple-200 p-4 shadow-lg">
          <h4 className="member-heading text-sm mb-3">{t('member.billing.reportsThisMonth')}</h4>
          <div className="flex items-center justify-between mb-2">
            <RefreshCw className="h-5 w-5 text-purple-600" />
            <span className="text-xs text-purple-700 font-semibold">
              {usageStats?.reportsLimit === -1 ? t('member.billing.unlimited') : `${usageStats?.reportsUsed}/${usageStats?.reportsLimit}`}
            </span>
          </div>
          <p className="text-lg font-semibold member-heading">{usageStats?.reportsUsed || 0}</p>
          {usageStats && usageStats.reportsLimit !== -1 ? (
            <div className="mt-2 bg-slate-200 dark:bg-gray-800 rounded-full h-1.5">
              <div
                className="bg-purple-500 h-1.5 rounded-full transition-all"
                style={{ width: `${getUsagePercentage(usageStats.reportsUsed, usageStats.reportsLimit)}%` }}
              />
            </div>
          ) : (
            <p className="text-xs text-purple-600 mt-1">{t('member.billing.generateUnlimited')}</p>
          )}
        </div>

        <div className="member-card border-orange-200 p-4 shadow-lg">
          <h4 className="member-heading text-sm mb-3">{t('member.billing.storageUsed')}</h4>
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="h-5 w-5 text-orange-500" />
            <span className="text-xs text-orange-700 font-semibold">
              {usageStats?.storageUsed}GB / {usageStats?.storageLimit}GB
            </span>
          </div>
          <p className="text-lg font-semibold member-heading">{usageStats?.storageUsed || 0} GB</p>
          {usageStats && (
            <div className="mt-2 bg-slate-200 dark:bg-gray-800 rounded-full h-1.5">
              <div
                className="bg-orange-500 h-1.5 rounded-full transition-all"
                style={{ width: `${getUsagePercentage(usageStats.storageUsed, usageStats.storageLimit)}%` }}
              />
            </div>
          )}
          <p className="text-xs member-muted mt-1">
            {usageStats ? t('member.billing.remaining', { amount: (usageStats.storageLimit - usageStats.storageUsed).toFixed(1) }) : t('member.common.na')}
          </p>
        </div>
      </div>

      {/* Payment History */}
      <div className="mb-6">
        <h2 className="member-heading text-xl mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          {t('member.billing.paymentHistory')}
        </h2>

        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-neutral-400" />
            <input
              type="text"
              placeholder={t('member.billing.searchInvoices')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 member-input"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 member-input"
          >
            <option value="all">{t('member.billing.allStatus')}</option>
            <option value="paid">{t('member.billing.statusPaid')}</option>
            <option value="pending">{t('member.billing.statusPending')}</option>
            <option value="failed">{t('member.billing.statusFailed')}</option>
          </select>
        </div>

        <div className="member-card overflow-hidden shadow-lg">
          <h3 className="member-heading m-4 mb-0">{t('member.billing.invoicesPayments')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-[var(--bm-surface)] border-b border-slate-200 dark:border-[var(--bm-border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium member-muted uppercase tracking-wider">{t('member.billing.invoice')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium member-muted uppercase tracking-wider">{t('member.billing.plan')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium member-muted uppercase tracking-wider">{t('member.billing.amount')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium member-muted uppercase tracking-wider">{t('member.billing.status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium member-muted uppercase tracking-wider">{t('member.billing.date')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium member-muted uppercase tracking-wider">{t('member.billing.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-neutral-400">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-12 w-12 text-gray-500 dark:text-neutral-400" />
                        <p>{t('member.billing.noInvoices')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-neutral-50">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-neutral-300">
                        {invoice.plan_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-neutral-50 font-semibold">
                        ${invoice.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full border flex items-center gap-1 w-fit ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          {invoice.status === 'paid' ? t('member.billing.statusPaid') : invoice.status === 'pending' ? t('member.billing.statusPending') : invoice.status === 'failed' ? t('member.billing.statusFailed') : invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">
                        {formatDate(invoice.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-orange-600 hover:text-orange-500 flex items-center gap-1 transition-colors">
                          <Download className="h-4 w-4" />
                          {t('member.billing.pdf')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions - Common billing tasks */}
      <div className="mb-4">
        <h3 className="member-heading text-lg mb-3 flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-500" />
          {t('member.billing.quickActions')}
        </h3>
        <p className="text-sm member-body mb-4">
          {t('member.billing.quickActionsBody')}
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={handleUpgradePlan}
          className="p-4 member-card hover:border-orange-300 transition-all text-left group shadow-lg"
          title="Browse all available plans"
        >
          <ArrowUpRight className="h-6 w-6 text-orange-500 mb-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          <h3 className="text-gray-900 dark:text-neutral-50 font-semibold mb-1">{t('member.billing.upgradePlan')}</h3>
          <p className="text-sm text-gray-600 dark:text-neutral-300">{t('member.billing.upgradePlanBody')}</p>
        </button>

        <button
          onClick={handleManageBilling}
          className="p-4 member-card hover:border-blue-300 transition-all text-left group shadow-lg"
          title="Manage Billing Cycle"
        >
          <RefreshCw className="h-6 w-6 text-blue-500 mb-2 group-hover:rotate-180 transition-transform duration-500" />
          <h3 className="text-gray-900 dark:text-neutral-50 font-semibold mb-1">{t('member.billing.changeCycle')}</h3>
          <p className="text-sm member-body">{t('member.billing.changeCycleBody')}</p>
        </button>

        <button
          onClick={handleManageBilling}
          className="p-4 member-card hover:border-purple-300 transition-all text-left group shadow-lg"
          title="Manage Payment Methods"
        >
          <ExternalLink className="h-6 w-6 text-purple-500 mb-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          <h3 className="text-gray-900 dark:text-neutral-50 font-semibold mb-1">{t('member.billing.paymentMethods')}</h3>
          <p className="text-sm text-gray-600 dark:text-neutral-300">{t('member.billing.paymentMethodsBody')}</p>
        </button>
      </div>
    </div>
  );
}
