/** Hotspot grid aligned to the photorealistic WebP figure (head → feet).
 *  Pelvic dead-center (≈L40–52 / T52–68) has no cells — keep it clear of svc circles.
 */
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
 * Positions tuned to the photographic standing cutout
 * (real head/shoulders/waist/limbs — not an SVG cookie outline).
 */
export const BODY_CUBES: BodyCube[] = [
  // Head / neck
  { c: 2, r: 0, left: 42.8, top: 4.8, sizeW: 14.5, sizeH: 6.5 },
  { c: 2, r: 1, left: 42.8, top: 11.5, sizeW: 14.5, sizeH: 6.5 },
  // Shoulders / upper chest
  { c: 1, r: 2, left: 34.0, top: 18.5, sizeW: 14.5, sizeH: 6.5 },
  { c: 2, r: 2, left: 42.8, top: 18.5, sizeW: 14.5, sizeH: 6.5 },
  { c: 3, r: 2, left: 51.6, top: 18.5, sizeW: 14.5, sizeH: 6.5 },
  // Mid chest
  { c: 1, r: 3, left: 33.5, top: 27.0, sizeW: 14.5, sizeH: 6.5 },
  { c: 2, r: 3, left: 42.8, top: 27.0, sizeW: 14.5, sizeH: 6.5 },
  { c: 3, r: 3, left: 52.1, top: 27.0, sizeW: 14.5, sizeH: 6.5 },
  // Arms + torso
  { c: 0, r: 4, left: 18.5, top: 36.0, sizeW: 14.5, sizeH: 6.5 },
  { c: 1, r: 4, left: 32.5, top: 36.0, sizeW: 14.5, sizeH: 6.5 },
  { c: 2, r: 4, left: 42.8, top: 36.0, sizeW: 14.5, sizeH: 6.5 },
  { c: 3, r: 4, left: 53.0, top: 36.0, sizeW: 14.5, sizeH: 6.5 },
  { c: 4, r: 4, left: 67.0, top: 36.0, sizeW: 14.5, sizeH: 6.5 },
  { c: 0, r: 5, left: 19.0, top: 44.0, sizeW: 14.5, sizeH: 6.5 },
  { c: 1, r: 5, left: 32.8, top: 44.0, sizeW: 14.5, sizeH: 6.5 },
  { c: 2, r: 5, left: 42.8, top: 44.0, sizeW: 14.5, sizeH: 6.5 },
  { c: 3, r: 5, left: 52.8, top: 44.0, sizeW: 14.5, sizeH: 6.5 },
  { c: 4, r: 5, left: 66.5, top: 44.0, sizeW: 14.5, sizeH: 6.5 },
  // Lower waist — sides only; pelvic dead-center cells removed from this band
  { c: 1, r: 6, left: 28.5, top: 50.5, sizeW: 14.5, sizeH: 6.5 },
  { c: 3, r: 6, left: 57.0, top: 50.5, sizeW: 14.5, sizeH: 6.5 },
  // Outer hips / upper outer thighs (r7 sides = mens/womens health; no center cell)
  { c: 1, r: 7, left: 27.5, top: 58.5, sizeW: 14.5, sizeH: 6.5 },
  { c: 3, r: 7, left: 58.0, top: 58.5, sizeW: 14.5, sizeH: 6.5 },
  // Mid / outer thighs — general-sexual on outer left; no crotch-center cell
  { c: 1, r: 8, left: 27.0, top: 68.5, sizeW: 14.5, sizeH: 6.5 },
  { c: 3, r: 8, left: 58.5, top: 68.5, sizeW: 14.5, sizeH: 6.5 },
  // Lower thighs
  { c: 1, r: 9, left: 28.5, top: 76.5, sizeW: 14.5, sizeH: 6.5 },
  { c: 3, r: 9, left: 57.0, top: 76.5, sizeW: 14.5, sizeH: 6.5 },
  // Outer lower legs — mens/womens sexual-health (away from pelvic center)
  { c: 1, r: 10, left: 28.0, top: 84.0, sizeW: 14.5, sizeH: 6.5 },
  { c: 3, r: 10, left: 57.5, top: 84.0, sizeW: 14.5, sizeH: 6.5 },
];
