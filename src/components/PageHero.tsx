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
 * still photo-forward (dark veil + light type) so banners read as real heroes.
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
          ? 'min-h-[180px] sm:min-h-[210px]'
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
          {/* Keep the photo visible — dark read veil, not page-color wash */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/25"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15"
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
          compact ? 'py-9 sm:py-11' : 'py-12 sm:py-14 md:py-16'
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
              ? 'text-2xl text-white sm:text-3xl'
              : 'text-3xl text-white sm:text-4xl md:text-[3rem] md:leading-[1.12]'
          }`}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={`mt-3 max-w-2xl leading-relaxed ${
              compact
                ? 'text-sm text-neutral-200 sm:text-base'
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
