import { BookOpen, Calendar, ArrowRight, Share2, Copy, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';
import LoadingSpinner, { SkeletonList } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { generateArticleSchema, injectStructuredData } from '../lib/structuredData';
import { notifyUserInfo } from '../lib/adminNotify';
import { getContentSearchParams } from '../lib/routing';
import { SEED_BLOG_POSTS } from '../data/seedBlogPosts';

interface BlogProps {
  onNavigate: (page: string) => void;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  published_at: string;
}

export default function Blog({ onNavigate }: BlogProps) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (!selectedPost) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedPost(null);
        window.history.pushState({ page: 'blog' }, '', '/blog');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPost]);

  async function loadPosts() {
    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, content, featured_image, category, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(12);

      if (fetchError) {
        // Fall back to seeded method articles so marketing content stays available offline / in mock.
        setPosts(SEED_BLOG_POSTS);
        openPostFromQuery(SEED_BLOG_POSTS);
        return;
      }

      const remote = data || [];
      const bySlug = new Map(remote.map((post) => [post.slug, post]));
      // Keep remote posts first; fill gaps with seed method articles (no fabricated DB rows).
      for (const seed of SEED_BLOG_POSTS) {
        if (!bySlug.has(seed.slug)) bySlug.set(seed.slug, seed);
      }
      const loadedPosts = Array.from(bySlug.values()).sort(
        (a, b) =>
          new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
      );
      setPosts(loadedPosts);
      openPostFromQuery(loadedPosts);
    } catch {
      setPosts(SEED_BLOG_POSTS);
      openPostFromQuery(SEED_BLOG_POSTS);
    } finally {
      setLoading(false);
    }
  }

  function openPostFromQuery(loadedPosts: BlogPost[]) {
    const params = getContentSearchParams();
    const slug = params.get('post');
    if (!slug) return;
    const match = loadedPosts.find((post) => post.slug === slug);
    if (match) {
      setSelectedPost(match);
      injectStructuredData(
        generateArticleSchema({
          title: match.title,
          description: match.excerpt || match.title,
          image: match.featured_image || undefined,
          author: 'BioMath Core',
          datePublished: match.published_at,
          url: `${window.location.origin}/blog?post=${match.slug}`,
        }),
      );
    }
  }

  const categories = Array.from(
    new Set(posts.map(post => post.category).filter(Boolean))
  );

  const filteredPosts = posts.filter((post) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery = !query ||
      post.title.toLowerCase().includes(query) ||
      (post.excerpt || '').toLowerCase().includes(query) ||
      (post.content || '').toLowerCase().includes(query);
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  const handleCopyLink = (post: BlogPost) => {
    const link = `${window.location.origin}/blog?post=${post.slug}`;
    navigator.clipboard.writeText(link);
    window.history.pushState({ page: 'blog' }, '', `/blog?post=${post.slug}`);
    notifyUserInfo(t('content.shared.linkCopied'));
  };

  const handleShare = async (post: BlogPost) => {
    const link = `${window.location.origin}/blog?post=${post.slug}`;
    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.excerpt,
        url: link,
      });
      return;
    }
    handleCopyLink(post);
  };

  return (
    <div className="min-h-screen bg-page pt-20 pb-16">
      <SEO
        title={t('content.blog.seoTitle')}
        description={t('content.blog.seoDescription')}
        keywords={['health blog', 'wellness articles', 'health insights', 'preventive care tips', 'personalized medicine blog', 'health technology articles']}
        url="/blog"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton onNavigate={onNavigate} />

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-200/80 bg-white/70 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-700 backdrop-blur dark:bg-white/10 dark:text-orange-200 dark:border-orange-300/20 mb-6">
            {t('content.blog.badge')}
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6">
            {t('content.blog.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t('content.blog.subtitle')}
          </p>
        </div>

        {loading && (
          <div className="py-20">
            <SkeletonList count={6} />
          </div>
        )}

        {error && (
          <div className="py-12">
            <ErrorMessage
              title={t('content.blog.errorTitle')}
              message={error}
              onRetry={loadPosts}
            />
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="py-20">
            <EmptyState
              icon={BookOpen}
              title={t('content.blog.emptyTitle')}
              description={t('content.blog.emptyBody')}
            />
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div>
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-8">
              <div className="relative w-full md:max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(6);
                  }}
                  placeholder={t('content.blog.searchPlaceholder')}
                  className="w-full px-4 py-2 pr-10 bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                    aria-label={t('content.shared.clearSearch')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('content.shared.results', { count: filteredPosts.length })}
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setVisibleCount(6);
                }}
                className="w-full md:w-56 px-4 py-2 bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">{t('content.blog.allCategories')}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="py-20">
                <EmptyState
                  icon={BookOpen}
                  title={t('content.blog.noResultsTitle')}
                  description={t('content.blog.noResultsBody')}
                />
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visiblePosts.map((post) => (
                    <article
                      key={post.id}
                      onClick={() => {
                        setSelectedPost(post);
                        window.history.pushState({ page: 'blog' }, '', `/blog?post=${post.slug}`);
                      }}
                      className="group relative bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-orange-400/60 transition-all duration-300 cursor-pointer shadow-sm"
                    >
                      {post.featured_image && (
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="bm-people-photo w-full h-full object-cover"
                          />
                          <div className="bm-people-photo-wash absolute inset-0" aria-hidden />
                        </div>
                      )}
                      <div className="p-6 relative">
                        {post.category && (
                          <span className="inline-block px-3 py-1 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-medium rounded-full mb-3">
                            {post.category}
                          </span>
                        )}
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            <span>{new Date(post.published_at).toLocaleDateString()}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-orange-500 group-hover:text-orange-400 transition-colors" />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {visiblePosts.length < filteredPosts.length && (
                  <div className="mt-10 text-center">
                    <button
                      onClick={() => setVisibleCount((count) => count + 6)}
                      className="px-6 py-3 bg-gray-900 text-white rounded-lg transition-colors hover:bg-gray-800"
                    >
                      {t('content.shared.loadMore')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {selectedPost && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPost(null);
              window.history.pushState({ page: 'blog' }, '', '/blog');
            }
          }}
        >
          <div className="bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-orange-500 font-semibold tracking-wider uppercase mb-2">
                  {selectedPost.category || t('content.blog.defaultCategory')}
                </p>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
                  {selectedPost.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {new Date(selectedPost.published_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare(selectedPost)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title={t('content.shared.share')}
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleCopyLink(selectedPost)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title={t('content.shared.copyLink')}
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedPost(null);
                    window.history.pushState({ page: 'blog' }, '', '/blog');
                  }}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {t('content.shared.close')}
                </button>
              </div>
            </div>
            {selectedPost.featured_image && (
              <div className="relative aspect-video bg-gray-100 dark:bg-[var(--bm-surface)] overflow-hidden">
                <img
                  src={selectedPost.featured_image}
                  alt={selectedPost.title}
                  className="bm-people-photo w-full h-full object-cover"
                />
                <div className="bm-people-photo-wash absolute inset-0" aria-hidden />
              </div>
            )}
            <div className="p-6">
              {selectedPost.excerpt && (
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
                  {selectedPost.excerpt}
                </p>
              )}
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {selectedPost.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
