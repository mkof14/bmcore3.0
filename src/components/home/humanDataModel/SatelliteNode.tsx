import {
  Pill,
  Dna,
  Microscope,
  ClipboardPlus,
  Heart,
  Activity,
  Watch,
  type LucideIcon,
} from 'lucide-react';
import type { Satellite } from './geometry';

const ICONS: Record<Satellite['icon'], LucideIcon> = {
  pill: Pill,
  dna: Dna,
  microscope: Microscope,
  clipboard: ClipboardPlus,
  heart: Heart,
  ecg: Activity,
  watch: Watch,
};

export default function SatelliteNode({ item, dark }: { item: Satellite; dark: boolean }) {
  const Icon = ICONS[item.icon];
  const bg = item.dark ? '#0F172A' : dark ? '#1F2937' : '#FFFFFF';
  const fg = item.accent ?? (item.dark ? '#F8FAFC' : dark ? '#E5E7EB' : '#1F2937');

  return (
    <div
      className="pointer-events-none absolute z-10 hidden sm:block"
      style={{
        top: `${item.top}%`,
        ...(item.side === 'left'
          ? { right: `calc(100% + ${item.gap}px)` }
          : { left: `calc(100% + ${item.gap}px)` }),
        transform: 'translateY(-50%)',
      }}
      title={item.label}
      aria-hidden
    >
      <div
        className="absolute top-1/2 h-px w-10 -translate-y-1/2 border-t border-dashed"
        style={{
          borderColor: dark ? 'rgba(148,163,184,0.4)' : 'rgba(148,163,184,0.65)',
          ...(item.side === 'left'
            ? { left: '100%', marginLeft: 4 }
            : { right: '100%', marginRight: 4 }),
        }}
      />
      <div
        className="flex h-12 w-12 items-center justify-center rounded-[14px] shadow-lg"
        style={{
          backgroundColor: bg,
          color: fg,
          border: dark ? '1px solid rgba(148,163,184,0.25)' : '1px solid #E5E7EB',
        }}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
    </div>
  );
}
