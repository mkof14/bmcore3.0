import { useTranslation } from 'react-i18next';
import { LucideIcon, Construction, ClipboardList } from 'lucide-react';
import BackButton from '../../components/BackButton';
import ReportBrandHeader from '../../components/report/ReportBrandHeader';

interface PlaceholderSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features?: string[];
  comingSoon?: boolean;
  onBack?: () => void;
}

export default function PlaceholderSection({
  title,
  description,
  icon: Icon,
  features = [],
  comingSoon = false,
  onBack
}: PlaceholderSectionProps) {
  const { t } = useTranslation();

  return (
    <div>
      {onBack && <BackButton onClick={onBack} />}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Icon className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-neutral-50">{title}</h1>
          {comingSoon && (
            <span className="px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold rounded-full">
              {t('member.placeholder.comingSoon')}
            </span>
          )}
        </div>
        <p className="text-gray-600 dark:text-neutral-300">{description}</p>
      </div>

      <div className="member-card p-8 shadow-lg">
        <ReportBrandHeader variant="strip" subtitle={title} className="mb-6" />
        <div className="text-center py-12">
          {comingSoon ? (
            <>
              <Construction className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-50 mb-2">
                {t('member.placeholder.comingSoon')}
              </h2>
              <p className="text-gray-600 dark:text-neutral-300 mb-6">
                {t('member.placeholder.comingSoonBody')}
              </p>
            </>
          ) : (
            <>
              <ClipboardList className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-50 mb-2">
                {title}
              </h2>
              <p className="text-gray-600 dark:text-neutral-300 mb-6">
                {t('member.placeholder.ready')}
              </p>
            </>
          )}

          {features.length > 0 && (
            <div className="max-w-2xl mx-auto mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-50 mb-4">
                {t('member.placeholder.plannedFeatures')}
              </h3>
              <ul className="space-y-3 text-left">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-50 border border-orange-200 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-orange-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-neutral-200">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
