export type QuestionnaireSection =
  | 'categories'
  | 'personal_info'
  | 'medical_history'
  | 'medications'
  | 'allergies'
  | 'vital_signs'
  | 'lifestyle'
  | 'psychological_health'
  | 'mens_sexual_health'
  | 'womens_sexual_health';

export type SectionStatus = 'draft' | 'complete';

export type UnitSystem = 'metric' | 'imperial';

export type QuestionnaireData = Record<string, unknown>;

export const SECTION_IDS: QuestionnaireSection[] = [
  'categories',
  'personal_info',
  'medical_history',
  'medications',
  'allergies',
  'vital_signs',
  'lifestyle',
  'psychological_health',
  'mens_sexual_health',
  'womens_sexual_health',
];

export const SECTION_GROUPS: Array<{ id: string; sections: QuestionnaireSection[] }> = [
  { id: 'basics', sections: ['categories', 'personal_info'] },
  { id: 'clinical', sections: ['medical_history', 'medications', 'allergies', 'vital_signs'] },
  { id: 'lifestyle', sections: ['lifestyle', 'psychological_health'] },
  { id: 'specialized', sections: ['mens_sexual_health', 'womens_sexual_health'] },
];

/** Stored values kept English for backward-compatible saved answers. */
export const HEALTH_AREAS = [
  { value: 'Sleep & Recovery', key: 'sleep' },
  { value: 'Energy & Fatigue', key: 'energy' },
  { value: 'Nutrition', key: 'nutrition' },
  { value: 'Stress Management', key: 'stress' },
  { value: 'Hormones', key: 'hormones' },
  { value: 'Prevention', key: 'prevention' },
  { value: 'Performance', key: 'performance' },
  { value: 'Mental Wellness', key: 'mental' },
  { value: 'Longevity', key: 'longevity' },
  { value: "Men's Sexual Health", key: 'mensSexual' },
  { value: "Women's Sexual Health", key: 'womensSexual' },
] as const;

export const MENS_SEXUAL_CATEGORY_VALUE = "Men's Sexual Health";
export const WOMENS_SEXUAL_CATEGORY_VALUE = "Women's Sexual Health";

export function emptyResponses(): Record<QuestionnaireSection, QuestionnaireData> {
  return {
    categories: {},
    personal_info: {},
    medical_history: {},
    medications: {},
    allergies: {},
    vital_signs: {},
    lifestyle: {},
    psychological_health: {},
    mens_sexual_health: {},
    womens_sexual_health: {},
  };
}

export function emptyStatuses(): Record<QuestionnaireSection, SectionStatus> {
  return {
    categories: 'draft',
    personal_info: 'draft',
    medical_history: 'draft',
    medications: 'draft',
    allergies: 'draft',
    vital_signs: 'draft',
    lifestyle: 'draft',
    psychological_health: 'draft',
    mens_sexual_health: 'draft',
    womens_sexual_health: 'draft',
  };
}
