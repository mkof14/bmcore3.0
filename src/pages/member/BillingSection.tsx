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
import ReportBrandHeader from '../../components/report/ReportBrandHeader';

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
      default: return 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-gray-700/30 dark:border-gray-600/30 dark:text-gray-400';
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
      default: return 'from-slate-100 via-slate-50 border-slate-200 text-slate-600 dark:from-[var(--bm-surface)]/30 dark:via-gray-800/20 dark:border-gray-600/30 dark:text-gray-400';
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2 flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-orange-500" />
          {t('member.billing.title')}
        </h1>
        <p className="text-gray-600">
          {t('member.billing.subtitle')}
        </p>
      </div>

      <ReportBrandHeader
        title="BioMath Core"
        subtitle="Billing & Usage"
        variant="strip"
        className="mb-6"
      />

      {/* Help Banner */}
      {!subscription && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-gray-900 font-semibold mb-1">{t('member.billing.noSubscription')}</h3>
            <p className="text-sm text-gray-600 mb-3">
              You don't have an active subscription yet. Choose a plan to unlock all features and start your health journey!
            </p>
            <button
              onClick={handleUpgradePlan}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-all"
            >
              View Plans & Pricing
            </button>
          </div>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="mb-6 bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-lg">
        <ReportBrandHeader variant="strip" subtitle="Current Plan" className="mb-4" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`bg-gradient-to-br ${getPlanColor(subscription?.plan_id || '')} to-gray-900 border rounded-xl p-4`}>
              {getPlanIcon(subscription?.plan_id || '')}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {plan?.name || 'No Plan'}
                </h2>
                {subscription?.is_trial && (
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-xs font-semibold rounded-full">
                    Trial
                  </span>
                )}
                {subscription?.cancel_at_period_end && (
                  <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-semibold rounded-full">
                    Canceling
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-1">
                {formatPrice(
                  subscription?.billing_period === 'annual'
                    ? plan?.annual_price_cents || 0
                    : plan?.monthly_price_cents || 0
                )}
                /{subscription?.billing_period || 'month'}
              </p>
              <p className="text-sm text-gray-500">
                {subscription?.status === 'active' ? 'Active since ' : 'Status: '}
                {subscription ? formatDate(subscription.current_period_start) : 'N/A'}
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
              Upgrade Plan
            </button>
            <button
              onClick={handleManageBilling}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-gray-700 rounded-lg font-semibold transition-all flex items-center gap-2 group"
              title="Update payment method, view invoices, or cancel subscription"
            >
              <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              Manage Billing
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid - Your subscription metrics at a glance */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Next Billing - When your card will be charged next */}
        <div
          className="bg-white/90 border border-emerald-200 rounded-2xl p-4 cursor-help shadow-lg"
          title="Your next automatic payment date"
        >
          <ReportBrandHeader variant="strip" subtitle="Next Billing" className="mb-3" />
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <span className="text-xs text-emerald-700 font-semibold">
              {getDaysUntilRenewal()} days away
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-1">{t('member.billing.nextBillingDate')}</p>
          <p className="text-lg font-semibold text-gray-900">
            {subscription ? formatDate(subscription.current_period_end) : 'No subscription'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {subscription ? `${formatPrice(
              subscription?.billing_period === 'annual'
                ? plan?.annual_price_cents || 0
                : plan?.monthly_price_cents || 0
            )} will be charged` : 'Select a plan to start'}
          </p>
        </div>

        {/* Total Paid - Lifetime spending */}
        <div
          className="bg-white/90 border border-blue-200 rounded-2xl p-4 cursor-help shadow-lg"
          title="Total amount you've paid since joining"
        >
          <ReportBrandHeader variant="strip" subtitle="Total Paid" className="mb-3" />
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Total Paid (Lifetime)</p>
          <p className="text-lg font-semibold text-gray-900">${totalPaid.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {invoices.filter(i => i.status === 'paid').length} successful payment{invoices.filter(i => i.status === 'paid').length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Reports Usage - Track your monthly report generation */}
        <div
          className="bg-white/90 border border-purple-200 rounded-2xl p-4 cursor-help shadow-lg"
          title="Number of health reports generated this billing period"
        >
          <ReportBrandHeader variant="strip" subtitle="Reports Usage" className="mb-3" />
          <div className="flex items-center justify-between mb-2">
            <RefreshCw className="h-5 w-5 text-purple-600" />
            <span className="text-xs text-purple-700 font-semibold">
              {usageStats?.reportsLimit === -1 ? 'Unlimited' : `${usageStats?.reportsUsed}/${usageStats?.reportsLimit}`}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-1">{t('member.billing.reportsThisMonth')}</p>
          <p className="text-lg font-semibold text-gray-900">{usageStats?.reportsUsed || 0}</p>
          {usageStats && usageStats.reportsLimit !== -1 ? (
            <div className="mt-2 bg-slate-200 rounded-full h-1.5">
              <div
                className="bg-purple-500 h-1.5 rounded-full transition-all"
                style={{ width: `${getUsagePercentage(usageStats.reportsUsed, usageStats.reportsLimit)}%` }}
              />
            </div>
          ) : (
            <p className="text-xs text-purple-600 mt-1">∞ Generate unlimited reports</p>
          )}
        </div>

        {/* Storage Usage - Your data storage consumption */}
        <div
          className="bg-white/90 border border-orange-200 rounded-2xl p-4 cursor-help shadow-lg"
          title="Storage space used for your health data and files"
        >
          <ReportBrandHeader variant="strip" subtitle="Storage Usage" className="mb-3" />
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="h-5 w-5 text-orange-500" />
            <span className="text-xs text-orange-700 font-semibold">
              {usageStats?.storageUsed}GB / {usageStats?.storageLimit}GB
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-1">{t('member.billing.storageUsed')}</p>
          <p className="text-lg font-semibold text-gray-900">{usageStats?.storageUsed || 0} GB</p>
          {usageStats && (
            <div className="mt-2 bg-slate-200 rounded-full h-1.5">
              <div
                className="bg-orange-500 h-1.5 rounded-full transition-all"
                style={{ width: `${getUsagePercentage(usageStats.storageUsed, usageStats.storageLimit)}%` }}
              />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {usageStats ? `${(usageStats.storageLimit - usageStats.storageUsed).toFixed(1)} GB remaining` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Payment History */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          Payment History
        </h2>

        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder={t('member.billing.searchInvoices')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">{t('member.billing.allStatus')}</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="bg-white/90 border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
          <ReportBrandHeader variant="strip" subtitle="Invoices & Payments" className="m-4 mb-0" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-12 w-12 text-gray-500" />
                        <p>{t('member.billing.noInvoices')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {invoice.plan_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        ${invoice.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full border flex items-center gap-1 w-fit ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-orange-600 hover:text-orange-500 flex items-center gap-1 transition-colors">
                          <Download className="h-4 w-4" />
                          PDF
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
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-500" />
          Quick Actions
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Manage your subscription and billing with these quick shortcuts
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={handleUpgradePlan}
          className="p-4 bg-white/90 border border-slate-200 rounded-2xl hover:border-orange-300 transition-all text-left group shadow-lg"
          title="Browse all available plans"
        >
          <ArrowUpRight className="h-6 w-6 text-orange-500 mb-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          <h3 className="text-gray-900 font-semibold mb-1">{t('member.billing.upgradePlan')}</h3>
          <p className="text-sm text-gray-600">{t('member.billing.upgradePlanBody')}</p>
        </button>

        <button
          onClick={handleManageBilling}
          className="p-4 bg-white/90 border border-slate-200 rounded-2xl hover:border-blue-300 transition-all text-left group shadow-lg"
          title="Manage Billing Cycle"
        >
          <RefreshCw className="h-6 w-6 text-blue-500 mb-2 group-hover:rotate-180 transition-transform duration-500" />
          <h3 className="text-gray-900 font-semibold mb-1">{t('member.billing.changeCycle')}</h3>
          <p className="text-sm text-gray-600">Switch between monthly and annual billing (save 17%)</p>
        </button>

        <button
          onClick={handleManageBilling}
          className="p-4 bg-white/90 border border-slate-200 rounded-2xl hover:border-purple-300 transition-all text-left group shadow-lg"
          title="Manage Payment Methods"
        >
          <ExternalLink className="h-6 w-6 text-purple-500 mb-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          <h3 className="text-gray-900 font-semibold mb-1">{t('member.billing.paymentMethods')}</h3>
          <p className="text-sm text-gray-600">{t('member.billing.paymentMethodsBody')}</p>
        </button>
      </div>
    </div>
  );
}
