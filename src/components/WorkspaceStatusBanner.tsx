import { Shield, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdmin, useSession } from '../hooks/useSession';

export type WorkspaceZone = 'member' | 'admin';

interface WorkspaceStatusBannerProps {
  zone: WorkspaceZone;
  /** Optional section label shown next to the zone name */
  sectionLabel?: string;
  className?: string;
  sticky?: boolean;
}

/**
 * Persistent zone indicator so users always know Member Zone vs Admin context.
 */
export default function WorkspaceStatusBanner({
  zone,
  sectionLabel,
  className = '',
  sticky = true,
}: WorkspaceStatusBannerProps) {
  const { t } = useTranslation();
  const user = useSession();
  const { isAdmin: isAdminUser } = useAdmin();
  const email = user?.email || t('member.workspaceBanner.signedIn');

  const isMember = zone === 'member';
  const Icon = isMember ? UserRound : Shield;
  const title = isMember ? t('member.workspaceBanner.memberZone') : t('member.workspaceBanner.admin');
  const accessLabel = isMember
    ? t('member.workspaceBanner.memberAccess')
    : isAdminUser
      ? t('member.workspaceBanner.superadminAccess')
      : t('member.workspaceBanner.adminAccess');

  return (
    <div
      className={`${sticky ? 'sticky top-16 z-30' : ''} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 sm:px-3.5 ${
          isMember
            ? 'border-orange-200/80 bg-orange-50/70 text-orange-950 dark:border-orange-500/20 dark:bg-orange-950/30 dark:text-orange-100'
            : 'border-slate-300/80 bg-slate-100/70 text-slate-900 dark:border-slate-600/40 dark:bg-slate-900/40 dark:text-slate-100'
        }`}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
              isMember
                ? 'bg-orange-500/90 text-white'
                : 'bg-slate-800 text-white dark:bg-blue-700'
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {title}
          </span>
          {sectionLabel ? (
            <span className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
              {sectionLabel}
            </span>
          ) : null}
          <span className="hidden text-xs text-gray-400 dark:text-gray-500 sm:inline">·</span>
          <span className="truncate text-xs text-gray-600 dark:text-gray-300" title={email}>
            {email}
          </span>
        </div>
        <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">{accessLabel}</span>
      </div>
    </div>
  );
}
