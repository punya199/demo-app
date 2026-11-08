'use strict'
// water line: the game skills and their animations.
/* ---------- Tide skills from the game, each with its own animation ---------- */
const WATER_COLS = ['#ffffff', '#c8eeff', '#7ac8f0', '#3a90d2', '#1b5e9e']
function splash(x, y, n = 30, up = 60) {
  ps.burst(n, () => ({
    x: x + (Math.random() - 0.5) * 12,
    y,
    vx: (Math.random() - 0.5) * 50,
    vy: -up * 0.5 - Math.random() * up,
    g: 150,
    life: 0.7 + Math.random() * 0.4,
    size: Math.random() < 0.35 ? 2 : 1,
    cols: ['#ffffff', '#a0dcff', '#3a90d2'],
  }))
}
function ripple(x, y, R, life = 0.6, col = '#a0dcff') {
  fxs.push({
    age: 0,
    life,
    draw(c, k) {
      const g = ease(k)
      c.globalAlpha = (1 - k) * 0.9
      c.strokeStyle = col
      c.lineWidth = 1
      c.beginPath()
      c.ellipse(x, y, R * g, R * 0.4 * g, 0, 0, 7)
      c.stroke()
      c.globalAlpha = (1 - k) * 0.5
      c.beginPath()
      c.ellipse(x, y, R * 0.7 * g, R * 0.28 * g, 0, 0, 7)
      c.stroke()
    },
  })
}
function zapArc(a, b, life = 0.35) {
  fxs.push({
    age: 0,
    life,
    draw(c, k) {
      const pa = centerOf(a),
        pb = centerOf(b)
      c.globalCompositeOperation = 'lighter'
      c.globalAlpha = 1 - k
      for (const [w, col] of [
        [3, 'rgba(126,231,255,.35)'],
        [1, '#ffffff'],
      ]) {
        c.strokeStyle = col
        c.lineWidth = w
        c.beginPath()
        c.moveTo(pa.x, pa.y)
        for (let i = 1; i < 6; i++) {
          const q = i / 6
          c.lineTo(
            pa.x + (pb.x - pa.x) * q + (Math.random() - 0.5) * 10,
            pa.y + (pb.y - pa.y) * q + (Math.random() - 0.5) * 10
          )
        }
        c.lineTo(pb.x, pb.y)
        c.stroke()
      }
    },
  })
}
const WATER = {
  // ดาบน้ำ (charge): aim the sword snout, then charge straight through the target on a jet of water
  tide_sword: {
    name: 'ดาบน้ำ',
    icon: '🗡️',
    async run(att, def) {
      const vx = def.x - att.x,
        vy = def.y - att.y,
        len = Math.hypot(vx, vy) || 1,
        ux = vx / len,
        uy = vy / len
      const A = (t) => {
        att.anim = { name: 'attack', t }
      }
      await tween(300, (k) => {
        A(0.3 * k)
        att.ox = -ux * 7 * ease(k)
        att.oy = -uy * 5 * ease(k)
        if (Math.random() < 0.5) {
          const m = mouthOf(att)
          ps.add({
            x: m.x,
            y: m.y,
            vx: 0,
            vy: 0,
            life: 0.2,
            size: 1,
            cols: ['#ffffff'],
            glow: true,
          })
        }
      })
      const through = len + 26
      let hit = false
      let p = null
      await tween(230, (k) => {
        A(0.3 + 0.14 * k)
        const d = -7 + (through + 7) * easeIn(k)
        att.ox = ux * d
        att.oy = uy * d * 0.8
        att.ghosts.push({
          x: att.x + att.ox,
          y: att.y + att.oy,
          a: 0.45,
          img: frameOf(att, clock),
          tint: '#7ac8f0',
        })
        const a = anchor(att)
        for (let n = 0; n < 3; n++)
          ps.add({
            x: a.x - ux * 10,
            y: a.y - 10 + (Math.random() - 0.5) * 8,
            vx: -ux * 60,
            vy: -20 - Math.random() * 20,
            g: 100,
            life: 0.5,
            size: 1,
            cols: WATER_COLS,
          })
        if (!hit && d >= len - 8) {
          hit = true
          const c = centerOf(def)
          splash(c.x, c.y + 8, 30, 50)
          ripple(def.x, def.y, 26)
          impactBurst(c.x, c.y, '#a0dcff', 12)
          p = damage(def, 95, { from: att })
        }
      })
      await wait(120)
      att.x += att.ox
      att.y += att.oy * 1.25
      att.ox = att.oy = 0
      const cp = clampPos(att, att.x, att.y)
      att.x = cp.x
      att.y = cp.y
      await tween(260, (k) => A(0.62 + 0.38 * k))
      att.anim = null
      if (p) await p
    },
  },
  // หนวดช็อต (passive): whoever hits the jellyfish up close gets shocked back and may be slowed
  tide_jelly: {
    name: 'หนวดช็อต',
    icon: '🪼',
    passive: true,
    async run(att, def) {
      att.retort = true
      tag(att, '🪼 หนวดช็อต (ติดตัว)', 'water')
      await approach(def, att)
      await lungeHit(def, att)
      await wait(500)
      att.retort = false
    },
  },
  // เขี้ยวคลื่น (melee, finisher): water gathers into a shark's jaw that snaps shut on the target
  tide_fang: {
    name: 'เขี้ยวคลื่น',
    icon: '🦈',
    async run(att, def) {
      await meleeStrike(att, def, {
        wind: 500,
        windFx: () => {
          if (Math.random() < 0.7) {
            const m = mouthOf(att),
              a = Math.random() * 7
            ps.add({
              x: m.x + Math.cos(a) * 14,
              y: m.y + Math.sin(a) * 10,
              vx: -Math.cos(a) * 40,
              vy: -Math.sin(a) * 28,
              life: 0.3,
              size: 1,
              cols: WATER_COLS,
              glow: true,
            })
          }
        },
        onHit(i, dir) {
          const c = centerOf(def),
            R = def.def.size * 0.42
          fxs.push({
            age: 0,
            life: 0.5,
            draw(cx, k) {
              const close = Math.min(1, k * 3.5),
                gap = (1 - ease(close)) * R * 0.8
              cx.globalAlpha = 1 - Math.max(0, k - 0.6) / 0.4
              for (const s of [-1, 1]) {
                const y0 = c.y + s * (gap + 2)
                cx.fillStyle = '#3a90d2'
                cx.beginPath()
                cx.ellipse(
                  c.x,
                  y0 + s * 3,
                  R,
                  4,
                  0,
                  s > 0 ? 0 : Math.PI,
                  s > 0 ? Math.PI : Math.PI * 2
                )
                cx.fill()
                cx.fillStyle = '#c8eeff'
                cx.fillRect(c.x - R, y0 + s * 1 - 0.5, R * 2, 1)
                cx.fillStyle = '#ffffff'
                for (let tx = -R + 3; tx < R - 2; tx += 4) {
                  cx.beginPath()
                  cx.moveTo(tx + c.x - 1.5, y0)
                  cx.lineTo(tx + c.x, y0 - s * 4)
                  cx.lineTo(tx + c.x + 1.5, y0)
                  cx.fill()
                }
              }
            },
          })
          const low = def.hp < def.hpMax * 0.35
          splash(c.x, c.y + 6, 26, 45)
          shake = Math.max(shake, low ? 5 : 3)
          if (low) sayAt(def, 'ปิดฉาก!', '#7ee7ff', true)
          return damage(def, low ? 150 : 110, { from: att, crit: low })
        },
      })
    },
  },
  // คลื่นเกราะ (self): water rises in rings around the user and settles into a shell of water
  tide_armor: {
    name: 'คลื่นเกราะ',
    icon: '🐋',
    async run(att) {
      const p = castPose(att, 300, 600, 'water')
      await p.charged
      p.release()
      const a = anchor(att),
        H0 = att.def.img.foot
      for (let i = 0; i < 3; i++)
        fxs.push({
          age: -i * 0.12,
          life: 0.7,
          draw(c, k) {
            if (k < 0) return
            const y = a.y - H0 * ease(k)
            c.globalAlpha = (1 - k) * 0.9
            c.strokeStyle = '#a0dcff'
            c.lineWidth = 2
            c.beginPath()
            c.ellipse(a.x, y, att.def.size * 0.38, att.def.size * 0.12, 0, 0, 7)
            c.stroke()
          },
        })
      splash(a.x, a.y, 24, 40)
      await wait(380)
      att.bubbleStone = false
      att.bubbleHoly = false
      att.bubbleMax = att.bubbleHp = Math.round(att.hpMax * 0.22)
      att.bubbleT = 5
      att.defUpT = 5
      sayAt(att, 'โล่ +' + att.bubbleHp, '#9ad8ff', true)
      await wait(300)
    },
  },
  // หมึกพ่น (shot): puff up, then spit an ink blob that splats over the target's eyes
  tide_ink: {
    name: 'หมึกพ่น',
    icon: '🐙',
    async run(att, def) {
      const p = castPose(att, 400, 500, 'water')
      await tween(400, (k) => {
        att.sx = 1 + 0.14 * Math.sin((k * Math.PI) / 2)
        att.sy = 1 + 0.1 * Math.sin((k * Math.PI) / 2)
      })
      await p.charged
      p.release()
      att.sx = att.sy = 1
      const m = mouthOf(att),
        c = centerOf(def)
      await projectile(
        m,
        c,
        380,
        (cx, x, y) => {
          cx.fillStyle = '#1a1020'
          cx.beginPath()
          cx.arc(x, y, 4, 0, 7)
          cx.fill()
          cx.fillStyle = '#5a4a6a'
          cx.fillRect(x - 2, y - 2, 2, 1)
        },
        (x, y) => {
          if (Math.random() < 0.7)
            ps.add({
              x,
              y,
              vx: (Math.random() - 0.5) * 10,
              vy: 0,
              g: 80,
              life: 0.5,
              size: 1,
              cols: ['#2a1a30', '#1a1020'],
            })
        }
      )
      const blots = Array.from({ length: 7 }, () => [
        (Math.random() - 0.5) * def.def.size * 0.5,
        (Math.random() - 0.5) * def.def.size * 0.35,
        2 + Math.random() * 3,
      ])
      fxs.push({
        age: 0,
        life: 1.4,
        draw(cx, k) {
          const cc = centerOf(def)
          cx.globalAlpha = 1 - Math.max(0, k - 0.6) / 0.4
          cx.fillStyle = '#140a18'
          for (const [dx, dy, r] of blots) {
            cx.beginPath()
            cx.arc(cc.x + dx, cc.y + dy - 4, r * Math.min(1, k * 6), 0, 7)
            cx.fill()
          }
        },
      })
      ps.burst(16, () => ({
        x: c.x + (Math.random() - 0.5) * 16,
        y: c.y,
        vx: (Math.random() - 0.5) * 30,
        vy: -10 - Math.random() * 20,
        g: 120,
        life: 0.7,
        size: 1,
        cols: ['#2a1a30', '#140a18'],
      }))
      def.blindT = 3.5
      sayAt(def, 'มองไม่เห็น', '#b8adab')
      await damage(def, 65, { from: att })
    },
  },
  // น้ำวนมังกร (zone): a whirlpool opens under the target, then a water spout throws it up
  tide_whirl: {
    name: 'น้ำวนมังกร',
    icon: '🌀',
    reach: 220,
    async run(att, def) {
      const p = castPose(att, 500, 500, 'water')
      await p.charged
      p.release()
      const z = { x: def.x, y: def.y },
        R = 90 * SCALE,
        delay = 700
      fxs.push({
        age: 0,
        life: (delay + 200) / 1000,
        draw(c, k) {
          const g = Math.min(1, k * 1.4)
          c.globalAlpha = 0.35
          c.fillStyle = '#0f3a68'
          c.beginPath()
          c.ellipse(z.x, z.y, R * g, R * 0.4 * g, 0, 0, 7)
          c.fill()
          for (let arm = 0; arm < 4; arm++)
            for (let i = 0; i < 14; i++) {
              const q = i / 14,
                an = clock * 6 + (arm * Math.PI) / 2 + q * 3.2,
                r = R * g * (1 - q * 0.85)
              c.globalAlpha = 0.9 * (1 - q * 0.5)
              c.fillStyle = i % 3 ? '#7ac8f0' : '#ffffff'
              c.fillRect(z.x + Math.cos(an) * r, z.y + Math.sin(an) * r * 0.4, 2, 1)
            }
        },
      })
      await wait(delay)
      shake = 5
      splash(z.x, z.y, 50, 90)
      ripple(z.x, z.y, R, 0.7)
      fxs.push({
        age: 0,
        life: 0.7,
        draw(c, k) {
          const h =
              70 *
              Math.sin((Math.min(1, k * 1.4) * Math.PI) / 2) *
              (1 - Math.max(0, k - 0.6) / 0.4),
            w = 12
          const g = c.createLinearGradient(z.x - w, 0, z.x + w, 0)
          g.addColorStop(0, 'rgba(58,144,210,0)')
          g.addColorStop(0.5, 'rgba(200,238,255,.85)')
          g.addColorStop(1, 'rgba(58,144,210,0)')
          c.fillStyle = g
          c.fillRect(z.x - w, z.y - h, w * 2, h)
        },
      })
      if (Math.hypot(def.x - z.x, (def.y - z.y) * 2.4) <= R + 6) {
        tween(600, (k) => {
          def.oy = -18 * Math.sin(k * Math.PI)
        }).then(() => {
          def.oy = 0
        })
        def.slowT = 3
        sayAt(def, 'ช้าลง', '#7ac8f0')
        await damage(def, 105, { from: att })
      }
    },
  },
  // หอกเขาผลึก (spread x3): the trident horn glows, then three water spears fly out in a fan
  tide_trident: {
    name: 'หอกเขาผลึก',
    icon: '🔱',
    reach: 230,
    async run(att, def) {
      const p = castPose(att, 450, 600, 'water')
      await p.charged
      p.release()
      const m = mouthOf(att),
        base = Math.atan2(centerOf(def).y - m.y, centerOf(def).x - m.x)
      const pending = []
      for (const [i, off] of [
        [0, -0.22],
        [1, 0],
        [2, 0.22],
      ].map((x) => x)) {
        const t = centerOf(def),
          dist = Math.hypot(t.x - m.x, t.y - m.y),
          an = base + off * 0.35
        const end = { x: m.x + Math.cos(an) * dist, y: m.y + Math.sin(an) * dist + (i - 1) * 6 }
        pending.push(
          wait(i * 70)
            .then(() =>
              tween(dist / 0.3, (k) => {
                const x = m.x + (end.x - m.x) * k,
                  y = m.y + (end.y - m.y) * k
                fxs.push({
                  age: 0,
                  life: 0.06,
                  draw(c) {
                    c.globalCompositeOperation = 'lighter'
                    c.strokeStyle = '#c8eeff'
                    c.lineWidth = 2
                    c.beginPath()
                    c.moveTo(x - Math.cos(an) * 12, y - Math.sin(an) * 12)
                    c.lineTo(x, y)
                    c.stroke()
                    c.fillStyle = '#ffffff'
                    c.fillRect(x - 1, y - 1, 3, 3)
                  },
                })
                if (Math.random() < 0.6)
                  ps.add({ x, y, vx: 0, vy: 10, g: 60, life: 0.35, size: 1, cols: WATER_COLS })
              })
            )
            .then(() => {
              splash(end.x, end.y + 4, 14, 40)
              if (Math.random() < 0.5) def.slowT = 1.5
              return damage(def, 30, { from: att })
            })
        )
      }
      await Promise.all(pending)
    },
  },
  // สายน้ำนิรันดร์ (self heal): a double helix of water rises around the user, washes off effects and keeps healing
  tide_eternal: {
    name: 'สายน้ำนิรันดร์',
    icon: '🧜',
    async run(att) {
      const p = castPose(att, 500, 700, 'water')
      const a = anchor(att),
        H0 = att.def.img.foot + 10
      fxs.push({
        age: 0,
        life: 1.3,
        draw(c, k) {
          c.globalCompositeOperation = 'lighter'
          for (const s of [0, Math.PI])
            for (let i = 0; i < 22; i++) {
              const q = i / 22,
                y = a.y - q * H0 * Math.min(1, k * 2),
                an = clock * 7 + s + q * 7
              c.globalAlpha = (1 - Math.max(0, k - 0.7) / 0.3) * (1 - q * 0.4)
              c.fillStyle = i % 4 ? '#7ac8f0' : '#ffffff'
              c.fillRect(a.x + Math.cos(an) * att.def.size * 0.34, y + Math.sin(an) * 3, 2, 2)
            }
          c.globalAlpha = 0.25 * Math.sin(k * Math.PI)
          c.fillStyle = '#c8eeff'
          c.fillRect(a.x - 10, a.y - H0, 20, H0)
        },
      })
      await p.charged
      p.release()
      const had =
        att.status ||
        att.blindT > 0 ||
        att.slowT > 0 ||
        att.defT > 0 ||
        att.rootT > 0 ||
        att.silenceT > 0 ||
        att.poisonT > 0 ||
        att.stunT > 0 ||
        att.staticT > 0
      att.status = null
      att.blindT =
        att.slowT =
        att.defT =
        att.rootT =
        att.silenceT =
        att.poisonT =
        att.stunT =
        att.staticT =
        att.curseT =
        att.atkDownT =
          0
      if (had) sayAt(att, 'ล้างสถานะ', '#c8eeff')
      const heal = cursed(att, Math.round(att.hpMax * 0.18))
      att.hp = Math.min(att.hpMax, att.hp + heal)
      await wait(150)
      sayAt(att, '+' + heal, '#5ad38a', true)
      att.regenT = 4
      att.regenAcc = 0
      await wait(500)
    },
  },
}
