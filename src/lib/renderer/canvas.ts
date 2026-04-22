import type { Grid } from '../engine/grid';
import { CELL_SIZE } from '../engine/types';
import { getColor } from './colors';

export function createImageData(
  width: number,
  height: number,
  cellSize: number,
): ImageData {
  const pixelWidth = width * cellSize;
  const pixelHeight = height * cellSize;
  if (typeof ImageData !== 'undefined') {
    return new ImageData(pixelWidth, pixelHeight);
  }
  return {
    width: pixelWidth,
    height: pixelHeight,
    data: new Uint8ClampedArray(pixelWidth * pixelHeight * 4),
  } as ImageData;
}

export function renderGrid(grid: Grid, imageData: ImageData, bgColor?: [number, number, number]): void {
  const { width, height, elements, colorSeeds } = grid;
  const data = imageData.data;
  const imgWidth = imageData.width;
  const bg: [number, number, number] = bgColor ?? [15, 15, 26];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const elementType = elements[idx];
      const colorSeed = colorSeeds[idx];
      const [r, g, b] = elementType === 0 ? bg : getColor(elementType, colorSeed);

      const px0 = x * CELL_SIZE;
      const py0 = y * CELL_SIZE;

      for (let dy = 0; dy < CELL_SIZE; dy++) {
        const rowOffset = (py0 + dy) * imgWidth;
        for (let dx = 0; dx < CELL_SIZE; dx++) {
          const pidx = (rowOffset + px0 + dx) * 4;
          data[pidx] = r;
          data[pidx + 1] = g;
          data[pidx + 2] = b;
          data[pidx + 3] = 255;
        }
      }
    }
  }
}
