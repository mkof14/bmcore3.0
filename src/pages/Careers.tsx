import { MapPin, Clock, DollarSign, ArrowRight, Share2, Copy, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import BackButton from '../components/BackButton';
import { notifyUserInfo } from '../lib/adminNotify';
import { getContentSearchParams } from '../lib/routing';

interface CareersProps {
  onNavigate: (page: string) => void;
}

interface CareerPosting {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary_range: string;
}

const WHY = ['innovation', 'impact', 'growth'] as const;

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
      {children}
    </p>
  );
}

export default function Careers({ onNavigate }: CareersProps) {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<CareerPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<CareerPosting | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (!selectedJob) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedJob(null);
        window.history.pushState({ page: 'careers' }, '', '/careers');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedJob]);

  async function loadJobs() {
    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('career_postings')
        .select('id, title, slug, department, location, employment_type, description, requirements, responsibilities, salary_range')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(t('programs.careers.loadError'));
        return;
      }

      const loadedJobs = data || [];
      setJobs(loadedJobs);

      const params = getContentSearchParams();
      const slug = params.get('job');
      if (slug) {
        const match = loadedJobs.find((job) => job.slug === slug);
        if (match) setSelectedJob(match);
      }
    } catch {
      setError(t('programs.careers.loadError'));
    } finally {
      setLoading(false);
    }
  }

  const types = Array.from(new Set(jobs.map((job) => job.employment_type).filter(Boolean)));

  const filteredJobs = jobs.filter((job) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      job.title.toLowerCase().includes(query) ||
      (job.description || '').toLowerCase().includes(query) ||
      (job.department || '').toLowerCase().includes(query) ||
      (job.location || '').toLowerCase().includes(query);
    const matchesType = typeFilter === 'all' || job.employment_type === typeFilter;
    return matchesQuery && matchesType;
  });

  const visibleJobs = filteredJobs.slice(0, visibleCount);

  const handleCopyLink = (job: CareerPosting) => {
    const link = `${window.location.origin}/careers?job=${job.slug}`;
    navigator.clipboard.writeText(link);
    window.history.pushState({ page: 'careers' }, '', `/careers?job=${job.slug}`);
    notifyUserInfo(t('programs.careers.linkCopied'));
  };

  const handleShare = async (job: CareerPosting) => {
    const link = `${window.location.origin}/careers?job=${job.slug}`;
    if (navigator.share) {
      await navigator.share({
        title: job.title,
        text: job.description,
        url: link,
      });
      return;
    }
    handleCopyLink(job);
  };

  const inputClassName =
    'w-full border border-[var(--bm-border)] bg-page px-4 py-2 text-gray-900 transition-colors focus:border-orange-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 dark:text-neutral-100';

  return (
    <div className="min-h-screen bg-page transition-colors">
      <div className="pt-20 pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <BackButton onNavigate={onNavigate} />

          {/* Hero */}
          <section className="border-b border-[var(--bm-border)] pb-14 pt-8 lg:pb-16 lg:pt-10">
            <SectionLabel>{t('programs.careers.label')}</SectionLabel>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-5xl md:text-[3.25rem] md:leading-[1.12]">
              {t('programs.careers.heroTitle')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-lg">
              {t('programs.careers.heroSubtitle')}
            </p>
          </section>

          {/* Why BioMath Core */}
          <section className="border-b border-[var(--bm-border)] py-14 lg:py-16">
            <SectionLabel>{t('programs.careers.whyLabel')}</SectionLabel>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
              {t('programs.careers.whyTitle')}
            </h2>
            <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
              {WHY.map((item, index) => (
                <article key={item} className="relative">
                  <span
                    aria-hidden
                    className="mb-4 block h-px w-8 bg-orange-500/70 dark:bg-orange-400/55"
                  />
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-neutral-500">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {t(`programs.careers.why.${item}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                    {t(`programs.careers.why.${item}.body`)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Open positions */}
          <section className="py-14 lg:py-16">
            <SectionLabel>{t('programs.careers.openLabel')}</SectionLabel>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
              {t('programs.careers.openTitle')}
            </h2>

            {loading && (
              <p className="mt-10 text-gray-500 dark:text-neutral-400">
                {t('programs.careers.loading')}
              </p>
            )}

            {error && (
              <div className="mt-10 border border-[var(--bm-border)] bg-[var(--bm-surface)] p-8 text-center">
                <p className="font-semibold text-red-600 dark:text-red-400">
                  {t('programs.careers.errorTitle')}
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">{error}</p>
                <button
                  onClick={loadJobs}
                  className="mt-6 bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
                >
                  {t('programs.careers.retry')}
                </button>
              </div>
            )}

            {!loading && !error && jobs.length === 0 && (
              <div className="mt-10 border border-[var(--bm-border)] bg-[var(--bm-surface)] p-8 text-center">
                <p className="text-gray-700 dark:text-neutral-300">
                  {t('programs.careers.emptyTitle')}
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-neutral-500">
                  {t('programs.careers.emptyBody')}
                </p>
              </div>
            )}

            {!loading && !error && jobs.length > 0 && (
              <div className="mt-10">
                <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="relative w-full md:max-w-md">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setVisibleCount(6);
                      }}
                      placeholder={t('programs.careers.searchPlaceholder')}
                      className={inputClassName}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200"
                        aria-label={t('programs.careers.clearSearch')}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setVisibleCount(6);
                    }}
                    className={`${inputClassName} md:w-56`}
                  >
                    <option value="all">{t('programs.careers.allTypes')}</option>
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-500 dark:text-neutral-500">
                    {t('programs.careers.results', { count: filteredJobs.length })}
                  </div>
                </div>

                {filteredJobs.length === 0 ? (
                  <div className="border border-[var(--bm-border)] bg-[var(--bm-surface)] p-8 text-center">
                    <p className="text-gray-700 dark:text-neutral-300">
                      {t('programs.careers.noMatchTitle')}
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-neutral-500">
                      {t('programs.careers.noMatchBody')}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {visibleJobs.map((job) => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => {
                            setSelectedJob(job);
                            window.history.pushState({ page: 'careers' }, '', `/careers?job=${job.slug}`);
                          }}
                          className="group w-full border border-[var(--bm-border)] bg-[var(--bm-surface)] p-6 text-left transition-colors hover:border-orange-500/40 sm:p-8"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-orange-600 dark:text-neutral-100 dark:group-hover:text-orange-400 sm:text-2xl">
                                {job.title}
                              </h3>
                              <span className="mt-3 inline-block border border-[var(--bm-border)] px-3 py-1 text-xs font-medium text-orange-700 dark:text-orange-400">
                                {job.department}
                              </span>
                            </div>
                            <ArrowRight className="mt-1 h-5 w-5 flex-shrink-0 text-orange-500 transition-transform group-hover:translate-x-0.5" />
                          </div>
                          <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                            {job.description}
                          </p>
                          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-neutral-500">
                            <span className="inline-flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                              {job.location}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Clock className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                              {job.employment_type}
                            </span>
                            {job.salary_range && (
                              <span className="inline-flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                                {job.salary_range}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {visibleJobs.length < filteredJobs.length && (
                      <div className="mt-10 text-center">
                        <button
                          onClick={() => setVisibleCount((count) => count + 6)}
                          className="border border-[var(--bm-border)] bg-page px-6 py-3 text-sm font-semibold text-gray-900 transition-colors hover:border-orange-500/40 dark:text-neutral-100"
                        >
                          {t('programs.careers.loadMore')}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedJob(null);
              window.history.pushState({ page: 'careers' }, '', '/careers');
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-[var(--bm-border)] bg-[var(--bm-surface)] shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--bm-border)] p-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-600 dark:text-orange-400">
                  {selectedJob.department}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-neutral-100 md:text-3xl">
                  {selectedJob.title}
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-neutral-500">
                  {selectedJob.location} • {selectedJob.employment_type}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare(selectedJob)}
                  className="border border-[var(--bm-border)] p-2 text-gray-600 transition-colors hover:border-orange-500/40 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  title={t('programs.careers.share')}
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleCopyLink(selectedJob)}
                  className="border border-[var(--bm-border)] p-2 text-gray-600 transition-colors hover:border-orange-500/40 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  title={t('programs.careers.copyLink')}
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedJob(null);
                    window.history.pushState({ page: 'careers' }, '', '/careers');
                  }}
                  className="border border-[var(--bm-border)] px-3 py-2 text-sm text-gray-600 transition-colors hover:border-orange-500/40 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {t('programs.careers.close')}
                </button>
              </div>
            </div>
            <div className="space-y-8 p-6">
              {selectedJob.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {t('programs.careers.overview')}
                  </h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]">
                    {selectedJob.description}
                  </p>
                </div>
              )}

              {selectedJob.responsibilities?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {t('programs.careers.responsibilities')}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {selectedJob.responsibilities.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]"
                      >
                        <span
                          aria-hidden
                          className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.requirements?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {t('programs.careers.requirements')}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {selectedJob.requirements.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-sm leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-[15px]"
                      >
                        <span
                          aria-hidden
                          className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.salary_range && (
                <div className="border border-[var(--bm-border)] bg-page px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-neutral-500">
                    {t('programs.careers.salaryRange')}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-neutral-100">
                    {selectedJob.salary_range}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
