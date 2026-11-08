import { describe, expect, it } from 'vitest'
import {
  describeBattleEvent,
  gradeLabel,
  gradeColor,
  describeSetEffect,
  signed,
  isSetComplete,
  isWornBy,
  foldSelectedMonster,
  setPieceLabel,
  getCostumeBuyBlocker,
  petLabel,
  getReturnHomeBlocker,
  getMergeBlocker,
  isSetTierActive,
  resolveLoadout,
  missingMaterials,
  formatCountdown,
  potentialPercent,
  describeSetTier,
  describeCostumePrice,
  findMergeForm,
} from '.'
import {
  EnumEquipmentGrade,
  EnumMonsterLine,
  EnumMonsterStage,
  IBattleData,
  IBattleEvent,
  ICostume,
  ICostumeState,
  EnumCostumeSlot,
  IEquipmentItem,
  ISetProgress,
  IMergeForm,
  IMonsterData,
} from '../tamagotchi-interface'
import { NOW, monster } from './test-fixtures'

describe('merge helpers', () => {
  const cost = { coin: 2000, gem: 20 }
  const rich = { coin: 5000, gem: 50 }
  const ultimate = (over: Partial<IMonsterData> = {}) =>
    monster({ stage: EnumMonsterStage.ULTIMATE, ...over })

  it('finds the form for a pair of lines in either order', () => {
    const forms = [
      { id: 'a', lines: [EnumMonsterLine.FLAME, EnumMonsterLine.TIDE] },
      { id: 'b', lines: [EnumMonsterLine.LEAF, EnumMonsterLine.LEAF] },
    ] as IMergeForm[]
    expect(findMergeForm(forms, EnumMonsterLine.TIDE, EnumMonsterLine.FLAME)?.id).toBe('a')
    expect(findMergeForm(forms, EnumMonsterLine.LEAF, EnumMonsterLine.LEAF)?.id).toBe('b')
    expect(findMergeForm(forms, EnumMonsterLine.LEAF, EnumMonsterLine.TIDE)).toBeUndefined()
  })

  it('explains what blocks a merge, in the order the server checks', () => {
    const a = ultimate({ id: 'a' })
    const b = ultimate({ id: 'b' })
    expect(getMergeBlocker(a, undefined, rich, cost)).toBe('เลือกมอนสองตัว')
    expect(getMergeBlocker(a, monster({ stage: EnumMonsterStage.PERFECT }), rich, cost)).toBe(
      'ต้องเป็นร่างสูงสุด (ยังไม่ใช่ร่างสุดท้าย)'
    )
    expect(getMergeBlocker(a, ultimate({ isSick: true }), rich, cost)).toBe('ป่วยอยู่')
    expect(getMergeBlocker(a, ultimate({ expeditionAreaId: 'meadow' }), rich, cost)).toBe(
      'ออกสำรวจอยู่'
    )
    expect(getMergeBlocker(a, b, { coin: 1999, gem: 50 }, cost)).toBe('เหรียญไม่พอ')
    expect(getMergeBlocker(a, b, { coin: 5000, gem: 19 }, cost)).toBe('เพชรไม่พอ')
    expect(getMergeBlocker(a, b, rich, cost)).toBeNull()
    const tide = ultimate({ line: EnumMonsterLine.TIDE })
    expect(getMergeBlocker(a, tide, rich, cost, [], false)).toBe(
      'ตอนนี้รวมร่างได้เฉพาะมอนสายเดียวกัน'
    )
    expect(getMergeBlocker(a, b, rich, cost, [], false)).toBeNull()
    const spirit = [EnumMonsterLine.HOLY, EnumMonsterLine.DARK, EnumMonsterLine.SHADOW]
    expect(getMergeBlocker(a, ultimate({ line: EnumMonsterLine.HOLY }), rich, cost, spirit)).toBe(
      'ธาตุธรรมชาติกับธาตุจิตวิญญาณรวมกันไม่ได้'
    )
    expect(
      getMergeBlocker(
        ultimate({ line: EnumMonsterLine.DARK }),
        ultimate({ line: EnumMonsterLine.HOLY }),
        rich,
        cost,
        spirit
      )
    ).toBeNull()
  })
})

describe('potential helpers', () => {
  it('places a rolled value inside its range, and a fixed stat at 0', () => {
    expect(potentialPercent({ min: 100, max: 120, value: 115 })).toBe(75)
    expect(potentialPercent({ min: 5, max: 5, value: 5 })).toBe(0)
  })

  it('signs the breakdown numbers', () => {
    expect(signed(3)).toBe('+3')
    expect(signed(-2.5)).toBe('−2.5')
    expect(signed(0)).toBe('+0')
  })

  it('describes a dodged hit', () => {
    const battle = {
      player: { name: 'A' },
      enemy: { name: 'B' },
    } as IBattleData
    const event = { actor: 'player', isDodged: true, damage: 0 } as IBattleEvent
    expect(describeBattleEvent(event, battle)).toBe('B หลบการโจมตีของ A ได้')
  })
})

describe('foldSelectedMonster', () => {
  const pet = (id: string, over: Partial<IMonsterData> = {}) => monster({ id, ...over })
  const cached = (...pets: IMonsterData[]) => ({ monster: pets[0], monsters: pets, maxMonsters: 4 })

  it('keeps the old pets when a new egg is hatched, and selects the new one', () => {
    const old = cached(pet('a'), pet('b'))
    const next = foldSelectedMonster(old, pet('c'))
    expect(next.monsters.map((row) => row.id)).toEqual(['a', 'b', 'c'])
    expect(next.monster?.id).toBe('c')
  })

  it('replaces a pet in place when it is updated, without duplicating it', () => {
    const old = cached(pet('a'), pet('b'))
    const next = foldSelectedMonster(old, pet('b', { poops: 3 }))
    expect(next.monsters).toHaveLength(2)
    expect(next.monsters[1].poops).toBe(3)
    expect(next.monster?.id).toBe('b')
  })

  it('starts a list when nothing was cached yet', () => {
    expect(foldSelectedMonster(undefined, pet('a')).monsters.map((row) => row.id)).toEqual(['a'])
  })
})

describe('isWornBy', () => {
  const piece = (over: Partial<IEquipmentItem>) =>
    ({ equipped: true, monsterId: 'a', ...over }) as IEquipmentItem

  it('only counts a piece as worn for the pet that wears it', () => {
    expect(isWornBy(piece({}), 'a')).toBe(true)
    expect(isWornBy(piece({}), 'b')).toBe(false)
    expect(isWornBy(piece({ equipped: false, monsterId: null }), 'a')).toBe(false)
  })
})

describe('petLabel', () => {
  it('puts the nickname first and keeps the species name', () => {
    expect(petLabel('Sun King', 'Mochi')).toBe('Mochi (Sun King)')
    expect(petLabel('Sun King', null)).toBe('Sun King')
  })
})

describe('costumes', () => {
  const costume = (over: Partial<ICostume>): ICostume => ({
    id: 'cap',
    slot: EnumCostumeSlot.HAT,
    name: 'หมวก',
    emoji: '🧢',
    rarity: EnumEquipmentGrade.COMMON,
    theme: null,
    price: { currency: 'coin', amount: 150 },
    ...over,
  })
  const state = (owned: string[] = []): ICostumeState => ({
    catalog: [],
    owned,
    themes: [],
    selectedId: null,
    pets: [],
    showCostume: true,
  })
  const NOW = new Date('2026-06-01T00:00:00Z')

  it('resolves a loadout against the catalog and skips unknown or misplaced ids', () => {
    const hat = costume({})
    const face = costume({ id: 'shades', slot: EnumCostumeSlot.FACE, emoji: '🕶️' })
    const layers = resolveLoadout({ hat: 'cap', face: 'cap', back: 'nope' }, [hat, face])
    expect(layers).toEqual({ hat })
    expect(resolveLoadout(null, [hat])).toEqual({})
    expect(resolveLoadout({ hat: 'cap' }, undefined)).toEqual({})
  })

  it('writes each price source in Thai', () => {
    expect(describeCostumePrice(costume({}))).toBe('🪙 150')
    expect(describeCostumePrice(costume({ price: { currency: 'gem', amount: 40 } }))).toBe('💎 40')
    expect(describeCostumePrice(costume({ price: { currency: 'season', amount: 0 } }))).toBe(
      'รางวัลซีซัน PvP'
    )
    expect(describeCostumePrice(costume({ price: { currency: 'coin', amount: 0 } }))).toBe('ฟรี')
  })

  it('explains why a costume cannot be bought', () => {
    expect(getCostumeBuyBlocker(costume({}), state(['cap']), 999, 0, NOW)).toBe('มีแล้ว')
    expect(getCostumeBuyBlocker(costume({}), state(), 100, 0, NOW)).toBe('เหรียญไม่พอ')
    expect(
      getCostumeBuyBlocker(
        costume({ price: { currency: 'gem', amount: 40 } }),
        state(),
        999,
        10,
        NOW
      )
    ).toBe('เพชรไม่พอ')
    expect(
      getCostumeBuyBlocker(
        costume({ price: { currency: 'season', amount: 0 } }),
        state(),
        999,
        99,
        NOW
      )
    ).toMatch(/ซีซัน/)
    expect(
      getCostumeBuyBlocker(costume({ endsAt: '2026-05-01T00:00:00Z' }), state(), 999, 99, NOW)
    ).toBe('หมดเวลาจำหน่ายแล้ว')
    expect(getCostumeBuyBlocker(costume({}), state(), 150, 0, NOW)).toBeNull()
  })
})

describe('set progress labels', () => {
  const set = (worn: number): ISetProgress => ({
    setId: 'blazing',
    name: 'ชุดเพลิงกัลป์',
    pieceCount: 4,
    worn,
    isEnhanced: false,
    tiers: [
      { pieces: 2, pct: { atk: 0.15 }, effect: null },
      { pieces: 4, pct: null, effect: { burnTurns: 3 } },
    ],
  })

  it('writes worn/full next to the set name', () => {
    expect(setPieceLabel(set(2))).toBe('ชุดเพลิงกัลป์ 2/4')
  })

  it('is green (complete) only when every piece of the set is worn', () => {
    expect(isSetComplete(set(0))).toBe(false)
    expect(isSetComplete(set(3))).toBe(false)
    expect(isSetComplete(set(4))).toBe(true)
  })

  it('turns a tier on from its piece count', () => {
    const [two, four] = set(2).tiers
    expect(isSetTierActive(set(1), two)).toBe(false)
    expect(isSetTierActive(set(2), two)).toBe(true)
    expect(isSetTierActive(set(3), four)).toBe(false)
    expect(isSetTierActive(set(4), four)).toBe(true)
  })

  it('describes a tier by its stat bonus and its effect', () => {
    const [two, four] = set(4).tiers
    expect(describeSetTier(two)).toBe('ATK +15%')
    expect(describeSetTier(four)).toBe('ตีปกติมีโอกาส 30% ทำให้ติดเผาไหม้ 3 วิ')
  })

  it('also words crit effects', () => {
    expect(describeSetEffect({ critChance: 0.1, critDamage: 0.2 })).toBe(
      'อัตราคริติคอล +10% · ดาเมจคริติคอล +20%'
    )
  })
})

describe('craft helpers', () => {
  it('labels the Mythic grade', () => {
    expect(gradeLabel[EnumEquipmentGrade.MYTHIC]).toBeTruthy()
    expect(gradeColor[EnumEquipmentGrade.MYTHIC]).not.toBe(gradeColor[EnumEquipmentGrade.LEGENDARY])
  })

  it('describes the craft-set effects', () => {
    const text = describeSetEffect({
      damageCut: 0.12,
      executeBonus: 0.35,
      stunOnBasic: 8,
      poisonBonus: 0.12,
      retort: 0.6,
    })
    expect(text).toContain('12%')
    expect(text).toContain('35%')
    expect(text).toContain('8%')
    expect(text).toContain('สวนกลับ')
  })

  it('formats a countdown and never goes negative', () => {
    const now = new Date('2026-01-01T00:00:00Z')
    expect(formatCountdown('2026-01-01T01:02:03Z', now)).toBe('1:02:03')
    expect(formatCountdown('2026-01-01T00:12:03Z', now)).toBe('12:03')
    expect(formatCountdown('2025-12-31T23:00:00Z', now)).toBe('00:00')
  })

  it('lists what a recipe is short of', () => {
    expect(
      missingMaterials([
        { itemId: 'a', qty: 3, owned: 1 },
        { itemId: 'b', qty: 1, owned: 1 },
      ])
    ).toEqual([{ itemId: 'a', missing: 2 }])
  })
})

describe('getReturnHomeBlocker', () => {
  const stages = [EnumMonsterStage.PERFECT, EnumMonsterStage.ULTIMATE, EnumMonsterStage.FUSED]
  const perfect = (overrides: Partial<IMonsterData> = {}) =>
    monster({ stage: EnumMonsterStage.PERFECT, ...overrides })

  it('lets a perfect-or-later pet that is home go', () => {
    expect(getReturnHomeBlocker(perfect(), stages)).toBeNull()
    expect(getReturnHomeBlocker(perfect({ stage: EnumMonsterStage.FUSED }), stages)).toBeNull()
  })

  it('explains why not', () => {
    expect(getReturnHomeBlocker(monster(), stages)).toMatch(/ร่างสมบูรณ์ขึ้นไป/)
    expect(getReturnHomeBlocker(perfect({ expeditionAreaId: 'forest' }), stages)).toMatch(/สำรวจ/)
    expect(getReturnHomeBlocker(perfect({ diedAt: NOW.toISOString() }), stages)).toBe('จากไปแล้ว')
    expect(getReturnHomeBlocker(perfect(), undefined)).toBe('กำลังโหลดข้อมูล')
  })
})
