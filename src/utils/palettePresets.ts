import type { PaletteSelections } from './localStorageUtils';
import type { PaletteColor } from './pixelation';

export const MARD_221_SERIES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'M'] as const;

const mard221SeriesSet = new Set<string>(MARD_221_SERIES);

export function getMardSeries(mardKey: string): string | null {
  return mardKey.match(/^[A-Z]+/)?.[0] ?? null;
}

export function isMard221ColorKey(mardKey: string): boolean {
  const series = getMardSeries(mardKey);
  return series !== null && mard221SeriesSet.has(series);
}

export function createMard221Selections(
  allColors: PaletteColor[],
  getMardKeyByHex: (hexValue: string) => string
): PaletteSelections {
  const selections: PaletteSelections = {};

  allColors.forEach((color) => {
    const normalizedHex = color.hex.toUpperCase();
    selections[normalizedHex] = isMard221ColorKey(getMardKeyByHex(normalizedHex));
  });

  return selections;
}
