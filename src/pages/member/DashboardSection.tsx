import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sun,
  Target,
  Check,
  Plus,
  FileText,
  Activity,
  Loader2,
  Heart,
  MessageSquare,
  Calendar,
  ChevronRight,
  Info
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError, notifyUserSuccess } from '../../lib/adminNotify';
import BackButton from '../../components/BackButton';
import ModalShell from '../../components/ui/ModalShell';
import type { DailySnapshot, UserGoal, Habit, HabitCompletion, HealthReport } from '../../types/database';

interface DashboardSectionProps {
  onBack?: () => void;
}

export default function DashboardSection({ onBack }: DashboardSectionProps = {}) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [todaySnapshot, setTodaySnapshot] = useState<DailySnapshot | null>(null);
  const [activeGoals, setActiveGoals] = useState<UserGoal[]>([]);
  const [todayHabits, setTodayHabits] = useState<Array<{ habit: Habit; completion: HabitCompletion | null }>>([]);
  const [latestReport, setLatestReport] = useState<HealthReport | null>(null);
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const [snapshotRes, goalsRes, habitsRes, reportsRes] = await Promise.all([
        supabase
          .from('daily_snapshots')
          .select('*')
          .eq('user_id', user.id)
          .eq('snapshot_date', today)
          .maybeSingle(),

        supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('priority', { ascending: true })
          .limit(5),

        supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .limit(10),

        supabase
          .from('health_reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      const queryErrors = [snapshotRes.error, goalsRes.error, habitsRes.error, reportsRes.error].filter(Boolean);
      if (queryErrors.length > 0) {
        throw queryErrors[0];
      }

      setTodaySnapshot(snapshotRes.data);
      setActiveGoals(goalsRes.data || []);
      setLatestReport(reportsRes.data);

      if (habitsRes.data && habitsRes.data.length > 0) {
        const habitIds = habitsRes.data.map((habit) => habit.id);
        const { data: completions } = await supabase
          .from('habit_completions')
          .select('*')
          .in('habit_id', habitIds)
          .eq('completion_date', today);

        const completionMap = new Map<string, HabitCompletion>();
        (completions || []).forEach((completion) => {
          completionMap.set(completion.habit_id, completion);
        });

        const habitsWithCompletions = habitsRes.data.map((habit) => ({
          habit,
          completion: completionMap.get(habit.id) || null
        }));

        setTodayHabits(habitsWithCompletions);
      } else {
        setTodayHabits([]);
      }

    } catch (error) {
      notifyUserError(t('member.dashboard.loading'));
    } finally {
      setLoading(false);
    }
  }

  async function createGoal(goalData: { title: string; description: string; priority: string }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          title: goalData.title,
          description: goalData.description,
          priority: goalData.priority,
          status: 'active',
          start_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;
      setShowCreateGoal(false);
      loadDashboardData();
      notifyUserSuccess(t('member.dashboard.createGoal'));
    } catch (error) {
      notifyUserError(t('member.dashboard.createGoal'));
    }
  }

  async function toggleHabitCompletion(habitId: string, currentCompletion: HabitCompletion | null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      if (currentCompletion) {
        await supabase
          .from('habit_completions')
          .update({
            completed: !currentCompletion.completed,
            completed_at: !currentCompletion.completed ? new Date().toISOString() : null
          })
          .eq('id', currentCompletion.id);
      } else {
        await supabase
          .from('habit_completions')
          .insert({
            habit_id: habitId,
            user_id: user.id,
            completion_date: today,
            completed: true,
            completed_at: new Date().toISOString()
          });
      }

      loadDashboardData();
    } catch (error) {
      notifyUserError(t('member.dashboard.allHabitsComplete'));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-sm member-muted">{t('member.dashboard.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onBack && <BackButton onClick={onBack} label={t('member.zone.backHome')} />}
      {!todaySnapshot ? (
        <div className="member-card rounded-xl p-8 border-2 border-dashed text-center">
          <Sun className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="member-heading text-xl mb-2">
            {t('member.dashboard.emptySnapshotTitle')}
          </h3>
          <p className="member-body mb-6 max-w-md mx-auto">
            {t('member.dashboard.emptySnapshotBody')}
          </p>
        </div>
      ) : (
        <TodaySnapshotCard snapshot={todaySnapshot} locale={i18n.language} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoalsCard goals={activeGoals} onCreateGoal={() => setShowCreateGoal(true)} locale={i18n.language} />
        <HabitsCard habits={todayHabits} onToggle={toggleHabitCompletion} locale={i18n.language} />
      </div>

      {latestReport && <LatestReportCard report={latestReport} locale={i18n.language} />}

      <QuickActionsCard />

      {showCreateGoal && <CreateGoalModal onClose={() => setShowCreateGoal(false)} onCreate={createGoal} />}
    </div>
  );
}

function TodaySnapshotCard({ snapshot, locale }: { snapshot: DailySnapshot; locale: string }) {
  const { t } = useTranslation();
  const [showSecondOpinion, setShowSecondOpinion] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const getEnergyColor = (level: string | null) => {
    switch (level) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'moderate': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-neutral-300';
    }
  };

  const getRecoveryColor = (status: string | null) => {
    switch (status) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'stable': return 'text-blue-600 dark:text-blue-400';
      case 'recovering': return 'text-yellow-600 dark:text-yellow-400';
      case 'stressed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-neutral-300';
    }
  };

  return (
    <div className="member-card p-6 shadow-lg">
      <h3 className="member-heading mb-4">{t('member.dashboard.dailySnapshot')}</h3>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Sun className="h-8 w-8 text-orange-500" />
          <div>
            <h2 className="member-heading text-xl">
              {t('member.dashboard.today')}
            </h2>
            <p className="text-sm member-muted">
              {new Date(snapshot.snapshot_date).toLocaleDateString(locale, {
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="flex space-x-4 text-sm">
          {snapshot.energy_level && (
            <div className="text-center">
              <p className="member-muted mb-1">{t('member.dashboard.energy')}</p>
              <p className={`font-semibold capitalize ${getEnergyColor(snapshot.energy_level)}`}>
                {snapshot.energy_level}
              </p>
            </div>
          )}
          {snapshot.recovery_status && (
            <div className="text-center">
              <p className="member-muted mb-1">{t('member.dashboard.recovery')}</p>
              <p className={`font-semibold capitalize ${getRecoveryColor(snapshot.recovery_status)}`}>
                {snapshot.recovery_status}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="member-inset p-4 mb-4">
        <p className="text-lg font-semibold member-heading mb-2">
          {snapshot.state_summary}
        </p>
        {snapshot.state_reason && (
          <p className="member-body text-sm">
            {snapshot.state_reason}
          </p>
        )}

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="mt-2 text-sm text-orange-500 hover:text-orange-400 font-semibold transition-colors inline-flex items-center"
        >
          <Info className="h-4 w-4 mr-1" />
          {showExplanation ? t('member.dashboard.hideExplanation') : t('member.dashboard.showExplanation')}
        </button>

        {showExplanation && (
          <div className="member-inset mt-3 p-3">
            <p className="text-sm member-body">
              {t('member.dashboard.explanationBody')}
            </p>
          </div>
        )}
      </div>

      {snapshot.suggestion_of_day && (
        <div className="bg-orange-50/80 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-600/30 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <Heart className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold member-heading mb-1">
                {t('member.dashboard.todaysSuggestion')}
              </p>
              <p className="text-sm member-heading font-medium mb-1">
                {snapshot.suggestion_of_day.title}
              </p>
              <p className="text-sm member-body">
                {snapshot.suggestion_of_day.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {snapshot.second_opinion_a && snapshot.second_opinion_b && (
        <div className="mt-4">
          <button
            onClick={() => setShowSecondOpinion(!showSecondOpinion)}
            className="text-sm text-orange-500 hover:text-orange-400 font-semibold transition-colors"
          >
            {showSecondOpinion ? t('member.dashboard.hideSecondOpinion') : t('member.dashboard.showSecondOpinion')}
          </button>
          {showSecondOpinion && (
            <div className="mt-3 space-y-3">
              <div className="member-inset rounded-lg p-3">
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">
                  {t('member.dashboard.opinionPhysiological')}
                </p>
                <p className="text-sm member-body">
                  {snapshot.second_opinion_a}
                </p>
              </div>
              <div className="member-inset rounded-lg p-3">
                <p className="text-xs font-semibold text-pink-700 dark:text-pink-300 mb-1">
                  {t('member.dashboard.opinionLifestyle')}
                </p>
                <p className="text-sm member-body">
                  {snapshot.second_opinion_b}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GoalsCard({
  goals,
  onCreateGoal,
  locale
}: {
  goals: UserGoal[];
  onCreateGoal: () => void;
  locale: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="member-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="member-heading text-lg">
            {t('member.dashboard.activeGoals')}
          </h3>
        </div>
        <button
          onClick={onCreateGoal}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
        >
          + {t('member.common.add')}
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-8">
          <Target className="h-12 w-12 member-muted mx-auto mb-3" />
          <p className="text-sm member-body mb-4">
            {t('member.dashboard.noGoals')}
          </p>
          <button
            onClick={onCreateGoal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('member.dashboard.createFirstGoal')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="member-inset rounded-lg p-4 hover:border-orange-300/40 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold member-heading mb-1">
                    {goal.title}
                  </h4>
                  {goal.description && (
                    <p className="text-sm member-body mb-2">
                      {goal.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-3 text-xs member-muted">
                    <span className={`px-2 py-1 rounded capitalize ${
                      goal.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                      goal.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-neutral-200'
                    }`}>
                      {{
                        high: t('member.dashboard.priorityHigh'),
                        medium: t('member.dashboard.priorityMedium'),
                        low: t('member.dashboard.priorityLow'),
                      }[goal.priority] ?? goal.priority}
                    </span>
                    <span>{t('member.common.since')} {new Date(goal.start_date).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 member-muted flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HabitsCard({
  habits,
  onToggle,
  locale: _locale
}: {
  habits: Array<{ habit: Habit; completion: HabitCompletion | null }>;
  onToggle: (habitId: string, completion: HabitCompletion | null) => void;
  locale: string;
}) {
  const { t } = useTranslation();
  const completedCount = habits.filter(h => h.completion?.completed).length;

  const formatTimeAnchor = (anchor: string) => {
    const keyMap: Record<string, string> = {
      morning: 'member.dashboard.timeMorning',
      afternoon: 'member.dashboard.timeAfternoon',
      evening: 'member.dashboard.timeEvening',
      after_meal: 'member.dashboard.timeAfterMeal',
      before_sleep: 'member.dashboard.timeBeforeSleep',
      custom: 'member.dashboard.timeCustom',
    };
    return keyMap[anchor] ? t(keyMap[anchor]) : anchor;
  };

  return (
    <div className="member-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
          <h3 className="member-heading text-lg">
            {t('member.dashboard.todaysHabits')}
          </h3>
        </div>
        {habits.length > 0 && (
          <span className="text-sm member-muted">
            {completedCount} / {habits.length}
          </span>
        )}
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 member-muted mx-auto mb-3" />
          <p className="text-sm member-body">
            {t('member.dashboard.habitsEmpty')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map(({ habit, completion }) => (
            <label
              key={habit.id}
              className="member-inset flex items-start space-x-3 p-3 hover:border-orange-300/40 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                checked={completion?.completed || false}
                onChange={() => onToggle(habit.id, completion)}
                className="mt-1 h-5 w-5 text-green-600 rounded"
              />
              <div className="flex-1">
                <p className={`font-medium ${
                  completion?.completed
                    ? 'member-muted line-through'
                    : 'member-heading'
                }`}>
                  {habit.title}
                </p>
                <div className="flex items-center space-x-3 mt-1 text-xs member-muted">
                  <span>{formatTimeAnchor(habit.time_anchor)}</span>
                  <span>•</span>
                  <span>{habit.duration_minutes} {t('member.common.min')}</span>
                </div>
              </div>
              {completion?.completed && (
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              )}
            </label>
          ))}
        </div>
      )}

      {habits.length > 0 && completedCount === habits.length && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
          <p className="text-sm text-green-800 dark:text-green-300 font-semibold">
            {t('member.dashboard.allHabitsComplete')}
          </p>
        </div>
      )}
    </div>
  );
}

function LatestReportCard({ report, locale }: { report: HealthReport; locale: string }) {
  const { t } = useTranslation();

  return (
    <div className="member-card rounded-xl border-l-4 border-l-purple-500 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <div>
            <h3 className="member-heading text-lg">
              {t('member.dashboard.latestReport')}
            </h3>
            <p className="text-sm member-muted">
              {new Date(report.created_at).toLocaleDateString(locale, {
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors flex items-center">
          {t('member.common.open')}
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      <p className="member-body line-clamp-2 mb-4">
        {report.summary}
      </p>

      <div className="flex items-center space-x-4 text-sm member-muted">
        {report.insights && Array.isArray(report.insights) && (
          <span>{t('member.dashboard.insights', { count: report.insights.length })}</span>
        )}
        {report.recommendations && Array.isArray(report.recommendations) && (
          <>
            <span>•</span>
            <span>{t('member.dashboard.recommendations', { count: report.recommendations.length })}</span>
          </>
        )}
      </div>
    </div>
  );
}

function QuickActionsCard() {
  const { t } = useTranslation();

  return (
    <div className="member-card rounded-xl p-6">
      <h3 className="member-heading text-lg mb-4">
        {t('member.dashboard.quickActions')}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
          <span className="text-sm font-semibold member-heading">
            {t('member.dashboard.createReport')}
          </span>
        </button>
        <button className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
          <Target className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
          <span className="text-sm font-semibold member-heading">
            {t('member.dashboard.addGoal')}
          </span>
        </button>
        <button className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-900/30 transition-colors">
          <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
          <span className="text-sm font-semibold member-heading">
            {t('member.dashboard.openChat')}
          </span>
        </button>
        <button className="flex flex-col items-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors">
          <Calendar className="h-6 w-6 text-teal-600 dark:text-teal-400 mb-2" />
          <span className="text-sm font-semibold member-heading">
            {t('member.dashboard.history')}
          </span>
        </button>
      </div>
    </div>
  );
}

function CreateGoalModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: { title: string; description: string; priority: string }) => void }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title) {
      onCreate(formData);
    }
  };

  return (
    <ModalShell
      title={t('member.dashboard.createGoalTitle')}
      onClose={onClose}
      panelClassName="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium member-body mb-2">
            {t('member.dashboard.goalTitle')}
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="member-input focus:ring-blue-500"
            placeholder={t('member.dashboard.goalTitlePlaceholder')}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium member-body mb-2">
            {t('member.dashboard.descriptionOptional')}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="member-input focus:ring-blue-500"
            placeholder={t('member.dashboard.descriptionPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium member-body mb-2">
            {t('member.dashboard.priority')}
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="member-input focus:ring-blue-500"
          >
            <option value="low">{t('member.dashboard.priorityLow')}</option>
            <option value="medium">{t('member.dashboard.priorityMedium')}</option>
            <option value="high">{t('member.dashboard.priorityHigh')}</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            {t('member.dashboard.createGoal')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-800 member-heading rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            {t('member.common.cancel')}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
