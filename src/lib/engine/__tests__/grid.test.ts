import { describe, it, expect, beforeEach } from 'vitest'
import {
  createGrid,
  getIndex,
  inBounds,
  getElement,
  setElement,
  clearGrid,
  clearProcessed,
} from '../grid'
import { ElementType, GRID_WIDTH, GRID_HEIGHT, AMBIENT_TEMP } from '../types'

describe('Grid (SoA) basic behavior', () => {
  let grid = createGrid(GRID_WIDTH, GRID_HEIGHT)

  beforeEach(() => {
    grid = createGrid(GRID_WIDTH, GRID_HEIGHT)
  })

  it('createGrid sets correct dimensions', () => {
    expect(grid.width).toBe(GRID_WIDTH)
    expect(grid.height).toBe(GRID_HEIGHT)
    expect(grid.elements.length).toBe(GRID_WIDTH * GRID_HEIGHT)
    expect(grid.temperatures.length).toBe(GRID_WIDTH * GRID_HEIGHT)
  })

  it('getIndex computes linear index', () => {
    expect(getIndex(0, 0, 10)).toBe(0)
    expect(getIndex(1, 0, 10)).toBe(1)
    expect(getIndex(0, 1, 10)).toBe(10)
    expect(getIndex(3, 2, 5)).toBe(2 * 5 + 3)
  })

  it('new grid elements default to Empty', () => {
    expect(getElement(grid, 0, 0)).toBe(ElementType.Empty)
    expect(getElement(grid, GRID_WIDTH - 1, GRID_HEIGHT - 1)).toBe(ElementType.Empty)
  })

  it('setElement and getElement roundtrip', () => {
    const x = 5
    const y = 6
    setElement(grid, x, y, ElementType.Wood)
    expect(getElement(grid, x, y)).toBe(ElementType.Wood)
  })

  it('inBounds works for boundaries', () => {
    expect(inBounds(-1, 0, GRID_WIDTH, GRID_HEIGHT)).toBe(false)
    expect(inBounds(0, -1, GRID_WIDTH, GRID_HEIGHT)).toBe(false)
    expect(inBounds(GRID_WIDTH, 0, GRID_WIDTH, GRID_HEIGHT)).toBe(false)
    expect(inBounds(0, GRID_HEIGHT, GRID_WIDTH, GRID_HEIGHT)).toBe(false)
    expect(inBounds(0, 0, GRID_WIDTH, GRID_HEIGHT)).toBe(true)
    expect(inBounds(GRID_WIDTH - 1, GRID_HEIGHT - 1, GRID_WIDTH, GRID_HEIGHT)).toBe(true)
  })

  it('getElement out of bounds returns Empty without throwing', () => {
    expect(getElement(grid, -10, -10)).toBe(ElementType.Empty)
    expect(getElement(grid, GRID_WIDTH + 5, GRID_HEIGHT + 5)).toBe(ElementType.Empty)
  })

  it('clearGrid resets elements to Empty', () => {
    setElement(grid, 1, 1, ElementType.Wood)
    clearGrid(grid)
    expect(getElement(grid, 1, 1)).toBe(ElementType.Empty)
    // check a few random spots
    expect(getElement(grid, 0, 0)).toBe(ElementType.Empty)
    expect(getElement(grid, GRID_WIDTH - 2, GRID_HEIGHT - 3)).toBe(ElementType.Empty)
  })

  it('clearProcessed zeros processed array', () => {
    // set some processed flags
    grid.processed.fill(1)
    clearProcessed(grid)
    for (let i = 0; i < grid.processed.length; i++) {
      expect(grid.processed[i]).toBe(0)
    }
  })

  it('temperatures initialized to AMBIENT_TEMP', () => {
    expect(grid.temperatures[0]).toBeCloseTo(AMBIENT_TEMP)
    expect(grid.temperatures[grid.temperatures.length - 1]).toBeCloseTo(AMBIENT_TEMP)
  })
})
