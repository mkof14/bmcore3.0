import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Lock, Unlock, Info, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError } from '../../lib/adminNotify';

interface ReportSettings {
  detail_level: 'short' | 'standard' | 'extended';
  tone_style: 'analytical' | 'supportive' | 'coaching';
  visualization_mode: 'text_first' | 'chart_first' | 'mixed';
  insight_focus: 'lifestyle' | 'risk_awareness' | 'performance';
  advanced_mode_enabled: boolean;
  advanced_mode_unlocked: boolean;
  interpretation_priority: 'preventive_first' | 'physiological_first' | 'behavioral_first';
  auto_refresh_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'manual';
  second_opinion_default: boolean;
  save_to_history: boolean;
  allow_caregiver_view: boolean;
}

export default function ReportSettingsSection() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<ReportSettings>({
    detail_level: 'standard',
    tone_style: 'supportive',
    visualization_mode: 'mixed',
    insight_focus: 'lifestyle',
    advanced_mode_enabled: false,
    advanced_mode_unlocked: false,
    interpretation_priority: 'preventive_first',
    auto_refresh_frequency: 'weekly',
    second_opinion_default: false,
    save_to_history: true,
    allow_caregiver_view: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [canUnlockAdvanced, setCanUnlockAdvanced] = useState(false);

  useEffect(() => {
    loadSettings();
    checkAdvancedModePrerequisites();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('report_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return;
      }

      if (data) {
        setSettings({
          detail_level: data.detail_level,
          tone_style: data.tone_style,
          visualization_mode: data.visualization_mode,
          insight_focus: data.insight_focus,
          advanced_mode_enabled: data.advanced_mode_enabled,
          advanced_mode_unlocked: data.advanced_mode_unlocked,
          interpretation_priority: data.interpretation_priority,
          auto_refresh_frequency: data.auto_refresh_frequency,
          second_opinion_default: data.second_opinion_default,
          save_to_history: data.save_to_history,
          allow_caregiver_view: data.allow_caregiver_view
        });
      }
    } catch (error) {
      notifyUserError('Report settings load failed');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAdvancedModePrerequisites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .rpc('check_advanced_mode_prerequisites', { p_user_id: user.id });

      if (!error && data) {
        setCanUnlockAdvanced(true);
        // Auto-unlock if prerequisites are met
        if (!settings.advanced_mode_unlocked) {
          updateSetting('advanced_mode_unlocked', true);
        }
      }
    } catch (error) {
      notifyUserError('Advanced mode check failed');
    }
  };

  const updateSetting = async (key: keyof ReportSettings, value: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      const { error } = await supabase
        .from('report_settings')
        .upsert({
          user_id: user.id,
          ...newSettings
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        notifyUserError('Settings update failed');
      } else {
        setLastSaved(new Date());
      }
    } catch (error) {
      notifyUserError('Settings update failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="member-muted">{t('member.reportSettings.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {lastSaved && (
        <div className="flex items-center justify-end space-x-2 text-sm text-gray-500 dark:text-neutral-400">
          <Save className="h-4 w-4" />
          <span>
            {t('member.reportSettings.savedAt', {
              time: lastSaved.toLocaleTimeString(),
            })}
          </span>
        </div>
      )}

      {/* Detail Level */}
      <div className="member-card p-6 shadow-lg">
        <div className="flex items-start space-x-3 mb-4">
          <Settings className="h-5 w-5 text-orange-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="member-heading text-lg mb-1">
              {t('member.reportSettings.detailLevelTitle')}
            </h3>
            <p className="text-sm member-body mb-4">
              {t('member.reportSettings.detailLevelBody')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'short', label: t('member.reportSettings.detailShort'), desc: t('member.reportSettings.detailShortDesc') },
            { value: 'standard', label: t('member.reportSettings.detailStandard'), desc: t('member.reportSettings.detailStandardDesc') },
            { value: 'extended', label: t('member.reportSettings.detailExtended'), desc: t('member.reportSettings.detailExtendedDesc') }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => updateSetting('detail_level', option.value)}
              className={`p-4 rounded-lg border transition-all text-left ${
                settings.detail_level === option.value
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-slate-200 dark:border-[var(--bm-border)] hover:border-orange-300'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-neutral-50 mb-1">{option.label}</div>
              <div className="text-xs text-gray-500 dark:text-neutral-400">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tone Style */}
      <div className="member-card p-6 shadow-lg">
        <h3 className="member-heading text-lg mb-4">
          {t('member.reportSettings.toneTitle')}
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'analytical', label: t('member.reportSettings.toneAnalytical'), desc: t('member.reportSettings.toneAnalyticalDesc') },
            { value: 'supportive', label: t('member.reportSettings.toneSupportive'), desc: t('member.reportSettings.toneSupportiveDesc') },
            { value: 'coaching', label: t('member.reportSettings.toneCoaching'), desc: t('member.reportSettings.toneCoachingDesc') }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => updateSetting('tone_style', option.value)}
              className={`p-4 rounded-lg border transition-all text-left ${
                settings.tone_style === option.value
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-slate-200 dark:border-[var(--bm-border)] hover:border-orange-300'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-neutral-50 mb-1">{option.label}</div>
              <div className="text-xs text-gray-500 dark:text-neutral-400">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Visualization Mode */}
      <div className="member-card p-6 shadow-lg">
        <h3 className="member-heading text-lg mb-4">
          {t('member.reportSettings.visualizationTitle')}
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'text_first', label: t('member.reportSettings.vizText'), desc: t('member.reportSettings.vizTextDesc') },
            { value: 'chart_first', label: t('member.reportSettings.vizChart'), desc: t('member.reportSettings.vizChartDesc') },
            { value: 'mixed', label: t('member.reportSettings.vizMixed'), desc: t('member.reportSettings.vizMixedDesc') }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => updateSetting('visualization_mode', option.value)}
              className={`p-4 rounded-lg border transition-all text-left ${
                settings.visualization_mode === option.value
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-slate-200 dark:border-[var(--bm-border)] hover:border-orange-300'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-neutral-50 mb-1">{option.label}</div>
              <div className="text-xs text-gray-500 dark:text-neutral-400">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Insight Focus */}
      <div className="member-card p-6 shadow-lg">
        <h3 className="member-heading text-lg mb-4">
          {t('member.reportSettings.insightTitle')}
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'lifestyle', label: t('member.reportSettings.insightLifestyle'), desc: t('member.reportSettings.insightLifestyleDesc') },
            { value: 'risk_awareness', label: t('member.reportSettings.insightRisk'), desc: t('member.reportSettings.insightRiskDesc') },
            { value: 'performance', label: t('member.reportSettings.insightPerformance'), desc: t('member.reportSettings.insightPerformanceDesc') }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => updateSetting('insight_focus', option.value)}
              className={`p-4 rounded-lg border transition-all text-left ${
                settings.insight_focus === option.value
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-slate-200 dark:border-[var(--bm-border)] hover:border-orange-300'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-neutral-50 mb-1">{option.label}</div>
              <div className="text-xs text-gray-500 dark:text-neutral-400">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Mode */}
      <div className={`bg-white dark:bg-[var(--bm-elevated)] rounded-2xl border p-6 shadow-lg ${
        settings.advanced_mode_unlocked
          ? 'border-orange-200'
          : 'border-slate-200 dark:border-[var(--bm-border)]'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            {settings.advanced_mode_unlocked ? (
              <Unlock className="h-5 w-5 text-orange-500 mt-0.5" />
            ) : (
              <Lock className="h-5 w-5 text-gray-400 mt-0.5" />
            )}
            <div>
              <h3 className="member-heading text-lg mb-1">
                {t('member.reportSettings.advancedTitle')}
              </h3>
              <p className="text-sm member-body">
                {t('member.reportSettings.advancedBody')}
              </p>
            </div>
          </div>

          {settings.advanced_mode_unlocked && (
            <button
              onClick={() => updateSetting('advanced_mode_enabled', !settings.advanced_mode_enabled)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                settings.advanced_mode_enabled
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 shadow-lg shadow-orange-600/20'
                  : 'bg-slate-100 border border-slate-200 dark:border-[var(--bm-border)] text-gray-700 dark:text-neutral-200 hover:border-orange-300'
              }`}
            >
              {settings.advanced_mode_enabled ? t('member.common.enabled') : t('member.common.disabled')}
            </button>
          )}
        </div>

        {!settings.advanced_mode_unlocked && (
          <div className="bg-gray-50 dark:bg-[var(--bm-surface)] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700 dark:text-neutral-200">
                <p className="font-medium mb-1 member-heading">{t('member.reportSettings.advancedLockedTitle')}</p>
                <p className="member-body">
                  {t('member.reportSettings.advancedLockedBody')}
                </p>
              </div>
            </div>
          </div>
        )}

        {settings.advanced_mode_enabled && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-[var(--bm-border)]">
            <h4 className="text-sm font-semibold member-heading mb-3">
              {t('member.reportSettings.interpretationPriority')}
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'preventive_first', label: t('member.reportSettings.priorityPreventive') },
                { value: 'physiological_first', label: t('member.reportSettings.priorityPhysiological') },
                { value: 'behavioral_first', label: t('member.reportSettings.priorityBehavioral') }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => updateSetting('interpretation_priority', option.value)}
                  className={`p-3 rounded-lg border transition-all text-center text-sm ${
                    settings.interpretation_priority === option.value
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-slate-200 dark:border-[var(--bm-border)] hover:border-orange-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Additional Options */}
      <div className="member-card p-6 shadow-lg">
        <h3 className="member-heading text-lg mb-4">
          {t('member.reportSettings.additionalOptions')}
        </h3>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[var(--bm-surface)] rounded-lg cursor-pointer">
            <div>
              <div className="font-medium member-heading mb-1">
                {t('member.reportSettings.secondOpinionDefault')}
              </div>
              <div className="text-sm member-body">
                {t('member.reportSettings.secondOpinionDefaultDesc')}
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.second_opinion_default}
              onChange={(e) => updateSetting('second_opinion_default', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[var(--bm-surface)] rounded-lg cursor-pointer">
            <div>
              <div className="font-medium member-heading mb-1">
                {t('member.reportSettings.saveToHistory')}
              </div>
              <div className="text-sm member-body">
                {t('member.reportSettings.saveToHistoryDesc')}
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.save_to_history}
              onChange={(e) => updateSetting('save_to_history', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[var(--bm-surface)] rounded-lg cursor-pointer">
            <div>
              <div className="font-medium member-heading mb-1">
                {t('member.reportSettings.allowCaregiverView')}
              </div>
              <div className="text-sm member-body">
                {t('member.reportSettings.allowCaregiverDesc')}
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.allow_caregiver_view}
              onChange={(e) => updateSetting('allow_caregiver_view', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* Auto-refresh Frequency */}
      <div className="member-card p-6 shadow-lg">
        <h3 className="member-heading text-lg mb-4">
          {t('member.reportSettings.refreshTitle')}
        </h3>
        <p className="text-sm member-body mb-4">
          {t('member.reportSettings.refreshBody')}
        </p>

        <div className="grid grid-cols-5 gap-2">
          {[
            { value: 'daily', label: t('member.reportSettings.freqDaily') },
            { value: 'weekly', label: t('member.reportSettings.freqWeekly') },
            { value: 'biweekly', label: t('member.reportSettings.freqBiweekly') },
            { value: 'monthly', label: t('member.reportSettings.freqMonthly') },
            { value: 'manual', label: t('member.reportSettings.freqManual') }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => updateSetting('auto_refresh_frequency', option.value)}
              className={`p-3 rounded-lg border transition-all text-center text-sm ${
                settings.auto_refresh_frequency === option.value
                  ? 'border-orange-300 bg-orange-50 font-medium'
                  : 'border-slate-200 dark:border-[var(--bm-border)] hover:border-orange-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700 dark:text-neutral-200">
            <p className="font-medium mb-1 member-heading">{t('member.reportSettings.autoSaveTitle')}</p>
            <p className="member-body">
              {t('member.reportSettings.autoSaveBody')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
