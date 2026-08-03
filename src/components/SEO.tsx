import { useEffect } from 'react';
import { pageToPath, type AppPage } from '../lib/routing';
import { getSocialSameAs } from '../config/social';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  /** Absolute path (e.g. `/blog`). Prefer `page` when the route key is known. */
  url?: string;
  /** Page key from routing — resolved via pageToPath when `url` is omitted. */
  page?: AppPage | string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
}

/**
 * Client-side SEO meta updater (SPA). Crawlers that do not execute JS only see
 * index.html defaults. OG share image: public/og-default.jpg (1200×630 landscape).
 * Prefer that size for any future social assets; square emblems are fallbacks only.
 *
 * Language/hreflang: UI language is cookie/localStorage, not URL locale prefixes.
 * Do not emit alternate links for /es/, /ru/, etc. — those paths do not exist.
 */
const DEFAULT_SEO = {
  siteName: 'BioMath Core',
  defaultTitle: 'BioMath Core — Biomathematical Human Data Model',
  defaultDescription:
    'BioMath Core builds a living Human Data Model — a biomathematical digital twin of your health — and guides you with Health Guide dual analysis.',
  /** 1200×630 landscape share card (JPEG). WebP twin: /og-default.webp */
  defaultImage: '/og-default.jpg',
  ogImageWidth: '1200',
  ogImageHeight: '630',
  defaultKeywords: [
    'biomathematical modeling',
    'Human Data Model',
    'digital twin',
    'Health Guide',
    'BioMath Core',
    'dual intelligence',
    'preventive wellness',
    'health intelligence',
  ],
  twitterHandle: '@biomathcore',
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

function absoluteUrl(path: string): string {
  const base = DEFAULT_SEO.baseUrl.replace(/\/+$/, '');
  if (path === '/') return `${base}/`;
  return `${base}${path}`;
}

export default function SEO({
  title,
  description = DEFAULT_SEO.defaultDescription,
  keywords = DEFAULT_SEO.defaultKeywords,
  image = DEFAULT_SEO.defaultImage,
  url,
  page,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noindex = false,
  nofollow = false,
  canonical,
}: SEOProps) {
  const fullTitle = title
    ? `${title} | ${DEFAULT_SEO.siteName}`
    : DEFAULT_SEO.defaultTitle;

  const path = resolvePath(url, page);
  const fullUrl = absoluteUrl(path);

  const fullImage = image.startsWith('http')
    ? image
    : `${DEFAULT_SEO.baseUrl.replace(/\/+$/, '')}${image.startsWith('/') ? image : `/${image}`}`;

  const usingDefaultOg = image === DEFAULT_SEO.defaultImage;
  const imageWidth = usingDefaultOg ? DEFAULT_SEO.ogImageWidth : undefined;
  const imageHeight = usingDefaultOg ? DEFAULT_SEO.ogImageHeight : undefined;

  const allKeywords = [...new Set([...DEFAULT_SEO.defaultKeywords, ...keywords])];

  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
    'max-snippet:-1',
    'max-image-preview:large',
    'max-video-preview:-1',
  ].join(', ');

  useEffect(() => {
    document.title = fullTitle;

    const metaTags: Record<string, string> = {
      description,
      keywords: allKeywords.join(', '),
      robots: robotsContent,
      author: author || DEFAULT_SEO.siteName,

      'og:site_name': DEFAULT_SEO.siteName,
      'og:title': title || DEFAULT_SEO.defaultTitle,
      'og:description': description,
      'og:type': type,
      'og:url': fullUrl,
      'og:image': fullImage,
      'og:image:secure_url': fullImage,
      'og:image:alt': title || DEFAULT_SEO.siteName,
      'og:locale': DEFAULT_SEO.locale,

      'twitter:card': 'summary_large_image',
      'twitter:site': DEFAULT_SEO.twitterHandle,
      'twitter:creator': author || DEFAULT_SEO.twitterHandle,
      'twitter:title': title || DEFAULT_SEO.defaultTitle,
      'twitter:description': description,
      'twitter:image': fullImage,
      'twitter:image:alt': title || DEFAULT_SEO.siteName,

      'theme-color': '#22262d',
      'msapplication-TileColor': '#22262d',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': DEFAULT_SEO.siteName,
      'format-detection': 'telephone=no',
    };

    if (imageWidth) metaTags['og:image:width'] = imageWidth;
    if (imageHeight) metaTags['og:image:height'] = imageHeight;

    if (type === 'article') {
      if (publishedTime) metaTags['article:published_time'] = publishedTime;
      if (modifiedTime) metaTags['article:modified_time'] = modifiedTime;
      if (author) metaTags['article:author'] = author;
      if (section) metaTags['article:section'] = section;
      if (tags.length > 0) {
        tags.forEach((tag, index) => {
          metaTags[`article:tag:${index}`] = tag;
        });
      }
    }

    Object.entries(metaTags).forEach(([name, content]) => {
      const property =
        name.startsWith('og:') || name.startsWith('article:') ? 'property' : 'name';

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

    let canonicalLink = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    const canonicalHref = canonical
      ? canonical.startsWith('http')
        ? canonical
        : absoluteUrl(normalizePath(canonical))
      : fullUrl;
    canonicalLink.setAttribute('href', canonicalHref);

    // Keep hreflang honest: only the real (non-locale) URL.
    const ensureAlternate = (hreflang: string, href: string) => {
      let link = document.querySelector(
        `link[rel="alternate"][hreflang="${hreflang}"]`,
      ) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', hreflang);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };
    ensureAlternate('en', fullUrl);
    ensureAlternate('x-default', fullUrl);
    // Remove any legacy fake locale-path alternates (e.g. /ru/)
    document
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .forEach((node) => {
        const hl = node.getAttribute('hreflang');
        if (hl && hl !== 'en' && hl !== 'x-default') {
          node.remove();
        }
      });

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: DEFAULT_SEO.siteName,
      description: DEFAULT_SEO.defaultDescription,
      url: DEFAULT_SEO.baseUrl.replace(/\/+$/, '') + '/',
      logo: `${DEFAULT_SEO.baseUrl.replace(/\/+$/, '')}/biomathcore_emblem_1024.png`,
      image: fullImage,
      sameAs: getSocialSameAs(),
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'support@biomathcore.com',
        availableLanguage: [
          'English',
          'Spanish',
          'French',
          'German',
          'Japanese',
          'Hebrew',
          'Chinese',
          'Arabic',
          'Ukrainian',
          'Russian',
        ],
      },
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);
  }, [
    fullTitle,
    description,
    allKeywords,
    fullUrl,
    fullImage,
    imageWidth,
    imageHeight,
    type,
    author,
    publishedTime,
    modifiedTime,
    section,
    tags,
    robotsContent,
    canonical,
    title,
  ]);

  return null;
}
