import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sun,
  Target,
  Check,
  Plus,
  FileText,
  Activity,
  Clock,
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
import ReportBrandHeader from '../../components/report/ReportBrandHeader';
import type { DailySnapshot, UserGoal, Habit, HabitCompletion, HealthReport } from '../../types/database';

interface DashboardSectionProps {
  onBack?: () => void;
}

export default function DashboardSection({ onBack }: DashboardSectionProps = {}) {
  const { t } = useTranslation();
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
      notifyUserError('Dashboard load failed');
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
      notifyUserSuccess('Goal created');
    } catch (error) {
      notifyUserError('Goal creation failed');
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
      notifyUserError('Habit update failed');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Clock className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onBack && <BackButton onClick={onBack} label="Back to Home" />}
      {!todaySnapshot ? (
        <div className="member-card rounded-xl p-8 border-2 border-dashed text-center">
          <Sun className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Ready for today's snapshot?
          </h3>
          <p className="text-gray-600 dark:text-neutral-300 mb-6 max-w-md mx-auto">
            Your snapshot appears after new data arrives from devices or reports.
          </p>
        </div>
      ) : (
        <TodaySnapshotCard snapshot={todaySnapshot} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoalsCard goals={activeGoals} onCreateGoal={() => setShowCreateGoal(true)} />
        <HabitsCard habits={todayHabits} onToggle={toggleHabitCompletion} />
      </div>

      {latestReport && <LatestReportCard report={latestReport} />}

      <QuickActionsCard />

      {showCreateGoal && <CreateGoalModal onClose={() => setShowCreateGoal(false)} onCreate={createGoal} />}
    </div>
  );
}

function TodaySnapshotCard({ snapshot }: { snapshot: DailySnapshot }) {
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
      <ReportBrandHeader
        title="BioMath Core"
        subtitle="Daily Snapshot"
        variant="strip"
        className="mb-4"
      />
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Sun className="h-8 w-8 text-orange-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-50">
              Today
            </h2>
            <p className="text-sm member-muted">
              {new Date(snapshot.snapshot_date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="flex space-x-4 text-sm">
          {snapshot.energy_level && (
            <div className="text-center">
              <p className="text-gray-600 dark:text-neutral-300 mb-1">Energy</p>
              <p className={`font-semibold capitalize ${getEnergyColor(snapshot.energy_level)}`}>
                {snapshot.energy_level}
              </p>
            </div>
          )}
          {snapshot.recovery_status && (
            <div className="text-center">
              <p className="text-gray-600 dark:text-neutral-300 mb-1">Recovery</p>
              <p className={`font-semibold capitalize ${getRecoveryColor(snapshot.recovery_status)}`}>
                {snapshot.recovery_status}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="member-card p-4 mb-4 shadow-sm">
        <p className="text-lg font-semibold text-gray-900 dark:text-neutral-50 mb-2">
          {snapshot.state_summary}
        </p>
        {snapshot.state_reason && (
          <p className="text-gray-600 dark:text-neutral-200 text-sm">
            {snapshot.state_reason}
          </p>
        )}

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="mt-2 text-sm text-orange-500 hover:text-orange-400 font-semibold transition-colors inline-flex items-center"
        >
          <Info className="h-4 w-4 mr-1" />
          {showExplanation ? 'Hide explanation' : 'Why is this happening?'}
        </button>

        {showExplanation && (
          <div className="member-inset mt-3 p-3">
            <p className="text-sm text-gray-600 dark:text-neutral-200">
              When your nervous system stays active during rest, your body doesn't fully switch to recovery mode.
              This is common after sustained effort and means gentle support is more helpful than pushing harder.
            </p>
          </div>
        )}
      </div>

      {snapshot.suggestion_of_day && (
        <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <Heart className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">
                Today's Suggestion
              </p>
              <p className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                {snapshot.suggestion_of_day.title}
              </p>
              <p className="text-sm text-gray-700 dark:text-neutral-200">
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
            {showSecondOpinion ? '▼ Hide second opinion' : '▶ Show second opinion'}
          </button>
          {showSecondOpinion && (
            <div className="mt-3 space-y-3">
              <div className="member-card rounded-lg p-3">
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">
                  Opinion A (Physiological)
                </p>
                <p className="text-sm text-gray-600 dark:text-neutral-200">
                  {snapshot.second_opinion_a}
                </p>
              </div>
              <div className="member-card rounded-lg p-3">
                <p className="text-xs font-semibold text-pink-700 dark:text-pink-300 mb-1">
                  Opinion B (Lifestyle)
                </p>
                <p className="text-sm text-gray-600 dark:text-neutral-200">
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

function GoalsCard({ goals, onCreateGoal }: { goals: UserGoal[]; onCreateGoal: () => void }) {
  return (
    <div className="member-card rounded-xl p-6">
      <ReportBrandHeader
        title="BioMath Core"
        subtitle="Goals Overview"
        variant="strip"
        className="mb-4"
      />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Active Goals
          </h3>
        </div>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors">
          + Add
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-8">
          <Target className="h-12 w-12 member-muted mx-auto mb-3" />
          <p className="text-sm member-body mb-4">
            No active goals yet
          </p>
          <button
            onClick={onCreateGoal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Goal
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
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {goal.title}
                  </h4>
                  {goal.description && (
                    <p className="text-sm text-gray-600 dark:text-neutral-300 mb-2">
                      {goal.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-neutral-300">
                    <span className={`px-2 py-1 rounded capitalize ${
                      goal.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                      goal.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-neutral-200'
                    }`}>
                      {goal.priority}
                    </span>
                    <span>Since {new Date(goal.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
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
  onToggle
}: {
  habits: Array<{ habit: Habit; completion: HabitCompletion | null }>;
  onToggle: (habitId: string, completion: HabitCompletion | null) => void;
}) {
  const completedCount = habits.filter(h => h.completion?.completed).length;

  const formatTimeAnchor = (anchor: string) => {
    const map: Record<string, string> = {
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      after_meal: 'After meal',
      before_sleep: 'Before sleep',
      custom: 'Custom'
    };
    return map[anchor] || anchor;
  };

  return (
    <div className="member-card rounded-xl p-6">
      <ReportBrandHeader
        title="BioMath Core"
        subtitle="Habit Tracker"
        variant="strip"
        className="mb-4"
      />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Today's Habits
          </h3>
        </div>
        {habits.length > 0 && (
          <span className="text-sm text-gray-600 dark:text-neutral-300">
            {completedCount} / {habits.length}
          </span>
        )}
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 member-muted mx-auto mb-3" />
          <p className="text-sm member-body">
            Habits will appear after creating goals
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
                    ? 'text-gray-500 dark:text-neutral-300 line-through'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {habit.title}
                </p>
                <div className="flex items-center space-x-3 mt-1 text-xs text-gray-600 dark:text-neutral-300">
                  <span>{formatTimeAnchor(habit.time_anchor)}</span>
                  <span>•</span>
                  <span>{habit.duration_minutes} min</span>
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
            Excellent! All habits completed
          </p>
        </div>
      )}
    </div>
  );
}

function LatestReportCard({ report }: { report: HealthReport }) {
  return (
    <div className="member-card rounded-xl border-l-4 border-l-purple-500 p-6 shadow-sm">
      <ReportBrandHeader
        title="BioMath Core"
        subtitle="Latest Report"
        variant="strip"
        className="mb-4"
      />
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Latest Report
            </h3>
            <p className="text-sm text-gray-600 dark:text-neutral-300">
              {new Date(report.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors flex items-center">
          Open
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      <p className="text-gray-700 dark:text-neutral-200 line-clamp-2 mb-4">
        {report.summary}
      </p>

      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-neutral-300">
        {report.insights && Array.isArray(report.insights) && (
          <span>{report.insights.length} insights</span>
        )}
        {report.recommendations && Array.isArray(report.recommendations) && (
          <span>•</span>
        )}
        {report.recommendations && Array.isArray(report.recommendations) && (
          <span>{report.recommendations.length} recommendations</span>
        )}
      </div>
    </div>
  );
}

function QuickActionsCard() {
  return (
    <div className="member-card rounded-xl p-6">
      <ReportBrandHeader
        title="BioMath Core"
        subtitle="Quick Actions"
        variant="strip"
        className="mb-4"
      />
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Create Report
          </span>
        </button>
        <button className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
          <Target className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Add Goal
          </span>
        </button>
        <button className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
          <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Open Chat
          </span>
        </button>
        <button className="flex flex-col items-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors">
          <Calendar className="h-6 w-6 text-teal-600 dark:text-teal-400 mb-2" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            History
          </span>
        </button>
      </div>
    </div>
  );
}

function CreateGoalModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => void }) {
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
      title="Create New Goal"
      onClose={onClose}
      panelClassName="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-2">
            Goal Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="member-input focus:ring-blue-500"
            placeholder="e.g., Improve sleep quality"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-2">
            Description (optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="member-input focus:ring-blue-500"
            placeholder="Describe your goal..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-2">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="member-input focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Create Goal
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
