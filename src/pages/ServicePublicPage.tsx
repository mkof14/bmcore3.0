import { ArrowLeft, ArrowRight, Check, Lock, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import {
  HUMAN_DATA_MODEL_GROUP_ID,
  resolveServiceRef,
  serviceDetailPath,
} from '../data/services';
import { servicePublicHighlights, servicePublicSteps } from '../data/serviceHeroes';
import { useSession } from '../hooks/useSession';
import { localizeCategory, localizeService } from '../lib/localizeServices';

interface Props {
  onNavigate: (page: string, data?: string) => void;
  serviceId?: string;
}

const categoryTitleColor: Record<string, string> = {
  'human-data-model': 'text-slate-500 dark:text-slate-300',
  'critical-health': 'text-orange-500',
  'everyday-wellness': 'text-green-500',
  longevity: 'text-pink-500',
  'mental-wellness': 'text-cyan-500',
  'fitness-performance': 'text-yellow-500',
  'womens-health': 'text-pink-500',
  'mens-health': 'text-blue-500',
  'beauty-skincare': 'text-pink-500',
  'nutrition-diet': 'text-green-500',
  'sleep-recovery': 'text-purple-500',
  'environmental-health': 'text-teal-500',
  'family-health': 'text-orange-500',
  'preventive-medicine': 'text-cyan-500',
  biohacking: 'text-blue-500',
  'senior-care': 'text-amber-800 dark:text-amber-500',
  'eye-health': 'text-blue-500',
  'digital-therapeutics': 'text-purple-500',
  'general-sexual': 'text-red-500',
  'mens-sexual-health': 'text-blue-500',
  'womens-sexual-health': 'text-pink-500',
};

/**
 * Public informational service page — description only.
 * Interactive workspace lives in Member Zone.
 */
export default function ServicePublicPage({ onNavigate, serviceId }: Props) {
  const { t } = useTranslation();
  const user = useSession();
  const isSignedIn = Boolean(user);
  const resolved = serviceId ? resolveServiceRef(serviceId) : null;

  if (!resolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page pt-16">
        <div className="text-center">
          <p className="mb-4 text-gray-600 dark:text-gray-400">Service not found</p>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="font-medium text-orange-500 hover:underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const category = localizeCategory(t, resolved.category);
  const service = localizeService(t, resolved.category.id, resolved.service);
  const isHdm = category.id === HUMAN_DATA_MODEL_GROUP_ID || service.scope === 'human-data-model';
  const highlights = servicePublicHighlights(service.name);
  const steps = servicePublicSteps(service.name);
  const related = resolved.category.services
    .filter((item) => item.id !== service.id)
    .slice(0, 3)
    .map((item) => localizeService(t, category.id, item));
  const titleColor = categoryTitleColor[category.id] || 'text-orange-500';

  const goBack = () => {
    if (isHdm) onNavigate('home');
    else onNavigate('services-catalog', category.id);
  };

  const openFullService = () => {
    const path = serviceDetailPath(category.id, service.id);
    try {
      sessionStorage.setItem('bmcore.pendingService', path);
    } catch {
      /* ignore */
    }
    onNavigate('member-zone', path);
  };

  return (
    <div className="min-h-screen bg-page pt-16 transition-colors">
      <SEO
        title={`${service.name} — BioMath Core`}
        description={service.description}
        keywords={[service.name, category.name, 'BioMath Core', 'health service']}
        url={`/services/${category.id}/${service.id}`}
      />

      <section className="border-b border-gray-200 bg-[radial-gradient(circle_at_top,_#fff6ed,_transparent_55%),linear-gradient(135deg,#f8fafc,white)] px-4 py-12 dark:border-gray-800 dark:bg-[radial-gradient(circle_at_top,_rgba(120,145,175,0.14),_transparent_55%),linear-gradient(135deg,var(--bm-surface),var(--bm-page))] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={goBack}
            className="mb-8 inline-flex items-center gap-2 text-sm text-orange-600 transition-colors hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {isHdm ? 'Back to Human Data Model' : `Back to ${category.name}`}
          </button>

          <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${titleColor}`}>
            {category.name}
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            {service.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
            {service.description}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-[var(--bm-surface)] dark:text-gray-300">
            <Lock className="h-3.5 w-3.5 text-orange-500" />
            Public description · full tools in Cabinet
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[var(--bm-surface)] sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">What this is about</h2>
          <ul className="mt-5 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400">
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[var(--bm-surface)] sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">How it works</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-xl border border-gray-200 bg-page p-4 dark:border-gray-800"
              >
                <div className="mb-3 text-xs font-bold tabular-nums text-orange-500">0{i + 1}</div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-orange-200 bg-orange-50/80 p-6 dark:border-orange-500/30 dark:bg-orange-950/20 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Use this in Cabinet
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  This page is a public description only. Interactive tools open after sign-in.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={isSignedIn ? openFullService : () => onNavigate('signin')}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              {isSignedIn ? 'Open in Cabinet' : 'Sign in to continue'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {related.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Related in {category.name}
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {related.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    onNavigate('service-detail', serviceDetailPath(category.id, item.id))
                  }
                  className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-orange-300 dark:border-gray-800 dark:bg-[var(--bm-surface)] dark:hover:border-orange-500/40"
                >
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</div>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
