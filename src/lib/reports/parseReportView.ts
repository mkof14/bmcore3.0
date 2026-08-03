import type { HealthReport } from '../../types/database';
import type { ReportRecommendation } from './types';

export type ReportViewMetrics = {
  readiness: number | null;
  questionnaire: number | null;
  profile: number | null;
  linkage: string | null;
};

export type ParsedReportView = {
  summary: string;
  profile: string | null;
  analysis: string;
  focusAreas: string[];
  nextSteps: string[];
  healthGuidePrompt: string | null;
  insights: string[];
  recommendations: ReportRecommendation[];
  metrics: ReportViewMetrics;
};

type Translate = (key: string, options?: Record<string, unknown>) => string;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function extractNumber(...candidates: unknown[]): number | null {
  for (const value of candidates) {
    if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
      return Math.round(Number(value));
    }
  }
  return null;
}

function splitByHeading(text: string, heading: string): { before: string; after: string | null } {
  const idx = text.indexOf(heading);
  if (idx < 0) return { before: text.trim(), after: null };
  return {
    before: text.slice(0, idx).trim(),
    after: text.slice(idx + heading.length).trim(),
  };
}

function extractNumberedBlock(text: string, heading: string, nextHeadings: string[]): string[] {
  const start = text.indexOf(heading);
  if (start < 0) return [];
  let rest = text.slice(start + heading.length);
  for (const next of nextHeadings) {
    const at = rest.indexOf(next);
    if (at >= 0) rest = rest.slice(0, at);
  }
  return rest
    .split('\n')
    .map((line) => line.replace(/^\s*\d+\.\s*/, '').trim())
    .filter(Boolean);
}

function extractPromptBlock(text: string, heading: string): string | null {
  const start = text.indexOf(heading);
  if (start < 0) return null;
  let rest = text.slice(start + heading.length).trim();
  const stopMarkers = ['Perspective A', 'Perspective B', 'Educational wellness'];
  for (const marker of stopMarkers) {
    const at = rest.indexOf(marker);
    if (at >= 0) rest = rest.slice(0, at).trim();
  }
  return rest || null;
}

function extractPercentFromText(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const n = Number(match[1]);
      if (Number.isFinite(n)) return Math.round(n);
    }
  }
  return null;
}

function readMetrics(report: HealthReport): ReportViewMetrics {
  const snapshot =
    asRecord(report.personal_context_snapshot) ||
    asRecord(asRecord(report.metadata)?.personal_context_snapshot);
  const completeness = asRecord(snapshot?.completeness);
  const haystack = `${report.summary || ''}\n${report.analysis || ''}`;

  return {
    readiness: extractNumber(
      snapshot?.completenessScore,
      completeness?.score,
      asRecord(report.metadata)?.readiness,
      extractPercentFromText(haystack, [
        /readiness\s+(\d+)\s*%/i,
        /overall readiness\s+(\d+)\s*%/i,
      ]),
    ),
    questionnaire: extractNumber(
      snapshot?.questionnairePercent,
      completeness?.questionnairePercent,
      extractPercentFromText(haystack, [
        /questionnaire\s+(\d+)\s*%/i,
        /questionnaire\s+(\d+)\s*%\s*complete/i,
      ]),
    ),
    profile: extractNumber(
      snapshot?.profilePercent,
      completeness?.profilePercent,
      extractPercentFromText(haystack, [/profile\s+(\d+)\s*%/i]),
    ),
    linkage:
      (typeof snapshot?.linkageHealth === 'string' && snapshot.linkageHealth) ||
      (typeof completeness?.linkageHealth === 'string' && completeness.linkageHealth) ||
      (/linkage[^\n]*strong/i.test(haystack) ? 'green' : null) ||
      (/linkage[^\n]*partial/i.test(haystack) ? 'yellow' : null) ||
      (/linkage[^\n]*limited/i.test(haystack) ? 'red' : null),
  };
}

function readStructuredSections(report: HealthReport) {
  const meta = asRecord(report.metadata);
  return asRecord(meta?.report_sections);
}

/** Normalize a stored health report into structured view sections for the visual viewer. */
export function parseReportView(report: HealthReport, t: Translate): ParsedReportView {
  const profileHeading = t('reportTemplate.section.profile');
  const focusHeading = t('reportTemplate.section.focusAreas');
  const nextHeading = t('reportTemplate.section.nextSteps');
  const promptHeading = t('reportTemplate.section.healthGuidePrompt');

  const structured = readStructuredSections(report);
  const summaryRaw = String(report.summary || '');
  const analysisRaw = String(report.analysis || '');

  let summary = summaryRaw;
  let profile: string | null = null;
  if (structured && typeof structured.summary === 'string') {
    summary = structured.summary;
  }
  if (structured && typeof structured.profile === 'string') {
    profile = structured.profile;
  } else {
    const split = splitByHeading(summaryRaw, profileHeading);
    if (split.after) {
      summary = split.before;
      profile = split.after;
    }
  }

  let analysis = analysisRaw;
  let focusAreas = asStringArray(structured?.focusAreas);
  let nextSteps = asStringArray(structured?.nextSteps);
  let healthGuidePrompt =
    typeof structured?.healthGuidePrompt === 'string' ? structured.healthGuidePrompt : null;

  if (!focusAreas.length || !nextSteps.length || !healthGuidePrompt) {
    const focusFromText = extractNumberedBlock(analysisRaw, focusHeading, [
      nextHeading,
      promptHeading,
    ]);
    const nextFromText = extractNumberedBlock(analysisRaw, nextHeading, [promptHeading]);
    const promptFromText = extractPromptBlock(analysisRaw, promptHeading);

    if (!focusAreas.length) focusAreas = focusFromText;
    if (!nextSteps.length) nextSteps = nextFromText;
    if (!healthGuidePrompt) healthGuidePrompt = promptFromText;

    const focusSplit = splitByHeading(analysisRaw, focusHeading);
    analysis = focusSplit.before || analysisRaw;
  } else {
    const focusSplit = splitByHeading(analysisRaw, focusHeading);
    analysis = focusSplit.before || analysisRaw;
  }

  const recommendations = (Array.isArray(report.recommendations) ? report.recommendations : [])
    .map((rec) => {
      if (typeof rec === 'string') {
        return { title: rec, description: '', priority: 'medium' as const };
      }
      if (rec && typeof rec === 'object') {
        return {
          title: 'title' in rec && rec.title ? String(rec.title) : String(rec),
          description:
            'description' in rec && rec.description ? String(rec.description) : '',
          priority:
            'priority' in rec &&
            (rec.priority === 'high' || rec.priority === 'medium' || rec.priority === 'low')
              ? rec.priority
              : ('medium' as const),
        };
      }
      return null;
    })
    .filter((rec): rec is ReportRecommendation => Boolean(rec));

  return {
    summary,
    profile,
    analysis,
    focusAreas,
    nextSteps,
    healthGuidePrompt,
    insights: Array.isArray(report.insights)
      ? report.insights.filter((item): item is string => typeof item === 'string')
      : [],
    recommendations,
    metrics: readMetrics(report),
  };
}
