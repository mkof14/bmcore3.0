import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Database, Zap, Server, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import ReportBrandHeader from '../../components/report/ReportBrandHeader';
import MemberMetricCard from '../../components/ui/MemberMetricCard';

export default function SystemSection() {
  const { t } = useTranslation();
  const [processes, setProcesses] = useState([
    { id: 1, name: 'Health Guide', status: 'running', uptime: '99.8%', load: 23 },
    { id: 2, name: 'Data Sync Engine', status: 'running', uptime: '99.9%', load: 45 },
    { id: 3, name: 'Report Generator', status: 'running', uptime: '98.5%', load: 67 },
    { id: 4, name: 'Device Integration', status: 'running', uptime: '99.2%', load: 34 },
    { id: 5, name: 'Analytics Pipeline', status: 'running', uptime: '99.7%', load: 56 },
  ]);

  const [systemStats, setSystemStats] = useState({
    totalRequests: 12453,
    activeConnections: 142,
    avgResponseTime: 127,
    errorRate: 0.02,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setProcesses(prev => prev.map(p => ({
        ...p,
        load: Math.max(10, Math.min(90, p.load + (Math.random() - 0.5) * 10))
      })));

      setSystemStats(prev => ({
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 10),
        activeConnections: Math.max(100, prev.activeConnections + Math.floor((Math.random() - 0.5) * 20)),
        avgResponseTime: Math.max(50, Math.min(200, prev.avgResponseTime + (Math.random() - 0.5) * 20)),
        errorRate: Math.max(0, Math.min(1, prev.errorRate + (Math.random() - 0.5) * 0.01))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
<ReportBrandHeader
        title="BioMath Core"
        subtitle="System Status"
        variant="strip"
        className="mb-6"
      />

      <div className="mb-6 grid md:grid-cols-4 gap-4">
        <MemberMetricCard
          accent="blue"
          icon={<Activity className="h-6 w-6" />}
          value={systemStats.totalRequests.toLocaleString()}
          label={t('member.system.totalRequests')}
          hint={<span className="text-green-600 dark:text-green-400">+{Math.floor(Math.random() * 50)} / min</span>}
        />
        <MemberMetricCard
          accent="green"
          icon={<Server className="h-6 w-6" />}
          value={systemStats.activeConnections}
          label={t('member.system.activeConnections')}
          hint="Real-time"
        />
        <MemberMetricCard
          accent="orange"
          icon={<Clock className="h-6 w-6" />}
          value={`${Math.round(systemStats.avgResponseTime)}ms`}
          label={t('member.system.avgResponseTime')}
          hint={<span className="text-green-600 dark:text-green-400">Optimal</span>}
        />
        <MemberMetricCard
          accent="purple"
          icon={<Zap className="h-6 w-6" />}
          value={`${(systemStats.errorRate * 100).toFixed(2)}%`}
          label={t('member.system.errorRate')}
          hint={<span className="text-green-600 dark:text-green-400">Healthy</span>}
        />
      </div>

      <div className="member-card rounded-xl p-6 shadow-sm">
        <ReportBrandHeader variant="strip" subtitle="Process Monitor" className="mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-orange-500" />
            Live System Processes
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-neutral-300">Monitoring</span>
          </div>
        </div>

        <div className="space-y-3">
          {processes.map((process) => (
            <div
              key={process.id}
              className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/30 rounded-lg p-4 hover:border-orange-500/30 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    process.status === 'running'
                      ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-600/30'
                      : 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-600/30'
                  }`}>
                    {process.status === 'running' ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{process.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 dark:text-neutral-400">Uptime: {process.uptime}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  process.status === 'running'
                    ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-600/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-600/30 text-red-700 dark:text-red-400'
                }`}>
                  {process.status}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="text-gray-600 dark:text-neutral-300">Load</span>
                  <span className="text-gray-900 dark:text-white font-mono">{Math.round(process.load)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      process.load > 70 ? 'bg-red-500' :
                      process.load > 50 ? 'bg-orange-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${process.load}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="member-card rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('member.system.apiKeys')}</h3>
          <p className="text-sm text-gray-600 dark:text-neutral-300 mb-4">{t('member.system.apiKeysBody')}</p>
          <button className="w-full px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
            Manage API Keys
          </button>
        </div>

        <div className="member-card rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('member.system.dataExport')}</h3>
          <p className="text-sm text-gray-600 dark:text-neutral-300 mb-4">{t('member.system.dataExportBody')}</p>
          <button className="w-full px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-600/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
}
