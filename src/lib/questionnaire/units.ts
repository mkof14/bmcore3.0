import type { UnitSystem } from './types';

const CM_PER_INCH = 2.54;
const LBS_PER_KG = 2.2046226218;

function parseNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function roundNice(n: number): string {
  return String(Math.round(n * 10) / 10);
}

/** Convert height/weight display values when switching unit system. */
export function convertPersonalMeasures(
  height: unknown,
  weight: unknown,
  from: UnitSystem,
  to: UnitSystem
): { height: string; weight: string } {
  if (from === to) {
    return {
      height: height === undefined || height === null ? '' : String(height),
      weight: weight === undefined || weight === null ? '' : String(weight),
    };
  }

  const h = parseNumber(height);
  const w = parseNumber(weight);

  if (from === 'metric' && to === 'imperial') {
    return {
      height: h === null ? '' : roundNice(h / CM_PER_INCH),
      weight: w === null ? '' : roundNice(w * LBS_PER_KG),
    };
  }

  return {
    height: h === null ? '' : roundNice(h * CM_PER_INCH),
    weight: w === null ? '' : roundNice(w / LBS_PER_KG),
  };
}
