import type {
  QuestionnaireSection,
  QuestionnaireSummary,
  SectionStatus,
  UnitSystem,
} from '../questionnaire';

/** Bump when snapshot shape changes in a breaking way. */
export const PERSONAL_CONTEXT_VERSION = '1.0.0';

export type LinkageHealth = 'green' | 'yellow' | 'red';

export type ProfileFieldPresence = {
  name: boolean;
  email: boolean;
  country: boolean;
  timezone: boolean;
  locale: boolean;
  avatar: boolean;
  customFieldsCount: number;
};

export type MedicalFilesMeta = {
  count: number;
  /** Category / type labels only — never file URLs or PHI content. */
  categories: string[];
  /** Counts by intake category key (labs, imaging, dna, …) — never file contents. */
  countsByType: Record<string, number>;
  /** True when a DNA report or raw DNA file is on record. */
  dnaPresent: boolean;
  /** ISO date of the latest lab-results upload, if any. */
  latestLabDate: string | null;
};

export type DevicesMeta = {
  count: number;
  brands: string[];
};

export type ServiceTouchMeta = {
  /** Service ids touched via workspace local cache / knowledge hub. */
  serviceIds: string[];
  knowledgeSignals: number;
  reportNotesCount: number;
  lastServiceActivityAt: string | null;
};

export type CompletenessBreakdown = {
  /** Combined score 0–100 (questionnaire weighted + key profile fields). */
  score: number;
  questionnairePercent: number;
  profilePercent: number;
  requiredFilled: number;
  requiredTotal: number;
  missingRequiredKeys: string[];
  readyForPersonalizedAnalysis: boolean;
};

export type QuestionnaireDigitalFileSection = {
  id: QuestionnaireSection;
  status: SectionStatus;
  progress: number;
  locked: boolean;
  data: Record<string, unknown>;
  answeredFields: string[];
};

/**
 * Structured export of the member's digital questionnaire file.
 * Safe for admin inspection / AI payload construction (not a PHI dump of medical files).
 */
export type QuestionnaireDigitalFile = {
  schemaVersion: string;
  userId: string;
  exportedAt: string;
  unitSystem: UnitSystem;
  unlocks: {
    mensSexualHealth: boolean;
    womensSexualHealth: boolean;
  };
  overallProgress: number;
  completedCount: number;
  unlockedCount: number;
  isProfileComplete: boolean;
  sections: QuestionnaireDigitalFileSection[];
};

/** Compact snapshot persisted alongside generated reports. */
export type PersonalContextReportSnapshot = {
  version: string;
  builtAt: string;
  completenessScore: number;
  questionnairePercent: number;
  profilePercent: number;
  linkageHealth: LinkageHealth;
  contextBlurb: string;
  subscriptionTier: string | null;
  medicalFilesCount: number;
  devicesCount: number;
  servicesTouched: string[];
  readyForPersonalizedAnalysis: boolean;
};

/**
 * Structured preamble for Health Guide / report / voice grounding.
 * Designed so a future live LLM can consume it without rewriting callers.
 */
export type PersonalContextAiPayload = {
  version: string;
  systemPreface: string;
  contextBlurb: string;
  completeness: CompletenessBreakdown;
  highlights: Record<string, unknown>;
  constraints: {
    noMedicalFileUrls: true;
    educationalOnly: true;
    productName: 'Health Guide';
  };
};

export type PersonalContext = {
  version: string;
  userId: string;
  builtAt: string;
  questionnaire: QuestionnaireSummary | null;
  digitalFile: QuestionnaireDigitalFile;
  profile: {
    id: string;
    email: string | null;
    name: string | null;
    country: string | null;
    timezone: string | null;
    locale: string | null;
    fields: ProfileFieldPresence;
  };
  medicalFiles: MedicalFilesMeta;
  devices: DevicesMeta;
  services: ServiceTouchMeta;
  subscriptionTier: string | null;
  hasPaidMemberAccess: boolean;
  completeness: CompletenessBreakdown;
  linkageHealth: LinkageHealth;
  contextBlurb: string;
  aiPayload: PersonalContextAiPayload;
  lastReportSnapshot: PersonalContextReportSnapshot | null;
};

export type PersonalContextInspectorView = {
  context: PersonalContext;
  linkageLabel: LinkageHealth;
  sectionStatuses: Array<{
    id: QuestionnaireSection;
    status: SectionStatus;
    progress: number;
    locked: boolean;
  }>;
  simulatedReportPayload: PersonalContextAiPayload & {
    reportSnapshot: PersonalContextReportSnapshot;
  };
};
