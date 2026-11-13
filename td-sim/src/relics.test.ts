import { describe, expect, it } from 'vitest'
import {
  HEROES,
  RELICS,
  RELIC_IDS,
  RELIC_SKILL_DAMAGE_PCT,
  SKILL_IDS,
  SOURCE_TILE,
  type HeroId,
  type SkillId,
} from './config'
import { HERO_ELEMENT } from './elements'
import { createState, draftPool, hashState, runReplay, step, type Gear } from './sim'

/** Damage one shot of a lone level-1 gear deals to a grunt (physical, unarmored) holding `skills`. */
const dealt = (hero: HeroId, skills: SkillId[], relics = RELIC_IDS.slice()): number => {
  const start = createState(1, [{ hero, star: 1 }], 1, [], relics)
  const gear: Gear = { tile: SOURCE_TILE, hero, star: 1, level: 1, cooldown: 0 }
  const s = step(
    {
      ...start,
      tick: 1,
      roundTick: 1,
      spawned: 1,
      skills,
      enemies: [{ id: 0, kind: 'grunt', pos: 500, hp: 1_000_000 }],
      gears: [gear],
    },
    []
  )
  return 1_000_000 - s.enemies[0].hp
}

describe('relic config', () => {
  it('gives every relic a known hero of the matching element and its own skill', () => {
    const skills = new Set<SkillId>()
    for (const id of RELIC_IDS) {
      const r = RELICS[id]
      expect(Object.hasOwn(HEROES, r.hero)).toBe(true)
      expect(HERO_ELEMENT[r.hero]).toBe(r.element)
      expect(SKILL_IDS).not.toContain(r.skill)
      skills.add(r.skill)
    }
    expect(skills.size).toBe(RELIC_IDS.length)
  })
})

describe('relic skills in the draft', () => {
  it('adds only the unlocked relics skills to the pool', () => {
    expect(draftPool([])).toEqual([...SKILL_IDS])
    expect(draftPool(['ember-brand'])).toEqual([...SKILL_IDS, RELICS['ember-brand'].skill])
  })

  const offerFor = (seed: number, relics: typeof RELIC_IDS) => {
    const start = createState(seed, undefined, 1, [], relics)
    // the first round is fully spawned and the lane is empty: the next tick clears it into a draft
    return step({ ...start, tick: 1, roundSpawned: 6 }, []).offer
  }

  it('offers an unlocked relic skill in some drafts, and never without the relic', () => {
    const skill = RELICS['ember-brand'].skill
    const seeds = Array.from({ length: 60 }, (_, i) => i)
    expect(seeds.some((s) => offerFor(s, ['ember-brand']).includes(skill))).toBe(true)
    expect(seeds.some((s) => offerFor(s, []).includes(skill))).toBe(false)
  })
})

describe('relic skills in battle', () => {
  const witch = RELICS['ember-brand']

  it('boosts only the relic hero, per stack', () => {
    expect(dealt(witch.hero, [])).toBe(6)
    expect(dealt(witch.hero, [witch.skill])).toBe(
      Math.floor((6 * (100 + RELIC_SKILL_DAMAGE_PCT)) / 100)
    )
    expect(dealt(witch.hero, [witch.skill, witch.skill])).toBe(
      Math.floor((6 * (100 + 2 * RELIC_SKILL_DAMAGE_PCT)) / 100)
    )
    expect(dealt('archer', [witch.skill])).toBe(3)
  })
})

describe('replay with relics', () => {
  it('rejects an unknown or repeated relic', () => {
    const base = { seed: 1, ticks: 10, inputs: [] }
    expect(() => runReplay({ ...base, relics: ['nope' as never] })).toThrow(RangeError)
    expect(() => runReplay({ ...base, relics: ['ember-brand', 'ember-brand'] })).toThrow(RangeError)
    expect(() => runReplay({ ...base, relics: 'ember-brand' as never })).toThrow(RangeError)
  })

  it('puts the relics in the state hash', () => {
    const base = { seed: 1, ticks: 10, inputs: [] }
    expect(hashState(runReplay({ ...base, relics: ['ember-brand'] }))).not.toBe(
      hashState(runReplay(base))
    )
  })
})
