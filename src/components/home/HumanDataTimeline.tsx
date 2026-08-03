import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { HUMAN_DATA_MODEL_GROUP_ID, serviceDetailPath } from '../../data/services';
import { useTheme } from '../../contexts/ThemeContext';

type EventKind =
  | 'lab'
  | 'diagnosis'
  | 'prescription'
  | 'symptom'
  | 'convergence'
  | 'followup';

export interface TimelineEvent {
  id: string;
  monthDay: string;
  year: string;
  /** Key under `homeExtra.timeline.types.*` */
  typeKey: string;
  /** Key under `homeExtra.timeline.sources.*` */
  sourceKey: string;
  kind: EventKind;
}

const EVENTS: TimelineEvent[] = [
  { id: 'e1', monthDay: 'APR 12', year: '2021', typeKey: 'lab', sourceKey: 'lab', kind: 'lab' },
  {
    id: 'e2',
    monthDay: 'MAR 3',
    year: '2022',
    typeKey: 'diagnosis',
    sourceKey: 'physician',
    kind: 'diagnosis',
  },
  {
    id: 'e3',
    monthDay: 'SEP 18',
    year: '2023',
    typeKey: 'medication',
    sourceKey: 'physician',
    kind: 'prescription',
  },
  {
    id: 'e4',
    monthDay: 'OCT 2',
    year: '2023',
    typeKey: 'observation',
    sourceKey: 'personal',
    kind: 'symptom',
  },
  {
    id: 'e5',
    monthDay: 'MAY 12',
    year: '2024',
    typeKey: 'connection',
    sourceKey: 'model',
    kind: 'convergence',
  },
  { id: 'e6', monthDay: 'JUN 8', year: '2024', typeKey: 'lab', sourceKey: 'lab', kind: 'lab' },
  {
    id: 'e7',
    monthDay: '',
    year: '—',
    typeKey: 'followup',
    sourceKey: 'carePlan',
    kind: 'followup',
  },
];

interface Props {
  onNavigate?: (page: string, data?: string) => void;
}

/**
 * Home Section 3 — health history as one continuing editorial archive.
 * Not a dashboard, chart, or generic dotted timeline.
 */
export default function HumanDataTimeline({ onNavigate }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const stillSrc = dark ? '/home/timeline-still.webp' : '/home/timeline-still-light.webp';

  const openTimeline = () => {
    onNavigate?.(
      'service-detail',
      serviceDetailPath(HUMAN_DATA_MODEL_GROUP_ID, 'health-timeline')
    );
  };

  return (
    <section
      aria-labelledby="timeline-heading"
      className="border-t border-gray-200/70 bg-page px-4 py-14 dark:border-gray-800/70 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 xl:gap-16">
        {/* Left — sticky editorial intro */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
            {t('home.section3')}
          </p>
          <h2
            id="timeline-heading"
            className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl md:text-[2.75rem] md:leading-tight"
          >
            {t('home.timelineTitle')}
          </h2>
          <p className="mt-4 max-w-xs text-base leading-relaxed text-gray-600 dark:text-neutral-400">
            {t('home.timelineSubtitle')}
          </p>
          {onNavigate && (
            <button
              type="button"
              onClick={openTimeline}
              className="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 transition-colors hover:text-orange-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50 dark:text-orange-400 dark:hover:text-orange-300"
            >
              {t('home.openTimeline')}
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </button>
          )}

          <div className="relative mt-8 hidden overflow-hidden rounded-sm bg-[var(--bm-surface)] lg:block">
            <img
              key={stillSrc}
              src={stillSrc}
              alt=""
              className="bm-people-photo h-52 w-full object-cover object-center opacity-95 transition-opacity duration-200 dark:opacity-85"
              loading="lazy"
              decoding="async"
            />
            <div className="bm-people-photo-wash absolute inset-0" aria-hidden />
          </div>
        </aside>

        {/* Right — vertical archive sequence */}
        <ol className="relative m-0 list-none space-y-0 p-0">
          <div
            className="pointer-events-none absolute bottom-4 left-[4.75rem] top-4 hidden w-px bg-gray-200 dark:bg-gray-700 sm:left-[5.5rem] md:block"
            aria-hidden
          />

          {EVENTS.map((event, index) => (
            <TimelineItem key={event.id} event={event} index={index} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function TimelineItem({ event, index }: { event: TimelineEvent; index: number }) {
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
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <li
      ref={ref}
      className="relative grid grid-cols-1 gap-3 py-5 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-6 md:py-6"
      style={{
        transitionProperty: 'opacity, transform',
        transitionDuration: '220ms',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: visible ? `${Math.min(index * 35, 90)}ms` : '0ms',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
      }}
    >
      <div className="sm:pt-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-neutral-500">
          {event.monthDay || t('homeExtra.timeline.today')}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
          {event.year}
        </p>
      </div>

      <div className="min-w-0">
        {event.kind === 'convergence' ? (
          <ConvergenceRecord event={event} />
        ) : (
          <EventRecord event={event} />
        )}
      </div>
    </li>
  );
}

function EventRecord({ event }: { event: TimelineEvent }) {
  const { t } = useTranslation();
  return (
    <article className="flex flex-col gap-4 border border-gray-200/90 bg-white p-4 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-orange-300/50 hover:shadow-md dark:border-gray-800 dark:bg-[var(--bm-surface)] dark:hover:border-orange-500/25 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500">
          {t(`homeExtra.timeline.types.${event.typeKey}`)}
        </p>
        <h3 className="mt-1.5 text-base font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
          {t(`homeExtra.timeline.events.${event.id}.title`)}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
          {t(`homeExtra.timeline.events.${event.id}.statement`)}
        </p>
        <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-gray-400 dark:text-neutral-500">
          {t('homeExtra.timeline.source')}
        </p>
        <p className="mt-0.5 text-sm text-gray-700 dark:text-neutral-300">
          {t(`homeExtra.timeline.sources.${event.sourceKey}`)}
        </p>
      </div>

      <div className="shrink-0 sm:w-[148px]">
        <DocumentFragment kind={event.kind} />
      </div>
    </article>
  );
}

function ConvergenceRecord({ event }: { event: TimelineEvent }) {
  const { t } = useTranslation();
  const converging = t(`homeExtra.timeline.events.${event.id}.converging`, {
    returnObjects: true,
  }) as unknown;
  const items = Array.isArray(converging)
    ? converging.filter((entry): entry is string => typeof entry === 'string')
    : [];

  return (
    <article className="border border-gray-200/90 bg-white p-4 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-orange-300/50 hover:shadow-md dark:border-gray-800 dark:bg-[var(--bm-surface)] dark:hover:border-orange-500/25 sm:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500">
        {t(`homeExtra.timeline.types.${event.typeKey}`)}
      </p>
      <h3 className="mt-1.5 text-base font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
        {t(`homeExtra.timeline.events.${event.id}.title`)}
      </h3>

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {items.map((item) => (
            <li
              key={item}
              className="border border-gray-200 bg-page px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:text-neutral-200"
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="hidden text-gray-300 dark:text-gray-600 md:block" aria-hidden>
          →
        </div>
        <div className="text-center text-xs text-gray-400 md:hidden" aria-hidden>
          ↓
        </div>

        <div className="min-w-0 flex-1 border border-orange-200/80 bg-orange-50/70 px-4 py-3 dark:border-orange-500/25 dark:bg-orange-950/25">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
            {t('homeExtra.timeline.possibleConnection')}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-800 dark:text-neutral-200">
            {t(`homeExtra.timeline.events.${event.id}.conclusion`)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-gray-400 dark:text-neutral-500">
        {t('homeExtra.timeline.source')}
      </p>
      <p className="mt-0.5 text-sm text-gray-700 dark:text-neutral-300">
        {t(`homeExtra.timeline.sources.${event.sourceKey}`)}
      </p>
    </article>
  );
}

function DocumentFragment({ kind }: { kind: EventKind }): ReactNode {
  const { t } = useTranslation();
  const paper =
    'h-[112px] w-full overflow-hidden border border-gray-200 bg-[var(--bm-page)] p-2.5 dark:border-gray-700 dark:bg-page';

  switch (kind) {
    case 'lab':
      return (
        <div className={paper} aria-hidden>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">
            {t('homeExtra.timeline.docs.labPanel')}
          </p>
          <div className="mt-2 space-y-1.5 font-mono text-[9px] text-gray-600 dark:text-neutral-400">
            <div className="flex justify-between gap-2 border-b border-gray-200/80 pb-1 dark:border-gray-700">
              <span>LDL</span>
              <span className="text-orange-700 dark:text-orange-400">148 H</span>
            </div>
            <div className="flex justify-between gap-2 border-b border-gray-200/80 pb-1 dark:border-gray-700">
              <span>HDL</span>
              <span>52</span>
            </div>
            <div className="flex justify-between gap-2">
              <span>Trig.</span>
              <span className="text-orange-700 dark:text-orange-400">176 H</span>
            </div>
          </div>
        </div>
      );
    case 'diagnosis':
      return (
        <div className={paper} aria-hidden>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">
            {t('homeExtra.timeline.docs.clinicalNote')}
          </p>
          <p className="mt-2 text-[10px] leading-relaxed text-gray-700 dark:text-neutral-300">
            {t('homeExtra.timeline.docs.clinicalBody')}
          </p>
          <p className="mt-3 font-serif text-[11px] italic text-gray-500">
            {t('homeExtra.timeline.docs.clinicalSign')}
          </p>
        </div>
      );
    case 'prescription':
      return (
        <div className={`${paper} relative`} aria-hidden>
          <p className="text-[10px] font-bold tracking-wide text-gray-800 dark:text-neutral-200">
            Rx
          </p>
          <p className="mt-2 text-[10px] text-gray-700 dark:text-neutral-300">
            {t('homeExtra.timeline.docs.rxName')}
          </p>
          <p className="text-[9px] text-gray-500">{t('homeExtra.timeline.docs.rxDose')}</p>
          <p className="mt-3 text-[9px] text-gray-400">{t('homeExtra.timeline.docs.rxMeta')}</p>
        </div>
      );
    case 'symptom':
      return (
        <div
          className={`${paper} bg-[repeating-linear-gradient(transparent,transparent_13px,#e5e2db_14px)] dark:bg-[repeating-linear-gradient(transparent,transparent_13px,#373d47_14px)]`}
          aria-hidden
        >
          <p className="whitespace-pre-line pt-1 font-serif text-[11px] leading-relaxed text-gray-700 dark:text-neutral-300">
            {t('homeExtra.timeline.docs.journal')}
          </p>
        </div>
      );
    case 'followup':
      return (
        <div className={paper} aria-hidden>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">
            {t('homeExtra.timeline.docs.questions')}
          </p>
          <ul className="mt-2 space-y-1.5 text-[10px] text-gray-700 dark:text-neutral-300">
            {(['question1', 'question2', 'question3'] as const).map((key) => (
              <li key={key} className="flex gap-2">
                <span className="mt-0.5 h-2.5 w-2.5 shrink-0 border border-gray-400" />
                {t(`homeExtra.timeline.docs.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      );
    default:
      return null;
  }
}
