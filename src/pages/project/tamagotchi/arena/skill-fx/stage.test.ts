import { describe, expect, it, vi } from 'vitest'
import { IArenaEvent, IArenaFighterSummary, IArenaReplay, IArenaSkill } from '../arena-interface'
import { ACT, BASIC_NAME } from '../replay-anim'
import { castsOf } from './casts'
import { RAID } from './raid'
import { createSkillStage, IStagePlace, skillFxOf } from './stage'
import { BOLT } from './bolt'
import { DARK } from './dark'
import { EARTH } from './earth'
import { FIRE } from './fire'
import { HOLY } from './holy'
import { LEAF } from './leaf'
import { SHADOW } from './shadow'
import { WATER } from './water'

const LINES = { FIRE, WATER, LEAF, EARTH, BOLT, HOLY, DARK, SHADOW }

// A canvas context that accepts every call (gradients included), for drawing in jsdom.
const fakeCtx = () => {
  const gradient = { addColorStop: () => {} }
  return new Proxy({} as Record<string, unknown>, {
    get: (target, key) =>
      key in target
        ? target[key as string]
        : key === 'createRadialGradient' || key === 'createLinearGradient'
          ? () => gradient
          : () => {},
    set: (target, key, value) => {
      target[key as string] = value
      return true
    },
  }) as unknown as CanvasRenderingContext2D
}

// [x, y, hp, act, kind, actT, inv, face, shield, bits]
const row = (x: number, over: Partial<Record<number, number>> = {}) => {
  const r = [x, 15000, 100, ACT.MOVE, -1, 0, 0, 1, 0, 0]
  for (const [k, v] of Object.entries(over)) r[+k] = v as number
  return r
}

// Fighter 0 winds up `id` (slot 0) for 10 ticks, releases at tick 10 and hits fighter 1 at 10, 14, 18.
const castReplay = (id: string, name: string, sprite: string | null = null): IArenaReplay => {
  const frames = Array.from({ length: 120 }, (_, i) => ({
    f: [row(20000, i < 10 ? { 3: ACT.WIND, 4: 0, 5: 10 - i } : {}), row(30000)],
    p: [],
    z: [],
  }))
  const events: Partial<IArenaEvent>[] = [
    { t: 10, kind: 'skill', who: 0, skill: name },
    { t: 10, kind: 'hit', who: 0, target: 1, skill: name, dmg: 5 },
    { t: 14, kind: 'hit', who: 0, target: 1, skill: name, dmg: 5, crit: true },
    { t: 18, kind: 'hit', who: 0, target: 1, skill: name, dmg: 5 },
    { t: 30, kind: 'zoneHit', who: 0, x: 30000, y: 15000, r: 60 },
    { t: 40, kind: 'hit', who: 1, target: 0, skill: BASIC_NAME, dmg: 3 },
    { t: 50, kind: 'rebirth', who: 0 },
    { t: 60, kind: 'laststand', who: 1 },
  ]
  return {
    seed: 1,
    winner: 0,
    ticks: 120,
    step: 1,
    frames,
    events: events as IArenaEvent[],
    fighters: [
      { idx: 0, team: 0, skills: [id], allSlots: [id], maxHp: 100, sprite },
      { idx: 1, team: 1, skills: ['leaf_ent', 'ltn_cat'], allSlots: [], maxHp: 100 },
    ] as unknown as IArenaFighterSummary[],
    checksum: '',
  }
}

const place = (x: number): IStagePlace => ({
  x,
  y: 120,
  flip: false,
  grow: 1,
  size: 48,
  foot: 44,
  mouth: [36, 20],
  hover: 0,
  hp: 100,
  hpMax: 100,
  dead: false,
})

describe('castsOf', () => {
  it('finds the wind-up, release, hits and zone of a cast', () => {
    const skills = { flame_lava: { id: 'flame_lava', name: 'ลาวาทับ' } as IArenaSkill }
    const [cast] = castsOf(castReplay('flame_lava', 'ลาวาทับ'), skills)
    expect(cast).toMatchObject({ skill: 'flame_lava', who: 0, target: 1, startT: 0, releaseT: 0.5 })
    expect(cast.hits.map((h) => h.t)).toEqual([0.5, 0.7, 0.9])
    expect(cast.hits[1].crit).toBe(true)
    expect(cast.zoneT).toBe(1.5)
  })

  it('skips basic attacks and skills it cannot name', () => {
    const replay = castReplay('nope', 'ไม่มีชื่อนี้')
    expect(castsOf(replay, {})).toEqual([])
  })
})

describe('skillFxOf', () => {
  it('has an animation for every active skill of every line, and none for passives', () => {
    for (const [line, fx] of Object.entries(LINES)) {
      const ids = Object.keys(fx)
      expect(ids, line).toHaveLength(8)
      for (const id of ids) expect(!!skillFxOf(id), id).toBe(!fx[id].passive)
    }
  })

  it('gives each raid boss its own version of a shared skill', () => {
    for (const s of Object.values(RAID)) expect(skillFxOf(s.game as string, s.boss)).toBe(s)
    expect(skillFxOf('e_mistbite', 'abyssfish')).not.toBe(skillFxOf('e_mistbite', 'nameless'))
  })
})

describe('skill stage', () => {
  const every = [
    ...Object.values(LINES).flatMap((fx) =>
      Object.entries(fx)
        .filter(([, s]) => !s.passive)
        .map(([id, s]) => [id, s.name, null] as const)
    ),
    ...Object.values(RAID).map((s) => [s.game as string, s.name, s.boss ?? null] as const),
  ]

  it.each(every)('plays %s from wind-up to the end without errors', async (id, name, sprite) => {
    vi.spyOn(Math, 'random').mockReturnValue(0.42)
    const skills = { [id]: { id, name } as IArenaSkill }
    const errors: unknown[] = []
    const stage = createSkillStage(castReplay(id, name, sprite), skills, 427, 293, (err) =>
      errors.push(err)
    )
    const ctx = fakeCtx()
    for (let tick = 0; tick <= 119; tick++) {
      try {
        stage.step(tick, [place(130), place(200)])
      } catch (err) {
        errors.push(err)
      }
      // let the scripts' awaits run between frames
      await Promise.resolve()
      await Promise.resolve()
      try {
        stage.draw(ctx)
      } catch (err) {
        errors.push(err)
      }
    }
    expect(errors).toEqual([])
    vi.restoreAllMocks()
  })
})
