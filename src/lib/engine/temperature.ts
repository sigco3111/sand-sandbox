import { Grid, inBounds, getIndex, setElement } from './grid';
import { ElementType, AMBIENT_TEMP } from './types';

export const HEAT_SOURCES: Partial<Record<number, number>> = {
  [ElementType.Fire]: 500,
  [ElementType.Lava]: 1200,
};

export const PHASE_TRANSITIONS = {
  ICE_MELT: 0,
  WATER_BOIL: 100,
};

export function updateTemperature(grid: Grid): void {
  const width = grid.width;
  const height = grid.height;
  const size = width * height;

  const oldTemps = new Float32Array(grid.temperatures);
  const deltas = new Float32Array(size);
  const elems = grid.elements;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = getIndex(x, y, width);
      const elem = elems[idx];
      if (elem === ElementType.Empty) continue;

      const sourceTemp = HEAT_SOURCES[elem] ?? oldTemps[idx];

      if (elem !== ElementType.Wall) {
        const neighbors = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ];

        for (const [nx, ny] of neighbors) {
          if (!inBounds(nx, ny, width, height)) continue;
          const nIdx = getIndex(nx, ny, width);
          const nElem = elems[nIdx];
          if (nElem === ElementType.Wall) continue;
          const neighborTemp = oldTemps[nIdx];
          const transfer = (sourceTemp - neighborTemp) * 0.1;
          deltas[idx] -= transfer;
          deltas[nIdx] += transfer;
        }
      }
    }
  }

  for (let i = 0; i < size; i++) {
    const elem = elems[i];
    const sourceVal = HEAT_SOURCES[elem];
    if (typeof sourceVal === 'number') {
      grid.temperatures[i] = sourceVal;
      continue;
    }
    if (elem === ElementType.Empty) continue;
    let t = oldTemps[i] + deltas[i];
    if (t > AMBIENT_TEMP) t = Math.max(AMBIENT_TEMP, t - 1);
    else if (t < AMBIENT_TEMP) t = Math.min(AMBIENT_TEMP, t + 1);
    grid.temperatures[i] = t;
  }

  // Phase transitions (second pass)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = getIndex(x, y, width);
      const type = elems[idx] as ElementType;
      const temp = grid.temperatures[idx];

      if (type === ElementType.Ice && temp > PHASE_TRANSITIONS.ICE_MELT) {
        // Ice melts to Water when temperature > 0°C
        setElement(grid, x, y, ElementType.Water);
        grid.temperatures[idx] = 0;
      } else if (type === ElementType.Water && temp > PHASE_TRANSITIONS.WATER_BOIL) {
        // Water evaporates to Steam when temperature > 100°C
        setElement(grid, x, y, ElementType.Steam);
        grid.temperatures[idx] = 100;
      }
    }
  }
}
