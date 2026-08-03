import {
  getQuestionnaireSummary,
  SECTION_IDS,
  emptyResponses,
  type QuestionnaireSummary,
} from '../questionnaire';
import {
  PERSONAL_CONTEXT_VERSION,
  type QuestionnaireDigitalFile,
} from './types';

/** Build a structured digital questionnaire file from an existing summary (no extra fetch). */
export function digitalFileFromSummary(summary: QuestionnaireSummary): QuestionnaireDigitalFile {
  return {
    schemaVersion: PERSONAL_CONTEXT_VERSION,
    userId: summary.userId,
    exportedAt: new Date().toISOString(),
    unitSystem: summary.unitSystem,
    unlocks: {
      mensSexualHealth: summary.mensSexualHealthUnlocked,
      womensSexualHealth: summary.womensSexualHealthUnlocked,
    },
    overallProgress: summary.overallProgress,
    completedCount: summary.completedCount,
    unlockedCount: summary.unlockedCount,
    isProfileComplete: summary.isProfileComplete,
    sections: summary.sections.map((s) => ({
      id: s.id,
      status: s.status,
      progress: s.progress,
      locked: s.locked,
      data: s.locked ? {} : summary.raw[s.id] || {},
      answeredFields: s.answeredFields,
    })),
  };
}

/** Empty digital file when the member has never saved questionnaire data. */
export function emptyDigitalFile(userId: string): QuestionnaireDigitalFile {
  const raw = emptyResponses();
  return {
    schemaVersion: PERSONAL_CONTEXT_VERSION,
    userId,
    exportedAt: new Date().toISOString(),
    unitSystem: 'metric',
    unlocks: { mensSexualHealth: false, womensSexualHealth: false },
    overallProgress: 0,
    completedCount: 0,
    unlockedCount: SECTION_IDS.filter(
      (id) => id !== 'mens_sexual_health' && id !== 'womens_sexual_health',
    ).length,
    isProfileComplete: false,
    sections: SECTION_IDS.map((id) => ({
      id,
      status: 'draft' as const,
      progress: 0,
      locked: id === 'mens_sexual_health' || id === 'womens_sexual_health',
      data: raw[id],
      answeredFields: [],
    })),
  };
}

/**
 * Structured JSON export of the member's digital questionnaire file.
 * Fetches questionnaire summary when not provided.
 */
export async function getQuestionnaireDigitalFile(
  userId: string,
  summary?: QuestionnaireSummary | null,
): Promise<QuestionnaireDigitalFile> {
  const resolved = summary === undefined ? await getQuestionnaireSummary(userId) : summary;
  if (!resolved) return emptyDigitalFile(userId);
  return digitalFileFromSummary(resolved);
}
