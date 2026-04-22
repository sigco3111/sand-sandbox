import { type Grid, clearGrid, clearProcessed } from './grid'
import { type RNG } from './random'
import { updateTemperature } from './temperature'
import { updateLifetime } from './lifetime'
import { updateReactions } from './reactions'
import { updatePhysics } from './physics'

export interface Simulator {
  step(): void
  setSpeed(multiplier: number): void
  getSpeed(): number
  pause(): void
  resume(): void
  isPaused(): boolean
  clear(): void
  getGrid(): Grid
}

export function createSimulator(grid: Grid, rng: RNG): Simulator {
  let speed = 1
  let paused = false

  return {
    step(): void {
      if (paused) return
      clearProcessed(grid)
      updateTemperature(grid)
      updateLifetime(grid)
      updateReactions(grid)
      updatePhysics(grid, rng)
    },

    setSpeed(multiplier: number): void {
      speed = multiplier
    },

    getSpeed(): number {
      return speed
    },

    pause(): void {
      paused = true
    },

    resume(): void {
      paused = false
    },

    isPaused(): boolean {
      return paused
    },

    clear(): void {
      clearGrid(grid)
    },

    getGrid(): Grid {
      return grid
    },
  }
}
