import type { QuestionnaireData, QuestionnaireSection } from './types';

/** Always-required fields for each section (before conditional Yes follow-ups). */
export const BASE_REQUIRED_FIELDS: Record<QuestionnaireSection, string[]> = {
  categories: ['primary_health_areas', 'primary_priority'],
  personal_info: [
    'full_name',
    'biological_sex',
    'date_of_birth',
    'country',
    'height',
    'weight',
    'primary_language',
  ],
  medical_history: ['has_diagnosed_conditions', 'family_history', 'surgeries'],
  medications: ['taking_medications', 'taking_supplements'],
  allergies: ['has_allergies'],
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
    'sexual_function_confidence',
    'erectile_concern',
    'satisfaction_level',
    'wants_guidance',
  ],
  womens_sexual_health: [
    'sexual_desire_changes',
    'wants_hormonal_guidance',
    'cycle_regularity',
    'comfort_during_intimacy',
    'satisfaction_level',
  ],
};

/** Fields counted for progress bars (required + common optional depth fields). */
export const PROGRESS_FIELDS: Record<QuestionnaireSection, string[]> = {
  categories: ['primary_health_areas', 'primary_priority'],
  personal_info: [
    'full_name',
    'biological_sex',
    'date_of_birth',
    'country',
    'height',
    'weight',
    'primary_language',
  ],
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
    'sexual_function_confidence',
    'erectile_concern',
    'satisfaction_level',
    'wants_guidance',
  ],
  womens_sexual_health: [
    'sexual_desire_changes',
    'wants_hormonal_guidance',
    'cycle_regularity',
    'comfort_during_intimacy',
    'satisfaction_level',
  ],
};

export function isFieldFilled(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'boolean') return true;
  if (typeof value === 'number') return !Number.isNaN(value);
  return value !== undefined && value !== null && String(value).trim() !== '';
}

/** Dynamic required fields including Yes-follow-up textareas. */
export function getRequiredFields(
  section: QuestionnaireSection,
  data: QuestionnaireData
): string[] {
  const required = [...BASE_REQUIRED_FIELDS[section]];

  if (section === 'medical_history' && data.has_diagnosed_conditions === true) {
    required.push('conditions_list');
  }
  if (section === 'medications') {
    if (data.taking_medications === true) required.push('medications_list');
    if (data.taking_supplements === true) required.push('supplements_list');
  }
  if (section === 'allergies' && data.has_allergies === true) {
    required.push('allergies_list', 'allergy_severity');
  }

  return required;
}

export function checkSectionComplete(
  section: QuestionnaireSection,
  data: QuestionnaireData
): boolean {
  return getRequiredFields(section, data).every((field) => isFieldFilled(data[field]));
}

export function getSectionProgress(
  section: QuestionnaireSection,
  data: QuestionnaireData
): number {
  const fields = PROGRESS_FIELDS[section];
  if (fields.length === 0) return 0;

  // Only count conditional follow-ups when parent Yes is selected
  const countable = fields.filter((field) => {
    if (field === 'conditions_list') return data.has_diagnosed_conditions === true;
    if (field === 'medications_list') return data.taking_medications === true;
    if (field === 'supplements_list') return data.taking_supplements === true;
    if (field === 'allergies_list' || field === 'allergy_severity') {
      return data.has_allergies === true;
    }
    return true;
  });

  if (countable.length === 0) return 0;
  const filled = countable.filter((field) => isFieldFilled(data[field])).length;
  return Math.round((filled / countable.length) * 100);
}
