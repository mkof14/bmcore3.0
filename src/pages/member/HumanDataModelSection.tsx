import { useTranslation } from 'react-i18next';
import { FileStack, History, GitCompareArrows, ArrowRight } from 'lucide-react';
import {
  HUMAN_DATA_MODEL_GROUP_ID,
  humanDataModelServices,
  serviceDetailPath,
} from '../../data/services';
import ReportBrandHeader from '../../components/report/ReportBrandHeader';
import { tService, tServiceDescription } from '../../i18n/serviceLabels';

const TOOL_ICONS = {
  'medical-records-import': FileStack,
  'health-timeline': History,
  'what-changed': GitCompareArrows,
} as const;

interface Props {
  onOpenService: (servicePath: string) => void;
}

/**
 * Member Zone home for shared Human Data Model tools (not category catalog).
 */
export default function HumanDataModelSection({ onOpenService }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <ReportBrandHeader variant="strip" subtitle={t('member.humanDataModel.title')} className="mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('member.humanDataModel.title')}</h1>
        <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
          {t('member.humanDataModel.subtitle')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {humanDataModelServices.map((service) => {
          const Icon = TOOL_ICONS[service.id as keyof typeof TOOL_ICONS] ?? FileStack;
          const path = serviceDetailPath(HUMAN_DATA_MODEL_GROUP_ID, service.id);
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onOpenService(path)}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-orange-300 hover:shadow-md dark:border-gray-700 dark:bg-[var(--bm-surface)]/60 dark:hover:border-orange-500/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h2 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                {tService(t, HUMAN_DATA_MODEL_GROUP_ID, service.id, service.name)}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {tServiceDescription(t, HUMAN_DATA_MODEL_GROUP_ID, service.id, service.description)}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                {t('member.humanDataModel.openWorkspace')}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
