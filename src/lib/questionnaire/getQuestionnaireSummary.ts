import { supabase } from '../supabase';
import {
  checkSectionComplete,
  getSectionProgress,
  isFieldFilled,
} from './fields';
import {
  SECTION_IDS,
  emptyResponses,
  emptyStatuses,
  type QuestionnaireData,
  type QuestionnaireSection,
  type SectionStatus,
  type UnitSystem,
} from './types';
import { unlocksFromPersonalAndCategories } from './unlock';

export type QuestionnaireSectionSummary = {
  id: QuestionnaireSection;
  status: SectionStatus;
  progress: number;
  locked: boolean;
  answeredFields: string[];
  highlights: Record<string, unknown>;
};

export type QuestionnaireSummary = {
  userId: string;
  unitSystem: UnitSystem;
  mensSexualHealthUnlocked: boolean;
  womensSexualHealthUnlocked: boolean;
  completedCount: number;
  unlockedCount: number;
  overallProgress: number;
  isProfileComplete: boolean;
  sections: QuestionnaireSectionSummary[];
  /** Compact context string for Health Guide / reports. */
  contextBlurb: string;
  raw: Record<QuestionnaireSection, QuestionnaireData>;
};

const HIGHLIGHT_KEYS: Partial<Record<QuestionnaireSection, string[]>> = {
  categories: ['primary_health_areas', 'primary_priority'],
  personal_info: ['biological_sex', 'date_of_birth', 'country', 'height', 'weight'],
  medical_history: [
    'has_diagnosed_conditions',
    'conditions_list',
    'family_history',
    'surgeries',
  ],
  medications: [
    'taking_medications',
    'medications_list',
    'taking_supplements',
    'supplements_list',
  ],
  allergies: ['has_allergies', 'allergies_list', 'allergy_severity'],
  vital_signs: ['resting_heart_rate', 'blood_pressure'],
  lifestyle: [
    'smoking_status',
    'alcohol_consumption',
    'exercise_frequency',
    'sleep_duration',
    'diet_quality',
    'sleep_quality',
    'caffeine_intake',
    'activity_type',
    'stress_level',
  ],
  psychological_health: [
    'mood_stability',
    'mood_scale',
    'anxiety_frequency',
    'energy_level',
    'prolonged_stress',
  ],
  mens_sexual_health: [
    'sexual_interest_trend',
    'satisfaction_level',
    'wants_guidance',
  ],
  womens_sexual_health: [
    'sexual_desire_changes',
    'cycle_regularity',
    'satisfaction_level',
    'wants_hormonal_guidance',
  ],
};

function pickHighlights(
  section: QuestionnaireSection,
  data: QuestionnaireData
): Record<string, unknown> {
  const keys = HIGHLIGHT_KEYS[section] || [];
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    if (isFieldFilled(data[key])) out[key] = data[key];
  }
  return out;
}

function buildContextBlurb(summary: Omit<QuestionnaireSummary, 'contextBlurb'>): string {
  const parts: string[] = [];
  const personal = summary.raw.personal_info;
  const cats = summary.raw.categories;
  const life = summary.raw.lifestyle;
  const psych = summary.raw.psychological_health;

  if (personal.biological_sex) parts.push(`sex=${personal.biological_sex}`);
  if (personal.country) parts.push(`country=${personal.country}`);
  if (Array.isArray(cats.primary_health_areas) && cats.primary_health_areas.length) {
    parts.push(`focus=${(cats.primary_health_areas as string[]).join(', ')}`);
  }
  if (cats.primary_priority) parts.push(`priority=${cats.primary_priority}`);
  if (life.sleep_duration) parts.push(`sleep_h=${life.sleep_duration}`);
  if (life.stress_level) parts.push(`stress=${life.stress_level}`);
  if (life.diet_quality) parts.push(`diet=${life.diet_quality}`);
  if (psych.energy_level) parts.push(`energy=${psych.energy_level}`);
  if (psych.mood_scale) parts.push(`mood=${psych.mood_scale}`);
  if (summary.raw.medical_history.has_diagnosed_conditions === true) {
    parts.push('has_conditions=yes');
  }
  if (summary.raw.medications.taking_medications === true) {
    parts.push('on_medications=yes');
  }
  if (summary.raw.allergies.has_allergies === true) {
    parts.push('has_allergies=yes');
  }

  parts.push(
    `profile=${summary.completedCount}/${summary.unlockedCount} sections complete`,
    `progress=${summary.overallProgress}%`
  );

  return parts.join('; ');
}

export async function getQuestionnaireSummary(
  userId: string
): Promise<QuestionnaireSummary | null> {
  const { data, error } = await supabase
    .from('questionnaire_responses')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;

  const raw = emptyResponses();
  for (const id of SECTION_IDS) {
    raw[id] = (data[id] as QuestionnaireData) || {};
  }

  const statuses = emptyStatuses();
  for (const id of SECTION_IDS) {
    const col = `${id}_status` as keyof typeof data;
    statuses[id] = (data[col] as SectionStatus) || 'draft';
  }

  const derived = unlocksFromPersonalAndCategories(raw.personal_info, raw.categories, {
    mens_sexual_health_unlocked: Boolean(data.mens_sexual_health_unlocked),
    womens_sexual_health_unlocked: Boolean(data.womens_sexual_health_unlocked),
  });

  const sections: QuestionnaireSectionSummary[] = SECTION_IDS.map((id) => {
    const locked =
      (id === 'mens_sexual_health' && !derived.mens_sexual_health_unlocked) ||
      (id === 'womens_sexual_health' && !derived.womens_sexual_health_unlocked);
    const sectionData = raw[id];
    const answeredFields = Object.keys(sectionData).filter((k) =>
      isFieldFilled(sectionData[k])
    );
    return {
      id,
      status: checkSectionComplete(id, sectionData) ? 'complete' : statuses[id],
      progress: getSectionProgress(id, sectionData),
      locked,
      answeredFields,
      highlights: locked ? {} : pickHighlights(id, sectionData),
    };
  });

  const unlocked = sections.filter((s) => !s.locked);
  const completedCount = unlocked.filter((s) => s.status === 'complete').length;
  const overallProgress =
    unlocked.length === 0
      ? 0
      : Math.round(unlocked.reduce((sum, s) => sum + s.progress, 0) / unlocked.length);

  const base = {
    userId,
    unitSystem: (data.unit_system as UnitSystem) || 'metric',
    mensSexualHealthUnlocked: derived.mens_sexual_health_unlocked,
    womensSexualHealthUnlocked: derived.womens_sexual_health_unlocked,
    completedCount,
    unlockedCount: unlocked.length,
    overallProgress,
    isProfileComplete: unlocked.length > 0 && completedCount === unlocked.length,
    sections,
    raw,
  };

  return {
    ...base,
    contextBlurb: buildContextBlurb(base),
  };
}
