import {
  Heart,
  Watch,
  HeadphonesIcon,
  Settings2,
  BookOpen,
  ClipboardList,
  FileText,
  Scale,
  FolderLock,
  Dna,
  Users,
  CreditCard,
  User,
  Settings,
  Database,
  Waypoints,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface MemberSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  hasActiveSubscription?: boolean;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export default function MemberSidebar({
  currentSection,
  onSectionChange,
  hasActiveSubscription = false,
  isCollapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileOpenChange,
}: MemberSidebarProps) {
  const { t } = useTranslation();

  const menuSections = [
    {
      title: t('member.nav.main'),
      items: [
        { id: 'dashboard', label: t('member.nav.dashboard'), icon: Heart },
        { id: 'human-data-model', label: t('member.nav.humanDataModel'), icon: Waypoints },
        // Route id `ai-assistant` kept for deep links; label is Health Guide.
        { id: 'ai-assistant', label: t('member.nav.healthGuide'), icon: Scale },
        { id: 'devices', label: t('member.nav.devices'), icon: Watch },
      ],
    },
    {
      title: t('member.nav.supportServices'),
      items: [
        { id: 'support', label: t('member.nav.support'), icon: HeadphonesIcon },
        { id: 'system', label: t('member.nav.system'), icon: Settings2 },
        { id: 'catalog', label: t('member.nav.catalog'), icon: BookOpen },
      ],
    },
    {
      title: t('member.nav.healthAnalysis'),
      items: [
        { id: 'questionnaires', label: t('member.nav.questionnaires'), icon: ClipboardList },
        { id: 'reports', label: t('member.nav.reports'), icon: FileText },
        { id: 'signal-hub', label: t('member.nav.signalHub'), icon: Database },
        { id: 'reminders', label: t('member.nav.reminders'), icon: Bell },
        { id: 'second-opinion', label: t('member.nav.secondOpinion'), icon: Scale },
      ],
    },
    {
      title: t('member.nav.dataDocuments'),
      items: [
        { id: 'medical-files', label: t('member.nav.medicalFiles'), icon: Dna },
        { id: 'black-box', label: t('member.nav.blackBox'), icon: FolderLock },
      ],
    },
    {
      title: t('member.nav.account'),
      items: [
        { id: 'referral', label: t('member.nav.referral'), icon: Users },
        { id: 'billing', label: t('member.nav.billing'), icon: CreditCard },
        { id: 'profile', label: t('member.nav.profile'), icon: User },
        { id: 'settings', label: t('member.nav.settings'), icon: Settings },
      ],
    },
  ];

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, onMobileOpenChange]);

  const handleNavigate = (id: string) => {
    onSectionChange(id);
    onMobileOpenChange(false);
  };

  const navContent = (
    <div className="h-full flex flex-col">
      {!isCollapsed && (
        <div className="border-b border-orange-200/80 bg-orange-50/90 px-4 py-3 dark:border-orange-500/15 dark:bg-[var(--bm-surface)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-600 dark:text-orange-400">
                {t('member.zone.label')}
              </p>
              <p className="mt-0.5 text-xs member-body">{t('member.zone.workspace')}</p>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 member-muted hover:bg-[var(--bm-elevated)] lg:hidden"
              onClick={() => onMobileOpenChange(false)}
              aria-label={t('member.zone.closeMenu')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {!isCollapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold member-muted uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <nav className="space-y-1" aria-label={section.title}>
              {section.items.map((item) => {
                if (item.id === 'catalog' && !hasActiveSubscription) {
                  return null;
                }

                const Icon = item.icon;
                const isActive =
                  currentSection === item.id ||
                  (item.id === 'reports' && currentSection === 'my-reports');
                const isCatalog = item.id === 'catalog';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/25 dark:to-[var(--bm-elevated)] border border-orange-300 dark:border-orange-600/25 text-orange-600 dark:text-orange-400'
                        : isCatalog
                          ? 'bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/15 dark:to-[var(--bm-elevated)] border border-green-300 dark:border-green-600/25 text-green-600 dark:text-green-400 hover:from-green-200 hover:to-green-100 dark:hover:from-green-900/25 dark:hover:to-[var(--bm-elevated)]'
                          : 'member-body hover:bg-[var(--bm-surface)] dark:hover:bg-[var(--bm-elevated)] border border-transparent hover:border-[var(--bm-border)]'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 ${
                        isActive
                          ? 'text-orange-600 dark:text-orange-500'
                          : isCatalog
                            ? 'text-green-600 dark:text-green-400'
                            : ''
                      }`}
                    />
                    {!isCollapsed && (
                      <span
                        className={`text-sm font-medium ${
                          isActive ? 'font-semibold' : isCatalog ? 'font-semibold' : ''
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-theme p-4 hidden lg:block">
        <button
          type="button"
          onClick={() => onCollapsedChange(!isCollapsed)}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? t('member.zone.expand') : t('member.zone.collapse')}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 member-muted hover:bg-[var(--bm-surface)] dark:hover:bg-[var(--bm-elevated)] hover:text-[var(--bm-text)] rounded-lg transition-all duration-300"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm">{t('member.zone.collapse')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu trigger — rendered in a fixed slot under the site header */}
      <button
        type="button"
        onClick={() => onMobileOpenChange(true)}
        className="fixed left-3 top-[4.5rem] z-40 flex items-center gap-2 rounded-lg border border-theme bg-[var(--bm-header)] px-3 py-2 text-sm font-medium member-body shadow-sm lg:hidden"
        aria-expanded={mobileOpen}
        aria-controls="member-sidebar"
        aria-label={t('member.zone.openMenu')}
      >
        <Menu className="h-5 w-5" />
        <span>{t('member.zone.menu')}</span>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-label={t('member.zone.closeMenu')}
          onClick={() => onMobileOpenChange(false)}
        />
      )}

      <aside
        id="member-sidebar"
        data-scroll-blur
        className={`fixed left-0 top-16 bottom-0 z-50 border-r border-theme bg-gradient-to-b from-[var(--bm-header)] to-[var(--bm-page)] transition-transform duration-300 dark:from-[var(--bm-header)] dark:via-[var(--bm-surface)] dark:to-[var(--bm-page)] lg:z-40 lg:translate-x-0 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-64 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {navContent}
      </aside>
    </>
  );
}
