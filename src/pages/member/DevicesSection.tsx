import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Watch, Plus, Trash2, RefreshCw, Check, X, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError, notifyUserSuccess } from '../../lib/adminNotify';
import ErrorBanner from '../../components/ui/ErrorBanner';
import StateCard from '../../components/ui/StateCard';
import ModalShell from '../../components/ui/ModalShell';
import Button from '../../components/ui/Button';
import ReportBrandHeader from '../../components/report/ReportBrandHeader';
import MemberMetricCard from '../../components/ui/MemberMetricCard';

interface Device {
  id: string;
  device_type: string;
  device_name: string;
  status: string;
  last_sync: string | null;
  sync_frequency: string;
  connected_at: string;
}

const DEVICE_TYPES = [
  { id: 'apple_watch', name: 'Apple Watch', icon: '⌚' },
  { id: 'fitbit', name: 'Fitbit', icon: '📊' },
  { id: 'oura', name: 'Oura Ring', icon: '💍' },
  { id: 'whoop', name: 'WHOOP', icon: '⚡' },
  { id: 'garmin', name: 'Garmin', icon: '🏃' },
  { id: 'cgm', name: 'CGM (Dexcom/Libre)', icon: '🩸' },
];

export default function DevicesSection() {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setError('Please sign in to view devices');
        return;
      }
      setUserId(user.user.id);

      const { data, error } = await supabase
        .from('device_connections')
        .select('*')
        .eq('user_id', user.user.id)
        .order('connected_at', { ascending: false });

      if (error) throw error;
      setDevices(data || []);
      setError(null);
    } catch (error) {
      notifyUserError('Device load failed');
      setError('Unable to load devices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (deviceType: string) => {
    try {
      const resolvedUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!resolvedUserId) {
        notifyUserError('Please sign in to connect a device');
        return;
      }

      const deviceInfo = DEVICE_TYPES.find(d => d.id === deviceType);
      if (!deviceInfo) return;

      const { error } = await supabase
        .from('device_connections')
        .insert({
          user_id: resolvedUserId,
          device_type: deviceType,
          device_name: deviceInfo.name,
          status: 'connected',
          sync_frequency: 'daily',
        });

      if (error) throw error;
      setShowConnectModal(false);
      notifyUserSuccess(`${deviceInfo.name} connected`);
      loadDevices();
    } catch (error) {
      notifyUserError('Device connection failed');
    }
  };

  const handleSync = async (id: string) => {
    try {
      const { error } = await supabase
        .from('device_connections')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      notifyUserSuccess('Device synced');
      loadDevices();
    } catch (error) {
      notifyUserError('Device sync failed');
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Disconnect this device?')) return;

    try {
      const { error } = await supabase
        .from('device_connections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      notifyUserSuccess('Device disconnected');
      loadDevices();
    } catch (error) {
      notifyUserError('Device disconnect failed');
    }
  };

  return (
    <div>
      <ReportBrandHeader
        title="BioMath Core"
        subtitle="Device Connections"
        variant="strip"
        className="mb-6"
      />

      <div className="mb-6 grid md:grid-cols-3 gap-4">
        <MemberMetricCard
          accent="blue"
          icon={<Activity className="h-6 w-6" />}
          value={devices.filter(d => d.status === 'connected').length}
          label={t('member.devices.activeDevices')}
        />
        <MemberMetricCard
          accent="green"
          icon={<RefreshCw className="h-6 w-6" />}
          value={devices.filter(d => d.last_sync).length}
          label={t('member.devices.recentlySynced')}
        />
        <MemberMetricCard
          accent="orange"
          icon={<Watch className="h-6 w-6" />}
          value={DEVICE_TYPES.length}
          label={t('member.devices.supportedDevices')}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold member-heading">{t('member.devices.yourDevices')}</h3>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => loadDevices()}>
            Refresh
          </Button>
          <button
            onClick={() => setShowConnectModal(true)}
            className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Connect Device
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} className="mb-4" />}

      {loading ? (
        <StateCard title="Loading devices..." description="Syncing your connected devices." />
      ) : devices.length === 0 ? (
        <StateCard
          title="No devices connected"
          description="Connect your wearable devices to start tracking health data automatically."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {devices.map((device) => (
            <div
              key={device.id}
              className="member-card rounded-xl p-6 hover:border-orange-500/30 transition-all shadow-sm"
            >
              <ReportBrandHeader
                variant="strip"
                subtitle={device.device_name || 'Device'}
                className="mb-4"
              />
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {DEVICE_TYPES.find(d => d.id === device.device_type)?.icon || '📱'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold member-heading">{device.device_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {device.status === 'connected' ? (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-600/30 text-green-700 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Connected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-600/30 text-red-700 dark:text-red-400 text-xs rounded-full flex items-center gap-1">
                          <X className="h-3 w-3" />
                          Disconnected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="member-muted">Last Sync:</span>
                  <span className="member-body font-medium">
                    {device.last_sync ? new Date(device.last_sync).toLocaleString() : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="member-muted">Frequency:</span>
                  <span className="member-body font-medium">{device.sync_frequency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="member-muted">Connected:</span>
                  <span className="member-body font-medium">{new Date(device.connected_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSync(device.id)}
                  className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Sync Now
                </button>
                <button
                  onClick={() => handleDisconnect(device.id)}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-600/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  title="Disconnect"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showConnectModal && (
        <ModalShell
          title="Connect Device"
          icon={<Watch className="h-6 w-6 text-orange-500" />}
          onClose={() => setShowConnectModal(false)}
          panelClassName="max-w-2xl"
        >
          <div className="grid md:grid-cols-2 gap-4">
            {DEVICE_TYPES.map((device) => (
              <button
                key={device.id}
                onClick={() => handleConnect(device.id)}
                className="p-6 member-card rounded-xl hover:bg-slate-50 hover:border-orange-300 transition-all text-left"
              >
                <div className="text-4xl mb-3">{device.icon}</div>
                <h3 className="text-lg font-semibold member-heading mb-2">{device.name}</h3>
                <p className="text-sm member-body">{t('member.devices.clickToConnect')}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowConnectModal(false)}
            className="w-full mt-6 px-6 py-2 bg-slate-200 member-body rounded-lg hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
        </ModalShell>
      )}
    </div>
  );
}
