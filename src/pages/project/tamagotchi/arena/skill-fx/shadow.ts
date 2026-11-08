import type { ISkillFx, IEnt } from './runtime'
import {
  FLAME_COLS,
  TAU,
  anchor,
  approach,
  castPose,
  centerOf,
  clampPos,
  clock,
  damage,
  ease,
  frameOf,
  fxs,
  impactBurst,
  inRange,
  lerp,
  lungeHit,
  meleeStrike,
  mouthOf,
  ps,
  sayAt,
  scene,
  tag,
  tween,
  wait,
} from './runtime'
import { HOLY_COLS, immune } from './holy'
import { LEAF_COLS, poisonOn, silenceOn } from './leaf'
import { SCALE } from './fire'
import { DARK_COLS } from './dark'
import { WATER_COLS } from './water'
import { EARTH_COLS } from './earth'
import { BOLT_COLS } from './bolt'

// The shadow skills' animations, ported from the prototype (docs/tamagotchi/prototypes/
// monster-arena/js/skills/shadow.js). Only the drawing is kept: the replay decides moves and damage.

// shadow line: the game skills and their animations.
/* ---------- Shadow skills from the game, each with its own animation ----------
   Shadow knights fight with blades of shadow, the hooded wraiths with lanterns, mist and soul fire. New statuses in the
   prototype: evasion up (`evaT`: 40% of basic attacks against it miss, violet after-images), mist blindness (the old blind,
   drawn as dark fog instead of light), the soul-lantern wraith's passive (`venom`: 30% of its basic hits poison) and the
   wraith lord's void step (`voidP`: 20% of basic attacks against it miss; after any dodge its next basic hit crits +25%). */
export const SHADOW_COLS = ['#ffffff', '#f0d8ff', '#d08aff', '#a04aff', '#6a6a9a']
export function evaOn(e: IEnt, sec: number) {
  e.evaT = Math.max(e.evaT || 0, sec)
  sayAt(e, 'หลบเก่งขึ้น', '#d08aff')
}
export function mistBlind(e: IEnt, sec: number) {
  if (immune(e)) return
  e.blindT = Math.max(e.blindT || 0, sec)
  e.blindLight = false
  sayAt(e, 'มองไม่เห็น', '#a8a0d8')
}
export function shadowBurst(x: number, y: number, n = 18, sp = 70) {
  ps.burst(n, () => {
    const a = Math.random() * TAU,
      v = sp * (0.4 + Math.random() * 0.8)
    return {
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v * 0.7,
      drag: 4,
      life: 0.35 + Math.random() * 0.3,
      size: Math.random() < 0.3 ? 2 : 1,
      cols: SHADOW_COLS,
      glow: true,
    }
  })
}
// Something flying from a to b (several can fly at once, unlike `projectile`).
type XY = { x: number; y: number }
export function shdFly(
  a: XY,
  b: XY,
  ms: number,
  arc: number,
  draw: (c: CanvasRenderingContext2D, x: number, y: number, k: number) => void,
  trail?: (x: number, y: number) => void
) {
  return tween(ms, (k) => {
    const x = lerp(a.x, b.x, k),
      y = lerp(a.y, b.y, k) - Math.sin(k * Math.PI) * arc
    fxs.push({
      age: 0,
      life: 0.05,
      draw(c) {
        draw(c, x, y, k)
      },
    })
    if (trail) trail(x, y)
  })
}
// A spinning shadow blade: a violet crescent with a white edge.
export function drawShadeBlade(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  spin: number
) {
  c.globalCompositeOperation = 'lighter'
  for (const [w, col, rr] of [
    [4, 'rgba(160,74,255,.45)', r],
    [2, '#b04aff', r],
    [1, '#ffffff', r - 1],
  ] as const) {
    c.strokeStyle = col
    c.lineWidth = w
    c.beginPath()
    c.arc(x, y, rr, spin, spin + 2.3)
    c.stroke()
  }
}
// A soul flame: a small violet teardrop with a white core.
export function drawSoulFlame(c: CanvasRenderingContext2D, x: number, y: number, s = 1) {
  c.globalCompositeOperation = 'lighter'
  c.fillStyle = 'rgba(160,74,255,.5)'
  c.beginPath()
  c.ellipse(x, y, 5 * s, 6 * s, 0, 0, 7)
  c.fill()
  c.fillStyle = '#b04aff'
  c.beginPath()
  c.moveTo(x - 3 * s, y + 1)
  c.quadraticCurveTo(x, y - 9 * s, x + 3 * s, y + 1)
  c.arc(x, y + 1, 3 * s, 0, Math.PI)
  c.fill()
  c.fillStyle = '#f0d8ff'
  c.fillRect(x - 1, y - 1, 2, 3)
}
export const SHADOW: Record<string, ISkillFx> = {
  // พัดดาบเงา (spread, 3 hits of 70): the shadow knight slashes the air and three spinning shadow blades fan out at the target
  shd_kunai: {
    name: 'พัดดาบเงา',
    icon: '🗡️',
    async run(att, def) {
      const p = castPose(att, 320, 420, 'shadow')
      await p.charged
      p.release()
      const m = mouthOf(att),
        c = centerOf(def),
        dir = Math.sign(c.x - m.x) || 1
      fxs.push({
        age: 0,
        life: 0.25,
        draw(cx, k) {
          cx.globalCompositeOperation = 'lighter'
          cx.globalAlpha = 1 - k
          cx.strokeStyle = '#d08aff'
          cx.lineWidth = 2
          cx.beginPath()
          cx.arc(m.x - dir * 4, m.y, 12, dir > 0 ? -1.4 : 1.7, dir > 0 ? 1.4 : 4.5)
          cx.stroke()
        },
      })
      const hits = [-16, 0, 16].map((off, i) =>
        wait(i * 90).then(async () => {
          await shdFly(
            m,
            { x: c.x, y: c.y + off * 0.5 },
            300,
            off,
            (cx: CanvasRenderingContext2D, x: number, y: number) =>
              drawShadeBlade(cx, x, y, 5, clock * 18 + i),
            (x: number, y: number) => {
              if (Math.random() < 0.5)
                ps.add({ x, y, vx: 0, vy: 0, life: 0.25, size: 1, cols: SHADOW_COLS, glow: true })
            }
          )
          impactBurst(c.x, c.y + off * 0.4, '#b04aff', 6)
          scene.shake = Math.max(scene.shake, 1.5)
          return damage(def, 25, { from: att })
        })
      )
      await Promise.all(hits)
    },
  },
  // ลอยหนี (self; evasion up + crit up 4 s): the shy ghost blushes, fades half see-through and drifts back out of reach
  shd_flee: {
    name: 'ลอยหนี',
    icon: '👻',
    async run(att, def) {
      const p = castPose(att, 250, 300, 'shadow')
      await p.charged
      p.release()
      const dir = Math.sign(att.x - def.x) || 1,
        x0 = att.x,
        to = clampPos(att, att.x + dir * 70, att.y)
      sayAt(att, 'อ๊ะ...', '#ffb0c8')
      await tween(520, (k) => {
        const q = ease(k)
        att.x = lerp(x0, to.x, q)
        att.alpha = 1 - 0.55 * Math.sin(k * Math.PI)
        if (Math.random() < 0.6)
          att.ghosts.push({
            x: att.x + att.ox,
            y: att.y + att.oy,
            a: 0.4,
            img: frameOf(att, clock),
            tint: '#a04aff',
          })
      })
      att.alpha = 1
      const c = centerOf(att)
      shadowBurst(c.x, c.y, 14, 40)
      evaOn(att, 4)
      att.focusT = 4
    },
  },
  // ไฟโคมเงียบ (shot 140; silence 2 s): the lantern flares and a silent soul flame streaks out, no shake, no sound effect, then a crossed bubble
  shd_arrow: {
    name: 'ไฟโคมเงียบ',
    icon: '🏮',
    async run(att, def) {
      const p = castPose(att, 480, 420, 'shadow')
      await tween(460, (k) => {
        const m = mouthOf(att)
        fxs.push({
          age: 0,
          life: 0.03,
          draw(cx) {
            cx.globalCompositeOperation = 'lighter'
            cx.globalAlpha = 0.4 + 0.5 * k
            cx.fillStyle = 'rgba(160,74,255,.5)'
            cx.beginPath()
            cx.arc(m.x, m.y, 4 + 10 * k, 0, 7)
            cx.fill()
          },
        })
      })
      await p.charged
      p.release()
      const m = mouthOf(att),
        c = centerOf(def)
      await shdFly(m, c, 260, 0, (cx: CanvasRenderingContext2D, x: number, y: number) => {
        cx.globalCompositeOperation = 'lighter'
        const dx = c.x - m.x,
          dy = c.y - m.y,
          n = Math.hypot(dx, dy) || 1
        for (let i = 0; i < 6; i++) {
          cx.globalAlpha = 0.9 - i * 0.14
          drawSoulFlame(cx, x - (dx / n) * i * 6, y - (dy / n) * i * 6, 1 - i * 0.12)
        }
      })
      impactBurst(c.x, c.y, '#d08aff', 10)
      shadowBurst(c.x, c.y, 16, 60)
      silenceOn(def, 2)
      await damage(def, 90, { from: att })
    },
  },
  // โล่ทมิฬ (melee r60, 120; 2 poison stacks): the black-armour knight bashes with its shield, then a crossed shadow cut leaves violet venom
  shd_snake: {
    name: 'โล่ทมิฬ',
    icon: '⚔️',
    async run(att, def) {
      if (!inRange(att, def, 60)) await approach(att, def)
      await meleeStrike(att, def, {
        wind: 200,
        rush: 110,
        hits: 2,
        onHit(i, dir) {
          const t = centerOf(def)
          scene.shake = Math.max(scene.shake, 3)
          scene.hitstop = 0.05
          if (i === 0) {
            impactBurst(t.x, t.y, '#a0a0c0', 10)
            fxs.push({
              age: 0,
              life: 0.3,
              draw(c, k) {
                c.globalAlpha = 1 - k
                c.strokeStyle = '#d4ccec'
                c.lineWidth = 2
                c.beginPath()
                c.arc(t.x - dir * 6, t.y, 6 + 12 * k, 0, 7)
                c.stroke()
              },
            })
          } else {
            for (const sg of [-1, 1])
              fxs.push({
                age: 0,
                life: 0.45,
                draw(c, k) {
                  c.globalCompositeOperation = 'lighter'
                  c.globalAlpha = 1 - k
                  for (const [w, col] of [
                    [5, 'rgba(160,74,255,.45)'],
                    [2, '#b04aff'],
                    [1, '#ffffff'],
                  ] as const) {
                    c.strokeStyle = col
                    c.lineWidth = w
                    c.beginPath()
                    c.moveTo(t.x - 14, t.y + sg * 14)
                    c.lineTo(t.x + 14, t.y - sg * 14)
                    c.stroke()
                  }
                },
              })
            ps.burst(16, () => ({
              x: t.x,
              y: t.y,
              vx: (Math.random() - 0.5) * 50,
              vy: -10 - Math.random() * 30,
              g: 60,
              life: 0.7,
              size: Math.random() < 0.4 ? 2 : 1,
              cols: ['#d08aff', '#7a2ad0', '#9aff6a'],
              glow: true,
            }))
            poisonOn(def, 5)
            sayAt(def, 'พิษ ×2', '#9aff6a', true)
          }
          return damage(def, 60, { from: att, melee: true })
        },
      })
    },
  },
  // กลืนกลบ (burst r100, 70; blind 3.5 s): the lazy mist puffs itself up and a wide grey fog rolls out over everything near it
  shd_mist: {
    name: 'กลืนกลบ',
    icon: '🌫️',
    async run(att, def) {
      for (let i = 0; i < 3 && !inRange(att, def, 100 * SCALE * 0.85); i++) await approach(att, def)
      const p = castPose(att, 600, 500, 'shadow')
      await tween(560, (k) => {
        att.sx = 1 + 0.25 * k
        att.sy = 1 + 0.18 * k
      })
      await p.charged
      p.release()
      att.sx = att.sy = 1
      const a = anchor(att),
        R = 100 * SCALE
      sayAt(att, 'ฟู่...', '#c8c4e8')
      for (let n = 0; n < 26; n++) {
        const an = (n / 26) * TAU
        ps.add({
          x: a.x,
          y: a.y - 10,
          vx: Math.cos(an) * R * 1.6,
          vy: Math.sin(an) * R * 0.6,
          drag: 2.4,
          life: 1.6,
          size: 3,
          cols: ['#8a8ac0', '#5a5a94', '#c8c4e8'],
          glow: false,
        })
      }
      fxs.push({
        age: 0,
        life: 1.6,
        draw(c, k) {
          const g = ease(Math.min(1, k * 3)),
            al = k < 0.6 ? 0.5 : 0.5 * (1 - (k - 0.6) / 0.4)
          c.globalCompositeOperation = 'source-over'
          c.globalAlpha = al
          const gr = c.createRadialGradient(a.x, a.y - 8, 4, a.x, a.y - 8, R * g)
          gr.addColorStop(0, 'rgba(200,196,232,.9)')
          gr.addColorStop(0.7, 'rgba(110,104,160,.6)')
          gr.addColorStop(1, 'rgba(60,56,100,0)')
          c.fillStyle = gr
          c.beginPath()
          c.ellipse(a.x, a.y - 8, R * g, R * 0.5 * g, 0, 0, 7)
          c.fill()
        },
      })
      await wait(300)
      if (inRange(att, def, R)) {
        mistBlind(def, 3.5)
        await damage(def, 45, { from: att })
      } else await wait(400)
    },
  },
  // เปลวพิษวิญญาณ (passive; 30% of basic hits poison): the soul-lantern wraith's lantern flickers and a soul flame clings to whoever it hits
  shd_sting: {
    name: 'เปลวพิษวิญญาณ',
    icon: '🏮',
    passive: true,
    async run(att, def) {
      att.venom = true
      tag(att, '🏮 เปลวพิษวิญญาณ (ติดตัว)', 'shadow')
      for (let i = 0; i < 4; i++) {
        await approach(att, def)
        await lungeHit(att, def, undefined)
        await wait(350)
      }
    },
  },
  // อวสานเงา (melee r62, 180; double damage below 35% HP): the light dies, the knight lord's greatsword grows a violet edge, one huge falling cleave
  shd_end: {
    name: 'อวสานเงา',
    icon: '⚔️',
    async run(att, def) {
      if (!inRange(att, def, 62)) await approach(att, def)
      const p = castPose(att, 650, 500, 'shadow')
      await tween(640, (k) => {
        scene.darken = 0.7 * k
        const m = mouthOf(att)
        if (Math.random() < 0.7)
          ps.add({
            x: m.x + (Math.random() - 0.5) * 30,
            y: m.y - Math.random() * 40,
            vx: 0,
            vy: 18,
            life: 0.4,
            size: 1,
            cols: SHADOW_COLS,
            glow: true,
          })
      })
      await p.charged
      p.release()
      const low = def.hp < def.hpMax * 0.35
      await meleeStrike(att, def, {
        wind: 160,
        rush: 120,
        hits: 1,
        onHit(_i, dir) {
          const t = centerOf(def)
          scene.darken = 0
          scene.flashScreen = 0.9
          scene.hitstop = 0.14
          scene.shake = 10
          fxs.push({
            age: 0,
            life: 0.55,
            draw(c, k) {
              c.globalCompositeOperation = 'lighter'
              c.globalAlpha = 1 - k
              for (const [w, col] of [
                [9, 'rgba(160,74,255,.4)'],
                [4, '#b04aff'],
                [1.5, '#ffffff'],
              ] as const) {
                c.strokeStyle = col
                c.lineWidth = w
                c.beginPath()
                c.arc(
                  t.x - dir * 10,
                  t.y - 18,
                  34,
                  dir > 0 ? -1.9 : -1.2 - Math.PI * 0.1,
                  dir > 0 ? 0.9 : 2.4 + Math.PI * 0.1
                )
                c.stroke()
              }
            },
          })
          fxs.push({
            age: 0,
            life: 0.6,
            draw(c, k) {
              c.globalCompositeOperation = 'lighter'
              c.globalAlpha = (1 - k) * 0.8
              c.fillStyle = '#b04aff'
              c.fillRect(t.x - 1, t.y - 60 + 60 * Math.min(1, k * 4), 2, 70)
            },
          })
          impactBurst(t.x, t.y, '#d08aff', 22)
          shadowBurst(t.x, t.y, 40, 110)
          if (low) {
            sayAt(def, 'ประหาร!', '#ff5a5a', true)
            scene.flashScreen = 1
          }
          return damage(def, low ? 360 : 180, { from: att, melee: true, crit: true })
        },
      })
      scene.darken = 0
    },
  },
  // จักรวาลเงา (passive; evasion +8, shorter dodge cooldown, after a dodge the next hit crits +25%): the wraith lord melts into smoke and reappears with a scythe swing
  shd_void: {
    name: 'จักรวาลเงา',
    icon: '🌀',
    passive: true,
    async run(att, def) {
      att.voidP = true
      tag(att, '🌀 จักรวาลเงา (ติดตัว)', 'shadow')
      await approach(def, att)
      await lungeHit(def, att, 'dodge')
      await wait(250)
      await approach(att, def)
      await lungeHit(att, def, undefined)
      await wait(400)
      for (let i = 0; i < 2; i++) {
        await approach(def, att)
        await lungeHit(def, att, undefined)
        await wait(300)
      }
      await approach(att, def)
      await lungeHit(att, def, undefined)
      await wait(300)
    },
  },
}
export function elCols(el: string) {
  return el === 'shadow'
    ? SHADOW_COLS
    : el === 'dark'
      ? DARK_COLS
      : el === 'holy'
        ? HOLY_COLS
        : el === 'water'
          ? WATER_COLS
          : el === 'leaf'
            ? LEAF_COLS
            : el === 'earth'
              ? EARTH_COLS
              : el === 'bolt'
                ? BOLT_COLS
                : FLAME_COLS
}
export const skillEl = (id: string) =>
  id.startsWith('tide')
    ? 'water'
    : id.startsWith('leaf')
      ? 'leaf'
      : id.startsWith('earth')
        ? 'earth'
        : id.startsWith('ltn')
          ? 'bolt'
          : id.startsWith('holy')
            ? 'holy'
            : id.startsWith('dark')
              ? 'dark'
              : id.startsWith('shd')
                ? 'shadow'
                : 'fire'
