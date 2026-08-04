/**
 * Builds a complete personal wellness report from reportTemplates.json
 * + the same composition rules as buildReportTemplate, then writes
 * public/samples/sample-personal-report.txt
 *
 * Default locale: Russian (primary public sample). Override with SAMPLE_LANG=en.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const lang = process.env.SAMPLE_LANG || 'ru';
const templates = JSON.parse(
  readFileSync(join(root, `src/locales/${lang}/reportTemplates.json`), 'utf8'),
).reportTemplate;

function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function interpolate(str, vars = {}) {
  return String(str).replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] === undefined || vars[key] === null ? '' : String(vars[key]),
  );
}

function t(key, vars = {}) {
  const stripped = key.startsWith('reportTemplate.') ? key.slice('reportTemplate.'.length) : key;
  const value = getByPath(templates, stripped);
  if (typeof value !== 'string') {
    if (vars.defaultValue !== undefined) return String(vars.defaultValue);
    return key;
  }
  return interpolate(value, vars);
}

const settings = {
  detail_level: 'standard',
  tone_style: 'supportive',
  insight_focus: 'lifestyle',
  interpretation_priority: 'preventive_first',
  second_opinion_default: true,
};

const localized = {
  ru: {
    name: 'Алекс Ривера',
    blurb:
      'приоритет — сон и восстановление; области — сон и восстановление, энергия и усталость, управление стрессом, долголетие; сон около 6,5 часов; движение 4 раза в неделю; стресс умеренно-высокий в рабочие дни; профиль 6/8 разделов; прогресс 82%',
    serviceId: 'сон и восстановление',
    sectionMap: {
      categories: 'категории',
      personal_info: 'личные данные',
      medical_history: 'медицинская история',
      medications: 'лекарства',
      allergies: 'аллергии',
      vital_signs: 'жизненные показатели',
      lifestyle: 'образ жизни',
      psychological_health: 'психологическое здоровье',
    },
  },
  en: {
    name: 'Alex Rivera',
    blurb:
      'priority=Sleep & Recovery; areas=Sleep & Recovery, Energy & Fatigue, Stress Management, Longevity; sex=female; sleep_h=6.5; exercise=4 times / week; stress=Moderate-high on workdays; profile=6/8 sections complete; progress=82%',
    serviceId: 'sleep recovery',
    sectionMap: null,
  },
};
const L = localized[lang] || localized.en;

const context = {
  profile: { name: L.name },
  subscriptionTier: 'max',
  completeness: {
    score: 81,
    questionnairePercent: 78,
    profilePercent: 100,
    readyForPersonalizedAnalysis: true,
  },
  contextBlurb: L.blurb,
  linkageHealth: 'green',
  devices: { count: 1, brands: ['Apple'] },
  medicalFiles: { count: 1 },
  services: { serviceIds: [L.serviceId] },
  digitalFile: {
    sections: [
      { id: 'categories', locked: false, progress: 85 },
      { id: 'personal_info', locked: false, progress: 90 },
      { id: 'medical_history', locked: false, progress: 80 },
      { id: 'medications', locked: false, progress: 75 },
      { id: 'allergies', locked: false, progress: 70 },
      { id: 'vital_signs', locked: false, progress: 88 },
      { id: 'lifestyle', locked: false, progress: 100 },
      { id: 'psychological_health', locked: false, progress: 95 },
    ],
  },
};

function sectionLabels(digitalFile) {
  return digitalFile.sections
    .filter((s) => !s.locked && s.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 4)
    .map((s) => {
      if (L.sectionMap && L.sectionMap[s.id]) return L.sectionMap[s.id];
      return s.id.replace(/_/g, ' ');
    });
}

function buildFocusAreas() {
  const areas = [t('reportTemplate.focus.lifestyle')];
  for (const section of sectionLabels(context.digitalFile).slice(0, 2)) {
    areas.push(t('reportTemplate.focus.fromSection', { section }));
  }
  areas.push(
    t('reportTemplate.focus.fromService', {
      service: context.services.serviceIds[0],
    }),
  );
  areas.push(t('reportTemplate.focus.devices', { count: context.devices.count }));
  areas.push(t('reportTemplate.focus.consistency'));
  return areas.slice(0, 4);
}

function buildProfileSection() {
  const name = context.profile.name;
  const tier = context.subscriptionTier;
  const sections = sectionLabels(context.digitalFile);
  const sectionLine = t('reportTemplate.profile.activeSections', {
    sections: sections.join(', '),
  });
  return [
    t('reportTemplate.profile.intro', {
      name,
      questionnaire: context.completeness.questionnairePercent,
      score: context.completeness.score,
    }),
    t('reportTemplate.profile.signals', { blurb: context.contextBlurb }),
    sectionLine,
    t('reportTemplate.profile.assets', {
      devices: context.devices.count,
      files: context.medicalFiles.count,
      tier,
    }),
    t('reportTemplate.profile.linkage', {
      health: t(`reportTemplate.linkage.${context.linkageHealth}`),
    }),
  ].join('\n\n');
}

function buildSummary() {
  const subject = t('reportTemplate.typeLabel.general');
  return [
    t('reportTemplate.summary.opening', {
      subject,
      score: context.completeness.score,
      questionnaire: context.completeness.questionnairePercent,
    }),
    t(`reportTemplate.tone.${settings.tone_style}.summaryLead`),
  ].join(' ');
}

function buildAnalysis() {
  const parts = [
    t(`reportTemplate.tone.${settings.tone_style}.analysisLead`),
    t('reportTemplate.analysis.observation', {
      score: context.completeness.score,
    }),
    t(`reportTemplate.priority.${settings.interpretation_priority}`),
    t(`reportTemplate.focusDetail.${settings.insight_focus}`),
    t('reportTemplate.analysis.devices', {
      count: context.devices.count,
      brands: context.devices.brands.join(', '),
    }),
    t('reportTemplate.analysis.standardClose'),
  ];
  return parts.join('\n\n');
}

function buildInsights() {
  return [
    t('reportTemplate.insight.completeness', {
      score: context.completeness.score,
      questionnaire: context.completeness.questionnairePercent,
      profile: context.completeness.profilePercent,
    }),
    t('reportTemplate.insight.linkage', {
      health: t(`reportTemplate.linkage.${context.linkageHealth}`),
    }),
    t(`reportTemplate.insight.focus.${settings.insight_focus}`),
    t('reportTemplate.insight.devices', { count: context.devices.count }),
    t('reportTemplate.insight.topSection', {
      section: sectionLabels(context.digitalFile)[0],
    }),
  ].slice(0, 5);
}

function buildRecommendations() {
  const priority = settings.interpretation_priority;
  const focus = settings.insight_focus;
  return [
    {
      title: t(`reportTemplate.rec.${priority}.title`),
      description: t(`reportTemplate.rec.${priority}.body`),
    },
    {
      title: t(`reportTemplate.rec.${focus}.title`),
      description: t(`reportTemplate.rec.${focus}.body`),
    },
    {
      title: t(`reportTemplate.rec.combo.${priority}.${focus}.title`),
      description: t(`reportTemplate.rec.combo.${priority}.${focus}.body`),
    },
  ];
}

function buildNextSteps() {
  return [
    t('reportTemplate.next.review'),
    t('reportTemplate.next.healthGuide'),
    t(`reportTemplate.next.focus.${settings.insight_focus}`),
    t('reportTemplate.next.refreshQuestionnaires'),
  ].slice(0, 5);
}

const focusAreas = buildFocusAreas();
const profile = buildProfileSection();
const summary = buildSummary();
const analysis = buildAnalysis();
const insights = buildInsights();
const recommendations = buildRecommendations();
const nextSteps = buildNextSteps();
const healthGuidePrompt = t('reportTemplate.healthGuidePrompt', {
  blurb: context.contextBlurb,
  score: context.completeness.score,
  service: t('reportTemplate.healthGuidePromptGeneral'),
  question: t('reportTemplate.healthGuidePromptDefaultQuestion'),
});
const secondA = t('reportTemplate.secondOpinion.a', {
  subject: t('reportTemplate.secondOpinion.subjectGeneral'),
  blurb: context.contextBlurb,
  priority: t(`reportTemplate.priorityShort.${settings.interpretation_priority}`),
});
const secondB = t('reportTemplate.secondOpinion.b', {
  subject: t('reportTemplate.secondOpinion.subjectGeneral'),
  focus: t(`reportTemplate.focusShort.${settings.insight_focus}`),
  tone: t(`reportTemplate.toneShort.${settings.tone_style}`),
});

const analysisWithSections = [
  analysis,
  '',
  t('reportTemplate.section.focusAreas'),
  ...focusAreas.map((a, i) => `${i + 1}. ${a}`),
  '',
  t('reportTemplate.section.nextSteps'),
  ...nextSteps.map((s, i) => `${i + 1}. ${s}`),
  '',
  t('reportTemplate.section.healthGuidePrompt'),
  healthGuidePrompt,
].join('\n');

const title = t('reportTemplate.title.general');
const createdAt = new Date().toISOString();

const lines = [
  title,
  '='.repeat(Math.min(60, title.length + 8)),
  '',
  `${t('reportTemplate.meta.type')}: ${t('reportTemplate.typeLabel.general')}`,
  `${t('reportTemplate.meta.generated')}: ${createdAt}`,
  `${t('reportTemplate.meta.id')}: mock-sample-personal-report`,
  '',
  t('reportTemplate.section.summary'),
  '',
  `${summary}\n\n${t('reportTemplate.section.profile')}\n${profile}`,
  '',
  t('reportTemplate.section.insights'),
  '',
  ...insights.map((item, i) => `${i + 1}. ${item}`),
  '',
  t('reportTemplate.section.analysis'),
  '',
  analysisWithSections,
  '',
  t('reportTemplate.section.recommendations'),
  '',
  ...recommendations.flatMap((rec, i) => [`${i + 1}. ${rec.title}`, `   ${rec.description}`]),
  '',
  t('reportTemplate.section.secondOpinionA'),
  '',
  secondA,
  '',
  t('reportTemplate.section.secondOpinionB'),
  '',
  secondB,
  '',
  t('reportTemplate.footer'),
  '',
  t('reportTemplate.copyright', { year: 2026 }),
  '',
];

const outDir = join(root, 'public/samples');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'sample-personal-report.txt');
writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log(`Wrote ${outPath} (${lang}; ${lines.join('\n').split('\n').length} lines)`);
