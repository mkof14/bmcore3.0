import type { PersonalContext } from '../personalContext/types';
import type { HealthRecordInsights, IntakeKind } from './types';

type Translate = (key: string, options?: Record<string, unknown>) => string;

type InsightInput = {
  fileName: string;
  intakeKind: IntakeKind;
  uploadDate: string;
  personalContext?: PersonalContext | null;
  t: Translate;
};

function questionnaireHint(ctx: PersonalContext | null | undefined, t: Translate): string {
  if (!ctx) return t('member.medicalFiles.insights.contextNone');
  const parts: string[] = [];
  if (ctx.completeness.questionnairePercent > 0) {
    parts.push(
      t('member.medicalFiles.insights.contextQuestionnaire', {
        percent: ctx.completeness.questionnairePercent,
      }),
    );
  }
  if (ctx.medicalFiles.dnaPresent) {
    parts.push(t('member.medicalFiles.insights.contextDna'));
  }
  if (ctx.medicalFiles.latestLabDate) {
    parts.push(
      t('member.medicalFiles.insights.contextLatestLab', {
        date: ctx.medicalFiles.latestLabDate.slice(0, 10),
      }),
    );
  }
  if (ctx.contextBlurb) {
    parts.push(t('member.medicalFiles.insights.contextBlurb', { blurb: ctx.contextBlurb }));
  }
  return parts.length
    ? parts.join(' ')
    : t('member.medicalFiles.insights.contextNone');
}

function kindKey(kind: IntakeKind): string {
  return kind;
}

/**
 * Template-engine insights for an intake item.
 * Uses personal context signals only — never raw DNA / file contents.
 */
export function buildHealthRecordInsights(input: InsightInput): HealthRecordInsights {
  const { t, fileName, intakeKind, uploadDate, personalContext } = input;
  const kind = kindKey(intakeKind);
  const contextLine = questionnaireHint(personalContext, t);
  const dateLabel = uploadDate ? uploadDate.slice(0, 10) : '—';

  const title = t(`member.medicalFiles.insights.kinds.${kind}.title`, { name: fileName });
  const explanation = t(`member.medicalFiles.insights.kinds.${kind}.explanation`, {
    name: fileName,
    date: dateLabel,
    context: contextLine,
  });

  const conclusions = [1, 2, 3].map((n) =>
    t(`member.medicalFiles.insights.kinds.${kind}.conclusion${n}`, {
      name: fileName,
      date: dateLabel,
      context: contextLine,
    }),
  );

  const recommendations = [1, 2, 3].map((n) =>
    t(`member.medicalFiles.insights.kinds.${kind}.recommendation${n}`, {
      name: fileName,
      date: dateLabel,
      context: contextLine,
    }),
  );

  const disclaimer = t('member.medicalFiles.insights.disclaimer');

  const plainText = [
    title,
    '',
    t('member.medicalFiles.insights.sectionExplanation'),
    explanation,
    '',
    t('member.medicalFiles.insights.sectionConclusions'),
    ...conclusions.map((c, i) => `${i + 1}. ${c}`),
    '',
    t('member.medicalFiles.insights.sectionRecommendations'),
    ...recommendations.map((r, i) => `${i + 1}. ${r}`),
    '',
    disclaimer,
  ].join('\n');

  return {
    title,
    explanation,
    conclusions,
    recommendations,
    disclaimer,
    plainText,
  };
}

/** Grounded Health Guide prompt for a selected record type — no PHI dump. */
export function buildRecordHealthGuidePrompt(input: {
  intakeKind: IntakeKind;
  fileName: string;
  personalContext?: PersonalContext | null;
  t: Translate;
}): string {
  const { t, intakeKind, fileName, personalContext } = input;
  const blurb = personalContext?.contextBlurb || t('member.medicalFiles.insights.contextNone');
  const dna = personalContext?.medicalFiles.dnaPresent
    ? t('member.medicalFiles.insights.contextDna')
    : t('member.medicalFiles.insights.contextNoDna');
  return t(`member.medicalFiles.voicePrompt.${intakeKind}`, {
    name: fileName,
    blurb,
    dna,
  });
}
