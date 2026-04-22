import { Grid, getIndex } from './grid'
import { ElementType } from './types'
import { RNG } from './random'
import { tryMoveDown, tryMoveDiagonal, tryMoveHorizontal, tryMoveUpByDensity } from './physics-utils'

export function updateLiquid(grid: Grid, x: number, y: number, rng: RNG): void {
  const type = grid.elements[getIndex(x, y, grid.width)] as ElementType

  if (type === ElementType.Lava && !rng.nextBool(0.5)) return

  if (tryMoveDown(grid, x, y)) return
  if (tryMoveDiagonal(grid, x, y, rng)) return
  if (tryMoveHorizontal(grid, x, y, rng)) return

  tryMoveUpByDensity(grid, x, y)
}
