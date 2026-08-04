import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BackButtonProps {
  onNavigate?: (page: string) => void;
  onClick?: () => void;
  label?: string;
  to?: string;
  /** `link` = quiet text/icon control (Member Zone chrome). */
  variant?: 'default' | 'link';
}

export default function BackButton({
  onNavigate,
  onClick,
  label,
  to = 'home',
  variant = 'default',
}: BackButtonProps) {
  const { t } = useTranslation();
  const isLink = variant === 'link';

  return (
    <button
      type="button"
      onClick={() => {
        if (onClick) {
          onClick();
          return;
        }
        onNavigate?.(to);
      }}
      className={
        isLink
          ? 'member-link mb-4'
          : 'inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-md'
      }
    >
      <ArrowLeft className={isLink ? 'h-3.5 w-3.5' : 'h-5 w-5 mr-2'} />
      <span className={isLink ? undefined : 'font-medium'}>{label ?? t('common.back')}</span>
    </button>
  );
}
