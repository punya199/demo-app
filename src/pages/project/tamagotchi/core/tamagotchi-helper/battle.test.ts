import { describe, expect, it } from 'vitest'
import {
  toThaiErrorMessage,
  describeMissingConditions,
  describeBattleEvent,
  getEvolutionCountdown,
  describeConditions,
  hpAfter,
} from '.'
import {
  EnumMonsterLine,
  EnumMonsterStage,
  IBattleData,
  IBattleEvent,
  IEvolutionRuleInfo,
} from '../tamagotchi-interface'
import { NOW, monster } from './test-fixtures'

describe('toThaiErrorMessage', () => {
  it('translates known server messages and falls back for anything else', () => {
    expect(toThaiErrorMessage('Not enough gems')).toBe('เพชรไม่พอ')
    expect(toThaiErrorMessage('boom')).toBe('ทำรายการไม่สำเร็จ')
    expect(toThaiErrorMessage(undefined)).toBe('ทำรายการไม่สำเร็จ')
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

describe('getEvolutionCountdown', () => {
  const evolution = monster().evolution

  it('converts remaining stage progress into online and offline time', () => {
    const fetchedAt = NOW.getTime()
    expect(getEvolutionCountdown(evolution, fetchedAt, NOW)).toEqual({
      percent: 17,
      onlineMinutes: 150,
      offlineMinutes: 300,
    })
  })

  it('keeps counting down at the online rate between polls', () => {
    const fetchedAt = NOW.getTime() - 10 * 60_000
    expect(getEvolutionCountdown(evolution, fetchedAt, NOW)).toMatchObject({
      onlineMinutes: 140,
      offlineMinutes: 280,
    })
  })

  it('has nothing to count for a final form', () => {
    const final = { ...evolution, durationMinutes: null, remainingMinutes: null }
    expect(getEvolutionCountdown(final, NOW.getTime(), NOW)).toBeNull()
  })
})

describe('evolution conditions', () => {
  const rule: IEvolutionRuleInfo = {
    to: { id: 'leaf_ultimate', name: 'เทพพนาลัย', emoji: '🌳', stage: EnumMonsterStage.ULTIMATE },
    maxCareMistakes: 1,
    minTrainCount: 10,
    minWins: 5,
    met: false,
  }

  it('describes a rule', () => {
    expect(describeConditions(rule)).toBe('ดูแลพลาด ≤ 1 · ฝึก ≥ 10 · ชนะรวม ≥ 5')
    expect(describeConditions({})).toBe('ไม่มีเงื่อนไข')
  })

  it('lists only what is still missing', () => {
    expect(describeMissingConditions(rule, monster({ trainCount: 7, wins: 5 }))).toEqual([
      'ฝึกอีก 3 ครั้ง',
    ])
    expect(
      describeMissingConditions(rule, monster({ careMistakes: 2, trainCount: 10, wins: 1 }))
    ).toEqual(['ดูแลพลาดเกินแล้ว (ได้ไม่เกิน 1 ครั้ง)', 'ชนะอีก 4 ครั้ง'])
  })
})
