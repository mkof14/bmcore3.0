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

  // Consumer primary nav — Investors stays in Footer + direct /investors route.
  const navItems = [
    { name: t('nav.home'), path: 'home' },
    { name: t('nav.about'), path: 'about' },
    { name: t('nav.pricing'), path: 'pricing' },
    { name: t('nav.allServices'), path: 'services-catalog' },
    { name: t('nav.memberZone'), path: 'member-zone' },
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
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === item.path
                    ? 'text-blue-600 dark:text-blue-400'
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
                className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${
                  isMemberPage
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-slate-700 dark:text-blue-400'
                }`}
                title={isMemberPage ? t('member.zone.label') : t('nav.admin')}
              >
                {isMemberPage ? (
                  <UserRound className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Shield className="h-3.5 w-3.5" aria-hidden />
                )}
                {isMemberPage ? t('member.zone.label') : t('nav.admin')}
              </div>
            )}
            <LanguageSwitcher variant="header" />
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-sm p-1.5 text-gray-600 transition-colors hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 dark:text-neutral-400 dark:hover:text-orange-400"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            {signedIn ? (
              <button
                type="button"
                onClick={handleSignOut}
                className={isMemberPage ? 'member-link text-sm' : 'bm-link'}
                title={t('nav.signOut')}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{t('nav.signOut')}</span>
              </button>
            ) : (
              <a
                href={pageToPath('signin')}
                onClick={headerNavClick('signin', onNavigate)}
                className="bm-link"
              >
                {t('nav.signInUp')}
              </a>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-1.5">
            <LanguageSwitcher variant="header" />
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-sm p-1.5 text-gray-600 transition-colors hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 dark:text-neutral-400 dark:hover:text-orange-400"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-sm p-1.5 text-gray-600 transition-colors hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 dark:text-neutral-400 dark:hover:text-orange-400"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
                  className={`px-3 py-2 text-sm font-medium text-left transition-colors ${
                    currentPage === item.path
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 space-y-2">
                {signedIn ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className={
                      isMemberPage
                        ? 'member-link w-full justify-start px-3 py-2 text-sm'
                        : 'bm-link w-full justify-start px-3 py-2'
                    }
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{t('nav.signOut')}</span>
                  </button>
                ) : (
                  <a
                    href={pageToPath('signin')}
                    onClick={headerNavClick('signin', onNavigate, () => setMobileMenuOpen(false))}
                    className="bm-link w-full justify-start px-3 py-2"
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
