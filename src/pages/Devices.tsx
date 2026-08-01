import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Watch,
  Activity,
  Droplet,
  Heart,
  Scale,
  Gauge,
  CheckCircle,
  RefreshCw,
  Trash2,
  Info,
  Shield,
  TrendingUp,
  Zap,
  Clock,
  BookOpen,
  Moon,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { DeviceBrand, UserDevice } from '../types/database';
import DeviceEducation from '../components/DeviceEducation';
import {
  ConnectionHint,
  OpeningHint,
  SuccessConnectionHint,
  WhyDevicesHint,
  ErrorRecoveryHint,
} from '../components/DeviceHints';
import {
  deviceCatalog,
  deviceSignalKeys,
  type DeviceCatalogCategoryId,
} from '../data/deviceCatalog';

interface DevicesProps {
  onNavigate: (page: string) => void;
}

function categoryIcon(category: string) {
  switch (category) {
    case 'smartwatch':
      return <Watch className="h-6 w-6" />;
    case 'fitness_tracker':
      return <Activity className="h-6 w-6" />;
    case 'smart_ring':
      return <Heart className="h-6 w-6" />;
    case 'recovery':
      return <Activity className="h-6 w-6" />;
    case 'cgm':
      return <Droplet className="h-6 w-6" />;
    case 'blood_pressure':
      return <Gauge className="h-6 w-6" />;
    case 'body_composition':
      return <Scale className="h-6 w-6" />;
    case 'sleep_home':
      return <Moon className="h-6 w-6" />;
    default:
      return <Activity className="h-6 w-6" />;
  }
}

export default function Devices(_props: DevicesProps) {
  const { t } = useTranslation();
  const [brands, setBrands] = useState<DeviceBrand[]>([]);
  const [userDevices, setUserDevices] = useState<UserDevice[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<DeviceBrand | null>(null);
  const [step, setStep] = useState<'select' | 'explain' | 'authorize' | 'success'>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<DeviceCatalogCategoryId | null>(
    'smartwatch',
  );

  useEffect(() => {
    loadBrands();
    loadUserDevices();
  }, []);

  const loadBrands = async () => {
    const { data } = await supabase
      .from('device_brands')
      .select('*')
      .eq('active', true)
      .order('sort_order');

    if (data) setBrands(data);
  };

  const loadUserDevices = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_devices')
      .select('*, brand:device_brands(*)')
      .eq('user_id', user.id)
      .order('connected_at', { ascending: false });

    if (data) setUserDevices(data as UserDevice[]);
  };

  const handleSelectBrand = (brand: DeviceBrand) => {
    setSelectedBrand(brand);
    setStep('explain');
  };

  const handleConnect = async () => {
    if (!selectedBrand) return;

    setIsLoading(true);

    setTimeout(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from('user_devices')
        .insert({
          user_id: user.id,
          brand_id: selectedBrand.id,
          device_name: selectedBrand.name,
          status: 'connected',
          sync_frequency: 'daily',
          last_sync_at: new Date().toISOString(),
          last_sync_status: 'success',
        })
        .select()
        .single();

      if (data) {
        setStep('success');
        setIsLoading(false);
        setTimeout(() => {
          setStep('select');
          setSelectedBrand(null);
          loadUserDevices();
        }, 4000);
      } else {
        setIsLoading(false);
      }
    }, 2000);
  };

  const handleDisconnect = async (deviceId: string) => {
    await supabase.from('user_devices').update({ status: 'disconnected' }).eq('id', deviceId);
    loadUserDevices();
  };

  const handleForceSync = async (deviceId: string) => {
    await supabase
      .from('user_devices')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'success',
        error_count: 0,
      })
      .eq('id', deviceId);

    loadUserDevices();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'error':
      case 'token_expired':
        return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'disconnected':
        return 'text-gray-700 dark:text-neutral-300 bg-page border border-[var(--bm-border)]';
      default:
        return 'text-gray-700 dark:text-neutral-300 bg-page border border-[var(--bm-border)]';
    }
  };

  const shellClass =
    'min-h-screen bg-page pt-16 transition-colors';

  if (step === 'explain' && selectedBrand) {
    return (
      <div className={shellClass}>
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--bm-border)] bg-surface p-8 shadow-sm">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                {categoryIcon(selectedBrand.category)}
              </div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-neutral-100">
                {selectedBrand.name}
              </h2>
              <p className="text-gray-600 dark:text-neutral-300">{t('devicesPage.explain.step')}</p>
            </div>

            <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50/80 p-6 dark:border-orange-800 dark:bg-orange-950/20">
              <div className="mb-4 flex items-start space-x-3">
                <Shield className="mt-1 h-6 w-6 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900 dark:text-neutral-100">
                    {t('devicesPage.explain.howTitle')}
                  </h3>
                  <p className="mb-3 text-sm text-gray-700 dark:text-neutral-300">
                    {t('devicesPage.explain.howBody')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(['point1', 'point2', 'point3'] as const).map((key) => (
                  <div key={key} className="flex items-start space-x-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm text-gray-700 dark:text-neutral-300">
                      {t(`devicesPage.explain.${key}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-[var(--bm-border)] bg-page p-4">
              <p className="text-sm text-gray-600 dark:text-neutral-300">
                <strong className="text-gray-900 dark:text-neutral-100">
                  {t('devicesPage.explain.privacyLabel')}
                </strong>{' '}
                {t('devicesPage.explain.privacyBody')}
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep('authorize')}
                className="flex-1 rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-500"
              >
                {t('devicesPage.explain.continue')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('select');
                  setSelectedBrand(null);
                }}
                className="rounded-lg border border-[var(--bm-border)] bg-page px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-surface dark:text-neutral-100"
              >
                {t('devicesPage.explain.back')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'authorize' && selectedBrand) {
    return (
      <div className={shellClass}>
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--bm-border)] bg-surface p-8 shadow-sm">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-neutral-100">
                {t('devicesPage.authorize.title')}
              </h2>
              <p className="text-gray-600 dark:text-neutral-300">{t('devicesPage.authorize.step')}</p>
            </div>

            <div className="mb-8 text-center">
              <p className="mb-6 text-lg text-gray-700 dark:text-neutral-300">
                {t('devicesPage.authorize.intro')}
              </p>

              <div className="mb-6 rounded-2xl border border-[var(--bm-border)] bg-page p-4 text-left">
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-neutral-100">
                  {t('devicesPage.authorize.syncTitle')}
                </h4>
                <p className="mb-3 text-sm text-gray-600 dark:text-neutral-300">
                  {t('devicesPage.authorize.syncBody')}
                </p>
                <ul className="mx-auto max-w-md space-y-1 text-sm text-gray-700 dark:text-neutral-300">
                  <li className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span>{t('devicesPage.authorize.daily')}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span>{t('devicesPage.authorize.multiple')}</span>
                  </li>
                  {selectedBrand.supports_realtime && (
                    <li className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span>{t('devicesPage.authorize.realtime')}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleConnect}
                disabled={isLoading}
                className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? t('devicesPage.authorize.connecting') : t('devicesPage.authorize.grant')}
              </button>
              <button
                type="button"
                onClick={() => setStep('explain')}
                disabled={isLoading}
                className="rounded-lg border border-[var(--bm-border)] bg-page px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-surface dark:text-neutral-100"
              >
                {t('devicesPage.authorize.back')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className={`${shellClass} flex items-center justify-center`}>
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--bm-border)] bg-surface p-8 shadow-sm">
            <div className="mb-6 text-center">
              <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="mb-4 text-3xl font-semibold text-gray-900 dark:text-neutral-100">
                {t('devicesPage.success.title')}
              </h2>
              <p className="mb-6 text-lg text-gray-600 dark:text-neutral-300">
                {t('devicesPage.success.body')}
              </p>
            </div>

            <div className="space-y-4">
              <SuccessConnectionHint />
              <div className="rounded-2xl border border-[var(--bm-border)] bg-page p-4">
                <TrendingUp className="mx-auto mb-2 h-8 w-8 text-orange-600 dark:text-orange-400" />
                <p className="text-center text-sm text-gray-700 dark:text-neutral-300">
                  <strong>{t('devicesPage.success.tipLabel')}</strong> {t('devicesPage.success.tipBody')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="inline-flex items-center rounded-full border border-orange-200 bg-surface px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-orange-700 dark:border-orange-500/30 dark:text-orange-300">
            {t('devicesPage.badge')}
          </span>
          <h1 className="mt-5 mb-4 text-4xl font-semibold text-gray-900 dark:text-neutral-100 md:text-5xl">
            {t('devicesPage.title')}
          </h1>
          <p className="mb-6 max-w-3xl text-lg text-gray-600 dark:text-neutral-300">
            {t('devicesPage.subtitle')}
          </p>

          <div className="space-y-4">
            <ConnectionHint />
            {userDevices.length === 0 && <OpeningHint />}
            <WhyDevicesHint />
          </div>
        </div>

        <section className="mb-12">
          <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-neutral-100">
            {t('devicesPage.signalsTitle')}
          </h2>
          <p className="mb-6 max-w-3xl text-gray-600 dark:text-neutral-300">
            {t('devicesPage.signalsIntro')}
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deviceSignalKeys.map((key) => (
              <div
                key={key}
                className="rounded-2xl border border-[var(--bm-border)] bg-surface p-5 shadow-sm"
              >
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-neutral-100">
                  {t(`devicesPage.signals.${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-neutral-300">
                  {t(`devicesPage.signals.${key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-neutral-100">
            {t('devicesPage.catalogTitle')}
          </h2>
          <p className="mb-6 max-w-3xl text-gray-600 dark:text-neutral-300">
            {t('devicesPage.catalogIntro')}
          </p>

          <div className="space-y-3">
            {deviceCatalog.map((category) => {
              const open = expandedCategory === category.id;
              return (
                <div
                  key={category.id}
                  className="overflow-hidden rounded-2xl border border-[var(--bm-border)] bg-surface shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedCategory(open ? null : category.id)}
                    className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-page/70"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-page text-orange-600 dark:text-orange-400">
                      {categoryIcon(category.id)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-neutral-100">
                        {t(`devicesPage.categories.${category.id}.title`)}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-neutral-300">
                        {t(`devicesPage.categories.${category.id}.body`)}
                      </p>
                    </div>
                  </button>
                  {open && (
                    <div className="border-t border-[var(--bm-border)] bg-page px-5 py-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        {category.items.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-xl border border-[var(--bm-border)] bg-surface p-4"
                          >
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <h4 className="font-semibold text-gray-900 dark:text-neutral-100">
                                {t(`devicesPage.items.${item.id}.name`)}
                              </h4>
                              {item.realtime && (
                                <span className="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                                  <Zap className="h-3 w-3" />
                                  {t('devicesPage.realtime')}
                                </span>
                              )}
                            </div>
                            <p className="mb-3 text-sm text-gray-600 dark:text-neutral-300">
                              {t(`devicesPage.items.${item.id}.blurb`)}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {item.capabilities.map((cap) => (
                                <span
                                  key={cap}
                                  className="rounded-md border border-[var(--bm-border)] bg-page px-2 py-1 text-xs text-gray-700 dark:text-neutral-300"
                                >
                                  {t(`devicesPage.capabilities.${cap}`)}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {userDevices.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-neutral-100">
              {t('devicesPage.connectedTitle')}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userDevices.map((device: UserDevice & { brand?: DeviceBrand }) => (
                <div
                  key={device.id}
                  className="rounded-2xl border border-[var(--bm-border)] bg-surface p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-page text-orange-600 dark:text-orange-400">
                        {categoryIcon(device.brand?.category || '')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-neutral-100">
                          {device.device_name || device.brand?.name || '—'}
                        </h3>
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${getStatusColor(device.status)}`}
                        >
                          {device.status === 'connected'
                            ? t('devicesPage.status.connected')
                            : device.status === 'error'
                              ? t('devicesPage.status.error')
                              : device.status === 'token_expired'
                                ? t('devicesPage.status.tokenExpired')
                                : t('devicesPage.status.disconnected')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600 dark:text-neutral-400">
                        {t('devicesPage.frequency')}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-neutral-100">
                        {device.sync_frequency === 'daily'
                          ? t('devicesPage.sync.daily')
                          : device.sync_frequency === 'hourly'
                            ? t('devicesPage.sync.hourly')
                            : device.sync_frequency === 'realtime'
                              ? t('devicesPage.sync.realtime')
                              : t('devicesPage.sync.manual')}
                      </span>
                    </div>
                    {device.last_sync_at && (
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-600 dark:text-neutral-400">
                          {t('devicesPage.lastSync')}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-neutral-100">
                          {new Date(device.last_sync_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {device.status === 'connected' &&
                    device.last_sync_status === 'success' &&
                    !device.last_sync_at && (
                      <div className="mb-4">
                        <ErrorRecoveryHint type="no_data" />
                      </div>
                    )}
                  {device.status === 'token_expired' && (
                    <div className="mb-4">
                      <ErrorRecoveryHint type="token_expired" />
                    </div>
                  )}
                  {device.status === 'error' && device.error_message && (
                    <div className="mb-4">
                      <ErrorRecoveryHint type="service_error" />
                    </div>
                  )}
                  {device.status === 'disconnected' && (
                    <div className="mb-4">
                      <ErrorRecoveryHint type="manual_disconnect" />
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {device.status === 'connected' && (
                      <button
                        type="button"
                        onClick={() => handleForceSync(device.id)}
                        className="flex flex-1 items-center justify-center space-x-1 rounded-lg bg-orange-600 px-3 py-2 text-sm text-white transition-colors hover:bg-orange-500"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>{t('devicesPage.syncNow')}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDisconnect(device.id)}
                      className="rounded-lg bg-red-100 px-3 py-2 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                      title={t('devicesPage.disconnect')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100">
              {t('devicesPage.connectTitle')}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowEducation(!showEducation)}
                className="flex items-center space-x-2 rounded-lg border border-[var(--bm-border)] bg-page px-4 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-surface dark:text-orange-300"
              >
                <BookOpen className="h-4 w-4" />
                <span>{showEducation ? t('devicesPage.hideGuide') : t('devicesPage.learnMore')}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRecommendations(!showRecommendations)}
                className="flex items-center space-x-2 text-sm text-orange-700 hover:underline dark:text-orange-300"
              >
                <Info className="h-4 w-4" />
                <span>{t('devicesPage.helpChoosing')}</span>
              </button>
            </div>
          </div>
          <p className="mb-6 text-gray-600 dark:text-neutral-300">{t('devicesPage.chooseBrand')}</p>
        </div>

        {showRecommendations && (
          <div className="mb-8 rounded-2xl border border-[var(--bm-border)] bg-surface p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-neutral-100">
              {t('devicesPage.recommendations.title')}
            </h3>
            <p className="mb-4 text-gray-700 dark:text-neutral-300">
              {t('devicesPage.recommendations.intro')}
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(
                [
                  ['sleep', 'sleep'],
                  ['activity', 'activity'],
                  ['glucose', 'glucose'],
                  ['bloodPressure', 'blood_pressure'],
                  ['longTerm', 'long_term'],
                  ['universal', 'universal'],
                ] as const
              ).map(([labelKey, valueKey]) => (
                <div
                  key={valueKey}
                  className="rounded-2xl border border-[var(--bm-border)] bg-page p-4"
                >
                  <h4 className="mb-2 font-semibold text-gray-900 dark:text-neutral-100">
                    {t(`devicesPage.recommendations.${labelKey}`)}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-neutral-300">
                    {t(`devicesPage.recommendations.values.${valueKey}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {showEducation && (
          <div className="mb-8">
            <DeviceEducation />
          </div>
        )}

        {brands.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {brands.map((brand) => (
              <button
                key={brand.id}
                type="button"
                onClick={() => handleSelectBrand(brand)}
                className="group rounded-2xl border border-[var(--bm-border)] bg-surface p-6 text-left shadow-sm transition-colors hover:border-orange-500"
              >
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-page text-gray-700 transition-colors group-hover:bg-orange-100 group-hover:text-orange-700 dark:text-neutral-300 dark:group-hover:bg-orange-900/30 dark:group-hover:text-orange-300">
                    {categoryIcon(brand.category)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {brand.name}
                  </h3>
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-neutral-300">
                  {brand.description_en}
                </p>

                <div className="mb-4 flex flex-wrap gap-1">
                  {Object.entries(brand.capabilities || {})
                    .filter(([, enabled]) => enabled)
                    .slice(0, 3)
                    .map(([capability]) => (
                      <span
                        key={capability}
                        className="rounded border border-[var(--bm-border)] bg-page px-2 py-1 text-xs text-gray-700 dark:text-neutral-300"
                      >
                        {capability.replace(/_/g, ' ')}
                      </span>
                    ))}
                </div>

                {brand.supports_realtime && (
                  <div className="flex items-center space-x-1 text-xs text-green-700 dark:text-green-400">
                    <Zap className="h-3 w-3" />
                    <span>{t('devicesPage.realtime')}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--bm-border)] bg-surface px-6 py-10 text-center">
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-neutral-300">
              {t('devicesPage.emptyBrands')}
            </p>
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-[var(--bm-border)] bg-surface p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <Info className="mt-1 h-6 w-6 flex-shrink-0 text-orange-600 dark:text-orange-400" />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-neutral-100">
                {t('devicesPage.footer.howTitle')}
              </h3>
              <p className="mb-3 text-gray-700 dark:text-neutral-300">{t('devicesPage.footer.howBody')}</p>
              <p className="text-sm text-gray-600 dark:text-neutral-300">
                <strong className="text-gray-900 dark:text-neutral-100">
                  {t('devicesPage.footer.privacyLabel')}
                </strong>{' '}
                {t('devicesPage.footer.privacyBody')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
