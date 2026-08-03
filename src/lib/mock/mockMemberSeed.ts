import { supabase, isSupabaseMock } from '../supabase';
import {
  buildReportTemplate,
  canGeneratePersonalizedReport,
  DEFAULT_REPORT_SETTINGS,
  generatePersonalizedReport,
} from '../reports';
import { buildPersonalContext, invalidatePersonalContextCache } from '../personalContext';
import { buildMockQuestionnaireRow } from './mockQuestionnaireSeed';
import { SAMPLE_REPORT_ID } from '../reports/sampleReportOffline';

export { buildMockQuestionnaireRow };
export {
  createOfflineSamplePersonalContext,
  buildOfflineSampleReport,
  formatOfflineSampleReportText,
  SAMPLE_REPORT_ID,
} from '../reports/sampleReportOffline';

export async function ensureMockQuestionnaire(userId: string): Promise<boolean> {
  if (!isSupabaseMock) return false;

  const { data } = await supabase
    .from('questionnaire_responses')
    .select('user_id, lifestyle, personal_info')
    .eq('user_id', userId)
    .maybeSingle();

  const row = data as Record<string, unknown> | null;
  const lifestyle = (row?.lifestyle || {}) as Record<string, unknown>;
  const personal = (row?.personal_info || {}) as Record<string, unknown>;
  if (row && lifestyle.sleep_duration && personal.full_name) {
    return true;
  }

  const payload = buildMockQuestionnaireRow(userId);
  const { error } = await supabase.from('questionnaire_responses').upsert(payload);
  if (error) return false;
  invalidatePersonalContextCache(userId);
  return true;
}

export async function ensureMockDevices(userId: string): Promise<void> {
  if (!isSupabaseMock) return;
  const { data } = await supabase.from('user_devices').select('id').eq('user_id', userId);
  const rows = Array.isArray(data) ? data : data ? [data] : [];
  if (rows.length > 0) return;

  await supabase.from('user_devices').insert({
    user_id: userId,
    brand: 'Apple',
    device_name: 'Apple Watch',
    status: 'active',
  });
  invalidatePersonalContextCache(userId);
}

type Translate = (key: string, options?: Record<string, unknown>) => string;

/**
 * For mock/superadmin: ensure at least one completed personalized report exists
 * so My Reports is never an empty first experience.
 */
export async function ensureMockSampleReport(
  userId: string,
  t: Translate,
): Promise<{ created: boolean; reportId?: string }> {
  if (!isSupabaseMock) return { created: false };

  await ensureMockQuestionnaire(userId);
  await ensureMockDevices(userId);

  const { data } = await supabase
    .from('health_reports')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const existing = Array.isArray(data) ? data : data ? [data] : [];
  if (existing.length > 0) {
    return { created: false, reportId: (existing[0] as { id?: string }).id };
  }

  const ctx = await buildPersonalContext(userId, { forceRefresh: true });
  if (!canGeneratePersonalizedReport(ctx)) {
    const content = buildReportTemplate({
      context: ctx,
      settings: DEFAULT_REPORT_SETTINGS,
      reportType: 'general',
      t,
    });
    const { data: inserted, error } = await supabase
      .from('health_reports')
      .insert({
        id: SAMPLE_REPORT_ID,
        user_id: userId,
        report_type: content.report_type,
        topic: content.topic,
        report_title: content.report_title,
        summary: content.summary,
        insights: content.insights,
        analysis: content.analysis,
        recommendations: content.recommendations,
        second_opinion_a: content.second_opinion_a,
        second_opinion_b: content.second_opinion_b,
        status: 'completed',
        device_data: null,
      })
      .select()
      .maybeSingle();
    if (error) return { created: false };
    const row = Array.isArray(inserted) ? inserted[0] : inserted;
    return { created: true, reportId: (row as { id?: string } | null)?.id || SAMPLE_REPORT_ID };
  }

  const result = await generatePersonalizedReport({
    userId,
    reportType: 'general',
    t,
  });
  return { created: Boolean(result.ok), reportId: result.reportId };
}
