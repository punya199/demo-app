import { IEnt } from './runtime'
import { anchor, centerOf, clock, ease, fxs, mouthOf, ps, scene, tween, wait } from './runtime'
import { elCols } from './shadow'

// Grandeur by skill tier (owner, 2026-11-09): a high-stage skill looks bigger than a baby's, on top
// of the skill's own animation. The tier is the backend's (SKILL_TIER_PCT, from the skill's `src`): the
// form that carries the skill decides how strong it is, so it also decides how grand it looks.
//   Adult and below: nothing extra.
//   Perfect: a glow ring at the feet while charging, a bigger flare where it lands.
//   Ultimate: a turning magic circle and a light column while charging; a ranged skill fires a beam at
//     its target, a close one lands with a shockwave, a burst or self skill raises a pillar.
//   Fused: the same in two colours (both parent lines, or the line and gold), a double beam, a dark
//     screen while charging, a bigger shockwave and more shake.

export type FlourishTier = 0 | 1 | 2 | 3

export const skillTierPct = (src: string) => {
  if (src.startsWith('fused_')) return 160
  const form = src.split('_')[1] ?? ''
  if (form.startsWith('baby2')) return 75
  if (form.startsWith('adult')) return 100
  if (form.startsWith('perfect')) return 120
  if (form.startsWith('ultimate')) return 140
  return 100
}

export const flourishTierOf = (src: string, slot: string): FlourishTier => {
  if (slot !== 'active') return 0
  const pct = skillTierPct(src)
  return pct >= 160 ? 3 : pct >= 140 ? 2 : pct >= 120 ? 1 : 0
}

// What the flourish needs to know about a cast. `els` are prototype element names ('fire', 'water',
// ...); the second one colours a Fused skill (a cross-line form's other line, or 'gold').
export interface IFlourish {
  tier: FlourishTier
  kind: string
  els: string[]
  // Seconds from the start of the wind-up to the release.
  chargeSec: number
}

const RANGED = new Set(['shot', 'beam', 'spread', 'zone'])
const GOLD = ['#ffffff', '#fffad8', '#fff0a0', '#ffd84a', '#c8a030']
const colsOf = (el: string) => (el === 'gold' ? GOLD : elCols(el))

// A rune circle under a point, turning; r grows with k.
const magicCircle = (x: number, y: number, R: number, cols: string[], ms: number, spin = 1) =>
  fxs.push({
    age: 0,
    life: ms / 1000,
    draw(c, k) {
      const g = ease(Math.min(1, k * 2.5)),
        fade = k > 0.85 ? (1 - k) / 0.15 : 1,
        r = R * g
      c.globalCompositeOperation = 'lighter'
      c.globalAlpha = 0.8 * fade
      c.strokeStyle = cols[2]
      c.lineWidth = 1
      for (const [rr, w] of [
        [r, 1],
        [r * 0.72, 1],
      ]) {
        c.lineWidth = w
        c.beginPath()
        c.ellipse(x, y, rr, rr * 0.38, 0, 0, 7)
        c.stroke()
      }
      // runes and spokes on the ring
      for (let i = 0; i < 10; i++) {
        const a = clock * 1.6 * spin + (i * Math.PI) / 5
        c.fillStyle = i % 2 ? cols[1] : cols[0]
        c.fillRect(x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86 * 0.38, 2, 1)
      }
      c.globalAlpha = 0.35 * fade
      c.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = -clock * 1.1 * spin + (i * Math.PI * 2) / 3
        const px = x + Math.cos(a) * r * 0.72,
          py = y + Math.sin(a) * r * 0.72 * 0.38
        if (i === 0) c.moveTo(px, py)
        else c.lineTo(px, py)
      }
      c.closePath()
      c.stroke()
    },
  })

// A vertical column of light rising through the caster (charge) or bursting up (release).
const lightColumn = (e: IEnt, w: number, h: number, cols: string[], ms: number, a = 0.6) =>
  fxs.push({
    age: 0,
    life: ms / 1000,
    draw(c, k) {
      const p = anchor(e),
        rise = ease(Math.min(1, k * 3)),
        fade = Math.sin(Math.PI * Math.min(1, k)),
        g = c.createLinearGradient(0, p.y - h * rise, 0, p.y)
      g.addColorStop(0, 'rgba(255,255,255,0)')
      g.addColorStop(0.5, cols[1])
      g.addColorStop(1, cols[3])
      c.globalCompositeOperation = 'lighter'
      c.globalAlpha = a * fade
      c.fillStyle = g
      c.fillRect(p.x - w / 2, p.y - h * rise, w, h * rise)
      c.globalAlpha = 0.9 * fade
      c.fillStyle = cols[0]
      c.fillRect(p.x - 1, p.y - h * rise, 2, h * rise)
    },
  })

// A shockwave ring on the floor at p.
const shockwave = (x: number, y: number, R: number, cols: string[], ms: number, rings = 1) => {
  for (let i = 0; i < rings; i++)
    fxs.push({
      age: -i * 0.08,
      life: ms / 1000,
      draw(c, k) {
        if (k < 0) return
        const r = R * ease(k)
        c.globalCompositeOperation = 'lighter'
        c.globalAlpha = 1 - k
        c.strokeStyle = i % 2 ? cols[3] : cols[1]
        c.lineWidth = 2
        c.beginPath()
        c.ellipse(x, y, r, r * 0.4, 0, 0, 7)
        c.stroke()
      },
    })
}

// A flare: a bright cross of light and a burst of sparks at p.
const flare = (x: number, y: number, size: number, cols: string[], n: number) => {
  fxs.push({
    age: 0,
    life: 0.35,
    draw(c, k) {
      const s = size * (1 - k * 0.6)
      c.globalCompositeOperation = 'lighter'
      c.globalAlpha = 1 - k
      c.fillStyle = cols[0]
      c.fillRect(x - s, y - 1, s * 2, 2)
      c.fillRect(x - 1, y - s * 0.7, 2, s * 1.4)
      c.fillStyle = cols[1]
      c.beginPath()
      c.arc(x, y, s * 0.35, 0, 7)
      c.fill()
    },
  })
  ps.burst(n, () => {
    const a = Math.random() * Math.PI * 2,
      v = 40 + Math.random() * 80
    return {
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v * 0.6,
      drag: 3,
      life: 0.35 + Math.random() * 0.3,
      size: Math.random() < 0.4 ? 2 : 1,
      cols,
      glow: true,
    }
  })
}

// A beam from the caster's mouth to the target's centre (both followed every frame), growing in,
// holding, then thinning out. Two beams twist round each other for a Fused skill.
const beam = (att: IEnt, def: IEnt, cols: string[], ms: number, W: number, twist = 0) =>
  fxs.push({
    age: 0,
    life: ms / 1000,
    draw(c, k) {
      const m = mouthOf(att),
        t = centerOf(def),
        reach = Math.min(1, k * 5),
        thin = k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1,
        ang = Math.atan2(t.y - m.y, t.x - m.x),
        L = Math.hypot(t.x - m.x, t.y - m.y) * reach,
        nx = -Math.sin(ang),
        ny = Math.cos(ang),
        wob = twist ? Math.sin(clock * 30 + twist) * 2 : 0
      c.globalCompositeOperation = 'lighter'
      for (const [w, col, a] of [
        [W * 1.8, cols[3], 0.3],
        [W, cols[2], 0.6],
        [W * 0.35, cols[0], 0.95],
      ] as const) {
        const hw = (w * thin) / 2
        c.globalAlpha = a
        c.fillStyle = col
        c.beginPath()
        c.moveTo(m.x + nx * (hw * 0.4 + wob), m.y + ny * (hw * 0.4 + wob))
        c.lineTo(
          m.x + Math.cos(ang) * L + nx * (hw + wob),
          m.y + Math.sin(ang) * L + ny * (hw + wob)
        )
        c.lineTo(
          m.x + Math.cos(ang) * L - nx * (hw - wob),
          m.y + Math.sin(ang) * L - ny * (hw - wob)
        )
        c.lineTo(m.x - nx * (hw * 0.4 - wob), m.y - ny * (hw * 0.4 - wob))
        c.fill()
      }
      // sparks streaming along it
      if (Math.random() < 0.9 * thin) {
        const q = Math.random()
        ps.add({
          x: m.x + Math.cos(ang) * L * q,
          y: m.y + Math.sin(ang) * L * q,
          vx: Math.cos(ang) * 60 + (Math.random() - 0.5) * 30,
          vy: Math.sin(ang) * 60 + (Math.random() - 0.5) * 30,
          life: 0.3,
          size: 1,
          cols,
          glow: true,
        })
      }
    },
  })

// The charge part: from the start of the wind-up to the release.
const charge = (att: IEnt, f: IFlourish, a: string[], b: string[]) => {
  const ms = Math.max(250, f.chargeSec * 1000)
  const p = anchor(att)
  const R = Math.max(18, att.def.size * 0.42) * (att.grow || 1)
  if (f.tier === 1) {
    shockwave(p.x, p.y, R * 0.9, a, ms, 1)
    return
  }
  magicCircle(p.x, p.y, R, a, ms + 350)
  if (f.tier === 3) {
    magicCircle(p.x, p.y, R * 1.35, b, ms + 350, -1)
    void tween(ms, (k) => {
      scene.darken = Math.max(scene.darken, 0.35 * k)
    }).then(() => tween(400, (k) => (scene.darken = 0.35 * (1 - k))))
  }
  lightColumn(att, 10, 70 * (att.grow || 1), a, ms + 200, 0.4)
  // motes drawn into the caster
  void tween(ms, () => {
    if (Math.random() > 0.7) return
    const an = Math.random() * Math.PI * 2,
      r = R * 1.6
    const cols = f.tier === 3 && Math.random() < 0.5 ? b : a
    ps.add({
      x: p.x + Math.cos(an) * r,
      y: p.y - 10 + Math.sin(an) * r * 0.5,
      vx: -Math.cos(an) * r * 2.2,
      vy: -Math.sin(an) * r * 1.1,
      life: 0.4,
      size: 1,
      cols,
      glow: true,
    })
  })
}

// The release: a beam, a shockwave or a pillar, by the skill's kind.
const release = (att: IEnt, def: IEnt, f: IFlourish, a: string[], b: string[]) => {
  const t = centerOf(def)
  if (f.tier === 1) {
    flare(t.x, t.y, 10, a, 10)
    return
  }
  const big = f.tier === 3
  scene.shake = Math.max(scene.shake, big ? 6 : 3)
  scene.flashScreen = Math.max(scene.flashScreen, big ? 0.35 : 0.2)
  if (f.kind === 'self' || f.kind === 'burst') {
    const p = anchor(att)
    lightColumn(att, big ? 26 : 18, 140, a, 700, 0.7)
    if (big) lightColumn(att, 10, 160, b, 700, 0.6)
    shockwave(p.x, p.y, (big ? 90 : 65) * (att.grow || 1), a, 600, big ? 3 : 2)
    return
  }
  if (RANGED.has(f.kind)) {
    beam(att, def, a, 520, big ? 9 : 7)
    if (big) beam(att, def, b, 520, 5, 3)
    void wait(90).then(() => {
      const tt = centerOf(def)
      flare(tt.x, tt.y, big ? 18 : 13, a, big ? 26 : 16)
      shockwave(def.x, def.y, big ? 55 : 40, big ? b : a, 500, big ? 2 : 1)
    })
    return
  }
  // melee, multi, charge: the blow lands with a shockwave
  flare(t.x, t.y, big ? 18 : 13, a, big ? 24 : 14)
  shockwave(def.x, def.y, big ? 60 : 44, a, 500, big ? 2 : 1)
  if (big) shockwave(def.x, def.y, 75, b, 600, 1)
}

// Plays the flourish of one cast: charge from now, release after f.chargeSec.
export const runFlourish = async (att: IEnt, def: IEnt, f: IFlourish) => {
  if (!f.tier) return
  const a = colsOf(f.els[0] ?? 'fire')
  const b = colsOf(f.els[1] ?? f.els[0] ?? 'gold')
  charge(att, f, a, b)
  await wait(Math.max(0, f.chargeSec * 1000))
  release(att, def, f, a, b)
}
