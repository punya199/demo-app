import { describe, expect, it } from 'vitest'
import { START_GOLD, SUMMON_COST, TILE_COUNT } from './config'
import { createState, step } from './sim'

describe('summon', () => {
  it('spends run-gold and puts a gear on the chosen free tile', () => {
    const s = step(createState(1), [{ tick: 0, type: 'summon', tile: 7 }])
    expect(s.gears).toHaveLength(1)
    expect(s.gears[0].tile).toBe(7)
    expect(s.gold).toBeLessThanOrEqual(START_GOLD - SUMMON_COST + 1) // income may add 1
    expect(s.gold).toBeGreaterThanOrEqual(START_GOLD - SUMMON_COST)
  })

  it('is ignored when the tile is taken, off the board, or gold is short', () => {
    const once = step(createState(1), [{ tick: 0, type: 'summon', tile: 7 }])
    const taken = step(once, [{ tick: 1, type: 'summon', tile: 7 }])
    expect(taken.gears).toHaveLength(1)
    const off = step(createState(1), [{ tick: 0, type: 'summon', tile: TILE_COUNT }])
    expect(off.gears).toHaveLength(0)
    const broke = step({ ...createState(1), gold: SUMMON_COST - 1 }, [
      { tick: 0, type: 'summon', tile: 0 },
    ])
    expect(broke.gears).toHaveLength(0)
  })
})
