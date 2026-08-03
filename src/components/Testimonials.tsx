import { useState, useEffect } from 'react';
import { Star, Quote, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { injectStructuredData } from '../lib/structuredData';
import { notifyUserInfo } from '../lib/adminNotify';

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  avatar_url?: string;
  content: string;
  rating: number;
  status: string;
  featured: boolean;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'approved')
        .eq('featured', true)
        .order('display_order', { ascending: true })
        .limit(6);

      if (error) throw error;
      setTestimonials(data || []);

      if (data && data.length > 0) {
        const reviewSchema = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'BioMath Core',
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: data.length.toString(),
            bestRating: '5',
            worstRating: '1'
          },
          review: data.map(testimonial => ({
            '@type': 'Review',
            author: {
              '@type': 'Person',
              name: testimonial.full_name
            },
            datePublished: testimonial.created_at,
            reviewBody: testimonial.content,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: testimonial.rating.toString(),
              bestRating: '5',
              worstRating: '1'
            }
          }))
        };
        injectStructuredData(reviewSchema);
      }
    } catch (error) {
      notifyUserInfo('Testimonials are temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="py-16 bg-gray-50 dark:bg-[var(--bm-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md animate-pulse">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50 dark:bg-[var(--bm-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Healthcare Professionals Worldwide
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See what doctors, researchers, and patients are saying about BioMath Core
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow duration-300 relative"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-blue-100 dark:text-blue-900" />

              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  {testimonial.avatar_url ? (
                    <img
                      src={testimonial.avatar_url}
                      alt={testimonial.name}
                      className="bm-people-photo w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {getInitials(testimonial.name)}
                    </div>
                  )}
                </div>

                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h3>
                    {testimonial.status === 'approved' && (
                      <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                  {testimonial.company && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {testimonial.company}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {testimonial.content}
              </p>
            </div>
          ))}
        </div>

        {testimonials.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No testimonials available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
