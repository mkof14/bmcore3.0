import { Check, X, Zap } from 'lucide-react';

interface ComparisonFeature {
  feature: string;
  basic: boolean | string;
  premium: boolean | string;
  enterprise: boolean | string;
  highlight?: boolean;
}

const features: ComparisonFeature[] = [
  {
    feature: 'Health Data Analysis',
    basic: 'Basic',
    premium: 'Advanced',
    enterprise: 'Full Suite',
    highlight: true,
  },
  {
    feature: 'AI Health Assistant',
    basic: true,
    premium: true,
    enterprise: true,
  },
  {
    feature: 'Second Opinion Service',
    basic: '1 per month',
    premium: '5 per month',
    enterprise: 'Unlimited',
    highlight: true,
  },
  {
    feature: 'Device Integration',
    basic: '2 devices',
    premium: '10 devices',
    enterprise: 'Unlimited',
  },
  {
    feature: 'Health Reports',
    basic: 'Monthly',
    premium: 'Weekly',
    enterprise: 'Real-time',
    highlight: true,
  },
  {
    feature: 'Data Storage',
    basic: '1 GB',
    premium: '10 GB',
    enterprise: 'Unlimited',
  },
  {
    feature: 'Priority Support',
    basic: false,
    premium: true,
    enterprise: true,
  },
  {
    feature: 'API Access',
    basic: false,
    premium: 'Limited',
    enterprise: 'Full',
  },
  {
    feature: 'Custom Integrations',
    basic: false,
    premium: false,
    enterprise: true,
  },
  {
    feature: 'Dedicated Account Manager',
    basic: false,
    premium: false,
    enterprise: true,
  },
  {
    feature: 'HIPAA Compliance',
    basic: true,
    premium: true,
    enterprise: true,
  },
  {
    feature: 'Data Export',
    basic: true,
    premium: true,
    enterprise: true,
  },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" />
    );
  }
  return (
    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
      {value}
    </span>
  );
}

export default function ComparisonTable() {
  return (
    <div className="py-16 bg-gray-50 dark:bg-[var(--bm-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Choose the Perfect Plan for Your Needs
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Compare features across all plans
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-[var(--bm-surface)]">
                    Features
                  </th>
                  <th className="px-6 py-4 text-center bg-white dark:bg-gray-800">
                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      Basic
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      Free
                    </div>
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Get Started
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center bg-blue-50 dark:bg-blue-900/20 relative">
                    <div className="absolute top-0 right-4">
                      <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        <Zap className="h-3 w-3" />
                        Popular
                      </span>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      Premium
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      $39/mo
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      Start Free Trial
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center bg-white dark:bg-gray-800">
                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      Enterprise
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      Custom
                    </div>
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Contact Sales
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-200 dark:border-gray-700 ${
                      feature.highlight
                        ? 'bg-blue-50/50 dark:bg-blue-900/10'
                        : 'bg-white dark:bg-gray-800'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {feature.feature}
                      {feature.highlight && (
                        <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-normal">
                          Popular
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <FeatureCell value={feature.basic} />
                    </td>
                    <td className="px-6 py-4 text-center bg-blue-50/30 dark:bg-blue-900/5">
                      <FeatureCell value={feature.premium} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <FeatureCell value={feature.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All plans include: 256-bit encryption, HIPAA compliance, and 24/7 support
          </p>
        </div>
      </div>
    </div>
  );
}

export function ComparisonTableCompact() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[var(--bm-surface)]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Feature
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                Basic
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20">
                Premium
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                Enterprise
              </th>
            </tr>
          </thead>
          <tbody>
            {features.slice(0, 6).map((feature, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {feature.feature}
                </td>
                <td className="px-4 py-3 text-center">
                  <FeatureCell value={feature.basic} />
                </td>
                <td className="px-4 py-3 text-center bg-blue-50/30 dark:bg-blue-900/5">
                  <FeatureCell value={feature.premium} />
                </td>
                <td className="px-4 py-3 text-center">
                  <FeatureCell value={feature.enterprise} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
