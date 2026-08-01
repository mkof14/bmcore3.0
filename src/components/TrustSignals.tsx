import { Shield, Lock, Award, CheckCircle, Zap, Heart, Globe, Users } from 'lucide-react';

interface TrustBadge {
  icon: any;
  title: string;
  description: string;
  color: string;
}

const trustBadges: TrustBadge[] = [
  {
    icon: Shield,
    title: 'HIPAA Compliant',
    description: 'Full compliance with healthcare data protection standards',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Lock,
    title: 'Bank-Level Security',
    description: '256-bit encryption and secure data storage',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    icon: Award,
    title: 'FDA Recognized',
    description: 'Algorithms validated by medical authorities',
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    icon: CheckCircle,
    title: 'ISO Certified',
    description: 'ISO 27001 and ISO 13485 certified processes',
    color: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    icon: Zap,
    title: 'Real-Time Analysis',
    description: 'Instant insights powered by advanced AI',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    icon: Heart,
    title: 'Patient-Centered',
    description: 'Designed with patient safety as top priority',
    color: 'text-red-600 dark:text-red-400',
  },
  {
    icon: Globe,
    title: 'Global Standards',
    description: 'Meets international healthcare regulations',
    color: 'text-teal-600 dark:text-teal-400',
  },
  {
    icon: Users,
    title: '24/7 Support',
    description: 'Expert support team always available',
    color: 'text-orange-600 dark:text-orange-400',
  },
];

export default function TrustSignals() {
  return (
    <div className="py-16 bg-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Your Health Data is Safe & Secure
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We maintain the highest standards of security, privacy, and compliance
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustBadges.map((badge, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-[var(--bm-surface)] rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-white dark:bg-gray-800 shadow-md`}>
                <badge.icon className={`h-6 w-6 ${badge.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {badge.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TrustBadgesCompact() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-6 py-8">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium">HIPAA Compliant</span>
      </div>
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
        <span className="text-sm font-medium">256-bit Encryption</span>
      </div>
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        <span className="text-sm font-medium">FDA Recognized</span>
      </div>
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm font-medium">ISO Certified</span>
      </div>
    </div>
  );
}
