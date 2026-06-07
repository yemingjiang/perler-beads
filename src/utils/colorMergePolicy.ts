import type { PaletteColor } from './pixelation';

const TRANSPARENT_MERGE_KEY = 'ERASE';
const KNOWN_BACKGROUND_HEXES = new Set([
  '#FFFFFF',
  '#FEFFFF',
  '#FDFBFF',
  '#FCF7F8',
]);

function normalizeHex(hex: string): string {
  return hex.trim().toUpperCase();
}

function isNearWhite(rgb: PaletteColor['rgb']): boolean {
  const maxChannel = Math.max(rgb.r, rgb.g, rgb.b);
  const minChannel = Math.min(rgb.r, rgb.g, rgb.b);
  const luma = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;

  return minChannel >= 240 && maxChannel - minChannel <= 24 && luma >= 0.95;
}

export function isProtectedMergeTarget(color: PaletteColor): boolean {
  const hex = normalizeHex(color.hex);

  return color.key === TRANSPARENT_MERGE_KEY
    || KNOWN_BACKGROUND_HEXES.has(hex)
    || isNearWhite(color.rgb);
}

export function canColorAbsorbSimilarColor(
  color: PaletteColor,
  protectBackgroundMergeTargets: boolean
): boolean {
  return !protectBackgroundMergeTargets || !isProtectedMergeTarget(color);
}
