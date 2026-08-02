import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Lock, Save, Globe, Ruler } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError } from '../../lib/adminNotify';
import ReportBrandHeader from '../../components/report/ReportBrandHeader';

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
  [key: string]: any;
}

export default function QuestionnairesSection() {
  const { t } = useTranslation();
  const [currentSection, setCurrentSection] = useState<QuestionnaireSection>('categories');
  const [responses, setResponses] = useState<Record<QuestionnaireSection, QuestionnaireData>>({
    categories: {},
    personal_info: {},
    medical_history: {},
    medications: {},
    allergies: {},
    vital_signs: {},
    lifestyle: {},
    psychological_health: {},
    mens_sexual_health: {},
    womens_sexual_health: {}
  });
  const [statuses, setStatuses] = useState<Record<QuestionnaireSection, 'draft' | 'complete'>>({
    categories: 'draft',
    personal_info: 'draft',
    medical_history: 'draft',
    medications: 'draft',
    allergies: 'draft',
    vital_signs: 'draft',
    lifestyle: 'draft',
    psychological_health: 'draft',
    mens_sexual_health: 'draft',
    womens_sexual_health: 'draft'
  });
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [language, setLanguage] = useState('en');
  const [mensSexualHealthUnlocked, setMensSexualHealthUnlocked] = useState(false);
  const [womensSexualHealthUnlocked, setWomensSexualHealthUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveError, setAutoSaveError] = useState(false);

  useEffect(() => {
    loadQuestionnaire();
  }, []);

  const loadQuestionnaire = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
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
          womens_sexual_health: data.womens_sexual_health || {}
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
          womens_sexual_health: data.womens_sexual_health_status || 'draft'
        });

        setUnitSystem(data.unit_system || 'metric');
        setLanguage(data.language || 'en');
        setMensSexualHealthUnlocked(data.mens_sexual_health_unlocked || false);
        setWomensSexualHealthUnlocked(data.womens_sexual_health_unlocked || false);
        setLastSaved(data.last_autosave_at ? new Date(data.last_autosave_at) : null);
      }
    } catch (error) {
      notifyUserError('Questionnaire load failed');
    } finally {
      setIsLoading(false);
    }
  };

  const autoSave = async (section: QuestionnaireSection, newData: QuestionnaireData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updateData: any = {
        [section]: newData,
        [`${section}_status`]: checkSectionComplete(section, newData) ? 'complete' : 'draft'
      };

      const { error } = await supabase
        .from('questionnaire_responses')
        .upsert({
          user_id: user.id,
          ...updateData
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        setAutoSaveError(true);
      } else {
        setLastSaved(new Date());
        setAutoSaveError(false);
      }
    } catch (error) {
      setAutoSaveError(true);
    }
  };

  const handleInputChange = (section: QuestionnaireSection, field: string, value: any) => {
    const newData = { ...responses[section], [field]: value };
    setResponses(prev => ({ ...prev, [section]: newData }));

    const newStatus = checkSectionComplete(section, newData) ? 'complete' : 'draft';
    setStatuses(prev => ({ ...prev, [section]: newStatus }));

    autoSave(section, newData);
  };

  const createSectionChangeHandler = (section: QuestionnaireSection) => {
    return (field: string, value: unknown) => {
      handleInputChange(section, field, value);
    };
  };

  const checkSectionComplete = (section: QuestionnaireSection, data: QuestionnaireData): boolean => {
    const requiredFields: Record<QuestionnaireSection, string[]> = {
      categories: ['primary_health_areas', 'primary_priority'],
      personal_info: ['full_name', 'biological_sex', 'date_of_birth', 'country', 'height', 'weight', 'primary_language'],
      medical_history: ['has_diagnosed_conditions'],
      medications: ['taking_medications'],
      allergies: ['has_allergies'],
      vital_signs: [],
      lifestyle: [],
      psychological_health: [],
      mens_sexual_health: [],
      womens_sexual_health: []
    };

    const required = requiredFields[section];
    return required.every(field => data[field] !== undefined && data[field] !== '' && data[field] !== null);
  };

  const toggleUnitSystem = async () => {
    const newSystem = unitSystem === 'metric' ? 'imperial' : 'metric';
    setUnitSystem(newSystem);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('questionnaire_responses')
      .upsert({
        user_id: user.id,
        unit_system: newSystem
      }, {
        onConflict: 'user_id'
      });
  };

  const sections: Array<{ id: QuestionnaireSection; name: string; locked?: boolean }> = [
    { id: 'categories', name: 'Categories' },
    { id: 'personal_info', name: 'Personal Info' },
    { id: 'medical_history', name: 'Medical History' },
    { id: 'medications', name: 'Medications' },
    { id: 'allergies', name: 'Allergies' },
    { id: 'vital_signs', name: 'Vital Signs' },
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'psychological_health', name: 'Psychological Health' },
    { id: 'mens_sexual_health', name: "Men's Sexual Health", locked: !mensSexualHealthUnlocked },
    { id: 'womens_sexual_health', name: "Women's Sexual Health", locked: !womensSexualHealthUnlocked }
  ];

  const getSectionProgress = (section: QuestionnaireSection): number => {
    const data = responses[section];
    const keys = Object.keys(data);
    if (keys.length === 0) return 0;

    const filled = keys.filter(key => data[key] !== '' && data[key] !== null && data[key] !== undefined).length;
    return Math.round((filled / keys.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading questionnaires...</div>
      </div>
    );
  }

  return (
    <div>
      <ReportBrandHeader
        title="BioMath Core"
        subtitle="Health Questionnaires"
        variant="strip"
        className="mb-6"
      />

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
        <div className="member-card p-4 sticky top-4 shadow-lg">
          <ReportBrandHeader variant="strip" subtitle="Settings & Sections" className="mb-4" />
          <div className="mb-4 pb-4 border-b border-slate-200 dark:border-[var(--bm-border)]">
            <h3 className="font-semibold text-gray-900 dark:text-neutral-50 mb-3">{t('member.questionnaires.settings')}</h3>

            <button
              onClick={toggleUnitSystem}
              className="w-full flex items-center justify-between p-2 bg-slate-50 border border-slate-200 dark:border-[var(--bm-border)] rounded-lg hover:border-orange-300 transition-colors mb-2"
            >
              <div className="flex items-center space-x-2">
                <Ruler className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                <span className="text-sm text-gray-600 dark:text-neutral-300">Units</span>
              </div>
              <span className="text-sm font-medium text-orange-500">
                {unitSystem === 'metric' ? 'Metric' : 'Imperial'}
              </span>
            </button>

            <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 dark:border-[var(--bm-border)] rounded-lg">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                <span className="text-sm text-gray-600 dark:text-neutral-300">Language</span>
              </div>
              <span className="text-sm font-medium text-orange-500">
                {language.toUpperCase()}
              </span>
            </div>

            {lastSaved && (
              <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500 dark:text-neutral-300">
                <Save className="h-3 w-3" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
            {autoSaveError && (
              <div className="mt-3 flex items-center space-x-2 text-xs text-red-500">
                <Save className="h-3 w-3" />
                <span>Auto-save failed. Please try again.</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            {sections.map((section) => {
              const status = statuses[section.id];
              const progress = getSectionProgress(section.id);

              return (
                <button
                  key={section.id}
                  onClick={() => !section.locked && setCurrentSection(section.id)}
                  disabled={section.locked}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                    currentSection === section.id
                      ? 'bg-orange-50 border border-orange-200 text-orange-700'
                      : section.locked
                      ? 'bg-slate-50 border border-slate-200 dark:border-[var(--bm-border)] text-gray-400 cursor-not-allowed'
                      : 'hover:bg-slate-50 text-gray-700 dark:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 flex-1">
                    {section.locked ? (
                      <Lock className="h-4 w-4 flex-shrink-0" />
                    ) : status === 'complete' ? (
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-current flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium truncate">{section.name}</span>
                  </div>
                  {!section.locked && progress > 0 && (
                    <span className="text-xs ml-2">{progress}%</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="member-card p-6 shadow-lg">
          <ReportBrandHeader variant="strip" subtitle="Questionnaire Form" className="mb-4" />
          {currentSection === 'categories' && (
            <CategoriesForm
              data={responses.categories}
              onChange={createSectionChangeHandler('categories')}
              unitSystem={unitSystem}
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
          {currentSection === 'mens_sexual_health' && (
            mensSexualHealthUnlocked ? (
              <MensSexualHealthForm
                data={responses.mens_sexual_health}
                onChange={createSectionChangeHandler('mens_sexual_health')}
              />
            ) : (
              <LockedSectionMessage section="Men's Sexual Health" />
            )
          )}
          {currentSection === 'womens_sexual_health' && (
            womensSexualHealthUnlocked ? (
              <WomensSexualHealthForm
                data={responses.womens_sexual_health}
                onChange={createSectionChangeHandler('womens_sexual_health')}
              />
            ) : (
              <LockedSectionMessage section="Women's Sexual Health" />
            )
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

// Form Components
function CategoriesForm({ data, onChange }: any) {
  const healthAreas = [
    'Sleep & Recovery', 'Energy & Fatigue', 'Nutrition', 'Stress Management',
    'Hormones', 'Prevention', 'Performance', 'Mental Wellness', 'Longevity'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-50 mb-2">Categories</h2>
        <p className="text-gray-600 dark:text-neutral-300">Tell us which health areas are most important to you</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-2">
          Which areas of health are most important for you right now? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {healthAreas.map(area => (
            <label key={area} className="flex items-center space-x-2 p-3 bg-slate-50 border border-slate-200 dark:border-[var(--bm-border)] rounded-lg cursor-pointer hover:border-orange-300">
              <input
                type="checkbox"
                checked={(data.primary_health_areas || []).includes(area)}
                onChange={(e) => {
                  const current = data.primary_health_areas || [];
                  onChange('primary_health_areas',
                    e.target.checked
                      ? [...current, area]
                      : current.filter((a: string) => a !== area)
                  );
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-900 dark:text-neutral-50">{area}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-2">
          What is your primary health priority? <span className="text-red-500">*</span>
        </label>
        <select
          value={data.primary_priority || ''}
          onChange={(e) => onChange('primary_priority', e.target.value)}
          className="member-input"
        >
          <option value="">Select priority...</option>
          <option value="prevention">Prevention</option>
          <option value="improvement">Improvement</option>
          <option value="maintenance">Maintenance</option>
          <option value="recovery">Recovery</option>
        </select>
      </div>
    </div>
  );
}

function PersonalInfoForm({ data, onChange, unitSystem }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-50 mb-2">Personal Information</h2>
        <p className="text-gray-400">Help us personalize your experience</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.full_name || ''}
            onChange={(e) => onChange('full_name', e.target.value)}
            className="member-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Biological Sex <span className="text-red-500">*</span>
          </label>
          <select
            value={data.biological_sex || ''}
            onChange={(e) => onChange('biological_sex', e.target.value)}
            className="member-input"
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={data.date_of_birth || ''}
            onChange={(e) => onChange('date_of_birth', e.target.value)}
            className="member-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.country || ''}
            onChange={(e) => onChange('country', e.target.value)}
            className="member-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Height ({unitSystem === 'metric' ? 'cm' : 'inches'}) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={data.height || ''}
            onChange={(e) => onChange('height', e.target.value)}
            className="member-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'}) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={data.weight || ''}
            onChange={(e) => onChange('weight', e.target.value)}
            className="member-input"
          />
        </div>
      </div>
    </div>
  );
}

function MedicalHistoryForm({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-50 mb-2">Medical History</h2>
        <p className="text-gray-400">Your medical background helps us provide better insights</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Do you currently have any diagnosed medical conditions? <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={data.has_diagnosed_conditions === true}
              onChange={() => onChange('has_diagnosed_conditions', true)}
              className="text-blue-600"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={data.has_diagnosed_conditions === false}
              onChange={() => onChange('has_diagnosed_conditions', false)}
              className="text-blue-600"
            />
            <span>No</span>
          </label>
        </div>
      </div>

      {data.has_diagnosed_conditions && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Which conditions?
          </label>
          <textarea
            value={data.conditions_list || ''}
            onChange={(e) => onChange('conditions_list', e.target.value)}
            rows={4}
            className="member-input"
            placeholder="List your conditions..."
          />
        </div>
      )}
    </div>
  );
}

function MedicationsForm({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-50 mb-2">Medications</h2>
        <p className="text-gray-400">Current medications and supplements</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Are you currently taking any prescription medications? <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={data.taking_medications === true}
              onChange={() => onChange('taking_medications', true)}
              className="text-blue-600"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={data.taking_medications === false}
              onChange={() => onChange('taking_medications', false)}
              className="text-blue-600"
            />
            <span>No</span>
          </label>
        </div>
      </div>

      {data.taking_medications && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            List medications
          </label>
          <textarea
            value={data.medications_list || ''}
            onChange={(e) => onChange('medications_list', e.target.value)}
            rows={4}
            className="member-input"
            placeholder="Medication name, dosage, frequency..."
          />
        </div>
      )}
    </div>
  );
}

function AllergiesForm({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-50 mb-2">Allergies</h2>
        <p className="text-gray-400">Known allergies and reactions</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Do you have any known allergies? <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={data.has_allergies === true}
              onChange={() => onChange('has_allergies', true)}
              className="text-blue-600"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={data.has_allergies === false}
              onChange={() => onChange('has_allergies', false)}
              className="text-blue-600"
            />
            <span>No</span>
          </label>
        </div>
      </div>

      {data.has_allergies && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Describe your allergies
          </label>
          <textarea
            value={data.allergies_list || ''}
            onChange={(e) => onChange('allergies_list', e.target.value)}
            rows={4}
            className="member-input"
            placeholder="Type of allergy, severity, reactions..."
          />
        </div>
      )}
    </div>
  );
}

function VitalSignsForm({ data, onChange, unitSystem }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-50 mb-2">Vital Signs</h2>
        <p className="text-gray-400">Recent measurements (all optional)</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Resting Heart Rate (bpm)
          </label>
          <input
            type="number"
            value={data.resting_heart_rate || ''}
            onChange={(e) => onChange('resting_heart_rate', e.target.value)}
            className="member-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Blood Pressure ({unitSystem === 'metric' ? 'mmHg' : 'mmHg'})
          </label>
          <input
            type="text"
            value={data.blood_pressure || ''}
            onChange={(e) => onChange('blood_pressure', e.target.value)}
            placeholder="120/80"
            className="member-input"
          />
        </div>
      </div>
    </div>
  );
}

function LifestyleForm({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-50 mb-2">Lifestyle</h2>
        <p className="text-gray-400">Daily habits and routines</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Smoking Status
          </label>
          <select
            value={data.smoking_status || ''}
            onChange={(e) => onChange('smoking_status', e.target.value)}
            className="member-input"
          >
            <option value="">Select...</option>
            <option value="never">Never</option>
            <option value="former">Former</option>
            <option value="current">Current</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Alcohol Consumption
          </label>
          <select
            value={data.alcohol_consumption || ''}
            onChange={(e) => onChange('alcohol_consumption', e.target.value)}
            className="member-input"
          >
            <option value="">Select...</option>
            <option value="none">None</option>
            <option value="occasional">Occasional</option>
            <option value="moderate">Moderate</option>
            <option value="frequent">Frequent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Exercise Frequency (per week)
          </label>
          <input
            type="number"
            value={data.exercise_frequency || ''}
            onChange={(e) => onChange('exercise_frequency', e.target.value)}
            className="member-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sleep Duration (hours per night)
          </label>
          <input
            type="number"
            step="0.5"
            value={data.sleep_duration || ''}
            onChange={(e) => onChange('sleep_duration', e.target.value)}
            className="member-input"
          />
        </div>
      </div>
    </div>
  );
}

function PsychologicalHealthForm({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-50 mb-2">Psychological Health</h2>
        <p className="text-gray-400">Mental and emotional wellbeing</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          How would you describe your current mood stability?
        </label>
        <select
          value={data.mood_stability || ''}
          onChange={(e) => onChange('mood_stability', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 dark:border-[var(--bm-border)] rounded-lg bg-white dark:bg-[var(--bm-surface)]"
        >
          <option value="">Select...</option>
          <option value="very_stable">Very Stable</option>
          <option value="mostly_stable">Mostly Stable</option>
          <option value="somewhat_variable">Somewhat Variable</option>
          <option value="quite_variable">Quite Variable</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Do you experience prolonged stress?
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={data.prolonged_stress === true}
              onChange={() => onChange('prolonged_stress', true)}
              className="text-blue-600"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={data.prolonged_stress === false}
              onChange={() => onChange('prolonged_stress', false)}
              className="text-blue-600"
            />
            <span>No</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function MensSexualHealthForm({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-300">
          <strong>Confidentiality Notice:</strong> All responses are encrypted and private.
          This information is used only to provide personalized wellness guidance.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-50 mb-2">Men's Sexual Health</h2>
        <p className="text-gray-400">Supportive guidance for hormonal and sexual wellbeing</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Is your sexual interest stable, increasing, or decreasing?
        </label>
        <select
          value={data.sexual_interest_trend || ''}
          onChange={(e) => onChange('sexual_interest_trend', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 dark:border-[var(--bm-border)] rounded-lg bg-white dark:bg-[var(--bm-surface)]"
        >
          <option value="">Select...</option>
          <option value="increasing">Increasing</option>
          <option value="stable">Stable</option>
          <option value="decreasing">Decreasing</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Do you feel confident in your sexual function?
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={data.sexual_function_confidence === true}
              onChange={() => onChange('sexual_function_confidence', true)}
              className="text-blue-600"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={data.sexual_function_confidence === false}
              onChange={() => onChange('sexual_function_confidence', false)}
              className="text-blue-600"
            />
            <span>No</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function WomensSexualHealthForm({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-300">
          <strong>Confidentiality Notice:</strong> All responses are encrypted and private.
          This information is used only to provide personalized wellness guidance.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-50 mb-2">Women's Sexual Health</h2>
        <p className="text-gray-400">Supportive guidance for hormonal and sexual wellbeing</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Have you noticed changes in sexual desire or interest?
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={data.sexual_desire_changes === true}
              onChange={() => onChange('sexual_desire_changes', true)}
              className="text-blue-600"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={data.sexual_desire_changes === false}
              onChange={() => onChange('sexual_desire_changes', false)}
              className="text-blue-600"
            />
            <span>No</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Would you like AI guidance related to hormonal support or sexual wellbeing?
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={data.wants_hormonal_guidance === true}
              onChange={() => onChange('wants_hormonal_guidance', true)}
              className="text-blue-600"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={data.wants_hormonal_guidance === false}
              onChange={() => onChange('wants_hormonal_guidance', false)}
              className="text-blue-600"
            />
            <span>No</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function LockedSectionMessage({ section }: { section: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Lock className="h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 dark:text-neutral-50 mb-2">
        {section} Locked
      </h3>
      <p className="text-center text-gray-400 max-w-md mb-6">
        This questionnaire becomes available only after you activate and pay for the corresponding category.
      </p>
      <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
        Activate Category
      </button>
    </div>
  );
}
