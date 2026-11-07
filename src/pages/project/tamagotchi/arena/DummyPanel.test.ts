import { describe, expect, it } from 'vitest'
import { parseMenuHash } from '../core/game-menu'
import { summaryRows } from '../core/tamagotchi-helper'

describe('training dummy', () => {
  it('has its own menu screen', () => {
    expect(parseMenuHash('dummy')).toBe('dummy')
  })

  it('summarises a fight, with a dash when nothing hit', () => {
    const rows = summaryRows({
      totalDamage: 300,
      seconds: 60,
      dps: 5,
      hits: 2,
      crits: 1,
      avgHit: 150,
      bestHit: { damage: 200, skill: 'A' },
    })
    expect(rows[0]).toEqual(['ดาเมจรวม', '300'])
    expect(rows[4][1]).toBe('200 (A)')
    expect(
      summaryRows({
        ...{ totalDamage: 0, seconds: 60, dps: 0, hits: 0, crits: 0, avgHit: 0 },
        bestHit: null,
      })[4][1]
    ).toBe('-')
  })
})
