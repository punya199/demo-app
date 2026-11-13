import { describe, expect, it } from 'vitest'
import {
  ENEMY_SPEED,
  HEROES,
  KILL_REWARD,
  LANE_LENGTH,
  SPAWN_EVERY,
  START_GOLD,
  START_HP,
  SUMMON_COST,
  TILE_COUNT,
} from './config'
import { createState, step, type SimState } from './sim'

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
    expect(run(s, 5).enemies[0].pos).toBe(before + 5 * ENEMY_SPEED)
  })

  it('keeps spawning on a fixed schedule', () => {
    expect(run(createState(1), SPAWN_EVERY + 5).spawned).toBe(2)
  })

  it('costs HQ health when an enemy leaks, and ends the run at zero', () => {
    const leaking = { ...createState(1), tick: 1, spawned: 1, enemies: [{ id: 0, pos: LANE_LENGTH - 1, hp: 5 }] }
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
  const base = { ...createState(1), tick: 1, spawned: 1 }
  const archer = { tile: 0, hero: 'archer' as const, cooldown: 0 }

  it('a gear damages the enemy furthest along the lane, then cools down', () => {
    const s = step(
      {
        ...base,
        gears: [archer],
        enemies: [
          { id: 0, pos: 500, hp: 50 },
          { id: 1, pos: 100, hp: 50 },
        ],
      },
      []
    )
    expect(s.enemies.find((e) => e.id === 0)?.hp).toBe(50 - HEROES.archer.damage)
    expect(s.enemies.find((e) => e.id === 1)?.hp).toBe(50)
    expect(s.gears[0].cooldown).toBe(HEROES.archer.cooldown)
    const next = step(s, [])
    expect(next.enemies.find((e) => e.id === 0)?.hp).toBe(50 - HEROES.archer.damage)
    expect(next.gears[0].cooldown).toBe(HEROES.archer.cooldown - 1)
  })

  it('a kill removes the enemy and pays gold', () => {
    const s = step(
      { ...base, gold: 0, gears: [archer], enemies: [{ id: 0, pos: 500, hp: HEROES.archer.damage }] },
      []
    )
    expect(s.enemies).toHaveLength(0)
    expect(s.gold).toBe(KILL_REWARD)
  })

  it('does nothing when the lane is empty', () => {
    expect(step({ ...base, gears: [archer] }, []).gears[0].cooldown).toBe(0)
  })
})
