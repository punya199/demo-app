import { describe, expect, it } from 'vitest'
import { outputOf } from './board'
import {
  CHARGE_SCALE,
  HEROES,
  MAX_STAR,
  SOURCE_TILE,
  STARTER_POOL,
  STRONG_SKILL_STAR,
  SUMMON_COST,
} from './config'
import { createState, runReplay, step, type Gear, type PoolEntry, type SimInput } from './sim'

const summons = (n: number): SimInput[] =>
  Array.from({ length: n }, (_, i) => ({ tick: i, type: 'summon' as const, tile: i }))

const gear = (over: Partial<Gear> = {}): Gear => ({
  tile: SOURCE_TILE,
  hero: 'void-blade',
  star: 1,
  level: 1,
  cooldown: 0,
  ...over,
})

describe('hero pool', () => {
  it('summons only heroes from the pool', () => {
    const pool: PoolEntry[] = [
      { hero: 'void-blade', star: 1 },
      { hero: 'twig-archer', star: 2 },
    ]
    const s = runReplay({ seed: 9, ticks: 400, inputs: summons(3), pool })
    expect(s.gears.length).toBeGreaterThan(0)
    for (const g of s.gears) {
      const entry = pool.find((p) => p.hero === g.hero)
      expect(entry).toBeDefined()
      expect(g.star).toBe(entry!.star)
    }
  })

  it('a one-hero pool always summons that hero', () => {
    const s = runReplay({
      seed: 3,
      ticks: 100,
      inputs: summons(3),
      pool: [{ hero: 'sun-oracle', star: 1 }],
    })
    expect(s.gears.map((g) => g.hero)).toEqual(['sun-oracle', 'sun-oracle', 'sun-oracle'])
  })

  it('defaults to the starter pool, so a player with no heroes can still play', () => {
    const a = runReplay({ seed: 5, ticks: 300, inputs: summons(3) })
    const b = runReplay({ seed: 5, ticks: 300, inputs: summons(3), pool: [...STARTER_POOL] })
    expect(a).toEqual(b)
    expect(STARTER_POOL.length).toBeGreaterThan(0)
  })

  it('a different pool changes the result, and the state keeps its snapshot', () => {
    const inputs = summons(3)
    const a = runReplay({ seed: 5, ticks: 300, inputs, pool: [{ hero: 'void-blade', star: 1 }] })
    const b = runReplay({ seed: 5, ticks: 300, inputs, pool: [{ hero: 'twig-archer', star: 1 }] })
    expect(a.gears[0].hero).not.toBe(b.gears[0].hero)
    expect(a.pool).toEqual([{ hero: 'void-blade', star: 1 }])
  })

  it('rejects an empty, unknown or out-of-range pool', () => {
    const bad = (pool: unknown) =>
      expect(() =>
        runReplay({ seed: 1, ticks: 10, inputs: [], pool: pool as PoolEntry[] })
      ).toThrow(RangeError)
    bad([])
    bad([{ hero: 'nobody', star: 1 }])
    bad([{ hero: 'void-blade', star: 0 }])
    bad([{ hero: 'void-blade', star: MAX_STAR + 1 }])
    bad([{ hero: 'void-blade', star: 1.5 }])
    bad('void-blade')
  })
})

describe('star level', () => {
  it('each star raises damage', () => {
    for (let star = 1; star < MAX_STAR; star++) {
      const lo = outputOf(gear({ star }), [gear({ star })]).damage
      const hi = outputOf(gear({ star: star + 1 }), [gear({ star: star + 1 })]).damage
      expect(hi).toBeGreaterThan(lo)
    }
  })

  it('the stronger skill unlocks at its star: a shorter reload after firing', () => {
    const reload = (star: number) => {
      let s = createState(1, [{ hero: 'void-blade', star }])
      s = {
        ...s,
        tick: 1,
        spawned: 1,
        enemies: [{ id: 0, kind: 'grunt', pos: 500, hp: 1_000_000 }],
        gears: [gear({ star })],
      }
      return step(s, []).gears[0].cooldown
    }
    const base = HEROES['void-blade'].cooldown * CHARGE_SCALE
    expect(reload(STRONG_SKILL_STAR - 1)).toBe(base)
    expect(reload(STRONG_SKILL_STAR)).toBeLessThan(base)
  })

  it('merging keeps the star', () => {
    let s = createState(1, [{ hero: 'void-blade', star: 4 }])
    s = { ...s, gold: SUMMON_COST * 2 }
    s = step(s, [
      { tick: 0, type: 'summon', tile: 0 },
      { tick: 0, type: 'summon', tile: 1 },
    ])
    s = step(s, [{ tick: 1, type: 'merge', from: 0, to: 1 }])
    expect(s.gears).toHaveLength(1)
    expect(s.gears[0]).toMatchObject({ level: 2, star: 4 })
  })
})
