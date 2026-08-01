import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Eye, Clock, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError, notifyUserInfo } from '../../lib/adminNotify';
import ErrorBanner from '../../components/ui/ErrorBanner';
import Button from '../../components/ui/Button';
import ReportBrandHeader from '../../components/report/ReportBrandHeader';
import { loadKnowledgeSnapshot } from '../../lib/secondOpinionEngine';

interface Report {
  id: string;
  report_title: string;
  report_type: string;
  status: string;
  created_at: string;
}

export default function MyReportsSection() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [coverage, setCoverage] = useState<Record<string, number>>({});

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
      if (event.key.includes(`bmcore.knowledge.${userId}`) || event.key.startsWith('bmcore.medical.files')) {
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

  const loadReports = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setError('Please sign in to view reports');
        return;
      }
      setUserId(user.user.id);

      const { data, error } = await supabase
        .from('health_reports')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
      setError(null);
    } catch (error) {
      notifyUserError('Reports load failed');
      setError('Unable to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = filterType === 'all'
    ? reports
    : reports.filter(r => r.report_type === filterType);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      try {
        localStorage.setItem('bmcore.report.favorites', JSON.stringify(next));
      } catch {
        // ignore
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
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-600/30 text-green-700 dark:text-green-400';
      case 'processing': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-600/30 text-blue-700 dark:text-blue-400';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-600/30 text-yellow-700 dark:text-yellow-400';
      default: return 'bg-gray-100 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600/30 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <FileText className="h-8 w-8 text-orange-500" />
          {t('member.reports.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('member.reports.subtitle')}
        </p>
      </div>

      <ReportBrandHeader
        title="BioMath Core"
        subtitle="Report Library"
        compact
        className="mb-6"
      />

      <div className="mb-6 bg-white dark:bg-[var(--bm-surface)]/60 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <ReportBrandHeader variant="strip" subtitle="Data Coverage" className="mb-3" />
        <div className="grid md:grid-cols-3 gap-3 text-xs text-gray-700 dark:text-gray-300">
          {['profile', 'devices', 'reports', 'inputs', 'documents', 'services'].map((key) => (
            <div key={key} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[var(--bm-surface)]/40 p-3">
              <div className="flex items-center justify-between">
                <span className="capitalize">{key.replace('-', ' ')}</span>
                <span className="text-gray-500">{coverage[key] || 0}</span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, (coverage[key] || 0) * 10)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">Tip: add device data or files to increase coverage.</p>
      </div>

      <div className="mb-6 grid md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-gradient-to-br dark:from-blue-900/30 dark:via-blue-800/20 dark:to-[var(--bm-surface)] border border-blue-200 dark:border-blue-600/30 rounded-xl p-4">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{reports.length}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{t('member.reports.totalReports')}</p>
        </div>

        <div className="bg-green-50 dark:bg-gradient-to-br dark:from-green-900/30 dark:via-green-800/20 dark:to-[var(--bm-surface)] border border-green-200 dark:border-green-600/30 rounded-xl p-4">
          <Clock className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {reports.filter(r => r.status === 'completed').length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
        </div>

        <div className="bg-orange-50 dark:bg-gradient-to-br dark:from-orange-900/30 dark:via-orange-800/20 dark:to-[var(--bm-surface)] border border-orange-200 dark:border-orange-600/30 rounded-xl p-4">
          <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {reports.filter(r => r.status === 'processing').length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Processing</p>
        </div>

        <div className="bg-purple-50 dark:bg-gradient-to-br dark:from-purple-900/30 dark:via-purple-800/20 dark:to-[var(--bm-surface)] border border-purple-200 dark:border-purple-600/30 rounded-xl p-4">
          <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {reports[0] ? new Date(reports[0].created_at).toLocaleDateString() : 'N/A'}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{t('member.reports.latestReport')}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-orange-600 text-white'
                : 'bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setFilterType('comprehensive')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'comprehensive'
                ? 'bg-orange-600 text-white'
                : 'bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            Comprehensive
          </button>
          <button
            onClick={() => setFilterType('focused')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'focused'
                ? 'bg-orange-600 text-white'
                : 'bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            Focused
          </button>
        </div>

        <button
          onClick={() => notifyUserInfo('Generate New Report will redirect to the Reports page.')}
          className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Generate New Report
        </button>
        <Button onClick={loadReports} className="flex items-center gap-2">
          Refresh
        </Button>
      </div>

      {error && <ErrorBanner message={error} className="mb-4" />}

      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading reports...</div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-500 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-400 mb-2">{t('member.reports.empty')}</p>
          <p className="text-sm text-gray-600 dark:text-gray-500">{t('member.reports.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-gradient-to-br dark:from-[var(--bm-surface)] dark:via-gray-800 dark:to-[var(--bm-surface)] border border-gray-200 dark:border-gray-700/50 rounded-xl p-6 hover:border-orange-500/30 transition-all cursor-pointer"
            >
              <ReportBrandHeader
                variant="strip"
                subtitle={report.report_type}
                className="mb-4"
              />
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-600/30 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {report.report_title}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-500">Type:</span>
                  <span className="text-gray-700 dark:text-gray-300 capitalize">{report.report_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-500">Generated:</span>
                  <span className="text-gray-700 dark:text-gray-300">{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-500">Notes:</span>
                  <span className="text-gray-700 dark:text-gray-300">{hasNotes(report.id) ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => notifyUserInfo(`Viewing report: ${report.report_title}`)}
                  className="flex-1 p-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-600/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button
                  onClick={() => toggleFavorite(report.id)}
                  className={`px-3 py-2 rounded-lg border text-xs ${
                    favorites.includes(report.id)
                      ? 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-500/40 dark:bg-yellow-500/10 dark:text-yellow-300'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  {favorites.includes(report.id) ? '★' : '☆'}
                </button>
                <button
                  onClick={() => notifyUserInfo(`Downloading report: ${report.report_title}`)}
                  className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-100 dark:bg-green-900/30 dark:border-green-600/30 dark:text-green-300 dark:hover:bg-green-900/50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
