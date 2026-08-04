import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { FileText, Plus, Download, MessageSquare, TrendingUp, Clock, Zap, Heart, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { notifyUserError, notifyUserInfo } from '../lib/adminNotify';
import type { HealthReport } from '../types/database';
import { buildAggregatedSecondOpinion, getKnowledgeSignalScore, loadKnowledgeSnapshot, loadKnowledgeTimeline } from '../lib/secondOpinionEngine';
import ReportBrandHeader from '../components/report/ReportBrandHeader';
import ModelRadarComparison, { buildModelScores } from '../components/report/ModelRadarComparison';
import { generatePersonalizedReport, printReport } from '../lib/reports';
import { ensureMockSampleReport } from '../lib/mock/mockMemberSeed';
import { isSupabaseMock } from '../lib/supabase';
import '../styles/report-print.css';

interface ReportsProps {
  onNavigate: (page: string) => void;
}

const getReportTypeLabel = (type: string, t: TFunction) => {
  switch (type) {
    case 'general': return t('reportsPage.typeGeneral');
    case 'thematic': return t('reportsPage.typeThematic');
    case 'dynamic': return t('reportsPage.typeDynamic');
    case 'device_enhanced': return t('reportsPage.typeDevice');
    default: return type;
  }
};

const getReportIcon = (type: string) => {
  switch (type) {
    case 'general': return FileText;
    case 'thematic': return Heart;
    case 'dynamic': return TrendingUp;
    case 'device_enhanced': return Activity;
    default: return FileText;
  }
};

export default function Reports({ onNavigate }: ReportsProps) {
  const { t, i18n } = useTranslation();
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<HealthReport | null>(null);
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadReports();
    try {
      const raw = localStorage.getItem('bmcore.report.favorites');
      setFavorites(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('bmcore.report.favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  };

  async function loadReports() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data, error } = await supabase
        .from('health_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (isSupabaseMock && (!data || data.length === 0)) {
        await ensureMockSampleReport(user.id, t);
        const reload = await supabase
          .from('health_reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (reload.error) throw reload.error;
        data = reload.data;
      }

      const loaded = data || [];
      setReports(loaded);
      try {
        loaded.forEach((item) => {
          localStorage.setItem(`bmcore.report.${item.id}`, JSON.stringify(item));
        });
        localStorage.setItem('bmcore.report.list', JSON.stringify(loaded.map((item) => item.id)));
      } catch {
        // ignore localStorage failures
      }
    } catch (error) {
      notifyUserError('Reports load failed');
    } finally {
      setLoading(false);
    }
  }

  if (showCreateFlow) {
    return (
      <CreateReportFlow
        onBack={() => setShowCreateFlow(false)}
        onComplete={() => {
          setShowCreateFlow(false);
          loadReports();
        }}
        reportCount={reports.length}
      />
    );
  }

  if (selectedReport) {
    return (
      <ReportView
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
        onNavigate={onNavigate}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-page transition-colors pt-16 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">{t('reportsPage.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page transition-colors pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {t('reportsPage.title')}
            </h1>
            <button
              onClick={() => setShowCreateFlow(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-lg shadow-orange-600/20 text-white rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t('reportsPage.create')}
            </button>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('reportsPage.subtitle')}
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white dark:bg-gradient-to-br dark:from-[var(--bm-surface)] dark:via-gray-800 dark:to-[var(--bm-surface)] rounded-xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700/50">
            <FileText className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('reportsPage.emptyTitle')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {t('reportsPage.emptyBody')}
            </p>
            <button
              onClick={() => setShowCreateFlow(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-lg shadow-orange-600/20 text-white rounded-lg transition-colors font-semibold"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t('reportsPage.createFirst')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reports.map((report) => {
              const Icon = getReportIcon(report.report_type);
              const isFavorite = favorites.includes(report.id);
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
                >
                  <ReportBrandHeader
                    variant="strip"
                    subtitle={getReportTypeLabel(report.report_type, t)}
                    className="mb-4"
                  />
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {report.topic || getReportTypeLabel(report.report_type, t)}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {new Date(report.created_at).toLocaleDateString(i18n.resolvedLanguage, {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-semibold rounded">
                      {getReportTypeLabel(report.report_type, t)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 dark:text-gray-300 mb-4 line-clamp-3">
                    {report.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      {report.insights && Array.isArray(report.insights) && (
                        <span>{report.insights.length} insights</span>
                      )}
                      {report.recommendations && Array.isArray(report.recommendations) && (
                        <span>{report.recommendations.length} recommendations</span>
                      )}
                      {report.second_opinion_a && report.second_opinion_b && (
                        <span className="text-purple-600 dark:text-purple-400">{t('reportsPage.multiModel')}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(report.id);
                        }}
                        className={`text-xs px-2 py-1 rounded-full border ${
                          isFavorite
                            ? 'border-yellow-400 text-yellow-300'
                            : 'border-gray-600 text-gray-400'
                        }`}
                      >
                        {isFavorite ? '★' : '☆'} {t('reportsPage.favorite')}
                      </button>
                      <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface CreateReportFlowProps {
  onBack: () => void;
  onComplete: () => void;
  reportCount: number;
}

function CreateReportFlow({ onBack, onComplete, reportCount }: CreateReportFlowProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'type' | 'options' | 'generating'>('type');
  const [reportType, setReportType] = useState<'general' | 'thematic' | 'dynamic' | 'device_enhanced'>('general');
  const [includeSecondOpinion] = useState(true);
  const [topic, setTopic] = useState('');
  const [pipelineStep, setPipelineStep] = useState(0);

  const handleCreate = async () => {
    setStep('generating');
    setPipelineStep(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result = await generatePersonalizedReport({
        userId: user.id,
        reportType,
        topic: topic || null,
        settingsOverride: includeSecondOpinion ? { second_opinion_default: true } : { second_opinion_default: false },
        t,
      });

      if (result.gated) {
        notifyUserError(t('member.reports.generateBlocked'));
        setStep('options');
        return;
      }
      if (!result.ok) throw new Error(result.error || 'Report creation failed');

      const stepTimer = window.setInterval(() => {
        setPipelineStep((prev) => Math.min(prev + 1, 3));
      }, 700);

      setTimeout(() => {
        window.clearInterval(stepTimer);
        setPipelineStep(3);
        onComplete();
      }, 2000);
    } catch {
      notifyUserError(t('member.personalContext.generateFailed'));
      setStep('options');
    }
  };

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-page transition-colors pt-16 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Zap className="h-16 w-16 text-orange-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('reportsPage.generatingTitle')}
          </h2>
          <div className="space-y-2 text-gray-400">
            <p>✓ {t('reportsPage.generatingGather')}</p>
            <p>✓ {t('reportsPage.generatingModelA')}</p>
            <p>✓ {t('reportsPage.generatingModelB')}</p>
            <p className="animate-pulse">⏳ {t('reportsPage.generatingAggregate')}</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2 text-xs text-gray-500">
            {[
              t('reportsPage.pipelineGather'),
              t('reportsPage.pipelineModelA'),
              t('reportsPage.pipelineModelB'),
              t('reportsPage.pipelineAggregate'),
            ].map((label, idx) => (
              <div
                key={label}
                className={`rounded-lg border px-3 py-2 ${
                  pipelineStep > idx
                    ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-700/40 dark:bg-green-900/20 dark:text-green-300'
                    : pipelineStep === idx
                    ? 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-700/40 dark:bg-orange-900/20 dark:text-orange-300'
                    : 'border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-[var(--bm-surface)]/40 dark:text-gray-400'
                }`}
              >
                {pipelineStep > idx ? '✓' : pipelineStep === idx ? '⏳' : '•'} {label}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all"
                style={{ width: `${(pipelineStep / 3) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t('reportsPage.pipelineProgress', { percent: Math.round((pipelineStep / 3) * 100) })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'options') {
    return (
      <div className="min-h-screen bg-page transition-colors pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={onBack}
            className="mb-6 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← {t('common.back')}
          </button>

          <h1 className="text-3xl font-bold text-white mb-4">
            {t('reportsPage.settingsTitle')}
          </h1>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8 border border-gray-700/50">
            <p className="text-gray-700 dark:text-gray-300">
              {t('reportsPage.settingsIntro')}
            </p>
          </div>

          {reportType === 'thematic' && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white mb-2">
                {t('reportsPage.topicLabel')}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t('reportsPage.topicPlaceholder')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
              />
            </div>
          )}

          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 mb-6">
            <label className="flex items-start space-x-3 cursor-not-allowed">
              <input
                type="checkbox"
                checked={includeSecondOpinion}
                disabled
                className="mt-1 h-5 w-5 text-blue-600 rounded opacity-70"
              />
              <div>
                <p className="font-semibold text-white">
                  {t('reportsPage.secondOpinionOn')}
                </p>
                <p className="text-sm text-gray-400">
                  {t('reportsPage.secondOpinionBody')}
                </p>
              </div>
            </label>
          </div>

          <button
            onClick={handleCreate}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-lg shadow-orange-600/20 text-white rounded-lg font-semibold transition-colors"
          >
            {t('reportsPage.create')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page transition-colors pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={onBack}
          className="mb-6 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          ← {t('common.back')}
        </button>

        <h1 className="text-3xl font-bold text-white mb-8">
          {t('reportsPage.chooseType')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => {
              setReportType('general');
              setStep('options');
            }}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left group"
          >
            <FileText className="h-12 w-12 text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">
              {t('reportsPage.typeGeneral')}
            </h3>
            <p className="text-gray-400 text-sm">
              {t('reportsPage.typeGeneralBody')}
            </p>
          </button>

          <button
            onClick={() => {
              setReportType('thematic');
              setStep('options');
            }}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all text-left group"
          >
            <Heart className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">
              {t('reportsPage.typeThematic')}
            </h3>
            <p className="text-gray-400 text-sm">
              {t('reportsPage.typeThematicBody')}
            </p>
          </button>

          <button
            onClick={() => {
              setReportType('dynamic');
              setStep('options');
            }}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-500 transition-all text-left group"
            disabled={reportCount < 2}
          >
            <TrendingUp className="h-12 w-12 text-green-600 dark:text-green-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">
              {t('reportsPage.typeDynamic')}
            </h3>
            <p className="text-gray-400 text-sm">
              {t('reportsPage.typeDynamicBody')}
            </p>
            {reportCount < 2 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                {t('reportsPage.typeDynamicLocked')}
              </p>
            )}
          </button>

          <button
            onClick={() => {
              setReportType('device_enhanced');
              setStep('options');
            }}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-teal-500 dark:hover:border-teal-500 transition-all text-left group"
          >
            <Activity className="h-12 w-12 text-teal-600 dark:text-teal-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">
              {t('reportsPage.typeDevice')}
            </h3>
            <p className="text-gray-400 text-sm">
              {t('reportsPage.typeDeviceBody')}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

interface ReportViewProps {
  report: HealthReport;
  onBack: () => void;
  onNavigate: (page: string) => void;
}

function ReportView({ report, onBack, onNavigate }: ReportViewProps) {
  const { t, i18n } = useTranslation();
  const [showOpinion, setShowOpinion] = useState<'a' | 'b' | 'both'>('a');
  const [liveReport, setLiveReport] = useState<HealthReport>(report);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draftTopic, setDraftTopic] = useState(report.topic || '');
  const [draftSummary, setDraftSummary] = useState(report.summary);
  const [draftAnalysis, setDraftAnalysis] = useState(report.analysis);
  const [draftInsights, setDraftInsights] = useState((report.insights || []).join('\n'));
  const [draftRecommendations, setDraftRecommendations] = useState(
    (report.recommendations || [])
      .map((rec) => `${rec.title}: ${rec.description}`)
      .join('\n')
  );
  const [notes, setNotes] = useState('');
  const [refinementStyle, setRefinementStyle] = useState<'clinical' | 'friendly' | 'executive'>('executive');
  const [dialogInput, setDialogInput] = useState('');
  const [dialog, setDialog] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [timeline, setTimeline] = useState<Array<{ timestamp: string; signals: Record<string, number>; totalSignals: number }>>([]);
  const [showWhySummary, setShowWhySummary] = useState(false);
  const [showWhyInsights, setShowWhyInsights] = useState(false);
  const [knowledgeSnapshot, setKnowledgeSnapshot] = useState(() => {
    if (!report.user_id) return null;
    return loadKnowledgeSnapshot(report.user_id);
  });
  const knowledgeScore = useMemo(() => getKnowledgeSignalScore(knowledgeSnapshot), [knowledgeSnapshot]);
  const aggregatedOpinion = useMemo(() => {
    if (!liveReport.second_opinion_a || !liveReport.second_opinion_b) return null;
    return buildAggregatedSecondOpinion(liveReport.second_opinion_a, liveReport.second_opinion_b, knowledgeSnapshot);
  }, [liveReport.second_opinion_a, liveReport.second_opinion_b, knowledgeSnapshot]);

  const modelScores = useMemo(() => {
    if (!liveReport.second_opinion_a || !liveReport.second_opinion_b) return null;
    return {
      a: buildModelScores('A', liveReport.second_opinion_a, 0.02),
      b: buildModelScores('B', liveReport.second_opinion_b, -0.02),
    };
  }, [liveReport.second_opinion_a, liveReport.second_opinion_b]);

  const reportSignature = useMemo(() => {
    const seed = `${liveReport.id}:${liveReport.created_at}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) % 1000000007;
    }
    return `BMC-${hash.toString(16).toUpperCase()}`;
  }, [liveReport.id, liveReport.created_at]);

  const qualityScore = useMemo(() => {
    const insights = liveReport.insights.length;
    const recs = liveReport.recommendations.length;
    const hasSecondOpinion = Boolean(liveReport.second_opinion_a && liveReport.second_opinion_b);
    const summaryQuality = Math.min(30, Math.round((liveReport.summary.length / 200) * 30));
    const insightsQuality = Math.min(30, insights * 6);
    const recQuality = Math.min(25, recs * 5);
    const secondOpinionBonus = hasSecondOpinion ? 15 : 0;
    return Math.min(100, summaryQuality + insightsQuality + recQuality + secondOpinionBonus);
  }, [liveReport.summary.length, liveReport.insights.length, liveReport.recommendations.length, liveReport.second_opinion_a, liveReport.second_opinion_b]);

  const previousReport = useMemo(() => {
    try {
      const listRaw = localStorage.getItem('bmcore.report.list');
      const list = listRaw ? (JSON.parse(listRaw) as string[]) : [];
      const currentIndex = list.indexOf(liveReport.id);
      if (currentIndex === -1 || currentIndex === list.length - 1) return null;
      const prevId = list[currentIndex + 1];
      const prevRaw = localStorage.getItem(`bmcore.report.${prevId}`);
      return prevRaw ? (JSON.parse(prevRaw) as HealthReport) : null;
    } catch {
      return null;
    }
  }, [liveReport.id]);

  const sourceCounts = useMemo(() => {
    const sources = knowledgeSnapshot?.sources || [];
    const map = new Map(sources.map((s) => [s.key, s.count]));
    return {
      profile: map.get('profile') || 0,
      devices: map.get('devices') || 0,
      reports: map.get('reports') || 0,
      inputs: map.get('inputs') || 0,
      documents: map.get('documents') || 0,
      services: map.get('services') || 0,
    };
  }, [knowledgeSnapshot]);

  useEffect(() => {
    setLiveReport(report);
    if (report.user_id) {
      setKnowledgeSnapshot(loadKnowledgeSnapshot(report.user_id));
      setTimeline(loadKnowledgeTimeline(report.user_id) as Array<{ timestamp: string; signals: Record<string, number>; totalSignals: number }>);
      try {
        const rawNotes = localStorage.getItem(`bmcore.report.notes.${report.id}`);
        setNotes(rawNotes || '');
      } catch {
        setNotes('');
      }
    }
    setDraftTopic(report.topic || '');
    setDraftSummary(report.summary);
    setDraftAnalysis(report.analysis);
    setDraftInsights((report.insights || []).join('\n'));
    setDraftRecommendations(
      (report.recommendations || [])
        .map((rec) => `${rec.title}: ${rec.description}`)
        .join('\n')
    );
  }, [report]);

  useEffect(() => {
    if (!liveReport.user_id) return;

    const refreshSnapshot = () => {
      const snapshot = loadKnowledgeSnapshot(liveReport.user_id);
      setKnowledgeSnapshot(snapshot);
      setTimeline(loadKnowledgeTimeline(liveReport.user_id) as Array<{ timestamp: string; signals: Record<string, number>; totalSignals: number }>);
    };

    const refreshReportCache = () => {
      try {
        const cached = localStorage.getItem(`bmcore.report.${liveReport.id}`);
        if (!cached) return;
        const parsed = JSON.parse(cached) as HealthReport;
        if (parsed.updated_at && parsed.updated_at !== liveReport.updated_at) {
          setLiveReport(parsed);
        }
      } catch {
        // ignore malformed cache
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (!event.key) return;
      if (event.key.includes(`bmcore.knowledge.${liveReport.user_id}`)) {
        refreshSnapshot();
      }
      if (event.key === `bmcore.report.${liveReport.id}` && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue) as HealthReport;
          setLiveReport(parsed);
        } catch {
          // ignore malformed cache
        }
      }
    };

    const interval = window.setInterval(() => {
      refreshSnapshot();
      refreshReportCache();
    }, 10000);
    window.addEventListener('storage', onStorage);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', onStorage);
    };
  }, [liveReport.user_id, liveReport.id]);

  useEffect(() => {
    try {
      localStorage.setItem(`bmcore.report.${liveReport.id}`, JSON.stringify(liveReport));
    } catch {
      // ignore localStorage failures
    }
  }, [liveReport]);

  const handleExportPDF = () => {
    printReport();
  };

  const handleDiscussWithAI = () => {
    onNavigate('member-zone');
  };

  const handleCreateGoal = () => {
    notifyUserInfo('Goals System not available');
  };

  const handleSaveDraft = () => {
    const insights = draftInsights
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const recommendations = draftRecommendations
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [titlePart, ...rest] = line.split(':');
        const title = titlePart?.trim() || 'Recommendation';
        const description = rest.join(':').trim() || title;
        return { title, description };
      });

    setLiveReport((prev) => ({
      ...prev,
      topic: draftTopic || prev.topic,
      summary: draftSummary || prev.summary,
      analysis: draftAnalysis || prev.analysis,
      insights,
      recommendations,
      updated_at: new Date().toISOString(),
    }));
    setEditorOpen(false);
  };

  const handleSaveNotes = () => {
    try {
      localStorage.setItem(`bmcore.report.notes.${liveReport.id}`, notes);
    } catch {
      // ignore
    }
  };

  const formattedSummary = useMemo(() => {
    const base = liveReport.summary;
    if (refinementStyle === 'clinical') {
      return `Clinical Summary: ${base}`;
    }
    if (refinementStyle === 'friendly') {
      return `In simple terms: ${base}`;
    }
    return `Executive Summary: ${base}`;
  }, [liveReport.summary, refinementStyle]);

  const formattedAnalysis = useMemo(() => {
    const base = liveReport.analysis;
    if (refinementStyle === 'clinical') {
      return `Clinical Interpretation:\n${base}`;
    }
    if (refinementStyle === 'friendly') {
      return `Here's the easy‑to‑understand version:\n${base}`;
    }
    return `Key Interpretation:\n${base}`;
  }, [liveReport.analysis, refinementStyle]);

  const knowledgeGaps = useMemo(() => {
    const expected = ['profile', 'devices', 'reports', 'inputs', 'services', 'documents'];
    const present = new Set((knowledgeSnapshot?.sources || []).map((s) => s.key));
    return expected.filter((key) => !present.has(key as any));
  }, [knowledgeSnapshot]);

  const handleDialogSubmit = () => {
    if (!dialogInput.trim()) return;
    const question = dialogInput.trim();
    const response = [
      `Based on your report, here is a concise answer:`,
      liveReport.summary,
      liveReport.recommendations.length
        ? `Suggested next steps: ${liveReport.recommendations.map((r) => r.title).join(', ')}.`
        : 'No recommendations were detected in this report.',
    ].join(' ');
    setDialog((prev) => [...prev, { role: 'user', content: question }, { role: 'ai', content: response }]);
    setDialogInput('');
  };

  return (
    <div className="min-h-screen bg-page transition-colors pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={onBack}
          className="mb-6 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors no-print"
        >
          ← {t('reportsPage.backToList')}
        </button>

        <div className="mb-8 report-print report-print-root">
          <ReportBrandHeader
            title="BioMath Core"
            subtitle="Health Intelligence Report"
            meta={[
              `Report ID: ${liveReport.id}`,
              `${t('reportsPage.typeLabel')}: ${getReportTypeLabel(liveReport.report_type, t)}`,
            ]}
          />

          <div className="mt-6 grid md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[var(--bm-surface)]/60 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Knowledge Signal Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{knowledgeScore.score}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{knowledgeScore.freshnessLabel} data context</p>
            </div>
            <div className="bg-white dark:bg-[var(--bm-surface)]/60 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Report Quality Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{qualityScore}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Based on depth and completeness</p>
            </div>
            <div className="bg-white dark:bg-[var(--bm-surface)]/60 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Engine Version</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Second Opinion Engine v1.2</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Multi-Model enabled</p>
            </div>
            <div className="bg-white dark:bg-[var(--bm-surface)]/60 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Report Signature</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{reportSignature}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Generated {new Date(liveReport.created_at).toLocaleTimeString('en-US')}</p>
            </div>
          </div>

          <div className="mt-6 bg-white dark:bg-[var(--bm-surface)]/60 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Report Index</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Summary</span>
              {liveReport.insights?.length ? (
                <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Insights</span>
              ) : null}
              <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Analysis</span>
              {liveReport.recommendations?.length ? (
                <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Recommendations</span>
              ) : null}
              {liveReport.second_opinion_a && liveReport.second_opinion_b ? (
                <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Multi-Model</span>
              ) : null}
            </div>
          </div>

          <div className="mt-6 bg-white dark:bg-[var(--bm-surface)]/60 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Data Coverage</p>
            <div className="grid md:grid-cols-3 gap-3 text-xs text-gray-700 dark:text-gray-300">
              {[
                { key: 'profile', label: 'Profile', count: sourceCounts.profile },
                { key: 'devices', label: 'Devices', count: sourceCounts.devices },
                { key: 'reports', label: 'Reports', count: sourceCounts.reports },
                { key: 'inputs', label: 'Inputs', count: sourceCounts.inputs },
                { key: 'documents', label: 'Documents', count: sourceCounts.documents },
                { key: 'services', label: 'Services', count: sourceCounts.services },
              ].map((item) => (
                <div key={item.key} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[var(--bm-surface)]/40 p-3">
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <span className="text-gray-500">{item.count}</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, item.count * 10)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 bg-white dark:bg-[var(--bm-surface)]/60 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Pipeline Timeline</p>
            <div className="grid md:grid-cols-4 gap-3 text-xs">
              {[
                { label: 'Data Gather', detail: 'Signals consolidated' },
                { label: 'Model A', detail: 'Physiology pass' },
                { label: 'Model B', detail: 'Lifestyle pass' },
                { label: 'Aggregation', detail: 'Unified report' },
              ].map((step, idx) => (
                <div key={step.label} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[var(--bm-surface)]/40 p-3">
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">{idx + 1}. {step.label}</p>
                  <p className="text-gray-500 dark:text-gray-400">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {previousReport && (
            <div className="mt-6 bg-white dark:bg-[var(--bm-surface)]/60 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Consistency Delta (vs previous report)</p>
              <div className="grid md:grid-cols-3 gap-3 text-xs text-gray-700 dark:text-gray-300">
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[var(--bm-surface)]/40 p-3">
                  <p className="text-gray-500 dark:text-gray-400">Summary Length</p>
                  <p className="font-semibold">
                    {liveReport.summary.length - previousReport.summary.length >= 0 ? '+' : ''}
                    {liveReport.summary.length - previousReport.summary.length} chars
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[var(--bm-surface)]/40 p-3">
                  <p className="text-gray-500 dark:text-gray-400">Insights Count</p>
                  <p className="font-semibold">
                    {liveReport.insights.length - previousReport.insights.length >= 0 ? '+' : ''}
                    {liveReport.insights.length - previousReport.insights.length}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[var(--bm-surface)]/40 p-3">
                  <p className="text-gray-500 dark:text-gray-400">Recommendations</p>
                  <p className="font-semibold">
                    {liveReport.recommendations.length - previousReport.recommendations.length >= 0 ? '+' : ''}
                    {liveReport.recommendations.length - previousReport.recommendations.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {timeline.length > 0 && (
            <div className="mt-6 bg-white dark:bg-[var(--bm-surface)]/60 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Knowledge Timeline</p>
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                {timeline.slice(-6).reverse().map((entry) => (
                  <div key={entry.timestamp} className="flex items-center justify-between gap-3">
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(entry.timestamp).toLocaleTimeString('en-US')}
                    </span>
                    <span className="flex-1 truncate">
                      Signals: {Object.keys(entry.signals).join(', ') || 'update'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">Total {entry.totalSignals}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {liveReport.topic || t('reportsPage.viewDefaultTitle')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(liveReport.created_at).toLocaleDateString(i18n.resolvedLanguage, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                PDF
              </button>
              <button
                onClick={handleDiscussWithAI}
                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                {t('reportsPage.discuss')}
              </button>
              <button
                onClick={() => setEditorOpen((prev) => !prev)}
                className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
              >
                {editorOpen ? t('reportsPage.closeEditor') : t('reportsPage.editLocal')}
              </button>
            </div>
          </div>
        </div>

        {editorOpen && (
          <section className="mb-8 bg-white dark:bg-[var(--bm-surface)]/60 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reportsPage.editorTitle')}</h2>
            <div className="grid gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">{t('reportsPage.editorTopic')}</label>
                <input
                  value={draftTopic}
                  onChange={(e) => setDraftTopic(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bm-surface)] text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">{t('reportsPage.editorSummary')}</label>
                <textarea
                  value={draftSummary}
                  onChange={(e) => setDraftSummary(e.target.value)}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bm-surface)] text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">{t('reportsPage.editorAnalysis')}</label>
                <textarea
                  value={draftAnalysis}
                  onChange={(e) => setDraftAnalysis(e.target.value)}
                  rows={4}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bm-surface)] text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">{t('reportsPage.editorInsights')}</label>
                <textarea
                  value={draftInsights}
                  onChange={(e) => setDraftInsights(e.target.value)}
                  rows={4}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bm-surface)] text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">{t('reportsPage.editorRecommendations')}</label>
                <textarea
                  value={draftRecommendations}
                  onChange={(e) => setDraftRecommendations(e.target.value)}
                  rows={4}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bm-surface)] text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
                >
                  {t('reportsPage.saveLocal')}
                </button>
                <button
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="mb-8 bg-white dark:bg-[var(--bm-surface)]/60 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('reportsPage.notes')}</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bm-surface)] text-gray-900 dark:text-gray-100"
            placeholder={t('reportsPage.notesPlaceholder')}
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleSaveNotes}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
            >
              {t('reportsPage.saveNotes')}
            </button>
            <button
              onClick={() => setNotes('')}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg"
            >
              {t('reportsPage.clear')}
            </button>
          </div>
        </section>

        <div className="space-y-8">
          <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4">
              {t('reportsPage.briefSummary')}
            </h2>
            <p className="text-gray-200 dark:text-gray-300 leading-relaxed">
              {formattedSummary}
            </p>
            <button
              onClick={() => setShowWhySummary((prev) => !prev)}
              className="mt-3 text-xs text-orange-400 hover:text-orange-300"
            >
              {showWhySummary ? t('reportsPage.hideWhy') : t('reportsPage.whySummary')}
            </button>
            {showWhySummary && knowledgeSnapshot && (
              <div className="mt-3 text-xs text-gray-400">
                Derived from {knowledgeSnapshot.sources.map((s) => s.key).join(', ')} with freshness {knowledgeScore.freshnessLabel}.
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {(['executive', 'clinical', 'friendly'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setRefinementStyle(style)}
                  className={`px-3 py-1 rounded-full border ${
                    refinementStyle === style
                      ? 'border-orange-400 text-orange-300'
                      : 'border-gray-600 text-gray-400'
                  }`}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </section>

          {liveReport.insights && Array.isArray(liveReport.insights) && liveReport.insights.length > 0 && (
            <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4">
                {t('reportsPage.keyInsights')}
              </h2>
              <ul className="space-y-3">
                {liveReport.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-orange-500 text-sm font-semibold">
                      {idx + 1}
                    </span>
                    <span className="text-gray-200 dark:text-gray-300">{insight}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowWhyInsights((prev) => !prev)}
                className="mt-3 text-xs text-orange-400 hover:text-orange-300"
              >
                {showWhyInsights ? t('reportsPage.hideWhy') : t('reportsPage.whyInsights')}
              </button>
              {showWhyInsights && knowledgeSnapshot && (
                <div className="mt-2 text-xs text-gray-400">
                  Insights synthesized from {knowledgeSnapshot.sources.map((s) => s.key).join(', ')} signals.
                </div>
              )}
            </section>
          )}

          <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4">
              {t('reportsPage.detailedAnalysis')}
            </h2>
            <p className="text-gray-200 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {formattedAnalysis}
            </p>
          </section>

          {liveReport.recommendations && Array.isArray(liveReport.recommendations) && liveReport.recommendations.length > 0 && (
            <section className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t('reportsPage.gentleSteps')}
              </h2>
              <div className="space-y-4">
                {liveReport.recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {rec.title}
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {rec.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-white dark:bg-[var(--bm-surface)]/60 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Action Plan Builder</h3>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {liveReport.recommendations.map((rec, idx) => (
                    <label key={idx} className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1" />
                      <span>{rec.title} — {rec.description}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 grid md:grid-cols-3 gap-3 text-xs text-gray-600 dark:text-gray-300">
                  {[
                    { label: '7-Day Plan', focus: 'Quick stabilization' },
                    { label: '14-Day Plan', focus: 'Reinforce habits' },
                    { label: '30-Day Plan', focus: 'Sustainable change' },
                  ].map((plan) => (
                    <div key={plan.label} className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-3">
                      <p className="font-semibold text-green-800 dark:text-green-200">{plan.label}</p>
                      <p className="text-green-700 dark:text-green-300">{plan.focus}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="bg-white dark:bg-[var(--bm-surface)]/60 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">AI Knowledge Gaps</h2>
            {knowledgeGaps.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your signal coverage looks strong. No major gaps detected.
              </p>
            ) : (
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {knowledgeGaps.map((gap) => (
                  <div key={gap} className="flex items-center justify-between">
                    <span className="capitalize">{gap.replace('-', ' ')}</span>
                    <span className="text-xs text-orange-500">Add data to strengthen accuracy</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-[var(--bm-surface)]/60 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Ask about your report</h2>
            <div className="space-y-3 mb-4">
              {dialog.length === 0 && (
                <p className="text-sm text-gray-500">Ask a question about your report to get a clear explanation.</p>
              )}
              {dialog.map((msg, idx) => (
                <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`inline-block px-3 py-2 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={dialogInput}
                onChange={(e) => setDialogInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bm-surface)] text-gray-900 dark:text-gray-100"
                placeholder="Ask about your report..."
              />
              <button
                onClick={handleDialogSubmit}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
              >
                Ask
              </button>
            </div>
          </section>

          {liveReport.second_opinion_a && liveReport.second_opinion_b && (
            <section className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('reportsPage.secondOpinionTitle')}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowOpinion('a')}
                    className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                      showOpinion === 'a'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {t('reportsPage.opinionA')}
                  </button>
                  <button
                    onClick={() => setShowOpinion('b')}
                    className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                      showOpinion === 'b'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {t('reportsPage.opinionB')}
                  </button>
                  <button
                    onClick={() => setShowOpinion('both')}
                    className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                      showOpinion === 'both'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Both
                  </button>
                </div>
              </div>

              {(showOpinion === 'a' || showOpinion === 'both') && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Opinion A (Physiology)
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {liveReport.second_opinion_a}
                  </p>
                </div>
              )}

              {(showOpinion === 'b' || showOpinion === 'both') && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Opinion B (Lifestyle)
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {liveReport.second_opinion_b}
                  </p>
                </div>
              )}
            </section>
          )}

          {aggregatedOpinion && (
            <section className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('reportsPage.unifiedTitle')}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('reportsPage.unifiedBody')}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-semibold">
                  {aggregatedOpinion.consensusLabel} · Conflict {Math.round(aggregatedOpinion.conflictIndex * 100)}%
                </span>
              </div>

              <div className="bg-white dark:bg-[var(--bm-surface)]/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('reportsPage.unifiedSummary')}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {aggregatedOpinion.summary}
                </p>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>{aggregatedOpinion.refinement}</p>
                  <p>{aggregatedOpinion.notes}</p>
                  <p>Confidence: {Math.round(aggregatedOpinion.confidence * 100)}%</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white dark:bg-[var(--bm-surface)]/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Model Divergence</p>
                  <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${Math.round(aggregatedOpinion.conflictIndex * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Conflict {Math.round(aggregatedOpinion.conflictIndex * 100)}%
                  </p>
                </div>
                <div className="bg-white dark:bg-[var(--bm-surface)]/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Unified Confidence</p>
                  <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${Math.round(aggregatedOpinion.confidence * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Confidence {Math.round(aggregatedOpinion.confidence * 100)}%
                  </p>
                </div>
              </div>

              {modelScores && (
                <div className="bg-white dark:bg-[var(--bm-surface)]/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {t('reportsPage.modelRadar')}
                  </h3>
                  <ModelRadarComparison modelA={modelScores.a} modelB={modelScores.b} />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {aggregatedOpinion.agreements.length > 0 && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                      {t('reportsPage.agreements')}
                    </h3>
                    <ul className="space-y-2">
                      {aggregatedOpinion.agreements.map((item, idx) => (
                        <li key={idx} className="text-sm text-emerald-900 dark:text-emerald-100">
                          <span className="font-semibold">{item.topic}:</span> {item.consensus}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aggregatedOpinion.disagreements.length > 0 && (
                  <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-200 mb-2">
                      {t('reportsPage.disagreements')}
                    </h3>
                    <ul className="space-y-2">
                      {aggregatedOpinion.disagreements.map((item, idx) => (
                        <li key={idx} className="text-sm text-rose-900 dark:text-rose-100">
                          <span className="font-semibold">{item.topic}:</span> A: {item.opinionA} · B: {item.opinionB}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {aggregatedOpinion.recommendations.length > 0 && (
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    {t('reportsPage.combinedRecommendations')}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {aggregatedOpinion.recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-white dark:bg-[var(--bm-surface)]/60 border border-blue-100 dark:border-blue-900 rounded-lg p-3">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {rec.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {rec.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aggregatedOpinion.usedSources && aggregatedOpinion.usedSources.length > 0 && (
                <div className="mt-4 bg-white dark:bg-[var(--bm-surface)]/60 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('reportsPage.sourcesUsed')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {aggregatedOpinion.usedSources.map((source) => (
                      <span
                        key={source.key}
                        className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300"
                      >
                        {source.key.replace('-', ' ')} · {source.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-teal-200 dark:border-teal-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('reportsPage.planTitle')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('reportsPage.planBody')}
            </p>
            <button
              onClick={handleCreateGoal}
              className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-semibold"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              Create Plan
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
