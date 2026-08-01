import { getSocialSameAs } from '../config/social';

export interface Organization {
  '@context': 'https://schema.org';
  '@type': 'Organization' | 'MedicalOrganization';
  name: string;
  description?: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  contactPoint?: ContactPoint[];
  address?: PostalAddress;
  founder?: Person[];
  foundingDate?: string;
}

export interface Person {
  '@type': 'Person';
  name: string;
  jobTitle?: string;
  image?: string;
  url?: string;
}

export interface ContactPoint {
  '@type': 'ContactPoint';
  contactType: string;
  telephone?: string;
  email?: string;
  availableLanguage?: string[];
  areaServed?: string;
}

export interface PostalAddress {
  '@type': 'PostalAddress';
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
}

export interface WebSite {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

export interface WebPage {
  '@context': 'https://schema.org';
  '@type': 'WebPage';
  name: string;
  description?: string;
  url: string;
  breadcrumb?: BreadcrumbList;
  mainEntity?: any;
}

export interface BreadcrumbList {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: ListItem[];
}

export interface ListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

export interface FAQPage {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Question[];
}

export interface Question {
  '@type': 'Question';
  name: string;
  acceptedAnswer: {
    '@type': 'Answer';
    text: string;
  };
}

export interface Article {
  '@context': 'https://schema.org';
  '@type': 'Article' | 'BlogPosting' | 'NewsArticle';
  headline: string;
  description?: string;
  image?: string | string[];
  author?: Person | Organization;
  publisher?: Organization;
  datePublished: string;
  dateModified?: string;
  mainEntityOfPage?: string;
}

export interface Product {
  '@context': 'https://schema.org';
  '@type': 'Product' | 'SoftwareApplication';
  name: string;
  description: string;
  image?: string | string[];
  brand?: Organization;
  offers?: Offer[];
  aggregateRating?: AggregateRating;
  review?: Review[];
}

export interface Offer {
  '@type': 'Offer';
  price: string;
  priceCurrency: string;
  availability?: string;
  url?: string;
  priceValidUntil?: string;
  seller?: Organization;
}

export interface AggregateRating {
  '@type': 'AggregateRating';
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export interface Review {
  '@type': 'Review';
  author: Person;
  datePublished: string;
  reviewBody: string;
  reviewRating: {
    '@type': 'Rating';
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export interface Service {
  '@context': 'https://schema.org';
  '@type': 'Service' | 'MedicalService';
  name: string;
  description: string;
  provider: Organization;
  serviceType?: string;
  areaServed?: string;
  offers?: Offer[];
}

export interface LocalBusiness {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness' | 'MedicalBusiness';
  name: string;
  image?: string;
  '@id': string;
  url: string;
  telephone?: string;
  address?: PostalAddress;
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  openingHoursSpecification?: OpeningHoursSpecification[];
  priceRange?: string;
}

export interface OpeningHoursSpecification {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

export function generateOrganizationSchema(): Organization {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'BioMath Core',
    description:
      'BioMath Core turns your health data into clear insights, personalized guidance, and practical next steps with Health Guide.',
    url: 'https://biomathcore.com',
    logo: 'https://biomathcore.com/biomathcore_emblem_1024.png',
    sameAs: getSocialSameAs(),
    contactPoint: [
      {
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
        areaServed: 'Worldwide'
      },
      {
        '@type': 'ContactPoint',
        contactType: 'Sales',
        email: 'sales@biomathcore.com',
        availableLanguage: ['English', 'Spanish', 'Russian']
      }
    ]
  };
}

export function generateWebSiteSchema(): WebSite {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BioMath Core',
    url: 'https://biomathcore.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://biomathcore.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };
}

export function generateBreadcrumbs(items: { name: string; url: string }[]): BreadcrumbList {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]): FAQPage {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  image?: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}): Article {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    image: article.image,
    author: {
      '@type': 'Person',
      name: article.author
    },
    publisher: generateOrganizationSchema(),
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    mainEntityOfPage: article.url
  };
}

export function generateProductSchema(product: {
  name: string;
  description: string;
  image?: string;
  price: string;
  currency: string;
  availability: string;
  rating?: number;
  reviewCount?: number;
}): Product {
  const schema: Product = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: generateOrganizationSchema(),
    offers: [
      {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency,
        availability: product.availability,
        url: 'https://biomathcore.com/pricing'
      }
    ]
  };

  if (product.rating && product.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1
    };
  }

  return schema;
}

export function generateServiceSchema(service: {
  name: string;
  description: string;
  serviceType?: string;
  price?: string;
  currency?: string;
}): Service {
  const schema: Service = {
    '@context': 'https://schema.org',
    '@type': 'MedicalService',
    name: service.name,
    description: service.description,
    provider: generateOrganizationSchema(),
    serviceType: service.serviceType,
    areaServed: 'Worldwide'
  };

  if (service.price && service.currency) {
    schema.offers = [
      {
        '@type': 'Offer',
        price: service.price,
        priceCurrency: service.currency,
        availability: 'https://schema.org/InStock'
      }
    ];
  }

  return schema;
}

export function injectStructuredData(data: any): void {
  if (typeof window === 'undefined') return;

  const scriptId = `structured-data-${Date.now()}`;
  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}
