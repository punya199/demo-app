import { describe, expect, it } from 'vitest'
import { formatAge, toHearts, getActionBlocker, describeReset, nextResetAt } from '.'
import { EnumMonsterAction, EnumMonsterStage } from '../tamagotchi-interface'
import { NOW, monster } from './test-fixtures'

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
    expect(formatAge(240)).toBe('4 ชม.')
    expect(formatAge(1440 * 5)).toBe('5 วัน')
  })
})

describe('getActionBlocker', () => {
  it('allows care actions on an awake, healthy monster', () => {
    expect(getActionBlocker(monster(), EnumMonsterAction.FEED, NOW)).toBeNull()
    expect(getActionBlocker(monster(), EnumMonsterAction.TRAIN, NOW)).toBeNull()
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
    expect(getActionBlocker(egg, EnumMonsterAction.CLEAN, NOW)).toBe('ไข่ยังไม่ฟัก')
    const dead = monster({ diedAt: NOW.toISOString() })
    expect(getActionBlocker(dead, EnumMonsterAction.CLEAN, NOW)).toBe('มอนจากไปแล้ว')
  })
})

describe('describeReset', () => {
  it('shows the time left and the Thai clock time of the reset', () => {
    // 11:00Z is 18:00 in Thailand
    expect(describeReset('2026-01-01T11:00:00Z', new Date('2026-01-01T08:45:00Z'))).toBe(
      'รีเซ็ตใน 2 ชม. 15 นาที (18:00 น.)'
    )
  })

  it('adds the weekday and date once the reset is a day or more away', () => {
    // Monday 2026-11-09 00:00 Thai time is Sunday 17:00Z
    const text = describeReset('2026-11-08T17:00:00Z', new Date('2026-11-06T17:00:00Z'))
    expect(text).toContain('รีเซ็ตใน 2 วัน')
    expect(text).toMatch(/\(.+ 9 .+ 00:00 น\.\)/)
  })
})

describe('nextResetAt', () => {
  // Thursday 2026-11-05 14:30 Thai time
  const now = new Date('2026-11-05T07:30:00Z')

  it('daily: the next Thai midnight', () => {
    expect(nextResetAt({ kind: 'daily' }, now)).toBe('2026-11-05T17:00:00.000Z')
  })

  it('weekly: the next Monday 00:00 Thai time, and a full week from Monday itself', () => {
    expect(nextResetAt({ kind: 'weekly' }, now)).toBe('2026-11-08T17:00:00.000Z')
    expect(nextResetAt({ kind: 'weekly' }, new Date('2026-11-08T17:00:00Z'))).toBe(
      '2026-11-15T17:00:00.000Z'
    )
  })

  it('monthly: 00:00 Thai time on the 1st, across a year end', () => {
    expect(nextResetAt({ kind: 'monthly' }, now)).toBe('2026-11-30T17:00:00.000Z')
    expect(nextResetAt({ kind: 'monthly' }, new Date('2026-12-20T00:00:00Z'))).toBe(
      '2026-12-31T17:00:00.000Z'
    )
  })

  it('window: the next boundary of N-hour windows counted from Thai midnight', () => {
    // 14:30 -> next 3h boundary is 15:00 Thai = 08:00Z; next 1h boundary is 15:00 too
    expect(nextResetAt({ kind: 'window', hours: 3 }, now)).toBe('2026-11-05T08:00:00.000Z')
    expect(nextResetAt({ kind: 'window', hours: 1 }, now)).toBe('2026-11-05T08:00:00.000Z')
    expect(nextResetAt({ kind: 'window', hours: 3 }, new Date('2026-11-05T08:00:00Z'))).toBe(
      '2026-11-05T11:00:00.000Z'
    )
  })
})
