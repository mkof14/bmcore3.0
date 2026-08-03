import { useTranslation } from 'react-i18next';
import { Download, Printer, Share2, X } from 'lucide-react';
import type { HealthReport } from '../../types/database';
import {
  downloadReportTxt,
  formatReportAsText,
  printReport,
} from '../../lib/reports';
import { parseReportView } from '../../lib/reports/parseReportView';
import '../../styles/report-print.css';

type Props = {
  report: HealthReport & { report_title?: string | null };
  onClose: () => void;
  onShare?: () => void;
  sharing?: boolean;
};

function MetricBar({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: 'default' | 'ok';
}) {
  const numeric = Number(String(value).replace('%', ''));
  const width = Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : null;
  return (
    <div className="report-metric">
      <p className="report-metric-label">{label}</p>
      <p
        className="report-metric-value"
        style={tone === 'ok' ? { color: '#15803d', fontSize: '1.2rem' } : undefined}
      >
        {value}
      </p>
      {note ? <p className="report-metric-note">{note}</p> : null}
      {width != null ? (
        <div className="report-bar" aria-hidden="true">
          <span
            style={{
              width: `${width}%`,
              background:
                tone === 'ok'
                  ? 'linear-gradient(90deg,#4ade80,#15803d)'
                  : undefined,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default function ReportViewer({ report, onClose, onShare, sharing }: Props) {
  const { t, i18n } = useTranslation();
  const title =
    report.report_title ||
    report.topic ||
    t(`reportTemplate.typeLabel.${report.report_type}`, {
      defaultValue: t('reportTemplate.fallbackTitle'),
    });

  const view = parseReportView(report, t);
  const hasBody =
    Boolean(view.summary) ||
    Boolean(view.analysis) ||
    view.insights.length > 0 ||
    view.recommendations.length > 0;

  const linkageLabel =
    view.metrics.linkage === 'green'
      ? t('reportTemplate.linkage.green')
      : view.metrics.linkage === 'yellow'
        ? t('reportTemplate.linkage.yellow')
        : view.metrics.linkage === 'red'
          ? t('reportTemplate.linkage.red')
          : view.metrics.linkage;

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
            <header className="report-cover">
              <div className="report-cover-brand">
                <img src="/logo-header.png" alt="BioMath Core" />
                <div>
                  <strong>BioMath Core</strong>
                  <span>{title}</span>
                </div>
              </div>
              <div className="report-cover-meta">
                <div>
                  <strong>{t('reportTemplate.meta.type')}</strong>
                  <br />
                  {t(`reportTemplate.typeLabel.${report.report_type}`, {
                    defaultValue: report.report_type,
                  })}
                </div>
                {report.created_at ? (
                  <div style={{ marginTop: '0.45rem' }}>
                    <strong>{t('reportTemplate.meta.generated')}</strong>
                    <br />
                    {new Date(report.created_at).toLocaleString(i18n.language)}
                  </div>
                ) : null}
                {report.id ? (
                  <div style={{ marginTop: '0.45rem' }}>
                    <strong>{t('reportTemplate.meta.id')}</strong>
                    <br />
                    {report.id}
                  </div>
                ) : null}
              </div>
              <h1>{title}</h1>
              {view.summary ? (
                <p className="report-cover-lead">
                  {view.summary.split('\n').filter(Boolean)[0]}
                </p>
              ) : null}
            </header>

            {view.metrics.readiness != null ||
            view.metrics.questionnaire != null ||
            linkageLabel ? (
              <div className="report-metrics">
                {view.metrics.readiness != null ? (
                  <MetricBar
                    label={t('member.reports.metricReadiness')}
                    value={`${view.metrics.readiness}%`}
                    note={t('member.reports.metricReadinessNote')}
                  />
                ) : null}
                {view.metrics.questionnaire != null ? (
                  <MetricBar
                    label={t('member.reports.metricQuestionnaire')}
                    value={`${view.metrics.questionnaire}%`}
                    note={t('member.reports.metricQuestionnaireNote')}
                  />
                ) : null}
                {linkageLabel || view.metrics.profile != null ? (
                  <MetricBar
                    label={t('member.reports.metricLinkage')}
                    value={
                      linkageLabel
                        ? linkageLabel.charAt(0).toUpperCase() + linkageLabel.slice(1)
                        : `${view.metrics.profile}%`
                    }
                    note={
                      view.metrics.profile != null
                        ? t('member.reports.metricProfileNote', {
                            percent: view.metrics.profile,
                          })
                        : undefined
                    }
                    tone="ok"
                  />
                ) : null}
              </div>
            ) : null}

            {view.summary ? (
              <section>
                <h2>{t('reportTemplate.section.summary')}</h2>
                <p>{view.summary}</p>
              </section>
            ) : null}

            {view.profile ? (
              <section>
                <h2>{t('reportTemplate.section.profile')}</h2>
                <p>{view.profile}</p>
              </section>
            ) : null}

            {view.insights.length ? (
              <section>
                <h2>{t('reportTemplate.section.insights')}</h2>
                <ol className="report-list">
                  {view.insights.map((item, idx) => (
                    <li key={`insight-${idx}`}>
                      <span className="report-num">{idx + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {view.analysis ? (
              <section>
                <h2>{t('reportTemplate.section.analysis')}</h2>
                <p>{view.analysis}</p>
              </section>
            ) : null}

            {view.focusAreas.length ? (
              <section>
                <h2>{t('reportTemplate.section.focusAreas')}</h2>
                <ol className="report-list">
                  {view.focusAreas.map((item, idx) => (
                    <li key={`focus-${idx}`}>
                      <span className="report-num">{idx + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {view.recommendations.length ? (
              <section>
                <h2>{t('reportTemplate.section.recommendations')}</h2>
                {view.recommendations.map((rec, idx) => (
                  <div className="report-rec" key={`rec-${idx}`}>
                    <strong>{rec.title}</strong>
                    {rec.description ? <p>{rec.description}</p> : null}
                  </div>
                ))}
              </section>
            ) : null}

            {view.nextSteps.length ? (
              <section>
                <h2>{t('reportTemplate.section.nextSteps')}</h2>
                <ol className="report-list">
                  {view.nextSteps.map((item, idx) => (
                    <li key={`next-${idx}`}>
                      <span className="report-num">{idx + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {view.healthGuidePrompt ? (
              <section>
                <h2>{t('reportTemplate.section.healthGuidePrompt')}</h2>
                <div className="report-prompt">{view.healthGuidePrompt}</div>
              </section>
            ) : null}

            {report.second_opinion_a || report.second_opinion_b ? (
              <section>
                <h2>
                  {t('reportTemplate.section.secondOpinionA')} /{' '}
                  {t('reportTemplate.section.secondOpinionB')}
                </h2>
                <div className="report-perspectives">
                  {report.second_opinion_a ? (
                    <div className="report-perspective">
                      <h3>{t('reportTemplate.section.secondOpinionA')}</h3>
                      <p>{report.second_opinion_a}</p>
                    </div>
                  ) : null}
                  {report.second_opinion_b ? (
                    <div className="report-perspective">
                      <h3>{t('reportTemplate.section.secondOpinionB')}</h3>
                      <p>{report.second_opinion_b}</p>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {!hasBody ? <p>{t('member.reports.noBody')}</p> : null}

            <p className="report-footer">{t('reportTemplate.footer')}</p>
          </article>
        </div>
      </div>
    </div>
  );
}
