import { TrendingUp, TrendingDown, Minus, Droplet, Moon, Heart, Activity, AlertCircle } from 'lucide-react';
import HealthGuideIcon from './brand/HealthGuideIcon';

interface ScenarioCardProps {
  title: string;
  description: string;
  aiResponse: string;
  secondOpinion?: string;
  type: 'spike' | 'stabilized' | 'declined' | 'improved' | 'balanced' | 'overload';
  icon: typeof Droplet;
  category: 'cgm' | 'sleep_hrv' | 'activity';
}

function ScenarioCard({ title, description, aiResponse, secondOpinion, type, icon: Icon, category }: ScenarioCardProps) {
  const typeStyles = {
    spike: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400'
    },
    declined: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
    },
    stabilized: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      badge: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
    },
    improved: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      badge: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
    },
    balanced: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
    },
    overload: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
    }
  };

  const style = typeStyles[type];

  return (
    <div className={`${style.bg} rounded-xl p-6 border ${style.border}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className={`${style.iconBg} rounded-lg p-3 flex-shrink-0`}>
            <Icon className={`h-6 w-6 ${style.iconColor}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
              {title}
            </h3>
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${style.badge}`}>
              {category === 'cgm' ? 'Глюкоза CGM' : category === 'sleep_hrv' ? 'Сон + HRV' : 'Активность'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            <strong className="text-gray-900 dark:text-white">Описание системы:</strong>
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {description}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-2 mb-2">
            <HealthGuideIcon className="h-5 w-5 rounded-md flex-shrink-0 mt-0.5" size={20} />
            <p className="text-xs font-semibold text-gray-900 dark:text-white">
              AI Реакция:
            </p>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 italic">
            &quot;{aiResponse}&quot;
          </p>
        </div>

        {secondOpinion && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <p className="text-xs font-semibold text-purple-900 dark:text-purple-400 mb-2">
              Предложение второго мнения:
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              &quot;{secondOpinion}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function CGMScenarios() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <Droplet className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Сценарий 1 — Непрерывный мониторинг глюкозы (CGM)
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Сенсор глюкозы передаёт значения почти в реальном времени. Платформа не ставит диагнозы — она объясняет,
              что означает динамика и как мягко стабилизировать питание и поведение.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong className="text-purple-700 dark:text-purple-400">Поведение системы:</strong>
              </p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mt-2 ml-4">
                <li>• данные поступают автоматически</li>
                <li>• если скачок — AI объясняет причину поведенческим языком</li>
                <li>• если стабилизация — AI усиливает мотивацию</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScenarioCard
          title="Скачок глюкозы"
          description="Резкие колебания уровня глюкозы чаще обычного. Система распознаёт паттерн нестабильности и предлагает поведенческое объяснение."
          aiResponse="Сегодня уровень глюкозы менялся резко чаще обычного. Это не диагноз, а сигнал нестабильности. Хотите объяснение, почему это может происходить и какие шаги помогут выровнять динамику?"
          secondOpinion="Могу объяснить двумя подходами: Opinion A — физиология и метаболика, Opinion B — поведенческий образ жизни. Вы сможете сравнить и выбрать тот, который вам ближе."
          type="spike"
          icon={TrendingUp}
          category="cgm"
        />

        <ScenarioCard
          title="Стабилизация глюкозы"
          description="Уровень глюкозы стал более стабильным. Система усиливает положительное подкрепление и мотивацию."
          aiResponse="Глюкоза стала стабильнее — это хороший признак. Организм легче регулирует энергию и настроение."
          type="stabilized"
          icon={Minus}
          category="cgm"
        />
      </div>
    </div>
  );
}

export function SleepHRVScenarios() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Moon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Сценарий 2 — Сон + Нервная система (HRV)
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Мы отслеживаем не только количество сна, но и качество восстановления нервной системы через вариабельность
              сердечного ритма.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScenarioCard
          title="Ухудшение восстановления"
          description="Качество сна снизилось, HRV тоже снижается. Система распознаёт перегрузочный режим и предлагает мягкое восстановление."
          aiResponse="Сон стал менее восстановительным, и HRV тоже снизился. Это признак общего перегрузочного режима. Важно мягкое восстановление, а не дисциплина."
          secondOpinion="Хотите получить подробное объяснение причин? Могу показать физиологическое и жизненное/поведенческое объяснение рядом, чтобы вы выбрали наиболее полезное."
          type="declined"
          icon={TrendingDown}
          category="sleep_hrv"
        />

        <ScenarioCard
          title="Улучшение восстановления"
          description="Качество сна повышается, HRV растёт. Система подтверждает успешную адаптацию организма."
          aiResponse="Восстановление усилилось, и нервная система реагирует лучше. Это значит, что организм адаптируется и выходит на ресурс."
          type="improved"
          icon={TrendingUp}
          category="sleep_hrv"
        />
      </div>
    </div>
  );
}

export function ActivityScenarios() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Сценарий 3 — Нагрузка / Двигательная активность
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Платформа не просто считает шаги — она оценивает адаптацию организма к нагрузке.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ScenarioCard
          title="Перегрузка"
          description="Нагрузка превышает восстановительное окно. Система предупреждает о дисбалансе без alarm-тона."
          aiResponse="Нагрузка выше восстановительного окна. Это не плохо, но нужен баланс, иначе нервная система начнёт снижать адаптацию."
          type="overload"
          icon={TrendingUp}
          category="activity"
        />

        <ScenarioCard
          title="Баланс"
          description="Нагрузка и восстановление синхронизированы. Система подтверждает оптимальную адаптацию."
          aiResponse="Нагрузка и восстановление движутся синхронно. Организм хорошо адаптируется и переносит тренировочный стресс."
          type="balanced"
          icon={Minus}
          category="activity"
        />

        <ScenarioCard
          title="Накопленная усталость"
          description="Темп нагрузки превышает скорость восстановления. Система предлагает мягкие способы выхода."
          aiResponse="Похоже, вы двигаетесь быстрее, чем успеваете восстанавливаться. Могу подсказать способы мягкого восстановления, чтобы не уйти в накопленную усталость."
          type="declined"
          icon={TrendingDown}
          category="activity"
        />
      </div>
    </div>
  );
}

export function GeneralScenarioLogic() {
  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-teal-200 dark:border-teal-800">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
          <Heart className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Общая логика для всех сценариев
          </h2>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-teal-200 dark:border-teal-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <strong className="text-teal-700 dark:text-teal-400">Психологически безопасный язык:</strong>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Платформа ни разу не формулирует это как &quot;болезнь&quot; или &quot;опасность&quot;.
                Только как &quot;тенденцию&quot;, &quot;сигнал&quot;, &quot;адаптацию&quot; или &quot;ресурс&quot;.
                Это делает взаимодействие психологически безопасным и устойчивым.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-teal-200 dark:border-teal-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <strong className="text-teal-700 dark:text-teal-400">Динамика, а не цифры:</strong>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Мы отслеживаем динамику, а не единичные значения. Смысл рождается во времени, а не в цифре.
              </p>
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 border border-teal-300 dark:border-teal-700">
              <p className="text-sm font-semibold text-teal-900 dark:text-teal-400 mb-2">
                Ключевые термины:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Тенденция</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Сигнал</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Адаптация</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Ресурс</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Динамика</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Восстановление</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-teal-300 dark:border-teal-700">
              <div className="flex items-start space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  Никогда не используем:
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded line-through">
                  болезнь
                </span>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded line-through">
                  опасность
                </span>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded line-through">
                  тревога
                </span>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded line-through">
                  риск
                </span>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded line-through">
                  проблема
                </span>
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
      <CGMScenarios />
      <SleepHRVScenarios />
      <ActivityScenarios />
    </div>
  );
}
