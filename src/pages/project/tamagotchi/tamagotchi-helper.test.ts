import { describe, expect, it } from 'vitest'
import {
  describeBattleEvent,
  formatAge,
  getActionBlocker,
  getBattleBlocker,
  getShopBlocker,
  hpAfter,
  toHearts,
  toThaiErrorMessage,
} from './tamagotchi-helper'
import {
  EnumMonsterAction,
  EnumMonsterLine,
  EnumMonsterStage,
  IBattleData,
  IBattleEvent,
  IMonsterData,
} from './tamagotchi-interface'

const NOW = new Date('2026-01-01T03:00:00Z')

const monster = (overrides: Partial<IMonsterData> = {}): IMonsterData => ({
  id: 'monster-1',
  line: EnumMonsterLine.FLAME,
  speciesId: 'flame_adultGood',
  stage: EnumMonsterStage.ADULT,
  name: 'เพลิงจอมซน',
  emoji: '🦎',
  fullness: 4,
  strength: 4,
  weight: 20,
  poops: 1,
  isSick: false,
  isSleeping: false,
  lightsOn: true,
  careMistakes: 0,
  trainCount: 0,
  wins: 0,
  losses: 0,
  ageMinutes: 0,
  bornAt: NOW.toISOString(),
  trainReadyAt: null,
  diedAt: null,
  deathCause: null,
  ...overrides,
})

describe('toHearts', () => {
  it('rounds partly-filled hearts up', () => {
    expect(toHearts(2.3)).toBe(3)
    expect(toHearts(0.01)).toBe(1)
    expect(toHearts(0)).toBe(0)
  })

  it('ignores float noise from the server', () => {
    expect(toHearts(3.0000001)).toBe(3)
  })
})

describe('formatAge', () => {
  it('formats minutes, hours and days', () => {
    expect(formatAge(42)).toBe('42 นาที')
    expect(formatAge(125)).toBe('2 ชม. 5 นาที')
    expect(formatAge(1440 * 2 + 180)).toBe('2 วัน 3 ชม.')
  })
})

describe('getActionBlocker', () => {
  it('allows care actions on an awake, healthy monster', () => {
    expect(getActionBlocker(monster(), EnumMonsterAction.FEED, NOW)).toBeNull()
    expect(getActionBlocker(monster(), EnumMonsterAction.TRAIN, NOW)).toBeNull()
  })

  it('blocks feeding and training while asleep but still allows the lights', () => {
    const asleep = monster({ isSleeping: true })
    expect(getActionBlocker(asleep, EnumMonsterAction.FEED, NOW)).toBe('มอนกำลังหลับ')
    expect(getActionBlocker(asleep, EnumMonsterAction.LIGHTS, NOW)).toBeNull()
  })

  it('blocks training during the cooldown', () => {
    const resting = monster({ trainReadyAt: new Date(NOW.getTime() + 30_000).toISOString() })
    expect(getActionBlocker(resting, EnumMonsterAction.TRAIN, NOW)).toBe('กำลังพักจากการฝึก')
  })

  it('only allows medicine when sick and cleaning when there is poop', () => {
    expect(getActionBlocker(monster(), EnumMonsterAction.MEDICINE, NOW)).toBe('ไม่ได้ป่วย')
    expect(getActionBlocker(monster({ isSick: true }), EnumMonsterAction.MEDICINE, NOW)).toBeNull()
    expect(getActionBlocker(monster({ poops: 0 }), EnumMonsterAction.CLEAN, NOW)).toBe(
      'สะอาดอยู่แล้ว'
    )
  })

  it('blocks everything on an egg or a dead monster', () => {
    const egg = monster({ stage: EnumMonsterStage.EGG })
    expect(getActionBlocker(egg, EnumMonsterAction.LIGHTS, NOW)).toBe('ไข่ยังไม่ฟัก')
    const dead = monster({ diedAt: NOW.toISOString() })
    expect(getActionBlocker(dead, EnumMonsterAction.CLEAN, NOW)).toBe('มอนจากไปแล้ว')
  })
})

describe('toThaiErrorMessage', () => {
  it('translates known server messages and falls back for anything else', () => {
    expect(toThaiErrorMessage('Monster is asleep')).toBe('มอนกำลังหลับ')
    expect(toThaiErrorMessage('boom')).toBe('ทำรายการไม่สำเร็จ')
    expect(toThaiErrorMessage(undefined)).toBe('ทำรายการไม่สำเร็จ')
  })
})

describe('getBattleBlocker', () => {
  it('allows a ready monster and explains every refusal', () => {
    expect(getBattleBlocker(monster())).toBeNull()
    expect(getBattleBlocker(null)).toBe('ยังไม่มีมอน')
    expect(getBattleBlocker(monster({ isSleeping: true }))).toBe('มอนกำลังหลับ')
    expect(getBattleBlocker(monster({ isSick: true }))).toBe('ป่วยอยู่ สู้ไม่ได้')
    expect(getBattleBlocker(monster({ strength: 0 }))).toBe('แรงหมด ให้วิตามินหรือฝึกก่อน')
  })

  it('counts a partly-filled strength heart as enough to fight', () => {
    expect(getBattleBlocker(monster({ strength: 0.2 }))).toBeNull()
  })
})

describe('getShopBlocker', () => {
  it('needs a hatched, awake monster and enough coins', () => {
    expect(getShopBlocker(monster(), 15, 15)).toBeNull()
    expect(getShopBlocker(monster(), 15, 14)).toBe('เหรียญไม่พอ')
    expect(getShopBlocker(monster({ isSleeping: true }), 15, 99)).toBe('มอนกำลังหลับ')
    expect(getShopBlocker(monster({ stage: EnumMonsterStage.EGG }), 15, 99)).toBe(
      'ต้องมีมอนที่ฟักแล้ว'
    )
  })
})

const hit = (overrides: Partial<IBattleEvent>): IBattleEvent => ({
  round: 1,
  actor: 'player',
  moveName: 'โจมตี',
  isSkill: false,
  damage: 5,
  isCritical: false,
  effectiveness: 'normal',
  targetHp: 0,
  ...overrides,
})

describe('hpAfter', () => {
  const events = [
    hit({ actor: 'player', targetHp: 25 }),
    hit({ actor: 'enemy', targetHp: 32 }),
    hit({ actor: 'player', targetHp: 18 }),
  ]

  it('starts at full HP and follows the latest hit on that side', () => {
    expect(hpAfter(events, 0, 'enemy', 30)).toBe(30)
    expect(hpAfter(events, 1, 'enemy', 30)).toBe(25)
    expect(hpAfter(events, 1, 'player', 40)).toBe(40)
    expect(hpAfter(events, 3, 'enemy', 30)).toBe(18)
    expect(hpAfter(events, 3, 'player', 40)).toBe(32)
  })
})

describe('describeBattleEvent', () => {
  const fighter = (name: string) => ({
    name,
    emoji: '🧪',
    element: EnumMonsterLine.FLAME,
    stats: { hp: 10, atk: 1, def: 1, spd: 1 },
    skill: { name: 'skill', power: 1.6 },
  })
  const battle = { player: fighter('ถ่านน้อย'), enemy: fighter('หนอนใบไม้') } as IBattleData

  it('names the attacker, move and damage with any notes', () => {
    expect(describeBattleEvent(hit({ damage: 7 }), battle)).toBe('ถ่านน้อย ใช้ โจมตี 7 ดาเมจ')
    expect(
      describeBattleEvent(
        hit({
          actor: 'enemy',
          moveName: 'ใยเหนียว',
          damage: 12,
          effectiveness: 'strong',
          isCritical: true,
        }),
        battle
      )
    ).toBe('หนอนใบไม้ ใช้ ใยเหนียว 12 ดาเมจ (ได้เปรียบธาตุ! คริติคอล!)')
  })
})
