import { Grid, getIndex, clearProcessed } from './grid'
import { ElementType, isPowder, isLiquid, isSolid, isGas } from './types'
import { RNG } from './random'
import { updatePowder } from './physics-powder'
import { updateLiquid } from './physics-liquid'
import { updateGas } from './physics-gas'
import { updatePlant, updateClone } from './physics-special'

let physicsFrame = 0

export function updatePhysics(grid: Grid, rng: RNG): void {
  physicsFrame++
  clearProcessed(grid)

  for (let y = grid.height - 1; y >= 0; y--) {
    for (let x = 0; x < grid.width; x++) {
      const idx = getIndex(x, y, grid.width)
      if (grid.processed[idx]) continue

      const type = grid.elements[idx] as ElementType
      if (type === ElementType.Empty) continue
      if (isSolid(type)) {
        if (type === ElementType.Plant) {
          updatePlant(grid, x, y, rng)
        } else if (type === ElementType.Clone) {
          updateClone(grid, x, y, physicsFrame)
        }
        continue
      }

      if (isPowder(type)) {
        updatePowder(grid, x, y, rng)
      } else if (isLiquid(type)) {
        updateLiquid(grid, x, y, rng)
      } else if (isGas(type)) {
        updateGas(grid, x, y, rng)
      }
    }
  }
}
