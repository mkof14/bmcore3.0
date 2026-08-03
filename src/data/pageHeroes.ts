/**
 * Distinct local WebP heroes for marketing pages and Member Zone sections.
 * Assets live under /public/hero/pages/ (~80–180KB each).
 * Bump HERO_CACHE when replacing assets so browsers fetch fresh files.
 */

const HERO_CACHE = 'v5';

export const PAGE_HEROES = {
  investors: '/hero/pages/investors.webp',
  'services-catalog': '/hero/pages/services-catalog.webp',
  pricing: '/hero/pages/pricing.webp',
  about: '/hero/pages/about.webp',
  contact: '/hero/pages/contact.webp',
  learning: '/hero/pages/learning.webp',
  faq: '/hero/pages/faq.webp',
  'how-it-works': '/hero/pages/how-it-works.webp',
  'why-two-models': '/hero/pages/why-two-models.webp',
  dashboard: '/hero/pages/dashboard.webp',
  'human-data-model': '/hero/pages/human-data-model.webp',
  'health-guide': '/hero/pages/health-guide.webp',
  devices: '/hero/pages/devices.webp',
  catalog: '/hero/pages/catalog.webp',
  questionnaires: '/hero/pages/questionnaires.webp',
  reports: '/hero/pages/reports.webp',
  'signal-hub': '/hero/pages/signal-hub.webp',
  reminders: '/hero/pages/reminders.webp',
  'second-opinion': '/hero/pages/second-opinion.webp',
  'medical-files': '/hero/pages/medical-files.webp',
  'black-box': '/hero/pages/black-box.webp',
  referral: '/hero/pages/referral.webp',
  billing: '/hero/pages/billing.webp',
  profile: '/hero/pages/profile.webp',
  settings: '/hero/pages/settings.webp',
  support: '/hero/pages/support.webp',
  system: '/hero/pages/system.webp',
} as const;

export type PageHeroKey = keyof typeof PAGE_HEROES;

export function pageHeroUrl(key: PageHeroKey): string {
  return `${PAGE_HEROES[key]}?v=${HERO_CACHE}`;
}

/** Member Zone section id → hero asset key */
export const MEMBER_SECTION_HEROES: Record<string, PageHeroKey> = {
  dashboard: 'dashboard',
  'human-data-model': 'human-data-model',
  'ai-assistant': 'health-guide',
  devices: 'devices',
  support: 'support',
  system: 'system',
  catalog: 'catalog',
  questionnaires: 'questionnaires',
  reports: 'reports',
  'signal-hub': 'signal-hub',
  reminders: 'reminders',
  'second-opinion': 'second-opinion',
  'medical-files': 'medical-files',
  'black-box': 'black-box',
  referral: 'referral',
  billing: 'billing',
  profile: 'profile',
  settings: 'settings',
};
