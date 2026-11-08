import { smooth, TAU, lerp } from './math'
import { BIPED, BLOB, FLY, POSE0, SWIM } from './rigs'
import type { IPose, IPoseKey, IRig, Vec } from '../sprite-types'

// Animations, ported from the prototype's js/core.js. Each is sampled from continuous pose curves
// (many in-between frames) and baked lazily, so every frame keeps crisp pixel shading. Walk and idle
// loop; attack, cast and hurt run once (0..1).

export const fullPose = (p: IPoseKey): IPose => ({ ...POSE0, ...p })

export function mixPose(a: IPose, b: IPose, t: number): IPose {
  const o = { ...POSE0 }
  for (const k of Object.keys(POSE0) as (keyof IPose)[]) {
    const x = a[k],
      y = b[k]
    if (Array.isArray(x) && Array.isArray(y))
      (o[k] as number[]) = [lerp(x[0], y[0], t), lerp(x[1], y[1], t)]
    else (o[k] as number) = lerp(x as number, y as number, t)
  }
  return o
}

export function keyed(keys: [number, IPoseKey][], t: number): IPose {
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, p0] = keys[i],
      [t1, p1] = keys[i + 1]
    if (t <= t1) return mixPose(fullPose(p0), fullPose(p1), smooth((t - t0) / (t1 - t0 || 1)))
  }
  return fullPose(keys[keys.length - 1][1])
}

export type AnimName = 'idle' | 'walk' | 'attack' | 'cast' | 'hurt'

export interface IAnim {
  // Frames baked for the whole animation.
  n: number
  loop?: boolean
  pose: (rig: IRig, f: number) => IPoseKey
}

export const ANIM: Record<AnimName, IAnim> = {
  idle: {
    n: 12,
    loop: true,
    pose(rig, f) {
      const s = Math.sin(TAU * f),
        c = Math.cos(TAU * f)
      if (rig === FLY)
        return {
          wing: Math.sin(TAU * f),
          body: [0, -1.2 * Math.sin(TAU * f + 0.6)],
          head: [0, -0.8 * Math.sin(TAU * f + 1.2)],
          tail: 1.2 * Math.sin(TAU * f + 2),
          fl: [0, 0.6 * Math.sin(TAU * f + 2)],
          bl: [0, 0.6 * Math.sin(TAU * f + 2.4)],
          ff: [0, 0.6 * Math.sin(TAU * f + 2.2)],
        }
      if (rig === SWIM)
        return {
          body: [0, -0.6 * s],
          head: [0, -0.3 * Math.sin(TAU * f + 0.5)],
          tail: 1.2 * Math.sin(TAU * f + 1),
          wing: 0.3 * s,
          fl: [0, 0.9 * s],
          bl: [0, -0.9 * s],
          ff: [0.8 * c, 0],
          bf: [-0.8 * c, 0],
        }
      return {
        body: [0, 0.45 * s],
        head: [0, 0.35 * Math.sin(TAU * f + 0.6)],
        tail: 0.9 * Math.sin(TAU * f + 1),
        wing: 0.25 * s,
        arm: [0, 0.3 * s],
        arm2: [0, -0.3 * s],
      }
    },
  },
  walk: {
    n: 12,
    loop: true,
    pose(rig, f) {
      const s = Math.sin(TAU * f),
        c = Math.cos(TAU * f),
        lift = (v: number) => -2.2 * Math.max(0, v),
        up = 1 - Math.abs(s)
      if (rig === FLY)
        return {
          wing: Math.sin(2 * TAU * f),
          body: [1, -1.2 * Math.sin(2 * TAU * f + 0.6)],
          head: [1.5, -0.6 * Math.sin(2 * TAU * f + 1.2)],
          tail: 2 * Math.sin(TAU * f + 2),
          fl: [-1.5, 1],
          bl: [-1.5, 1],
          ff: [-1, 1],
        }
      if (rig === BLOB)
        return { body: [0, -2 * Math.abs(s)], bl: [0, lift(c) * 0.6], fl: [0, lift(-c) * 0.6] }
      if (rig === SWIM)
        return {
          body: [0, -1.2 * s],
          head: [0, -0.6 * Math.sin(TAU * f + 0.5)],
          tail: 2.4 * Math.sin(TAU * f + 1),
          wing: 0.6 * Math.sin(TAU * f + 1),
          fl: [0, 1.7 * s],
          bl: [0, -1.7 * s],
          ff: [1.5 * c, 0],
          bf: [-1.5 * c, 0],
        }
      if (rig === BIPED)
        return {
          bl: [2.4 * s, lift(c)],
          bf: [-2.4 * s, lift(-c)],
          arm: [-1.4 * s, 0],
          arm2: [1.4 * s, 0],
          body: [0, -0.8 * up],
          head: [0, -0.4 * up],
          tail: Math.sin(TAU * f + 1),
          wing: 0.2 * s,
        }
      const A: Vec = [2 * s, lift(c)],
        B: Vec = [-2 * s, lift(-c)]
      return {
        fl: A,
        bf: A,
        bl: B,
        ff: B,
        body: [0, -0.6 * up],
        head: [0, 0.35 * Math.sin(2 * TAU * f)],
        tail: 1.1 * Math.sin(TAU * f + 1),
        wing: 0.2 * s,
      }
    },
  },
  // wind-up, rush, hit (held), return - the beats a sprite attack uses
  attack: {
    n: 16,
    pose(rig, f) {
      const [w, h, r] = rig.attack
      return keyed(
        [
          [0, {}],
          [0.3, w],
          [0.42, h],
          [0.62, h],
          [0.8, r],
          [1, {}],
        ],
        f
      )
    },
  },
  cast: {
    n: 16,
    pose(rig, f) {
      const [c, r] = rig.cast
      return keyed(
        [
          [0, {}],
          [0.45, c],
          [0.55, r],
          [0.85, r],
          [1, {}],
        ],
        f
      )
    },
  },
  hurt: {
    n: 6,
    pose(rig, f) {
      return keyed(
        [
          [0, {}],
          [0.25, rig.hurt[0]],
          [1, {}],
        ],
        f
      )
    },
  },
}
