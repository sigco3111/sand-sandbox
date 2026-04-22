export enum ElementType {
  Empty = 0,
  Sand = 1,
  Water = 2,
  Stone = 3,
  Wall = 4,
  Fire = 5,
  Steam = 6,
  Oil = 7,
  Lava = 8,
  Wood = 9,
  Plant = 10,
  Acid = 11,
  Gunpowder = 12,
  Ice = 13,
  Smoke = 14,
  Spark = 15,
  Clone = 16,
  Erase = 17,
}

// Category classification functions
export function isPowder(t: ElementType): boolean {
  return t === ElementType.Sand || t === ElementType.Gunpowder;
}

export function isLiquid(t: ElementType): boolean {
  return (
    t === ElementType.Water ||
    t === ElementType.Oil ||
    t === ElementType.Acid ||
    t === ElementType.Lava
  );
}

export function isGas(t: ElementType): boolean {
  return (
    t === ElementType.Fire ||
    t === ElementType.Steam ||
    t === ElementType.Smoke ||
    t === ElementType.Spark
  );
}

export function isSolid(t: ElementType): boolean {
  return (
    t === ElementType.Stone ||
    t === ElementType.Wall ||
    t === ElementType.Wood ||
    t === ElementType.Plant ||
    t === ElementType.Ice ||
    t === ElementType.Clone
  );
}

export function isTool(t: ElementType): boolean {
  return t === ElementType.Erase;
}

// Constants
export const GRID_WIDTH = 200;
export const GRID_HEIGHT = 150;
export const CELL_SIZE = 4;
export const AMBIENT_TEMP = 20; // °C

// Density mapping: higher number = heavier
// Solids/gases/empty are 0 and do not participate in density displacement
export const DENSITY_MAP: Record<number, number> = {
  [ElementType.Empty]: 0,
  [ElementType.Sand]: 8,
  [ElementType.Water]: 5,
  [ElementType.Stone]: 0,
  [ElementType.Wall]: 0,
  [ElementType.Fire]: 0,
  [ElementType.Steam]: 0,
  [ElementType.Oil]: 3,
  [ElementType.Lava]: 10,
  [ElementType.Wood]: 0,
  [ElementType.Plant]: 0,
  [ElementType.Acid]: 6,
  [ElementType.Gunpowder]: 7,
  [ElementType.Ice]: 0,
  [ElementType.Smoke]: 0,
  [ElementType.Spark]: 0,
  [ElementType.Clone]: 0,
  [ElementType.Erase]: 0,
};

export default ElementType;
