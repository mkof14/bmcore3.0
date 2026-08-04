import type { BuiltReportContent } from './types';
import type { HealthReport } from '../../types/database';

type Translate = (key: string, options?: Record<string, unknown>) => string;

type ReportLike = Partial<HealthReport> & {
  report_title?: string | null;
  id?: string;
  created_at?: string;
};

/** Flatten a stored or built report into printable plain text. */
export function formatReportAsText(
  report: ReportLike | BuiltReportContent,
  t: Translate,
  options?: { includeMeta?: boolean },
): string {
  const title =
    ('report_title' in report && report.report_title) ||
    ('topic' in report && report.topic) ||
    t('reportTemplate.fallbackTitle');

  const lines: string[] = [
    String(title),
    '='.repeat(Math.min(60, String(title).length + 8)),
    '',
  ];

  if (options?.includeMeta !== false) {
    if ('report_type' in report && report.report_type) {
      lines.push(
        `${t('reportTemplate.meta.type')}: ${t(`reportTemplate.typeLabel.${report.report_type}`, {
          defaultValue: report.report_type,
        })}`,
      );
    }
    if ('created_at' in report && report.created_at) {
      lines.push(`${t('reportTemplate.meta.generated')}: ${report.created_at}`);
    }
    if ('id' in report && report.id) {
      lines.push(`${t('reportTemplate.meta.id')}: ${report.id}`);
    }
    lines.push('');
  }

  if ('summary' in report && report.summary) {
    lines.push(t('reportTemplate.section.summary'), '', String(report.summary), '');
  }

  const insights = 'insights' in report && Array.isArray(report.insights) ? report.insights : [];
  if (insights.length) {
    lines.push(t('reportTemplate.section.insights'), '');
    insights.forEach((item, i) => lines.push(`${i + 1}. ${item}`));
    lines.push('');
  }

  if ('analysis' in report && report.analysis) {
    lines.push(t('reportTemplate.section.analysis'), '', String(report.analysis), '');
  }

  const recs =
    'recommendations' in report && Array.isArray(report.recommendations)
      ? report.recommendations
      : [];
  if (recs.length) {
    lines.push(t('reportTemplate.section.recommendations'), '');
    recs.forEach((rec, i) => {
      const titlePart = typeof rec === 'object' && rec && 'title' in rec ? rec.title : String(rec);
      const body =
        typeof rec === 'object' && rec && 'description' in rec ? rec.description : '';
      lines.push(`${i + 1}. ${titlePart}`);
      if (body) lines.push(`   ${body}`);
    });
    lines.push('');
  }

  if ('second_opinion_a' in report && report.second_opinion_a) {
    lines.push(t('reportTemplate.section.secondOpinionA'), '', String(report.second_opinion_a), '');
  }
  if ('second_opinion_b' in report && report.second_opinion_b) {
    lines.push(t('reportTemplate.section.secondOpinionB'), '', String(report.second_opinion_b), '');
  }

  if ('sections' in report && report.sections?.healthGuidePrompt) {
    lines.push(
      t('reportTemplate.section.healthGuidePrompt'),
      '',
      report.sections.healthGuidePrompt,
      '',
    );
  }

  lines.push(t('reportTemplate.footer'));
  lines.push('');
  lines.push(t('reportTemplate.copyright', { year: new Date().getFullYear() }));
  return lines.join('\n');
}

export function downloadReportTxt(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Trigger browser print for the active report viewer (uses report-print stylesheet). */
export function printReport(): void {
  window.print();
}

/** Copy plain-text report body to the clipboard. */
export async function copyReportText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.left = '-9999px';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * Share report via Web Share API when available; otherwise copy text to clipboard.
 * Returns 'shared' | 'copied' | 'aborted' | 'failed'.
 */
export async function shareReportContent(input: {
  title: string;
  text: string;
  url?: string;
}): Promise<'shared' | 'copied' | 'aborted' | 'failed'> {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({
        title: input.title,
        text: input.text,
        ...(input.url ? { url: input.url } : {}),
      });
      return 'shared';
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'aborted';
    }
  }

  const ok = await copyReportText(input.url ? `${input.text}\n\n${input.url}` : input.text);
  return ok ? 'copied' : 'failed';
}
