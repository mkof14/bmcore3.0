import type { ReactNode } from 'react';

export type PageHeroProps = {
  imageSrc: string;
  /** Decorative by default — headline carries meaning. */
  imageAlt?: string;
  label?: string;
  title: string;
  subtitle?: string;
  /** Optional CTAs / nav under the subtitle. */
  children?: ReactNode;
  /** Compact height for Member Zone section banners. */
  compact?: boolean;
  className?: string;
  contentClassName?: string;
};

/**
 * Full-bleed photo hero with dark overlay for readable type.
 * Marketing pages: default height. Member Zone: pass compact —
 * overlay fades into --bm-page so the banner blends into content below.
 */
export default function PageHero({
  imageSrc,
  imageAlt = '',
  label,
  title,
  subtitle,
  children,
  compact = false,
  className = '',
  contentClassName = '',
}: PageHeroProps) {
  return (
    <section
      className={`relative w-full overflow-hidden ${
        compact
          ? 'min-h-[140px] sm:min-h-[160px]'
          : 'min-h-[240px] sm:min-h-[300px] md:min-h-[360px]'
      } ${className}`}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      {compact ? (
        <>
          {/* Side read veil — page-tinted (not pure black) so it matches the canvas */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[var(--bm-page)]/90 via-[var(--bm-page)]/55 to-[var(--bm-page)]/20"
            aria-hidden
          />
          {/* Bottom fade into page — photo → content without a hard cut */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[var(--bm-page)] from-15% via-[var(--bm-page)]/50 to-transparent"
            aria-hidden
          />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/35"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"
            aria-hidden
          />
        </>
      )}

      <div
        className={`relative mx-auto flex h-full w-full max-w-[1100px] flex-col justify-end px-4 sm:px-6 lg:px-8 ${
          compact ? 'py-8 sm:py-10' : 'py-12 sm:py-14 md:py-16'
        } ${contentClassName}`}
      >
        {label ? (
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-400">
            {label}
          </p>
        ) : null}
        <h1
          className={`max-w-3xl font-semibold tracking-tight ${
            compact
              ? 'text-2xl text-[var(--bm-text)] sm:text-3xl dark:text-[var(--bm-text)]'
              : 'text-3xl text-white sm:text-4xl md:text-[3rem] md:leading-[1.12]'
          }`}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={`mt-3 max-w-2xl leading-relaxed ${
              compact
                ? 'text-sm text-[var(--bm-text-secondary)] sm:text-base'
                : 'text-base text-neutral-200 sm:text-lg'
            }`}
          >
            {subtitle}
          </p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
