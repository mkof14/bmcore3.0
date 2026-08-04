interface CTASectionProps {
  variant?: 'primary' | 'secondary' | 'gradient' | 'minimal';
  title?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  showStats?: boolean;
}

export default function CTASection({
  title,
  description,
  primaryButtonText = 'Get started',
  secondaryButtonText = 'Learn more',
  onPrimaryClick,
  onSecondaryClick,
  showStats = false,
}: CTASectionProps) {
  return (
    <section className="border-t border-[var(--bm-border)] py-14 lg:py-16">
      <div className="border border-[var(--bm-border)] bg-[var(--bm-surface)] px-6 py-10 text-center sm:px-10">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl">
          {title || 'Ready to see clearer health context?'}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
          {description ||
            'Start with BioMath Core and grow your Human Data Model as your questions deepen.'}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
          <button type="button" onClick={onPrimaryClick} className="bm-cta-primary w-full sm:w-auto">
            {primaryButtonText}
          </button>
          <button type="button" onClick={onSecondaryClick} className="bm-link">
            {secondaryButtonText}
          </button>
        </div>

        {showStats && (
          <p className="mt-8 text-xs tracking-wide text-gray-500 dark:text-neutral-500">
            HIPAA-aligned · Encrypted · Cancel anytime
          </p>
        )}
      </div>
    </section>
  );
}

export function CTABanner({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  return (
    <div className="border-y border-[var(--bm-border)] bg-[var(--bm-surface)] py-3">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-gray-700 dark:text-neutral-300">
          5-day trial on paid plans — cancel anytime during the trial.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('pricing')}
          className="bm-link font-semibold text-orange-700 dark:text-orange-400"
        >
          View pricing →
        </button>
      </div>
    </div>
  );
}

export function CTAFloating({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  return (
    <div className="fixed bottom-8 right-8 z-40 hidden max-w-xs border border-[var(--bm-border)] bg-[var(--bm-surface)] p-5 shadow-lg lg:block">
      <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">Start with clarity</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
        Create an account and begin building your Human Data Model.
      </p>
      <button
        type="button"
        onClick={() => onNavigate('signup')}
        className="bm-cta-primary mt-4 w-full"
      >
        Get started
      </button>
    </div>
  );
}

export function CTAInline({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  return (
    <div className="border-l-2 border-orange-500/70 bg-[var(--bm-surface)] px-5 py-5 dark:border-orange-400/55">
      <h3 className="text-base font-semibold text-gray-900 dark:text-neutral-100">Ready to begin?</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
        Create an account and start working with your health data today.
      </p>
      <button
        type="button"
        onClick={() => onNavigate('signup')}
        className="bm-link mt-3 font-semibold text-orange-700 dark:text-orange-400"
      >
        Sign up →
      </button>
    </div>
  );
}
