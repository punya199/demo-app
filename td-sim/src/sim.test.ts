import { describe, expect, it } from 'vitest'
import { outputOf } from './board'
import {
  CHARGE_BASE,
  CHARGE_SCALE,
  ENEMIES,
  HEROES,
  LANE_LENGTH,
  SOURCE_TILE,
  ROUNDS,
  START_GOLD,
  START_HP,
  SUMMON_COST,
  TILE_COUNT,
} from './config'
import { GOLDEN_HASH, GOLDEN_REPLAY } from './golden'
import { createState, hashState, runReplay, step, type SimInput, type SimState } from './sim'

/** Step a run, always taking the first draft offer, with `moves` supplying any other inputs each tick. */
const play = (seed: number, ticks: number, moves: (s: SimState) => SimInput[]): SimState => {
  let s = createState(seed)
  while (s.tick < ticks && s.status === 'running') {
    s = step(s, s.phase === 'draft' ? [{ tick: s.tick, type: 'pick', index: 0 }] : moves(s))
  }
  return s
}

const run = (state: SimState, ticks: number): SimState => {
  for (let i = 0; i < ticks; i++) state = step(state, [])
  return state
}

describe('summon', () => {
  it('spends run-gold and puts a gear on the chosen free tile', () => {
    const s = step(createState(1), [{ tick: 0, type: 'summon', tile: 7 }])
    expect(s.gears).toHaveLength(1)
    expect(s.gears[0].tile).toBe(7)
    expect(s.gold).toBeLessThanOrEqual(START_GOLD - SUMMON_COST + 1) // income may add 1
    expect(s.gold).toBeGreaterThanOrEqual(START_GOLD - SUMMON_COST)
  })

  it('is ignored when the tile is taken, off the board, or gold is short', () => {
    const once = step(createState(1), [{ tick: 0, type: 'summon', tile: 7 }])
    const taken = step(once, [{ tick: 1, type: 'summon', tile: 7 }])
    expect(taken.gears).toHaveLength(1)
    const off = step(createState(1), [{ tick: 0, type: 'summon', tile: TILE_COUNT }])
    expect(off.gears).toHaveLength(0)
    const broke = step({ ...createState(1), gold: SUMMON_COST - 1 }, [
      { tick: 0, type: 'summon', tile: 0 },
    ])
    expect(broke.gears).toHaveLength(0)
  })
})

describe('lane', () => {
  it('spawns enemies that walk toward the HQ', () => {
    const s = run(createState(1), 10)
    expect(s.enemies).toHaveLength(1)
    const before = s.enemies[0].pos
    expect(run(s, 5).enemies[0].pos).toBe(before + 5 * ENEMIES.grunt.speed)
  })

  it('keeps spawning on a fixed schedule', () => {
    expect(run(createState(1), ROUNDS[0].every + 5).spawned).toBe(2)
  })

  it('costs HQ health when an enemy leaks, and ends the run at zero', () => {
    const leaking = {
      ...createState(1),
      tick: 1,
      spawned: 1,
      enemies: [{ id: 0, kind: 'grunt' as const, pos: LANE_LENGTH - 1, hp: 5 }],
    }
    const s = step(leaking, [])
    expect(s.hp).toBe(START_HP - 1)
    expect(s.enemies.some((e) => e.id === 0)).toBe(false)

    const dying = step({ ...leaking, hp: 1 }, [])
    expect(dying.hp).toBe(0)
    expect(dying.status).toBe('lost')
    expect(step(dying, [{ tick: dying.tick, type: 'summon', tile: 0 }])).toBe(dying)
  })
})

describe('firing', () => {
  const base = { ...createState(1), tick: 1, spawned: 1, roundTick: 1, roundSpawned: 1 }
  const archer = { tile: SOURCE_TILE, hero: 'archer' as const, star: 1, level: 1, cooldown: 0 }
  const ALONE = outputOf(archer, [archer]).damage
  const FULL = HEROES.archer.cooldown * CHARGE_SCALE

  it('a gear damages the enemy furthest along the lane, then cools down', () => {
    const s = step(
      {
        ...base,
        gears: [archer],
        enemies: [
          { id: 0, kind: 'grunt' as const, pos: 500, hp: 50 },
          { id: 1, kind: 'grunt' as const, pos: 100, hp: 50 },
        ],
      },
      []
    )
    expect(s.enemies.find((e) => e.id === 0)?.hp).toBe(50 - ALONE)
    expect(s.enemies.find((e) => e.id === 1)?.hp).toBe(50)
    expect(s.gears[0].cooldown).toBe(FULL)
    const next = step(s, [])
    expect(next.enemies.find((e) => e.id === 0)?.hp).toBe(50 - ALONE)
    expect(next.gears[0].cooldown).toBe(FULL - CHARGE_BASE)
  })

  it('a kill removes the enemy and pays gold', () => {
    const s = step(
      {
        ...base,
        gold: 0,
        gears: [archer],
        enemies: [{ id: 0, kind: 'grunt' as const, pos: 500, hp: ALONE }],
      },
      []
    )
    expect(s.enemies).toHaveLength(0)
    expect(s.gold).toBe(ENEMIES.grunt.reward)
  })

  it('does nothing when the lane is empty', () => {
    expect(step({ ...base, gears: [archer] }, []).gears[0].cooldown).toBe(0)
  })
})

describe('runReplay', () => {
  const replay = {
    seed: 5,
    ticks: 600,
    inputs: [
      { tick: 0, type: 'summon' as const, tile: 3 },
      { tick: 10, type: 'summon' as const, tile: 4 },
    ],
  }

  it('is deterministic for the same seed and inputs', () => {
    expect(hashState(runReplay(replay))).toBe(hashState(runReplay(replay)))
  })

  it('differs for a different seed', () => {
    expect(hashState(runReplay({ ...replay, seed: 6 }))).not.toBe(hashState(runReplay(replay)))
  })

  it('runs the requested ticks, or stops when the run is lost', () => {
    expect(runReplay({ seed: 1, ticks: 37, inputs: [] }).tick).toBe(37)
    const lost = play(1, 12_000, () => [])
    expect(lost.status).toBe('lost')
    expect(lost.tick).toBeLessThan(12_000)
  })

  it('rejects a log longer than the tick cap', () => {
    expect(() => runReplay({ seed: 1, ticks: 101, inputs: [] }, { maxTicks: 100 })).toThrow(
      RangeError
    )
  })

  it('rejects malformed input logs', () => {
    const bad = (inputs: unknown[]) =>
      runReplay({ seed: 1, ticks: 20, inputs: inputs as never }, { maxTicks: 100 })
    const summon = (tick: number, tile: number) => ({ tick, type: 'summon', tile })
    expect(() => bad([summon(5, 1), summon(4, 1)])).toThrow(RangeError)
    expect(() => bad([summon(20, 1)])).toThrow(RangeError)
    expect(() => bad([summon(1.5, 1)])).toThrow(RangeError)
    expect(() => bad([summon(1, 1.5)])).toThrow(RangeError)
    expect(() => bad([summon(1, -1)])).toThrow(RangeError)
    expect(() => bad([{ tick: 1, type: 'bogus', tile: 1 }])).toThrow(RangeError)
  })

  it('the golden replay exercises merge, linking and an unlinked gear', () => {
    const end = runReplay(GOLDEN_REPLAY)
    expect(end.gears.find((g) => g.tile === 26)?.level).toBe(2)
    expect(end.gears.some((g) => g.tile === 21)).toBe(false)
    // both drafts were taken at the ticks the log says, and the run is back in a fight
    expect(end.skills).toHaveLength(2)
    expect([end.round, end.phase]).toEqual([2, 'fight'])
    expect(end.gears.find((g) => g.tile === 0)?.cooldown).toBe(
      HEROES[end.gears.find((g) => g.tile === 0)!.hero].cooldown * CHARGE_SCALE
    )
  })

  it('matches the golden replay hash', () => {
    expect(hashState(runReplay(GOLDEN_REPLAY))).toBe(GOLDEN_HASH)
  })
})
