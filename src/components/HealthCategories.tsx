import { Heart, Sun, TrendingUp, Brain, Dumbbell, Flower2, User, Droplets, Apple, Moon, Leaf, Users, Activity, Zap, HeartHandshake, Eye, Smartphone, Fingerprint, Target, Blend, LucideProps } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { FC } from 'react';
import { categoryHeroUrl } from '../data/serviceHeroes';

interface HealthCategoriesProps {
  onNavigate: (page: string, categoryId?: string) => void;
}

interface Category {
    id: string;
    name: string;
    icon: FC<LucideProps>;
    gradient: string;
    iconColor: string;
    glowColor: string;
    shadowColor: string;
}

export default function HealthCategories({ onNavigate }: HealthCategoriesProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const categories: Category[] = [
    {
      id: 'critical-health',
      name: 'Critical Health',
      icon: Heart,
      gradient: 'from-red-950/80 via-black/70 to-black/85',
      iconColor: 'text-orange-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]',
      shadowColor: 'shadow-orange-500/50',
    },
    {
      id: 'everyday-wellness',
      name: 'Everyday Wellness',
      icon: Sun,
      gradient: 'from-amber-950/80 via-black/70 to-black/85',
      iconColor: 'text-green-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]',
      shadowColor: 'shadow-green-500/50',
    },
    {
      id: 'longevity',
      name: 'Longevity & Anti-Aging',
      icon: TrendingUp,
      gradient: 'from-blue-950/80 via-black/70 to-black/85',
      iconColor: 'text-pink-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(244,114,182,0.8)]',
      shadowColor: 'shadow-pink-500/50',
    },
    {
      id: 'mental-wellness',
      name: 'Mental Wellness',
      icon: Brain,
      gradient: 'from-purple-950/80 via-black/70 to-black/85',
      iconColor: 'text-cyan-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]',
      shadowColor: 'shadow-cyan-500/50',
    },
    {
      id: 'fitness-performance',
      name: 'Fitness & Performance',
      icon: Dumbbell,
      gradient: 'from-slate-950/80 via-black/70 to-black/85',
      iconColor: 'text-yellow-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]',
      shadowColor: 'shadow-yellow-500/50',
    },
    {
      id: 'womens-health',
      name: "Women's Health",
      icon: Flower2,
      gradient: 'from-pink-950/80 via-black/70 to-black/85',
      iconColor: 'text-pink-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(244,114,182,0.8)]',
      shadowColor: 'shadow-pink-500/50',
    },
    {
      id: 'mens-health',
      name: "Men's Health",
      icon: User,
      gradient: 'from-orange-950/80 via-black/70 to-black/85',
      iconColor: 'text-blue-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]',
      shadowColor: 'shadow-blue-500/50',
    },
    {
      id: 'beauty-skincare',
      name: 'Beauty & Skincare',
      icon: Droplets,
      gradient: 'from-rose-950/80 via-black/70 to-black/85',
      iconColor: 'text-pink-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(244,114,182,0.8)]',
      shadowColor: 'shadow-pink-500/50',
    },
    {
      id: 'nutrition-diet',
      name: 'Nutrition & Diet',
      icon: Apple,
      gradient: 'from-green-950/80 via-black/70 to-black/85',
      iconColor: 'text-green-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]',
      shadowColor: 'shadow-green-500/50',
    },
    {
      id: 'sleep-recovery',
      name: 'Sleep & Recovery',
      icon: Moon,
      gradient: 'from-indigo-950/80 via-black/70 to-black/85',
      iconColor: 'text-purple-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(192,132,252,0.8)]',
      shadowColor: 'shadow-purple-500/50',
    },
    {
      id: 'environmental-health',
      name: 'Environmental Health',
      icon: Leaf,
      gradient: 'from-teal-950/80 via-black/70 to-black/85',
      iconColor: 'text-teal-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(45,212,191,0.8)]',
      shadowColor: 'shadow-teal-500/50',
    },
    {
      id: 'family-health',
      name: 'Family Health',
      icon: Users,
      gradient: 'from-orange-950/80 via-black/70 to-black/85',
      iconColor: 'text-orange-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]',
      shadowColor: 'shadow-orange-500/50',
    },
    {
      id: 'preventive-medicine',
      name: 'Preventive Medicine & Longevity',
      icon: Activity,
      gradient: 'from-cyan-950/80 via-black/70 to-black/85',
      iconColor: 'text-cyan-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]',
      shadowColor: 'shadow-cyan-500/50',
    },
    {
      id: 'biohacking',
      name: 'Biohacking & Performance',
      icon: Zap,
      gradient: 'from-violet-950/80 via-black/70 to-black/85',
      iconColor: 'text-blue-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]',
      shadowColor: 'shadow-blue-500/50',
    },
    {
      id: 'senior-care',
      name: 'Senior Care',
      icon: HeartHandshake,
      gradient: 'from-amber-950/80 via-black/70 to-black/85',
      iconColor: 'text-amber-600',
      glowColor: 'drop-shadow-[0_0_15px_rgba(146,64,14,0.85)]',
      shadowColor: 'shadow-amber-800/50',
    },
    {
      id: 'eye-health',
      name: 'Eye-Health Suite',
      icon: Eye,
      gradient: 'from-blue-950/80 via-black/70 to-black/85',
      iconColor: 'text-blue-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]',
      shadowColor: 'shadow-blue-500/50',
    },
    {
      id: 'digital-therapeutics',
      name: 'Digital Therapeutics Store',
      icon: Smartphone,
      gradient: 'from-violet-950/80 via-black/70 to-black/85',
      iconColor: 'text-purple-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(192,132,252,0.8)]',
      shadowColor: 'shadow-purple-500/50',
    },
    {
      id: 'general-sexual',
      name: 'General Sexual Longevity',
      icon: Fingerprint,
      gradient: 'from-red-950/80 via-black/70 to-black/85',
      iconColor: 'text-red-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(248,113,113,0.8)]',
      shadowColor: 'shadow-red-500/50',
    },
    {
      id: 'mens-sexual-health',
      name: "Men's Sexual Health",
      icon: Target,
      gradient: 'from-blue-950/80 via-black/70 to-black/85',
      iconColor: 'text-blue-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]',
      shadowColor: 'shadow-blue-500/50',
    },
    {
      id: 'womens-sexual-health',
      name: "Women's Sexual Health",
      icon: Blend,
      gradient: 'from-pink-950/80 via-black/70 to-black/85',
      iconColor: 'text-pink-400',
      glowColor: 'drop-shadow-[0_0_15px_rgba(244,114,182,0.8)]',
      shadowColor: 'shadow-pink-500/50',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-page">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-4xl md:text-5xl font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
            Health Categories
          </h2>
          <p className={`text-xl max-w-3xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Explore 200+ AI-powered services across 20 comprehensive health categories
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onNavigate('services-catalog', category.id)}
                className={`group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:${category.shadowColor || 'shadow-white/50'}`}
                style={{ aspectRatio: '1' }}
              >
                <img
                  src={categoryHeroUrl(category.id)}
                  alt={category.name}
                  className="bm-people-photo absolute inset-0 w-full h-full object-cover transition-all duration-300 brightness-[0.35] group-hover:brightness-[0.55] group-hover:saturate-100"
                />
                <div className="bm-people-photo-wash absolute inset-0" aria-hidden />

                <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-95 transition-opacity duration-300 group-hover:opacity-60`}></div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                </div>

                <div className="relative h-full px-2 py-3 flex flex-col items-center justify-center text-center gap-2">
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow-[0_3px_12px_rgba(0,0,0,1)] transition-all duration-300 group-hover:text-xl group-hover:scale-105 px-1" style={{ WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility' }}>
                    {category.name}
                  </h3>
                  <div className={`transform transition-all duration-300 ${category.glowColor} group-hover:scale-125`}>
                    <Icon className={`h-7 w-7 ${category.iconColor}`} strokeWidth={2.5} />
                  </div>
                </div>

                <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/40 rounded-lg transition-all duration-300"></div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => onNavigate('services-catalog')}
            className={`inline-flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              isDark
                ? 'bg-gray-800/30 hover:bg-gray-800/60 border border-gray-700/30 hover:border-gray-600/50 text-orange-500 hover:text-orange-400'
                : 'bg-gray-100/30 hover:bg-gray-100/60 border border-gray-300/30 hover:border-gray-300/50 text-orange-600 hover:text-orange-700'
            }`}
          >
            <span>View All Services</span>
            <TrendingUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
