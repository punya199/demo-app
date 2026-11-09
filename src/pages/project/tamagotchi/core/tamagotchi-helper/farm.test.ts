import { describe, expect, it } from 'vitest'
import { EnumFurnitureKind, EnumMonsterStage, IFarmData } from '../tamagotchi-interface'
import { farmActivity, formatBonus, tierOf } from './farm'
import { monster } from './test-fixtures'

describe('farmActivity', () => {
  it('follows the need order: egg, away, sick, hungry, weak, free', () => {
    expect(farmActivity(monster({ stage: EnumMonsterStage.EGG }))).toBe('egg')
    expect(farmActivity(monster({ expeditionAreaId: 'coast', fullness: 0 }))).toBe('away')
    expect(farmActivity(monster({ isSick: true, fullness: 0 }))).toBe('sick')
    expect(farmActivity(monster({ fullness: 1, strength: 0 }))).toBe('eat')
    expect(farmActivity(monster({ fullness: 4, strength: 1 }))).toBe('gym')
    expect(farmActivity(monster({ fullness: 3, strength: 3 }))).toBe('free')
  })

  it('shows a pet back from an expedition as home, not away', () => {
    expect(farmActivity(monster({ expeditionAreaId: 'coast', expeditionReturned: true }))).toBe(
      'free'
    )
  })

  it('counts a heart as full until it drops a whole one (ceil), like the care screen', () => {
    expect(farmActivity(monster({ fullness: 1.2 }))).toBe('free')
    expect(farmActivity(monster({ fullness: 0.4 }))).toBe('eat')
  })
})

describe('formatBonus / tierOf', () => {
  it('writes a bonus as a percent and none as ยังไม่มี', () => {
    expect(formatBonus(0.15)).toBe('+15%')
    expect(formatBonus(1)).toBe('+100%')
    expect(formatBonus(0)).toBe('ยังไม่มี')
  })

  it('reads a tier, 0 when the farm is not loaded or the piece is not bought', () => {
    const farm = {
      furniture: [{ kind: EnumFurnitureKind.BED, tier: 2 }],
    } as unknown as IFarmData
    expect(tierOf(farm, EnumFurnitureKind.BED)).toBe(2)
    expect(tierOf(farm, EnumFurnitureKind.GYM)).toBe(0)
    expect(tierOf(undefined, EnumFurnitureKind.BED)).toBe(0)
  })
})
