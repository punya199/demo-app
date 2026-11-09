import { ARENA_H, ARENA_SCALE, ARENA_W } from './arena-helper'
import { IArenaEvent, IArenaReplay, IArenaSkill, StatusId } from './arena-interface'
import { BASIC_NAME, IFighterPose } from './replay-anim'
import { drawAura, drawGlows } from '../sprites/fx/auras'
import { makeParticle, ParticleType, PSys } from '../sprites/fx/particles'
import { getSpriteFrame, hasSprite, SPRITES } from '../sprites/sprite-registry'
import type { ISpriteDef } from '../sprites/sprite-types'
import { buildThemeFloor, floorThemeOf } from '../sprites/fx/floors'
import { scene } from './skill-fx/runtime'
import { createSkillStage, IStagePlace } from './skill-fx/stage'

// The pixel-art layer of the arena replay: sprites, their auras, glows and particles, status
// effects drawn on the body, and element particles for hits, skills and projectiles. Loaded on
// demand by ArenaReplay (the sprite data is large); fighters without art keep their emoji.

// World pixels per sprite pixel. Particles live in sprite-pixel space (world / PX). Bosses (96 px
// grids and up) draw a little finer so a 160 px shark does not cover the whole arena.
export const PX = 1.5
const BOSS_PX = 1.2
export const pxOf = (size: number) => (size >= 96 ? BOSS_PX : PX)
// A boss fight "zooms out" (owner, 2026-11-09): the monsters draw smaller and the boss bigger, so the
// boss towers over them. The arena itself has no camera, so this is done with each fighter's scale.
export const BOSS_FIGHT_MONSTER_K = 0.72
export const BOSS_FIGHT_BOSS_K = 1.3
// ...but no boss grows wider than this (world px), so the long raid shark still fits.
const BOSS_MAX_W = 230
export const fightPxOf = (size: number, isBoss: boolean, bossFight: boolean) => {
  if (!bossFight) return pxOf(size)
  if (!isBoss) return pxOf(size) * BOSS_FIGHT_MONSTER_K
  return Math.min(pxOf(size) * BOSS_FIGHT_BOSS_K, Math.max(pxOf(size), BOSS_MAX_W / size))
}
// The fighter's position is its body centre; its feet stand this far below (world px).
export const FOOT_DROP = 18

const TAU = Math.PI * 2

// Particles for each element (attacker's line), for hits, bursts, beams and trails.
const ELEMENT_PARTICLES: Record<string, ParticleType[]> = {
  flame: ['flame', 'ember'],
  tide: ['bubble', 'mist', 'fall'],
  leaf: ['leaf', 'pollen'],
  earth: ['dust', 'grit'],
  lightning: ['zap', 'glint'],
  holy: ['sparkle', 'shard'],
  dark: ['spore', 'smoke'],
  shadow: ['smoke', 'spore'],
  neutral: ['glint'],
}

const particlesOf = (el: string | null | undefined) =>
  ELEMENT_PARTICLES[el ?? 'neutral'] ?? ELEMENT_PARTICLES.neutral

// Where a fighter is drawn this frame.
export interface IPlace {
  x: number
  y: number
  face: number
  scale: number
  dead: boolean
}

interface IDrawn {
  def: ISpriteDef
  // The lowest painted row of the standing frame (sprite px), and world px per sprite px.
  foot: number
  px: number
}

export interface ISpriteLayer {
  // Whether fighter idx is drawn as a sprite (else the caller draws its emoji).
  has: (idx: number) => boolean
  // How tall fighter idx stands above its body centre (world px), for text and status icons.
  topOf: (idx: number, scale: number) => number
  // Where to draw fighter idx so its whole sprite stays inside the arena (world px).
  keepInside: (idx: number, x: number, y: number, scale: number) => [number, number]
  // A walk cycle's length in world px, so the feet don't slide.
  strideOf: (idx: number) => number
  drawFighter: (
    ctx: CanvasRenderingContext2D,
    idx: number,
    x: number,
    y: number,
    face: number,
    pose: IFighterPose,
    clock: number,
    alpha: number
  ) => void
  drawStatuses: (
    ctx: CanvasRenderingContext2D,
    idx: number,
    x: number,
    y: number,
    scale: number,
    statuses: StatusId[],
    clock: number
  ) => void
  // Advances particles to `tick` (spawning for every event passed) and draws them.
  step: (dt: number, tick: number, places: IPlace[]) => void
  drawParticles: (ctx: CanvasRenderingContext2D) => void
  // Screen-wide effects of the skill animations (shake in world px, overlays 0..1).
  screen: () => { shake: number; darken: number; tint: number; flash: number }
  // The pixel-art floor (a boss fight takes its element's arena), in scene pixels.
  floor: HTMLCanvasElement
  // Whether a skill animation is drawing team's projectile itself (hide the server's orb).
  hidesProjectiles: (team: number) => boolean
  // Whether fighter who's skill of this name plays its own animation.
  animates: (who: number, name: string) => boolean
  // Whether an event belongs to a cast with its own animation (or is a basic hit), so the caller
  // skips its plain circles and lines for it.
  covers: (e: IArenaEvent) => boolean
}

// Which events belong to a cast with its own skill animation (or are basic hits, which have their
// own impact): the generic particles, circles and lines stay out of their way. A burst, beam or
// zone carries no skill name, so it counts when it lands within 3 s after such a cast's release.
export const coversOf = (
  replay: IArenaReplay,
  animates: (who: number, name: string) => boolean
): ((e: IArenaEvent) => boolean) => {
  const { events, fighters } = replay
  const animated = new Set(
    events
      .filter((e) => e.kind === 'skill' && e.who !== undefined)
      .filter((e) => animates(e.who as number, e.skill ?? ''))
      .map((e) => `${e.who}:${e.skill}`)
  )
  const busyUntil: number[][] = fighters.map(() => [])
  for (const e of events)
    if (e.kind === 'skill' && animated.has(`${e.who}:${e.skill}`))
      busyUntil[e.who as number].push(e.t)
  return (e) => {
    if (e.who === undefined) return false
    if (e.kind === 'hit') return e.skill === BASIC_NAME || animated.has(`${e.who}:${e.skill}`)
    if (e.kind === 'skill') return animated.has(`${e.who}:${e.skill}`)
    if (e.kind === 'burst' || e.kind === 'beam' || e.kind === 'zone' || e.kind === 'zoneHit')
      return (busyUntil[e.who] ?? []).some((t) => e.t >= t - 2 && e.t <= t + 3 * 20)
    return false
  }
}

export const createSpriteLayer = (
  replay: IArenaReplay,
  skills: Record<string, IArenaSkill>
): ISpriteLayer => {
  const { fighters, events, frames, step } = replay
  const ps = new PSys()
  // The prototype's skill animations, played along the replay (skill-fx/).
  const stage = createSkillStage(replay, skills, ARENA_W / PX, ARENA_H / PX, (x, y) => ({
    x: x / ARENA_SCALE / PX,
    y: (y / ARENA_SCALE + FOOT_DROP) / PX,
  }))
  const floor = buildThemeFloor(
    floorThemeOf(fighters.find((f) => f.boss)?.el),
    Math.round(ARENA_W / PX),
    Math.round(ARENA_H / PX)
  )
  const shown: ({ white: CanvasImageSource } | null)[] = fighters.map(() => null)
  scene.frameOf = (e) => shown[e.idx] ?? null
  const covered = coversOf(replay, stage.animates)
  const bossFight = fighters.some((f) => f.boss)
  const drawn: (IDrawn | null)[] = fighters.map((f) => {
    if (!hasSprite(f.sprite)) return null
    const def = SPRITES[f.sprite]
    const still = getSpriteFrame(f.sprite, 'idle', 0)
    return { def, foot: still?.foot ?? def.size - 2, px: fightPxOf(def.size, !!f.boss, bossFight) }
  })
  const emitAcc: number[][] = fighters.map(() => [])
  let seen = -1

  const spriteSpace = (x: number, y: number) => [x / PX, y / PX] as const
  const centreOf = (idx: number, x: number, y: number, scale = 1) => {
    const d = drawn[idx]
    const lift = d ? d.foot * 0.45 * d.px * scale : 0
    return d ? [x, y + FOOT_DROP - lift] : [x, y]
  }
  const burst = (type: ParticleType[], x: number, y: number, n: number, f = 1) => {
    const [sx, sy] = spriteSpace(x, y)
    for (let i = 0; i < n; i++) ps.add(makeParticle(type[i % type.length], sx, sy, f))
  }
  const rowAt = (t: number, idx: number) =>
    frames[Math.min(frames.length - 1, Math.floor(t / step))].f[idx]

  const onEvent = (e: IArenaEvent) => {
    if (covered(e)) return
    const who = e.who !== undefined ? fighters[e.who] : undefined
    const el = e.el ?? who?.el
    const at = (i: number) => {
      const r = rowAt(e.t, i)
      return centreOf(i, r[0] / ARENA_SCALE, r[1] / ARENA_SCALE)
    }
    if (e.kind === 'hit' && e.target !== undefined) {
      const [x, y] = at(e.target)
      burst(particlesOf(el), x, y, e.crit ? 16 : 9, 1.4)
    } else if ((e.kind === 'burst' || e.kind === 'zoneHit') && e.x !== undefined) {
      const r = e.r ?? 40
      const types = particlesOf(el)
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * TAU
        burst(
          [types[i % types.length]],
          e.x / ARENA_SCALE + Math.cos(a) * r * 0.8,
          (e.y ?? 0) / ARENA_SCALE + Math.sin(a) * r * 0.5,
          1
        )
      }
    } else if (e.kind === 'beam' && e.x !== undefined) {
      const x2 = e.x2 ?? e.x
      const y2 = e.y2 ?? e.y ?? 0
      for (let i = 0; i <= 14; i++) {
        const k = i / 14
        burst(
          particlesOf(el),
          (e.x + (x2 - e.x) * k) / ARENA_SCALE,
          ((e.y ?? 0) + (y2 - (e.y ?? 0)) * k) / ARENA_SCALE,
          2
        )
      }
    } else if (e.kind === 'skill' && e.who !== undefined) {
      const [x, y] = at(e.who)
      burst(['sparkle', ...particlesOf(el)], x, y, 10, 2)
    } else if ((e.kind === 'heal' || e.kind === 'shield') && e.who !== undefined) {
      const [x, y] = at(e.who)
      burst(e.kind === 'heal' ? ['pollen', 'firefly'] : ['glint', 'mist'], x, y, 10, 2)
    } else if (e.kind === 'ko' && e.who !== undefined) {
      const r = rowAt(e.t, e.who)
      burst(['dust', 'smoke'], r[0] / ARENA_SCALE, r[1] / ARENA_SCALE + FOOT_DROP, 14, 2)
    } else if ((e.kind === 'grow' || e.kind === 'rage') && e.who !== undefined) {
      const [x, y] = at(e.who)
      burst(['ember', 'flame', 'sparkle'], x, y, 24, 4)
    } else if (e.kind === 'dodge' && e.who !== undefined) {
      const [x, y] = at(e.who)
      burst(['mist'], x, y, 6)
    }
  }

  return {
    has: (idx) => !!drawn[idx],
    topOf: (idx, scale) => {
      const d = drawn[idx]
      return d ? d.foot * d.px * scale - FOOT_DROP : 22
    },
    keepInside: (idx, x, y, scale) => {
      const d = drawn[idx]
      if (!d) return [x, y]
      const half = (d.def.size * d.px * scale) / 2
      const above = d.foot * d.px * scale - FOOT_DROP
      return [
        Math.max(half, Math.min(ARENA_W - half, x)),
        Math.max(above + 4, Math.min(ARENA_H - FOOT_DROP - 4, y)),
      ]
    },
    strideOf: (idx) => {
      const d = drawn[idx]
      return d ? d.def.size * d.px * 0.9 : 40
    },

    drawFighter(ctx, idx, x, y, face, pose, clock, alpha) {
      const d = drawn[idx]
      const id = fighters[idx].sprite
      if (!d || !id) return
      const img = getSpriteFrame(id, pose.anim, pose.frame)
      if (!img) return
      shown[idx] = img
      const { def } = d
      const v = stage.ents[idx]
      x += v.ox * PX
      alpha *= Math.max(0, Math.min(1, v.alpha))
      const flash = Math.max(pose.flash, v.flash)
      const k = d.px * pose.scale
      const w = def.size * k
      const flip = face < 0
      const hover = def.hover ? (def.hover + Math.sin(clock * 2.2 + idx) * 1.4) * k : 0
      const feet = y + FOOT_DROP + v.oy * PX
      const left = x - w / 2
      const top = feet - d.foot * k - hover
      ctx.save()
      ctx.imageSmoothingEnabled = false
      // after-images a skill left behind (scene units, feet anchored)
      for (const g of v.ghosts) {
        ctx.globalAlpha = Math.max(0, g.a) * 0.5 * alpha
        const src = g.img?.white ?? img.white
        drawImage(ctx, src, g.x * PX - w / 2, g.y * PX - d.foot * k - hover, w, w, flip)
      }
      // shadow on the ground
      ctx.globalAlpha = 0.4 * alpha
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.ellipse(x, feet, def.size * k * (def.hover ? 0.22 : 0.3), 3 * PX, 0, 0, TAU)
      ctx.fill()
      // after-images while dashing or hasted
      if (pose.dashing) {
        ctx.globalAlpha = 0.35 * alpha
        for (const dx of [-14, -7]) drawImage(ctx, img.white, left - dx * face, top, w, w, flip)
      }
      // aura and sprite, in sprite-pixel space for the aura's 1 px dots
      if (def.aura) {
        ctx.save()
        ctx.translate(left, top)
        ctx.scale(k, k)
        ctx.globalAlpha = alpha
        drawAura(ctx, def.aura, 0, 0, clock, flip, def.size)
        ctx.restore()
      }
      ctx.globalAlpha = alpha
      if (v.sx !== 1 || v.sy !== 1) {
        // a script's squash and stretch, from the feet
        ctx.translate(x, feet)
        ctx.scale(v.sx, v.sy)
        ctx.translate(-x, -feet)
      }
      if (pose.ko) {
        // topple backwards and sink a little
        const fall = Math.min(1, pose.koSec / 0.5)
        ctx.translate(x, feet)
        ctx.rotate(-face * fall * 1.3)
        ctx.translate(-x, -feet)
      }
      drawImage(ctx, img.cv, left, top, w, w, flip)
      drawGlows(ctx, def, left, top, k, k, flip, clock, alpha, img)
      if (flash > 0) {
        ctx.globalAlpha = Math.min(1, flash) * alpha
        drawImage(ctx, img.white, left, top, w, w, flip)
      }
      ctx.restore()
    },

    drawStatuses(ctx, idx, x, y, scale, statuses, t) {
      const d = drawn[idx]
      if (!d) return
      const has = (s: StatusId) => statuses.includes(s)
      const k = d.px * scale
      // sprite-pixel space with the origin at the feet
      ctx.save()
      ctx.translate(x, y + FOOT_DROP)
      ctx.scale(k, k)
      const top = -d.foot * 0.95
      const mid = -d.foot * 0.45
      const size = d.def.size
      const px = (c: string, gx: number, gy: number, w = 1, h = 1) => {
        ctx.fillStyle = c
        ctx.fillRect(Math.round(gx), Math.round(gy), w, h)
      }
      const arrow = (gx: number, gy: number, body: string, up: boolean) => {
        px(body, gx - 3, gy - 3, 7, 5)
        px(body, gx - 2, gy + 2, 5, 2)
        px('#ffffff', gx, gy - 2, 1, 4)
        px('#ffffff', gx - 1, up ? gy - 1 : gy + 1, 3, 1)
      }
      ctx.globalAlpha = 1
      if (has('stun'))
        for (let i = 0; i < 3; i++) {
          const an = t * 6 + (i * TAU) / 3
          const sx = Math.cos(an) * 9
          const sy = top - 8 + Math.sin(an) * 2.5
          px('#ffe14a', sx - 1, sy, 3, 1)
          px('#ffe14a', sx, sy - 1, 1, 3)
          px('#ffffff', sx, sy)
        }
      if (has('root'))
        for (let i = 0; i < 3; i++)
          for (let s = 0; s < 18; s++) {
            const an = (s / 18) * Math.PI + i * 0.7 + t * 0.3
            px(
              s % 5 === 0 ? '#5ad35a' : s % 2 ? '#3e2614' : '#86582e',
              Math.cos(an) * size * 0.22 * (1 - i * 0.12),
              -2 - i * 3.2 + Math.sin(an) * 2,
              2,
              1
            )
          }
      if (has('silence')) {
        const sx = -15
        const sy = top - 12 + Math.sin(t * 3)
        px('#f0ecff', sx, sy, 11, 7)
        px('#f0ecff', sx + 2, sy + 7, 2, 2)
        for (const dx of [2, 5, 8]) px('#5a5070', sx + dx, sy + 3)
        for (let i = 0; i < 11; i++) px('#ff5d62', sx + i, sy + 6 - Math.round(i * 0.6))
      }
      if (has('blind'))
        for (let i = 0; i < 3; i++) {
          const an = t * 3 + i * 2.1
          ctx.globalAlpha = 0.85
          ctx.fillStyle = '#2e2830'
          ctx.beginPath()
          ctx.arc(Math.cos(an) * 8, top + 2 + Math.sin(an) * 2, 3, 0, TAU)
          ctx.fill()
          ctx.globalAlpha = 1
        }
      if (has('curse')) {
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = 0.9
        ctx.strokeStyle = '#a04ae8'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(0, top - 6, 9, 3.2, 0, 0, TAU)
        ctx.stroke()
        for (let i = 0; i < 5; i++) {
          const an = t * 2 + (i * TAU) / 5
          px(
            i % 2 ? '#e4b8ff' : '#c47aff',
            Math.cos(an) * 9 - 1,
            top - 6 + Math.sin(an) * 3.2 - 1,
            2,
            2
          )
        }
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
      }
      if (has('focus')) {
        ctx.strokeStyle = '#ffe14a'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(0, top - 16, 3, 0, TAU)
        ctx.stroke()
        px('#ffe14a', -5, top - 16, 2, 1)
        px('#ffe14a', 4, top - 16, 2, 1)
        px('#ffe14a', 0, top - 21, 1, 2)
        px('#ffe14a', 0, top - 12, 1, 2)
      }
      // stat arrows: attack on the left, defence on the right, evasion further out
      if (has('atkUp')) arrow(-14, top - 6, '#ff8a24', true)
      if (has('atkDown')) arrow(-14, top - 6, '#8a2430', false)
      if (has('defUp')) arrow(10, top - 6, '#5ad38a', true)
      if (has('defDown') && Math.floor(t * 4) % 2) arrow(10, top - 6, '#8a8098', false)
      if (has('evaDown')) {
        // a drooping feather: evasion down
        const sy = top + 2 + ((t * 6) % 4)
        px('#c8c8e8', 18, sy, 1, 6)
        px('#8a8aa8', 17, sy + 1, 1, 4)
        px('#8a8aa8', 19, sy + 2, 1, 3)
        px('#ff5d62', 16, sy + 7, 5, 1)
      }
      if (has('slow')) {
        const sy = top - 4 + ((t * 20) % 6)
        px('#7ac8f0', -10, sy, 2, 3)
        px('#7ac8f0', -6, sy + 2, 2, 3)
      }
      if (has('immune')) {
        ctx.globalCompositeOperation = 'lighter'
        for (let i = 0; i < 16; i++) {
          const an = t * 3 + (i * TAU) / 16
          ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 8 + i)
          px(
            i % 2 ? '#ffffff' : '#ffd84a',
            Math.cos(an) * size * 0.3,
            -2 + Math.sin(an) * size * 0.09,
            2,
            1
          )
        }
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
      }
      if (has('static') && Math.sin(t * 37 + idx) > 0.1) {
        const a = (t * 13 + idx) % TAU
        let sx = Math.cos(a) * size * 0.3
        let sy = mid + Math.sin(a) * size * 0.24
        ctx.globalCompositeOperation = 'lighter'
        for (let i = 0; i < 4; i++) {
          const nx = sx + (i % 2 ? 2 : -2)
          const ny = sy - 2
          px('#ffe14a', Math.min(sx, nx), ny, 2, 1)
          px('#fffac0', nx, ny)
          sx = nx
          sy = ny
        }
        ctx.globalCompositeOperation = 'source-over'
      }
      ctx.restore()
      // particle statuses, spawned in sprite space at the body
      const [cx, cy] = centreOf(idx, x, y, scale)
      const spawn = (type: ParticleType, chance: number) => {
        if (Math.random() < chance) burst([type], cx, cy + 6 * PX, 1, size / 16)
      }
      if (has('burn')) spawn('flame', 0.5)
      if (has('poison')) spawn('spore', 0.3)
      if (has('regen')) spawn('firefly', 0.25)
      if (has('haste') || has('evaUp')) spawn('mist', 0.2)
    },

    step(dt, tick, places) {
      const stagePlaces = places.map((place, idx): IStagePlace => {
        const d = drawn[idx]
        const row = rowAt(tick, idx)
        const k = (d ? d.px : PX) / PX
        return {
          x: place.x / PX,
          y: (place.y + FOOT_DROP) / PX,
          flip: place.face < 0,
          grow: place.scale,
          size: d ? d.def.size * k : 30,
          foot: d ? d.foot * k : 26,
          mouth: d ? d.def.mouth.map((m) => m * k) : [22, 12],
          hover: d?.def.hover ?? 0,
          hp: row[2],
          hpMax: fighters[idx].maxHp,
          dead: place.dead,
        }
      })
      stage.step(tick, stagePlaces)
      for (const e of events) {
        if (e.t <= seen || e.t > tick) continue
        onEvent(e)
      }
      seen = Math.max(seen, Math.floor(tick))
      // projectiles leave an element trail
      const frame = frames[Math.min(frames.length - 1, Math.floor(tick / step))]
      for (const p of frame.p) {
        const [x, y, , el] = p as [number, number, number, string]
        if (Math.random() < 0.6) burst(particlesOf(el), x / ARENA_SCALE, y / ARENA_SCALE, 1)
      }
      // each sprite's own emitters (embers, bubbles, sparks...)
      drawn.forEach((d, idx) => {
        const place = places[idx]
        if (!d || !place || place.dead || !d.def.emit.length) return
        const k = d.px * place.scale
        const left = place.x - (d.def.size * k) / 2
        const top = place.y + FOOT_DROP - d.foot * k
        d.def.emit.forEach((em, i) => {
          emitAcc[idx][i] = (emitAcc[idx][i] ?? 0) + dt * em.rate
          while (emitAcc[idx][i] >= 1) {
            emitAcc[idx][i]--
            ps.add(
              makeParticle(
                em.type as ParticleType,
                (left + (place.face < 0 ? d.def.size - em.x : em.x) * k) / PX,
                (top + em.y * k) / PX,
                place.scale
              )
            )
          }
        })
      })
      ps.update(dt)
    },

    drawParticles(ctx) {
      ctx.save()
      ctx.scale(PX, PX)
      ps.draw(ctx)
      stage.draw(ctx)
      ctx.restore()
    },
    floor,
    screen: () => ({
      shake: scene.shake * PX,
      darken: scene.darken,
      tint: scene.tintA,
      flash: scene.flashScreen,
    }),
    hidesProjectiles: (team) => stage.hidesProjectiles(team),
    animates: (who, name) => stage.animates(who, name),
    covers: covered,
  }
}

const drawImage = (
  ctx: CanvasRenderingContext2D,
  src: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
  flip: boolean
) => {
  if (!flip) {
    ctx.drawImage(src, x, y, w, h)
    return
  }
  ctx.save()
  ctx.translate(x + w, y)
  ctx.scale(-1, 1)
  ctx.drawImage(src, 0, 0, w, h)
  ctx.restore()
}
