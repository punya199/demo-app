import type { ISkillFx, IEnt } from './runtime'
import { immune } from './holy'
import {
  TAU,
  anchor,
  approach,
  beamAngle,
  castPose,
  centerOf,
  clock,
  damage,
  ease,
  easeIn,
  frameOf,
  fxs,
  impactBurst,
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
  zoneAt,
  zoneDelay,
} from './runtime'
import { SCALE, slashFx } from './fire'
import { stunOn } from './earth'

// The bolt skills' animations, ported from the prototype (docs/tamagotchi/prototypes/
// monster-arena/js/skills/bolt.js). Only the drawing is kept: the replay decides moves and damage.

// bolt line: the game skills and their animations.
/* ---------- Lightning skills from the game, each with its own animation ----------
   New statuses: static (crackles; 30% a second to seize up for 0.4 s), haste (faster, yellow after-images)
   and focus (crit chance up, a crosshair over the head). */
export const BOLT_COLS = ['#ffffff', '#fffac0', '#ffe14a', '#ffd23a', '#9cc4ff']
export function staticOn(e: IEnt, sec: number) {
  if (immune(e)) return
  e.staticT = Math.max(e.staticT || 0, sec)
  sayAt(e, 'ไฟฟ้าสถิต', '#ffe14a')
}
// A jagged lightning line between two points, redrawn every frame so it flickers.
export function boltLine(
  c: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  jag = 8,
  widths: [number, string][] = [
    [5, 'rgba(255,225,74,.3)'],
    [2.5, '#ffe14a'],
    [1, '#ffffff'],
  ],
  seg = 7
) {
  const pts = [[x0, y0]]
  for (let i = 1; i < seg; i++) {
    const q = i / seg
    pts.push([
      lerp(x0, x1, q) + (Math.random() - 0.5) * jag,
      lerp(y0, y1, q) + (Math.random() - 0.5) * jag,
    ])
  }
  pts.push([x1, y1])
  c.globalCompositeOperation = 'lighter'
  for (const [w, col] of widths) {
    c.strokeStyle = col
    c.lineWidth = w
    c.beginPath()
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)))
    c.stroke()
  }
}
export function zapBurst(x: number, y: number, n = 18, sp = 70) {
  ps.burst(n, () => {
    const a = Math.random() * TAU,
      v = sp * (0.4 + Math.random() * 0.8)
    return {
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v * 0.7,
      drag: 5,
      life: 0.25 + Math.random() * 0.2,
      size: Math.random() < 0.3 ? 2 : 1,
      cols: BOLT_COLS,
      glow: true,
    }
  })
}
export const BOLT: Record<string, ISkillFx> = {
  // ปีกฟ้าผ่า (shot, static 3 s): the wings crackle, then a lightning feather flies at the target
  ltn_wing: {
    name: 'ปีกฟ้าผ่า',
    icon: '🐦',
    async run(att, def) {
      const p = castPose(att, 400, 500, 'bolt')
      await p.charged
      p.release()
      const m = mouthOf(att),
        c = centerOf(def)
      await tween(260, (k) => {
        const x = lerp(m.x, c.x, k),
          y = lerp(m.y, c.y, k) - Math.sin(k * Math.PI) * 8
        fxs.push({
          age: 0,
          life: 0.06,
          draw(cx) {
            boltLine(
              cx,
              x - (c.x - m.x) * 0.12,
              y - (c.y - m.y) * 0.12,
              x,
              y,
              4,
              [
                [3, 'rgba(255,225,74,.4)'],
                [1, '#ffffff'],
              ],
              3
            )
            cx.fillStyle = '#fffac0'
            cx.fillRect(x - 1, y - 1, 3, 3)
          },
        })
      })
      zapBurst(c.x, c.y, 20)
      fxs.push({
        age: 0,
        life: 0.25,
        draw(cx) {
          boltLine(cx, c.x - 8, c.y - 10, c.x + 8, c.y + 8, 6)
        },
      })
      staticOn(def, 3)
      await damage(def, 70, { from: att })
    },
  },
  // ขนพองช็อต (passive): fur bristles with static; whoever hits it up close may be left crackling
  ltn_cat: {
    name: 'ขนพองช็อต',
    icon: '🐱',
    passive: true,
    async run(att, def) {
      att.staticRetort = true
      tag(att, '🐱 ขนพองช็อต (ติดตัว)', 'bolt')
      await approach(def, att)
      await lungeHit(def, att)
      await wait(700)
      att.staticRetort = false
    },
  },
  // ข่วนสายฟ้า (was เล็บพายุ; 4 hits, range 60): four lightning-fast claw swipes, a spark on every hit
  ltn_claw: {
    name: 'ข่วนสายฟ้า',
    icon: '🐾',
    async run(att, def) {
      await meleeStrike(att, def, {
        wind: 220,
        rush: 110,
        hits: 4,
        gap: 95,
        onHit(i, dir) {
          const t = centerOf(def),
            r = def.def.size * 0.26,
            sgn = i % 2 ? -1 : 1
          for (let j = -1; j <= 1; j++)
            slashFx(
              t.x - dir * r + j * 2,
              t.y - sgn * r + j * 3,
              t.x + dir * r + j * 2,
              t.y + sgn * r * 0.7 + j * 3,
              0.22,
              ['rgba(255,225,74,.5)', '#ffe14a', '#ffffff']
            )
          zapBurst(t.x, t.y, 8, 50)
          scene.shake = Math.max(scene.shake, 1.2)
          return damage(def, 22, { from: att, crit: i === 3 && Math.random() < 0.35 })
        },
      })
    },
  },
  // โฉบอสนี (was กีบอสนี; charge, haste 3 s): a lightning dive straight through the target's guard, then it is faster for a while
  ltn_hoof: {
    name: 'โฉบอสนี',
    icon: '🦅',
    async run(att, def) {
      const vx = def.x - att.x,
        vy = def.y - att.y,
        len = Math.hypot(vx, vy) || 1,
        ux = vx / len,
        uy = vy / len,
        dir = Math.sign(vx) || 1
      const A = (t: number) => {
        att.anim = { name: 'attack', t }
      }
      await tween(300, (k) => {
        A(0.3 * k)
        att.ox = -ux * 8 * ease(k)
        att.oy = -uy * 5 * ease(k) - 8 * ease(k)
      })
      const dist = Math.max(0, len - (att.def.size + def.def.size) * 0.22),
        a0 = anchor(att)
      await tween(170, (k) => {
        A(0.3 + 0.12 * k)
        const d = -8 + (dist + 8) * easeIn(k)
        att.ox = ux * d
        att.oy = uy * d * 0.8 - 8 * (1 - k)
        if (Math.random() < 0.8)
          att.ghosts.push({
            x: att.x + att.ox,
            y: att.y + att.oy,
            a: 0.5,
            img: frameOf(att, clock),
            tint: '#ffe14a',
          })
      })
      const a1 = anchor(att)
      fxs.push({
        age: 0,
        life: 0.3,
        draw(cx, k) {
          cx.globalAlpha = 1 - k
          boltLine(cx, a0.x, a0.y - 20, a1.x, a1.y - 20, 6)
        },
      })
      const c = centerOf(def)
      impactBurst(c.x, c.y, '#ffe14a', 14)
      zapBurst(c.x, c.y, 24, 90)
      scene.shake = Math.max(scene.shake, 4)
      scene.hitstop = 0.07
      tween(220, (k) => {
        def.ox = dir * 9 * Math.sin(k * Math.PI)
      })
      const p = damage(def, 90, { from: att })
      att.hasteT = 3
      sayAt(att, 'เร็วขึ้น', '#ffe14a')
      await tween(130, (k) => A(0.42 + 0.2 * k))
      await tween(300, (k) => {
        A(0.62 + 0.38 * k)
        att.ox = ux * dist * (1 - ease(k))
        att.oy = uy * dist * 0.8 * (1 - ease(k))
      })
      att.ox = att.oy = 0
      att.anim = null
      await p
    },
  },
  // ฟ้าคำราม (zone r90, strikes after 0.7 s, static 3 s): a thundercloud gathers over the target, rumbles, then lightning hits the ground
  ltn_roar: {
    name: 'ฟ้าคำราม',
    icon: '🌩️',
    reach: 220,
    async run(att, def) {
      const p = castPose(att, 500, 500, 'bolt')
      await p.charged
      p.release()
      const z = zoneAt(att, def),
        R = 90 * SCALE,
        delay = zoneDelay(att, 700)
      fxs.push({
        age: 0,
        life: (delay + 500) / 1000,
        draw(c, k) {
          const g = Math.min(1, k * 2),
            cy = z.y - 64
          c.globalAlpha = 0.85 * g
          for (const [dx, dy, r] of [
            [-14, 2, 10],
            [0, -3, 13],
            [14, 1, 10],
            [-6, 6, 9],
            [8, 6, 9],
          ]) {
            c.fillStyle = '#2c3248'
            c.beginPath()
            c.ellipse(z.x + dx, cy + dy, r, r * 0.6, 0, 0, 7)
            c.fill()
            c.fillStyle = '#5a6488'
            c.beginPath()
            c.ellipse(z.x + dx - 2, cy + dy - 2, r * 0.6, r * 0.35, 0, 0, 7)
            c.fill()
          }
          if (Math.random() < 0.25) {
            c.globalAlpha = 0.8
            boltLine(
              c,
              z.x + (Math.random() - 0.5) * 20,
              cy + 4,
              z.x + (Math.random() - 0.5) * 30,
              cy + 14,
              5,
              [[1, '#ffe14a']],
              3
            )
          }
          const pulse = 0.5 + 0.5 * Math.sin(clock * 22)
          c.globalAlpha = 0.18 + 0.18 * pulse
          c.fillStyle = '#ffe14a'
          c.beginPath()
          c.ellipse(z.x, z.y, R * g, R * 0.4 * g, 0, 0, 7)
          c.fill()
          c.globalAlpha = 0.9
          c.strokeStyle = '#ffe14a'
          c.lineWidth = 1
          c.beginPath()
          c.ellipse(z.x, z.y, R, R * 0.4, 0, 0, 7)
          c.stroke()
        },
      })
      await tween(delay, (k) => {
        scene.shake = Math.max(scene.shake, 1.5 * k)
      })
      scene.shake = 6
      scene.flashScreen = 0.55
      fxs.push({
        age: 0,
        life: 0.45,
        draw(c, k) {
          c.globalAlpha = 1 - k
          for (const dx of [-10, 0, 9])
            boltLine(c, z.x + dx * 0.4, z.y - 64, z.x + dx, z.y, 10, undefined, 9)
        },
      })
      zapBurst(z.x, z.y, 40, 110)
      fxs.push({
        age: 0,
        life: 0.8,
        draw(c, k) {
          c.globalAlpha = 1 - k
          c.strokeStyle = '#ffe14a'
          c.lineWidth = 2
          c.beginPath()
          c.ellipse(z.x, z.y, R * ease(k), R * 0.4 * ease(k), 0, 0, 7)
          c.stroke()
        },
      })
      if (Math.hypot(def.x - z.x, (def.y - z.y) * 2.4) <= R + 6) {
        staticOn(def, 3)
        await damage(def, 95, { from: att })
      } else await wait(500)
    },
  },
  // หางอสนี (self, haste and focus for 5 s): the tails flare with lightning; faster and sharper for a while
  ltn_tail: {
    name: 'หางอสนี',
    icon: '🦊',
    async run(att) {
      const p = castPose(att, 300, 600, 'bolt')
      await p.charged
      p.release()
      const a = anchor(att)
      scene.flashScreen = 0.2
      fxs.push({
        age: 0,
        life: 1,
        draw(c, k) {
          c.globalAlpha = 1 - k
          for (let i = 0; i < 5; i++) {
            const an = -Math.PI / 2 + (i - 2) * 0.45 + (att.flip ? 0.4 : -0.4)
            boltLine(
              c,
              a.x,
              a.y - att.def.img.foot * 0.5,
              a.x + Math.cos(an) * 34,
              a.y - att.def.img.foot * 0.5 + Math.sin(an) * 30,
              6,
              [
                [3, 'rgba(255,225,74,.35)'],
                [1, '#ffffff'],
              ],
              5
            )
          }
        },
      })
      ps.burst(40, () => ({
        x: a.x + (Math.random() - 0.5) * att.def.size * 0.6,
        y: a.y - Math.random() * 20,
        vx: 0,
        vy: -30 - Math.random() * 30,
        life: 0.7,
        size: 1,
        cols: BOLT_COLS,
        glow: true,
        twinkle: true,
      }))
      await wait(300)
      att.hasteT = 5
      att.focusT = 5
      sayAt(att, 'เร็วขึ้น · คริขึ้น', '#ffe14a', true)
      await wait(400)
    },
  },
  // อสนีบาต (beam 320 x 30, long wind-up, stun 0.6 s): wings up, lightning gathers at the mouth, then a beam of lightning along a line
  ltn_bolt: {
    name: 'อสนีบาต',
    icon: '🌩️',
    reach: 320 * SCALE,
    async run(att, def) {
      const p = castPose(att, 800, 900, 'bolt')
      tween(800, (k) => {
        scene.darken = 0.35 * k
        if (Math.random() < 0.6) {
          const m = mouthOf(att),
            an = Math.random() * TAU
          fxs.push({
            age: 0,
            life: 0.08,
            draw(c) {
              boltLine(
                c,
                m.x + Math.cos(an) * 22,
                m.y + Math.sin(an) * 16,
                m.x,
                m.y,
                4,
                [[1, '#ffe14a']],
                3
              )
            },
          })
        }
      })
      await p.charged
      p.release()
      const L = 320 * SCALE,
        Wd = 30 * SCALE,
        m0 = mouthOf(att),
        t0 = centerOf(def),
        ang = beamAngle(att, Math.atan2(t0.y - m0.y, t0.x - m0.x))
      scene.flashScreen = 0.7
      scene.shake = 7
      fxs.push({
        age: 0,
        life: 0.6,
        draw(c, k) {
          const m = mouthOf(att),
            ex = m.x + Math.cos(ang) * L,
            ey = m.y + Math.sin(ang) * L
          c.globalAlpha = (1 - k) * 0.35
          c.fillStyle = '#ffe14a'
          c.beginPath()
          const nx = (-Math.sin(ang) * Wd) / 2,
            ny = (Math.cos(ang) * Wd) / 2
          c.moveTo(m.x, m.y)
          c.lineTo(ex + nx, ey + ny)
          c.lineTo(ex - nx, ey - ny)
          c.fill()
          c.globalAlpha = 1 - k * 0.8
          for (let i = 0; i < 3; i++)
            boltLine(
              c,
              m.x,
              m.y,
              ex + (i - 1) * nx * 0.5,
              ey + (i - 1) * ny * 0.5,
              9,
              undefined,
              12
            )
        },
      })
      tween(600, (k) => {
        scene.darken = 0.35 * (1 - k)
      })
      const d = Math.hypot(t0.x - m0.x, t0.y - m0.y)
      if (d <= L + def.def.size * 0.3) {
        zapBurst(t0.x, t0.y, 40, 120)
        stunOn(def, 0.6)
        await damage(def, 130, { from: att, crit: true })
      } else await wait(600)
    },
  },
  // หางปาอสนี (was วัชระผ่าฟ้า; 3 shots in a fan, static 60% each): the tails fling three balls of lightning
  ltn_vajra: {
    name: 'หางปาอสนี',
    icon: '🦊',
    reach: 230,
    async run(att, def) {
      const p = castPose(att, 500, 600, 'bolt')
      await p.charged
      p.release()
      const m = centerOf(att),
        base = Math.atan2(centerOf(def).y - m.y, centerOf(def).x - m.x),
        start = {
          x: m.x - (att.flip ? -1 : 1) * att.def.size * 0.2,
          y: m.y - att.def.img.foot * 0.35,
        },
        pending = []
      for (let i = 0; i < 3; i++) {
        const t = centerOf(def),
          dist = Math.hypot(t.x - start.x, t.y - start.y) + 6,
          an = base + (i - 1) * 0.1,
          end = { x: start.x + Math.cos(an) * dist, y: start.y + Math.sin(an) * dist + (i - 1) * 6 }
        pending.push(
          wait(i * 90)
            .then(() =>
              tween(dist / 0.3, (k) => {
                const x = lerp(start.x, end.x, k),
                  y = lerp(start.y, end.y, k) - Math.sin(k * Math.PI) * (14 + i * 4)
                fxs.push({
                  age: 0,
                  life: 0.05,
                  draw(c) {
                    c.globalCompositeOperation = 'lighter'
                    c.fillStyle = 'rgba(255,225,74,.5)'
                    c.beginPath()
                    c.arc(x, y, 4, 0, 7)
                    c.fill()
                    c.fillStyle = '#ffffff'
                    c.beginPath()
                    c.arc(x, y, 2, 0, 7)
                    c.fill()
                    boltLine(c, x - 5, y - 4, x + 5, y + 4, 3, [[1, '#ffe14a']], 2)
                  },
                })
                if (Math.random() < 0.5)
                  ps.add({ x, y, vx: 0, vy: 0, life: 0.3, size: 1, cols: BOLT_COLS, glow: true })
              })
            )
            .then(() => {
              zapBurst(end.x, end.y, 14, 70)
              if (Math.random() < 0.6) staticOn(def, 2.5)
              return damage(def, 35, { from: att })
            })
        )
      }
      await Promise.all(pending)
    },
  },
}
