import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { useTheme } from '../contexts/ThemeContext';
import {
  generateOrganizationSchema,
  generateSoftwareApplicationSchema,
  generateWebSiteSchema,
  injectStructuredData,
} from '../lib/structuredData';
import HumanDataModel from '../components/home/humanDataModel/HumanDataModel';
import TwoModelsSection from '../components/home/twoModels/TwoModelsSection';

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
          'Health Guide',
        ]}
        page="home"
      />

      {/* First viewport: brand + one headline + support + HDM figure */}
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
          </header>

          <div className="flex flex-1 flex-col items-center justify-center py-2">
            <HumanDataModel dark={dark} onNavigate={onNavigate} />
          </div>
        </div>
      </section>

      {/* After HDM three-card block (import / timeline / what changed) */}
      <TwoModelsSection dark={dark} onNavigate={onNavigate} />
    </div>
  );
}
