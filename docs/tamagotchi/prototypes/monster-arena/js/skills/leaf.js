'use strict'
// leaf line: the game skills and their animations.
/* ---------- Leaf skills from the game, each with its own animation ----------
   New statuses: root (can't move), silence (no skills), poison (damage every second), lifesteal, and the
   ent passive (regen 1.2%/s + 8% less damage). */
const LEAF_COLS = ['#e0ffd8', '#b0f490', '#5ad35a', '#2e9a3e', '#16601e']
function rootOn(e, sec) {
  if (immune(e)) return
  e.rootT = Math.max(e.rootT || 0, sec * (e.stoneSkin ? 0.6 : 1))
  e.goal = null
  sayAt(e, 'ติดราก', '#c8e07a')
}
function poisonOn(e, sec) {
  if (!(e.poisonT > 0)) e.poisonAcc = 0
  e.poisonT = sec
  sayAt(e, 'ติดพิษ', '#9aff6a')
}
function silenceOn(e, sec) {
  if (immune(e)) return
  e.silenceT = sec
  sayAt(e, 'ใบ้ ใช้สกิลไม่ได้', '#d8c8ff')
}
function leafBurst(x, y, n = 20, sp = 60) {
  ps.burst(n, () => {
    const a = Math.random() * 7,
      v = sp * (0.4 + Math.random() * 0.8)
    return {
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v * 0.6 - 10,
      drag: 3,
      g: 30,
      life: 0.7 + Math.random() * 0.5,
      size: Math.random() < 0.5 ? 2 : 1,
      cols: LEAF_COLS,
      sway: 1,
    }
  })
}
// Roots burst out of the ground in a ring and whip in toward the middle, then sink back.
function rootsUp(x, y, R, life = 0.9, n = 7, tall = 1) {
  const roots = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * TAU + Math.random() * 0.5
    return {
      dx: Math.cos(a) * R,
      dy: Math.sin(a) * R * 0.4,
      h: (14 + Math.random() * 10) * tall,
      bend: (Math.random() - 0.5) * 10,
    }
  })
  roots.sort((a, b) => a.dy - b.dy)
  fxs.push({
    age: 0,
    life,
    draw(c, k) {
      const g = ease(Math.min(1, k * 4)),
        sink = k > 0.72 ? 1 - (k - 0.72) / 0.28 : 1
      for (const r of roots) {
        const x0 = x + r.dx,
          y0 = y + r.dy,
          h = r.h * g * sink
        c.fillStyle = 'rgba(0,0,0,.35)'
        c.fillRect(Math.round(x0 - 3), Math.round(y0), 6, 1)
        for (let i = 0; i <= 8; i++) {
          const q = i / 8,
            px = x0 + Math.sin(q * 2.2) * r.bend * q - r.dx * 0.55 * q * q * g,
            py = y0 - h * q,
            w = Math.max(1, 3.4 * (1 - q) + 0.6)
          c.fillStyle = '#3e2614'
          c.fillRect(Math.round(px - w / 2), Math.round(py - 1), Math.ceil(w), 2)
          c.fillStyle = '#86582e'
          c.fillRect(Math.round(px - w / 2), Math.round(py - 1), 1, 2)
          if (i === 5 || i === 8) {
            c.fillStyle = '#5ad35a'
            c.fillRect(Math.round(px + 1), Math.round(py - 1), 2, 1)
          }
        }
      }
    },
  })
  ps.burst(n * 4, () => ({
    x: x + (Math.random() - 0.5) * R * 2,
    y: y + (Math.random() - 0.5) * R * 0.8,
    vx: (Math.random() - 0.5) * 30,
    vy: -20 - Math.random() * 30,
    g: 120,
    life: 0.6,
    size: Math.random() < 0.5 ? 2 : 1,
    cols: ['#86582e', '#5e3c1e', '#3e2614'],
  }))
}
// A spinning razor leaf, drawn at (x, y) pointing along angle a.
function drawRazorLeaf(c, x, y, a, s = 1) {
  const cs = Math.cos(a),
    sn = Math.sin(a)
  for (let i = -4; i <= 4; i++) {
    const w = Math.round((1 - Math.abs(i) / 5) * 2 * s)
    for (let o = -w; o <= w; o++) {
      c.fillStyle = o === 0 ? '#e0ffd8' : Math.abs(o) === w ? '#16601e' : '#5ad35a'
      c.fillRect(
        Math.round(x + cs * i * s - sn * o * 0.7),
        Math.round(y + sn * i * s + cs * o * 0.7),
        1,
        1
      )
    }
  }
}
const LEAF = {
  // เขาพฤกษา (charge, root 1.2 s): lower the twig antlers, charge in and ram; roots grab the target's feet
  leaf_antler: {
    name: 'เขาพฤกษา',
    icon: '🦌',
    async run(att, def) {
      const vx = def.x - att.x,
        vy = def.y - att.y,
        len = Math.hypot(vx, vy) || 1,
        ux = vx / len,
        uy = vy / len
      const A = (t) => {
        att.anim = { name: 'attack', t }
      }
      await tween(380, (k) => {
        A(0.3 * k)
        att.ox = -ux * 8 * ease(k)
        att.oy = -uy * 5 * ease(k)
        if (Math.random() < 0.6) {
          const m = mouthOf(att)
          ps.add({
            x: m.x - (att.flip ? -1 : 1) * 6 + (Math.random() - 0.5) * 10,
            y: m.y - 10 - Math.random() * 8,
            vx: 0,
            vy: -8,
            life: 0.4,
            size: 1,
            cols: LEAF_COLS,
            glow: true,
          })
        }
      })
      const dist = Math.max(0, len - (att.def.size + def.def.size) * 0.22)
      await tween(220, (k) => {
        A(0.3 + 0.12 * k)
        const d = -8 + (dist + 8) * easeIn(k)
        att.ox = ux * d
        att.oy = uy * d * 0.8
        if (Math.random() < 0.7)
          att.ghosts.push({
            x: att.x + att.ox,
            y: att.y + att.oy,
            a: 0.45,
            img: frameOf(att, clock),
            tint: '#7ad35a',
          })
        const a = anchor(att)
        ps.add({
          x: a.x - ux * 10,
          y: a.y - 8 - Math.random() * 10,
          vx: -ux * 30,
          vy: 4,
          life: 1,
          size: 2,
          cols: LEAF_COLS,
          sway: 1,
        })
      })
      const c = centerOf(def),
        dir = Math.sign(vx) || 1
      impactBurst(c.x - dir * 4, c.y, '#b0f490', 14)
      leafBurst(c.x, c.y, 26, 80)
      shake = Math.max(shake, 4)
      hitstop = 0.06
      tween(220, (k) => {
        def.ox = dir * 9 * Math.sin(k * Math.PI)
      })
      rootsUp(def.x, def.y, 9, 1.5, 6, 0.7)
      rootOn(def, 1.2)
      const p = damage(def, 85, { from: att })
      await tween(140, (k) => A(0.42 + 0.2 * k))
      await tween(320, (k) => {
        A(0.62 + 0.38 * k)
        att.ox = ux * dist * (1 - ease(k))
        att.oy = uy * dist * 0.8 * (1 - ease(k))
      })
      att.ox = att.oy = 0
      att.anim = null
      await p
    },
  },
  // สปอร์หลับ (burst r100, silence 2.5 s + poison 5 s): puff up, then the cap bursts into a dome of drowsy spores
  leaf_spore: {
    name: 'สปอร์หลับ',
    icon: '🍄',
    async run(att, def) {
      // a short-range burst: walk up close first
      if (!inRange(att, def, 100 * SCALE * 0.8)) {
        const side = Math.sign(att.x - def.x) || 1
        await walkTo(att, def.x + side * reachOf(att, def), def.y, 3200)
      }
      const p = castPose(att, 700, 700, 'leaf')
      await tween(700, (k) => {
        att.sx = 1 + 0.16 * Math.sin((k * Math.PI) / 2)
        att.sy = 1 + 0.12 * Math.sin((k * Math.PI) / 2)
        if (Math.random() < 0.5) {
          const a = anchor(att)
          ps.add(makeParticle('spore', a.x, a.y - att.def.img.foot * 0.8))
        }
      })
      await p.charged
      p.release()
      att.sx = att.sy = 1
      const c = anchor(att),
        R = 100 * SCALE
      shake = Math.max(shake, 2.5)
      fxs.push({
        age: 0,
        life: 1.2,
        draw(cx, k) {
          const r = R * ease(Math.min(1, k * 1.6))
          cx.globalAlpha = 0.22 * (1 - k)
          cx.fillStyle = '#b89ad8'
          cx.beginPath()
          cx.ellipse(c.x, c.y - 4, r, r * 0.5, 0, Math.PI, TAU)
          cx.ellipse(c.x, c.y - 4, r, r * 0.42, 0, 0, Math.PI)
          cx.fill()
          cx.globalAlpha = 0.7 * (1 - k)
          cx.strokeStyle = '#d8c8ff'
          cx.lineWidth = 1
          cx.beginPath()
          cx.ellipse(c.x, c.y, r, r * 0.42, 0, 0, 7)
          cx.stroke()
        },
      })
      ps.burst(110, () => {
        const a = Math.random() * 7,
          sp = R * (1.2 + Math.random() * 1.4)
        return {
          x: c.x,
          y: c.y - 8 - Math.random() * 12,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp * 0.42 - 12,
          drag: 2.2,
          life: 1.3 + Math.random() * 0.8,
          size: Math.random() < 0.35 ? 2 : 1,
          cols: ['#f6ecff', '#d8c8ff', '#b89ad8', '#9aff6a'],
          glow: true,
          sway: 1,
          twinkle: Math.random() < 0.3,
        }
      })
      if (inRange(att, def, R)) {
        await wait(300)
        silenceOn(def, 2.5)
        await wait(200)
        poisonOn(def, 5)
        for (let i = 0; i < 6; i++)
          ps.add(makeParticle('zz', centerOf(def).x, centerOf(def).y - 10))
        await damage(def, 35, { from: att })
      } else await wait(600)
    },
  },
  // เขี้ยวไพร (melee 58, cd 3.5 s, poison 5 s): a quick lunge; jaws of thorn close on the target and leave venom
  leaf_fang: {
    name: 'เขี้ยวไพร',
    icon: '🐺',
    async run(att, def) {
      await meleeStrike(att, def, {
        wind: 220,
        rush: 110,
        windFx: () => {
          if (Math.random() < 0.5) {
            const m = mouthOf(att)
            ps.add({
              x: m.x,
              y: m.y,
              vx: 0,
              vy: 10,
              g: 40,
              life: 0.4,
              size: 1,
              cols: ['#c8ff6a', '#5ad35a'],
              glow: true,
            })
          }
        },
        onHit(i, dir) {
          const c = centerOf(def),
            R = def.def.size * 0.3
          fxs.push({
            age: 0,
            life: 0.45,
            draw(cx, k) {
              const close = Math.min(1, k * 4),
                gap = (1 - ease(close)) * R * 0.9
              cx.globalAlpha = 1 - Math.max(0, k - 0.55) / 0.45
              for (const s of [-1, 1]) {
                const y0 = c.y + s * (gap + 1)
                cx.strokeStyle = '#2e6a24'
                cx.lineWidth = 3
                cx.beginPath()
                cx.ellipse(c.x, y0 + s * 2, R, 3, 0, s > 0 ? 0 : Math.PI, s > 0 ? Math.PI : TAU)
                cx.stroke()
                cx.fillStyle = '#e8ffd0'
                for (let tx = -R + 2; tx < R - 1; tx += 3.5) {
                  cx.beginPath()
                  cx.moveTo(c.x + tx - 1.2, y0)
                  cx.lineTo(c.x + tx, y0 - s * 4)
                  cx.lineTo(c.x + tx + 1.2, y0)
                  cx.fill()
                }
              }
            },
          })
          ps.burst(18, () => ({
            x: c.x + (Math.random() - 0.5) * 12,
            y: c.y,
            vx: (Math.random() - 0.5) * 40,
            vy: -10 - Math.random() * 30,
            g: 120,
            life: 0.6,
            size: 1,
            cols: ['#d8ff8a', '#7ad35a', '#2e6a24'],
            glow: true,
          }))
          shake = Math.max(shake, 2.5)
          poisonOn(def, 5)
          return damage(def, 55, { from: att })
        },
      })
    },
  },
  // เขาไพรสามคม (3 hits, lifesteal 30%): three quick antler slashes; each draws green life back to the attacker
  leaf_claw: {
    name: 'เขาไพรสามคม',
    icon: '🐾',
    async run(att, def) {
      const heals = []
      await meleeStrike(att, def, {
        wind: 300,
        hits: 3,
        gap: 160,
        onHit(i, dir) {
          const t = centerOf(def),
            r = def.def.size * 0.28,
            sgn = i % 2 ? -1 : 1
          for (let j = -1; j <= 1; j++)
            slashFx(
              t.x - dir * r + j * 3,
              t.y - sgn * r + j * 4,
              t.x + dir * r + j * 3,
              t.y + sgn * r * 0.7 + j * 4,
              0.3,
              ['rgba(90,211,90,.5)', '#8ae86a', '#f0ffe0']
            )
          impactBurst(t.x, t.y, '#b0f490', 8)
          shake = Math.max(shake, 1.5)
          leafBurst(t.x, t.y, 6, 50)
          const dmg = 28,
            heal = Math.round(dmg * 0.3)
          const motes = Array.from({ length: 5 }, () => ({
            ox: (Math.random() - 0.5) * 10,
            oy: (Math.random() - 0.5) * 10,
            arc: (Math.random() - 0.5) * 30,
          }))
          heals.push(
            tween(480, (k) => {
              const a = centerOf(def),
                b = centerOf(att)
              for (const m of motes)
                ps.add({
                  x: lerp(a.x + m.ox, b.x, ease(k)),
                  y: lerp(a.y + m.oy, b.y, ease(k)) - Math.sin(k * Math.PI) * (12 + m.arc * 0.3),
                  vx: 0,
                  vy: 0,
                  life: 0.12,
                  size: 1,
                  cols: ['#e0ffd8', '#6aff6a'],
                  glow: true,
                })
            }).then(() => {
              att.hp = Math.min(att.hpMax, att.hp + cursed(att, heal))
              sayAt(att, '+' + cursed(att, heal) + ' ดูดเลือด', '#6aff8a')
            })
          )
          return damage(def, dmg, { from: att, crit: i === 2 && Math.random() < 0.3 })
        },
      })
      await Promise.all(heals)
    },
  },
  // รากฟาด (zone r85, lands after 0.6 s, root 2 s): stomp; a crack runs under the ground to the target, then roots burst up around it
  leaf_root: {
    name: 'รากฟาด',
    icon: '🪵',
    reach: 220,
    async run(att, def) {
      const p = castPose(att, 500, 500, 'leaf')
      await p.charged
      p.release()
      shake = Math.max(shake, 3)
      const a0 = anchor(att)
      ps.burst(14, () => ({
        x: a0.x + (Math.random() - 0.5) * 20,
        y: a0.y,
        vx: (Math.random() - 0.5) * 40,
        vy: -20 - Math.random() * 20,
        g: 120,
        life: 0.5,
        size: 1,
        cols: ['#86582e', '#5e3c1e'],
      }))
      const z = { x: def.x, y: def.y },
        R = 85 * SCALE,
        delay = 600
      fxs.push({
        age: 0,
        life: (delay + 500) / 1000,
        draw(c, k) {
          const run = Math.min(1, k * 1.9),
            x1 = lerp(a0.x, z.x, run),
            y1 = lerp(a0.y, z.y, run)
          c.globalAlpha = 1 - Math.max(0, k - 0.8) / 0.2
          c.strokeStyle = '#1a0e06'
          c.lineWidth = 2
          c.beginPath()
          c.moveTo(a0.x, a0.y)
          for (let i = 1; i <= 10; i++) {
            const q = (i / 10) * run
            c.lineTo(
              lerp(a0.x, z.x, q) + Math.sin(i * 2.3) * 3,
              lerp(a0.y, z.y, q) + Math.cos(i * 1.7) * 1.5
            )
          }
          c.stroke()
          if (run < 1 && Math.random() < 0.8)
            ps.add({
              x: x1,
              y: y1,
              vx: (Math.random() - 0.5) * 20,
              vy: -15 - Math.random() * 15,
              g: 100,
              life: 0.4,
              size: 1,
              cols: ['#86582e', '#3e2614'],
            })
          const g = Math.min(1, k * 1.6),
            pulse = 0.5 + 0.5 * Math.sin(clock * 22)
          c.globalAlpha = 0.2 + 0.2 * pulse
          c.fillStyle = '#6a9a2c'
          c.beginPath()
          c.ellipse(z.x, z.y, R * g, R * 0.4 * g, 0, 0, 7)
          c.fill()
          c.globalAlpha = 0.9
          c.strokeStyle = '#b8e07a'
          c.lineWidth = 1
          c.beginPath()
          c.ellipse(z.x, z.y, R, R * 0.4, 0, 0, 7)
          c.stroke()
        },
      })
      await wait(delay)
      shake = 5
      rootsUp(z.x, z.y, R * 0.75, 1.1, 9, 1.2)
      if (Math.hypot(def.x - z.x, (def.y - z.y) * 2.4) <= R + 6) {
        tween(420, (k) => {
          def.oy = -10 * Math.sin(k * Math.PI)
        }).then(() => {
          def.oy = 0
        })
        rootOn(def, 2)
        await damage(def, 95, { from: att })
      } else await wait(500)
    },
  },
  // เถาวัลย์ฟาด (melee 66, long wind-up, power 250): a thick vine rears up from the back, then slams down on the target
  leaf_trunk: {
    name: 'เถาวัลย์ฟาด',
    icon: '🌿',
    async run(att, def) {
      const vine = { h: 0, slam: 0 }
      const root = () => {
        const a = anchor(att),
          d = att.flip ? -1 : 1
        return { x: a.x - d * att.def.size * 0.12, y: a.y - att.def.img.foot * 0.72, d }
      }
      const fx = {
        age: 0,
        life: 99,
        draw(c) {
          if (vine.h <= 0) return
          const r0 = root(),
            up = { x: r0.x - r0.d * 10 * vine.h, y: r0.y - 42 * vine.h },
            tc = centerOf(def),
            tip = { x: lerp(up.x, tc.x, vine.slam), y: lerp(up.y, tc.y - 4, vine.slam) }
          const ctl = {
            x: r0.x - r0.d * 18 * vine.h * (1 - vine.slam) + (tip.x - r0.x) * 0.2,
            y: r0.y - 30 * vine.h,
          }
          for (let i = 0; i <= 24; i++) {
            const q = i / 24,
              x = (1 - q) * (1 - q) * r0.x + 2 * (1 - q) * q * ctl.x + q * q * tip.x,
              y = (1 - q) * (1 - q) * r0.y + 2 * (1 - q) * q * ctl.y + q * q * tip.y,
              w = 5 - q * 2.4
            c.fillStyle = '#16401a'
            c.fillRect(
              Math.round(x - w / 2 - 0.5),
              Math.round(y - w / 2 - 0.5),
              Math.ceil(w + 1),
              Math.ceil(w + 1)
            )
            c.fillStyle = i % 4 < 2 ? '#2e8a2e' : '#3e2614'
            c.fillRect(Math.round(x - w / 2), Math.round(y - w / 2), Math.ceil(w), Math.ceil(w))
            c.fillStyle = '#6ac04a'
            c.fillRect(Math.round(x - w / 2), Math.round(y - w / 2), Math.ceil(w), 1)
            if (i % 6 === 3) {
              c.fillStyle = '#5ad35a'
              c.fillRect(Math.round(x + w / 2), Math.round(y - 2), 3, 2)
            }
          }
          c.fillStyle = '#86582e'
          c.beginPath()
          c.arc(tip.x, tip.y, 4, 0, 7)
          c.fill()
          c.fillStyle = '#b88a5a'
          c.fillRect(Math.round(tip.x - 2), Math.round(tip.y - 3), 2, 1)
        },
      }
      fxs.push(fx)
      await meleeStrike(att, def, {
        wind: 750,
        rush: 180,
        windFx: (k) => {
          vine.h = ease(k)
          if (Math.random() < 0.3) {
            const r0 = root()
            ps.add({
              x: r0.x,
              y: r0.y - 40 * vine.h,
              vx: 0,
              vy: 8,
              life: 0.8,
              size: 2,
              cols: LEAF_COLS,
              sway: 1,
            })
          }
        },
        onHit(i, dir) {
          return tween(130, (k) => {
            vine.slam = easeIn(k)
          }).then(() => {
            const c = centerOf(def)
            shake = 8
            hitstop = 0.1
            flashScreen = 0.25
            impactBurst(c.x, c.y, '#b0f490', 18)
            leafBurst(c.x, c.y, 30, 90)
            ps.burst(30, () => ({
              x: def.x + (Math.random() - 0.5) * 40,
              y: def.y,
              vx: (Math.random() - 0.5) * 60,
              vy: -20 - Math.random() * 30,
              g: 120,
              life: 0.6,
              size: 2,
              cols: ['#8a8098', '#5a5268'],
              alpha: 0.7,
            }))
            fxs.push({
              age: 0,
              life: 0.6,
              draw(cx, k) {
                cx.globalAlpha = 1 - k
                cx.strokeStyle = '#c8e07a'
                cx.lineWidth = 2
                cx.beginPath()
                cx.ellipse(def.x, def.y, 8 + k * 34, 3 + k * 13, 0, 0, 7)
                cx.stroke()
              },
            })
            tween(320, (k) => {
              def.sy = 1 - 0.3 * Math.sin(k * Math.PI)
            }).then(() => {
              def.sy = 1
            })
            wait(120).then(() =>
              tween(260, (k) => {
                vine.h = 1 - ease(k)
              })
            )
            return damage(def, 150, { from: att })
          })
        },
      })
      fx.life = 0
    },
  },
  // พนาพิโรธ (5 shots in a fan, 40% poison each): the antlers glow, leaves gather into a vortex, then five razor leaves fly out
  leaf_wrath: {
    name: 'พนาพิโรธ',
    icon: '🍃',
    reach: 230,
    async run(att, def) {
      const p = castPose(att, 700, 700, 'leaf')
      const vortex = {
        age: 0,
        life: 0.75,
        draw(c, k) {
          const a = anchor(att),
            y0 = a.y - att.def.img.foot * 0.5
          for (let i = 0; i < 26; i++) {
            const an = clock * 8 + i * 0.24,
              r = (28 - i * 0.6) * (1 - k * 0.5)
            drawRazorLeaf(
              c,
              a.x + Math.cos(an) * r,
              y0 + Math.sin(an) * r * 0.4 - i * 0.6,
              an + 1.6,
              0.6
            )
          }
        },
      }
      fxs.push(vortex)
      await p.charged
      p.release()
      const m = mouthOf(att),
        base = Math.atan2(centerOf(def).y - m.y, centerOf(def).x - m.x),
        pending = []
      for (let i = 0; i < 5; i++) {
        const off = (i - 2) * 0.16,
          t = centerOf(def),
          dist = Math.hypot(t.x - m.x, t.y - m.y) + 8,
          an = base + off * 0.5
        const end = { x: m.x + Math.cos(an) * dist, y: m.y + Math.sin(an) * dist + (i - 2) * 4 }
        pending.push(
          wait(i * 60)
            .then(() =>
              tween(dist / 0.32, (k) => {
                const x = m.x + (end.x - m.x) * k,
                  y = m.y + (end.y - m.y) * k - Math.sin(k * Math.PI) * (i - 2) * 6
                fxs.push({
                  age: 0,
                  life: 0.05,
                  draw(c) {
                    drawRazorLeaf(c, x, y, clock * 30 + i, 1.2)
                  },
                })
                if (Math.random() < 0.5)
                  ps.add({ x, y, vx: 0, vy: 6, life: 0.5, size: 1, cols: LEAF_COLS, glow: true })
              })
            )
            .then(() => {
              leafBurst(end.x, end.y, 8, 50)
              if (Math.random() < 0.4) poisonOn(def, 5)
              return damage(def, 22, { from: att })
            })
        )
      }
      await Promise.all(pending)
    },
  },
  // พิทักษ์พนา (passive): regen 1.2% HP a second and take 8% less damage; the demo lets the opponent hit twice
  leaf_ent: {
    name: 'พิทักษ์พนา',
    icon: '🌲',
    passive: true,
    async run(att, def) {
      att.ent = true
      att.hp = Math.min(att.hp, Math.round(att.hpMax * 0.7))
      tag(att, '🌲 พิทักษ์พนา (ติดตัว)', 'leaf')
      const a = anchor(att)
      rootsUp(a.x, a.y, att.def.size * 0.3, 1, 6, 0.6)
      sayAt(att, 'ฟื้น 1.2%/วิ · ดาเมจ -8%', '#9aff8a')
      await wait(500)
      await approach(def, att)
      await lungeHit(def, att)
      await wait(300)
      await lungeHit(def, att)
      await wait(1200)
    },
  },
}
// The bark wolf king's passive: a flash of bark plates when a hit is softened.
function entBark(e) {
  const c = centerOf(e)
  sayAt(e, '-8%', '#c8e07a')
  fxs.push({
    age: 0,
    life: 0.35,
    draw(cx, k) {
      cx.globalAlpha = 1 - k
      cx.strokeStyle = '#b88a5a'
      cx.lineWidth = 2
      cx.beginPath()
      cx.ellipse(c.x, c.y, e.def.size * 0.36, e.def.size * 0.32, 0, -1.2, 1.2)
      cx.stroke()
      cx.strokeStyle = '#5ad35a'
      cx.lineWidth = 1
      cx.beginPath()
      cx.ellipse(c.x, c.y, e.def.size * 0.4, e.def.size * 0.36, 0, -1, 1)
      cx.stroke()
    },
  })
}
