/**
 * Marketing routes for static SEO shells (post-Vite build).
 * Keep in sync with MARKETING_PRERENDER_PATHS in src/lib/routing.ts.
 */
export const BASE_URL = process.env.VITE_APP_URL || 'https://biomathcore.com';

/** @typedef {{ path: string; title: string; description: string; h1: string; keywords?: string }} PrerenderRoute */

/** @type {PrerenderRoute[]} */
export const PRERENDER_ROUTES = [
  {
    path: '/',
    title: 'BioMath Core — Biomathematical Human Data Model',
    description:
      'BioMath Core builds a living Human Data Model — a biomathematical digital twin of your health — and guides you with Health Guide dual analysis.',
    h1: 'Human Data Model',
    keywords:
      'biomathematical modeling, Human Data Model, digital twin, Health Guide, BioMath Core, dual intelligence',
  },
  {
    path: '/about',
    title: 'About BioMath Core | Mission, Team & Origins',
    description:
      'BioMath Core applies biomathematics and computational biology to build a Human Data Model — developed under Digital Invest Inc. and shaped by the BioMath Life vision.',
    h1: 'Mission, vision, and the people behind BioMath Core',
  },
  {
    path: '/pricing',
    title: 'Pricing | BioMath Core Human Data Model Plans',
    description:
      'Choose how deep your Human Data Model goes. Plans expand biomathematical context so Health Guide can deliver clearer dual-model guidance.',
    h1: 'Choose the depth of your Human Data Model',
  },
  {
    path: '/science',
    title: 'Science & Research | Biomathematical Health Modeling',
    description:
      'The science behind BioMath Core: biomathematical modeling, multi-signal integration, and interpretable physiological models — not generic dashboards.',
    h1: 'The science behind BioMath Core',
  },
  {
    path: '/how-it-works',
    title: 'How It Works | BioMath Core',
    description:
      'See how verified health data becomes a living Human Data Model and how Health Guide turns biomathematical signals into practical wellness guidance.',
    h1: 'How BioMath Core works',
  },
  {
    path: '/why-two-models',
    title: 'Why Two Models | Dual Intelligence',
    description:
      'BioMath Core runs independent biomathematical and clinical analyses on the same data. Agreement builds confidence; disagreement highlights what needs attention.',
    h1: 'Why two models?',
  },
  {
    path: '/blog',
    title: 'Blog | Biomathematical Health Method',
    description:
      'Articles on how the BioMath Core biomathematical model works, how it differs from biomarker dashboards, dual intelligence, and privacy.',
    h1: 'Blog',
  },
  {
    path: '/investors',
    title: 'Investors | BioMath Core',
    description:
      'Strategic investment in biomathematical personal health modeling — Human Data Model, dual intelligence, and Health Guide.',
    h1: 'Strategic investment in personal health intelligence',
  },
  {
    path: '/contact',
    title: 'Contact | BioMath Core',
    description:
      'Contact BioMath Core about services, partnerships, or enterprise use. For wellness guidance, use Health Guide in the Member Zone.',
    h1: 'Get in touch',
  },
  {
    path: '/faq',
    title: 'FAQ | BioMath Core',
    description:
      'Common questions about BioMath Core services, subscriptions, the Human Data Model, privacy, and Health Guide.',
    h1: 'Common questions',
  },
  {
    path: '/learning-center',
    title: 'Learning Center | BioMath Core',
    description:
      'Learn the BioMath Core method: Human Data Model, biomathematical modeling, and how dual intelligence supports preventive wellness.',
    h1: 'Learning Center',
  },
  {
    path: '/privacy-trust',
    title: 'Privacy & Trust | BioMath Core',
    description:
      'How BioMath Core protects health data while building your Human Data Model — privacy-first design and transparent guidance.',
    h1: 'Privacy & Trust',
  },
  {
    path: '/services-catalog',
    title: 'Services Catalog | BioMath Core',
    description:
      'Browse BioMath Core services organized around the Human Data Model — biomathematical context across health categories.',
    h1: 'Browse all BioMath Core services',
  },
  {
    path: '/services',
    title: 'Services & Pricing | BioMath Core Plans',
    description:
      'Choose Core, Daily, or Max plans for intelligent health analytics — Human Data Model depth across 200+ services and 20 categories.',
    h1: 'Choose the depth of your Human Data Model',
  },
  {
    path: '/media',
    title: 'Media | Videos, Presentations & Documents',
    description:
      'Watch BioMath Core videos, browse presentations, and download documents about health understanding and the Human Data Model.',
    h1: 'Media',
  },
  {
    path: '/partnership',
    title: 'Partnerships | Work With BioMath Core',
    description:
      'Partner with BioMath Core on business development, research collaboration, or clinical integration — distribution, co-marketing, and data partnerships.',
    h1: 'Build with BioMath Core',
  },
];

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'BioMath Core',
    description:
      'BioMath Core builds a biomathematical Human Data Model — a living digital twin of your health — and delivers dual-model guidance through Health Guide.',
    url: `${BASE_URL.replace(/\/+$/, '')}/`,
    logo: `${BASE_URL.replace(/\/+$/, '')}/biomathcore_emblem_1024.png`,
    sameAs: [
      'https://www.facebook.com/biomathcore',
      'https://x.com/biomathcore',
      'https://www.linkedin.com/company/biomath-core',
      'https://github.com/biomathcore',
    ],
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
}

export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Health Guide',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    description:
      'Health Guide is the BioMath Core guidance experience: dual biomathematical and clinical perspectives on your Human Data Model.',
    url: `${BASE_URL.replace(/\/+$/, '')}/`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      url: `${BASE_URL.replace(/\/+$/, '')}/pricing`,
    },
    provider: {
      '@type': 'Organization',
      name: 'BioMath Core',
      url: `${BASE_URL.replace(/\/+$/, '')}/`,
    },
  };
}
