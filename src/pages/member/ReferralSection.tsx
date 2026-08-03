import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Copy, Mail, TrendingUp, Gift, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError, notifyUserInfo } from '../../lib/adminNotify';
import MemberMetricCard from '../../components/ui/MemberMetricCard';

export default function ReferralSection() {
  const { t, i18n } = useTranslation();
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    earnings: 0,
  });

  useEffect(() => {
    loadReferrals();
    generateReferralCode();
  }, []);

  const generateReferralCode = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      setReferralCode(`BMC-${user.user.id.substring(0, 8).toUpperCase()}`);
    }
  };

  const loadReferrals = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('referral_activities')
        .select('*')
        .eq('referrer_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const referralData = data || [];
      setReferrals(referralData);

      setStats({
        total: referralData.length,
        pending: referralData.filter((r) => r.status === 'pending').length,
        completed: referralData.filter((r) => r.status === 'completed').length,
        earnings: referralData.reduce(
          (sum, r) => sum + (r.reward_credited ? r.reward_amount : 0),
          0
        ),
      });
    } catch {
      notifyUserError(t('member.referral.loadFailed'));
    }
  };

  const copyReferralLink = () => {
    const link = `https://biomathcore.com/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    notifyUserInfo(t('member.referral.linkCopied'));
  };

  const shareViaEmail = () => {
    const subject = t('member.referral.emailSubject');
    const body = t('member.referral.emailBody', { code: referralCode });
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const statusLabel = (status: string) => {
    if (status === 'completed') return t('member.referral.statusCompleted');
    if (status === 'pending') return t('member.referral.statusPending');
    return status;
  };

  return (
    <div>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MemberMetricCard
          accent="blue"
          icon={<Users className="h-6 w-6" />}
          value={stats.total}
          label={t('member.referral.totalReferrals')}
        />
        <MemberMetricCard
          accent="amber"
          icon={<TrendingUp className="h-6 w-6" />}
          value={stats.pending}
          label={t('member.referral.pending')}
        />
        <MemberMetricCard
          accent="emerald"
          icon={<Gift className="h-6 w-6" />}
          value={stats.completed}
          label={t('member.referral.completed')}
        />
        <MemberMetricCard
          accent="orange"
          icon={<DollarSign className="h-6 w-6" />}
          value={`$${stats.earnings}`}
          label={t('member.referral.totalEarned')}
        />
      </div>

      <div className="member-card mb-6 p-6">
        <h3 className="member-heading mb-4 text-xl font-semibold">{t('member.referral.yourCode')}</h3>
        <div className="flex gap-3">
          <div className="member-inset flex-1 rounded-lg px-4 py-3 text-center font-mono text-xl font-semibold text-orange-600">
            {referralCode || t('member.referral.loading')}
          </div>
          <button
            type="button"
            onClick={copyReferralLink}
            className="member-btn flex items-center gap-2 px-6 py-3 text-blue-700 transition-colors hover:border-blue-400 dark:text-blue-400"
          >
            <Copy className="h-5 w-5" />
            {t('member.referral.copyLink')}
          </button>
          <button
            type="button"
            onClick={shareViaEmail}
            className="member-btn flex items-center gap-2 px-6 py-3 text-emerald-700 transition-colors hover:border-emerald-400 dark:text-emerald-400"
          >
            <Mail className="h-5 w-5" />
            {t('member.referral.email')}
          </button>
        </div>
        <p className="member-body mt-4 text-sm">{t('member.referral.shareHint')}</p>
      </div>

      <div className="member-card p-6">
        <h3 className="member-heading mb-4 text-xl font-semibold">{t('member.referral.history')}</h3>
        {referrals.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="member-muted mx-auto mb-4 h-16 w-16" />
            <p className="member-body mb-2">{t('member.referral.empty')}</p>
            <p className="member-muted text-sm">{t('member.referral.emptyHint')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--bm-border)] bg-[var(--bm-surface)]">
                <tr>
                  <th className="member-muted px-4 py-3 text-left text-xs font-medium uppercase">
                    {t('member.referral.tableEmail')}
                  </th>
                  <th className="member-muted px-4 py-3 text-left text-xs font-medium uppercase">
                    {t('member.referral.tableStatus')}
                  </th>
                  <th className="member-muted px-4 py-3 text-left text-xs font-medium uppercase">
                    {t('member.referral.tableReward')}
                  </th>
                  <th className="member-muted px-4 py-3 text-left text-xs font-medium uppercase">
                    {t('member.referral.tableDate')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--bm-border)]">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-[var(--bm-surface)]/50">
                    <td className="member-heading px-4 py-3 text-sm">{ref.referred_email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          ref.status === 'completed'
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-600/30 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : ref.status === 'pending'
                              ? 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-600/30 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'member-muted border border-[var(--bm-border)]'
                        }`}
                      >
                        {statusLabel(ref.status)}
                      </span>
                    </td>
                    <td className="member-heading px-4 py-3 text-sm font-semibold">
                      ${ref.reward_amount}
                    </td>
                    <td className="member-muted px-4 py-3 text-sm">
                      {new Date(ref.created_at).toLocaleDateString(i18n.language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
