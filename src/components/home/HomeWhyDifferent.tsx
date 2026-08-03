import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tList } from '../../i18n/tList';

type Outcome = { title: string; body: string };

/**
 * Home — why the Human Data Model differs from biomarker dashboards.
 * Custom SVG comparison + concrete next actions; no stock art or card clutter.
 */
export default function HomeWhyDifferent() {
  const { t } = useTranslation();
  const outcomes = tList<Outcome>(t, 'home.different.outcomes.items');
  const metrics = tList<string>(t, 'home.different.viz.metrics');
  const links = tList<string>(t, 'home.different.viz.links');
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
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      aria-labelledby="home-different-heading"
      className="border-t border-[var(--bm-border)] bg-page px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <header
          className="mb-10 max-w-2xl lg:mb-12"
          style={{
            transitionProperty: 'opacity, transform',
            transitionDuration: '240ms',
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
            {t('home.different.label')}
          </p>
          <h2
            id="home-different-heading"
            className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl"
          >
            {t('home.different.title')}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
            {t('home.different.body')}
          </p>
        </header>

        <div
          className="relative overflow-hidden border border-[var(--bm-border)] bg-[var(--bm-surface)] px-4 py-7 sm:px-8 sm:py-9"
          style={{
            transitionProperty: 'opacity, transform',
            transitionDuration: '280ms',
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            transitionDelay: visible ? '40ms' : '0ms',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(14px)',
          }}
        >
          <ComparisonViz metrics={metrics} links={links} active={visible} />
          <p className="mt-5 text-center text-xs leading-relaxed text-gray-500 dark:text-neutral-500">
            {t('home.different.viz.caption')}
          </p>
        </div>

        <div
          className="mt-10 grid gap-8 border-t border-[var(--bm-border)] pt-8 sm:grid-cols-3 sm:gap-6"
          style={{
            transitionProperty: 'opacity, transform',
            transitionDuration: '260ms',
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            transitionDelay: visible ? '100ms' : '0ms',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          <p className="sm:col-span-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-600 dark:text-orange-400">
            {t('home.different.outcomes.label')}
          </p>
          {outcomes.map((item, i) => (
            <div key={item.title} className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-1.5 text-base font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Side-by-side: disconnected metric tiles → unified HDM digital twin. */
function ComparisonViz({
  metrics,
  links,
  active,
}: {
  metrics: string[];
  links: string[];
  active: boolean;
}) {
  const { t } = useTranslation();
  const tiles = [
    { x: 28, y: 36, w: 72, h: 40 },
    { x: 112, y: 28, w: 68, h: 36 },
    { x: 36, y: 96, w: 64, h: 38 },
    { x: 118, y: 90, w: 70, h: 42 },
  ];

  return (
    <svg
      viewBox="0 0 760 220"
      className="mx-auto h-auto w-full max-w-3xl"
      role="img"
      aria-labelledby="home-different-viz-title"
    >
      <title id="home-different-viz-title">{t('home.different.viz.title')}</title>

      {/* Left: scattered dashboard tiles */}
      <text
        x="110"
        y="16"
        textAnchor="middle"
        className="fill-gray-500 text-[11px] font-semibold dark:fill-neutral-400"
      >
        {t('home.different.viz.themLabel')}
      </text>

      {tiles.map((tile, i) => (
        <g
          key={metrics[i] ?? i}
          style={{
            opacity: active ? 1 : 0.35,
            transition: 'opacity 320ms cubic-bezier(0.22, 1, 0.36, 1)',
            transitionDelay: active ? `${60 + i * 40}ms` : '0ms',
          }}
        >
          <rect
            x={tile.x}
            y={tile.y}
            width={tile.w}
            height={tile.h}
            rx="2"
            className="fill-gray-100 stroke-gray-300 dark:fill-white/[0.04] dark:stroke-gray-600"
            strokeWidth="1"
          />
          <text
            x={tile.x + 10}
            y={tile.y + 16}
            className="fill-gray-500 text-[9px] dark:fill-neutral-500"
          >
            {metrics[i] ?? ''}
          </text>
          <line
            x1={tile.x + 10}
            y1={tile.y + 26}
            x2={tile.x + tile.w - 14}
            y2={tile.y + 26}
            className="stroke-gray-300 dark:stroke-gray-600"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1={tile.x + 10}
            y1={tile.y + 33}
            x2={tile.x + tile.w * 0.55}
            y2={tile.y + 33}
            className="stroke-gray-200 dark:stroke-gray-700"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* Broken / missing links between tiles */}
      <path
        d="M100 76 L112 76"
        className="stroke-gray-300 dark:stroke-gray-600"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      <path
        d="M72 88 L72 96"
        className="stroke-gray-300 dark:stroke-gray-600"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      <path
        d="M148 64 L148 90"
        className="stroke-gray-300 dark:stroke-gray-600"
        strokeWidth="1"
        strokeDasharray="2 3"
      />

      {/* Transition arrow */}
      <g style={{ opacity: active ? 1 : 0.25, transition: 'opacity 400ms ease' }}>
        <line
          x1="220"
          y1="110"
          x2="292"
          y2="110"
          className="stroke-orange-500/50 dark:stroke-orange-400/40"
          strokeWidth="1.5"
        />
        <polygon
          points="292,104 306,110 292,116"
          className="fill-orange-500/70 dark:fill-orange-400/60"
        />
      </g>

      {/* Right: unified HDM twin */}
      <text
        x="500"
        y="16"
        textAnchor="middle"
        className="fill-gray-700 text-[11px] font-semibold dark:fill-neutral-300"
      >
        {t('home.different.viz.usLabel')}
      </text>

      {/* Input nodes → core */}
      {[
        { x: 360, y: 48 },
        { x: 360, y: 92 },
        { x: 360, y: 136 },
        { x: 360, y: 180 },
      ].map((node, i) => (
        <g key={links[i] ?? i}>
          <line
            x1={node.x + 6}
            y1={node.y}
            x2="448"
            y2="112"
            className="stroke-orange-500/35 dark:stroke-orange-400/30"
            strokeWidth="1.25"
            style={{
              opacity: active ? 1 : 0.2,
              transition: 'opacity 420ms ease',
              transitionDelay: active ? `${180 + i * 35}ms` : '0ms',
            }}
          />
          <circle
            cx={node.x}
            cy={node.y}
            r="4"
            className="fill-orange-500 dark:fill-orange-400"
          />
          <text
            x={node.x + 12}
            y={node.y + 3.5}
            className="fill-gray-600 text-[9px] dark:fill-neutral-400"
          >
            {links[i] ?? ''}
          </text>
        </g>
      ))}

      {/* HDM core */}
      <g style={{ opacity: active ? 1 : 0.35, transition: 'opacity 380ms ease' }}>
        <circle
          cx="500"
          cy="112"
          r="54"
          className="fill-orange-500/[0.07] stroke-orange-500/50 dark:fill-orange-400/10 dark:stroke-orange-400/45"
          strokeWidth="1.5"
        />
        <circle
          cx="500"
          cy="112"
          r="34"
          className={`fill-transparent stroke-orange-500/70 dark:stroke-orange-400/60 ${
            active ? 'hdm-why-ring' : ''
          }`}
          strokeWidth="1.25"
          strokeDasharray="3 4"
        />
        <text
          x="500"
          y="108"
          textAnchor="middle"
          className="fill-gray-900 text-[12px] font-semibold dark:fill-neutral-100"
        >
          {t('home.different.viz.core')}
        </text>
        <text
          x="500"
          y="124"
          textAnchor="middle"
          className="fill-gray-500 text-[9px] dark:fill-neutral-400"
        >
          {t('home.different.viz.coreSub')}
        </text>
      </g>

      {/* Outcomes leaving the twin */}
      <g style={{ opacity: active ? 1 : 0.25, transition: 'opacity 400ms ease 280ms' }}>
        <line
          x1="554"
          y1="98"
          x2="640"
          y2="72"
          className="stroke-orange-500/45 dark:stroke-orange-400/35"
          strokeWidth="1.25"
        />
        <line
          x1="554"
          y1="112"
          x2="640"
          y2="112"
          className="stroke-orange-500/45 dark:stroke-orange-400/35"
          strokeWidth="1.25"
        />
        <line
          x1="554"
          y1="126"
          x2="640"
          y2="152"
          className="stroke-orange-500/45 dark:stroke-orange-400/35"
          strokeWidth="1.25"
        />
        {[72, 112, 152].map((y) => (
          <circle
            key={y}
            cx="646"
            cy={y}
            r="4"
            className="fill-orange-600 dark:fill-orange-400"
          />
        ))}
        <text
          x="658"
          y="75"
          className="fill-gray-600 text-[9px] dark:fill-neutral-400"
        >
          {t('home.different.viz.outAsk')}
        </text>
        <text
          x="658"
          y="115"
          className="fill-gray-600 text-[9px] dark:fill-neutral-400"
        >
          {t('home.different.viz.outMap')}
        </text>
        <text
          x="658"
          y="155"
          className="fill-gray-600 text-[9px] dark:fill-neutral-400"
        >
          {t('home.different.viz.outTime')}
        </text>
      </g>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .hdm-why-ring {
            animation: hdm-why-dash 12s linear infinite;
          }
        }
        @keyframes hdm-why-dash {
          to { stroke-dashoffset: -48; }
        }
      `}</style>
    </svg>
  );
}
