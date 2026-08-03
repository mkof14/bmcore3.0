import { useTranslation } from 'react-i18next';
import { Download, Printer, Share2, X } from 'lucide-react';
import type { HealthReport } from '../../types/database';
import {
  downloadReportTxt,
  formatReportAsText,
  printReport,
} from '../../lib/reports';
import '../../styles/report-print.css';

type Props = {
  report: HealthReport & { report_title?: string | null };
  onClose: () => void;
  onShare?: () => void;
  sharing?: boolean;
};

export default function ReportViewer({ report, onClose, onShare, sharing }: Props) {
  const { t, i18n } = useTranslation();
  const title =
    report.report_title ||
    report.topic ||
    t(`reportTemplate.typeLabel.${report.report_type}`, {
      defaultValue: t('reportTemplate.fallbackTitle'),
    });

  const insights = Array.isArray(report.insights) ? report.insights : [];
  const recommendations = Array.isArray(report.recommendations)
    ? report.recommendations
    : [];

  const handleDownloadTxt = () => {
    const text = formatReportAsText(report, t);
    const safe = String(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
    downloadReportTxt(safe || 'wellness-report', text);
  };

  return (
    <div className="report-viewer-overlay" role="dialog" aria-modal="true">
      <div className="report-viewer-panel">
        <div className="report-viewer-toolbar no-print">
          <h2 className="text-sm font-semibold text-slate-800">
            {t('member.reports.viewTitle')}
          </h2>
          <div className="report-viewer-toolbar-actions">
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              {t('member.reports.downloadTxt')}
            </button>
            <button
              type="button"
              onClick={() => printReport()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Printer className="h-3.5 w-3.5" />
              {t('member.reports.printPdf')}
            </button>
            {onShare ? (
              <button
                type="button"
                onClick={onShare}
                disabled={sharing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <Share2 className="h-3.5 w-3.5" />
                {t('member.reports.share')}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
              {t('member.reports.close')}
            </button>
          </div>
        </div>

        <div className="report-viewer-body">
          <article className="report-print report-print-root">
            <h1>{title}</h1>
            <div className="report-meta">
              <span>
                {t('reportTemplate.meta.type')}:{' '}
                {t(`reportTemplate.typeLabel.${report.report_type}`, {
                  defaultValue: report.report_type,
                })}
              </span>
              {report.created_at ? (
                <span>
                  {t('reportTemplate.meta.generated')}:{' '}
                  {new Date(report.created_at).toLocaleString(i18n.language)}
                </span>
              ) : null}
              {report.id ? (
                <span>
                  {t('reportTemplate.meta.id')}: {report.id}
                </span>
              ) : null}
            </div>

            {report.summary ? (
              <section>
                <h2>{t('reportTemplate.section.summary')}</h2>
                <p>{report.summary}</p>
              </section>
            ) : null}

            {insights.length ? (
              <section>
                <h2>{t('reportTemplate.section.insights')}</h2>
                <ul>
                  {insights.map((item, idx) => (
                    <li key={`insight-${idx}`}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {report.analysis ? (
              <section>
                <h2>{t('reportTemplate.section.analysis')}</h2>
                <p>{report.analysis}</p>
              </section>
            ) : null}

            {recommendations.length ? (
              <section>
                <h2>{t('reportTemplate.section.recommendations')}</h2>
                {recommendations.map((rec, idx) => (
                  <div className="report-rec" key={`rec-${idx}`}>
                    <strong>
                      {typeof rec === 'object' && rec && 'title' in rec
                        ? rec.title
                        : String(rec)}
                    </strong>
                    {typeof rec === 'object' && rec && 'description' in rec ? (
                      <p>{rec.description}</p>
                    ) : null}
                  </div>
                ))}
              </section>
            ) : null}

            {report.second_opinion_a ? (
              <section>
                <h2>{t('reportTemplate.section.secondOpinionA')}</h2>
                <p>{report.second_opinion_a}</p>
              </section>
            ) : null}

            {report.second_opinion_b ? (
              <section>
                <h2>{t('reportTemplate.section.secondOpinionB')}</h2>
                <p>{report.second_opinion_b}</p>
              </section>
            ) : null}

            {!report.summary && !report.analysis && !insights.length ? (
              <p>{t('member.reports.noBody')}</p>
            ) : null}

            <p className="report-footer">{t('reportTemplate.footer')}</p>
          </article>
        </div>
      </div>
    </div>
  );
}
