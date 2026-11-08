import type { IPose, IRig } from '../sprite-types'

// Body plans, ported from the prototype's js/engine.js. Each rig gives the key poses of the
// attack (wind-up, hit, return), cast and hurt animations; idle and walk come from curves (anim.ts).
export const POSE0: IPose = {
  fl: [0, 0],
  bl: [0, 0],
  ff: [0, 0],
  bf: [0, 0],
  arm: [0, 0],
  arm2: [0, 0],
  head: [0, 0],
  body: [0, 0],
  jaw: 0,
  tail: 0,
  wing: 0,
  glow: 0,
}
export const QUAD: IRig = {
  idle: [{}, { tail: 1, wing: 0.3 }],
  walk: [
    { fl: [1.5, 0], bf: [1.5, 0], bl: [-1.5, -1.5], ff: [-1.5, -1.5] },
    { bl: [0, -0.5], ff: [0, -0.5], body: [0, -0.6], tail: -1 },
    { fl: [-1.5, -1.5], bf: [-1.5, -1.5], bl: [1.5, 0], ff: [1.5, 0] },
    { fl: [0, -0.5], bf: [0, -0.5], body: [0, -0.6], tail: 1 },
  ],
  attack: [
    { head: [-2, -1], body: [-1, 0], fl: [-1, 0], tail: 1, wing: 0.5 },
    { head: [3, 1], body: [1, 0], fl: [3, -3], jaw: 1, tail: -1, wing: -0.5 },
    { head: [1, 0], fl: [1, -1], jaw: 0.4 },
  ],
  cast: [
    { head: [-1, -1], body: [-1, 0], jaw: 0.5, wing: 1, glow: 1, tail: 1 },
    { head: [2, 0], body: [1, 0], jaw: 1, wing: -1, glow: 1, tail: -1 },
  ],
  hurt: [{ head: [-2, -1], body: [-1, 0], jaw: 0.3, wing: 0.5 }],
}
export const BIPED: IRig = {
  idle: [{}, { tail: 1, wing: 0.3, arm: [0, 0.5] }],
  walk: [
    { bl: [2, 0], bf: [-2, -1.5], arm: [-1.5, 0], arm2: [1.5, 0] },
    { bf: [0, -0.5], body: [0, -0.8] },
    { bl: [-2, -1.5], bf: [2, 0], arm: [1.5, 0], arm2: [-1.5, 0] },
    { bl: [0, -0.5], body: [0, -0.8] },
  ],
  attack: [
    { head: [-2, -1], body: [-1, 0], arm: [-3, -3], tail: 1, wing: 0.5 },
    {
      head: [2, 1],
      body: [1, 0],
      arm: [5, 1],
      arm2: [2, 0],
      jaw: 1,
      bl: [1, 0],
      tail: -1,
      wing: -0.5,
    },
    { head: [1, 0], arm: [2, 0], jaw: 0.4 },
  ],
  cast: [
    {
      head: [-1, -1],
      body: [-1, 0],
      jaw: 0.5,
      wing: 1,
      arm: [-1, -3],
      arm2: [-1, -2],
      glow: 1,
      tail: 1,
    },
    {
      head: [2, 0],
      body: [1, 0],
      jaw: 1,
      wing: -1,
      arm: [3, -1],
      arm2: [2, -1],
      glow: 1,
      tail: -1,
    },
  ],
  hurt: [{ head: [-2, -1], body: [-1, 0], jaw: 0.3, wing: 0.5, arm: [-1, -1] }],
}
export const SWIM: IRig = {
  attack: [
    { head: [-2, 0], body: [-2, 0], tail: 2, wing: 0.5 },
    { head: [3, 0], body: [3, 0], jaw: 1, tail: -2, wing: -0.5 },
    { head: [1, 0], body: [1, 0], jaw: 0.4 },
  ],
  cast: [
    { body: [-1, -1], head: [-1, -1], jaw: 0.4, wing: 1, glow: 1, tail: 1.5 },
    { body: [1, 0], head: [2, 0], jaw: 1, wing: -1, glow: 1, tail: -1.5 },
  ],
  hurt: [{ body: [-2, 0], head: [-2, -1], jaw: 0.3 }],
}
// Flyers move on their wings: idle is a slow flap with the body rising on each downstroke, walking flaps
// twice as fast, attack dives in with the wings swept back, cast throws the wings up.
export const FLY: IRig = {
  attack: [
    { head: [-2, -2], body: [-2, -1], wing: -1, tail: 1 },
    { head: [2, 2], body: [2, 1], jaw: 1, wing: 0.9, tail: -1, fl: [2, -1], ff: [2, -1] },
    { head: [1, 0], jaw: 0.4, wing: 0.2 },
  ],
  cast: [
    { head: [-1, -2], body: [-1, -1], jaw: 0.5, wing: -1, glow: 1, tail: 1 },
    { head: [2, 0], body: [1, 0], jaw: 1, wing: 0.7, glow: 1, tail: -1 },
  ],
  hurt: [{ head: [-2, -1], body: [-2, 0], jaw: 0.3, wing: 0.5 }],
}
export const BLOB: IRig = {
  idle: [{}, { body: [0, 0.5] }],
  walk: [{ body: [0, -1.5], bl: [0, -1] }, {}, { body: [0, -1.5], fl: [0, -1] }, {}],
  attack: [{ body: [-1.5, 0.5] }, { body: [3, -1], jaw: 1 }, { body: [1, 0] }],
  cast: [
    { body: [-1, 0.5], glow: 1 },
    { body: [1, -1], glow: 1, jaw: 1 },
  ],
  hurt: [{ body: [-2, 0] }],
}
// Bigger sprites move their parts further: every offset is multiplied by k.
export function scalePose(p: IPose, k: number): IPose {
  const out = { ...p }
  for (const key of ['fl', 'bl', 'ff', 'bf', 'arm', 'arm2', 'head', 'body'] as const)
    out[key] = [p[key][0] * k, p[key][1] * k]
  out.tail = p.tail * k
  return out
}
