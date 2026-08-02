import type { ReactNode } from 'react';

type MetricAccent = 'blue' | 'green' | 'orange' | 'purple' | 'amber' | 'emerald';

type MemberMetricCardProps = {
  accent?: MetricAccent;
  icon?: ReactNode;
  value: ReactNode;
  label: ReactNode;
  hint?: ReactNode;
  badge?: ReactNode;
  className?: string;
};

const accentBorder: Record<MetricAccent, string> = {
  blue: 'border-l-blue-500',
  green: 'border-l-green-500',
  orange: 'border-l-orange-500',
  purple: 'border-l-purple-500',
  amber: 'border-l-amber-500',
  emerald: 'border-l-emerald-500',
};

const accentIcon: Record<MetricAccent, string> = {
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  orange: 'text-orange-600 dark:text-orange-400',
  purple: 'text-purple-600 dark:text-purple-400',
  amber: 'text-amber-600 dark:text-amber-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
};

/**
 * Elevated metric/stat card for Member Zone.
 * Dark mode: solid --bm-elevated surface + colored left accent (no pastel gradients).
 */
export default function MemberMetricCard({
  accent = 'blue',
  icon,
  value,
  label,
  hint,
  badge,
  className = '',
}: MemberMetricCardProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--bm-border)] border-l-4 ${accentBorder[accent]} bg-[var(--bm-elevated)] p-4 shadow-sm ${className}`}
    >
      {(icon || badge) && (
        <div className="mb-2 flex items-center justify-between gap-2">
          {icon ? <div className={accentIcon[accent]}>{icon}</div> : <span />}
          {badge}
        </div>
      )}
      <p className="text-2xl font-bold member-heading tabular-nums break-all">{value}</p>
      <p className="text-xs member-body mt-1">{label}</p>
      {hint ? <div className="mt-2 text-xs member-muted">{hint}</div> : null}
    </div>
  );
}
