import { useState, useRef } from 'react';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPERADMIN_EMAILS } from '../lib/adminAccess';
import { isSupabaseMock, supabase } from '../lib/supabase';
import BackButton from '../components/BackButton';

interface SignInProps {
  onNavigate: (page: string) => void;
  onSignIn: () => void;
}

function authErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return fallback;
}

export default function SignIn({ onNavigate, onSignIn }: SignInProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState(isSupabaseMock ? SUPERADMIN_EMAILS[0] : '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (loading || submittingRef.current) return;

    submittingRef.current = true;

    setLoading(true);
    setError('');

    try {
      const cleanedEmail = email.trim().toLowerCase();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanedEmail,
        password,
      });

      if (signInError) throw signInError;
      if (!data?.user) throw new Error(t('auth.signIn.noSession'));

      onSignIn();
      onNavigate('member');
    } catch (err: unknown) {
      setError(authErrorMessage(err, t('auth.signIn.genericError')));
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--bm-page)] via-[var(--bm-surface)] to-[var(--bm-page)] px-4 py-24 transition-colors">
      <div className="max-w-md w-full">
        <div className="mb-4">
          <BackButton onNavigate={onNavigate} />
        </div>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <picture>
              <source srcSet="/logo-header.webp?v=2" type="image/webp" />
              <img src="/logo-header.png?v=2" alt="BioMath Core" className="h-16 w-16" width="64" height="64" />
            </picture>
            <h1 className="text-4xl font-bold">
              <span className="text-blue-600 dark:text-blue-400">BioMath</span>
              <span className="text-white"> Core</span>
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth.signIn.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{t('auth.signIn.subtitle')}</p>
          {isSupabaseMock && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              {t('auth.signIn.mockNotice', { email: 'dnainform@gmail.com' })}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.fields.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--bm-surface)] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.fields.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[var(--bm-surface)] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  {t('auth.signIn.remember')}
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t('auth.signIn.forgot')}
              </button>
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {loading ? t('auth.signIn.submitting') : t('auth.signIn.submit')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              {t('auth.signIn.noAccount')}{' '}
              <button
                onClick={() => onNavigate('signup')}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                {t('auth.signIn.signUpLink')}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          {t('auth.signIn.legal')}
        </p>
      </div>
    </div>
  );
}
