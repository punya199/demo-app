'use strict'
// Cross-line Fused forms: each form's own skill (backend arena-data.ts fz_<a>_<b>, 2026-11-09), an effect
// from each parent line. Ids are the game ids; `hy` is the sprite that owns the skill (hybrid.js) and `el` its
// first line. Damage here is only a show of the game's numbers (power x the Fused tier), not exact.
// Built from the line helpers: lavaSplash/flameArc (fire), splash/ripple (water), leafBurst/rootsUp (leaf),
// rockBurst/crackRing/spikesUp (earth), zapBurst/zapArc (bolt), lightBurst/lightPillar (holy),
// darkBurst/runeRing (dark), shadowBurst/mistRoll (shadow).
const HY_K = 0.9 // game power -> prototype damage
function slowOn(e, sec) {
  if (immune(e)) return
  e.slowT = Math.max(e.slowT || 0, sec)
  sayAt(e, 'ช้าลง', '#a0dcff')
}
// A warning ellipse on the floor at z for `ms`, in the given colours.
function warnZone(z, R, ms, fill, rim) {
  fxs.push({
    age: 0,
    life: ms / 1000,
    draw(c, k) {
      const g = Math.min(1, k * 1.6),
        pulse = 0.5 + 0.5 * Math.sin(clock * 22)
      c.globalAlpha = 0.22 + 0.22 * pulse
      c.fillStyle = fill
      c.beginPath()
      c.ellipse(z.x, z.y, R * g, R * 0.4 * g, 0, 0, 7)
      c.fill()
      c.globalAlpha = 0.9
      c.strokeStyle = rim
      c.lineWidth = 1
      c.beginPath()
      c.ellipse(z.x, z.y, R, R * 0.4, 0, 0, 7)
      c.stroke()
    },
  })
}
const inZone = (e, z, R) => Math.hypot(e.x - z.x, (e.y - z.y) / 0.4) <= R + e.def.size * 0.2
// A filled ground ellipse that fades (scorch, mud, frost...).
function groundMark(z, R, col, life = 1.4, glow = false) {
  fxs.push({
    age: 0,
    life,
    draw(c, k) {
      if (glow) c.globalCompositeOperation = 'lighter'
      c.globalAlpha = 0.6 * (1 - k)
      c.fillStyle = col
      c.beginPath()
      c.ellipse(z.x, z.y, R, R * 0.4, 0, 0, 7)
      c.fill()
    },
  })
}
// A straight beam from the caster's mouth towards the target for `ms` (two colour bands).
function beamFx(att, ang, L, W, ms, inner, outer) {
  fxs.push({
    age: 0,
    life: ms / 1000,
    draw(c, k) {
      const m = mouthOf(att),
        reach = L * Math.min(1, k * 4),
        nx = -Math.sin(ang),
        ny = Math.cos(ang),
        ex = m.x + Math.cos(ang) * reach,
        ey = m.y + Math.sin(ang) * reach
      c.globalCompositeOperation = 'lighter'
      for (const [w, col, a] of [
        [W, outer, 0.45],
        [W * 0.4, inner, 0.9],
      ]) {
        c.globalAlpha = a * (1 - Math.max(0, k - 0.75) * 4)
        c.fillStyle = col
        c.beginPath()
        c.moveTo(m.x, m.y - 1)
        c.lineTo(ex + (nx * w) / 2, ey + (ny * w) / 2)
        c.lineTo(ex - (nx * w) / 2, ey - (ny * w) / 2)
        c.lineTo(m.x, m.y + 1)
        c.fill()
      }
    },
  })
}
const onBeam = (e, m, ang, L, W) => {
  const dx = e.x - m.x,
    dy = e.y - m.y,
    along = dx * Math.cos(ang) + dy * Math.sin(ang),
    side = Math.abs(-dx * Math.sin(ang) + dy * Math.cos(ang))
  return along > 0 && along < L && side < W / 2 + e.def.size * 0.2
}
// A jagged lightning line between two points (zapArc in water.js takes fighters, not points).
function zapLine(pa, pb, life = 0.3, col = '#fff6a0') {
  const pts = [pa]
  for (let i = 1; i < 6; i++) {
    const k = i / 6
    pts.push({
      x: pa.x + (pb.x - pa.x) * k + (Math.random() - 0.5) * 10,
      y: pa.y + (pb.y - pa.y) * k + (Math.random() - 0.5) * 10,
    })
  }
  pts.push(pb)
  fxs.push({
    age: 0,
    life,
    draw(c, k) {
      c.globalCompositeOperation = 'lighter'
      c.globalAlpha = 1 - k
      for (const [w, cl] of [
        [3, 'rgba(255,225,74,.35)'],
        [1, col],
      ]) {
        c.strokeStyle = cl
        c.lineWidth = w
        c.beginPath()
        c.moveTo(pts[0].x, pts[0].y)
        for (const q of pts) c.lineTo(q.x, q.y)
        c.stroke()
      }
    },
  })
}
const STEAM_COLS = ['#ffffff', '#e8f4ff', '#c8dcef', '#9ab0c8']

const HYBRID = {
  // ไอน้ำเดือด: lava cracks on the back glow, both vents blast a ring of boiling steam (burn + blind)
  fz_flame_tide: {
    name: 'ไอน้ำเดือด',
    icon: '♨️',
    hy: 'hy_steam',
    el: 'fire',
    reach: 110 * SCALE,
    async run(att, def) {
      const p = castPose(att, 700, 600)
      tween(700, (k) => (tintA = 0.5 * k))
      await p.charged
      p.release()
      const c0 = anchor(att),
        R = 110 * SCALE
      shake = 5
      flashScreen = 0.4
      ps.burst(90, () => {
        const a = Math.random() * 7,
          sp = R * (1.2 + Math.random())
        return {
          x: c0.x,
          y: c0.y - 8,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp * 0.45 - 20,
          drag: 2.5,
          life: 0.7 + Math.random() * 0.5,
          size: Math.random() < 0.5 ? 3 : 2,
          cols: STEAM_COLS,
        }
      })
      lavaSplash(c0.x, c0.y, 16)
      ripple(c0.x, c0.y, R, 0.7, '#ffffff')
      groundMark(c0, R * 0.9, '#c8dcef', 1.2)
      if (inZone(def, c0, R)) {
        burnOn(def, 3)
        mistBlind(def, 2)
        await damage(def, Math.round(170 * HY_K), { from: att })
      }
      await wait(300)
    },
  },
  // บึงดูดกลืน: a swamp opens under the foe, roots grab it and toxic bubbles rise (root + poison)
  fz_leaf_tide: {
    name: 'บึงดูดกลืน',
    icon: '🐊',
    hy: 'hy_swamp',
    el: 'leaf',
    reach: 200,
    async run(att, def) {
      const p = castPose(att, 500, 500)
      await p.charged
      p.release()
      const z = { x: def.x, y: def.y },
        R = 90 * SCALE,
        delay = 700
      warnZone(z, R, delay + 200, '#2e5a2a', '#7ad35a')
      splash(anchor(att).x, anchor(att).y, 14, 40)
      await wait(delay)
      groundMark(z, R, '#3a4a1e', 2)
      rootsUp(z.x, z.y, R * 0.8, 1.1, 8)
      ps.burst(40, () => ({
        x: z.x + (Math.random() - 0.5) * R * 1.4,
        y: z.y + (Math.random() - 0.5) * R * 0.5,
        vx: (Math.random() - 0.5) * 10,
        vy: -18 - Math.random() * 20,
        life: 0.8 + Math.random() * 0.6,
        size: Math.random() < 0.4 ? 2 : 1,
        cols: ['#d8ff9a', '#9aff6a', '#4ac43a'],
      }))
      shake = 3
      if (inZone(def, z, R)) {
        rootOn(def, 2)
        poisonOn(def, 4)
        await damage(def, Math.round(160 * HY_K), { from: att })
      }
      await wait(300)
    },
  },
  // ไฟป่าลามทุ่ง: the burning mane flares and flings five burning leaves in a fan (burn / poison)
  fz_flame_leaf: {
    name: 'ไฟป่าลามทุ่ง',
    icon: '🦁',
    hy: 'hy_wildfire',
    el: 'fire',
    reach: 170,
    async run(att, def) {
      const p = castPose(att, 500, 600)
      await p.charged
      p.release()
      const m = mouthOf(att),
        t = centerOf(def),
        base = Math.atan2(t.y - m.y, t.x - m.x)
      const shots = [-0.3, -0.15, 0, 0.15, 0.3].map((da, i) =>
        wait(i * 70).then(() => {
          const a = base + da,
            L = Math.hypot(t.x - m.x, t.y - m.y) + 20,
            to = { x: m.x + Math.cos(a) * L, y: m.y + Math.sin(a) * L }
          return projectile(m, to, 380, (c, x, y) => {
            c.globalCompositeOperation = 'source-over'
            c.fillStyle = i % 2 ? '#c4521a' : '#7a9a2a'
            c.beginPath()
            c.ellipse(x, y, 4, 2, a, 0, 7)
            c.fill()
            c.globalCompositeOperation = 'lighter'
            c.fillStyle = '#ffd04a'
            c.fillRect(x - 1, y - 1, 2, 2)
            if (Math.random() < 0.7) ps.add(makeParticle('flame', x, y))
          }).then(() => {
            if (Math.hypot(def.x - to.x, def.y - to.y) < def.def.size * 0.6) {
              if (Math.random() < 0.4) burnOn(def, 3)
              if (Math.random() < 0.4) poisonOn(def, 4)
              leafBurst(to.x, to.y, 6, 40)
              return damage(def, Math.round(55 * HY_K), { from: att })
            }
          })
        })
      )
      await Promise.all(shots)
      await wait(200)
    },
  },
  // ภูเขาไฟระเบิด: the volcano on the shell erupts, a lava bomb arcs up and lands on the marked spot (burn + stun)
  fz_earth_flame: {
    name: 'ภูเขาไฟระเบิด',
    icon: '🌋',
    hy: 'hy_volcano',
    el: 'fire',
    reach: 220,
    async run(att, def) {
      const p = castPose(att, 700, 600)
      await p.charged
      p.release()
      const top = { x: anchor(att).x, y: anchor(att).y - att.def.img.foot * (att.grow || 1) },
        z = { x: def.x, y: def.y },
        R = 95 * SCALE,
        delay = 1000
      shake = 5
      lavaSplash(top.x, top.y, 50)
      ps.burst(14, () => makeParticle('smoke', top.x, top.y - 4))
      warnZone(z, R, delay + 200, '#ff3b1a', '#ff9a2a')
      fxs.push({
        age: 0,
        life: delay / 1000,
        draw(c, k) {
          const x = top.x + (z.x - top.x) * k,
            y = top.y + (z.y - top.y) * k - Math.sin(k * Math.PI) * 90
          c.fillStyle = '#4a140a'
          c.beginPath()
          c.arc(x, y, 7, 0, 7)
          c.fill()
          c.globalCompositeOperation = 'lighter'
          c.fillStyle = '#ff8a2a'
          c.beginPath()
          c.arc(x - 1, y - 1, 4, 0, 7)
          c.fill()
          if (Math.random() < 0.9) ps.add(makeParticle('flame', x, y))
        },
      })
      await wait(delay)
      shake = 8
      flashScreen = 0.4
      lavaSplash(z.x, z.y, 70)
      rockBurst(z.x, z.y, 18, 80)
      crackRing(z.x, z.y, R, 1.3)
      groundMark(z, R * 0.8, '#7a2410', 1.6, true)
      if (inZone(def, z, R)) {
        burnOn(def, 3)
        stunOn(def, 0.8)
        await damage(def, Math.round(230 * HY_K), { from: att })
      }
      await wait(300)
    },
  },
  // อัคนีอสนีบาต: wings spread, a beam of fire wrapped in lightning (burn + static)
  fz_flame_lightning: {
    name: 'อัคนีอสนีบาต',
    icon: '💥',
    hy: 'hy_firestorm',
    el: 'fire',
    reach: 300 * SCALE,
    async run(att, def) {
      const p = castPose(att, 700, 900)
      await p.charged
      p.release()
      const m = mouthOf(att),
        t = centerOf(def),
        ang = Math.atan2(t.y - m.y, t.x - m.x),
        L = 320 * SCALE,
        W = 32 * SCALE
      shake = 4
      beamFx(att, ang, L, W, 800, '#fff6c0', '#ff6a1a')
      for (let i = 0; i < 4; i++)
        wait(i * 160).then(() =>
          zapLine(mouthOf(att), {
            x: m.x + Math.cos(ang) * L * (0.6 + Math.random() * 0.4),
            y: m.y + Math.sin(ang) * L * (0.6 + Math.random() * 0.4),
          })
        )
      await wait(150)
      if (onBeam(def, m, ang, L, W)) {
        burnOn(def, 3)
        staticOn(def, 4)
        zapBurst(t.x, t.y, 20)
        await damage(def, Math.round(200 * HY_K), { from: att })
      }
      await wait(600)
    },
  },
  // ทุ่มหินโคลน: the otter rears up and throws its muddy boulder (slow + DEF down)
  fz_earth_tide: {
    name: 'ทุ่มหินโคลน',
    icon: '🦦',
    hy: 'hy_mudotter',
    el: 'water',
    reach: 220,
    async run(att, def) {
      const p = castPose(att, 500, 500)
      await p.charged
      p.release()
      const m = mouthOf(att),
        t = centerOf(def)
      await projectile(m, t, 520, (c, x, y) => {
        c.fillStyle = '#5a4a3a'
        c.beginPath()
        c.arc(x, y, 7, 0, 7)
        c.fill()
        c.fillStyle = '#8a7a66'
        c.beginPath()
        c.arc(x - 2, y - 2, 4, 0, 7)
        c.fill()
        if (Math.random() < 0.6)
          ps.add({ x, y, vx: 0, vy: 20, life: 0.4, size: 1, cols: ['#6a5640', '#4a3a2a'] })
      })
      shake = 5
      rockBurst(t.x, t.y, 16, 60)
      splash(def.x, def.y, 24, 50)
      groundMark({ x: def.x, y: def.y }, 22, '#4a3a2a', 1.8)
      slowOn(def, 3)
      defDownOn(def, 4)
      await damage(def, Math.round(190 * HY_K), { from: att })
      await wait(250)
    },
  },
  // พายุคลื่นฟ้า: the ray spins its water ring into a storm, lightning crackles through the wave (static + slow)
  fz_lightning_tide: {
    name: 'พายุคลื่นฟ้า',
    icon: '🌀',
    hy: 'hy_stormray',
    el: 'water',
    reach: 115 * SCALE,
    async run(att, def) {
      const p = castPose(att, 800, 700)
      const c0 = anchor(att),
        R = 115 * SCALE
      fxs.push({
        age: 0,
        life: 1.6,
        draw(c, k) {
          c.globalCompositeOperation = 'lighter'
          for (let i = 0; i < 36; i++) {
            const an = clock * 6 + (i / 36) * 7,
              r = R * (0.3 + 0.7 * Math.min(1, k * 1.6))
            c.globalAlpha = 0.6 * (1 - k)
            c.fillStyle = i % 4 ? '#7ee7ff' : '#ffe14a'
            c.fillRect(c0.x + Math.cos(an) * r, c0.y + Math.sin(an) * r * 0.4, 2, 2)
          }
        },
      })
      await p.charged
      p.release()
      shake = 5
      ripple(c0.x, c0.y, R, 0.8, '#7ee7ff')
      zapBurst(c0.x, c0.y - 10, 30, 110)
      splash(c0.x, c0.y, 30, 70)
      if (inZone(def, c0, R)) {
        zapArc(att, def)
        staticOn(def, 4)
        slowOn(def, 2.5)
        await damage(def, Math.round(160 * HY_K), { from: att })
      }
      await wait(300)
    },
  },
  // เสาหินพนา: stomp, mossy stone pillars burst up under the foe and roots bind it; the rhino hardens (root + DEF up)
  fz_earth_leaf: {
    name: 'เสาหินพนา',
    icon: '🗿',
    hy: 'hy_stoneforest',
    el: 'leaf',
    reach: 200,
    async run(att, def) {
      const p = castPose(att, 600, 500)
      await p.charged
      p.release()
      const z = { x: def.x, y: def.y },
        R = 85 * SCALE,
        delay = 700
      shake = 4
      crackRing(anchor(att).x, anchor(att).y, 30, 0.8, 6)
      warnZone(z, R, delay + 200, '#5a4a30', '#c8bca6')
      await wait(delay)
      shake = 6
      const pts = Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * 7
        return [z.x + Math.cos(a) * R * 0.6, z.y + Math.sin(a) * R * 0.25]
      })
      spikesUp(pts, 1.1, 22, ['#3a4a2a', '#7a8a5a', '#b8c48a'])
      rootsUp(z.x, z.y, R * 0.6, 1.0, 6)
      rockBurst(z.x, z.y, 14, 60)
      att.defT = Math.max(att.defT || 0, 5)
      sayAt(att, 'เกราะเพิ่ม', '#c8bca6')
      if (inZone(def, z, R)) {
        rootOn(def, 2)
        await damage(def, Math.round(200 * HY_K), { from: att })
      }
      await wait(300)
    },
  },
  // ใบไม้สายฟ้า: four lightning-quick leaf-tail strikes (poison / static on each)
  fz_leaf_lightning: {
    name: 'ใบไม้สายฟ้า',
    icon: '🍃',
    hy: 'hy_leafstorm',
    el: 'leaf',
    async run(att, def) {
      await meleeStrike(att, def, {
        wind: 220,
        rush: 120,
        hits: 4,
        gap: 90,
        onHit() {
          const c = centerOf(def)
          leafBurst(c.x, c.y, 8, 50)
          zapBurst(c.x, c.y, 8, 50)
          if (Math.random() < 0.4) poisonOn(def, 3)
          if (Math.random() < 0.4) staticOn(def, 3)
          return damage(def, Math.round(48 * HY_K), { from: att })
        },
      })
    },
  },
  // เขาผลึกล่อฟ้า: the crystal horns call lightning, then the goat charges in (stun + static)
  fz_earth_lightning: {
    name: 'เขาผลึกล่อฟ้า',
    icon: '🐐',
    hy: 'hy_thunderram',
    el: 'earth',
    async run(att, def) {
      const p = castPose(att, 500, 300)
      const horn = { x: anchor(att).x, y: anchor(att).y - att.def.img.foot }
      fxs.push({
        age: 0,
        life: 0.5,
        draw(c, k) {
          c.globalCompositeOperation = 'lighter'
          c.globalAlpha = 1 - k
          c.strokeStyle = '#fff6a0'
          c.lineWidth = 2
          c.beginPath()
          let x = horn.x,
            y = cam.y
          c.moveTo(x, y)
          while (y < horn.y) {
            y += 10
            x = horn.x + (Math.random() - 0.5) * 10
            c.lineTo(x, Math.min(y, horn.y))
          }
          c.stroke()
        },
      })
      flashScreen = 0.3
      await p.charged
      const x0 = att.x,
        y0 = att.y,
        tx = def.x - Math.sign(def.x - att.x) * (att.def.size + def.def.size) * 0.22,
        ty = def.y
      await tween(260, (k) => {
        att.x = x0 + (tx - x0) * easeIn(k)
        att.y = y0 + (ty - y0) * easeIn(k)
        if (Math.random() < 0.8) ps.add(makeParticle('zap', anchor(att).x, anchor(att).y - 10))
      })
      shake = 7
      rockBurst(def.x, def.y, 14, 70)
      zapBurst(centerOf(def).x, centerOf(def).y, 24)
      stunOn(def, 0.8)
      staticOn(def, 3)
      await damage(def, Math.round(210 * HY_K), { from: att })
      await wait(200)
    },
  },
  // หยินหยางพิพากษา: the yin-yang orb on the chest spins, a twin beam of gold and violet (curse + lifesteal)
  fz_dark_holy: {
    name: 'หยินหยางพิพากษา',
    icon: '☯️',
    hy: 'hy_balance',
    el: 'holy',
    reach: 300 * SCALE,
    async run(att, def) {
      const p = castPose(att, 800, 900)
      const orb = () => {
        const a = anchor(att)
        return { x: a.x + (att.flip ? -6 : 6), y: a.y - att.def.img.foot * 0.45 }
      }
      fxs.push({
        age: 0,
        life: 0.8,
        draw(c, k) {
          const o = orb()
          c.globalCompositeOperation = 'lighter'
          runeRing(c, o.x, o.y, 6 + 10 * k, clock * 4, 0.8)
          c.globalAlpha = 0.9
          c.fillStyle = '#fff0a0'
          c.beginPath()
          c.arc(o.x, o.y, 4, clock * 6, clock * 6 + Math.PI)
          c.fill()
          c.fillStyle = '#a04ae8'
          c.beginPath()
          c.arc(o.x, o.y, 4, clock * 6 + Math.PI, clock * 6 + Math.PI * 2)
          c.fill()
        },
      })
      await p.charged
      p.release()
      const m = mouthOf(att),
        t = centerOf(def),
        ang = Math.atan2(t.y - m.y, t.x - m.x),
        L = 320 * SCALE,
        W = 30 * SCALE
      beamFx(att, ang + 0.03, L, W * 0.6, 800, '#fffad8', '#ffd84a')
      beamFx(att, ang - 0.03, L, W * 0.6, 800, '#e4b8ff', '#a04ae8')
      if (onBeam(def, m, ang, L, W)) {
        curseOn(def, 4)
        lightBurst(t.x, t.y, 14)
        darkBurst(t.x, t.y, 14)
        await damage(def, Math.round(180 * HY_K), { from: att })
        const heal = Math.round(180 * HY_K * 0.3)
        att.hp = Math.min(att.hpMax, att.hp + heal)
        sayAt(att, '+' + heal, '#5ad38a')
      }
      await wait(500)
    },
  },
  // ปีกไร้แสง: the owl spreads its cloak-wings, the light dies and shadow smoke bursts out (blind + ATK down, EVA up)
  fz_dark_shadow: {
    name: 'ปีกไร้แสง',
    icon: '🦉',
    hy: 'hy_nightowl',
    el: 'dark',
    reach: 105 * SCALE,
    async run(att, def) {
      const p = castPose(att, 700, 700)
      tween(700, (k) => (darken = 0.5 * k))
      await p.charged
      p.release()
      const c0 = anchor(att),
        R = 105 * SCALE
      shake = 4
      mistRoll(c0.x, c0.y, R, 60, ['#3a2a4a', '#5a3a7a', '#1a1424'])
      shadowBurst(c0.x, c0.y - 10, 30, 90)
      ripple(c0.x, c0.y, R, 0.7, '#a04ae8')
      evaOn(att, 4)
      if (inZone(def, c0, R)) {
        mistBlind(def, 3)
        atkDownOn(def, 4)
        await damage(def, Math.round(160 * HY_K), { from: att })
      }
      tween(500, (k) => (darken = 0.5 * (1 - k)))
      await wait(300)
    },
  },
  // ตาชั่งเงียบ: a pillar of pale light falls through golden scales onto the foe (silence; harder on a weak foe)
  fz_holy_shadow: {
    name: 'ตาชั่งเงียบ',
    icon: '⚖️',
    hy: 'hy_judge',
    el: 'holy',
    reach: 200,
    async run(att, def) {
      const p = castPose(att, 600, 600)
      await p.charged
      p.release()
      const z = { x: def.x, y: def.y },
        R = 75 * SCALE,
        delay = 600
      warnZone(z, R, delay + 200, '#6a5a8a', '#fff0a0')
      fxs.push({
        age: 0,
        life: delay / 1000,
        draw(c, k) {
          // the scales over the zone, tipping as it charges
          const x = z.x,
            y = z.y - 60,
            tip = Math.sin(k * Math.PI * 2) * 6
          c.globalCompositeOperation = 'lighter'
          c.globalAlpha = 0.9 * Math.min(1, k * 3)
          c.strokeStyle = '#ffd84a'
          c.lineWidth = 1
          c.beginPath()
          c.moveTo(x, y - 8)
          c.lineTo(x, y + 2)
          c.moveTo(x - 14, y - tip)
          c.lineTo(x + 14, y + tip)
          c.stroke()
          for (const s of [-1, 1]) {
            c.beginPath()
            c.ellipse(x + s * 14, y + s * tip + 6, 5, 2, 0, 0, 7)
            c.stroke()
          }
        },
      })
      await wait(delay)
      lightPillar(z.x, z.y, 22, 120, 0.8)
      lightBurst(z.x, z.y - 10, 20)
      shadowBurst(z.x, z.y, 12, 50)
      flashScreen = 0.3
      if (inZone(def, z, R)) {
        silenceOn(def, 2)
        const low = def.hp < def.hpMax * 0.35
        if (low) sayAt(def, 'พิพากษา!', '#ffd84a', true)
        await damage(def, Math.round(200 * HY_K * (low ? 1.6 : 1)), { from: att })
      }
      await wait(300)
    },
  },
}
// Which skill a hybrid sprite owns.
const HYBRID_OF = Object.fromEntries(Object.entries(HYBRID).map(([id, s]) => [s.hy, id]))
