import { useEffect, useRef, useState } from 'react';
import {
  FileUp,
  Network,
  GitCompareArrows,
  Compass,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tList } from '../../i18n/tList';

type Step = { title: string; body: string };

const ICONS: LucideIcon[] = [FileUp, Network, GitCompareArrows, Compass];

/**
 * Home — how BioMath Core works in four clear steps.
 * Icons / SVG only; no stock photography.
 */
export default function HomeHowItWorks() {
  const { t } = useTranslation();
  const steps = tList<Step>(t, 'home.steps.items');
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
      aria-labelledby="home-steps-heading"
      className="border-t border-[var(--bm-border)] bg-page px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <header
          className="mx-auto mb-10 max-w-2xl text-center lg:mb-12"
          style={{
            transitionProperty: 'opacity, transform',
            transitionDuration: '240ms',
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
            {t('home.steps.label')}
          </p>
          <h2
            id="home-steps-heading"
            className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl"
          >
            {t('home.steps.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-gray-600 dark:text-neutral-400">
            {t('home.steps.body')}
          </p>
        </header>

        <ol className="m-0 grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((step, i) => {
            const Icon = ICONS[i] ?? Compass;
            return (
              <li
                key={step.title}
                className="relative"
                style={{
                  transitionProperty: 'opacity, transform',
                  transitionDuration: '240ms',
                  transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                  transitionDelay: visible ? `${40 + i * 45}ms` : '0ms',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(12px)',
                }}
              >
                <span
                  aria-hidden
                  className="mb-4 flex h-10 w-10 items-center justify-center text-orange-600 dark:text-orange-400"
                >
                  <Icon className="h-6 w-6" strokeWidth={1.6} />
                </span>
                <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                  {step.body}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
