import type { Pt, Spr } from './engine/spr'

export type { IBitmap } from './engine/spr'
export type Vec = [number, number]

// Offsets for each body part in one frame. Designs are authored facing right; draw(s, P) adds these
// to the parts so they move: front/back leg (fl/bl), front/back foot (ff/bf), arms, head, body, and
// the 0..1 (or -1..1) amounts for jaw, tail sway, wing beat and glow.
export interface IPose {
  fl: Vec
  bl: Vec
  ff: Vec
  bf: Vec
  arm: Vec
  arm2: Vec
  head: Vec
  body: Vec
  jaw: number
  tail: number
  wing: number
  glow: number
}

export type IPoseKey = Partial<IPose>

// The key poses of one body plan. Idle and walk are optional: ANIM draws them from curves.
export interface IRig {
  idle?: IPoseKey[]
  walk?: IPoseKey[]
  attack: [IPoseKey, IPoseKey, IPoseKey]
  cast: [IPoseKey, IPoseKey]
  hurt: [IPoseKey]
}

// A particle emitter on the sprite grid (embers, bubbles, sparks...).
export interface IEmitter {
  x: number
  y: number
  type: string
  rate: number
}

// An aura drawn behind the sprite (sun ring, ripples, twin rings...).
export interface IAura {
  type: string
  x: number
  y: number
  r: number
}

// [x, y, colour, radius, part?]: with part 'head' or 'body' the glow follows that part's pose.
export type IGlow =
  | [number, number, string, number]
  | [number, number, string, number, 'head' | 'body']

export interface ISpriteDef {
  // The square grid the design is drawn on, in pixels.
  size: number
  rig: IRig
  draw: (s: Spr, P: IPose) => void
  emit: IEmitter[]
  // Where breath and beams come out, on the grid.
  mouth: Pt
  // Floats this many pixels above the ground (swimmers, ghosts).
  hover?: number
  // Moves on its wings (the FLY rig).
  fly?: boolean
  aura?: IAura
  glows?: IGlow[]
}
