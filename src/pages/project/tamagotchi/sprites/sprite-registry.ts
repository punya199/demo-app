import { ANIM, type AnimName, fullPose } from './engine/anim'
import { scalePose } from './engine/rigs'
import { Spr, type ISprFrame } from './engine/spr'
import { ADV_EL, ADVENTURE_SPRITES } from './lines/adventure'
import { BOLT_SPRITES } from './lines/bolt'
import { DARK_SPRITES } from './lines/dark'
import { EARTH_SPRITES } from './lines/earth'
import { FIRE_SPRITES } from './lines/fire'
import { HOLY_SPRITES } from './lines/holy'
import { LEAF_SPRITES } from './lines/leaf'
import { RAID_SPRITES } from './lines/raid'
import { SHADOW_SPRITES } from './lines/shadow'
import { WATER_SPRITES } from './lines/water'
import type { IPose, ISpriteDef } from './sprite-types'

// Every monster sprite by id: the eight lines (forms, awakened fused form, world boss), the raid
// bosses, the adventure enemies and the training dummy. The backend sends these ids as `sprite`.

export type SpriteLine = 'fire' | 'water' | 'leaf' | 'earth' | 'bolt' | 'holy' | 'dark' | 'shadow'

const LINE_SPRITES: [SpriteLine, Record<string, ISpriteDef>][] = [
  ['fire', FIRE_SPRITES],
  ['water', WATER_SPRITES],
  ['leaf', LEAF_SPRITES],
  ['earth', EARTH_SPRITES],
  ['bolt', BOLT_SPRITES],
  ['holy', HOLY_SPRITES],
  ['dark', DARK_SPRITES],
  ['shadow', SHADOW_SPRITES],
]

// Raid bosses each belong to one line; adventure enemies take theirs from ADV_EL (the dummy has none
// and is drawn as fire, like the prototype).
const RAID_LINE: Record<string, SpriteLine> = {
  lavaking: 'fire',
  abyssfish: 'water',
  raidseraph: 'holy',
  vampire: 'dark',
  nameless: 'shadow',
}

export const SPRITES: Record<string, ISpriteDef> = Object.assign(
  {},
  ...LINE_SPRITES.map(([, defs]) => defs),
  RAID_SPRITES,
  ADVENTURE_SPRITES
)

const SPRITE_LINE: Record<string, SpriteLine> = {
  ...Object.fromEntries(
    LINE_SPRITES.flatMap(([line, defs]) => Object.keys(defs).map((id) => [id, line]))
  ),
  ...RAID_LINE,
  ...(ADV_EL as Record<string, SpriteLine>),
}

export const hasSprite = (id: string | null | undefined): id is string => !!id && id in SPRITES

export const spriteLine = (id: string): SpriteLine => SPRITE_LINE[id] ?? 'fire'

// How far a sprite's parts move: bigger forms swing wider.
export const spriteAmp = (size: number) =>
  (size >= 96 ? 2.2 : size >= 64 ? 1.3 : size >= 56 ? 1.15 : 1) * 1.6

// The pose of frame i of an animation, already scaled for the sprite's size.
export function framePose(def: ISpriteDef, name: AnimName, i: number): IPose {
  const A = ANIM[name]
  const f = A.loop ? i / A.n : i / (A.n - 1)
  return scalePose(fullPose(A.pose(def.rig, f)), spriteAmp(def.size))
}

// Frame i of an animation drawn on a fresh grid, not baked (tests read its pixels).
export function drawFrame(id: string, name: AnimName, i: number): Spr {
  const def = SPRITES[id]
  const s = new Spr(def.size, def.size)
  def.draw(s, framePose(def, name, wrapFrame(name, i)))
  return s
}

const wrapFrame = (name: AnimName, i: number) => {
  const n = ANIM[name].n
  return ((i % n) + n) % n
}

// A baked frame keeps the pose it was drawn in, so a glow tagged with a body part can follow it.
export type ISpriteFrame = ISprFrame & { pose: IPose }

const frames = new Map<string, Partial<Record<AnimName, ISpriteFrame[]>>>()

// Frame i of an animation, baked on first use and cached per sprite id. Null for an unknown id
// (the caller falls back to the emoji).
export function getSpriteFrame(id: string, name: AnimName, i: number): ISpriteFrame | null {
  const def = SPRITES[id]
  if (!def) return null
  const k = wrapFrame(name, i)
  const byAnim = frames.get(id) ?? {}
  frames.set(id, byAnim)
  const list = (byAnim[name] ??= [])
  if (!list[k]) {
    const pose = framePose(def, name, k)
    const s = new Spr(def.size, def.size)
    def.draw(s, pose)
    list[k] = { ...s.bake(), pose }
  }
  return list[k]
}
