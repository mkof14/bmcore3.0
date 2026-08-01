import { CheckCircle, TrendingUp, Activity, Moon, Heart, Droplet, Gauge, Lightbulb, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ConnectionHint() {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-orange-200/80 bg-orange-50/70 p-4 dark:border-orange-500/25 dark:bg-orange-950/25">
      <div className="flex items-start space-x-3">
        <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
        <p className="text-sm text-gray-700 dark:text-neutral-300">
          <strong className="text-orange-700 dark:text-orange-300">{t('deviceHints.connection.strong')}</strong>{' '}
          {t('deviceHints.connection.body')}
        </p>
      </div>
    </div>
  );
}

export function OpeningHint() {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-[var(--bm-border)] bg-surface p-4">
      <p className="text-sm text-gray-700 dark:text-neutral-300">{t('deviceHints.opening')}</p>
    </div>
  );
}

export function SuccessConnectionHint() {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
      <div className="flex items-start space-x-3">
        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
        <p className="text-sm text-gray-700 dark:text-neutral-300">
          <strong className="text-green-700 dark:text-green-400">{t('deviceHints.success.strong')}</strong>{' '}
          {t('deviceHints.success.body')}
        </p>
      </div>
    </div>
  );
}

export function FirstSyncSuccessHint() {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
      <div className="flex items-start space-x-3">
        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
        <div>
          <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-neutral-100">
            {t('deviceHints.firstSync.title')}
          </p>
          <p className="text-sm text-gray-700 dark:text-neutral-300">{t('deviceHints.firstSync.body')}</p>
        </div>
      </div>
    </div>
  );
}

export function WhyDevicesHint() {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 dark:border-teal-800 dark:from-teal-900/20 dark:to-cyan-900/20">
      <div className="flex items-start space-x-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
          <TrendingUp className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-neutral-100">
            {t('deviceHints.why.title')}
          </h3>
          <p className="text-gray-700 dark:text-neutral-300">{t('deviceHints.why.body')}</p>
        </div>
      </div>
    </div>
  );
}

interface MetricScenarioProps {
  type:
    | 'sleep_improved'
    | 'sleep_declined'
    | 'hrv_improved'
    | 'hrv_declined'
    | 'activity_high'
    | 'glucose_unstable'
    | 'blood_pressure_stable';
  icon?: typeof Moon;
}

export function MetricScenario({ type, icon: Icon }: MetricScenarioProps) {
  const { t } = useTranslation();
  const scenarios = {
    sleep_declined: {
      icon: Moon,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      textColor: 'text-yellow-800 dark:text-yellow-300',
    },
    sleep_improved: {
      icon: Moon,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-800 dark:text-green-300',
    },
    hrv_improved: {
      icon: Heart,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-800 dark:text-green-300',
    },
    hrv_declined: {
      icon: Heart,
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      iconColor: 'text-orange-600 dark:text-orange-400',
      textColor: 'text-orange-800 dark:text-orange-300',
    },
    activity_high: {
      icon: Activity,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-800 dark:text-blue-300',
    },
    glucose_unstable: {
      icon: Droplet,
      bgColor: 'bg-rose-50 dark:bg-rose-900/20',
      borderColor: 'border-rose-200 dark:border-rose-800',
      iconColor: 'text-rose-600 dark:text-rose-400',
      textColor: 'text-rose-800 dark:text-rose-300',
    },
    blood_pressure_stable: {
      icon: Gauge,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-800 dark:text-green-300',
    },
  } as const;

  const scenario = scenarios[type];
  const ScenarioIcon = Icon || scenario.icon;

  return (
    <div className={`${scenario.bgColor} rounded-lg border p-4 ${scenario.borderColor}`}>
      <div className="flex items-start space-x-3">
        <ScenarioIcon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${scenario.iconColor}`} />
        <div>
          <h4 className={`mb-1 text-sm font-semibold ${scenario.textColor}`}>
            {t(`deviceHints.scenarios.${type}.title`)}
          </h4>
          <p className="text-sm text-gray-700 dark:text-neutral-300">
            {t(`deviceHints.scenarios.${type}.message`)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AIAssistantTemplate() {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 dark:border-orange-800 dark:from-orange-900/20 dark:to-amber-900/20">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-neutral-100">
        {t('deviceHints.healthGuide.title')}
      </h3>

      <div className="space-y-4">
        <div className="rounded-lg border border-orange-200 bg-white p-4 dark:border-orange-800 dark:bg-page">
          <p className="mb-3 text-sm text-gray-700 dark:text-neutral-300">
            <strong className="text-orange-700 dark:text-orange-400">
              {t('deviceHints.healthGuide.templateLabel')}:
            </strong>
          </p>
          <p className="text-sm italic text-gray-600 dark:text-neutral-300">
            “{t('deviceHints.healthGuide.template')}”
          </p>
        </div>

        <div className="rounded-lg border border-orange-200 bg-white p-4 dark:border-orange-800 dark:bg-page">
          <p className="mb-3 text-sm text-gray-700 dark:text-neutral-300">
            <strong className="text-orange-700 dark:text-orange-400">
              {t('deviceHints.healthGuide.agreeLabel')}:
            </strong>
          </p>
          <p className="text-sm text-gray-600 dark:text-neutral-300">
            {t('deviceHints.healthGuide.agreeBody')}
          </p>
        </div>

        <div className="rounded-lg border border-orange-200 bg-white p-4 dark:border-orange-800 dark:bg-page">
          <p className="text-sm text-gray-700 dark:text-neutral-300">
            <strong className="text-orange-700 dark:text-orange-400">
              {t('deviceHints.healthGuide.secondOpinionLabel')}:
            </strong>{' '}
            {t('deviceHints.healthGuide.secondOpinionBody')}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ErrorRecoveryHintProps {
  type: 'token_expired' | 'no_data' | 'service_error' | 'manual_disconnect' | 'bluetooth_sync';
}

export function ErrorRecoveryHint({ type }: ErrorRecoveryHintProps) {
  const { t } = useTranslation();
  const styles = {
    token_expired: {
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400',
      action: true,
    },
    no_data: {
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      action: false,
    },
    service_error: {
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      iconColor: 'text-orange-600 dark:text-orange-400',
      action: false,
    },
    manual_disconnect: {
      bgColor: 'bg-page',
      borderColor: 'border-[var(--bm-border)]',
      iconColor: 'text-gray-600 dark:text-neutral-400',
      action: true,
    },
    bluetooth_sync: {
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      action: false,
    },
  } as const;

  const hint = styles[type];

  return (
    <div className={`${hint.bgColor} rounded-lg border p-3 ${hint.borderColor}`}>
      <div className="flex items-start space-x-3">
        <AlertCircle className={`mt-0.5 h-4 w-4 flex-shrink-0 ${hint.iconColor}`} />
        <div className="flex-1">
          <h4 className="mb-1 text-xs font-semibold text-gray-900 dark:text-neutral-100">
            {t(`deviceHints.errors.${type}.title`)}
          </h4>
          <p className="mb-2 text-xs text-gray-700 dark:text-neutral-300">
            {t(`deviceHints.errors.${type}.message`)}
          </p>
          {hint.action && (
            <button type="button" className="text-xs font-semibold text-orange-600 hover:underline dark:text-orange-400">
              {t(`deviceHints.errors.${type}.action`)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: 'connected' | 'needs_update' | 'no_data' | 'disconnected';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  const colors = {
    connected: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    needs_update: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
    no_data: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    disconnected: 'bg-page text-gray-800 dark:text-neutral-300 border border-[var(--bm-border)]',
  } as const;

  return (
    <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${colors[status]}`}>
      {t(`deviceHints.status.${status}`)}
    </span>
  );
}
