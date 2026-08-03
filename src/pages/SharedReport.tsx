import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { getShareableReport } from '../lib/shareableReports';
import ReportViewer from '../components/report/ReportViewer';
import type { HealthReport } from '../types/database';

type Props = {
  shareToken: string;
  onNavigate: (page: string) => void;
};

export default function SharedReport({ shareToken, onNavigate }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<(HealthReport & { report_title?: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const shared = await getShareableReport(shareToken);
        if (!shared) {
          if (!cancelled) setError(t('member.reports.noBody'));
          return;
        }
        const data = (shared.report_data || {}) as Partial<HealthReport>;
        if (!cancelled) {
          setReport({
            id: shared.report_id || shared.id,
            user_id: shared.user_id,
            report_type: (data.report_type as HealthReport['report_type']) || 'general',
            topic: shared.title,
            report_title: shared.title,
            summary: data.summary || shared.description || '',
            insights: Array.isArray(data.insights) ? data.insights : [],
            analysis: data.analysis || '',
            recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
            device_data: null,
            second_opinion_a: data.second_opinion_a || null,
            second_opinion_b: data.second_opinion_b || null,
            created_at: data.created_at || shared.created_at,
            updated_at: shared.created_at,
            status: 'completed',
          });
        }
      } catch {
        if (!cancelled) setError(t('member.reports.loadFailed'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shareToken, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-page pt-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-sm text-gray-500">{t('member.reports.loading')}</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-page pt-20 flex flex-col items-center justify-center gap-3 px-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">{error || t('member.reports.noBody')}</p>
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white"
        >
          {t('member.reports.close')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page pt-16">
      <ReportViewer report={report} onClose={() => onNavigate('home')} />
    </div>
  );
}
