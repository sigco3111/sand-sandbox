import { describe, it, expect } from 'vitest';
import {
  ElementType,
  isPowder,
  isLiquid,
  isGas,
  isSolid,
  isTool,
  DENSITY_MAP,
} from '../types';

describe('ElementType enum', () => {
  it('has 18 values from Empty(0) to Erase(17)', () => {
    const expectedCount = 18;
    const values = Object.values(ElementType).filter((v) => typeof v === 'number') as number[];
    const unique = Array.from(new Set(values));
    expect(unique.length).toBe(expectedCount);
    expect(ElementType.Empty).toBe(0);
    expect(ElementType.Sand).toBe(1);
    expect(ElementType.Water).toBe(2);
    expect(ElementType.Erase).toBe(17);
  });
});

describe('Category classification functions', () => {
  it('isPowder identifies Sand and Gunpowder', () => {
    expect(isPowder(ElementType.Sand)).toBe(true);
    expect(isPowder(ElementType.Gunpowder)).toBe(true);
    expect(isPowder(ElementType.Water)).toBe(false);
    expect(isPowder(ElementType.Empty)).toBe(false);
  });

  it('isLiquid identifies Water, Oil, Acid, Lava', () => {
    expect(isLiquid(ElementType.Water)).toBe(true);
    expect(isLiquid(ElementType.Oil)).toBe(true);
    expect(isLiquid(ElementType.Acid)).toBe(true);
    expect(isLiquid(ElementType.Lava)).toBe(true);
    expect(isLiquid(ElementType.Sand)).toBe(false);
  });

  it('isGas identifies Fire, Steam, Smoke, Spark', () => {
    expect(isGas(ElementType.Fire)).toBe(true);
    expect(isGas(ElementType.Steam)).toBe(true);
    expect(isGas(ElementType.Smoke)).toBe(true);
    expect(isGas(ElementType.Spark)).toBe(true);
    expect(isGas(ElementType.Wood)).toBe(false);
  });

  it('isSolid identifies Stone, Wall, Wood, Plant, Ice, Clone', () => {
    expect(isSolid(ElementType.Stone)).toBe(true);
    expect(isSolid(ElementType.Wall)).toBe(true);
    expect(isSolid(ElementType.Wood)).toBe(true);
    expect(isSolid(ElementType.Plant)).toBe(true);
    expect(isSolid(ElementType.Ice)).toBe(true);
    expect(isSolid(ElementType.Clone)).toBe(true);
    expect(isSolid(ElementType.Fire)).toBe(false);
  });

  it('isTool identifies Erase only', () => {
    expect(isTool(ElementType.Erase)).toBe(true);
    expect(isTool(ElementType.Empty)).toBe(false);
  });
});

describe('Density map', () => {
  it('contains expected densities and ordering', () => {
    expect(DENSITY_MAP[ElementType.Lava]).toBe(10);
    expect(DENSITY_MAP[ElementType.Sand]).toBe(8);
    expect(DENSITY_MAP[ElementType.Gunpowder]).toBe(7);
    expect(DENSITY_MAP[ElementType.Acid]).toBe(6);
    expect(DENSITY_MAP[ElementType.Water]).toBe(5);
    expect(DENSITY_MAP[ElementType.Oil]).toBe(3);
    expect(DENSITY_MAP[ElementType.Empty]).toBe(0);
    expect(DENSITY_MAP[ElementType.Fire]).toBe(0);
    expect(DENSITY_MAP[ElementType.Stone]).toBe(0);
  });
});
