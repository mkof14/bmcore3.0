import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Plus, Check, Trash2, Clock } from 'lucide-react';
import ReportBrandHeader from '../../components/report/ReportBrandHeader';

type Reminder = {
  id: string;
  title: string;
  note: string;
  schedule: string;
  done: boolean;
  createdAt: string;
};

const STORAGE_KEY = 'bmcore.reminders';

export default function RemindersSection() {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [form, setForm] = useState({ title: '', note: '', schedule: 'Daily' });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setReminders(raw ? (JSON.parse(raw) as Reminder[]) : []);
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
    setForm({ title: '', note: '', schedule: 'Daily' });
  };

  const toggleDone = (id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  };

  const removeReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2 flex items-center gap-3">
          <Bell className="h-8 w-8 text-orange-500" />
          {t('member.reminders.title')}
        </h1>
        <p className="text-gray-600">{t('member.reminders.subtitle')}</p>
      </div>

      <ReportBrandHeader title="BioMath Core" subtitle="Reminders" variant="strip" className="mb-6" />

      <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 mb-6 shadow-lg">
        <ReportBrandHeader variant="strip" subtitle={t('member.reminders.create')} className="mb-4" />
        <div className="grid md:grid-cols-3 gap-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="px-4 py-3 bg-white border border-slate-200 rounded-lg text-gray-900"
            placeholder={t('member.reminders.titlePlaceholder')}
          />
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="px-4 py-3 bg-white border border-slate-200 rounded-lg text-gray-900"
            placeholder={t('member.reminders.notePlaceholder')}
          />
          <select
            value={form.schedule}
            onChange={(e) => setForm({ ...form, schedule: e.target.value })}
            className="px-4 py-3 bg-white border border-slate-200 rounded-lg text-gray-900"
          >
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Custom</option>
          </select>
        </div>
        <button
          onClick={addReminder}
          className="mt-4 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Reminder
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {reminders.length === 0 && (
          <div className="text-sm text-gray-500">No reminders yet.</div>
        )}
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
          className="bg-white/90 dark:bg-[var(--bm-surface)] border border-slate-200 dark:border-gray-800 rounded-xl p-5 shadow-sm"
          >
            <ReportBrandHeader variant="strip" subtitle={reminder.schedule} className="mb-3" />
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${reminder.done ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                  {reminder.title}
                </h3>
                {reminder.note && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{reminder.note}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {new Date(reminder.createdAt).toLocaleDateString('en-US')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleDone(reminder.id)}
                  className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeReminder(reminder.id)}
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
