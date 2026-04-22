export type RGB = [number, number, number];

// COLOR_MAP maps ElementType numeric values (0..17) to base RGB colors
export const COLOR_MAP: Record<number, RGB> = {
  // 0: Empty
  0: [15, 15, 26],
  // 1: Sand
  1: [212, 165, 116],
  // 2: Water
  2: [74, 144, 217],
  // 3: Stone
  3: [128, 128, 128],
  // 4: Wall
  4: [61, 61, 61],
  // 5: Fire
  5: [255, 69, 0],
  // 6: Steam
  6: [200, 200, 200],
  // 7: Oil
  7: [74, 55, 40],
  // 8: Lava
  8: [255, 32, 0],
  // 9: Wood
  9: [139, 94, 60],
  // 10: Plant
  10: [45, 139, 45],
  // 11: Acid
  11: [127, 255, 0],
  // 12: Gunpowder
  12: [85, 85, 85],
  // 13: Ice
  13: [173, 216, 230],
  // 14: Smoke
  14: [105, 105, 105],
  // 15: Spark
  15: [255, 255, 0],
  // 16: Clone
  16: [255, 105, 180],
  // 17: Erase
  17: [0, 0, 0],
};

const NO_VARIATION = new Set([0, 3, 4]); // Empty, Stone, Wall

export function getColor(elementType: number, colorSeed: number): RGB {
  const base = COLOR_MAP[elementType];
  if (!base) {
    // unknown element, return black
    return [0, 0, 0];
  }

  // For these neutral elements we do not apply variation
  if (NO_VARIATION.has(elementType)) {
    return [base[0], base[1], base[2]];
  }

  // Clamp seed to [0,255]
  const seed = Math.max(0, Math.min(255, Math.floor(colorSeed)));

  // Map seed (0..255) to variation in approximately [-10, +10]
  // formula: (seed/255)*20 - 10
  const variation = (seed / 255) * 20 - 10;

  const out: RGB = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    const v = Math.round(base[i] + variation);
    out[i] = Math.max(0, Math.min(255, v));
  }

  return out;
}
