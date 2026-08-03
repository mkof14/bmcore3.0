import { FileStack, History, GitCompareArrows, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  HUMAN_DATA_MODEL_GROUP_ID,
  humanDataModelCategory,
  humanDataModelServices,
  serviceDetailPath,
} from '../../../data/services';
import { localizeCategory, localizeService } from '../../../lib/localizeServices';

const TOOL_ICONS = {
  'medical-records-import': FileStack,
  'health-timeline': History,
  'what-changed': GitCompareArrows,
} as const;

interface Props {
  dark: boolean;
  onOpenTool: (servicePath: string) => void;
}

/**
 * Prominent Human Data Model core tools — not a medical category, not buried in catalog.
 */
export default function HumanDataModelCoreTools({ dark, onOpenTool }: Props) {
  const { t } = useTranslation();
  const category = localizeCategory(t, humanDataModelCategory);

  return (
    <section
      className={`w-full max-w-3xl border-t pt-8 ${
        dark ? 'border-white/10' : 'border-neutral-200'
      }`}
      aria-label={t('home.coreTools.title')}
    >
      <div className="mb-5 text-center">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
            dark ? 'text-orange-400/90' : 'text-orange-600'
          }`}
        >
          {category.name}
        </p>
        <h2
          className={`mt-2 text-lg font-semibold tracking-tight sm:text-xl ${
            dark ? 'text-neutral-100' : 'text-neutral-900'
          }`}
        >
          {t('home.coreTools.title')}
        </h2>
        <p
          className={`mx-auto mt-2 max-w-xl text-sm ${
            dark ? 'text-neutral-400' : 'text-neutral-600'
          }`}
        >
          {t('home.coreTools.subtitle')}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {humanDataModelServices.map((service) => {
          const localizedService = localizeService(t, HUMAN_DATA_MODEL_GROUP_ID, service);
          const Icon = TOOL_ICONS[service.id as keyof typeof TOOL_ICONS] ?? FileStack;
          const path = serviceDetailPath(HUMAN_DATA_MODEL_GROUP_ID, service.id);
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onOpenTool(path)}
              className={`group flex flex-col rounded-2xl border p-4 text-left transition ${
                dark
                  ? 'border-white/10 bg-white/[0.03] hover:border-orange-400/40 hover:bg-white/[0.06]'
                  : 'border-neutral-200 bg-neutral-50/80 hover:border-orange-300 hover:bg-white'
              }`}
            >
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition duration-200 group-hover:scale-105 ${
                  dark ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-50 text-orange-600'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.85} />
              </span>
              <span
                className={`mt-3 text-sm font-semibold leading-snug transition-colors duration-200 ${
                  dark
                    ? 'text-neutral-100 group-hover:text-white'
                    : 'text-neutral-900 group-hover:text-orange-700'
                }`}
              >
                {localizedService.name}
              </span>
              <span
                className={`mt-1.5 line-clamp-3 text-xs leading-relaxed ${
                  dark ? 'text-neutral-400' : 'text-neutral-600'
                }`}
              >
                {localizedService.description}
              </span>
              <span
                className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold ${
                  dark ? 'text-orange-400' : 'text-orange-600'
                }`}
              >
                {t('home.coreTools.readMore')}
                <ArrowRight className="h-3.5 w-3.5 transition duration-200 group-hover:translate-x-1" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
