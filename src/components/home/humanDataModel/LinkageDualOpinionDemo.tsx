import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Lock } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import type { LinkageHealth } from '../../../lib/personalContext/types';
import type { QuestionnaireSection } from '../../../lib/questionnaire/types';
import {
  DEMO_SECTION_IDS,
  DEMO_SECTION_TOTAL,
  buildLinkageDemoOpinions,
  demoDeriveLinkageHealth,
  demoQuestionnairePercent,
  demoReadyForPersonalizedAnalysis,
} from './linkageDemoData';

function barTone(health: LinkageHealth): string {
  if (health === 'green') return 'bg-emerald-500';
  if (health === 'yellow') return 'bg-amber-500';
  return 'bg-rose-500';
}

function chipTone(filled: boolean, dark: boolean): string {
  if (filled) {
    return dark
      ? 'border-orange-400/60 bg-orange-500/15 text-orange-200'
      : 'border-orange-500/50 bg-orange-50 text-orange-900';
  }
  return dark
    ? 'border-neutral-700 bg-transparent text-neutral-400 hover:border-neutral-500'
    : 'border-[var(--bm-border)] bg-transparent text-neutral-600 hover:border-neutral-400';
}

/**
 * Interactive home demo: questionnaire linkage completeness → gated dual Health Guide opinion.
 * Client-only sample state; does not call engines live or touch user data.
 */
export default function LinkageDualOpinionDemo() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [filled, setFilled] = useState<Record<QuestionnaireSection, boolean>>(() => {
    const initial = {} as Record<QuestionnaireSection, boolean>;
    for (const id of DEMO_SECTION_IDS) initial[id] = false;
    return initial;
  });

  const filledCount = DEMO_SECTION_IDS.reduce((n, id) => n + (filled[id] ? 1 : 0), 0);
  const questionnairePercent = demoQuestionnairePercent(filledCount);
  const ready = demoReadyForPersonalizedAnalysis(questionnairePercent);
  const linkageHealth = demoDeriveLinkageHealth(questionnairePercent);
  const unlocked = ready;

  const { opinionA, opinionB, diff } = buildLinkageDemoOpinions(t);

  function toggleSection(id: QuestionnaireSection) {
    setFilled((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <section
      aria-labelledby="home-linkage-heading"
      className="border-t border-[var(--bm-border)] bg-page px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="mb-10 max-w-2xl lg:mb-12">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
            {t('home.linkage.label')}
          </p>
          <h2
            id="home-linkage-heading"
            className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl"
          >
            {t('home.linkage.title')}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
            {t('home.linkage.body')}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-500 dark:text-neutral-500">
            {t('home.linkage.caption')}
          </p>
        </header>

        {/* Part A — linkage strip */}
        <div className="border border-[var(--bm-border)] bg-[var(--bm-surface)] px-4 py-6 sm:px-6 sm:py-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-neutral-100">
                {t('home.linkage.completeness', { percent: questionnairePercent })}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                {t('home.linkage.linkageLabel', {
                  health: t(`home.linkage.health.${linkageHealth}`),
                })}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-500">
              {t('home.linkage.filledCount', {
                filled: filledCount,
                total: DEMO_SECTION_TOTAL,
              })}
            </p>
          </div>

          <div
            className="mt-4 h-2 w-full overflow-hidden rounded-sm bg-neutral-200 dark:bg-neutral-800"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={questionnairePercent}
            aria-label={t('home.linkage.completeness', { percent: questionnairePercent })}
          >
            <div
              className={`h-full transition-[width] duration-200 ease-out ${barTone(linkageHealth)}`}
              style={{ width: `${questionnairePercent}%` }}
            />
          </div>

          <p className="mt-5 text-xs text-gray-500 dark:text-neutral-500">
            {t('home.linkage.chipHint')}
          </p>

          <ul className="mt-3 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-4">
            {DEMO_SECTION_IDS.map((id) => {
              const isFilled = filled[id];
              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-pressed={isFilled}
                    onClick={() => toggleSection(id)}
                    className={`w-full border px-3 py-2.5 text-left text-sm transition-colors ${chipTone(isFilled, dark)}`}
                  >
                    {t(`home.linkage.sections.${id}`)}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Part B — gated dual opinion */}
        <div
          className={`relative mt-6 border border-[var(--bm-border)] bg-[var(--bm-surface)] px-4 py-6 sm:px-6 sm:py-7 ${
            unlocked ? '' : 'opacity-60'
          }`}
          aria-disabled={!unlocked}
        >
          {!unlocked ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bm-surface)]/70 px-4 backdrop-blur-[1px]">
              <div className="max-w-md text-center" role="status">
                <Lock
                  className="mx-auto h-6 w-6 text-gray-700 dark:text-neutral-300"
                  aria-hidden
                />
                <p className="mt-3 text-base font-semibold text-gray-900 dark:text-neutral-100">
                  {t('home.linkage.lockedTitle')}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                  {t('home.linkage.lockedBody')}
                </p>
              </div>
            </div>
          ) : null}

          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-600 dark:text-orange-400">
            {t('home.linkage.unlockedLabel')}
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
            {t('home.linkage.question')}
          </p>

          <div
            className={`mt-6 grid gap-6 max-sm:grid-cols-1 sm:grid-cols-2 ${unlocked ? '' : 'pointer-events-none select-none'}`}
            aria-hidden={!unlocked}
          >
            <OpinionColumn
              label={t('home.linkage.evidenceBased')}
              summary={opinionA.summary}
              reasoning={opinionA.reasoning}
              recommendations={opinionA.recommendations}
              reasoningLabel={t('home.linkage.reasoning')}
              recommendationsLabel={t('home.linkage.recommendations')}
              confidenceLabel={t('home.linkage.confidence', { value: opinionA.confidence })}
              priorityLabel={(p) => t(`home.linkage.priority.${p}`)}
            />
            <OpinionColumn
              label={t('home.linkage.contextual')}
              summary={opinionB.summary}
              reasoning={opinionB.reasoning}
              recommendations={opinionB.recommendations}
              reasoningLabel={t('home.linkage.reasoning')}
              recommendationsLabel={t('home.linkage.recommendations')}
              confidenceLabel={t('home.linkage.confidence', { value: opinionB.confidence })}
              priorityLabel={(p) => t(`home.linkage.priority.${p}`)}
            />
          </div>

          <div className={`mt-8 border-t border-[var(--bm-border)] pt-6 ${unlocked ? '' : 'select-none'}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
                {t('home.linkage.diffTitle')}
              </h3>
              <p className="text-sm font-medium text-gray-800 dark:text-neutral-200">
                {t('home.linkage.alignment', { percent: diff.overallAlignment })}
              </p>
            </div>

            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-500">
                  {t('home.linkage.agreements')}
                </p>
                <ul className="mt-3 space-y-3">
                  {diff.agreements.map((item) => (
                    <li key={item.topic} className="flex gap-2 text-sm text-gray-700 dark:text-neutral-300">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                        aria-hidden
                      />
                      <span>
                        <span className="font-medium text-gray-900 dark:text-neutral-100">
                          {item.topic}
                        </span>
                        <span className="mt-0.5 block text-gray-600 dark:text-neutral-400">
                          {item.consensus}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-500">
                  {t('home.linkage.disagreements')}
                </p>
                <ul className="mt-3 space-y-3">
                  {diff.disagreements.map((item) => (
                    <li key={item.topic} className="text-sm text-gray-700 dark:text-neutral-300">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-neutral-100">
                          {item.topic}
                        </span>
                        <span className="border border-[var(--bm-border)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:text-neutral-400">
                          {t(`home.linkage.severity.${item.severity}`)}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-600 dark:text-neutral-400">{item.explanation}</p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-neutral-500">
                        {t('home.linkage.evidenceBased')}: {item.opinionA}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-neutral-500">
                        {t('home.linkage.contextual')}: {item.opinionB}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type OpinionColumnProps = {
  label: string;
  summary: string;
  reasoning: string[];
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  reasoningLabel: string;
  recommendationsLabel: string;
  confidenceLabel: string;
  priorityLabel: (p: 'high' | 'medium' | 'low') => string;
};

function OpinionColumn({
  label,
  summary,
  reasoning,
  recommendations,
  reasoningLabel,
  recommendationsLabel,
  confidenceLabel,
  priorityLabel,
}: OpinionColumnProps) {
  return (
    <article className="min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">{label}</h3>
        <p className="text-xs text-gray-500 dark:text-neutral-500">{confidenceLabel}</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-800 dark:text-neutral-200">{summary}</p>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-500">
        {reasoningLabel}
      </p>
      <ul className="mt-2 list-disc space-y-1.5 ps-4 text-sm text-gray-600 dark:text-neutral-400">
        {reasoning.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-500">
        {recommendationsLabel}
      </p>
      <ul className="mt-2 space-y-3">
        {recommendations.map((rec) => (
          <li key={rec.title}>
            <p className="text-sm font-medium text-gray-900 dark:text-neutral-100">
              {rec.title}{' '}
              <span className="text-xs font-normal text-gray-500 dark:text-neutral-500">
                ({priorityLabel(rec.priority)})
              </span>
            </p>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-neutral-400">{rec.description}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
