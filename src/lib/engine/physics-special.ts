import { Grid, setElement, getIndex, inBounds } from './grid'
import { ElementType } from './types'
import { RNG } from './random'

export function updatePlant(grid: Grid, x: number, y: number, rng: RNG): void {
  if (!rng.nextBool(0.03)) return

  const dirs = [[0, 1], [0, -1], [-1, 0], [1, 0]]
  let waterX = -1, waterY = -1
  for (const [dx, dy] of dirs) {
    const nx = x + dx
    const ny = y + dy
    if (!inBounds(nx, ny, grid.width, grid.height)) continue
    if (grid.elements[getIndex(nx, ny, grid.width)] === ElementType.Water) {
      waterX = nx
      waterY = ny
      break
    }
  }
  if (waterX < 0) return

  let growX = x
  let growY = y - 1
  const r = rng.next()
  if (r < 0.2) growX = x - 1
  else if (r < 0.4) growX = x + 1

  if (!inBounds(growX, growY, grid.width, grid.height)) return
  if (grid.elements[getIndex(growX, growY, grid.width)] !== ElementType.Empty) return

  setElement(grid, waterX, waterY, ElementType.Empty)
  setElement(grid, growX, growY, ElementType.Plant)
}

const CLONE_EXCLUDE: Set<number> = new Set([
  ElementType.Empty,
  ElementType.Wall,
  ElementType.Clone,
  ElementType.Erase,
  ElementType.Stone,
])

export function updateClone(grid: Grid, x: number, y: number, frame: number): void {
  const idx = getIndex(x, y, grid.width)

  // Detect source: first non-excluded adjacent element
  if (grid.temperatures[idx] <= 0 || grid.temperatures[idx] === 20) {
    const dirs = [[0, 1], [0, -1], [-1, 0], [1, 0]]
    for (const [dx, dy] of dirs) {
      const nx = x + dx
      const ny = y + dy
      if (!inBounds(nx, ny, grid.width, grid.height)) continue
      const neighborType = grid.elements[getIndex(nx, ny, grid.width)]
      if (!CLONE_EXCLUDE.has(neighborType)) {
        grid.temperatures[idx] = neighborType
        break
      }
    }
  }

  // Emit stored element upward every 5 frames
  const source = grid.temperatures[idx]
  if (source > 0 && source !== 20 && frame % 5 === 0) {
    const emitX = x
    const emitY = y - 1
    if (inBounds(emitX, emitY, grid.width, grid.height)) {
      const emitIdx = getIndex(emitX, emitY, grid.width)
      if (grid.elements[emitIdx] === ElementType.Empty) {
        grid.elements[emitIdx] = source as number
        grid.processed[emitIdx] = 1
      }
    }
  }
}
