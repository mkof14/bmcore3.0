import { useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import LoadingSpinner from './LoadingSpinner';
import WorkspaceStatusBanner from './WorkspaceStatusBanner';
import { notifyInfo } from '../lib/adminNotify';
import { hasAdminUiAccess } from '../lib/adminAccess';

interface AdminGateProps {
  children: ReactNode;
  onNavigate?: (page: string) => void;
}

export default function AdminGate({ children, onNavigate }: AdminGateProps) {
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Read-only check — never UPDATE is_admin / role from the browser.
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin, role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(
        hasAdminUiAccess({
          isAdmin: data?.is_admin,
          role: data?.role,
        }),
      );
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message?: any) => {
      notifyInfo(String(message ?? ''));
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('adminGate.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{t('adminGate.body')}</p>
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('home');
                return;
              }
              window.history.pushState({ page: 'home' }, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {t('adminGate.goHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="sticky top-16 z-40 border-b border-slate-200/70 bg-white/95 px-3 py-2 backdrop-blur dark:border-slate-700 dark:bg-[var(--bm-header)]/95 sm:px-4">
        <div className="mx-auto max-w-[1600px]">
          <WorkspaceStatusBanner zone="admin" sectionLabel="Control plane" sticky={false} />
        </div>
      </div>
      {children}
    </div>
  );
}
