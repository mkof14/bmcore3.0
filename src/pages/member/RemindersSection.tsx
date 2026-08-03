import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Check, Trash2, Clock, Bell } from 'lucide-react';

type ScheduleKey = 'daily' | 'weekly' | 'monthly' | 'custom';

type Reminder = {
  id: string;
  title: string;
  note: string;
  schedule: ScheduleKey | string;
  done: boolean;
  createdAt: string;
};

const STORAGE_KEY = 'bmcore.reminders';
const SCHEDULE_OPTIONS: ScheduleKey[] = ['daily', 'weekly', 'monthly', 'custom'];

const LEGACY_SCHEDULE: Record<string, ScheduleKey> = {
  Daily: 'daily',
  Weekly: 'weekly',
  Monthly: 'monthly',
  Custom: 'custom',
};

function normalizeSchedule(value: string): ScheduleKey {
  if (SCHEDULE_OPTIONS.includes(value as ScheduleKey)) return value as ScheduleKey;
  return LEGACY_SCHEDULE[value] ?? 'daily';
}

export default function RemindersSection() {
  const { t, i18n } = useTranslation();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [form, setForm] = useState({ title: '', note: '', schedule: 'daily' as ScheduleKey });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Reminder[]) : [];
      setReminders(
        parsed.map((r) => ({ ...r, schedule: normalizeSchedule(String(r.schedule)) }))
      );
    } catch {
      setReminders([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    } catch {
      // ignore
    }
  }, [reminders]);

  const scheduleLabel = (key: ScheduleKey | string) =>
    t(`member.reminders.schedule.${normalizeSchedule(String(key))}`);

  const addReminder = () => {
    if (!form.title.trim()) return;
    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      note: form.note.trim(),
      schedule: form.schedule,
      done: false,
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [newReminder, ...prev]);
    setForm({ title: '', note: '', schedule: 'daily' });
  };

  const toggleDone = (id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  };

  const removeReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      <div className="member-card mb-6 p-6">
        <h3 className="member-heading mb-4 text-base font-semibold">{t('member.reminders.create')}</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="member-input px-4 py-3"
            placeholder={t('member.reminders.titlePlaceholder')}
          />
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="member-input px-4 py-3"
            placeholder={t('member.reminders.notePlaceholder')}
          />
          <select
            value={form.schedule}
            onChange={(e) => setForm({ ...form, schedule: e.target.value as ScheduleKey })}
            className="member-input px-4 py-3"
          >
            {SCHEDULE_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {t(`member.reminders.schedule.${key}`)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={addReminder}
          className="mt-4 flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-2 text-white hover:bg-orange-700"
        >
          <Plus className="h-4 w-4" />
          {t('member.reminders.addReminder')}
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className="member-card p-8 text-center">
          <Bell className="member-muted mx-auto mb-3 h-10 w-10" />
          <p className="member-body">{t('member.reminders.empty')}</p>
          <p className="member-muted mt-1 text-sm">{t('member.reminders.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="member-card p-5">
              <p className="member-muted mb-3 text-xs font-medium uppercase tracking-wide">
                {scheduleLabel(reminder.schedule)}
              </p>
              <div className="flex items-start justify-between">
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      reminder.done ? 'member-muted line-through' : 'member-heading'
                    }`}
                  >
                    {reminder.title}
                  </h3>
                  {reminder.note && (
                    <p className="member-body mt-1 text-sm">{reminder.note}</p>
                  )}
                  <div className="member-muted mt-2 flex items-center gap-2 text-xs">
                    <Clock className="h-3 w-3" />
                    {new Date(reminder.createdAt).toLocaleDateString(i18n.language)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleDone(reminder.id)}
                    className="rounded-lg bg-green-100 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    title={t('member.reminders.markDone')}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeReminder(reminder.id)}
                    className="rounded-lg bg-red-100 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    title={t('member.reminders.remove')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
