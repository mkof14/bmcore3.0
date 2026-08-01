import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Copy, Mail, TrendingUp, Gift, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError, notifyUserInfo } from '../../lib/adminNotify';
import ReportBrandHeader from '../../components/report/ReportBrandHeader';

export default function ReferralSection() {
  const { t } = useTranslation();
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    earnings: 0
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
        pending: referralData.filter(r => r.status === 'pending').length,
        completed: referralData.filter(r => r.status === 'completed').length,
        earnings: referralData.reduce((sum, r) => sum + (r.reward_credited ? r.reward_amount : 0), 0)
      });
    } catch (error) {
      notifyUserError('Referral data load failed');
    }
  };

  const copyReferralLink = () => {
    const link = `https://biomathcore.com/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    notifyUserInfo('Referral link copied');
  };

  const shareViaEmail = () => {
    const subject = 'Join BiomathCore - Get $20 Credit';
    const body = `I'm inviting you to join BiomathCore! Use my referral code ${referralCode} to get $20 credit on signup. https://biomathcore.com/signup?ref=${referralCode}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2 flex items-center gap-3">
          <Users className="h-8 w-8 text-orange-500" />
          {t('member.referral.title')}
        </h1>
        <p className="text-gray-600">{t('member.referral.subtitle')}</p>
      </div>

      <ReportBrandHeader
        title="BioMath Core"
        subtitle="Referral Program"
        variant="strip"
        className="mb-6"
      />

      <div className="mb-6 grid md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <ReportBrandHeader variant="strip" subtitle="Total Referrals" className="mb-3" />
          <Users className="h-6 w-6 text-blue-600 mb-2" />
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-600">{t('member.referral.totalReferrals')}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <ReportBrandHeader variant="strip" subtitle="Pending" className="mb-3" />
          <TrendingUp className="h-6 w-6 text-amber-600 mb-2" />
          <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
          <p className="text-xs text-gray-600">Pending</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <ReportBrandHeader variant="strip" subtitle="Completed" className="mb-3" />
          <Gift className="h-6 w-6 text-emerald-600 mb-2" />
          <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
          <p className="text-xs text-gray-600">Completed</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <ReportBrandHeader variant="strip" subtitle="Total Earned" className="mb-3" />
          <DollarSign className="h-6 w-6 text-orange-500 mb-2" />
          <p className="text-2xl font-semibold text-gray-900">${stats.earnings}</p>
          <p className="text-xs text-gray-600">{t('member.referral.totalEarned')}</p>
        </div>
      </div>

      <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-lg mb-6">
        <ReportBrandHeader variant="strip" subtitle="Your Referral Code" className="mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('member.referral.yourCode')}</h3>
        <div className="flex gap-3">
          <div className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-lg font-mono text-xl text-orange-600 font-semibold text-center">
            {referralCode || 'Loading...'}
          </div>
          <button
            onClick={copyReferralLink}
            className="px-6 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            <Copy className="h-5 w-5" />
            Copy Link
          </button>
          <button
            onClick={shareViaEmail}
            className="px-6 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2"
          >
            <Mail className="h-5 w-5" />
            Email
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Share your code with friends. When they sign up and make their first purchase, you both get $20 credit!
        </p>
      </div>

      <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-lg">
        <ReportBrandHeader variant="strip" subtitle="Referral History" className="mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('member.referral.history')}</h3>
        {referrals.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">{t('member.referral.empty')}</p>
            <p className="text-sm text-gray-500">Start inviting friends to earn rewards!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{ref.referred_email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ref.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        ref.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-gray-600 border border-slate-200'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                      ${ref.reward_amount}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(ref.created_at).toLocaleDateString()}
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
