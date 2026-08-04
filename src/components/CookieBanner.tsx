import { useState, useEffect, useCallback } from 'react';
import { Cookie, Settings, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface CookieBannerProps {
  onNavigate?: (page: string) => void;
}

const COOKIE_CONSENT_KEY = 'biomath_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'biomath_cookie_preferences';
const OPEN_PREFERENCES_EVENT = 'open-cookie-preferences';

const OPTIONAL_CATEGORIES = ['analytics', 'marketing', 'preferences'] as const;

/** Lets any part of the app reopen the cookie choices after consent was stored. */
export function openCookiePreferences() {
  window.dispatchEvent(new CustomEvent(OPEN_PREFERENCES_EVENT));
}

export default function CookieBanner({ onNavigate }: CookieBannerProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    } else {
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    }
  }, []);

  useEffect(() => {
    const handleOpen = () => {
      setShowSettings(true);
      setIsVisible(true);
    };
    window.addEventListener(OPEN_PREFERENCES_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, handleOpen);
  }, []);

  const savePreferences = useCallback((prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setIsVisible(false);
    setShowSettings(false);
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: prefs }));
  }, []);

  const handleAcceptAll = useCallback(() => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    savePreferences(allAccepted);
  }, [savePreferences]);

  const handleRejectAll = useCallback(() => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    savePreferences(onlyNecessary);
  }, [savePreferences]);

  const handleSavePreferences = useCallback(() => {
    savePreferences(preferences);
  }, [preferences, savePreferences]);

  // The banner stays open while reading a policy so the choice is never skipped.
  const goToPage = useCallback(
    (page: string) => {
      setShowSettings(false);
      onNavigate?.(page);
    },
    [onNavigate]
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-end justify-center pointer-events-none">
      <div className="bg-white dark:bg-[var(--bm-surface)] rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-700 overflow-hidden mb-0 sm:mb-4 pointer-events-auto">
        {!showSettings ? (
          <>
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('cookies.title')}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t('cookies.body')}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-5">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-700"
                >
                  <Check className="h-5 w-5" />
                  {t('cookies.acceptAll')}
                </button>
                <button type="button" onClick={handleRejectAll} className="bm-link justify-center sm:flex-1">
                  <X className="h-4 w-4" />
                  {t('cookies.rejectAll')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="bm-link justify-center sm:flex-1"
                >
                  <Settings className="h-4 w-4" />
                  {t('cookies.customize')}
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                {t('cookies.policiesNote')}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => goToPage('privacy-policy')}
                  className="text-xs text-orange-600 hover:text-orange-700 underline"
                >
                  {t('legal.privacyPolicy.title')}
                </button>
                <button
                  onClick={() => goToPage('terms-of-service')}
                  className="text-xs text-orange-600 hover:text-orange-700 underline"
                >
                  {t('legal.termsOfService.title')}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('cookies.settingsTitle')}</h2>

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('cookies.categories.necessary.title')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('cookies.categories.necessary.body')}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <input type="checkbox" checked={true} disabled className="w-5 h-5 text-orange-600 rounded cursor-not-allowed opacity-50" />
                  </div>
                </div>

                {OPTIONAL_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-start justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t(`cookies.categories.${category}.title`)}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t(`cookies.categories.${category}.body`)}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={preferences[category]}
                        onChange={(e) => setPreferences({ ...preferences, [category]: e.target.checked })}
                        className="w-5 h-5 text-orange-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-5">
                <button type="button" onClick={() => setShowSettings(false)} className="bm-link justify-center sm:order-1">
                  {t('cookies.back')}
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="flex-1 rounded-lg bg-orange-600 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-700 sm:order-2"
                >
                  {t('cookies.save')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const loadConsent = () => {
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        setConsent(JSON.parse(savedPrefs));
      }
    };

    loadConsent();

    const handleConsentUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<CookiePreferences>;
      setConsent(customEvent.detail);
    };

    window.addEventListener('cookieConsentUpdated', handleConsentUpdate);

    return () => {
      window.removeEventListener('cookieConsentUpdated', handleConsentUpdate);
    };
  }, []);

  return consent;
}
