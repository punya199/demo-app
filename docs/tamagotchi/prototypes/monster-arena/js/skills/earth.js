'use strict'
// earth line: the game skills and their animations.
/* ---------- Earth skills from the game, each with its own animation ----------
   New statuses: stun (stars over the head, no moving), a stone shield, attack up, and the boulder's
   stone skin (12% less damage, crowd control 40% shorter, 15% slower). */
const EARTH_COLS = ['#fff0cc', '#e2c492', '#c4a06a', '#9a7a4a', '#5a4630']
function stunOn(e, sec) {
  if (immune(e)) return
  e.stunT = Math.max(e.stunT || 0, sec * (e.stoneSkin ? 0.6 : 1))
  e.goal = null
  sayAt(e, 'มึน', '#ffe14a')
}
function rockBurst(x, y, n = 24, sp = 70) {
  ps.burst(n, () => {
    const a = -Math.PI * Math.random(),
      v = sp * (0.4 + Math.random() * 0.8)
    return {
      x: x + (Math.random() - 0.5) * 12,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      g: 180,
      life: 0.6 + Math.random() * 0.4,
      size: Math.random() < 0.45 ? 2 : 1,
      cols: ['#c8bca6', '#968a78', '#6e6456', '#4a4238'],
    }
  })
  ps.burst(Math.round(n / 2), () => makeParticle('dust', x + (Math.random() - 0.5) * 20, y))
}
// Cracks that run out across the floor from a point, with a ring of dust.
function crackRing(x, y, R, life = 1.2, n = 9) {
  const arms = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * TAU + Math.random() * 0.4,
      pts = [[0, 0]]
    let px = 0,
      py = 0
    for (let k = 1; k <= 6; k++) {
      px += (Math.cos(a) * R) / 6 + (Math.random() - 0.5) * 4
      py += (Math.sin(a) * R * 0.4) / 6 + (Math.random() - 0.5) * 2
      pts.push([px, py])
    }
    return pts
  })
  fxs.push({
    age: 0,
    life,
    draw(c, k) {
      const g = Math.min(1, k * 3)
      c.globalAlpha = 1 - Math.max(0, k - 0.6) / 0.4
      for (const pts of arms) {
        const m = Math.max(1, Math.round(g * (pts.length - 1)))
        c.strokeStyle = '#1a120a'
        c.lineWidth = 2
        c.beginPath()
        c.moveTo(x, y)
        for (let i = 1; i <= m; i++) c.lineTo(x + pts[i][0], y + pts[i][1])
        c.stroke()
        c.strokeStyle = 'rgba(255,190,90,.45)'
        c.lineWidth = 1
        c.stroke()
      }
    },
  })
}
// Rock spikes that punch up out of the ground and sink again.
function spikesUp(pts, life = 0.9, h = 16, col = ['#4a4238', '#968a78', '#c8bca6']) {
  fxs.push({
    age: 0,
    life,
    draw(c, k) {
      const g = ease(Math.min(1, k * 5)) * (k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1)
      for (const [x, y, s] of pts) {
        const hh = h * s * g,
          w = 3.5 * s
        c.fillStyle = col[0]
        c.beginPath()
        c.moveTo(x - w, y)
        c.lineTo(x - 0.5, y - hh)
        c.lineTo(x + w, y)
        c.fill()
        c.fillStyle = col[1]
        c.beginPath()
        c.moveTo(x - w * 0.6, y)
        c.lineTo(x - 0.5, y - hh)
        c.lineTo(x, y)
        c.fill()
        c.fillStyle = col[2]
        c.fillRect(Math.round(x - 1), Math.round(y - hh), 1, Math.max(1, Math.round(hh * 0.3)))
      }
    },
  })
}
const EARTH = {
  // กระดองศิลา (self, shield 25% for 5 s): stone plates rise from the ground and lock into a shell of rock
  earth_shell: {
    name: 'กระดองศิลา',
    icon: '🐢',
    async run(att) {
      const p = castPose(att, 350, 600, 'earth')
      await p.charged
      p.release()
      const a = anchor(att),
        H0 = att.def.img.foot,
        rocks = Array.from({ length: 10 }, (_, i) => ({
          an: (i / 10) * TAU,
          r: 30 + Math.random() * 10,
          s: 2 + Math.random() * 2,
        }))
      shake = Math.max(shake, 2)
      rockBurst(a.x, a.y, 14, 40)
      fxs.push({
        age: 0,
        life: 0.6,
        draw(c, k) {
          const g = ease(k),
            cc = centerOf(att)
          for (const r of rocks) {
            const an = r.an + k * 3,
              rr = lerp(r.r, att.def.size * 0.4, g),
              x = cc.x + Math.cos(an) * rr,
              y = lerp(a.y, cc.y, g) + Math.sin(an) * rr * 0.45
            c.fillStyle = '#6e6456'
            c.fillRect(
              Math.round(x - r.s),
              Math.round(y - r.s),
              Math.round(r.s * 2),
              Math.round(r.s * 1.6)
            )
            c.fillStyle = '#c8bca6'
            c.fillRect(Math.round(x - r.s), Math.round(y - r.s), Math.round(r.s), 1)
          }
        },
      })
      await wait(600)
      void H0
      att.bubbleStone = true
      att.bubbleHoly = false
      att.bubbleMax = att.bubbleHp = Math.round(att.hpMax * 0.25)
      att.bubbleT = 5
      sayAt(att, 'โล่หิน +' + att.bubbleHp, '#e2c492', true)
      await wait(300)
    },
  },
  // เลื้อยทับ (melee 60, slow 2.5 s): the worm rears up and flops its whole body down on the target
  earth_crawl: {
    name: 'เลื้อยทับ',
    icon: '🪱',
    async run(att, def) {
      await meleeStrike(att, def, {
        wind: 380,
        windFx: (k) => {
          att.sy = 1 + 0.18 * k
          att.sx = 1 - 0.08 * k
        },
        onHit(i, dir) {
          att.sy = 0.8
          att.sx = 1.15
          tween(220, (k) => {
            att.sy = 0.8 + 0.2 * k
            att.sx = 1.15 - 0.15 * k
          })
          const c = centerOf(def)
          shake = Math.max(shake, 3.5)
          rockBurst(def.x, def.y, 20, 60)
          tween(300, (k) => {
            def.sy = 1 - 0.25 * Math.sin(k * Math.PI)
          }).then(() => {
            def.sy = 1
          })
          def.slowT = 2.5
          sayAt(def, 'ช้าลง', '#c4a06a')
          impactBurst(c.x, c.y, '#e2c492', 10)
          return damage(def, 60, { from: att })
        },
      })
    },
  },
  // งาผา (charge, stun 0.8 s): lower the stone horn and charge; the hit throws rock shards and leaves the target dizzy
  earth_horn: {
    name: 'งาผา',
    icon: '🦏',
    async run(att, def) {
      const vx = def.x - att.x,
        vy = def.y - att.y,
        len = Math.hypot(vx, vy) || 1,
        ux = vx / len,
        uy = vy / len,
        dir = Math.sign(vx) || 1
      const A = (t) => {
        att.anim = { name: 'attack', t }
      }
      await tween(420, (k) => {
        A(0.3 * k)
        att.ox = -ux * 8 * ease(k)
        att.oy = -uy * 5 * ease(k)
        if (Math.random() < 0.5)
          ps.add(makeParticle('dust', anchor(att).x - ux * 10, anchor(att).y))
      })
      const dist = Math.max(0, len - (att.def.size + def.def.size) * 0.22)
      await tween(230, (k) => {
        A(0.3 + 0.12 * k)
        const d = -8 + (dist + 8) * easeIn(k)
        att.ox = ux * d
        att.oy = uy * d * 0.8
        const a = anchor(att)
        for (let n = 0; n < 2; n++) ps.add(makeParticle('dust', a.x - ux * 12, a.y))
        if (Math.random() < 0.6)
          att.ghosts.push({
            x: att.x + att.ox,
            y: att.y + att.oy,
            a: 0.4,
            img: frameOf(att, clock),
            tint: '#c4a06a',
          })
      })
      const c = centerOf(def)
      impactBurst(c.x - dir * 4, c.y, '#e2c492', 16)
      rockBurst(c.x, c.y + 8, 22, 80)
      shake = Math.max(shake, 5)
      hitstop = 0.08
      tween(240, (k) => {
        def.ox = dir * 12 * Math.sin(k * Math.PI)
      })
      stunOn(def, 0.8)
      const p = damage(def, 95, { from: att })
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
  // กระทืบผา (melee 64, long wind-up, stun 1 s): rear up on the hind legs, then stamp down; stone pillars burst round the target
  earth_paw: {
    name: 'กระทืบผา',
    icon: '🐾',
    async run(att, def) {
      await meleeStrike(att, def, {
        wind: 700,
        rush: 170,
        windFx: (k) => {
          att.sy = 1 + 0.14 * ease(k)
          att.sx = 1 - 0.05 * k
          if (Math.random() < 0.3)
            ps.add(makeParticle('grit', anchor(att).x, anchor(att).y - att.def.img.foot * 0.6))
        },
        onHit(i, dir) {
          att.sy = 0.86
          att.sx = 1.08
          tween(200, (k) => {
            att.sy = 0.86 + 0.14 * k
            att.sx = 1.08 - 0.08 * k
          })
          shake = 7
          hitstop = 0.1
          flashScreen = 0.2
          crackRing(def.x, def.y, 34)
          rockBurst(def.x, def.y, 34, 90)
          spikesUp(
            Array.from({ length: 6 }, (_, k) => {
              const a = (k / 6) * TAU + 0.3
              return [def.x + Math.cos(a) * 18, def.y + Math.sin(a) * 7, 0.8 + Math.random() * 0.5]
            }),
            1,
            15
          )
          tween(300, (k) => {
            def.sy = 1 - 0.3 * Math.sin(k * Math.PI)
          }).then(() => {
            def.sy = 1
          })
          stunOn(def, 1)
          return damage(def, 130, { from: att })
        },
      })
    },
  },
  // ทับกด (passive): stone skin; takes 12% less damage, crowd control wears off 40% sooner, walks 15% slower
  earth_boulder: {
    name: 'ทับกด',
    icon: '🗿',
    passive: true,
    async run(att, def) {
      att.stoneSkin = true
      tag(att, '🗿 ทับกด (ติดตัว)', 'earth')
      sayAt(att, 'ดาเมจ -12% · ติดสถานะสั้นลง', '#e2c492')
      await wait(500)
      await approach(def, att)
      await lungeHit(def, att)
      await wait(300)
      await lungeHit(def, att)
      await wait(600)
    },
  },
  // หนามแร่ (4 shots in a fan, 30% armour down each): ore spines bristle up from the armour and fire at the target
  earth_quill: {
    name: 'หนามแร่',
    icon: '🦔',
    reach: 230,
    async run(att, def) {
      const p = castPose(att, 500, 600, 'earth')
      fxs.push({
        age: 0,
        life: 0.5,
        draw(c, k) {
          const cc = centerOf(att),
            top = cc.y - att.def.img.foot * 0.3
          for (let i = 0; i < 6; i++) {
            const x = cc.x + (i - 2.5) * 5,
              h = 8 * ease(Math.min(1, k * 2))
            c.fillStyle = '#566070'
            c.beginPath()
            c.moveTo(x - 1.5, top)
            c.lineTo(x, top - h)
            c.lineTo(x + 1.5, top)
            c.fill()
            c.fillStyle = '#d0daea'
            c.fillRect(x, top - h, 1, 2)
          }
        },
      })
      await p.charged
      p.release()
      const m = centerOf(att),
        base = Math.atan2(centerOf(def).y - m.y, centerOf(def).x - m.x),
        pending = []
      for (let i = 0; i < 4; i++) {
        const t = centerOf(def),
          dist = Math.hypot(t.x - m.x, t.y - m.y) + 6,
          an = base + (i - 1.5) * 0.07
        const end = { x: m.x + Math.cos(an) * dist, y: m.y + Math.sin(an) * dist + (i - 1.5) * 5 },
          start = { x: m.x, y: m.y - att.def.img.foot * 0.3 }
        pending.push(
          wait(i * 80)
            .then(() =>
              tween(dist / 0.34, (k) => {
                const x = lerp(start.x, end.x, k),
                  y = lerp(start.y, end.y, k) - Math.sin(k * Math.PI) * 10
                fxs.push({
                  age: 0,
                  life: 0.05,
                  draw(c) {
                    c.strokeStyle = '#566070'
                    c.lineWidth = 2
                    c.beginPath()
                    c.moveTo(x - Math.cos(an) * 7, y - Math.sin(an) * 7)
                    c.lineTo(x, y)
                    c.stroke()
                    c.fillStyle = '#d0daea'
                    c.fillRect(x - 1, y - 1, 2, 2)
                    c.fillStyle = '#c46a34'
                    c.fillRect(x - Math.cos(an) * 4, y - Math.sin(an) * 4, 1, 1)
                  },
                })
              })
            )
            .then(() => {
              impactBurst(end.x, end.y, '#d0daea', 6)
              if (Math.random() < 0.3) {
                def.defT = 3
                sayAt(def, 'เกราะลด', '#c8a0ff')
              }
              return damage(def, 25, { from: att })
            })
        )
      }
      await Promise.all(pending)
    },
  },
  // ธรณีสั่น (burst r130, very long wind-up, stun 0.8 s): rear up as the ground darkens, then slam; cracks and rock spikes ring outward
  earth_quake: {
    name: 'ธรณีสั่น',
    icon: '🏔️',
    async run(att, def) {
      // a burst round the user: walk up close first (heavy forms walk slowly)
      if (!inRange(att, def, 130 * SCALE * 0.7)) {
        const side = Math.sign(att.x - def.x) || 1
        await walkTo(att, def.x + side * reachOf(att, def), def.y, 3600)
      }
      const p = castPose(att, 1000, 800, 'earth')
      tween(1000, (k) => {
        att.sy = 1 + 0.12 * ease(k)
        darken = 0.3 * k
        shake = Math.max(shake, 1.5 * k)
        if (Math.random() < 0.5)
          ps.add(
            makeParticle('grit', anchor(att).x + (Math.random() - 0.5) * 120, anchor(att).y - 60)
          )
      })
      await p.charged
      p.release()
      att.sy = 0.85
      tween(260, (k) => {
        att.sy = 0.85 + 0.15 * k
      })
      const c0 = anchor(att),
        R = 130 * SCALE
      shake = 10
      hitstop = 0.12
      flashScreen = 0.3
      crackRing(c0.x, c0.y, R * 0.9, 1.6, 12)
      rockBurst(c0.x, c0.y, 40, 110)
      fxs.push({
        age: 0,
        life: 0.8,
        draw(c, k) {
          const r = R * ease(k)
          c.globalAlpha = 1 - k
          c.strokeStyle = '#e2c492'
          c.lineWidth = 3
          c.beginPath()
          c.ellipse(c0.x, c0.y, r, r * 0.4, 0, 0, 7)
          c.stroke()
          c.globalAlpha = (1 - k) * 0.5
          c.fillStyle = '#9a7a4a'
          c.beginPath()
          c.ellipse(c0.x, c0.y, r, r * 0.4, 0, 0, 7)
          c.fill()
        },
      })
      for (let ring = 1; ring <= 3; ring++)
        wait(ring * 120).then(() =>
          spikesUp(
            Array.from({ length: 8 + ring * 3 }, (_, k) => {
              const a = (k / (8 + ring * 3)) * TAU
              return [
                c0.x + (Math.cos(a) * R * ring) / 3,
                c0.y + ((Math.sin(a) * R * ring) / 3) * 0.4,
                0.7 + ring * 0.2,
              ]
            }),
            0.9,
            14
          )
        )
      tween(600, (k) => {
        darken = 0.3 * (1 - k)
      })
      if (inRange(att, def, R)) {
        tween(400, (k) => {
          def.oy = -12 * Math.sin(k * Math.PI)
        }).then(() => {
          def.oy = 0
        })
        stunOn(def, 0.8)
        await damage(def, 140, { from: att, crit: true })
      } else await wait(700)
    },
  },
  // ผลึกพิโรธ (self, armour up and attack up for 6 s): topaz crystals burst up around the user and its body glows
  earth_crystal: {
    name: 'ผลึกพิโรธ',
    icon: '💠',
    async run(att) {
      const p = castPose(att, 600, 700, 'earth')
      await p.charged
      p.release()
      const a = anchor(att)
      shake = Math.max(shake, 3)
      flashScreen = 0.25
      spikesUp(
        Array.from({ length: 9 }, (_, k) => {
          const an = (k / 9) * TAU
          return [
            a.x + Math.cos(an) * att.def.size * 0.45,
            a.y + Math.sin(an) * att.def.size * 0.16,
            0.8 + Math.random() * 0.6,
          ]
        }),
        1.3,
        20,
        ['#a85a10', '#ffa02a', '#fff0b0']
      )
      ps.burst(40, () => ({
        x: a.x + (Math.random() - 0.5) * att.def.size * 0.8,
        y: a.y - Math.random() * 20,
        vx: 0,
        vy: -20 - Math.random() * 30,
        life: 0.9,
        size: 1,
        cols: ['#fff0b0', '#ffc45a', '#ffa02a'],
        glow: true,
        twinkle: true,
      }))
      await wait(350)
      att.defUpT = 6
      att.atkUpT = 6
      sayAt(att, 'เกราะขึ้น · พลังโจมตีขึ้น', '#ffc45a', true)
      await wait(400)
    },
  },
}
