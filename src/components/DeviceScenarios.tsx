import { TrendingUp, TrendingDown, Minus, Droplet, Moon, Heart, Activity, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import HealthGuideIcon from './brand/HealthGuideIcon';
import { tList } from '../i18n/tList';

type ScenarioType = 'spike' | 'stabilized' | 'declined' | 'improved' | 'balanced' | 'overload';
type ScenarioCategory = 'cgm' | 'sleep_hrv' | 'activity';

interface ScenarioCardProps {
  title: string;
  description: string;
  aiResponse: string;
  secondOpinion?: string;
  type: ScenarioType;
  icon: typeof Droplet;
  category: ScenarioCategory;
}

function ScenarioCard({
  title,
  description,
  aiResponse,
  secondOpinion,
  type,
  icon: Icon,
  category,
}: ScenarioCardProps) {
  const { t } = useTranslation();
  const typeStyles: Record<
    ScenarioType,
    { bg: string; border: string; iconBg: string; iconColor: string; badge: string }
  > = {
    spike: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
    },
    declined: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400',
    },
    stabilized: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      badge: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    },
    improved: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      badge: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    },
    balanced: {
      bg: 'bg-slate-50 dark:bg-slate-900/20',
      border: 'border-slate-200 dark:border-slate-700',
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600 dark:text-slate-300',
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300',
    },
    overload: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
    },
  };

  const style = typeStyles[type];

  return (
    <div className={`${style.bg} rounded-xl p-6 border ${style.border}`}>
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`${style.iconBg} rounded-lg p-3 flex-shrink-0`}>
            <Icon className={`h-6 w-6 ${style.iconColor}`} />
          </div>
          <div>
            <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${style.badge}`}>
              {t(`deviceScenarios.categories.${category}`)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
            <strong className="text-gray-900 dark:text-white">
              {t('deviceScenarios.labels.description')}
            </strong>
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{description}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 flex items-start space-x-2">
            <HealthGuideIcon className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-md" size={20} />
            <p className="text-xs font-semibold text-gray-900 dark:text-white">
              {t('deviceScenarios.labels.healthGuide')}
            </p>
          </div>
          <p className="text-sm italic text-gray-700 dark:text-gray-300">&quot;{aiResponse}&quot;</p>
        </div>

        {secondOpinion && (
          <div className="rounded-lg border border-orange-200 bg-orange-50/70 p-4 dark:border-orange-800 dark:bg-orange-950/20">
            <p className="mb-2 text-xs font-semibold text-orange-900 dark:text-orange-300">
              {t('deviceScenarios.labels.secondOpinion')}
            </p>
            <p className="text-sm italic text-gray-700 dark:text-gray-300">&quot;{secondOpinion}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ScenarioBlock({
  category,
  icon: Icon,
  cards,
}: {
  category: ScenarioCategory;
  icon: typeof Droplet;
  cards: Array<{
    key: string;
    type: ScenarioType;
    icon: typeof Droplet;
    secondOpinion?: boolean;
  }>;
}) {
  const { t } = useTranslation();
  const bullets = tList<string>(t, `deviceScenarios.blocks.${category}.bullets`);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 dark:border-orange-800 dark:from-orange-950/20 dark:to-amber-950/10">
        <div className="flex items-start space-x-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              {t(`deviceScenarios.blocks.${category}.title`)}
            </h2>
            <p className="mb-3 text-gray-700 dark:text-gray-300">
              {t(`deviceScenarios.blocks.${category}.body`)}
            </p>
            {bullets.length > 0 && (
              <div className="rounded-lg border border-orange-200 bg-white p-3 dark:border-orange-700 dark:bg-gray-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong className="text-orange-700 dark:text-orange-400">
                    {t('deviceScenarios.labels.behavior')}
                  </strong>
                </p>
                <ul className="ml-4 mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {bullets.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 gap-6 ${
          cards.length > 2 ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-2'
        }`}
      >
        {cards.map((card) => (
          <ScenarioCard
            key={card.key}
            title={t(`deviceScenarios.cards.${card.key}.title`)}
            description={t(`deviceScenarios.cards.${card.key}.description`)}
            aiResponse={t(`deviceScenarios.cards.${card.key}.response`)}
            secondOpinion={
              card.secondOpinion
                ? t(`deviceScenarios.cards.${card.key}.secondOpinion`)
                : undefined
            }
            type={card.type}
            icon={card.icon}
            category={category}
          />
        ))}
      </div>
    </div>
  );
}

function GeneralScenarioLogic() {
  const { t } = useTranslation();
  const terms = tList<string>(t, 'deviceScenarios.general.terms');
  const avoided = tList<string>(t, 'deviceScenarios.general.avoided');

  return (
    <div className="rounded-xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 dark:border-teal-800 dark:from-teal-900/20 dark:to-cyan-900/20">
      <div className="flex items-start space-x-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
          <Heart className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
            {t('deviceScenarios.general.title')}
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-teal-200 bg-white p-4 dark:border-teal-700 dark:bg-gray-800">
              <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                <strong className="text-teal-700 dark:text-teal-400">
                  {t('deviceScenarios.general.safeTitle')}
                </strong>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('deviceScenarios.general.safeBody')}
              </p>
            </div>
            <div className="rounded-lg border border-teal-200 bg-white p-4 dark:border-teal-700 dark:bg-gray-800">
              <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                <strong className="text-teal-700 dark:text-teal-400">
                  {t('deviceScenarios.general.trendsTitle')}
                </strong>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('deviceScenarios.general.trendsBody')}
              </p>
            </div>
            <div className="rounded-lg border border-teal-300 bg-teal-50 p-4 dark:border-teal-700 dark:bg-teal-900/20">
              <p className="mb-2 text-sm font-semibold text-teal-900 dark:text-teal-400">
                {t('deviceScenarios.general.termsTitle')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {terms.map((term) => (
                  <div key={term} className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-teal-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{term}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border-2 border-teal-300 bg-white p-4 dark:border-teal-700 dark:bg-gray-800">
              <div className="mb-2 flex items-start space-x-2">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600 dark:text-teal-400" />
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  {t('deviceScenarios.general.avoidTitle')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {avoided.map((word) => (
                  <span
                    key={word}
                    className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 line-through dark:bg-red-900/30 dark:text-red-400"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeviceScenarios() {
  return (
    <div className="space-y-8">
      <GeneralScenarioLogic />
      <ScenarioBlock
        category="cgm"
        icon={Droplet}
        cards={[
          { key: 'glucoseSpike', type: 'spike', icon: TrendingUp, secondOpinion: true },
          { key: 'glucoseStable', type: 'stabilized', icon: Minus },
        ]}
      />
      <ScenarioBlock
        category="sleep_hrv"
        icon={Moon}
        cards={[
          { key: 'recoveryDown', type: 'declined', icon: TrendingDown, secondOpinion: true },
          { key: 'recoveryUp', type: 'improved', icon: TrendingUp },
        ]}
      />
      <ScenarioBlock
        category="activity"
        icon={Activity}
        cards={[
          { key: 'overload', type: 'overload', icon: TrendingUp },
          { key: 'balanced', type: 'balanced', icon: Minus },
          { key: 'fatigue', type: 'declined', icon: TrendingDown },
        ]}
      />
    </div>
  );
}
