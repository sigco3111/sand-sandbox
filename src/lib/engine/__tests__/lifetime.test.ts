import { describe, it, expect } from 'vitest'
import { ElementType } from '../types'
import { Grid, getIndex } from '../grid'
import { initLifetime, updateLifetime, INITIAL_LIFETIMES } from '../lifetime'

function makeGrid(w = 4, h = 4): Grid {
  return {
    elements: new Uint8Array(w * h),
    lifetimes: new Uint8Array(w * h),
    width: w,
    height: h,
  }
}

describe('lifetime system', () => {
  it('initLifetime sets correct values for Fire and Spark', () => {
    const g = makeGrid()
    initLifetime(g, 1, 1, ElementType.Fire)
    initLifetime(g, 2, 2, ElementType.Spark)
    const fIdx = getIndex(1, 1, g.width)
    const sIdx = getIndex(2, 2, g.width)
    expect(g.lifetimes[fIdx]).toBe(INITIAL_LIFETIMES[ElementType.Fire])
    expect(g.lifetimes[sIdx]).toBe(INITIAL_LIFETIMES[ElementType.Spark])
  })

  it('Fire decays to Smoke after 30 frames', () => {
    const g = makeGrid()
    // place fire at 0,0
    g.elements[0] = ElementType.Fire
    initLifetime(g, 0, 0, ElementType.Fire)
    for (let i = 0; i < 30; i++) updateLifetime(g)
    expect(g.elements[0]).toBe(ElementType.Smoke)
  })

  it('Spark decays to Empty after 10 frames', () => {
    const g = makeGrid()
    g.elements[0] = ElementType.Spark
    initLifetime(g, 0, 0, ElementType.Spark)
    for (let i = 0; i < 10; i++) updateLifetime(g)
    expect(g.elements[0]).toBe(ElementType.Empty)
  })

  it('Steam decays to Water after 100 frames', () => {
    const g = makeGrid()
    g.elements[0] = ElementType.Steam
    // set deterministic lifetime 100 for test
    g.lifetimes[0] = 100
    for (let i = 0; i < 100; i++) updateLifetime(g)
    expect(g.elements[0]).toBe(ElementType.Water)
  })

  it('Smoke decays to Empty after 60 frames', () => {
    const g = makeGrid()
    g.elements[0] = ElementType.Smoke
    // set deterministic lifetime 60 for test
    g.lifetimes[0] = 60
    for (let i = 0; i < 60; i++) updateLifetime(g)
    expect(g.elements[0]).toBe(ElementType.Empty)
  })

  it('Sand unchanged after many frames', () => {
    const g = makeGrid()
    g.elements[0] = ElementType.Sand
    for (let i = 0; i < 100; i++) updateLifetime(g)
    expect(g.elements[0]).toBe(ElementType.Sand)
  })
})
