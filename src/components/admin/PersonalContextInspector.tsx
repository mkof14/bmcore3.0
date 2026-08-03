import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Download,
  Link2,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  FlaskConical,
} from 'lucide-react';
import { supabase, isSupabaseMock } from '../../lib/supabase';
import { notifyError, notifySuccess, notifyInfo } from '../../lib/adminNotify';
import {
  getQuestionnaireDigitalFile,
  inspectPersonalContext,
  rebuildPersonalContext,
  type PersonalContextInspectorView,
} from '../../lib/personalContext';

type ListedUser = {
  id: string;
  email?: string | null;
  name?: string | null;
};

export default function PersonalContextInspector() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingContext, setLoadingContext] = useState(false);
  const [view, setView] = useState<PersonalContextInspectorView | null>(null);
  const [simJson, setSimJson] = useState<string | null>(null);

  useEffect(() => {
    void loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, first_name, last_name')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const rows = ((data || []) as Array<Record<string, unknown>>).map((r) => ({
        id: String(r.id),
        email: (r.email as string) || null,
        name:
          (r.name as string) ||
          [r.first_name, r.last_name].filter(Boolean).join(' ') ||
          null,
      }));

      // Mock mode often returns only the signed-in superadmin.
      if (!rows.length && isSupabaseMock) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          rows.push({ id: user.id, email: user.email, name: 'Super Admin' });
        }
      }

      setUsers(rows);
      if (!selectedId && rows[0]) setSelectedId(rows[0].id);
    } catch {
      notifyError(t('admin.personalContext.loadUsersFailed'));
    } finally {
      setLoadingUsers(false);
    }
  };

  const runInspect = async (userId: string, force = false) => {
    setLoadingContext(true);
    setSimJson(null);
    try {
      const next = force
        ? await inspectPersonalContext(userId, { forceRefresh: true })
        : await inspectPersonalContext(userId);
      setView(next);
    } catch {
      notifyError(t('admin.personalContext.loadContextFailed'));
      setView(null);
    } finally {
      setLoadingContext(false);
    }
  };

  useEffect(() => {
    if (!selectedId) return;
    void runInspect(selectedId);
  }, [selectedId]);

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      u.id.toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.name || '').toLowerCase().includes(q)
    );
  });

  const healthTone =
    view?.linkageLabel === 'green'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : view?.linkageLabel === 'yellow'
        ? 'bg-amber-100 text-amber-800 border-amber-300'
        : 'bg-rose-100 text-rose-800 border-rose-300';

  const handleRebuild = async () => {
    if (!selectedId) return;
    setLoadingContext(true);
    try {
      await rebuildPersonalContext(selectedId);
      await runInspect(selectedId, true);
      notifySuccess(t('admin.personalContext.rebuildSuccess'));
    } catch {
      notifyError(t('admin.personalContext.rebuildFailed'));
    } finally {
      setLoadingContext(false);
    }
  };

  const handleExport = async () => {
    if (!selectedId) return;
    try {
      const file = await getQuestionnaireDigitalFile(
        selectedId,
        view?.context.questionnaire ?? undefined,
      );
      const blob = new Blob([JSON.stringify(file, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questionnaire-digital-file-${selectedId.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      notifySuccess(t('admin.personalContext.exportSuccess'));
    } catch {
      notifyError(t('admin.personalContext.exportFailed'));
    }
  };

  const handleSimulate = () => {
    if (!view) return;
    setSimJson(JSON.stringify(view.simulatedReportPayload, null, 2));
    notifyInfo(t('admin.personalContext.simulateReady'));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('admin.personalContext.title')}
        </h1>
        <p className="text-sm text-gray-600">{t('admin.personalContext.subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t('admin.personalContext.lookupLabel')}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('admin.personalContext.lookupPlaceholder')}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => void loadUsers()}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            {t('admin.personalContext.refreshUsers')}
          </button>
          <div className="max-h-[50vh] overflow-y-auto space-y-1">
            {loadingUsers ? (
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('admin.personalContext.loadingUsers')}
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-slate-400">{t('admin.personalContext.noUsers')}</p>
            ) : (
              filtered.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedId(u.id)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm border ${
                    selectedId === u.id
                      ? 'border-orange-300 bg-orange-50 text-orange-900'
                      : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <p className="font-medium truncate">{u.name || u.email || u.id}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email || u.id}</p>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleRebuild()}
              disabled={!selectedId || loadingContext}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              {t('admin.personalContext.rebuild')}
            </button>
            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={!selectedId}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              {t('admin.personalContext.exportFile')}
            </button>
            <button
              type="button"
              onClick={handleSimulate}
              disabled={!view}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              <FlaskConical className="h-4 w-4" />
              {t('admin.personalContext.simulate')}
            </button>
          </div>

          {loadingContext ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              {t('admin.personalContext.loadingContext')}
            </div>
          ) : !view ? (
            <p className="text-sm text-slate-500">{t('admin.personalContext.selectUser')}</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${healthTone}`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t(`admin.personalContext.linkage.${view.linkageLabel}`)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                  <Link2 className="h-3.5 w-3.5" />
                  {t('admin.personalContext.completeness', {
                    score: view.context.completeness.score,
                    questionnaire: view.context.completeness.questionnairePercent,
                    profile: view.context.completeness.profilePercent,
                  })}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500 mb-1">
                    {t('admin.personalContext.profileFields')}
                  </p>
                  <ul className="space-y-1 text-slate-700">
                    {Object.entries(view.context.profile.fields).map(([k, v]) => (
                      <li key={k}>
                        {k}:{' '}
                        <strong>
                          {typeof v === 'boolean'
                            ? v
                              ? t('admin.personalContext.yes')
                              : t('admin.personalContext.no')
                            : String(v)}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500 mb-1">
                    {t('admin.personalContext.servicesTouched')}
                  </p>
                  <p className="text-slate-700">
                    {view.context.services.serviceIds.length
                      ? view.context.services.serviceIds.join(', ')
                      : t('admin.personalContext.none')}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {t('admin.personalContext.signals', {
                      count: view.context.services.knowledgeSignals,
                    })}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500 mb-1">
                    {t('admin.personalContext.metaCounts')}
                  </p>
                  <p>
                    {t('admin.personalContext.medicalFiles', {
                      count: view.context.medicalFiles.count,
                    })}
                  </p>
                  <p>
                    {t('admin.personalContext.devices', {
                      count: view.context.devices.count,
                    })}
                  </p>
                  <p>
                    {t('admin.personalContext.tier', {
                      tier: view.context.subscriptionTier || t('admin.personalContext.none'),
                    })}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">
                  {t('admin.personalContext.sections')}
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {view.sectionStatuses.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs flex items-center justify-between"
                    >
                      <span className="font-medium">{s.id}</span>
                      <span className="text-slate-500">
                        {s.locked
                          ? t('admin.personalContext.locked')
                          : `${s.status} · ${s.progress}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">
                  {t('admin.personalContext.lastSnapshot')}
                </h3>
                <pre className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-auto max-h-40">
                  {view.context.lastReportSnapshot
                    ? JSON.stringify(view.context.lastReportSnapshot, null, 2)
                    : t('admin.personalContext.noSnapshot')}
                </pre>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">
                  {t('admin.personalContext.contextBlurb')}
                </h3>
                <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  {view.context.contextBlurb}
                </p>
              </div>

              {simJson ? (
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">
                    {t('admin.personalContext.simulateResult')}
                  </h3>
                  <pre className="text-xs bg-slate-900 text-slate-100 rounded-lg p-3 overflow-auto max-h-72">
                    {simJson}
                  </pre>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
