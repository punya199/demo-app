import { describe, expect, it } from 'vitest'
import { formatRate, pullAvailability, type ITdGachaConfig } from './td-gacha'

const config: ITdGachaConfig = {
  rates: { common: 60, rare: 30, epic: 8, legendary: 2 },
  singleCost: 150,
  tenCost: 1350,
  pityLimit: 50,
  duplicateShards: { common: 10, rare: 25, epic: 60, legendary: 150 },
  heroes: [],
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
