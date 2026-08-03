import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, FileText, Radar, TrendingUp, RefreshCw } from 'lucide-react';
import MemberMetricCard from '../../components/ui/MemberMetricCard';
import { loadKnowledgeSnapshot, loadKnowledgeTimeline } from '../../lib/secondOpinionEngine';
import { supabase } from '../../lib/supabase';

type TimelineEntry = {
  timestamp: string;
  signals: Record<string, number>;
  totalSignals: number;
};

export default function SignalHubSection() {
  const { t, i18n } = useTranslation();
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

  const sourceCards = useMemo(() => snapshot?.sources || [], [snapshot]);

  const signalScore = useMemo(() => {
    if (!snapshot) return 0;
    return Math.min(100, Math.round((snapshot.totalSignals / 50) * 100));
  }, [snapshot]);

  const trendPoints = useMemo(() => {
    const items = timeline.slice(-12);
    if (items.length === 0) return [];
    const max = Math.max(...items.map((entry) => entry.totalSignals), 1);
    return items.map((entry, idx) => ({
      x: idx,
      y: Math.round((entry.totalSignals / max) * 100),
    }));
  }, [timeline]);

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString(i18n.language);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(i18n.language);

  const formatSourceKey = (key: string) =>
    key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const handleRefresh = () => {
    setSnapshot(loadKnowledgeSnapshot(userId));
    setTimeline(loadKnowledgeTimeline(userId) as TimelineEntry[]);
  };

  return (
    <div>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <MemberMetricCard
          accent="orange"
          value={signalScore}
          label={t('member.signalHub.signalScore')}
          hint={t('member.signalHub.readiness')}
        />
        <MemberMetricCard
          accent="blue"
          value={snapshot?.totalSignals || 0}
          label={t('member.signalHub.totalSignals')}
          hint={t('member.signalHub.acrossSources')}
        />
        <MemberMetricCard
          accent="emerald"
          value={
            snapshot?.updatedAt
              ? formatDateTime(snapshot.updatedAt)
              : t('member.signalHub.noUpdatesYet')
          }
          label={t('member.signalHub.latestUpdate')}
          hint={t('member.signalHub.lastRefresh')}
        />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="member-card p-6">
          <h3 className="member-heading mb-4 text-base font-semibold">{t('member.signalHub.sources')}</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {sourceCards.map((source) => (
              <div
                key={source.key}
                className="rounded-lg border border-[var(--bm-border)] bg-[var(--bm-surface)]/40 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="member-heading font-semibold">{formatSourceKey(source.key)}</span>
                  <span className="member-muted text-xs">{source.count}</span>
                </div>
                <p className="member-muted mt-1 text-xs">
                  {source.lastUpdated
                    ? formatDate(source.lastUpdated)
                    : t('member.signalHub.noDataYet')}
                </p>
              </div>
            ))}
            {sourceCards.length === 0 && (
              <p className="member-muted col-span-2 text-sm">{t('member.signalHub.emptySources')}</p>
            )}
          </div>
        </div>

        <div className="member-card p-6">
          <h3 className="member-heading mb-4 text-base font-semibold">{t('member.signalHub.impactRadar')}</h3>
          <div className="space-y-3 text-sm">
            <div className="member-body flex items-center gap-2">
              <Radar className="h-4 w-4 text-orange-500" />
              {t('member.signalHub.radarReports')}
            </div>
            <div className="member-body flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              {t('member.signalHub.radarMoreSignals')}
            </div>
            <div className="member-body flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              {t('member.signalHub.radarFiles')}
            </div>
            <div className="member-body flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              {t('member.signalHub.radarDevices')}
            </div>
          </div>
        </div>
      </div>

      <div className="member-card mb-6 p-6">
        <h3 className="member-heading mb-4 text-base font-semibold">{t('member.signalHub.signalTrendline')}</h3>
        {trendPoints.length === 0 ? (
          <p className="member-muted text-sm">{t('member.signalHub.noSignalHistory')}</p>
        ) : (
          <div className="flex h-24 items-end gap-1">
            {trendPoints.map((pt) => (
              <div
                key={pt.x}
                className="flex-1 rounded-t bg-orange-500/70"
                style={{ height: `${pt.y}%` }}
              />
            ))}
          </div>
        )}
        <p className="member-muted mt-2 text-xs">{t('member.signalHub.trendlineHint')}</p>
      </div>

      <div className="member-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="member-heading text-base font-semibold">{t('member.signalHub.signalTimeline')}</h3>
          <button
            type="button"
            onClick={handleRefresh}
            className="member-btn flex items-center gap-2 px-3 py-2 text-xs"
          >
            <RefreshCw className="h-4 w-4" />
            {t('member.signalHub.refresh')}
          </button>
        </div>
        <div className="space-y-2 text-xs">
          {timeline.length === 0 && (
            <p className="member-muted">{t('member.signalHub.noSignalUpdates')}</p>
          )}
          {timeline.slice(-10).reverse().map((entry) => (
            <div key={entry.timestamp} className="member-body flex items-center justify-between gap-3">
              <span className="member-muted">{formatDateTime(entry.timestamp)}</span>
              <span className="flex-1 truncate">
                {t('member.signalHub.signalsLabel')}:{' '}
                {Object.keys(entry.signals).join(', ') || t('member.signalHub.updateFallback')}
              </span>
              <span className="member-muted">
                {t('member.signalHub.totalLabel')} {entry.totalSignals}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
