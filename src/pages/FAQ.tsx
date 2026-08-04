import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import BackButton from '../components/BackButton';
import PageHero from '../components/PageHero';
import { pageHeroUrl } from '../data/pageHeroes';
import SEO from '../components/SEO';
import ServiceCatalogReference from '../components/ServiceCatalogReference';
import { generateFAQSchema, injectStructuredData } from '../lib/structuredData';
import {
  humanDataModelCategory,
  serviceCategories,
  totalServiceCount,
} from '../data/services';
import { localizeCategory, localizeService } from '../lib/localizeServices';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

interface FAQEntry {
  id: string;
  question: string;
  answer: string;
}

interface FAQSection {
  id: string;
  title: string;
  items: FAQEntry[];
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-[var(--bm-border)] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-orange-600 dark:hover:text-orange-400"
        aria-expanded={isOpen}
      >
        <span className="text-base font-semibold text-gray-900 dark:text-neutral-100">
          {question}
        </span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-gray-500 transition-transform dark:text-neutral-400 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <p className="pb-5 pr-10 text-sm leading-relaxed whitespace-pre-line text-gray-600 dark:text-neutral-300">
          {answer}
        </p>
      )}
    </div>
  );
}

interface FAQProps {
  onNavigate: (page: string) => void;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
      {children}
    </p>
  );
}

export default function FAQ({ onNavigate }: FAQProps) {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
    }
    setOpenItems(newOpen);
  };

  const faqSections = useMemo<FAQSection[]>(() => {
    const raw = t('faq.sections', { returnObjects: true }) as unknown;
    const sections = Array.isArray(raw) ? (raw as FAQSection[]) : [];
    const localizedCategories = serviceCategories.map((category) => ({
      ...localizeCategory(t, category),
      services: category.services.map((service) =>
        localizeService(t, category.id, service),
      ),
    }));
    const localizedHumanDataModel = {
      ...localizeCategory(t, humanDataModelCategory),
      services: humanDataModelCategory.services.map((service) =>
        localizeService(t, humanDataModelCategory.id, service),
      ),
    };

    return sections.map((section) => {
      if (section.id !== 'categories') return section;

      const categoriesOrg: FAQEntry = {
        id: 'categories-org',
        question: t('faq.categoriesOrg.question'),
        answer:
          `${t('faq.categoriesOrg.answer', {
            categoryCount: serviceCategories.length,
            serviceCount: totalServiceCount(),
          })}\n\n` +
          localizedCategories
            .map((c) => `• ${c.name} (${c.services.length}): ${c.description}`)
            .join('\n'),
      };

      const humanDataModel: FAQEntry = {
        id: 'hdm-services',
        question: t('faq.hdmQuestion', { name: localizedHumanDataModel.name }),
        answer:
          `${localizedHumanDataModel.description}\n\n` +
          localizedHumanDataModel.services
            .map((s) => `• ${s.name}: ${s.description}`)
            .join('\n'),
      };

      const perCategory: FAQEntry[] = localizedCategories.map((category) => ({
        id: `cat-${category.id}`,
        question: t('faq.categoryQuestion', { name: category.name }),
        answer:
          `${category.description}\n\n` +
          category.services.map((s) => `• ${s.name}: ${s.description}`).join('\n'),
      }));

      return {
        ...section,
        items: [categoriesOrg, ...section.items, humanDataModel, ...perCategory],
      };
    });
  }, [t]);

  useEffect(() => {
    const allFaqs = faqSections.flatMap((section) =>
      section.items.map((item) => ({
        question: item.question,
        answer: item.answer,
      }))
    );
    const faqSchema = generateFAQSchema(allFaqs);
    injectStructuredData(faqSchema);
  }, [faqSections]);

  return (
    <div className="min-h-screen bg-page text-gray-900 transition-colors dark:text-neutral-100">
      <SEO
        title={t('faq.seoTitle')}
        description={t('faq.seoDescription')}
        keywords={[
          'biomath core faq',
          'health questions',
          'wellness service help',
          'health analytics faq',
          'common questions',
        ]}
        url="/faq"
      />

      <div className="pt-16">
        <PageHero
          imageSrc={pageHeroUrl('faq')}
          label={t('faq.label')}
          title={t('faq.heroTitle')}
          subtitle={t('faq.heroSubtitle')}
        />
      </div>

      <div className="pb-16">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <div className="pt-6">
            <BackButton onNavigate={onNavigate} />
          </div>

          {/* FAQ Sections */}
          <div className="divide-y divide-[var(--bm-border)]">
            {faqSections.map((section, sectionIndex) => (
              <section
                key={section.id}
                className="py-14 lg:py-16"
                aria-labelledby={`faq-section-${sectionIndex}`}
              >
                <p className="mb-2 text-[11px] font-semibold tracking-[0.28em] text-orange-600 dark:text-orange-400">
                  {String(sectionIndex + 1).padStart(2, '0')}
                </p>
                <h2
                  id={`faq-section-${sectionIndex}`}
                  className="mb-8 text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl"
                >
                  {section.title}
                </h2>
                <div className="rounded-xl border border-[var(--bm-border)] bg-surface px-5 sm:px-6">
                  {section.items.map((item) => (
                    <FAQItem
                      key={item.id}
                      question={item.question}
                      answer={item.answer}
                      isOpen={openItems.has(item.id)}
                      onToggle={() => toggleItem(item.id)}
                    />
                  ))}
                </div>
                {section.id === 'categories' && (
                  <div className="mt-10">
                    <ServiceCatalogReference
                      title={t('faq.catalogRef.title')}
                      subtitle={t('faq.catalogRef.subtitle')}
                      onOpenCategory={() => onNavigate('services-catalog')}
                      includeHumanDataModel
                    />
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Closing CTA */}
          <section className="border-t border-[var(--bm-border)] py-14 lg:py-16">
            <div className="rounded-xl border border-[var(--bm-border)] bg-surface px-6 py-12 text-center sm:px-10">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100 sm:text-3xl">
                {t('faq.cta.title')}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-gray-600 dark:text-neutral-300">
                {t('faq.cta.body')}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="bm-cta-primary mt-8"
              >
                {t('faq.cta.button')}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
