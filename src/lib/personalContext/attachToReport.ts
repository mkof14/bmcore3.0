import { supabase } from '../supabase';
import { invalidatePersonalContextCache } from './cache';
import { buildPersonalContext, toReportSnapshot } from './buildPersonalContext';
import type { PersonalContext, PersonalContextReportSnapshot } from './types';
import { PERSONAL_CONTEXT_VERSION } from './types';

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

/**
 * Builds personal context, injects it into report content / snapshot fields,
 * and inserts into health_reports (works in mock mode via localStorage).
 */
export async function createPersonalizedReport(
  userId: string,
  draft: PersonalizedReportInsert,
): Promise<{
  ok: boolean;
  error?: string;
  context: PersonalContext;
  snapshot: PersonalContextReportSnapshot;
  reportId?: string;
}> {
  const context = await buildPersonalContext(userId, { forceRefresh: true });
  const snapshot = toReportSnapshot(context);

  const personalizedSummary = context.completeness.readyForPersonalizedAnalysis
    ? `${draft.summary}\n\n[Personal context · ${context.completeness.score}% · ${context.contextBlurb}]`
    : `${draft.summary}\n\n[Personal context incomplete · ${context.completeness.score}% — complete questionnaires for fuller personalization.]`;

  const row = {
    ...draft,
    user_id: userId,
    summary: personalizedSummary,
    analysis: `${draft.analysis}\n\n${context.aiPayload.systemPreface}`,
    personal_context_snapshot: snapshot,
    personal_context_version: PERSONAL_CONTEXT_VERSION,
    metadata: {
      personal_context_snapshot: snapshot,
      personal_context_version: PERSONAL_CONTEXT_VERSION,
      ai_payload_preface: context.aiPayload.systemPreface,
    },
    status: draft.status || 'completed',
    report_title: draft.report_title || draft.topic || draft.report_type,
  };

  const { data, error } = await supabase.from('health_reports').insert(row);

  if (error) {
    // Fallback: some environments may reject unknown columns — retry with metadata only.
    const fallback = {
      ...draft,
      user_id: userId,
      summary: personalizedSummary,
      analysis: `${draft.analysis}\n\n${context.aiPayload.systemPreface}`,
      metadata: {
        personal_context_snapshot: snapshot,
        personal_context_version: PERSONAL_CONTEXT_VERSION,
        ai_payload_preface: context.aiPayload.systemPreface,
      },
      status: draft.status || 'completed',
      report_title: draft.report_title || draft.topic || draft.report_type,
    };
    const retry = await supabase.from('health_reports').insert(fallback);
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
