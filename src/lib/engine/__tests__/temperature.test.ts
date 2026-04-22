import { describe, it, expect, beforeEach } from 'vitest';
import { createGrid, setElement, getIndex } from '../../engine/grid';
import { ElementType, AMBIENT_TEMP } from '../../engine/types';
import { updateTemperature, HEAT_SOURCES } from '../../engine/temperature';

describe('Temperature system', () => {
  let grid: ReturnType<typeof createGrid>;

  beforeEach(() => {
    grid = createGrid(5, 3);
  });

  it('fire cell stays at 500°C regardless', () => {
    const idx = getIndex(1, 1, grid.width);
    setElement(grid, 1, 1, ElementType.Fire);
    grid.temperatures[idx] = 0;
    updateTemperature(grid);
    expect(grid.temperatures[idx]).toBe(HEAT_SOURCES[ElementType.Fire]);
  });

  it('lava cell stays at 1200°C regardless', () => {
    const idx = getIndex(1, 1, grid.width);
    setElement(grid, 1, 1, ElementType.Lava);
    grid.temperatures[idx] = AMBIENT_TEMP;
    updateTemperature(grid);
    expect(grid.temperatures[idx]).toBe(HEAT_SOURCES[ElementType.Lava]);
  });

  it('wall is insulator - blocks heat transfer', () => {
    setElement(grid, 0, 1, ElementType.Wood);
    setElement(grid, 1, 1, ElementType.Wall);
    setElement(grid, 2, 1, ElementType.Wood);
    const aIdx = getIndex(0, 1, grid.width);
    const bIdx = getIndex(2, 1, grid.width);
    grid.temperatures[aIdx] = 100;
    grid.temperatures[bIdx] = 20;
    updateTemperature(grid);
    // B should not receive heat from A through the Wall
    // B is at 20 (ambient), no cooling applied, no heat received
    expect(grid.temperatures[bIdx]).toBeCloseTo(20);
  });

  it('non-source cools toward ambient by 1°C per frame', () => {
    setElement(grid, 1, 1, ElementType.Wood);
    const idx = getIndex(1, 1, grid.width);
    grid.temperatures[idx] = AMBIENT_TEMP + 10;
    // Other neighbors at ambient, small transfers expected
    updateTemperature(grid);
    // Should be cooled toward ambient, net decrease
    expect(grid.temperatures[idx]).toBeLessThan(AMBIENT_TEMP + 10);
  });

  it('heat propagates between adjacent non-wall cells', () => {
    setElement(grid, 1, 1, ElementType.Wood);
    setElement(grid, 2, 1, ElementType.Wood);
    const a = getIndex(1, 1, grid.width);
    const b = getIndex(2, 1, grid.width);
    grid.temperatures[a] = 100;
    grid.temperatures[b] = 20;
    updateTemperature(grid);
    // B should receive heat from A (temp should increase from 20)
    expect(grid.temperatures[b]).toBeGreaterThan(20);
    // A should lose heat (temp should decrease from 100)
    expect(grid.temperatures[a]).toBeLessThan(100);
  });
});

describe('Phase Transitions', () => {
  it('ice melts to water when heated by adjacent fire', () => {
    const g = createGrid(3, 1);
    setElement(g, 0, 0, ElementType.Fire);
    setElement(g, 1, 0, ElementType.Ice);
    g.temperatures[getIndex(0, 0, g.width)] = 500;
    g.temperatures[getIndex(1, 0, g.width)] = -10;

    updateTemperature(g);

    expect(g.elements[getIndex(1, 0, g.width)]).toBe(ElementType.Water);
  });

  it('melted water eventually evaporates to steam near fire', () => {
    const g = createGrid(3, 1);
    setElement(g, 0, 0, ElementType.Fire);
    setElement(g, 1, 0, ElementType.Ice);
    g.temperatures[getIndex(0, 0, g.width)] = 500;
    g.temperatures[getIndex(1, 0, g.width)] = -10;

    for (let i = 0; i < 20; i++) updateTemperature(g);

    expect(g.elements[getIndex(1, 0, g.width)]).toBe(ElementType.Steam);
  });

  it('water evaporates to steam when heated by adjacent lava', () => {
    const g = createGrid(3, 1);
    setElement(g, 0, 0, ElementType.Lava);
    setElement(g, 1, 0, ElementType.Water);
    g.temperatures[getIndex(0, 0, g.width)] = 1200;
    g.temperatures[getIndex(1, 0, g.width)] = AMBIENT_TEMP;

    for (let i = 0; i < 200; i++) updateTemperature(g);

    expect(g.elements[getIndex(1, 0, g.width)]).toBe(ElementType.Steam);
  });

  it('ice melts at ambient temperature since 20 > 0', () => {
    const g = createGrid(3, 1);
    setElement(g, 1, 0, ElementType.Ice);
    g.temperatures[getIndex(1, 0, g.width)] = AMBIENT_TEMP;

    updateTemperature(g);

    expect(g.elements[getIndex(1, 0, g.width)]).toBe(ElementType.Water);
  });
});
