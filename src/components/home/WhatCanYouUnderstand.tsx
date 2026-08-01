import { useEffect, useState } from 'react';
import {
  Brain,
  FlaskConical,
  Pill,
  Activity,
  Dna,
  FileText,
  Apple,
  TrendingUp,
  Droplets,
  ScanSearch,
  Scale,
  HeartHandshake,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

interface SourceCard {
  key: string;
  place: string;
  Icon: LucideIcon;
}

interface InsightNote {
  key: string;
  Icon: LucideIcon;
}

const SOURCES: SourceCard[] = [
  { key: 'mri', place: 'left-0 top-[6%]', Icon: Brain },
  { key: 'blood', place: 'left-0 top-[26%]', Icon: FlaskConical },
  { key: 'medications', place: 'left-0 top-[46%]', Icon: Pill },
  { key: 'pressure', place: 'left-0 top-[66%]', Icon: Activity },
  { key: 'genetic', place: 'right-0 top-[10%]', Icon: Dna },
  { key: 'notes', place: 'right-0 top-[34%]', Icon: FileText },
  { key: 'lifestyle', place: 'right-0 top-[58%]', Icon: Apple },
];

const INSIGHTS: InsightNote[] = [
  { key: 'pressure', Icon: TrendingUp },
  { key: 'vitaminD', Icon: Droplets },
  { key: 'symptoms', Icon: ScanSearch },
  { key: 'agreement', Icon: Scale },
  { key: 'overall', Icon: HeartHandshake },
];

/**
 * Home Section 2 — what the Human Data Model helps a person understand.
 */
export default function WhatCanYouUnderstand() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setVisible(true);
      return;
    }
    const id = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const enter = (delayMs = 0) =>
    ({
      transitionProperty: 'opacity, transform',
      transitionDuration: '220ms',
      transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      transitionDelay: visible ? `${delayMs}ms` : '0ms',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
    }) as const;

  const portraitSrc = dark
    ? '/home/understand-portrait-dark.webp'
    : '/home/understand-portrait-light.webp';

  return (
    <section
      aria-labelledby="understand-heading"
      className="border-t border-gray-200/70 bg-page px-4 py-14 dark:border-gray-800/70 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="mx-auto mb-10 max-w-2xl text-center lg:mb-12" style={enter(0)}>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
            {t('home.section2')}
          </p>
          <h2
            id="understand-heading"
            className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl md:text-5xl"
          >
            {t('home.whatTitle')}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-base">
            {t('home.whatSubtitle')}
          </p>
        </header>

        <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-16">
          <div className="relative w-full" style={enter(40)}>
            <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none lg:px-[118px] xl:px-[136px]">
              <div className="relative mx-auto aspect-[3/4] w-full overflow-hidden rounded-sm bg-[var(--bm-surface)]">
                <img
                  key={portraitSrc}
                  src={portraitSrc}
                  alt={t('homeExtra.understand.portraitAlt')}
                  className="h-full w-full object-cover object-[center_18%] transition-opacity duration-200"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${
                    dark
                      ? 'from-black/35 via-transparent to-transparent'
                      : 'from-black/25 via-transparent to-black/5'
                  }`}
                />
                <p className="absolute bottom-5 left-0 right-0 text-center text-[11px] font-medium uppercase tracking-[0.28em] text-white/95">
                  {t('homeExtra.understand.caption')}
                </p>
              </div>

              <div className="pointer-events-none absolute inset-0 hidden lg:block">
                {SOURCES.map((source, i) => (
                  <div
                    key={source.key}
                    className={`absolute w-[128px] xl:w-[148px] ${source.place}`}
                    style={enter(60 + i * 30)}
                  >
                    <SourceNote
                      title={t(`homeExtra.sources.${source.key}.title`)}
                      detail={t(`homeExtra.sources.${source.key}.detail`)}
                      Icon={source.Icon}
                    />
                  </div>
                ))}
              </div>
            </div>

            <ul className="mx-auto mt-6 grid max-w-[520px] grid-cols-2 gap-2 sm:grid-cols-3 lg:hidden">
              {SOURCES.map((source, i) => (
                <li key={source.key} style={enter(60 + i * 25)}>
                  <SourceNote
                    title={t(`homeExtra.sources.${source.key}.title`)}
                    detail={t(`homeExtra.sources.${source.key}.detail`)}
                    Icon={source.Icon}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-center lg:pt-2">
            <p
              className="mb-6 text-sm font-semibold text-gray-900 dark:text-neutral-200"
              style={enter(80)}
            >
              {t('homeExtra.insights.heading')}
            </p>
            <ul className="space-y-3">
              {INSIGHTS.map((insight, i) => (
                <li key={insight.key} style={enter(100 + i * 35)}>
                  <article className="group rounded-sm border border-gray-200 bg-white px-5 py-5 transition-colors duration-200 hover:border-orange-300/70 dark:border-gray-800 dark:bg-[var(--bm-surface)] dark:hover:border-orange-500/35 sm:px-6 sm:py-6">
                    <div className="flex gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-50 text-orange-600 transition-transform duration-200 group-hover:scale-105 dark:bg-orange-500/15 dark:text-orange-400">
                        <insight.Icon className="h-4 w-4" strokeWidth={1.85} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium leading-snug tracking-tight text-gray-900 dark:text-neutral-100 sm:text-base">
                          {t(`homeExtra.insights.${insight.key}.text`)}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-neutral-400">
                          {t(`homeExtra.insights.${insight.key}.note`)}
                        </p>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p
          className="mt-12 text-center text-base tracking-tight text-gray-600 dark:text-neutral-400 sm:mt-14 sm:text-lg"
          style={enter(240)}
        >
          {t('homeExtra.understand.closingPrefix')}{' '}
          <span className="font-medium text-gray-900 dark:text-neutral-100">
            {t('homeExtra.understand.closingEmphasis')}
          </span>
          .
        </p>
      </div>
    </section>
  );
}

function SourceNote({
  title,
  detail,
  Icon,
}: {
  title: string;
  detail: string;
  Icon: LucideIcon;
}) {
  return (
    <div className="rounded-sm border border-gray-200/90 bg-white px-3 py-2.5 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-orange-300/60 hover:shadow-md dark:border-gray-700 dark:bg-[var(--bm-surface)] dark:hover:border-orange-500/30">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded text-orange-600 transition-colors duration-200 dark:text-orange-400">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.85} />
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold leading-tight text-gray-900 dark:text-neutral-100">
            {title}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-gray-500 dark:text-neutral-400">
            {detail}
          </p>
        </div>
      </div>
    </div>
  );
}
