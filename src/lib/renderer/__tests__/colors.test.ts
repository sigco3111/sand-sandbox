import { describe, it, expect } from 'vitest';
import { COLOR_MAP, getColor, type RGB } from '../colors';

describe('colors', () => {
  it('COLOR_MAP has entries for 0..17', () => {
    for (let i = 0; i <= 17; i++) {
      expect(COLOR_MAP[i]).toBeDefined();
      const v = COLOR_MAP[i];
      expect(Array.isArray(v)).toBe(true);
      expect(v).toHaveLength(3);
      v.forEach((n) => expect(typeof n).toBe('number'));
    }
  });

  it('getColor returns base color for seed=128 (middle) approximately', () => {
    for (let i = 0; i <= 17; i++) {
      const base = COLOR_MAP[i] as RGB;
      const c = getColor(i, 128);
      // For neutral elements (Empty/Stone/Wall) must be exact; others should be within ±10
      if (i === 0 || i === 3 || i === 4) {
        expect(c).toEqual(base);
      } else {
        for (let j = 0; j < 3; j++) {
          expect(Math.abs(c[j] - base[j])).toBeLessThanOrEqual(10);
        }
      }
    }
  });

  it('Sand and Water variation within ±10', () => {
    const sandBase = COLOR_MAP[1] as RGB;
    const waterBase = COLOR_MAP[2] as RGB;
    for (let seed = 0; seed <= 255; seed += 51) {
      const s = getColor(1, seed);
      const w = getColor(2, seed);
      for (let j = 0; j < 3; j++) {
        expect(Math.abs(s[j] - sandBase[j])).toBeLessThanOrEqual(10);
        expect(Math.abs(w[j] - waterBase[j])).toBeLessThanOrEqual(10);
      }
    }
  });

  it('Empty/Wall/Stone have no variation', () => {
    [0, 3, 4].forEach((t) => {
      const base = COLOR_MAP[t] as RGB;
      for (const seed of [0, 64, 128, 255]) {
        expect(getColor(t, seed)).toEqual(base);
      }
    });
  });

  it('RGB values are clamped to [0,255]', () => {
    // Use extreme seeds and also test unknown type fallback
    const extremes = [0, 255, 999, -50];
    for (const seed of extremes) {
      const c = getColor(5, seed); // fire
      c.forEach((v) => expect(v).toBeGreaterThanOrEqual(0) && expect(v).toBeLessThanOrEqual(255));
    }

    // Unknown element type returns black [0,0,0]
    expect(getColor(999 as any, 128)).toEqual([0, 0, 0]);
  });
});
