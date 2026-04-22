import { ElementType } from './types';
import { GRID_WIDTH, GRID_HEIGHT, AMBIENT_TEMP } from './types';

export type Grid = {
  elements: Uint8Array;
  lifetimes: Uint8Array;
  processed: Uint8Array;
  temperatures: Float32Array;
  colorSeeds: Uint8Array;
  width: number;
  height: number;
};

export function getIndex(x: number, y: number, width: number): number {
  return y * width + x;
}

export function inBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && y >= 0 && x < width && y < height;
}

export function createGrid(width = GRID_WIDTH, height = GRID_HEIGHT): Grid {
  const size = width * height;
  const elements = new Uint8Array(size);
  const lifetimes = new Uint8Array(size);
  const processed = new Uint8Array(size);
  const temperatures = new Float32Array(size);
  const colorSeeds = new Uint8Array(size);

  elements.fill(ElementType.Empty);
  for (let i = 0; i < size; i++) temperatures[i] = AMBIENT_TEMP;
  for (let i = 0; i < size; i++) colorSeeds[i] = Math.floor(Math.random() * 256);

  return { elements, lifetimes, processed, temperatures, colorSeeds, width, height };
}

export function getElement(grid: Grid, x: number, y: number): number {
  if (!inBounds(x, y, grid.width, grid.height)) return ElementType.Empty;
  return grid.elements[getIndex(x, y, grid.width)];
}

export function setElement(grid: Grid, x: number, y: number, type: number): void {
  if (!inBounds(x, y, grid.width, grid.height)) return;
  grid.elements[getIndex(x, y, grid.width)] = type;
}

export function clearGrid(grid: Grid): void {
  grid.elements.fill(ElementType.Empty);
  grid.lifetimes.fill(0);
}

export function clearProcessed(grid: Grid): void {
  grid.processed.fill(0);
}
