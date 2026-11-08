import type { ISkillFx, IEnt } from './runtime'
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
  fxs,
  impactBurst,
  inRange,
  lerp,
  lungeHit,
  makeParticle,
  meleeStrike,
  mouthOf,
  projectileOf,
  ps,
  sayAt,
  scene,
  tag,
  tween,
  wait,
  zoneAt,
  zoneDelay,
} from './runtime'
import { cursed } from './dark'
import { silenceOn } from './leaf'
import { SCALE } from './fire'

// The holy skills' animations, ported from the prototype (docs/tamagotchi/prototypes/
// monster-arena/js/skills/holy.js). Only the drawing is kept: the replay decides moves and damage.

// holy line: the game skills and their animations.
/* ---------- Holy skills from the game, each with its own animation ----------
   New statuses: blind from light (a white-gold glare over the eyes; 35% of basic attacks miss), the gold light
   shield, and the seraph lion's last stand (below 35% HP once: shield, cleanse, immune to crowd control 2 s). */
export const HOLY_COLS = ['#ffffff', '#fff6c8', '#ffe88a', '#ffd84a', '#bcdcf8']
export function immune(e: IEnt) {
  if (e.immuneT > 0) {
    sayAt(e, 'คุ้มกัน', '#fff0a0')
    return true
  }
  return false
}
export function blindOn(e: IEnt, sec: number) {
  if (immune(e)) return
  e.blindT = Math.max(e.blindT || 0, sec)
  e.blindLight = true
  sayAt(e, 'ตาพร่า', '#fff0a0')
}
export function cleanse(e: IEnt) {
  const had =
    e.status ||
    e.blindT > 0 ||
    e.slowT > 0 ||
    e.defT > 0 ||
    e.rootT > 0 ||
    e.silenceT > 0 ||
    e.poisonT > 0 ||
    e.stunT > 0 ||
    e.staticT > 0
  e.status = null
  e.blindT =
    e.slowT =
    e.defT =
    e.rootT =
    e.silenceT =
    e.poisonT =
    e.stunT =
    e.staticT =
    e.curseT =
    e.atkDownT =
    e.evaT =
      0
  if (had) sayAt(e, 'ล้างสถานะ', '#fff6c8')
  return had
}
export function holyShield(e: IEnt, pct: number, sec: number) {
  e.bubbleStone = false
  e.bubbleHoly = true
  e.bubbleMax = e.bubbleHp = cursed(e, Math.round(e.hpMax * pct))
  e.bubbleT = sec
  sayAt(e, 'โล่ +' + e.bubbleHp, '#ffe88a', true)
}
export function lightBurst(x: number, y: number, n = 18, sp = 70) {
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
      cols: HOLY_COLS,
      glow: true,
      twinkle: true,
    }
  })
}
export function featherFall(x: number, y: number, w: number, n = 12) {
  ps.burst(n, () => ({
    x: x + (Math.random() - 0.5) * w,
    y: y - Math.random() * 16,
    vx: (Math.random() - 0.5) * 8,
    vy: 8 + Math.random() * 8,
    life: 1.1 + Math.random() * 0.5,
    size: Math.random() < 0.4 ? 2 : 1,
    cols: ['#ffffff', '#eef2fc', '#d0d8ec'],
    sway: 1,
  }))
}
// A column of light standing on (x, y): soft wide glow with a bright core.
export function lightPillar(x: number, y: number, w: number, h: number, life: number, alpha = 1) {
  fxs.push({
    age: 0,
    life,
    draw(c, k) {
      const a = alpha * (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85),
        ww = w * (1 - k * 0.4)
      c.globalCompositeOperation = 'lighter'
      const g = c.createLinearGradient(x - ww, 0, x + ww, 0)
      g.addColorStop(0, 'rgba(255,216,74,0)')
      g.addColorStop(0.5, 'rgba(255,240,180,.7)')
      g.addColorStop(1, 'rgba(255,216,74,0)')
      c.globalAlpha = a
      c.fillStyle = g
      c.fillRect(x - ww, y - h, ww * 2, h)
      c.fillStyle = '#ffffff'
      c.globalAlpha = a * 0.8
      c.fillRect(x - ww * 0.18, y - h, ww * 0.36, h)
      c.globalAlpha = a * 0.7
      c.strokeStyle = '#fff0a0'
      c.lineWidth = 1
      c.beginPath()
      c.ellipse(x, y, ww * 1.3, ww * 0.45, 0, 0, 7)
      c.stroke()
    },
  })
}
// The seraph lion's last stand: called from damage() the first time it drops below 35% HP.
export function lastStandFx(e: IEnt) {
  tag(e, '😇 ปีกขาวเจิดจ้า', 'holy')
  scene.flashScreen = 0.35
  scene.hitstop = 0.08
  cleanse(e)
  holyShield(e, 0.28, 6)
  e.immuneT = 2
  const a = anchor(e),
    cy = a.y - e.def.img.foot * 0.55
  fxs.push({
    age: 0,
    life: 1.1,
    draw(c, k) {
      c.globalCompositeOperation = 'lighter'
      c.globalAlpha = 1 - k
      for (let i = 0; i < 6; i++) {
        const an = -Math.PI / 2 + (i - 2.5) * 0.42,
          L = 26 + 22 * ease(Math.min(1, k * 3))
        c.strokeStyle = i % 2 ? '#fff6c8' : '#ffd84a'
        c.lineWidth = 3
        c.beginPath()
        c.moveTo(a.x, cy)
        c.lineTo(a.x + Math.cos(an) * L, cy + Math.sin(an) * L * 0.9)
        c.stroke()
      }
    },
  })
  lightBurst(a.x, cy, 40, 110)
  featherFall(a.x, cy - 20, e.def.size, 18)
  lightPillar(a.x, a.y, 16, 90, 0.9)
  sayAt(e, 'คุ้มกันสถานะ 2 วิ', '#fff0a0', true)
}
export const HOLY: Record<string, ISkillFx> = {
  // ปีกทิพย์ (self, heal 15% + cleanse): the wings open, feathers drift down, a ring of light settles over it
  holy_wing: {
    name: 'ปีกทิพย์',
    icon: '🕊️',
    async run(att) {
      const p = castPose(att, 450, 700, 'holy'),
        a = anchor(att),
        H0 = att.def.img.foot + 16
      featherFall(a.x, a.y - H0, att.def.size * 0.9, 16)
      await p.charged
      p.release()
      fxs.push({
        age: 0,
        life: 0.9,
        draw(c, k) {
          const y = a.y - H0 * (1 - ease(k))
          c.globalCompositeOperation = 'lighter'
          c.globalAlpha = 1 - k * 0.7
          c.strokeStyle = '#ffd84a'
          c.lineWidth = 2
          c.beginPath()
          c.ellipse(a.x, y, att.def.size * 0.36, att.def.size * 0.1, 0, 0, 7)
          c.stroke()
          c.strokeStyle = '#ffffff'
          c.lineWidth = 1
          c.stroke()
        },
      })
      lightPillar(a.x, a.y, att.def.size * 0.3, H0 + 10, 1, 0.7)
      await wait(500)
      cleanse(att)
      const heal = cursed(att, Math.round(att.hpMax * 0.15))
      att.hp = Math.min(att.hpMax, att.hp + heal)
      sayAt(att, '+' + heal, '#5ad38a', true)
      lightBurst(a.x, a.y - H0 * 0.5, 24, 50)
      await wait(400)
    },
  },
  // พรหลับ (shot, silence 2.5 s): a sleepy glowing lullaby orb drifts over and a little halo settles on the target, which falls quiet
  holy_lull: {
    name: 'พรหลับ',
    icon: '👼',
    async run(att, def) {
      const p = castPose(att, 500, 500, 'holy')
      await p.charged
      p.release()
      const m = mouthOf(att),
        c = centerOf(def)
      await projectileOf(
        att,

        m,
        c,
        760,
        (cx, x, y) => {
          const yy = y - Math.sin(clock * 9) * 3
          cx.globalCompositeOperation = 'lighter'
          cx.fillStyle = 'rgba(255,240,200,.35)'
          cx.beginPath()
          cx.arc(x, yy, 6, 0, 7)
          cx.fill()
          cx.fillStyle = '#ffffff'
          cx.beginPath()
          cx.arc(x, yy, 3, 0, 7)
          cx.fill()
          cx.strokeStyle = '#ffd84a'
          cx.lineWidth = 1
          cx.beginPath()
          cx.ellipse(x, yy - 7, 4, 1.3, 0, 0, 7)
          cx.stroke()
        },
        (x, y) => {
          if (Math.random() < 0.25) ps.add(makeParticle('zz', x, y))
          if (Math.random() < 0.5)
            ps.add({
              x,
              y,
              vx: 0,
              vy: -4,
              life: 0.5,
              size: 1,
              cols: HOLY_COLS,
              glow: true,
              twinkle: true,
            })
        }
      )
      lightBurst(c.x, c.y, 16, 40)
      featherFall(c.x, c.y - 10, 20, 8)
      const top = () => {
        const a = anchor(def)
        return { x: a.x, y: a.y - def.def.img.foot - 4 }
      }
      fxs.push({
        age: 0,
        life: 2.5,
        draw(cx, k) {
          const t = top(),
            drop = Math.min(1, k * 6)
          cx.globalCompositeOperation = 'lighter'
          cx.globalAlpha = 1 - Math.max(0, k - 0.8) / 0.2
          cx.strokeStyle = '#ffd84a'
          cx.lineWidth = 1
          cx.beginPath()
          cx.ellipse(t.x, t.y - 10 * (1 - drop), 6, 1.8, 0, 0, 7)
          cx.stroke()
        },
      })
      for (let i = 0; i < 4; i++)
        wait(i * 450).then(() => {
          const t = centerOf(def)
          ps.add(makeParticle('zz', t.x + 4, t.y - def.def.img.foot * 0.4))
        })
      silenceOn(def, 2.5)
      await damage(def, 45, { from: att })
    },
  },
  // อุ้งเล็บรัศมี (melee, range 62, then a 10% shield for 3 s): a pounce with one wide crescent of light, then a gold shield
  holy_blade: {
    name: 'อุ้งเล็บรัศมี',
    icon: '🛡️',
    async run(att, def) {
      if (!inRange(att, def, 62)) await approach(att, def)
      await meleeStrike(att, def, {
        wind: 280,
        rush: 140,
        hits: 1,
        windFx() {
          if (Math.random() < 0.7) {
            const m = mouthOf(att)
            ps.add({
              x: m.x + (Math.random() - 0.5) * 14,
              y: m.y + 6 + (Math.random() - 0.5) * 8,
              vx: 0,
              vy: -10,
              life: 0.3,
              size: 1,
              cols: HOLY_COLS,
              glow: true,
            })
          }
        },
        onHit(_i, dir) {
          const t = centerOf(def),
            r = def.def.size * 0.34
          fxs.push({
            age: 0,
            life: 0.35,
            draw(c, k) {
              c.globalCompositeOperation = 'lighter'
              c.globalAlpha = 1 - k
              for (const [w, col] of [
                [6, 'rgba(255,216,74,.45)'],
                [3, '#ffe88a'],
                [1, '#ffffff'],
              ] as const) {
                c.strokeStyle = col
                c.lineWidth = w
                c.beginPath()
                const a0 = dir > 0 ? -1.9 : -1.25 + Math.PI,
                  a1 = a0 + dir * 2.2 * ease(Math.min(1, k * 3))
                c.ellipse(t.x - dir * 4, t.y, r, r * 0.9, 0, Math.min(a0, a1), Math.max(a0, a1))
                c.stroke()
              }
            },
          })
          lightBurst(t.x, t.y, 18, 70)
          impactBurst(t.x, t.y, '#ffd84a', 10)
          scene.shake = Math.max(scene.shake, 3)
          scene.hitstop = 0.06
          return damage(def, 95, { from: att, melee: true })
        },
      })
      holyShield(att, 0.1, 3)
      lightBurst(anchor(att).x, centerOf(att).y, 14, 40)
      await wait(250)
    },
  },
  // ศรเขากิเลน (shot, blind 2 s): the horn gathers light and fires one fast arrow of light; a glare bursts over the target's eyes
  holy_arrow: {
    name: 'ศรเขากิเลน',
    icon: '🏹',
    async run(att, def) {
      const p = castPose(att, 420, 450, 'holy')
      await p.charged
      p.release()
      const m = mouthOf(att),
        c = centerOf(def),
        ang = Math.atan2(c.y - m.y, c.x - m.x)
      await tween(170, (k) => {
        const x = lerp(m.x, c.x, k),
          y = lerp(m.y, c.y, k)
        fxs.push({
          age: 0,
          life: 0.1,
          draw(cx, q) {
            cx.globalCompositeOperation = 'lighter'
            cx.globalAlpha = 1 - q
            cx.strokeStyle = '#ffd84a'
            cx.lineWidth = 3
            cx.beginPath()
            cx.moveTo(x - Math.cos(ang) * 22, y - Math.sin(ang) * 22)
            cx.lineTo(x, y)
            cx.stroke()
            cx.strokeStyle = '#ffffff'
            cx.lineWidth = 1
            cx.stroke()
            cx.fillStyle = '#ffffff'
            cx.fillRect(x - 1, y - 1, 3, 3)
          },
        })
      })
      scene.flashScreen = 0.25
      lightBurst(c.x, c.y, 26, 90)
      scene.shake = Math.max(scene.shake, 2.5)
      fxs.push({
        age: 0,
        life: 0.45,
        draw(cx, k) {
          cx.globalCompositeOperation = 'lighter'
          cx.globalAlpha = 1 - k
          cx.strokeStyle = '#fff6c8'
          cx.lineWidth = 1
          for (let i = 0; i < 8; i++) {
            const an = (i * Math.PI) / 4,
              L = 6 + 16 * ease(k) * (i % 2 ? 0.6 : 1)
            cx.beginPath()
            cx.moveTo(c.x + Math.cos(an) * 3, c.y + Math.sin(an) * 3)
            cx.lineTo(c.x + Math.cos(an) * L, c.y + Math.sin(an) * L)
            cx.stroke()
          }
        },
      })
      blindOn(def, 2)
      await damage(def, 90, { from: att })
    },
  },
  // เสียงก้อง (burst r110, silence 1.5 s): it rings its cracked bell; gold sound rings roll out and hush everyone near
  holy_bell: {
    name: 'เสียงก้อง',
    icon: '🔔',
    async run(att, def) {
      for (let i = 0; i < 3 && !inRange(att, def, 110 * SCALE * 0.8); i++) await approach(att, def)
      const p = castPose(att, 500, 600, 'holy')
      await tween(500, (k) => {
        att.ox = Math.sin(k * 40) * 1.5 * k
      })
      await p.charged
      p.release()
      att.ox = 0
      const a = anchor(att),
        R = 110 * SCALE
      sayAt(att, 'ก้อง~', '#ffe88a', true)
      scene.shake = 3
      for (let i = 0; i < 3; i++)
        fxs.push({
          age: -i * 0.16,
          life: 0.8,
          draw(c, k) {
            if (k < 0) return
            c.globalCompositeOperation = 'lighter'
            c.globalAlpha = (1 - k) * 0.9
            c.strokeStyle = i ? '#ffe88a' : '#ffffff'
            c.lineWidth = 2
            c.beginPath()
            c.ellipse(a.x, a.y - 6, R * ease(k), R * 0.42 * ease(k), 0, 0, 7)
            c.stroke()
            for (let s = 0; s < 10; s++) {
              const an = (s / 10) * TAU + k
              c.fillStyle = '#fff6c8'
              c.fillRect(
                a.x + Math.cos(an) * R * ease(k),
                a.y - 6 + Math.sin(an) * R * 0.42 * ease(k),
                2,
                1
              )
            }
          },
        })
      lightBurst(a.x, a.y - att.def.img.foot * 0.6, 16, 40)
      await wait(260)
      if (inRange(att, def, R)) {
        silenceOn(def, 1.5)
        await damage(def, 50, { from: att })
      } else await wait(400)
    },
  },
  // ปีกขาวเจิดจ้า (passive): the first time it drops below 35% HP the six wings flare: 28% shield, cleanse, immune to CC for 2 s
  holy_seraph: {
    name: 'ปีกขาวเจิดจ้า',
    icon: '😇',
    passive: true,
    async run(att, def) {
      att.lastStand = true
      att.lastStandUsed = false
      att.hp = Math.min(att.hp, Math.round(att.hpMax * 0.37))
      tag(att, '😇 ปีกขาวเจิดจ้า (ติดตัว)', 'holy')
      await approach(def, att)
      await lungeHit(def, att)
      await wait(700)
      if (!att.lastStandUsed) {
        await approach(def, att)
        await lungeHit(def, att)
        await wait(700)
      }
    },
  },
  // ตะวันชำระ (zone r100, lands after 1.6 s, blind 2 s): a small sun gathers in the sky over the target, then a pillar of sunlight crashes down
  holy_sun: {
    name: 'ตะวันชำระ',
    icon: '🌞',
    reach: 230,
    async run(att, def) {
      const p = castPose(att, 600, 600, 'holy')
      await p.charged
      p.release()
      const z = zoneAt(att, def),
        R = 100 * SCALE,
        delay = zoneDelay(att, 1600),
        sy = z.y - 86
      fxs.push({
        age: 0,
        life: delay / 1000 + 0.1,
        draw(c, k) {
          const g = Math.min(1, k * 1.6),
            r = 4 + 8 * g
          c.globalCompositeOperation = 'lighter'
          const gr = c.createRadialGradient(z.x, sy, 0, z.x, sy, r * 2.4)
          gr.addColorStop(0, 'rgba(255,255,255,.95)')
          gr.addColorStop(0.4, 'rgba(255,216,74,.7)')
          gr.addColorStop(1, 'rgba(255,160,40,0)')
          c.globalAlpha = 1
          c.fillStyle = gr
          c.beginPath()
          c.arc(z.x, sy, r * 2.4, 0, 7)
          c.fill()
          for (let i = 0; i < 12; i++) {
            const an = clock * 1.5 + (i * TAU) / 12,
              L = r * (i % 2 ? 2 : 2.8)
            c.strokeStyle = '#ffe88a'
            c.lineWidth = 1
            c.globalAlpha = 0.7 * g
            c.beginPath()
            c.moveTo(z.x + Math.cos(an) * r * 1.3, sy + Math.sin(an) * r * 1.3)
            c.lineTo(z.x + Math.cos(an) * L, sy + Math.sin(an) * L)
            c.stroke()
          }
          const pulse = 0.5 + 0.5 * Math.sin(clock * (8 + k * 20))
          c.globalAlpha = 0.15 + 0.2 * pulse
          c.fillStyle = '#ffd84a'
          c.beginPath()
          c.ellipse(z.x, z.y, R * g, R * 0.4 * g, 0, 0, 7)
          c.fill()
          c.globalAlpha = 0.9
          c.strokeStyle = '#fff0a0'
          c.lineWidth = 1
          c.beginPath()
          c.ellipse(z.x, z.y, R, R * 0.4, 0, 0, 7)
          c.stroke()
          if (Math.random() < 0.6) {
            const an = Math.random() * TAU
            ps.add({
              x: z.x + Math.cos(an) * R,
              y: z.y + Math.sin(an) * R * 0.4,
              vx: -Math.cos(an) * 20,
              vy: -30,
              life: 0.6,
              size: 1,
              cols: HOLY_COLS,
              glow: true,
            })
          }
        },
      })
      await tween(delay, (k) => {
        scene.darken = 0.25 * k
        scene.shake = Math.max(scene.shake, k * 1.2)
      })
      scene.darken = 0
      scene.flashScreen = 0.8
      scene.shake = 6
      lightPillar(z.x, z.y, R * 0.55, 110, 0.7)
      lightBurst(z.x, z.y, 50, 120)
      fxs.push({
        age: 0,
        life: 1.4,
        draw(c, k) {
          c.globalCompositeOperation = 'lighter'
          c.globalAlpha = (1 - k) * 0.6
          c.strokeStyle = '#ffd84a'
          c.lineWidth = 2
          c.beginPath()
          c.ellipse(z.x, z.y, R * (0.6 + 0.4 * ease(k)), R * 0.4 * (0.6 + 0.4 * ease(k)), 0, 0, 7)
          c.stroke()
        },
      })
      if (Math.hypot(def.x - z.x, (def.y - z.y) * 2.4) <= R + 6) {
        blindOn(def, 2)
        await damage(def, 140, { from: att })
      } else await wait(500)
    },
  },
  // พิพากษาสวรรค์ (beam 320 x 30, +60% on a target under 35% HP): a ring of light turns over the crown, then a beam of judgement
  holy_judge: {
    name: 'พิพากษาสวรรค์',
    icon: '👑',
    reach: 320 * SCALE,
    async run(att, def) {
      const p = castPose(att, 800, 900, 'holy')
      fxs.push({
        age: 0,
        life: 1.2,
        draw(c, k) {
          const a = anchor(att),
            y = a.y - att.def.img.foot - 12,
            g = Math.min(1, k * 2)
          c.globalCompositeOperation = 'lighter'
          c.globalAlpha = g * (1 - Math.max(0, k - 0.75) / 0.25)
          c.strokeStyle = '#ffd84a'
          c.lineWidth = 1
          c.beginPath()
          c.ellipse(a.x, y, 14 * g, 4 * g, 0, 0, 7)
          c.stroke()
          for (let i = 0; i < 8; i++) {
            const an = clock * 3 + (i * TAU) / 8
            c.fillStyle = i % 2 ? '#ffffff' : '#ffe88a'
            c.fillRect(a.x + Math.cos(an) * 14 * g - 1, y + Math.sin(an) * 4 * g - 1, 3, 2)
          }
        },
      })
      tween(800, (k) => {
        scene.darken = 0.35 * k
      })
      await p.charged
      p.release()
      const L = 320 * SCALE,
        Wd = 30 * SCALE,
        m0 = mouthOf(att),
        t0 = centerOf(def),
        ang = beamAngle(att, Math.atan2(t0.y - m0.y, t0.x - m0.x)),
        low = def.hp < def.hpMax * 0.35
      scene.flashScreen = 0.7
      scene.shake = 6
      fxs.push({
        age: 0,
        life: 0.7,
        draw(c, k) {
          const m = mouthOf(att),
            ex = m.x + Math.cos(ang) * L,
            ey = m.y + Math.sin(ang) * L,
            nx = -Math.sin(ang),
            ny = Math.cos(ang),
            w = (Wd / 2) * (1 - k * 0.5)
          c.globalCompositeOperation = 'lighter'
          for (const [f, col, al] of [
            [1, '#ffd84a', 0.4],
            [0.55, '#fff0b0', 0.7],
            [0.2, '#ffffff', 1],
          ] as const) {
            c.globalAlpha = al * (1 - k)
            c.fillStyle = col
            c.beginPath()
            c.moveTo(m.x + nx * w * f * 0.4, m.y + ny * w * f * 0.4)
            c.lineTo(ex + nx * w * f, ey + ny * w * f)
            c.lineTo(ex - nx * w * f, ey - ny * w * f)
            c.lineTo(m.x - nx * w * f * 0.4, m.y - ny * w * f * 0.4)
            c.fill()
          }
          c.globalAlpha = 1 - k
          for (let i = 0; i < 6; i++) {
            const q = (clock * 2 + i / 6) % 1
            c.fillStyle = '#ffffff'
            c.fillRect(
              m.x + Math.cos(ang) * L * q + nx * (Math.random() - 0.5) * w * 2,
              m.y + Math.sin(ang) * L * q + ny * (Math.random() - 0.5) * w * 2,
              2,
              1
            )
          }
        },
      })
      tween(700, (k) => {
        scene.darken = 0.35 * (1 - k)
      })
      const d = Math.hypot(t0.x - m0.x, t0.y - m0.y)
      if (d <= L + def.def.size * 0.3) {
        lightBurst(t0.x, t0.y, 40, 120)
        if (low) {
          sayAt(def, 'พิพากษา! +60%', '#ffd84a', true)
          lightPillar(def.x, def.y, 14, 100, 0.8)
        }
        await damage(def, low ? 175 : 110, { from: att, crit: low })
      } else await wait(600)
    },
  },
}
