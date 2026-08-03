import { supabase } from '../supabase';
import {
  getQuestionnaireSummary,
  getRequiredFields,
  isFieldFilled,
  SECTION_IDS,
  type QuestionnaireSummary,
} from '../questionnaire';
import { loadKnowledgeSnapshot } from '../secondOpinionEngine';
import { userHasMemberAccess } from '../memberAccess';
import {
  getCachedPersonalContext,
  invalidatePersonalContextCache,
  setCachedPersonalContext,
} from './cache';
import {
  digitalFileFromSummary,
  emptyDigitalFile,
  getQuestionnaireDigitalFile,
} from './getQuestionnaireDigitalFile';
import {
  PERSONAL_CONTEXT_VERSION,
  type CompletenessBreakdown,
  type LinkageHealth,
  type PersonalContext,
  type PersonalContextAiPayload,
  type PersonalContextInspectorView,
  type PersonalContextReportSnapshot,
  type ProfileFieldPresence,
} from './types';

const PROFILE_KEY_FIELDS = ['name', 'country', 'timezone', 'locale'] as const;

function listTouchedServiceIds(): string[] {
  const ids: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key?.startsWith('bmcore.service.report.')) continue;
      ids.push(key.replace('bmcore.service.report.', ''));
    }
  } catch {
    /* ignore */
  }
  return ids.sort();
}

function countReportNotes(): number {
  let n = 0;
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key?.startsWith('bmcore.report.notes.')) n += 1;
    }
  } catch {
    /* ignore */
  }
  return n;
}

function lastServiceActivityAt(serviceIds: string[]): string | null {
  let latest: string | null = null;
  for (const id of serviceIds) {
    try {
      const raw = localStorage.getItem(`bmcore.service.report.${id}`);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { updatedAt?: string };
      if (parsed.updatedAt && (!latest || parsed.updatedAt > latest)) {
        latest = parsed.updatedAt;
      }
    } catch {
      /* ignore */
    }
  }
  return latest;
}

function computeCompleteness(
  summary: QuestionnaireSummary | null,
  profileFields: ProfileFieldPresence,
): CompletenessBreakdown {
  let requiredFilled = 0;
  let requiredTotal = 0;
  const missingRequiredKeys: string[] = [];

  if (summary) {
    for (const section of summary.sections) {
      if (section.locked) continue;
      const data = summary.raw[section.id] || {};
      const required = getRequiredFields(section.id, data);
      for (const key of required) {
        requiredTotal += 1;
        if (isFieldFilled(data[key])) requiredFilled += 1;
        else missingRequiredKeys.push(`${section.id}.${key}`);
      }
    }
  } else {
    // No questionnaire row — count baseline unlocked sections' base fields as missing.
    for (const id of SECTION_IDS) {
      if (id === 'mens_sexual_health' || id === 'womens_sexual_health') continue;
      const required = getRequiredFields(id, {});
      requiredTotal += required.length;
      for (const key of required) missingRequiredKeys.push(`${id}.${key}`);
    }
  }

  const questionnairePercent =
    requiredTotal === 0 ? 0 : Math.round((requiredFilled / requiredTotal) * 100);

  let profileFilled = 0;
  if (profileFields.name) profileFilled += 1;
  if (profileFields.country) profileFilled += 1;
  if (profileFields.timezone) profileFilled += 1;
  if (profileFields.locale) profileFilled += 1;
  const profilePercent = Math.round((profileFilled / PROFILE_KEY_FIELDS.length) * 100);

  // Questionnaire dominates; profile is a secondary gate.
  const score = Math.round(questionnairePercent * 0.85 + profilePercent * 0.15);
  const readyForPersonalizedAnalysis = questionnairePercent >= 40 && profileFilled >= 1;

  return {
    score,
    questionnairePercent,
    profilePercent,
    requiredFilled,
    requiredTotal,
    missingRequiredKeys: missingRequiredKeys.slice(0, 40),
    readyForPersonalizedAnalysis,
  };
}

function deriveLinkageHealth(
  completeness: CompletenessBreakdown,
  hasQuestionnaire: boolean,
  hasPaidAccess: boolean,
): LinkageHealth {
  if (!hasPaidAccess) return 'red';
  if (!hasQuestionnaire || completeness.questionnairePercent < 25) return 'red';
  if (completeness.readyForPersonalizedAnalysis && completeness.score >= 70) return 'green';
  return 'yellow';
}

function buildHighlights(summary: QuestionnaireSummary | null): Record<string, unknown> {
  if (!summary) return {};
  const out: Record<string, unknown> = {};
  for (const section of summary.sections) {
    if (section.locked) continue;
    if (Object.keys(section.highlights).length) {
      out[section.id] = section.highlights;
    }
  }
  return out;
}

function buildSystemPreface(
  completeness: CompletenessBreakdown,
  blurb: string,
  tier: string | null,
): string {
  const readiness = completeness.readyForPersonalizedAnalysis
    ? 'Personal context is linked and ready for personalized analysis.'
    : 'Personal context is incomplete; prefer general guidance and prompt questionnaire completion.';
  const parts = [
    'You are grounding answers in the member Health Guide personal context.',
    readiness,
    `Completeness=${completeness.score}% (questionnaire=${completeness.questionnairePercent}%, profile=${completeness.profilePercent}%).`,
    tier ? `Subscription tier=${tier}.` : null,
    blurb ? `Profile signals: ${blurb}` : 'No questionnaire signals yet.',
    'Do not invent diagnoses. Educational wellness support only. Never include medical file URLs or raw PHI dumps.',
  ];
  return parts.filter(Boolean).join(' ');
}

function buildAiPayload(
  completeness: CompletenessBreakdown,
  contextBlurb: string,
  highlights: Record<string, unknown>,
  tier: string | null,
): PersonalContextAiPayload {
  return {
    version: PERSONAL_CONTEXT_VERSION,
    systemPreface: buildSystemPreface(completeness, contextBlurb, tier),
    contextBlurb,
    completeness,
    highlights,
    constraints: {
      noMedicalFileUrls: true,
      educationalOnly: true,
      productName: 'Health Guide',
    },
  };
}

export function toReportSnapshot(ctx: PersonalContext): PersonalContextReportSnapshot {
  return {
    version: ctx.version,
    builtAt: ctx.builtAt,
    completenessScore: ctx.completeness.score,
    questionnairePercent: ctx.completeness.questionnairePercent,
    profilePercent: ctx.completeness.profilePercent,
    linkageHealth: ctx.linkageHealth,
    contextBlurb: ctx.contextBlurb,
    subscriptionTier: ctx.subscriptionTier,
    medicalFilesCount: ctx.medicalFiles.count,
    devicesCount: ctx.devices.count,
    servicesTouched: ctx.services.serviceIds.slice(0, 40),
    readyForPersonalizedAnalysis: ctx.completeness.readyForPersonalizedAnalysis,
  };
}

async function loadProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  const row = (data || {}) as Record<string, unknown>;
  const custom =
    row.custom_fields && typeof row.custom_fields === 'object'
      ? (row.custom_fields as Record<string, unknown>)
      : {};
  const name =
    (typeof row.name === 'string' && row.name) ||
    [row.first_name, row.last_name].filter((x) => typeof x === 'string' && x).join(' ') ||
    null;
  const fields: ProfileFieldPresence = {
    name: Boolean(name),
    email: Boolean(row.email),
    country: Boolean(row.country),
    timezone: Boolean(row.timezone),
    locale: Boolean(row.locale),
    avatar: Boolean(row.avatar_url),
    customFieldsCount: Object.keys(custom).length,
  };
  return {
    id: userId,
    email: (row.email as string) || null,
    name,
    country: (row.country as string) || null,
    timezone: (row.timezone as string) || null,
    locale: (row.locale as string) || null,
    fields,
  };
}

async function loadMedicalFilesMeta(userId: string) {
  const { data } = await supabase
    .from('medical_files')
    .select('id, file_type, category, created_at')
    .eq('user_id', userId);
  const rows = (data || []) as Array<Record<string, unknown>>;
  const categories = Array.from(
    new Set(
      rows
        .map((r) => (r.category as string) || (r.file_type as string) || 'other')
        .filter(Boolean),
    ),
  );
  return { count: rows.length, categories };
}

async function loadDevicesMeta(userId: string) {
  const { data } = await supabase
    .from('user_devices')
    .select('id, brand, device_name, status')
    .eq('user_id', userId);
  const rows = (data || []) as Array<Record<string, unknown>>;
  const brands = Array.from(
    new Set(rows.map((r) => (r.brand as string) || 'unknown').filter(Boolean)),
  );
  return { count: rows.length, brands };
}

async function loadSubscriptionTier(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('user_subscriptions')
    .select('plan_id, status')
    .eq('user_id', userId)
    .maybeSingle();
  if (!data) return null;
  const status = (data as { status?: string }).status;
  if (status && !['active', 'trialing'].includes(status)) return null;
  return ((data as { plan_id?: string }).plan_id as string) || null;
}

async function loadLastReportSnapshot(
  userId: string,
): Promise<PersonalContextReportSnapshot | null> {
  const { data } = await supabase
    .from('health_reports')
    .select('personal_context_snapshot, personal_context_version, created_at, metadata')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  const row = data as Record<string, unknown>;
  const direct = row.personal_context_snapshot;
  if (direct && typeof direct === 'object') {
    return direct as PersonalContextReportSnapshot;
  }
  const meta = row.metadata;
  if (meta && typeof meta === 'object') {
    const nested = (meta as Record<string, unknown>).personal_context_snapshot;
    if (nested && typeof nested === 'object') {
      return nested as PersonalContextReportSnapshot;
    }
  }
  return null;
}

/**
 * Aggregates questionnaire + profile + service/device/file metadata into one
 * personal context object for reports, Health Guide, voice, and admin inspection.
 */
export async function buildPersonalContext(
  userId: string,
  options?: { forceRefresh?: boolean },
): Promise<PersonalContext> {
  if (!options?.forceRefresh) {
    const cached = getCachedPersonalContext(userId);
    if (cached) return cached;
  }

  const [summary, profile, medicalFiles, devices, subscriptionTier, lastReportSnapshot] =
    await Promise.all([
      getQuestionnaireSummary(userId),
      loadProfile(userId),
      loadMedicalFilesMeta(userId),
      loadDevicesMeta(userId),
      loadSubscriptionTier(userId),
      loadLastReportSnapshot(userId),
    ]);
  const hasPaid = await userHasMemberAccess(userId, profile.email);

  const knowledge = loadKnowledgeSnapshot(userId);
  const serviceIds = listTouchedServiceIds();
  const completeness = computeCompleteness(summary, profile.fields);
  const contextBlurb =
    summary?.contextBlurb ||
    `profile_fields=${[
      profile.fields.name && 'name',
      profile.fields.country && 'country',
      profile.fields.timezone && 'timezone',
      profile.fields.locale && 'locale',
    ]
      .filter(Boolean)
      .join(',') || 'none'}; questionnaire=0%`;

  const highlights = buildHighlights(summary);
  const linkageHealth = deriveLinkageHealth(completeness, Boolean(summary), hasPaid);
  const digitalFile = summary ? digitalFileFromSummary(summary) : emptyDigitalFile(userId);
  const aiPayload = buildAiPayload(completeness, contextBlurb, highlights, subscriptionTier);

  const ctx: PersonalContext = {
    version: PERSONAL_CONTEXT_VERSION,
    userId,
    builtAt: new Date().toISOString(),
    questionnaire: summary,
    digitalFile,
    profile,
    medicalFiles,
    devices,
    services: {
      serviceIds,
      knowledgeSignals: knowledge?.totalSignals ?? 0,
      reportNotesCount: countReportNotes(),
      lastServiceActivityAt: lastServiceActivityAt(serviceIds),
    },
    subscriptionTier,
    hasPaidMemberAccess: hasPaid,
    completeness,
    linkageHealth,
    contextBlurb,
    aiPayload,
    lastReportSnapshot,
  };

  setCachedPersonalContext(userId, ctx);
  return ctx;
}

/** Force rebuild and refresh session cache. */
export async function rebuildPersonalContext(userId: string): Promise<PersonalContext> {
  invalidatePersonalContextCache(userId);
  return buildPersonalContext(userId, { forceRefresh: true });
}

/** Admin / test helper — full inspector view + simulated report payload. */
export async function inspectPersonalContext(
  userId: string,
  options?: { forceRefresh?: boolean },
): Promise<PersonalContextInspectorView> {
  const context = await buildPersonalContext(userId, options);
  const reportSnapshot = toReportSnapshot(context);
  return {
    context,
    linkageLabel: context.linkageHealth,
    sectionStatuses: context.digitalFile.sections.map((s) => ({
      id: s.id,
      status: s.status,
      progress: s.progress,
      locked: s.locked,
    })),
    simulatedReportPayload: {
      ...context.aiPayload,
      reportSnapshot,
    },
  };
}

export { getQuestionnaireDigitalFile };
