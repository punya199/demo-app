import { ARENA_TICK } from '../arena-helper'
import { IArenaReplay, IArenaSkill } from '../arena-interface'
import { BASIC_NAME } from '../replay-anim'
import { boltLine, BOLT } from './bolt'
import { castsOf } from './casts'
import { flourishTierOf, IFlourish, runFlourish } from './flourish'
import { DARK, darkBurst } from './dark'
import { EARTH } from './earth'
import { FIRE, rebirth } from './fire'
import { HOLY, lastStandFx } from './holy'
import { entBark, LEAF } from './leaf'
import { RAID } from './raid'
import {
  advanceStage,
  centerOf,
  clock,
  fxs,
  IEnt,
  ISkillFx,
  impactBurst,
  mouthOf,
  newEnt,
  ps,
  resetStage,
  scene,
  wait,
} from './runtime'
import { drawSoulFlame, elCols, SHADOW, shadowBurst } from './shadow'
import { WATER, zapArc } from './water'

// Plays the prototype's skill animations along a replay: each cast's script starts at its wind-up,
// releases at the server's `skill` event and lands at its `hit` events. Passives that the prototype
// drew on the fighter (rebirth, last stand, the ent's bark, static and jelly retorts, the void step,
// the soul-lantern's venom, the zombie rat's rage) start on the matching replay event.

// The prototype's element names for the game's lines.
export const PROTO_EL: Record<string, string> = {
  flame: 'fire',
  tide: 'water',
  leaf: 'leaf',
  earth: 'earth',
  lightning: 'bolt',
  holy: 'holy',
  dark: 'dark',
  shadow: 'shadow',
}

const LINE_FX: Record<string, ISkillFx> = {
  ...FIRE,
  ...WATER,
  ...LEAF,
  ...EARTH,
  ...BOLT,
  ...HOLY,
  ...DARK,
  ...SHADOW,
}

// An awakened Fused form's own skill (backend fz_<line>_<line>, 2026-11-09) is its line's Ultimate
// skill made stronger, so it plays that animation. Cross-line fz_<a>_<b> skills have none yet: the
// replay falls back to the element particles.
export const AWAKENED_FX_OF: Record<string, string> = {
  fz_flame_flame: 'flame_sun',
  fz_tide_tide: 'tide_trident',
  fz_leaf_leaf: 'leaf_wrath',
  fz_earth_earth: 'earth_quake',
  fz_lightning_lightning: 'ltn_bolt',
  fz_holy_holy: 'holy_sun',
  fz_dark_dark: 'dark_end',
  fz_shadow_shadow: 'shd_end',
}

// A skill's flourish (without its timing), or null below Perfect tier. A Fused skill's second colour
// is its other parent line (fz_<a>_<b>), or gold for an awakened one (fz_<line>_<line>).
export const flourishOf = (skill: IArenaSkill | undefined): Omit<IFlourish, 'chargeSec'> | null => {
  if (!skill) return null
  const tier = flourishTierOf(skill.src, skill.slot)
  if (!tier) return null
  const els = [PROTO_EL[skill.el] ?? 'gold']
  if (tier === 3) {
    const lines = skill.src.slice('fused_'.length).split('_')
    const other = lines.find((l) => l !== skill.el)
    els.push(other ? (PROTO_EL[other] ?? 'gold') : 'gold')
  }
  return { tier, kind: skill.kind, els }
}

// The animation for a game skill id cast by a fighter drawn as `sprite` (raid bosses that share an
// id each have their own version).
export const skillFxOf = (id: string, sprite?: string | null): ISkillFx | null => {
  // a raid boss's animation is its own: a world boss sharing the skill id keeps the generic look
  const raid = Object.values(RAID).find((s) => s.game === id && s.boss === sprite)
  const key = AWAKENED_FX_OF[id] ?? id
  return raid ?? (LINE_FX[key] && !LINE_FX[key].passive ? LINE_FX[key] : null)
}

// What the stage needs to know about a fighter each frame (scene units: sprite pixels).
export interface IStagePlace {
  x: number
  y: number
  flip: boolean
  grow: number
  size: number
  foot: number
  mouth: number[]
  hover: number
  hp: number
  hpMax: number
  dead: boolean
}

export interface ISkillStage {
  ents: IEnt[]
  // Moves the stage to replay tick `tick` (starting casts and passives on the way).
  step: (tick: number, places: IStagePlace[]) => void
  // The scripts' drawings, in scene units (the caller scales by PX).
  draw: (ctx: CanvasRenderingContext2D) => void
  hidesProjectiles: (team: number) => boolean
  // Whether fighter who's skill of this name has its own animation.
  animates: (who: number, name: string) => boolean
}

export const createSkillStage = (
  replay: IArenaReplay,
  skills: Record<string, IArenaSkill>,
  width: number,
  height: number,
  // Arena units (the server's x, y) to scene units, for zones and beams.
  toScene: (x: number, y: number) => { x: number; y: number },
  // A script that throws only loses its animation; tests pass a collector here.
  onError: (err: unknown) => void = () => {}
): ISkillStage => {
  resetStage(width, height)
  const { fighters, events } = replay
  const ents = fighters.map((f) => newEnt(f.idx, f.team))
  const has = (idx: number, id: string) => !!fighters[idx]?.skills.includes(id)
  const allCasts = castsOf(replay, skills)
  const casts = allCasts
    .map((cast) => ({ cast, fx: skillFxOf(cast.skill, fighters[cast.who]?.sprite) }))
    .filter((c) => c.fx)
  // Grandeur by skill tier on top of every cast of a Perfect-or-higher skill (flourish.ts), also for
  // skills with no animation of their own.
  const flourishes = allCasts
    .map((cast) => ({ cast, f: flourishOf(skills[cast.skill]) }))
    .filter((c): c is { cast: (typeof allCasts)[number]; f: Omit<IFlourish, 'chargeSec'> } => !!c.f)
  let nextFlourish = 0
  let nextCast = 0
  let nextEvent = 0
  let lastTick = 0

  const onEvent = (e: (typeof events)[number]) => {
    const who = e.who
    if (who === undefined || !ents[who]) return
    const me = ents[who]
    if (e.kind === 'rebirth') void rebirth(me).catch(onError)
    else if (e.kind === 'laststand') lastStandFx(me)
    else if (e.kind === 'rage' && has(who, 'dark_undead')) {
      scene.flashScreen = 0.25
      const c = centerOf(me)
      darkBurst(c.x, c.y, 16, 50)
    } else if (e.kind === 'dodge' && has(who, 'shd_void')) {
      const c = centerOf(me)
      shadowBurst(c.x, c.y, 16, 50)
    } else if (e.kind === 'hit' && e.target !== undefined && ents[e.target]) {
      const def = ents[e.target]
      const basic = e.skill === BASIC_NAME
      if (basic) {
        const c = centerOf(def)
        const dir = Math.sign(def.x - me.x) || 1
        impactBurst(c.x - dir * 6, c.y, e.parried ? '#9ad8ff' : '#ffd04a')
      }
      if (has(e.target, 'leaf_ent') && e.dmg) entBark(def)
      if (basic && has(e.target, 'tide_jelly')) zapArc(def, me)
      if (basic && has(e.target, 'ltn_cat')) {
        def.sx = def.sy = 1.12
        void wait(160).then(() => {
          def.sx = def.sy = 1
        })
        fxs.push({
          age: 0,
          life: 0.3,
          draw(c, k) {
            c.globalAlpha = 1 - k
            const a = centerOf(def)
            const b = centerOf(me)
            boltLine(c, a.x, a.y, b.x, b.y, 8)
          },
        })
      }
      if (basic && has(who, 'shd_sting')) {
        const poisoned = events.some(
          (s) => s.kind === 'status' && s.who === e.target && s.st === 'poison' && s.t === e.t
        )
        if (poisoned) {
          const sc = centerOf(def)
          fxs.push({
            age: 0,
            life: 0.7,
            draw(c, k) {
              c.globalAlpha = 1 - k
              drawSoulFlame(c, sc.x, sc.y - 10 - k * 14, 0.9)
            },
          })
        }
      }
    }
  }

  return {
    ents,
    step(tick, places) {
      const now = tick / ARENA_TICK
      // a skip jumps far ahead: drop what was playing and the casts already over
      const jumped = now - clock > 1
      if (jumped) {
        fxs.length = 0
        ps.list.length = 0
        scene.curProj = scene.curGlyph = scene.curOrb = null
        scene.ownProj.clear()
      }
      places.forEach((p, idx) => {
        const e = ents[idx]
        if (!p || !e) return
        e.x = p.x
        e.y = p.y
        e.flip = p.flip
        e.grow = p.grow
        e.def = { size: p.size, mouth: p.mouth, img: { foot: p.foot }, hover: p.hover }
        if (!e.rebirth) {
          e.hp = p.hp
          e.hpMax = p.hpMax
        }
      })
      while (nextEvent < events.length && events[nextEvent].t <= tick) {
        const e = events[nextEvent++]
        if (!jumped && e.t > lastTick - 1) onEvent(e)
      }
      while (nextCast < casts.length && casts[nextCast].cast.startT <= now) {
        const { cast, fx } = casts[nextCast++]
        if (cast.releaseT < now - 0.5 || !fx) continue
        const att = ents[cast.who]
        const def = ents[cast.target] ?? att
        if (cast.zone) cast.zonePt = toScene(cast.zone.x, cast.zone.y)
        if (cast.beam) {
          const a = toScene(cast.beam.x, cast.beam.y)
          const b = toScene(cast.beam.x2, cast.beam.y2)
          if (a.x !== b.x || a.y !== b.y) cast.beamAng = Math.atan2(b.y - a.y, b.x - a.x)
        }
        att.cast = cast
        void fx.run(att, def).catch(onError)
      }
      while (nextFlourish < flourishes.length && flourishes[nextFlourish].cast.startT <= now) {
        const { cast, f } = flourishes[nextFlourish++]
        if (cast.releaseT < now - 0.5) continue
        const att = ents[cast.who]
        const def = ents[cast.target] ?? att
        if (!att) continue
        const chargeSec = Math.max(0, cast.releaseT - cast.startT)
        void runFlourish(att, def, { ...f, chargeSec }).catch(onError)
      }
      advanceStage(now)
      // charging sparks at the mouth, the release puff, after-images and flashes fading
      const dt = Math.max(0, tick - lastTick) / ARENA_TICK
      for (const e of ents) {
        if (e.charging && Math.random() < 0.9) {
          const m = mouthOf(e)
          const a = Math.random() * 7
          const r = 12 + Math.random() * 10
          ps.add({
            x: m.x + Math.cos(a) * r,
            y: m.y + Math.sin(a) * r * 0.7,
            vx: -Math.cos(a) * r * 3.2,
            vy: -Math.sin(a) * r * 2.2,
            life: 0.3,
            size: 1,
            cols: elCols(e.charging),
            glow: true,
          })
        }
        if (e.released > 0) {
          e.released -= dt
          const m = mouthOf(e)
          if (e.released > 0.18)
            ps.burst(6, () => ({
              x: m.x,
              y: m.y,
              vx: (e.flip ? -1 : 1) * (30 + Math.random() * 50),
              vy: (Math.random() - 0.5) * 30,
              drag: 3,
              life: 0.35,
              size: 1,
              cols: elCols(e.castEl ?? 'fire'),
              glow: true,
            }))
        }
        e.flash = Math.max(0, e.flash - dt * 6)
        e.ghosts.forEach((g) => (g.a -= dt * 2.5))
        e.ghosts = e.ghosts.filter((g) => g.a > 0)
      }
      lastTick = tick
    },
    draw(ctx) {
      if (scene.curGlyph) {
        const g = scene.curGlyph
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = g.a
        ctx.strokeStyle = '#ffe9a0'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(g.x, g.y, g.r, g.r * 0.38, 0, 0, 7)
        ctx.stroke()
        ctx.beginPath()
        ctx.ellipse(g.x, g.y, g.r * 0.7, g.r * 0.27, 0, 0, 7)
        ctx.stroke()
        for (let i = 0; i < 8; i++) {
          const a = clock * 2 + (i * Math.PI) / 4
          ctx.fillStyle = '#fff6c0'
          ctx.fillRect(g.x + Math.cos(a) * g.r * 0.85, g.y + Math.sin(a) * g.r * 0.32, 2, 1)
        }
        ctx.restore()
      }
      for (const f of fxs) {
        ctx.save()
        f.draw(ctx, f.age / f.life)
        ctx.restore()
      }
      if (scene.curProj) {
        ctx.save()
        scene.curProj.draw(ctx, scene.curProj.x, scene.curProj.y)
        ctx.restore()
      }
      if (scene.curOrb) {
        const o = scene.curOrb
        ctx.fillStyle = '#12061c'
        ctx.beginPath()
        ctx.arc(o.x, o.y, o.r, 0, 7)
        ctx.fill()
        ctx.strokeStyle = '#a04ae8'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(o.x, o.y, o.r + 1, 0, 7)
        ctx.stroke()
      }
      ps.draw(ctx)
    },
    hidesProjectiles: (team) => scene.ownProj.has(team),
    animates: (who, name) => {
      const id = fighters[who]?.skills.find((s) => skills[s]?.name === name)
      return !!id && !!skillFxOf(id, fighters[who].sprite)
    },
  }
}
