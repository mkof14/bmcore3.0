/**
 * Path-based routing helpers (History API).
 * Aligns page keys with public/sitemap.xml and SiteMapManager paths where possible.
 * SEO/sitemap should list canonical PAGE_PATHS only (no invented /es/, /ru/ locale prefixes —
 * UI language is cookie/localStorage, not URL).
 */

export type AppPage =
  | 'home'
  | 'about'
  | 'services'
  | 'pricing'
  | 'investors'
  | 'science'
  | 'api'
  | 'contact'
  | 'signin'
  | 'signup'
  | 'member'
  | 'member-zone'
  | 'services-catalog'
  | 'service-detail'
  | 'devices'
  | 'reports'
  | 'faq'
  | 'referral'
  | 'ambassador'
  | 'learning'
  | 'learning-center'
  | 'biomath-core-summary'
  | 'summary-text'
  | 'blog'
  | 'news'
  | 'media'
  | 'careers'
  | 'command-center'
  | 'admin-panel'
  | 'config-system'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'disclaimer'
  | 'hipaa-notice'
  | 'security'
  | 'gdpr'
  | 'data-privacy'
  | 'trust-safety'
  | 'partnership'
  | 'how-it-works'
  | 'why-two-models'
  | 'privacy-trust'
  | 'redeem-invitation'
  | 'second-opinion-demo';

export interface RouteState {
  page: AppPage;
  serviceDetailId: string;
  categoryFilter: string;
  memberServiceRef: string;
  /** When set, caller should replaceState to this URL (hash → path normalization). */
  normalizeUrl?: string;
}

/** Canonical page key → URL path (no query). `service-detail` uses `/services/:cat/:id`. */
export const PAGE_PATHS: Partial<Record<AppPage, string>> & Record<string, string> = {
  home: '/',
  about: '/about',
  services: '/services',
  pricing: '/pricing',
  investors: '/investors',
  science: '/science',
  api: '/api-docs',
  contact: '/contact',
  signin: '/signin',
  signup: '/signup',
  member: '/member-zone',
  'member-zone': '/member-zone',
  'services-catalog': '/services-catalog',
  devices: '/devices',
  reports: '/reports',
  faq: '/faq',
  referral: '/referral',
  ambassador: '/ambassador',
  learning: '/learning-center',
  'learning-center': '/learning-center',
  'biomath-core-summary': '/biomath-core-summary',
  'summary-text': '/summary-text',
  blog: '/blog',
  news: '/news',
  media: '/media',
  careers: '/careers',
  'command-center': '/command-center',
  'admin-panel': '/admin-panel',
  'config-system': '/config-system',
  'privacy-policy': '/privacy-policy',
  'terms-of-service': '/terms-of-service',
  disclaimer: '/disclaimer',
  'hipaa-notice': '/hipaa-notice',
  security: '/security',
  gdpr: '/gdpr',
  'data-privacy': '/data-privacy',
  'trust-safety': '/trust-safety',
  partnership: '/partnership',
  'how-it-works': '/how-it-works',
  'why-two-models': '/why-two-models',
  'privacy-trust': '/privacy-trust',
  'redeem-invitation': '/redeem-invitation',
  'second-opinion-demo': '/second-opinion-demo',
};

/** Extra path aliases → page key (sitemap / older links). */
const PATH_ALIASES: Record<string, AppPage> = {
  '/admin': 'admin-panel',
  '/learning': 'learning-center',
  '/member': 'member-zone',
  '/api': 'api',
  '/legal/privacy-policy': 'privacy-policy',
  '/legal/terms-of-service': 'terms-of-service',
  '/legal/gdpr': 'gdpr',
  '/legal/hipaa-notice': 'hipaa-notice',
  '/legal/disclaimer': 'disclaimer',
  '/legal/security': 'security',
  '/legal/data-privacy': 'data-privacy',
  '/legal/trust-safety': 'trust-safety',
  '/second-opinion-demo': 'second-opinion-demo',
  '/second-opinion': 'second-opinion-demo',
  '/reset-password': 'signin',
  '/dashboard': 'member-zone',
};

const CANONICAL_ALIASES: Partial<Record<string, AppPage>> = {
  member: 'member-zone',
  learning: 'learning-center',
};

const KNOWN_PAGES = new Set<string>([
  ...Object.keys(PAGE_PATHS),
  'service-detail',
]);

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed || '/';
}

function emptyRoute(page: AppPage = 'home'): RouteState {
  return {
    page,
    serviceDetailId: '',
    categoryFilter: '',
    memberServiceRef: '',
  };
}

function canonicalPage(page: string): AppPage {
  const aliased = CANONICAL_ALIASES[page];
  if (aliased) return aliased;
  if (KNOWN_PAGES.has(page)) return page as AppPage;
  return 'home';
}

/** Build path (+ optional query) for a page key and optional data payload. */
export function pageToPath(page: string, data?: string): string {
  const key = canonicalPage(page);

  if (key === 'service-detail') {
    if (data) {
      const cleaned = data.replace(/^\/+/, '').replace(/\/+$/, '');
      return `/services/${cleaned}`;
    }
    return PAGE_PATHS['services-catalog'] || '/services-catalog';
  }

  if (key === 'services-catalog') {
    const base = PAGE_PATHS['services-catalog'] ?? '/services-catalog';
    if (data) return `${base}?category=${encodeURIComponent(data)}`;
    return base;
  }

  if (key === 'member-zone' && data) {
    return `${PAGE_PATHS['member-zone'] ?? '/member-zone'}?service=${encodeURIComponent(data)}`;
  }

  if (key === 'redeem-invitation' && data) {
    return `${PAGE_PATHS['redeem-invitation'] ?? '/redeem-invitation'}?code=${encodeURIComponent(data)}`;
  }

  return PAGE_PATHS[key] || '/';
}

/** Parse pathname + search into route state. Unknown paths → home. */
export function pathToRoute(pathname: string, search = ''): RouteState {
  const path = normalizePathname(pathname);
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);

  const serviceMatch = path.match(/^\/services\/([^/]+)\/([^/]+)$/);
  if (serviceMatch) {
    return {
      ...emptyRoute('service-detail'),
      serviceDetailId: `${decodeURIComponent(serviceMatch[1])}/${decodeURIComponent(serviceMatch[2])}`,
    };
  }

  if (path === '/' ) {
    return emptyRoute('home');
  }

  const aliasPage = PATH_ALIASES[path];
  if (aliasPage) {
    return emptyRoute(aliasPage);
  }

  for (const [page, pagePath] of Object.entries(PAGE_PATHS) as [AppPage, string][]) {
    if (pagePath !== path) continue;

    const route = emptyRoute(
      page === 'member' ? 'member-zone' : page === 'learning' ? 'learning-center' : page,
    );

    if (route.page === 'services-catalog') {
      route.categoryFilter = params.get('category') || '';
    }
    if (route.page === 'member-zone') {
      route.memberServiceRef = params.get('service') || '';
    }
    return route;
  }

  return emptyRoute('home');
}

/**
 * Read current location. Supports path URLs and legacy hash routes (`#/pricing`, `#/blog?post=`).
 * When a hash route is detected, `normalizeUrl` suggests a clean path (+ query) to replaceState to.
 */
export function parseLocation(
  loc: Pick<Location, 'pathname' | 'search' | 'hash'> = window.location,
): RouteState {
  const hash = loc.hash || '';

  if (hash.startsWith('#/')) {
    const body = hash.slice(2);
    const qIndex = body.indexOf('?');
    const hashPath = qIndex >= 0 ? body.slice(0, qIndex) : body;
    const hashSearch = qIndex >= 0 ? body.slice(qIndex) : '';
    // Prefer hash query for content deep-links; fall back to location.search
    const search = hashSearch || loc.search || '';
    const route = pathToRoute(`/${hashPath.replace(/^\/+/, '')}`, search);
    const pathOnly = pageToPath(
      route.page,
      route.serviceDetailId || route.categoryFilter || route.memberServiceRef || undefined,
    );
    // Merge content params (post, item, job, code) into normalize URL
    const contentParams = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    const url = new URL(pathOnly, 'https://biomathcore.com');
    for (const key of ['post', 'item', 'job', 'code', 'payment']) {
      const value = contentParams.get(key);
      if (value && !url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    }
    // category/service already encoded in pathOnly when relevant
    const normalizeUrl = url.pathname + url.search;
    return { ...route, normalizeUrl };
  }

  return pathToRoute(loc.pathname, loc.search);
}

export function syncUrl(
  page: string,
  data?: string,
  options?: { replace?: boolean; preserveSearchKeys?: string[] },
): void {
  let next = pageToPath(page, data);

  if (options?.preserveSearchKeys?.length) {
    const current = new URLSearchParams(window.location.search);
    const url = new URL(next, window.location.origin);
    for (const key of options.preserveSearchKeys) {
      const value = current.get(key);
      if (value && !url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    }
    next = url.pathname + url.search;
  }

  const method = options?.replace ? 'replaceState' : 'pushState';
  const state = { page: canonicalPage(page), data: data || null };
  window.history[method](state, '', next);
}

/** Read content deep-link params from search (preferred) or legacy hash query. */
export function getContentSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  const fromSearch = window.location.search;
  if (fromSearch && fromSearch.length > 1) {
    return new URLSearchParams(fromSearch);
  }
  const hash = window.location.hash || '';
  const qIndex = hash.indexOf('?');
  if (qIndex >= 0) {
    return new URLSearchParams(hash.slice(qIndex + 1));
  }
  return new URLSearchParams();
}
