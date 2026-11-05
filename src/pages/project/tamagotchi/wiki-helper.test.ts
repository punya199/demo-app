import { describe, expect, it } from 'vitest'
import {
  describeCareBonus,
  craftSetsUsing,
  describeCcSteps,
  fullSkipCoin,
  isCraftSet,
  splitStatuses,
} from './wiki-helper'
import type { IWikiData } from './tamagotchi-interface'

describe('describeCareBonus', () => {
  it('lists the perks, and is empty for a set without them', () => {
    expect(describeCareBonus({ slowHunger: 10, tidyPet: 15 })).toBe('หิวช้าลง 10% · อึน้อยลง 15%')
    expect(describeCareBonus(undefined)).toBe('')
  })
})

describe('isCraftSet', () => {
  it('tells craft sets from boss sets by the server list', () => {
    const wiki = { craft: { sets: [{ id: 'bulwark' }] } } as unknown as IWikiData
    expect(isCraftSet(wiki, 'bulwark')).toBe(true)
    expect(isCraftSet(wiki, 'blazing')).toBe(false)
  })
})

describe('splitStatuses', () => {
  it('splits buffs from debuffs and keeps the id and order', () => {
    const { debuffs, buffs } = splitStatuses({
      burn: { label: 'เผาไหม้', icon: '🔥', kind: 'debuff', note: 'x' },
      haste: { label: 'เร่ง', icon: '💨', kind: 'buff', note: 'y' },
      static: { label: 'ไฟฟ้าสถิต', icon: '⚡', kind: 'debuff', note: 'z' },
    })
    expect(debuffs.map((entry) => entry.id)).toEqual(['burn', 'static'])
    expect(buffs.map((entry) => entry.id)).toEqual(['haste'])
  })
})

describe('describeCcSteps / fullSkipCoin', () => {
  it('formats the crowd-control steps and the full skip price', () => {
    expect(describeCcSteps([100, 50, 0])).toBe('100% → 50% → ไม่ติด')
    expect(fullSkipCoin(300, 2)).toBe(600)
    expect(fullSkipCoin(800, 2)).toBe(1600)
  })
})

describe('craftSetsUsing', () => {
  it('finds the sets that use an essence, a core or a unique material', () => {
    const wiki = {
      craft: {
        sets: [
          { id: 'a', essence: 'flame', rare: 'forge', unique: null },
          { id: 'b', essence: 'tide', rare: 'rune', unique: 'storm_sigil' },
        ],
      },
    } as unknown as IWikiData
    expect(craftSetsUsing(wiki, 'craft_essence_flame').map((set) => set.id)).toEqual(['a'])
    expect(craftSetsUsing(wiki, 'craft_forge_core').map((set) => set.id)).toEqual(['a'])
    expect(craftSetsUsing(wiki, 'craft_rune_shard').map((set) => set.id)).toEqual(['b'])
    expect(craftSetsUsing(wiki, 'craft_unique_storm_sigil').map((set) => set.id)).toEqual(['b'])
    expect(craftSetsUsing(wiki, 'craft_catalyst')).toEqual([])
  })
})
