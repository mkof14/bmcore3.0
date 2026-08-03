import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { categoryAccent } from '../../../data/categoryTheme';
import {
  categoryServiceCount,
  getServiceCategory,
} from '../../../data/services';
import {
  BODY_CUBES,
  CATEGORY_AT,
  CATEGORY_META,
  RADIUS,
} from './geometry';
import { categoryIcon } from './icons';
import {
  HUMAN_ASPECT,
  HUMAN_H,
  HUMAN_W,
  type HumanFigure,
  humanSrcs,
  readStoredHumanFigure,
  storeHumanFigure,
} from './humanAsset';
import { localizeCategory } from '../../../lib/localizeServices';

interface Props {
  dark: boolean;
  onSelectCategory: (id: string) => void;
}

const FIGURE_CACHE = 'v=18';

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Hotspot size relative to the body-cube grid cell.
 * Keep well below 1 so the WebP silhouette (head/torso/limbs) stays the readable figure.
 */
const SCALE = 0.72;

/** Catalog order 01–10 left, 11–20 right. */
const LEFT_IDS = [
  'critical-health',
  'everyday-wellness',
  'longevity',
  'mental-wellness',
  'fitness-performance',
  'womens-health',
  'mens-health',
  'beauty-skincare',
  'nutrition-diet',
  'sleep-recovery',
] as const;

const RIGHT_IDS = [
  'environmental-health',
  'family-health',
  'preventive-medicine',
  'biohacking',
  'senior-care',
  'eye-health',
  'digital-therapeutics',
  'general-sexual',
  'mens-sexual-health',
  'womens-sexual-health',
] as const;

type SideItem = {
  id: string;
  name: string;
  color: string;
  number: number;
  serviceCount: number;
};

function sideItems(t: TFunction, ids: readonly string[]): SideItem[] {
  return ids.map((id) => {
    const cat = getServiceCategory(id);
    const meta = CATEGORY_META[id];
    return {
      id,
      name: cat ? localizeCategory(t, cat).name : id,
      color: categoryAccent(id),
      number: meta?.number ?? 0,
      serviceCount: categoryServiceCount(id),
    };
  });
}

function CategoryColumn({
  items,
  align,
  dark,
  hovered,
  onHover,
  onSelect,
}: {
  items: SideItem[];
  align: 'left' | 'right';
  dark: boolean;
  hovered: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const restColor = dark ? '#E2E8F0' : '#0F172A';
  const muteColor = dark ? 'rgba(226,232,240,0.55)' : 'rgba(15,23,42,0.48)';
  const towardFigure = align === 'left' ? 'border-r' : 'border-l';

  return (
    <nav
      className={`flex w-[min(40vw,300px)] shrink-0 flex-col justify-center gap-3 sm:w-[320px] sm:gap-3.5 lg:w-[360px] lg:gap-4 ${
        align === 'right' ? 'items-start text-left' : 'items-end text-right'
      }`}
      aria-label={align === 'left' ? 'Categories left' : 'Categories right'}
    >
      {items.map((item) => {
        const isHot = hovered === item.id;
        const Icon = categoryIcon(item.id);
        const rowDir = align === 'left' ? 'flex-row-reverse' : 'flex-row';
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            onMouseEnter={() => onHover(item.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(item.id)}
            onBlur={() => onHover(null)}
            className={`group relative max-w-full ${towardFigure} px-3 py-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 sm:px-3.5 sm:py-2.5 ${rowDir} flex items-center gap-3`}
            style={{
              color: isHot ? item.color : restColor,
              opacity: hovered && !isHot ? 0.38 : 1,
              transform: isHot ? 'scale(1.04) translateY(-1px)' : 'scale(1)',
              transformOrigin: align === 'left' ? 'right center' : 'left center',
              borderColor: isHot ? item.color : dark ? 'rgba(226,232,240,0.14)' : 'rgba(15,23,42,0.12)',
              background: isHot
                ? `linear-gradient(${align === 'left' ? '270deg' : '90deg'}, ${hexToRgba(item.color, dark ? 0.2 : 0.12)} 0%, transparent 92%)`
                : 'transparent',
            }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center transition-all duration-200 sm:h-11 sm:w-11"
              style={{
                color: isHot ? item.color : restColor,
                backgroundColor: isHot
                  ? hexToRgba(item.color, dark ? 0.28 : 0.16)
                  : dark
                    ? 'rgba(226,232,240,0.1)'
                    : 'rgba(15,23,42,0.06)',
                boxShadow: isHot ? `inset 0 0 0 1px ${hexToRgba(item.color, 0.55)}` : 'none',
              }}
            >
              <Icon className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={isHot ? 2.35 : 1.9} />
            </span>
            <span className="min-w-0 flex-1">
              <span
                className="block font-semibold uppercase tabular-nums tracking-[0.22em]"
                style={{
                  fontSize: '0.72rem',
                  color: isHot ? item.color : muteColor,
                  letterSpacing: isHot ? '0.28em' : '0.22em',
                  transition: 'color 200ms ease, letter-spacing 200ms ease',
                }}
              >
                {String(item.number).padStart(2, '0')}
              </span>
              <span
                className="mt-0.5 block font-semibold leading-[1.2] tracking-tight sm:leading-[1.15]"
                style={{
                  fontSize: isHot ? 'clamp(1.05rem, 1.05vw + 0.55rem, 1.4rem)' : 'clamp(0.98rem, 0.9vw + 0.55rem, 1.28rem)',
                  transition: 'font-size 200ms ease, color 200ms ease',
                }}
              >
                {item.name}
              </span>
              <span
                className="mt-1 block font-medium tabular-nums tracking-wide"
                style={{
                  fontSize: '0.78rem',
                  color: isHot ? item.color : muteColor,
                  opacity: isHot ? 0.95 : 0.85,
                  transition: 'color 200ms ease, opacity 200ms ease',
                }}
              >
                {item.serviceCount} {item.serviceCount === 1 ? 'service' : 'services'}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function FigureToggle({
  figure,
  onChange,
  dark,
}: {
  figure: HumanFigure;
  onChange: (next: HumanFigure) => void;
  dark: boolean;
}) {
  const { t } = useTranslation();
  const options: { id: HumanFigure; label: string }[] = [
    { id: 'female', label: t('home.figure.female') },
    { id: 'male', label: t('home.figure.male') },
  ];

  return (
    <div
      role="group"
      aria-label={t('home.figure.toggleLabel')}
      className="inline-flex items-center rounded-md p-0.5"
      style={{
        background: dark ? 'rgba(226,232,240,0.08)' : 'rgba(15,23,42,0.06)',
        border: dark ? '1px solid rgba(226,232,240,0.14)' : '1px solid rgba(15,23,42,0.1)',
      }}
    >
      {options.map((opt) => {
        const active = figure === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.id)}
            className="rounded px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70"
            style={{
              color: active
                ? dark
                  ? '#F8FAFC'
                  : '#0F172A'
                : dark
                  ? 'rgba(226,232,240,0.55)'
                  : 'rgba(15,23,42,0.45)',
              background: active
                ? dark
                  ? 'rgba(148,163,184,0.22)'
                  : 'rgba(255,255,255,0.92)'
                : 'transparent',
              boxShadow: active
                ? dark
                  ? 'inset 0 0 0 1px rgba(226,232,240,0.18)'
                  : '0 1px 2px rgba(15,23,42,0.08)'
                : 'none',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Photorealistic standing human (WebP) with math data-viz as overlay treatment.
 * Category cubes are translucent hotspots on body landmarks — not the figure itself.
 */
export default function HumanSilhouette({ dark, onSelectCategory }: Props) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<string | null>(null);
  const [figure, setFigure] = useState<HumanFigure>('female');

  useEffect(() => {
    setFigure(readStoredHumanFigure());
  }, []);

  const setFigurePersist = (next: HumanFigure) => {
    setFigure(next);
    storeHumanFigure(next);
  };

  const srcs = humanSrcs(figure);
  const primarySrc = dark ? srcs.dark : srcs.light;
  const src480 = dark ? srcs.dark480 : srcs.light480;

  const baseW = BODY_CUBES[0]?.sizeW ?? 16;
  const baseH = BODY_CUBES[0]?.sizeH ?? 7.3;
  const sizeW = baseW * SCALE;
  const sizeH = baseH * SCALE;

  const leftCategories = useMemo(() => sideItems(t, LEFT_IDS), [t]);
  const rightCategories = useMemo(() => sideItems(t, RIGHT_IDS), [t]);

  const primaryByCell = useMemo(() => {
    const map = new Map<string, string>();
    for (const [id, pos] of Object.entries(CATEGORY_AT)) {
      map.set(`${pos.c}:${pos.r}`, id);
    }
    return map;
  }, []);

  const cubes = useMemo(() => {
    return BODY_CUBES.flatMap((cell) => {
      const key = `${cell.c}:${cell.r}`;
      const primaryId = primaryByCell.get(key);
      if (!primaryId) return [];
      const cat = getServiceCategory(primaryId);
      const meta = CATEGORY_META[primaryId];
      const color = categoryAccent(primaryId);
      return [
        {
          key,
          categoryId: primaryId,
          name: cat ? localizeCategory(t, cat).name : primaryId,
          serviceCount: categoryServiceCount(primaryId),
          left: cell.left + (baseW - sizeW) / 2,
          top: cell.top + (baseH - sizeH) / 2,
          color,
          number: meta?.number ?? 0,
        },
      ];
    });
  }, [primaryByCell, baseW, baseH, sizeW, sizeH, t]);

  return (
    <div className="relative mx-auto flex w-full max-w-[1480px] items-stretch justify-center gap-4 px-2 sm:gap-8 sm:px-4 lg:gap-12">
      <CategoryColumn
        items={leftCategories}
        align="left"
        dark={dark}
        hovered={hovered}
        onHover={setHovered}
        onSelect={onSelectCategory}
      />

      <div
        className="relative shrink-0"
        style={{
          height: 'min(90vh, 1232px)',
          aspectRatio: HUMAN_ASPECT,
          maxWidth: 'min(52vw, 728px)',
          width: 'auto',
        }}
      >
        <div className="absolute left-1/2 top-1 z-30 -translate-x-1/2">
          <FigureToggle figure={figure} onChange={setFigurePersist} dark={dark} />
        </div>

        <div
          className="relative h-full w-full"
          role="img"
          aria-label={`${t('home.modelTitle')} — ${
            figure === 'female' ? t('home.figure.female') : t('home.figure.male')
          }`}
        >
        <div
          className="pointer-events-none absolute inset-[1%] rounded-[40%] blur-3xl"
          style={{
            opacity: dark ? 0.35 : 0.18,
            background: dark
              ? 'radial-gradient(ellipse at 50% 35%, rgba(120, 145, 175, 0.28), transparent 70%)'
              : 'radial-gradient(ellipse at 50% 35%, rgba(180, 170, 150, 0.28), transparent 70%)',
          }}
          aria-hidden
        />

        <img
          key={`${figure}-${dark ? 'dark' : 'light'}`}
          src={`${primarySrc}?${FIGURE_CACHE}`}
          srcSet={`${src480}?${FIGURE_CACHE} 480w, ${primarySrc}?${FIGURE_CACHE} 800w`}
          sizes="(max-width: 640px) 48vw, min(52vw, 728px)"
          alt=""
          width={HUMAN_W}
          height={HUMAN_H}
          fetchPriority="high"
          decoding="async"
          className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain select-none transition-[filter,opacity] duration-200 ease-out"
          style={{
            filter: dark
              ? 'brightness(1.04) contrast(1.05)'
              : 'brightness(1.02) contrast(1.04)',
          }}
          draggable={false}
          aria-hidden
        />

        {/* Soft clinical wash — keeps limbs readable under hotspots without neon cast */}
        <div
          className="pointer-events-none absolute inset-0 z-[11]"
          style={{
            background: dark
              ? 'radial-gradient(ellipse 42% 70% at 50% 42%, rgba(148,163,184,0.06), transparent 72%)'
              : 'radial-gradient(ellipse 42% 70% at 50% 42%, rgba(71,85,105,0.05), transparent 72%)',
          }}
          aria-hidden
        />

        <div className="absolute inset-0 z-20" style={{ perspective: 900 }}>
          {cubes.map((cube) => {
            const hoverKey = cube.categoryId;
            const isHot = hovered === hoverKey;
            const critical = cube.categoryId === 'critical-health';
            const dimOthers = Boolean(hovered && !isHot);

            return (
              <button
                key={cube.key}
                type="button"
                onClick={() => onSelectCategory(cube.categoryId)}
                onMouseEnter={() => setHovered(hoverKey)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(hoverKey)}
                onBlur={() => setHovered(null)}
                className="absolute focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                style={{
                  left: `${cube.left}%`,
                  top: `${cube.top}%`,
                  width: `${sizeW}%`,
                  height: `${sizeH}%`,
                  borderRadius: Math.max(999, RADIUS * SCALE),
                  zIndex: isHot ? 50 : critical ? 28 : 24,
                  opacity: dimOthers ? 0.22 : 1,
                  transform: isHot
                    ? 'scale(1.35) translateZ(28px)'
                    : 'scale(1) translateZ(0)',
                  transition:
                    'transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms ease, background-color 220ms ease, border-color 220ms ease, opacity 180ms ease',
                  backgroundColor: isHot
                    ? hexToRgba(cube.color, dark ? 0.55 : 0.5)
                    : dark
                      ? 'rgba(226,232,240,0.06)'
                      : 'rgba(15,23,42,0.05)',
                  border: isHot
                    ? `2px solid ${cube.color}`
                    : dark
                      ? '1.5px solid rgba(226,232,240,0.28)'
                      : '1.5px solid rgba(71,85,105,0.32)',
                  boxShadow: isHot
                    ? `0 12px 28px rgba(0,0,0,0.4), 0 0 20px ${cube.color}77`
                    : critical
                      ? dark
                        ? '0 0 0 1px rgba(248,250,252,0.35), 0 0 12px rgba(56,189,248,0.25)'
                        : '0 0 0 1px rgba(15,23,42,0.2), 0 0 10px rgba(14,165,233,0.18)'
                      : 'none',
                  cursor: 'pointer',
                }}
                aria-label={`${cube.name}, ${cube.serviceCount} services`}
                title={`${cube.name} · ${cube.serviceCount} services`}
              >
                <span
                  className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center font-semibold tabular-nums"
                  style={{
                    color: isHot
                      ? '#F8FAFC'
                      : dark
                        ? 'rgba(226,232,240,0.55)'
                        : 'rgba(51,65,85,0.55)',
                    textShadow: isHot ? '0 1px 8px rgba(0,0,0,0.55)' : undefined,
                    transition: 'color 220ms ease, opacity 180ms ease',
                    opacity: isHot ? 1 : 0.75,
                  }}
                >
                  <span style={{ fontSize: isHot ? '0.95rem' : '0.72rem', lineHeight: 1 }}>
                    {cube.serviceCount}
                  </span>
                  <span
                    style={{
                      marginTop: 1,
                      fontSize: '0.45rem',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      opacity: isHot ? 0.95 : 0.5,
                    }}
                  >
                    svc
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        </div>
      </div>

      <CategoryColumn
        items={rightCategories}
        align="right"
        dark={dark}
        hovered={hovered}
        onHover={setHovered}
        onSelect={onSelectCategory}
      />
    </div>
  );
}
