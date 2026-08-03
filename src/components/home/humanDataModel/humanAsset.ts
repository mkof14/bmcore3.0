/**
 * Photorealistic standing human cutout with math data-viz overlay — WebP + alpha (LCP).
 *
 * Paths are frozen production assets under public/. Canonical locked copies live in
 * scripts/hdm-locked/ — see docs/ops/hdm-figures.md. Do not point these at temp outputs.
 */

export type HumanFigure = 'female' | 'male';

export const HUMAN_FIGURE_STORAGE_KEY = 'bm.hdm.figure';

type FigureSrcs = {
  dark: string;
  light: string;
  dark480: string;
  light480: string;
};

/** Frozen public URLs (must match scripts/hdm-locked/ masters). */
const FIGURE_SRCS: Record<HumanFigure, FigureSrcs> = {
  female: {
    dark: '/hdm-human-female.webp',
    light: '/hdm-human-female-light.webp',
    dark480: '/hdm-human-female-480.webp',
    light480: '/hdm-human-female-light-480.webp',
  },
  male: {
    dark: '/hdm-human-male.webp',
    light: '/hdm-human-male-light.webp',
    dark480: '/hdm-human-male-480.webp',
    light480: '/hdm-human-male-light-480.webp',
  },
};

export function humanSrcs(figure: HumanFigure): FigureSrcs {
  return FIGURE_SRCS[figure];
}

/** @deprecated use humanSrcs('female').dark — kept for any stray imports */
export const HUMAN_SRC_DARK = FIGURE_SRCS.female.dark;
/** @deprecated use humanSrcs('female').light */
export const HUMAN_SRC_LIGHT = FIGURE_SRCS.female.light;
/** @deprecated use humanSrcs('female').dark480 */
export const HUMAN_SRC_DARK_480 = FIGURE_SRCS.female.dark480;
/** @deprecated use humanSrcs('female').light480 */
export const HUMAN_SRC_LIGHT_480 = FIGURE_SRCS.female.light480;

/** @deprecated use HUMAN_SRC_DARK / HUMAN_SRC_LIGHT */
export const HUMAN_SRC = HUMAN_SRC_DARK;

/** Intrinsic size of primary WebP (800×1747); aspect matches original 916×2000. */
export const HUMAN_W = 800;
export const HUMAN_H = 1747;
export const HUMAN_ASPECT = '800 / 1747';

export function readStoredHumanFigure(): HumanFigure {
  try {
    const v = localStorage.getItem(HUMAN_FIGURE_STORAGE_KEY);
    if (v === 'male' || v === 'female') return v;
  } catch {
    /* ignore */
  }
  return 'female';
}

export function storeHumanFigure(figure: HumanFigure): void {
  try {
    localStorage.setItem(HUMAN_FIGURE_STORAGE_KEY, figure);
  } catch {
    /* ignore */
  }
}
