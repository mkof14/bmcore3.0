import { useTranslation } from 'react-i18next';

type MemberDemoBadgeProps = {
  /** i18n key for badge label; defaults to secondOpinion demo badge */
  labelKey?: string;
  className?: string;
};

/** Shared honest “Demo / Simulated” pill used across Member Zone demo surfaces. */
export default function MemberDemoBadge({
  labelKey = 'member.secondOpinion.demoBadge',
  className = '',
}: MemberDemoBadgeProps) {
  const { t } = useTranslation();
  return (
    <span
      className={`rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ${className}`}
    >
      {t(labelKey)}
    </span>
  );
}
