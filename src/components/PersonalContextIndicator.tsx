import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, Link2, Loader2 } from 'lucide-react';
import type { PersonalContext } from '../lib/personalContext';

type Props = {
  context: PersonalContext | null;
  loading?: boolean;
  /** Compact strip for service workspace / generation flows. */
  compact?: boolean;
  onOpenQuestionnaires?: () => void;
  className?: string;
};

export default function PersonalContextIndicator({
  context,
  loading = false,
  compact = false,
  onOpenQuestionnaires,
  className = '',
}: Props) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div
        className={`flex items-center gap-2 rounded-xl border border-[var(--bm-border)] bg-[var(--bm-surface)]/60 px-3 py-2 text-xs member-muted ${className}`}
        role="status"
      >
        <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
        {t('member.personalContext.loading')}
      </div>
    );
  }

  if (!context) {
    return (
      <div
        className={`rounded-xl border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200 ${className}`}
      >
        <p className="font-medium">{t('member.personalContext.unavailableTitle')}</p>
        <p className="mt-0.5 opacity-90">{t('member.personalContext.unavailableBody')}</p>
        {onOpenQuestionnaires ? (
          <button
            type="button"
            onClick={onOpenQuestionnaires}
            className="mt-2 text-orange-700 dark:text-orange-300 underline underline-offset-2"
          >
            {t('member.personalContext.openQuestionnaires')}
          </button>
        ) : null}
      </div>
    );
  }

  const health = context.linkageHealth;
  const tone =
    health === 'green'
      ? 'border-emerald-300/50 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100'
      : health === 'yellow'
        ? 'border-amber-300/50 bg-amber-500/10 text-amber-900 dark:text-amber-100'
        : 'border-rose-300/50 bg-rose-500/10 text-rose-900 dark:text-rose-100';

  const Icon = health === 'green' ? CheckCircle2 : health === 'yellow' ? Link2 : AlertTriangle;
  const statusKey =
    health === 'green'
      ? 'member.personalContext.statusReady'
      : health === 'yellow'
        ? 'member.personalContext.statusPartial'
        : 'member.personalContext.statusIncomplete';

  return (
    <div className={`rounded-xl border px-3 py-2.5 text-xs ${tone} ${className}`} role="status">
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {t('member.personalContext.linkedLabel')} ·{' '}
            {t('member.personalContext.questionnairePercent', {
              percent: context.completeness.questionnairePercent,
            })}
          </p>
          <p className="mt-0.5 opacity-90">{t(statusKey)}</p>
          {!compact ? (
            <p className="mt-1 member-muted opacity-80 break-words">{context.contextBlurb}</p>
          ) : null}
          {(health === 'red' || !context.completeness.readyForPersonalizedAnalysis) &&
          onOpenQuestionnaires ? (
            <button
              type="button"
              onClick={onOpenQuestionnaires}
              className="mt-2 font-medium underline underline-offset-2"
            >
              {t('member.personalContext.completeCta')}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
