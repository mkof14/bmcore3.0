import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

interface LifeRecord {
  id: string;
  year: string;
}

const RECORDS: LifeRecord[] = [
  { id: 'r1', year: '2019' },
  { id: 'r2', year: '2021' },
  { id: 'r3', year: '2023' },
  { id: 'r4', year: '2024' },
  { id: 'r5', year: '2025' },
];

/**
 * Home Section 4 — life across decades; the Human Data Model keeps the thread.
 */
export default function EverythingChanges() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  // Cache-bust when portrait assets are swapped (avoid stale mid/later mixups)
  const v = 'slate1';
  const young = dark ? `/home/life-young.webp?v=${v}` : `/home/life-young-light.webp?v=${v}`;
  const mid = dark ? `/home/life-mid.webp?v=${v}` : `/home/life-mid-light.webp?v=${v}`;
  const later = dark ? `/home/life-later.webp?v=${v}` : `/home/life-later-light.webp?v=${v}`;

  return (
    <section
      aria-labelledby="everything-changes-heading"
      className="border-t border-gray-200/70 bg-page px-4 py-14 dark:border-gray-800/70 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="mx-auto mb-10 max-w-3xl text-center lg:mb-12">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
            {t('home.section4')}
          </p>
          <h2
            id="everything-changes-heading"
            className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl md:text-[2.75rem] md:leading-[1.15]"
          >
            {t('home.changesTitle1')}
            <br />
            {t('home.changesTitle2')}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-base">
            {t('home.changesSubtitle')}
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.9fr)_minmax(0,1fr)] lg:items-stretch lg:gap-8 xl:gap-10">
          <figure className="order-1 m-0 flex flex-col lg:order-none">
            <div className="relative min-h-[380px] flex-1 overflow-hidden bg-[var(--bm-surface)] sm:min-h-[440px] lg:min-h-0">
              <img
                key={young}
                src={young}
                alt={t('homeExtra.changes.youngAlt')}
                className="bm-people-photo absolute inset-0 h-full w-full object-cover object-[center_20%] transition-opacity duration-200"
                loading="lazy"
                decoding="async"
              />
              <div className="bm-people-photo-wash absolute inset-0" aria-hidden />
            </div>
            <figcaption className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-400">
                {t('homeExtra.changes.youngAge')}
              </p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-neutral-300">
                {t('homeExtra.changes.youngBody')}
              </p>
            </figcaption>
          </figure>

          <div className="order-2 lg:order-none lg:py-1">
            <ol className="relative m-0 list-none space-y-0 p-0">
              <div
                className="pointer-events-none absolute bottom-3 left-[2.65rem] top-3 w-px bg-gray-200 dark:bg-gray-700"
                aria-hidden
              />
              {RECORDS.map((record, index) => (
                <LifeNote key={record.id} record={record} index={index} />
              ))}
            </ol>
          </div>

          <div className="order-3 flex flex-col gap-8 lg:order-none lg:gap-7">
            <figure className="m-0">
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bm-surface)] sm:aspect-[5/4]">
                <img
                  key={mid}
                  src={mid}
                  alt={t('homeExtra.changes.midAlt')}
                  className="bm-people-photo absolute inset-0 h-full w-full object-cover object-[center_25%] transition-opacity duration-200"
                  loading="lazy"
                  decoding="async"
                />
                <div className="bm-people-photo-wash absolute inset-0" aria-hidden />
              </div>
              <figcaption className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-400">
                  {t('homeExtra.changes.midAge')}
                </p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-neutral-300">
                  {t('homeExtra.changes.midBody')}
                </p>
              </figcaption>
            </figure>

            <figure className="m-0">
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bm-surface)] sm:aspect-[5/4]">
                <img
                  key={later}
                  src={later}
                  alt={t('homeExtra.changes.laterAlt')}
                  className="bm-people-photo absolute inset-0 h-full w-full object-cover object-[center_20%] transition-opacity duration-200"
                  loading="lazy"
                  decoding="async"
                />
                <div className="bm-people-photo-wash absolute inset-0" aria-hidden />
              </div>
              <figcaption className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-400">
                  {t('homeExtra.changes.laterAge')}
                </p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-neutral-300">
                  {t('homeExtra.changes.laterBody')}
                </p>
              </figcaption>
            </figure>
          </div>
        </div>

        {/* Closing line — quiet, site voice, not a slogan card */}
        <div className="mx-auto mt-14 max-w-lg text-center sm:mt-16">
          <div
            className="mx-auto mb-5 h-px w-8 bg-orange-500/55 dark:bg-orange-400/45"
            aria-hidden
          />
          <p className="text-[15px] leading-relaxed tracking-tight text-gray-500 dark:text-neutral-400 sm:text-base">
            {t('homeExtra.changes.closingPrefix')}
            <br />
            <span className="text-lg font-medium text-gray-900 dark:text-neutral-100 sm:text-xl">
              {t('homeExtra.changes.closingEmphasis')}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

function LifeNote({ record, index }: { record: LifeRecord; index: number }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLLIElement>(null);
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
      { threshold: 0.2, rootMargin: '0px 0px -6% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <li
      ref={ref}
      className="relative grid grid-cols-[3.25rem_minmax(0,1fr)] gap-3 py-2 sm:gap-4"
      style={{
        transitionProperty: 'opacity, transform',
        transitionDuration: '200ms',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: visible ? `${Math.min(index * 35, 80)}ms` : '0ms',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
      }}
    >
      <p className="pt-3 text-right text-xs font-semibold tabular-nums tracking-wide text-orange-700/80 dark:text-orange-400/90">
        {record.year}
      </p>

      <article className="border border-gray-200/90 bg-white px-3.5 py-3 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-orange-300/50 hover:shadow-md dark:border-gray-800 dark:bg-[var(--bm-surface)] dark:hover:border-orange-500/25 sm:px-4 sm:py-3.5">
        <p className="text-sm font-medium leading-snug text-gray-900 dark:text-neutral-100">
          {t(`homeExtra.changes.records.${record.id}.event`)}
        </p>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-neutral-500">
          {t('homeExtra.changes.source')}
        </p>
        <p className="mt-0.5 text-xs text-gray-600 dark:text-neutral-400">
          {t(`homeExtra.changes.records.${record.id}.source`)}
        </p>
      </article>
    </li>
  );
}
