import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Watch,
  Trash2,
  RefreshCw,
  Check,
  X,
  Activity,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError, notifyUserInfo, notifyUserSuccess } from '../../lib/adminNotify';
import ErrorBanner from '../../components/ui/ErrorBanner';
import StateCard from '../../components/ui/StateCard';
import Button from '../../components/ui/Button';
import MemberMetricCard from '../../components/ui/MemberMetricCard';
import DeviceProductCard from '../../components/DeviceProductCard';
import {
  connectableDeviceIds,
  deviceCatalog,
} from '../../data/deviceCatalog';
import { DeviceIconGlyph } from '../../data/deviceIcons';

interface Device {
  id: string;
  device_type: string;
  device_name: string;
  status: string;
  last_sync: string | null;
  sync_frequency: string;
  connected_at: string;
}

export default function DevicesSection() {
  const { t, i18n } = useTranslation();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const deviceName = (typeId: string) =>
    t(`member.devices.deviceTypes.${typeId}`, {
      defaultValue: t(`devicesPage.items.${typeId}.name`, { defaultValue: typeId }),
    });

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
      notifyUserSuccess(t('member.devices.linkedSuccess', { name }));
      notifyUserInfo(t('member.devices.linkAccountNote'));
      loadDevices();
    } catch {
      notifyUserError(t('member.devices.connectionFailed'));
    }
  };

  const linkedTypeIds = new Set(devices.map((d) => d.device_type));

  const handleSync = async (id: string) => {
    try {
      const { error: syncError } = await supabase
        .from('device_connections')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', id);

      if (syncError) throw syncError;
      notifyUserInfo(t('member.devices.syncDemoNote'));
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
      <p className="mb-4 text-xs member-muted">{t('member.devices.linkAccountNote')}</p>

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
          value={connectableDeviceIds.length}
          label={t('member.devices.supportedDevices')}
        />
      </div>

      <p className="member-muted mb-6 text-sm">{t('member.devices.catalogNote')}</p>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="member-heading text-xl font-semibold">{t('member.devices.yourDevices')}</h3>
        <Button size="sm" onClick={() => loadDevices()}>
          {t('member.devices.refresh')}
        </Button>
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
        <div className="mb-10 grid gap-4 md:grid-cols-2">
          {devices.map((device) => {
            return (
              <div
                key={device.id}
                className="member-card overflow-hidden transition-all hover:border-orange-500/30"
              >
                <div className="p-5">
                  <div className="mb-4 flex items-start gap-3">
                    <DeviceIconGlyph itemId={device.device_type} size="sm" />
                    <div className="min-w-0 flex-1">
                      <h3 className="member-heading text-lg font-semibold">{device.device_name}</h3>
                      <div className="mt-1.5 flex items-center gap-2">
                        {device.status === 'connected' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-800 ring-1 ring-inset ring-sky-500/20 dark:text-sky-300">
                            <Check className="h-3 w-3" />
                            {t('devicesPage.cardStatus.connected')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-500/10 px-2.5 py-0.5 text-xs font-medium text-neutral-700 ring-1 ring-inset ring-neutral-500/15 dark:text-neutral-300">
                            <X className="h-3 w-3" />
                            {t('devicesPage.cardStatus.notConnected')}
                          </span>
                        )}
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
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-500"
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t('member.devices.markSynced')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDisconnect(device.id)}
                      className="bm-link rounded-lg px-3 py-2 text-red-700 dark:text-red-400"
                      title={t('member.devices.disconnect')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="member-heading text-xl font-semibold">
            {t('member.devices.linkModalTitle')}
          </h3>
          <p className="member-muted mt-2 text-sm">{t('member.devices.linkModalBody')}</p>
        </div>

        {deviceCatalog.map((category) => (
          <div key={category.id}>
            <h4 className="member-heading mb-3 text-base font-semibold">
              {t(`devicesPage.categories.${category.id}.title`)}
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item) => {
                const linked = linkedTypeIds.has(item.id);
                return (
                  <DeviceProductCard
                    key={item.id}
                    itemId={item.id}
                    capabilities={item.capabilities}
                    realtime={Boolean(item.realtime)}
                    status={linked ? 'connected' : 'notConnected'}
                    memberTone
                    actionLabel={
                      linked ? t('member.devices.linked') : t('member.devices.clickToLink')
                    }
                    onAction={() => {
                      if (!linked) handleConnect(item.id);
                    }}
                    actionDisabled={linked}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
