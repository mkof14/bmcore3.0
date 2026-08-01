import { useState, useEffect, useRef } from 'react';
import { Users, Activity, TrendingUp, Globe, Database, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { notifyUserInfo } from '../lib/adminNotify';

interface TrustMetric {
  metric_key: string;
  metric_value: number;
  metric_label: string;
  display_format: string;
}

const fallbackMetrics: TrustMetric[] = [
  { metric_key: 'total_users', metric_value: 120000, metric_label: 'Active Users', display_format: 'compact' },
  { metric_key: 'total_services', metric_value: 200, metric_label: 'Health Services', display_format: 'number' },
  { metric_key: 'success_rate', metric_value: 98, metric_label: 'Success Rate', display_format: 'percentage' },
  { metric_key: 'years_experience', metric_value: 12, metric_label: 'Years of Research', display_format: 'number' },
  { metric_key: 'countries', metric_value: 30, metric_label: 'Countries Served', display_format: 'number' },
  { metric_key: 'data_points', metric_value: 50000000, metric_label: 'Data Points', display_format: 'compact' },
];

const iconMap: Record<string, any> = {
  total_users: Users,
  total_services: Activity,
  success_rate: TrendingUp,
  years_experience: Award,
  countries: Globe,
  data_points: Database,
};

function useCountUp(end: number, duration: number = 2000, shouldStart: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, shouldStart]);

  return count;
}

function formatMetricValue(value: number, format: string): string {
  switch (format) {
    case 'percentage':
      return `${value}%`;
    case 'compact':
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toLocaleString();
    case 'number':
    default:
      return value.toLocaleString();
  }
}

export default function StatsCounter() {
  const [metrics, setMetrics] = useState<TrustMetric[]>(fallbackMetrics);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('trust_metrics')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      const loaded = data || [];
      setMetrics(loaded.length > 0 ? loaded : fallbackMetrics);
    } catch (error) {
      notifyUserInfo('Metrics are temporarily unavailable.');
      setMetrics(fallbackMetrics);
    }
  };

  return (
    <div ref={sectionRef} className="py-16 bg-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {metrics.map((metric) => (
            <StatCard
              key={metric.metric_key}
              metric={metric}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ metric, isVisible }: { metric: TrustMetric; isVisible: boolean }) {
  const count = useCountUp(metric.metric_value, 2000, isVisible);
  const Icon = iconMap[metric.metric_key] || Activity;

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Icon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
      </div>
      <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        {formatMetricValue(count, metric.display_format)}
      </div>
      <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">
        {metric.metric_label}
      </div>
    </div>
  );
}
