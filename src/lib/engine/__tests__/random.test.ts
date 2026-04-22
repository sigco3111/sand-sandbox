import { describe, it, expect } from 'vitest'
import { createRNG } from '../random'

describe('seeded RNG (mulberry32)', () => {
  it('is deterministic for same seed', () => {
    const a = createRNG(42)
    const b = createRNG(42)
    expect(a.next()).toBe(b.next())
    expect(a.next()).toBe(b.next())
    expect(a.next()).toBe(b.next())
  })

  it('next() returns values in [0,1)', () => {
    const r = createRNG(123)
    for (let i = 0; i < 1000; i++) {
      const v = r.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('nextInt(min, max) returns integers in [min, max]', () => {
    const r = createRNG(7)
    for (let i = 0; i < 1000; i++) {
      const v = r.nextInt(1, 10)
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeGreaterThanOrEqual(1)
      expect(v).toBeLessThanOrEqual(10)
    }
  })

  it('nextBool(1.0) always true and nextBool(0.0) always false', () => {
    const r = createRNG(999)
    for (let i = 0; i < 100; i++) {
      expect(r.nextBool(1.0)).toBe(true)
      expect(r.nextBool(0.0)).toBe(false)
    }
  })

  it('nextBool(0.5) distribution approx 50%', () => {
    const r = createRNG(2023)
    let trues = 0
    const N = 1000
    for (let i = 0; i < N; i++) {
      if (r.nextBool(0.5)) trues++
    }
    const ratio = (trues / N) * 100
    expect(ratio).toBeGreaterThanOrEqual(40)
    expect(ratio).toBeLessThanOrEqual(60)
  })

  it('different seeds produce different sequences', () => {
    const a = createRNG(1)
    const b = createRNG(2)
    let allSame = true
    for (let i = 0; i < 10; i++) {
      if (a.next() !== b.next()) {
        allSame = false
        break
      }
    }
    expect(allSame).toBe(false)
  })
})
