import {
  LayoutDashboard,
  Brain,
  Watch,
  HeadphonesIcon,
  Settings2,
  BookOpen,
  ClipboardList,
  FileText,
  Scale,
  FolderLock,
  Users,
  CreditCard,
  User,
  Settings,
  Database,
  Waypoints,
  Bell,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MemberSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  hasActiveSubscription?: boolean;
}

export default function MemberSidebar({ currentSection, onSectionChange, hasActiveSubscription = false }: MemberSidebarProps) {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuSections = [
    {
      title: t('member.nav.main'),
      items: [
        { id: 'dashboard', label: t('member.nav.dashboard'), icon: LayoutDashboard },
        { id: 'human-data-model', label: t('member.nav.humanDataModel'), icon: Waypoints },
        { id: 'ai-assistant', label: t('member.nav.healthGuide'), icon: Scale },
        { id: 'devices', label: t('member.nav.devices'), icon: Watch },
      ]
    },
    {
      title: t('member.nav.supportServices'),
      items: [
        { id: 'support', label: t('member.nav.support'), icon: HeadphonesIcon },
        { id: 'system', label: t('member.nav.system'), icon: Settings2 },
        { id: 'catalog', label: t('member.nav.catalog'), icon: BookOpen },
      ]
    },
    {
      title: t('member.nav.healthAnalysis'),
      items: [
        { id: 'questionnaires', label: t('member.nav.questionnaires'), icon: ClipboardList },
        { id: 'reports', label: t('member.nav.reports'), icon: FileText },
        { id: 'signal-hub', label: t('member.nav.signalHub'), icon: Database },
        { id: 'reminders', label: t('member.nav.reminders'), icon: Bell },
        { id: 'second-opinion', label: t('member.nav.secondOpinion'), icon: Scale },
      ]
    },
    {
      title: t('member.nav.dataDocuments'),
      items: [
        { id: 'medical-files', label: t('member.nav.medicalFiles'), icon: FolderLock },
        { id: 'black-box', label: t('member.nav.blackBox'), icon: FolderLock },
      ]
    },
    {
      title: t('member.nav.account'),
      items: [
        { id: 'referral', label: t('member.nav.referral'), icon: Users },
        { id: 'billing', label: t('member.nav.billing'), icon: CreditCard },
        { id: 'profile', label: t('member.nav.profile'), icon: User },
        { id: 'settings', label: t('member.nav.settings'), icon: Settings },
      ]
    }
  ];

  return (
    <aside className={`fixed left-0 top-16 bottom-0 z-40 border-r border-theme bg-gradient-to-b from-[var(--bm-header)] to-[var(--bm-page)] transition-all duration-300 dark:from-[var(--bm-surface)] dark:to-[var(--bm-page)] ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      <div className="h-full flex flex-col">
        {!isCollapsed && (
          <div className="border-b border-orange-200/80 bg-orange-50/90 px-4 py-3 dark:border-orange-500/20 dark:bg-orange-950/40">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-600 dark:text-orange-400">
              {t('member.zone.label')}
            </p>
            <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{t('member.zone.workspace')}</p>
          </div>
        )}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {!isCollapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-600 dark:text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <nav className="space-y-1">
                {section.items.map((item) => {
                  // Hide Catalog if no active subscription
                  if (item.id === 'catalog' && !hasActiveSubscription) {
                    return null;
                  }

                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  const isCatalog = item.id === 'catalog';

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSectionChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 border border-orange-300 dark:border-orange-600/30 text-orange-600 dark:text-orange-500'
                          : isCatalog
                          ? 'bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/10 border border-green-300 dark:border-green-600/30 text-green-600 dark:text-green-400 hover:from-green-200 hover:to-green-100 dark:hover:from-green-900/30 dark:hover:to-green-800/20'
                          : 'text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-300 dark:hover:border-gray-700/50'
                      }`}
                      title={isCollapsed ? item.label : ''}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-orange-600 dark:text-orange-500' : isCatalog ? 'text-green-600 dark:text-green-400' : ''}`} />
                      {!isCollapsed && (
                        <span className={`text-sm font-medium ${isActive ? 'font-semibold' : isCatalog ? 'font-semibold' : ''}`}>
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

        <div className="border-t border-gray-300 dark:border-gray-800/50 p-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-300 rounded-lg transition-all duration-300"
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
    </aside>
  );
}
