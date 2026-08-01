import { trackEvent } from './analytics';

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

function hasAnalyticsConsent(): boolean {
  try {
    const raw = localStorage.getItem('biomath_cookie_preferences');
    if (!raw) return false;
    const preferences = JSON.parse(raw) as { analytics?: boolean };
    return preferences.analytics === true;
  } catch {
    return false;
  }
}

function reportMetric(metric: WebVitalsMetric) {
  if (!hasAnalyticsConsent()) return;
  trackEvent('web_vital', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  });
}

let listenersBound = false;
let reporting = false;

/**
 * Consent-aware Core Web Vitals reporting via the `web-vitals` package.
 * No-ops until analytics cookie consent is granted; re-checks on consent updates.
 */
export function initWebVitals() {
  if (typeof window === 'undefined' || listenersBound) return;
  listenersBound = true;

  const startIfConsented = () => {
    if (reporting || !hasAnalyticsConsent()) return;
    reporting = true;
    void import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      onCLS(reportMetric);
      onINP(reportMetric);
      onLCP(reportMetric);
      onFCP(reportMetric);
      onTTFB(reportMetric);
    });
  };

  startIfConsented();
  window.addEventListener('cookieConsentUpdated', ((event: CustomEvent<{ analytics?: boolean }>) => {
    if (event.detail?.analytics === true) {
      startIfConsented();
    }
  }) as EventListener);
}
