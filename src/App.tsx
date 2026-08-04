import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import Footer from './components/Footer';
import AIAssistantButton from './components/AIAssistantButton';
import CookieBanner from './components/CookieBanner';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';
import CommandPalette from './components/CommandPalette';
import { analytics, identifyUser, initAnalytics } from './lib/analytics';
import { userHasMemberAccess } from './lib/memberAccess';
import { useServiceWorker } from './hooks/useServiceWorker';
import { initWebVitals } from './lib/webVitals';
import AdminGate from './components/AdminGate';
import AdminToast from './components/AdminToast';
import Home from './pages/Home';
import {
  type AppPage,
  parseLocation,
  syncUrl,
} from './lib/routing';
import { scrollAppToTopAfterNavigate } from './lib/scrollAppToTop';

function PageFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
    </div>
  );
}

const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Investors = lazy(() => import('./pages/Investors'));
const Science = lazy(() => import('./pages/Science'));
const API = lazy(() => import('./pages/API'));
const Contact = lazy(() => import('./pages/Contact'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const MemberZone = lazy(() => import('./pages/MemberZone'));
const ServicesCatalog = lazy(() => import('./pages/ServicesCatalog'));
const ServicePublicPage = lazy(() => import('./pages/ServicePublicPage'));
const Devices = lazy(() => import('./pages/Devices'));
const Reports = lazy(() => import('./pages/Reports'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Refer = lazy(() => import('./pages/Refer'));
const LearningCenter = lazy(() => import('./pages/LearningCenter'));
const BiomathCoreSummary = lazy(() => import('./pages/BiomathCoreSummary'));
const SummaryText = lazy(() => import('./pages/SummaryText'));
const Blog = lazy(() => import('./pages/Blog'));
const News = lazy(() => import('./pages/News'));
const Media = lazy(() => import('./pages/Media'));
const Careers = lazy(() => import('./pages/Careers'));
const CommandCenter = lazy(() => import('./pages/CommandCenter'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const Disclaimer = lazy(() => import('./pages/legal/Disclaimer'));
const HIPAANotice = lazy(() => import('./pages/legal/HIPAANotice'));
const Security = lazy(() => import('./pages/legal/Security'));
const GDPR = lazy(() => import('./pages/legal/GDPR'));
const DataPrivacy = lazy(() => import('./pages/legal/DataPrivacy'));
const TrustSafety = lazy(() => import('./pages/legal/TrustSafety'));
const Partnership = lazy(() => import('./pages/Partnership'));
const RedeemInvitation = lazy(() => import('./pages/RedeemInvitation'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const WhyTwoModels = lazy(() => import('./pages/WhyTwoModels'));
const PrivacyTrust = lazy(() => import('./pages/PrivacyTrust'));
const ConfigSystem = lazy(() => import('./pages/admin/ConfigSystem'));
const SecondOpinionDemo = lazy(() => import('./pages/SecondOpinionDemo'));
const SharedReport = lazy(() => import('./pages/SharedReport'));
/** Health Guide panel — kept off the critical path until first open. */
const AIHealthAssistant = lazy(() => import('./components/AIHealthAssistant'));

type Page = AppPage;

function readInitialRoute() {
  return parseLocation();
}

function App() {
  // VERSION: 2025-10-20-01:48 - Force HMR refresh
  const initialRoute = readInitialRoute();
  const [currentPage, setCurrentPage] = useState<Page>(initialRoute.page);
  const [serviceDetailId, setServiceDetailId] = useState<string>(initialRoute.serviceDetailId);
  const [categoryFilter, setCategoryFilter] = useState<string>(initialRoute.categoryFilter);
  const [memberServiceRef, setMemberServiceRef] = useState<string>(initialRoute.memberServiceRef);
  const [shareToken, setShareToken] = useState<string>(initialRoute.shareToken);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  /** Mount Health Guide chunk only after first open (button stays eager/light). */
  const [assistantMounted, setAssistantMounted] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();
  const isAuthenticatedRef = useRef(isAuthenticated);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Check subscription / admin / dev-member access
  const checkSubscription = async (userId: string, email?: string | null) => {
    return userHasMemberAccess(userId, email);
  };

  const applyRoute = (route: ReturnType<typeof parseLocation>) => {
    setServiceDetailId(route.serviceDetailId);
    setCategoryFilter(route.categoryFilter);
    setMemberServiceRef(route.memberServiceRef);
    setShareToken(route.shareToken);
    setCurrentPage(route.page);
  };

  const goToPage = (page: Page, data?: string, options?: { replace?: boolean }) => {
    if (page === 'shared-report') setShareToken(data || '');
    // Collapse legacy growth keys onto the combined Refer page.
    const target: Page =
      page === 'referral' || page === 'ambassador' ? 'refer' : page;
    setCurrentPage(target);
    syncUrl(page, data, { replace: options?.replace });
    // Sync + post-paint: pushState keeps scroll; focused footer links can re-scroll after paint.
    // Keep in-page section hashes (#invite / #ambassador) — do not jump to top.
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (!hash || hash.startsWith('#/')) {
      scrollAppToTopAfterNavigate();
    }
  };

  // Jump to top on every SPA page/detail change (nav links, back/forward, initial sync).
  // Skip real in-page anchors (#section); legacy hash routes use #/… and are normalized separately.
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && !hash.startsWith('#/')) return;
    scrollAppToTopAfterNavigate();
  }, [currentPage, serviceDetailId, categoryFilter, memberServiceRef]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Consent-gated: loads GA/Pixel only when biomath_cookie_preferences.analytics is true
    // (or after cookieConsentUpdated). Missing VITE_GA_* / Pixel IDs fail soft.
    initAnalytics();
    initWebVitals();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        identifyUser(session.user.id, {
          email: session.user.email
        });
        checkSubscription(session.user.id, session.user.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        identifyUser(session.user.id, {
          email: session.user.email
        });
        checkSubscription(session.user.id, session.user.email);
      } 
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    analytics.page(currentPage);
  }, [currentPage]);

  // Normalize legacy hash URLs (#/pricing → /pricing) once on mount
  useEffect(() => {
    const route = parseLocation();
    if (route.normalizeUrl) {
      window.history.replaceState(
        { page: route.page, data: route.serviceDetailId || route.categoryFilter || null },
        '',
        route.normalizeUrl,
      );
    }
  }, []);

  // Browser back/forward + legacy hash navigations from older links
  useEffect(() => {
    const syncFromLocation = () => {
      applyRoute(parseLocation());
    };

    const onPopState = () => syncFromLocation();
    const onHashChange = () => {
      if (window.location.hash.startsWith('#/')) {
        const route = parseLocation();
        applyRoute(route);
        if (route.normalizeUrl) {
          window.history.replaceState(
            { page: route.page, data: route.serviceDetailId || route.categoryFilter || null },
            '',
            route.normalizeUrl,
          );
        }
      }
    };

    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  useEffect(() => {
    const handleOpenCommandPalette = () => setIsCommandPaletteOpen(true);
    const handleOpenAIAssistant = () => setIsAssistantOpen(true);

    window.addEventListener('open-command-palette', handleOpenCommandPalette);
    window.addEventListener('open-ai-assistant', handleOpenAIAssistant);

    return () => {
      window.removeEventListener('open-command-palette', handleOpenCommandPalette);
      window.removeEventListener('open-ai-assistant', handleOpenAIAssistant);
    };
  }, []);

  const handleNavigate = async (page: string, data?: string) => {
    // Member zone: require auth; plan check skipped for superadmin / mock session
    if ((page === 'member' || page === 'member-zone') && !isAuthenticatedRef.current) {
      setCategoryFilter('');
      setMemberServiceRef('');
      goToPage('signin', undefined, { replace: false });
      return;
    }

    if ((page === 'member' || page === 'member-zone') && isAuthenticatedRef.current) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      // If session user missing (stale flag), force sign-in again
      if (!user) {
        setIsAuthenticated(false);
        setCategoryFilter('');
        setMemberServiceRef('');
        goToPage('signin');
        return;
      }
      const hasAccess = await checkSubscription(user.id, user.email);
      if (!hasAccess) {
        setCategoryFilter('');
        setMemberServiceRef('');
        goToPage('pricing');
        return;
      }
      setMemberServiceRef(data || '');
      setCategoryFilter('');
      setServiceDetailId('');
      goToPage('member-zone', data);
      return;
    }

    // Public service pages = description-only preview (same for HDM + category services).
    // Signed-in members with access open the FULL workspace in Member Zone — except
    // Human Data Model shared tools stay on the public description page from Home/public.
    if (page === 'service-detail' && data) {
      const isHdmPublicPreview = data.startsWith('human-data-model/');
      if (isAuthenticatedRef.current && !isHdmPublicPreview) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const hasAccess = await checkSubscription(user.id, user.email);
          if (hasAccess) {
            try {
              sessionStorage.setItem('bmcore.pendingService', data);
            } catch {
              /* ignore */
            }
            setMemberServiceRef(data);
            setServiceDetailId(data);
            setCategoryFilter('');
            goToPage('member-zone', data);
            return;
          }
        }
      }
      setServiceDetailId(data);
      setCategoryFilter('');
      setMemberServiceRef('');
      goToPage('service-detail', data);
      return;
    }

    if (page === 'services-catalog' && data) {
      setCategoryFilter(data);
      setServiceDetailId('');
      setMemberServiceRef('');
      goToPage('services-catalog', data);
      return;
    }

    setCategoryFilter('');
    if (page !== 'service-detail') {
      setServiceDetailId('');
    }
    if (page !== 'member' && page !== 'member-zone') {
      setMemberServiceRef('');
    }
    goToPage(page as Page, data);
  };

  const handleSignIn = () => {
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'about':
        return <About onNavigate={handleNavigate} />;
      case 'services':
        return <Services onNavigate={handleNavigate} />;
      case 'pricing':
        return <Pricing onNavigate={handleNavigate} />;
      case 'services-catalog':
        return <ServicesCatalog onNavigate={handleNavigate} initialCategory={categoryFilter} />;
      case 'service-detail':
        // Public preview only. Members with access are redirected to Member Zone workspace above.
        return <ServicePublicPage onNavigate={handleNavigate} serviceId={serviceDetailId} />;
      case 'investors':
        return <Investors onNavigate={handleNavigate} />;
      case 'science':
        return <Science />;
      case 'api':
        // Developer documentation is an internal tool: reachable from the Admin panel only.
        return <AdminGate onNavigate={handleNavigate}><API onNavigate={handleNavigate} /></AdminGate>;
      case 'contact':
        return <Contact onNavigate={handleNavigate} />;
      case 'faq':
        return <FAQ onNavigate={handleNavigate} />;
      case 'signin':
        return <SignIn onNavigate={handleNavigate} onSignIn={handleSignIn} />;
      case 'signup':
        return <SignUp onNavigate={handleNavigate} />;
      case 'member':
      case 'member-zone':
        return isAuthenticated ? (
          <MemberZone
            key={memberServiceRef || 'member-zone'}
            onNavigate={handleNavigate}
            onSignOut={handleSignOut}
            initialServiceRef={memberServiceRef}
          />
        ) : (
          <SignIn onNavigate={handleNavigate} onSignIn={handleSignIn} />
        );
      case 'devices':
        return isAuthenticated ? (
          <Devices onNavigate={handleNavigate} />
        ) : (
          <SignIn onNavigate={handleNavigate} onSignIn={handleSignIn} />
        );
      case 'reports':
        return isAuthenticated ? (
          <Reports onNavigate={handleNavigate} />
        ) : (
          <SignIn onNavigate={handleNavigate} onSignIn={handleSignIn} />
        );
      case 'refer':
      case 'referral':
      case 'ambassador':
        return <Refer onNavigate={handleNavigate} />;
      case 'learning':
      case 'learning-center':
        return <LearningCenter onNavigate={handleNavigate} />;
      case 'biomath-core-summary':
        return <BiomathCoreSummary onNavigate={handleNavigate} />;
      case 'summary-text':
        return <SummaryText onNavigate={handleNavigate} />;
      case 'blog':
        return <Blog onNavigate={handleNavigate} />;
      case 'news':
        return <News onNavigate={handleNavigate} />;
      case 'media':
        return <Media onNavigate={handleNavigate} />;
      case 'careers':
        return <Careers onNavigate={handleNavigate} />;
      case 'command-center':
        return <AdminGate onNavigate={handleNavigate}><CommandCenter onNavigate={handleNavigate} /></AdminGate>;
      case 'admin-panel':
        return <AdminGate onNavigate={handleNavigate}><AdminPanel onNavigate={handleNavigate} /></AdminGate>;
      case 'config-system':
        return <AdminGate onNavigate={handleNavigate}><ConfigSystem /></AdminGate>;
      case 'privacy-policy':
        return <PrivacyPolicy onNavigate={handleNavigate} />;
      case 'terms-of-service':
        return <TermsOfService onNavigate={handleNavigate} />;
      case 'disclaimer':
        return <Disclaimer onNavigate={handleNavigate} />;
      case 'hipaa-notice':
        return <HIPAANotice onNavigate={handleNavigate} />;
      case 'security':
        return <Security onNavigate={handleNavigate} />;
      case 'gdpr':
        return <GDPR onNavigate={handleNavigate} />;
      case 'data-privacy':
        return <DataPrivacy onNavigate={handleNavigate} />;
      case 'trust-safety':
        return <TrustSafety onNavigate={handleNavigate} />;
      case 'partnership':
        return <Partnership onNavigate={handleNavigate} />;
      case 'redeem-invitation':
        return <RedeemInvitation />;
      case 'how-it-works':
        return <HowItWorks onNavigate={handleNavigate} />;
      case 'why-two-models':
        return <WhyTwoModels />;
      case 'privacy-trust':
        return <PrivacyTrust onNavigate={handleNavigate} />;
      case 'second-opinion-demo':
        return <SecondOpinionDemo onNavigate={handleNavigate} />;
      case 'shared-report':
        return (
          <SharedReport
            shareToken={shareToken}
            onNavigate={handleNavigate}
          />
        );
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  const showHeaderFooter = currentPage !== 'signin' && currentPage !== 'signup';
  // Member Zone renders its own full footer inside the content column
  // so it never spans under / collides with the fixed sidebar.
  const isMemberWorkspace = currentPage === 'member-zone' || currentPage === 'member';
  const showSiteFooter = showHeaderFooter && !isMemberWorkspace;

  return (
    <div
      className={`min-h-screen bg-page transition-colors${
        isMemberWorkspace ? ' member-workspace' : ''
      }`}
    >
      <AdminToast />
      {showHeaderFooter && (
        <Header
          onNavigate={handleNavigate}
          currentPage={currentPage}
          isAuthenticated={isAuthenticated}
          onSignOut={handleSignOut}
        />
      )}
      <main data-scroll-root>
        <Suspense fallback={<PageFallback />}>
          {renderPage()}
        </Suspense>
      </main>
      {showSiteFooter && <Footer onNavigate={handleNavigate} />}

      <AIAssistantButton
        onClick={() => {
          if (isAssistantOpen) {
            setIsAssistantOpen(false);
            return;
          }
          setAssistantMounted(true);
          setIsAssistantOpen(true);
        }}
        isOpen={isAssistantOpen}
      />

      {assistantMounted && (
        <Suspense fallback={null}>
          <AIHealthAssistant
            isOpen={isAssistantOpen}
            onClose={() => setIsAssistantOpen(false)}
          />
        </Suspense>
      )}

      <CookieBanner onNavigate={handleNavigate} />

      <PWAInstallPrompt />

      {isUpdateAvailable && (
        <PWAUpdatePrompt onUpdate={updateServiceWorker} />
      )}

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(page) => {
          handleNavigate(page);
          setIsCommandPaletteOpen(false);
        }}
      />
    </div>
  );
}

export default App;
