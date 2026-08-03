import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Watch, Plus, Trash2, RefreshCw, Check, X, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError, notifyUserSuccess } from '../../lib/adminNotify';
import ErrorBanner from '../../components/ui/ErrorBanner';
import StateCard from '../../components/ui/StateCard';
import ModalShell from '../../components/ui/ModalShell';
import Button from '../../components/ui/Button';
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

const DEVICE_TYPE_IDS = [
  'apple_watch',
  'fitbit',
  'oura',
  'whoop',
  'garmin',
  'cgm',
] as const;

const DEVICE_ICONS: Record<string, string> = {
  apple_watch: '⌚',
  fitbit: '📊',
  oura: '💍',
  whoop: '⚡',
  garmin: '🏃',
  cgm: '🩸',
};

export default function DevicesSection() {
  const { t, i18n } = useTranslation();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const deviceName = (typeId: string) =>
    t(`member.devices.deviceTypes.${typeId}`, { defaultValue: typeId });

  const loadDevices = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setError(t('member.devices.signInRequired'));
        return;
      }
      setUserId(user.user.id);

      const { data, error: fetchError } = await supabase
        .from('device_connections')
        .select('*')
        .eq('user_id', user.user.id)
        .order('connected_at', { ascending: false });

      if (fetchError) throw fetchError;
      setDevices(data || []);
      setError(null);
    } catch {
      notifyUserError(t('member.devices.loadFailedNotify'));
      setError(t('member.devices.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (deviceType: string) => {
    try {
      const resolvedUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!resolvedUserId) {
        notifyUserError(t('member.devices.signInToConnect'));
        return;
      }

      const name = deviceName(deviceType);

      const { error: insertError } = await supabase.from('device_connections').insert({
        user_id: resolvedUserId,
        device_type: deviceType,
        device_name: name,
        status: 'connected',
        sync_frequency: 'daily',
      });

      if (insertError) throw insertError;
      setShowConnectModal(false);
      notifyUserSuccess(t('member.devices.connectedSuccess', { name }));
      loadDevices();
    } catch {
      notifyUserError(t('member.devices.connectionFailed'));
    }
  };

  const handleSync = async (id: string) => {
    try {
      const { error: syncError } = await supabase
        .from('device_connections')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', id);

      if (syncError) throw syncError;
      notifyUserSuccess(t('member.devices.syncSuccess'));
      loadDevices();
    } catch {
      notifyUserError(t('member.devices.syncFailed'));
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm(t('member.devices.disconnectConfirm'))) return;

    try {
      const { error: deleteError } = await supabase
        .from('device_connections')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      notifyUserSuccess(t('member.devices.disconnectSuccess'));
      loadDevices();
    } catch {
      notifyUserError(t('member.devices.disconnectFailed'));
    }
  };

  return (
    <div>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <MemberMetricCard
          accent="blue"
          icon={<Activity className="h-6 w-6" />}
          value={devices.filter((d) => d.status === 'connected').length}
          label={t('member.devices.activeDevices')}
        />
        <MemberMetricCard
          accent="green"
          icon={<RefreshCw className="h-6 w-6" />}
          value={devices.filter((d) => d.last_sync).length}
          label={t('member.devices.recentlySynced')}
        />
        <MemberMetricCard
          accent="orange"
          icon={<Watch className="h-6 w-6" />}
          value={DEVICE_TYPE_IDS.length}
          label={t('member.devices.supportedDevices')}
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="member-heading text-xl font-semibold">{t('member.devices.yourDevices')}</h3>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => loadDevices()}>
            {t('member.devices.refresh')}
          </Button>
          <button
            type="button"
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-2 text-white shadow-sm transition-all hover:from-orange-500 hover:to-orange-600"
          >
            <Plus className="h-4 w-4" />
            {t('member.devices.connectDevice')}
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} className="mb-4" />}

      {loading ? (
        <StateCard
          title={t('member.devices.loadingTitle')}
          description={t('member.devices.loadingBody')}
        />
      ) : devices.length === 0 ? (
        <StateCard
          title={t('member.devices.emptyTitle')}
          description={t('member.devices.emptyBody')}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {devices.map((device) => (
            <div
              key={device.id}
              className="member-card p-6 transition-all hover:border-orange-500/30"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {DEVICE_ICONS[device.device_type] || '📱'}
                  </div>
                  <div>
                    <h3 className="member-heading text-lg font-semibold">{device.device_name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      {device.status === 'connected' ? (
                        <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:border-green-600/30 dark:bg-green-900/30 dark:text-green-400">
                          <Check className="h-3 w-3" />
                          {t('member.devices.connected')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:border-red-600/30 dark:bg-red-900/30 dark:text-red-400">
                          <X className="h-3 w-3" />
                          {t('member.devices.disconnected')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="member-muted">{t('member.devices.lastSync')}</span>
                  <span className="member-body font-medium">
                    {device.last_sync
                      ? new Date(device.last_sync).toLocaleString(i18n.language)
                      : t('member.devices.never')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="member-muted">{t('member.devices.frequency')}</span>
                  <span className="member-body font-medium">{device.sync_frequency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="member-muted">{t('member.devices.connectedAt')}</span>
                  <span className="member-body font-medium">
                    {new Date(device.connected_at).toLocaleDateString(i18n.language)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSync(device.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-100 px-4 py-2 text-blue-700 transition-colors hover:bg-blue-200 dark:border-blue-600/30 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('member.devices.syncNow')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDisconnect(device.id)}
                  className="rounded-lg border border-red-200 bg-red-100 px-4 py-2 text-red-700 transition-colors hover:bg-red-200 dark:border-red-600/30 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  title={t('member.devices.disconnect')}
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
          title={t('member.devices.connectModalTitle')}
          icon={<Watch className="h-6 w-6 text-orange-500" />}
          onClose={() => setShowConnectModal(false)}
          panelClassName="max-w-2xl"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {DEVICE_TYPE_IDS.map((deviceId) => (
              <button
                key={deviceId}
                type="button"
                onClick={() => handleConnect(deviceId)}
                className="member-card rounded-xl p-6 text-left transition-all hover:border-orange-300"
              >
                <div className="mb-3 text-4xl">{DEVICE_ICONS[deviceId]}</div>
                <h3 className="member-heading mb-2 text-lg font-semibold">{deviceName(deviceId)}</h3>
                <p className="member-body text-sm">{t('member.devices.clickToConnect')}</p>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowConnectModal(false)}
            className="member-body mt-6 w-full rounded-lg bg-[var(--bm-surface)] px-6 py-2 transition-colors hover:bg-[var(--bm-border)]"
          >
            {t('member.devices.cancel')}
          </button>
        </ModalShell>
      )}
    </div>
  );
}
