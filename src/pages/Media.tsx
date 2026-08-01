import { useEffect, useMemo, useState } from 'react';
import {
  Download,
  ExternalLink,
  FileText,
  Film,
  Presentation,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import {
  getVideoEmbedUrl,
  listMediaItems,
  type MediaItem,
  type MediaType,
} from '../lib/mediaStore';

interface MediaProps {
  onNavigate: (page: string) => void;
}

const SECTIONS: MediaType[] = ['video', 'presentation', 'document'];

export default function Media({ onNavigate }: MediaProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<MediaType | 'all'>('all');

  useEffect(() => {
    void loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    setError('');
    const result = await listMediaItems({ publishedOnly: true });
    if (result.error) {
      setError(t('content.media.loadError'));
      setItems([]);
    } else {
      setItems(result.data);
    }
    setLoading(false);
  }

  const grouped = useMemo(() => {
    const map: Record<MediaType, MediaItem[]> = {
      video: [],
      presentation: [],
      document: [],
    };
    for (const item of items) {
      map[item.media_type]?.push(item);
    }
    return map;
  }, [items]);

  const visibleSections =
    activeTab === 'all' ? SECTIONS : SECTIONS.filter((type) => type === activeTab);

  function sectionIcon(type: MediaType) {
    if (type === 'video') return Film;
    if (type === 'presentation') return Presentation;
    return FileText;
  }

  function renderVideo(item: MediaItem) {
    const embed = getVideoEmbedUrl(item.file_url);
    const isDirectVideo =
      /\.(mp4|webm|mov)(\?|$)/i.test(item.file_url) ||
      (item.mime_type || '').startsWith('video/');

    return (
      <article
        key={item.id}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[var(--bm-surface)]"
      >
        <div className="aspect-video bg-black/90">
          {embed ? (
            <iframe
              src={embed}
              title={item.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isDirectVideo ? (
            <video
              src={item.file_url}
              controls
              className="h-full w-full"
              poster={item.thumbnail_url || undefined}
            />
          ) : (
            <a
              href={item.file_url}
              target="_blank"
              rel="noreferrer"
              className="flex h-full w-full items-center justify-center gap-2 text-white hover:bg-white/5"
            >
              {item.thumbnail_url ? (
                <img
                  src={item.thumbnail_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <ExternalLink className="h-5 w-5" />
                  <span>{t('content.media.openVideo')}</span>
                </>
              )}
            </a>
          )}
        </div>
        <div className="p-5">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {item.title}
          </h3>
          {item.description ? (
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {item.description}
            </p>
          ) : null}
        </div>
      </article>
    );
  }

  function renderFileCard(item: MediaItem, downloadable: boolean) {
    return (
      <article
        key={item.id}
        className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[var(--bm-surface)]"
      >
        {item.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt=""
            className="mb-4 h-36 w-full rounded-xl object-cover"
          />
        ) : (
          <div className="mb-4 flex h-36 items-center justify-center rounded-xl border border-orange-200/70 bg-orange-50 text-orange-600 dark:border-orange-300/20 dark:bg-orange-500/10">
            {item.media_type === 'presentation' ? (
              <Presentation className="h-10 w-10" />
            ) : (
              <FileText className="h-10 w-10" />
            )}
          </div>
        )}
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          {item.title}
        </h3>
        {item.description ? (
          <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {item.description}
          </p>
        ) : (
          <div className="mb-4 flex-1" />
        )}
        <a
          href={item.file_url}
          target="_blank"
          rel="noreferrer"
          download={downloadable ? item.file_name || true : undefined}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-500"
        >
          {downloadable ? (
            <>
              <Download className="h-4 w-4" />
              {t('content.media.download')}
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4" />
              {t('content.media.open')}
            </>
          )}
        </a>
      </article>
    );
  }

  return (
    <div className="min-h-screen bg-page pb-16 pt-20">
      <SEO
        title={t('content.media.seoTitle')}
        description={t('content.media.seoDescription')}
        keywords={[
          'BioMath Core media',
          'health videos',
          'presentations',
          'documents',
        ]}
        page="media"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <BackButton onNavigate={onNavigate} />

        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-700 backdrop-blur dark:border-orange-300/20 dark:bg-white/10 dark:text-orange-200">
            {t('content.media.badge')}
          </div>
          <h1 className="mb-6 text-5xl font-semibold tracking-tight text-gray-900 dark:text-white md:text-6xl">
            {t('content.media.title')}
          </h1>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-400">
            {t('content.media.subtitle')}
          </p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {(['all', ...SECTIONS] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-orange-600 text-white'
                  : 'border border-gray-200 bg-white text-gray-700 hover:border-orange-300 dark:border-gray-700 dark:bg-[var(--bm-surface)] dark:text-gray-200'
              }`}
            >
              {tab === 'all'
                ? t('content.media.tabs.all')
                : t(`content.media.tabs.${tab}`)}
            </button>
          ))}
        </div>

        {loading && (
          <div className="py-20 text-center">
            <p className="text-lg text-gray-500 dark:text-gray-400">
              {t('content.media.loading')}
            </p>
          </div>
        )}

        {error && (
          <div className="py-12">
            <ErrorMessage
              title={t('content.media.errorTitle')}
              message={error}
              onRetry={() => void loadItems()}
            />
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="py-20">
            <EmptyState
              icon={Film}
              title={t('content.media.emptyTitle')}
              description={t('content.media.emptyBody')}
            />
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="space-y-14">
            {visibleSections.map((type) => {
              const sectionItems = grouped[type];
              if (sectionItems.length === 0) return null;
              const Icon = sectionIcon(type);
              return (
                <section key={type}>
                  <div className="mb-6 flex items-center gap-3">
                    <Icon className="h-6 w-6 text-orange-600" />
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {t(`content.media.sections.${type}`)}
                    </h2>
                  </div>
                  <div
                    className={
                      type === 'video'
                        ? 'grid gap-6 md:grid-cols-2'
                        : 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
                    }
                  >
                    {sectionItems.map((item) =>
                      type === 'video'
                        ? renderVideo(item)
                        : renderFileCard(item, type === 'document'),
                    )}
                  </div>
                </section>
              );
            })}

            {visibleSections.every((type) => grouped[type].length === 0) && (
              <EmptyState
                icon={Film}
                title={t('content.media.noResultsTitle')}
                description={t('content.media.noResultsBody')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
