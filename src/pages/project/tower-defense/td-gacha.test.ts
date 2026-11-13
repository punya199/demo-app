import { describe, expect, it } from 'vitest'
import {
  canStarUp,
  canUpgradeGear,
  formatRate,
  nextGearCost,
  nextStarCost,
  pullAvailability,
  type ITdGachaConfig,
} from './td-gacha'

const config: ITdGachaConfig = {
  rates: { common: 60, rare: 30, epic: 8, legendary: 2 },
  singleCost: 150,
  tenCost: 1350,
  pityLimit: 50,
  duplicateShards: { common: 10, rare: 25, epic: 60, legendary: 150 },
  heroes: [],
  starUpCosts: [20, 50, 100, 200],
  gearModCosts: [30, 60, 120],
}

describe('formatRate', () => {
  it('shows the server rate as a percentage', () => {
    expect(formatRate(2)).toBe('2%')
    expect(formatRate(60)).toBe('60%')
  })
})

describe('pullAvailability', () => {
  it('allows a single pull at exactly 150 gems and a 10-pull at exactly 1350', () => {
    expect(pullAvailability('single', 150, config, false)).toBe(true)
    expect(pullAvailability('single', 149, config, false)).toBe(false)
    expect(pullAvailability('ten', 1350, config, false)).toBe(true)
    expect(pullAvailability('ten', 1349, config, false)).toBe(false)
  })

  it('allows the free pull with no gems, only while it is available', () => {
    expect(pullAvailability('free', 0, config, true)).toBe(true)
    expect(pullAvailability('free', 9999, config, false)).toBe(false)
  })
})

describe('star-up button', () => {
  it('shows the cost of the next star, and none at the top star', () => {
    expect(nextStarCost(1, config)).toBe(20)
    expect(nextStarCost(4, config)).toBe(200)
    expect(nextStarCost(5, config)).toBeNull()
  })

  it('needs at least the exact shard cost, and never at the top star', () => {
    expect(canStarUp(1, 20, config)).toBe(true)
    expect(canStarUp(1, 19, config)).toBe(false)
    expect(canStarUp(5, 9999, config)).toBe(false)
  })
})

describe('gear mod button', () => {
  it('shows the cost of the next mod level, and none at the top level', () => {
    expect(nextGearCost(0, config)).toBe(30)
    expect(nextGearCost(2, config)).toBe(120)
    expect(nextGearCost(3, config)).toBeNull()
  })

  it('needs at least the exact coin cost, and never at the top level', () => {
    expect(canUpgradeGear(0, 30, config)).toBe(true)
    expect(canUpgradeGear(0, 29, config)).toBe(false)
    expect(canUpgradeGear(3, 9999, config)).toBe(false)
  })
})
