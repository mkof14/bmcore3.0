import {
  MENS_SEXUAL_CATEGORY_VALUE,
  WOMENS_SEXUAL_CATEGORY_VALUE,
  type QuestionnaireData,
} from './types';

export type SexualHealthUnlocks = {
  mens_sexual_health_unlocked: boolean;
  womens_sexual_health_unlocked: boolean;
};

/**
 * Derive sexual-health unlocks from biological sex and/or selected health categories.
 * Existing true flags are preserved (OR with derived) so catalog unlocks stick.
 */
export function deriveSexualHealthUnlocks(params: {
  biologicalSex?: unknown;
  primaryHealthAreas?: unknown;
  current?: Partial<SexualHealthUnlocks>;
}): SexualHealthUnlocks {
  const areas = Array.isArray(params.primaryHealthAreas)
    ? (params.primaryHealthAreas as string[])
    : [];

  const sex = String(params.biologicalSex || '').toLowerCase();
  const fromSexMale = sex === 'male';
  const fromSexFemale = sex === 'female';
  const fromCatMale = areas.includes(MENS_SEXUAL_CATEGORY_VALUE);
  const fromCatFemale = areas.includes(WOMENS_SEXUAL_CATEGORY_VALUE);

  return {
    mens_sexual_health_unlocked: Boolean(
      params.current?.mens_sexual_health_unlocked || fromSexMale || fromCatMale
    ),
    womens_sexual_health_unlocked: Boolean(
      params.current?.womens_sexual_health_unlocked || fromSexFemale || fromCatFemale
    ),
  };
}

export function unlocksFromPersonalAndCategories(
  personalInfo: QuestionnaireData,
  categories: QuestionnaireData,
  current?: Partial<SexualHealthUnlocks>
): SexualHealthUnlocks {
  return deriveSexualHealthUnlocks({
    biologicalSex: personalInfo.biological_sex,
    primaryHealthAreas: categories.primary_health_areas,
    current,
  });
}

/** Catalog category ids that unlock sexual-health questionnaires. */
export function unlocksFromCatalogSelection(
  selectedCategoryIds: Iterable<string>,
  current?: Partial<SexualHealthUnlocks>
): SexualHealthUnlocks {
  const set = new Set(selectedCategoryIds);
  return {
    mens_sexual_health_unlocked: Boolean(
      current?.mens_sexual_health_unlocked || set.has('mens-sexual-health')
    ),
    womens_sexual_health_unlocked: Boolean(
      current?.womens_sexual_health_unlocked || set.has('womens-sexual-health')
    ),
  };
}
