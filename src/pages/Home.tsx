import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import CTASection from '../components/CTASection';
import { useTheme } from '../contexts/ThemeContext';
import {
  generateOrganizationSchema,
  generateSoftwareApplicationSchema,
  generateWebSiteSchema,
  injectStructuredData,
} from '../lib/structuredData';
import { trackClick, trackEvent } from '../lib/analytics';
import HumanDataModel from '../components/home/humanDataModel/HumanDataModel';
import HomeWhatItIs from '../components/home/HomeWhatItIs';
import HomeHowItWorks from '../components/home/HomeHowItWorks';
import HomeWhyDifferent from '../components/home/HomeWhyDifferent';

interface HomeProps {
  onNavigate: (page: string, data?: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  useEffect(() => {
    injectStructuredData(generateOrganizationSchema());
    injectStructuredData(generateSoftwareApplicationSchema());
    injectStructuredData(generateWebSiteSchema());
  }, []);

  return (
    <div className="min-h-screen bg-page transition-colors">
      <SEO
        title={t('home.seoTitle')}
        description={t('home.seoDescription')}
        keywords={[
          'BioMath Core',
          'Human Data Model',
          'biomathematical modeling',
          'digital twin',
          'Health Guide',
        ]}
        page="home"
      />

      {/* First viewport: brand + one headline + support + CTAs + HDM figure */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 ${
            dark
              ? 'bg-[radial-gradient(ellipse_at_50%_0%,rgba(249,115,22,0.12),transparent_55%),linear-gradient(180deg,rgba(0,0,0,0.25),transparent_40%)]'
              : 'bg-[radial-gradient(ellipse_at_50%_0%,rgba(249,115,22,0.08),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.4),transparent_45%)]'
          }`}
        />

        <div className="relative mx-auto flex w-full max-w-[1280px] flex-1 flex-col">
          <header className="mx-auto mb-6 max-w-2xl text-center md:mb-8">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.36em] transition-colors duration-200 ${
                dark ? 'text-orange-400' : 'text-orange-600'
              }`}
            >
              {t('home.brand')}
            </p>
            <h1
              className={`mt-3 text-3xl font-semibold tracking-tight transition-colors duration-200 sm:text-4xl md:text-5xl md:leading-[1.1] ${
                dark ? 'text-neutral-100' : 'text-neutral-900'
              }`}
            >
              {t('home.heroTitle')}
            </h1>
            <p
              className={`mx-auto mt-4 max-w-lg text-sm leading-relaxed transition-colors duration-200 sm:text-base ${
                dark ? 'text-neutral-400' : 'text-neutral-600'
              }`}
            >
              {t('home.heroSubtitle')}
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  trackEvent('view_pricing', { source: 'home_hero' });
                  trackClick('home_hero_pricing', { destination: 'pricing' });
                  onNavigate('pricing');
                }}
                className="w-full bg-orange-500 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-400 sm:w-auto"
              >
                {t('home.ctaPricing')}
              </button>
              <button
                type="button"
                onClick={() => {
                  trackEvent('cta_click', { source: 'home_hero', destination: 'how-it-works' });
                  trackClick('home_hero_how', { destination: 'how-it-works' });
                  onNavigate('how-it-works');
                }}
                className={`w-full border px-8 py-3.5 text-sm font-semibold transition-colors sm:w-auto ${
                  dark
                    ? 'border-white/15 bg-white/[0.03] text-neutral-100 hover:border-orange-400/40'
                    : 'border-[var(--bm-border)] bg-page text-gray-900 hover:border-orange-500/40'
                }`}
              >
                {t('home.ctaHow')}
              </button>
            </div>
          </header>

          <div className="flex flex-1 flex-col items-center justify-center py-2">
            <HumanDataModel dark={dark} onNavigate={onNavigate} />
          </div>
        </div>
      </section>

      <HomeWhatItIs />
      <HomeHowItWorks />
      <HomeWhyDifferent />

      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <CTASection
          title={t('home.cta.title')}
          description={t('home.cta.description')}
          primaryButtonText={t('home.cta.primary')}
          secondaryButtonText={t('home.cta.secondary')}
          onPrimaryClick={() => {
            trackEvent('view_pricing', { source: 'home_cta' });
            trackClick('home_cta_pricing', { destination: 'pricing' });
            onNavigate('pricing');
          }}
          onSecondaryClick={() => {
            trackEvent('cta_click', { source: 'home_cta', destination: 'signup' });
            trackClick('home_cta_member', { destination: 'signup' });
            onNavigate('signup');
          }}
          showStats={false}
        />
      </div>
    </div>
  );
}
