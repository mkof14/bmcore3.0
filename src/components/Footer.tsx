import { Mail, Moon, Sun } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import NewsletterSignup from './NewsletterSignup';
import LanguageSwitcher from './LanguageSwitcher';
import { openCookiePreferences } from './CookieBanner';
import { getFooterSocialLinks, type SocialNetwork } from '../config/social';
import { pageToPath } from '../lib/routing';

interface FooterProps {
  onNavigate: (page: string) => void;
}

function footerNavClick(page: string, onNavigate: (page: string) => void) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(page);
  };
}

const linkClassName =
  'text-left text-sm text-gray-800 transition-colors hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-500';

const SOCIAL_ICON_CLASS: Record<SocialNetwork, string> = {
  facebook: 'bg-orange-600 hover:bg-orange-700',
  youtube: 'bg-red-600 hover:bg-red-700',
  instagram: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:opacity-90',
  x: 'bg-gray-800 hover:bg-gray-700 hover:opacity-80',
  linkedin: 'bg-orange-700 hover:bg-orange-800',
  github: 'bg-gray-800 hover:bg-gray-700',
};

function SocialIcon({ network }: { network: SocialNetwork }) {
  const paths: Partial<Record<SocialNetwork, string>> = {
    facebook:
      'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    youtube:
      'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    instagram:
      'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
    x: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    linkedin:
      'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  };
  const d = paths[network];
  if (!d) return null;
  return (
    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const SOCIAL_LABELS: Record<SocialNetwork, string> = {
  facebook: 'Facebook',
  youtube: 'YouTube',
  instagram: 'Instagram',
  x: 'X',
  linkedin: 'LinkedIn',
  github: 'GitHub',
};

export default function Footer({ onNavigate }: FooterProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const social = getFooterSocialLinks();

  return (
    <footer className="border-t border-theme bg-footer transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2">
            <div className="mb-4 flex items-center space-x-3">
              <picture>
                <source srcSet="/logo-footer.webp?v=2" type="image/webp" />
                <img
                  src="/logo-footer.png?v=2"
                  alt="BioMath Core Logo"
                  className="h-16 w-16 object-contain"
                  width="64"
                  height="64"
                />
              </picture>
              <span className="text-3xl font-bold">
                <span className="text-blue-500">BioMath</span>
                <span className="text-gray-900 dark:text-white"> Core</span>
              </span>
            </div>
            <p className="mb-4 text-sm text-gray-800 dark:text-gray-400">{t('footer.tagline')}</p>

            {social.length > 0 && (
              <div className="mb-6 flex space-x-3">
                {social.map(({ network, href }) => (
                  <a
                    key={network}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={SOCIAL_LABELS[network]}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${SOCIAL_ICON_CLASS[network]}`}
                  >
                    <SocialIcon network={network} />
                  </a>
                ))}
              </div>
            )}

            <div className="mb-6 flex items-start space-x-2">
              <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-700 dark:text-gray-500" />
              <a href="mailto:info@biomathcore.com" className="text-sm text-gray-800 transition-colors hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-500">
                info@biomathcore.com
              </a>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">{t('footer.newsletter')}</h3>
              <NewsletterSignup variant="footer" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <LanguageSwitcher variant="footer" />
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm text-gray-800 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span>{theme === 'light' ? t('footer.darkMode') : t('footer.lightMode')}</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{t('footer.navigation')}</h3>
            <ul className="space-y-2">
              {(
                [
                  ['home', t('nav.home')],
                  ['about', t('nav.about')],
                  ['pricing', t('nav.pricing')],
                  ['services-catalog', t('nav.allServices')],
                  ['devices', t('footer.devices')],
                  ['investors', t('nav.investors')],
                  ['science', t('footer.science')],
                  ['how-it-works', t('footer.howItWorks')],
                  ['faq', t('footer.faq')],
                  ['learning', t('footer.learningCenter')],
                  ['contact', t('footer.contact')],
                ] as const
              ).map(([page, label]) => (
                <li key={page}>
                  <a href={pageToPath(page)} onClick={footerNavClick(page, onNavigate)} className={linkClassName}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{t('footer.company')}</h3>
            <ul className="space-y-2">
              {(
                [
                  ['news', t('footer.news')],
                  ['blog', t('footer.blog')],
                  ['media', t('footer.media')],
                  ['careers', t('footer.careers')],
                  ['partnership', t('footer.partnership')],
                  ['referral', t('footer.inviteFriend')],
                  ['ambassador', t('footer.ambassador')],
                ] as const
              ).map(([page, label]) => (
                <li key={page}>
                  <a href={pageToPath(page)} onClick={footerNavClick(page, onNavigate)} className={linkClassName}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              {(
                [
                  ['terms-of-service', t('footer.terms')],
                  ['privacy-policy', t('footer.privacy')],
                  ['disclaimer', t('legal.disclaimer.title')],
                  ['hipaa-notice', t('legal.hipaaNotice.title')],
                  ['data-privacy', t('legal.dataPrivacy.title')],
                  ['gdpr', t('legal.gdpr.title')],
                  ['privacy-trust', t('footer.privacyTrust')],
                  ['trust-safety', t('legal.trustSafety.title')],
                  ['security', t('footer.security')],
                ] as const
              ).map(([page, label]) => (
                <li key={page}>
                  <a href={pageToPath(page)} onClick={footerNavClick(page, onNavigate)} className={linkClassName}>
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <button type="button" onClick={openCookiePreferences} className={linkClassName}>
                  {t('footer.cookiePreferences')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{t('footer.memberArea')}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={pageToPath('member-zone')}
                  onClick={footerNavClick('member-zone', onNavigate)}
                  className={linkClassName}
                >
                  {t('nav.memberZone')}
                </a>
              </li>
            </ul>

            <h3 className="mb-4 mt-8 text-sm font-semibold text-gray-900 dark:text-white">{t('footer.infoHelp')}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={pageToPath('why-two-models')}
                  onClick={footerNavClick('why-two-models', onNavigate)}
                  className={linkClassName}
                >
                  {t('footer.whyTwoModels')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-300 pt-8 dark:border-gray-800">
          <p className="text-center text-sm text-gray-800 dark:text-gray-400">
            © 2026 BioMath Core. {t('footer.rights')}
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-center text-xs text-gray-800 dark:text-gray-400">
            {t('footer.appsStatus')}
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-center text-xs text-gray-800 dark:text-gray-400">
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  );
}
