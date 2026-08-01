import { Newspaper, Calendar, ArrowRight, Share2, Copy, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import BackButton from '../components/BackButton';
import { notifyUserInfo } from '../lib/adminNotify';
import { getContentSearchParams } from '../lib/routing';

interface NewsProps {
  onNavigate: (page: string) => void;
}

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  published_at: string;
}

export default function News({ onNavigate }: NewsProps) {
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedItem(null);
        window.history.pushState({ page: 'news' }, '', '/news');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedItem]);

  async function loadNews() {
    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('news_items')
        .select('id, title, slug, excerpt, content, image_url, published_at')
        .eq('status', 'published')
        .order('priority', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(20);

      if (fetchError) {
        setError(t('content.news.loadError'));
        return;
      }

      const loadedNews = data || [];
      setNews(loadedNews);

      const params = getContentSearchParams();
      const slug = params.get('item');
      if (slug) {
        const match = loadedNews.find((item) => item.slug === slug);
        if (match) setSelectedItem(match);
      }
    } catch {
      setError(t('content.news.loadError'));
    } finally {
      setLoading(false);
    }
  }

  const filteredNews = news.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      item.title.toLowerCase().includes(query) ||
      (item.excerpt || '').toLowerCase().includes(query) ||
      (item.content || '').toLowerCase().includes(query)
    );
  });

  const visibleNews = filteredNews.slice(0, visibleCount);

  const handleCopyLink = (item: NewsItem) => {
    const link = `${window.location.origin}/news?item=${item.slug}`;
    navigator.clipboard.writeText(link);
    window.history.pushState({ page: 'news' }, '', `/news?item=${item.slug}`);
    notifyUserInfo(t('content.shared.linkCopied'));
  };

  const handleShare = async (item: NewsItem) => {
    const link = `${window.location.origin}/news?item=${item.slug}`;
    if (navigator.share) {
      await navigator.share({
        title: item.title,
        text: item.excerpt,
        url: link,
      });
      return;
    }
    handleCopyLink(item);
  };

  return (
    <div className="min-h-screen bg-page pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton onNavigate={onNavigate} />

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-200/80 bg-white/70 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-700 backdrop-blur dark:bg-white/10 dark:text-orange-200 dark:border-orange-300/20 mb-6">
            {t('content.news.badge')}
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6">
            {t('content.news.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t('content.news.subtitle')}
          </p>
        </div>

        {loading && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t('content.news.loading')}</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20 bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 shadow-sm">
            <p className="text-red-500 font-semibold mb-3 text-xl">{t('content.news.errorTitle')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={loadNews}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-all duration-300 shadow-sm"
            >
              {t('content.shared.retry')}
            </button>
          </div>
        )}

        {!loading && !error && news.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 shadow-sm">
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
              {t('content.news.emptyTitle')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('content.news.emptyBody')}
            </p>
          </div>
        )}

        {!loading && !error && news.length > 0 && (
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
                  placeholder={t('content.news.searchPlaceholder')}
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
                {t('content.shared.results', { count: filteredNews.length })}
              </div>
            </div>

            {filteredNews.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 shadow-sm">
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
                  {t('content.news.noResultsTitle')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('content.news.noResultsBody')}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {visibleNews.map((item) => (
              <article
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  window.history.pushState({ page: 'news' }, '', `/news?item=${item.slug}`);
                }}
                className="group relative bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-orange-400/60 transition-all duration-300 cursor-pointer shadow-sm"
              >
                <div className="md:flex relative">
                  {item.image_url && (
                    <div className="md:w-1/3 aspect-video md:aspect-square bg-gray-100 dark:bg-gray-800">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="md:w-2/3 p-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <span>{new Date(item.published_at).toLocaleDateString()}</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 group-hover:text-orange-600 transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      {item.excerpt}
                    </p>
                    <div className="flex items-center text-orange-600 font-medium group-hover:text-orange-500 transition-colors">
                      <span>{t('content.news.readMore')}</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                </div>
              </article>
                  ))}
                </div>

                {visibleNews.length < filteredNews.length && (
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

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedItem(null);
              window.history.pushState({ page: 'news' }, '', '/news');
            }
          }}
        >
          <div className="bg-white dark:bg-[var(--bm-surface)] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-orange-500 font-semibold tracking-wider uppercase mb-2">
                  {t('content.news.badge')}
                </p>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
                  {selectedItem.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {new Date(selectedItem.published_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare(selectedItem)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title={t('content.shared.share')}
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleCopyLink(selectedItem)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title={t('content.shared.copyLink')}
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    window.history.pushState({ page: 'news' }, '', '/news');
                  }}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {t('content.shared.close')}
                </button>
              </div>
            </div>
            {selectedItem.image_url && (
              <div className="aspect-video bg-gray-100 dark:bg-[var(--bm-surface)]">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              {selectedItem.excerpt && (
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
                  {selectedItem.excerpt}
                </p>
              )}
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {selectedItem.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
