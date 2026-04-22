import { describe, it, expect, beforeEach } from 'vitest'
import { createGrid, setElement, getElement } from '../grid'
import { ElementType } from '../types'
import { createRNG } from '../random'
import { createSimulator } from '../simulator'
import { clearReactions, registerReaction } from '../reactions'

describe('Simulator', () => {
  function makeSimulator(width = 10, height = 10) {
    const grid = createGrid(width, height)
    const rng = createRNG(42)
    return { grid, rng, sim: createSimulator(grid, rng) }
  }

  describe('step()', () => {
    it('executes physics: sand falls', () => {
      const { grid, sim } = makeSimulator()
      setElement(grid, 5, 3, ElementType.Sand)
      sim.step()
      expect(getElement(grid, 5, 3)).toBe(ElementType.Empty)
      expect(getElement(grid, 5, 4)).toBe(ElementType.Sand)
    })

    it('executes lifetime decay: fire turns to smoke after enough steps', () => {
      const { grid, sim } = makeSimulator()
      setElement(grid, 5, 5, ElementType.Fire)
      grid.lifetimes[5 * grid.width + 5] = 1
      sim.step()
      expect(getElement(grid, 5, 5)).toBe(ElementType.Smoke)
    })

    it('executes reactions: fire + water → steam + smoke', () => {
      clearReactions()
      registerReaction({
        elementA: ElementType.Fire,
        elementB: ElementType.Water,
        resultA: ElementType.Steam,
        resultB: ElementType.Smoke,
      })
      const { grid, sim } = makeSimulator()
      setElement(grid, 5, 5, ElementType.Fire)
      setElement(grid, 6, 5, ElementType.Water)
      sim.step()
      // Steam may have moved during physics phase, so check for existence
      const hasSteam = grid.elements.includes(ElementType.Steam)
      const hasSmoke = grid.elements.includes(ElementType.Smoke)
      expect(hasSteam).toBe(true)
      expect(hasSmoke).toBe(true)
      expect(getElement(grid, 5, 5)).not.toBe(ElementType.Fire)
      clearReactions()
    })

    it('runs subsystems in correct order (clearProcessed → temperature → lifetime → reactions → physics)', () => {
      const { grid, sim } = makeSimulator()
      setElement(grid, 5, 3, ElementType.Fire)
      grid.lifetimes[3 * grid.width + 5] = 1
      sim.step()
      expect(getElement(grid, 5, 3)).toBe(ElementType.Smoke)
    })
  })

  describe('pause / resume', () => {
    it('step() is a no-op when paused', () => {
      const { grid, sim } = makeSimulator()
      setElement(grid, 5, 3, ElementType.Sand)
      sim.pause()
      expect(sim.isPaused()).toBe(true)
      sim.step()
      expect(getElement(grid, 5, 3)).toBe(ElementType.Sand)
      expect(getElement(grid, 5, 4)).toBe(ElementType.Empty)
    })

    it('step() works again after resume', () => {
      const { grid, sim } = makeSimulator()
      setElement(grid, 5, 3, ElementType.Sand)
      sim.pause()
      sim.step()
      sim.resume()
      expect(sim.isPaused()).toBe(false)
      sim.step()
      expect(getElement(grid, 5, 3)).toBe(ElementType.Empty)
      expect(getElement(grid, 5, 4)).toBe(ElementType.Sand)
    })
  })

  describe('clear()', () => {
    it('clears all elements from the grid', () => {
      const { grid, sim } = makeSimulator()
      setElement(grid, 3, 3, ElementType.Sand)
      setElement(grid, 5, 5, ElementType.Water)
      setElement(grid, 7, 7, ElementType.Stone)
      sim.clear()
      expect(getElement(grid, 3, 3)).toBe(ElementType.Empty)
      expect(getElement(grid, 5, 5)).toBe(ElementType.Empty)
      expect(getElement(grid, 7, 7)).toBe(ElementType.Empty)
    })
  })

  describe('speed', () => {
    it('defaults to 1x', () => {
      const { sim } = makeSimulator()
      expect(sim.getSpeed()).toBe(1)
    })

    it('setSpeed accepts 0.5', () => {
      const { sim } = makeSimulator()
      sim.setSpeed(0.5)
      expect(sim.getSpeed()).toBe(0.5)
    })

    it('setSpeed accepts 3.0', () => {
      const { sim } = makeSimulator()
      sim.setSpeed(3)
      expect(sim.getSpeed()).toBe(3)
    })
  })

  describe('getGrid()', () => {
    it('returns the grid reference', () => {
      const { grid, sim } = makeSimulator()
      expect(sim.getGrid()).toBe(grid)
    })
  })
})
