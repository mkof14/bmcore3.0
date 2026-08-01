import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronRight, ArrowLeft, X } from 'lucide-react';
import {
  getServiceCategory,
  serviceCategories,
  serviceDetailPath,
  totalServiceCount,
} from '../data/services';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';
import { categoryHeroUrl } from '../data/serviceHeroes';
import { localizeCategory, localizeService } from '../lib/localizeServices';

interface ServicesCatalogProps {
  onNavigate: (page: string, categoryId?: string) => void;
  initialCategory?: string;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
      {children}
    </p>
  );
}

export default function ServicesCatalog({ onNavigate, initialCategory }: ServicesCatalogProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const localizedCategories = useMemo(
    () =>
      serviceCategories.map((category) => ({
        ...localizeCategory(t, category),
        services: category.services.map((service) =>
          localizeService(t, category.id, service),
        ),
      })),
    [t],
  );

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) return localizedCategories;
    return localizedCategories.filter(
      (category) =>
        category.name.toLowerCase().includes(normalizedQuery) ||
        category.description.toLowerCase().includes(normalizedQuery) ||
        category.services.some(
          (service) =>
            service.name.toLowerCase().includes(normalizedQuery) ||
            service.description.toLowerCase().includes(normalizedQuery)
        )
    );
  }, [localizedCategories, normalizedQuery]);

  const rawSelectedCategory = selectedCategory ? getServiceCategory(selectedCategory) : null;
  const selectedCategoryData = useMemo(
    () =>
      rawSelectedCategory
        ? {
            ...localizeCategory(t, rawSelectedCategory),
            services: rawSelectedCategory.services.map((service) =>
              localizeService(t, rawSelectedCategory.id, service),
            ),
          }
        : null,
    [rawSelectedCategory, t],
  );

  const filteredServices = useMemo(() => {
    if (!selectedCategoryData) return [];
    if (!normalizedQuery) return selectedCategoryData.services;
    return selectedCategoryData.services.filter(
      (service) =>
        service.name.toLowerCase().includes(normalizedQuery) ||
        service.description.toLowerCase().includes(normalizedQuery)
    );
  }, [selectedCategoryData, normalizedQuery]);

  const selectedCategoryIndex = selectedCategoryData
    ? serviceCategories.findIndex((c) => c.id === selectedCategoryData.id) + 1
    : null;

  const searchInputClassName =
    'w-full border border-[var(--bm-border)] bg-page py-3.5 pl-11 pr-11 text-gray-900 transition-colors placeholder-gray-400 focus:border-orange-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 dark:text-neutral-100';

  return (
    <div className="min-h-screen bg-page text-gray-900 transition-colors dark:text-neutral-100">
      <SEO
        title={t('catalog.seoTitle')}
        description={t('catalog.seoDescription')}
        keywords={[
          'health services catalog',
          'biomath core services',
          'wellness categories',
          'health insights',
          'biomathematics services',
        ]}
        url="/services-catalog"
      />

      <div className="pt-20 pb-16">
        {selectedCategoryData ? (
          <>
            {/* Category detail hero */}
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="group mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600 dark:text-neutral-400 dark:hover:text-orange-400"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                {t('catalog.backToCategories')}
              </button>

              <section className="overflow-hidden border border-[var(--bm-border)] bg-[var(--bm-surface)]">
                <div className="relative aspect-[21/9] min-h-[180px] w-full sm:min-h-[220px]">
                  <img
                    src={categoryHeroUrl(selectedCategoryData.id)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bm-page)] via-[var(--bm-page)]/55 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 px-5 pb-6 sm:px-8 sm:pb-8">
                    {selectedCategoryIndex !== null && (
                      <p className="mb-2 text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                        {String(selectedCategoryIndex).padStart(2, '0')}
                      </p>
                    )}
                    <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-4xl md:text-5xl">
                      {selectedCategoryData.name}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700 dark:text-neutral-300 sm:text-base">
                      {selectedCategoryData.description}
                    </p>
                    <p className="mt-3 text-sm font-medium text-gray-500 dark:text-neutral-500">
                      {t('catalog.servicesInCategory', {
                        count: selectedCategoryData.services.length,
                      })}
                    </p>
                  </div>
                </div>
              </section>

              <section className="border-b border-[var(--bm-border)] py-8">
                <div className="mx-auto max-w-2xl">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('catalog.searchServicesPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={searchInputClassName}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-neutral-100"
                        aria-label={t('catalog.clearSearch')}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-neutral-500">
                    {filteredServices.length === 1
                      ? t('catalog.showingServiceOne', { count: filteredServices.length })
                      : t('catalog.showingServices', { count: filteredServices.length })}
                  </p>
                </div>
              </section>
            </div>
          </>
        ) : (
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <BackButton onNavigate={onNavigate} />

            <section className="border-b border-[var(--bm-border)] pb-10 pt-8 lg:pb-12 lg:pt-10">
              <SectionLabel>{t('catalog.label')}</SectionLabel>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-5xl md:text-[3.25rem] md:leading-[1.12]">
                {t('catalog.title')}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-neutral-400 sm:text-lg">
                {t('catalog.subtitle')} ({totalServiceCount()}+ / {serviceCategories.length})
              </p>

              <div className="mt-9 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('catalog.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={searchInputClassName}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-neutral-100"
                      aria-label={t('catalog.clearSearch')}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-neutral-500">
                  {filteredCategories.length === 1
                    ? t('catalog.showingCategoryOne', { count: filteredCategories.length })
                    : t('catalog.showingCategories', { count: filteredCategories.length })}
                </p>
              </div>
            </section>
          </div>
        )}

        {/* Grid */}
        <section className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
          {!selectedCategoryData ? (
            <>
              {filteredCategories.length === 0 ? (
                <p className="py-12 text-center text-base text-gray-500 dark:text-neutral-500">
                  {t('catalog.noCategories')}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCategories.map((category, index) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className="group overflow-hidden border border-[var(--bm-border)] bg-[var(--bm-surface)] text-left transition-colors hover:border-orange-500/40"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={categoryHeroUrl(category.id)}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-95"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                              {String(index + 1).padStart(2, '0')}
                            </p>
                            <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-neutral-100">
                              {category.name}
                            </h3>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-neutral-500">
                              {t('catalog.servicesCount', { count: category.services.length })}
                            </p>
                          </div>
                          <ChevronRight className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400 transition-colors group-hover:text-orange-500" />
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                          {category.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {filteredServices.length === 0 ? (
                <p className="py-12 text-center text-base text-gray-500 dark:text-neutral-500">
                  {t('catalog.noServices')}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredServices.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() =>
                        onNavigate(
                          'service-detail',
                          serviceDetailPath(selectedCategoryData.id, service.id)
                        )
                      }
                      className="group border border-[var(--bm-border)] bg-[var(--bm-surface)] p-5 text-left transition-colors hover:border-orange-500/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-semibold text-gray-900 transition-colors group-hover:text-orange-600 dark:text-neutral-100 dark:group-hover:text-orange-400">
                          {service.name}
                        </h3>
                        <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400 transition-colors group-hover:text-orange-500" />
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
                        {service.description}
                      </p>
                      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-neutral-500">
                        {t('catalog.multiModel')}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-[1200px] px-4 pb-4 sm:px-6 lg:px-8">
          <div className="border border-[var(--bm-border)] bg-[var(--bm-surface)] px-6 py-12 text-center sm:px-10">
            <SectionLabel>{t('catalog.ctaLabel')}</SectionLabel>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl">
              {t('catalog.ctaTitle')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-gray-600 dark:text-neutral-400">
              {t('catalog.ctaBody')}
            </p>
            <button
              type="button"
              onClick={() => onNavigate('pricing')}
              className="mt-8 inline-flex items-center gap-2 bg-orange-500 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
            >
              {t('catalog.viewPricing')}
              <ChevronRight className="h-4 w-4" />
            </button>
            <p className="mt-6 text-xs tracking-wide text-gray-500 dark:text-neutral-500">
              {t('catalog.trialNote')}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
