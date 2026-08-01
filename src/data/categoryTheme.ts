/**
 * Category accent colors — match Services Catalog / member catalog (Tailwind *-400).
 * Single source for HDM cubes, CategoryScreen, and any hex-based UI.
 */
export const CATEGORY_ACCENT: Record<string, string> = {
  'human-data-model': '#64748B', // slate-500 — shared HDM tools (not a medical category cube)
  'critical-health': '#FB923C', // orange-400
  'everyday-wellness': '#4ADE80', // green-400
  longevity: '#F472B6', // pink-400
  'mental-wellness': '#22D3EE', // cyan-400
  'fitness-performance': '#FACC15', // yellow-400
  'womens-health': '#F472B6', // pink-400
  'mens-health': '#60A5FA', // blue-400
  'beauty-skincare': '#F9A8D4', // pink-300/400
  'nutrition-diet': '#4ADE80', // green-400
  'sleep-recovery': '#A78BFA', // purple-400
  'environmental-health': '#2DD4BF', // teal-400
  'family-health': '#FB923C', // orange-400
  'preventive-medicine': '#22D3EE', // cyan-400
  biohacking: '#60A5FA', // blue-400
  'senior-care': '#92400E', // amber-800 / brown — readable on light & dark HDM backgrounds
  'eye-health': '#60A5FA', // blue-400
  'digital-therapeutics': '#C084FC', // purple-400
  'general-sexual': '#F87171', // red-400
  'mens-sexual-health': '#60A5FA', // blue-400
  'womens-sexual-health': '#F472B6', // pink-400
};

export function categoryAccent(id: string): string {
  return CATEGORY_ACCENT[id] ?? '#94A3B8';
}
