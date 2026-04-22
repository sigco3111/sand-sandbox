import { describe, it, expect } from 'vitest'
import { createGrid, getElement, setElement, getIndex, clearProcessed } from '../grid'
import { ElementType } from '../types'
import { createRNG } from '../random'
import { updatePhysics } from '../physics'

function findElement(grid: ReturnType<typeof createGrid>, type: ElementType): { x: number; y: number } | null {
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      if (getElement(grid, x, y) === type) return { x, y }
    }
  }
  return null
}

describe('Physics - updatePhysics', () => {
  function makeGrid(width = 10, height = 10) {
    return createGrid(width, height)
  }

  describe('Sand (Powder)', () => {
    it('falls 1 cell per frame', () => {
      const grid = makeGrid()
      setElement(grid, 5, 3, ElementType.Sand)
      updatePhysics(grid, createRNG(42))
      expect(getElement(grid, 5, 3)).toBe(ElementType.Empty)
      expect(getElement(grid, 5, 4)).toBe(ElementType.Sand)
    })

    it('slides diagonally when blocked below', () => {
      const grid = makeGrid()
      setElement(grid, 5, 4, ElementType.Sand)
      setElement(grid, 5, 5, ElementType.Wall)
      updatePhysics(grid, createRNG(42))
      expect(getElement(grid, 5, 4)).toBe(ElementType.Empty)
      const atLeft = getElement(grid, 4, 5)
      const atRight = getElement(grid, 6, 5)
      expect(atLeft === ElementType.Sand || atRight === ElementType.Sand).toBe(true)
    })

    it('stops at grid bottom', () => {
      const grid = makeGrid()
      const bottomY = grid.height - 1
      setElement(grid, 5, bottomY, ElementType.Sand)
      updatePhysics(grid, createRNG(42))
      expect(getElement(grid, 5, bottomY)).toBe(ElementType.Sand)
    })
  })

  describe('Water (Liquid)', () => {
    it('falls 1 cell per frame', () => {
      const grid = makeGrid()
      setElement(grid, 5, 3, ElementType.Water)
      updatePhysics(grid, createRNG(42))
      expect(getElement(grid, 5, 3)).toBe(ElementType.Empty)
      expect(getElement(grid, 5, 4)).toBe(ElementType.Water)
    })

    it('spreads horizontally on floor', () => {
      const grid = makeGrid()
      const bottomY = grid.height - 1
      setElement(grid, 5, bottomY, ElementType.Water)
      updatePhysics(grid, createRNG(42))
      expect(getElement(grid, 5, bottomY)).toBe(ElementType.Empty)
      const atLeft = getElement(grid, 4, bottomY)
      const atRight = getElement(grid, 6, bottomY)
      expect(atLeft === ElementType.Water || atRight === ElementType.Water).toBe(true)
    })
  })

  describe('Stone (Solid)', () => {
    it('does not move', () => {
      const grid = makeGrid()
      setElement(grid, 5, 3, ElementType.Stone)
      updatePhysics(grid, createRNG(42))
      expect(getElement(grid, 5, 3)).toBe(ElementType.Stone)
    })
  })

  describe('Wall (Solid)', () => {
    it('does not move and blocks sand from falling through', () => {
      const grid = makeGrid()
      setElement(grid, 5, 3, ElementType.Wall)
      setElement(grid, 5, 2, ElementType.Sand)
      updatePhysics(grid, createRNG(42))
      expect(getElement(grid, 5, 3)).toBe(ElementType.Wall)
      expect(getElement(grid, 5, 2)).toBe(ElementType.Empty)
      const atLeft = getElement(grid, 4, 3)
      const atRight = getElement(grid, 6, 3)
      expect(atLeft === ElementType.Sand || atRight === ElementType.Sand).toBe(true)
    })
  })

  describe('Density displacement', () => {
    it('swaps Sand down through Water', () => {
      const grid = makeGrid()
      setElement(grid, 5, 4, ElementType.Sand)
      setElement(grid, 5, 5, ElementType.Water)
      setElement(grid, 4, 5, ElementType.Wall)
      setElement(grid, 6, 5, ElementType.Wall)
      setElement(grid, 4, 6, ElementType.Wall)
      setElement(grid, 5, 6, ElementType.Wall)
      setElement(grid, 6, 6, ElementType.Wall)
      updatePhysics(grid, createRNG(42))
      expect(getElement(grid, 5, 4)).toBe(ElementType.Water)
      expect(getElement(grid, 5, 5)).toBe(ElementType.Sand)
    })

    it('swaps Water down through Oil', () => {
      const grid = makeGrid()
      setElement(grid, 5, 4, ElementType.Water)
      setElement(grid, 5, 5, ElementType.Oil)
      setElement(grid, 4, 5, ElementType.Wall)
      setElement(grid, 6, 5, ElementType.Wall)
      setElement(grid, 4, 6, ElementType.Wall)
      setElement(grid, 5, 6, ElementType.Wall)
      setElement(grid, 6, 6, ElementType.Wall)
      updatePhysics(grid, createRNG(42))
      expect(getElement(grid, 5, 4)).toBe(ElementType.Oil)
      expect(getElement(grid, 5, 5)).toBe(ElementType.Water)
    })
  })

  describe('Processed flag', () => {
    it('marks target cell and prevents double-moves', () => {
      const grid = makeGrid()
      setElement(grid, 5, 3, ElementType.Sand)
      updatePhysics(grid, createRNG(42))
      expect(getElement(grid, 5, 4)).toBe(ElementType.Sand)
      expect(getElement(grid, 5, 5)).toBe(ElementType.Empty)
      expect(grid.processed[getIndex(5, 4, grid.width)]).toBe(1)
    })
  })
})

describe('Phase 2 Physics', () => {
  function makeGrid(width = 10, height = 10) {
    return createGrid(width, height)
  }

  describe('Fire (Gas)', () => {
    it('rises upward', () => {
      const grid = makeGrid()
      setElement(grid, 5, 8, ElementType.Fire)
      updatePhysics(grid, createRNG(42))
      const pos = findElement(grid, ElementType.Fire)
      expect(pos).not.toBeNull()
      expect(pos!.y).toBeLessThan(8)
    })

    it('drifts horizontally', () => {
      let drifted = false
      for (let seed = 0; seed < 50; seed++) {
        const grid = makeGrid()
        setElement(grid, 5, 5, ElementType.Fire)
        updatePhysics(grid, createRNG(seed))
        const pos = findElement(grid, ElementType.Fire)
        if (pos && pos.x !== 5) {
          drifted = true
          break
        }
      }
      expect(drifted).toBe(true)
    })

    it('disappears at top of grid', () => {
      const grid = makeGrid()
      setElement(grid, 5, 0, ElementType.Fire)
      updatePhysics(grid, createRNG(42))
      expect(getElement(grid, 5, 0)).toBe(ElementType.Empty)
    })
  })

  describe('Steam (Gas)', () => {
    it('rises upward', () => {
      const grid = makeGrid(10, 20)
      setElement(grid, 5, 15, ElementType.Steam)
      const rng = createRNG(42)
      for (let i = 0; i < 10; i++) {
        updatePhysics(grid, rng)
      }
      const pos = findElement(grid, ElementType.Steam)
      expect(pos).not.toBeNull()
      expect(pos!.y).toBeLessThan(15)
    })

    it('moves slower than Fire', () => {
      const steamGrid = makeGrid(10, 20)
      const fireGrid = makeGrid(10, 20)

      setElement(steamGrid, 5, 19, ElementType.Steam)
      setElement(fireGrid, 5, 19, ElementType.Fire)

      const steamRng = createRNG(42)
      const fireRng = createRNG(42)

      for (let i = 0; i < 10; i++) {
        updatePhysics(steamGrid, steamRng)
        updatePhysics(fireGrid, fireRng)
      }

      const steamPos = findElement(steamGrid, ElementType.Steam)
      const firePos = findElement(fireGrid, ElementType.Fire)

      expect(firePos).not.toBeNull()
      expect(steamPos).not.toBeNull()
      expect(firePos!.y).toBeLessThan(steamPos!.y)
    })
  })

  describe('Smoke (Gas)', () => {
    it('rises upward slowly', () => {
      const grid = makeGrid(10, 20)
      setElement(grid, 5, 15, ElementType.Smoke)
      const rng = createRNG(42)
      for (let i = 0; i < 20; i++) {
        updatePhysics(grid, rng)
      }
      const pos = findElement(grid, ElementType.Smoke)
      expect(pos).not.toBeNull()
      expect(pos!.y).toBeLessThan(15)
    })
  })

  describe('Oil (Liquid)', () => {
    it('floats on Water (density displacement)', () => {
      const grid = makeGrid()
      setElement(grid, 5, 3, ElementType.Water)
      setElement(grid, 5, 4, ElementType.Water)
      setElement(grid, 5, 5, ElementType.Oil)
      setElement(grid, 4, 5, ElementType.Wall)
      setElement(grid, 6, 5, ElementType.Wall)
      setElement(grid, 5, 6, ElementType.Wall)
      setElement(grid, 4, 6, ElementType.Wall)
      setElement(grid, 6, 6, ElementType.Wall)
      updatePhysics(grid, createRNG(42))

      const oilPos = findElement(grid, ElementType.Oil)
      expect(oilPos).not.toBeNull()
      expect(oilPos!.y).toBeLessThan(5)
    })
  })

  describe('Lava (Liquid)', () => {
    it('skips movement 50% of the time via rng check', () => {
      const grid = makeGrid()
      setElement(grid, 5, 5, ElementType.Lava)
      const rng = createRNG(42)
      let moved = 0
      let stayed = 0

      for (let i = 0; i < 100; i++) {
        setElement(grid, 5, 5, ElementType.Lava)
        updatePhysics(grid, rng)
        if (getElement(grid, 5, 5) !== ElementType.Lava) {
          moved++
        } else {
          stayed++
        }
      }

      expect(moved).toBeGreaterThan(0)
      expect(stayed).toBeGreaterThan(0)
    })
  })

  describe('Spark (Gas)', () => {
    it('rises fast with wide drift', () => {
      const grid = makeGrid(10, 20)
      setElement(grid, 5, 19, ElementType.Spark)
      const rng = createRNG(42)
      for (let i = 0; i < 5; i++) {
        updatePhysics(grid, rng)
      }
      const pos = findElement(grid, ElementType.Spark)
      expect(pos).not.toBeNull()
      expect(pos!.y).toBeLessThan(19)
    })
  })
})

describe('Phase 3 Physics', () => {
  function makeGrid(width = 10, height = 10) {
    return createGrid(width, height)
  }

  describe('Plant (Solid)', () => {
    it('grows upward when adjacent to Water', () => {
      let grew = false
      for (let seed = 0; seed < 200; seed++) {
        const grid = makeGrid()
        setElement(grid, 5, 5, ElementType.Plant)
        setElement(grid, 6, 5, ElementType.Water)
        setElement(grid, 6, 6, ElementType.Wall)
        const rng = createRNG(seed)
        for (let i = 0; i < 100; i++) {
          updatePhysics(grid, rng)
        }
        if (getElement(grid, 5, 4) === ElementType.Plant) {
          grew = true
          break
        }
      }
      expect(grew).toBe(true)
    })

    it('growth consumes Water', () => {
      let consumed = false
      for (let seed = 0; seed < 200; seed++) {
        const grid = makeGrid()
        setElement(grid, 5, 5, ElementType.Plant)
        setElement(grid, 6, 5, ElementType.Water)
        setElement(grid, 6, 6, ElementType.Wall)
        const rng = createRNG(seed)
        for (let i = 0; i < 100; i++) {
          updatePhysics(grid, rng)
        }
        if (getElement(grid, 6, 5) === ElementType.Empty) {
          consumed = true
          break
        }
      }
      expect(consumed).toBe(true)
    })

    it('does not grow without adjacent Water', () => {
      const grid = makeGrid()
      setElement(grid, 5, 5, ElementType.Plant)
      setElement(grid, 6, 5, ElementType.Wall)
      setElement(grid, 4, 5, ElementType.Wall)
      setElement(grid, 5, 4, ElementType.Wall)
      setElement(grid, 5, 6, ElementType.Wall)
      const rng = createRNG(42)
      for (let i = 0; i < 100; i++) {
        updatePhysics(grid, rng)
      }
      const plantCount = grid.elements.filter(e => e === ElementType.Plant).length
      expect(plantCount).toBe(1)
    })
  })
})

describe('Phase 4 Physics - Clone Element', () => {
  function makeGrid(width = 10, height = 10) {
    return createGrid(width, height)
  }

  it('detects and stores a valid source', () => {
    const grid = makeGrid()
    setElement(grid, 5, 5, ElementType.Clone)
    setElement(grid, 6, 5, ElementType.Water)
    setElement(grid, 6, 6, ElementType.Wall)
    updatePhysics(grid, createRNG(42))
    const idx = getIndex(5, 5, grid.width)
    expect(grid.temperatures[idx]).toBe(ElementType.Water)
  })

  it('emits the stored source upward every 5 frames', () => {
    const grid = makeGrid()
    setElement(grid, 5, 5, ElementType.Clone)
    setElement(grid, 6, 5, ElementType.Water)
    setElement(grid, 6, 6, ElementType.Wall)
    const rng = createRNG(42)
    updatePhysics(grid, rng)
    let emitted = false
    for (let i = 0; i < 10; i++) {
      updatePhysics(grid, rng)
      if (getElement(grid, 5, 4) === ElementType.Water) {
        emitted = true
        break
      }
    }
    expect(emitted).toBe(true)
  })

  it('does not emit if no valid source is adjacent', () => {
    const grid = makeGrid()
    setElement(grid, 5, 5, ElementType.Clone)
    setElement(grid, 5, 6, ElementType.Wall)
    setElement(grid, 4, 5, ElementType.Stone)
    setElement(grid, 6, 5, ElementType.Clone)
    setElement(grid, 6, 6, ElementType.Wall)
    const rng = createRNG(42)
    for (let i = 0; i < 10; i++) {
      updatePhysics(grid, rng)
      if (getElement(grid, 5, 4) !== ElementType.Empty) {
        break
      }
    }
    expect(getElement(grid, 5, 4)).toBe(ElementType.Empty)
  })

  it('does not select invalid sources', () => {
    const grid = makeGrid()
    setElement(grid, 5, 5, ElementType.Clone)
    setElement(grid, 5, 6, ElementType.Wall)
    setElement(grid, 4, 5, ElementType.Stone)
    setElement(grid, 6, 5, ElementType.Clone)
    setElement(grid, 6, 6, ElementType.Wall)
    updatePhysics(grid, createRNG(42))
    const idx = getIndex(5, 5, grid.width)
    expect(grid.temperatures[idx]).toBe(20)
  })
})
