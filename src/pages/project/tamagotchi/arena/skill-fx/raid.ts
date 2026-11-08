import type { ISkillFx, IEnt } from './runtime'
import {
  TAU,
  anchor,
  castPose,
  centerOf,
  clock,
  damage,
  ease,
  fxs,
  impactBurst,
  inRange,
  makeParticle,
  meleeStrike,
  mouthOf,
  ps,
  sayAt,
  scene,
  tween,
  wait,
} from './runtime'
import { SCALE, burnOn, lavaSplash, slashFx } from './fire'
import { WATER_COLS, splash } from './water'
import { mistBlind, shadowBurst, shdFly } from './shadow'
import { BOLT_COLS, boltLine, staticOn, zapBurst } from './bolt'
import { stunOn } from './earth'
import { darkBurst, defDownOn } from './dark'

// The raid skills' animations, ported from the prototype (docs/tamagotchi/prototypes/
// monster-arena/js/skills/raid.js). Only the drawing is kept: the replay decides moves and damage.

// raid bosses: each raid boss's two arena skills (`arenaSkills` in backend raid-data.ts), used by the boss on
// our monster. Ids are prefixed raid_ here; `game` is the skill id in arena-data.ts and `boss` the sprite that
// uses it. The knight shares e_mistbite with the shark in the game, so it gets its own animation (and a
// proposed name of its own) here.
export const LAVA_COLS = ['#fff3a8', '#ffd04a', '#ff9a2a', '#ff5a14', '#7a2410']
// Bosses walk slowly, so a burst skill first closes in with a heavy hop until the target is inside its radius.
// (The server already walked the boss into range; the prototype hopped it closer here.)
export async function closeIn(...args: unknown[]) {
  void args
}
export function bloodOn(e: IEnt) {
  sayAt(e, 'เสียเลือด', '#ff5a6a')
}
// A small bat (black wings, red eyes) at x, y; flap is -1..1.
export function drawBat(c: CanvasRenderingContext2D, x: number, y: number, flap: number, s = 1) {
  c.globalCompositeOperation = 'source-over'
  const w = 5 * s,
    up = flap * 3 * s
  // a dim red rim first, so the bat reads on a dark floor
  c.fillStyle = 'rgba(255,58,74,.28)'
  c.beginPath()
  c.ellipse(x, y + 0.5 * s, w + 1, 2 * s + 1, 0, 0, 7)
  c.fill()
  c.fillStyle = '#16080e'
  c.beginPath()
  c.moveTo(x, y)
  c.lineTo(x - w, y - up)
  c.lineTo(x - w * 0.6, y + 1 * s)
  c.lineTo(x - w * 0.3, y + 0.5 * s)
  c.lineTo(x, y + 2 * s)
  c.lineTo(x + w * 0.3, y + 0.5 * s)
  c.lineTo(x + w * 0.6, y + 1 * s)
  c.lineTo(x + w, y - up)
  c.closePath()
  c.fill()
  c.fillStyle = '#ff3a3a'
  c.fillRect(Math.round(x - 1), Math.round(y), 1, 1)
  c.fillRect(Math.round(x + 1), Math.round(y), 1, 1)
}
// An electric peacock feather flying along: a gold quill with a sky eye and sparks.
export function drawPlume(c: CanvasRenderingContext2D, x: number, y: number, ang: number) {
  const dx = Math.cos(ang),
    dy = Math.sin(ang)
  c.globalCompositeOperation = 'lighter'
  c.strokeStyle = 'rgba(255,225,74,.45)'
  c.lineWidth = 4
  c.beginPath()
  c.moveTo(x - dx * 9, y - dy * 9)
  c.lineTo(x, y)
  c.stroke()
  c.strokeStyle = '#fff6c0'
  c.lineWidth = 1
  c.beginPath()
  c.moveTo(x - dx * 10, y - dy * 10)
  c.lineTo(x, y)
  c.stroke()
  c.fillStyle = '#ffd84a'
  c.beginPath()
  c.ellipse(x, y, 3, 2.2, ang, 0, 7)
  c.fill()
  c.fillStyle = '#4aa8ff'
  c.fillRect(Math.round(x - 1), Math.round(y - 1), 2, 2)
}
// Fog rolling out from a point (the shark's and the knight's mist).
export function mistRoll(
  x: number,
  y: number,
  R: number,
  n = 50,
  cols = ['#c8d4e0', '#9aa8b8', '#6e7a8a']
) {
  ps.burst(n, () => {
    const a = Math.random() * TAU,
      sp = R * (0.8 + Math.random())
    return {
      x,
      y: y - Math.random() * 10,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp * 0.4 - 4,
      drag: 2.2,
      life: 1.2 + Math.random() * 0.8,
      size: 4 + (Math.random() < 0.5 ? 2 : 0),
      cols,
      alpha: 0.55,
    }
  })
}
export const RAID: Record<string, ISkillFx> = {
  // รัดหลอมละลาย (ราชันย์ลาวา): lunge in and wrap the target in three molten rings that tighten; burns and slows
  raid_lavacoil: {
    name: 'รัดหลอมละลาย',
    icon: '🐍',
    el: 'fire',
    boss: 'lavaking',
    game: 'e_lavacoil',
    async run(att, def) {
      await meleeStrike(att, def, {
        wind: 520,
        rush: 170,
        windFx: () => {
          if (Math.random() < 0.7) {
            const m = mouthOf(att)
            ps.add(makeParticle('ember', m.x, m.y))
          }
        },
        onHit() {
          const t = centerOf(def),
            r = def.def.size * 0.34
          scene.shake = Math.max(scene.shake, 3)
          lavaSplash(t.x, t.y + 6, 22)
          fxs.push({
            age: 0,
            life: 1.5,
            draw(c, k) {
              const p = centerOf(def),
                tight = ease(Math.min(1, k * 2.2))
              c.globalCompositeOperation = 'lighter'
              c.globalAlpha = 1 - Math.max(0, k - 0.7) / 0.3
              for (let j = 0; j < 3; j++) {
                const rr = r * (1.5 - 0.55 * tight) * (1 - 0.12 * j),
                  yy = p.y - 7 + j * 7,
                  a0 = clock * 4 + j * 2
                c.strokeStyle = 'rgba(122,36,16,.9)'
                c.lineWidth = 4
                c.beginPath()
                c.ellipse(p.x, yy, rr, rr * 0.36, 0, a0, a0 + 5.4)
                c.stroke()
                c.strokeStyle = LAVA_COLS[1 + j]
                c.lineWidth = 2
                c.beginPath()
                c.ellipse(p.x, yy, rr, rr * 0.36, 0, a0, a0 + 5.4)
                c.stroke()
              }
              if (Math.random() < 0.5)
                ps.add(makeParticle('flame', p.x + (Math.random() - 0.5) * r * 2, p.y + 4))
            },
          })
          tween(800, (k) => {
            const q = Math.sin(k * Math.PI)
            def.sx = 1 - 0.14 * q
            def.sy = 1 + 0.06 * q
          }).then(() => {
            def.sx = def.sy = 1
          })
          burnOn(def, 3)
          def.slowT = Math.max(def.slowT || 0, 1.5)
          sayAt(def, 'ช้าลง', '#ffb070')
          return damage(def, 100, { from: att })
        },
      })
      await wait(300)
    },
  },
  // ลมหายใจภูเขาไฟ (ราชันย์ลาวา): the chest core swells, then a straight molten beam with flying rock; burns
  raid_volcano: {
    name: 'ลมหายใจภูเขาไฟ',
    icon: '🌋',
    el: 'fire',
    boss: 'lavaking',
    game: 'e_volcano',
    reach: 320 * SCALE,
    async run(att, def) {
      const p = castPose(att, 1100, 1100)
      const core = { r: 0 }
      tween(1100, (k) => {
        core.r = 2 + 9 * ease(k)
        scene.tintA = 0.6 * k
      })
      fxs.push({
        age: 0,
        life: 1.1,
        draw(c) {
          const m = mouthOf(att)
          c.globalCompositeOperation = 'lighter'
          c.fillStyle = '#ff5a14'
          c.beginPath()
          c.arc(m.x, m.y, core.r, 0, 7)
          c.fill()
          c.fillStyle = '#fff3a8'
          c.beginPath()
          c.arc(m.x, m.y, core.r * 0.5, 0, 7)
          c.fill()
          const a = Math.random() * TAU
          ps.add({
            x: m.x + Math.cos(a) * 30,
            y: m.y + Math.sin(a) * 20,
            vx: -Math.cos(a) * 70,
            vy: -Math.sin(a) * 47,
            life: 0.42,
            size: 1,
            cols: LAVA_COLS,
            glow: true,
          })
        },
      })
      await p.charged
      p.release()
      const L = 320 * SCALE,
        Wd = 34 * SCALE * 0.7,
        m0 = mouthOf(att),
        t0 = centerOf(def),
        ang = Math.atan2(t0.y - m0.y, t0.x - m0.x),
        hitIt = Math.hypot(t0.x - m0.x, t0.y - m0.y) <= L
      scene.shake = 5
      scene.flashScreen = 0.3
      let hits = 0
      const done = tween(1000, (k) => {
        const m = mouthOf(att),
          reach = L * Math.min(1, k * 5)
        for (let n = 0; n < 4; n++) {
          const d = Math.random() * reach
          ps.add({
            x: m.x + Math.cos(ang) * d,
            y: m.y + Math.sin(ang) * d,
            vx: (Math.random() - 0.5) * 30,
            vy: -20 - Math.random() * 40,
            g: 120,
            life: 0.5,
            size: Math.random() < 0.3 ? 2 : 1,
            cols: Math.random() < 0.3 ? ['#5a2a1a', '#3a1a10'] : LAVA_COLS,
            glow: Math.random() < 0.7,
          })
        }
        scene.shake = Math.max(scene.shake, 2)
        scene.tintA = 0.6 * (1 - k)
        const due = Math.floor(k * 3.4)
        if (hitIt && due > hits && hits < 3) {
          hits++
          burnOn(def, 4)
          damage(def, 66, { from: att })
        }
      })
      fxs.push({
        age: 0,
        life: 1.0,
        draw(c, k) {
          const m = mouthOf(att),
            reach = L * Math.min(1, k * 5),
            nx = -Math.sin(ang),
            ny = Math.cos(ang),
            ex = m.x + Math.cos(ang) * reach,
            ey = m.y + Math.sin(ang) * reach,
            fade = 1 - Math.max(0, k - 0.8) * 5
          for (const [w, col, op] of [
            [Wd * 1.3, '#7a2410', 'source-over'],
            [Wd, '#ff5a14', 'lighter'],
            [Wd * 0.55, '#ffb43a', 'lighter'],
            [Wd * 0.22, '#fff3a8', 'lighter'],
          ] as const) {
            const j = (Math.random() - 0.5) * 1.5
            c.globalCompositeOperation = op
            c.globalAlpha = fade * (op === 'lighter' ? 0.85 : 0.7)
            c.fillStyle = col
            c.beginPath()
            c.moveTo(m.x + (nx * w) / 3, m.y + (ny * w) / 3)
            c.lineTo(ex + nx * (w / 2 + j), ey + ny * (w / 2 + j))
            c.lineTo(ex - nx * (w / 2 + j), ey - ny * (w / 2 + j))
            c.lineTo(m.x - (nx * w) / 3, m.y - (ny * w) / 3)
            c.fill()
          }
        },
      })
      // a scorched line stays on the floor along the beam
      const g0 = anchor(att)
      fxs.push({
        age: 0,
        life: 2.4,
        draw(c, k) {
          c.globalAlpha = 0.4 * (1 - k)
          c.strokeStyle = '#1a0a06'
          c.lineWidth = 6
          c.beginPath()
          c.moveTo(g0.x + Math.cos(ang) * 20, g0.y)
          c.lineTo(g0.x + Math.cos(ang) * L, g0.y + Math.sin(ang) * L * 0.5)
          c.stroke()
        },
      })
      await done
      att.ox = att.oy = 0
      await wait(250)
    },
  },
  // วังน้ำวน (อสูรห้วงลึก): a ring warns under the target, then a whirlpool spins up around it; slows
  raid_whirlpool: {
    name: 'วังน้ำวน',
    icon: '🌀',
    el: 'water',
    boss: 'abyssfish',
    game: 'e_whirlpool',
    reach: 260,
    async run(att, def) {
      const p = castPose(att, 600, 600, 'water')
      await p.charged
      p.release()
      const z = { x: def.x, y: def.y },
        R = 90 * SCALE
      splash(mouthOf(att).x, mouthOf(att).y, 16, 40)
      fxs.push({
        age: 0,
        life: 0.8,
        draw(c, k) {
          const pulse = 0.5 + 0.5 * Math.sin(clock * 20)
          c.globalAlpha = 0.2 + 0.25 * pulse
          c.fillStyle = '#3a90d2'
          c.beginPath()
          c.ellipse(z.x, z.y, R * Math.min(1, k * 2), R * 0.4 * Math.min(1, k * 2), 0, 0, 7)
          c.fill()
          c.globalAlpha = 0.9
          c.strokeStyle = '#a0dcff'
          c.lineWidth = 1
          c.beginPath()
          c.ellipse(z.x, z.y, R, R * 0.4, 0, 0, 7)
          c.stroke()
        },
      })
      await wait(800)
      scene.shake = Math.max(scene.shake, 3)
      fxs.push({
        age: 0,
        life: 1.8,
        draw(c, k) {
          const grow = ease(Math.min(1, k * 3)),
            fade = 1 - Math.max(0, k - 0.7) / 0.3
          c.globalCompositeOperation = 'lighter'
          for (let ring = 0; ring < 5; ring++) {
            const rr = R * grow * (1 - ring * 0.17),
              yy = z.y - ring * 6 * grow,
              a0 = clock * (5 + ring) + ring
            c.globalAlpha = fade * (0.9 - ring * 0.12)
            c.strokeStyle = WATER_COLS[1 + (ring % 3)]
            c.lineWidth = ring === 0 ? 2 : 1
            c.beginPath()
            c.ellipse(z.x, yy, rr, rr * 0.38, 0, a0, a0 + 4.2)
            c.stroke()
          }
          if (k < 0.75) {
            const a = clock * 6 + Math.random() * TAU,
              r = R * (0.3 + Math.random() * 0.7)
            ps.add({
              x: z.x + Math.cos(a) * r,
              y: z.y + Math.sin(a) * r * 0.38,
              vx: -Math.sin(a) * 60,
              vy: Math.cos(a) * 20 - 30,
              life: 0.5,
              size: 1,
              cols: WATER_COLS,
            })
          }
        },
      })
      if (Math.hypot(def.x - z.x, (def.y - z.y) * 2.4) <= R + 6) {
        await tween(700, (k) => {
          const a = k * TAU * 1.5
          def.ox = Math.cos(a) * 5 * (1 - k)
          def.oy = Math.sin(a) * 2 * (1 - k)
        })
        def.ox = def.oy = 0
        def.slowT = Math.max(def.slowT || 0, 3)
        sayAt(def, 'ช้าลง', '#7ac8f0')
        await damage(def, 160, { from: att })
      } else await wait(800)
    },
  },
  // ขย้ำในหมอก (อสูรห้วงลึก): fog rolls out, the shark lunges out of it and its jaws snap shut; blinds
  raid_mistbite: {
    name: 'ขย้ำในหมอก',
    icon: '🦷',
    el: 'water',
    boss: 'abyssfish',
    game: 'e_mistbite',
    async run(att, def) {
      const a0 = anchor(att)
      mistRoll(a0.x, a0.y - 6, 70, 60)
      scene.darken = 0.2
      await tween(350, (k) => {
        att.alpha = 1 - 0.55 * k
      })
      await meleeStrike(att, def, {
        wind: 250,
        rush: 120,
        onHit() {
          att.alpha = 1
          const t = centerOf(def),
            r = def.def.size * 0.4
          fxs.push({
            age: 0,
            life: 0.45,
            draw(c, k) {
              const shut = ease(Math.min(1, k * 3)),
                gap = r * (1 - shut)
              c.globalAlpha = 1 - Math.max(0, k - 0.6) / 0.4
              c.fillStyle = '#f4f8fc'
              for (const side of [-1, 1])
                for (let n = 0; n < 6; n++) {
                  const x = t.x - r + (n * 2 * r) / 5,
                    y = t.y + side * (gap + 2)
                  c.beginPath()
                  c.moveTo(x - 2.5, y)
                  c.lineTo(x + 2.5, y)
                  c.lineTo(x, y - side * 5)
                  c.fill()
                }
            },
          })
          scene.shake = Math.max(scene.shake, 4)
          splash(t.x, t.y, 20, 40)
          mistRoll(t.x, t.y, 30, 20)
          mistBlind(def, 2)
          return damage(def, 200, { from: att })
        },
      })
      att.alpha = 1
      tween(600, (k) => {
        scene.darken = 0.2 * (1 - k)
      })
    },
  },
  // รำแพนสายฟ้า (เซราฟรัศมี): the tail fans out and charges, then a ring of lightning bursts from it; stuns
  raid_fan: {
    name: 'รำแพนสายฟ้า',
    icon: '⚡',
    el: 'bolt',
    boss: 'raidseraph',
    game: 'e_fan',
    async run(att, def) {
      await closeIn(att, def, 130 * SCALE)
      const p = castPose(att, 1300, 700, 'bolt')
      fxs.push({
        age: 0,
        life: 1.3,
        draw(c, k) {
          const a = centerOf(att),
            open = ease(k),
            back = att.flip ? 1 : -1
          c.globalCompositeOperation = 'lighter'
          for (let i = 0; i < 9; i++) {
            const an = Math.PI / 2 + back * (0.4 + i * 0.28) * open - Math.PI,
              len = 26 + 10 * open,
              ex = a.x + Math.cos(an) * len,
              ey = a.y - 6 + Math.sin(an) * len * 0.9
            c.globalAlpha = 0.35 + 0.5 * open
            for (const [lw, col] of [
              [4, 'rgba(255,225,74,.35)'],
              [2, '#ffe14a'],
              [1, '#ffffff'],
            ] as const) {
              c.strokeStyle = col
              c.lineWidth = lw
              c.beginPath()
              c.moveTo(a.x, a.y - 6)
              c.lineTo(ex, ey)
              c.stroke()
            }
            c.fillStyle = Math.random() < 0.5 ? '#ffffff' : '#9cc4ff'
            c.fillRect(Math.round(ex - 1), Math.round(ey - 1), 3, 3)
          }
          if (Math.random() < 0.6) zapBurst(a.x + (Math.random() - 0.5) * 40, a.y - 10, 2, 30)
        },
      })
      await p.charged
      p.release()
      const c0 = anchor(att),
        R = 130 * SCALE
      scene.flashScreen = 0.7
      scene.shake = 6
      fxs.push({
        age: 0,
        life: 0.6,
        draw(c, k) {
          const r = R * ease(k)
          c.globalAlpha = 1 - k
          c.globalCompositeOperation = 'lighter'
          c.strokeStyle = '#fffac0'
          c.lineWidth = 2
          c.beginPath()
          c.ellipse(c0.x, c0.y, r, r * 0.42, 0, 0, 7)
          c.stroke()
          for (let i = 0; i < 10; i++) {
            const an = (i * TAU) / 10 + 0.2
            boltLine(
              c,
              c0.x,
              c0.y - 10,
              c0.x + Math.cos(an) * r,
              c0.y + Math.sin(an) * r * 0.42,
              7,
              undefined,
              5
            )
          }
        },
      })
      zapBurst(c0.x, c0.y - 10, 40, 120)
      if (inRange(att, def, R)) {
        stunOn(def, 0.8)
        await damage(def, 200, { from: att })
      } else await wait(600)
    },
  },
  // ขนไฟฟ้าสาด (เซราฟรัศมี): five charged feathers flung in a fan; each that lands hits, may leave static
  raid_plumes: {
    name: 'ขนไฟฟ้าสาด',
    icon: '🦚',
    el: 'bolt',
    boss: 'raidseraph',
    game: 'e_plumes',
    reach: 200,
    async run(att, def) {
      const p = castPose(att, 650, 600, 'bolt')
      await p.charged
      p.release()
      const a = centerOf(att),
        t = centerOf(def),
        base = Math.atan2(t.y - a.y, t.x - a.x),
        dist = Math.hypot(t.x - a.x, t.y - a.y),
        flights = []
      for (let i = 0; i < 5; i++) {
        const off = (i - 2) * 0.09,
          to = { x: a.x + Math.cos(base + off) * dist, y: a.y + Math.sin(base + off) * dist },
          ang = base + off
        flights.push(
          wait(i * 70)
            .then(() =>
              shdFly(
                { x: a.x, y: a.y - 6 },
                to,
                360,
                6,
                (c: CanvasRenderingContext2D, x: number, y: number) => drawPlume(c, x, y, ang),
                (x: number, y: number) => {
                  if (Math.random() < 0.6)
                    ps.add({
                      x,
                      y,
                      vx: 0,
                      vy: 0,
                      life: 0.2,
                      size: 1,
                      cols: BOLT_COLS,
                      glow: true,
                    })
                }
              )
            )
            .then(() => {
              zapBurst(to.x, to.y, 8, 50)
              if (Math.abs(i - 2) <= 1 || Math.random() < 0.5) {
                if (Math.random() < 0.4) staticOn(def, 2.5)
                return damage(def, 60, { from: att })
              }
            })
        )
      }
      await Promise.all(flights)
      await wait(200)
    },
  },
  // ฝูงค้างคาวโลหิต (จ้าวมืดมิด, game e_dragontail): the cape flares and a swarm of bats bursts out round him; lowers defence
  raid_batswarm: {
    name: 'ฝูงค้างคาวโลหิต',
    icon: '🦇',
    el: 'dark',
    boss: 'vampire',
    game: 'e_dragontail',
    async run(att, def) {
      await closeIn(att, def, 110 * SCALE)
      const p = castPose(att, 900, 800, 'dark')
      scene.darken = 0
      tween(900, (k) => {
        att.sx = 1 + 0.12 * ease(k)
        scene.darken = 0.32 * k
      })
      await p.charged
      p.release()
      tween(400, (k) => {
        att.sx = 1.12 - 0.12 * k
      }).then(() => {
        att.sx = 1
      })
      const c0 = centerOf(att),
        R = 110 * SCALE,
        bats = Array.from({ length: 22 }, (_, i) => ({
          a: (i / 22) * TAU,
          r: 0.4 + Math.random() * 0.6,
          ph: Math.random() * TAU,
          sp: 0.8 + Math.random() * 0.5,
        }))
      scene.shake = 4
      fxs.push({
        age: 0,
        life: 1.4,
        draw(c, k) {
          for (const b of bats) {
            const out = ease(Math.min(1, k * 1.6 * b.sp)),
              an = b.a + k * 2.2,
              x = c0.x + Math.cos(an) * R * b.r * out,
              y = c0.y + Math.sin(an) * R * b.r * out * 0.45 - 8 * out
            c.globalAlpha = 1 - Math.max(0, k - 0.75) / 0.25
            drawBat(c, x, y, Math.sin(clock * 30 + b.ph), 1.5)
          }
        },
      })
      darkBurst(c0.x, c0.y, 24, 80)
      tween(1200, (k) => {
        scene.darken = 0.32 * (1 - k)
      })
      if (inRange(att, def, R)) {
        await wait(300)
        defDownOn(def, 4)
        await damage(def, 180, { from: att })
      } else await wait(800)
    },
  },
  // เขี้ยวดูดเลือด (จ้าวมืดมิด, game e_orebite): he dissolves into bats, reappears at the target and bites; blood flows back to him; lowers defence
  raid_vampbite: {
    name: 'เขี้ยวดูดเลือด',
    icon: '🩸',
    el: 'dark',
    boss: 'vampire',
    game: 'e_orebite',
    async run(att, def) {
      const a0 = centerOf(att)
      darkBurst(a0.x, a0.y, 16, 50)
      for (let i = 0; i < 6; i++) {
        const b = { x: a0.x, y: a0.y, ph: Math.random() * TAU, vx: (Math.random() - 0.5) * 60 }
        fxs.push({
          age: 0,
          life: 0.6,
          draw(c, k) {
            drawBat(c, b.x + b.vx * k, b.y - 30 * k, Math.sin(clock * 30 + b.ph), 1.3)
          },
        })
      }
      await tween(260, (k) => {
        att.alpha = 1 - 0.85 * k
      })
      await meleeStrike(att, def, {
        wind: 280,
        rush: 90,
        onHit() {
          att.alpha = 1
          const t = centerOf(def)
          for (const dx of [-2, 2])
            fxs.push({
              age: 0,
              life: 0.6,
              draw(c, k) {
                c.globalAlpha = 1 - k
                c.fillStyle = '#ff2a3a'
                c.fillRect(Math.round(t.x + dx), Math.round(t.y - 6), 1, 3 + Math.round(k * 4))
              },
            })
          scene.shake = Math.max(scene.shake, 2.5)
          impactBurst(t.x, t.y - 4, '#ff3a4a', 10)
          // blood drawn back to the vampire
          ps.burst(26, () => {
            const s = centerOf(att)
            return {
              x: t.x + (Math.random() - 0.5) * 8,
              y: t.y - 4 + (Math.random() - 0.5) * 8,
              vx: (s.x - t.x) * (1.2 + Math.random() * 0.6),
              vy: (s.y - t.y) * 1.2 - 20,
              life: 0.55,
              size: Math.random() < 0.4 ? 2 : 1,
              cols: ['#ff6a7a', '#e8203a', '#8a0a1a'],
              glow: true,
            }
          })
          bloodOn(def)
          defDownOn(def, 3)
          return damage(def, 150, { from: att })
        },
      })
      att.alpha = 1
    },
  },
  // เหวี่ยงตุ้มโซ่ (ราชันย์เงานิรนาม, game e_sparktail หางสปาร์ก): four swings of the spiked flail, sparks on each hit; may leave static
  raid_flail: {
    name: 'เหวี่ยงตุ้มโซ่',
    icon: '⛓️',
    el: 'shadow',
    boss: 'nameless',
    game: 'e_sparktail',
    async run(att, def) {
      await meleeStrike(att, def, {
        wind: 380,
        hits: 4,
        gap: 170,
        onHit(i, dir) {
          const a = centerOf(att),
            t = centerOf(def),
            up = i % 2 ? 1 : -1
          fxs.push({
            age: 0,
            life: 0.28,
            draw(c, k) {
              const g = ease(Math.min(1, k * 2.2)),
                an = (up < 0 ? -1.6 : 1.6) * (1 - g),
                hx = a.x + dir * 10,
                hy = a.y,
                bx = t.x + Math.sin(an) * 10 * -dir,
                by = t.y - Math.cos(an) * 14 * up * (1 - g)
              c.globalAlpha = 1 - Math.max(0, k - 0.6) / 0.4
              c.strokeStyle = '#8a8aa8'
              c.lineWidth = 1
              c.setLineDash([2, 1])
              c.beginPath()
              c.moveTo(hx, hy)
              c.quadraticCurveTo((hx + bx) / 2, (hy + by) / 2 + 6, bx, by)
              c.stroke()
              c.setLineDash([])
              c.fillStyle = '#1e1a26'
              c.beginPath()
              c.arc(bx, by, 4, 0, 7)
              c.fill()
              c.globalCompositeOperation = 'lighter'
              c.fillStyle = '#c47aff'
              c.fillRect(Math.round(bx - 1), Math.round(by - 1), 2, 2)
            },
          })
          impactBurst(t.x, t.y, '#c47aff', 10)
          zapBurst(t.x, t.y, 6, 40)
          scene.shake = Math.max(scene.shake, 2.5)
          if (i === 3 && Math.random() < 0.3) staticOn(def, 2)
          return damage(def, 45, { from: att, crit: i === 3 && Math.random() < 0.25 })
        },
      })
    },
  },
  // ฟันจากหมอก (ราชันย์เงานิรนาม, game e_mistbite ขย้ำในหมอก): sinks into violet fog, appears beside the target and cuts across; blinds
  raid_mistcut: {
    name: 'ฟันจากหมอก',
    icon: '🌫️',
    el: 'shadow',
    boss: 'nameless',
    game: 'e_mistbite',
    async run(att, def) {
      const a0 = anchor(att),
        fog = ['#b8a8d8', '#8a7aa8', '#5a4a7a']
      mistRoll(a0.x, a0.y - 4, 50, 50, fog)
      scene.darken = 0.25
      await tween(400, (k) => {
        att.alpha = 1 - 0.95 * k
      })
      const side = def.x > att.x ? -1 : 1,
        home = { x: att.x, y: att.y }
      att.x = def.x + side * (def.def.size * 0.3 + 20)
      att.y = def.y
      att.flip = side > 0
      mistRoll(att.x, att.y - 4, 30, 30, fog)
      await tween(220, (k) => {
        att.alpha = 0.05 + 0.95 * k
      })
      const t = centerOf(def),
        r = def.def.size * 0.42
      att.anim = { name: 'attack', t: 0.42 }
      slashFx(t.x - side * r, t.y - r, t.x + side * r, t.y + r * 0.6, 0.4, [
        'rgba(160,74,255,.55)',
        '#c47aff',
        '#ffffff',
      ])
      shadowBurst(t.x, t.y, 20, 70)
      scene.shake = Math.max(scene.shake, 4)
      mistBlind(def, 2)
      await damage(def, 200, { from: att })
      await wait(250)
      att.anim = null
      await tween(300, (k) => {
        att.alpha = 1 - k
      })
      att.x = home.x
      att.y = home.y
      att.flip = att.side === 1
      await tween(250, (k) => {
        att.alpha = k
      })
      att.alpha = 1
      tween(500, (k) => {
        scene.darken = 0.25 * (1 - k)
      })
    },
  },
}
export const RAID_OF: Record<string, string[]> = {}
for (const [id, s] of Object.entries(RAID))
  if (s.boss) (RAID_OF[s.boss] = RAID_OF[s.boss] || []).push(id)
