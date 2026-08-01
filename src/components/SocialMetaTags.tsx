import { useEffect } from 'react';
import { pageToPath, type AppPage } from '../lib/routing';

interface SocialMetaTagsProps {
  title: string;
  description: string;
  image?: string;
  /** Absolute path (e.g. `/blog`). Prefer `page` when the route key is known. */
  url?: string;
  page?: AppPage | string;
  type?: 'website' | 'article' | 'profile' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  locale?: string;
  siteName?: string;
}

/**
 * Client-side social meta helper. Share image guidance: use 1200×630 landscape
 * (public/og-default.jpg / .webp). Language is not URL-based — do not invent locale paths.
 */
const DEFAULT_VALUES = {
  siteName: 'BioMath Core',
  defaultImage: '/og-default.jpg',
  ogImageWidth: '1200',
  ogImageHeight: '630',
  twitterSite: '@biomathcore',
  locale: 'en_US',
  baseUrl: import.meta.env.VITE_APP_URL || 'https://biomathcore.com',
};

function normalizePath(path: string): string {
  if (!path || path === '/') return '/';
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  return withSlash.replace(/\/+$/, '') || '/';
}

function resolvePath(url?: string, page?: string): string {
  if (url) return normalizePath(url);
  if (page) return normalizePath(pageToPath(page));
  if (typeof window !== 'undefined') {
    return normalizePath(window.location.pathname || '/');
  }
  return '/';
}

export default function SocialMetaTags({
  title,
  description,
  image = DEFAULT_VALUES.defaultImage,
  url,
  page,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  tags = [],
  twitterCard = 'summary_large_image',
  twitterSite = DEFAULT_VALUES.twitterSite,
  twitterCreator,
  locale = DEFAULT_VALUES.locale,
  siteName = DEFAULT_VALUES.siteName,
}: SocialMetaTagsProps) {
  useEffect(() => {
    const base = DEFAULT_VALUES.baseUrl.replace(/\/+$/, '');
    const path = resolvePath(url, page);
    const fullUrl = path === '/' ? `${base}/` : `${base}${path}`;
    const fullImage = image.startsWith('http')
      ? image
      : `${base}${image.startsWith('/') ? image : `/${image}`}`;
    const usingDefaultOg = image === DEFAULT_VALUES.defaultImage;

    const metaTags: Record<string, string> = {
      'og:site_name': siteName,
      'og:title': title,
      'og:description': description,
      'og:type': type,
      'og:url': fullUrl,
      'og:image': fullImage,
      'og:image:secure_url': fullImage,
      'og:image:alt': title,
      'og:locale': locale,

      'twitter:card': twitterCard,
      'twitter:site': twitterSite,
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': fullImage,
      'twitter:image:alt': title,

      'pinterest:description': description,
      'pinterest:media': fullImage,
    };

    if (usingDefaultOg) {
      metaTags['og:image:width'] = DEFAULT_VALUES.ogImageWidth;
      metaTags['og:image:height'] = DEFAULT_VALUES.ogImageHeight;
      metaTags['og:image:type'] = 'image/jpeg';
    }

    if (twitterCreator) {
      metaTags['twitter:creator'] = twitterCreator;
    }

    if (type === 'article') {
      if (publishedTime) metaTags['article:published_time'] = publishedTime;
      if (modifiedTime) metaTags['article:modified_time'] = modifiedTime;
      if (author) metaTags['article:author'] = author;
      if (tags.length > 0) {
        tags.forEach((tag, index) => {
          metaTags[`article:tag:${index}`] = tag;
        });
      }
    }

    if (type === 'profile' && author) {
      metaTags['profile:username'] = author;
    }

    Object.entries(metaTags).forEach(([name, content]) => {
      const property =
        name.startsWith('og:') ||
        name.startsWith('article:') ||
        name.startsWith('profile:')
          ? 'property'
          : 'name';

      let element = document.querySelector(
        `meta[${property}="${name}"]`,
      ) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(property, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    });
  }, [
    title,
    description,
    image,
    url,
    page,
    type,
    author,
    publishedTime,
    modifiedTime,
    tags,
    twitterCard,
    twitterSite,
    twitterCreator,
    locale,
    siteName,
  ]);

  return null;
}
