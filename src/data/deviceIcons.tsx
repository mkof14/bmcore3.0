import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BedDouble,
  Circle,
  CircleDot,
  Compass,
  Droplet,
  Droplets,
  Footprints,
  HeartPulse,
  Radio,
  Scale,
  Timer,
  Watch,
} from 'lucide-react';
import type { DeviceCatalogItemId } from './deviceCatalog';

export type DeviceIconAccent =
  | 'slate'
  | 'sky'
  | 'teal'
  | 'blue'
  | 'cyan'
  | 'orange'
  | 'amber'
  | 'rose'
  | 'emerald'
  | 'indigo';

export type DeviceIconMeta = {
  Icon: LucideIcon;
  accent: DeviceIconAccent;
};

/** Category-tinted wells — teal/orange/rose/etc, not purple-card AI defaults. */
export const deviceIconAccentClass: Record<
  DeviceIconAccent,
  { well: string; icon: string }
> = {
  slate: {
    well: 'bg-slate-500/10 ring-1 ring-inset ring-slate-500/20',
    icon: 'text-slate-700 dark:text-slate-300',
  },
  sky: {
    well: 'bg-sky-500/10 ring-1 ring-inset ring-sky-500/25',
    icon: 'text-sky-700 dark:text-sky-300',
  },
  teal: {
    well: 'bg-teal-500/10 ring-1 ring-inset ring-teal-500/25',
    icon: 'text-teal-700 dark:text-teal-300',
  },
  blue: {
    well: 'bg-blue-500/10 ring-1 ring-inset ring-blue-500/25',
    icon: 'text-blue-700 dark:text-blue-300',
  },
  cyan: {
    well: 'bg-cyan-500/10 ring-1 ring-inset ring-cyan-500/25',
    icon: 'text-cyan-700 dark:text-cyan-300',
  },
  orange: {
    well: 'bg-orange-500/10 ring-1 ring-inset ring-orange-500/25',
    icon: 'text-orange-700 dark:text-orange-300',
  },
  amber: {
    well: 'bg-amber-500/10 ring-1 ring-inset ring-amber-500/25',
    icon: 'text-amber-700 dark:text-amber-300',
  },
  rose: {
    well: 'bg-rose-500/10 ring-1 ring-inset ring-rose-500/25',
    icon: 'text-rose-700 dark:text-rose-300',
  },
  emerald: {
    well: 'bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/25',
    icon: 'text-emerald-700 dark:text-emerald-300',
  },
  indigo: {
    well: 'bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/25',
    icon: 'text-indigo-700 dark:text-indigo-300',
  },
};

/**
 * Per-device thematic icons (lucide). Watches share Watch with distinct accents;
 * rings use circle glyphs; CGM / BP / scale / sleep are category-true.
 */
export const deviceIcons: Record<DeviceCatalogItemId, DeviceIconMeta> = {
  apple_watch: { Icon: Watch, accent: 'slate' },
  samsung_galaxy_watch: { Icon: Watch, accent: 'sky' },
  garmin: { Icon: Compass, accent: 'teal' },
  google_pixel_watch: { Icon: Watch, accent: 'blue' },
  fitbit: { Icon: Footprints, accent: 'cyan' },
  polar: { Icon: Timer, accent: 'orange' },
  oura: { Icon: CircleDot, accent: 'amber' },
  ultrahuman: { Icon: Circle, accent: 'orange' },
  whoop: { Icon: Activity, accent: 'rose' },
  dexcom_g7: { Icon: Droplet, accent: 'teal' },
  freestyle_libre: { Icon: Droplets, accent: 'cyan' },
  omron: { Icon: HeartPulse, accent: 'rose' },
  withings_bpm: { Icon: HeartPulse, accent: 'rose' },
  withings_body: { Icon: Scale, accent: 'emerald' },
  eight_sleep: { Icon: BedDouble, accent: 'indigo' },
};

/** Fallback when a linked device_type is outside the static catalog. */
export const fallbackDeviceIcon: DeviceIconMeta = {
  Icon: Radio,
  accent: 'slate',
};

export function getDeviceIcon(itemId: string): DeviceIconMeta {
  if (itemId in deviceIcons) {
    return deviceIcons[itemId as DeviceCatalogItemId];
  }
  return fallbackDeviceIcon;
}

export function DeviceIconGlyph({
  itemId,
  size = 'md',
  className = '',
}: {
  itemId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const { Icon, accent } = getDeviceIcon(itemId);
  const tones = deviceIconAccentClass[accent];
  const box =
    size === 'sm' ? 'h-11 w-11 rounded-xl' : size === 'lg' ? 'h-16 w-16 rounded-2xl' : 'h-14 w-14 rounded-2xl';
  const glyph = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-8 w-8' : 'h-7 w-7';

  return (
    <div
      className={`inline-flex items-center justify-center ${box} ${tones.well} ${className}`}
      aria-hidden
    >
      <Icon className={`${glyph} stroke-[1.75] ${tones.icon}`} />
    </div>
  );
}
