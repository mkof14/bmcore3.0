import { supabase } from './supabase';

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
}

export interface PageViewEvent {
  page: string;
  referrer?: string;
  userId?: string;
}

class Analytics {
  private sessionId: string;
  private userId: string | null = null;
  private enabled: boolean = false;
  private queue: AnalyticsEvent[] = [];
  private initialized: boolean = false;
  private trackersLoaded: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.checkConsent();
  }

  /** Wire consent listeners + load trackers only when analytics consent is granted. */
  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.maybeLoadTrackers();
  }

  /** Inject GA / Meta Pixel when consented. Missing env IDs fail soft (no throw). */
  private maybeLoadTrackers() {
    if (!this.enabled || this.trackersLoaded) return;

    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
    const fbPixelId = import.meta.env.VITE_FACEBOOK_PIXEL_ID as string | undefined;

    try {
      if (gaId) {
        this.initGA(gaId);
      }
    } catch (e) {
      console.warn('Google Analytics failed to initialize:', e);
    }

    try {
      if (fbPixelId) {
        this.initFBPixel(fbPixelId);
      }
    } catch (e) {
      console.warn('Facebook Pixel failed to initialize:', e);
    }

    // Avoid re-injecting scripts on later consent toggles in the same session.
    this.trackersLoaded = true;
  }

  private initGA(measurementId: string) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;
    gtag('js', new Date());
    gtag('config', measurementId, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });
  }

  private initFBPixel(pixelId: string) {
    (window as any).fbq = function(...args: any[]) {
      (window as any).fbq.callMethod
        ? (window as any).fbq.callMethod(...args)
        : (window as any).fbq.queue.push(args);
    };
    (window as any)._fbq = (window as any).fbq;
    (window as any).fbq.push = (window as any).fbq;
    (window as any).fbq.loaded = true;
    (window as any).fbq.version = '2.0';
    (window as any).fbq.queue = [];

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    (window as any).fbq('init', pixelId);
    (window as any).fbq('track', 'PageView');
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private checkConsent() {
    try {
      const consent = localStorage.getItem('biomath_cookie_preferences');
      if (consent) {
        const preferences = JSON.parse(consent);
        this.enabled = preferences.analytics === true;
      }
    } catch (e) {
      this.enabled = false;
    }

    window.addEventListener('cookieConsentUpdated', ((event: CustomEvent) => {
      this.enabled = event.detail?.analytics === true;
      if (this.enabled) {
        this.maybeLoadTrackers();
        if (this.queue.length > 0) {
          void this.flushQueue();
        }
      } else {
        this.queue = [];
      }
    }) as EventListener);
  }

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  private async flushQueue() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    for (const event of events) {
      await this.sendEvent(event);
    }
  }

  private async sendEvent(event: AnalyticsEvent) {
    if (!this.enabled) {
      this.queue.push(event);
      return;
    }

    try {
      const { error } = await supabase.from('analytics_events').insert({
        event_name: event.event,
        properties: event.properties || {},
        user_id: event.userId || this.userId,
        session_id: event.sessionId || this.sessionId,
        created_at: event.timestamp || new Date().toISOString()
      });

      if (error) {
        console.error('Analytics error:', error);
      }
    } catch (e) {
      console.error('Failed to send analytics event:', e);
    }
  }

  track(event: string, properties?: Record<string, any>) {
    this.sendEvent({
      event,
      properties,
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    });
  }

  page(page: string, properties?: Record<string, any>) {
    this.track('page_view', {
      page,
      referrer: document.referrer,
      url: window.location.href,
      ...properties
    });
  }

  identify(userId: string, traits?: Record<string, any>) {
    this.setUserId(userId);
    this.track('identify', {
      userId,
      ...traits
    });
  }

  click(element: string, properties?: Record<string, any>) {
    this.track('click', {
      element,
      ...properties
    });
  }

  conversion(type: string, value?: number, properties?: Record<string, any>) {
    this.track('conversion', {
      type,
      value,
      currency: 'USD',
      timestamp: new Date().toISOString(),
      ...properties
    });

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        event_category: 'engagement',
        event_label: type,
        value: value || 0,
        currency: 'USD'
      });
    }
  }

  formSubmission(formName: string, success: boolean, properties?: Record<string, any>) {
    this.track('form_submission', {
      formName,
      success,
      ...properties
    });
  }

  signup(method: string, properties?: Record<string, any>) {
    this.track('signup', {
      method,
      ...properties
    });
    this.conversion('signup', 0, { method, ...properties });
  }

  login(method: string, properties?: Record<string, any>) {
    this.track('login', {
      method,
      ...properties
    });
  }

  purchase(amount: number, currency: string = 'USD', properties?: Record<string, any>) {
    this.track('purchase', {
      amount,
      currency,
      ...properties
    });
    this.conversion('purchase', amount, { currency, ...properties });
  }

  subscriptionStarted(plan: string, amount: number, properties?: Record<string, any>) {
    this.track('subscription_started', {
      plan,
      amount,
      ...properties
    });
    this.conversion('subscription', amount, { plan, ...properties });
  }

  error(error: Error | string, context?: Record<string, any>) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.track('error', {
      message: errorMessage,
      stack: errorStack,
      ...context
    });
  }

  timing(category: string, variable: string, time: number, label?: string) {
    this.track('timing', {
      category,
      variable,
      time,
      label
    });
  }

  feature(feature: string, action: 'enabled' | 'disabled' | 'used') {
    this.track('feature', {
      feature,
      action
    });
  }

  form(formName: string, action: 'start' | 'submit' | 'error', properties?: Record<string, any>) {
    this.track('form', {
      formName,
      action,
      ...properties
    });
  }
}

export const analytics = new Analytics();

export function initAnalytics() {
  if (typeof window === 'undefined') return;
  analytics.init();
}

export function trackPageView(page: string) {
  analytics.page(page);
}

export function trackEvent(event: string, properties?: Record<string, any>) {
  analytics.track(event, properties);
}

export function trackClick(element: string, properties?: Record<string, any>) {
  analytics.click(element, properties);
}

export function trackConversion(type: string, value?: number, properties?: Record<string, any>) {
  analytics.conversion(type, value, properties);
}

export function trackError(error: Error | string, context?: Record<string, any>) {
  analytics.error(error, context);
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  analytics.identify(userId, traits);
}
