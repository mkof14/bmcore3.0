interface ReportBrandHeaderProps {
  title?: string;
  subtitle?: string;
  meta?: string[];
  compact?: boolean;
  variant?: 'card' | 'strip';
  className?: string;
}

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
        className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[var(--bm-surface)]/50 px-3 py-2 ${className}`}
      >
        <div className="flex items-center gap-2">
          <img src="/logo-header.png" alt="BioMath Core" className="h-6 w-auto" />
          <div>
            <p className="text-xs font-semibold text-gray-900 dark:text-white">{title}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{subtitle}</p>
          </div>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">biomathcore.com</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-[var(--bm-surface)]/60 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm ${
        compact ? 'p-4' : 'p-6'
      } ${className}`}
    >
      <div className={`flex flex-col ${compact ? 'gap-3' : 'gap-4'} md:flex-row md:items-center md:justify-between`}>
        <div className="flex items-center gap-3">
          <img src="/logo-header.png" alt="BioMath Core" className={compact ? 'h-8 w-auto' : 'h-10 w-auto'} />
          <div>
            <p className={`${compact ? 'text-sm' : 'text-sm'} font-semibold text-gray-900 dark:text-white`}>
              {title}
            </p>
            <p className={`${compact ? 'text-xs' : 'text-xs'} text-gray-500 dark:text-gray-400`}>
              {subtitle}
            </p>
          </div>
        </div>
        <div className={`${compact ? 'text-xs' : 'text-xs'} text-gray-500 dark:text-gray-400`}>
          <p>Website: biomathcore.com</p>
          <p>Support: support@biomathcore.com</p>
        </div>
      </div>

      {meta.length > 0 && (
        <div className={`${compact ? 'mt-3' : 'mt-4'} flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400`}>
          {meta.map((item) => (
            <span
              key={item}
              className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
