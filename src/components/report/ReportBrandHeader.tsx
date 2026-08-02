interface ReportBrandHeaderProps {
  title?: string;
  subtitle?: string;
  meta?: string[];
  compact?: boolean;
  variant?: 'card' | 'strip';
  className?: string;
}

/**
 * Brand chrome for member/report surfaces.
 * Uses solid theme tokens (no /opacity modifiers) so light = light bar + dark text,
 * dark = elevated surface + high-contrast text.
 */
export default function ReportBrandHeader({
  title = 'BioMath Core',
  subtitle = 'Health Intelligence Report',
  meta = [],
  compact = false,
  variant = 'card',
  className = '',
}: ReportBrandHeaderProps) {
  if (variant === 'strip') {
    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--bm-border)] bg-[var(--bm-elevated)] px-3 py-2 shadow-sm ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <img src="/logo-header.png" alt="BioMath Core" className="h-6 w-auto shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold member-heading truncate">{title}</p>
            <p className="text-[11px] member-muted truncate">{subtitle}</p>
          </div>
        </div>
        <p className="text-[11px] member-muted shrink-0">biomathcore.com</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-[var(--bm-elevated)] border border-[var(--bm-border)] rounded-xl shadow-sm ${
        compact ? 'p-4' : 'p-6'
      } ${className}`}
    >
      <div className={`flex flex-col ${compact ? 'gap-3' : 'gap-4'} md:flex-row md:items-center md:justify-between`}>
        <div className="flex items-center gap-3">
          <img src="/logo-header.png" alt="BioMath Core" className={compact ? 'h-8 w-auto' : 'h-10 w-auto'} />
          <div>
            <p className="text-sm font-semibold member-heading">{title}</p>
            <p className="text-xs member-muted">{subtitle}</p>
          </div>
        </div>
        <div className="text-xs member-muted">
          <p>Website: biomathcore.com</p>
          <p>Support: support@biomathcore.com</p>
        </div>
      </div>

      {meta.length > 0 && (
        <div className={`${compact ? 'mt-3' : 'mt-4'} flex flex-wrap gap-2 text-xs member-muted`}>
          {meta.map((item) => (
            <span
              key={item}
              className="px-2 py-1 rounded-full bg-[var(--bm-surface)] member-body"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
