import type { PersonalContext } from '../personalContext';
import type {
  BuiltReportContent,
  ReportRecommendation,
  ReportSettings,
  ReportType,
} from './types';

type Translate = (key: string, options?: Record<string, unknown>) => string;

export type BuildReportTemplateParams = {
  context: PersonalContext;
  settings: ReportSettings;
  reportType: ReportType;
  topic?: string | null;
  serviceName?: string | null;
  categoryId?: string | null;
  userQuestion?: string | null;
  t: Translate;
};

function sectionLabels(digitalFile: PersonalContext['digitalFile']): string[] {
  return digitalFile.sections
    .filter((s) => !s.locked && s.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 4)
    .map((s) => s.id.replace(/_/g, ' '));
}

function buildFocusAreas(
  context: PersonalContext,
  settings: ReportSettings,
  serviceName: string | null | undefined,
  t: Translate,
): string[] {
  const areas: string[] = [];
  const focusKey = `reportTemplate.focus.${settings.insight_focus}`;
  areas.push(t(focusKey));

  const topSections = sectionLabels(context.digitalFile);
  for (const section of topSections.slice(0, 2)) {
    areas.push(t('reportTemplate.focus.fromSection', { section }));
  }

  if (serviceName) {
    areas.push(t('reportTemplate.focus.fromService', { service: serviceName }));
  } else if (context.services.serviceIds[0]) {
    areas.push(
      t('reportTemplate.focus.fromService', {
        service: context.services.serviceIds[0].replace(/[-_]/g, ' '),
      }),
    );
  }

  if (context.devices.count > 0) {
    areas.push(t('reportTemplate.focus.devices', { count: context.devices.count }));
  }

  areas.push(t('reportTemplate.focus.consistency'));
  return areas.slice(0, settings.detail_level === 'short' ? 3 : settings.detail_level === 'extended' ? 6 : 4);
}

function buildProfileSection(context: PersonalContext, t: Translate): string {
  const name = context.profile.name || t('reportTemplate.profile.memberFallback');
  const tier = context.subscriptionTier || t('reportTemplate.profile.tierNone');
  const sections = sectionLabels(context.digitalFile);
  const sectionLine = sections.length
    ? t('reportTemplate.profile.activeSections', { sections: sections.join(', ') })
    : t('reportTemplate.profile.noSections');

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

function buildSummary(
  context: PersonalContext,
  settings: ReportSettings,
  reportType: ReportType,
  topic: string | null | undefined,
  serviceName: string | null | undefined,
  t: Translate,
): string {
  const subject = serviceName || topic || t(`reportTemplate.typeLabel.${reportType}`);
  const tone = t(`reportTemplate.tone.${settings.tone_style}.summaryLead`);
  return [
    t('reportTemplate.summary.opening', {
      subject,
      score: context.completeness.score,
      questionnaire: context.completeness.questionnairePercent,
    }),
    tone,
    t('reportTemplate.summary.educational'),
  ].join(' ');
}

function buildAnalysis(
  context: PersonalContext,
  settings: ReportSettings,
  serviceName: string | null | undefined,
  userQuestion: string | null | undefined,
  t: Translate,
): string {
  const parts: string[] = [];
  parts.push(t(`reportTemplate.tone.${settings.tone_style}.analysisLead`));
  parts.push(
    t('reportTemplate.analysis.context', {
      blurb: context.contextBlurb,
      score: context.completeness.score,
    }),
  );
  parts.push(t(`reportTemplate.priority.${settings.interpretation_priority}`));
  parts.push(t(`reportTemplate.focusDetail.${settings.insight_focus}`));

  if (serviceName) {
    parts.push(t('reportTemplate.analysis.service', { service: serviceName }));
  }
  if (userQuestion) {
    parts.push(t('reportTemplate.analysis.question', { question: userQuestion }));
  }
  if (context.devices.count > 0) {
    parts.push(
      t('reportTemplate.analysis.devices', {
        count: context.devices.count,
        brands: context.devices.brands.slice(0, 3).join(', ') || t('reportTemplate.profile.tierNone'),
      }),
    );
  }

  if (settings.detail_level === 'extended') {
    parts.push(t('reportTemplate.analysis.extended'));
    const top = sectionLabels(context.digitalFile);
    if (top.length) {
      parts.push(t('reportTemplate.analysis.sectionsDeep', { sections: top.join(', ') }));
    }
  } else if (settings.detail_level === 'short') {
    parts.push(t('reportTemplate.analysis.shortClose'));
  } else {
    parts.push(t('reportTemplate.analysis.standardClose'));
  }

  parts.push(t('reportTemplate.analysis.disclaimer'));
  return parts.join('\n\n');
}

function buildInsights(
  context: PersonalContext,
  settings: ReportSettings,
  serviceName: string | null | undefined,
  userQuestion: string | null | undefined,
  t: Translate,
): string[] {
  const insights = [
    t('reportTemplate.insight.completeness', {
      score: context.completeness.score,
      questionnaire: context.completeness.questionnairePercent,
      profile: context.completeness.profilePercent,
    }),
    t('reportTemplate.insight.linkage', {
      health: t(`reportTemplate.linkage.${context.linkageHealth}`),
    }),
    t(`reportTemplate.insight.focus.${settings.insight_focus}`),
  ];

  if (serviceName) {
    insights.push(t('reportTemplate.insight.service', { service: serviceName }));
  }
  if (userQuestion) {
    insights.push(t('reportTemplate.insight.question', { question: userQuestion }));
  }
  if (context.devices.count > 0) {
    insights.push(t('reportTemplate.insight.devices', { count: context.devices.count }));
  } else {
    insights.push(t('reportTemplate.insight.noDevices'));
  }

  const top = sectionLabels(context.digitalFile)[0];
  if (top) {
    insights.push(t('reportTemplate.insight.topSection', { section: top }));
  }

  const limit = settings.detail_level === 'short' ? 3 : settings.detail_level === 'extended' ? 7 : 5;
  return insights.slice(0, limit);
}

function buildRecommendations(
  context: PersonalContext,
  settings: ReportSettings,
  serviceName: string | null | undefined,
  t: Translate,
): ReportRecommendation[] {
  const recs: ReportRecommendation[] = [
    {
      title: t(`reportTemplate.rec.${settings.interpretation_priority}.title`),
      description: t(`reportTemplate.rec.${settings.interpretation_priority}.body`),
      priority: 'high',
    },
    {
      title: t(`reportTemplate.rec.${settings.insight_focus}.title`),
      description: t(`reportTemplate.rec.${settings.insight_focus}.body`),
      priority: 'medium',
    },
    {
      title: t('reportTemplate.rec.questionnaire.title'),
      description: t('reportTemplate.rec.questionnaire.body', {
        percent: context.completeness.questionnairePercent,
      }),
      priority: context.completeness.questionnairePercent < 70 ? 'high' : 'low',
    },
  ];

  if (serviceName) {
    recs.push({
      title: t('reportTemplate.rec.service.title', { service: serviceName }),
      description: t('reportTemplate.rec.service.body', { service: serviceName }),
      priority: 'medium',
    });
  }

  if (context.devices.count === 0) {
    recs.push({
      title: t('reportTemplate.rec.devices.title'),
      description: t('reportTemplate.rec.devices.body'),
      priority: 'low',
    });
  } else {
    recs.push({
      title: t('reportTemplate.rec.devicesActive.title'),
      description: t('reportTemplate.rec.devicesActive.body', { count: context.devices.count }),
      priority: 'medium',
    });
  }

  const limit = settings.detail_level === 'short' ? 2 : settings.detail_level === 'extended' ? 5 : 3;
  return recs.slice(0, limit);
}

function buildNextSteps(
  context: PersonalContext,
  settings: ReportSettings,
  t: Translate,
): string[] {
  const steps = [
    t('reportTemplate.next.review'),
    t('reportTemplate.next.healthGuide'),
    t(`reportTemplate.next.focus.${settings.insight_focus}`),
  ];
  if (!context.completeness.readyForPersonalizedAnalysis) {
    steps.unshift(t('reportTemplate.next.completeQuestionnaires'));
  } else {
    steps.push(t('reportTemplate.next.refreshQuestionnaires'));
  }
  if (context.devices.count === 0) {
    steps.push(t('reportTemplate.next.connectDevice'));
  }
  return steps.slice(0, settings.detail_level === 'short' ? 3 : 5);
}

function buildHealthGuidePrompt(
  context: PersonalContext,
  serviceName: string | null | undefined,
  userQuestion: string | null | undefined,
  t: Translate,
): string {
  return t('reportTemplate.healthGuidePrompt', {
    blurb: context.contextBlurb,
    score: context.completeness.score,
    service: serviceName || t('reportTemplate.healthGuidePromptGeneral'),
    question: userQuestion || t('reportTemplate.healthGuidePromptDefaultQuestion'),
  });
}

function buildSecondOpinions(
  context: PersonalContext,
  settings: ReportSettings,
  serviceName: string | null | undefined,
  t: Translate,
): { a: string | null; b: string | null } {
  if (!settings.second_opinion_default) {
    return { a: null, b: null };
  }
  const subject = serviceName || t('reportTemplate.secondOpinion.subjectGeneral');
  return {
    a: t('reportTemplate.secondOpinion.a', {
      subject,
      blurb: context.contextBlurb,
      priority: t(`reportTemplate.priorityShort.${settings.interpretation_priority}`),
    }),
    b: t('reportTemplate.secondOpinion.b', {
      subject,
      focus: t(`reportTemplate.focusShort.${settings.insight_focus}`),
      tone: t(`reportTemplate.toneShort.${settings.tone_style}`),
    }),
  };
}

function buildTitle(
  reportType: ReportType,
  topic: string | null | undefined,
  serviceName: string | null | undefined,
  t: Translate,
): string {
  if (serviceName) {
    return t('reportTemplate.title.service', { service: serviceName });
  }
  if (topic) {
    return t('reportTemplate.title.topic', { topic });
  }
  return t(`reportTemplate.title.${reportType}`);
}

/** Compose a full personalized report template from personal context + report settings. */
export function buildReportTemplate(params: BuildReportTemplateParams): BuiltReportContent {
  const {
    context,
    settings,
    reportType,
    topic,
    serviceName,
    userQuestion,
    t,
  } = params;

  const focusAreas = buildFocusAreas(context, settings, serviceName, t);
  const profile = buildProfileSection(context, t);
  const summary = buildSummary(context, settings, reportType, topic, serviceName, t);
  const analysis = buildAnalysis(context, settings, serviceName, userQuestion, t);
  const insights = buildInsights(context, settings, serviceName, userQuestion, t);
  const recommendations = buildRecommendations(context, settings, serviceName, t);
  const nextSteps = buildNextSteps(context, settings, t);
  const healthGuidePrompt = buildHealthGuidePrompt(context, serviceName, userQuestion, t);
  const second = buildSecondOpinions(context, settings, serviceName, t);

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

  return {
    report_title: buildTitle(reportType, topic, serviceName, t),
    report_type: reportType,
    topic: topic || serviceName || null,
    summary: `${summary}\n\n${t('reportTemplate.section.profile')}\n${profile}`,
    insights,
    analysis: analysisWithSections,
    recommendations,
    second_opinion_a: second.a,
    second_opinion_b: second.b,
    sections: {
      summary,
      profile,
      focusAreas,
      recommendations,
      nextSteps,
      healthGuidePrompt,
    },
    settingsApplied: {
      detail_level: settings.detail_level,
      tone_style: settings.tone_style,
      insight_focus: settings.insight_focus,
      interpretation_priority: settings.interpretation_priority,
      second_opinion_default: settings.second_opinion_default,
      visualization_mode: settings.visualization_mode,
    },
  };
}

export function canGeneratePersonalizedReport(context: PersonalContext): boolean {
  return (
    context.linkageHealth !== 'red' && context.completeness.readyForPersonalizedAnalysis
  );
}
