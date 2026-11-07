import { describe, expect, it } from 'vitest'
import {
  lineOptions,
  getMinigameBlocker,
  staminaFullInMinutes,
  countBagBySet,
  getBattleBlocker,
  getAdventureBlocker,
  minigameBarPosition,
  filterBag,
  getUseItemBlocker,
  getShopBlocker,
  elementLabel,
  isInZone,
  skipRunsAffordable,
  getExpeditionBlocker,
  getStaminaRefillBlocker,
} from '.'
import {
  EnumEquipmentGrade,
  EnumEquipmentSlot,
  EnumMonsterLine,
  EnumMonsterStage,
  IEquipmentItem,
} from '../tamagotchi-interface'
import { NOW, monster } from './test-fixtures'

describe('getBattleBlocker', () => {
  it('allows a ready monster and explains every refusal', () => {
    expect(getBattleBlocker(monster())).toBeNull()
    expect(getBattleBlocker(null)).toBe('ยังไม่มีมอน')
    expect(getBattleBlocker(monster({ isSick: true }))).toBe('ป่วยอยู่ สู้ไม่ได้')
  })

  it('still allows fighting with no strength', () => {
    expect(getBattleBlocker(monster({ strength: 0 }))).toBeNull()
  })
})

describe('getShopBlocker', () => {
  it('needs enough coins but no monster', () => {
    expect(getShopBlocker(15, 15)).toBeNull()
    expect(getShopBlocker(15, 14)).toBe('เหรียญไม่พอ')
  })
})

describe('getUseItemBlocker', () => {
  it('needs a hatched, living monster', () => {
    expect(getUseItemBlocker(monster())).toBeNull()
    expect(getUseItemBlocker(null)).toBe('ต้องมีมอนที่ฟักแล้ว')
    expect(getUseItemBlocker(monster({ stage: EnumMonsterStage.EGG }))).toBe('ต้องมีมอนที่ฟักแล้ว')
    expect(getUseItemBlocker(monster({ diedAt: '2026-01-01T00:00:00Z' }))).toBe(
      'ต้องมีมอนที่ฟักแล้ว'
    )
  })
})

describe('getBattleBlocker', () => {
  it('blocks a monster that is out on an expedition', () => {
    expect(getBattleBlocker(monster({ expeditionAreaId: 'meadow' }))).toBe('มอนออกสำรวจอยู่')
  })
})

describe('getExpeditionBlocker', () => {
  it('needs a healthy, fed monster at home and an unlocked area', () => {
    expect(getExpeditionBlocker(monster(), true)).toBeNull()
    expect(getExpeditionBlocker(monster(), false)).toBe('ชนะบอสพื้นที่ก่อนหน้าก่อน')
    expect(getExpeditionBlocker(monster({ isSick: true }), true)).toBe(
      'มอนป่วยหรือหิว ดูแลก่อนออกสำรวจ'
    )
    expect(getExpeditionBlocker(monster({ fullness: 0 }), true)).toBe(
      'มอนป่วยหรือหิว ดูแลก่อนออกสำรวจ'
    )
    expect(getExpeditionBlocker(monster({ expeditionAreaId: 'meadow' }), true)).toBe(
      'มอนออกสำรวจอยู่แล้ว'
    )
    expect(getExpeditionBlocker(null, true)).toBe('ต้องมีมอนที่ฟักแล้ว')
  })
})

describe('elements', () => {
  it('labels every element and offers an egg for each normal one', () => {
    for (const line of Object.values(EnumMonsterLine)) {
      expect(elementLabel[line]).toBeTruthy()
    }
    expect(lineOptions.map((option) => option.line)).toEqual(Object.values(EnumMonsterLine))
    expect(lineOptions.filter((option) => option.isRare).map((option) => option.line)).toEqual([
      EnumMonsterLine.HOLY,
      EnumMonsterLine.DARK,
      EnumMonsterLine.SHADOW,
    ])
  })
})

describe('adventure stamina helpers', () => {
  it('adds the stamina gate on top of the normal battle checks', () => {
    expect(getAdventureBlocker(monster({ stamina: 10 }), 10)).toBeNull()
    expect(getAdventureBlocker(monster({ stamina: 9.9 }), 10)).toBe(
      'Stamina ไม่พอ รอฟื้นหรือเติมก่อน'
    )
    expect(getAdventureBlocker(monster({ isSick: true, stamina: 0 }), 10)).toBe(
      'ป่วยอยู่ สู้ไม่ได้'
    )
  })

  it('works out when stamina is full again', () => {
    expect(staminaFullInMinutes(100, 100, 10)).toBe(0)
    expect(staminaFullInMinutes(70, 100, 10)).toBe(180)
    expect(staminaFullInMinutes(99.5, 100, 10)).toBe(3)
  })

  it('blocks the mini-game during its cooldown', () => {
    const readyAt = new Date(NOW.getTime() + 90_000).toISOString()
    expect(getMinigameBlocker(monster({ minigameReadyAt: readyAt }), NOW)).toBe(
      'เล่นได้อีกครั้งใน 2 นาที'
    )
    expect(getMinigameBlocker(monster(), NOW)).toBeNull()
    expect(getMinigameBlocker(monster({ stage: EnumMonsterStage.EGG }), NOW)).toBe(
      'ต้องมีมอนที่ฟักแล้ว'
    )
  })

  it('only allows a gem refill that can happen', () => {
    expect(getStaminaRefillBlocker(monster({ stamina: 100 }), 100, 99, 5)).toBe(
      'Stamina เต็มอยู่แล้ว'
    )
    expect(getStaminaRefillBlocker(monster({ stamina: 40 }), 100, 4, 5)).toBe('เพชรไม่พอ')
    expect(getStaminaRefillBlocker(monster({ stamina: 40 }), 100, 5, 5)).toBeNull()
  })

  it('sweeps the mini-game bar and checks the zone inclusively', () => {
    expect(minigameBarPosition(250, 1000)).toBe(50)
    expect(minigameBarPosition(500, 1000)).toBe(100)
    expect(minigameBarPosition(750, 1000)).toBe(50)
    expect(isInZone(40, { start: 40, width: 20 })).toBe(true)
    expect(isInZone(60.1, { start: 40, width: 20 })).toBe(false)
  })
})

describe('filterBag', () => {
  const item = (over: Partial<IEquipmentItem>) =>
    ({
      id: 'x',
      slot: EnumEquipmentSlot.WEAPON,
      grade: EnumEquipmentGrade.COMMON,
      enhanceLevel: 0,
      equipped: false,
      monsterId: null,
      ...over,
    }) as IEquipmentItem
  const bag = [
    item({ id: 'sword', grade: EnumEquipmentGrade.RARE, enhanceLevel: 1 }),
    item({ id: 'axe', grade: EnumEquipmentGrade.RARE, enhanceLevel: 5 }),
    item({ id: 'helm', slot: EnumEquipmentSlot.HELMET, grade: EnumEquipmentGrade.EPIC }),
    item({ id: 'worn', grade: EnumEquipmentGrade.LEGENDARY, equipped: true, monsterId: 'pet-2' }),
  ]

  it('keeps one slot type, best grade then highest level first', () => {
    expect(
      filterBag(bag, { slot: EnumEquipmentSlot.WEAPON, freeOnly: false }).map((i) => i.id)
    ).toEqual(['worn', 'axe', 'sword'])
    expect(filterBag(bag, { slot: 'all', freeOnly: false })).toHaveLength(4)
  })

  it('can hide pieces another pet is wearing', () => {
    expect(
      filterBag(bag, { slot: EnumEquipmentSlot.WEAPON, freeOnly: true }).map((i) => i.id)
    ).toEqual(['axe', 'sword'])
  })

  it('can keep only pieces the monster is evolved enough to wear', () => {
    const gated = [
      item({ id: 'free', minStage: null }),
      item({ id: 'adult', minStage: EnumMonsterStage.ADULT }),
      item({ id: 'perfect', minStage: EnumMonsterStage.PERFECT }),
      item({ id: 'worn', minStage: EnumMonsterStage.ADULT, equipped: true, monsterId: 'pet-2' }),
    ]
    const ids = (usableStage?: EnumMonsterStage) =>
      filterBag(gated, { slot: 'all', freeOnly: false, usableStage })
        .map((i) => i.id)
        .sort()
    expect(ids(EnumMonsterStage.ADULT)).toEqual(['adult', 'free', 'worn'])
    expect(ids(EnumMonsterStage.EGG)).toEqual(['free'])
    expect(ids(undefined)).toHaveLength(4)
  })
})

describe('bag set filter', () => {
  const piece = (id: string, setId: string | null, slot = EnumEquipmentSlot.WEAPON) =>
    ({
      id,
      setId,
      slot,
      grade: EnumEquipmentGrade.EPIC,
      enhanceLevel: 0,
      equipped: false,
    }) as IEquipmentItem
  const bag = [
    piece('a', 'bulwark'),
    piece('b', 'bulwark', EnumEquipmentSlot.HELMET),
    piece('c', 'blazing'),
    piece('d', null),
  ]

  it('keeps one set, or the pieces without a set, together with the slot filter', () => {
    const base = { slot: 'all' as const, freeOnly: false }
    expect(filterBag(bag, { ...base, setId: 'bulwark' }).map((i) => i.id)).toEqual(['a', 'b'])
    expect(filterBag(bag, { ...base, setId: 'none' }).map((i) => i.id)).toEqual(['d'])
    expect(filterBag(bag, { ...base, setId: 'all' })).toHaveLength(4)
    expect(
      filterBag(bag, { slot: EnumEquipmentSlot.HELMET, freeOnly: false, setId: 'bulwark' })
    ).toHaveLength(1)
  })

  it('counts pieces per set under the other filters', () => {
    expect(countBagBySet(bag, { slot: 'all', freeOnly: false })).toEqual({
      bulwark: 2,
      blazing: 1,
      none: 1,
    })
    expect(countBagBySet(bag, { slot: EnumEquipmentSlot.HELMET, freeOnly: false })).toEqual({
      bulwark: 1,
    })
  })
})

describe('skipRunsAffordable', () => {
  it('counts the runs the stamina pays for, up to the cap', () => {
    expect(skipRunsAffordable(100, 10, 10)).toBe(10)
    expect(skipRunsAffordable(35.6, 10, 10)).toBe(3)
    expect(skipRunsAffordable(9, 10, 10)).toBe(0)
    expect(skipRunsAffordable(500, 10, 10)).toBe(10)
  })
})
