// Seeded PRNG utility using mulberry32 algorithm

export interface RNG {
  next(): number // float in [0, 1)
  nextInt(min: number, max: number): number // integer in [min, max]
  nextBool(probability: number): boolean // true with given probability (0-1)
}

// mulberry32 implementation
function mulberry32(seed: number) {
  let t = seed >>> 0
  return function() {
    t += 0x6d2b79f5
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createRNG(seed: number): RNG {
  const seed32 = seed >>> 0
  const nextFloat = mulberry32(seed32)

  return {
    next(): number {
      return nextFloat()
    },

    nextInt(min: number, max: number): number {
      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        throw new TypeError('min and max must be finite numbers')
      }
      const imin = Math.floor(min)
      const imax = Math.floor(max)
      if (imax < imin) throw new RangeError('max must be >= min')
      const range = imax - imin + 1
      return Math.floor(this.next() * range) + imin
    },

    nextBool(probability: number): boolean {
      if (typeof probability !== 'number' || Number.isNaN(probability)) {
        throw new TypeError('probability must be a number')
      }
      if (probability <= 0) return false
      if (probability >= 1) return true
      return this.next() < probability
    },
  }
}

export const defaultRNG: RNG = createRNG(Date.now())
