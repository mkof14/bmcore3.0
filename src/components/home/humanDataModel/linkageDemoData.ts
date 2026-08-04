import type { TFunction } from 'i18next';
import type { Opinion, OpinionDiff } from '../../../lib/dualOpinionEngine';
import type { LinkageHealth } from '../../../lib/personalContext/types';
import { SECTION_IDS, type QuestionnaireSection } from '../../../lib/questionnaire/types';
import { createDefaultPersonas } from '../../../lib/secondOpinionEngine';

/** Public demo sections — real SECTION_IDS minus specialized/locked sexual-health blocks. */
export const DEMO_SECTION_IDS: QuestionnaireSection[] = SECTION_IDS.filter(
  (id) => id !== 'mens_sexual_health' && id !== 'womens_sexual_health',
);

export const DEMO_SECTION_TOTAL = DEMO_SECTION_IDS.length;

/** Same ratio shape as computeCompleteness questionnairePercent (filled/total → %). */
export function demoQuestionnairePercent(filledCount: number, total: number = DEMO_SECTION_TOTAL): number {
  return total === 0 ? 0 : Math.round((filledCount / total) * 100);
}

/**
 * Mirror of readyForPersonalizedAnalysis questionnaire gate (≥40%).
 * Demo assumes the profile secondary gate is satisfied.
 */
export function demoReadyForPersonalizedAnalysis(questionnairePercent: number): boolean {
  return questionnairePercent >= 40;
}

/**
 * Mirror of deriveLinkageHealth with paid access + questionnaire present.
 * Uses the same thresholds: red &lt;25%, green when ready and score ≥70, else yellow.
 * Score mirrors computeCompleteness weighting with a filled profile (15%).
 */
export function demoDeriveLinkageHealth(questionnairePercent: number): LinkageHealth {
  if (questionnairePercent < 25) return 'red';
  const score = Math.round(questionnairePercent * 0.85 + 100 * 0.15);
  const ready = demoReadyForPersonalizedAnalysis(questionnairePercent);
  if (ready && score >= 70) return 'green';
  return 'yellow';
}

type RecPriority = Opinion['recommendations'][number]['priority'];

function readRecommendations(
  t: TFunction,
  baseKey: string,
  priorities: RecPriority[],
): Opinion['recommendations'] {
  const raw = t(baseKey, { returnObjects: true }) as unknown;
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const row = item as { title?: string; description?: string };
    return {
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      priority: priorities[i] ?? 'medium',
      actionable: true,
    };
  });
}

function readStringList(t: TFunction, key: string): string[] {
  const raw = t(key, { returnObjects: true }) as unknown;
  return Array.isArray(raw) ? raw.map(String) : [];
}

/** Static sample dual opinions shaped like Opinion / OpinionDiff — no live matcher or LLM. */
export function buildLinkageDemoOpinions(t: TFunction): {
  opinionA: Opinion;
  opinionB: Opinion;
  diff: OpinionDiff;
} {
  const { personaA, personaB } = createDefaultPersonas();

  const opinionA: Opinion = {
    model: 'A',
    persona: { ...personaA, reasoning_style: 'evidence_based' },
    summary: t('home.linkage.opinionA.summary'),
    reasoning: readStringList(t, 'home.linkage.opinionA.reasoning'),
    recommendations: readRecommendations(t, 'home.linkage.opinionA.recommendations', [
      'high',
      'high',
      'medium',
    ]),
    confidence: 85,
  };

  const opinionB: Opinion = {
    model: 'B',
    persona: { ...personaB, reasoning_style: 'contextual' },
    summary: t('home.linkage.opinionB.summary'),
    reasoning: readStringList(t, 'home.linkage.opinionB.reasoning'),
    recommendations: readRecommendations(t, 'home.linkage.opinionB.recommendations', [
      'high',
      'high',
      'medium',
    ]),
    confidence: 78,
  };

  const agreementRows = t('home.linkage.diff.agreements', { returnObjects: true }) as unknown;
  const agreements: OpinionDiff['agreements'] = Array.isArray(agreementRows)
    ? agreementRows.map((row) => {
        const item = row as { topic?: string; consensus?: string };
        return {
          topic: String(item.topic ?? ''),
          consensus: String(item.consensus ?? ''),
          confidence: Math.round((opinionA.confidence + opinionB.confidence) / 2),
        };
      })
    : [];

  const disagreementRows = t('home.linkage.diff.disagreements', { returnObjects: true }) as unknown;
  const disagreements: OpinionDiff['disagreements'] = Array.isArray(disagreementRows)
    ? disagreementRows.map((row) => {
        const item = row as {
          topic?: string;
          opinionA?: string;
          opinionB?: string;
          explanation?: string;
          severity?: OpinionDiff['disagreements'][number]['severity'];
        };
        return {
          topic: String(item.topic ?? ''),
          opinionA: String(item.opinionA ?? ''),
          opinionB: String(item.opinionB ?? ''),
          severity: item.severity === 'high' || item.severity === 'low' ? item.severity : 'medium',
          explanation: String(item.explanation ?? ''),
        };
      })
    : [];

  const uniqueToA = readStringList(t, 'home.linkage.diff.uniqueToA');
  const uniqueToB = readStringList(t, 'home.linkage.diff.uniqueToB');

  const diff: OpinionDiff = {
    agreements,
    disagreements,
    uniqueToA,
    uniqueToB,
    overallAlignment: 62,
  };

  return { opinionA, opinionB, diff };
}
