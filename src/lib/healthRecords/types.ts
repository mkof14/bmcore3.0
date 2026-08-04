/** Intake chips shown in Health Records & DNA. */
export type IntakeKind = 'labs' | 'imaging' | 'dna_report' | 'raw_dna' | 'other';

/** Progressive processing status stored in medical_files.metadata. */
export type IntakeStatus = 'received' | 'in_review' | 'insights_ready';

export type HealthRecordMetadata = {
  intakeKind?: IntakeKind;
  status?: IntakeStatus;
  source?: 'upload' | 'camera';
  insightsVersion?: string;
  statusUpdatedAt?: string;
};

export type HealthRecordInsights = {
  title: string;
  explanation: string;
  conclusions: string[];
  recommendations: string[];
  disclaimer: string;
  plainText: string;
};

export const INTAKE_KINDS: IntakeKind[] = [
  'labs',
  'imaging',
  'dna_report',
  'raw_dna',
  'other',
];

/** Map intake chip → medical_files.category (legacy keys preserved). */
export function categoryForIntakeKind(kind: IntakeKind): string {
  switch (kind) {
    case 'labs':
      return 'labResults';
    case 'imaging':
      return 'imaging';
    case 'dna_report':
      return 'dnaReport';
    case 'raw_dna':
      return 'rawDna';
    default:
      return 'other';
  }
}

export function intakeKindFromCategory(category: string, fileType?: string): IntakeKind {
  if (fileType === 'raw_dna' || category === 'rawDna') return 'raw_dna';
  if (category === 'dnaReport') return 'dna_report';
  if (category === 'labResults') return 'labs';
  if (category === 'imaging' || category === 'xray' || category === 'mri' || category === 'ctScan') {
    return 'imaging';
  }
  return 'other';
}

export function isDnaCategory(category: string, fileType?: string): boolean {
  const kind = intakeKindFromCategory(category, fileType);
  return kind === 'dna_report' || kind === 'raw_dna';
}

export function isLabCategory(category: string): boolean {
  return category === 'labResults' || category === 'labs';
}
