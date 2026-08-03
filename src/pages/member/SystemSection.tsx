import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Database, Zap, Server, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import MemberMetricCard from '../../components/ui/MemberMetricCard';

type ProcessStatus = 'running' | 'stopped';

type Process = {
  id: number;
  nameKey: string;
  status: ProcessStatus;
  uptime: string;
  load: number;
};

export default function SystemSection() {
  const { t } = useTranslation();
  const [processes, setProcesses] = useState<Process[]>([
    { id: 1, nameKey: 'processHealthGuide', status: 'running', uptime: '99.8%', load: 23 },
    { id: 2, nameKey: 'processDataSync', status: 'running', uptime: '99.9%', load: 45 },
    { id: 3, nameKey: 'processReportGen', status: 'running', uptime: '98.5%', load: 67 },
    { id: 4, nameKey: 'processDeviceIntegration', status: 'running', uptime: '99.2%', load: 34 },
    { id: 5, nameKey: 'processAnalytics', status: 'running', uptime: '99.7%', load: 56 },
  ]);

  const [systemStats, setSystemStats] = useState({
    totalRequests: 12453,
    activeConnections: 142,
    avgResponseTime: 127,
    errorRate: 0.02,
    requestsDelta: 24,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setProcesses((prev) =>
        prev.map((p) => ({
          ...p,
          load: Math.max(10, Math.min(90, p.load + (Math.random() - 0.5) * 10)),
        }))
      );

      setSystemStats((prev) => ({
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 10),
        activeConnections: Math.max(
          100,
          prev.activeConnections + Math.floor((Math.random() - 0.5) * 20)
        ),
        avgResponseTime: Math.max(
          50,
          Math.min(200, prev.avgResponseTime + (Math.random() - 0.5) * 20)
        ),
        errorRate: Math.max(0, Math.min(1, prev.errorRate + (Math.random() - 0.5) * 0.01)),
        requestsDelta: Math.floor(Math.random() * 50),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const statusLabel = (status: ProcessStatus) =>
    status === 'running' ? t('member.system.statusRunning') : t('member.system.statusStopped');

  return (
    <div>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MemberMetricCard
          accent="blue"
          icon={<Activity className="h-6 w-6" />}
          value={systemStats.totalRequests.toLocaleString()}
          label={t('member.system.totalRequests')}
          hint={
            <span className="text-green-600 dark:text-green-400">
              +{systemStats.requestsDelta} {t('member.system.perMin')}
            </span>
          }
        />
        <MemberMetricCard
          accent="green"
          icon={<Server className="h-6 w-6" />}
          value={systemStats.activeConnections}
          label={t('member.system.activeConnections')}
          hint={t('member.system.realTime')}
        />
        <MemberMetricCard
          accent="orange"
          icon={<Clock className="h-6 w-6" />}
          value={`${Math.round(systemStats.avgResponseTime)}ms`}
          label={t('member.system.avgResponseTime')}
          hint={
            <span className="text-green-600 dark:text-green-400">{t('member.system.optimal')}</span>
          }
        />
        <MemberMetricCard
          accent="purple"
          icon={<Zap className="h-6 w-6" />}
          value={`${(systemStats.errorRate * 100).toFixed(2)}%`}
          label={t('member.system.errorRate')}
          hint={
            <span className="text-green-600 dark:text-green-400">{t('member.system.healthy')}</span>
          }
        />
      </div>

      <div className="member-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="member-heading flex items-center gap-2 text-xl font-semibold">
            <Database className="h-5 w-5 text-orange-500" />
            {t('member.system.liveProcesses')}
          </h3>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="member-body text-sm">{t('member.system.monitoring')}</span>
          </div>
        </div>

        <div className="space-y-3">
          {processes.map((process) => (
            <div
              key={process.id}
              className="rounded-lg border border-[var(--bm-border)] bg-[var(--bm-surface)]/40 p-4 transition-all hover:border-orange-500/30"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${
                      process.status === 'running'
                        ? 'border border-green-200 bg-green-100 dark:border-green-600/30 dark:bg-green-900/30'
                        : 'border border-red-200 bg-red-100 dark:border-red-600/30 dark:bg-red-900/30'
                    }`}
                  >
                    {process.status === 'running' ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="member-heading font-semibold">
                      {t(`member.system.${process.nameKey}`)}
                    </h4>
                    <p className="member-muted text-xs">
                      {t('member.system.uptime')}: {process.uptime}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    process.status === 'running'
                      ? 'border border-green-200 bg-green-100 text-green-700 dark:border-green-600/30 dark:bg-green-900/30 dark:text-green-400'
                      : 'border border-red-200 bg-red-100 text-red-700 dark:border-red-600/30 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {statusLabel(process.status)}
                </span>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="member-body">{t('member.system.load')}</span>
                  <span className="member-heading font-mono">{Math.round(process.load)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--bm-border)]">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      process.load > 70
                        ? 'bg-red-500'
                        : process.load > 50
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${process.load}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="member-card p-6">
          <h3 className="member-heading mb-4 text-lg font-semibold">{t('member.system.apiKeys')}</h3>
          <p className="member-body mb-4 text-sm">{t('member.system.apiKeysBody')}</p>
          <button
            type="button"
            className="w-full rounded-lg border border-blue-200 bg-blue-100 px-4 py-2 text-blue-700 transition-colors hover:bg-blue-200 dark:border-blue-600/30 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
          >
            {t('member.system.manageApiKeys')}
          </button>
        </div>

        <div className="member-card p-6">
          <h3 className="member-heading mb-4 text-lg font-semibold">{t('member.system.dataExport')}</h3>
          <p className="member-body mb-4 text-sm">{t('member.system.dataExportBody')}</p>
          <button
            type="button"
            className="w-full rounded-lg border border-green-200 bg-green-100 px-4 py-2 text-green-700 transition-colors hover:bg-green-200 dark:border-green-600/30 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
          >
            {t('member.system.exportData')}
          </button>
        </div>
      </div>
    </div>
  );
}
