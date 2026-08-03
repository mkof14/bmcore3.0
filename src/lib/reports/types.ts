import type { PersonalContext, PersonalContextReportSnapshot } from '../personalContext';

export type ReportType = 'general' | 'thematic' | 'dynamic' | 'device_enhanced';

export type ReportDetailLevel = 'short' | 'standard' | 'extended';
export type ReportToneStyle = 'analytical' | 'supportive' | 'coaching';
export type ReportVisualizationMode = 'text_first' | 'chart_first' | 'mixed';
export type ReportInsightFocus = 'lifestyle' | 'risk_awareness' | 'performance';
export type ReportInterpretationPriority =
  | 'preventive_first'
  | 'physiological_first'
  | 'behavioral_first';
export type ReportAutoRefreshFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'manual';

export type ReportSettings = {
  detail_level: ReportDetailLevel;
  tone_style: ReportToneStyle;
  visualization_mode: ReportVisualizationMode;
  insight_focus: ReportInsightFocus;
  advanced_mode_enabled: boolean;
  advanced_mode_unlocked: boolean;
  interpretation_priority: ReportInterpretationPriority;
  auto_refresh_frequency: ReportAutoRefreshFrequency;
  second_opinion_default: boolean;
  save_to_history: boolean;
  allow_caregiver_view: boolean;
};

export type ReportRecommendation = {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
};

/** Structured personalized report body produced by the template engine. */
export type BuiltReportContent = {
  report_title: string;
  report_type: ReportType;
  topic: string | null;
  summary: string;
  insights: string[];
  analysis: string;
  recommendations: ReportRecommendation[];
  second_opinion_a: string | null;
  second_opinion_b: string | null;
  sections: {
    summary: string;
    profile: string;
    focusAreas: string[];
    recommendations: ReportRecommendation[];
    nextSteps: string[];
    healthGuidePrompt: string;
  };
  settingsApplied: Pick<
    ReportSettings,
    | 'detail_level'
    | 'tone_style'
    | 'insight_focus'
    | 'interpretation_priority'
    | 'second_opinion_default'
    | 'visualization_mode'
  >;
};

export type GenerateReportInput = {
  userId: string;
  reportType: ReportType;
  topic?: string | null;
  serviceName?: string | null;
  categoryId?: string | null;
  userQuestion?: string | null;
  /** When true, skip readiness / linkage gate (admin insert). */
  skipGate?: boolean;
  /** Override settings instead of loading from DB. */
  settingsOverride?: Partial<ReportSettings>;
  t: (key: string, options?: Record<string, unknown>) => string;
};

export type GenerateReportResult = {
  ok: boolean;
  gated?: boolean;
  error?: string;
  reportId?: string;
  content?: BuiltReportContent;
  context?: PersonalContext;
  snapshot?: PersonalContextReportSnapshot;
};
