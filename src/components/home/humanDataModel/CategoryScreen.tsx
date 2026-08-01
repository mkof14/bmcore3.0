import { ArrowLeft, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { categoryAccent } from '../../../data/categoryTheme';
import type { ServiceCategory } from '../../../data/services';
import { serviceDetailPath } from '../../../data/services';
import { CATEGORY_META } from './geometry';
import { categoryIcon, serviceIcon } from './icons';
import { localizeCategory, localizeService } from '../../../lib/localizeServices';

interface Props {
  category: ServiceCategory;
  dark: boolean;
  onBack: () => void;
  onSelectService?: (servicePath: string) => void;
}

/** Category → services cubes (right screen of BioMath mock). */
export default function CategoryScreen({
  category,
  dark,
  onBack,
  onSelectService,
}: Props) {
  const { t } = useTranslation();
  const localizedCategory = localizeCategory(t, category);
  const meta = CATEGORY_META[category.id] ?? { number: 0, color: categoryAccent(category.id) };
  const CatIcon = categoryIcon(category.id);
  const accent = categoryAccent(category.id);
  const serviceCount = category.services.length;

  return (
    <div className="mx-auto w-full max-w-5xl px-2">
      <button
        type="button"
        onClick={onBack}
        className={`mb-8 inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-70 ${
          dark ? 'text-neutral-300' : 'text-neutral-700'
        }`}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Back to Human Data Model
      </button>

      <div
        className="relative mb-8 overflow-hidden rounded-2xl px-6 py-7 sm:px-8 sm:py-8"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, #0f172a 125%)`,
          color: '#FFF8F5',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0 18px, rgba(255,255,255,0.08) 18px 19px), repeating-linear-gradient(0deg, transparent 0 18px, rgba(255,255,255,0.08) 18px 19px)',
          }}
        />
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold tracking-wide opacity-90">
              {String(meta.number).padStart(2, '0')} {localizedCategory.name}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-base">
              {localizedCategory.description}
            </p>
            <p className="mt-4 text-sm font-semibold text-white/95">
              {serviceCount} {serviceCount === 1 ? 'service' : 'services'} available
            </p>
          </div>
          <CatIcon className="h-16 w-16 shrink-0 opacity-95 sm:h-20 sm:w-20" strokeWidth={1.5} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {category.services.map((service, index) => {
          const localizedService = localizeService(t, category.id, service);
          const Icon = serviceIcon(service.id);
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelectService?.(serviceDetailPath(category.id, service.id))}
              className={`flex aspect-square flex-col items-center justify-between rounded-2xl border p-3 text-center transition hover:-translate-y-0.5 hover:shadow-md ${
                dark
                  ? 'border-neutral-700 bg-neutral-900 text-neutral-100'
                  : 'border-neutral-200 bg-white text-neutral-900'
              }`}
              title={localizedService.description}
            >
              <span className="self-start text-xs font-semibold" style={{ color: accent }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <Icon className="h-7 w-7" style={{ color: accent }} strokeWidth={1.6} />
              <span className="line-clamp-2 text-[11px] font-medium leading-tight sm:text-xs">
                {localizedService.name}
              </span>
            </button>
          );
        })}
      </div>

      <p
        className={`mt-10 flex items-center justify-center gap-2 text-xs ${
          dark ? 'text-neutral-500' : 'text-neutral-400'
        }`}
      >
        <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
        Your data. Your model. Your control.
      </p>
    </div>
  );
}
