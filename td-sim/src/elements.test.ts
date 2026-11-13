import { describe, expect, it } from 'vitest'
import {
  ADVANTAGE_PCT,
  CORE_DAMAGE_PCT,
  CORE_RARITIES,
  CORE_SLOTS,
  DISADVANTAGE_PCT,
  ELEMENTS,
  ENEMIES,
  HERO_IDS,
  SOURCE_TILE,
  STAGES,
  type EnemyKind,
  type HeroId,
} from './config'
import { advantagePct, coreBonusPct, ENEMY_ELEMENT, HERO_ELEMENT } from './elements'
import {
  createState,
  runReplay,
  step,
  type CoreEntry,
  type Gear,
  type SimInput,
  type SimState,
} from './sim'

/** Damage one shot of a lone gear (star 1, level 1, no skills) deals to an enemy of `kind`. */
const dealt = (hero: HeroId, kind: EnemyKind, cores: CoreEntry[] = [], stage = 1): number => {
  const start = createState(1, [{ hero, star: 1 }], stage, cores)
  const gear: Gear = { tile: SOURCE_TILE, hero, star: 1, level: 1, cooldown: 0 }
  const s = step(
    {
      ...start,
      tick: 1,
      roundTick: 100, // past the boss's shield window
      spawned: 1,
      enemies: [{ id: 0, kind, pos: 500, hp: 1_000_000 }],
      gears: [gear],
    },
    []
  )
  return 1_000_000 - s.enemies[0].hp
}

describe('element config', () => {
  it('has four elements and gives every hero, enemy kind and boss one', () => {
    expect([...ELEMENTS].sort()).toEqual(['fire', 'ice', 'nature', 'physical'])
    for (const h of HERO_IDS) expect(ELEMENTS).toContain(HERO_ELEMENT[h])
    for (const k of Object.keys(ENEMIES) as EnemyKind[])
      expect(ELEMENTS).toContain(ENEMY_ELEMENT[k])
    for (const s of STAGES) expect(ELEMENTS).toContain(s.boss.element)
  })

  it('every element is used by a hero, so every core has someone to boost', () => {
    for (const e of ELEMENTS) expect(HERO_IDS.some((h) => HERO_ELEMENT[h] === e)).toBe(true)
  })

  it('has four core slots and a strictly rising bonus per rarity', () => {
    expect(CORE_SLOTS).toBe(4)
    CORE_RARITIES.forEach((r, i) => {
      if (i > 0) expect(CORE_DAMAGE_PCT[r]).toBeGreaterThan(CORE_DAMAGE_PCT[CORE_RARITIES[i - 1]])
    })
  })
})

describe('elemental advantage rule', () => {
  it('fire beats nature, nature beats ice, ice beats fire; physical is neutral', () => {
    expect(advantagePct('fire', 'nature')).toBe(ADVANTAGE_PCT)
    expect(advantagePct('nature', 'ice')).toBe(ADVANTAGE_PCT)
    expect(advantagePct('ice', 'fire')).toBe(ADVANTAGE_PCT)
    expect(advantagePct('nature', 'fire')).toBe(DISADVANTAGE_PCT)
    expect(advantagePct('ice', 'nature')).toBe(DISADVANTAGE_PCT)
    expect(advantagePct('fire', 'ice')).toBe(DISADVANTAGE_PCT)
    for (const e of ELEMENTS) {
      expect(advantagePct('physical', e)).toBe(100)
      expect(advantagePct(e, 'physical')).toBe(100)
      expect(advantagePct(e, e)).toBe(100)
    }
  })
})

describe('core bonus', () => {
  it('only cores of the hero element count, and cores of one element add up', () => {
    expect(coreBonusPct([], 'fire')).toBe(100)
    expect(coreBonusPct([{ element: 'ice', rarity: 'legendary' }], 'fire')).toBe(100)
    expect(
      coreBonusPct(
        [
          { element: 'fire', rarity: 'common' },
          { element: 'fire', rarity: 'rare' },
        ],
        'fire'
      )
    ).toBe(100 + CORE_DAMAGE_PCT.common + CORE_DAMAGE_PCT.rare)
  })
})

describe('elements in battle', () => {
  // cinder-witch is fire (6 damage); void-blade is physical (12 damage). Literals, not recomputed.
  it('a fire hero hits a nature enemy for more, an ice enemy for less, a physical enemy as normal', () => {
    expect(dealt('cinder-witch', 'grunt')).toBe(6) // physical
    expect(dealt('cinder-witch', 'runner')).toBe(9) // nature: 150%
    expect(dealt('cinder-witch', 'tank')).toBe(4) // ice: 75% of 6, rounded down
  })

  it('a physical hero is neutral against every element', () => {
    for (const kind of ['grunt', 'runner', 'tank', 'swarmer'] as EnemyKind[])
      expect(dealt('void-blade', kind)).toBe(12)
  })

  it('the boss uses its own stage element', () => {
    // stage 1 boss is nature, stage 2 ice, stage 3 fire; boss armor is 1
    expect(dealt('cinder-witch', 'boss', [], 1)).toBe(8) // 9 - 1
    expect(dealt('cinder-witch', 'boss', [], 2)).toBe(3) // 4 - 1
    expect(dealt('cinder-witch', 'boss', [], 3)).toBe(5) // 6 - 1
  })

  it('an equipped core of the hero element raises damage by its rarity bonus', () => {
    expect(dealt('void-blade', 'grunt', [{ element: 'physical', rarity: 'common' }])).toBe(13)
    expect(dealt('void-blade', 'grunt', [{ element: 'physical', rarity: 'legendary' }])).toBe(18)
  })

  it('a core of another element does nothing', () => {
    expect(dealt('void-blade', 'grunt', [{ element: 'fire', rarity: 'legendary' }])).toBe(12)
  })

  it('advantage and core bonus combine', () => {
    // 6 * 150% (fire core legendary) = 9, then * 150% (vs nature) = 13
    expect(dealt('cinder-witch', 'runner', [{ element: 'fire', rarity: 'legendary' }])).toBe(13)
  })

  it('snapshots the cores in the state', () => {
    const cores: CoreEntry[] = [{ element: 'ice', rarity: 'rare' }]
    expect(createState(1, undefined, 1, cores).cores).toEqual(cores)
    expect(createState(1).cores).toEqual([])
  })

  it('rejects bad cores in a replay', () => {
    const bad = (cores: unknown) =>
      expect(() =>
        runReplay({ seed: 1, ticks: 10, inputs: [], cores: cores as CoreEntry[] })
      ).toThrow(RangeError)
    bad('fire')
    bad([{ element: 'wind', rarity: 'common' }])
    bad([{ element: 'fire', rarity: 'mythic' }])
    bad([{ element: 'fire' }])
    bad(Array.from({ length: CORE_SLOTS + 1 }, () => ({ element: 'fire', rarity: 'common' })))
  })
})

describe('elemental balance replays', () => {
  /** Same build and inputs for every run; only the pool and cores change. */
  const inputs: SimInput[] = [
    { tick: 0, type: 'summon', tile: 27 },
    { tick: 0, type: 'summon', tile: 22 },
    { tick: 0, type: 'summon', tile: 26 },
    { tick: 60, type: 'summon', tile: 28 },
    { tick: 100, type: 'summon', tile: 21 },
  ]
  const play = (hero: HeroId, cores: CoreEntry[]): SimState =>
    runReplay({ seed: 7, ticks: 700, inputs, pool: [{ hero, star: 1 }], cores })
  const hpLeft = (s: SimState) => s.enemies.reduce((a, e) => a + e.hp, 0)

  it('replay is deterministic with cores', () => {
    const cores: CoreEntry[] = [{ element: 'fire', rarity: 'epic' }]
    expect(play('cinder-witch', cores)).toEqual(play('cinder-witch', cores))
  })

  it('a matching core leaves the lane with less enemy health than no core', () => {
    const base = play('cinder-witch', [])
    const boosted = play('cinder-witch', [{ element: 'fire', rarity: 'legendary' }])
    expect(boosted.gold).toBeGreaterThanOrEqual(base.gold)
    expect(hpLeft(boosted)).toBeLessThan(hpLeft(base))
  })

  it('a mismatched core changes nothing', () => {
    const { cores, ...mismatched } = play('cinder-witch', [{ element: 'ice', rarity: 'legendary' }])
    const { cores: none, ...base } = play('cinder-witch', [])
    expect(cores).toHaveLength(1)
    expect(none).toHaveLength(0)
    expect(mismatched).toEqual(base)
  })
})
