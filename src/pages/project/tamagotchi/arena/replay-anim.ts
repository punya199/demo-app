import { ARENA_SCALE, ARENA_TICK } from './arena-helper'
import { IArenaReplay } from './arena-interface'

// Which sprite animation each fighter shows at a moment of a replay. Purely visual: positions,
// wind-ups and hits all come from the server's replay; this only picks a pose to draw them with.

export type ReplayAnim = 'idle' | 'walk' | 'attack' | 'cast' | 'hurt'

// Frames per animation (sprites/engine/anim.ts).
export const ANIM_FRAMES: Record<ReplayAnim, number> = {
  idle: 12,
  walk: 12,
  attack: 16,
  cast: 16,
  hurt: 6,
}

// Frame row: [x, y, hp, act, kind, actT, inv, face, shield, statusBits, ...]
export const ACT = { MOVE: 0, WIND: 1, DODGE: 2, STUN: 3, CHARGE: 4 }

// The basic attack's name in hit events (the server's BASIC skill).
export const BASIC_NAME = 'โจมตี'

// Seconds a pose lasts after the moment that starts it.
const RECOVER_SEC = 0.4
const HURT_SEC = 0.3
const FLASH_SEC = 0.12
const GROW_PULSE_SEC = 0.6
// Each world boss grow stage adds this much to its drawn size (the owner's choice: same sprite, bigger).
export const GROW_STEP = 0.1
// Moving slower than this (world px a tick) counts as standing still.
const WALK_SPEED = 0.35

interface IFighterIndex {
  // Ticks of this fighter's own basic hits, skill releases, hits taken, grow stages and its KO.
  basic: number[]
  skill: number[]
  hurt: number[]
  grow: number[]
  ko: number | null
  // Per frame: path walked so far (world px) and, during a wind-up, how long the wind-up is.
  walked: number[]
  windTotal: number[]
}

export interface IReplayIndex {
  step: number
  fighters: IFighterIndex[]
}

export const indexReplay = (replay: IArenaReplay): IReplayIndex => {
  const { frames, events, fighters, step } = replay
  const index = fighters.map(
    (): IFighterIndex => ({
      basic: [],
      skill: [],
      hurt: [],
      grow: [],
      ko: null,
      walked: [],
      windTotal: [],
    })
  )
  for (const e of events) {
    if (e.who === undefined) continue
    const f = index[e.who]
    if (!f) continue
    if (e.kind === 'hit') {
      if (e.skill === BASIC_NAME) f.basic.push(e.t)
      if (e.target !== undefined && index[e.target]) index[e.target].hurt.push(e.t)
    } else if (e.kind === 'skill') f.skill.push(e.t)
    else if (e.kind === 'grow') f.grow.push(e.t)
    else if (e.kind === 'ko' && f.ko === null) f.ko = e.t
  }
  index.forEach((f, idx) => {
    let walked = 0
    let total = 0
    frames.forEach((frame, i) => {
      const row = frame.f[idx]
      if (i > 0) {
        const prev = frames[i - 1].f[idx]
        walked += Math.hypot(row[0] - prev[0], row[1] - prev[1]) / ARENA_SCALE
      }
      f.walked.push(walked)
      const [, , , act, kind, actT] = row
      const prev = i > 0 ? frames[i - 1].f[idx] : null
      const sameWind = prev && prev[3] === ACT.WIND && prev[4] === kind && prev[5] >= actT
      total = act === ACT.WIND ? (sameWind ? Math.max(total, actT) : actT) : 0
      f.windTotal.push(total)
    })
  })
  return { step, fighters: index }
}

// The latest tick in a sorted list that is <= t, or null.
const lastAtOrBefore = (list: number[], t: number) => {
  let found: number | null = null
  for (const v of list) {
    if (v > t) break
    found = v
  }
  return found
}

export interface IFighterPose {
  anim: ReplayAnim
  frame: number
  // 0..1 white hit flash.
  flash: number
  ko: boolean
  // Seconds since the KO (for the fall and fade).
  koSec: number
  // Drawn size multiplier (world boss grow) and whether it is dashing (after-images).
  scale: number
  dashing: boolean
  stunned: boolean
}

const frameAt = (anim: ReplayAnim, f: number) =>
  Math.max(0, Math.min(ANIM_FRAMES[anim] - 1, Math.round(f * (ANIM_FRAMES[anim] - 1))))

// The pose of fighter idx at tick (fractional ticks are fine). `stride` is how far (world px) one
// walk cycle carries the sprite, so feet don't slide; `clock` (seconds) drives the idle loop.
export const fighterPose = (
  replay: IArenaReplay,
  index: IReplayIndex,
  idx: number,
  tick: number,
  opts: { stride: number; clock: number; stunBit?: number }
): IFighterPose => {
  const { frames, step } = replay
  const f = index.fighters[idx]
  const fi = Math.min(frames.length - 1, Math.max(0, Math.floor(tick / step)))
  const row = frames[fi].f[idx]
  const next = frames[Math.min(frames.length - 1, fi + 1)].f[idx]
  const [, , hp, act, kind, actT, , , , bits] = row
  const sec = (t: number | null) => (t === null ? Infinity : (tick - t) / ARENA_TICK)

  const grown = f.grow.filter((t) => t <= tick).length
  const growAge = sec(lastAtOrBefore(f.grow, tick))
  const pulse =
    growAge < GROW_PULSE_SEC
      ? 1 + 0.08 * Math.sin(growAge * Math.PI * 5) * (1 - growAge / GROW_PULSE_SEC)
      : 1
  const hurtAge = sec(lastAtOrBefore(f.hurt, tick))
  const base: IFighterPose = {
    anim: 'idle',
    frame: 0,
    flash: hurtAge < FLASH_SEC ? 1 - hurtAge / FLASH_SEC : 0,
    ko: false,
    koSec: 0,
    scale: (1 + GROW_STEP * grown) * pulse,
    dashing: act === ACT.DODGE,
    stunned: !!opts.stunBit && (bits & opts.stunBit) !== 0,
  }

  if (hp === 0) {
    const koTick = f.ko ?? fi * step
    return { ...base, anim: 'hurt', frame: ANIM_FRAMES.hurt - 1, ko: true, koSec: sec(koTick) }
  }
  if (act === ACT.WIND) {
    const total = f.windTotal[fi] || actT || 1
    const prog = Math.max(0, Math.min(1, 1 - actT / total))
    return kind < 0
      ? { ...base, anim: 'attack', frame: frameAt('attack', 0.42 * prog) }
      : { ...base, anim: 'cast', frame: frameAt('cast', 0.45 * prog) }
  }
  if (base.stunned) return { ...base, anim: 'idle', frame: 0 }
  if (hurtAge < HURT_SEC || act === ACT.STUN)
    return {
      ...base,
      anim: 'hurt',
      frame: frameAt('hurt', Math.min(1, hurtAge / HURT_SEC)),
    }
  const basicAge = sec(lastAtOrBefore(f.basic, tick))
  const skillAge = sec(lastAtOrBefore(f.skill, tick))
  if (skillAge < RECOVER_SEC && skillAge <= basicAge)
    return { ...base, anim: 'cast', frame: frameAt('cast', 0.55 + (0.45 * skillAge) / RECOVER_SEC) }
  if (basicAge < RECOVER_SEC)
    return {
      ...base,
      anim: 'attack',
      frame: frameAt('attack', 0.42 + (0.58 * basicAge) / RECOVER_SEC),
    }
  const speed = Math.hypot(next[0] - row[0], next[1] - row[1]) / ARENA_SCALE / step
  if (speed > WALK_SPEED || act === ACT.DODGE || act === ACT.CHARGE) {
    const k = tick / step - fi
    const walked = f.walked[fi] + (f.walked[Math.min(frames.length - 1, fi + 1)] - f.walked[fi]) * k
    const phase = walked / Math.max(1, opts.stride)
    return {
      ...base,
      anim: 'walk',
      frame: Math.floor((phase - Math.floor(phase)) * ANIM_FRAMES.walk),
    }
  }
  const loop = opts.clock * 0.75 + idx * 0.37
  return { ...base, anim: 'idle', frame: Math.floor((loop - Math.floor(loop)) * ANIM_FRAMES.idle) }
}
