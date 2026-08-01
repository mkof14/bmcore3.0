import { Menu, X, Moon, Sun, LogOut, Shield, UserRound } from 'lucide-react';
import { useCallback, useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useSession } from '../hooks/useSession';
import { pageToPath } from '../lib/routing';
import { supabase } from '../lib/supabase';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  isAuthenticated?: boolean;
  onSignOut?: () => void;
}

function headerNavClick(page: string, onNavigate: (page: string) => void, after?: () => void) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(page);
    after?.();
  };
}

export default function Header({
  onNavigate,
  currentPage,
  isAuthenticated = false,
  onSignOut,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const user = useSession();
  const signedIn = Boolean(user) || isAuthenticated;

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    onSignOut?.();
    onNavigate('home');
  }, [onNavigate, onSignOut]);

  const navItems = [
    { name: t('nav.home'), path: 'home' },
    { name: t('nav.about'), path: 'about' },
    { name: t('nav.pricing'), path: 'pricing' },
    { name: t('nav.allServices'), path: 'services-catalog' },
    { name: t('nav.memberZone'), path: 'member-zone' },
    { name: t('nav.investors'), path: 'investors' },
  ];

  const isMemberPage = currentPage === 'member' || currentPage === 'member-zone';
  const isAdminPage =
    currentPage === 'admin-panel' ||
    currentPage === 'command-center' ||
    currentPage === 'config-system';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-theme bg-header transition-colors">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a
            href={pageToPath('home')}
            onClick={headerNavClick('home', onNavigate)}
            className="flex items-center space-x-3"
          >
            <picture>
              <source srcSet="/logo-header.webp?v=2" type="image/webp" />
              <img
                src="/logo-header.png?v=2"
                alt="BioMath Core Logo"
                className="h-12 w-12 object-contain"
                width="48"
                height="48"
              />
            </picture>
            <span className="text-2xl font-bold">
              <span className="text-blue-500">BioMath</span>
              <span className="text-gray-900 dark:text-white"> Core</span>
            </span>
          </a>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={pageToPath(item.path)}
                onClick={headerNavClick(item.path, onNavigate)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.path
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {(isMemberPage || isAdminPage) && (
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                  isMemberPage
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-900 text-white dark:bg-blue-600'
                }`}
                title={isMemberPage ? t('nav.memberZone') : t('nav.admin')}
              >
                {isMemberPage ? (
                  <UserRound className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Shield className="h-3.5 w-3.5" aria-hidden />
                )}
                {isMemberPage ? t('nav.memberZone') : t('nav.admin')}
              </div>
            )}
            <LanguageSwitcher variant="header" />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            {signedIn ? (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1.5 rounded-md border border-gray-200/40 bg-gray-900/3 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-900/6 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                title={t('nav.signOut')}
              >
                <LogOut className="h-4 w-4" />
                <span>{t('nav.signOut')}</span>
              </button>
            ) : (
              <a
                href={pageToPath('signin')}
                onClick={headerNavClick('signin', onNavigate)}
                className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white bg-gray-900/3 dark:bg-white/5 hover:bg-gray-900/6 dark:hover:bg-white/10 active:bg-gray-900/10 dark:active:bg-white/15 border border-gray-200/40 dark:border-white/15 rounded-md transition-colors"
              >
                {t('nav.signInUp')}
              </a>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher variant="header" />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={pageToPath(item.path)}
                  onClick={headerNavClick(item.path, onNavigate, () => setMobileMenuOpen(false))}
                  className={`px-3 py-2 rounded-md text-sm font-medium text-left transition-colors ${
                    currentPage === item.path
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 space-y-2">
                {signedIn ? (
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('nav.signOut')}</span>
                  </button>
                ) : (
                  <a
                    href={pageToPath('signin')}
                    onClick={headerNavClick('signin', onNavigate, () => setMobileMenuOpen(false))}
                    className="block w-full rounded-md border border-gray-200/40 bg-gray-900/3 px-3 py-2 text-left text-sm font-medium text-gray-900 transition-colors hover:bg-gray-900/6 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    {t('nav.signInUp')}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
