import BackButton from '../components/BackButton';

interface SummaryTextProps {
  onNavigate: (page: string) => void;
}

export default function SummaryText({ onNavigate }: SummaryTextProps) {
  return (
    <div className="min-h-screen bg-page text-gray-900 transition-colors dark:text-neutral-100">
      <div className="pt-20 pb-16">
        <div className="mx-auto w-full max-w-[720px] px-4 sm:px-6 lg:px-8">
          <BackButton onNavigate={onNavigate} />

          <header className="border-b border-[var(--bm-border)] pb-10 pt-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
              Summary
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              <span className="text-orange-600 dark:text-orange-400">BioMath</span> Core
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              Health intelligence built on meaning, context, and continuous understanding.
            </p>
          </header>

          <article className="space-y-12 py-12 text-[15px] leading-relaxed text-gray-700 dark:text-neutral-300 sm:text-base">
            <section>
              <p>
                BioMath Core helps people gain mastery over their health through understanding,
                interpretation, and guided decisions. Unlike wellness apps, clinical portals, or
                wearable dashboards, it is not built around metrics or treatment — it is built around{' '}
                <span className="font-medium text-gray-900 dark:text-neutral-100">meaning</span>.
              </p>
              <p className="mt-4">
                It does not track more — it explains better. You do not only receive data; you learn
                how to read your own biology with clarity that continues over time.
              </p>
            </section>

            <section className="border-t border-[var(--bm-border)] pt-10">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                The Health Guide
              </h2>
              <p className="mt-4">
                Instead of searching menus for insight, the Health Guide leads contextually —
                presenting the right service, interpretation, or next step at the right time.
              </p>
              <p className="mt-4">
                You move from passively receiving numbers to deciding with context. The first screen
                shows what matters now and what to do next.
              </p>
            </section>

            <section className="border-t border-[var(--bm-border)] pt-10">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                Three-phase service flow
              </h2>
              <ol className="mt-6 space-y-6">
                <li>
                  <p className="text-[11px] font-semibold tracking-[0.22em] text-orange-600 dark:text-orange-400">
                    01 · Readiness
                  </p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                    Guided preparation ensures key context is present and you understand what
                    influences accuracy.
                  </p>
                </li>
                <li>
                  <p className="text-[11px] font-semibold tracking-[0.22em] text-orange-600 dark:text-orange-400">
                    02 · Dual intelligence
                  </p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                    Two independent reasoning engines produce assessments, then compared for alignment
                    or divergence.
                  </p>
                </li>
                <li>
                  <p className="text-[11px] font-semibold tracking-[0.22em] text-orange-600 dark:text-orange-400">
                    03 · Interpretation
                  </p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                    The advisor explains meaning, then points to next actions, learning, and longer-term
                    tracking.
                  </p>
                </li>
              </ol>
            </section>

            <section className="border-t border-[var(--bm-border)] pt-10">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                Depth-based access
              </h2>
              <p className="mt-4">
                A base subscription with deeper add-ons — progress through experience, not locked
                features. Tiers grow capability. Add-ons extend interpretive depth when they are most
                relevant.
              </p>
            </section>

            <section className="border-t border-[var(--bm-border)] pt-10">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                Data philosophy
              </h2>
              <p className="mt-4">
                Collection is minimal and meaning-driven. We ask for relevance, not completeness.
                Questions appear when they change interpretation.
              </p>
              <p className="mt-4">
                Personalization works at the routing level: what you see and learn shifts with ongoing
                health signals. The longer you stay, the clearer the picture becomes.
              </p>
            </section>

            <section className="border-t border-[var(--bm-border)] pt-10">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                Where it sits
              </h2>
              <p className="mt-4">
                BioMath Core does not compete with telemedicine, wellness apps, or wearables — it
                completes them. It is the reasoning layer modern health tools have been missing: the
                bridge between health data and health understanding.
              </p>
              <p className="mt-4">
                You are not buying reports. You are building literacy — the ability to navigate your
                wellbeing with agency and foresight.
              </p>
            </section>

            <section className="border-t border-[var(--bm-border)] pt-10">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                Not another health app
              </h2>
              <p className="mt-4">
                BioMath Core is personal health intelligence that stays with you across time, adapts
                as you change, and moves health from something reactive to something you can govern
                with clarity.
              </p>
              <p className="mt-4">
                Understanding is the highest form of health empowerment. BioMath Core exists to
                deliver that understanding — continuously, carefully, and personally.
              </p>
            </section>
          </article>

          <div className="border-t border-[var(--bm-border)] pt-8">
            <button
              type="button"
              onClick={() => onNavigate('biomath-core-summary')}
              className="text-sm font-semibold text-orange-700 transition-colors hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
            >
              ← Back to overview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
