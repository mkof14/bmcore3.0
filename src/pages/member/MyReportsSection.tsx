import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Eye, Clock, Plus, Loader2, Share2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError, notifyUserSuccess } from '../../lib/adminNotify';
import ErrorBanner from '../../components/ui/ErrorBanner';
import Button from '../../components/ui/Button';
import MemberMetricCard from '../../components/ui/MemberMetricCard';
import { loadKnowledgeSnapshot } from '../../lib/secondOpinionEngine';
import PersonalContextIndicator from '../../components/PersonalContextIndicator';
import ReportViewer from '../../components/report/ReportViewer';
import {
  canGeneratePersonalizedReport,
  downloadReportTxt,
  formatReportAsText,
  generatePersonalizedReport,
} from '../../lib/reports';
import {
  buildPersonalContext,
  type PersonalContext,
} from '../../lib/personalContext';
import { createShareableReport, getShareableUrl } from '../../lib/shareableReports';
import { ensureMockSampleReport } from '../../lib/mock/mockMemberSeed';
import { isSupabaseMock } from '../../lib/supabase';
import type { HealthReport } from '../../types/database';

type ReportRow = HealthReport & {
  report_title?: string | null;
  status?: string | null;
};

const COVERAGE_KEYS = ['profile', 'devices', 'reports', 'inputs', 'documents', 'services'] as const;

type Props = {
  onNavigateSection?: (section: string) => void;
};

export default function MyReportsSection({ onNavigateSection }: Props) {
  const { t, i18n } = useTranslation();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [coverage, setCoverage] = useState<Record<string, number>>({});
  const [personalContext, setPersonalContext] = useState<PersonalContext | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null);
  const [sharing, setSharing] = useState(false);
  const [gateMessage, setGateMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadReports();
    try {
      const raw = localStorage.getItem('bmcore.report.favorites');
      setFavorites(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const snapshot = loadKnowledgeSnapshot(userId);
    const sources = snapshot?.sources || [];
    const map: Record<string, number> = {};
    sources.forEach((s) => {
      map[s.key] = s.count;
    });
    setCoverage(map);

    const onStorage = (event: StorageEvent) => {
      if (!event.key) return;
      if (event.key.includes(`bmcore.knowledge.${userId}`)) {
        const nextSnapshot = loadKnowledgeSnapshot(userId);
        const nextSources = nextSnapshot?.sources || [];
        const nextMap: Record<string, number> = {};
        nextSources.forEach((s) => {
          nextMap[s.key] = s.count;
        });
        setCoverage(nextMap);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [userId]);

  const openQuestionnaires = () => {
    onNavigateSection?.('questionnaires');
  };

  const loadReports = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setError(t('member.reports.signInRequired'));
        return;
      }
      setUserId(user.user.id);
      setContextLoading(true);
      try {
        setPersonalContext(await buildPersonalContext(user.user.id));
      } catch {
        setPersonalContext(null);
      } finally {
        setContextLoading(false);
      }

      let { data, error: loadError } = await supabase
        .from('health_reports')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (loadError) throw loadError;

      // Mock/superadmin first visit: auto-create one personalized report so the list is not empty.
      if (isSupabaseMock && (!data || data.length === 0)) {
        await ensureMockSampleReport(user.user.id, t);
        const reload = await supabase
          .from('health_reports')
          .select('*')
          .eq('user_id', user.user.id)
          .order('created_at', { ascending: false });
        if (reload.error) throw reload.error;
        data = reload.data;
      }

      setReports(
        ((data || []) as ReportRow[]).map((row) => ({
          ...row,
          report_title: row.report_title || row.topic || row.report_type || t('reportTemplate.fallbackTitle'),
          status: row.status || 'completed',
        })),
      );
      setError(null);
    } catch {
      notifyUserError(t('member.reports.loadFailed'));
      setError(t('member.reports.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const filteredReports =
    filterType === 'all' ? reports : reports.filter((r) => r.report_type === filterType);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      try {
        localStorage.setItem('bmcore.report.favorites', JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const hasNotes = (id: string) => {
    try {
      return Boolean(localStorage.getItem(`bmcore.report.notes.${id}`));
    } catch {
      return false;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-600/30 text-green-700 dark:text-green-400';
      case 'processing':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-600/30 text-blue-700 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-600/30 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600/30 text-gray-700 dark:text-neutral-300';
    }
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      completed: t('member.reports.statusCompleted'),
      processing: t('member.reports.statusProcessing'),
      pending: t('member.reports.statusPending'),
    };
    return map[status] ?? status;
  };

  const coverageLabel = (key: string) => {
    const map: Record<string, string> = {
      profile: t('member.reports.coverageProfile'),
      devices: t('member.reports.coverageDevices'),
      reports: t('member.reports.coverageReports'),
      inputs: t('member.reports.coverageInputs'),
      documents: t('member.reports.coverageDocuments'),
      services: t('member.reports.coverageServices'),
    };
    return map[key] ?? key;
  };

  const typeLabel = (type: string) =>
    t(`reportTemplate.typeLabel.${type}`, { defaultValue: type });

  const handleGeneratePersonalized = async () => {
    if (!userId || generating) return;
    setGateMessage(null);

    let ctx = personalContext;
    if (!ctx) {
      try {
        ctx = await buildPersonalContext(userId, { forceRefresh: true });
        setPersonalContext(ctx);
      } catch {
        notifyUserError(t('member.personalContext.generateFailed'));
        return;
      }
    }

    if (!canGeneratePersonalizedReport(ctx)) {
      setGateMessage(t('member.reports.generateBlocked'));
      return;
    }

    setGenerating(true);
    try {
      const result = await generatePersonalizedReport({
        userId,
        reportType: 'general',
        t,
      });
      if (result.gated) {
        setGateMessage(t('member.reports.generateBlocked'));
        return;
      }
      if (!result.ok) throw new Error(result.error || 'failed');
      setPersonalContext(result.context || ctx);
      notifyUserSuccess(t('member.personalContext.generateSuccess'));
      await loadReports();
    } catch {
      notifyUserError(t('member.personalContext.generateFailed'));
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (report: ReportRow) => {
    const text = formatReportAsText(report, t);
    const title = report.report_title || report.topic || 'report';
    downloadReportTxt(
      String(title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60) || 'wellness-report',
      text,
    );
  };

  const handleShare = async (report: ReportRow) => {
    setSharing(true);
    try {
      const title = report.report_title || report.topic || t('reportTemplate.fallbackTitle');
      const shared = await createShareableReport({
        reportId: report.id,
        title,
        description: report.summary?.slice(0, 280) || undefined,
        reportData: {
          summary: report.summary,
          insights: report.insights,
          analysis: report.analysis,
          recommendations: report.recommendations,
          second_opinion_a: report.second_opinion_a,
          second_opinion_b: report.second_opinion_b,
          report_type: report.report_type,
          created_at: report.created_at,
        },
        privacyLevel: 'unlisted',
        expiresInDays: 30,
      });
      if (!shared) throw new Error('share failed');
      const url = getShareableUrl(shared.share_token);
      const text = formatReportAsText(report, t);
      try {
        if (typeof navigator.share === 'function') {
          await navigator.share({ title: String(title), text, url });
          notifyUserSuccess(t('member.reports.shareContentSuccess'));
          return;
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
      await navigator.clipboard.writeText(url);
      notifyUserSuccess(t('member.reports.shareSuccess'));
    } catch {
      notifyUserError(t('member.reports.shareFailed'));
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PersonalContextIndicator
        context={personalContext}
        loading={contextLoading}
        onOpenQuestionnaires={openQuestionnaires}
      />

      {gateMessage ? (
        <div className="rounded-xl border border-rose-300/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-900 dark:text-rose-100">
          <p className="font-semibold">{t('member.reports.gateTitle')}</p>
          <p className="mt-1 opacity-90">{gateMessage}</p>
          <button
            type="button"
            onClick={openQuestionnaires}
            className="mt-2 font-medium underline underline-offset-2"
          >
            {t('member.reports.generateBlockedCta')}
          </button>
        </div>
      ) : null}

      <div className="member-card rounded-xl p-4">
        <h3 className="member-heading mb-3">{t('member.reports.dataCoverage')}</h3>
        <div className="grid md:grid-cols-3 gap-3 text-xs member-body">
          {COVERAGE_KEYS.map((key) => (
            <div
              key={key}
              className="rounded-lg border border-gray-200 dark:border-[var(--bm-border)] bg-gray-50 dark:bg-[var(--bm-surface)]/40 p-3"
            >
              <div className="flex items-center justify-between">
                <span>{coverageLabel(key)}</span>
                <span className="member-muted">{coverage[key] || 0}</span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: `${Math.min(100, (coverage[key] || 0) * 10)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs member-muted">{t('member.reports.coverageTip')}</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <MemberMetricCard
          accent="blue"
          icon={<FileText className="h-6 w-6" />}
          value={reports.length}
          label={t('member.reports.totalReports')}
        />
        <MemberMetricCard
          accent="green"
          icon={<Clock className="h-6 w-6" />}
          value={reports.filter((r) => r.status === 'completed').length}
          label={t('member.reports.completed')}
        />
        <MemberMetricCard
          accent="orange"
          icon={<Clock className="h-6 w-6" />}
          value={reports.filter((r) => r.status === 'processing').length}
          label={t('member.reports.processing')}
        />
        <MemberMetricCard
          accent="purple"
          icon={<FileText className="h-6 w-6" />}
          value={
            reports[0]
              ? new Date(reports[0].created_at).toLocaleDateString(i18n.language)
              : t('member.common.na')
          }
          label={t('member.reports.latestReport')}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: t('member.reports.filterAll') },
            { id: 'general', label: t('member.reports.filterGeneral') },
            { id: 'thematic', label: t('member.reports.filterThematic') },
            { id: 'dynamic', label: t('member.reports.filterDynamic') },
            { id: 'device_enhanced', label: t('member.reports.filterDevice') },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === filter.id
                  ? 'bg-orange-600 text-white'
                  : 'member-body border border-gray-200 dark:border-[var(--bm-border)] hover:bg-[var(--bm-surface)]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void handleGeneratePersonalized()}
            disabled={generating}
            className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            {t('member.reports.generateNew')}
          </button>
          <Button onClick={() => void loadReports()} className="flex items-center gap-2">
            {t('member.common.refresh')}
          </Button>
        </div>
      </div>

      {error && <ErrorBanner message={error} className="mb-4" />}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-sm member-muted">{t('member.reports.loading')}</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-12 member-card">
          <FileText className="h-16 w-16 member-muted mx-auto mb-4" />
          <p className="member-body mb-2">{t('member.reports.empty')}</p>
          <p className="text-sm member-muted">{t('member.reports.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="member-card rounded-xl p-6 hover:border-orange-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-600/30 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(report.status || 'completed')}`}
                >
                  {statusLabel(report.status || 'completed')}
                </span>
              </div>

              <h3 className="member-heading text-lg mb-2 line-clamp-2">{report.report_title}</h3>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="member-muted">{t('member.reports.type')}</span>
                  <span className="member-body">{typeLabel(report.report_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="member-muted">{t('member.reports.generated')}</span>
                  <span className="member-body">
                    {new Date(report.created_at).toLocaleDateString(i18n.language)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="member-muted">{t('member.reports.notes')}</span>
                  <span className="member-body">
                    {hasNotes(report.id) ? t('member.common.yes') : t('member.common.no')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="flex-1 p-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-600/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {t('member.common.view')}
                </button>
                <button
                  onClick={() => toggleFavorite(report.id)}
                  className={`px-3 py-2 rounded-lg border text-xs ${
                    favorites.includes(report.id)
                      ? 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-500/40 dark:bg-yellow-500/10 dark:text-yellow-300'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-gray-700 dark:text-neutral-300 dark:hover:bg-gray-800'
                  }`}
                  aria-label={favorites.includes(report.id) ? 'Unfavorite' : 'Favorite'}
                >
                  {favorites.includes(report.id) ? '★' : '☆'}
                </button>
                <button
                  onClick={() => void handleShare(report)}
                  className="p-2 bg-violet-50 border border-violet-200 text-violet-700 rounded-lg hover:bg-violet-100 dark:bg-violet-900/30 dark:border-violet-600/30 dark:text-violet-300 dark:hover:bg-violet-900/50 transition-colors"
                  aria-label={t('member.reports.share')}
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDownload(report)}
                  className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-100 dark:bg-green-900/30 dark:border-green-600/30 dark:text-green-300 dark:hover:bg-green-900/50 transition-colors"
                  aria-label={t('member.common.download')}
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReport ? (
        <ReportViewer
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onShare={() => void handleShare(selectedReport)}
          sharing={sharing}
        />
      ) : null}
    </div>
  );
}
