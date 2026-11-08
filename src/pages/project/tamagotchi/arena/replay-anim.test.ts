import { describe, expect, it } from 'vitest'
import { IArenaEvent, IArenaFighterSummary, IArenaReplay } from './arena-interface'
import { ACT, BASIC_NAME, fighterPose, GROW_STEP, indexReplay } from './replay-anim'

// A two-fighter replay, one frame per tick. rows(i) gives fighter rows at frame i.
const makeReplay = (
  n: number,
  rows: (i: number) => number[][],
  events: Partial<IArenaEvent>[] = []
): IArenaReplay => ({
  seed: 1,
  winner: 0,
  ticks: n,
  step: 1,
  frames: Array.from({ length: n }, (_, i) => ({ f: rows(i), p: [], z: [] })),
  events: events as IArenaEvent[],
  fighters: [{ idx: 0 }, { idx: 1 }] as IArenaFighterSummary[],
  checksum: '',
})
// [x, y, hp, act, kind, actT, inv, face, shield, bits]
const row = (over: Partial<Record<number, number>> = {}) => {
  const r = [10000, 10000, 100, ACT.MOVE, -1, 0, 0, 1, 0, 0]
  for (const [k, v] of Object.entries(over)) r[+k] = v as number
  return r
}
const opts = { stride: 40, clock: 0 }

describe('fighterPose', () => {
  it('stands idle when nothing happens', () => {
    const replay = makeReplay(5, () => [row(), row()])
    const pose = fighterPose(replay, indexReplay(replay), 0, 2, opts)
    expect(pose.anim).toBe('idle')
    expect(pose.ko).toBe(false)
    expect(pose.scale).toBe(1)
  })

  it('walks while moving, with the cycle following the distance walked', () => {
    // 2 px a tick to the right
    const replay = makeReplay(30, (i) => [row({ 0: 10000 + i * 200 }), row()])
    const index = indexReplay(replay)
    const a = fighterPose(replay, index, 0, 5, opts)
    const b = fighterPose(replay, index, 0, 10, opts)
    expect(a.anim).toBe('walk')
    // 10 px of a 40 px stride = a quarter of the 12-frame cycle
    expect(a.frame).toBe(3)
    expect(b.frame).toBe(6)
  })

  it('winds a basic attack up, then follows through after the hit', () => {
    // wind-up of 10 ticks from tick 0, the hit at tick 10
    const replay = makeReplay(
      20,
      (i) => [i < 10 ? row({ 3: ACT.WIND, 4: -1, 5: 10 - i }) : row(), row()],
      [{ t: 10, kind: 'hit', who: 0, target: 1, skill: BASIC_NAME }]
    )
    const index = indexReplay(replay)
    const start = fighterPose(replay, index, 0, 0, opts)
    const mid = fighterPose(replay, index, 0, 5, opts)
    const after = fighterPose(replay, index, 0, 12, opts)
    expect(start).toMatchObject({ anim: 'attack', frame: 0 })
    expect(mid.anim).toBe('attack')
    expect(mid.frame).toBeGreaterThan(0)
    expect(after.anim).toBe('attack')
    expect(after.frame).toBeGreaterThan(mid.frame)
    // the target flinches and flashes white
    const hurt = fighterPose(replay, index, 1, 10, opts)
    expect(hurt).toMatchObject({ anim: 'hurt', flash: 1 })
    expect(fighterPose(replay, index, 1, 19, opts).anim).toBe('idle')
  })

  it('casts during a skill wind-up and after its release', () => {
    const replay = makeReplay(
      20,
      (i) => [i < 8 ? row({ 3: ACT.WIND, 4: 0, 5: 8 - i }) : row(), row()],
      [{ t: 8, kind: 'skill', who: 0, skill: 'ลูกไฟ' }]
    )
    const index = indexReplay(replay)
    expect(fighterPose(replay, index, 0, 4, opts).anim).toBe('cast')
    expect(fighterPose(replay, index, 0, 10, opts).anim).toBe('cast')
    expect(fighterPose(replay, index, 0, 19, opts).anim).toBe('idle')
  })

  it('falls at a KO and counts the seconds since', () => {
    const replay = makeReplay(60, (i) => [row(), row({ 2: i >= 10 ? 0 : 50 })], [
      { t: 10, kind: 'ko', who: 1 },
    ])
    const pose = fighterPose(replay, indexReplay(replay), 1, 30, opts)
    expect(pose).toMatchObject({ anim: 'hurt', ko: true, koSec: 1 })
  })

  it('grows a world boss by one step per grow event, with a pulse', () => {
    const replay = makeReplay(80, () => [row(), row()], [
      { t: 10, kind: 'grow', who: 1 },
      { t: 30, kind: 'grow', who: 1 },
    ])
    const index = indexReplay(replay)
    expect(fighterPose(replay, index, 1, 5, opts).scale).toBe(1)
    expect(fighterPose(replay, index, 1, 25, opts).scale).toBeCloseTo(1 + GROW_STEP)
    expect(fighterPose(replay, index, 1, 70, opts).scale).toBeCloseTo(1 + 2 * GROW_STEP)
    expect(fighterPose(replay, index, 1, 32, opts).scale).not.toBeCloseTo(1 + 2 * GROW_STEP)
  })

  it('freezes a stunned fighter and marks a dash', () => {
    const replay = makeReplay(10, () => [row({ 9: 4 }), row({ 3: ACT.DODGE, 0: 10000 })])
    const index = indexReplay(replay)
    expect(fighterPose(replay, index, 0, 3, { ...opts, stunBit: 4 })).toMatchObject({
      anim: 'idle',
      frame: 0,
      stunned: true,
    })
    expect(fighterPose(replay, index, 1, 3, opts)).toMatchObject({ anim: 'walk', dashing: true })
  })
})
