import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import CTASection from '../components/CTASection';
import { useTheme } from '../contexts/ThemeContext';
import { generateOrganizationSchema, generateWebSiteSchema, injectStructuredData } from '../lib/structuredData';
import { trackClick, trackEvent } from '../lib/analytics';
import HumanDataModel from '../components/home/humanDataModel/HumanDataModel';
import WhatCanYouUnderstand from '../components/home/WhatCanYouUnderstand';
import HumanDataTimeline from '../components/home/HumanDataTimeline';
import EverythingChanges from '../components/home/EverythingChanges';

interface HomeProps {
  onNavigate: (page: string, data?: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  useEffect(() => {
    injectStructuredData(generateOrganizationSchema());
    injectStructuredData(generateWebSiteSchema());
  }, []);

  return (
    <div className="min-h-screen bg-page transition-colors">
      <SEO
        title="Human Data Model"
        description="BioMath Core Human Data Model — pieces come together to reveal the picture."
        keywords={['BioMath Core', 'Human Data Model']}
        page="home"
      />

      <section className="flex min-h-screen flex-col px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col">
          <header className="mb-8 text-center md:mb-10">
            <h1
              className={`text-3xl font-semibold tracking-tight transition-colors duration-200 sm:text-4xl md:text-5xl ${
                dark ? 'text-neutral-100' : 'text-neutral-900'
              }`}
            >
              {t('home.modelTitle')}
            </h1>
            <p
              className={`mt-3 text-sm transition-colors duration-200 sm:text-base ${
                dark ? 'text-neutral-400' : 'text-neutral-600'
              }`}
            >
              {t('home.modelSubtitle')}
            </p>
          </header>

          <div className="flex flex-1 flex-col items-center justify-center py-2 pb-8">
            <HumanDataModel dark={dark} onNavigate={onNavigate} />
          </div>
        </div>
      </section>

      <WhatCanYouUnderstand />
      <HumanDataTimeline onNavigate={onNavigate} />
      <EverythingChanges />

      {/* Conversion path after narrative — keeps the hero one composition */}
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
            trackClick('home_cta_signup', { destination: 'signup' });
            onNavigate('signup');
          }}
          showStats={false}
        />
      </div>
    </div>
  );
}
