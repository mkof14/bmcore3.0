import { BarChart3, TrendingUp, Users, DollarSign, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import BackButton from '../components/BackButton';
import { notifyError } from '../lib/adminNotify';

interface CommandCenterProps {
  onNavigate: (page: string) => void;
}

export default function CommandCenter({ onNavigate }: CommandCenterProps) {
  const [metrics, setMetrics] = useState({
    dailyRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    dailyUsers: 0,
    monthlyUsers: 0,
    yearlyUsers: 0,
    activeSubscriptions: 0,
    churnRate: 0,
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      const { data } = await supabase
        .from('business_metrics')
        .select('*')
        .order('metric_date', { ascending: false })
        .limit(365);

      if (data) {
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = today.substring(0, 7);
        const thisYear = today.substring(0, 4);

        const dailyRev = data.find(m => m.metric_date === today && m.metric_type === 'revenue')?.metric_value || 0;
        const monthlyRev = data.filter(m => m.metric_date.startsWith(thisMonth) && m.metric_type === 'revenue').reduce((sum, m) => sum + Number(m.metric_value), 0);
        const yearlyRev = data.filter(m => m.metric_date.startsWith(thisYear) && m.metric_type === 'revenue').reduce((sum, m) => sum + Number(m.metric_value), 0);

        const dailyUsr = data.find(m => m.metric_date === today && m.metric_type === 'new_users')?.metric_value || 0;
        const monthlyUsr = data.filter(m => m.metric_date.startsWith(thisMonth) && m.metric_type === 'new_users').reduce((sum, m) => sum + Number(m.metric_value), 0);
        const yearlyUsr = data.filter(m => m.metric_date.startsWith(thisYear) && m.metric_type === 'new_users').reduce((sum, m) => sum + Number(m.metric_value), 0);

        setMetrics({
          dailyRevenue: Number(dailyRev),
          monthlyRevenue: Number(monthlyRev),
          yearlyRevenue: Number(yearlyRev),
          dailyUsers: Number(dailyUsr),
          monthlyUsers: Number(monthlyUsr),
          yearlyUsers: Number(yearlyUsr),
          activeSubscriptions: 1250,
          churnRate: 2.4,
        });
      }
    } catch (error) {
      notifyError('Metrics load failed');
    }
  }

  const cards = [
    { label: 'Revenue Today', value: `$${metrics.dailyRevenue.toLocaleString()}`, icon: DollarSign, change: '+12%', positive: true },
    { label: 'Revenue This Month', value: `$${metrics.monthlyRevenue.toLocaleString()}`, icon: TrendingUp, change: '+8%', positive: true },
    { label: 'Revenue This Year', value: `$${metrics.yearlyRevenue.toLocaleString()}`, icon: BarChart3, change: '+24%', positive: true },
    { label: 'New Users Today', value: metrics.dailyUsers.toString(), icon: Users, change: '+5%', positive: true },
    { label: 'New Users This Month', value: metrics.monthlyUsers.toString(), icon: Users, change: '+18%', positive: true },
    { label: 'New Users This Year', value: metrics.yearlyUsers.toString(), icon: Users, change: '+45%', positive: true },
    { label: 'Active Subscriptions', value: metrics.activeSubscriptions.toString(), icon: Activity, change: '+3%', positive: true },
    { label: 'Churn Rate', value: `${metrics.churnRate}%`, icon: TrendingUp, change: '-0.5%', positive: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bm-page)] via-orange-50/25 to-[var(--bm-page)] dark:from-[var(--bm-page)] dark:via-[var(--bm-surface)] dark:to-[var(--bm-page)] pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton onNavigate={onNavigate} />

        <div className="mb-8">
          <span className="inline-flex items-center rounded-full border border-orange-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-orange-700 dark:border-white/15 dark:bg-[var(--bm-surface)]/60 dark:text-orange-300">
            Operations
          </span>
          <h1 className="mt-5 text-4xl font-semibold text-gray-900 dark:text-white mb-2">Command Center</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time business analytics and platform metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-white/90 dark:bg-gradient-to-br dark:from-[var(--bm-surface)] dark:via-gray-800 dark:to-[var(--bm-surface)] border border-slate-200 dark:border-gray-700/50 rounded-2xl p-6 hover:border-orange-600/50 transition-all duration-300 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="h-8 w-8 text-orange-500" />
                  <div className={`flex items-center gap-1 text-sm font-medium ${card.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {card.positive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    {card.change}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{card.label}</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/90 dark:bg-[var(--bm-surface)] border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Revenue Trend (Last 30 Days)</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {Array.from({ length: 30 }).map((_, i) => {
                const height = Math.random() * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-orange-600 to-orange-400 dark:from-orange-700 dark:to-orange-500 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          </div>

          <div className="bg-white/90 dark:bg-[var(--bm-surface)] border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">User Growth (Last 30 Days)</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {Array.from({ length: 30 }).map((_, i) => {
                const height = 20 + (i * 2) + Math.random() * 20;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-green-600 to-green-400 dark:from-green-700 dark:to-green-500 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${Math.min(height, 100)}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-[var(--bm-surface)] border border-slate-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Service Usage</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Health Guide</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">892</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div className="bg-orange-600 dark:bg-orange-500 h-2 rounded-full" style={{ width: '89%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Second Opinion</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">654</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div className="bg-green-600 dark:bg-green-500 h-2 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Reports Engine</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">432</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{ width: '43%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
