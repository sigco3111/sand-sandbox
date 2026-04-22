import { Grid } from './grid'
import { RNG } from './random'
import { tryMoveDown, tryMoveDiagonal } from './physics-utils'

export function updatePowder(grid: Grid, x: number, y: number, rng: RNG): void {
  if (tryMoveDown(grid, x, y)) return
  if (tryMoveDiagonal(grid, x, y, rng)) return
}
