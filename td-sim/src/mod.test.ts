import { describe, expect, it } from 'vitest'
import { outputOf } from './board'
import { MAX_GEAR_MOD, SOURCE_TILE } from './config'
import { createState, runReplay, step, type Gear, type PoolEntry, type SimInput } from './sim'

const gear = (over: Partial<Gear> = {}): Gear => ({
  tile: SOURCE_TILE,
  hero: 'void-blade',
  star: 1,
  level: 1,
  cooldown: 0,
  ...over,
})

describe('gear mod', () => {
  it('every mod level raises the damage of a shot', () => {
    for (let mod = 0; mod < MAX_GEAR_MOD; mod++) {
      const lo = outputOf(gear({ mod }), [gear({ mod })]).damage
      const hi = outputOf(gear({ mod: mod + 1 }), [gear({ mod: mod + 1 })]).damage
      expect(hi).toBeGreaterThan(lo)
    }
  })

  it('a missing mod is level 0', () => {
    expect(outputOf(gear(), [gear()])).toEqual(outputOf(gear({ mod: 0 }), [gear({ mod: 0 })]))
  })

  it('copies the mod from the pool onto summoned gears, and merging keeps it', () => {
    const pool: PoolEntry[] = [{ hero: 'void-blade', star: 1, mod: 3 }]
    const inputs: SimInput[] = [
      { tick: 0, type: 'summon', tile: 0 },
      { tick: 0, type: 'summon', tile: 1 },
      { tick: 1, type: 'merge', from: 0, to: 1 },
    ]
    const s = runReplay({ seed: 1, ticks: 2, inputs, pool })
    expect(s.gears).toHaveLength(1)
    expect(s.gears[0]).toMatchObject({ level: 2, mod: 3 })
  })

  it('an upgraded hero deals more damage than the same hero un-upgraded', () => {
    const dealt = (mod: number) => {
      const start = createState(1, [{ hero: 'void-blade', star: 1, mod }])
      const s = step(
        {
          ...start,
          tick: 1,
          spawned: 1,
          enemies: [{ id: 0, kind: 'grunt', pos: 500, hp: 1_000_000 }],
          gears: [gear({ mod })],
        },
        []
      )
      return 1_000_000 - s.enemies[0].hp
    }
    expect(dealt(0)).toBeGreaterThan(0)
    expect(dealt(MAX_GEAR_MOD)).toBeGreaterThan(dealt(0))
  })

  it('rejects a bad mod in the pool', () => {
    const bad = (mod: unknown) =>
      expect(() =>
        runReplay({
          seed: 1,
          ticks: 10,
          inputs: [],
          pool: [{ hero: 'void-blade', star: 1, mod: mod as number }],
        })
      ).toThrow(RangeError)
    bad(-1)
    bad(MAX_GEAR_MOD + 1)
    bad(1.5)
    bad('2')
  })

  it('createState snapshots the mod', () => {
    expect(createState(1, [{ hero: 'archer', star: 1, mod: 2 }]).pool).toEqual([
      { hero: 'archer', star: 1, mod: 2 },
    ])
  })
})
