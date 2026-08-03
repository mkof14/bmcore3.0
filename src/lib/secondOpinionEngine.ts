import { generateDualOpinion, mergeOpinions } from './dualOpinionEngine';
import { analyzeOpinions } from './opinionAnalyzer';
import type { AssistantPersona } from '../types/database';

export type KnowledgeSourceKey =
  | 'profile'
  | 'devices'
  | 'reports'
  | 'inputs'
  | 'services'
  | 'documents';

export interface KnowledgeSourceSummary {
  key: KnowledgeSourceKey;
  count: number;
  lastUpdated?: string;
  notes?: string;
}

export interface UserKnowledgeSnapshot {
  userId: string;
  updatedAt: string;
  totalSignals: number;
  sources: KnowledgeSourceSummary[];
}

export interface ModelNode {
  id: string;
  name: string;
  role: string;
  dependsOn: string[];
}

export interface ModelOutput {
  id: string;
  modelId: string;
  modelName: string;
  summary: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  confidence: number;
  createdAt: string;
}

export interface AggregatedOutput {
  summary: string;
  recommendations: Array<{
    title: string;
    description: string;
    source: 'A' | 'B' | 'both';
    priority: 'high' | 'medium' | 'low';
  }>;
  agreements: Array<{ topic: string; consensus: string; confidence: number }>;
  disagreements: Array<{ topic: string; opinionA: string; opinionB: string; severity: 'high' | 'medium' | 'low' }>;
  confidence: number;
  conflictIndex: number;
  consensusLabel: 'Consensus' | 'Balanced' | 'Divergent';
  refinement: string;
  usedSources?: KnowledgeSourceSummary[];
  notes: string;
}

export interface MultiModelReport {
  userId: string;
  baseReportId?: string;
  topic?: string;
  knowledge: UserKnowledgeSnapshot;
  models: ModelOutput[];
  aggregated: AggregatedOutput;
}

const STORAGE_PREFIX = 'bmcore.knowledge.';
const TIMELINE_PREFIX = 'bmcore.knowledge.timeline.';

export function shouldUseMultiModel(): boolean {
  return true;
}

export function createDefaultPersonas(): { personaA: AssistantPersona; personaB: AssistantPersona } {
  const base = {
    id: 'local-persona',
    name_en: 'Default',
    name_ru: 'Default',
    description_en: null,
    description_ru: null,
    system_prompt: '',
    avatar_url: null,
    voice_id: null,
    characteristics: {},
    active: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const personaA: AssistantPersona = {
    ...base,
    id: 'persona-a',
    code: 'physiology',
    role_type: 'doctor',
    tone: 'clinical',
    reasoning_style: 'evidence_based',
  };

  const personaB: AssistantPersona = {
    ...base,
    id: 'persona-b',
    code: 'lifestyle',
    role_type: 'coach',
    tone: 'empathetic',
    reasoning_style: 'contextual',
  };

  return { personaA, personaB };
}

export function buildKnowledgeSnapshot(input: Partial<Record<KnowledgeSourceKey, { count: number; lastUpdated?: string }>>, userId: string): UserKnowledgeSnapshot {
  const sources: KnowledgeSourceSummary[] = (Object.keys(input) as KnowledgeSourceKey[]).map((key) => ({
    key,
    count: input[key]?.count ?? 0,
    lastUpdated: input[key]?.lastUpdated,
  }));

  const totalSignals = sources.reduce((sum, source) => sum + source.count, 0);

  return {
    userId,
    updatedAt: new Date().toISOString(),
    totalSignals,
    sources,
  };
}

export function loadKnowledgeSnapshot(userId: string): UserKnowledgeSnapshot | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    return raw ? (JSON.parse(raw) as UserKnowledgeSnapshot) : null;
  } catch {
    return null;
  }
}

export function persistKnowledgeSnapshot(snapshot: UserKnowledgeSnapshot): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${snapshot.userId}`, JSON.stringify(snapshot));
  } catch {
    // ignore localStorage failures
  }
}

export function mergeKnowledgeSnapshot(
  previous: UserKnowledgeSnapshot | null,
  next: UserKnowledgeSnapshot
): UserKnowledgeSnapshot {
  if (!previous) return next;

  const mergedSources = new Map<KnowledgeSourceKey, KnowledgeSourceSummary>();
  previous.sources.forEach(source => mergedSources.set(source.key, { ...source }));
  next.sources.forEach(source => mergedSources.set(source.key, { ...source }));

  const sources = Array.from(mergedSources.values());
  const totalSignals = sources.reduce((sum, source) => sum + source.count, 0);

  return {
    userId: next.userId,
    updatedAt: new Date().toISOString(),
    totalSignals,
    sources,
  };
}

function getRecencyWeight(lastUpdated?: string): number {
  if (!lastUpdated) return 0.4;
  const last = new Date(lastUpdated).getTime();
  if (Number.isNaN(last)) return 0.4;
  const days = Math.max(0, (Date.now() - last) / (1000 * 60 * 60 * 24));
  const decay = Math.exp(-days / 30);
  return Math.min(1, Math.max(0.15, decay));
}

export function getKnowledgeSignalScore(snapshot: UserKnowledgeSnapshot | null): {
  score: number;
  freshnessLabel: 'Fresh' | 'Stable' | 'Aging';
} {
  if (!snapshot || snapshot.sources.length === 0) {
    return { score: 0, freshnessLabel: 'Aging' };
  }

  const weighted = snapshot.sources.reduce((sum, source) => {
    const weight = getRecencyWeight(source.lastUpdated);
    return sum + source.count * weight;
  }, 0);

  const normalized = Math.min(100, Math.round((weighted / Math.max(1, snapshot.totalSignals)) * 100));
  const freshnessLabel = normalized >= 70 ? 'Fresh' : normalized >= 40 ? 'Stable' : 'Aging';
  return { score: normalized, freshnessLabel };
}

export function addKnowledgeSignals(
  userId: string,
  signals: Partial<Record<KnowledgeSourceKey, number>>
): UserKnowledgeSnapshot {
  const previous = loadKnowledgeSnapshot(userId);
  const mergedSources = new Map<KnowledgeSourceKey, KnowledgeSourceSummary>();

  if (previous) {
    previous.sources.forEach((source) => mergedSources.set(source.key, { ...source }));
  }

  const now = new Date().toISOString();
  (Object.keys(signals) as KnowledgeSourceKey[]).forEach((key) => {
    const increment = signals[key] ?? 0;
    if (!increment) return;
    const existing = mergedSources.get(key);
    mergedSources.set(key, {
      key,
      count: (existing?.count ?? 0) + increment,
      lastUpdated: now,
      notes: existing?.notes,
    });
  });

  const sources = Array.from(mergedSources.values());
  const totalSignals = sources.reduce((sum, source) => sum + source.count, 0);

  const snapshot: UserKnowledgeSnapshot = {
    userId,
    updatedAt: now,
    totalSignals,
    sources,
  };

  persistKnowledgeSnapshot(snapshot);
  appendKnowledgeTimeline(userId, {
    timestamp: now,
    signals,
    totalSignals,
  });
  return snapshot;
}

export function appendKnowledgeTimeline(
  userId: string,
  entry: { timestamp: string; signals: Partial<Record<KnowledgeSourceKey, number>>; totalSignals: number }
): void {
  try {
    const raw = localStorage.getItem(`${TIMELINE_PREFIX}${userId}`);
    const list = raw ? (JSON.parse(raw) as Array<typeof entry>) : [];
    const next = [...list, entry].slice(-50);
    localStorage.setItem(`${TIMELINE_PREFIX}${userId}`, JSON.stringify(next));
  } catch {
    // ignore storage failures
  }
}

export function loadKnowledgeTimeline(userId: string): Array<{
  timestamp: string;
  signals: Partial<Record<KnowledgeSourceKey, number>>;
  totalSignals: number;
}> {
  try {
    const raw = localStorage.getItem(`${TIMELINE_PREFIX}${userId}`);
    return raw ? (JSON.parse(raw) as Array<{ timestamp: string; signals: Partial<Record<KnowledgeSourceKey, number>>; totalSignals: number }>) : [];
  } catch {
    return [];
  }
}

export function estimateLocalSignalCounts(): Partial<Record<KnowledgeSourceKey, number>> {
  const counts: Partial<Record<KnowledgeSourceKey, number>> = {};
  try {
    const reportListRaw = localStorage.getItem('bmcore.report.list');
    const reportIds = reportListRaw ? (JSON.parse(reportListRaw) as string[]) : [];
    counts.reports = reportIds.length;
  } catch {
    counts.reports = counts.reports ?? 0;
  }

  try {
    const notesKeys = Object.keys(localStorage).filter((key) => key.startsWith('bmcore.report.notes.'));
    counts.inputs = notesKeys.length;
  } catch {
    counts.inputs = counts.inputs ?? 0;
  }

  // Medical file PHI is no longer mirrored in localStorage; keep documents count unset here.
  counts.documents = counts.documents ?? 0;

  return counts;
}

export function buildAggregatedSecondOpinion(
  opinionA: string,
  opinionB: string,
  knowledge?: UserKnowledgeSnapshot | null
): AggregatedOutput {
  const analysis = analyzeOpinions({ summary: opinionA }, { summary: opinionB });
  const merged = mergeOpinions(
    {
      model: 'A',
      persona: createDefaultPersonas().personaA,
      summary: opinionA,
      reasoning: [],
      recommendations: [],
      confidence: analysis.confidenceOriginal,
    },
    {
      model: 'B',
      persona: createDefaultPersonas().personaB,
      summary: opinionB,
      reasoning: [],
      recommendations: [],
      confidence: analysis.confidenceSecond,
    },
    'merge'
  );

  const agreementCount = analysis.agreements.length;
  const disagreementCount = analysis.disagreements.length;
  const totalComparisons = Math.max(1, agreementCount + disagreementCount);
  const conflictIndex = Number((disagreementCount / totalComparisons).toFixed(2));
  const consensusLabel: AggregatedOutput['consensusLabel'] =
    disagreementCount === 0 ? 'Consensus' : disagreementCount <= agreementCount ? 'Balanced' : 'Divergent';
  const confidenceBase = (analysis.confidenceOriginal + analysis.confidenceSecond) / 2;
  const confidence = Math.min(1, Math.max(0.4, confidenceBase * (agreementCount / totalComparisons + 0.35)));
  const refinement =
    consensusLabel === 'Consensus'
      ? 'Both models align closely; the unified report reflects a clear, consistent signal.'
      : consensusLabel === 'Balanced'
      ? 'Models agree on key themes with a few differences. The unified report highlights overlap first, then contrasts.'
      : 'Models diverge on several points. The unified report preserves both angles and flags uncertainty where needed.';

  return {
    summary: merged.summary,
    recommendations: merged.combinedRecommendations,
    agreements: analysis.agreements.map((item) => ({
      topic: item.topic,
      consensus: item.consensus,
      confidence: item.confidence,
    })),
    disagreements: analysis.disagreements.map((item) => ({
      topic: item.topic,
      opinionA: item.opinion_a,
      opinionB: item.opinion_b,
      severity: item.severity,
    })),
    confidence,
    conflictIndex,
    consensusLabel,
    refinement,
    usedSources: knowledge?.sources,
    notes: merged.notes,
  };
}

export function generateMultiModelReport(params: {
  userId: string;
  topic?: string;
  baseSummary: string;
  baseInsights?: string[];
  knowledge?: UserKnowledgeSnapshot;
}): MultiModelReport {
  const { personaA, personaB } = createDefaultPersonas();
  const seed = [params.baseSummary, ...(params.baseInsights || [])].join(' ');
  const { opinionA, opinionB } = generateDualOpinion(seed, personaA, personaB);
  const aggregated = buildAggregatedSecondOpinion(opinionA.summary, opinionB.summary, params.knowledge ?? null);

  const models: ModelOutput[] = [
    {
      id: 'model-a',
      modelId: 'A',
      modelName: 'Model A (Physiology)',
      summary: opinionA.summary,
      recommendations: opinionA.recommendations.map((rec) => ({
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
      })),
      confidence: opinionA.confidence,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'model-b',
      modelId: 'B',
      modelName: 'Model B (Lifestyle)',
      summary: opinionB.summary,
      recommendations: opinionB.recommendations.map((rec) => ({
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
      })),
      confidence: opinionB.confidence,
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    userId: params.userId,
    topic: params.topic,
    knowledge:
      params.knowledge ??
      buildKnowledgeSnapshot(
        {
          profile: { count: 1 },
          reports: { count: 1 },
        },
        params.userId
      ),
    models,
    aggregated,
  };
}
