'use strict'
// fire line: the game skills and their animations.
/* ---------- Flame skills from the game (arena-data.ts), each with its own animation ----------
   Game distances are converted to scene pixels with SCALE (melee range 62 -> reach, radius 100 -> 60 px). */
const SCALE = 0.6
let skillTags = [],
  tintA = 0
function tag(e, text, el = 'fire') {
  skillTags = skillTags.filter((t) => t.e !== e)
  skillTags.push({ e, text, el, age: 0, life: 1.6 })
}
function castPose(att, chargeMs, releaseMs = 560, el = 'fire') {
  const cast = (att.anim = { name: 'cast', t: 0 })
  att.charging = el
  att.castEl = el
  const charged = tween(chargeMs, (k) => {
    if (att.anim === cast) cast.t = 0.45 * k
  }).then(() => {
    att.charging = null
  })
  const release = () => {
    att.released = 0.25
    return tween(releaseMs, (k) => {
      if (att.anim === cast) cast.t = 0.45 + 0.55 * k
    }).then(() => {
      if (att.anim === cast) att.anim = null
    })
  }
  return { charged, release }
}
// Dash in and strike: wind-up, rush, one or more hits, return.
async function meleeStrike(att, def, o) {
  const vx = def.x - att.x,
    vy = def.y - att.y,
    len = Math.hypot(vx, vy) || 1,
    ux = vx / len,
    uy = vy / len,
    dir = Math.sign(vx) || 1
  const dist = Math.max(0, len - (att.def.size + def.def.size) * 0.24)
  const put = (a) => {
    att.ox = ux * a
    att.oy = uy * a * 0.8
  }
  const A = (t) => {
    att.anim = { name: 'attack', t }
  }
  await tween(o.wind, (k) => {
    A(0.3 * k)
    put(-6 * ease(k))
    if (o.windFx) o.windFx(k)
  })
  await tween(o.rush || 150, (k) => {
    A(0.3 + 0.12 * k)
    put(-6 + (dist + 6) * easeIn(k))
    const q = Math.sin(k * Math.PI)
    att.sx = 1 + 0.07 * q
    att.sy = 1 - 0.05 * q
  })
  att.sx = att.sy = 1
  const pending = []
  for (let i = 0; i < (o.hits || 1); i++) {
    if (i > 0) {
      await tween(o.gap || 130, (k) => {
        A(0.42 - 0.12 * Math.sin(k * Math.PI))
        put(dist - 4 * Math.sin(k * Math.PI))
      })
    }
    pending.push(o.onHit(i, dir))
  }
  await tween(120, (k) => A(0.42 + 0.2 * k))
  await tween(300, (k) => {
    A(0.62 + 0.38 * k)
    put(dist * (1 - ease(k)))
  })
  att.ox = att.oy = 0
  att.anim = null
  await Promise.all(pending)
}
const inRange = (a, b, r) => Math.hypot(b.x - a.x, (b.y - a.y) * 1.6) <= r + b.def.size * 0.3

function flameArc(cx, cy, rx, ry, a0, a1, life, width) {
  fxs.push({
    age: 0,
    life,
    draw(c, k) {
      const head = a0 + (a1 - a0) * Math.min(1, ease(Math.min(1, k * 1.5)))
      c.globalCompositeOperation = 'lighter'
      for (let i = 0; i < 26; i++) {
        const t = i / 26,
          a = head - (a1 - a0) * 0.55 * t
        c.globalAlpha = (1 - t) * (1 - k * 0.7)
        c.fillStyle = FLAME_COLS[Math.min(4, Math.floor(t * 5))]
        const w = width * (1 - t * 0.7)
        c.fillRect(cx + Math.cos(a) * rx - w / 2, cy + Math.sin(a) * ry - w / 2, w, w)
      }
      if (k < 0.7)
        for (let n = 0; n < 2; n++)
          ps.add(makeParticle('flame', cx + Math.cos(head) * rx, cy + Math.sin(head) * ry))
    },
  })
}
function slashFx(
  x0,
  y0,
  x1,
  y1,
  life = 0.32,
  cols = ['rgba(255,138,36,.55)', '#ffc444', '#fff6c0']
) {
  fxs.push({
    age: 0,
    life,
    draw(c, k) {
      const g = Math.min(1, k * 4),
        x = x0 + (x1 - x0) * g,
        y = y0 + (y1 - y0) * g
      c.globalCompositeOperation = 'lighter'
      c.globalAlpha = 1 - Math.max(0, k - 0.4) / 0.6
      c.lineCap = 'round'
      ;[
        [5, cols[0]],
        [2.5, cols[1]],
        [1, cols[2]],
      ].forEach(([w, col]) => {
        c.strokeStyle = col
        c.lineWidth = w * (1 - k * 0.5)
        c.beginPath()
        c.moveTo(x0, y0)
        c.lineTo(x, y)
        c.stroke()
      })
    },
  })
}
function burnOn(e, sec) {
  if (e.immuneT > 0) return
  e.status = 'burn'
  e.statusT = sec
}
function lavaSplash(x, y, n = 40) {
  ps.burst(n, () => {
    const a = -Math.PI * Math.random(),
      sp = 40 + Math.random() * 70
    return {
      x: x + (Math.random() - 0.5) * 14,
      y,
      vx: Math.cos(a) * sp * 0.8,
      vy: Math.sin(a) * sp,
      g: 160,
      life: 0.7 + Math.random() * 0.4,
      size: Math.random() < 0.4 ? 2 : 1,
      cols: ['#fff3a8', '#ffb43a', '#ff5a14', '#7a2410'],
      glow: true,
    }
  })
}

const FIRE = {
  // หางเพลิง: whip the burning tail in a wide arc; always sets the target on fire
  flame_tail: {
    name: 'หางเพลิง',
    icon: '🔥',
    async run(att, def) {
      await meleeStrike(att, def, {
        wind: 400,
        windFx: (k) => {
          if (Math.random() < 0.6) {
            const c = centerOf(att)
            ps.add(makeParticle('flame', c.x - (att.flip ? -1 : 1) * att.def.size * 0.35, c.y + 4))
          }
        },
        onHit(i, dir) {
          const c = centerOf(att)
          flameArc(
            c.x + dir * 6,
            c.y + 2,
            att.def.size * 0.5,
            att.def.size * 0.22,
            dir > 0 ? -2.5 : Math.PI + 2.5,
            dir > 0 ? 0.9 : Math.PI - 0.9,
            0.5,
            4
          )
          const t = centerOf(def)
          impactBurst(t.x - dir * 4, t.y, '#ff9a2a', 18)
          ps.burst(24, () =>
            makeParticle('flame', t.x + (Math.random() - 0.5) * def.def.size * 0.4, t.y + 6)
          )
          burnOn(def, 3)
          sayAt(def, 'เผาไหม้', '#ff9a2a')
          return damage(def, 75, { from: att })
        },
      })
    },
  },
  // ควันพิษ: crouch and blow out a ring of smoke; blinds and may burn everything nearby
  flame_smoke: {
    name: 'ควันพิษ',
    icon: '💨',
    reach: 100 * SCALE,
    async run(att, def) {
      const p = castPose(att, 600, 700)
      await p.charged
      const c = anchor(att),
        R = 100 * SCALE
      p.release()
      shake = Math.max(shake, 2)
      darken = 0.18
      fxs.push({
        age: 0,
        life: 0.7,
        draw(cx, k) {
          cx.globalAlpha = (1 - k) * 0.7
          cx.strokeStyle = '#9a90a2'
          cx.lineWidth = 3
          cx.beginPath()
          cx.ellipse(c.x, c.y - 4, R * ease(k), R * 0.42 * ease(k), 0, 0, 7)
          cx.stroke()
        },
      })
      ps.burst(70, () => {
        const a = Math.random() * 7,
          sp = R * (1.6 + Math.random() * 1.2)
        return {
          x: c.x,
          y: c.y - 6 - Math.random() * 10,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp * 0.42 - 6,
          drag: 2.6,
          life: 1.2 + Math.random() * 0.7,
          size: 4 + (Math.random() < 0.5 ? 2 : 0),
          cols: ['#a49aa8', '#7e7486', '#5a5262'],
          alpha: 0.8,
        }
      })
      ps.burst(20, () => makeParticle('ember', c.x, c.y - 10, 4))
      tween(700, (k) => {
        darken = 0.18 * (1 - k)
      })
      if (inRange(att, def, R)) {
        await wait(250)
        def.blindT = 3
        sayAt(def, 'มองไม่เห็น', '#b8adab')
        if (Math.random() < 0.6) burnOn(def, 2)
        await damage(def, 40, { from: att })
      } else await wait(500)
    },
  },
  // ฟันเพลิง: a quick dash and one burning slash
  flame_slash: {
    name: 'ฟันเพลิง',
    icon: '🗡️',
    async run(att, def) {
      await meleeStrike(att, def, {
        wind: 220,
        rush: 110,
        onHit(i, dir) {
          const t = centerOf(def),
            r = def.def.size * 0.32
          slashFx(t.x - dir * r, t.y - r, t.x + dir * r, t.y + r * 0.8)
          ps.burst(14, () => ({
            x: t.x,
            y: t.y,
            vx: dir * (30 + Math.random() * 40),
            vy: (Math.random() - 0.5) * 40,
            drag: 4,
            life: 0.35,
            size: 1,
            cols: FLAME_COLS,
            glow: true,
          }))
          return damage(def, 60, { from: att })
        },
      })
    },
  },
  // กรงเล็บอัคคี: three claw swipes, alternating up and down, each leaving three burning marks
  flame_claw: {
    name: 'กรงเล็บอัคคี',
    icon: '🐾',
    async run(att, def) {
      await meleeStrike(att, def, {
        wind: 300,
        hits: 3,
        gap: 150,
        onHit(i, dir) {
          const t = centerOf(def),
            r = def.def.size * 0.26,
            sgn = i % 2 ? -1 : 1
          for (let j = -1; j <= 1; j++)
            slashFx(
              t.x - dir * r + j * 3,
              t.y - sgn * r + j * 4,
              t.x + dir * r + j * 3,
              t.y + sgn * r * 0.7 + j * 4,
              0.3
            )
          impactBurst(t.x, t.y, '#ffc444', 8)
          shake = Math.max(shake, 1.5)
          if (i === 2 && Math.random() < 0.5) burnOn(def, 3)
          return damage(def, 28, { from: att, crit: i === 2 && Math.random() < 0.3 })
        },
      })
    },
  },
  // ลาวาทับ: stomp, a warning circle under the target, then a lava boulder drops on it
  flame_lava: {
    name: 'ลาวาทับ',
    icon: '🌋',
    reach: 200,
    async run(att, def) {
      const p = castPose(att, 500, 500)
      await p.charged
      p.release()
      shake = Math.max(shake, 3)
      lavaSplash(anchor(att).x, anchor(att).y, 10)
      const z = { x: def.x, y: def.y },
        R = 80 * SCALE,
        delay = 800
      fxs.push({
        age: 0,
        life: (delay + 300) / 1000,
        draw(c, k) {
          const g = Math.min(1, k * 1.6),
            pulse = 0.5 + 0.5 * Math.sin(clock * 22)
          c.globalAlpha = 0.25 + 0.25 * pulse
          c.fillStyle = '#ff3b1a'
          c.beginPath()
          c.ellipse(z.x, z.y, R * g, R * 0.4 * g, 0, 0, 7)
          c.fill()
          c.globalAlpha = 0.9
          c.strokeStyle = '#ff7a1a'
          c.lineWidth = 1
          c.beginPath()
          c.ellipse(z.x, z.y, R, R * 0.4, 0, 0, 7)
          c.stroke()
        },
      })
      let rock = null
      fxs.push({
        age: 0,
        life: delay / 1000,
        draw(c, k) {
          if (k < 0.5) return
          const f = (k - 0.5) / 0.5,
            y = cam.y - 20 + (z.y - 10 - cam.y + 20) * easeIn(f)
          c.globalAlpha = 0.35 * f
          c.fillStyle = '#000'
          c.beginPath()
          c.ellipse(z.x, z.y, 6 + 10 * f, 3 + 3 * f, 0, 0, 7)
          c.fill()
          c.globalAlpha = 1
          c.fillStyle = '#4a140a'
          c.beginPath()
          c.arc(z.x, y, 9, 0, 7)
          c.fill()
          c.fillStyle = '#a6371a'
          c.beginPath()
          c.arc(z.x - 2, y - 2, 6, 0, 7)
          c.fill()
          c.globalCompositeOperation = 'lighter'
          c.fillStyle = '#ff8a2a'
          c.fillRect(z.x - 4, y - 1, 6, 1)
          c.fillRect(z.x + 1, y + 3, 4, 1)
          if (Math.random() < 0.8)
            ps.add(makeParticle('flame', z.x + (Math.random() - 0.5) * 10, y - 6))
          rock = y
        },
      })
      await wait(delay)
      void rock
      shake = 6
      flashScreen = 0.35
      lavaSplash(z.x, z.y, 60)
      fxs.push({
        age: 0,
        life: 1.6,
        draw(c, k) {
          c.globalAlpha = 1 - k
          c.fillStyle = '#7a2410'
          c.beginPath()
          c.ellipse(z.x, z.y, R * 0.8, R * 0.32, 0, 0, 7)
          c.fill()
          c.globalCompositeOperation = 'lighter'
          c.fillStyle = '#ff7a1a'
          c.beginPath()
          c.ellipse(z.x, z.y, R * 0.55, R * 0.2, 0, 0, 7)
          c.fill()
          if (Math.random() < 0.4)
            ps.add({
              x: z.x + (Math.random() - 0.5) * R,
              y: z.y + (Math.random() - 0.5) * R * 0.3,
              vx: 0,
              vy: -10,
              life: 0.4,
              size: 1,
              cols: ['#ffd04a', '#ff7a1a'],
              glow: true,
            })
        },
      })
      if (Math.hypot(def.x - z.x, (def.y - z.y) * 2.4) <= R + 6) {
        def.defT = 4
        sayAt(def, 'เกราะลด', '#c8a0ff')
        tween(380, (k) => {
          def.sy = 1 - 0.25 * Math.sin(k * Math.PI)
        }).then(() => {
          def.sy = 1
        })
        await damage(def, 110, { from: att })
      }
    },
  },
  // ลมหายใจมังกร: rear back, then a long cone of fire from the mouth along a line
  flame_breath: {
    name: 'ลมหายใจมังกร',
    icon: '🐲',
    reach: 300 * SCALE,
    async run(att, def) {
      const p = castPose(att, 600, 1000)
      await p.charged
      p.release()
      const L = 300 * SCALE,
        Wd = 34 * SCALE,
        t0 = centerOf(def),
        m0 = mouthOf(att),
        ang = Math.atan2(t0.y - m0.y, t0.x - m0.x)
      let hits = 0
      const done = tween(850, (k) => {
        const m = mouthOf(att),
          reach = L * Math.min(1, k * 4)
        for (let n = 0; n < 9; n++) {
          const sp = 190 + Math.random() * 80,
            spread = (((Math.random() - 0.5) * Wd) / L) * 1.6,
            a = ang + spread
          ps.add({
            x: m.x,
            y: m.y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp,
            life: (Math.min(reach, L) / sp) * (0.6 + Math.random() * 0.4),
            size: Math.random() < 0.5 ? 2 : 1,
            cols: FLAME_COLS,
            glow: true,
          })
        }
        shake = Math.max(shake, 1.2)
        const due = Math.floor(k * 3.2)
        if (due > hits && hits < 3) {
          hits++
          burnOn(def, 3)
          damage(def, 34, { from: att })
        }
      })
      fxs.push({
        age: 0,
        life: 0.85,
        draw(c, k) {
          const m = mouthOf(att),
            reach = L * Math.min(1, k * 4)
          c.globalCompositeOperation = 'lighter'
          c.globalAlpha = 0.55 * (1 - Math.max(0, k - 0.8) * 5)
          const g = c.createLinearGradient(
            m.x,
            m.y,
            m.x + Math.cos(ang) * reach,
            m.y + Math.sin(ang) * reach
          )
          g.addColorStop(0, 'rgba(255,246,192,.9)')
          g.addColorStop(0.4, 'rgba(255,154,42,.6)')
          g.addColorStop(1, 'rgba(255,90,20,0)')
          c.fillStyle = g
          c.beginPath()
          c.moveTo(m.x, m.y - 2)
          const nx = -Math.sin(ang),
            ny = Math.cos(ang),
            ex = m.x + Math.cos(ang) * reach,
            ey = m.y + Math.sin(ang) * reach
          c.lineTo(ex + (nx * Wd) / 2, ey + (ny * Wd) / 2)
          c.lineTo(ex - (nx * Wd) / 2, ey - (ny * Wd) / 2)
          c.lineTo(m.x, m.y + 2)
          c.fill()
        },
      })
      await done
      await wait(250)
    },
  },
  // สุริยะแผดเผา: rise, gather a small sun overhead, then a solar blast that sweeps the area
  flame_sun: {
    name: 'สุริยะแผดเผา',
    icon: '☀️',
    reach: 125 * SCALE,
    async run(att, def) {
      const p = castPose(att, 1000, 700)
      const sun = { r: 0 }
      tween(1000, (k) => {
        att.oy = -8 * ease(k)
        sun.r = 3 + 12 * ease(k)
        tintA = 0.9 * k
      })
      fxs.push({
        age: 0,
        life: 1.05,
        draw(c, k) {
          const a = anchor(att),
            x = a.x,
            y = a.y - att.def.img.foot - 14
          c.globalCompositeOperation = 'lighter'
          for (let i = 0; i < 12; i++) {
            const an = clock * 2 + (i * Math.PI) / 6,
              r0 = sun.r + 2,
              r1 = sun.r + 5 + (i % 2) * 4
            c.strokeStyle = '#ffc444'
            c.lineWidth = 1
            c.beginPath()
            c.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0)
            c.lineTo(x + Math.cos(an) * r1, y + Math.sin(an) * r1)
            c.stroke()
          }
          c.fillStyle = '#ff9a2a'
          c.beginPath()
          c.arc(x, y, sun.r, 0, 7)
          c.fill()
          c.fillStyle = '#fff6c0'
          c.beginPath()
          c.arc(x, y, sun.r * 0.6, 0, 7)
          c.fill()
          const ang = Math.random() * 7
          ps.add({
            x: x + Math.cos(ang) * 40,
            y: y + Math.sin(ang) * 24,
            vx: -Math.cos(ang) * 90,
            vy: -Math.sin(ang) * 55,
            life: 0.42,
            size: 1,
            cols: FLAME_COLS,
            glow: true,
          })
        },
      })
      await p.charged
      p.release()
      const c0 = anchor(att),
        R = 125 * SCALE
      flashScreen = 0.9
      shake = 8
      fxs.push({
        age: 0,
        life: 0.7,
        draw(c, k) {
          const r = R * ease(k)
          c.globalCompositeOperation = 'lighter'
          c.globalAlpha = 1 - k
          c.strokeStyle = '#fff3a8'
          c.lineWidth = 3
          c.beginPath()
          c.ellipse(c0.x, c0.y, r, r * 0.42, 0, 0, 7)
          c.stroke()
          c.strokeStyle = '#ff8a24'
          c.lineWidth = 6
          c.globalAlpha = (1 - k) * 0.5
          c.beginPath()
          c.ellipse(c0.x, c0.y, r * 0.9, r * 0.38, 0, 0, 7)
          c.stroke()
          for (let i = 0; i < 16; i++) {
            const an = (i * Math.PI) / 8
            c.globalAlpha = (1 - k) * 0.8
            c.fillStyle = '#ffd04a'
            c.fillRect(
              c0.x + Math.cos(an) * r,
              c0.y + Math.sin(an) * r * 0.42 - 10 * (1 - k),
              2,
              10 * (1 - k)
            )
          }
        },
      })
      fxs.push({
        age: 0,
        life: 2.6,
        draw(c, k) {
          c.globalAlpha = 0.45 * (1 - k)
          c.fillStyle = '#1a0a06'
          c.beginPath()
          c.ellipse(c0.x, c0.y, R * 0.75, R * 0.3, 0, 0, 7)
          c.fill()
        },
      })
      ps.burst(150, () => {
        const a = Math.random() * 7,
          sp = 60 + Math.random() * 120
        return {
          x: c0.x,
          y: c0.y - 4,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp * 0.42 - 10,
          drag: 2.2,
          life: 0.6 + Math.random() * 0.5,
          size: Math.random() < 0.4 ? 2 : 1,
          cols: FLAME_COLS,
          glow: true,
        }
      })
      tween(600, (k) => {
        att.oy = -8 * (1 - ease(k))
        tintA = 0.9 * (1 - k)
      }).then(() => {
        att.oy = 0
      })
      if (inRange(att, def, R)) {
        burnOn(def, 4)
        await damage(def, 140, { from: att, crit: true })
      } else await wait(600)
    },
  },
  // ปีกอัคนี (passive): the first time HP would run out, burst into flame, spread wings of fire and come back with 30% HP
  flame_phoenix: {
    name: 'ปีกอัคนี',
    icon: '🦅',
    passive: true,
    async run(att, def) {
      att.rebirth = true
      att.rebirthUsed = false
      att.hp = Math.min(att.hp, 20)
      sayAt(att, 'HP ใกล้หมด', '#ff8a6a')
      await wait(500)
      await lungeHit(def, att)
    },
  },
}
async function rebirth(e) {
  e.rebirthUsed = true
  e.hp = 0
  tag(e, '🦅 ปีกอัคนี')
  await tween(380, (k) => {
    e.sy = 1 - 0.4 * k
    e.alpha = 1 - 0.6 * k
  })
  const a = anchor(e)
  flashScreen = 0.5
  shake = 4
  fxs.push({
    age: 0,
    life: 1.4,
    draw(c, k) {
      c.globalCompositeOperation = 'lighter'
      c.globalAlpha = Math.sin(k * Math.PI)
      const g = c.createLinearGradient(a.x - 12, 0, a.x + 12, 0)
      g.addColorStop(0, 'rgba(255,90,20,0)')
      g.addColorStop(0.5, 'rgba(255,220,120,.9)')
      g.addColorStop(1, 'rgba(255,90,20,0)')
      c.fillStyle = g
      c.fillRect(a.x - 12, a.y - 70, 24, 70)
      for (const side of [-1, 1])
        for (let i = 0; i < 7; i++) {
          const an = -Math.PI / 2 + side * (0.25 + i * 0.2),
            len = (18 + i * 4) * ease(Math.min(1, k * 1.8)),
            bx0 = a.x + side * 4,
            by0 = a.y - e.def.img.foot * 0.5
          c.strokeStyle = FLAME_COLS[Math.min(4, i % 5)]
          c.lineWidth = 3
          c.beginPath()
          c.moveTo(bx0, by0)
          c.lineTo(bx0 + Math.cos(an) * len, by0 + Math.sin(an) * len * 0.8)
          c.stroke()
        }
    },
  })
  ps.burst(70, () => ({
    x: a.x + (Math.random() - 0.5) * 20,
    y: a.y - Math.random() * 10,
    vx: (Math.random() - 0.5) * 20,
    vy: -40 - Math.random() * 60,
    life: 0.8 + Math.random() * 0.4,
    size: Math.random() < 0.4 ? 2 : 1,
    cols: FLAME_COLS,
    glow: true,
  }))
  await wait(450)
  await tween(600, (k) => {
    e.sy = 0.6 + 0.4 * ease(k)
    e.alpha = 0.4 + 0.6 * k
    e.oy = -12 * Math.sin(k * Math.PI)
  })
  e.sx = e.sy = 1
  e.alpha = 1
  e.oy = 0
  e.status = null
  e.hp = Math.round(e.hpMax * 0.3)
  sayAt(e, 'คืนชีพ +' + e.hp, '#5ad38a', true)
}
