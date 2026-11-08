import type { ISkillFx, IEnt } from './runtime'
import { immune } from './holy'
import {
  TAU,
  WH,
  WW,
  anchor,
  approach,
  castPose,
  centerOf,
  clock,
  damage,
  ease,
  fxs,
  impactBurst,
  inRange,
  lerp,
  lungeHit,
  meleeStrike,
  mouthOf,
  projectileOf,
  ps,
  sayAt,
  scene,
  tag,
  tween,
  wait,
  zoneDelay,
} from './runtime'
import { SCALE } from './fire'
import { poisonOn } from './leaf'

// The dark skills' animations, ported from the prototype (docs/tamagotchi/prototypes/
// monster-arena/js/skills/dark.js). Only the drawing is kept: the replay decides moves and damage.

// dark line: the game skills and their animations.
/* ---------- Dark skills from the game, each with its own animation ----------
   New statuses: curse (healing and shields halved; a turning violet sigil over the head), attack down (-20% damage dealt;
   a red arrow pointing down), and defence down (reuses the broken-shield icon, +25% damage taken). The zombie rat's
   passive drains 15% of every basic hit and enrages below 50% HP (+20% damage). */
export const DARK_COLS = ['#ffffff', '#e4b8ff', '#c47aff', '#a04ae8', '#ff3a4a']
export const cursed = (e: IEnt, n: number) => (e.curseT > 0 ? Math.round(n * 0.5) : n)
export function curseOn(e: IEnt, sec: number) {
  if (immune(e)) return
  e.curseT = Math.max(e.curseT || 0, sec)
  sayAt(e, 'คำสาป', '#c47aff')
}
export function atkDownOn(e: IEnt, sec: number) {
  if (immune(e)) return
  e.atkDownT = Math.max(e.atkDownT || 0, sec)
  sayAt(e, 'พลังโจมตีลด', '#ff8a8a')
}
export function defDownOn(e: IEnt, sec: number) {
  if (immune(e)) return
  e.defT = Math.max(e.defT || 0, sec)
  sayAt(e, 'เกราะลด', '#ff8a8a')
}
export function darkBurst(x: number, y: number, n = 18, sp = 70) {
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
      cols: DARK_COLS,
      glow: true,
    }
  })
}
// A rotating violet rune ring on the floor, as a warning for the cursed zone.
export function runeRing(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  R: number,
  spin: number,
  alpha: number
) {
  c.globalCompositeOperation = 'lighter'
  c.globalAlpha = alpha
  c.strokeStyle = '#a04ae8'
  c.lineWidth = 1
  c.beginPath()
  c.ellipse(x, y, R, R * 0.4, 0, 0, 7)
  c.stroke()
  c.beginPath()
  c.ellipse(x, y, R * 0.72, R * 0.29, 0, 0, 7)
  c.stroke()
  for (let i = 0; i < 10; i++) {
    const an = spin + (i * TAU) / 10
    c.fillStyle = i % 2 ? '#e4b8ff' : '#c47aff'
    c.fillRect(
      Math.round(x + Math.cos(an) * R * 0.86 - 1),
      Math.round(y + Math.sin(an) * R * 0.34 - 1),
      3,
      2
    )
  }
  c.beginPath()
  for (let i = 0; i < 5; i++) {
    const an = -spin * 0.6 + (i * TAU * 2) / 5
    const px = x + Math.cos(an) * R * 0.7,
      py = y + Math.sin(an) * R * 0.28
    if (i) c.lineTo(px, py)
    else c.moveTo(px, py)
  }
  c.closePath()
  c.stroke()
}
export const DARK: Record<string, ISkillFx> = {
  // ใยสาป (shot; slow 3 s + curse 4 s): the spider spits a ball of sticky violet silk that opens into a web over the target
  dark_web: {
    name: 'ใยสาป',
    icon: '🕷️',
    async run(att, def) {
      const p = castPose(att, 450, 450, 'dark')
      await p.charged
      p.release()
      const m = mouthOf(att),
        c = centerOf(def)
      await projectileOf(
        att,

        m,
        c,
        340,
        (cx, x, y) => {
          cx.globalCompositeOperation = 'lighter'
          cx.fillStyle = 'rgba(160,74,232,.45)'
          cx.beginPath()
          cx.arc(x, y, 5, 0, 7)
          cx.fill()
          cx.fillStyle = '#e4b8ff'
          cx.beginPath()
          cx.arc(x, y, 2.4, 0, 7)
          cx.fill()
          cx.strokeStyle = '#ffffff'
          cx.lineWidth = 1
          cx.beginPath()
          cx.moveTo(m.x, m.y)
          cx.lineTo(x, y)
          cx.stroke()
        },
        (x, y) => {
          if (Math.random() < 0.5)
            ps.add({ x, y, vx: 0, vy: 6, life: 0.4, size: 1, cols: DARK_COLS, glow: true })
        }
      )
      const R = def.def.size * 0.55
      fxs.push({
        age: 0,
        life: 3,
        draw(cx, k) {
          const cc = centerOf(def),
            g = Math.min(1, k * 8),
            a = 1 - Math.max(0, k - 0.85) / 0.15
          cx.globalCompositeOperation = 'lighter'
          cx.globalAlpha = a * 0.9
          cx.strokeStyle = '#e4b8ff'
          cx.lineWidth = 1
          for (let i = 0; i < 8; i++) {
            const an = (i * TAU) / 8
            cx.beginPath()
            cx.moveTo(cc.x, cc.y)
            cx.lineTo(cc.x + Math.cos(an) * R * g, cc.y + Math.sin(an) * R * g * 0.8)
            cx.stroke()
          }
          for (const q of [0.4, 0.7, 1]) {
            cx.beginPath()
            for (let i = 0; i <= 8; i++) {
              const an = (i * TAU) / 8,
                r = R * q * g * (i % 2 ? 0.88 : 1)
              const px = cc.x + Math.cos(an) * r,
                py = cc.y + Math.sin(an) * r * 0.8
              if (i) cx.lineTo(px, py)
              else cx.moveTo(px, py)
            }
            cx.stroke()
          }
        },
      })
      darkBurst(c.x, c.y, 18, 50)
      def.slowT = Math.max(def.slowT || 0, 3)
      sayAt(def, 'ช้าลง', '#c47aff')
      curseOn(def, 4)
      await damage(def, 50, { from: att })
    },
  },
  // กัดโสโครก (melee r58; 50% attack down 3 s): a filthy fast bite, green slime flies; the bitten may lose strength
  dark_bite: {
    name: 'กัดโสโครก',
    icon: '🐀',
    async run(att, def) {
      if (!inRange(att, def, 58)) await approach(att, def)
      await meleeStrike(att, def, {
        wind: 200,
        rush: 110,
        hits: 1,
        onHit(_i, dir) {
          const t = centerOf(def)
          for (const sg of [-1, 1])
            fxs.push({
              age: 0,
              life: 0.3,
              draw(c, k) {
                c.globalAlpha = 1 - k
                c.fillStyle = '#e8e0c8'
                const o = 7 * (1 - k * 0.4)
                c.beginPath()
                c.moveTo(t.x - 3, t.y + sg * o - 4)
                c.lineTo(t.x + 3, t.y + sg * o * 0.2)
                c.lineTo(t.x + 6, t.y + sg * o - 4)
                c.fill()
              },
            })
          ps.burst(14, () => ({
            x: t.x,
            y: t.y,
            vx: (Math.random() - 0.3) * 50 * dir,
            vy: -20 - Math.random() * 30,
            g: 120,
            life: 0.6,
            size: Math.random() < 0.4 ? 2 : 1,
            cols: ['#b4d86a', '#7ad35a', '#3a6a2a'],
          }))
          impactBurst(t.x, t.y, '#7ad35a', 8)
          scene.shake = Math.max(scene.shake, 2)
          if (Math.random() < 0.5) atkDownOn(def, 3)
          return damage(def, 65, { from: att, melee: true })
        },
      })
    },
  },
  // เขี้ยวโลหิต (melee r62, lifesteal 50%): a swooping bite, then red light streams from the victim back into the bat
  dark_fang: {
    name: 'เขี้ยวโลหิต',
    icon: '🧛',
    async run(att, def) {
      if (!inRange(att, def, 62)) await approach(att, def)
      let heal = 0
      await meleeStrike(att, def, {
        wind: 260,
        rush: 130,
        hits: 1,
        onHit() {
          const t = centerOf(def)
          impactBurst(t.x, t.y, '#ff3a4a', 12)
          scene.shake = Math.max(scene.shake, 3)
          scene.hitstop = 0.06
          for (const sg of [-1, 1])
            fxs.push({
              age: 0,
              life: 0.35,
              draw(c, k) {
                c.globalAlpha = 1 - k
                c.fillStyle = '#ffffff'
                const o = 6 + 4 * k
                c.beginPath()
                c.moveTo(t.x - 2, t.y + sg * o - 5)
                c.lineTo(t.x + 1, t.y + sg * 2)
                c.lineTo(t.x + 4, t.y + sg * o - 5)
                c.fill()
                c.fillStyle = '#ff3a4a'
                c.fillRect(t.x, t.y + sg * (o - 1), 1, 3 + k * 6)
              },
            })
          for (let n = 0; n < 12; n++)
            wait(n * 40).then(() => {
              const a = centerOf(att),
                b = centerOf(def)
              const q = { x: b.x, y: b.y }
              tween(380, (k) => {
                fxs.push({
                  age: 0,
                  life: 0.04,
                  draw(cx) {
                    cx.globalCompositeOperation = 'lighter'
                    cx.fillStyle = '#ff5a6a'
                    cx.fillRect(
                      lerp(q.x, a.x, k) + Math.sin(k * 9 + n) * 3,
                      lerp(q.y, a.y, k) - Math.sin(k * Math.PI) * 8,
                      2,
                      2
                    )
                  },
                })
              })
            })
          heal = cursed(att, 80)
          return damage(def, 160, { from: att, melee: true })
        },
      })
      att.hp = Math.min(att.hpMax, att.hp + heal)
      sayAt(att, '+' + heal + ' ดูดเลือด', '#ff8a8a', true)
      att.flash = 0.6
    },
  },
  // นัยน์ตาอาฆาต (shot; attack down + defence down 4 s): eight red eyes open in the air over the target, then a glare beam pins it
  dark_eye: {
    name: 'นัยน์ตาอาฆาต',
    icon: '👹',
    async run(att, def) {
      const p = castPose(att, 500, 450, 'dark')
      await p.charged
      p.release()
      const c = centerOf(def),
        m = mouthOf(att),
        top = c.y - def.def.img.foot * 0.7 - 6
      await tween(380, (k) => {
        fxs.push({
          age: 0,
          life: 0.05,
          draw(cx) {
            cx.globalCompositeOperation = 'lighter'
            cx.globalAlpha = 0.9
            for (let i = 0; i < 8; i++) {
              const an = (i * TAU) / 8 + clock,
                ex = c.x + Math.cos(an) * 16,
                ey = top - 6 + Math.sin(an) * 5,
                o = Math.min(1, Math.max(0, k * 8 - i * 0.5))
              cx.fillStyle = '#c8102a'
              cx.beginPath()
              cx.ellipse(ex, ey, 3, 3 * o + 0.2, 0, 0, 7)
              cx.fill()
              cx.fillStyle = '#ffd0d0'
              cx.fillRect(ex, ey - 1, 1, 2)
            }
          },
        })
      })
      scene.flashScreen = 0.2
      scene.shake = Math.max(scene.shake, 2)
      fxs.push({
        age: 0,
        life: 0.5,
        draw(cx, k) {
          cx.globalCompositeOperation = 'lighter'
          cx.globalAlpha = 1 - k
          for (const [w, col] of [
            [5, 'rgba(200,16,42,.4)'],
            [2, '#ff3a4a'],
            [1, '#ffffff'],
          ] as const) {
            cx.strokeStyle = col
            cx.lineWidth = w
            cx.beginPath()
            cx.moveTo(m.x, m.y)
            cx.lineTo(c.x, c.y)
            cx.stroke()
          }
        },
      })
      darkBurst(c.x, c.y, 24, 70)
      atkDownOn(def, 4)
      defDownOn(def, 4)
      await damage(def, 70, { from: att })
    },
  },
  // คลานทับ (passive): the zombie rat drains 15% of every basic hit and, below 50% HP, hits 20% harder (red aura, anger vein)
  dark_undead: {
    name: 'คลานทับ',
    icon: '🧟',
    passive: true,
    async run(att, def) {
      att.undead = true
      att.enraged = false
      att.hp = Math.min(att.hp, Math.round(att.hpMax * 0.53))
      tag(att, '🧟 คลานทับ (ติดตัว)', 'dark')
      await approach(att, def)
      await lungeHit(att, def, undefined)
      await wait(400)
      for (let i = 0; i < 3 && !att.enraged; i++) {
        await approach(def, att)
        await lungeHit(def, att, undefined)
        await wait(300)
      }
      await wait(300)
      await approach(att, def)
      await lungeHit(att, def, undefined)
      await wait(400)
    },
  },
  // พิโรธรัตติกาล (burst r110; curse 4 s): the bat lord flares its torn wings and a ring of black-violet shock rolls outwards
  dark_wrath: {
    name: 'พิโรธรัตติกาล',
    icon: '😈',
    async run(att, def) {
      for (let i = 0; i < 3 && !inRange(att, def, 110 * SCALE * 0.85); i++) await approach(att, def)
      const p = castPose(att, 500, 600, 'dark')
      tween(500, (k) => {
        scene.darken = 0.3 * k
      })
      await p.charged
      p.release()
      const a = anchor(att),
        R = 110 * SCALE
      scene.shake = 5
      scene.flashScreen = 0.3
      sayAt(att, 'พิโรธ!', '#c47aff', true)
      for (let i = 0; i < 3; i++)
        fxs.push({
          age: -i * 0.14,
          life: 0.75,
          draw(c, k) {
            if (k < 0) return
            c.globalCompositeOperation = 'lighter'
            c.globalAlpha = (1 - k) * 0.9
            c.strokeStyle = i === 1 ? '#ff3a4a' : '#a04ae8'
            c.lineWidth = 3 - i * 0.6
            c.beginPath()
            c.ellipse(a.x, a.y - 6, R * ease(k), R * 0.42 * ease(k), 0, 0, 7)
            c.stroke()
          },
        })
      for (let n = 0; n < 8; n++)
        ps.add({
          x: a.x,
          y: a.y - 20,
          vx: Math.cos((n / 8) * TAU) * 70,
          vy: Math.sin((n / 8) * TAU) * 30 - 20,
          drag: 2,
          life: 0.8,
          size: 2,
          cols: ['#2e1c2c', '#a04ae8'],
          glow: false,
        })
      darkBurst(a.x, a.y - att.def.img.foot * 0.5, 34, 90)
      tween(600, (k) => {
        scene.darken = 0.3 * (1 - k)
      })
      await wait(240)
      if (inRange(att, def, R)) {
        curseOn(def, 4)
        await damage(def, 120, { from: att })
      } else await wait(400)
    },
  },
  // อวสานแสง (melee r66, 280% power; defence down 4 s): the light goes out, the spider queen leaps out of the dark and drives its fangs in
  dark_end: {
    name: 'อวสานแสง',
    icon: '🌚',
    async run(att, def) {
      if (!inRange(att, def, 66)) await approach(att, def)
      const p = castPose(att, 500, 500, 'dark')
      await tween(700, (k) => {
        scene.darken = 0.75 * k
        if (Math.random() < 0.5) {
          const c = centerOf(att),
            an = Math.random() * TAU
          ps.add({
            x: c.x + Math.cos(an) * 40,
            y: c.y + Math.sin(an) * 28,
            vx: -Math.cos(an) * 50,
            vy: -Math.sin(an) * 35,
            life: 0.4,
            size: 1,
            cols: DARK_COLS,
            glow: true,
          })
        }
      })
      await p.charged
      p.release()
      await meleeStrike(att, def, {
        wind: 150,
        rush: 120,
        hits: 1,
        onHit() {
          const t = centerOf(def)
          scene.darken = 0
          scene.flashScreen = 0.95
          scene.hitstop = 0.12
          scene.shake = 9
          for (const sg of [-1, 1])
            fxs.push({
              age: 0,
              life: 0.5,
              draw(c, k) {
                c.globalCompositeOperation = 'lighter'
                c.globalAlpha = 1 - k
                for (const [w, col] of [
                  [6, 'rgba(160,74,232,.5)'],
                  [3, '#c47aff'],
                  [1, '#ffffff'],
                ] as const) {
                  c.strokeStyle = col
                  c.lineWidth = w
                  c.beginPath()
                  c.moveTo(t.x - 16, t.y + sg * 18)
                  c.lineTo(t.x + 2, t.y + sg * 2)
                  c.lineTo(t.x + 14, t.y + sg * 16 * (1 - k * 0.2))
                  c.stroke()
                }
              },
            })
          impactBurst(t.x, t.y, '#c47aff', 22)
          darkBurst(t.x, t.y, 40, 110)
          fxs.push({
            age: 0,
            life: 0.9,
            draw(c, k) {
              c.globalCompositeOperation = 'source-over'
              c.globalAlpha = (1 - k) * 0.55
              c.fillStyle = '#000'
              c.fillRect(0, 0, WW, WH)
            },
          })
          defDownOn(def, 4)
          return damage(def, 280, { from: att, melee: true, crit: true })
        },
      })
      scene.darken = 0
    },
  },
  // คำสาปนิรันดร์ (zone r90, lands after 1.4 s; curse + attack down + poison 5 s): a rune circle burns into the floor, then black flames and ghosts rise
  dark_curse: {
    name: 'คำสาปนิรันดร์',
    icon: '💀',
    reach: 230,
    async run(att, def) {
      const p = castPose(att, 600, 600, 'dark')
      await p.charged
      p.release()
      const z = { x: def.x, y: def.y },
        R = 90 * SCALE,
        delay = zoneDelay(att, 1400)
      fxs.push({
        age: 0,
        life: delay / 1000 + 0.1,
        draw(c, k) {
          const g = Math.min(1, k * 2)
          runeRing(
            c,
            z.x,
            z.y,
            R * g,
            clock * (1 + k * 4),
            0.5 + 0.4 * Math.sin(clock * (8 + k * 14))
          )
          if (Math.random() < 0.5) {
            const an = Math.random() * TAU
            ps.add({
              x: z.x + Math.cos(an) * R * 0.8,
              y: z.y + Math.sin(an) * R * 0.32,
              vx: 0,
              vy: -24,
              life: 0.6,
              size: 1,
              cols: DARK_COLS,
              glow: true,
            })
          }
        },
      })
      await tween(delay, (k) => {
        scene.darken = 0.25 * k
        scene.shake = Math.max(scene.shake, k * 1.4)
      })
      scene.darken = 0
      scene.flashScreen = 0.4
      scene.shake = 6
      fxs.push({
        age: 0,
        life: 1.2,
        draw(c, k) {
          c.globalCompositeOperation = 'lighter'
          const a = 1 - Math.max(0, k - 0.5) / 0.5
          for (let i = 0; i < 16; i++) {
            const an = (i * TAU) / 16,
              rr = R * 0.8 * (i % 2 ? 0.5 : 1),
              x = z.x + Math.cos(an) * rr,
              h = (28 + (22 * ((i * 7) % 5)) / 5) * Math.min(1, k * 4) * a,
              y = z.y + Math.sin(an) * rr * 0.4
            c.globalAlpha = a * 0.8
            const gr = c.createLinearGradient(0, y - h, 0, y)
            gr.addColorStop(0, 'rgba(255,255,255,0)')
            gr.addColorStop(0.5, 'rgba(160,74,232,.8)')
            gr.addColorStop(1, 'rgba(40,10,70,.9)')
            c.fillStyle = gr
            c.fillRect(x - 2, y - h, 4, h)
          }
          for (let g = 0; g < 4; g++) {
            const gx = z.x + (g - 1.5) * R * 0.4,
              gy = z.y - 30 * k * 1.6 - g * 6
            c.globalAlpha = a * 0.8
            c.fillStyle = '#e4b8ff'
            c.beginPath()
            c.ellipse(gx, gy, 4, 5, 0, 0, 7)
            c.fill()
            c.fillStyle = '#1a0a2a'
            c.fillRect(gx - 2, gy - 1, 1, 2)
            c.fillRect(gx + 1, gy - 1, 1, 2)
            c.fillRect(gx - 1, gy + 2, 2, 1)
          }
        },
      })
      darkBurst(z.x, z.y, 50, 110)
      if (Math.hypot(def.x - z.x, (def.y - z.y) * 2.4) <= R + 6) {
        curseOn(def, 5)
        atkDownOn(def, 5)
        poisonOn(def, 5)
        await damage(def, 110, { from: att })
      } else await wait(500)
    },
  },
}
