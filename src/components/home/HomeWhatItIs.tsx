import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tList } from '../../i18n/tList';

type Point = { title: string; body: string };

/**
 * Home — what the Human Data Model is.
 * Typography + minimal data-viz only; no stock photography.
 */
export default function HomeWhatItIs() {
  const { t } = useTranslation();
  const points = tList<Point>(t, 'home.what.points');
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      aria-labelledby="home-what-heading"
      className="border-t border-[var(--bm-border)] bg-page px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <div
          style={{
            transitionProperty: 'opacity, transform',
            transitionDuration: '240ms',
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
            {t('home.what.label')}
          </p>
          <h2
            id="home-what-heading"
            className="max-w-xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl"
          >
            {t('home.what.title')}
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-600 dark:text-neutral-400">
            {t('home.what.body')}
          </p>

          <ul className="mt-8 space-y-5">
            {points.map((point, i) => (
              <li key={point.title} className="border-t border-[var(--bm-border)] pt-5">
                <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-1.5 text-lg font-semibold text-gray-900 dark:text-neutral-100">
                  {point.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                  {point.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="relative"
          style={{
            transitionProperty: 'opacity, transform',
            transitionDuration: '280ms',
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            transitionDelay: visible ? '60ms' : '0ms',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(14px)',
          }}
          aria-hidden
        >
          <ModelSignalViz />
        </div>
      </div>
    </section>
  );
}

/** Abstract signal → model diagram (brand data-viz, not lifestyle art). */
function ModelSignalViz() {
  const { t } = useTranslation();
  const signals = tList<string>(t, 'home.what.signals');

  return (
    <div className="relative overflow-hidden border border-[var(--bm-border)] bg-[var(--bm-surface)] px-5 py-8 sm:px-8 sm:py-10">
      <svg viewBox="0 0 360 320" className="mx-auto h-auto w-full max-w-md" role="img">
        <title>{t('home.what.vizTitle')}</title>
        {/* Input rails */}
        {[0, 1, 2, 3].map((i) => {
          const y = 48 + i * 52;
          return (
            <g key={i}>
              <line
                x1="16"
                y1={y}
                x2="150"
                y2={160}
                stroke="currentColor"
                className="text-orange-500/35 dark:text-orange-400/30"
                strokeWidth="1.25"
              />
              <circle
                cx="16"
                cy={y}
                r="4"
                className="fill-orange-500 dark:fill-orange-400"
              />
              <text
                x="28"
                y={y + 4}
                className="fill-gray-600 text-[10px] dark:fill-neutral-400"
              >
                {signals[i] ?? ''}
              </text>
            </g>
          );
        })}

        {/* Model core */}
        <circle
          cx="230"
          cy="160"
          r="72"
          className="fill-orange-500/[0.07] stroke-orange-500/50 dark:fill-orange-400/10 dark:stroke-orange-400/45"
          strokeWidth="1.5"
        />
        <circle
          cx="230"
          cy="160"
          r="44"
          className="fill-transparent stroke-orange-500/70 dark:stroke-orange-400/60"
          strokeWidth="1.25"
          strokeDasharray="3 4"
        />
        <text
          x="230"
          y="156"
          textAnchor="middle"
          className="fill-gray-900 text-[11px] font-semibold dark:fill-neutral-100"
        >
          {t('home.what.vizCore')}
        </text>
        <text
          x="230"
          y="174"
          textAnchor="middle"
          className="fill-gray-500 text-[9px] dark:fill-neutral-400"
        >
          {t('home.what.vizCoreSub')}
        </text>

        {/* Output */}
        <line
          x1="302"
          y1="160"
          x2="344"
          y2="160"
          stroke="currentColor"
          className="text-orange-500/50 dark:text-orange-400/40"
          strokeWidth="1.25"
        />
        <circle cx="348" cy="160" r="4" className="fill-orange-600 dark:fill-orange-400" />
      </svg>
      <p className="mt-4 text-center text-xs leading-relaxed text-gray-500 dark:text-neutral-500">
        {t('home.what.vizCaption')}
      </p>
    </div>
  );
}
