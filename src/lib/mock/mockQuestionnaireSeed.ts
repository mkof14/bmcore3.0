/** Realistic questionnaire payload so mock/superadmin clears the generate gate. */
export function buildMockQuestionnaireRow(userId: string): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    user_id: userId,
    unit_system: 'metric',
    categories: {
      primary_health_areas: ['Sleep & Recovery', 'Energy & Fatigue', 'Stress Management', 'Longevity'],
      primary_priority: 'Sleep & Recovery',
    },
    categories_status: 'complete',
    personal_info: {
      full_name: 'Alex Rivera',
      biological_sex: 'female',
      date_of_birth: '1988-04-12',
      country: 'United States',
      height: 168,
      weight: 64,
      primary_language: 'en',
    },
    personal_info_status: 'complete',
    medical_history: {
      has_diagnosed_conditions: false,
      family_history: 'Maternal hypertension; paternal type 2 diabetes',
      surgeries: 'None',
    },
    medical_history_status: 'complete',
    medications: {
      taking_medications: false,
      taking_supplements: true,
      supplements_list: 'Vitamin D3 2000 IU, Magnesium glycinate 200 mg',
    },
    medications_status: 'complete',
    allergies: {
      has_allergies: false,
    },
    allergies_status: 'complete',
    vital_signs: {
      resting_heart_rate: 62,
      blood_pressure: '118/76',
    },
    vital_signs_status: 'complete',
    lifestyle: {
      smoking_status: 'Never',
      alcohol_consumption: '1-2 drinks / week',
      exercise_frequency: '4 times / week',
      sleep_duration: '6.5',
      diet_quality: 'Mostly whole foods, inconsistent dinner timing',
      sleep_quality: 'Fair — frequent late wind-down',
      caffeine_intake: '2 coffees before noon',
      activity_type: 'Strength + walking',
      stress_level: 'Moderate-high on workdays',
    },
    lifestyle_status: 'complete',
    psychological_health: {
      mood_stability: 'Mostly stable with afternoon dips',
      mood_scale: 7,
      anxiety_frequency: 'A few times per week',
      energy_level: 'Good mornings, fades after 3pm',
      prolonged_stress: 'Work deadlines and irregular sleep',
    },
    psychological_health_status: 'complete',
    mens_sexual_health: {},
    mens_sexual_health_status: 'draft',
    mens_sexual_health_unlocked: false,
    womens_sexual_health: {},
    womens_sexual_health_status: 'draft',
    womens_sexual_health_unlocked: false,
    updated_at: now,
    created_at: now,
  };
}
