import { supabase } from '../supabase';
import { invalidatePersonalContextCache } from './cache';
import { buildPersonalContext, toReportSnapshot } from './buildPersonalContext';
import type { PersonalContext, PersonalContextReportSnapshot } from './types';
import { PERSONAL_CONTEXT_VERSION } from './types';

type AttachedReportSettings = {
  detail_level?: string;
  tone_style?: string;
  insight_focus?: string;
  interpretation_priority?: string;
  second_opinion_default?: boolean;
  visualization_mode?: string;
};

export type PersonalizedReportInsert = {
  user_id: string;
  report_type: 'general' | 'thematic' | 'dynamic' | 'device_enhanced';
  topic: string | null;
  summary: string;
  insights: string[];
  analysis: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
  device_data?: Record<string, unknown> | null;
  second_opinion_a?: string | null;
  second_opinion_b?: string | null;
  status?: string;
  report_title?: string;
};

export type CreatePersonalizedReportOptions = {
  alreadyPersonalized?: boolean;
  settings?: AttachedReportSettings | null;
  sections?: Record<string, unknown> | null;
};

/**
 * Builds personal context, attaches snapshot fields, and inserts into health_reports
 * (mock localStorage or live Supabase). Falls back to metadata-only when snapshot columns are rejected.
 */
export async function createPersonalizedReport(
  userId: string,
  draft: PersonalizedReportInsert,
  options?: CreatePersonalizedReportOptions,
): Promise<{
  ok: boolean;
  error?: string;
  context: PersonalContext;
  snapshot: PersonalContextReportSnapshot;
  reportId?: string;
}> {
  const context = await buildPersonalContext(userId, { forceRefresh: true });
  const snapshot = toReportSnapshot(context);
  const alreadyPersonalized = Boolean(options?.alreadyPersonalized);

  const summary = alreadyPersonalized
    ? draft.summary
    : context.completeness.readyForPersonalizedAnalysis
      ? `${draft.summary}\n\n${context.contextBlurb}`
      : draft.summary;

  const analysis = alreadyPersonalized
    ? draft.analysis
    : `${draft.analysis}\n\n${context.aiPayload.systemPreface}`;

  const metadata = {
    personal_context_snapshot: snapshot,
    personal_context_version: PERSONAL_CONTEXT_VERSION,
    ai_payload_preface: context.aiPayload.systemPreface,
    report_settings: options?.settings
      ? {
          detail_level: options.settings.detail_level,
          tone_style: options.settings.tone_style,
          insight_focus: options.settings.insight_focus,
          interpretation_priority: options.settings.interpretation_priority,
          second_opinion_default: options.settings.second_opinion_default,
          visualization_mode: options.settings.visualization_mode,
        }
      : null,
    report_sections: options?.sections || null,
  };

  const row = {
    ...draft,
    user_id: userId,
    summary,
    analysis,
    personal_context_snapshot: snapshot,
    personal_context_version: PERSONAL_CONTEXT_VERSION,
    metadata,
    status: draft.status || 'completed',
    report_title: draft.report_title || draft.topic || draft.report_type,
  };

  const { data, error } = await supabase.from('health_reports').insert(row).select().maybeSingle();

  if (error) {
    const fallback = {
      ...draft,
      user_id: userId,
      summary,
      analysis,
      metadata,
      status: draft.status || 'completed',
      report_title: draft.report_title || draft.topic || draft.report_type,
    };
    const retry = await supabase.from('health_reports').insert(fallback).select().maybeSingle();
    if (retry.error) {
      return { ok: false, error: retry.error.message, context, snapshot };
    }
    invalidatePersonalContextCache(userId);
    const retryRow = Array.isArray(retry.data) ? retry.data[0] : retry.data;
    return {
      ok: true,
      context,
      snapshot,
      reportId: (retryRow as { id?: string } | null)?.id,
    };
  }

  invalidatePersonalContextCache(userId);
  const inserted = Array.isArray(data) ? data[0] : data;
  return {
    ok: true,
    context,
    snapshot,
    reportId: (inserted as { id?: string } | null)?.id,
  };
}
