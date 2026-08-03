import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, ArrowLeft, CheckCircle, X, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { notifyUserError } from '../lib/adminNotify';
import { userHasMemberAccess } from '../lib/memberAccess';
import MemberSidebar from '../components/MemberSidebar';
import DashboardSection from './member/DashboardSection';
import QuestionnairesSection from './member/QuestionnairesSection';
import ReportSettingsSection from './member/ReportSettingsSection';
import AIHealthAdvisorSection from './member/AIHealthAdvisorSection';
import DevicesSection from './member/DevicesSection';
import SupportSection from './member/SupportSection';
import PersonalInfoSection from './member/PersonalInfoSection';
import MedicalFilesSection from './member/MedicalFilesSection';
import BlackBoxSection from './member/BlackBoxSection';
import SecondOpinionSection from './member/SecondOpinionSection';
import BillingSection from './member/BillingSection';
import SystemSection from './member/SystemSection';
import ReferralSection from './member/ReferralSection';
import MyReportsSection from './member/MyReportsSection';
import CatalogSection from './member/CatalogSection';
import HumanDataModelSection from './member/HumanDataModelSection';
import SignalHubSection from './member/SignalHubSection';
import RemindersSection from './member/RemindersSection';
import ServiceDetail from './ServiceDetail';
import WorkspaceStatusBanner from '../components/WorkspaceStatusBanner';
import MemberSectionHero from '../components/MemberSectionHero';
import { scrollAppToTopAfterNavigate } from '../lib/scrollAppToTop';

interface MemberZoneProps {
  onNavigate: (page: string, data?: string) => void;
  onSignOut: () => void;
  initialServiceRef?: string;
}

export default function MemberZone({ onNavigate, onSignOut, initialServiceRef = '' }: MemberZoneProps) {
  const { t } = useTranslation();
  const [currentSection, setCurrentSection] = useState(initialServiceRef ? 'service-workspace' : 'dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subChecked, setSubChecked] = useState(false);
  const [activeServiceRef, setActiveServiceRef] = useState(initialServiceRef);

  useEffect(() => {
    if (initialServiceRef) {
      setActiveServiceRef(initialServiceRef);
      setCurrentSection('service-workspace');
      return;
    }
    try {
      const pending = sessionStorage.getItem('bmcore.pendingService');
      if (pending) {
        sessionStorage.removeItem('bmcore.pendingService');
        setActiveServiceRef(pending);
        setCurrentSection('service-workspace');
      }
    } catch {
      /* ignore */
    }
  }, [initialServiceRef]);

  // Section switches feel like page changes — jump window + member scroller to top.
  useEffect(() => {
    scrollAppToTopAfterNavigate();
  }, [currentSection]);

  useEffect(() => {
    // Check subscription status
    checkSubscription();

    // Check if returning from successful payment
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setShowSuccessModal(true);
      setCurrentSection('catalog'); // Show catalog after payment
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);

      // Send welcome email
      sendWelcomeEmail();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasActiveSubscription(false);
        return;
      }

      const hasAccess = await userHasMemberAccess(user.id, user.email);
      setHasActiveSubscription(hasAccess);
    } catch {
      notifyUserError(t('member.zone.subscriptionLoadFailed'));
    } finally {
      setSubChecked(true);
    }
  };

  const sendWelcomeEmail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('plan_id, billing_period')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscription) {
        const planLabel = subscription.plan_id.toUpperCase();
        const { sendEmail } = await import('../lib/emailProvider');
        await sendEmail({
          to: user.email!,
          subject: t('member.welcome.emailSubject'),
          html: `
            <h1>${t('member.welcome.emailHeading')}</h1>
            <p>${t('member.welcome.emailThanks', { plan: planLabel })}</p>
            <p>${t('member.welcome.emailAccess')}</p>
            <p>${t('member.welcome.emailGetStarted')}</p>
            <ul>
              <li>${t('member.welcome.emailItemDashboard')}</li>
              <li>${t('member.welcome.emailItemHealthGuide')}</li>
              <li>${t('member.welcome.emailItemDevices')}</li>
              <li>${t('member.welcome.emailItemReports')}</li>
            </ul>
            <p>${t('member.welcome.emailSupport')}</p>
            <p>${t('member.welcome.emailSignOff')}</p>
          `,
        });
      }
    } catch {
      notifyUserError(t('member.welcome.emailFailed'));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
    onNavigate('home');
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <DashboardSection />;

      case 'human-data-model':
        return (
          <HumanDataModelSection
            onOpenService={(servicePath) => {
              setActiveServiceRef(servicePath);
              setCurrentSection('service-workspace');
            }}
          />
        );

      case 'ai-assistant':
        return <AIHealthAdvisorSection />;

      case 'devices':
        return <DevicesSection />;

      case 'support':
        return <SupportSection />;

      case 'system':
        return <SystemSection />;

      case 'catalog':
        // Show catalog ONLY if user has active subscription
        if (!hasActiveSubscription) {
          return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="member-card border-orange-200 rounded-3xl p-12 max-w-2xl shadow-xl">
                <CreditCard className="w-16 h-16 text-orange-500 mx-auto mb-6" />
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-neutral-50 mb-4">
                  {t('member.gate.catalogTitle')}
                </h2>
                <p className="text-lg text-gray-600 dark:text-neutral-300 mb-8">
                  {t('member.gate.catalogBody')}
                </p>
                <button
                  onClick={() => onNavigate('pricing')}
                  className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all text-lg"
                >
                  {t('member.gate.viewPlans')}
                </button>
              </div>
            </div>
          );
        }
        return (
          <CatalogSection
            onSectionChange={setCurrentSection}
            onOpenService={(servicePath) => {
              setActiveServiceRef(servicePath);
              setCurrentSection('service-workspace');
            }}
          />
        );

      case 'service-workspace':
        if (!subChecked) {
          return (
            <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500 dark:text-neutral-400">
              {t('member.gate.loadingService')}
            </div>
          );
        }
        if (!hasActiveSubscription) {
          return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
              <div className="member-card max-w-2xl rounded-3xl border-orange-200 p-12 shadow-xl">
                <CreditCard className="mx-auto mb-6 h-16 w-16 text-orange-500" />
                <h2 className="mb-4 text-3xl font-semibold text-gray-900 dark:text-neutral-50">{t('member.gate.serviceTitle')}</h2>
                <p className="mb-8 text-lg text-gray-600 dark:text-neutral-300">
                  {t('member.gate.serviceBody')}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('pricing')}
                  className="rounded-lg bg-orange-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-orange-600"
                >
                  {t('member.gate.viewPlans')}
                </button>
              </div>
            </div>
          );
        }
        return (
          <ServiceDetail
            embedded
            serviceId={activeServiceRef}
            onBack={() => setCurrentSection('catalog')}
            onNavigate={(page, data) => {
              if (page === 'service-detail' && data) {
                setActiveServiceRef(data);
                setCurrentSection('service-workspace');
                return;
              }
              onNavigate(page, data);
            }}
          />
        );

      case 'questionnaires':
        return <QuestionnairesSection onNavigateSection={setCurrentSection} />;

      case 'reports':
        return <MyReportsSection />;

      case 'signal-hub':
        return <SignalHubSection />;

      case 'reminders':
        return <RemindersSection />;

      case 'second-opinion':
        return <SecondOpinionSection />;

      case 'medical-files':
        return <MedicalFilesSection />;

      case 'black-box':
        return <BlackBoxSection />;

      case 'referral':
        return <ReferralSection />;

      case 'billing':
        return <BillingSection />;

      case 'profile':
        return <PersonalInfoSection />;

      case 'settings':
        return <ReportSettingsSection />;

      default:
        return <DashboardSection />;
    }
  };

  const sectionLabels: Record<string, string> = {
    dashboard: t('member.nav.dashboard'),
    'human-data-model': t('member.nav.humanDataModel'),
    'ai-assistant': t('member.nav.healthGuide'),
    devices: t('member.nav.devices'),
    support: t('member.nav.support'),
    system: t('member.nav.system'),
    catalog: t('member.nav.catalog'),
    'service-workspace': t('member.nav.serviceWorkspace'),
    questionnaires: t('member.nav.questionnaires'),
    reports: t('member.nav.reports'),
    'signal-hub': t('member.nav.signalHub'),
    reminders: t('member.nav.reminders'),
    'second-opinion': t('member.nav.secondOpinion'),
    'medical-files': t('member.nav.medicalFiles'),
    'black-box': t('member.nav.blackBox'),
    referral: t('member.nav.referral'),
    billing: t('member.nav.billing'),
    profile: t('member.nav.profile'),
    settings: t('member.nav.settings'),
  };

  const contentMarginClass = sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64';

  return (
    <div className="member-zone min-h-screen bg-page transition-colors pt-16">
      <MemberSidebar
        currentSection={currentSection === 'service-workspace' ? 'catalog' : currentSection}
        onSectionChange={setCurrentSection}
        hasActiveSubscription={hasActiveSubscription}
        isCollapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onMobileOpenChange={setMobileSidebarOpen}
      />

      <div
        className={`ml-0 ${contentMarginClass} transition-all duration-300 pt-12 lg:pt-0`}
        data-scroll-root
        data-scroll-blur
      >
        <div className="px-4 sm:px-6 pt-6">
          <WorkspaceStatusBanner
            zone="member"
            sectionLabel={sectionLabels[currentSection] || currentSection}
            className="mb-4"
          />

          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="member-btn"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{t('member.zone.backHome')}</span>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="member-btn"
            >
              <LogOut className="h-5 w-5" />
              <span>{t('member.zone.signOut')}</span>
            </button>
          </div>
        </div>

        {/* Full-bleed photo hero across the member content column (all sections except service workspace). */}
        {currentSection !== 'service-workspace' && (
          <MemberSectionHero section={currentSection} />
        )}

        <div
          className={`mx-auto px-6 py-8 ${
            currentSection === 'service-workspace' ? 'max-w-6xl' : 'max-w-7xl'
          }`}
        >
          {renderSection()}
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="member-card shadow-2xl max-w-md w-full p-8 relative animate-slideUp">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 member-muted hover:text-[var(--bm-text)] transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-3xl font-bold member-heading mb-4">
                {t('member.welcome.title')}
              </h2>

              <p className="text-lg member-body mb-6">
                {t('member.welcome.body')}
              </p>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6 text-start">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {t('member.welcome.nextStepTitle')}
                </h3>
                <p className="text-sm text-gray-700 dark:text-neutral-200 mb-4">
                  {t('member.welcome.nextStepBody')}
                </p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-neutral-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>{t('member.welcome.corePlan')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>{t('member.welcome.dailyPlan')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>{t('member.welcome.maxPlan')}</span>
                  </li>
                </ul>
              </div>

              <p className="text-sm text-gray-500 dark:text-neutral-300 mb-6">
                {t('member.welcome.emailNote')}
              </p>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  // After payment, go to catalog to select categories
                  setCurrentSection('catalog');
                  // Refresh subscription status
                  checkSubscription();
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                {t('member.welcome.goToCatalog')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
