import { describe, expect, it } from 'vitest'
import { createRng } from './rng'

describe('createRng', () => {
  it('yields the same sequence for the same seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    expect([a.int(1000), a.int(1000), a.int(1000)]).toEqual([b.int(1000), b.int(1000), b.int(1000)])
  })

  it('matches known mulberry32 output for seed 1', () => {
    // Literals from the public mulberry32 reference algorithm, seed 1.
    const r = createRng(1)
    expect([r.nextU32(), r.nextU32(), r.nextU32()]).toEqual([2693262067, 11749833, 2265367787])
  })

  it('int(n) stays in [0, n)', () => {
    const r = createRng(7)
    for (let i = 0; i < 1000; i++) {
      const v = r.int(6)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(6)
    }
  })

  it('can resume from a saved state', () => {
    const a = createRng(9)
    a.int(10)
    const b = createRng(0, a.state())
    expect(b.int(10)).toBe(a.int(10))
  })
})
