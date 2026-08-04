import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';
import type { DeviceCatalogItemId } from '../data/deviceCatalog';
import { DeviceIconGlyph } from '../data/deviceIcons';

export type DeviceCardStatus = 'available' | 'connected' | 'notConnected';

type DeviceProductCardProps = {
  itemId: DeviceCatalogItemId;
  capabilities?: string[];
  realtime?: boolean;
  status: DeviceCardStatus;
  /** Optional primary action (Cabinet connect). Keep link-style chrome elsewhere. */
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  className?: string;
  /** Use denser member-zone typography tokens when true. */
  memberTone?: boolean;
};

const statusChipClass: Record<DeviceCardStatus, string> = {
  available:
    'bg-emerald-500/10 text-emerald-800 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-300',
  connected:
    'bg-sky-500/10 text-sky-800 ring-1 ring-inset ring-sky-500/20 dark:text-sky-300',
  notConnected:
    'bg-neutral-500/10 text-neutral-700 ring-1 ring-inset ring-neutral-500/15 dark:text-neutral-300',
};

export default function DeviceProductCard({
  itemId,
  capabilities = [],
  realtime = false,
  status,
  actionLabel,
  onAction,
  actionDisabled,
  className = '',
  memberTone = false,
}: DeviceProductCardProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const titleClass = memberTone
    ? 'member-heading text-base font-semibold'
    : 'text-base font-semibold text-gray-900 dark:text-neutral-100';
  const bodyClass = memberTone
    ? 'member-muted text-sm leading-relaxed'
    : 'text-sm leading-relaxed text-gray-600 dark:text-neutral-400';
  const detailClass = memberTone
    ? 'member-body text-sm leading-relaxed'
    : 'text-sm leading-relaxed text-gray-700 dark:text-neutral-300';

  return (
    <article
      className={`group overflow-hidden rounded-2xl border border-[var(--bm-border)] bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-400/40 hover:shadow-md ${className}`}
    >
      <div className="relative flex min-h-[7.5rem] items-center justify-center bg-page px-4 py-7">
        <DeviceIconGlyph
          itemId={itemId}
          size="lg"
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute start-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide ${statusChipClass[status]}`}
        >
          {t(`devicesPage.cardStatus.${status}`)}
        </span>
        {realtime && (
          <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-1 text-[11px] font-medium text-orange-800 ring-1 ring-inset ring-orange-500/20 dark:text-orange-300">
            <Zap className="h-3 w-3" />
            {t('devicesPage.realtime')}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <h4 className={titleClass}>{t(`devicesPage.items.${itemId}.name`)}</h4>
        <p className={`mt-1.5 ${bodyClass}`}>{t(`devicesPage.items.${itemId}.blurb`)}</p>

        {capabilities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {capabilities.slice(0, 5).map((cap) => (
              <span
                key={cap}
                className="rounded-md bg-page px-2 py-0.5 text-[11px] text-gray-600 dark:text-neutral-400"
              >
                {t(`devicesPage.capabilities.${cap}`)}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="bm-link inline-flex items-center gap-1 text-sm text-orange-700 dark:text-orange-300"
            aria-expanded={open}
          >
            {open ? t('devicesPage.card.hideGuide') : t('devicesPage.card.showGuide')}
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              disabled={actionDisabled}
              className="rounded-lg bg-orange-600 px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:cursor-default disabled:bg-neutral-400 disabled:opacity-70"
            >
              {actionLabel}
            </button>
          )}
        </div>

        {open && (
          <div className="mt-4 space-y-3 border-t border-[var(--bm-border)] pt-4 animate-fadeIn">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
                {t('devicesPage.card.howToConnect')}
              </p>
              <p className={detailClass}>{t(`devicesPage.items.${itemId}.connect`)}</p>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
                {t('devicesPage.card.whatSyncs')}
              </p>
              <p className={detailClass}>{t(`devicesPage.items.${itemId}.syncs`)}</p>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
                {t('devicesPage.card.tip')}
              </p>
              <p className={detailClass}>{t(`devicesPage.items.${itemId}.tip`)}</p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
