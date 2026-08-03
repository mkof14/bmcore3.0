import {
  buildPersonalContext,
  createPersonalizedReport,
  toReportSnapshot,
} from '../personalContext';
import { buildReportTemplate, canGeneratePersonalizedReport } from './buildReportTemplate';
import { DEFAULT_REPORT_SETTINGS } from './defaults';
import { loadReportSettings } from './loadReportSettings';
import type { GenerateReportInput, GenerateReportResult, ReportSettings } from './types';

function mergeSettings(
  base: ReportSettings,
  override?: Partial<ReportSettings>,
): ReportSettings {
  return { ...base, ...(override || {}) };
}

/**
 * Unified personalized report generation used by My Reports, Reports page,
 * Service workspace, and Admin Inspector insert.
 */
export async function generatePersonalizedReport(
  input: GenerateReportInput,
): Promise<GenerateReportResult> {
  const context = await buildPersonalContext(input.userId, { forceRefresh: true });
  const snapshot = toReportSnapshot(context);

  if (!input.skipGate && !canGeneratePersonalizedReport(context)) {
    return {
      ok: false,
      gated: true,
      error: 'gated',
      context,
      snapshot,
    };
  }

  const stored = await loadReportSettings(input.userId);
  const settings = mergeSettings(stored, input.settingsOverride);

  const content = buildReportTemplate({
    context,
    settings,
    reportType: input.reportType,
    topic: input.topic,
    serviceName: input.serviceName,
    categoryId: input.categoryId,
    userQuestion: input.userQuestion,
    t: input.t,
  });

  const result = await createPersonalizedReport(
    input.userId,
    {
      user_id: input.userId,
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
    },
    {
      alreadyPersonalized: true,
      settings,
      sections: content.sections,
    },
  );

  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      content,
      context: result.context,
      snapshot: result.snapshot,
    };
  }

  return {
    ok: true,
    reportId: result.reportId,
    content,
    context: result.context,
    snapshot: result.snapshot,
  };
}

export async function previewReportTemplate(
  input: Omit<GenerateReportInput, 'skipGate'>,
): Promise<GenerateReportResult> {
  const context = await buildPersonalContext(input.userId, { forceRefresh: true });
  const snapshot = toReportSnapshot(context);
  const settings = mergeSettings(
    await loadReportSettings(input.userId),
    input.settingsOverride || DEFAULT_REPORT_SETTINGS,
  );
  const content = buildReportTemplate({
    context,
    settings,
    reportType: input.reportType,
    topic: input.topic,
    serviceName: input.serviceName,
    categoryId: input.categoryId,
    userQuestion: input.userQuestion,
    t: input.t,
  });
  return { ok: true, content, context, snapshot };
}
