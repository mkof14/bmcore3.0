/**
 * HUMAN DATA MODEL — T5 silhouette geometry.
 * Occupancy grid is the source of truth (anatomical modules with hands).
 */

import { categoryAccent } from '../../../data/categoryTheme';

export const VB_W = 280;
export const VB_H = 560;

/** Soft body wash path (glow under cubes) — full arms + hands + feet. */
export const HUMAN_PATH_USE = `
M 140 14
C 162 14 178 30 178 52
C 178 74 162 90 140 90
C 118 90 102 74 102 52
C 102 30 118 14 140 14 Z
M 126 94
C 132 104 148 104 154 94
L 170 110
C 204 120 232 144 242 182
L 254 236
C 258 254 244 266 224 260
L 204 252
L 200 300
C 196 318 176 328 156 318
L 146 312
L 144 240
C 140 208 128 190 114 180
L 114 300
L 126 420
L 132 500
L 150 540
C 154 550 146 556 134 556
L 118 556
C 110 556 106 550 110 540
L 126 500
L 120 420
L 116 346
L 112 420
L 106 500
L 122 540
C 126 550 122 556 114 556
L 98 556
C 86 556 78 550 82 540
L 100 500
L 106 420
L 118 300
L 118 180
C 104 190 92 208 88 240
L 86 312
L 76 318
C 56 328 36 318 32 300
L 28 252
L 8 260
C -12 266 -26 254 -22 236
L -10 182
C 0 144 28 120 62 110 Z
`.replace(/\s+/g, ' ').trim();

/**
 * Clean positive-only soft silhouette for SVG glow.
 */
export const SOFT_BODY_PATH = `
M 140 12
C 163 12 180 29 180 52
C 180 75 163 92 140 92
C 117 92 100 75 100 52
C 100 29 117 12 140 12 Z
M 128 96
C 133 105 147 105 152 96
L 166 110
C 198 120 224 142 234 178
L 246 228
C 250 244 238 254 222 250
L 204 244
L 200 286
C 196 300 180 308 164 300
L 154 294
L 152 236
C 148 206 138 190 126 182
L 126 290
L 136 408
L 142 486
L 158 528
C 162 536 154 542 142 542
L 126 542
C 118 542 114 536 118 528
L 132 486
L 126 408
L 122 336
L 118 408
L 112 486
L 126 528
C 130 536 126 542 118 542
L 102 542
C 90 542 82 536 86 528
L 102 486
L 108 408
L 118 290
L 118 182
C 106 190 96 206 92 236
L 90 294
L 80 300
C 64 308 48 300 44 286
L 40 244
L 24 250
C 8 254 0 244 4 228
L 16 178
C 26 142 52 120 84 110 Z
`.replace(/\s+/g, ' ').trim();

/** Larger equal cubes — occupancy from PNG alpha (see bodyCubes.ts). */
export { BODY_CUBES, COLS, RADIUS, ROWS, type BodyCube } from './bodyCubes';
import { BODY_CUBES } from './bodyCubes';

const BODY_SET = new Set(BODY_CUBES.map((b) => `${b.c}:${b.r}`));

export const CUBE = 64;
export const GAP = 6;

/** True only for cubes that sit on the opaque body. */
export function isBodyCell(c: number, r: number): boolean {
  return BODY_SET.has(`${c}:${r}`);
}


/** Map any body cell to nearest category (every cube clickable → 20 categories). */
export function categoryForCell(c: number, r: number): string {
  const exact = Object.entries(CATEGORY_AT).find(([, p]) => p.c === c && p.r === r);
  if (exact) return exact[0];

  let bestId = 'critical-health';
  let bestDist = Infinity;
  for (const [id, p] of Object.entries(CATEGORY_AT)) {
    const d = (p.c - c) ** 2 + (p.r - r) ** 2;
    if (d < bestDist) {
      bestDist = d;
      bestId = id;
    }
  }
  return bestId;
}

export function allBodyCells(): Array<{ c: number; r: number }> {
  return BODY_CUBES.map(({ c, r }) => ({ c, r }));
}

/** Sparse halo for puzzle rim — orthogonal neighbors only. */
export function isHaloCell(c: number, r: number): boolean {
  if (isBodyCell(c, r)) return false;
  return (
    isBodyCell(c, r - 1) ||
    isBodyCell(c, r + 1) ||
    isBodyCell(c - 1, r) ||
    isBodyCell(c + 1, r)
  );
}

/** Primary category anchors — 5-col large equal cubes, L/R symmetric. */
export const CATEGORY_AT: Record<string, { c: number; r: number }> = {
  'mental-wellness': { c: 2, r: 0 },
  'eye-health': { c: 2, r: 1 },
  'environmental-health': { c: 1, r: 2 },
  longevity: { c: 2, r: 2 },
  'beauty-skincare': { c: 3, r: 2 },
  'family-health': { c: 1, r: 3 },
  'everyday-wellness': { c: 3, r: 3 },
  biohacking: { c: 0, r: 4 },
  'preventive-medicine': { c: 1, r: 4 },
  'critical-health': { c: 2, r: 4 },
  'sleep-recovery': { c: 3, r: 4 },
  'fitness-performance': { c: 4, r: 4 },
  'senior-care': { c: 1, r: 5 },
  'nutrition-diet': { c: 2, r: 5 },
  'digital-therapeutics': { c: 2, r: 6 },
  'womens-health': { c: 1, r: 7 },
  'general-sexual': { c: 2, r: 7 },
  'mens-health': { c: 3, r: 7 },
  'mens-sexual-health': { c: 1, r: 9 },
  'womens-sexual-health': { c: 3, r: 9 },
};

export const CATEGORY_META: Record<string, { number: number; color: string }> = {
  'critical-health': { number: 1, color: categoryAccent('critical-health') },
  'everyday-wellness': { number: 2, color: categoryAccent('everyday-wellness') },
  longevity: { number: 3, color: categoryAccent('longevity') },
  'mental-wellness': { number: 4, color: categoryAccent('mental-wellness') },
  'fitness-performance': { number: 5, color: categoryAccent('fitness-performance') },
  'womens-health': { number: 6, color: categoryAccent('womens-health') },
  'mens-health': { number: 7, color: categoryAccent('mens-health') },
  'beauty-skincare': { number: 8, color: categoryAccent('beauty-skincare') },
  'nutrition-diet': { number: 9, color: categoryAccent('nutrition-diet') },
  'sleep-recovery': { number: 10, color: categoryAccent('sleep-recovery') },
  'environmental-health': { number: 11, color: categoryAccent('environmental-health') },
  'family-health': { number: 12, color: categoryAccent('family-health') },
  'preventive-medicine': { number: 13, color: categoryAccent('preventive-medicine') },
  biohacking: { number: 14, color: categoryAccent('biohacking') },
  'senior-care': { number: 15, color: categoryAccent('senior-care') },
  'eye-health': { number: 16, color: categoryAccent('eye-health') },
  'digital-therapeutics': { number: 17, color: categoryAccent('digital-therapeutics') },
  'general-sexual': { number: 18, color: categoryAccent('general-sexual') },
  'mens-sexual-health': { number: 19, color: categoryAccent('mens-sexual-health') },
  'womens-sexual-health': { number: 20, color: categoryAccent('womens-sexual-health') },
};

export interface Satellite {
  id: string;
  side: 'left' | 'right';
  top: number;
  gap: number;
  label: string;
  icon: 'pill' | 'dna' | 'microscope' | 'clipboard' | 'heart' | 'ecg' | 'watch';
  dark?: boolean;
  accent?: string;
}

export const SATELLITES: Satellite[] = [
  { id: 'pill', side: 'left', top: 22, gap: 22, label: 'Medications', icon: 'pill' },
  { id: 'dna', side: 'left', top: 42, gap: 34, label: 'Genetics', icon: 'dna' },
  { id: 'scope', side: 'left', top: 68, gap: 22, label: 'Labs', icon: 'microscope' },
  { id: 'clip', side: 'right', top: 14, gap: 18, label: 'Records', icon: 'clipboard' },
  { id: 'heart', side: 'right', top: 32, gap: 30, label: 'Cardio', icon: 'heart', dark: true, accent: '#FB7185' },
  { id: 'ecg', side: 'right', top: 48, gap: 18, label: 'Vitals', icon: 'ecg', dark: true, accent: '#22D3EE' },
  { id: 'watch', side: 'right', top: 70, gap: 30, label: 'Wearables', icon: 'watch' },
];
