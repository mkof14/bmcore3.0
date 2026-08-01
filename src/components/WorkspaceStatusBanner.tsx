import { Shield, UserRound } from 'lucide-react';
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
  const user = useSession();
  const { isAdmin: isAdminUser } = useAdmin();
  const email = user?.email || 'Signed in';

  const isMember = zone === 'member';
  const Icon = isMember ? UserRound : Shield;
  const title = isMember ? 'Member Zone' : 'Admin';
  const accessLabel = isMember
    ? 'Full service access'
    : isAdminUser
      ? 'Superadmin access'
      : 'Admin access';

  return (
    <div
      className={`${sticky ? 'sticky top-16 z-30' : ''} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5 shadow-sm sm:px-4 ${
          isMember
            ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-950 dark:border-orange-500/30 dark:from-orange-950/50 dark:to-amber-950/30 dark:text-orange-100'
            : 'border-slate-300 bg-gradient-to-r from-slate-100 to-blue-50 text-slate-900 dark:border-slate-600 dark:from-slate-900 dark:to-blue-950/40 dark:text-slate-100'
        }`}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
              isMember
                ? 'bg-orange-500 text-white'
                : 'bg-slate-900 text-white dark:bg-blue-600'
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
          <span className="hidden text-xs text-gray-500 dark:text-gray-400 sm:inline">·</span>
          <span className="truncate text-xs text-gray-600 dark:text-gray-300" title={email}>
            {email}
          </span>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            isMember
              ? 'bg-white/80 text-orange-700 ring-1 ring-orange-200 dark:bg-black/20 dark:text-orange-200 dark:ring-orange-500/30'
              : 'bg-white/80 text-slate-700 ring-1 ring-slate-200 dark:bg-black/20 dark:text-blue-200 dark:ring-blue-500/30'
          }`}
        >
          {accessLabel}
        </span>
      </div>
    </div>
  );
}
