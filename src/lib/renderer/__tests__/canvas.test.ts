import { describe, it, expect } from 'vitest';
import { renderGrid, createImageData } from '../canvas';
import { createGrid, getIndex, type Grid } from '../../engine/grid';
import { CELL_SIZE } from '../../engine/types';
import { ElementType } from '../../engine/types';
import { getColor } from '../colors';

function createMockImageData(width: number, height: number) {
  return {
    width,
    height,
    data: new Uint8ClampedArray(width * height * 4),
  } as ImageData;
}

describe('canvas renderer', () => {
  describe('createImageData', () => {
    it('creates ImageData with correct dimensions from grid size', () => {
      const gridWidth = 10;
      const gridHeight = 8;
      const imgData = createImageData(gridWidth, gridHeight, CELL_SIZE);
      expect(imgData.width).toBe(gridWidth * CELL_SIZE);
      expect(imgData.height).toBe(gridHeight * CELL_SIZE);
    });

    it('data array has correct length', () => {
      const imgData = createImageData(5, 5, CELL_SIZE);
      const expectedLen = 5 * CELL_SIZE * 5 * CELL_SIZE * 4;
      expect(imgData.data.length).toBe(expectedLen);
    });
  });

  describe('renderGrid', () => {
    it('renders an all-empty grid with background color at every pixel', () => {
      const grid = createGrid(4, 4);
      const imgData = createMockImageData(4 * CELL_SIZE, 4 * CELL_SIZE);

      renderGrid(grid, imgData);

      const bg = getColor(ElementType.Empty, 0);
      for (let y = 0; y < 4 * CELL_SIZE; y++) {
        for (let x = 0; x < 4 * CELL_SIZE; x++) {
          const pidx = (y * imgData.width + x) * 4;
          expect(imgData.data[pidx]).toBe(bg[0]);
          expect(imgData.data[pidx + 1]).toBe(bg[1]);
          expect(imgData.data[pidx + 2]).toBe(bg[2]);
          expect(imgData.data[pidx + 3]).toBe(255);
        }
      }
    });

    it('renders a Sand cell with correct color at expected pixel block', () => {
      const grid = createGrid(4, 4);
      const seed = 200;
      const idx = getIndex(2, 1, grid.width);
      grid.elements[idx] = ElementType.Sand;
      grid.colorSeeds[idx] = seed;

      const imgData = createMockImageData(4 * CELL_SIZE, 4 * CELL_SIZE);
      renderGrid(grid, imgData);

      const expected = getColor(ElementType.Sand, seed);

      const px0 = 2 * CELL_SIZE;
      const py0 = 1 * CELL_SIZE;
      for (let dy = 0; dy < CELL_SIZE; dy++) {
        for (let dx = 0; dx < CELL_SIZE; dx++) {
          const pidx = ((py0 + dy) * imgData.width + (px0 + dx)) * 4;
          expect(imgData.data[pidx]).toBe(expected[0]);
          expect(imgData.data[pidx + 1]).toBe(expected[1]);
          expect(imgData.data[pidx + 2]).toBe(expected[2]);
          expect(imgData.data[pidx + 3]).toBe(255);
        }
      }
    });

    it('renders different elements with different colors in the same grid', () => {
      const grid = createGrid(4, 4);
      const seed = 100;

      grid.elements[getIndex(0, 0, 4)] = ElementType.Water;
      grid.colorSeeds[getIndex(0, 0, 4)] = seed;
      grid.elements[getIndex(3, 3, 4)] = ElementType.Stone;
      grid.colorSeeds[getIndex(3, 3, 4)] = seed;

      const imgData = createMockImageData(4 * CELL_SIZE, 4 * CELL_SIZE);
      renderGrid(grid, imgData);

      const waterColor = getColor(ElementType.Water, seed);
      const stoneColor = getColor(ElementType.Stone, seed);

      const wIdx = (0 * imgData.width + 0) * 4;
      expect(imgData.data[wIdx]).toBe(waterColor[0]);
      expect(imgData.data[wIdx + 1]).toBe(waterColor[1]);
      expect(imgData.data[wIdx + 2]).toBe(waterColor[2]);

      const sPx = 3 * CELL_SIZE;
      const sPy = 3 * CELL_SIZE;
      const sIdx = (sPy * imgData.width + sPx) * 4;
      expect(imgData.data[sIdx]).toBe(stoneColor[0]);
      expect(imgData.data[sIdx + 1]).toBe(stoneColor[1]);
      expect(imgData.data[sIdx + 2]).toBe(stoneColor[2]);
    });

    it('renders full grid without errors', () => {
      const grid = createGrid(200, 150);
      for (let i = 0; i < grid.elements.length; i++) {
        grid.elements[i] = i % 18;
        grid.colorSeeds[i] = (i * 7) % 256;
      }

      const imgData = createMockImageData(200 * CELL_SIZE, 150 * CELL_SIZE);
      expect(() => renderGrid(grid, imgData)).not.toThrow();

      const firstSeed = grid.colorSeeds[0];
      const firstType = grid.elements[0];
      const firstColor = getColor(firstType, firstSeed);
      const pidx = 0;
      expect(imgData.data[pidx]).toBe(firstColor[0]);
      expect(imgData.data[pidx + 1]).toBe(firstColor[1]);
      expect(imgData.data[pidx + 2]).toBe(firstColor[2]);
      expect(imgData.data[pidx + 3]).toBe(255);
    });

    it('all pixels have alpha = 255', () => {
      const grid = createGrid(8, 6);
      grid.elements[getIndex(4, 2, 8)] = ElementType.Sand;
      grid.colorSeeds[getIndex(4, 2, 8)] = 42;
      grid.elements[getIndex(1, 5, 8)] = ElementType.Fire;
      grid.colorSeeds[getIndex(1, 5, 8)] = 99;

      const imgData = createMockImageData(8 * CELL_SIZE, 6 * CELL_SIZE);
      renderGrid(grid, imgData);

      for (let i = 3; i < imgData.data.length; i += 4) {
        expect(imgData.data[i]).toBe(255);
      }
    });
  });
});
