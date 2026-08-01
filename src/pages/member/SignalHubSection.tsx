import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Database, FileText, Radar, TrendingUp, RefreshCw } from 'lucide-react';
import ReportBrandHeader from '../../components/report/ReportBrandHeader';
import { loadKnowledgeSnapshot, loadKnowledgeTimeline } from '../../lib/secondOpinionEngine';
import { supabase } from '../../lib/supabase';

type TimelineEntry = {
  timestamp: string;
  signals: Record<string, number>;
  totalSignals: number;
};

export default function SignalHubSection() {
  const { t } = useTranslation();
  const [userId, setUserId] = useState('guest');
  const [snapshot, setSnapshot] = useState(() => loadKnowledgeSnapshot('guest'));
  const [timeline, setTimeline] = useState<TimelineEntry[]>(loadKnowledgeTimeline('guest') as TimelineEntry[]);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        setUserId(user.id);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const refresh = () => {
      const next = loadKnowledgeSnapshot(userId);
      setSnapshot(next);
      setTimeline(loadKnowledgeTimeline(userId) as TimelineEntry[]);
    };
    const interval = window.setInterval(refresh, 10000);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', refresh);
    };
  }, [userId]);

  const sourceCards = useMemo(() => {
    return snapshot?.sources || [];
  }, [snapshot]);

  const signalScore = useMemo(() => {
    if (!snapshot) return 0;
    return Math.min(100, Math.round((snapshot.totalSignals / 50) * 100));
  }, [snapshot]);

  const trendPoints = useMemo(() => {
    const items = timeline.slice(-12);
    if (items.length === 0) return [];
    const max = Math.max(...items.map((t) => t.totalSignals), 1);
    return items.map((t, idx) => ({
      x: idx,
      y: Math.round((t.totalSignals / max) * 100),
    }));
  }, [timeline]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2 flex items-center gap-3">
          <Database className="h-8 w-8 text-orange-500" />
          {t('member.signalHub.title')}
        </h1>
        <p className="text-gray-600">
          {t('member.signalHub.subtitle')}
        </p>
      </div>

      <ReportBrandHeader title="BioMath Core" subtitle="Signal Hub" variant="strip" className="mb-6" />

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[var(--bm-surface)] rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <ReportBrandHeader variant="strip" subtitle="Signal Score" className="mb-3" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{signalScore}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('member.signalHub.readiness')}</p>
        </div>
        <div className="bg-white dark:bg-[var(--bm-surface)] rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <ReportBrandHeader variant="strip" subtitle="Total Signals" className="mb-3" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{snapshot?.totalSignals || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('member.signalHub.acrossSources')}</p>
        </div>
        <div className="bg-white dark:bg-[var(--bm-surface)] rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <ReportBrandHeader variant="strip" subtitle="Latest Update" className="mb-3" />
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {snapshot?.updatedAt ? new Date(snapshot.updatedAt).toLocaleString('en-US') : 'No updates yet'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('member.signalHub.lastRefresh')}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-[var(--bm-surface)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <ReportBrandHeader variant="strip" subtitle="Sources" className="mb-4" />
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
            {sourceCards.map((source) => (
              <div key={source.key} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[var(--bm-surface)]/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold capitalize">{source.key.replace('-', ' ')}</span>
                  <span className="text-xs text-gray-500">{source.count}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {source.lastUpdated ? new Date(source.lastUpdated).toLocaleDateString('en-US') : 'No data yet'}
                </p>
              </div>
            ))}
            {sourceCards.length === 0 && (
              <p className="text-sm text-gray-500">No sources yet. Generate a report to populate signals.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--bm-surface)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <ReportBrandHeader variant="strip" subtitle="Impact Radar" className="mb-4" />
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Radar className="h-4 w-4 text-orange-500" />
              Reports draw from every source to increase clarity.
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              More signals = higher confidence and richer insights.
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Files and questionnaires strengthen context.
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              Device data makes trends sharper.
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[var(--bm-surface)] rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
        <ReportBrandHeader variant="strip" subtitle="Signal Trendline" className="mb-4" />
        {trendPoints.length === 0 ? (
          <p className="text-sm text-gray-500">No signal history yet.</p>
        ) : (
          <div className="h-24 flex items-end gap-1">
            {trendPoints.map((pt) => (
              <div
                key={pt.x}
                className="flex-1 rounded-t bg-orange-500/70"
                style={{ height: `${pt.y}%` }}
              />
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-gray-500">Recent signal activity (last 12 updates).</p>
      </div>

      <div className="bg-white dark:bg-[var(--bm-surface)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <ReportBrandHeader variant="strip" subtitle="Signal Timeline" />
          <button
            onClick={() => {
              setSnapshot(loadKnowledgeSnapshot(userId));
              setTimeline(loadKnowledgeTimeline(userId) as TimelineEntry[]);
            }}
            className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
          {timeline.length === 0 && <p>No signal updates yet.</p>}
          {timeline.slice(-10).reverse().map((entry) => (
            <div key={entry.timestamp} className="flex items-center justify-between gap-3">
              <span className="text-gray-500 dark:text-gray-400">
                {new Date(entry.timestamp).toLocaleString('en-US')}
              </span>
              <span className="flex-1 truncate">Signals: {Object.keys(entry.signals).join(', ') || 'update'}</span>
              <span className="text-gray-500 dark:text-gray-400">Total {entry.totalSignals}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
