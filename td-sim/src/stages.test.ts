import { describe, expect, it } from 'vitest'
import {
  BOSS_CALL_COUNT,
  BOSS_CALL_EVERY,
  BOSS_ROUND,
  BOSS_SHIELD_EVERY,
  BOSS_SHIELD_TICKS,
  BOSS_WEAK_HERO,
  ROUNDS,
  ROUND_COUNT,
  STAGES,
  STAGE_COUNT,
} from './config'
import { createState, hashState, runReplay, step } from './sim'

describe('stage config', () => {
  it('has three stages of 7 rounds plus a boss round, boss last and only there', () => {
    expect(STAGE_COUNT).toBe(3)
    expect(STAGES).toHaveLength(3)
    for (const s of STAGES) {
      expect(s.rounds).toHaveLength(ROUND_COUNT + 1)
      expect(s.rounds[BOSS_ROUND].enemies).toEqual(['boss'])
      expect(s.rounds.slice(0, BOSS_ROUND).some((r) => r.enemies.includes('boss'))).toBe(false)
    }
  })

  it('keeps stage 1 as the original stage', () => {
    expect(STAGES[0].rounds).toBe(ROUNDS)
    expect(STAGES[0].boss).toMatchObject({
      callEvery: BOSS_CALL_EVERY,
      callCount: BOSS_CALL_COUNT,
      shieldEvery: BOSS_SHIELD_EVERY,
      shieldTicks: BOSS_SHIELD_TICKS,
      weakHero: BOSS_WEAK_HERO,
      callKind: 'grunt',
    })
  })

  it('gives every stage its own boss pattern and weakness', () => {
    const keys = STAGES.map((s) => JSON.stringify(s.boss))
    expect(new Set(keys).size).toBe(3)
    expect(new Set(STAGES.map((s) => s.boss.weakHero)).size).toBe(3)
  })
})

describe('stage in the sim', () => {
  it('defaults to stage 1', () => {
    expect(createState(5).stage).toBe(1)
    expect(createState(5, undefined, 1)).toEqual(createState(5))
  })

  it('spawns the selected stage enemy mix', () => {
    const first = (stage: number) => {
      let s = createState(1, undefined, stage)
      s = step(s, [])
      return s.enemies.map((e) => e.kind)
    }
    expect(first(2)).toEqual([STAGES[1].rounds[0].enemies[0]])
    expect(first(3)).toEqual([STAGES[2].rounds[0].enemies[0]])
  })

  it('runs the selected stage boss skill pattern', () => {
    for (const [i, def] of STAGES.entries()) {
      const base = createState(1, undefined, i + 1)
      const s = step(
        {
          ...base,
          round: BOSS_ROUND,
          roundSpawned: 1,
          spawned: 1,
          roundTick: def.boss.callEvery,
          enemies: [{ id: 0, kind: 'boss', pos: 0, hp: 1_000_000 }],
        },
        []
      )
      expect(s.enemies.filter((e) => e.kind === def.boss.callKind && e.id !== 0)).toHaveLength(
        def.boss.callCount
      )
    }
  })

  it('hashes the stage, so the same log on another stage is not the same battle', () => {
    const a = runReplay({ seed: 3, ticks: 200, inputs: [] })
    const b = runReplay({ seed: 3, ticks: 200, inputs: [], stage: 2 })
    expect(hashState(a)).not.toBe(hashState(b))
    expect(hashState(runReplay({ seed: 3, ticks: 200, inputs: [], stage: 1 }))).toBe(hashState(a))
  })

  it('rejects an unknown stage', () => {
    for (const stage of [0, 4, 1.5, NaN]) {
      expect(() => runReplay({ seed: 3, ticks: 10, inputs: [], stage })).toThrow(RangeError)
    }
  })
})
