import type { ReportSettings } from './types';

export const DEFAULT_REPORT_SETTINGS: ReportSettings = {
  detail_level: 'standard',
  tone_style: 'supportive',
  visualization_mode: 'mixed',
  insight_focus: 'lifestyle',
  advanced_mode_enabled: false,
  advanced_mode_unlocked: false,
  interpretation_priority: 'preventive_first',
  auto_refresh_frequency: 'weekly',
  second_opinion_default: true,
  save_to_history: true,
  allow_caregiver_view: false,
};
