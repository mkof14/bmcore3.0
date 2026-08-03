import { useTranslation } from 'react-i18next';
import PageHero from './PageHero';
import { MEMBER_SECTION_HEROES, pageHeroUrl } from '../data/pageHeroes';

/** Maps Member Zone section ids to existing i18n title/subtitle keys. */
const SECTION_COPY: Record<string, { titleKey: string; subtitleKey?: string }> = {
  dashboard: { titleKey: 'member.dashboard.title', subtitleKey: 'member.dashboard.subtitle' },
  'human-data-model': {
    titleKey: 'member.humanDataModel.title',
    subtitleKey: 'member.humanDataModel.subtitle',
  },
  // Route id remains `ai-assistant` for stability; product name is Health Guide.
  'ai-assistant': {
    titleKey: 'healthGuide.memberTitle',
    subtitleKey: 'healthGuide.memberSubtitle',
  },
  devices: { titleKey: 'member.devices.title', subtitleKey: 'member.devices.subtitle' },
  support: { titleKey: 'member.support.title', subtitleKey: 'member.support.subtitle' },
  system: { titleKey: 'member.system.title', subtitleKey: 'member.system.subtitle' },
  catalog: { titleKey: 'member.catalog.title', subtitleKey: 'member.catalog.subtitle' },
  questionnaires: {
    titleKey: 'member.questionnaires.title',
    subtitleKey: 'member.questionnaires.subtitle',
  },
  reports: { titleKey: 'member.reports.title', subtitleKey: 'member.reports.subtitle' },
  'signal-hub': { titleKey: 'member.signalHub.title', subtitleKey: 'member.signalHub.subtitle' },
  reminders: { titleKey: 'member.reminders.title', subtitleKey: 'member.reminders.subtitle' },
  'second-opinion': {
    titleKey: 'member.secondOpinion.title',
    subtitleKey: 'member.secondOpinion.subtitle',
  },
  'medical-files': {
    titleKey: 'member.medicalFiles.title',
    subtitleKey: 'member.medicalFiles.subtitle',
  },
  'black-box': { titleKey: 'member.blackBox.title', subtitleKey: 'member.blackBox.subtitle' },
  referral: { titleKey: 'member.referral.title', subtitleKey: 'member.referral.subtitle' },
  billing: { titleKey: 'member.billing.title', subtitleKey: 'member.billing.subtitle' },
  profile: { titleKey: 'member.profile.title', subtitleKey: 'member.profile.subtitle' },
  settings: {
    titleKey: 'member.reportSettings.title',
    subtitleKey: 'member.reportSettings.subtitle',
  },
};

type Props = {
  section: string;
  /** Override title (already translated). */
  title?: string;
  subtitle?: string;
  className?: string;
};

/**
 * Compact photo banner for Member Zone section tops.
 * Falls back to nav label when section-specific copy is missing.
 */
export default function MemberSectionHero({ section, title, subtitle, className }: Props) {
  const { t } = useTranslation();
  const heroKey = MEMBER_SECTION_HEROES[section];
  if (!heroKey) return null;

  const copy = SECTION_COPY[section];
  const resolvedTitle =
    title ?? (copy ? t(copy.titleKey) : t(`member.nav.${section}`, { defaultValue: section }));
  const resolvedSubtitle =
    subtitle ?? (copy?.subtitleKey ? t(copy.subtitleKey) : undefined);

  return (
    <PageHero
      compact
      imageSrc={pageHeroUrl(heroKey)}
      title={resolvedTitle}
      subtitle={resolvedSubtitle}
      className={`mb-0 w-full ${className ?? ''}`}
      contentClassName="max-w-7xl px-6 sm:px-8"
    />
  );
}
