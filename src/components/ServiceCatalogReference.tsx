import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import {
  humanDataModelCategory,
  serviceCategories,
  totalServiceCount,
  type ServiceCategory,
} from '../data/services';
import { categoryAccent } from '../data/categoryTheme';
import { localizeCategory, localizeService } from '../lib/localizeServices';

type Props = {
  /** Optional navigate to catalog / category */
  onOpenCategory?: (categoryId: string) => void;
  /** Compact header copy for Admin vs Learning Center */
  title?: string;
  subtitle?: string;
  includeHumanDataModel?: boolean;
};

function matchesQuery(category: ServiceCategory, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (category.name.toLowerCase().includes(q) || category.description.toLowerCase().includes(q)) {
    return true;
  }
  return category.services.some(
    (service) =>
      service.name.toLowerCase().includes(q) || service.description.toLowerCase().includes(q),
  );
}

export default function ServiceCatalogReference({
  onOpenCategory,
  title,
  subtitle,
  includeHumanDataModel = true,
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const catalog = useMemo(() => {
    const base = includeHumanDataModel
      ? [...serviceCategories, humanDataModelCategory]
      : serviceCategories;
    return base
      .map((category) => ({
        ...localizeCategory(t, category),
        services: category.services.map((service) =>
          localizeService(t, category.id, service),
        ),
      }))
      .filter((category) => matchesQuery(category, query.trim()));
  }, [includeHumanDataModel, query, t]);

  const resolvedTitle = title ?? t('catalogReference.defaultTitle');
  const defaultSubtitle = t('catalogReference.defaultSubtitle', {
    categories: serviceCategories.length,
    count: totalServiceCount(),
  });

  return (
    <div className="rounded-xl border border-[var(--bm-border)] bg-surface">
      <div className="border-b border-[var(--bm-border)] px-5 py-4 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-600 dark:text-orange-400">
          {t('catalogReference.label')}
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-gray-900 dark:text-neutral-100">
          {resolvedTitle}
        </h3>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-neutral-300">
          {subtitle ?? defaultSubtitle}
        </p>
        <div className="relative mt-4 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-neutral-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('catalogReference.searchPlaceholder')}
            className="w-full border border-[var(--bm-border)] bg-page py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-orange-500/50 focus:outline-none dark:text-neutral-100 dark:placeholder:text-neutral-400"
          />
        </div>
      </div>

      <div className="divide-y divide-[var(--bm-border)]">
        {catalog.length === 0 && (
          <p className="px-5 py-8 text-sm text-gray-600 dark:text-neutral-400 sm:px-6">
            {t('catalogReference.empty')}
          </p>
        )}

        {catalog.map((category) => {
          const open = openId === category.id;
          const accent = categoryAccent(category.id);
          const q = query.trim().toLowerCase();
          const services = q
            ? category.services.filter(
                (service) =>
                  service.name.toLowerCase().includes(q) ||
                  service.description.toLowerCase().includes(q) ||
                  category.name.toLowerCase().includes(q),
              )
            : category.services;

          return (
            <div key={category.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : category.id)}
                className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-page/80 sm:px-6"
              >
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: accent }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span
                      className="text-base font-semibold tracking-tight"
                      style={{ color: accent }}
                    >
                      {category.name}
                    </span>
                    <span className="text-xs tabular-nums text-gray-500 dark:text-neutral-400">
                      {t('catalogReference.servicesCount', { count: category.services.length })}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-neutral-300">
                    {category.description}
                  </span>
                </span>
                {open ? (
                  <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-gray-500 dark:text-neutral-400" />
                ) : (
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-500 dark:text-neutral-400" />
                )}
              </button>

              {open && (
                <div className="border-t border-[var(--bm-border)] bg-page px-5 py-3 sm:px-6">
                  <ul className="space-y-3">
                    {services.map((service) => (
                      <li key={service.id} className="border-l-2 pl-3" style={{ borderColor: `${accent}66` }}>
                        <p className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
                          {service.name}
                        </p>
                        <p className="mt-0.5 text-sm leading-relaxed text-gray-600 dark:text-neutral-300">
                          {service.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                  {onOpenCategory && (
                    <button
                      type="button"
                      onClick={() => onOpenCategory(category.id)}
                      className="mt-4 text-sm font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400"
                    >
                      {t('catalogReference.openCatalog')}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
