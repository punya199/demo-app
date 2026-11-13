import { describe, expect, it } from 'vitest'
import { CORE_DAMAGE_PCT, CORE_RARITIES, CORE_SLOTS, ELEMENTS } from '../../../../td-sim/src'
import {
  canPromoteCore,
  coreBonusText,
  elementLabel,
  rarityLabel,
  slotCores,
  type ITdCore,
} from './td-core'

const core = (over: Partial<ITdCore> = {}): ITdCore => ({
  id: 'c1',
  element: 'fire',
  rarity: 'common',
  slot: null,
  promoteCost: { coins: 200, shards: 20 },
  ...over,
})

describe('labels', () => {
  it('name every element and rarity', () => {
    for (const e of ELEMENTS) expect(elementLabel(e)).toBeTruthy()
    for (const r of CORE_RARITIES) expect(rarityLabel(r)).toBeTruthy()
  })
})

describe('slotCores', () => {
  it('returns one entry per slot, holding the equipped core or null', () => {
    const a = core({ id: 'a', slot: 2 })
    const b = core({ id: 'b', slot: null })
    const slots = slotCores([a, b])
    expect(slots).toHaveLength(CORE_SLOTS)
    expect(slots[2]).toBe(a)
    expect(slots.filter((s) => s === null)).toHaveLength(CORE_SLOTS - 1)
  })
})

describe('canPromoteCore', () => {
  it('needs both materials, and a next tier', () => {
    expect(canPromoteCore(core(), { coins: 200, shards: 20 })).toBe(true)
    expect(canPromoteCore(core(), { coins: 199, shards: 20 })).toBe(false)
    expect(canPromoteCore(core(), { coins: 200, shards: 19 })).toBe(false)
    expect(canPromoteCore(core({ promoteCost: null }), { coins: 1e6, shards: 1e6 })).toBe(false)
  })
})

describe('coreBonusText', () => {
  it('shows the damage bonus of the rarity', () => {
    expect(coreBonusText(core({ rarity: 'legendary' }))).toContain(
      String(CORE_DAMAGE_PCT.legendary)
    )
  })
})
