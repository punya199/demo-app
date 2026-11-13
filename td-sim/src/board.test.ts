import { describe, expect, it } from 'vitest'
import { linkedTiles, outputOf } from './board'
import {
  CHARGE_BASE,
  CHARGE_PER_SIDE,
  CHARGE_SCALE,
  CRIT_OUTPUT_PCT,
  HEROES,
  LEVEL_OUTPUT_PCT,
  MAX_CRIT_PCT,
  MAX_LEVEL,
  PENALTY_TILES,
  RESONANCE_CRIT_PCT,
  SOURCE_TILE,
  START_GOLD,
} from './config'
import { createState, step, type Gear, type SimState } from './sim'

const gear = (tile: number, over: Partial<Gear> = {}): Gear => ({
  tile,
  hero: 'archer',
  level: 1,
  cooldown: HEROES.archer.cooldown * CHARGE_SCALE,
  ...over,
})
const FULL = HEROES.archer.cooldown * CHARGE_SCALE
// tile layout (5 columns): 27 is the source tile, 22 above it, 26 and 28 beside it
const world = (gears: Gear[], over: Partial<SimState> = {}): SimState => ({
  ...createState(1),
  tick: 1,
  spawned: 1,
  enemies: [{ id: 0, pos: 500, hp: 100000 }],
  gears,
  ...over,
})

describe('charging', () => {
  it('links gears to the source directly or through a chain of adjacent gears', () => {
    const linked = linkedTiles([gear(SOURCE_TILE), gear(22), gear(17), gear(0), gear(29)])
    expect([...linked].sort((a, b) => a - b)).toEqual([17, 22, SOURCE_TILE])
  })

  it('a row edge does not wrap: tile 29 is not adjacent to tile 30-ish neighbours across rows', () => {
    // 24 (end of row 4) and 25 (start of row 5) are consecutive indices but not touching
    expect(linkedTiles([gear(SOURCE_TILE), gear(26), gear(25), gear(24)]).has(24)).toBe(false)
  })

  it('an unlinked gear never charges and never fires, even when fully charged', () => {
    const s = step(world([gear(0, { cooldown: FULL }), gear(1, { cooldown: 0 })]), [])
    expect(s.gears[0].cooldown).toBe(FULL)
    expect(s.gears[1].cooldown).toBe(0)
    expect(s.enemies[0].hp).toBe(100000)
  })

  it('a linked gear charges, and more touching sides charge it faster', () => {
    const alone = step(world([gear(SOURCE_TILE)]), []).gears[0]
    const touching = step(world([gear(SOURCE_TILE), gear(22), gear(26)]), []).gears[0]
    expect(alone.cooldown).toBe(FULL - CHARGE_BASE)
    expect(touching.cooldown).toBe(FULL - CHARGE_BASE - 2 * CHARGE_PER_SIDE)
  })

  it('fires once charged and then restarts the charge', () => {
    const s = step(world([gear(SOURCE_TILE, { cooldown: 0 })]), [])
    expect(s.enemies[0].hp).toBeLessThan(100000)
    expect(s.gears[0].cooldown).toBe(FULL)
  })
})

describe('output', () => {
  it('a -2 tile lowers output', () => {
    const normal = outputOf(gear(15), [gear(15)])
    const penalised = outputOf(gear(PENALTY_TILES[0]), [gear(PENALTY_TILES[0])])
    expect(PENALTY_TILES).not.toContain(15)
    expect(penalised.damage).toBeLessThan(normal.damage)
  })

  it('more touching sides raise output', () => {
    const lone = outputOf(gear(15), [gear(15)])
    const hugged = outputOf(gear(15), [
      gear(15),
      gear(10, { hero: 'mage' }),
      gear(16, { hero: 'mage' }),
    ])
    expect(hugged.damage).toBeGreaterThan(lone.damage)
  })
})

describe('merge', () => {
  const merge = (from: number, to: number) => ({ tick: 1, type: 'merge' as const, from, to })

  it('two identical gears become one gear of the next level', () => {
    const s = step(world([gear(SOURCE_TILE), gear(22)]), [merge(22, SOURCE_TILE)])
    expect(s.gears).toHaveLength(1)
    expect(s.gears[0]).toMatchObject({ tile: SOURCE_TILE, hero: 'archer', level: 2 })
  })

  it('is refused for different heroes, different levels, max level, same tile or empty tiles', () => {
    const refuse = (gears: Gear[], from: number, to: number) =>
      expect(step(world(gears), [merge(from, to)]).gears.map((g) => g.level)).toEqual(
        gears.map((g) => g.level)
      )
    refuse([gear(0), gear(1, { hero: 'mage' })], 0, 1)
    refuse([gear(0), gear(1, { level: 2 })], 0, 1)
    refuse([gear(0, { level: MAX_LEVEL }), gear(1, { level: MAX_LEVEL })], 0, 1)
    refuse([gear(0)], 0, 0)
    refuse([gear(0)], 0, 1)
  })

  it('a merged gear is always at least as strong as both parts together', () => {
    for (let n = 1; n < MAX_LEVEL; n++) {
      expect(LEVEL_OUTPUT_PCT[n]).toBeGreaterThanOrEqual(2 * LEVEL_OUTPUT_PCT[n - 1])
      const part = outputOf(gear(15, { level: n }), [gear(15, { level: n })]).damage
      const merged = outputOf(gear(15, { level: n + 1 }), [gear(15, { level: n + 1 })]).damage
      expect(merged).toBeGreaterThanOrEqual(2 * part)
    }
  })

  it('merging does not cost gold', () => {
    expect(step(world([gear(0), gear(1)]), [merge(0, 1)]).gold).toBeGreaterThanOrEqual(START_GOLD)
  })
})

describe('resonance', () => {
  it('adjacent matching gears raise crit chance, other heroes do not', () => {
    const base = outputOf(gear(15), [gear(15)]).critPct
    const matched = outputOf(gear(15), [gear(15), gear(10)]).critPct
    const other = outputOf(gear(15), [gear(15), gear(10, { hero: 'mage' })]).critPct
    expect(base).toBe(0)
    expect(matched).toBe(RESONANCE_CRIT_PCT)
    expect(other).toBe(0)
  })

  it('crit chance is capped', () => {
    const ring = [gear(17), gear(12), gear(22), gear(16), gear(18)]
    expect(outputOf(ring[0], ring).critPct).toBe(Math.min(4 * RESONANCE_CRIT_PCT, MAX_CRIT_PCT))
  })

  it('crits deal extra damage; a gear with no resonance never crits', () => {
    const damages = (gears: Gear[]) => {
      const seen = new Set<number>()
      let s = world(gears, { enemies: [{ id: 0, pos: 0, hp: 1e9 }] })
      for (let i = 0; i < 400; i++) {
        const before = s.enemies[0].hp
        s = {
          ...s,
          gears: s.gears.map((g) => ({ ...g, cooldown: 0 })),
          enemies: [{ ...s.enemies[0], pos: 0, hp: before }],
        }
        s = step(s, [])
        seen.add(before - s.enemies[0].hp)
      }
      return seen
    }
    const chain = [gear(SOURCE_TILE), gear(26)]
    expect(damages([gear(SOURCE_TILE)]).size).toBe(1)
    const withRes = damages(chain)
    expect(withRes.size).toBeGreaterThan(1)
    // both gears deal the same output, so a normal tick is 2x and a double crit is 2x crit
    const lo = outputOf(chain[0], chain).damage
    expect(Math.min(...withRes)).toBe(2 * lo)
    expect(Math.max(...withRes)).toBe(2 * Math.floor((lo * CRIT_OUTPUT_PCT) / 100))
  })
})
