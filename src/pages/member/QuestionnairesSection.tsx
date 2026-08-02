import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Check,
  Lock,
  Save,
  Globe,
  Ruler,
  ClipboardList,
  CircleDot,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Flag,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError } from '../../lib/adminNotify';
import MemberMetricCard from '../../components/ui/MemberMetricCard';
import StateCard from '../../components/ui/StateCard';
import ErrorBanner from '../../components/ui/ErrorBanner';
import {
  SECTION_IDS,
  SECTION_GROUPS,
  HEALTH_AREAS,
  QUESTIONNAIRE_COUNTRIES,
  emptyResponses,
  emptyStatuses,
  checkSectionComplete,
  getSectionProgress,
  convertPersonalMeasures,
  unlocksFromPersonalAndCategories,
  type QuestionnaireSection,
  type QuestionnaireData,
  type UnitSystem,
  type SexualHealthUnlocks,
} from '../../lib/questionnaire';

type FormChangeHandler = (field: string, value: unknown) => void;

type FormProps = {
  data: QuestionnaireData;
  onChange: FormChangeHandler;
  unitSystem?: UnitSystem;
};

type ViewMode = QuestionnaireSection | 'summary';

type Props = {
  onNavigateSection?: (section: string) => void;
};

const AUTOSAVE_MS = 500;

export default function QuestionnairesSection({ onNavigateSection }: Props) {
  const { t, i18n } = useTranslation();
  const [currentView, setCurrentView] = useState<ViewMode>('categories');
  const [responses, setResponses] = useState(emptyResponses);
  const [statuses, setStatuses] = useState(emptyStatuses);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [unlocks, setUnlocks] = useState<SexualHealthUnlocks>({
    mens_sexual_health_unlocked: false,
    womens_sexual_health_unlocked: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveError, setAutoSaveError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const saveTimers = useRef<Partial<Record<QuestionnaireSection, ReturnType<typeof setTimeout>>>>(
    {}
  );
  const pendingPayloads = useRef<Partial<Record<QuestionnaireSection, QuestionnaireData>>>({});
  const unlocksRef = useRef(unlocks);
  unlocksRef.current = unlocks;

  useEffect(() => {
    loadQuestionnaire();
    return () => {
      Object.values(saveTimers.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  const persistUnlocks = useCallback(async (next: SexualHealthUnlocks) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('questionnaire_responses').upsert(
      {
        user_id: user.id,
        mens_sexual_health_unlocked: next.mens_sexual_health_unlocked,
        womens_sexual_health_unlocked: next.womens_sexual_health_unlocked,
      },
      { onConflict: 'user_id' }
    );
  }, []);

  const applyDerivedUnlocks = useCallback(
    async (
      personalInfo: QuestionnaireData,
      categories: QuestionnaireData,
      current?: SexualHealthUnlocks
    ) => {
      const next = unlocksFromPersonalAndCategories(
        personalInfo,
        categories,
        current || unlocksRef.current
      );
      const changed =
        next.mens_sexual_health_unlocked !== unlocksRef.current.mens_sexual_health_unlocked ||
        next.womens_sexual_health_unlocked !== unlocksRef.current.womens_sexual_health_unlocked;
      setUnlocks(next);
      if (changed) await persistUnlocks(next);
      return next;
    },
    [persistUnlocks]
  );

  const loadQuestionnaire = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoadError(true);
        return;
      }

      const { data, error } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        setLoadError(true);
        notifyUserError('Questionnaire load failed');
        return;
      }

      if (data) {
        const nextResponses = {
          categories: data.categories || {},
          personal_info: data.personal_info || {},
          medical_history: data.medical_history || {},
          medications: data.medications || {},
          allergies: data.allergies || {},
          vital_signs: data.vital_signs || {},
          lifestyle: data.lifestyle || {},
          psychological_health: data.psychological_health || {},
          mens_sexual_health: data.mens_sexual_health || {},
          womens_sexual_health: data.womens_sexual_health || {},
        };
        setResponses(nextResponses);

        const nextStatuses = emptyStatuses();
        for (const id of SECTION_IDS) {
          const saved = data[`${id}_status`] as 'draft' | 'complete' | undefined;
          nextStatuses[id] = checkSectionComplete(id, nextResponses[id])
            ? 'complete'
            : saved || 'draft';
        }
        setStatuses(nextStatuses);
        setUnitSystem(data.unit_system || 'metric');
        setLastSaved(data.last_autosave_at ? new Date(data.last_autosave_at) : null);

        await applyDerivedUnlocks(nextResponses.personal_info, nextResponses.categories, {
          mens_sexual_health_unlocked: Boolean(data.mens_sexual_health_unlocked),
          womens_sexual_health_unlocked: Boolean(data.womens_sexual_health_unlocked),
        });
      }
    } catch {
      setLoadError(true);
      notifyUserError('Questionnaire load failed');
    } finally {
      setIsLoading(false);
    }
  };

  const flushSave = useCallback(async (section: QuestionnaireSection, newData: QuestionnaireData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setIsSaving(true);
      const updateData: Record<string, unknown> = {
        [section]: newData,
        [`${section}_status`]: checkSectionComplete(section, newData) ? 'complete' : 'draft',
      };

      const { error } = await supabase.from('questionnaire_responses').upsert(
        {
          user_id: user.id,
          ...updateData,
        },
        { onConflict: 'user_id' }
      );

      if (error) {
        setAutoSaveError(true);
      } else {
        setLastSaved(new Date());
        setAutoSaveError(false);
      }
    } catch {
      setAutoSaveError(true);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const scheduleSave = useCallback(
    (section: QuestionnaireSection, newData: QuestionnaireData) => {
      pendingPayloads.current[section] = newData;
      const existing = saveTimers.current[section];
      if (existing) clearTimeout(existing);
      saveTimers.current[section] = setTimeout(() => {
        const payload = pendingPayloads.current[section];
        if (payload) void flushSave(section, payload);
      }, AUTOSAVE_MS);
    },
    [flushSave]
  );

  const handleInputChange = async (
    section: QuestionnaireSection,
    field: string,
    value: unknown
  ) => {
    const newData = { ...responses[section], [field]: value };
    setResponses((prev) => ({ ...prev, [section]: newData }));

    const newStatus = checkSectionComplete(section, newData) ? 'complete' : 'draft';
    setStatuses((prev) => ({ ...prev, [section]: newStatus }));
    scheduleSave(section, newData);

    if (
      (section === 'personal_info' && field === 'biological_sex') ||
      (section === 'categories' && field === 'primary_health_areas')
    ) {
      const personal = section === 'personal_info' ? newData : responses.personal_info;
      const categories = section === 'categories' ? newData : responses.categories;
      await applyDerivedUnlocks(personal, categories);
    }
  };

  const createSectionChangeHandler = (section: QuestionnaireSection): FormChangeHandler => {
    return (field, value) => {
      void handleInputChange(section, field, value);
    };
  };

  const toggleUnitSystem = async () => {
    const newSystem: UnitSystem = unitSystem === 'metric' ? 'imperial' : 'metric';
    const converted = convertPersonalMeasures(
      responses.personal_info.height,
      responses.personal_info.weight,
      unitSystem,
      newSystem
    );
    const nextPersonal = {
      ...responses.personal_info,
      height: converted.height,
      weight: converted.weight,
    };

    setUnitSystem(newSystem);
    setResponses((prev) => ({ ...prev, personal_info: nextPersonal }));
    setStatuses((prev) => ({
      ...prev,
      personal_info: checkSectionComplete('personal_info', nextPersonal) ? 'complete' : 'draft',
    }));

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('questionnaire_responses').upsert(
      {
        user_id: user.id,
        unit_system: newSystem,
        personal_info: nextPersonal,
        personal_info_status: checkSectionComplete('personal_info', nextPersonal)
          ? 'complete'
          : 'draft',
      },
      { onConflict: 'user_id' }
    );
    setLastSaved(new Date());
  };

  const isSectionLocked = (id: QuestionnaireSection): boolean => {
    if (id === 'mens_sexual_health') return !unlocks.mens_sexual_health_unlocked;
    if (id === 'womens_sexual_health') return !unlocks.womens_sexual_health_unlocked;
    return false;
  };

  const unlockedSections = SECTION_IDS.filter((id) => !isSectionLocked(id));
  const completedCount = unlockedSections.filter((id) => statuses[id] === 'complete').length;
  const inProgressCount = unlockedSections.filter(
    (id) => statuses[id] !== 'complete' && getSectionProgress(id, responses[id]) > 0
  ).length;
  const overallProgress =
    unlockedSections.length === 0
      ? 0
      : Math.round(
          unlockedSections.reduce(
            (sum, id) => sum + getSectionProgress(id, responses[id]),
            0
          ) / unlockedSections.length
        );
  const isProfileComplete =
    unlockedSections.length > 0 && completedCount === unlockedSections.length;

  const navSections = unlockedSections;
  const currentSectionIndex =
    currentView === 'summary' ? -1 : navSections.indexOf(currentView as QuestionnaireSection);

  const goPrev = () => {
    if (currentView === 'summary') {
      const last = navSections[navSections.length - 1];
      if (last) setCurrentView(last);
      return;
    }
    if (currentSectionIndex > 0) setCurrentView(navSections[currentSectionIndex - 1]);
  };

  const goNext = () => {
    if (currentView === 'summary') return;
    if (currentSectionIndex >= 0 && currentSectionIndex < navSections.length - 1) {
      setCurrentView(navSections[currentSectionIndex + 1]);
      return;
    }
    setCurrentView('summary');
  };

  if (isLoading) {
    return (
      <StateCard
        title={t('member.questionnaires.loading')}
        icon={<Loader2 className="h-8 w-8 animate-spin" />}
      />
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={t('member.questionnaires.loadError')} />
        <button
          type="button"
          onClick={loadQuestionnaire}
          className="px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors"
        >
          {t('member.questionnaires.retry')}
        </button>
      </div>
    );
  }

  const currentLocked =
    currentView !== 'summary' && isSectionLocked(currentView as QuestionnaireSection);
  const currentStatus =
    currentView === 'summary' ? 'complete' : statuses[currentView as QuestionnaireSection];
  const currentProgress =
    currentView === 'summary'
      ? overallProgress
      : getSectionProgress(currentView as QuestionnaireSection, responses[currentView as QuestionnaireSection]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MemberMetricCard
          accent="emerald"
          icon={<Check className="h-5 w-5" />}
          value={`${completedCount}/${unlockedSections.length}`}
          label={t('member.questionnaires.completed')}
        />
        <MemberMetricCard
          accent="orange"
          icon={<CircleDot className="h-5 w-5" />}
          value={String(inProgressCount)}
          label={t('member.questionnaires.inProgress')}
        />
        <MemberMetricCard
          accent="blue"
          icon={<ClipboardList className="h-5 w-5" />}
          value={`${overallProgress}%`}
          label={t('member.questionnaires.overallProgress')}
        />
        <MemberMetricCard
          accent="amber"
          icon={<Save className="h-5 w-5" />}
          value={
            autoSaveError
              ? t('member.questionnaires.saveErrorShort')
              : isSaving
                ? t('member.questionnaires.saving')
                : lastSaved
                  ? lastSaved.toLocaleTimeString(i18n.language)
                  : '—'
          }
          label={
            autoSaveError
              ? t('member.questionnaires.autoSaveFailed')
              : lastSaved
                ? t('member.questionnaires.savedAt', {
                    time: lastSaved.toLocaleTimeString(i18n.language),
                  })
                : t('member.questionnaires.notSavedYet')
          }
        />
      </div>

      {!isProfileComplete && (
        <div className="member-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-orange-200/80 dark:border-orange-500/25 bg-orange-50/50 dark:bg-orange-500/5">
          <div>
            <p className="text-sm font-semibold member-heading">
              {t('member.questionnaires.finishProfile.title')}
            </p>
            <p className="text-sm member-body mt-0.5">
              {t('member.questionnaires.finishProfile.body', {
                remaining: unlockedSections.length - completedCount,
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const nextIncomplete = unlockedSections.find((id) => statuses[id] !== 'complete');
              setCurrentView(nextIncomplete || 'summary');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition-colors"
          >
            <Flag className="h-4 w-4" />
            {t('member.questionnaires.finishProfile.cta')}
          </button>
        </div>
      )}

      <div className="member-card rounded-xl p-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-sm font-medium member-heading">
            {t('member.questionnaires.overallProgress')}
          </p>
          <span className="text-sm tabular-nums member-muted">{overallProgress}%</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--bm-surface)] dark:bg-[var(--bm-inset)] overflow-hidden">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-72 flex-shrink-0">
          <div className="member-card rounded-xl p-4 sticky top-4">
            <h3 className="text-sm font-semibold member-heading mb-3">
              {t('member.questionnaires.settings')}
            </h3>

            <button
              type="button"
              onClick={toggleUnitSystem}
              className="w-full flex items-center justify-between p-2.5 member-inset rounded-lg hover:border-orange-300 transition-colors mb-2"
            >
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 member-muted" />
                <span className="text-sm member-body">{t('member.questionnaires.units')}</span>
              </div>
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {unitSystem === 'metric'
                  ? t('member.questionnaires.metric')
                  : t('member.questionnaires.imperial')}
              </span>
            </button>

            <div className="flex items-center justify-between p-2.5 member-inset rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 member-muted" />
                <span className="text-sm member-body">{t('member.questionnaires.language')}</span>
              </div>
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {(i18n.language || 'en').slice(0, 2).toUpperCase()}
              </span>
            </div>

            {autoSaveError && (
              <ErrorBanner message={t('member.questionnaires.autoSaveFailed')} className="mb-4" />
            )}

            <h3 className="text-sm font-semibold member-heading mb-2">
              {t('member.questionnaires.sections')}
            </h3>

            <div className="space-y-4">
              {SECTION_GROUPS.map((group) => (
                <div key={group.id}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] member-muted mb-1.5 px-1">
                    {t(`member.questionnaires.groups.${group.id}`)}
                  </p>
                  <div className="space-y-1">
                    {group.sections.map((id) => {
                      const locked = isSectionLocked(id);
                      const status = statuses[id];
                      const progress = getSectionProgress(id, responses[id]);
                      const active = currentView === id;

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => !locked && setCurrentView(id)}
                          disabled={locked}
                          className={`w-full flex items-center justify-between gap-2 p-2.5 rounded-lg transition-colors text-left border ${
                            active
                              ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-300'
                              : locked
                                ? 'member-inset member-muted cursor-not-allowed opacity-70'
                                : 'border-transparent hover:bg-[var(--bm-surface)] member-body'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {locked ? (
                              <Lock className="h-4 w-4 flex-shrink-0" />
                            ) : status === 'complete' ? (
                              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border-2 border-current flex-shrink-0 opacity-60" />
                            )}
                            <span className="text-sm font-medium truncate">
                              {t(`member.questionnaires.section.${id}`)}
                            </span>
                          </div>
                          {!locked && progress > 0 && (
                            <span className="text-xs tabular-nums flex-shrink-0">{progress}%</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setCurrentView('summary')}
                className={`w-full flex items-center gap-2 p-2.5 rounded-lg transition-colors text-left border ${
                  currentView === 'summary'
                    ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-300'
                    : 'border-transparent hover:bg-[var(--bm-surface)] member-body'
                }`}
              >
                <ListChecks className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">
                  {t('member.questionnaires.summary.nav')}
                </span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="member-card rounded-xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6 pb-5 border-b border-[var(--bm-border)]">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold member-heading">
                  {currentView === 'summary'
                    ? t('member.questionnaires.summary.title')
                    : t(`member.questionnaires.section.${currentView}`)}
                </h2>
                <p className="mt-1 text-sm member-body max-w-2xl">
                  {currentView === 'summary'
                    ? t('member.questionnaires.summary.subtitle')
                    : t(`member.questionnaires.sectionDesc.${currentView}`)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {currentView === 'summary' ? (
                  <StatusPill tone={isProfileComplete ? 'complete' : 'draft'}>
                    {isProfileComplete
                      ? t('member.questionnaires.statusComplete')
                      : t('member.questionnaires.statusDraft')}
                  </StatusPill>
                ) : currentLocked ? (
                  <StatusPill tone="locked">{t('member.questionnaires.statusLocked')}</StatusPill>
                ) : currentStatus === 'complete' ? (
                  <StatusPill tone="complete">{t('member.questionnaires.statusComplete')}</StatusPill>
                ) : (
                  <StatusPill tone="draft">{t('member.questionnaires.statusDraft')}</StatusPill>
                )}
                {currentView !== 'summary' && !currentLocked && (
                  <span className="text-xs tabular-nums member-muted">{currentProgress}%</span>
                )}
              </div>
            </div>

            {currentView !== 'summary' && !currentLocked && currentProgress > 0 && (
              <div className="mb-6 h-1.5 rounded-full bg-[var(--bm-surface)] dark:bg-[var(--bm-inset)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    currentStatus === 'complete' ? 'bg-emerald-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            )}

            {currentView === 'summary' ? (
              <SummaryView
                responses={responses}
                statuses={statuses}
                unlockedSections={unlockedSections}
                overallProgress={overallProgress}
                isProfileComplete={isProfileComplete}
                onOpenSection={(id) => setCurrentView(id)}
                onNavigateHealthGuide={() => onNavigateSection?.('ai-assistant')}
              />
            ) : (
              <>
                {currentView === 'categories' && (
                  <CategoriesForm
                    data={responses.categories}
                    onChange={createSectionChangeHandler('categories')}
                  />
                )}
                {currentView === 'personal_info' && (
                  <PersonalInfoForm
                    data={responses.personal_info}
                    onChange={createSectionChangeHandler('personal_info')}
                    unitSystem={unitSystem}
                  />
                )}
                {currentView === 'medical_history' && (
                  <MedicalHistoryForm
                    data={responses.medical_history}
                    onChange={createSectionChangeHandler('medical_history')}
                  />
                )}
                {currentView === 'medications' && (
                  <MedicationsForm
                    data={responses.medications}
                    onChange={createSectionChangeHandler('medications')}
                  />
                )}
                {currentView === 'allergies' && (
                  <AllergiesForm
                    data={responses.allergies}
                    onChange={createSectionChangeHandler('allergies')}
                  />
                )}
                {currentView === 'vital_signs' && (
                  <VitalSignsForm
                    data={responses.vital_signs}
                    onChange={createSectionChangeHandler('vital_signs')}
                    unitSystem={unitSystem}
                  />
                )}
                {currentView === 'lifestyle' && (
                  <LifestyleForm
                    data={responses.lifestyle}
                    onChange={createSectionChangeHandler('lifestyle')}
                  />
                )}
                {currentView === 'psychological_health' && (
                  <PsychologicalHealthForm
                    data={responses.psychological_health}
                    onChange={createSectionChangeHandler('psychological_health')}
                  />
                )}
                {currentView === 'mens_sexual_health' &&
                  (unlocks.mens_sexual_health_unlocked ? (
                    <MensSexualHealthForm
                      data={responses.mens_sexual_health}
                      onChange={createSectionChangeHandler('mens_sexual_health')}
                    />
                  ) : (
                    <LockedSectionMessage
                      sectionKey="mens_sexual_health"
                      onActivate={() => onNavigateSection?.('catalog')}
                    />
                  ))}
                {currentView === 'womens_sexual_health' &&
                  (unlocks.womens_sexual_health_unlocked ? (
                    <WomensSexualHealthForm
                      data={responses.womens_sexual_health}
                      onChange={createSectionChangeHandler('womens_sexual_health')}
                    />
                  ) : (
                    <LockedSectionMessage
                      sectionKey="womens_sexual_health"
                      onActivate={() => onNavigateSection?.('catalog')}
                    />
                  ))}
              </>
            )}

            <div className="mt-8 pt-5 border-t border-[var(--bm-border)] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentView !== 'summary' && currentSectionIndex <= 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg member-inset text-sm font-medium member-heading disabled:opacity-40 disabled:cursor-not-allowed hover:border-orange-300 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                {t('member.questionnaires.nav.previous')}
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={currentView === 'summary'}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {currentView !== 'summary' && currentSectionIndex === navSections.length - 1
                  ? t('member.questionnaires.nav.viewSummary')
                  : t('member.questionnaires.nav.next')}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: 'complete' | 'draft' | 'locked';
  children: ReactNode;
}) {
  const tones = {
    complete:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
    draft:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
    locked: 'bg-[var(--bm-surface)] member-muted border-[var(--bm-border)]',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  const { t } = useTranslation();
  return (
    <label className="block text-sm font-medium member-heading mb-2">
      {children}
      {required ? (
        <span className="text-red-500 ms-1" title={t('member.questionnaires.required')}>
          *
        </span>
      ) : null}
    </label>
  );
}

function YesNo({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (next: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-3">
      {[true, false].map((option) => {
        const selected = value === option;
        return (
          <label
            key={String(option)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border cursor-pointer transition-colors ${
              selected
                ? 'border-orange-300 bg-orange-50 dark:bg-orange-500/10 dark:border-orange-500/40'
                : 'member-inset hover:border-orange-300'
            }`}
          >
            <input
              type="radio"
              checked={selected}
              onChange={() => onChange(option)}
              className="accent-orange-600"
            />
            <span className="text-sm member-heading">
              {option ? t('member.questionnaires.yes') : t('member.questionnaires.no')}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function ScaleSelect({
  value,
  onChange,
  options,
}: {
  value: unknown;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const { t } = useTranslation();
  return (
    <select
      value={String(value || '')}
      onChange={(e) => onChange(e.target.value)}
      className="member-input"
    >
      <option value="">{t('member.questionnaires.select')}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function CategoriesForm({ data, onChange }: FormProps) {
  const { t } = useTranslation();
  const selected = Array.isArray(data.primary_health_areas)
    ? (data.primary_health_areas as string[])
    : [];

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel required>{t('member.questionnaires.categories.areasLabel')}</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {HEALTH_AREAS.map((area) => {
            const checked = selected.includes(area.value);
            return (
              <label
                key={area.value}
                className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                  checked
                    ? 'border-orange-300 bg-orange-50 dark:bg-orange-500/10 dark:border-orange-500/40'
                    : 'member-inset hover:border-orange-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    onChange(
                      'primary_health_areas',
                      e.target.checked
                        ? [...selected, area.value]
                        : selected.filter((a) => a !== area.value)
                    );
                  }}
                  className="rounded border-slate-300 accent-orange-600"
                />
                <span className="text-sm member-heading">
                  {t(`member.questionnaires.areas.${area.key}`)}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.categories.priorityLabel')}</FieldLabel>
        <select
          value={String(data.primary_priority || '')}
          onChange={(e) => onChange('primary_priority', e.target.value)}
          className="member-input"
        >
          <option value="">{t('member.questionnaires.select')}</option>
          <option value="prevention">{t('member.questionnaires.priorities.prevention')}</option>
          <option value="improvement">{t('member.questionnaires.priorities.improvement')}</option>
          <option value="maintenance">{t('member.questionnaires.priorities.maintenance')}</option>
          <option value="recovery">{t('member.questionnaires.priorities.recovery')}</option>
        </select>
      </div>
    </div>
  );
}

function PersonalInfoForm({ data, onChange, unitSystem }: FormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <FieldLabel required>{t('member.questionnaires.personalInfo.fullName')}</FieldLabel>
          <input
            type="text"
            value={String(data.full_name || '')}
            onChange={(e) => onChange('full_name', e.target.value)}
            className="member-input"
          />
        </div>

        <div>
          <FieldLabel required>{t('member.questionnaires.personalInfo.biologicalSex')}</FieldLabel>
          <select
            value={String(data.biological_sex || '')}
            onChange={(e) => onChange('biological_sex', e.target.value)}
            className="member-input"
          >
            <option value="">{t('member.questionnaires.select')}</option>
            <option value="male">{t('member.questionnaires.personalInfo.male')}</option>
            <option value="female">{t('member.questionnaires.personalInfo.female')}</option>
          </select>
          <p className="mt-1.5 text-xs member-muted">
            {t('member.questionnaires.personalInfo.sexUnlockHint')}
          </p>
        </div>

        <div>
          <FieldLabel required>{t('member.questionnaires.personalInfo.dateOfBirth')}</FieldLabel>
          <input
            type="date"
            value={String(data.date_of_birth || '')}
            onChange={(e) => onChange('date_of_birth', e.target.value)}
            className="member-input"
          />
        </div>

        <div>
          <FieldLabel required>{t('member.questionnaires.personalInfo.country')}</FieldLabel>
          <select
            value={String(data.country || '')}
            onChange={(e) => onChange('country', e.target.value)}
            className="member-input"
          >
            <option value="">{t('member.questionnaires.select')}</option>
            {data.country &&
            !QUESTIONNAIRE_COUNTRIES.some((c) => c.code === data.country) ? (
              <option value={String(data.country)}>{String(data.country)}</option>
            ) : null}
            {QUESTIONNAIRE_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {t(`member.questionnaires.countries.${c.code}`, { defaultValue: c.name })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel required>
            {t('member.questionnaires.personalInfo.height', {
              unit: unitSystem === 'metric' ? 'cm' : 'in',
            })}
          </FieldLabel>
          <input
            type="number"
            value={String(data.height || '')}
            onChange={(e) => onChange('height', e.target.value)}
            className="member-input"
          />
        </div>

        <div>
          <FieldLabel required>
            {t('member.questionnaires.personalInfo.weight', {
              unit: unitSystem === 'metric' ? 'kg' : 'lbs',
            })}
          </FieldLabel>
          <input
            type="number"
            value={String(data.weight || '')}
            onChange={(e) => onChange('weight', e.target.value)}
            className="member-input"
          />
        </div>

        <div className="md:col-span-2">
          <FieldLabel required>{t('member.questionnaires.personalInfo.primaryLanguage')}</FieldLabel>
          <input
            type="text"
            value={String(data.primary_language || '')}
            onChange={(e) => onChange('primary_language', e.target.value)}
            className="member-input"
            placeholder={t('member.questionnaires.personalInfo.primaryLanguagePlaceholder')}
          />
        </div>
      </div>
    </div>
  );
}

function MedicalHistoryForm({ data, onChange }: FormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <FieldLabel required>{t('member.questionnaires.medicalHistory.hasConditions')}</FieldLabel>
        <YesNo
          value={data.has_diagnosed_conditions}
          onChange={(next) => onChange('has_diagnosed_conditions', next)}
        />
      </div>

      {data.has_diagnosed_conditions === true && (
        <div>
          <FieldLabel required>{t('member.questionnaires.medicalHistory.conditionsList')}</FieldLabel>
          <textarea
            value={String(data.conditions_list || '')}
            onChange={(e) => onChange('conditions_list', e.target.value)}
            rows={4}
            className="member-input"
            placeholder={t('member.questionnaires.medicalHistory.conditionsPlaceholder')}
          />
        </div>
      )}

      <div>
        <FieldLabel required>{t('member.questionnaires.medicalHistory.familyHistory')}</FieldLabel>
        <textarea
          value={String(data.family_history || '')}
          onChange={(e) => onChange('family_history', e.target.value)}
          rows={3}
          className="member-input"
          placeholder={t('member.questionnaires.medicalHistory.familyHistoryPlaceholder')}
        />
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.medicalHistory.surgeries')}</FieldLabel>
        <textarea
          value={String(data.surgeries || '')}
          onChange={(e) => onChange('surgeries', e.target.value)}
          rows={3}
          className="member-input"
          placeholder={t('member.questionnaires.medicalHistory.surgeriesPlaceholder')}
        />
      </div>
    </div>
  );
}

function MedicationsForm({ data, onChange }: FormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <FieldLabel required>{t('member.questionnaires.medications.taking')}</FieldLabel>
        <YesNo
          value={data.taking_medications}
          onChange={(next) => onChange('taking_medications', next)}
        />
      </div>

      {data.taking_medications === true && (
        <div>
          <FieldLabel required>{t('member.questionnaires.medications.list')}</FieldLabel>
          <textarea
            value={String(data.medications_list || '')}
            onChange={(e) => onChange('medications_list', e.target.value)}
            rows={4}
            className="member-input"
            placeholder={t('member.questionnaires.medications.placeholder')}
          />
        </div>
      )}

      <div>
        <FieldLabel required>{t('member.questionnaires.medications.takingSupplements')}</FieldLabel>
        <YesNo
          value={data.taking_supplements}
          onChange={(next) => onChange('taking_supplements', next)}
        />
      </div>

      {data.taking_supplements === true && (
        <div>
          <FieldLabel required>{t('member.questionnaires.medications.supplementsList')}</FieldLabel>
          <textarea
            value={String(data.supplements_list || '')}
            onChange={(e) => onChange('supplements_list', e.target.value)}
            rows={3}
            className="member-input"
            placeholder={t('member.questionnaires.medications.supplementsPlaceholder')}
          />
        </div>
      )}
    </div>
  );
}

function AllergiesForm({ data, onChange }: FormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <FieldLabel required>{t('member.questionnaires.allergies.has')}</FieldLabel>
        <YesNo value={data.has_allergies} onChange={(next) => onChange('has_allergies', next)} />
      </div>

      {data.has_allergies === true && (
        <>
          <div>
            <FieldLabel required>{t('member.questionnaires.allergies.list')}</FieldLabel>
            <textarea
              value={String(data.allergies_list || '')}
              onChange={(e) => onChange('allergies_list', e.target.value)}
              rows={4}
              className="member-input"
              placeholder={t('member.questionnaires.allergies.placeholder')}
            />
          </div>
          <div>
            <FieldLabel required>{t('member.questionnaires.allergies.severity')}</FieldLabel>
            <ScaleSelect
              value={data.allergy_severity}
              onChange={(v) => onChange('allergy_severity', v)}
              options={[
                { value: 'mild', label: t('member.questionnaires.allergies.severityMild') },
                { value: 'moderate', label: t('member.questionnaires.allergies.severityModerate') },
                { value: 'severe', label: t('member.questionnaires.allergies.severitySevere') },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}

function VitalSignsForm({ data, onChange }: FormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <p className="text-sm member-muted">{t('member.questionnaires.vitalSigns.requiredNote')}</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <FieldLabel required>{t('member.questionnaires.vitalSigns.restingHeartRate')}</FieldLabel>
          <input
            type="number"
            value={String(data.resting_heart_rate || '')}
            onChange={(e) => onChange('resting_heart_rate', e.target.value)}
            className="member-input"
          />
        </div>
        <div>
          <FieldLabel required>{t('member.questionnaires.vitalSigns.bloodPressure')}</FieldLabel>
          <input
            type="text"
            value={String(data.blood_pressure || '')}
            onChange={(e) => onChange('blood_pressure', e.target.value)}
            placeholder={t('member.questionnaires.vitalSigns.bloodPressurePlaceholder')}
            className="member-input"
          />
        </div>
      </div>
    </div>
  );
}

function LifestyleForm({ data, onChange }: FormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <FieldLabel required>{t('member.questionnaires.lifestyle.smoking')}</FieldLabel>
          <select
            value={String(data.smoking_status || '')}
            onChange={(e) => onChange('smoking_status', e.target.value)}
            className="member-input"
          >
            <option value="">{t('member.questionnaires.select')}</option>
            <option value="never">{t('member.questionnaires.lifestyle.smokingNever')}</option>
            <option value="former">{t('member.questionnaires.lifestyle.smokingFormer')}</option>
            <option value="current">{t('member.questionnaires.lifestyle.smokingCurrent')}</option>
          </select>
        </div>

        <div>
          <FieldLabel required>{t('member.questionnaires.lifestyle.alcohol')}</FieldLabel>
          <select
            value={String(data.alcohol_consumption || '')}
            onChange={(e) => onChange('alcohol_consumption', e.target.value)}
            className="member-input"
          >
            <option value="">{t('member.questionnaires.select')}</option>
            <option value="none">{t('member.questionnaires.lifestyle.alcoholNone')}</option>
            <option value="occasional">
              {t('member.questionnaires.lifestyle.alcoholOccasional')}
            </option>
            <option value="moderate">{t('member.questionnaires.lifestyle.alcoholModerate')}</option>
            <option value="frequent">{t('member.questionnaires.lifestyle.alcoholFrequent')}</option>
          </select>
        </div>

        <div>
          <FieldLabel required>{t('member.questionnaires.lifestyle.exercise')}</FieldLabel>
          <input
            type="number"
            value={String(data.exercise_frequency || '')}
            onChange={(e) => onChange('exercise_frequency', e.target.value)}
            className="member-input"
          />
        </div>

        <div>
          <FieldLabel required>{t('member.questionnaires.lifestyle.sleep')}</FieldLabel>
          <input
            type="number"
            step="0.5"
            value={String(data.sleep_duration || '')}
            onChange={(e) => onChange('sleep_duration', e.target.value)}
            className="member-input"
          />
        </div>

        <div>
          <FieldLabel required>{t('member.questionnaires.lifestyle.dietQuality')}</FieldLabel>
          <ScaleSelect
            value={data.diet_quality}
            onChange={(v) => onChange('diet_quality', v)}
            options={[
              { value: 'poor', label: t('member.questionnaires.lifestyle.qualityPoor') },
              { value: 'fair', label: t('member.questionnaires.lifestyle.qualityFair') },
              { value: 'good', label: t('member.questionnaires.lifestyle.qualityGood') },
              { value: 'excellent', label: t('member.questionnaires.lifestyle.qualityExcellent') },
            ]}
          />
        </div>

        <div>
          <FieldLabel required>{t('member.questionnaires.lifestyle.sleepQuality')}</FieldLabel>
          <ScaleSelect
            value={data.sleep_quality}
            onChange={(v) => onChange('sleep_quality', v)}
            options={[
              { value: 'poor', label: t('member.questionnaires.lifestyle.qualityPoor') },
              { value: 'fair', label: t('member.questionnaires.lifestyle.qualityFair') },
              { value: 'good', label: t('member.questionnaires.lifestyle.qualityGood') },
              { value: 'excellent', label: t('member.questionnaires.lifestyle.qualityExcellent') },
            ]}
          />
        </div>

        <div>
          <FieldLabel required>{t('member.questionnaires.lifestyle.caffeine')}</FieldLabel>
          <ScaleSelect
            value={data.caffeine_intake}
            onChange={(v) => onChange('caffeine_intake', v)}
            options={[
              { value: 'none', label: t('member.questionnaires.lifestyle.caffeineNone') },
              { value: 'low', label: t('member.questionnaires.lifestyle.caffeineLow') },
              { value: 'moderate', label: t('member.questionnaires.lifestyle.caffeineModerate') },
              { value: 'high', label: t('member.questionnaires.lifestyle.caffeineHigh') },
            ]}
          />
        </div>

        <div>
          <FieldLabel required>{t('member.questionnaires.lifestyle.activityType')}</FieldLabel>
          <ScaleSelect
            value={data.activity_type}
            onChange={(v) => onChange('activity_type', v)}
            options={[
              { value: 'none', label: t('member.questionnaires.lifestyle.activityNone') },
              { value: 'cardio', label: t('member.questionnaires.lifestyle.activityCardio') },
              { value: 'strength', label: t('member.questionnaires.lifestyle.activityStrength') },
              { value: 'mixed', label: t('member.questionnaires.lifestyle.activityMixed') },
              { value: 'mobility', label: t('member.questionnaires.lifestyle.activityMobility') },
            ]}
          />
        </div>

        <div className="md:col-span-2">
          <FieldLabel required>{t('member.questionnaires.lifestyle.stressLevel')}</FieldLabel>
          <ScaleSelect
            value={data.stress_level}
            onChange={(v) => onChange('stress_level', v)}
            options={[
              { value: '1', label: t('member.questionnaires.lifestyle.stress1') },
              { value: '2', label: t('member.questionnaires.lifestyle.stress2') },
              { value: '3', label: t('member.questionnaires.lifestyle.stress3') },
              { value: '4', label: t('member.questionnaires.lifestyle.stress4') },
              { value: '5', label: t('member.questionnaires.lifestyle.stress5') },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function PsychologicalHealthForm({ data, onChange }: FormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="member-inset rounded-xl p-4 border border-[var(--bm-border)]">
        <p className="text-sm member-body">{t('member.questionnaires.psychological.disclaimer')}</p>
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.psychological.mood')}</FieldLabel>
        <select
          value={String(data.mood_stability || '')}
          onChange={(e) => onChange('mood_stability', e.target.value)}
          className="member-input"
        >
          <option value="">{t('member.questionnaires.select')}</option>
          <option value="very_stable">{t('member.questionnaires.psychological.moodVeryStable')}</option>
          <option value="mostly_stable">
            {t('member.questionnaires.psychological.moodMostlyStable')}
          </option>
          <option value="somewhat_variable">
            {t('member.questionnaires.psychological.moodSomewhatVariable')}
          </option>
          <option value="quite_variable">
            {t('member.questionnaires.psychological.moodQuiteVariable')}
          </option>
        </select>
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.psychological.moodScale')}</FieldLabel>
        <ScaleSelect
          value={data.mood_scale}
          onChange={(v) => onChange('mood_scale', v)}
          options={[
            { value: '1', label: t('member.questionnaires.psychological.moodScale1') },
            { value: '2', label: t('member.questionnaires.psychological.moodScale2') },
            { value: '3', label: t('member.questionnaires.psychological.moodScale3') },
            { value: '4', label: t('member.questionnaires.psychological.moodScale4') },
            { value: '5', label: t('member.questionnaires.psychological.moodScale5') },
          ]}
        />
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.psychological.anxiety')}</FieldLabel>
        <ScaleSelect
          value={data.anxiety_frequency}
          onChange={(v) => onChange('anxiety_frequency', v)}
          options={[
            { value: 'rarely', label: t('member.questionnaires.psychological.freqRarely') },
            { value: 'sometimes', label: t('member.questionnaires.psychological.freqSometimes') },
            { value: 'often', label: t('member.questionnaires.psychological.freqOften') },
            { value: 'most_days', label: t('member.questionnaires.psychological.freqMostDays') },
          ]}
        />
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.psychological.energy')}</FieldLabel>
        <ScaleSelect
          value={data.energy_level}
          onChange={(v) => onChange('energy_level', v)}
          options={[
            { value: 'very_low', label: t('member.questionnaires.psychological.energyVeryLow') },
            { value: 'low', label: t('member.questionnaires.psychological.energyLow') },
            { value: 'moderate', label: t('member.questionnaires.psychological.energyModerate') },
            { value: 'high', label: t('member.questionnaires.psychological.energyHigh') },
          ]}
        />
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.psychological.stress')}</FieldLabel>
        <YesNo
          value={data.prolonged_stress}
          onChange={(next) => onChange('prolonged_stress', next)}
        />
      </div>
    </div>
  );
}

function MensSexualHealthForm({ data, onChange }: FormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="member-inset rounded-xl p-4 border border-[var(--bm-border)]">
        <p className="text-sm member-body">
          <span className="font-semibold member-heading">
            {t('member.questionnaires.confidentiality.title')}
          </span>{' '}
          {t('member.questionnaires.confidentiality.body')}
        </p>
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.mensHealth.interest')}</FieldLabel>
        <select
          value={String(data.sexual_interest_trend || '')}
          onChange={(e) => onChange('sexual_interest_trend', e.target.value)}
          className="member-input"
        >
          <option value="">{t('member.questionnaires.select')}</option>
          <option value="increasing">{t('member.questionnaires.mensHealth.increasing')}</option>
          <option value="stable">{t('member.questionnaires.mensHealth.stable')}</option>
          <option value="decreasing">{t('member.questionnaires.mensHealth.decreasing')}</option>
        </select>
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.mensHealth.confidence')}</FieldLabel>
        <YesNo
          value={data.sexual_function_confidence}
          onChange={(next) => onChange('sexual_function_confidence', next)}
        />
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.mensHealth.erectile')}</FieldLabel>
        <YesNo
          value={data.erectile_concern}
          onChange={(next) => onChange('erectile_concern', next)}
        />
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.mensHealth.satisfaction')}</FieldLabel>
        <ScaleSelect
          value={data.satisfaction_level}
          onChange={(v) => onChange('satisfaction_level', v)}
          options={[
            { value: 'low', label: t('member.questionnaires.sexualShared.satisfactionLow') },
            {
              value: 'moderate',
              label: t('member.questionnaires.sexualShared.satisfactionModerate'),
            },
            { value: 'high', label: t('member.questionnaires.sexualShared.satisfactionHigh') },
          ]}
        />
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.mensHealth.wantsGuidance')}</FieldLabel>
        <YesNo value={data.wants_guidance} onChange={(next) => onChange('wants_guidance', next)} />
      </div>
    </div>
  );
}

function WomensSexualHealthForm({ data, onChange }: FormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="member-inset rounded-xl p-4 border border-[var(--bm-border)]">
        <p className="text-sm member-body">
          <span className="font-semibold member-heading">
            {t('member.questionnaires.confidentiality.title')}
          </span>{' '}
          {t('member.questionnaires.confidentiality.body')}
        </p>
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.womensHealth.desireChanges')}</FieldLabel>
        <YesNo
          value={data.sexual_desire_changes}
          onChange={(next) => onChange('sexual_desire_changes', next)}
        />
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.womensHealth.cycle')}</FieldLabel>
        <ScaleSelect
          value={data.cycle_regularity}
          onChange={(v) => onChange('cycle_regularity', v)}
          options={[
            { value: 'regular', label: t('member.questionnaires.womensHealth.cycleRegular') },
            { value: 'irregular', label: t('member.questionnaires.womensHealth.cycleIrregular') },
            {
              value: 'not_applicable',
              label: t('member.questionnaires.womensHealth.cycleNa'),
            },
          ]}
        />
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.womensHealth.comfort')}</FieldLabel>
        <ScaleSelect
          value={data.comfort_during_intimacy}
          onChange={(v) => onChange('comfort_during_intimacy', v)}
          options={[
            { value: 'comfortable', label: t('member.questionnaires.womensHealth.comfortOk') },
            {
              value: 'occasional_discomfort',
              label: t('member.questionnaires.womensHealth.comfortOccasional'),
            },
            {
              value: 'frequent_discomfort',
              label: t('member.questionnaires.womensHealth.comfortFrequent'),
            },
          ]}
        />
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.womensHealth.satisfaction')}</FieldLabel>
        <ScaleSelect
          value={data.satisfaction_level}
          onChange={(v) => onChange('satisfaction_level', v)}
          options={[
            { value: 'low', label: t('member.questionnaires.sexualShared.satisfactionLow') },
            {
              value: 'moderate',
              label: t('member.questionnaires.sexualShared.satisfactionModerate'),
            },
            { value: 'high', label: t('member.questionnaires.sexualShared.satisfactionHigh') },
          ]}
        />
      </div>

      <div>
        <FieldLabel required>{t('member.questionnaires.womensHealth.wantsGuidance')}</FieldLabel>
        <YesNo
          value={data.wants_hormonal_guidance}
          onChange={(next) => onChange('wants_hormonal_guidance', next)}
        />
      </div>
    </div>
  );
}

function SummaryView({
  responses,
  statuses,
  unlockedSections,
  overallProgress,
  isProfileComplete,
  onOpenSection,
  onNavigateHealthGuide,
}: {
  responses: Record<QuestionnaireSection, QuestionnaireData>;
  statuses: Record<QuestionnaireSection, 'draft' | 'complete'>;
  unlockedSections: QuestionnaireSection[];
  overallProgress: number;
  isProfileComplete: boolean;
  onOpenSection: (id: QuestionnaireSection) => void;
  onNavigateHealthGuide?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="member-inset rounded-xl p-4 border border-[var(--bm-border)]">
        <p className="text-sm member-body">{t('member.questionnaires.summary.disclaimer')}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm member-heading font-semibold">
          {t('member.questionnaires.summary.progressLine', {
            percent: overallProgress,
            completed: unlockedSections.filter((id) => statuses[id] === 'complete').length,
            total: unlockedSections.length,
          })}
        </p>
        {isProfileComplete ? (
          <StatusPill tone="complete">{t('member.questionnaires.summary.completeBadge')}</StatusPill>
        ) : (
          <StatusPill tone="draft">{t('member.questionnaires.summary.incompleteBadge')}</StatusPill>
        )}
      </div>

      <div className="space-y-3">
        {unlockedSections.map((id) => {
          const progress = getSectionProgress(id, responses[id]);
          const complete = statuses[id] === 'complete';
          const highlights = Object.entries(responses[id]).filter(([, v]) => {
            if (Array.isArray(v)) return v.length > 0;
            if (typeof v === 'boolean') return true;
            return v !== undefined && v !== null && String(v).trim() !== '';
          });

          return (
            <button
              key={id}
              type="button"
              onClick={() => onOpenSection(id)}
              className="w-full text-left member-inset rounded-xl p-4 border border-[var(--bm-border)] hover:border-orange-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {complete ? (
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <CircleDot className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-sm font-semibold member-heading">
                    {t(`member.questionnaires.section.${id}`)}
                  </span>
                </div>
                <span className="text-xs tabular-nums member-muted">{progress}%</span>
              </div>
              {highlights.length === 0 ? (
                <p className="text-xs member-muted">{t('member.questionnaires.summary.emptySection')}</p>
              ) : (
                <ul className="text-xs member-body space-y-1">
                  {highlights.slice(0, 4).map(([key, value]) => (
                    <li key={key}>
                      <span className="member-muted">{key}: </span>
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </li>
                  ))}
                  {highlights.length > 4 ? (
                    <li className="member-muted">
                      {t('member.questionnaires.summary.moreFields', {
                        count: highlights.length - 4,
                      })}
                    </li>
                  ) : null}
                </ul>
              )}
            </button>
          );
        })}
      </div>

      {onNavigateHealthGuide ? (
        <button
          type="button"
          onClick={onNavigateHealthGuide}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition-colors"
        >
          {t('member.questionnaires.summary.openHealthGuide')}
        </button>
      ) : null}
    </div>
  );
}

function LockedSectionMessage({
  sectionKey,
  onActivate,
}: {
  sectionKey: QuestionnaireSection;
  onActivate?: () => void;
}) {
  const { t } = useTranslation();
  const sectionName = t(`member.questionnaires.section.${sectionKey}`);

  return (
    <div className="py-6">
      <StateCard
        title={t('member.questionnaires.locked.title', { section: sectionName })}
        description={t('member.questionnaires.locked.body')}
        icon={<Lock className="h-10 w-10" />}
      />
      {onActivate ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onActivate}
            className="px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition-colors"
          >
            {t('member.questionnaires.locked.cta')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
