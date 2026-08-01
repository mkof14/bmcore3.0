
import { Clock, Zap, FileText, Sparkles, Bell, Settings, TrendingUp, AlertCircle, BookOpen } from 'lucide-react';
import DeviceScenarios from './DeviceScenarios';
import { useTranslation } from 'react-i18next';

interface EducationSection {
  icon: typeof Clock;
  title: string;
  content: string;
  highlight?: string;
}

export function RealTimeBehaviorSection() {
  const { t } = useTranslation();
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
          <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('deviceEducation.realTimeBehavior.title')}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {t('deviceEducation.realTimeBehavior.description')}
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong className="text-green-700 dark:text-green-400">{t('deviceEducation.realTimeBehavior.continuousMonitoring.title')}</strong> {t('deviceEducation.realTimeBehavior.continuousMonitoring.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DataInfluenceReportsSection() {
  const { t } = useTranslation();
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('deviceEducation.dataInfluenceReports.title')}
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {t('deviceEducation.dataInfluenceReports.description')}
          </p>
        </div>
      </div>
    </div>
  );
}

export function DataInfluenceAISection() {
  const { t } = useTranslation();
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('deviceEducation.dataInfluenceAI.title')}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {t('deviceEducation.dataInfluenceAI.description')}
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong className="text-purple-700 dark:text-purple-400">{t('deviceEducation.dataInfluenceAI.secondOpinion.title')}</strong> {t('deviceEducation.dataInfluenceAI.secondOpinion.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlertsNudgesSection() {
  const { t } = useTranslation();
  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
          <Bell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('deviceEducation.alertsNudges.title')}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {t('deviceEducation.alertsNudges.description')}
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong className="text-orange-700 dark:text-orange-400">{t('deviceEducation.alertsNudges.positiveReinforcement.title')}</strong> {t('deviceEducation.alertsNudges.positiveReinforcement.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserSettingsSection() {
  const { t } = useTranslation();
  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-[var(--bm-surface)]/40 dark:to-slate-900/40 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {t('deviceEducation.userSettings.title')}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('deviceEducation.userSettings.description')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-gray-900 dark:text-white text-sm">{t('deviceEducation.userSettings.onlyAtNight.title')}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('deviceEducation.userSettings.onlyAtNight.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-gray-900 dark:text-white text-sm">{t('deviceEducation.userSettings.onlyInTheMorning.title')}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('deviceEducation.userSettings.onlyInTheMorning.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="font-semibold text-gray-900 dark:text-white text-sm">{t('deviceEducation.userSettings.everyFewHours.title')}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('deviceEducation.userSettings.everyFewHours.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold text-gray-900 dark:text-white text-sm">{t('deviceEducation.userSettings.continuously.title')}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('deviceEducation.userSettings.continuously.description')}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            {t('deviceEducation.userSettings.footer')}
          </p>
        </div>
      </div>
    </div>
  );
}

export function WhyDevicesMatterSection() {
  const { t } = useTranslation();
  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-teal-200 dark:border-teal-800">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {t('deviceEducation.whyDevicesMatter.title')}
          </h3>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('deviceEducation.whyDevicesMatter.description')}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AdvancedBehaviorNote() {
  const { t } = useTranslation();
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-700">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
            {t('deviceEducation.advancedBehaviorNote.title')}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t('deviceEducation.advancedBehaviorNote.description')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DeviceEducation() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <WhyDevicesMatterSection />
      <RealTimeBehaviorSection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataInfluenceReportsSection />
        <DataInfluenceAISection />
      </div>

      <AlertsNudgesSection />
      <UserSettingsSection />

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start space-x-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('deviceEducation.realScenarios.title')}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {t('deviceEducation.realScenarios.description')}
            </p>
          </div>
        </div>
        <DeviceScenarios />
      </div>

      <AdvancedBehaviorNote />
    </div>
  );
}
