import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Watch,
  Activity,
  Droplet,
  CircleDot,
  Scale,
  HeartPulse,
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
  Radio,
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
  connectableDeviceIds,
  deviceCatalog,
  deviceSignalKeys,
  type DeviceCatalogItemId,
} from '../data/deviceCatalog';
import DeviceProductCard from '../components/DeviceProductCard';
import SEO from '../components/SEO';
import BackButton from '../components/BackButton';
import PageHero from '../components/PageHero';
import { pageHeroUrl } from '../data/pageHeroes';

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
      return <CircleDot className="h-6 w-6" />;
    case 'recovery':
      return <Activity className="h-6 w-6" />;
    case 'cgm':
      return <Droplet className="h-6 w-6" />;
    case 'blood_pressure':
      return <HeartPulse className="h-6 w-6" />;
    case 'body_composition':
      return <Scale className="h-6 w-6" />;
    case 'sleep_home':
      return <Moon className="h-6 w-6" />;
    default:
      return <Activity className="h-6 w-6" />;
  }
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
      {children}
    </p>
  );
}

export default function Devices({ onNavigate }: DevicesProps) {
  const { t } = useTranslation();
  const [brands, setBrands] = useState<DeviceBrand[]>([]);
  const [userDevices, setUserDevices] = useState<UserDevice[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<DeviceBrand | null>(null);
  const [step, setStep] = useState<'select' | 'explain' | 'authorize' | 'success'>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showEducation, setShowEducation] = useState(false);

  const deviceCount = connectableDeviceIds.length;
  const categoryCount = deviceCatalog.length;

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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const shellClass = 'min-h-screen bg-page transition-colors';

  if (step === 'explain' && selectedBrand) {
    return (
      <div className={`${shellClass} pt-16`}>
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--bm-border)] bg-surface p-8 shadow-sm animate-fadeIn">
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
                className="bm-link px-2"
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
      <div className={`${shellClass} pt-16`}>
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--bm-border)] bg-surface p-8 shadow-sm animate-fadeIn">
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
                className="bm-link px-2"
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
      <div className={`${shellClass} flex items-center justify-center pt-16`}>
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--bm-border)] bg-surface p-8 shadow-sm animate-slideUp">
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
      <SEO
        title={t('devicesPage.seo.title')}
        description={t('devicesPage.seo.description')}
        url="/devices"
      />

      <div className="pt-16">
        <PageHero
          imageSrc={pageHeroUrl('devices')}
          label={t('devicesPage.badge')}
          title={t('devicesPage.title')}
          subtitle={t('devicesPage.subtitle')}
        >
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <button
              type="button"
              onClick={() => scrollTo('device-catalog')}
              className="inline-flex items-center justify-center border border-white/45 bg-transparent px-7 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-gray-900"
            >
              {t('devicesPage.hero.ctaCatalog')}
            </button>
            <button
              type="button"
              onClick={() => scrollTo('device-connect')}
              className="text-sm font-medium text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {t('devicesPage.hero.ctaConnect')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('member')}
              className="text-sm font-medium text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {t('devicesPage.hero.ctaMember')}
            </button>
          </div>
        </PageHero>
      </div>

      <div className="pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <div className="pt-6">
            <BackButton onNavigate={onNavigate} />
          </div>

          {/* Living pulse band */}
          <section className="relative overflow-hidden border-b border-[var(--bm-border)] py-12 lg:py-14">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(194,65,12,0.12),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(15,23,42,0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_20%_30%,rgba(249,115,22,0.14),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(148,163,184,0.08),transparent_50%)]"
              aria-hidden
            />
            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <SectionLabel>{t('devicesPage.live.label')}</SectionLabel>
                <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
                  {t('devicesPage.live.title')}
                </h2>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
                  {t('devicesPage.live.body', { devices: deviceCount, categories: categoryCount })}
                </p>
                <div className="mt-6 space-y-3">
                  <ConnectionHint />
                  {userDevices.length === 0 && <OpeningHint />}
                </div>
              </div>

              <div className="relative mx-auto flex h-56 w-full max-w-md items-center justify-center">
                <div className="devices-pulse-ring devices-pulse-ring-1" aria-hidden />
                <div className="devices-pulse-ring devices-pulse-ring-2" aria-hidden />
                <div className="devices-pulse-ring devices-pulse-ring-3" aria-hidden />
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border border-orange-500/40 bg-surface shadow-lg shadow-orange-500/10">
                  <Radio className="h-9 w-9 text-orange-600 dark:text-orange-400 devices-pulse-core" />
                </div>
                <div className="absolute left-4 top-8 rounded-lg border border-[var(--bm-border)] bg-surface/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur dark:text-neutral-200 devices-float-a">
                  {t('devicesPage.live.chipSleep')}
                </div>
                <div className="absolute right-2 top-16 rounded-lg border border-[var(--bm-border)] bg-surface/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur dark:text-neutral-200 devices-float-b">
                  {t('devicesPage.live.chipGlucose')}
                </div>
                <div className="absolute bottom-10 left-10 rounded-lg border border-[var(--bm-border)] bg-surface/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur dark:text-neutral-200 devices-float-c">
                  {t('devicesPage.live.chipHrv')}
                </div>
              </div>
            </div>
          </section>

          {/* Flow */}
          <section className="border-b border-[var(--bm-border)] py-12 lg:py-14">
            <SectionLabel>{t('devicesPage.flow.label')}</SectionLabel>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('devicesPage.flow.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('devicesPage.flow.body')}
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {(['authorize', 'sync', 'guide'] as const).map((key, index) => (
                <article
                  key={key}
                  className="border-t border-[var(--bm-border)] pt-5 animate-fadeIn"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {t(`devicesPage.flow.steps.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                    {t(`devicesPage.flow.steps.${key}.body`)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Signals */}
          <section className="border-b border-[var(--bm-border)] py-12 lg:py-14">
            <SectionLabel>{t('devicesPage.signalsLabel')}</SectionLabel>
            <h2 className="mb-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('devicesPage.signalsTitle')}
            </h2>
            <p className="mb-8 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('devicesPage.signalsIntro')}
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deviceSignalKeys.map((key, index) => (
                <div
                  key={key}
                  className="group rounded-2xl border border-[var(--bm-border)] bg-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-400/50 hover:shadow-md"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="mb-3 h-1 w-10 rounded-full bg-orange-500/80 transition-all duration-300 group-hover:w-16" />
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

          {/* Full catalog — all devices */}
          <section id="device-catalog" className="scroll-mt-24 border-b border-[var(--bm-border)] py-12 lg:py-14">
            <SectionLabel>{t('devicesPage.catalogLabel')}</SectionLabel>
            <h2 className="mb-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl">
              {t('devicesPage.catalogTitle')}
            </h2>
            <p className="mb-6 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('devicesPage.catalogIntro')}
            </p>

            {/* Jump links only — full catalog is always expanded on load */}
            <div className="mb-8 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => scrollTo('device-catalog')}
                className="rounded-lg border border-[var(--bm-border)] bg-page px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-surface dark:text-neutral-300"
              >
                {t('devicesPage.filterAll', { count: deviceCount })}
              </button>
              {deviceCatalog.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => scrollTo(`device-category-${category.id}`)}
                  className="rounded-lg border border-[var(--bm-border)] bg-page px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-surface dark:text-neutral-300"
                >
                  {t(`devicesPage.categories.${category.id}.title`)}
                </button>
              ))}
            </div>

            <div className="space-y-10">
              {deviceCatalog.map((category) => (
                <div key={category.id} id={`device-category-${category.id}`} className="scroll-mt-24">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-page text-orange-600 dark:text-orange-400">
                      {categoryIcon(category.id)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
                        {t(`devicesPage.categories.${category.id}.title`)}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                        {t(`devicesPage.categories.${category.id}.body`)}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {category.items.map((item) => (
                      <DeviceProductCard
                        key={item.id}
                        itemId={item.id as DeviceCatalogItemId}
                        realtime={Boolean(item.realtime)}
                        capabilities={item.capabilities}
                        status="available"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border-b border-[var(--bm-border)] py-10">
            <WhyDevicesHint />
          </section>

          {userDevices.length > 0 && (
            <section className="border-b border-[var(--bm-border)] py-12 lg:py-14">
              <SectionLabel>{t('devicesPage.connectedLabel')}</SectionLabel>
              <h2 className="mb-6 text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                {t('devicesPage.connectedTitle')}
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userDevices.map((device: UserDevice & { brand?: DeviceBrand }) => (
                  <div
                    key={device.id}
                    className="rounded-2xl border border-[var(--bm-border)] bg-surface p-6 shadow-sm transition-all duration-300 hover:border-orange-400/40"
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
            </section>
          )}

          {/* Connect */}
          <section id="device-connect" className="scroll-mt-24 py-12 lg:py-14">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <SectionLabel>{t('devicesPage.connectLabel')}</SectionLabel>
                <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
                  {t('devicesPage.connectTitle')}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowEducation(!showEducation)}
                  className="bm-link text-orange-700 dark:text-orange-300"
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
                    className="group rounded-2xl border border-[var(--bm-border)] bg-surface p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-500 hover:shadow-md"
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
                <button
                  type="button"
                  onClick={() => onNavigate('member')}
                  className="mt-6 rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-500"
                >
                  {t('devicesPage.hero.ctaMember')}
                </button>
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
          </section>
        </div>
      </div>
    </div>
  );
}

