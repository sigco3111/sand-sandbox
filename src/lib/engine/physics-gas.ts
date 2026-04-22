import { Grid, setElement, getIndex } from './grid'
import { ElementType } from './types'
import { RNG } from './random'
import { swap, isEmpty, canDisplaceByDensityGas } from './physics-utils'

export function updateGas(grid: Grid, x: number, y: number, rng: RNG): void {
  const type = grid.elements[getIndex(x, y, grid.width)] as ElementType

  let moveChance: number
  let driftChance: number

  switch (type) {
    case ElementType.Fire: moveChance = 1.0; driftChance = 0.3; break
    case ElementType.Steam: moveChance = 0.8; driftChance = 0.2; break
    case ElementType.Smoke: moveChance = 0.6; driftChance = 0.1; break
    case ElementType.Spark: moveChance = 1.0; driftChance = 0.4; break
    default: return
  }

  if (type === ElementType.Fire && y === 0) {
    setElement(grid, x, y, ElementType.Empty)
    return
  }

  if (!rng.nextBool(moveChance)) return

  let nx = x
  let ny = y - 1
  let moved = false

  if (isEmpty(grid, x, ny) || canDisplaceByDensityGas(grid, x, y, x, ny)) {
    swap(grid, x, y, x, ny)
    grid.processed[getIndex(x, ny, grid.width)] = 1
    moved = true
  } else {
    const leftFirst = rng.nextBool(0.5)
    const d1 = leftFirst ? -1 : 1
    const d2 = leftFirst ? 1 : -1

    if (isEmpty(grid, x + d1, ny)) {
      swap(grid, x, y, x + d1, ny)
      grid.processed[getIndex(x + d1, ny, grid.width)] = 1
      nx = x + d1
      moved = true
    } else if (isEmpty(grid, x + d2, ny)) {
      swap(grid, x, y, x + d2, ny)
      grid.processed[getIndex(x + d2, ny, grid.width)] = 1
      nx = x + d2
      moved = true
    }
  }

  if (!moved) return

  if (driftChance > 0 && rng.nextBool(driftChance)) {
    const dir = rng.nextBool(0.5) ? -1 : 1
    if (isEmpty(grid, nx + dir, ny)) {
      swap(grid, nx, ny, nx + dir, ny)
      grid.processed[getIndex(nx + dir, ny, grid.width)] = 1
    }
  }
}
