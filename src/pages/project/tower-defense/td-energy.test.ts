import { describe, expect, it } from 'vitest'
import { liveEnergy } from './td-energy'

const profile = (current: number, secondsToNext: number | null) => ({
  energy: { current, cap: 60, stageCost: 6, secondsToNext },
  balances: { coins: 0, gems: 0, shards: 0, clovers: 0 },
})
const at = (seconds: number) => 1_000_000 + seconds * 1000

describe('liveEnergy', () => {
  it('shows the server value right after a fetch', () => {
    expect(liveEnergy(profile(10, 120), at(0), at(0))).toEqual({ current: 10, secondsToNext: 120 })
  })

  it('counts the next point down between fetches', () => {
    expect(liveEnergy(profile(10, 120), at(0), at(45))).toEqual({ current: 10, secondsToNext: 75 })
  })

  it('adds a point when the countdown ends, then restarts at 6 minutes', () => {
    expect(liveEnergy(profile(10, 120), at(0), at(120))).toEqual({
      current: 11,
      secondsToNext: 360,
    })
    expect(liveEnergy(profile(10, 120), at(0), at(120 + 360 + 10))).toEqual({
      current: 12,
      secondsToNext: 350,
    })
  })

  it('stops at the cap', () => {
    expect(liveEnergy(profile(59, 10), at(0), at(100_000))).toEqual({
      current: 60,
      secondsToNext: null,
    })
    expect(liveEnergy(profile(60, null), at(0), at(500))).toEqual({
      current: 60,
      secondsToNext: null,
    })
  })

  it('ignores a clock that moved backwards', () => {
    expect(liveEnergy(profile(10, 120), at(50), at(0))).toEqual({ current: 10, secondsToNext: 120 })
  })
})
