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

type NavAccent = 'health' | 'devices' | 'records' | 'services' | 'account';

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

  const menuSections: {
    accent: NavAccent;
    title: string;
    items: { id: string; label: string; icon: typeof Heart }[];
  }[] = [
    {
      accent: 'health',
      title: t('member.nav.health'),
      items: [
        { id: 'dashboard', label: t('member.nav.dashboard'), icon: Heart },
        { id: 'human-data-model', label: t('member.nav.humanDataModel'), icon: Waypoints },
        // Route id `ai-assistant` kept for deep links; label is Health Guide.
        { id: 'ai-assistant', label: t('member.nav.healthGuide'), icon: Scale },
        { id: 'questionnaires', label: t('member.nav.questionnaires'), icon: ClipboardList },
        { id: 'reports', label: t('member.nav.reports'), icon: FileText },
        { id: 'signal-hub', label: t('member.nav.signalHub'), icon: Database },
        { id: 'reminders', label: t('member.nav.reminders'), icon: Bell },
        { id: 'second-opinion', label: t('member.nav.secondOpinion'), icon: Scale },
      ],
    },
    {
      accent: 'devices',
      title: t('member.nav.devicesGroup'),
      items: [{ id: 'devices', label: t('member.nav.devices'), icon: Watch }],
    },
    {
      accent: 'records',
      title: t('member.nav.records'),
      items: [
        { id: 'medical-files', label: t('member.nav.medicalFiles'), icon: Dna },
        { id: 'black-box', label: t('member.nav.blackBox'), icon: FolderLock },
      ],
    },
    {
      accent: 'services',
      title: t('member.nav.services'),
      items: [
        { id: 'catalog', label: t('member.nav.catalog'), icon: BookOpen },
        { id: 'support', label: t('member.nav.support'), icon: HeadphonesIcon },
        { id: 'system', label: t('member.nav.system'), icon: Settings2 },
      ],
    },
    {
      accent: 'account',
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
        <div className="border-b border-theme px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] member-body">
                {t('member.zone.label')}
              </p>
              <p className="mt-0.5 text-xs member-muted">{t('member.zone.workspace')}</p>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 member-muted hover:bg-[var(--bm-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 lg:hidden"
              onClick={() => onMobileOpenChange(false)}
              aria-label={t('member.zone.closeMenu')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto py-3 px-2.5">
        {menuSections.map((section, sectionIndex) => {
          const visibleItems = section.items.filter(
            (item) => !(item.id === 'catalog' && !hasActiveSubscription),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div
              key={section.accent}
              data-accent={section.accent}
              className={`member-nav-group ${
                sectionIndex === 0
                  ? 'pb-2.5'
                  : 'member-nav-divider mt-0.5 border-t pt-2.5'
              }`}
            >
              {!isCollapsed ? (
                <h3 className="member-nav-label mb-1 px-2.5 text-[10px] font-bold uppercase tracking-[0.14em]">
                  {section.title}
                </h3>
              ) : (
                <div
                  className="member-nav-dot mx-auto mb-1.5 h-1 w-6 rounded-full"
                  aria-hidden
                  title={section.title}
                />
              )}
              <nav className="space-y-0.5" aria-label={section.title}>
                {visibleItems.map((item) => {
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
                      className={`member-nav-item w-full flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-all duration-200 ${
                        isActive
                          ? 'font-semibold'
                          : isCatalog
                            ? 'member-nav-item-catalog font-semibold'
                            : 'member-body'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className="member-nav-icon h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className={`text-[13px] leading-snug ${isActive || isCatalog ? 'font-semibold' : 'font-medium'}`}>
                          {item.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      <div className="border-t border-theme p-3 hidden lg:block">
        <button
          type="button"
          onClick={() => onCollapsedChange(!isCollapsed)}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? t('member.zone.expand') : t('member.zone.collapse')}
          className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 member-muted hover:bg-[var(--bm-surface)] dark:hover:bg-[var(--bm-elevated)] hover:text-[var(--bm-text)] rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">{t('member.zone.collapse')}</span>
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
        className="member-link fixed left-3 top-[4.5rem] z-40 gap-2 px-1 py-1 text-sm lg:hidden"
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
        className={`fixed left-0 top-16 bottom-0 z-50 border-r border-theme bg-header transition-transform duration-300 lg:z-40 lg:translate-x-0 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-64 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {navContent}
      </aside>
    </>
  );
}
