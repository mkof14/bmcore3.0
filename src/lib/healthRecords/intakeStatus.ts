import type { HealthRecordMetadata, IntakeStatus } from './types';

const REVIEW_AFTER_MS = 25_000;
const READY_AFTER_MS = 70_000;

/** Derive progressive status from metadata + upload age (mock/real-ready pipeline). */
export function deriveIntakeStatus(
  metadata: HealthRecordMetadata | null | undefined,
  uploadDate: string | null | undefined,
  now = Date.now(),
): IntakeStatus {
  const explicit = metadata?.status;
  if (explicit === 'insights_ready') return 'insights_ready';

  const uploadedAt = uploadDate ? Date.parse(uploadDate) : NaN;
  const age = Number.isFinite(uploadedAt) ? Math.max(0, now - uploadedAt) : READY_AFTER_MS;

  if (age >= READY_AFTER_MS) return 'insights_ready';
  if (age >= REVIEW_AFTER_MS || explicit === 'in_review') return 'in_review';
  return explicit === 'received' ? 'received' : 'received';
}

export function parseHealthRecordMetadata(raw: unknown): HealthRecordMetadata {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  const out: HealthRecordMetadata = {};
  if (
    obj.intakeKind === 'labs' ||
    obj.intakeKind === 'imaging' ||
    obj.intakeKind === 'dna_report' ||
    obj.intakeKind === 'raw_dna' ||
    obj.intakeKind === 'other'
  ) {
    out.intakeKind = obj.intakeKind;
  }
  if (
    obj.status === 'received' ||
    obj.status === 'in_review' ||
    obj.status === 'insights_ready'
  ) {
    out.status = obj.status;
  }
  if (obj.source === 'upload' || obj.source === 'camera') out.source = obj.source;
  if (typeof obj.insightsVersion === 'string') out.insightsVersion = obj.insightsVersion;
  if (typeof obj.statusUpdatedAt === 'string') out.statusUpdatedAt = obj.statusUpdatedAt;
  return out;
}

export function shouldPersistStatusAdvance(
  current: IntakeStatus | undefined,
  derived: IntakeStatus,
): boolean {
  const rank = (s: IntakeStatus) =>
    s === 'received' ? 0 : s === 'in_review' ? 1 : 2;
  return rank(derived) > rank(current || 'received');
}
