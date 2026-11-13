import { describe, expect, it } from 'vitest'
import { GOLDEN_HASH, GOLDEN_REPLAY } from './golden'
import { hashState, runReplay } from './sim'

describe('runReplay', () => {
  it('is deterministic for the same seed and inputs', () => {
    const a = runReplay({ seed: 5, ticks: 100, inputs: [] })
    const b = runReplay({ seed: 5, ticks: 100, inputs: [] })
    expect(hashState(a)).toBe(hashState(b))
  })

  it('differs for a different seed', () => {
    const a = runReplay({ seed: 5, ticks: 100, inputs: [] })
    const b = runReplay({ seed: 6, ticks: 100, inputs: [] })
    expect(hashState(a)).not.toBe(hashState(b))
  })

  it('runs exactly the requested number of ticks', () => {
    expect(runReplay({ seed: 1, ticks: 37, inputs: [] }).tick).toBe(37)
  })

  it('applies a spend input and ignores an unaffordable one', () => {
    const base = runReplay({ seed: 1, ticks: 50, inputs: [] })
    const spent = runReplay({
      seed: 1,
      ticks: 50,
      inputs: [{ tick: 10, type: 'spend', amount: 5 }],
    })
    expect(spent.gold).toBeLessThan(base.gold)
    const broke = runReplay({
      seed: 1,
      ticks: 50,
      inputs: [{ tick: 0, type: 'spend', amount: 1e6 }],
    })
    expect(broke.gold).toBe(base.gold)
  })

  it('rejects a replay longer than the tick cap', () => {
    expect(() => runReplay({ seed: 1, ticks: 101, inputs: [] }, { maxTicks: 100 })).toThrow(
      RangeError
    )
  })

  it('rejects malformed input logs', () => {
    const bad = (inputs: unknown[]) =>
      runReplay({ seed: 1, ticks: 20, inputs: inputs as never }, { maxTicks: 100 })
    expect(() =>
      bad([
        { tick: 5, type: 'spend', amount: 1 },
        { tick: 4, type: 'spend', amount: 1 },
      ])
    ).toThrow(RangeError)
    expect(() => bad([{ tick: 20, type: 'spend', amount: 1 }])).toThrow(RangeError)
    expect(() => bad([{ tick: 1.5, type: 'spend', amount: 1 }])).toThrow(RangeError)
    expect(() => bad([{ tick: 1, type: 'spend', amount: -1 }])).toThrow(RangeError)
    expect(() => bad([{ tick: 1, type: 'bogus', amount: 1 }])).toThrow(RangeError)
  })

  it('matches the golden replay hash', () => {
    expect(hashState(runReplay(GOLDEN_REPLAY))).toBe(GOLDEN_HASH)
  })
})
