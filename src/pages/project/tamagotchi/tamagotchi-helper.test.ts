import { describe, expect, it } from 'vitest'
import { formatAge, getActionBlocker, toHearts, toThaiErrorMessage } from './tamagotchi-helper'
import {
  EnumMonsterAction,
  EnumMonsterLine,
  EnumMonsterStage,
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
