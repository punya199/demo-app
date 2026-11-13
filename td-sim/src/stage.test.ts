import { describe, expect, it } from 'vitest'
import {
  BOSS_CALL_COUNT,
  BOSS_CALL_EVERY,
  BOSS_ROUND,
  MAX_LEVEL,
  ROUND_COUNT,
  SUMMON_COST,
  BOSS_SHIELD_TICKS,
  BOSS_WEAK_DAMAGE_PCT,
  HEROES,
  DRAFT_SIZE,
  SKILL_BANK_GOLD,
  SKILL_BOUNTY,
  SKILL_IDS,
  SKILL_REPAIR_HP,
  SOURCE_TILE,
  type SkillId,
  ENEMIES,
  ENEMY_BASE_HP,
  HP_GROWTH_PCT,
  INCOME_EVERY,
  ROUNDS,
  START_HP,
  STAGES,
  type EnemyKind,
} from './config'
import { advantagePct, HERO_ELEMENT } from './elements'
import { DEFAULT_MAX_TICKS, TICK_MS, createState, step, type SimInput, type SimState } from './sim'

const run = (state: SimState, ticks: number): SimState => {
  for (let i = 0; i < ticks; i++) state = step(state, [])
  return state
}

describe('rounds', () => {
  it('starts on round 0 in the fight phase', () => {
    const s = createState(1)
    expect([s.round, s.phase, s.status]).toEqual([0, 'fight', 'running'])
  })

  it('spawns the round list in order on its own schedule, scaled by type', () => {
    const s = run(createState(1), ROUNDS[0].every * 2 + 1)
    expect(s.enemies.map((e) => e.kind)).toEqual(ROUNDS[0].enemies.slice(0, 3))
    expect(s.enemies[0].hp).toBe(ENEMY_BASE_HP) // grunt, round 0
  })

  it('scales hp with the round and with the enemy type', () => {
    const base = { ...createState(1), round: 3, phase: 'fight' as const }
    const s = step(base, [])
    const kind = ROUNDS[3].enemies[0]
    const expected = Math.floor(
      (((ENEMY_BASE_HP * ENEMIES[kind].hpPct) / 100) * (100 + HP_GROWTH_PCT * 3)) / 100
    )
    expect(s.enemies[0].hp).toBe(expected)
  })

  it('has six ordinary enemy types and a boss, all in use', () => {
    const used = new Set<EnemyKind>(ROUNDS.flatMap((r) => r.enemies))
    expect([...used].sort()).toEqual(Object.keys(ENEMIES).sort())
    expect(Object.keys(ENEMIES)).toHaveLength(7)
    expect(ROUNDS).toHaveLength(BOSS_ROUND + 1)
  })

  it('different enemy types walk at their own speed', () => {
    const at = { ...createState(1), tick: 1, roundSpawned: ROUNDS[0].enemies.length, spawned: 2 }
    const s = step(
      {
        ...at,
        enemies: [
          { id: 0, kind: 'runner', pos: 0, hp: 9 },
          { id: 1, kind: 'tank', pos: 0, hp: 9 },
        ],
      },
      []
    )
    expect(s.enemies.map((e) => e.pos)).toEqual([ENEMIES.runner.speed, ENEMIES.tank.speed])
  })

  it('a leak costs the enemy type its own leak damage', () => {
    const s = step(
      {
        ...createState(1),
        tick: 1,
        roundSpawned: ROUNDS[0].enemies.length,
        spawned: 1,
        enemies: [{ id: 0, kind: 'tank', pos: 999, hp: 9 }],
      },
      []
    )
    expect(s.hp).toBe(START_HP - ENEMIES.tank.leak)
  })

  it('opens the draft when the round is spawned out and the lane is clear', () => {
    const cleared = {
      ...createState(1),
      tick: 1,
      roundSpawned: ROUNDS[0].enemies.length,
      spawned: ROUNDS[0].enemies.length,
    }
    const s = step(cleared, [])
    expect(s.phase).toBe('draft')
    expect(s.round).toBe(0)
  })

  it('freezes the economy and the lane while drafting', () => {
    const drafting = { ...createState(1), phase: 'draft' as const, offer: ['power' as const] }
    const s = run(drafting, INCOME_EVERY * 3)
    expect(s.gold).toBe(drafting.gold)
    expect(s.tick).toBe(INCOME_EVERY * 3)
  })
})

describe('skill draft', () => {
  const clearedRound = (seed: number, extra: Partial<SimState> = {}): SimState =>
    step(
      {
        ...createState(seed),
        tick: 1,
        roundTick: 5,
        roundSpawned: ROUNDS[0].enemies.length,
        ...extra,
      },
      []
    )

  it('offers 3 distinct skills', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const { offer } = clearedRound(seed)
      expect(offer).toHaveLength(DRAFT_SIZE)
      expect(new Set(offer).size).toBe(DRAFT_SIZE)
      for (const k of offer) expect(SKILL_IDS).toContain(k)
    }
  })

  it('is seeded: same seed, same offer; the seeds do not all agree', () => {
    expect(clearedRound(7).offer).toEqual(clearedRound(7).offer)
    expect(
      new Set(Array.from({ length: 30 }, (_, i) => clearedRound(i + 1).offer.join())).size
    ).toBeGreaterThan(3)
  })

  it('a pick adds the skill and starts the next round', () => {
    const d = clearedRound(3)
    const s = step(d, [{ tick: d.tick, type: 'pick', index: 1 }])
    expect(s.skills).toEqual([d.offer[1]])
    expect([s.phase, s.round, s.roundTick, s.roundSpawned, s.offer]).toEqual(['fight', 1, 0, 0, []])
  })

  it('ignores a bad pick and keeps waiting', () => {
    const d = clearedRound(3)
    for (const index of [-1, 3, 1.5]) {
      expect(step(d, [{ tick: d.tick, type: 'pick', index }]).phase).toBe('draft')
    }
    expect(step(d, [{ tick: d.tick, type: 'summon', tile: 0 }]).gears).toHaveLength(0)
  })

  it('applies each skill', () => {
    const base = (skill: SkillId) => ({
      ...createState(1),
      phase: 'draft' as const,
      offer: [skill],
      hp: 4,
      gold: 0,
    })
    const pick = (skill: SkillId) => step(base(skill), [{ tick: 0, type: 'pick', index: 0 }])
    expect(pick('bank').gold).toBe(SKILL_BANK_GOLD)
    expect(pick('repair').hp).toBe(4 + SKILL_REPAIR_HP)
    expect(
      step({ ...base('repair'), hp: START_HP }, [{ tick: 0, type: 'pick', index: 0 }]).hp
    ).toBe(START_HP)
    expect(pick('power').skills).toEqual(['power'])
  })

  const lane = (skills: SkillId[], kill = false): SimState => ({
    ...createState(1),
    tick: 1,
    roundTick: 1,
    roundSpawned: 1,
    spawned: 1,
    gold: 0,
    skills,
    gears: [{ tile: SOURCE_TILE, hero: 'archer', star: 1, level: 1, cooldown: 0 }],
    enemies: [{ id: 0, kind: 'grunt', pos: 500, hp: kill ? 1 : 1000 }],
  })

  it('power raises damage, bounty raises kill gold', () => {
    const dmg = (s: SimState) => 1000 - step(s, []).enemies[0].hp
    expect(dmg(lane(['power', 'power']))).toBeGreaterThan(dmg(lane([])))
    expect(step(lane([], true), []).gold).toBe(ENEMIES.grunt.reward)
    expect(step(lane(['bounty', 'bounty'], true), []).gold).toBe(
      ENEMIES.grunt.reward + 2 * SKILL_BOUNTY
    )
  })

  it('haste charges faster', () => {
    const charging = (skills: SkillId[]) =>
      step({ ...lane(skills), gears: [{ ...lane([]).gears[0], cooldown: 500 }] }, []).gears[0]
        .cooldown
    expect(charging(['haste'])).toBeLessThan(charging([]))
  })
})

describe('boss', () => {
  const bossRound = (roundTick: number, hero: 'archer' | 'mage', bossHp = 100000): SimState => ({
    ...createState(1),
    tick: 1,
    round: BOSS_ROUND,
    roundTick,
    roundSpawned: 1,
    spawned: 1,
    gears: [{ tile: SOURCE_TILE, hero, star: 1, level: 1, cooldown: 0 }],
    enemies: [{ id: 0, kind: 'boss', pos: 100, hp: bossHp }],
  })
  const dealt = (s: SimState) => 100000 - step(s, []).enemies[0].hp
  const open = BOSS_SHIELD_TICKS // first tick of an unshielded window

  it('takes extra damage from its weak hero, and less while shielded', () => {
    const mageHit = HEROES.mage.damage
    const archerHit = HEROES.archer.damage
    expect(mageHit).toBeGreaterThan(archerHit) // same level and no neighbours: raw damage ordering
    expect(dealt(bossRound(open, 'mage'))).toBe(
      Math.max(
        1,
        Math.floor(
          (Math.floor((mageHit * advantagePct(HERO_ELEMENT.mage, STAGES[0].boss.element)) / 100) *
            BOSS_WEAK_DAMAGE_PCT) /
            100
        ) - ENEMIES.boss.armor
      )
    )
    expect(dealt(bossRound(0, 'archer'))).toBeLessThan(dealt(bossRound(open, 'archer')))
  })

  it('calls grunts on its pattern, only while alive', () => {
    const calling = step(bossRound(BOSS_CALL_EVERY, 'archer'), [])
    expect(calling.enemies.filter((e) => e.kind === 'grunt')).toHaveLength(BOSS_CALL_COUNT)
    const quiet = step(bossRound(BOSS_CALL_EVERY + 1, 'archer'), [])
    expect(quiet.enemies.filter((e) => e.kind === 'grunt')).toHaveLength(0)
  })

  it('killing the boss wins the run, and the sim then stops', () => {
    const won = step(bossRound(open, 'mage', 1), [])
    expect(won.status).toBe('won')
    expect(step(won, [{ tick: won.tick, type: 'summon', tile: 0 }])).toBe(won)
  })

  it('the boss reaching the HQ hurts a lot', () => {
    const s = step(
      {
        ...bossRound(open, 'archer'),
        enemies: [{ id: 0, kind: 'boss', pos: 999, hp: 99 }],
        gears: [],
      },
      []
    )
    expect(s.hp).toBe(START_HP - ENEMIES.boss.leak)
  })
})

describe('a whole stage', () => {
  const ORDER = [27, 22, 26, 28, 21, 23, 17, 25, 29, 20, 24, 19, 15, 16, 18, 12, 14, 10, 11, 13]
  /** A naive player: merge anything identical, else summon along the chain from the source, always take the first skill. */
  const naive = (s: SimState): SimInput[] => {
    for (const a of s.gears)
      for (const b of s.gears)
        if (a.tile < b.tile && a.hero === b.hero && a.level === b.level && a.level < MAX_LEVEL)
          return [{ tick: s.tick, type: 'merge', from: a.tile, to: b.tile }]
    const tile = ORDER.find((t) => !s.gears.some((g) => g.tile === t))
    return tile !== undefined && s.gold >= SUMMON_COST
      ? [{ tick: s.tick, type: 'summon', tile }]
      : []
  }
  const play = (seed: number, strategy: (s: SimState) => SimInput[]): SimState => {
    let s = createState(seed)
    const rounds = new Set<number>()
    while (s.tick < DEFAULT_MAX_TICKS && s.status === 'running') {
      rounds.add(s.round)
      s = step(s, s.phase === 'draft' ? [{ tick: s.tick, type: 'pick', index: 0 }] : strategy(s))
    }
    expect(s.status === 'lost' || rounds.size === ROUNDS.length).toBe(true)
    return s
  }

  it('can be won: 7 rounds and the boss, ending on a win', () => {
    const results = Array.from({ length: 10 }, (_, i) => play(i + 1, naive))
    const won = results.filter((s) => s.status === 'won')
    expect(won.length).toBeGreaterThan(0)
    expect(won[0].round).toBe(BOSS_ROUND)
    expect(won[0].skills).toHaveLength(ROUND_COUNT)
  })

  it('takes minutes of game time, not seconds', () => {
    const won = Array.from({ length: 10 }, (_, i) => play(i + 1, naive)).find(
      (s) => s.status === 'won'
    )!
    expect(won.tick * TICK_MS).toBeGreaterThan(3 * 60_000)
    expect(won.tick).toBeLessThan(DEFAULT_MAX_TICKS)
  })

  it('is lost by a player who does nothing', () => {
    expect(play(1, () => []).status).toBe('lost')
  })
})
