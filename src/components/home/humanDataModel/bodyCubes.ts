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
 * Horizontal span matches the filled human contour (arms wider mid-body, legs inward).
 */
export const BODY_CUBES: BodyCube[] = [
  // Head / neck
  { c: 2, r: 0, left: 42.2, top: 3.2, sizeW: 15.6, sizeH: 7.2 },
  { c: 2, r: 1, left: 42.2, top: 11.0, sizeW: 15.6, sizeH: 7.2 },
  // Shoulders / upper chest
  { c: 1, r: 2, left: 28.6, top: 19.0, sizeW: 15.6, sizeH: 7.2 },
  { c: 2, r: 2, left: 42.2, top: 19.0, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 2, left: 55.8, top: 19.0, sizeW: 15.6, sizeH: 7.2 },
  // Mid chest
  { c: 1, r: 3, left: 28.6, top: 27.0, sizeW: 15.6, sizeH: 7.2 },
  { c: 2, r: 3, left: 42.2, top: 27.0, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 3, left: 55.8, top: 27.0, sizeW: 15.6, sizeH: 7.2 },
  // Arms + torso
  { c: 0, r: 4, left: 14.8, top: 35.2, sizeW: 15.6, sizeH: 7.2 },
  { c: 1, r: 4, left: 28.6, top: 35.2, sizeW: 15.6, sizeH: 7.2 },
  { c: 2, r: 4, left: 42.2, top: 35.2, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 4, left: 55.8, top: 35.2, sizeW: 15.6, sizeH: 7.2 },
  { c: 4, r: 4, left: 69.6, top: 35.2, sizeW: 15.6, sizeH: 7.2 },
  { c: 0, r: 5, left: 13.2, top: 43.5, sizeW: 15.6, sizeH: 7.2 },
  { c: 1, r: 5, left: 28.6, top: 43.5, sizeW: 15.6, sizeH: 7.2 },
  { c: 2, r: 5, left: 42.2, top: 43.5, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 5, left: 55.8, top: 43.5, sizeW: 15.6, sizeH: 7.2 },
  { c: 4, r: 5, left: 71.2, top: 43.5, sizeW: 15.6, sizeH: 7.2 },
  // Waist / pelvis
  { c: 1, r: 6, left: 30.2, top: 52.0, sizeW: 15.6, sizeH: 7.2 },
  { c: 2, r: 6, left: 42.2, top: 52.0, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 6, left: 54.2, top: 52.0, sizeW: 15.6, sizeH: 7.2 },
  // Thighs
  { c: 1, r: 7, left: 31.4, top: 60.5, sizeW: 15.6, sizeH: 7.2 },
  { c: 2, r: 7, left: 42.2, top: 60.5, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 7, left: 53.0, top: 60.5, sizeW: 15.6, sizeH: 7.2 },
  { c: 1, r: 8, left: 32.0, top: 69.0, sizeW: 15.6, sizeH: 7.2 },
  { c: 2, r: 8, left: 42.2, top: 69.0, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 8, left: 52.4, top: 69.0, sizeW: 15.6, sizeH: 7.2 },
  // Lower legs / feet
  { c: 1, r: 9, left: 32.6, top: 78.0, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 9, left: 51.8, top: 78.0, sizeW: 15.6, sizeH: 7.2 },
  { c: 1, r: 10, left: 33.0, top: 87.0, sizeW: 15.6, sizeH: 7.2 },
  { c: 3, r: 10, left: 51.4, top: 87.0, sizeW: 15.6, sizeH: 7.2 },
];
