import { useState, useEffect, type ReactNode } from 'react';
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
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError } from '../../lib/adminNotify';
import MemberMetricCard from '../../components/ui/MemberMetricCard';
import StateCard from '../../components/ui/StateCard';
import ErrorBanner from '../../components/ui/ErrorBanner';

type QuestionnaireSection =
  | 'categories'
  | 'personal_info'
  | 'medical_history'
  | 'medications'
  | 'allergies'
  | 'vital_signs'
  | 'lifestyle'
  | 'psychological_health'
  | 'mens_sexual_health'
  | 'womens_sexual_health';

interface QuestionnaireData {
  [key: string]: unknown;
}

type FormChangeHandler = (field: string, value: unknown) => void;

type FormProps = {
  data: QuestionnaireData;
  onChange: FormChangeHandler;
  unitSystem?: 'metric' | 'imperial';
};

const SECTION_IDS: QuestionnaireSection[] = [
  'categories',
  'personal_info',
  'medical_history',
  'medications',
  'allergies',
  'vital_signs',
  'lifestyle',
  'psychological_health',
  'mens_sexual_health',
  'womens_sexual_health',
];

const SECTION_GROUPS: Array<{ id: string; sections: QuestionnaireSection[] }> = [
  { id: 'basics', sections: ['categories', 'personal_info'] },
  { id: 'clinical', sections: ['medical_history', 'medications', 'allergies', 'vital_signs'] },
  { id: 'lifestyle', sections: ['lifestyle', 'psychological_health'] },
  { id: 'specialized', sections: ['mens_sexual_health', 'womens_sexual_health'] },
];

/** Stored values kept English for backward-compatible saved answers. */
const HEALTH_AREAS = [
  { value: 'Sleep & Recovery', key: 'sleep' },
  { value: 'Energy & Fatigue', key: 'energy' },
  { value: 'Nutrition', key: 'nutrition' },
  { value: 'Stress Management', key: 'stress' },
  { value: 'Hormones', key: 'hormones' },
  { value: 'Prevention', key: 'prevention' },
  { value: 'Performance', key: 'performance' },
  { value: 'Mental Wellness', key: 'mental' },
  { value: 'Longevity', key: 'longevity' },
] as const;

const emptyResponses = (): Record<QuestionnaireSection, QuestionnaireData> => ({
  categories: {},
  personal_info: {},
  medical_history: {},
  medications: {},
  allergies: {},
  vital_signs: {},
  lifestyle: {},
  psychological_health: {},
  mens_sexual_health: {},
  womens_sexual_health: {},
});

const emptyStatuses = (): Record<QuestionnaireSection, 'draft' | 'complete'> => ({
  categories: 'draft',
  personal_info: 'draft',
  medical_history: 'draft',
  medications: 'draft',
  allergies: 'draft',
  vital_signs: 'draft',
  lifestyle: 'draft',
  psychological_health: 'draft',
  mens_sexual_health: 'draft',
  womens_sexual_health: 'draft',
});

type Props = {
  onNavigateSection?: (section: string) => void;
};

export default function QuestionnairesSection({ onNavigateSection }: Props) {
  const { t, i18n } = useTranslation();
  const [currentSection, setCurrentSection] = useState<QuestionnaireSection>('categories');
  const [responses, setResponses] = useState(emptyResponses);
  const [statuses, setStatuses] = useState(emptyStatuses);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [mensSexualHealthUnlocked, setMensSexualHealthUnlocked] = useState(false);
  const [womensSexualHealthUnlocked, setWomensSexualHealthUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveError, setAutoSaveError] = useState(false);

  useEffect(() => {
    loadQuestionnaire();
  }, []);

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
        setResponses({
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
        });

        setStatuses({
          categories: data.categories_status || 'draft',
          personal_info: data.personal_info_status || 'draft',
          medical_history: data.medical_history_status || 'draft',
          medications: data.medications_status || 'draft',
          allergies: data.allergies_status || 'draft',
          vital_signs: data.vital_signs_status || 'draft',
          lifestyle: data.lifestyle_status || 'draft',
          psychological_health: data.psychological_health_status || 'draft',
          mens_sexual_health: data.mens_sexual_health_status || 'draft',
          womens_sexual_health: data.womens_sexual_health_status || 'draft',
        });

        setUnitSystem(data.unit_system || 'metric');
        setMensSexualHealthUnlocked(data.mens_sexual_health_unlocked || false);
        setWomensSexualHealthUnlocked(data.womens_sexual_health_unlocked || false);
        setLastSaved(data.last_autosave_at ? new Date(data.last_autosave_at) : null);
      }
    } catch {
      setLoadError(true);
      notifyUserError('Questionnaire load failed');
    } finally {
      setIsLoading(false);
    }
  };

  const checkSectionComplete = (section: QuestionnaireSection, data: QuestionnaireData): boolean => {
    const requiredFields: Record<QuestionnaireSection, string[]> = {
      categories: ['primary_health_areas', 'primary_priority'],
      personal_info: [
        'full_name',
        'biological_sex',
        'date_of_birth',
        'country',
        'height',
        'weight',
        'primary_language',
      ],
      medical_history: ['has_diagnosed_conditions'],
      medications: ['taking_medications'],
      allergies: ['has_allergies'],
      vital_signs: [],
      lifestyle: [],
      psychological_health: [],
      mens_sexual_health: [],
      womens_sexual_health: [],
    };

    const required = requiredFields[section];
    return required.every((field) => {
      const value = data[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== '' && value !== null;
    });
  };

  const autoSave = async (section: QuestionnaireSection, newData: QuestionnaireData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const updateData: Record<string, unknown> = {
        [section]: newData,
        [`${section}_status`]: checkSectionComplete(section, newData) ? 'complete' : 'draft',
      };

      const { error } = await supabase.from('questionnaire_responses').upsert(
        {
          user_id: user.id,
          ...updateData,
        },
        {
          onConflict: 'user_id',
        }
      );

      if (error) {
        setAutoSaveError(true);
      } else {
        setLastSaved(new Date());
        setAutoSaveError(false);
      }
    } catch {
      setAutoSaveError(true);
    }
  };

  const handleInputChange = (section: QuestionnaireSection, field: string, value: unknown) => {
    const newData = { ...responses[section], [field]: value };
    setResponses((prev) => ({ ...prev, [section]: newData }));

    const newStatus = checkSectionComplete(section, newData) ? 'complete' : 'draft';
    setStatuses((prev) => ({ ...prev, [section]: newStatus }));

    autoSave(section, newData);
  };

  const createSectionChangeHandler = (section: QuestionnaireSection): FormChangeHandler => {
    return (field, value) => {
      handleInputChange(section, field, value);
    };
  };

  const toggleUnitSystem = async () => {
    const newSystem = unitSystem === 'metric' ? 'imperial' : 'metric';
    setUnitSystem(newSystem);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('questionnaire_responses').upsert(
      {
        user_id: user.id,
        unit_system: newSystem,
      },
      {
        onConflict: 'user_id',
      }
    );
  };

  const isSectionLocked = (id: QuestionnaireSection): boolean => {
    if (id === 'mens_sexual_health') return !mensSexualHealthUnlocked;
    if (id === 'womens_sexual_health') return !womensSexualHealthUnlocked;
    return false;
  };

  const getSectionProgress = (section: QuestionnaireSection): number => {
    const data = responses[section];
    const keys = Object.keys(data);
    if (keys.length === 0) return 0;

    const filled = keys.filter((key) => {
      const value = data[key];
      if (Array.isArray(value)) return value.length > 0;
      return value !== '' && value !== null && value !== undefined;
    }).length;
    return Math.round((filled / keys.length) * 100);
  };

  const unlockedSections = SECTION_IDS.filter((id) => !isSectionLocked(id));
  const completedCount = unlockedSections.filter((id) => statuses[id] === 'complete').length;
  const inProgressCount = unlockedSections.filter(
    (id) => statuses[id] !== 'complete' && getSectionProgress(id) > 0
  ).length;
  const overallProgress =
    unlockedSections.length === 0
      ? 0
      : Math.round(
          unlockedSections.reduce((sum, id) => sum + getSectionProgress(id), 0) /
            unlockedSections.length
        );

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

  const currentLocked = isSectionLocked(currentSection);
  const currentStatus = statuses[currentSection];
  const currentProgress = getSectionProgress(currentSection);

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
                      const progress = getSectionProgress(id);
                      const active = currentSection === id;

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => !locked && setCurrentSection(id)}
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
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="member-card rounded-xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6 pb-5 border-b border-[var(--bm-border)]">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold member-heading">
                  {t(`member.questionnaires.section.${currentSection}`)}
                </h2>
                <p className="mt-1 text-sm member-body max-w-2xl">
                  {t(`member.questionnaires.sectionDesc.${currentSection}`)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {currentLocked ? (
                  <StatusPill tone="locked">{t('member.questionnaires.statusLocked')}</StatusPill>
                ) : currentStatus === 'complete' ? (
                  <StatusPill tone="complete">{t('member.questionnaires.statusComplete')}</StatusPill>
                ) : (
                  <StatusPill tone="draft">{t('member.questionnaires.statusDraft')}</StatusPill>
                )}
                {!currentLocked && (
                  <span className="text-xs tabular-nums member-muted">{currentProgress}%</span>
                )}
              </div>
            </div>

            {!currentLocked && currentProgress > 0 && (
              <div className="mb-6 h-1.5 rounded-full bg-[var(--bm-surface)] dark:bg-[var(--bm-inset)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    currentStatus === 'complete' ? 'bg-emerald-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            )}

            {currentSection === 'categories' && (
              <CategoriesForm
                data={responses.categories}
                onChange={createSectionChangeHandler('categories')}
              />
            )}
            {currentSection === 'personal_info' && (
              <PersonalInfoForm
                data={responses.personal_info}
                onChange={createSectionChangeHandler('personal_info')}
                unitSystem={unitSystem}
              />
            )}
            {currentSection === 'medical_history' && (
              <MedicalHistoryForm
                data={responses.medical_history}
                onChange={createSectionChangeHandler('medical_history')}
              />
            )}
            {currentSection === 'medications' && (
              <MedicationsForm
                data={responses.medications}
                onChange={createSectionChangeHandler('medications')}
              />
            )}
            {currentSection === 'allergies' && (
              <AllergiesForm
                data={responses.allergies}
                onChange={createSectionChangeHandler('allergies')}
              />
            )}
            {currentSection === 'vital_signs' && (
              <VitalSignsForm
                data={responses.vital_signs}
                onChange={createSectionChangeHandler('vital_signs')}
                unitSystem={unitSystem}
              />
            )}
            {currentSection === 'lifestyle' && (
              <LifestyleForm
                data={responses.lifestyle}
                onChange={createSectionChangeHandler('lifestyle')}
              />
            )}
            {currentSection === 'psychological_health' && (
              <PsychologicalHealthForm
                data={responses.psychological_health}
                onChange={createSectionChangeHandler('psychological_health')}
              />
            )}
            {currentSection === 'mens_sexual_health' &&
              (mensSexualHealthUnlocked ? (
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
            {currentSection === 'womens_sexual_health' &&
              (womensSexualHealthUnlocked ? (
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
    locked:
      'bg-[var(--bm-surface)] member-muted border-[var(--bm-border)]',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${tones[tone]}`}>
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
          <input
            type="text"
            value={String(data.country || '')}
            onChange={(e) => onChange('country', e.target.value)}
            className="member-input"
          />
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
          <FieldLabel>{t('member.questionnaires.medicalHistory.conditionsList')}</FieldLabel>
          <textarea
            value={String(data.conditions_list || '')}
            onChange={(e) => onChange('conditions_list', e.target.value)}
            rows={4}
            className="member-input"
            placeholder={t('member.questionnaires.medicalHistory.conditionsPlaceholder')}
          />
        </div>
      )}
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
          <FieldLabel>{t('member.questionnaires.medications.list')}</FieldLabel>
          <textarea
            value={String(data.medications_list || '')}
            onChange={(e) => onChange('medications_list', e.target.value)}
            rows={4}
            className="member-input"
            placeholder={t('member.questionnaires.medications.placeholder')}
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
        <div>
          <FieldLabel>{t('member.questionnaires.allergies.list')}</FieldLabel>
          <textarea
            value={String(data.allergies_list || '')}
            onChange={(e) => onChange('allergies_list', e.target.value)}
            rows={4}
            className="member-input"
            placeholder={t('member.questionnaires.allergies.placeholder')}
          />
        </div>
      )}
    </div>
  );
}

function VitalSignsForm({ data, onChange }: FormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <p className="text-sm member-muted">{t('member.questionnaires.vitalSigns.optionalNote')}</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>{t('member.questionnaires.vitalSigns.restingHeartRate')}</FieldLabel>
          <input
            type="number"
            value={String(data.resting_heart_rate || '')}
            onChange={(e) => onChange('resting_heart_rate', e.target.value)}
            className="member-input"
          />
        </div>
        <div>
          <FieldLabel>{t('member.questionnaires.vitalSigns.bloodPressure')}</FieldLabel>
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
          <FieldLabel>{t('member.questionnaires.lifestyle.smoking')}</FieldLabel>
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
          <FieldLabel>{t('member.questionnaires.lifestyle.alcohol')}</FieldLabel>
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
          <FieldLabel>{t('member.questionnaires.lifestyle.exercise')}</FieldLabel>
          <input
            type="number"
            value={String(data.exercise_frequency || '')}
            onChange={(e) => onChange('exercise_frequency', e.target.value)}
            className="member-input"
          />
        </div>

        <div>
          <FieldLabel>{t('member.questionnaires.lifestyle.sleep')}</FieldLabel>
          <input
            type="number"
            step="0.5"
            value={String(data.sleep_duration || '')}
            onChange={(e) => onChange('sleep_duration', e.target.value)}
            className="member-input"
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
      <div>
        <FieldLabel>{t('member.questionnaires.psychological.mood')}</FieldLabel>
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
        <FieldLabel>{t('member.questionnaires.psychological.stress')}</FieldLabel>
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
        <FieldLabel>{t('member.questionnaires.mensHealth.interest')}</FieldLabel>
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
        <FieldLabel>{t('member.questionnaires.mensHealth.confidence')}</FieldLabel>
        <YesNo
          value={data.sexual_function_confidence}
          onChange={(next) => onChange('sexual_function_confidence', next)}
        />
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
        <FieldLabel>{t('member.questionnaires.womensHealth.desireChanges')}</FieldLabel>
        <YesNo
          value={data.sexual_desire_changes}
          onChange={(next) => onChange('sexual_desire_changes', next)}
        />
      </div>

      <div>
        <FieldLabel>{t('member.questionnaires.womensHealth.wantsGuidance')}</FieldLabel>
        <YesNo
          value={data.wants_hormonal_guidance}
          onChange={(next) => onChange('wants_hormonal_guidance', next)}
        />
      </div>
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
