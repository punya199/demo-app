'use strict'
// Animation, frame baking, auras, gallery cards, the arena scene, battle rules and the basic moves.
// Animations are sampled from continuous pose curves (many in-between frames) and baked lazily,
// so every frame keeps crisp pixel shading. Walk/idle loop; attack/cast/hurt run once (0..1).
const lerp = (a, b, t) => a + (b - a) * t,
  smooth = (t) => t * t * (3 - 2 * t),
  TAU = Math.PI * 2
const fullPose = (p) => ({ ...POSE0, ...p })
function mixPose(a, b, t) {
  const o = {}
  for (const k of Object.keys(POSE0)) {
    const x = a[k],
      y = b[k]
    o[k] = Array.isArray(x) ? [lerp(x[0], y[0], t), lerp(x[1], y[1], t)] : lerp(x, y, t)
  }
  return o
}
function keyed(keys, t) {
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, p0] = keys[i],
      [t1, p1] = keys[i + 1]
    if (t <= t1) return mixPose(fullPose(p0), fullPose(p1), smooth((t - t0) / (t1 - t0 || 1)))
  }
  return fullPose(keys[keys.length - 1][1])
}
const ANIM = {
  idle: {
    n: 12,
    loop: true,
    pose(rig, f) {
      const s = Math.sin(TAU * f),
        c = Math.cos(TAU * f)
      if (rig === FLY)
        return {
          wing: Math.sin(TAU * f),
          body: [0, -1.2 * Math.sin(TAU * f + 0.6)],
          head: [0, -0.8 * Math.sin(TAU * f + 1.2)],
          tail: 1.2 * Math.sin(TAU * f + 2),
          fl: [0, 0.6 * Math.sin(TAU * f + 2)],
          bl: [0, 0.6 * Math.sin(TAU * f + 2.4)],
          ff: [0, 0.6 * Math.sin(TAU * f + 2.2)],
        }
      if (rig === SWIM)
        return {
          body: [0, -0.6 * s],
          head: [0, -0.3 * Math.sin(TAU * f + 0.5)],
          tail: 1.2 * Math.sin(TAU * f + 1),
          wing: 0.3 * s,
          fl: [0, 0.9 * s],
          bl: [0, -0.9 * s],
          ff: [0.8 * c, 0],
          bf: [-0.8 * c, 0],
        }
      return {
        body: [0, 0.45 * s],
        head: [0, 0.35 * Math.sin(TAU * f + 0.6)],
        tail: 0.9 * Math.sin(TAU * f + 1),
        wing: 0.25 * s,
        arm: [0, 0.3 * s],
        arm2: [0, -0.3 * s],
      }
    },
  },
  walk: {
    n: 12,
    loop: true,
    pose(rig, f) {
      const s = Math.sin(TAU * f),
        c = Math.cos(TAU * f),
        lift = (v) => -2.2 * Math.max(0, v),
        up = 1 - Math.abs(s)
      if (rig === FLY)
        return {
          wing: Math.sin(2 * TAU * f),
          body: [1, -1.2 * Math.sin(2 * TAU * f + 0.6)],
          head: [1.5, -0.6 * Math.sin(2 * TAU * f + 1.2)],
          tail: 2 * Math.sin(TAU * f + 2),
          fl: [-1.5, 1],
          bl: [-1.5, 1],
          ff: [-1, 1],
        }
      if (rig === BLOB)
        return { body: [0, -2 * Math.abs(s)], bl: [0, lift(c) * 0.6], fl: [0, lift(-c) * 0.6] }
      if (rig === SWIM)
        return {
          body: [0, -1.2 * s],
          head: [0, -0.6 * Math.sin(TAU * f + 0.5)],
          tail: 2.4 * Math.sin(TAU * f + 1),
          wing: 0.6 * Math.sin(TAU * f + 1),
          fl: [0, 1.7 * s],
          bl: [0, -1.7 * s],
          ff: [1.5 * c, 0],
          bf: [-1.5 * c, 0],
        }
      if (rig === BIPED)
        return {
          bl: [2.4 * s, lift(c)],
          bf: [-2.4 * s, lift(-c)],
          arm: [-1.4 * s, 0],
          arm2: [1.4 * s, 0],
          body: [0, -0.8 * up],
          head: [0, -0.4 * up],
          tail: Math.sin(TAU * f + 1),
          wing: 0.2 * s,
        }
      const A = [2 * s, lift(c)],
        B = [-2 * s, lift(-c)]
      return {
        fl: A,
        bf: A,
        bl: B,
        ff: B,
        body: [0, -0.6 * up],
        head: [0, 0.35 * Math.sin(2 * TAU * f)],
        tail: 1.1 * Math.sin(TAU * f + 1),
        wing: 0.2 * s,
      }
    },
  },
  // wind-up, rush, hit (held), return - the beats a sprite attack uses
  attack: {
    n: 16,
    pose(rig, f) {
      const [w, h, r] = rig.attack
      return keyed(
        [
          [0, {}],
          [0.3, w],
          [0.42, h],
          [0.62, h],
          [0.8, r],
          [1, {}],
        ],
        f
      )
    },
  },
  cast: {
    n: 16,
    pose(rig, f) {
      const [c, r] = rig.cast
      return keyed(
        [
          [0, {}],
          [0.45, c],
          [0.55, r],
          [0.85, r],
          [1, {}],
        ],
        f
      )
    },
  },
  hurt: {
    n: 6,
    pose(rig, f) {
      return keyed(
        [
          [0, {}],
          [0.25, rig.hurt[0]],
          [1, {}],
        ],
        f
      )
    },
  },
}
function getFrame(def, name, i) {
  const A = ANIM[name],
    list = def.frames[name]
  i = ((i % A.n) + A.n) % A.n
  if (!list[i]) {
    const s = new Spr(def.size, def.size),
      P = scalePose(fullPose(A.pose(def.rig, A.loop ? i / A.n : i / (A.n - 1))), def.amp)
    def.draw(s, P)
    list[i] = s.bake()
    list[i].pose = P // kept so a glow tagged with a body part can follow it
  }
  return list[i]
}
const SHADOW_IDS = [
  'nameless',
  'kbaby',
  'knight',
  'knight2',
  'knightlord',
  'lantern',
  'mistblob',
  'sboss',
  'segg',
  'sfused',
  'shyghost',
  'soulwraith',
  'wbaby',
  'wraithlord',
]
const DARK_IDS = [
  'vampire',
  'degg',
  'mote',
  'batling',
  'spider',
  'rat',
  'vampbat',
  'eyespider',
  'zrat',
  'batlord',
  'spiderqueen',
  'batemperor',
  'dfused',
  'darksoul',
]
const HOLY_IDS = [
  'raidseraph',
  'hegg',
  'glint',
  'lamb',
  'wingsheep',
  'cherub',
  'lioncub',
  'qilin',
  'bellcrab',
  'winglion',
  'sunqilin',
  'lionking',
  'hfused',
  'holyele',
]
const BOLT_IDS = [
  'begg',
  'spark',
  'cloudpuff',
  'tbird',
  'staticcat',
  'stormfox',
  'hawk',
  'gloomcloud',
  'boltfox',
  'thunderking',
  'foxking',
  'bfused',
  'stormbison',
]
const EARTH_IDS = [
  'eegg',
  'pebble',
  'clay',
  'tortoise',
  'worm',
  'rhino',
  'pillarturtle',
  'boulder',
  'orerhino',
  'mountturtle',
  'crystalrhino',
  'efused',
  'pangolin',
]
const LEAF_IDS = [
  'legg',
  'seed',
  'sprout',
  'leafdeer',
  'mushroom',
  'wolf',
  'stag',
  'stump',
  'barkwolf',
  'forestdeer',
  'wolfking',
  'lfused',
  'flora',
]
for (const [id, def] of Object.entries(SPRITES)) {
  def.amp = (def.size >= 96 ? 2.2 : def.size >= 64 ? 1.3 : def.size >= 56 ? 1.15 : 1) * 1.6
  def.frames = Object.fromEntries(Object.keys(ANIM).map((n) => [n, new Array(ANIM[n].n)]))
  def.img = getFrame(def, 'idle', 0)
  def.id = id
  def.el = ADV_EL[id]
    ? ADV_EL[id]
    : SHADOW_IDS.includes(id)
      ? 'shadow'
      : DARK_IDS.includes(id)
        ? 'dark'
        : HOLY_IDS.includes(id)
          ? 'holy'
          : BOLT_IDS.includes(id)
            ? 'bolt'
            : EARTH_IDS.includes(id)
              ? 'earth'
              : LEAF_IDS.includes(id)
                ? 'leaf'
                : [
                      'abyssfish',
                      'wfused',
                      'whaleA',
                      'whaleB',
                      'whaleC',
                      'wegg',
                      'drop',
                      'bubble',
                      'swordwhale',
                      'jelly',
                      'shark',
                      'armorwhale',
                      'octopus',
                      'seadragon',
                      'whaleking',
                      'leviathan',
                      'turtle',
                    ].includes(id)
                  ? 'water'
                  : 'fire'
}
// The frame an entity shows: an action wins, then walking (phase follows the distance walked), then idle.
function frameOf(e, t) {
  const d = e.def
  if (e.anim) {
    const n = ANIM[e.anim.name].n
    return getFrame(d, e.anim.name, Math.round(Math.max(0, Math.min(1, e.anim.t)) * (n - 1)))
  }
  if (e.walking > 0.2) return getFrame(d, 'walk', Math.floor((e.walkPhase || 0) * 12))
  return getFrame(d, 'idle', Math.floor((t * 0.75 + e.side * 0.37) * 12))
}

const FLAME_COLS = ['#fff3a8', '#ffd04a', '#ff9a2a', '#ff5a14', '#a3260f']
function makeParticle(type, x, y, f = 1) {
  const R = Math.random
  switch (type) {
    case 'flame':
      return {
        x: x + (R() - 0.5) * 2,
        y,
        vx: (R() - 0.5) * 6,
        vy: -14 - R() * 12,
        life: 0.35 + R() * 0.3,
        size: R() < 0.3 ? 2 : 1,
        cols: FLAME_COLS,
        glow: true,
      }
    case 'ember':
      return {
        x: x + (R() - 0.5) * 10 * f,
        y: y + (R() - 0.5) * 6,
        vx: (R() - 0.5) * 6,
        vy: -8 - R() * 10,
        life: 0.9 + R() * 0.8,
        size: 1,
        cols: ['#ffe680', '#ff9a2a', '#ff5a14'],
        glow: true,
        sway: 1,
      }
    case 'smoke':
      return {
        x: x + (R() - 0.5) * 3,
        y,
        vx: (R() - 0.5) * 4,
        vy: -6 - R() * 5,
        life: 1 + R() * 0.8,
        size: 2,
        cols: ['#8a8186', '#5a5257', '#3a3438'],
        alpha: 0.6,
      }
    case 'drip':
      return {
        x: x + (R() - 0.5) * 3,
        y,
        vx: 0,
        vy: 2,
        g: 60,
        life: 0.9,
        size: 1,
        cols: ['#ffd04a', '#ff7a1a', '#a6371a'],
        glow: true,
      }
    case 'sparkle':
      return {
        x: x + (R() - 0.5) * 14,
        y: y + (R() - 0.5) * 14,
        vx: 0,
        vy: -3,
        life: 0.6 + R() * 0.4,
        size: 1,
        cols: ['#ffffff', '#fff0a0', '#f2c13a'],
        glow: true,
        twinkle: true,
      }
    case 'shard':
      return {
        x: x + (R() - 0.5) * 30,
        y: y + (R() - 0.5) * 8,
        vx: 0,
        vy: -5 - R() * 4,
        life: 1.6,
        size: 2,
        cols: ['#fff0a0', '#f2c13a', '#c48a16'],
        glow: false,
      }
    case 'mist':
      return {
        x: x + (R() - 0.5) * 4,
        y,
        vx: (R() - 0.5) * 10,
        vy: -14 - R() * 10,
        drag: 1.5,
        life: 0.8 + R() * 0.4,
        size: 2,
        cols: ['#ffffff', '#c8eeff', '#7ac8f0'],
        alpha: 0.55,
      }
    case 'glint':
      return {
        x: x + (R() - 0.5) * 10,
        y: y + (R() - 0.5) * 10,
        vx: 0,
        vy: -4,
        life: 0.5 + R() * 0.3,
        size: 1,
        cols: ['#ffffff', '#c8f4ff', '#7ee7ff'],
        glow: true,
        twinkle: true,
      }
    case 'zap':
      return {
        x: x + (R() - 0.5) * 14,
        y: y + (R() - 0.5) * 8,
        vx: 0,
        vy: 0,
        life: 0.12,
        size: 1,
        cols: ['#ffffff', '#7ee7ff'],
        glow: true,
      }
    case 'fall':
      return {
        x: x + (R() - 0.5) * 6,
        y,
        vx: (R() - 0.5) * 4,
        vy: 4,
        g: 120,
        life: 0.55,
        size: R() < 0.5 ? 2 : 1,
        cols: ['#e0f6ff', '#8ad4ff', '#3a90d2'],
        alpha: 0.9,
      }
    case 'bubble':
      return {
        x: x + (R() - 0.5) * 4,
        y,
        vx: (R() - 0.5) * 2,
        vy: -8 - R() * 4,
        life: 1.1,
        size: 1,
        cols: ['#e2f2f8', '#a0dcff', '#3a90d2'],
        glow: true,
        sway: 1,
      }
    case 'drop':
      return {
        x: x + (R() - 0.5) * 4,
        y,
        vx: 0,
        vy: 2,
        g: 50,
        life: 0.7,
        size: 1,
        cols: ['#a0dcff', '#3a90d2'],
        glow: false,
      }
    case 'grit':
      return {
        x: x + (R() - 0.5) * 30,
        y: y + (R() - 0.5) * 6,
        vx: (R() - 0.5) * 4,
        vy: 2,
        g: 40,
        life: 0.8 + R() * 0.4,
        size: R() < 0.3 ? 2 : 1,
        cols: ['#c8bca6', '#968a78', '#6e6456'],
      }
    case 'dust':
      return {
        x: x + (R() - 0.5) * 8,
        y,
        vx: (R() - 0.5) * 14,
        vy: -6 - R() * 6,
        drag: 2,
        life: 0.8 + R() * 0.5,
        size: 2,
        cols: ['#c4a06a', '#9a7a4a', '#6e5a3a'],
        alpha: 0.55,
      }
    case 'leaf':
      return {
        x: x + (R() - 0.5) * 10 * f,
        y: y + (R() - 0.5) * 4,
        vx: (R() - 0.5) * 8,
        vy: 5 + R() * 5,
        life: 1.5 + R() * 0.7,
        size: R() < 0.5 ? 2 : 1,
        cols: ['#b0f490', '#4cc44a', '#26942e'],
        sway: 1,
      }
    case 'pollen':
      return {
        x: x + (R() - 0.5) * 12,
        y: y + (R() - 0.5) * 8,
        vx: (R() - 0.5) * 3,
        vy: -3 - R() * 3,
        life: 0.9 + R() * 0.5,
        size: 1,
        cols: ['#fff6c8', '#e8ff8a', '#a8f088'],
        glow: true,
        twinkle: true,
      }
    case 'spore':
      return {
        x: x + (R() - 0.5) * 14,
        y: y + (R() - 0.5) * 4,
        vx: (R() - 0.5) * 6,
        vy: -4 - R() * 4,
        life: 1.4 + R() * 0.6,
        size: 1,
        cols: ['#f6ecff', '#d8c8ff', '#b89ad8'],
        glow: true,
        sway: 1,
        alpha: 0.8,
      }
    case 'petal':
      return {
        x: x + (R() - 0.5) * 20 * f,
        y: y + (R() - 0.5) * 6,
        vx: (R() - 0.5) * 10,
        vy: 6 + R() * 6,
        life: 1.6 + R() * 0.6,
        size: R() < 0.4 ? 2 : 1,
        cols: ['#fff0f6', '#ffb0cc', '#ec7aa6'],
        sway: 1,
      }
    case 'firefly':
      return {
        x: x + (R() - 0.5) * 30,
        y: y + (R() - 0.5) * 16,
        vx: (R() - 0.5) * 10,
        vy: (R() - 0.5) * 6 - 2,
        life: 1.4 + R() * 0.8,
        size: 1,
        cols: ['#f4ffb0', '#d8ff6a', '#8ae84a'],
        glow: true,
        twinkle: true,
        sway: 1,
      }
    case 'goldleaf':
      return {
        x: x + (R() - 0.5) * 30,
        y: y + (R() - 0.5) * 8,
        vx: (R() - 0.5) * 8,
        vy: 5 + R() * 5,
        life: 1.6 + R() * 0.6,
        size: R() < 0.5 ? 2 : 1,
        cols: ['#fff0a0', '#f2c13a', '#a8ffa0'],
        glow: true,
        sway: 1,
      }
    case 'zz':
      return {
        x: x + (R() - 0.5) * 4,
        y,
        vx: 3 + R() * 2,
        vy: -6 - R() * 3,
        life: 1.2,
        size: 1,
        cols: ['#e8e0ff', '#b8b0d8'],
        sway: 1,
      }
  }
}
class PSys {
  constructor() {
    this.list = []
  }
  add(p) {
    if (p) {
      p.age = 0
      this.list.push(p)
    }
  }
  burst(n, fn) {
    for (let i = 0; i < n; i++) this.add(fn(i))
  }
  update(dt) {
    const L = this.list
    for (let i = L.length - 1; i >= 0; i--) {
      const p = L[i]
      p.age += dt
      if (p.age >= p.life) {
        L.splice(i, 1)
        continue
      }
      if (p.g) p.vy += p.g * dt
      if (p.drag) {
        p.vx *= 1 - p.drag * dt
        p.vy *= 1 - p.drag * dt
      }
      p.x += p.vx * dt + (p.sway ? Math.sin(p.age * 6 + p.x) * 0.15 : 0)
      p.y += p.vy * dt
    }
  }
  draw(ctx) {
    for (const glow of [false, true]) {
      ctx.globalCompositeOperation = glow ? 'lighter' : 'source-over'
      for (const p of this.list) {
        if (!!p.glow !== glow) continue
        const k = p.age / p.life
        const c = p.cols[Math.min(p.cols.length - 1, Math.floor(k * p.cols.length))]
        let a = (p.alpha ?? 1) * (1 - k * 0.6)
        if (p.twinkle) a *= 0.5 + 0.5 * Math.sin(p.age * 30)
        ctx.globalAlpha = Math.max(0, a)
        ctx.fillStyle = c
        const sz = p.size
        ctx.fillRect(
          this.snap ? Math.round(p.x - sz / 2) : p.x - sz / 2,
          this.snap ? Math.round(p.y - sz / 2) : p.y - sz / 2,
          sz,
          sz
        )
      }
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }
}

/* ---------- Auras drawn behind a sprite ---------- */
// A glow is [x, y, colour, radius, part?]: with part 'head' it moves with the head (head + body pose
// offsets of the frame shown), with 'body' with the body; without one it stays on the sprite grid.
function glowShift(pose, part) {
  if (!pose || !part) return [0, 0]
  const b = pose.body || [0, 0],
    h = pose.head || [0, 0]
  return part === 'head' ? [b[0] + h[0], b[1] + h[1]] : part === 'body' ? b : [0, 0]
}
function drawGlows(ctx, def, x, y, sx, sy, flip, t, alpha = 1, img = null) {
  if (!def.glows) return
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  def.glows.forEach(([gx0, gy0, col, r, part], i) => {
    const [dx, dy] = glowShift(img && img.pose, part),
      gx = gx0 + dx,
      gy = gy0 + dy
    const px = x + (flip ? def.size - gx : gx) * sx,
      py = y + gy * sy,
      rr = r * (1 + 0.25 * Math.sin(t * 3 + i * 1.7))
    const g = ctx.createRadialGradient(px, py, 0, px, py, rr)
    g.addColorStop(0, col)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.globalAlpha = 0.55 * alpha
    ctx.fillStyle = g
    ctx.fillRect(px - rr, py - rr, rr * 2, rr * 2)
  })
  ctx.restore()
}
function drawAura(ctx, a, ox, oy, t, flip, w) {
  const x = ox + (flip ? w - a.x : a.x),
    y = oy + a.y
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  if (a.type === 'sun' || a.type === 'twin') {
    const rings =
      a.type === 'twin'
        ? [
            [a.r, 1],
            [a.r * 0.66, -1.6],
          ]
        : [[a.r, 1]]
    for (const [r, spd] of rings) {
      const n = 14
      ctx.globalAlpha = 0.55 + 0.2 * Math.sin(t * 3)
      for (let i = 0; i < n; i++) {
        const ang = t * 0.6 * spd + (i * Math.PI * 2) / n
        for (let d = r - 2; d <= r + (i % 2 ? 5 : 3); d++) {
          ctx.fillStyle = d > r + 2 ? '#ff9a2a' : '#ffd04a'
          ctx.fillRect(Math.round(x + Math.cos(ang) * d), Math.round(y + Math.sin(ang) * d), 1, 1)
        }
      }
      ctx.globalAlpha = 0.35
      ctx.strokeStyle = '#ffc444'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(x, y, r - 3, 0, Math.PI * 2)
      ctx.stroke()
    }
  } else if (a.type === 'ripple' || a.type === 'whirl') {
    ctx.globalAlpha = 0.55
    ctx.strokeStyle = '#a0dcff'
    ctx.lineWidth = 1
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.5 + i / 3) % 1
      ctx.globalAlpha = 0.6 * (1 - k)
      ctx.beginPath()
      ctx.ellipse(x, y, a.r * (0.4 + k * 0.8), a.r * 0.3 * (0.4 + k * 0.8), 0, 0, 7)
      ctx.stroke()
    }
    if (a.type === 'whirl')
      for (let i = 0; i < 16; i++) {
        const an = t * 2.4 + i * 0.63,
          r = a.r * (0.5 + (i % 3) * 0.2)
        ctx.globalAlpha = 0.8
        ctx.fillStyle = i % 2 ? '#ffffff' : '#7ee7ff'
        ctx.fillRect(x + Math.cos(an) * r, y + Math.sin(an) * r * 0.3, 2, 1)
      }
  } else if (a.type === 'twinw') {
    for (const [r, spd, col] of [
      [a.r, 1, '#7ee7ff'],
      [a.r * 0.7, -1.6, '#f4c85a'],
    ])
      for (let i = 0; i < 40; i++) {
        const an = t * 1.1 * spd - i * 0.08 * spd,
          px = x + Math.cos(an) * r,
          py = y + Math.sin(an) * r * 0.36 + Math.sin(an * 3 + t) * 2
        ctx.globalAlpha = 0.7 * (1 - i / 40)
        ctx.fillStyle = i < 3 ? '#ffffff' : col
        ctx.fillRect(px, py, 2, 2)
      }
  } else if (a.type === 'twinx') {
    // cross-line fused forms (hybrid.js): the twin rings in the colours of both parent lines
    for (const [r, spd, col] of [
      [a.r, 1, a.cols[0]],
      [a.r * 0.7, -1.6, a.cols[1]],
    ])
      for (let i = 0; i < 40; i++) {
        const an = t * 1.1 * spd - i * 0.08 * spd,
          px = x + Math.cos(an) * r,
          py = y + Math.sin(an) * r * 0.36 + Math.sin(an * 3 + t) * 2
        ctx.globalAlpha = 0.7 * (1 - i / 40)
        ctx.fillStyle = i < 3 ? '#ffffff' : col
        ctx.fillRect(px, py, 2, 2)
      }
  } else if (a.type === 'ribbons') {
    for (const off of [0, Math.PI])
      for (let i = 0; i < 46; i++) {
        const an = t * 1.3 + off - i * 0.07,
          px = x + Math.cos(an) * a.r,
          py = y + Math.sin(an) * a.r * 0.38 + Math.sin(an * 2 + t * 2) * 5
        ctx.globalAlpha = 0.75 * (1 - i / 46)
        ctx.fillStyle = i < 4 ? '#ffffff' : i % 3 ? '#7ee7ff' : '#c8f4ff'
        ctx.fillRect(px, py, 2, 2)
      }
  } else if (a.type === 'leaves' || a.type === 'twinl') {
    const rings =
      a.type === 'twinl'
        ? [
            [a.r, 1, ['#6aff6a', '#b0f490']],
            [a.r * 0.7, -1.5, ['#f4c85a', '#fff0a0']],
          ]
        : [[a.r, 1, ['#4cc44a', '#b0f490', '#26942e']]]
    for (const [r, spd, cols] of rings)
      for (let i = 0; i < 22; i++) {
        const an = t * 0.9 * spd + (i * TAU) / 22,
          px = Math.round(x + Math.cos(an) * r),
          py = Math.round(y + Math.sin(an) * r * 0.34 - (i % 3) * 1.5 + Math.sin(t * 2 + i) * 1.5)
        ctx.globalAlpha = 0.55 + 0.35 * Math.sin(an * 2 + t * 3)
        ctx.fillStyle = cols[i % cols.length]
        ctx.fillRect(px, py, 2, 1)
        ctx.fillRect(px + (Math.cos(an) > 0 ? 1 : 0), py - 1, 1, 1)
      }
  } else if (a.type === 'bossl') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, a.r * 1.4)
    g.addColorStop(0, 'rgba(110,230,90,.38)')
    g.addColorStop(1, 'rgba(40,160,40,0)')
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 2)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, a.r * 1.5, a.r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (a.type === 'sparks' || a.type === 'twinb') {
    const rings =
      a.type === 'twinb'
        ? [
            [a.r, 1, '#ffe14a'],
            [a.r * 0.7, -1.5, '#9cc4ff'],
          ]
        : [[a.r, 1, '#ffe14a']]
    for (const [r, spd, col] of rings)
      for (let i = 0; i < 6; i++) {
        const an = t * 0.9 * spd + (i * TAU) / 6,
          px = x + Math.cos(an) * r,
          py = y + Math.sin(an) * r * 0.32
        ctx.globalAlpha = 0.55 + 0.4 * Math.sin(t * 9 + i * 2)
        ctx.fillStyle = col
        let qx = px,
          qy = py
        for (let k = 0; k < 4; k++) {
          const nx = qx + ((k + i) % 2 ? 2 : -2),
            ny = qy - 2
          ctx.fillRect(Math.round(Math.min(qx, nx)), Math.round(ny), 2, 1)
          ctx.fillRect(Math.round(nx), Math.round(ny), 1, 2)
          qx = nx
          qy = ny
        }
      }
  } else if (a.type === 'halo') {
    // a sun wheel behind the head: two dotted rings turning opposite ways and short rays
    for (const [r, spd, n] of [
      [a.r, 0.5, 20],
      [a.r * 0.7, -0.8, 14],
    ])
      for (let i = 0; i < n; i++) {
        const an = t * spd + (i * TAU) / n
        ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 2 + i)
        ctx.fillStyle = i % 2 ? '#fff6c8' : '#ffd84a'
        ctx.fillRect(Math.round(x + Math.cos(an) * r), Math.round(y + Math.sin(an) * r), 1, 1)
      }
    for (let i = 0; i < 12; i++) {
      const an = -t * 0.2 + (i * TAU) / 12
      ctx.globalAlpha = 0.35
      ctx.fillStyle = '#fff0a0'
      for (let d = a.r + 2; d < a.r + (i % 2 ? 5 : 8); d++)
        ctx.fillRect(Math.round(x + Math.cos(an) * d), Math.round(y + Math.sin(an) * d), 1, 1)
    }
  } else if (a.type === 'motes' || a.type === 'twinh') {
    const rings =
      a.type === 'twinh'
        ? [
            [a.r, 1, ['#ffd84a', '#fff0a0']],
            [a.r * 0.7, -1.5, ['#ffffff', '#bcdcf8']],
          ]
        : [[a.r, 1, ['#fff6c8', '#ffd84a', '#ffffff']]]
    for (const [r, spd, cols] of rings)
      for (let i = 0; i < 20; i++) {
        const an = t * 0.8 * spd + (i * TAU) / 20,
          px = Math.round(x + Math.cos(an) * r),
          py = Math.round(y + Math.sin(an) * r * 0.32 - (i % 3) * 2 - ((t * 6 + i * 3) % 8))
        ctx.globalAlpha = 0.45 + 0.4 * Math.sin(t * 4 + i * 1.3)
        ctx.fillStyle = cols[i % cols.length]
        ctx.fillRect(px, py, 1, 1)
        if (i % 4 === 0) {
          ctx.fillRect(px - 1, py, 3, 1)
          ctx.fillRect(px, py - 1, 1, 3)
        }
      }
  } else if (a.type === 'nightm' || a.type === 'twind') {
    const rings =
      a.type === 'twind'
        ? [
            [a.r, 1, ['#a04ae8', '#e4b8ff']],
            [a.r * 0.7, -1.5, ['#ff3a4a', '#ff9a9a']],
          ]
        : [[a.r, 1, ['#a04ae8', '#c47aff', '#4a5aa8']]]
    for (const [r, spd, cols] of rings)
      for (let i = 0; i < 18; i++) {
        const an = t * 0.7 * spd + (i * TAU) / 18,
          px = Math.round(x + Math.cos(an) * r),
          py = Math.round(y + Math.sin(an) * r * 0.32 - (i % 3) - ((t * 4 + i * 2) % 6))
        ctx.globalAlpha = 0.4 + 0.4 * Math.sin(t * 3 + i * 1.7)
        ctx.fillStyle = cols[i % cols.length]
        ctx.fillRect(px, py, i % 3 ? 1 : 2, 1)
        if (i % 6 === 0) {
          ctx.fillRect(px - 2, py - 1, 2, 1)
          ctx.fillRect(px + 2, py - 1, 2, 1)
        }
      }
  } else if (a.type === 'shadm' || a.type === 'twins') {
    const rings =
      a.type === 'twins'
        ? [
            [a.r, 1, ['#a04aff', '#f0d8ff']],
            [a.r * 0.7, -1.5, ['#d08aff', '#8c82a8']],
          ]
        : [[a.r, 1, ['#a04aff', '#8c82a8', '#f0d8ff']]]
    for (const [r, spd, cols] of rings)
      for (let i = 0; i < 18; i++) {
        const an = t * 0.7 * spd + (i * TAU) / 18,
          px = Math.round(x + Math.cos(an) * r),
          py = Math.round(y + Math.sin(an) * r * 0.32 - (i % 3) - ((t * 4 + i * 2) % 6))
        ctx.globalAlpha = 0.4 + 0.4 * Math.sin(t * 3 + i * 1.7)
        ctx.fillStyle = cols[i % cols.length]
        ctx.fillRect(px, py, i % 3 ? 1 : 2, 1)
        if (i % 6 === 0) {
          ctx.fillRect(px - 2, py - 1, 2, 1)
          ctx.fillRect(px + 2, py - 1, 2, 1)
        }
      }
  } else if (a.type === 'bosss') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, a.r * 1.4)
    g.addColorStop(0, 'rgba(160,74,255,.4)')
    g.addColorStop(1, 'rgba(50,20,100,0)')
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 1.8)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, a.r * 1.5, a.r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (a.type === 'bossd') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, a.r * 1.4)
    g.addColorStop(0, 'rgba(160,74,232,.45)')
    g.addColorStop(1, 'rgba(60,20,90,0)')
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 1.8)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, a.r * 1.5, a.r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (a.type === 'bossh') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, a.r * 1.4)
    g.addColorStop(0, 'rgba(255,230,140,.4)')
    g.addColorStop(1, 'rgba(255,200,80,0)')
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 2)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, a.r * 1.5, a.r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (a.type === 'bossb') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, a.r * 1.4)
    g.addColorStop(0, 'rgba(255,225,74,.32)')
    g.addColorStop(1, 'rgba(90,100,160,0)')
    ctx.globalAlpha = 0.75
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, a.r * 1.5, a.r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (a.type === 'dust' || a.type === 'twine') {
    const rings =
      a.type === 'twine'
        ? [
            [a.r, 1, ['#ffa02a', '#ffe4a0']],
            [a.r * 0.7, -1.5, ['#f4c85a', '#fff0a0']],
          ]
        : [[a.r, 1, ['#c4a06a', '#e2c492', '#9a7a4a']]]
    for (const [r, spd, cols] of rings)
      for (let i = 0; i < 24; i++) {
        const an = t * 0.7 * spd + (i * TAU) / 24,
          px = Math.round(x + Math.cos(an) * r),
          py = Math.round(y + Math.sin(an) * r * 0.32 - (i % 3))
        ctx.globalAlpha = 0.5 + 0.3 * Math.sin(an * 2 + t * 2)
        ctx.fillStyle = cols[i % cols.length]
        ctx.fillRect(px, py, i % 4 ? 1 : 2, 1)
      }
  } else if (a.type === 'bosse') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, a.r * 1.4)
    g.addColorStop(0, 'rgba(255,160,42,.36)')
    g.addColorStop(1, 'rgba(150,90,30,0)')
    ctx.globalAlpha = 0.75
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, a.r * 1.5, a.r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (a.type === 'bossw') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, a.r * 1.4)
    g.addColorStop(0, 'rgba(60,180,255,.4)')
    g.addColorStop(1, 'rgba(20,120,255,0)')
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 2.2)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, a.r * 1.5, a.r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (a.type === 'boss') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, a.r * 1.4)
    g.addColorStop(0, 'rgba(255,90,20,.45)')
    g.addColorStop(1, 'rgba(255,40,0,0)')
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 2.4)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, a.r * 1.5, a.r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/* ---------- Gallery cards (each card animates its own sprite) ---------- */
const FLAME_LINE = [
  {
    stage: 'ไข่',
    items: [{ id: 'egg', name: 'ไข่เพลิง', old: 'คงชื่อเดิม · มีรอยร้าวเรืองไฟ', st: 'keep' }],
  },
  {
    stage: 'ร่างเด็ก 1',
    items: [{ id: 'wisp', name: 'ประกายจิ๋ว', old: 'คงชื่อเดิม · เปลวไฟมีตา', st: 'keep' }],
  },
  {
    stage: 'ร่างเด็ก 2',
    items: [{ id: 'coal', name: 'ถ่านน้อย', old: 'คงชื่อเดิม · ก้อนถ่านมีขา', st: 'keep' }],
  },
  {
    stage: 'โตเต็มวัย',
    items: [
      { id: 'gecko', name: 'เพลิงจอมซน', old: 'คงชื่อเดิม · กิ้งก่าหางไฟ', st: 'keep' },
      { id: 'smoke', name: 'ควันกรุ่น', old: 'คงชื่อเดิม · ร่างแย่ กิ้งก่าควันง่วง', st: 'keep' },
      {
        id: 'raptor',
        name: 'เพลิงนักรบ',
        old: 'คงชื่อเดิม · ไดโนสองขา สีแดงเข้มลายดำ',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'สมบูรณ์',
    items: [
      {
        id: 'frill',
        name: 'อัคนีแผงคอ',
        old: 'เดิม อัคนีพยัคฆ์ 🐯 (เสือ ไม่เข้าสาย) · กิ้งก่าทรายแผงคอไฟ',
        st: 'new',
      },
      { id: 'lava', name: 'ลาวาอ้วน', old: 'คงชื่อเดิม · ร่างแย่ ตัวลาวาขี้เกียจ', st: 'keep' },
      {
        id: 'dragon',
        name: 'มังกรเพลิงรบ',
        old: 'คงชื่อเดิม · ตัวสีถ่านดำมีเส้นลาวา เกราะทอง',
        st: 'tweak',
      },
    ],
  },
  {
    stage: 'ร่างสุดท้าย',
    items: [
      {
        id: 'sunking',
        name: 'ราชันมังกรสุริยะ',
        old: 'เดิม ราชาสุริยะ ☀️ (เป็นดวงอาทิตย์) · มังกรสีขาวงาช้าง อกเกราะทอง',
        st: 'new',
      },
      {
        id: 'phoenix',
        name: 'มังกรปีกฟีนิกซ์',
        old: 'เดิม ฟีนิกซ์อมตะ 🦅 (นก ไม่ใช่สัตว์เลื้อยคลาน) · ตัวสีชมพูแดง ปีกไฟ',
        st: 'new',
      },
    ],
  },
]
// Which stage every design is, so cards, the line-up and the battle HUD can say it.
const RAID_STAGE = {
  lavaking: 'boss',
  abyssfish: 'boss',
  raidseraph: 'boss',
  vampire: 'boss',
  nameless: 'boss',
}
const STAGES = {
  egg: ['ไข่', '', '#a49cb4'],
  b1: ['ร่างเด็ก 1', '★', '#7ac8f0'],
  b2: ['ร่างเด็ก 2', '★', '#7ac8f0'],
  adult: ['โตเต็มวัย', '★★', '#5ad38a'],
  perfect: ['ร่างสมบูรณ์', '★★★', '#ffc94a'],
  ultimate: ['ร่างสุดท้าย', '★★★★', '#ff8a4a'],
  fused: ['ร่างผสม', '★★★★★', '#d08aff'],
  boss: ['บอส', '', '#ff5a5a'],
}
// Adventure enemies show the stage they fight at in the game (adventure-data.ts); area bosses included.
const ADV_STAGE = {
  advworm: 'b1',
  advcrab: 'b2',
  advbat: 'b2',
  advrabbit: 'adult',
  advgull: 'adult',
  advscorp: 'adult',
  advturtle: 'adult',
  advmshark: 'perfect',
  advsnake: 'perfect',
  advboar: 'perfect',
  adveagle: 'perfect',
  advdragon: 'ultimate',
  advbeetle: 'ultimate',
  advcbat: 'ultimate',
  advant: 'ultimate',
  advgolem: 'ultimate',
  advsquirrel: 'ultimate',
  advgoat: 'ultimate',
  advhawk: 'ultimate',
  advpeacock: 'ultimate',
}
const STAGE_OF = {
  ...RAID_STAGE,
  ...ADV_STAGE,
  egg: 'egg',
  wisp: 'b1',
  coal: 'b2',
  gecko: 'adult',
  smoke: 'adult',
  raptor: 'adult',
  frill: 'perfect',
  lava: 'perfect',
  dragon: 'perfect',
  sunking: 'ultimate',
  phoenix: 'ultimate',
  avatar: 'fused',
  boss: 'boss',
  whaleA: 'ultimate',
  whaleB: 'ultimate',
  whaleC: 'ultimate',
  wfused: 'fused',
  segg: 'egg',
  wbaby: 'b1',
  kbaby: 'b2',
  knight: 'adult',
  shyghost: 'adult',
  lantern: 'adult',
  knight2: 'perfect',
  mistblob: 'perfect',
  soulwraith: 'perfect',
  knightlord: 'ultimate',
  wraithlord: 'ultimate',
  sfused: 'fused',
  sboss: 'boss',
  degg: 'egg',
  mote: 'b1',
  batling: 'b2',
  spider: 'adult',
  rat: 'adult',
  vampbat: 'adult',
  eyespider: 'perfect',
  zrat: 'perfect',
  batlord: 'perfect',
  spiderqueen: 'ultimate',
  batemperor: 'ultimate',
  dfused: 'fused',
  darksoul: 'boss',
  hegg: 'egg',
  glint: 'b1',
  lamb: 'b2',
  wingsheep: 'adult',
  cherub: 'adult',
  lioncub: 'adult',
  qilin: 'perfect',
  bellcrab: 'perfect',
  winglion: 'perfect',
  sunqilin: 'ultimate',
  lionking: 'ultimate',
  hfused: 'fused',
  holyele: 'boss',
  begg: 'egg',
  spark: 'b1',
  cloudpuff: 'b2',
  tbird: 'adult',
  staticcat: 'adult',
  stormfox: 'adult',
  hawk: 'perfect',
  gloomcloud: 'perfect',
  boltfox: 'perfect',
  thunderking: 'ultimate',
  foxking: 'ultimate',
  bfused: 'fused',
  stormbison: 'boss',
  eegg: 'egg',
  pebble: 'b1',
  clay: 'b2',
  tortoise: 'adult',
  worm: 'adult',
  rhino: 'adult',
  pillarturtle: 'perfect',
  boulder: 'perfect',
  orerhino: 'perfect',
  mountturtle: 'ultimate',
  crystalrhino: 'ultimate',
  efused: 'fused',
  pangolin: 'boss',
  legg: 'egg',
  seed: 'b1',
  sprout: 'b2',
  leafdeer: 'adult',
  mushroom: 'adult',
  wolf: 'adult',
  stag: 'perfect',
  stump: 'perfect',
  barkwolf: 'perfect',
  forestdeer: 'ultimate',
  wolfking: 'ultimate',
  lfused: 'fused',
  flora: 'boss',
  wegg: 'egg',
  drop: 'b1',
  bubble: 'b2',
  swordwhale: 'adult',
  jelly: 'adult',
  shark: 'adult',
  armorwhale: 'perfect',
  octopus: 'perfect',
  seadragon: 'perfect',
  whaleking: 'ultimate',
  leviathan: 'ultimate',
  turtle: 'boss',
}
const rankHtml = (id) => {
  const [n, st, c] = STAGES[STAGE_OF[id]]
  return `<span class="rank" style="--c:${c}">${n}${st ? ' <b>' + st + '</b>' : ''}</span>`
}
const CARD_PX = 96 // every evolution card draws at the same pixel scale, so bigger forms look bigger
const STATUS_LABEL = { keep: 'คงแนวเดิม', tweak: 'ปรับ', new: 'ออกแบบใหม่' }
const cards = []
function addCard(canvas, id, label, pad = 8, still = false) {
  const def = SPRITES[id]
  const size = def.size + pad * 2
  canvas.width = canvas.width || size
  canvas.height = canvas.height || size
  cards.push({
    canvas,
    ctx: canvas.getContext('2d'),
    def,
    ps: Object.assign(new PSys(), { snap: true }),
    acc: {},
    t: Math.random() * 5,
    label,
    step: -1,
    stepT: 0,
    still,
  })
}
// Each card shows the moves in turn: stand, walk, attack, skill.
const SHOW = [
  ['idle', 1.4, 'ยืน'],
  ['walk', 1.8, 'เดิน'],
  ['attack', 1.1, 'โจมตี'],
  ['cast', 1.5, 'ใช้สกิล'],
]
// Eggs cannot fight, so their cards only stand; still drafts show one frame.
const EGG_SHOW = [['idle', 99, 'ไข่ยังไม่มีท่าต่อสู้']],
  STILL_SHOW = [['idle', 99, 'ภาพนิ่ง (รอเลือกแบบ)']]
const WATER_LINE = [
  {
    stage: 'ไข่',
    items: [{ id: 'wegg', name: 'ไข่วารี', old: 'คงชื่อเดิม · ลายคลื่นสีฟ้า', st: 'keep' }],
  },
  {
    stage: 'ร่างเด็ก 1',
    items: [{ id: 'drop', name: 'หยดน้ำ', old: 'คงชื่อเดิม · หยดน้ำมีตา ลอยได้', st: 'keep' }],
  },
  {
    stage: 'ร่างเด็ก 2',
    items: [
      {
        id: 'bubble',
        name: 'ฟองจิ๋ว',
        old: 'คงชื่อเดิม · ฟองน้ำแก้มชมพู มีฟองลูกลอยตาม',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'โตเต็มวัย',
    items: [
      {
        id: 'swordwhale',
        name: 'ลูกวาฬดาบ',
        old: 'เดิม ปลาดาบน้อย 🐟 · วาฬน้ำเงินจมูกดาบ ต่อไปถึงวาฬเกราะได้',
        st: 'new',
      },
      {
        id: 'jelly',
        name: 'แมงกะพรุนขี้เซา',
        old: 'คงชื่อเดิม · ร่างแย่ สีชมพูม่วง หนวดไฟฟ้า',
        st: 'keep',
      },
      { id: 'shark', name: 'ฉลามหนาม', old: 'คงชื่อเดิม · เพิ่มท่าว่ายและอ้าปาก', st: 'keep' },
    ],
  },
  {
    stage: 'สมบูรณ์',
    items: [
      {
        id: 'armorwhale',
        name: 'วาฬเกราะ',
        old: 'คงชื่อเดิม · สีเทาฟ้า เกราะเหล็กบนหลัง พ่นละอองน้ำ',
        st: 'keep',
      },
      {
        id: 'octopus',
        name: 'หมึกขี้เกียจ',
        old: 'คงชื่อเดิม · ร่างแย่ หมึกเขียวน้ำทะเลตาปรือ',
        st: 'keep',
      },
      {
        id: 'seadragon',
        name: 'มังกรทะเลลึก',
        old: 'คงชื่อเดิม · ตัวยาวคดเคี้ยว ครีบเรืองแสง',
        st: 'tweak',
      },
    ],
  },
  {
    stage: 'ร่างสุดท้าย',
    items: [
      {
        id: 'whaleC',
        name: 'ราชาวาฬผลึก',
        old: 'เดิม เจ้าสมุทร 🔱 (เป็นอาวุธ) · วาฬสีม่วงคราม เขาผลึกเรืองแสง ครีบข้างลำตัว เกราะหนาบนหลัง',
        st: 'new',
      },
      {
        id: 'leviathan',
        name: 'เลวีอาธานคลื่นคลั่ง',
        old: 'เดิม เทพีสายน้ำ 🧜 (เป็นคน) · มังกรทะเลขดตัวในน้ำวน',
        st: 'new',
      },
    ],
  },
]
function buildBoard(el, line, still = false) {
  for (const col of line) {
    const c = document.createElement('div')
    c.className = 'evo-col'
    c.innerHTML = `<div class="evo-head">${col.stage}</div>`
    for (const it of col.items) {
      const card = document.createElement('div')
      card.className = 'card'
      const cv = document.createElement('canvas')
      cv.width = CARD_PX
      cv.height = CARD_PX
      cv.setAttribute('aria-label', it.name)
      card.append(cv)
      const act = document.createElement('div')
      act.className = 'act'
      card.append(act)
      card.insertAdjacentHTML(
        'beforeend',
        `${rankHtml(it.id)}<div class="nm">${it.name}</div><span class="chip ${it.st}">${STATUS_LABEL[it.st]}</span><div class="old">${it.old}</div>`
      )
      c.append(card)
      addCard(cv, it.id, act, 8, still)
    }
    el.append(c)
  }
}
buildBoard(document.getElementById('evo-water'), WATER_LINE)
const EARTH_LINE = [
  {
    stage: 'ไข่',
    items: [
      {
        id: 'eegg',
        name: 'ไข่ศิลา',
        old: 'คงชื่อเดิม · เปลือกสีทราย มีเศษหินติด รอยร้าวเรืองสีอำพัน',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'ร่างเด็ก 1',
    items: [
      {
        id: 'pebble',
        name: 'ก้อนกรวด',
        old: 'คงชื่อเดิม · ก้อนกรวดกลมมีตา เท้าเป็นกรวดเม็ดเล็ก',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'ร่างเด็ก 2',
    items: [
      {
        id: 'clay',
        name: 'ก้อนดินเหนียว',
        old: 'คงชื่อเดิม · ก้อนดินเหนียวสีอิฐ มีรอยนิ้วกด มีกรวดฝังหัว',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'โตเต็มวัย',
    items: [
      {
        id: 'tortoise',
        name: 'เต่าศิลา',
        old: 'คงชื่อเดิม · เต่าบก กระดองโดมมีแผ่นหินหกเหลี่ยม',
        st: 'keep',
      },
      {
        id: 'worm',
        name: 'หนอนดินเกียจคร้าน',
        old: 'คงชื่อเดิม · ร่างแย่ ไส้เดือนอ้วนนอนหลับ มีก้อนดินรอบตัว',
        st: 'keep',
      },
      {
        id: 'rhino',
        name: 'แรดผา',
        old: 'คงชื่อเดิม · แรดตัวป้อม เขาเป็นหิน มีแผ่นหินบนหลัง',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'สมบูรณ์',
    items: [
      {
        id: 'pillarturtle',
        name: 'เต่าผาหิน',
        old: 'เดิม หมีหินผา 🐻 (หมี ไม่ต่อจากเต่า) · เต่าที่มีแท่งหินผาตั้งบนกระดอง',
        st: 'new',
      },
      {
        id: 'boulder',
        name: 'ก้อนหินขี้เกียจ',
        old: 'คงชื่อเดิม · ร่างแย่ ก้อนหินกลมโตมีขา มอสและดอกไม้บนหัว หลับน้ำลายไหล',
        st: 'keep',
      },
      {
        id: 'orerhino',
        name: 'แรดเกราะแร่',
        old: 'เดิม เม่นแร่เหล็ก 🦔 (เม่น ไม่ต่อจากแรด) · แรดเกราะแร่เหล็กเงา เส้นแร่ทองแดง เขาเหล็กสองเขา',
        st: 'new',
      },
    ],
  },
  {
    stage: 'ร่างสุดท้าย',
    items: [
      {
        id: 'mountturtle',
        name: 'เต่าภูเขา',
        old: 'เดิม เจ้าธรณี 🏔️ (เป็นภูเขา) · เต่ายักษ์แบกภูเขาหิมะ มีต้นสนและลำธาร',
        st: 'new',
      },
      {
        id: 'crystalrhino',
        name: 'ไททันแรดคริสตัล',
        old: 'เดิม ไททันคริสตัล 💠 (เป็นผลึก) · แรดยักษ์ เขาเป็นผลึกบุษราคัมเรืองแสง มีผลึกงอกบนหลัง',
        st: 'new',
      },
    ],
  },
]
buildBoard(document.getElementById('evo-earth'), EARTH_LINE)
const BOLT_LINE = [
  {
    stage: 'ไข่',
    items: [
      {
        id: 'begg',
        name: 'ไข่อสนี',
        old: 'คงชื่อเดิม · เปลือกขาวเมฆ มีแถบเมฆพายุและสายฟ้าซิกแซกรอบไข่',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'ร่างเด็ก 1',
    items: [
      {
        id: 'spark',
        name: 'ประกายไฟฟ้า',
        old: 'คงชื่อเดิม · ลูกไฟฟ้ารูปดาวมีตา ลอยได้ เรืองเหลือง',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'ร่างเด็ก 2',
    items: [
      {
        id: 'cloudpuff',
        name: 'ลูกเมฆฟ้า',
        old: 'คงชื่อเดิม · ก้อนเมฆปุยมีตา ท้องเป็นเมฆฝน หางเป็นสายฟ้าเล็กๆ',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'โตเต็มวัย',
    items: [
      {
        id: 'tbird',
        name: 'นกฟ้าผ่า',
        old: 'คงชื่อเดิม · นกสีน้ำเงิน หงอนเป็นสายฟ้า ปีกมีลายฟ้าผ่า',
        st: 'keep',
      },
      {
        id: 'staticcat',
        name: 'แมวไฟสถิต',
        old: 'คงชื่อเดิม · ร่างแย่ แมวขนฟูพองทั้งตัวเพราะไฟฟ้าสถิต ตาโตตกใจ มีประกายไฟรอบตัว',
        st: 'keep',
      },
      {
        id: 'stormfox',
        name: 'จิ้งจอกพายุ',
        old: 'เดิม เสือพายุ 🐆 (เปลี่ยนสายเสือเป็นสายจิ้งจอก) · ลูกจิ้งจอกสีกรมท่า หูใหญ่ ลายสายฟ้าสีเหลือง หางฟูซิกแซกปลายเป็นสายฟ้า',
        st: 'new',
      },
    ],
  },
  {
    stage: 'สมบูรณ์',
    items: [
      {
        id: 'hawk',
        name: 'เหยี่ยวพายุ',
        old: 'เดิม ม้าอสนี 🦄 (ม้า ไม่ต่อจากนก) · เหยี่ยวสีม่วงคราม กางปีกมีเส้นฟ้าผ่า ปากและเล็บทอง',
        st: 'new',
      },
      {
        id: 'gloomcloud',
        name: 'เมฆหม่นขี้เกียจ',
        old: 'คงชื่อเดิม · ร่างแย่ ก้อนเมฆฝนสีเทาหลับ ฝนตกปรอยใต้ตัว ฟ้าแลบเล็กๆ',
        st: 'keep',
      },
      {
        id: 'boltfox',
        name: 'จิ้งจอกอสนี',
        old: 'คงชื่อเดิม 🦊 · จิ้งจอกสีทอง ขาและปลายหูกรมท่า สองหางซิกแซกเป็นสายฟ้า',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'ร่างสุดท้าย',
    items: [
      {
        id: 'thunderking',
        name: 'วิหคราชาอสนี',
        old: 'เดิม ราชาอสนี 🌪️ (เป็นพายุหมุน) · นกยักษ์ ปีกเป็นเมฆพายุมีสายฟ้าวิ่ง หงอนเป็นสายฟ้า หางยาว',
        st: 'new',
      },
      {
        id: 'foxking',
        name: 'ราชาจิ้งจอกอสนี',
        old: 'เดิม วัชรเทพ 🌀 (เป็นสัญลักษณ์) · จิ้งจอกยักษ์สีกรมท่า ห้าหางเป็นสายฟ้าแผ่ขึ้นหลังตัว แผงคอเป็นเมฆพายุ มงกุฎทองบนหน้าผาก',
        st: 'new',
      },
    ],
  },
]
buildBoard(document.getElementById('evo-bolt'), BOLT_LINE)
const HOLY_LINE = [
  {
    stage: 'ไข่',
    items: [
      {
        id: 'hegg',
        name: 'ไข่รัศมี',
        old: 'คงชื่อเดิม · เปลือกขาวงาช้าง คาดลายทองมีอัญมณี ปีกขนนกเล็กสองข้าง วงรัศมีลอยเหนือไข่',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'ร่างเด็ก 1',
    items: [
      {
        id: 'glint',
        name: 'ประกายแสง',
        old: 'คงชื่อเดิม · ลูกแสงมีตา แฉกแสงยาวบนล่าง ปีกขนนกจิ๋ว ลอยได้',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'ร่างเด็ก 2',
    items: [
      {
        id: 'lamb',
        name: 'ลูกแกะแสง',
        old: 'คงชื่อเดิม · ลูกแกะขนปุยขาว เขาม้วนทองเล็กๆ กีบทอง',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'โตเต็มวัย',
    items: [
      {
        id: 'wingsheep',
        name: 'แกะปีกทิพย์',
        old: 'เดิม นกพิราบทิพย์ 🕊️ (นก ไม่ต่อจากลูกแกะ) · แกะขาวขนมีประกายทอง ปีกขนนกบนหลัง เขาม้วนทอง วงรัศมีเหนือหัว',
        st: 'new',
      },
      {
        id: 'cherub',
        name: 'ทูตน้อยขี้เซา',
        old: 'คงชื่อ ปรับร่าง เดิมเป็นเด็กทูตสวรรค์ 👼 (เป็นคน) · ร่างแย่ ก้อนขนปุยมีปีกจิ๋ว ลอยหลับ น้ำลายเป็นฟอง วงรัศมีเอียงหลุด',
        st: 'tweak',
      },
      {
        id: 'lioncub',
        name: 'สิงห์น้อยรัศมี',
        old: 'เดิม อัศวินรัศมี 🛡️ (คนถือโล่) · ลูกสิงห์สีครีม แผงคอเป็นแฉกแสงทองสลับขาว ปลายหางทอง',
        st: 'new',
      },
    ],
  },
  {
    stage: 'สมบูรณ์',
    items: [
      {
        id: 'qilin',
        name: 'กิเลนรัศมี',
        old: 'เดิม เทพธิดารัศมี 👸 (เป็นคน) · กิเลนขาว เกล็ดทองตามสันหลัง เขาทองเดียว แผงคอและหางเป็นเมฆฟ้า กีบทอง',
        st: 'new',
      },
      {
        id: 'bellcrab',
        name: 'ระฆังแตก',
        old: 'คงชื่อ ปรับร่าง เดิมเป็นระฆัง 🔔 (สิ่งของ) · ร่างแย่ ปูเสฉวนง่วงๆ อาศัยในระฆังสำริดร้าว ขอบระฆังบิ่น',
        st: 'tweak',
      },
      {
        id: 'winglion',
        name: 'ราชสีห์ปีกขาว',
        old: 'เดิม เซราฟปีกขาว 😇 (เป็นคน) · สิงโตสีครีม แผงคอแสงใหญ่ขึ้น ปีกขาวหกปีก (ข้างละสาม) ตาทอง',
        st: 'new',
      },
    ],
  },
  {
    stage: 'ร่างสุดท้าย',
    items: [
      {
        id: 'sunqilin',
        name: 'กิเลนสุริยเทพ',
        old: 'เดิม เจ้าแห่งแสงสว่าง 🌞 (เป็นดวงอาทิตย์) · กิเลนยักษ์ เกล็ดทองเต็มหลัง เขาเรืองแสง แผงคอยาว วงแสงซ้อนสองชั้นหมุนอยู่หลังหัว',
        st: 'new',
      },
      {
        id: 'lionking',
        name: 'มหาราชสีห์เทวะ',
        old: 'เดิม มหาเทวทูต 👑 (เป็นคน) · สิงโตยักษ์ สวมมงกุฎทองฝังอัญมณี แผงคอแสงใหญ่ ปีกขนนกกับปีกแสงซ้อนกัน กำไลทองที่ขา',
        st: 'new',
      },
    ],
  },
]
buildBoard(document.getElementById('evo-holy'), HOLY_LINE)
const DARK_LINE = [
  {
    stage: 'ไข่',
    items: [
      {
        id: 'degg',
        name: 'ไข่รัตติกาล',
        old: 'คงชื่อเดิม · เปลือกม่วงดำมีพระจันทร์เสี้ยวและดาว ปีกค้างคาวเล็กสองข้าง รอยร้าวเรืองแดง',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'ร่างเด็ก 1',
    items: [
      {
        id: 'mote',
        name: 'ละอองมืด',
        old: 'คงชื่อเดิม · ก้อนหมอกม่วงดำมีตาแดง แกนเรืองม่วง ปลายหางเป็นควัน ลอยได้',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'ร่างเด็ก 2',
    items: [
      {
        id: 'batling',
        name: 'ลูกค้างคาว',
        old: 'คงชื่อเดิม · ค้างคาวตัวกลม หูใหญ่ ตาแดง เขี้ยวเล็ก บินด้วยปีก',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'โตเต็มวัย',
    items: [
      {
        id: 'spider',
        name: 'แมงมุมคำสาป',
        old: 'คงชื่อเดิม · แมงมุมม่วงดำ อักขระคำสาปเรืองม่วงบนท้อง ตาแดง เขี้ยวกระดูก',
        st: 'keep',
      },
      {
        id: 'rat',
        name: 'หนูท่อมืด',
        old: 'คงชื่อเดิม · ร่างแย่ หนูมอมแมม มีคราบเขียว ตาปรือ ฟันหน้าโผล่ หางชมพูยาว',
        st: 'keep',
      },
      {
        id: 'vampbat',
        name: 'ค้างคาวเขี้ยวโลหิต',
        old: 'เดิม อสูรเขี้ยวโลหิต 🧛 (แวมไพร์เป็นคน) · ค้างคาวสีเลือดหมู ตาแดงเรือง เขี้ยวยาวมีหยดเลือด ปีกมีเส้นเลือดแดง',
        st: 'new',
      },
    ],
  },
  {
    stage: 'สมบูรณ์',
    items: [
      {
        id: 'eyespider',
        name: 'แมงมุมอสูรตาแดง',
        old: 'เดิม ปีศาจนัยน์ตาแดง 👹 (ปีศาจ ไม่ต่อจากแมงมุม) · แมงมุมใหญ่ขนแหลมบนท้อง ตาแดงแปดดวง ลายนาฬิกาทรายสีเลือด เขี้ยวแดง',
        st: 'new',
      },
      {
        id: 'zrat',
        name: 'หนูซากศพขี้เกียจ',
        old: 'เดิม ซอมบี้ขี้เกียจ 🧟 (เป็นคน) · ร่างแย่ ต่อจากหนูท่อมืด หนูซอมบี้สีเขียวเทา รอยเย็บ ซี่โครงโผล่ ตาเย็บกากบาท ลิ้นห้อย',
        st: 'new',
      },
      {
        id: 'batlord',
        name: 'ค้างคาวอสูรราชันย์',
        old: 'เดิม ราชันย์ปีศาจ 😈 (ปีศาจ ไม่ต่อจากค้างคาว) · ค้างคาวม่วงดำมีเขาโค้ง แผงขนแหลมที่คอ ท้องเรืองม่วง กรงเล็บกระดูก',
        st: 'new',
      },
    ],
  },
  {
    stage: 'ร่างสุดท้าย',
    items: [
      {
        id: 'spiderqueen',
        name: 'ราชินีแมงมุมรัตติกาล',
        old: 'เดิม จักรพรรดิรัตติกาล 🌚 (เป็นพระจันทร์) · แมงมุมยักษ์ ท้องเป็นท้องฟ้ากลางคืนมีดาวและพระจันทร์เสี้ยว มงกุฎเป็นเขาสี่แฉก เขี้ยวเรืองม่วง',
        st: 'new',
      },
      {
        id: 'batemperor',
        name: 'จักรพรรดิค้างคาวคำสาป',
        old: 'เดิม เจ้าแห่งคำสาป 💀 (เป็นกะโหลก) · ค้างคาวยักษ์ปีกขาดเป็นริ้ว กะโหลกเป็นเกราะอก มงกุฎเขาสี่แฉก ตาแดง',
        st: 'new',
      },
    ],
  },
]
buildBoard(document.getElementById('evo-dark'), DARK_LINE)
const SHADOW_LINE = [
  {
    stage: 'ไข่',
    items: [
      {
        id: 'segg',
        name: 'ไข่เงา',
        old: 'คงชื่อเดิม · เปลือกม่วงเทาเข้ม รอยร้าวเรืองม่วง ตาแคบเรืองม่วง หมอกลอยรอบฐาน',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'ร่างเด็ก 1',
    items: [
      {
        id: 'wbaby',
        name: 'เงาจิ๋ว',
        old: 'คงชื่อเดิม · ภูตผ้าคลุมตัวกลม หน้าเป็นช่องดำ ตาม่วงกลมโต ชายผ้าขาดวิ่น ลอยได้ (แบบ B)',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'ร่างเด็ก 2',
    items: [
      {
        id: 'kbaby',
        name: 'หมวกผีน้อย',
        old: 'เดิม แมวเงา 🐈 · เงาจิ๋วที่ไปสวมหมวกเหล็ก ตาม่วงในช่องหมวก หางเป็นควัน มีถุงมือเหล็กลอยสองข้าง (แบบ A)',
        st: 'new',
      },
    ],
  },
  {
    stage: 'โตเต็มวัย',
    items: [
      {
        id: 'knight',
        name: 'อัศวินเงา',
        old: 'เดิม นินจาเงา 🥷 (เป็นคน) · ชุดเกราะเล็กที่มีเงาเป็นตัวข้างใน ถือดาบคมม่วง ผ้าคลุมขาดวิ่น พู่หมวกม่วง',
        st: 'new',
      },
      {
        id: 'shyghost',
        name: 'ผีเงาขี้อาย',
        old: 'คงชื่อเดิม · ร่างแย่ ผีตัวกลมโปร่งแสง เอามือปิดแก้ม แก้มแดง',
        st: 'keep',
      },
      {
        id: 'lantern',
        name: 'ภูตตะเกียงเงา',
        old: 'เดิม ผู้ล่าไร้เสียง 🏹 (นักธนูเป็นคน) · ภูตคลุมฮู้ดถือตะเกียงไฟม่วง มือหลังเป็นกรงเล็บม่วง',
        st: 'new',
      },
    ],
  },
  {
    stage: 'สมบูรณ์',
    items: [
      {
        id: 'knight2',
        name: 'อัศวินเงาเกราะทมิฬ',
        old: 'เดิม พญางูเงา 🐍 · อัศวินเงาตัวโตขึ้น ถือโล่ทรงว่าวมีตราพระจันทร์ม่วง พู่หมวกเป็นเปลวม่วง',
        st: 'new',
      },
      {
        id: 'mistblob',
        name: 'ม่านหมอกขี้เกียจ',
        old: 'คงชื่อเดิม · ร่างแย่ ก้อนหมอกอ้วนโปร่งแสง ตาปิดนอนกรน',
        st: 'keep',
      },
      {
        id: 'soulwraith',
        name: 'ภูตโคมวิญญาณ',
        old: 'เดิม แมงป่องอาถรรพ์ 🦂 · ภูตตะเกียงตัวโตขึ้น ตะเกียงแขวนบนไม้เท้า มีไฟวิญญาณม่วงลอยรอบตัว',
        st: 'new',
      },
    ],
  },
  {
    stage: 'ร่างสุดท้าย',
    items: [
      {
        id: 'knightlord',
        name: 'จอมอัศวินเงา',
        old: 'เดิม เจ้าแห่งเงา 🎭 (เป็นหน้ากาก) · หมวกมีเขา บ่ามีหนาม อกมีแกนม่วงเรือง ผ้าคลุมกลายเป็นควัน ถือดาบใหญ่คมม่วง',
        st: 'new',
      },
      {
        id: 'wraithlord',
        name: 'เจ้าภูตเงา',
        old: 'เดิม ราชันย์ไร้ตัวตน 🌌 (เป็นกาแล็กซี) · ฮู้ดมีเขากระดูก ผ้าคลุมแผ่เป็นปีกขาดวิ่น ถือเคียว มีไฟม่วงลอยรอบตัว',
        st: 'new',
      },
    ],
  },
]
buildBoard(document.getElementById('evo-shadow'), SHADOW_LINE)
const LEAF_LINE = [
  {
    stage: 'ไข่',
    items: [
      {
        id: 'legg',
        name: 'ไข่พฤกษ์',
        old: 'คงชื่อเดิม · เปลือกเขียวอ่อนลายใบไม้ มีต้นกล้างอกบนยอด',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'ร่างเด็ก 1',
    items: [
      {
        id: 'seed',
        name: 'เมล็ดจิ๋ว',
        old: 'คงชื่อเดิม · ลูกโอ๊กมีตา หมวกลายตาราง ใบอ่อนงอกบนหัว',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'ร่างเด็ก 2',
    items: [
      {
        id: 'sprout',
        name: 'ต้นอ่อน',
        old: 'คงชื่อเดิม · ตัวกลมสีเขียวตองอ่อน ใบใหญ่สองใบเป็นหู เท้าเป็นราก',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'โตเต็มวัย',
    items: [
      {
        id: 'leafdeer',
        name: 'กวางใบไม้',
        old: 'คงชื่อเดิม · ลูกกวางลายจุด เขากิ่งไม้มีใบ หางเป็นใบไม้',
        st: 'keep',
      },
      {
        id: 'mushroom',
        name: 'เห็ดง่วง',
        old: 'คงชื่อเดิม · ร่างแย่ ตัวป้อมตาปรือ หมวกเห็ดแดงงอกบนหลัง ปล่อยสปอร์',
        st: 'keep',
      },
      {
        id: 'wolf',
        name: 'หมาป่าไพร',
        old: 'คงชื่อเดิม · หมาป่าสีเทาเขียว แผงคอเป็นมอส ใบไม้งอกตามสันหลังและปลายหาง',
        st: 'keep',
      },
    ],
  },
  {
    stage: 'สมบูรณ์',
    items: [
      {
        id: 'stag',
        name: 'กวางเขาพฤกษา',
        old: 'เดิม พยัคฆ์ไพร 🐅 (เสือ ไม่ต่อจากกวาง) · กวางสีน้ำตาลแดง เขาเป็นกิ่งไม้ใหญ่มีใบและดอกไม้',
        st: 'new',
      },
      {
        id: 'stump',
        name: 'ตอไม้แก่',
        old: 'คงชื่อเดิม · ร่างแย่ ตอไม้ตาปรือ มีวงปีบนหัว เคราเป็นมอส ขาเป็นราก',
        st: 'keep',
      },
      {
        id: 'barkwolf',
        name: 'หมาป่าเปลือกไม้',
        old: 'เดิม ช้างพฤกษา 🐘 (หมาป่ากลายเป็นช้าง) · หมาป่าตัวใหญ่ เกราะเปลือกไม้บนหลังและหัว รอยแยกยางไม้เรืองเขียว',
        st: 'new',
      },
    ],
  },
  {
    stage: 'ร่างสุดท้าย',
    items: [
      {
        id: 'forestdeer',
        name: 'เทพพนาลัย',
        old: 'คงชื่อ ปรับร่าง เดิมเป็นต้นไม้ 🌳 · กวางยักษ์สีหยก แบกป่าเล็กไว้บนหลัง เขาเป็นกิ่งไม้ใหญ่',
        st: 'tweak',
      },
      {
        id: 'wolfking',
        name: 'ราชาหมาป่าพงไพร',
        old: 'เดิม เอนท์พิทักษ์ 🌲 (ต้นไม้เดินได้ ซ้ำกับตอไม้แก่) · หมาป่ายักษ์สีคราม ยืนสง่า ขนคอหนาฟูสีเงิน เถาวัลย์พันรอบตัว ขา และหาง ตาเรืองเขียว',
        st: 'new',
      },
    ],
  },
]
buildBoard(document.getElementById('evo-leaf'), LEAF_LINE)
const evo = document.getElementById('evo')
for (const col of FLAME_LINE) {
  const c = document.createElement('div')
  c.className = 'evo-col'
  c.innerHTML = `<div class="evo-head">${col.stage}</div>`
  for (const it of col.items) {
    const card = document.createElement('div')
    card.className = 'card'
    const cv = document.createElement('canvas')
    cv.width = CARD_PX
    cv.height = CARD_PX
    cv.setAttribute('aria-label', it.name)
    card.append(cv)
    const act = document.createElement('div')
    act.className = 'act'
    card.append(act)
    card.insertAdjacentHTML(
      'beforeend',
      `${rankHtml(it.id)}<div class="nm">${it.name}</div><span class="chip ${it.st}">${STATUS_LABEL[it.st]}</span><div class="old">${it.old}</div>`
    )
    c.append(card)
    addCard(cv, it.id, act)
  }
  evo.append(c)
}
// Line-up: one form per stage, side by side on one floor at the same scale.
const lineups = []
function buildLineup(el, ids, names, still = false) {
  const gap = 10,
    W2 = ids.reduce((a, id) => a + SPRITES[id].size, 0) + gap * (ids.length + 1),
    H2 = 92
  const cv = document.createElement('canvas')
  cv.width = W2
  cv.height = H2
  cv.setAttribute('aria-label', 'เรียงร่างตั้งแต่ไข่ถึงร่างสูงสุด')
  el.append(cv)
  const labels = document.createElement('div')
  labels.className = 'labels'
  ids.forEach((id, i) => {
    const d = document.createElement('div')
    d.style.flex = `0 0 ${((SPRITES[id].size + gap) / W2) * 100}%`
    d.innerHTML = `${rankHtml(id)}<span class="nm2">${names[i]}</span>`
    labels.append(d)
  })
  labels.style.paddingLeft = `${(gap / 2 / W2) * 100}%`
  el.append(labels)
  lineups.push({ cv, ctx: cv.getContext('2d'), ids, gap, t: 0, still })
}
function drawLineup(L, dt) {
  const { ctx, cv, ids, gap } = L
  L.t = L.still ? 0 : L.t + dt
  ctx.clearRect(0, 0, cv.width, cv.height)
  ctx.imageSmoothingEnabled = false
  const ground = cv.height - 20
  let x = gap
  ids.forEach((id, i) => {
    const d = SPRITES[id],
      img = getFrame(d, 'idle', Math.floor((L.t * 0.75 + i * 0.21) * 12))
    const hv = d.hover ? Math.round(d.hover + Math.sin(L.t * 2.2 + i) * 1.4) : 0,
      oy = ground - d.img.foot - 1 - hv
    ctx.fillStyle = 'rgba(0,0,0,.4)'
    ctx.beginPath()
    ctx.ellipse(x + d.size / 2, ground - 1, d.size * (d.hover ? 0.22 : 0.3), 2.5, 0, 0, 7)
    ctx.fill()
    if (d.aura) drawAura(ctx, d.aura, x, oy, L.t, false, d.size)
    ctx.drawImage(img.cv, x, oy)
    drawGlows(ctx, d, x, oy, 1, 1, false, L.t, 1, img)
    if (i < ids.length - 1) {
      ctx.fillStyle = '#4a4258'
      const ax = x + d.size + gap / 2
      ctx.fillRect(ax - 2, ground + 9, 4, 1)
      ctx.fillRect(ax, ground + 8, 1, 3)
    }
    x += d.size + gap
  })
}
buildLineup(
  document.getElementById('lineup-fire'),
  ['egg', 'wisp', 'coal', 'gecko', 'frill', 'sunking', 'avatar'],
  [
    'ไข่เพลิง',
    'ประกายจิ๋ว',
    'ถ่านน้อย',
    'เพลิงจอมซน',
    'อัคนีแผงคอ',
    'ราชันมังกรสุริยะ',
    'อวตารสุริยะ',
  ]
)
buildLineup(
  document.getElementById('lineup-leaf'),
  ['legg', 'seed', 'sprout', 'leafdeer', 'stag', 'forestdeer', 'lfused'],
  ['ไข่พฤกษ์', 'เมล็ดจิ๋ว', 'ต้นอ่อน', 'กวางใบไม้', 'กวางเขาพฤกษา', 'เทพพนาลัย', 'พนาผู้ตื่น']
)
buildLineup(
  document.getElementById('lineup-dark'),
  ['degg', 'mote', 'batling', 'spider', 'eyespider', 'spiderqueen', 'dfused'],
  [
    'ไข่รัตติกาล',
    'ละอองมืด',
    'ลูกค้างคาว',
    'แมงมุมคำสาป',
    'แมงมุมอสูรตาแดง',
    'ราชินีแมงมุมรัตติกาล',
    'รัตติกาลผู้ตื่น',
  ]
)
buildLineup(
  document.getElementById('lineup-shadow'),
  ['segg', 'wbaby', 'kbaby', 'knight', 'knight2', 'knightlord', 'sfused'],
  [
    'ไข่เงา',
    'เงาจิ๋ว',
    'หมวกผีน้อย',
    'อัศวินเงา',
    'อัศวินเงาเกราะทมิฬ',
    'จอมอัศวินเงา',
    'เงาผู้ตื่น',
  ]
)
buildLineup(
  document.getElementById('lineup-holy'),
  ['hegg', 'glint', 'lamb', 'wingsheep', 'qilin', 'sunqilin', 'hfused'],
  [
    'ไข่รัศมี',
    'ประกายแสง',
    'ลูกแกะแสง',
    'แกะปีกทิพย์',
    'กิเลนรัศมี',
    'กิเลนสุริยเทพ',
    'ศักดิ์สิทธิ์ผู้ตื่น',
  ]
)
buildLineup(
  document.getElementById('lineup-bolt'),
  ['begg', 'spark', 'cloudpuff', 'tbird', 'hawk', 'thunderking', 'bfused'],
  ['ไข่อสนี', 'ประกายไฟฟ้า', 'ลูกเมฆฟ้า', 'นกฟ้าผ่า', 'เหยี่ยวพายุ', 'วิหคราชาอสนี', 'อสนีผู้ตื่น']
)
buildLineup(
  document.getElementById('lineup-earth'),
  ['eegg', 'pebble', 'clay', 'tortoise', 'pillarturtle', 'mountturtle', 'efused'],
  ['ไข่ศิลา', 'ก้อนกรวด', 'ก้อนดินเหนียว', 'เต่าศิลา', 'เต่าผาหิน', 'เต่าภูเขา', 'ธรณีผู้ตื่น']
)
buildLineup(
  document.getElementById('lineup-water'),
  ['wegg', 'drop', 'bubble', 'swordwhale', 'armorwhale', 'whaleC', 'wfused'],
  ['ไข่วารี', 'หยดน้ำ', 'ฟองจิ๋ว', 'ลูกวาฬดาบ', 'วาฬเกราะ', 'ราชาวาฬผลึก', 'สมุทรผู้ตื่น']
)
{
  const opts = [
    [
      'whaleC',
      'ราชาวาฬผลึก (แบบ C ที่เลือก)',
      'เขาผลึกเรืองแสงสามแท่ง ครีบข้างลำตัวแทนขา เกราะหนาซ้อนกันห้าแผ่นบนหลัง มีผลึกโผล่จากรอยต่อเกราะ',
    ],
    [
      'whaleA',
      'แบบ A · วาฬเขาเดี่ยว',
      'ตัวเพรียวสีน้ำเงินเข้ม ท้องขาว มีเขาเกลียวงาช้างยาวหนึ่งเขาพุ่งไปข้างหน้า เรียบที่สุดในสามแบบ ดูเป็นนักล่าเร็ว',
    ],
    [
      'whaleB',
      'แบบ B · วาฬหัวค้อนเขาคู่',
      'หัวใหญ่ทรงเหลี่ยมแบบวาฬหัวทุย สีเทาเขียว มีเขาคู่โค้งงอนขึ้นเหมือนเขาสัตว์บก มีรอยแผลเป็น ดูหนักและดุ',
    ],
  ]
  const box = document.getElementById('whale-opts')
  for (const [id, title, desc] of opts) {
    const d = document.createElement('div')
    d.className = 'show'
    const cv = document.createElement('canvas')
    cv.width = 100
    cv.height = 100
    cv.setAttribute('aria-label', title)
    const act = document.createElement('div')
    act.className = 'act'
    d.append(cv, act)
    d.insertAdjacentHTML('beforeend', `<h3>${title}</h3><p class="hint">${desc}</p>`)
    box.append(d)
    addCard(cv, id, act)
  }
}
addCard(document.getElementById('show-fused'), 'avatar', document.getElementById('act-fused'))
addCard(document.getElementById('show-boss'), 'boss', document.getElementById('act-boss'))
addCard(document.getElementById('show-turtle'), 'turtle', document.getElementById('act-turtle'))
addCard(document.getElementById('show-wfused'), 'wfused', document.getElementById('act-wfused'))
{
  const opts = [
    [
      'bfused',
      'อสนีผู้ตื่น · ไวเวิร์นพายุ (เลือกแบบ C แล้ว)',
      'ร่างผสมอสนี+อสนี เดิมเป็นอีโมจิเมฆฟ้าผ่า 🌩️ ใหม่เป็นไวเวิร์นตัวหนาดุดัน ขาหน้าเป็นปีกสีเมฆพายุ โครงปีกทองมีกรงเล็บทองตรงข้อพับ ขาหลังสองขาแข็งแรง หัวทู่กรามใหญ่ เกราะทองที่หน้าผาก หงอนเป็นสายฟ้าเอนไปด้านหลัง ลายสายฟ้าบนตัว ปลายหางเป็นสายฟ้า บินด้วยปีก: ยืนลอยกระพือปีก บินไปข้างหน้า โฉบโจมตี กางปีกใช้สกิล',
    ],
  ]
  const box = document.getElementById('bolt-opts')
  for (const [id, title, desc] of opts) {
    const d = document.createElement('div')
    d.className = 'show'
    const cv = document.createElement('canvas')
    cv.width = 104
    cv.height = 104
    cv.setAttribute('aria-label', title)
    const act = document.createElement('div')
    act.className = 'act'
    d.append(cv, act)
    d.insertAdjacentHTML(
      'beforeend',
      `<span class="rank" style="--c:#d08aff">ร่างผสม <b>★★★★★</b></span><h3>${title}</h3><p class="hint">${desc}</p>`
    )
    box.append(d)
    addCard(cv, id, act)
  }
}
addCard(document.getElementById('show-bison'), 'stormbison', document.getElementById('act-bison'))
addCard(document.getElementById('show-hfused'), 'hfused', document.getElementById('act-hfused'))
addCard(document.getElementById('show-holyele'), 'holyele', document.getElementById('act-holyele'))
addCard(document.getElementById('show-dfused'), 'dfused', document.getElementById('act-dfused'))
addCard(
  document.getElementById('show-darksoul'),
  'darksoul',
  document.getElementById('act-darksoul')
)
addCard(document.getElementById('show-sfused'), 'sfused', document.getElementById('act-sfused'))
addCard(document.getElementById('show-veilking'), 'sboss', document.getElementById('act-veilking'))
addCard(document.getElementById('show-efused'), 'efused', document.getElementById('act-efused'))
addCard(
  document.getElementById('show-pangolin'),
  'pangolin',
  document.getElementById('act-pangolin')
)
addCard(document.getElementById('show-lfused'), 'lfused', document.getElementById('act-lfused'))
addCard(document.getElementById('show-flora'), 'flora', document.getElementById('act-flora'))
addCard(
  document.getElementById('show-lavaking'),
  'lavaking',
  document.getElementById('act-lavaking')
)
addCard(
  document.getElementById('show-abyssfish'),
  'abyssfish',
  document.getElementById('act-abyssfish')
)
addCard(
  document.getElementById('show-raidseraph'),
  'raidseraph',
  document.getElementById('act-raidseraph')
)
addCard(document.getElementById('show-vampire'), 'vampire', document.getElementById('act-vampire'))
addCard(
  document.getElementById('show-nameless'),
  'nameless',
  document.getElementById('act-nameless')
)

function emitFor(def, ps, acc, dt, ox, oy, flip, scale = 1) {
  for (let i = 0; i < (def.emit || []).length; i++) {
    const e = def.emit[i]
    acc[i] = (acc[i] || 0) + dt * e.rate * (reduceMotion ? 0.3 : 1)
    while (acc[i] >= 1) {
      acc[i]--
      const x = ox + (flip ? def.size - e.x : e.x),
        y = oy + e.y
      ps.add(makeParticle(e.type, x, y, scale))
    }
  }
}
function drawCard(c, dt) {
  const { ctx, canvas, def } = c
  c.t += dt
  const W = canvas.width,
    H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.imageSmoothingEnabled = false
  // advance the move being shown
  const seq = c.still ? STILL_SHOW : STAGE_OF[def.id] === 'egg' ? EGG_SHOW : SHOW
  c.stepT -= dt
  if (c.stepT <= 0) {
    c.step = (c.step + 1) % seq.length
    c.stepT = seq[c.step][1]
    c.phaseT = 0
    if (c.label) c.label.textContent = (seq === SHOW ? 'ท่า: ' : '') + seq[c.step][2]
  }
  c.phaseT += dt
  const [mode] = seq[c.step],
    F = def.frames,
    pt = c.phaseT
  if (c.still) c.t = 0
  void F
  let img = getFrame(def, 'idle', Math.floor(c.t * 0.75 * 12)),
    lunge = 0
  if (mode === 'walk') img = getFrame(def, 'walk', Math.floor(pt * 1.4 * 12))
  if (mode === 'attack') {
    const t = Math.min(1, pt / 1.0)
    img = getFrame(def, 'attack', Math.round(t * 15))
    lunge =
      t < 0.3
        ? -2 * smooth(t / 0.3)
        : t < 0.42
          ? -2 + (6 * (t - 0.3)) / 0.12
          : t < 0.62
            ? 4
            : 4 * (1 - smooth((t - 0.62) / 0.38))
  }
  if (mode === 'cast') {
    const t = Math.min(1, pt / 1.4)
    img = getFrame(def, 'cast', Math.round(t * 15))
    const i = t < 0.45 ? 0 : t < 0.85 ? 1 : -1
    const mx = Math.round((W - def.size) / 2) + def.mouth[0],
      my = H - 6 - def.img.foot - 1 + def.mouth[1]
    if (i === 0 && Math.random() < 0.8) {
      const a = Math.random() * 7,
        r = 10 + Math.random() * 8
      c.ps.add({
        x: mx + Math.cos(a) * r,
        y: my + Math.sin(a) * r,
        vx: -Math.cos(a) * r * 3,
        vy: -Math.sin(a) * r * 3,
        life: 0.3,
        size: 1,
        cols: elCols(def.el),
        glow: true,
      })
    }
    if (i === 1 && !c.burst) {
      c.burst = true
      c.ps.burst(18, () => ({
        x: mx,
        y: my,
        vx: 30 + Math.random() * 50,
        vy: (Math.random() - 0.5) * 30,
        drag: 3,
        life: 0.45,
        size: Math.random() < 0.4 ? 2 : 1,
        cols: elCols(def.el),
        glow: true,
      }))
    }
    if (i !== 1) c.burst = false
  }
  const ox = Math.round((W - def.size) / 2 + lunge),
    base = H - 6
  const bob = 0
  const oy =
    base -
    def.img.foot -
    1 +
    bob -
    (def.hover ? Math.round(def.hover + Math.sin(c.t * 2.2) * 1.4) : 0)
  ctx.fillStyle = 'rgba(0,0,0,.4)'
  ctx.beginPath()
  ctx.ellipse(W / 2, base - 1, def.size * 0.3, 2.5, 0, 0, Math.PI * 2)
  ctx.fill()
  if (def.aura) drawAura(ctx, def.aura, ox, oy, c.t, false, def.size)
  ctx.drawImage(img.cv, ox, oy)
  drawGlows(ctx, def, ox, oy, 1, 1, false, c.t, 1, img)
  if (!c.still) emitFor(def, c.ps, c.acc, dt, ox, oy, false)
  c.ps.update(dt)
  c.ps.draw(ctx)
}

/* ---------- Arena scene ---------- */
const W = 384,
  H = 216 // the camera view
const WW = W * 3,
  WH = H * 3 // the arena
const cam = { x: WW / 2 - W / 2, y: WH / 2 - H / 2 }
const stage = document.getElementById('stage')
const sx = stage.getContext('2d')
// The world is drawn straight onto the screen canvas through a camera transform: pixel art stays
// nearest-neighbour while positions move smoothly between pixels.
const bx = sx
const THEMES = {
  cave: {
    rim: [57, 198, 255],
    rimDeep: [10, 60, 96],
    stone: [58, 54, 80],
    wall: [22, 19, 34],
    crystal: ['#7ee7ff', '#39c6ff', '#1a6fa0'],
  },
  lava: {
    rim: [255, 122, 26],
    rimDeep: [110, 26, 8],
    stone: [62, 46, 46],
    wall: [26, 14, 14],
    crystal: ['#ffd04a', '#ff7a1a', '#a3260f'],
  },
  crypt: {
    rim: [150, 140, 210],
    rimDeep: [30, 26, 50],
    stone: [44, 44, 58],
    wall: [12, 12, 18],
    crystal: ['#d4ccec', '#8c82a8', '#b04aff'],
  },
  eclipse: {
    rim: [160, 74, 232],
    rimDeep: [40, 16, 70],
    stone: [46, 40, 64],
    wall: [14, 10, 24],
    crystal: ['#e4b8ff', '#a04ae8', '#ffb02a'],
  },
  temple: {
    rim: [255, 216, 120],
    rimDeep: [90, 70, 30],
    stone: [88, 80, 70],
    wall: [30, 26, 22],
    crystal: ['#ffffff', '#ffe88a', '#c89a20'],
  },
  storm: {
    rim: [255, 225, 74],
    rimDeep: [40, 44, 90],
    stone: [52, 56, 78],
    wall: [16, 18, 32],
    crystal: ['#fffac0', '#ffe14a', '#3a72d4'],
  },
  canyon: {
    rim: [255, 176, 80],
    rimDeep: [86, 52, 20],
    stone: [78, 66, 52],
    wall: [30, 22, 16],
    crystal: ['#ffe4a0', '#ffa02a', '#a85a10'],
  },
  forest: {
    rim: [110, 230, 90],
    rimDeep: [14, 60, 20],
    stone: [50, 60, 44],
    wall: [16, 24, 16],
    crystal: ['#d8ff8a', '#5ad35a', '#1e6a2a'],
  },
}
const FLOOR_TOP = 96,
  FLOOR_BOT = WH - 8
const edgeAt = (y) => 110 + (14 - 110) * ((y - FLOOR_TOP) / (FLOOR_BOT - FLOOR_TOP))
function hash(x, y) {
  let h = x * 374761393 + y * 668265263
  h = (h ^ (h >> 13)) * 1274126177
  return ((h ^ (h >> 16)) >>> 0) / 4294967295
}
function buildFloor(theme) {
  const T = THEMES[theme]
  const cv = document.createElement('canvas')
  cv.width = WW
  cv.height = WH
  const c = cv.getContext('2d')
  const img = c.createImageData(WW, WH),
    D = img.data
  const put = (x, y, r, g, b) => {
    const i = (y * WW + x) * 4
    D[i] = r
    D[i + 1] = g
    D[i + 2] = b
    D[i + 3] = 255
  }
  for (let y = 0; y < WH; y++)
    for (let x = 0; x < WW; x++) {
      if (y < FLOOR_TOP) {
        const k = y / FLOOR_TOP
        const n = hash(x >> 2, y >> 2) * 10 + hash(x, y) * 5
        const [r, g, b] = T.wall
        const f = 0.65 + k * 0.55
        put(x, y, r * f + n, g * f + n, b * f + n * 1.2)
        continue
      }
      const L = edgeAt(y),
        R = WW - L
      if (x < L - 7 || x > R + 7) {
        const [r, g, b] = T.wall
        const n = hash(x >> 1, y >> 1) * 8
        put(x, y, r + n, g + n, b + n)
        continue
      }
      if (x < L || x > R || y > FLOOR_BOT - 2) {
        const [r, g, b] = T.rimDeep,
          [rr, rg, rb] = T.rim
        const d = Math.min(Math.abs(x - L), Math.abs(x - R))
        const edge = d < 2 ? 0.9 : 0.25 + 0.3 * hash(x >> 1, y)
        put(x, y, r + (rr - r) * edge, g + (rg - g) * edge, b + (rb - b) * edge)
        continue
      }
      const v = (y - FLOOR_TOP) / (FLOOR_BOT - FLOOR_TOP),
        u = ((x - WW / 2) / (R - L)) * 2
      const row = Math.floor(Math.pow(v, 0.82) * 22),
        col = Math.floor((u + 1) * 15)
      const rowPrev = Math.floor(
        Math.pow(Math.max(0, (y - 1 - FLOOR_TOP) / (FLOOR_BOT - FLOOR_TOP)), 0.82) * 22
      )
      const uPrev = ((x - 1 - WW / 2) / (R - L)) * 2,
        colPrev = Math.floor((uPrev + 1) * 15)
      const [r, g, b] = T.stone
      const tile = hash(row, col) * 14 - 7
      const n = hash(x, y) * 8 - 4 + hash(x >> 2, y >> 2) * 6
      let f = 1 + v * 0.18
      if (row !== rowPrev || col !== colPrev) f = 0.62
      put(x, y, (r + tile + n) * f, (g + tile + n) * f, (b + tile + n) * f)
    }
  c.putImageData(img, 0, 0)
  // Cracks
  let seed =
    theme === 'lava'
      ? 99
      : theme === 'forest'
        ? 41
        : theme === 'canyon'
          ? 23
          : theme === 'storm'
            ? 61
            : theme === 'temple'
              ? 83
              : theme === 'eclipse'
                ? 97
                : theme === 'crypt'
                  ? 53
                  : 7
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  for (let k = 0; k < 150; k++) {
    let x = 30 + rnd() * (WW - 60),
      y = FLOOR_TOP + 8 + rnd() * (FLOOR_BOT - FLOOR_TOP - 16),
      a = rnd() * Math.PI * 2
    for (let s = 0; s < 22 + rnd() * 26; s++) {
      a += (rnd() - 0.5) * 1.1
      x += Math.cos(a)
      y += Math.sin(a) * 0.6
      if (y < FLOOR_TOP + 2 || y > FLOOR_BOT - 3 || x < edgeAt(y) + 2 || x > WW - edgeAt(y) - 2)
        break
      c.fillStyle = theme === 'lava' && s % 5 === 0 ? 'rgba(255,110,30,.55)' : 'rgba(0,0,0,.45)'
      c.fillRect(Math.round(x), Math.round(y), 1, 1)
      c.fillStyle = 'rgba(255,255,255,.06)'
      c.fillRect(Math.round(x), Math.round(y) + 1, 1, 1)
    }
  }
  // Wall rocks and crystals
  for (let k = 0; k < 80; k++) {
    const x = rnd() * WW,
      h = 10 + rnd() * 22,
      w = 6 + rnd() * 14
    const [r, g, b] = THEMES[theme].wall
    c.fillStyle = `rgb(${r + 14},${g + 12},${b + 18})`
    c.beginPath()
    c.moveTo(x - w, FLOOR_TOP)
    c.lineTo(x - w * 0.4, FLOOR_TOP - h)
    c.lineTo(x + w * 0.3, FLOOR_TOP - h * 0.8)
    c.lineTo(x + w, FLOOR_TOP)
    c.fill()
  }
  const crystal = (x, y, s) => {
    const [a, b2, d] = T.crystal
    for (const [dx, hh, ww, col] of [
      [-4 * s, 10 * s, 2.5 * s, d],
      [0, 16 * s, 3 * s, b2],
      [4 * s, 11 * s, 2.5 * s, b2],
      [1 * s, 9 * s, 1.2 * s, a],
    ]) {
      c.fillStyle = col
      c.beginPath()
      c.moveTo(x + dx - ww, y)
      c.lineTo(x + dx, y - hh)
      c.lineTo(x + dx + ww, y)
      c.fill()
    }
  }
  // Glowing pools and rubble on the floor, crystals along the walls
  const [pr, pg, pb] = T.rim
  for (let k = 0; k < 9; k++) {
    const y = FLOOR_TOP + 60 + rnd() * (FLOOR_BOT - FLOOR_TOP - 100),
      L = edgeAt(y) + 40,
      x = L + rnd() * (WW - 2 * L),
      rx = 10 + rnd() * 18
    c.fillStyle = `rgba(${pr},${pg},${pb},.18)`
    c.beginPath()
    c.ellipse(x, y, rx + 3, rx * 0.38 + 2, 0, 0, 7)
    c.fill()
    c.fillStyle = `rgba(${pr},${pg},${pb},.32)`
    c.beginPath()
    c.ellipse(x, y, rx, rx * 0.38, 0, 0, 7)
    c.fill()
    c.fillStyle = `rgba(255,255,255,.35)`
    c.fillRect(Math.round(x - rx * 0.4), Math.round(y - rx * 0.15), Math.round(rx * 0.5), 1)
  }
  for (let k = 0; k < 60; k++) {
    const y = FLOOR_TOP + 10 + rnd() * (FLOOR_BOT - FLOOR_TOP - 20),
      L = edgeAt(y) + 8,
      x = L + rnd() * (WW - 2 * L),
      r = 1 + rnd() * 2.5
    c.fillStyle = 'rgba(0,0,0,.35)'
    c.fillRect(Math.round(x - r), Math.round(y + 1), Math.round(r * 2 + 1), 1)
    c.fillStyle = `rgb(${T.stone[0] + 30},${T.stone[1] + 28},${T.stone[2] + 30})`
    c.fillRect(
      Math.round(x - r),
      Math.round(y - r * 0.6),
      Math.round(r * 2),
      Math.max(1, Math.round(r))
    )
  }
  for (let x = 20; x < WW; x += 40 + rnd() * 50)
    crystal(x, FLOOR_TOP - 2 + rnd() * 3, 0.7 + rnd() * 0.7)
  for (let y = FLOOR_TOP + 40; y < FLOOR_BOT; y += 50 + rnd() * 60) {
    crystal(edgeAt(y) - 12, y, 0.8 + rnd() * 0.5)
    crystal(WW - edgeAt(y) + 12, y, 0.8 + rnd() * 0.5)
  }
  return cv
}
const floors = {
  cave: buildFloor('cave'),
  lava: buildFloor('lava'),
  forest: buildFloor('forest'),
  canyon: buildFloor('canyon'),
  storm: buildFloor('storm'),
  temple: buildFloor('temple'),
  eclipse: buildFloor('eclipse'),
  crypt: buildFloor('crypt'),
}

const ELEM = {
  fire: { name: 'เพลิง', col: '#ff8a24' },
  water: { name: 'วารี', col: '#3a90d2' },
  leaf: { name: 'พฤกษ์', col: '#5ad35a' },
  earth: { name: 'ศิลา', col: '#b98a52' },
  bolt: { name: 'อสนี', col: '#ffe14a' },
  holy: { name: 'รัศมี', col: '#fff0b8' },
  dark: { name: 'รัตติกาล', col: '#a04ae8' },
  shadow: { name: 'เงา', col: '#6a6a9a' },
}
const ROSTER = {
  gecko: { sprite: 'gecko', name: 'เพลิงจอมซน', el: 'fire', hp: 420 },
  raptor: { sprite: 'raptor', name: 'เพลิงนักรบ', el: 'fire', hp: 440 },
  frill: { sprite: 'frill', name: 'อัคนีแผงคอ', el: 'fire', hp: 620 },
  dragon: { sprite: 'dragon', name: 'มังกรเพลิงรบ', el: 'fire', hp: 640 },
  lava: { sprite: 'lava', name: 'ลาวาอ้วน', el: 'fire', hp: 600 },
  sunking: { sprite: 'sunking', name: 'ราชันมังกรสุริยะ', el: 'fire', hp: 900 },
  phoenix: { sprite: 'phoenix', name: 'มังกรปีกฟีนิกซ์', el: 'fire', hp: 880 },
  avatar: { sprite: 'avatar', name: 'อวตารสุริยะ', el: 'fire', hp: 1170 },
  coal: { sprite: 'coal', name: 'ถ่านน้อย', el: 'fire', hp: 160 },
  wisp: { sprite: 'wisp', name: 'ประกายจิ๋ว', el: 'fire', hp: 90 },
  shark: { sprite: 'shark', name: 'ฉลามหนาม', el: 'water', hp: 520 },
  swordwhale: { sprite: 'swordwhale', name: 'ลูกวาฬดาบ', el: 'water', hp: 460 },
  jelly: { sprite: 'jelly', name: 'แมงกะพรุนขี้เซา', el: 'water', hp: 400 },
  armorwhale: { sprite: 'armorwhale', name: 'วาฬเกราะ', el: 'water', hp: 720 },
  octopus: { sprite: 'octopus', name: 'หมึกขี้เกียจ', el: 'water', hp: 600 },
  seadragon: { sprite: 'seadragon', name: 'มังกรทะเลลึก', el: 'water', hp: 640 },
  whaleking: { sprite: 'whaleC', name: 'ราชาวาฬผลึก', el: 'water', hp: 980 },
  leviathan: { sprite: 'leviathan', name: 'เลวีอาธานคลื่นคลั่ง', el: 'water', hp: 900 },
  bubble: { sprite: 'bubble', name: 'ฟองจิ๋ว', el: 'water', hp: 160 },
  drop: { sprite: 'drop', name: 'หยดน้ำ', el: 'water', hp: 90 },
  wfused: { sprite: 'wfused', name: 'สมุทรผู้ตื่น', el: 'water', hp: 1270 },
  turtle: { sprite: 'turtle', name: 'เต่ายักษ์วารี', el: 'water', hp: 7000, boss: true },
  boss: { sprite: 'boss', name: 'มังกรเพลิงกัลป์', el: 'fire', hp: 6000, boss: true },
  leafdeer: { sprite: 'leafdeer', name: 'กวางใบไม้', el: 'leaf', hp: 430 },
  mushroom: { sprite: 'mushroom', name: 'เห็ดง่วง', el: 'leaf', hp: 400 },
  wolf: { sprite: 'wolf', name: 'หมาป่าไพร', el: 'leaf', hp: 450 },
  stag: { sprite: 'stag', name: 'กวางเขาพฤกษา', el: 'leaf', hp: 640 },
  stump: { sprite: 'stump', name: 'ตอไม้แก่', el: 'leaf', hp: 620 },
  barkwolf: { sprite: 'barkwolf', name: 'หมาป่าเปลือกไม้', el: 'leaf', hp: 660 },
  forestdeer: { sprite: 'forestdeer', name: 'เทพพนาลัย', el: 'leaf', hp: 940 },
  wolfking: { sprite: 'wolfking', name: 'ราชาหมาป่าพงไพร', el: 'leaf', hp: 960, ent: true },
  lfused: { sprite: 'lfused', name: 'พนาผู้ตื่น', el: 'leaf', hp: 1220 },
  sprout: { sprite: 'sprout', name: 'ต้นอ่อน', el: 'leaf', hp: 160 },
  seed: { sprite: 'seed', name: 'เมล็ดจิ๋ว', el: 'leaf', hp: 90 },
  flora: { sprite: 'flora', name: 'พฤกษาโบราณ', el: 'leaf', hp: 6500, boss: true, kind: 'บอสเรด' },
  lavaking: {
    sprite: 'lavaking',
    name: 'ราชันย์ลาวา',
    el: 'fire',
    hp: 6800,
    boss: true,
    kind: 'บอสเรด',
  },
  abyssfish: {
    sprite: 'abyssfish',
    name: 'อสูรห้วงลึก',
    el: 'water',
    hp: 6800,
    boss: true,
    kind: 'บอสเรด',
  },
  raidseraph: {
    sprite: 'raidseraph',
    name: 'เซราฟรัศมี',
    el: 'holy',
    hp: 6800,
    boss: true,
    kind: 'บอสเรด',
  },
  vampire: {
    sprite: 'vampire',
    name: 'จ้าวมืดมิด',
    el: 'dark',
    hp: 6800,
    boss: true,
    kind: 'บอสเรด',
  },
  nameless: {
    sprite: 'nameless',
    name: 'ราชันย์เงานิรนาม',
    el: 'shadow',
    hp: 6800,
    boss: true,
    kind: 'บอสเรด',
  },
  advworm: { sprite: 'advworm', name: 'หนอนใบไม้', el: ADV_EL.advworm, hp: 120 },
  advcrab: { sprite: 'advcrab', name: 'ปูน้ำจืด', el: ADV_EL.advcrab, hp: 180 },
  advbat: { sprite: 'advbat', name: 'ค้างคาวถ่าน', el: ADV_EL.advbat, hp: 170 },
  advrabbit: {
    sprite: 'advrabbit',
    name: 'กระต่ายยักษ์',
    el: ADV_EL.advrabbit,
    hp: 900,
    boss: true,
    kind: 'บอสพื้นที่',
  },
  advgull: { sprite: 'advgull', name: 'นกนางนวลซ่า', el: ADV_EL.advgull, hp: 400 },
  advscorp: { sprite: 'advscorp', name: 'แมงป่องเพลิง', el: ADV_EL.advscorp, hp: 420 },
  advturtle: { sprite: 'advturtle', name: 'เต่าหินผา', el: ADV_EL.advturtle, hp: 480 },
  advmshark: {
    sprite: 'advmshark',
    name: 'ฉลามหมอก',
    el: ADV_EL.advmshark,
    hp: 1300,
    boss: true,
    kind: 'บอสพื้นที่',
  },
  advsnake: { sprite: 'advsnake', name: 'งูลาวา', el: ADV_EL.advsnake, hp: 620 },
  advboar: { sprite: 'advboar', name: 'หมูป่าเกราะหิน', el: ADV_EL.advboar, hp: 680 },
  adveagle: { sprite: 'adveagle', name: 'อินทรีพายุ', el: ADV_EL.adveagle, hp: 600 },
  advdragon: {
    sprite: 'advdragon',
    name: 'มังกรหลับใหล',
    el: ADV_EL.advdragon,
    hp: 1900,
    boss: true,
    kind: 'บอสพื้นที่',
  },
  advbeetle: { sprite: 'advbeetle', name: 'ด้วงหินแร่', el: ADV_EL.advbeetle, hp: 900 },
  advcbat: { sprite: 'advcbat', name: 'ค้างคาวถ้ำฟ้า', el: ADV_EL.advcbat, hp: 820 },
  advant: { sprite: 'advant', name: 'มดยักษ์ใต้ดิน', el: ADV_EL.advant, hp: 880 },
  advgolem: {
    sprite: 'advgolem',
    name: 'โกเลมผลึก',
    el: ADV_EL.advgolem,
    hp: 2000,
    boss: true,
    kind: 'บอสพื้นที่',
  },
  advsquirrel: { sprite: 'advsquirrel', name: 'กระรอกฟ้าผ่า', el: ADV_EL.advsquirrel, hp: 860 },
  advgoat: { sprite: 'advgoat', name: 'แพะภูผา', el: ADV_EL.advgoat, hp: 920 },
  advhawk: { sprite: 'advhawk', name: 'เหยี่ยวอสนี', el: ADV_EL.advhawk, hp: 880 },
  advpeacock: {
    sprite: 'advpeacock',
    name: 'นกยูงอสนี',
    el: ADV_EL.advpeacock,
    hp: 2100,
    boss: true,
    kind: 'บอสพื้นที่',
  },
  dummy: { sprite: 'dummy', name: 'หุ่นซ้อม', el: 'fire', hp: 99999, dummy: true },
  tortoise: { sprite: 'tortoise', name: 'เต่าศิลา', el: 'earth', hp: 520 },
  worm: { sprite: 'worm', name: 'หนอนดินเกียจคร้าน', el: 'earth', hp: 420 },
  rhino: { sprite: 'rhino', name: 'แรดผา', el: 'earth', hp: 480 },
  pillarturtle: { sprite: 'pillarturtle', name: 'เต่าผาหิน', el: 'earth', hp: 760 },
  boulder: { sprite: 'boulder', name: 'ก้อนหินขี้เกียจ', el: 'earth', hp: 680, stoneSkin: true },
  orerhino: { sprite: 'orerhino', name: 'แรดเกราะแร่', el: 'earth', hp: 700 },
  mountturtle: { sprite: 'mountturtle', name: 'เต่าภูเขา', el: 'earth', hp: 1000 },
  crystalrhino: { sprite: 'crystalrhino', name: 'ไททันแรดคริสตัล', el: 'earth', hp: 960 },
  efused: { sprite: 'efused', name: 'ธรณีผู้ตื่น', el: 'earth', hp: 1300 },
  clay: { sprite: 'clay', name: 'ก้อนดินเหนียว', el: 'earth', hp: 170 },
  pebble: { sprite: 'pebble', name: 'ก้อนกรวด', el: 'earth', hp: 100 },
  pangolin: { sprite: 'pangolin', name: 'ตัวนิ่มศิลาโบราณ', el: 'earth', hp: 7500, boss: true },
  bfused: { sprite: 'bfused', name: 'อสนีผู้ตื่น', el: 'bolt', hp: 1250 },
  tbird: { sprite: 'tbird', name: 'นกฟ้าผ่า', el: 'bolt', hp: 400 },
  staticcat: { sprite: 'staticcat', name: 'แมวไฟสถิต', el: 'bolt', hp: 380 },
  stormfox: { sprite: 'stormfox', name: 'จิ้งจอกพายุ', el: 'bolt', hp: 420 },
  hawk: { sprite: 'hawk', name: 'เหยี่ยวพายุ', el: 'bolt', hp: 600 },
  gloomcloud: { sprite: 'gloomcloud', name: 'เมฆหม่นขี้เกียจ', el: 'bolt', hp: 580 },
  boltfox: { sprite: 'boltfox', name: 'จิ้งจอกอสนี', el: 'bolt', hp: 600 },
  thunderking: { sprite: 'thunderking', name: 'วิหคราชาอสนี', el: 'bolt', hp: 880 },
  foxking: { sprite: 'foxking', name: 'ราชาจิ้งจอกอสนี', el: 'bolt', hp: 900 },
  cloudpuff: { sprite: 'cloudpuff', name: 'ลูกเมฆฟ้า', el: 'bolt', hp: 150 },
  spark: { sprite: 'spark', name: 'ประกายไฟฟ้า', el: 'bolt', hp: 90 },
  stormbison: { sprite: 'stormbison', name: 'กระทิงพายุคำราม', el: 'bolt', hp: 7000, boss: true },
  hfused: { sprite: 'hfused', name: 'ศักดิ์สิทธิ์ผู้ตื่น', el: 'holy', hp: 1280 },
  sunqilin: { sprite: 'sunqilin', name: 'กิเลนสุริยเทพ', el: 'holy', hp: 900 },
  lionking: { sprite: 'lionking', name: 'มหาราชสีห์เทวะ', el: 'holy', hp: 920 },
  qilin: { sprite: 'qilin', name: 'กิเลนรัศมี', el: 'holy', hp: 600 },
  bellcrab: { sprite: 'bellcrab', name: 'ระฆังแตก', el: 'holy', hp: 560 },
  winglion: { sprite: 'winglion', name: 'ราชสีห์ปีกขาว', el: 'holy', hp: 620, lastStand: true },
  wingsheep: { sprite: 'wingsheep', name: 'แกะปีกทิพย์', el: 'holy', hp: 420 },
  cherub: { sprite: 'cherub', name: 'ทูตน้อยขี้เซา', el: 'holy', hp: 360 },
  lioncub: { sprite: 'lioncub', name: 'สิงห์น้อยรัศมี', el: 'holy', hp: 440 },
  lamb: { sprite: 'lamb', name: 'ลูกแกะแสง', el: 'holy', hp: 150 },
  glint: { sprite: 'glint', name: 'ประกายแสง', el: 'holy', hp: 90 },
  holyele: { sprite: 'holyele', name: 'คชสารรัศมี', el: 'holy', hp: 7200, boss: true },
  dfused: { sprite: 'dfused', name: 'รัตติกาลผู้ตื่น', el: 'dark', hp: 1300 },
  spiderqueen: { sprite: 'spiderqueen', name: 'ราชินีแมงมุมรัตติกาล', el: 'dark', hp: 920 },
  batemperor: { sprite: 'batemperor', name: 'จักรพรรดิค้างคาวคำสาป', el: 'dark', hp: 900 },
  eyespider: { sprite: 'eyespider', name: 'แมงมุมอสูรตาแดง', el: 'dark', hp: 620 },
  zrat: { sprite: 'zrat', name: 'หนูซากศพขี้เกียจ', el: 'dark', hp: 600, undead: true },
  batlord: { sprite: 'batlord', name: 'ค้างคาวอสูรราชันย์', el: 'dark', hp: 600 },
  spider: { sprite: 'spider', name: 'แมงมุมคำสาป', el: 'dark', hp: 420 },
  rat: { sprite: 'rat', name: 'หนูท่อมืด', el: 'dark', hp: 380 },
  vampbat: { sprite: 'vampbat', name: 'ค้างคาวเขี้ยวโลหิต', el: 'dark', hp: 430 },
  batling: { sprite: 'batling', name: 'ลูกค้างคาว', el: 'dark', hp: 150 },
  mote: { sprite: 'mote', name: 'ละอองมืด', el: 'dark', hp: 90 },
  sfused: { sprite: 'sfused', name: 'เงาผู้ตื่น', el: 'shadow', hp: 1290 },
  knightlord: { sprite: 'knightlord', name: 'จอมอัศวินเงา', el: 'shadow', hp: 940 },
  wraithlord: { sprite: 'wraithlord', name: 'เจ้าภูตเงา', el: 'shadow', hp: 880, voidP: true },
  knight2: { sprite: 'knight2', name: 'อัศวินเงาเกราะทมิฬ', el: 'shadow', hp: 640 },
  mistblob: { sprite: 'mistblob', name: 'ม่านหมอกขี้เกียจ', el: 'shadow', hp: 620 },
  soulwraith: { sprite: 'soulwraith', name: 'ภูตโคมวิญญาณ', el: 'shadow', hp: 600, venom: true },
  knight: { sprite: 'knight', name: 'อัศวินเงา', el: 'shadow', hp: 430 },
  shyghost: { sprite: 'shyghost', name: 'ผีเงาขี้อาย', el: 'shadow', hp: 380 },
  lantern: { sprite: 'lantern', name: 'ภูตตะเกียงเงา', el: 'shadow', hp: 410 },
  kbaby: { sprite: 'kbaby', name: 'หมวกผีน้อย', el: 'shadow', hp: 150 },
  wbaby: { sprite: 'wbaby', name: 'เงาจิ๋ว', el: 'shadow', hp: 90 },
  sboss: { sprite: 'sboss', name: 'ราชาม่านเงา', el: 'shadow', hp: 7400, boss: true },
  darksoul: { sprite: 'darksoul', name: 'วิญญาณจันทร์ดับ', el: 'dark', hp: 7400, boss: true },
}
const pickMe = document.getElementById('pick-me'),
  pickFoe = document.getElementById('pick-foe')
{
  const gf = document.createElement('optgroup')
  gf.label = 'สายเพลิง'
  for (const id of [
    'sunking',
    'phoenix',
    'avatar',
    'dragon',
    'frill',
    'lava',
    'raptor',
    'gecko',
    'coal',
    'wisp',
  ])
    gf.append(new Option(ROSTER[id].name, id))
  pickMe.append(gf)
  const gw = document.createElement('optgroup')
  gw.label = 'สายวารี'
  for (const id of [
    'wfused',
    'whaleking',
    'leviathan',
    'seadragon',
    'armorwhale',
    'octopus',
    'shark',
    'swordwhale',
    'jelly',
    'bubble',
    'drop',
  ])
    gw.append(new Option(ROSTER[id].name, id))
  pickMe.append(gw)
  const gl = document.createElement('optgroup')
  gl.label = 'สายพฤกษ์'
  for (const id of [
    'lfused',
    'forestdeer',
    'wolfking',
    'stag',
    'barkwolf',
    'stump',
    'leafdeer',
    'wolf',
    'mushroom',
    'sprout',
    'seed',
  ])
    gl.append(new Option(ROSTER[id].name, id))
  pickMe.append(gl)
  const ge = document.createElement('optgroup')
  ge.label = 'สายศิลา'
  for (const id of [
    'efused',
    'mountturtle',
    'crystalrhino',
    'pillarturtle',
    'orerhino',
    'boulder',
    'tortoise',
    'rhino',
    'worm',
    'clay',
    'pebble',
  ])
    ge.append(new Option(ROSTER[id].name, id))
  pickMe.append(ge)
  const gb = document.createElement('optgroup')
  gb.label = 'สายอสนี'
  for (const id of [
    'bfused',
    'thunderking',
    'foxking',
    'hawk',
    'boltfox',
    'gloomcloud',
    'tbird',
    'stormfox',
    'staticcat',
    'cloudpuff',
    'spark',
  ])
    gb.append(new Option(ROSTER[id].name, id))
  pickMe.append(gb)
  const gh = document.createElement('optgroup')
  gh.label = 'สายรัศมี'
  for (const id of [
    'hfused',
    'sunqilin',
    'lionking',
    'qilin',
    'winglion',
    'bellcrab',
    'wingsheep',
    'lioncub',
    'cherub',
    'lamb',
    'glint',
  ])
    gh.append(new Option(ROSTER[id].name, id))
  pickMe.append(gh)
  const gd = document.createElement('optgroup')
  gd.label = 'สายรัตติกาล'
  for (const id of [
    'dfused',
    'spiderqueen',
    'batemperor',
    'eyespider',
    'batlord',
    'zrat',
    'spider',
    'vampbat',
    'rat',
    'batling',
    'mote',
  ])
    gd.append(new Option(ROSTER[id].name, id))
  pickMe.append(gd)
  const gs = document.createElement('optgroup')
  gs.label = 'สายเงา'
  for (const id of [
    'sfused',
    'knightlord',
    'wraithlord',
    'knight2',
    'soulwraith',
    'mistblob',
    'knight',
    'lantern',
    'shyghost',
    'kbaby',
    'wbaby',
  ])
    gs.append(new Option(ROSTER[id].name, id))
  pickMe.append(gs)
}
for (const id of [
  'shark',
  'dragon',
  'armorwhale',
  'wolf',
  'barkwolf',
  'rhino',
  'orerhino',
  'stormfox',
  'lioncub',
  'boss',
  'turtle',
  'flora',
  'lavaking',
  'abyssfish',
  'raidseraph',
  'vampire',
  'nameless',
  'pangolin',
  'stormbison',
  'holyele',
  'darksoul',
  'knight',
  'lantern',
  'sboss',
])
  pickFoe.add(new Option(ROSTER[id].boss ? 'บอส · ' + ROSTER[id].name : ROSTER[id].name, id))
{
  const ga = document.createElement('optgroup')
  ga.label = 'ศัตรูผจญภัย (ตามลำดับด่าน)'
  for (const id of Object.keys(ADV_STAGE).concat('dummy'))
    ga.append(new Option(ROSTER[id].boss ? 'บอสพื้นที่ · ' + ROSTER[id].name : ROSTER[id].name, id))
  pickFoe.append(ga)
}
// Adventure enemies, in the game's stage order, with the area each one guards.
{
  const AREAS = [
    ['ทุ่งหญ้าเริ่มต้น', ['advworm', 'advcrab', 'advbat', 'advrabbit']],
    ['ชายฝั่งหมอก', ['advgull', 'advscorp', 'advturtle', 'advmshark']],
    ['ภูเขาไฟหลับ', ['advsnake', 'advboar', 'adveagle', 'advdragon']],
    ['ถ้ำผลึกลึก', ['advbeetle', 'advcbat', 'advant', 'advgolem']],
    ['ยอดผาพายุ', ['advsquirrel', 'advgoat', 'advhawk', 'advpeacock']],
    ['ลานซ้อม', ['dummy']],
  ]
  const box = document.getElementById('adv-cards')
  for (const [area, ids] of AREAS)
    for (const id of ids) {
      const r = ROSTER[id],
        st = STAGES[STAGE_OF[id]]
      const d = document.createElement('div')
      d.className = 'show' + (r.boss ? ' boss' : '')
      const cv = document.createElement('canvas')
      // one canvas size for all, so every enemy draws at the same pixel scale
      cv.width = 104
      cv.height = 104
      cv.setAttribute('aria-label', r.name)
      const act = document.createElement('div')
      act.className = 'act'
      d.append(cv, act)
      const rank = r.boss
        ? `<span class="rank" style="--c:#ff5a5a">บอสพื้นที่ · ${st[0]} <b>${st[1]}</b></span>`
        : st
          ? `<span class="rank" style="--c:${st[2]}">${st[0]} <b>${st[1]}</b></span>`
          : '<span class="rank" style="--c:#a49cb4">หุ่นซ้อม</span>'
      d.insertAdjacentHTML('beforeend', `${rank}<h3>${r.name}</h3><p class="hint">${area}</p>`)
      box.append(d)
      addCard(cv, id, act)
    }
}

function makeEnt(rid, side) {
  const r = ROSTER[rid]
  const def = SPRITES[r.sprite]
  const boss = !!r.boss
  return {
    rid,
    def,
    name: r.name,
    el: r.el,
    boss,
    bossKind: r.kind || 'บอสโลก',
    dummy: !!r.dummy,
    ent: !!r.ent,
    stoneSkin: !!r.stoneSkin,
    lastStand: !!r.lastStand,
    undead: !!r.undead,
    venom: !!r.venom,
    voidP: !!r.voidP,
    side,
    flip: side === 1,
    hpMax: r.hp,
    hp: r.hp,
    hpShown: r.hp,
    x: WW / 2 + (side === 0 ? -85 : boss ? 90 : 82),
    y: WH * 0.58 + (side === 0 ? 14 : boss ? -6 : -14),
    ox: 0,
    oy: 0,
    sx: 1,
    sy: 1,
    grow: 1, // world boss size: the same sprite, a step bigger at each grow stage
    grown: 0,
    alpha: 1,
    flash: 0,
    shield: 0,
    ghosts: [],
    acc: {},
    status: null,
    statusT: 0,
    hidden: false,
    goal: null,
    walking: 0,
    speed: (boss ? 34 : 50 + (def.size < 56 ? 12 : 0)) * (r.stoneSkin ? 0.85 : 1),
    stepT: 0,
  }
}
let me = makeEnt('sunking', 0),
  foe = makeEnt('shark', 1)
const ps = new PSys()
const fxs = []
const texts = []
let shake = 0,
  hitstop = 0,
  banner = null,
  flashScreen = 0,
  darken = 0,
  clock = 0,
  timer = 0
const tasks = new Set()
const tween = (ms, fn = () => {}, done) =>
  new Promise((res) => tasks.add({ t: 0, ms: reduceMotion ? ms * 0.6 : ms, fn, res, done }))
const wait = (ms) => tween(ms)
const ease = (k) => 1 - Math.pow(1 - k, 3),
  easeIn = (k) => k * k

function anchor(e) {
  return { x: e.x + e.ox, y: e.y + e.oy }
}
function mouthOf(e) {
  const d = e.def,
    a = anchor(e)
  const mx = e.flip ? d.size - d.mouth[0] : d.mouth[0],
    g = e.grow || 1
  return { x: a.x + (mx - d.size / 2) * g, y: a.y - (d.img.foot - d.mouth[1]) * g }
}
function centerOf(e) {
  const a = anchor(e)
  return { x: a.x, y: a.y - e.def.img.foot * 0.45 * (e.grow || 1) }
}
function sayAt(e, text, col, big = false) {
  const c = centerOf(e)
  texts.push({
    x: c.x + (Math.random() - 0.5) * 8,
    y: c.y - e.def.img.foot * 0.45,
    text,
    col,
    life: 1.1,
    age: 0,
    big,
  })
}
function showBanner(text, col = '#ffd34a', ms = 900) {
  banner = { text, col, age: 0, life: ms / 1000 }
}

function impactBurst(x, y, col = '#ffffff', n = 14) {
  ps.burst(n, () => {
    const a = Math.random() * Math.PI * 2,
      sp = 30 + Math.random() * 50
    return {
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp * 0.6,
      drag: 5,
      life: 0.25 + Math.random() * 0.2,
      size: 1,
      cols: ['#ffffff', col],
      glow: true,
    }
  })
  fxs.push({
    age: 0,
    life: 0.18,
    draw(c, k) {
      c.globalCompositeOperation = 'lighter'
      c.globalAlpha = 1 - k
      c.strokeStyle = '#fff'
      c.lineWidth = 1
      c.beginPath()
      c.ellipse(x, y, 4 + k * 12, 2 + k * 6, 0, 0, Math.PI * 2)
      c.stroke()
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 + 0.3
        c.fillStyle = col
        c.fillRect(
          Math.round(x + Math.cos(a) * (3 + k * 10)),
          Math.round(y + Math.sin(a) * (2 + k * 6)),
          2,
          2
        )
      }
    },
  })
}
// World boss grow (game: WORLD_BOSS_GROW_SECS 20 s and 40 s, ATK and DEF +30% each stage). The owner chose to
// keep the same sprite and make it a little bigger each time (+10% per stage) instead of a new, angrier form.
const GROW_SECS = [20, 40],
  GROW_STEP = 0.1
async function growBoss(e) {
  e.grown++
  const g0 = e.grow,
    g1 = 1 + GROW_STEP * e.grown
  showBanner('บอสขยายร่าง!', '#ff6a4a', 1300)
  sayAt(e, 'โจมตี/ป้องกัน +30%', '#ff8a6a', true)
  darken = 0.3
  const c = anchor(e)
  fxs.push({
    age: 0,
    life: 1.2,
    draw(cx, k) {
      cx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < 3; i++) {
        const q = (k * 1.4 - i * 0.18 + 1) % 1
        cx.globalAlpha = (1 - q) * 0.8 * (1 - k * 0.5)
        cx.strokeStyle = i % 2 ? '#ffb43a' : '#ff5a4a'
        cx.lineWidth = 2
        cx.beginPath()
        cx.ellipse(c.x, c.y, 20 + q * 70, (20 + q * 70) * 0.4, 0, 0, 7)
        cx.stroke()
      }
    },
  })
  // three pulses, each a little bigger, then it settles at the new size
  await tween(1100, (k) => {
    const pulse = Math.sin(k * Math.PI * 3) * 0.04 * (1 - k)
    e.grow = g0 + (g1 - g0) * ease(k) + pulse
    shake = Math.max(shake, 3 * (1 - k))
    e.flash = 0.5 * Math.max(0, Math.sin(k * Math.PI * 3))
  })
  e.grow = g1
  e.flash = 0
  tween(600, (k) => {
    darken = 0.3 * (1 - k)
  })
}
function checkGrow(e) {
  if (!e.boss || e.bossKind !== 'บอสโลก' || e.growing) return
  if (GROW_SECS.filter((s) => timer >= s).length > e.grown) {
    e.growing = true
    growBoss(e).then(() => {
      e.growing = false
    })
  }
}
async function damage(def, amount, opts = {}) {
  opts.from = opts.from || other(def)
  let dmg = Math.round(
    amount *
      (opts.guard ? 0.35 : 1) *
      (opts.crit ? 1.6 : 1) *
      (def.defUpT > 0 ? 0.75 : 1) *
      (def.defT > 0 ? 1.25 : 1) *
      (def.ent ? 0.92 : 1) *
      (def.stoneSkin ? 0.88 : 1) *
      (opts.from && opts.from.atkUpT > 0 ? 1.2 : 1) *
      (opts.from && opts.from.atkDownT > 0 ? 0.8 : 1) *
      (opts.from && opts.from.enraged ? 1.2 : 1)
  )
  if (def.bubbleHp > 0 && def.bubbleT > 0) {
    const ab = Math.min(def.bubbleHp, dmg)
    def.bubbleHp -= ab
    dmg -= ab
    sayAt(def, 'โล่ดูด ' + ab, '#9ad8ff')
    def.bubbleHit = 0.25
  }
  def.hp = Math.max(0, def.hp - dmg)
  def.flash = dmg > 0 ? 1 : 0.3
  if (opts.from && opts.from.undead && opts.melee && dmg > 0 && opts.from !== def) {
    const h = cursed(opts.from, Math.max(1, Math.round(dmg * 0.15)))
    opts.from.hp = Math.min(opts.from.hpMax, opts.from.hp + h)
    sayAt(opts.from, '+' + h + ' ดูดเลือด', '#ff8a8a')
  }
  if (def.undead && !def.enraged && def.hp > 0 && def.hp < def.hpMax * 0.5) {
    def.enraged = true
    flashScreen = 0.25
    tag(def, '🧟 โกรธ ATK +20%', 'dark')
    sayAt(def, 'โกรธ!', '#ff5a5a', true)
  }
  if (def.lastStand && !def.lastStandUsed && def.hp > 0 && def.hp < def.hpMax * 0.35) {
    def.lastStandUsed = true
    lastStandFx(def)
  }
  if (def.ent && dmg > 0) entBark(def)
  if (def.stoneSkin && dmg > 0) sayAt(def, '-12%', '#e2c492')
  if (def.staticRetort && opts.melee && opts.from && opts.from !== def) {
    const src = opts.from
    def.sx = 1.12
    def.sy = 1.12
    wait(160).then(() => {
      def.sx = def.sy = 1
    })
    fxs.push({
      age: 0,
      life: 0.3,
      draw(c, k) {
        c.globalAlpha = 1 - k
        const a = centerOf(def),
          b = centerOf(src)
        boltLine(c, a.x, a.y, b.x, b.y, 8)
      },
    })
    tag(def, '🐱 ขนพองช็อต', 'bolt')
    staticOn(src, 3)
  }
  if (def.retort && opts.melee && opts.from && opts.from !== def) {
    const src = opts.from
    zapArc(def, src)
    tag(def, '🪼 หนวดช็อต', 'water')
    wait(120).then(() => {
      src.slowT = 2
      sayAt(src, 'ช้าลง', '#7ac8f0')
      damage(src, 25, { from: def })
    })
  }
  if (!def.anim) {
    const h = (def.anim = { name: 'hurt', t: 0 })
    tween(300, (k) => {
      h.t = k
    }).then(() => {
      if (def.anim === h) def.anim = null
    })
  }
  if (opts.crit) {
    hitstop = 0.09
    shake = Math.max(shake, 4)
    sayAt(def, 'CRIT ' + dmg, '#ffd34a', true)
  } else
    sayAt(def, opts.guard ? '-' + dmg + ' กันได้' : '-' + dmg, opts.guard ? '#9ad8ff' : '#ffffff')
  shake = Math.max(shake, opts.guard ? 1.5 : 2.5)
  const src = opts.from || other(def)
  const dir = Math.sign(def.x - src.x) || 1
  await tween(140, (k) => {
    def.ox = dir * (opts.guard ? 3 : 7) * Math.sin(k * Math.PI) * (1 - k * 0.4)
  })
  def.ox = 0
  if (def.hp <= 0) {
    if (def.rebirth && !def.rebirthUsed) await rebirth(def)
    else await knockout(def)
  }
}
async function knockout(e) {
  showBanner('K.O.!', '#ff6a4a', 1300)
  await tween(500, (k) => {
    e.sy = 1 - k * 0.5
    e.sx = 1 + k * 0.25
    e.alpha = 1 - k
  })
  await wait(700)
  e.hp = e.hpMax
  e.status = null
  e.rootT = e.silenceT = e.poisonT = e.stunT = e.staticT = e.immuneT = e.blindT = 0
  e.lastStandUsed = false
  e.curseT = e.atkDownT = 0
  e.enraged = false
  e.evaT = 0
  e.critNext = false
  await tween(400, (k) => {
    e.sy = 0.6 + k * 0.4
    e.sx = 1.2 - k * 0.2
    e.alpha = k
  })
  e.sx = e.sy = 1
  e.alpha = 1
  showBanner('FIGHT!')
}
let busy = false
async function run(fn) {
  if (busy) return
  busy = true
  setBusy(true)
  try {
    await fn()
  } finally {
    busy = false
    setBusy(false)
  }
}
function setBusy(b) {
  document
    .querySelectorAll('.controls button:not(#b-auto)')
    .forEach((x) => (x.disabled = b && !autoOn))
}

/* Free movement (demo mode): walk to a goal on the floor, face the opponent */
function clampPos(e, x, y) {
  const half = e.def.size * 0.32
  y = Math.max(FLOOR_TOP + 14, Math.min(FLOOR_BOT - 6, y))
  const L = edgeAt(y) + half + 2
  return { x: Math.max(L, Math.min(WW - L, x)), y }
}
const other = (e) => (e === me ? foe : me)
function walkTo(e, x, y, maxMs = 1600) {
  e.goal = clampPos(e, x, y)
  return tween(
    maxMs,
    () => {},
    () => !e.goal
  ).then(() => {
    e.goal = null
  })
}
function stepWalk(e, dt) {
  let desired = 0,
    dx = 0,
    dy = 0,
    d = 0
  if (e.goal) {
    dx = e.goal.x - e.x
    dy = e.goal.y - e.y
    d = Math.hypot(dx, dy)
    if (d < 0.8 || e.rootT > 0 || e.stunT > 0) e.goal = null
    else
      desired = Math.min(e.speed * (e.slowT > 0 ? 0.5 : 1) * (e.hasteT > 0 ? 1.3 : 1), d * 2.4 + 8)
  }
  e.v = (e.v || 0) + (desired - (e.v || 0)) * Math.min(1, dt * 7)
  if (e.goal && d > 0) {
    const mv = Math.min(d, e.v * dt)
    e.x += (dx / d) * mv
    e.y += (dy / d) * mv * 0.8
    const before = Math.floor((e.walkPhase || 0) * 2)
    e.walkPhase = (e.walkPhase || 0) + mv / (e.def.size * 0.55)
    if (Math.floor(e.walkPhase * 2) !== before) {
      if (e.boss) shake = Math.max(shake, 1.6)
      if (e.def.fly)
        ps.burst(3, () =>
          makeParticle('dust', e.x + (Math.random() - 0.5) * e.def.size * 0.5, e.y - 1)
        )
      else if (e.def.hover) {
        ripple(e.x, e.y, 10, 0.5)
        ps.add(makeParticle('drop', e.x + (Math.random() - 0.5) * 10, e.y - 4))
      } else
        ps.burst(e.boss ? 6 : 3, () => ({
          x: e.x + (Math.random() - 0.5) * e.def.size * 0.4,
          y: e.y - 1,
          vx: (Math.random() - 0.5) * 16,
          vy: -5 - Math.random() * 6,
          g: 20,
          life: 0.45,
          size: 1,
          cols: ['#8a8098', '#5a5268'],
          alpha: 0.6,
        }))
    }
  } else if (!e.goal) e.v = Math.max(0, e.v - dt * 200)
  e.walking = e.v / e.speed
}
const reachOf = (a, b) => (a.def.size + b.def.size) * 0.3 + 8
async function approach(att, def) {
  // close in from the side the attacker is on, level with the target, so the two never overlap
  const side = Math.sign(att.x - def.x) || 1,
    r = reachOf(att, def)
  const sway = Math.random() < 0.5 ? 1 : -1
  walkTo(def, def.x - side * 6, def.y + sway * 10, 700)
  await walkTo(att, def.x + side * r, def.y + (Math.random() - 0.5) * 10, 1900)
}
async function keepRange(att, def, range) {
  const ang = Math.atan2(att.y - def.y, att.x - def.x) + (Math.random() - 0.5) * 0.9
  await walkTo(att, def.x + Math.cos(ang) * range, def.y + Math.sin(ang) * range * 0.5, 1500)
}
async function roam(ms) {
  const mid = clampPos(
    me,
    (me.x + foe.x) / 2 + (Math.random() - 0.5) * 900,
    (me.y + foe.y) / 2 + (Math.random() - 0.5) * 380
  )
  const ang = (Math.random() - 0.5) * 1.4 + (Math.random() < 0.5 ? 0 : Math.PI),
    r = (me.def.size + foe.def.size) * 0.4 + 30 + Math.random() * 50
  await Promise.all([
    walkTo(me, mid.x + Math.cos(ang) * r, mid.y + Math.sin(ang) * r * 0.45, ms),
    walkTo(foe, mid.x - Math.cos(ang) * r, mid.y - Math.sin(ang) * r * 0.45, ms),
  ])
}

async function lungeHit(att, def, react) {
  const vx = def.x - att.x,
    vy = def.y - att.y,
    len = Math.hypot(vx, vy) || 1,
    ux = vx / len,
    uy = vy / len
  const dir = Math.sign(vx) || 1
  const dist = Math.max(0, len - (att.def.size + def.def.size) * 0.24)
  const put = (e, a, px = 0, py = 0) => {
    e.ox = ux * a + px
    e.oy = uy * a * 0.8 + py
  }
  const A = (t) => {
    att.anim = { name: 'attack', t }
  }
  await tween(220, (k) => {
    A(0.3 * k)
    put(att, -5 * ease(k))
  })
  if (!react && ((def.evaT > 0 && Math.random() < 0.4) || (def.voidP && Math.random() < 0.2)))
    react = 'dodge'
  let dodged = false
  const dash = tween(150, (k) => {
    A(0.3 + 0.12 * k)
    put(att, -5 + (dist + 5) * easeIn(k))
    const q = Math.sin(k * Math.PI)
    att.sx = 1 + 0.07 * q
    att.sy = 1 - 0.05 * q
  })
  const side = Math.random() < 0.5 ? 1 : -1,
    px = -uy * 18 * side,
    py = ux * 12 * side
  if (react === 'dodge') {
    await wait(60)
    sayAt(def, 'หลบ!', '#7ee7ff')
    if (def.voidP) {
      def.critNext = true
      tag(def, '🌀 จักรวาลเงา', 'shadow')
      const vc = centerOf(def)
      shadowBurst(vc.x, vc.y, 16, 50)
    }
    tween(220, (k) => {
      const q = ease(k)
      def.ox = px * q + ux * 6 * q
      def.oy = py * q - 6 * Math.sin(k * Math.PI)
      if (Math.random() < 0.7)
        def.ghosts.push({ x: def.x + def.ox, y: def.y + def.oy, a: 0.5, img: frameOf(def, clock) })
    })
    dodged = true
  }
  if (react === 'guard') def.shield = 1
  await dash
  att.sx = att.sy = 1
  if (!react && !dodged && att.blindT > 0 && Math.random() < 0.35) {
    sayAt(def, 'พลาด!', '#b8adab')
    await tween(170, (k) => {
      A(0.42 + 0.2 * k)
      put(att, dist + 10 * ease(k))
    })
    await tween(320, (k) => {
      A(0.62 + 0.38 * k)
      put(att, (dist + 10) * (1 - ease(k)))
    })
    att.ox = att.oy = 0
    att.anim = null
    return
  }
  if (dodged) {
    await tween(170, (k) => {
      A(0.42 + 0.2 * k)
      put(att, dist + 16 * ease(k))
    })
    await tween(320, (k) => {
      A(0.62 + 0.38 * k)
      put(att, (dist + 16) * (1 - ease(k)))
      def.ox = (px + ux * 6) * (1 - ease(k))
      def.oy = py * (1 - ease(k))
    })
    att.ox = att.oy = 0
    att.anim = null
    def.x += px + ux * 6
    def.y += py
    def.ox = def.oy = 0
    const cp = clampPos(def, def.x, def.y)
    def.x = cp.x
    def.y = cp.y
    return
  }
  const c = centerOf(def)
  impactBurst(c.x - dir * 6, c.y, react === 'guard' ? '#9ad8ff' : '#ffd04a')
  const cn = !react && att.critNext
  if (cn) {
    att.critNext = false
    sayAt(att, 'สวนกลับ!', '#d08aff', true)
  }
  const crit = !react && (cn || Math.random() < (att.focusT > 0 ? 0.65 : 0.25))
  if (att.venom && !react && Math.random() < 0.3) {
    poisonOn(def, 5)
    const sc = centerOf(def)
    fxs.push({
      age: 0,
      life: 0.7,
      draw(cx, k) {
        cx.globalAlpha = 1 - k
        drawSoulFlame(cx, sc.x, sc.y - 10 - k * 14, 0.9)
      },
    })
  }
  const p = damage(def, (40 + Math.random() * 25) * (cn ? 1.25 : 1), {
    guard: react === 'guard',
    crit,
    from: att,
    melee: true,
  })
  await tween(120, (k) => A(0.42 + 0.2 * k))
  await tween(300, (k) => {
    A(0.62 + 0.38 * k)
    put(att, dist * (1 - ease(k)))
  })
  att.ox = att.oy = 0
  att.anim = null
  await p
  def.shield = 0
}

/* Element skills */
function projectile(from, to, ms, drawFn, trail) {
  return tween(ms, (k) => {
    const x = from.x + (to.x - from.x) * k,
      y = from.y + (to.y - from.y) * k - Math.sin(k * Math.PI) * 10
    curProj = { x, y, draw: drawFn }
    if (trail) trail(x, y)
    if (k >= 1) curProj = null
  })
}
let curProj = null
const SKILL = {
  async fire(att, def) {
    const m = mouthOf(att),
      c = centerOf(def)
    await tween(320, () =>
      ps.add({
        x: m.x + (Math.random() - 0.5) * 14,
        y: m.y + (Math.random() - 0.5) * 10,
        vx: 0,
        vy: 0,
        life: 0.25,
        size: 1,
        cols: FLAME_COLS,
        glow: true,
      })
    )
    await projectile(
      m,
      c,
      360,
      (cx, x, y) => {
        cx.globalCompositeOperation = 'lighter'
        cx.fillStyle = '#ff8a24'
        cx.beginPath()
        cx.arc(x, y, 5, 0, 7)
        cx.fill()
        cx.fillStyle = '#fff3a8'
        cx.beginPath()
        cx.arc(x, y, 2.5, 0, 7)
        cx.fill()
      },
      (x, y) => {
        for (let i = 0; i < 3; i++) ps.add(makeParticle('flame', x, y))
      }
    )
    ps.burst(46, () => {
      const a = Math.random() * 7,
        sp = 20 + Math.random() * 60
      return {
        x: c.x,
        y: c.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp * 0.7 - 10,
        drag: 3,
        life: 0.5 + Math.random() * 0.4,
        size: Math.random() < 0.4 ? 2 : 1,
        cols: FLAME_COLS,
        glow: true,
      }
    })
    fxs.push({
      age: 0,
      life: 0.35,
      draw(cx, k) {
        cx.globalCompositeOperation = 'lighter'
        cx.globalAlpha = 1 - k
        cx.fillStyle = '#ffb43a'
        cx.beginPath()
        cx.ellipse(c.x, c.y, 6 + k * 22, 4 + k * 12, 0, 0, 7)
        cx.fill()
      },
    })
    def.status = 'burn'
    def.statusT = 2.5
    await damage(def, 90, {})
  },
  async water(att, def) {
    const a = anchor(att),
      d = anchor(def),
      dir = Math.sign(d.x - a.x) || 1
    const wave = { x: a.x + dir * 10, y: (a.y + d.y) / 2 }
    fxs.push({
      age: 0,
      life: 0.8,
      draw(cx, k) {
        const x = a.x + (d.x - a.x) * ease(k),
          y = a.y + (d.y - a.y) * ease(k)
        cx.globalCompositeOperation = 'source-over'
        for (let i = -3; i <= 3; i++) {
          const hh = 14 - Math.abs(i) * 3 + Math.sin(clock * 20 + i) * 1.5
          cx.fillStyle = '#1b5e9e'
          cx.fillRect(Math.round(x + i * 3 - dir * 2), Math.round(y - hh), 3, hh)
          cx.fillStyle = '#a0dcff'
          cx.fillRect(Math.round(x + i * 3 - dir * 2), Math.round(y - hh), 3, 2)
        }
        if (Math.random() < 0.8)
          ps.add({
            x: x + (Math.random() - 0.5) * 18,
            y: y - 10,
            vx: -dir * 10,
            vy: -20,
            g: 80,
            life: 0.5,
            size: 1,
            cols: ['#ffffff', '#a0dcff'],
            glow: false,
          })
      },
    })
    void wave
    await wait(800)
    const c = centerOf(def)
    ps.burst(40, () => ({
      x: c.x + (Math.random() - 0.5) * 16,
      y: anchor(def).y - 2,
      vx: (Math.random() - 0.5) * 40,
      vy: -40 - Math.random() * 50,
      g: 140,
      life: 0.8,
      size: Math.random() < 0.3 ? 2 : 1,
      cols: ['#ffffff', '#a0dcff', '#3a90d2'],
    }))
    fxs.push({
      age: 0,
      life: 0.5,
      draw(cx, k) {
        cx.globalAlpha = 1 - k
        cx.strokeStyle = '#a0dcff'
        cx.beginPath()
        cx.ellipse(anchor(def).x, anchor(def).y, 8 + k * 26, 3 + k * 8, 0, 0, 7)
        cx.stroke()
      },
    })
    await damage(def, 85, {})
  },
  async leaf(att, def) {
    const a = centerOf(att)
    const leaves = []
    for (let i = 0; i < 26; i++)
      leaves.push({
        a: (i / 26) * Math.PI * 2,
        r: 10 + Math.random() * 8,
        col: Math.random() < 0.5 ? '#5ad35a' : '#2e9a3e',
      })
    let phase = 0
    const fx = {
      age: 0,
      life: 99,
      draw(cx) {
        const t = clock
        const d = centerOf(def)
        for (const l of leaves) {
          const ang = l.a + t * 7
          const ox = phase === 0 ? a.x : a.x + (d.x - a.x) * l.k,
            oy = phase === 0 ? a.y : a.y + (d.y - a.y) * l.k
          const x = ox + Math.cos(ang) * l.r,
            y = oy + Math.sin(ang) * l.r * 0.5
          cx.fillStyle = l.col
          cx.fillRect(Math.round(x), Math.round(y), 2, 1)
          cx.fillStyle = '#bfff9a'
          cx.fillRect(Math.round(x), Math.round(y), 1, 1)
        }
      },
    }
    for (const l of leaves) l.k = 0
    fxs.push(fx)
    await wait(450)
    phase = 1
    await tween(420, (k) => {
      for (const l of leaves) {
        l.k = ease(k)
        l.r = l.r * (1 - 0.03)
      }
    })
    fx.life = 0
    const g = anchor(def)
    fxs.push({
      age: 0,
      life: 0.9,
      draw(cx, k) {
        const grow = Math.min(1, k * 3)
        for (let i = 0; i < 5; i++) {
          const bx2 = g.x - 12 + i * 6,
            hh = (14 + (i % 2) * 8) * grow * (1 - Math.max(0, k - 0.7) * 3)
          cx.fillStyle = '#2e9a3e'
          cx.fillRect(Math.round(bx2), Math.round(g.y - hh), 2, Math.round(hh))
          cx.fillStyle = '#5ad35a'
          cx.fillRect(Math.round(bx2 + (i % 2 ? 2 : -2)), Math.round(g.y - hh * 0.6), 2, 1)
        }
      },
    })
    ps.burst(20, () => ({
      x: g.x + (Math.random() - 0.5) * 24,
      y: g.y - Math.random() * 20,
      vx: (Math.random() - 0.5) * 20,
      vy: -10,
      g: 30,
      life: 0.8,
      size: 1,
      cols: ['#bfff9a', '#5ad35a'],
      glow: false,
    }))
    await damage(def, 80, {})
  },
  async earth(att, def) {
    const a = anchor(att),
      d = anchor(def),
      n = 6
    for (let i = 1; i <= n; i++) {
      const k = i / n,
        x = a.x + (d.x - a.x) * k,
        y = a.y + (d.y - a.y) * k,
        big = i === n
      shake = Math.max(shake, big ? 4 : 1.5)
      fxs.push({
        age: 0,
        life: 0.7,
        draw(cx, t) {
          const hgt = (big ? 26 : 12) * Math.min(1, t * 6) * (t > 0.6 ? 1 - (t - 0.6) * 2.5 : 1)
          const w = big ? 8 : 4
          cx.fillStyle = '#5a4030'
          cx.beginPath()
          cx.moveTo(x - w, y)
          cx.lineTo(x - 1, y - hgt)
          cx.lineTo(x + w, y)
          cx.fill()
          cx.fillStyle = '#b98a52'
          cx.beginPath()
          cx.moveTo(x - w * 0.5, y)
          cx.lineTo(x - 1, y - hgt)
          cx.lineTo(x, y)
          cx.fill()
        },
      })
      ps.burst(8, () => ({
        x: x + (Math.random() - 0.5) * 10,
        y,
        vx: (Math.random() - 0.5) * 30,
        vy: -20 - Math.random() * 30,
        g: 120,
        life: 0.6,
        size: Math.random() < 0.5 ? 2 : 1,
        cols: ['#b98a52', '#7a5a3a'],
      }))
      await wait(90)
    }
    tween(400, (k) => {
      def.oy = -14 * Math.sin(k * Math.PI)
    })
    await damage(def, 95, {})
  },
  async bolt(att, def) {
    await tween(200, (k) => {
      darken = 0.55 * k
    })
    const c = centerOf(def),
      top = { x: c.x + (Math.random() - 0.5) * 30, y: cam.y }
    flashScreen = 0.8
    shake = 5
    fxs.push({
      age: 0,
      life: 0.45,
      draw(cx, k) {
        const pts = [top]
        let x = top.x
        for (let y = 12; y < c.y; y += 10) {
          x += (Math.random() - 0.5) * 14
          pts.push({ x, y })
        }
        pts.push(c)
        cx.globalCompositeOperation = 'lighter'
        cx.globalAlpha = 1 - k * 0.7
        for (const [w, col] of [
          [5, 'rgba(255,225,74,.35)'],
          [3, '#ffe14a'],
          [1, '#ffffff'],
        ]) {
          cx.strokeStyle = col
          cx.lineWidth = w
          cx.beginPath()
          pts.forEach((p, i) => (i ? cx.lineTo(p.x, p.y) : cx.moveTo(p.x, p.y)))
          cx.stroke()
        }
      },
    })
    ps.burst(30, () => {
      const a = Math.random() * 7,
        sp = 30 + Math.random() * 60
      return {
        x: c.x,
        y: c.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        drag: 6,
        life: 0.4,
        size: 1,
        cols: ['#ffffff', '#ffe14a'],
        glow: true,
      }
    })
    def.status = 'shock'
    def.statusT = 2
    const p = damage(def, 100, { crit: Math.random() < 0.3 })
    await tween(300, (k) => {
      darken = 0.55 * (1 - k)
    })
    await p
  },
  async holy(att, def) {
    const g = anchor(def)
    await tween(500, (k) => {
      curGlyph = { x: g.x, y: g.y, r: 6 + 18 * ease(k), a: k }
    })
    flashScreen = 0.4
    fxs.push({
      age: 0,
      life: 0.7,
      draw(cx, k) {
        cx.globalCompositeOperation = 'lighter'
        const w = 14 * (1 - k * 0.6)
        const grd = cx.createLinearGradient(g.x - w, 0, g.x + w, 0)
        grd.addColorStop(0, 'rgba(255,240,184,0)')
        grd.addColorStop(0.5, 'rgba(255,248,220,.95)')
        grd.addColorStop(1, 'rgba(255,240,184,0)')
        cx.globalAlpha = 1 - k
        cx.fillStyle = grd
        cx.fillRect(g.x - w, cam.y, w * 2, g.y - cam.y)
      },
    })
    ps.burst(36, () => ({
      x: g.x + (Math.random() - 0.5) * 26,
      y: g.y - Math.random() * 10,
      vx: 0,
      vy: -20 - Math.random() * 40,
      life: 0.9,
      size: 1,
      cols: ['#ffffff', '#fff0a0', '#f2c13a'],
      glow: true,
      twinkle: true,
    }))
    const p = damage(def, 85, {})
    await tween(400, (k) => {
      curGlyph = { x: g.x, y: g.y, r: 24 + k * 6, a: 1 - k }
    })
    curGlyph = null
    await p
  },
  async dark(att, def) {
    const m = centerOf(att),
      orbPos = { x: m.x, y: m.y - att.def.img.foot * 0.6 - 8 }
    await tween(500, (k) => {
      curOrb = { x: orbPos.x, y: orbPos.y, r: 2 + 6 * k }
      const a = Math.random() * 7
      ps.add({
        x: orbPos.x + Math.cos(a) * 26,
        y: orbPos.y + Math.sin(a) * 16,
        vx: -Math.cos(a) * 50,
        vy: -Math.sin(a) * 30,
        life: 0.5,
        size: 1,
        cols: ['#d8a0ff', '#a04ae8'],
        glow: true,
      })
    })
    const c = centerOf(def)
    await tween(320, (k) => {
      curOrb = {
        x: orbPos.x + (c.x - orbPos.x) * easeIn(k),
        y: orbPos.y + (c.y - orbPos.y) * easeIn(k),
        r: 8,
      }
    })
    await tween(150, (k) => {
      curOrb = { x: c.x, y: c.y, r: 8 * (1 - k) }
    })
    curOrb = null
    ps.burst(30, () => {
      const a = Math.random() * 7,
        sp = 40 + Math.random() * 40
      return {
        x: c.x,
        y: c.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp * 0.7,
        drag: 4,
        life: 0.5,
        size: 2,
        cols: ['#2a0a3a', '#6a1aa8', '#a04ae8'],
        glow: false,
      }
    })
    fxs.push({
      age: 0,
      life: 0.4,
      draw(cx, k) {
        cx.globalAlpha = 1 - k
        cx.strokeStyle = '#a04ae8'
        cx.lineWidth = 2
        cx.beginPath()
        cx.arc(c.x, c.y, 4 + k * 20, -0.6, 2.2)
        cx.stroke()
      },
    })
    shake = 3
    await damage(def, 95, {})
  },
  async shadow(att, def) {
    const dir = Math.sign(def.x - att.x) || 1
    ps.burst(18, () => ({
      x: anchor(att).x + (Math.random() - 0.5) * 18,
      y: anchor(att).y - Math.random() * 24,
      vx: 0,
      vy: -10,
      life: 0.6,
      size: 2,
      cols: ['#3a3458', '#1a1628'],
      alpha: 0.8,
    }))
    await tween(220, (k) => {
      att.alpha = 1 - k
    })
    att.ox = def.x - att.x + dir * 26
    att.oy = def.y - att.y
    await tween(160, (k) => {
      att.alpha = k
    })
    att.anim = { name: 'attack', t: 0.45 }
    const c = centerOf(def)
    for (const s of [1, -1]) {
      fxs.push({
        age: 0,
        life: 0.3,
        draw(cx, k) {
          cx.globalCompositeOperation = 'lighter'
          cx.globalAlpha = 1 - k
          cx.strokeStyle = '#d8d0ff'
          cx.lineWidth = 2
          cx.beginPath()
          cx.moveTo(c.x - 14, c.y - 12 * s)
          cx.lineTo(c.x - 14 + 28 * Math.min(1, k * 3), c.y - 12 * s + 24 * s * Math.min(1, k * 3))
          cx.stroke()
        },
      })
      await wait(110)
    }
    const p = damage(def, 90, { crit: true })
    await tween(250, (k) => {
      att.anim = { name: 'attack', t: 0.62 + 0.38 * k }
    })
    att.anim = null
    await tween(200, (k) => {
      att.alpha = 1 - k
    })
    att.ox = att.oy = 0
    await tween(200, (k) => {
      att.alpha = k
    })
    await p
  },
}
let curGlyph = null,
  curOrb = null
const CHARGE = { fire: 320, water: 260, leaf: 450, earth: 220, bolt: 220, holy: 480, dark: 500 }
for (const key of Object.keys(SKILL)) {
  const run0 = SKILL[key]
  SKILL[key] = async (att, def) => {
    const ms = CHARGE[key]
    if (ms) {
      const cast = (att.anim = { name: 'cast', t: 0 })
      att.charging = key
      tween(ms, (k) => {
        cast.t = 0.45 * k
      })
        .then(() => {
          att.charging = null
          att.released = 0.25
          return tween(560, (k) => {
            cast.t = 0.45 + 0.55 * k
          })
        })
        .then(() => {
          if (att.anim === cast) att.anim = null
        })
    }
    try {
      await run0(att, def)
    } finally {
      att.charging = null
    }
  }
}
