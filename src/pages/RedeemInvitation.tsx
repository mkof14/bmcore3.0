import { useState, useEffect } from 'react';
import { Gift, Check, AlertCircle, Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useSession } from '../hooks/useSession';
import { getContentSearchParams } from '../lib/routing';

export default function RedeemInvitation() {
  const { t, i18n } = useTranslation();
  const session = useSession();
  const [code, setCode] = useState('');
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  useEffect(() => {
    const params = getContentSearchParams();
    const urlCode = params.get('code');
    if (urlCode) {
      setCode(urlCode);
      checkInvitation(urlCode);
    }
  }, []);

  const checkInvitation = async (invitationCode: string) => {
    if (!invitationCode) return;

    setChecking(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('code', invitationCode.toUpperCase())
        .eq('status', 'pending')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setError(t('redeem.errors.invalidCode'));
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError(t('redeem.errors.expired'));
        return;
      }

      setInvitation(data);
      if (!session) {
        setSignUpData({ ...signUpData, email: data.email });
      }
    } catch {
      setError(t('redeem.errors.checkFailed'));
    } finally {
      setChecking(false);
    }
  };

  const handleCheckCode = (e: React.FormEvent) => {
    e.preventDefault();
    checkInvitation(code);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (signUpData.password !== signUpData.confirmPassword) {
      setError(t('redeem.errors.passwordsMismatch'));
      return;
    }

    if (signUpData.password.length < 6) {
      setError(t('redeem.errors.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.fullName,
          },
        },
      });

      if (error) throw error;

      await redeemInvitation();
    } catch {
      setError(t('redeem.errors.createFailed'));
      setLoading(false);
    }
  };

  const redeemInvitation = async () => {
    setRedeeming(true);
    setError('');

    try {
      const { data, error } = await supabase.rpc('accept_invitation', {
        invitation_code: code.toUpperCase(),
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || t('redeem.errors.redeemFailed'));
      }

      setSuccess(true);
      setTimeout(() => {
        window.history.pushState({ page: 'member-zone' }, '', '/member-zone');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 3000);
    } catch {
      setError(t('redeem.errors.redeemFailed'));
    } finally {
      setRedeeming(false);
      setLoading(false);
    }
  };

  const getPlanName = (planType: string) => {
    const plans: Record<string, string> = {
      core: t('redeem.planCore'),
      daily: t('redeem.planDaily'),
      max: t('redeem.planMax'),
    };
    return plans[planType] || planType;
  };

  const getPlanPrice = (planType: string) => {
    const prices: Record<string, string> = {
      core: t('redeem.monthlyPrice', { price: '$19' }),
      daily: t('redeem.monthlyPrice', { price: '$39' }),
      max: t('redeem.monthlyPrice', { price: '$99' }),
    };
    return prices[planType] || '';
  };

  const getDurationText = (months: number) => {
    if (months === 0) return t('redeem.durationForever');
    if (months === 1) return t('redeem.durationMonth');
    if (months === 12) return t('redeem.durationYear');
    return t('redeem.durationMonths', { count: months });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-600/30 rounded-xl p-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('redeem.successTitle')}</h2>
            <p className="text-gray-300 mb-4">
              {t('redeem.successBody', {
                plan: invitation && getPlanName(invitation.plan_type),
                duration: invitation && getDurationText(invitation.duration_months),
              })}
            </p>
            <p className="text-sm text-gray-400">{t('redeem.redirecting')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('redeem.title')}</h1>
          <p className="text-gray-400">
            {t('redeem.subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-600/30 rounded-lg text-red-400 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!invitation ? (
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-xl p-6">
            <form onSubmit={handleCheckCode}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('redeem.codeLabel')}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={t('redeem.codePlaceholder')}
                maxLength={8}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-center text-xl font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                required
              />
              <button
                type="submit"
                disabled={checking || code.length !== 8}
                className="w-full mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checking ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    {t('redeem.checking')}
                  </>
                ) : (
                  <>{t('redeem.checkCode')}</>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-600/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">{t('redeem.detailsTitle')}</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-700/50">
                  <span className="text-gray-400">{t('redeem.plan')}</span>
                  <span className="text-white font-semibold">{getPlanName(invitation.plan_type)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700/50">
                  <span className="text-gray-400">{t('redeem.regularPrice')}</span>
                  <span className="text-white line-through">{getPlanPrice(invitation.plan_type)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700/50">
                  <span className="text-gray-400">{t('redeem.yourPrice')}</span>
                  <span className="text-green-400 font-bold text-lg">{t('redeem.free')}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">{t('redeem.duration')}</span>
                  <span className="text-white font-semibold">{getDurationText(invitation.duration_months)}</span>
                </div>
              </div>

              {invitation.expires_at && (
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                  <p className="text-sm text-yellow-400">
                    {t('redeem.expiresOn', {
                      date: new Date(invitation.expires_at).toLocaleDateString(i18n.resolvedLanguage),
                    })}
                  </p>
                </div>
              )}
            </div>

            {session ? (
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-xl p-6">
                <p className="text-gray-300 mb-4">
                  {t('redeem.signedInAs', { email: session.email })}
                </p>
                <button
                  onClick={redeemInvitation}
                  disabled={redeeming}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {redeeming ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      {t('redeem.activating')}
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      {t('redeem.activate')}
                    </>
                  )}
                </button>
              </div>
            ) : showSignUp ? (
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">{t('redeem.createAccountTitle')}</h3>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      {t('redeem.email')}
                    </label>
                    <input
                      type="email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('redeem.fullName')}
                    </label>
                    <input
                      type="text"
                      value={signUpData.fullName}
                      onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={t('redeem.fullNamePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Lock className="h-4 w-4 inline mr-1" />
                      {t('redeem.password')}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                        minLength={6}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder={t('redeem.passwordPlaceholder')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('redeem.confirmPassword')}
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={t('redeem.confirmPasswordPlaceholder')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        {t('redeem.creatingAccount')}
                      </>
                    ) : (
                      <>{t('redeem.createAndActivate')}</>
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowSignUp(false)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {t('redeem.haveAccount')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-xl p-6">
                <p className="text-gray-300 mb-4 text-center">
                  {t('redeem.needAccount')}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowSignUp(true)}
                    className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    {t('redeem.createAccount')}
                  </button>
                  <button
                    onClick={() => {
                      window.history.pushState({ page: 'signin' }, '', '/signin');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    {t('redeem.signInExisting')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
