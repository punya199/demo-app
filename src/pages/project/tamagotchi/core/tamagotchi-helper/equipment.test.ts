import { describe, expect, it } from 'vitest'
import {
  compareEquipment,
  getEnhanceBlocker,
  describeSpecials,
  getEquipBlocker,
  describeStats,
} from '.'
import { EnumMonsterStage, IBattleStats, IEquipmentItem } from '../tamagotchi-interface'
import { monster } from './test-fixtures'

describe('describeStats', () => {
  it('lists only the non-zero stats', () => {
    expect(describeStats({ hp: 0, atk: 3, def: 0, spd: 2 })).toBe('+3 ATK · +2 SPD')
    expect(describeStats({})).toBe('')
  })
})

describe('describeSpecials', () => {
  it('lists the options with their percent, empty without any', () => {
    expect(
      describeSpecials([
        { key: 'slowHunger', value: 12 },
        { key: 'tidyPet', value: 20 },
      ])
    ).toBe('หิวช้าลง 12% · อึน้อยลง 20%')
    expect(describeSpecials([])).toBe('')
    expect(describeSpecials(undefined)).toBe('')
  })
})

describe('getEquipBlocker', () => {
  it('blocks gear changes while the monster is exploring', () => {
    expect(getEquipBlocker(monster())).toBeNull()
    expect(getEquipBlocker(null)).toBeNull()
    expect(getEquipBlocker(monster({ expeditionAreaId: 'meadow' }))).toBe('มอนออกสำรวจอยู่')
  })

  it('blocks a piece the monster is too young for', () => {
    const adult = monster()
    expect(getEquipBlocker(adult, { minStage: null })).toBeNull()
    expect(getEquipBlocker(adult, { minStage: EnumMonsterStage.ADULT })).toBeNull()
    expect(getEquipBlocker(adult, { minStage: EnumMonsterStage.PERFECT })).toMatch(/ถึง/)
    expect(
      getEquipBlocker(monster({ stage: EnumMonsterStage.FUSED }), {
        minStage: EnumMonsterStage.PERFECT,
      })
    ).toBeNull()
  })
})

describe('getEnhanceBlocker', () => {
  const item = {} as never
  const preview = {
    maxed: false as const,
    item,
    targetLevel: 6,
    baseRate: 0.8,
    rate: 0.8,
    onFail: 'material' as const,
    canProtect: false,
    cost: { coin: 360, stones: 2 },
  }
  const funds = { coin: 360, stones: 2, scrolls: 0 }

  it('needs enough coins, stones and (when asked) a scroll', () => {
    expect(getEnhanceBlocker(preview, funds, false)).toBeNull()
    expect(getEnhanceBlocker(preview, { ...funds, coin: 359 }, false)).toBe('เหรียญไม่พอ')
    expect(getEnhanceBlocker(preview, { ...funds, stones: 1 }, false)).toBe('หินตีบวกไม่พอ')
    expect(getEnhanceBlocker(preview, funds, true)).toBe('ไม่มีใบกันแตก')
    expect(getEnhanceBlocker({ maxed: true, item }, funds, false)).toBe('ตีบวกสูงสุดแล้ว')
  })
})

describe('compareEquipment', () => {
  const piece = (stats: Partial<IBattleStats>) =>
    ({ stats: { hp: 0, atk: 0, def: 0, spd: 0, ...stats } }) as IEquipmentItem

  it('lists what rises and falls against the worn piece, skipping unchanged stats', () => {
    expect(compareEquipment(piece({ atk: 8, hp: 5 }), piece({ atk: 5, def: 2, hp: 5 }))).toEqual([
      { key: 'atk', diff: 3 },
      { key: 'def', diff: -2 },
    ])
  })

  it('treats an empty slot as zero stats', () => {
    expect(compareEquipment(piece({ spd: 4 }), undefined)).toEqual([{ key: 'spd', diff: 4 }])
  })
})
