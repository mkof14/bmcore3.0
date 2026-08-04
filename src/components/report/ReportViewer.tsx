import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Download, FileDown, Share2, X } from 'lucide-react';
import type { HealthReport } from '../../types/database';
import { notifyUserError, notifyUserSuccess } from '../../lib/adminNotify';
import {
  copyReportText,
  downloadReportTxt,
  formatReportAsText,
  printReport,
  shareReportContent,
} from '../../lib/reports';
import { parseReportView } from '../../lib/reports/parseReportView';
import '../../styles/report-print.css';

type Props = {
  report: HealthReport & { report_title?: string | null };
  onClose: () => void;
  onShare?: () => void;
  sharing?: boolean;
};

function MetricRing({
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
  const pct = Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : null;
  const color = tone === 'ok' ? '#15803d' : '#ea580c';
  const track = tone === 'ok' ? '#dcfce7' : '#ffedd5';
  return (
    <div className="report-metric">
      <div className="report-metric-top">
        {pct != null ? (
          <div
            className="report-ring"
            style={{
              background: `conic-gradient(${color} ${pct * 3.6}deg, ${track} 0deg)`,
            }}
            aria-hidden="true"
          >
            <span>{Math.round(pct)}%</span>
          </div>
        ) : (
          <p
            className="report-metric-value"
            style={tone === 'ok' ? { color: '#15803d', fontSize: '1.2rem' } : undefined}
          >
            {value}
          </p>
        )}
        <div>
          <p className="report-metric-label">{label}</p>
          {note ? <p className="report-metric-note">{note}</p> : null}
          {pct == null ? null : (
            <p className="report-metric-value report-metric-value-inline">{value}</p>
          )}
        </div>
      </div>
      {pct != null ? (
        <div className="report-bar" aria-hidden="true">
          <span
            style={{
              width: `${pct}%`,
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
  const [busy, setBusy] = useState<'copy' | 'share' | null>(null);
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

  const reportText = () => formatReportAsText(report, t);

  const handleDownloadTxt = () => {
    const text = reportText();
    const safe = String(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
    downloadReportTxt(safe || 'wellness-report', text);
  };

  const handleCopy = async () => {
    setBusy('copy');
    try {
      const ok = await copyReportText(reportText());
      if (ok) notifyUserSuccess(t('member.reports.copySuccess'));
      else notifyUserError(t('member.reports.copyFailed'));
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    setBusy('share');
    try {
      if (onShare) {
        onShare();
        return;
      }
      const result = await shareReportContent({
        title: String(title),
        text: reportText(),
      });
      if (result === 'shared' || result === 'copied') {
        notifyUserSuccess(t('member.reports.shareContentSuccess'));
      } else if (result === 'failed') {
        notifyUserError(t('member.reports.shareContentFailed'));
      }
    } finally {
      setBusy(null);
    }
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
              onClick={() => void handleCopy()}
              disabled={busy === 'copy'}
              className="report-tool-btn"
            >
              <Copy className="h-3.5 w-3.5" />
              {t('member.reports.copy')}
            </button>
            <button
              type="button"
              onClick={() => void handleShare()}
              disabled={sharing || busy === 'share'}
              className="report-tool-btn"
            >
              <Share2 className="h-3.5 w-3.5" />
              {t('member.reports.shareContent')}
            </button>
            <button type="button" onClick={handleDownloadTxt} className="report-tool-btn">
              <Download className="h-3.5 w-3.5" />
              {t('member.reports.downloadTxt')}
            </button>
            <button
              type="button"
              onClick={() => printReport()}
              className="report-tool-btn"
            >
              <FileDown className="h-3.5 w-3.5" />
              {t('member.reports.downloadPdf')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="report-tool-btn report-tool-btn-primary"
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
                  <MetricRing
                    label={t('member.reports.metricReadiness')}
                    value={`${view.metrics.readiness}%`}
                    note={t('member.reports.metricReadinessNote')}
                  />
                ) : null}
                {view.metrics.questionnaire != null ? (
                  <MetricRing
                    label={t('member.reports.metricQuestionnaire')}
                    value={`${view.metrics.questionnaire}%`}
                    note={t('member.reports.metricQuestionnaireNote')}
                  />
                ) : null}
                {linkageLabel || view.metrics.profile != null ? (
                  <MetricRing
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
              <section className="report-section report-section-summary">
                <h2>{t('reportTemplate.section.summary')}</h2>
                <p>{view.summary}</p>
              </section>
            ) : null}

            {view.profile ? (
              <section className="report-section report-section-profile">
                <h2>{t('reportTemplate.section.profile')}</h2>
                <p>{view.profile}</p>
              </section>
            ) : null}

            {view.insights.length ? (
              <section className="report-section report-section-insights">
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
              <section className="report-section report-section-analysis">
                <h2>{t('reportTemplate.section.analysis')}</h2>
                <p>{view.analysis}</p>
              </section>
            ) : null}

            {view.focusAreas.length ? (
              <section className="report-section report-section-focus">
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
              <section className="report-section report-section-recs">
                <h2>{t('reportTemplate.section.recommendations')}</h2>
                {view.recommendations.map((rec, idx) => (
                  <div className="report-rec" key={`rec-${idx}`}>
                    <span className="report-rec-num">{idx + 1}</span>
                    <div>
                      <strong>{rec.title}</strong>
                      {rec.description ? <p>{rec.description}</p> : null}
                    </div>
                  </div>
                ))}
              </section>
            ) : null}

            {view.nextSteps.length ? (
              <section className="report-section report-section-next">
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
              <section className="report-section report-section-prompt">
                <h2>{t('reportTemplate.section.healthGuidePrompt')}</h2>
                <div className="report-prompt">{view.healthGuidePrompt}</div>
              </section>
            ) : null}

            {report.second_opinion_a || report.second_opinion_b ? (
              <section className="report-section report-section-perspectives">
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
            <p className="report-copyright">
              {t('reportTemplate.copyright', { year: new Date().getFullYear() })}
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
