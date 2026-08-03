import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tList } from '../../i18n/tList';

/**
 * Home — biomathematics vs biomarker dashboards.
 * Tight contrast copy; no stock photography or card clutter.
 */
export default function HomeWhyDifferent() {
  const { t } = useTranslation();
  const them = tList<string>(t, 'home.different.them.points');
  const us = tList<string>(t, 'home.different.us.points');
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

        <div className="grid gap-10 md:grid-cols-2 md:gap-12">
          <ContrastColumn
            label={t('home.different.them.label')}
            points={them}
            accent="muted"
            visible={visible}
            delay={40}
          />
          <ContrastColumn
            label={t('home.different.us.label')}
            points={us}
            accent="brand"
            visible={visible}
            delay={90}
          />
        </div>
      </div>
    </section>
  );
}

function ContrastColumn({
  label,
  points,
  accent,
  visible,
  delay,
}: {
  label: string;
  points: string[];
  accent: 'muted' | 'brand';
  visible: boolean;
  delay: number;
}) {
  return (
    <div
      style={{
        transitionProperty: 'opacity, transform',
        transitionDuration: '240ms',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: visible ? `${delay}ms` : '0ms',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
      }}
    >
      <span
        aria-hidden
        className={`mb-4 block h-px w-8 ${
          accent === 'brand'
            ? 'bg-orange-500/70 dark:bg-orange-400/55'
            : 'bg-gray-300 dark:bg-gray-600'
        }`}
      />
      <h3
        className={`text-lg font-semibold tracking-tight ${
          accent === 'brand'
            ? 'text-gray-900 dark:text-neutral-100'
            : 'text-gray-700 dark:text-neutral-300'
        }`}
      >
        {label}
      </h3>
      <ul className="mt-5 space-y-3">
        {points.map((point) => (
          <li
            key={point}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-600 dark:text-neutral-400"
          >
            <span
              aria-hidden
              className={`mt-2 h-1 w-1 flex-shrink-0 rounded-full ${
                accent === 'brand'
                  ? 'bg-orange-500 dark:bg-orange-400'
                  : 'bg-gray-400 dark:bg-gray-500'
              }`}
            />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
