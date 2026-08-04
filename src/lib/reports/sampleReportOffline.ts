import type { PersonalContext } from '../personalContext';
import { buildReportTemplate } from './buildReportTemplate';
import { DEFAULT_REPORT_SETTINGS } from './defaults';
import { formatReportAsText } from './formatReportText';
import type { BuiltReportContent } from './types';

export const SAMPLE_REPORT_ID = 'mock-sample-personal-report';

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Offline sample context for scripts / static sample file (no Supabase). */
export function createOfflineSamplePersonalContext(): PersonalContext {
  const builtAt = new Date().toISOString();
  const questionnairePercent = 78;
  const profilePercent = 100;
  const score = Math.round(questionnairePercent * 0.85 + profilePercent * 0.15);
  const contextBlurb =
    'priority=Sleep & Recovery; areas=Sleep & Recovery, Energy & Fatigue, Stress Management, Longevity; sex=female; sleep_h=6.5; exercise=4 times / week; stress=Moderate-high on workdays; profile=6/8 sections complete; progress=82%';

  const completeness = {
    score,
    questionnairePercent,
    profilePercent,
    requiredFilled: 28,
    requiredTotal: 36,
    missingRequiredKeys: [] as string[],
    readyForPersonalizedAnalysis: true,
  };

  const section = (
    id: PersonalContext['digitalFile']['sections'][number]['id'],
    progress: number,
    locked = false,
  ) => ({
    id,
    status: (progress >= 100 ? 'complete' : 'draft') as 'complete' | 'draft',
    progress,
    locked,
    data: {},
    answeredFields: [],
  });

  return {
    version: '1.0.0',
    userId: 'sample-member-alex-rivera',
    builtAt,
    questionnaire: null,
    digitalFile: {
      schemaVersion: '1',
      userId: 'sample-member-alex-rivera',
      exportedAt: builtAt,
      unitSystem: 'metric',
      unlocks: { mensSexualHealth: false, womensSexualHealth: false },
      overallProgress: 82,
      completedCount: 6,
      unlockedCount: 8,
      isProfileComplete: false,
      sections: [
        section('categories', 85),
        section('personal_info', 90),
        section('medical_history', 80),
        section('medications', 75),
        section('allergies', 70),
        section('vital_signs', 88),
        section('lifestyle', 100),
        section('psychological_health', 95),
        section('mens_sexual_health', 0, true),
        section('womens_sexual_health', 0, true),
      ],
    },
    profile: {
      id: 'sample-member-alex-rivera',
      email: 'alex.rivera@example.com',
      name: 'Alex Rivera',
      country: 'United States',
      timezone: 'America/New_York',
      locale: 'en',
      fields: {
        name: true,
        email: true,
        country: true,
        timezone: true,
        locale: true,
        avatar: false,
        customFieldsCount: 0,
      },
    },
    medicalFiles: {
      count: 1,
      categories: ['labResults'],
      countsByType: { labResults: 1 },
      dnaPresent: false,
      latestLabDate: '2024-06-01T00:00:00.000Z',
    },
    devices: { count: 1, brands: ['Apple'] },
    services: {
      serviceIds: ['sleep-recovery', 'stress-resilience'],
      knowledgeSignals: 4,
      reportNotesCount: 0,
      lastServiceActivityAt: builtAt,
    },
    subscriptionTier: 'max',
    hasPaidMemberAccess: true,
    completeness,
    linkageHealth: 'green',
    contextBlurb,
    aiPayload: {
      version: '1.0.0',
      systemPreface: 'Sample personal context for wellness report preview.',
      contextBlurb,
      completeness,
      highlights: {},
      constraints: {
        noMedicalFileUrls: true,
        educationalOnly: true,
        productName: 'Health Guide',
      },
    },
    lastReportSnapshot: null,
  };
}

export function buildOfflineSampleReport(t: Translate): BuiltReportContent {
  return buildReportTemplate({
    context: createOfflineSamplePersonalContext(),
    settings: DEFAULT_REPORT_SETTINGS,
    reportType: 'general',
    t,
  });
}

export function formatOfflineSampleReportText(t: Translate): string {
  const content = buildOfflineSampleReport(t);
  return formatReportAsText(
    {
      ...content,
      id: SAMPLE_REPORT_ID,
      created_at: new Date().toISOString(),
    },
    t,
  );
}
