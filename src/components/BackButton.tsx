import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BackButtonProps {
  onNavigate?: (page: string) => void;
  onClick?: () => void;
  label?: string;
  to?: string;
}

export default function BackButton({ onNavigate, onClick, label, to = 'home' }: BackButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      onClick={() => {
        if (onClick) {
          onClick();
          return;
        }
        onNavigate?.(to);
      }}
      className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
    >
      <ArrowLeft className="h-5 w-5 mr-2" />
      <span className="font-medium">{label ?? t('common.back')}</span>
    </button>
  );
}
