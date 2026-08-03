/** Hotspot grid aligned to the anatomical WebP silhouette (head → feet). */
export const COLS = 5;
export const ROWS = 11;
export const RADIUS = 18;

export interface BodyCube {
  c: number;
  r: number;
  left: number;
  top: number;
  sizeW: number;
  sizeH: number;
}

/**
 * Equal cells; L/R symmetric.
 * Positions tuned to the smooth anatomical WebP contour
 * (egg head, neck, sloping shoulders, waist taper, hip flare, thicker limbs).
 */
export const BODY_CUBES: BodyCube[] = [
  // Head / neck
  { c: 2, r: 0, left: 42.2, top: 3.4, sizeW: 15.6, sizeH: 7.2 },
  { c: 2, r: 1, left: 42.2, top: 10.4, sizeW: 15.6, sizeH: 7.2 },
  // Shoulders / upper chest
  { c: 1, r: 2, left: 29.0, top: 18.4, sizeW: 15.6, sizeH: 7.2 },
  { c: 2, r: 2, left: 42.2, top: 18.4, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 2, left: 55.4, top: 18.4, sizeW: 15.6, sizeH: 7.2 },
  // Mid chest
  { c: 1, r: 3, left: 29.0, top: 26.4, sizeW: 15.6, sizeH: 7.2 },
  { c: 2, r: 3, left: 42.2, top: 26.4, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 3, left: 55.4, top: 26.4, sizeW: 15.6, sizeH: 7.2 },
  // Arms + torso
  { c: 0, r: 4, left: 15.3, top: 34.4, sizeW: 15.6, sizeH: 7.2 },
  { c: 1, r: 4, left: 29.0, top: 34.4, sizeW: 15.6, sizeH: 7.2 },
  { c: 2, r: 4, left: 42.2, top: 34.4, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 4, left: 55.4, top: 34.4, sizeW: 15.6, sizeH: 7.2 },
  { c: 4, r: 4, left: 69.0, top: 34.4, sizeW: 15.6, sizeH: 7.2 },
  { c: 0, r: 5, left: 14.4, top: 42.4, sizeW: 15.6, sizeH: 7.2 },
  { c: 1, r: 5, left: 29.0, top: 42.4, sizeW: 15.6, sizeH: 7.2 },
  { c: 2, r: 5, left: 42.2, top: 42.4, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 5, left: 55.4, top: 42.4, sizeW: 15.6, sizeH: 7.2 },
  { c: 4, r: 5, left: 69.9, top: 42.4, sizeW: 15.6, sizeH: 7.2 },
  // Waist / pelvis
  { c: 1, r: 6, left: 30.6, top: 50.8, sizeW: 15.6, sizeH: 7.2 },
  { c: 2, r: 6, left: 42.2, top: 50.8, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 6, left: 53.8, top: 50.8, sizeW: 15.6, sizeH: 7.2 },
  // Thighs
  { c: 1, r: 7, left: 31.4, top: 59.2, sizeW: 15.6, sizeH: 7.2 },
  { c: 2, r: 7, left: 42.2, top: 59.2, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 7, left: 53.0, top: 59.2, sizeW: 15.6, sizeH: 7.2 },
  { c: 1, r: 8, left: 31.4, top: 67.6, sizeW: 15.6, sizeH: 7.2 },
  { c: 2, r: 8, left: 42.2, top: 67.6, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 8, left: 53.0, top: 67.6, sizeW: 15.6, sizeH: 7.2 },
  // Lower legs / feet
  { c: 1, r: 9, left: 30.4, top: 76.4, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 9, left: 53.9, top: 76.4, sizeW: 15.6, sizeH: 7.2 },
  { c: 1, r: 10, left: 30.4, top: 85.6, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 10, left: 53.9, top: 85.6, sizeW: 15.6, sizeH: 7.2 },
];
