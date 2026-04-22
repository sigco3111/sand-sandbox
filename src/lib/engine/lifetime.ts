import { Grid, getIndex } from './grid'
import { ElementType } from './types'

export const INITIAL_LIFETIMES: Partial<Record<number, number>> = {
  [ElementType.Fire]: 30,
  [ElementType.Spark]: 10,
  // Steam and Smoke handled in initLifetime or externally
}

export const DECAY_TRANSFORMS: Partial<Record<number, number>> = {
  [ElementType.Fire]: ElementType.Smoke,
  [ElementType.Spark]: ElementType.Empty,
  [ElementType.Steam]: ElementType.Water,
  [ElementType.Smoke]: ElementType.Empty,
}

export function initLifetime(grid: Grid, x: number, y: number, type: ElementType): void {
  const idx = getIndex(x, y, grid.width)
  if (type === ElementType.Steam) {
    // random 100-200, but keep deterministic external control in tests
    grid.lifetimes[idx] = Math.floor(Math.random() * 101) + 100
    return
  }
  if (type === ElementType.Smoke) {
    grid.lifetimes[idx] = Math.floor(Math.random() * 61) + 60
    return
  }
  const v = INITIAL_LIFETIMES[type]
  if (v !== undefined) grid.lifetimes[idx] = v
}

export function updateLifetime(grid: Grid): void {
  const { lifetimes, elements, width, height } = grid
  const len = lifetimes.length
  for (let idx = 0; idx < len; idx++) {
    const life = lifetimes[idx]
    if (!life) continue
    const newLife = life - 1
    lifetimes[idx] = newLife
    if (newLife <= 0) {
      const el = elements[idx]
      const next = DECAY_TRANSFORMS[el]
      if (next !== undefined) {
        elements[idx] = next
        // set new lifetime if decay target has initial lifetime
        const tLife = INITIAL_LIFETIMES[next]
        if (tLife !== undefined) lifetimes[idx] = tLife
      }
    }
  }
}

