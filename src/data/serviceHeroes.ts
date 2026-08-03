/**
 * Category / service heroes — local assets only.
 * External Pexels URLs are blocked (403) and previously made every card look broken/identical.
 * Each category maps to a distinct on-theme WebP photo.
 */

/** One primary hero per category — used by catalog cards and category detail. */
export const CATEGORY_HERO: Record<string, string> = {
  'human-data-model': '/hero/categories/human-data-model.webp',
  'critical-health': '/hero/img_01.webp',
  'everyday-wellness': '/hero/img_03.webp',
  longevity: '/hero/categories/longevity.webp',
  'mental-wellness': '/hero/img_04.webp',
  'fitness-performance': '/hero/img_05.webp',
  'womens-health': '/hero/img_17.webp',
  'mens-health': '/hero/img_07.webp',
  'beauty-skincare': '/hero/img_08.webp',
  'nutrition-diet': '/hero/img_09.webp',
  'sleep-recovery': '/hero/img_14.webp',
  'environmental-health': '/hero/img_10.webp',
  'family-health': '/hero/img_12.webp',
  'preventive-medicine': '/hero/categories/preventive-medicine.webp',
  biohacking: '/hero/categories/biohacking.webp',
  'senior-care': '/hero/img_13.webp',
  'eye-health': '/hero/categories/eye-health.webp',
  'digital-therapeutics': '/hero/img_02.webp',
  'general-sexual': '/hero/categories/general-sexual.webp',
  'mens-sexual-health': '/hero/categories/mens-sexual-health.webp',
  'womens-sexual-health': '/hero/categories/womens-sexual-health.webp',
};

/**
 * Optional secondary locals for service-level variety (same category stays on-theme).
 * First entry must match CATEGORY_HERO.
 */
const CATEGORY_HERO_POOL: Record<string, string[]> = {
  'human-data-model': ['/hero/categories/human-data-model.webp', '/hdm-human.webp'],
  'critical-health': ['/hero/img_01.webp', '/hero/categories/preventive-medicine.webp'],
  'everyday-wellness': ['/hero/img_03.webp', '/hero/img_16.webp'],
  longevity: ['/hero/categories/longevity.webp', '/home/life-mid.webp'],
  'mental-wellness': ['/hero/img_04.webp', '/hero/img_14.webp'],
  'fitness-performance': ['/hero/img_05.webp', '/hero/img_03.webp'],
  'womens-health': ['/hero/img_17.webp', '/hero/img_08.webp'],
  'mens-health': ['/hero/img_07.webp', '/home/life-young.webp'],
  'beauty-skincare': ['/hero/img_08.webp', '/hero/img_16.webp'],
  'nutrition-diet': ['/hero/img_09.webp', '/hero/img_10.webp'],
  'sleep-recovery': ['/hero/img_14.webp', '/hero/img_11.webp'],
  'environmental-health': ['/hero/img_10.webp', '/hero/img_11.webp'],
  'family-health': ['/hero/img_12.webp', '/hero/img_02.webp'],
  'preventive-medicine': ['/hero/categories/preventive-medicine.webp', '/hero/img_01.webp'],
  biohacking: ['/hero/categories/biohacking.webp', '/home/life-mid.webp'],
  'senior-care': ['/hero/img_13.webp', '/hero/categories/longevity.webp'],
  'eye-health': ['/hero/categories/eye-health.webp'],
  'digital-therapeutics': ['/hero/img_02.webp', '/hero/categories/human-data-model.webp'],
  'general-sexual': ['/hero/categories/general-sexual.webp'],
  'mens-sexual-health': ['/hero/categories/mens-sexual-health.webp'],
  'womens-sexual-health': ['/hero/categories/womens-sexual-health.webp'],
};

const FALLBACK_HERO = CATEGORY_HERO['everyday-wellness'];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function poolFor(categoryId: string): string[] {
  return CATEGORY_HERO_POOL[categoryId] ?? [CATEGORY_HERO[categoryId] ?? FALLBACK_HERO];
}

/** Deterministic light hero for any service — scales without unique assets per service. */
export function serviceHeroUrl(categoryId: string, serviceId: string): string {
  const pool = poolFor(categoryId);
  return pool[hashId(serviceId) % pool.length];
}

/** Category card / detail hero — primary image for the category. */
export function categoryHeroUrl(categoryId: string): string {
  return CATEGORY_HERO[categoryId] ?? FALLBACK_HERO;
}

export function servicePublicHighlights(serviceName: string): string[] {
  return [
    `Understand what ${serviceName} covers and why it matters`,
    'See how it connects to your broader Human Data Model',
    'Use questions, multi-model reports, and dialogs after sign-in',
  ];
}

export function servicePublicSteps(serviceName: string): Array<{ title: string; body: string }> {
  return [
    {
      title: 'Explore the overview',
      body: `Learn the purpose of ${serviceName} and the kind of insights it is designed to surface.`,
    },
    {
      title: 'Sign in to continue',
      body: 'Open the full interactive workspace for this service with an active plan.',
    },
    {
      title: 'Generate your report',
      body: 'Ask questions, run multi-model analysis, and save reports in your private workspace.',
    },
  ];
}
