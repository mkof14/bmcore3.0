import ServiceCatalogReference from '../ServiceCatalogReference';
import { serviceCategories, totalServiceCount } from '../../data/services';

/**
 * Read-only admin view of the live health services catalog (from services.ts).
 */
export default function ServicesCatalogAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Catalog</p>
        <h2 className="mt-1 text-2xl font-semibold text-gray-900">Services & descriptions</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
          Source of truth: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">src/data/services.ts</code>.
          {' '}
          {serviceCategories.length} medical categories · {totalServiceCount()} services (including Human Data Model tools).
          Edit the data file to update FAQ, Learning Center, Member Zone, and public catalog together.
        </p>
      </div>

      <ServiceCatalogReference
        title="Full service inventory"
        subtitle="Every category and service description currently shipped in the product."
        includeHumanDataModel
      />
    </div>
  );
}
