import HumanSilhouette from './HumanSilhouette';
import HumanDataModelCoreTools from './HumanDataModelCoreTools';

interface Props {
  dark: boolean;
  onNavigate?: (page: string, data?: string) => void;
}

/**
 * Home Human Data Model.
 * Silhouette categories → Complete Services Catalog.
 * Core HDM tools (import / timeline / what changed) sit under the figure — not in the service grid.
 */
export default function HumanDataModel({ dark, onNavigate }: Props) {
  return (
    <div className="relative flex w-full flex-col items-center gap-10 px-2 sm:px-6">
      <HumanSilhouette
        dark={dark}
        onSelectCategory={(categoryId) => onNavigate?.('services-catalog', categoryId)}
      />
      <HumanDataModelCoreTools
        dark={dark}
        onOpenTool={(servicePath) => onNavigate?.('service-detail', servicePath)}
      />
    </div>
  );
}
