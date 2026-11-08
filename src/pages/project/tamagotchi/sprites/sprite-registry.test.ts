import { describe, expect, it, vi } from 'vitest'
import { ANIM, type AnimName } from './engine/anim'
import {
  drawFrame,
  getSpriteFrame,
  hasSprite,
  SPRITES,
  spriteAmp,
  spriteAnchors,
  spriteLine,
} from './sprite-registry'
import { SPRITE_FRAME_HASHES as golden } from './sprite-frames.golden'

// FNV-1a over every baked pixel and the ground line of each frame of one animation.
const hashAnim = (id: string, name: AnimName) => {
  const fnv = (h: number, v: number) => Math.imul(h ^ v, 16777619) >>> 0
  let h = 2166136261
  for (let i = 0; i < ANIM[name].n; i++) {
    const { data, foot } = drawFrame(id, name, i).bakePixels()
    for (const v of data) h = fnv(h, v)
    h = fnv(h, foot)
  }
  return h.toString(16).padStart(8, '0')
}

describe('sprite registry', () => {
  it('has all 133 sprites of the prototype', () => {
    expect(Object.keys(SPRITES)).toHaveLength(133)
    expect(hasSprite('sunking')).toBe(true)
    expect(hasSprite('nope')).toBe(false)
    expect(hasSprite(null)).toBe(false)
  })

  it('knows each sprite line', () => {
    expect(spriteLine('sunking')).toBe('fire')
    expect(spriteLine('whaleC')).toBe('water')
    expect(spriteLine('abyssfish')).toBe('water')
    expect(spriteLine('nameless')).toBe('shadow')
    expect(spriteLine('advgolem')).toBe('earth')
    expect(spriteLine('dummy')).toBe('fire')
  })

  it('swings bigger sprites wider', () => {
    expect(spriteAmp(48)).toBeCloseTo(1.6)
    expect(spriteAmp(56)).toBeCloseTo(1.84)
    expect(spriteAmp(64)).toBeCloseTo(2.08)
    expect(spriteAmp(96)).toBeCloseTo(3.52)
  })

  it('bakes a frame once and keeps its pose; an unknown id has none', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    expect(getSpriteFrame('nope', 'idle', 0)).toBeNull()
    const a = getSpriteFrame('sunking', 'attack', 5)
    expect(a).not.toBeNull()
    expect(getSpriteFrame('sunking', 'attack', 5)).toBe(a)
    // frame numbers wrap round the animation
    expect(getSpriteFrame('sunking', 'attack', 5 + ANIM.attack.n)).toBe(a)
    expect(a?.w).toBe(SPRITES.sunking.size)
    expect(a?.pose.head).not.toEqual([0, 0])
    vi.restoreAllMocks()
  })

  it('puts the hat on top of the head and the face below it, for every sprite', () => {
    expect(spriteAnchors('nope')).toBeNull()
    for (const id of Object.keys(SPRITES)) {
      const a = spriteAnchors(id)
      expect(a, id).not.toBeNull()
      const [hx, hy] = a!.hat
      const [fx, fy] = a!.face
      for (const v of [hx, hy, fx, fy]) expect(v, id).toBeGreaterThanOrEqual(0)
      for (const v of [hx, hy, fx, fy]) expect(v, id).toBeLessThanOrEqual(1)
      expect(fy, id).toBeGreaterThanOrEqual(hy)
    }
    // the gecko faces right: its head is in the right half
    expect(spriteAnchors('gecko')!.hat[0]).toBeGreaterThan(0.5)
  })

  // The golden hashes were baked from the prototype (docs/tamagotchi/prototypes/monster-arena), so
  // every frame of the port matches the art the owner approved pixel for pixel. Regenerate them
  // only on purpose, when a sprite's art changes.
  it('bakes every frame exactly as the prototype', () => {
    const actual: Record<string, string> = {}
    for (const id of Object.keys(SPRITES))
      for (const name of Object.keys(ANIM) as AnimName[])
        actual[`${id}:${name}`] = hashAnim(id, name)
    expect(actual).toEqual(golden)
  }, 60_000)
})
