import { Grid, getIndex, inBounds } from './grid'
import { ElementType, isLiquid, DENSITY_MAP } from './types'
import { RNG } from './random'

export function swap(grid: Grid, x1: number, y1: number, x2: number, y2: number): void {
  const i1 = getIndex(x1, y1, grid.width)
  const i2 = getIndex(x2, y2, grid.width)

  let tmp: number

  tmp = grid.elements[i1]
  grid.elements[i1] = grid.elements[i2]
  grid.elements[i2] = tmp

  tmp = grid.lifetimes[i1]
  grid.lifetimes[i1] = grid.lifetimes[i2]
  grid.lifetimes[i2] = tmp

  tmp = grid.colorSeeds[i1]
  grid.colorSeeds[i1] = grid.colorSeeds[i2]
  grid.colorSeeds[i2] = tmp

  const tmpF = grid.temperatures[i1]
  grid.temperatures[i1] = grid.temperatures[i2]
  grid.temperatures[i2] = tmpF
}

export function isEmpty(grid: Grid, x: number, y: number): boolean {
  if (!inBounds(x, y, grid.width, grid.height)) return false
  return grid.elements[getIndex(x, y, grid.width)] === ElementType.Empty
}

export function canDisplaceByDensity(
  grid: Grid,
  fromX: number, fromY: number,
  toX: number, toY: number,
): boolean {
  if (!inBounds(toX, toY, grid.width, grid.height)) return false
  const fromType = grid.elements[getIndex(fromX, fromY, grid.width)]
  const toType = grid.elements[getIndex(toX, toY, grid.width)]
  const fromDensity = DENSITY_MAP[fromType] ?? 0
  const toDensity = DENSITY_MAP[toType] ?? 0
  return toDensity > 0 && fromDensity > toDensity
}

export function canDisplaceByDensityGas(
  grid: Grid,
  _fromX: number, _fromY: number,
  toX: number, toY: number,
): boolean {
  if (!inBounds(toX, toY, grid.width, grid.height)) return false
  const toType = grid.elements[getIndex(toX, toY, grid.width)] as ElementType
  return isLiquid(toType)
}

export function tryMoveDown(grid: Grid, x: number, y: number): boolean {
  const ny = y + 1
  if (isEmpty(grid, x, ny) || canDisplaceByDensity(grid, x, y, x, ny)) {
    swap(grid, x, y, x, ny)
    grid.processed[getIndex(x, ny, grid.width)] = 1
    return true
  }
  return false
}

export function tryMoveDiagonal(grid: Grid, x: number, y: number, rng: RNG): boolean {
  const ny = y + 1
  const leftFirst = rng.nextBool(0.5)
  const d1 = leftFirst ? -1 : 1
  const d2 = leftFirst ? 1 : -1

  if (isEmpty(grid, x + d1, ny)) {
    swap(grid, x, y, x + d1, ny)
    grid.processed[getIndex(x + d1, ny, grid.width)] = 1
    return true
  }
  if (isEmpty(grid, x + d2, ny)) {
    swap(grid, x, y, x + d2, ny)
    grid.processed[getIndex(x + d2, ny, grid.width)] = 1
    return true
  }
  return false
}

export function tryMoveHorizontal(grid: Grid, x: number, y: number, rng: RNG): boolean {
  const leftFirst = rng.nextBool(0.5)
  const d1 = leftFirst ? -1 : 1
  const d2 = leftFirst ? 1 : -1

  if (isEmpty(grid, x + d1, y)) {
    swap(grid, x, y, x + d1, y)
    grid.processed[getIndex(x + d1, y, grid.width)] = 1
    return true
  }
  if (isEmpty(grid, x + d2, y)) {
    swap(grid, x, y, x + d2, y)
    grid.processed[getIndex(x + d2, y, grid.width)] = 1
    return true
  }
  return false
}

export function tryMoveUp(grid: Grid, x: number, y: number): boolean {
  const ny = y - 1
  if (isEmpty(grid, x, ny) || canDisplaceByDensityGas(grid, x, y, x, ny)) {
    swap(grid, x, y, x, ny)
    grid.processed[getIndex(x, ny, grid.width)] = 1
    return true
  }
  return false
}

export function tryMoveDiagonalUp(grid: Grid, x: number, y: number, rng: RNG): boolean {
  const ny = y - 1
  const leftFirst = rng.nextBool(0.5)
  const d1 = leftFirst ? -1 : 1
  const d2 = leftFirst ? 1 : -1
  if (isEmpty(grid, x + d1, ny)) {
    swap(grid, x, y, x + d1, ny)
    grid.processed[getIndex(x + d1, ny, grid.width)] = 1
    return true
  }
  if (isEmpty(grid, x + d2, ny)) {
    swap(grid, x, y, x + d2, ny)
    grid.processed[getIndex(x + d2, ny, grid.width)] = 1
    return true
  }
  return false
}

export function tryMoveUpByDensity(grid: Grid, x: number, y: number): boolean {
  const ny = y - 1
  if (!inBounds(x, ny, grid.width, grid.height)) return false
  const fromType = grid.elements[getIndex(x, y, grid.width)] as ElementType
  const toType = grid.elements[getIndex(x, ny, grid.width)] as ElementType
  const fromDensity = DENSITY_MAP[fromType] ?? 0
  const toDensity = DENSITY_MAP[toType] ?? 0
  if (
    fromDensity > 0 && toDensity > 0 &&
    fromDensity < toDensity &&
    isLiquid(fromType) && isLiquid(toType)
  ) {
    swap(grid, x, y, x, ny)
    grid.processed[getIndex(x, ny, grid.width)] = 1
    return true
  }
  return false
}
