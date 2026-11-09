/* PixelFX (https://github.com/patch-gg/pixelfx, 044e12a): core + 9 effects, bundled for the prototype trial.
 * MIT License
 *
 * Copyright (c) 2026 Patch
 * Copyright (c) 2026 Hugo Duprez
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * # Notices
 *
 * **Hugo Duprez.** `src/core/sim.js` and the effects that say so at the top of their file adapt Sprite Fusion's
 * open-source pixel art VFX (https://www.spritefusion.com/pixel-art-vfx), Copyright (c) 2026 Hugo Duprez, MIT License.
 *
 * **Hollow Crown.** `src/core/act.js` adapts how Hollow Crown plays its skills (poses on 12 fps steps, hit-stops, the springy
 * straw target), from
 * https://github.com/rehan-remade/hollow-crown, Copyright (c) 2026 rehan-remade, MIT License.
 *
 * **Patch Pixel.** The font in `gallery/fonts` is Patch's own and is not covered by this repository's MIT license. See
 * `gallery/fonts/NOTICE.md`.
 */
var PixelFX = (() => {
  var __defProp = Object.defineProperty
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor
  var __getOwnPropNames = Object.getOwnPropertyNames
  var __hasOwnProp = Object.prototype.hasOwnProperty
  var __export = (target, all) => {
    for (var name in all) __defProp(target, name, { get: all[name], enumerable: true })
  }
  var __copyProps = (to, from, except, desc) => {
    if ((from && typeof from === 'object') || typeof from === 'function') {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, {
            get: () => from[key],
            enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
          })
    }
    return to
  }
  var __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod)

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pfx-build/entry.js
  var entry_exports = {}
  __export(entry_exports, {
    FX: () => FX,
    clearFrame: () => clearFrame,
    composite: () => composite,
    createFrame: () => createFrame,
    createFx: () => createFx,
  })

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/core/math.js
  var TAU = Math.PI * 2
  var clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x)
  var lerp = (a, b, t) => a + (b - a) * t
  var wrap = (x, m) => ((x % m) + m) % m
  var seg = (t, t0, t1) => clamp((t - t0) / (t1 - t0))
  var smooth = (e0, e1, x) => {
    const t = seg(x, e0, e1)
    return t * t * (3 - 2 * t)
  }
  var ease = {
    linear: (t) => t,
    inQuad: (t) => t * t,
    outQuad: (t) => 1 - (1 - t) * (1 - t),
    inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    inCubic: (t) => t * t * t,
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    inQuart: (t) => t * t * t * t,
    outQuart: (t) => 1 - Math.pow(1 - t, 4),
    inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    outSine: (t) => Math.sin((t * Math.PI) / 2),
    inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    inBack: (t, s = 1.70158) => (t <= 0 ? 0 : t >= 1 ? 1 : (s + 1) * t * t * t - s * t * t),
    outBack: (t, s = 1.70158) =>
      t <= 0 ? 0 : t >= 1 ? 1 : 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
    outElastic: (t) =>
      t <= 0
        ? 0
        : t >= 1
          ? 1
          : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1,
    outBounce: (t) => {
      const n = 7.5625,
        d = 2.75
      if (t < 1 / d) return n * t * t
      if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75
      if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375
      return n * (t -= 2.625 / d) * t + 0.984375
    },
  }
  function hash(...ns) {
    let h = 2654435769
    for (const n of ns) {
      h = Math.imul(h ^ (n | 0), 2246822507)
      h ^= h >>> 13
      h = Math.imul(h, 3266489909)
      h ^= h >>> 16
    }
    return h >>> 0
  }
  var rand = (...ns) => hash(...ns) / 4294967296
  var Rng = class {
    constructor(seed2 = 1) {
      this.s = seed2 >>> 0 || 1
    }
    next() {
      let t = (this.s = (this.s + 1831565813) >>> 0)
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    range(a, b) {
      return a + (b - a) * this.next()
    }
    int(a, b) {
      return Math.floor(this.range(a, b + 1))
    }
    chance(p) {
      return this.next() < p
    }
    sign() {
      return this.next() < 0.5 ? -1 : 1
    }
    pick(list) {
      return list[Math.floor(this.next() * list.length)]
    }
    /** Roughly normal, mean 0, sd 1. */
    gauss() {
      return (this.next() + this.next() + this.next() + this.next() - 2) * 1.732
    }
  }
  var rng = (...ns) => new Rng(hash(...ns))
  function tileNoise(x, y, px = 0, py = 0, seed2 = 0) {
    const ix = Math.floor(x),
      iy = Math.floor(y),
      fx = x - ix,
      fy = y - iy
    const ux = fx * fx * (3 - 2 * fx),
      uy = fy * fy * (3 - 2 * fy)
    const x0 = px ? wrap(ix, px) : ix,
      x1 = px ? wrap(ix + 1, px) : ix + 1
    const y0 = py ? wrap(iy, py) : iy,
      y1 = py ? wrap(iy + 1, py) : iy + 1
    const a = rand(x0, y0, seed2),
      b = rand(x1, y0, seed2),
      c = rand(x0, y1, seed2),
      d = rand(x1, y1, seed2)
    return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1
  }
  function tileFbm(x, y, px = 0, py = 0, seed2 = 0, octaves = 3) {
    let s = 0,
      a = 0.5,
      n = 0,
      k = 1
    for (let o = 0; o < octaves; o++) {
      s += tileNoise(x * k, y * k, px * k, py * k, seed2 + o * 101) * a
      n += a
      a *= 0.5
      k *= 2
    }
    return s / n
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/core/color.js
  var rgb = (r, g, b) => (255 << 24) | ((b & 255) << 16) | ((g & 255) << 8) | (r & 255)
  var red = (c) => c & 255
  var green = (c) => (c >>> 8) & 255
  var blue = (c) => (c >>> 16) & 255
  function hex(h) {
    if (typeof h === 'number') return h
    let s = h.replace('#', '')
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2]
    const v = parseInt(s.slice(0, 6), 16)
    return rgb((v >> 16) & 255, (v >> 8) & 255, v & 255)
  }
  var toHex = (c) =>
    '#' + [red(c), green(c), blue(c)].map((v) => v.toString(16).padStart(2, '0')).join('')
  function mix(a, b, t) {
    t = clamp(t)
    return rgb(
      red(a) + (red(b) - red(a)) * t,
      green(a) + (green(b) - green(a)) * t,
      blue(a) + (blue(b) - blue(a)) * t
    )
  }
  var scale = (c, k) =>
    rgb(Math.min(255, red(c) * k), Math.min(255, green(c) * k), Math.min(255, blue(c) * k))
  var luma = (c) => (0.299 * red(c) + 0.587 * green(c) + 0.114 * blue(c)) / 255
  var ramp = (list) => list.map(hex)
  function fit(r, n) {
    r = r.map(hex)
    if (r.length === n) return r
    return Array.from(
      { length: n },
      (_, i) => r[Math.round((i * (r.length - 1)) / Math.max(1, n - 1))]
    )
  }
  var PAL = {
    fire: ['#1f0b10', '#4a1118', '#8c1d1c', '#cc3a1a', '#f2701f', '#ffae35', '#ffe27a', '#fff8d6'],
    ember: ['#1a0a0e', '#3d1012', '#701a14', '#a8301a', '#e0561e', '#ff8a2a', '#ffc46a'],
    lava: ['#14060a', '#380a10', '#6e1210', '#ac2410', '#e8501a', '#ff8c2a', '#ffd25a'],
    smoke: ['#0e0c12', '#1d1a22', '#2e2a35', '#433e4b', '#5c5664', '#7b7484', '#a39cab'],
    dust: ['#1c1610', '#33281c', '#4f3f2c', '#6e5a40', '#927a58', '#b89f78', '#dcc8a2'],
    ice: ['#0c1430', '#162c5c', '#1f4f94', '#2f7fcc', '#58b4ec', '#9bdcff', '#d8f4ff', '#ffffff'],
    water: ['#081830', '#0e2e5a', '#14508c', '#1c76bc', '#36a2e0', '#78ccf4', '#c4ecff', '#ffffff'],
    electric: ['#0a0f2e', '#172a78', '#2550d0', '#3f8cff', '#7cc8ff', '#c8f0ff', '#ffffff'],
    volt: ['#24160a', '#5e3a0c', '#a8680f', '#e8a218', '#ffd23c', '#fff08a', '#ffffff'],
    poison: ['#0d1a0c', '#173a14', '#265e18', '#3f8a1e', '#6cb82a', '#a8e04a', '#e0ff8a'],
    holy: ['#2a1c08', '#5a3e10', '#9a6c18', '#d8a428', '#ffd84a', '#fff09a', '#fffbe6', '#ffffff'],
    heal: ['#08201a', '#0f3f2c', '#17663e', '#24924e', '#3ec466', '#7ee88a', '#c8ffc4', '#ffffff'],
    arcane: [
      '#140a26',
      '#2b1252',
      '#481c88',
      '#6b2cc0',
      '#9a48ec',
      '#c684ff',
      '#ecc8ff',
      '#ffffff',
    ],
    shadow: [
      '#050308',
      '#0f0a18',
      '#1c1230',
      '#2c1a4a',
      '#432468',
      '#5e3290',
      '#8048b8',
      '#a970e0',
    ],
    blood: ['#14040a', '#3a0a14', '#6a101c', '#a01824', '#d42a30', '#ff5a50', '#ff9a8a'],
    earth: ['#140e0a', '#2a1e14', '#47321e', '#69492a', '#8e6638', '#b88a52', '#dcb47c'],
    stone: ['#0e0e12', '#1c1c24', '#2c2c38', '#42424f', '#5c5c6b', '#7d7d8c', '#a4a4b2', '#d0d0da'],
    gold: ['#1e1206', '#4a2c08', '#86520c', '#c48412', '#f0b424', '#ffe066', '#fff6c4', '#ffffff'],
    leaf: ['#0c1a0e', '#163418', '#225224', '#357530', '#4f9a3a', '#7cc048', '#b4e070', '#e4ffb0'],
    wood: ['#160c06', '#2e1a0c', '#4a2c14', '#6a421e', '#8e5c2c', '#b47c40', '#d8a464'],
    metal: ['#0c0e14', '#1c2230', '#2e3648', '#4a5468', '#6e7a90', '#9aa6ba', '#d0d8e6', '#ffffff'],
    bone: ['#1a1814', '#3a352c', '#5e5648', '#8a806c', '#b8ad96', '#e4dcc8', '#fffaf0'],
    neon: ['#1a0516', '#3d0a33', '#701560', '#b0228f', '#f53cd1', '#ff86e6', '#ffd2f6', '#ffffff'],
    cyber: ['#041418', '#08303a', '#0c5260', '#108088', '#18b4b0', '#4ce8d8', '#b4fff0', '#ffffff'],
    matrix: [
      '#020a04',
      '#05200c',
      '#0a3c16',
      '#106624',
      '#1a9a34',
      '#3cd650',
      '#a4ffa8',
      '#e8ffe8',
    ],
    candy: ['#ff4a5a', '#ff9a2a', '#ffe03c', '#5ad84a', '#3cc8ff', '#7a6cff', '#f53cd1'],
    night: ['#07060d', '#0c0a18', '#131026', '#1b1734', '#241f44', '#2f2956'],
  }
  var RAMP = Object.fromEntries(Object.entries(PAL).map(([k, v]) => [k, ramp(v)]))
  var WHITE = hex('#ffffff')
  var BLACK = hex('#000000')
  var INK = hex('#0b0a10')
  var PATCH = hex('#f53cd1')

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/core/particles.js
  function cycle(t, period, count, seed2, life, fn) {
    for (let i = 0; i < count; i++) {
      const g = rng(seed2, i, 911)
      const born = g.next() * period
      const L = typeof life === 'function' ? life(g) : life
      let age = (((t - born) % period) + period) % period
      for (; age < L; age += period) fn(age, L, rng(seed2, i), i)
    }
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/core/sim.js
  var GRAVITY = 950
  var CROSS = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]
  var DIAG = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]
  var HOT = ['#fff3a6', '#ffe26b', '#ff8a2a', '#f2561d'].map(hex)
  var FIRE_RAMP = [
    '#ffffff',
    '#fff3a6',
    '#ffe26b',
    '#ffc23d',
    '#ff8a2a',
    '#f2561d',
    '#c9281f',
    '#8a1f17',
    '#4a1712',
  ].map(hex)
  var SMOKE_RAMP = ['#7b6f72', '#5d5660', '#433d48', '#2b2630', '#1a171e'].map(hex)
  var rampAt = (r, t) => r[Math.min(r.length - 1, Math.max(0, Math.floor(t * r.length)))]
  var P = {
    SPARK: 0,
    MOTE: 1,
    STREAK: 2,
    FLAKE: 3,
    VAPOUR: 4,
    DUST: 5,
    STAR: 6,
    EMBER: 7,
    SMOKE: 8,
    FIRE: 9,
    BRAND: 10,
    GRIT: 11,
  }
  var PF = { SMOKES: 1, BIG: 2, BACK: 4 }
  var SOFT = /* @__PURE__ */ new Set([P.VAPOUR, P.DUST, P.SMOKE])
  var Particles = class {
    constructor(opts = {}) {
      this.R = opts.rng ?? new Rng(opts.seed ?? 1)
      this.list = []
      this.t = 0
      this.ground = opts.ground ?? (() => Infinity)
      this.sparks = (opts.sparks ?? HOT).map(hex)
      this.haze = opts.haze === void 0 ? null : hex(opts.haze)
      this.onLand = opts.onLand ?? null
    }
    /** delay: seconds before it appears; flag: PF bits. col 0 lets FIRE and SMOKE use their own ramps. */
    spawn(k, x, y, vx, vy, life, col = WHITE, size = 1, delay = 0, flag = 0) {
      this.list.push({
        k,
        x,
        y,
        vx,
        vy,
        life,
        max: life,
        col: col ? hex(col) : 0,
        size,
        seed: this.R.next() * 100,
        delay,
        flag,
      })
    }
    get count() {
      return this.list.length
    }
    update(dt) {
      this.t += dt
      const R5 = this.R,
        t = this.t
      for (let i = this.list.length - 1; i >= 0; i--) {
        const p = this.list[i]
        if (p.delay > 0) {
          p.delay -= dt
          continue
        }
        if ((p.life -= dt) <= 0) {
          if (p.k === P.FIRE && p.flag & PF.SMOKES) {
            const big = p.flag & PF.BIG
            this.spawn(
              P.SMOKE,
              p.x,
              p.y,
              p.vx * 0.6,
              p.vy * 0.6 - 6,
              big ? R5.range(1.3, 2.3) : R5.range(0.8, 1.4),
              0,
              p.size * (big ? 0.85 : 0.7),
              0,
              big ? PF.BIG : 0
            )
          }
          this.list.splice(i, 1)
          continue
        }
        switch (p.k) {
          case P.FIRE:
            p.vy -= 95 * dt
            p.vx += Math.sin(t * 17 + p.seed) * 30 * dt
            p.vx -= p.vx * 5 * dt
            p.vy -= p.vy * 3.2 * dt
            break
          case P.GRIT: {
            p.vy += GRAVITY * dt
            p.vx -= p.vx * 0.8 * dt
            const g = this.ground(p.x),
              ny = p.y + p.vy * dt
            p.x += p.vx * dt
            if (p.vy > 0 && p.y <= g && ny >= g) {
              p.y = g - 0.25
              if (p.vy > 130 && R5.chance(0.4))
                ((p.vy = -p.vy * 0.25), (p.vx = p.vx * 0.5 + R5.range(-10, 10)))
              else ((p.vx = p.vy = 0), (p.life = Math.min(p.life, 0.5)))
            } else p.y = ny
            continue
          }
          case P.BRAND: {
            p.vy += GRAVITY * 0.8 * dt
            p.vx -= p.vx * 0.9 * dt
            if (R5.chance(0.9 * Math.min(1, dt * 60)))
              this.spawn(
                P.FIRE,
                p.x,
                p.y,
                p.vx * 0.1 + R5.range(-7, 7),
                p.vy * 0.1 - 10,
                R5.range(0.16, 0.32),
                0,
                R5.range(0.9, 1.7) * (0.5 + (p.life / p.max) * 0.6),
                0,
                R5.chance(0.4) ? PF.SMOKES : 0
              )
            const g = this.ground(p.x),
              ny = p.y + p.vy * dt
            p.x += p.vx * dt
            if (p.vy > 0 && p.y <= g && ny >= g) {
              this.onLand?.(p.x, g)
              this.list.splice(i, 1)
            } else p.y = ny
            continue
          }
          case P.SPARK: {
            p.vy += GRAVITY * 0.45 * dt
            p.vx -= p.vx * 2.2 * dt
            p.vy -= p.vy * 2.2 * dt
            const g = this.ground(p.x),
              ny = p.y + p.vy * dt
            p.x += p.vx * dt
            if (p.vy > 0 && p.y <= g && ny >= g)
              ((p.vy = -p.vy * 0.45), (p.vx *= 0.7), (p.y = g - 0.25))
            else p.y = ny
            continue
          }
          case P.STREAK:
            ;((p.vx += p.vx * 3 * dt), (p.vy += p.vy * 3 * dt))
            break
          case P.FLAKE:
            p.vx -= p.vx * 2.2 * dt
            p.vy -= p.vy * 2.2 * dt - 35 * dt
            p.x += Math.sin(this.t * 2.5 + p.seed) * 7 * dt
            break
          case P.EMBER:
            p.vy += (-30 + Math.sin(t * 3 + p.seed) * 20) * dt
            p.vx += Math.cos(t * 2.3 + p.seed) * 45 * dt
            p.vx -= p.vx * 1.6 * dt
            p.vy -= p.vy * 1.6 * dt
            break
          case P.SMOKE: {
            const big = p.flag & PF.BIG
            p.vy -= (big ? 23 : 16) * dt
            p.vx += Math.sin(t * 1.3 + p.seed) * 8 * dt
            p.vx -= p.vx * 1.6 * dt
            p.vy -= p.vy * 1.2 * dt
            break
          }
          case P.MOTE:
            p.vx -= p.vx * 0.6 * dt
            p.vy -= p.vy * 0.6 * dt
            break
          default: {
            const drag = SOFT.has(p.k) ? 4 : 1.6
            p.vx -= p.vx * drag * dt
            p.vy -= p.vy * drag * dt + 5 * dt
          }
        }
        p.x += p.vx * dt
        p.y += p.vy * dt
      }
    }
    draw(p, layer) {
      for (const q of this.list) {
        if (q.delay > 0) continue
        if (layer && (SOFT.has(q.k) || q.flag & PF.BACK ? 'back' : 'front') !== layer) continue
        const k = q.life / q.max,
          x = q.x,
          y = q.y,
          sp = Math.hypot(q.vx, q.vy) || 1,
          ux = q.vx / sp,
          uy = q.vy / sp
        switch (q.k) {
          case P.SPARK: {
            const S = this.sparks,
              head = k > 0.6 ? S[0] : k > 0.3 ? S[1] : S[2],
              len2 = Math.min(9, 1 + sp * 0.022)
            p.line(
              x - ux * len2,
              y - uy * len2,
              x - ux * len2 * 0.4,
              y - uy * len2 * 0.4,
              k > 0.5 ? head : S[S.length - 1]
            )
            p.line(x - ux * len2 * 0.45, y - uy * len2 * 0.45, x, y, head)
            p.glow(x, y, 3, head, 0.45 * k)
            break
          }
          case P.MOTE: {
            const len2 = Math.min(16, 0.5 + sp * 0.026) * q.size,
              a = k < 0.35 ? k / 0.35 : 1
            p.line(
              x - ux * len2,
              y - uy * len2,
              x - ux * len2 * 0.35,
              y - uy * len2 * 0.35,
              scale(q.col, 0.55),
              a
            )
            p.line(x - ux * len2 * 0.4, y - uy * len2 * 0.4, x, y, q.col, a)
            p.glow(x, y, 2.5 + q.size, q.col, 0.4 * k)
            break
          }
          case P.STREAK: {
            const L = clamp(sp / 30, 1, 7)
            for (let d = L; d >= 0; d -= 0.5)
              p.dot(
                x - ux * d,
                y - uy * d,
                d < 1 ? WHITE : d < L * 0.5 ? q.col : scale(q.col, 0.6),
                d < L * 0.5 ? 1 : 1.2 - d / L
              )
            p.glow(x, y, 4, q.col, 0.4)
            break
          }
          case P.FLAKE: {
            const a = Math.min(1, k * 3)
            p.dot(x, y, q.col, a)
            if (q.size > 1.3)
              for (const [dx, dy] of CROSS) p.dot(x + dx, y + dy, scale(q.col, 0.8), a * 0.8)
            break
          }
          case P.VAPOUR: {
            const r = q.size * (0.6 + (1 - k) * 0.9)
            p.disc(x, y, r, q.col, Math.pow(k, 1.3) * 0.45)
            if (this.haze) p.glow(x, y, r * 1.8, this.haze, 0.16 * k)
            break
          }
          case P.DUST:
            p.disc(x, y, q.size * (0.6 + (1 - k) * 0.9), q.col, Math.pow(k, 1.3) * 0.7)
            break
          case P.SMOKE: {
            const age = 1 - k,
              big = q.flag & PF.BIG
            const r = q.size * (0.65 + Math.min(1, age * 2.5) * 0.45 + age * (big ? 0.5 : 0.4))
            const a = Math.min(1, age * 12) * Math.min(1, k * 2.4) * (big ? 0.7 : 0.58)
            const c = q.col
              ? mix(q.col, rampAt(SMOKE_RAMP, age), age)
              : rampAt(SMOKE_RAMP, age * 1.05)
            p.disc(x, y, r, c, a * 0.45)
            p.disc(x + r * 0.05, y + r * 0.06, r * 0.74, c, a * 0.62)
            if (age < 0.5)
              p.disc(
                x - r * 0.22,
                y - r * 0.3,
                r * 0.5,
                mix(c, WHITE, 0.12),
                a * 0.4 * (1 - age * 2)
              )
            break
          }
          case P.FIRE: {
            const age = 1 - k,
              heat = Math.min(0.999, Math.pow(age, 0.62) + (q.seed % 1) * 0.1),
              F = FIRE_RAMP,
              n = F.length
            const idx = Math.min(n - 2, Math.floor(heat * (n - 1)))
            const r = q.size * (0.55 + 0.45 * Math.min(1, age * 7)) * (1 - age * 0.55),
              c = F[idx]
            if (idx >= n - 2) p.disc(x, y, r, c, Math.min(1, k * 3) * 0.85)
            else {
              p.circle(x, y, r, F[Math.min(n - 1, idx + 2)])
              p.circle(x - r * 0.16, y - r * 0.22, r * 0.78, c)
              if (r > 1.6) p.circle(x, y - r * 0.9, r * 0.42, c)
              if (idx <= 3 && r > 1.8)
                p.circle(x - r * 0.28, y - r * 0.34, r * 0.36, F[Math.max(0, idx - 1)])
              if (idx < 6) p.glow(x, y, r * 2.4 + 2, c, 0.18 * k)
            }
            break
          }
          case P.BRAND:
            p.circle(x, y, 1.6, HOT[3])
            p.px(x, y, Math.sin(this.t * 40 + q.seed) > 0 ? HOT[0] : HOT[1])
            p.px(x + 1, y, HOT[1])
            p.glow(x, y, 7, HOT[2], 0.45)
            break
          case P.GRIT:
            if (k > 0.25 || k * 4 > 0.5) {
              p.px(x, y, q.col)
              if (q.size >= 2)
                (p.px(x + 1, y, q.col),
                  p.px(x, y + 1, scale(q.col, 0.8)),
                  p.px(x + 1, y + 1, scale(q.col, 0.7)))
            }
            break
          case P.EMBER: {
            const c = k > 0.6 ? this.sparks[0] : k > 0.3 ? this.sparks[1] : this.sparks[2]
            if (k < 0.25 && Math.sin(this.t * 40 + q.seed) < 0) break
            p.px(x, y, c)
            if (q.size > 1.5) p.px(x, y + 1, this.sparks[this.sparks.length - 1])
            p.glow(x, y, 3 + q.size, c, 0.35 * k)
            break
          }
          default: {
            const tw = 0.6 + 0.4 * Math.sin(this.t * (8 + (q.seed % 5)) + q.seed)
            if (q.size < 1) {
              if (tw * k > 0.25) p.px(x, y, tw > 0.8 ? WHITE : q.col)
              p.glow(x, y, 3, q.col, 0.4 * k * tw)
              break
            }
            sparkle(
              p,
              x,
              y,
              q.size * tw * Math.min(1, k * 3),
              q.col,
              scale(q.col, 0.75),
              0.5 * k * tw
            )
          }
        }
      }
    }
  }
  var B = { SHARD: 0, CHUNK: 1, DRIP: 2 }
  var Bits = class {
    constructor(opts = {}) {
      this.list = []
      this.ground = opts.ground ?? (() => Infinity)
    }
    add(b) {
      const life = b.life ?? 1
      this.list.push({
        kind: B.SHARD,
        vx: 0,
        vy: 0,
        a: 0,
        va: 0,
        s: 1,
        c: WHITE,
        g: 1,
        drag: 0,
        bounce: 0,
        rest: false,
        ...b,
        life,
        max: life,
      })
    }
    get count() {
      return this.list.length
    }
    update(dt) {
      for (let i = this.list.length - 1; i >= 0; i--) {
        const b = this.list[i]
        if ((b.life -= dt) <= 0) {
          this.list.splice(i, 1)
          continue
        }
        if (b.rest) continue
        b.vy += GRAVITY * b.g * dt
        b.vx -= b.vx * b.drag * dt
        b.vy -= b.vy * b.drag * dt
        b.x += b.vx * dt
        b.y += b.vy * dt
        b.a += b.va * dt
        const floor = this.ground(b.x),
          sp = b.vy
        if (b.g <= 0 || b.y < floor || sp <= 0) continue
        b.y = floor - 0.01
        if (b.kind === B.DRIP) b.life = 0
        else if (b.bounce > 0 && sp > 70) ((b.vy = -sp * b.bounce), (b.vx *= 0.7), (b.va *= 0.6))
        else ((b.rest = true), (b.vx = b.vy = 0))
      }
    }
    draw(p) {
      for (const b of this.list) {
        const a = Math.min(1, b.life / 0.4),
          ca = Math.cos(b.a),
          sa = Math.sin(b.a)
        if (b.kind === B.SHARD) {
          for (let d = -b.s / 2; d <= b.s / 2; d += 0.5)
            p.dot(b.x + ca * d, b.y + sa * d, d > b.s / 2 - 0.6 ? WHITE : hex(b.c), a)
        } else if (b.kind === B.DRIP) {
          p.dot(b.x, b.y, hex(b.c), a)
          p.dot(b.x, b.y - 1, hex(b.c), a * 0.5)
        } else {
          const R5 = (b.ramp ?? ['#1c2030', '#3a4a66', '#6e86a8', '#a8c0dc', '#e8f2ff']).map(hex),
            n = R5.length
          const x = Math.round(b.x),
            y = Math.round(b.y),
            r = Math.ceil(b.s) + 1
          for (let py = -r; py <= r; py++)
            for (let px = -r; px <= r; px++) {
              const u = (px + 0.5) * ca + (py + 0.5) * sa,
                v = -(px + 0.5) * sa + (py + 0.5) * ca
              const d = Math.abs(u) / b.s + Math.abs(v) / (b.s * 0.62)
              if (d > 1.3) continue
              p.dot(
                x + px,
                y + py,
                d > 1
                  ? R5[0]
                  : v < 0
                    ? u < 0
                      ? R5[n - 1]
                      : R5[n - 2]
                    : u < 0
                      ? R5[n - 3]
                      : R5[Math.max(1, n - 4)],
                a
              )
            }
        }
      }
    }
  }
  var Lights = class {
    constructor() {
      this.list = []
    }
    add(x, y, r, color, k, life) {
      this.list.push({ x, y, r, color: hex(color), k, life, max: life })
    }
    update(dt) {
      for (let i = this.list.length - 1; i >= 0; i--)
        if ((this.list[i].life -= dt) <= 0) this.list.splice(i, 1)
    }
    draw(p) {
      for (const l of this.list) {
        const k = l.life / l.max
        p.glow(l.x, l.y, l.r * (0.55 + 0.45 * k), l.color, l.k * k * k)
      }
    }
  }
  function sparkle(p, x, y, arm, c, tip = c, k = 0.6) {
    const n = Math.round(arm)
    if (n < 1) return
    const X = Math.floor(x),
      Y = Math.floor(y)
    for (let d = 1; d <= n; d++) {
      const cc = d > n * 0.6 ? tip : c
      for (const [dx, dy] of CROSS) p.px(X + dx * d, Y + dy * d, cc)
    }
    if (n >= 3) for (const [dx, dy] of DIAG) p.px(X + dx, Y + dy, c)
    if (n >= 6) for (const [dx, dy] of DIAG) p.px(X + dx * 2, Y + dy * 2, tip)
    p.px(X, Y, WHITE)
    p.glow(x, y, 4 + n * 2, c, k)
  }
  function flare(p, x, y, L, k, ramp2) {
    if (L < 1) return
    const R5 = ramp2.map(hex),
      n = R5.length
    for (let i = 0; i < 8; i++) {
      const an = (i * Math.PI) / 4,
        len2 = i % 4 === 0 ? L : i % 2 === 0 ? L * 0.6 : L * 0.3,
        ca = Math.cos(an),
        sa = Math.sin(an)
      for (let d = 0; d <= len2; d += 0.5) {
        const u = d / len2
        p.dot(
          x + ca * d,
          y + sa * d,
          u < 0.35 ? WHITE : u < 0.7 ? R5[n - 2] : R5[n - 3],
          u < 0.6 ? 1 : k * 1.5 * (1 - u) + 0.2
        )
      }
    }
  }
  function band(p, cx, cy, r, sy, th, k, ramp2, keep = () => true, hot = false) {
    if (r <= 0 || k <= 0) return
    const R5 = ramp2.map(hex),
      n = R5.length
    for (let j = 0, m = Math.ceil(r * TAU * 1.2); j < m; j++) {
      const ang = (j / m) * TAU,
        ca = Math.cos(ang),
        sa = Math.sin(ang)
      if (!keep(ang)) continue
      for (let o = th; o >= 0; o -= 0.5) {
        const u = o / th,
          c =
            u < 0.15
              ? hot
                ? WHITE
                : R5[n - 1]
              : u < 0.4
                ? R5[n - 2]
                : u < 0.7
                  ? R5[n - 3]
                  : R5[n - 4]
        p.dot(cx + ca * (r - o), cy + sa * (r - o) * sy, c, k * (u < 0.4 ? 1.2 : 1.15 - u))
      }
    }
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/core/font.js
  var MINI = {
    A: '.#.|#.#|###|#.#|#.#',
    B: '##.|#.#|##.|#.#|##.',
    C: '.##|#..|#..|#..|.##',
    D: '##.|#.#|#.#|#.#|##.',
    E: '###|#..|##.|#..|###',
    F: '###|#..|##.|#..|#..',
    G: '.##|#..|#.#|#.#|.##',
    H: '#.#|#.#|###|#.#|#.#',
    I: '###|.#.|.#.|.#.|###',
    J: '..#|..#|..#|#.#|.#.',
    K: '#.#|#.#|##.|#.#|#.#',
    L: '#..|#..|#..|#..|###',
    M: '#.#|###|###|#.#|#.#',
    N: '##.|#.#|#.#|#.#|#.#',
    O: '.#.|#.#|#.#|#.#|.#.',
    P: '##.|#.#|##.|#..|#..',
    Q: '.#.|#.#|#.#|##.|.##',
    R: '##.|#.#|##.|#.#|#.#',
    S: '.##|#..|.#.|..#|##.',
    T: '###|.#.|.#.|.#.|.#.',
    U: '#.#|#.#|#.#|#.#|###',
    V: '#.#|#.#|#.#|#.#|.#.',
    W: '#.#|#.#|###|###|#.#',
    X: '#.#|#.#|.#.|#.#|#.#',
    Y: '#.#|#.#|.#.|.#.|.#.',
    Z: '###|..#|.#.|#..|###',
    0: '###|#.#|#.#|#.#|###',
    1: '.#.|##.|.#.|.#.|###',
    2: '##.|..#|.#.|#..|###',
    3: '##.|..#|.#.|..#|##.',
    4: '#.#|#.#|###|..#|..#',
    5: '###|#..|##.|..#|##.',
    6: '.##|#..|###|#.#|###',
    7: '###|..#|.#.|.#.|.#.',
    8: '###|#.#|###|#.#|###',
    9: '###|#.#|###|..#|##.',
    '+': '...|.#.|###|.#.|...',
    '-': '...|...|###|...|...',
    '!': '#|#|#|.|#',
    '?': '##.|..#|.#.|...|.#.',
    '.': '.|.|.|.|#',
    ',': '..|..|..|.#|#.',
    ':': '.|#|.|#|.',
    '/': '..#|..#|.#.|#..|#..',
    '%': '#.#|..#|.#.|#..|#.#',
    x: '...|#.#|.#.|#.#|...',
    '*': '#.#|.#.|#.#|...|...',
    "'": '#|#|.|.|.',
    '(': '.#|#.|#.|#.|.#',
    ')': '#.|.#|.#|.#|#.',
    '<': '..#|.#.|#..|.#.|..#',
    '>': '#..|.#.|..#|.#.|#..',
    '=': '...|###|...|###|...',
    _: '...|...|...|...|###',
    '#': '#.#|###|#.#|###|#.#',
  }
  var BIG = {
    A: '.###.|#...#|#...#|#####|#...#|#...#|#...#',
    B: '####.|#...#|#...#|####.|#...#|#...#|####.',
    C: '.###.|#...#|#....|#....|#....|#...#|.###.',
    D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
    E: '#####|#....|#....|####.|#....|#....|#####',
    F: '#####|#....|#....|####.|#....|#....|#....',
    G: '.###.|#...#|#....|#.###|#...#|#...#|.####',
    H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
    I: '###|.#.|.#.|.#.|.#.|.#.|###',
    J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
    K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
    L: '#....|#....|#....|#....|#....|#....|#####',
    M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
    N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#',
    O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
    P: '####.|#...#|#...#|####.|#....|#....|#....',
    Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#',
    R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
    S: '.####|#....|#....|.###.|....#|....#|####.',
    T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
    U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
    V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
    W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
    X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
    Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
    Z: '#####|....#|...#.|..#..|.#...|#....|#####',
    0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.',
    1: '.#.|##.|.#.|.#.|.#.|.#.|###',
    2: '.###.|#...#|....#|...#.|..#..|.#...|#####',
    3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
    4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.',
    5: '#####|#....|####.|....#|....#|#...#|.###.',
    6: '..##.|.#...|#....|####.|#...#|#...#|.###.',
    7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
    8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.',
    9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
    '!': '#|#|#|#|#|.|#',
    '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
    '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
    '-': '....|....|....|####|....|....|....',
    '.': '.|.|.|.|.|.|#',
    ',': '..|..|..|..|..|.#|#.',
    ':': '.|.|#|.|.|#|.',
    '/': '....#|....#|...#.|..#..|.#...|#....|#....',
    '%': '##...|##..#|...#.|..#..|.#...|#..##|...##',
    x: '.....|.....|#...#|.#.#.|..#..|.#.#.|#...#',
    '*': '.....|..#..|#.#.#|.###.|#.#.#|..#..|.....',
    "'": '#|#|.|.|.|.|.',
    '<': '...#|..#.|.#..|#...|.#..|..#.|...#',
    '>': '#...|.#..|..#.|...#|..#.|.#..|#...',
    '=': '....|....|####|....|####|....|....',
    '(': '..#|.#.|#..|#..|#..|.#.|..#',
    ')': '#..|.#.|..#|..#|..#|.#.|#..',
    '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.',
  }
  function build(table, h) {
    const out = {}
    for (const [ch, src] of Object.entries(table)) {
      const rows = src.split('|')
      out[ch] = { w: rows[0].length, rows: rows.map((r) => [...r].map((c) => c === '#')) }
      if (rows.length !== h) throw new Error(`glyph ${ch} has ${rows.length} rows, expected ${h}`)
    }
    return out
  }
  var FONTS = {
    mini: { h: 5, space: 2, gap: 1, glyphs: build(MINI, 5) },
    big: { h: 7, space: 3, gap: 1, glyphs: build(BIG, 7) },
  }
  function textWidth(str, font = 'mini') {
    const F = FONTS[font]
    let w = 0
    for (const ch of String(str)) {
      const g = F.glyphs[ch] ?? F.glyphs[ch.toUpperCase()]
      w += (g ? g.w : F.space) + F.gap
    }
    return Math.max(0, w - F.gap)
  }
  function rasterText(str, font, plot2) {
    const F = FONTS[font]
    let x = 0
    for (const ch of String(str)) {
      const g = F.glyphs[ch] ?? F.glyphs[ch.toUpperCase()]
      if (!g) {
        x += F.space + F.gap
        continue
      }
      for (let r = 0; r < F.h; r++) for (let c = 0; c < g.w; c++) if (g.rows[r][c]) plot2(x + c, r)
      x += g.w + F.gap
    }
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/core/painter.js
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16)
  var OUT = { c: 0, a: 1, l: 0, k: 0 }
  var sprites = /* @__PURE__ */ new WeakMap()
  var call = (v, ...args) => (typeof v === 'function' ? v(...args) : v)
  var Painter = class {
    constructor(frame2) {
      this.frame = frame2
      this.reset()
    }
    /** Re-read the frame and clear placement, fade and light strength. */
    reset() {
      const f = this.frame
      this.w = f.w
      this.h = f.h
      this.ox = f.ox | 0
      this.oy = f.oy | 0
      this.C = f.color
      this.L = f.light
      this.tx = 0
      this.ty = 0
      this.fx = 1
      this.cs = 1
      this.sn = 0
      this.fade = 1
      this.lightK = 1
      this.layer = 'front'
      return this
    }
    /** Put the effect's origin at (x, y) in frame space, mirrored if flip, rotated by angle (radians). */
    place(x, y, flip = false, angle = 0) {
      this.tx = x
      this.ty = y
      this.fx = flip ? -1 : 1
      this.cs = Math.cos(angle)
      this.sn = Math.sin(angle)
      return this
    }
    // ---- transforms: local (effect) space <-> screen (frame) space
    toX(x, y) {
      return this.tx + x * this.fx * this.cs - y * this.sn
    }
    toY(x, y) {
      return this.ty + x * this.fx * this.sn + y * this.cs
    }
    fromX(sx, sy) {
      const dx = sx - this.tx,
        dy = sy - this.ty
      return (dx * this.cs + dy * this.sn) * this.fx
    }
    fromY(sx, sy) {
      const dx = sx - this.tx,
        dy = sy - this.ty
      return -dx * this.sn + dy * this.cs
    }
    // the screen pixel of the local pixel cell holding (x, y): mirrors and rotations land on whole cells
    cellX(x, y) {
      return Math.floor(this.toX(Math.floor(x) + 0.5, Math.floor(y) + 0.5))
    }
    cellY(x, y) {
      return Math.floor(this.toY(Math.floor(x) + 0.5, Math.floor(y) + 0.5))
    }
    // ---- raw writes, screen space, whole pixels. Color 0 means "nothing": it never erases what's there.
    put(sx, sy, c, a = 1) {
      if (!c) return
      a *= this.fade
      if (a < 1 && a <= BAYER[((sy & 3) << 2) | (sx & 3)]) return
      const x = sx - this.ox,
        y = sy - this.oy
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return
      this.C[y * this.w + x] = c
    }
    add(sx, sy, c, k = 1) {
      k *= this.fade * this.lightK
      if (k <= 4e-3) return
      const x = sx - this.ox,
        y = sy - this.oy
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return
      const i = y * this.w + x,
        d = this.L[i]
      const r = Math.min(255, (d & 255) + (c & 255) * k) | 0
      const g = Math.min(255, ((d >>> 8) & 255) + ((c >>> 8) & 255) * k) | 0
      const b = Math.min(255, ((d >>> 16) & 255) + ((c >>> 16) & 255) * k) | 0
      this.L[i] = (255 << 24) | (b << 16) | (g << 8) | r
    }
    /**
     * Blend a color over what's there at alpha a (0..1), keeping the result's own alpha: soft smoke, vapour and
     * mist. Use dithered dot() for hard pixel fades and blend() for translucent volumes.
     */
    blendPx(sx, sy, c, a) {
      a *= this.fade
      if (!c || a <= 4e-3) return
      const x = sx - this.ox,
        y = sy - this.oy
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return
      const i = y * this.w + x,
        d = this.C[i],
        da = (d >>> 24) / 255,
        oa = a + da * (1 - a),
        k = a / oa
      const ch = (s) => (((c >>> s) & 255) * k + ((d >>> s) & 255) * (1 - k)) & 255
      this.C[i] = (((oa * 255) & 255) << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)
    }
    /** Translucent pixel at a local point. */
    blend(x, y, c, a) {
      this.blendPx(this.cellX(x, y), this.cellY(x, y), c, a)
    }
    /** A translucent disc: puffs of smoke, vapour, dust. c and a may be functions of (d: 0 center..1 rim, angle). */
    disc(cx, cy, r, c, a) {
      if (r < 0.5) return this.blend(cx, cy, call(c, 0, 0), call(a, 0, 0))
      this.each(cx - r, cy - r, cx + r, cy + r, (x, y, sx, sy) => {
        const dx = x - cx,
          dy = y - cy,
          d2 = dx * dx + dy * dy
        if (d2 > r * r) return
        const d = Math.sqrt(d2) / r,
          ang = Math.atan2(dy, dx)
        this.blendPx(sx, sy, call(c, d, ang), call(a, d, ang))
      })
    }
    /** Read back the color under a local point (0 if empty). */
    get(x, y) {
      const sx = this.cellX(x, y) - this.ox,
        sy = this.cellY(x, y) - this.oy
      return sx < 0 || sy < 0 || sx >= this.w || sy >= this.h ? 0 : this.C[sy * this.w + sx]
    }
    // ---- pixels
    /** One opaque pixel. */
    px(x, y, c) {
      this.put(this.cellX(x, y), this.cellY(x, y), c, 1)
    }
    /** One pixel at alpha a (0..1), faded by ordered dither. */
    dot(x, y, c, a = 1) {
      if (a > 0) this.put(this.cellX(x, y), this.cellY(x, y), c, a)
    }
    /** Add light to one pixel. */
    light(x, y, c, k = 1) {
      this.add(this.cellX(x, y), this.cellY(x, y), c, k)
    }
    /**
     * Visit every screen pixel whose center falls in the local box [x0, x1] x [y0, y1], with that center in
     * local space: fn(lx, ly, sx, sy). The basis of every filled shape, so shapes mirror and rotate exactly.
     */
    each(x0, y0, x1, y1, fn) {
      let ax = Infinity,
        bx = -Infinity,
        ay = Infinity,
        by = -Infinity
      for (let k = 0; k < 4; k++) {
        const x = k & 1 ? x1 : x0,
          y = k & 2 ? y1 : y0,
          sx = this.toX(x, y),
          sy = this.toY(x, y)
        if (sx < ax) ax = sx
        if (sx > bx) bx = sx
        if (sy < ay) ay = sy
        if (sy > by) by = sy
      }
      const sx0 = Math.max(Math.floor(ax), this.ox),
        sx1 = Math.min(Math.ceil(bx), this.ox + this.w - 1)
      const sy0 = Math.max(Math.floor(ay), this.oy),
        sy1 = Math.min(Math.ceil(by), this.oy + this.h - 1)
      for (let sy = sy0; sy <= sy1; sy++)
        for (let sx = sx0; sx <= sx1; sx++) {
          const cx = sx + 0.5,
            cy = sy + 0.5
          fn(this.fromX(cx, cy), this.fromY(cx, cy), sx, sy)
        }
    }
    /**
     * A pixel shader over a local box. fn(x, y, out) returns a color, or sets out.c (color), out.a (alpha),
     * out.l (light color, defaults to out.c) and out.k (light amount). Return nothing to leave the pixel alone.
     */
    shade(x0, y0, x1, y1, fn) {
      const o = OUT
      this.each(x0, y0, x1, y1, (lx, ly, sx, sy) => {
        o.c = 0
        o.a = 1
        o.l = 0
        o.k = 0
        const c = fn(lx, ly, o) || o.c
        if (c) this.put(sx, sy, c, o.a)
        if (o.k > 0) this.add(sx, sy, o.l || c, o.k)
      })
    }
    // ---- shapes. Colors (c) and alphas (a) can be numbers or functions of the shape's own coordinates.
    /** 1 px line. c and a may be functions of u (0 at the start, 1 at the end). */
    line(x0, y0, x1, y1, c, a = 1) {
      let sx = this.cellX(x0, y0),
        sy = this.cellY(x0, y0)
      const ex = this.cellX(x1, y1),
        ey = this.cellY(x1, y1)
      const dx = Math.abs(ex - sx),
        dy = -Math.abs(ey - sy),
        stepx = sx < ex ? 1 : -1,
        stepy = sy < ey ? 1 : -1
      const n = Math.max(dx, -dy) || 1,
        fc = typeof c === 'function',
        fa = typeof a === 'function'
      let err = dx + dy,
        i = 0
      for (;;) {
        const u = i++ / n
        this.put(sx, sy, fc ? c(u) : c, fa ? a(u) : a)
        if (sx === ex && sy === ey) break
        const e2 = 2 * err
        if (e2 >= dy) {
          err += dy
          sx += stepx
        }
        if (e2 <= dx) {
          err += dx
          sy += stepy
        }
      }
    }
    /** Lines through a list of points [[x, y], ...]. */
    polyline(pts, c, a = 1) {
      for (let i = 1; i < pts.length; i++)
        this.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], c, a)
    }
    /** Thick segment with round ends. c and a may be functions of (u along, v across: 0 center, 1 edge). */
    beam(x0, y0, x1, y1, width, c, a = 1) {
      const r = width / 2,
        dx = x1 - x0,
        dy = y1 - y0,
        L2 = dx * dx + dy * dy || 1e-9
      this.shade(
        Math.min(x0, x1) - r,
        Math.min(y0, y1) - r,
        Math.max(x0, x1) + r,
        Math.max(y0, y1) + r,
        (x, y, o) => {
          const u = clamp(((x - x0) * dx + (y - y0) * dy) / L2),
            px = x0 + dx * u - x,
            py = y0 + dy * u - y
          const d2 = px * px + py * py
          if (d2 > r * r) return
          const v = Math.sqrt(d2) / r
          o.c = call(c, u, v)
          o.a = call(a, u, v)
        }
      )
    }
    /** Filled disc. c and a may be functions of (d: 0 center to 1 rim, angle). */
    circle(cx, cy, r, c, a = 1) {
      if (r < 0.6) return this.dot(cx, cy, call(c, 0, 0), call(a, 0, 0))
      this.shade(cx - r, cy - r, cx + r, cy + r, (x, y, o) => {
        const dx = x - cx,
          dy = y - cy,
          d2 = dx * dx + dy * dy
        if (d2 > r * r) return
        const d = Math.sqrt(d2) / r,
          ang = Math.atan2(dy, dx)
        o.c = call(c, d, ang)
        o.a = call(a, d, ang)
      })
    }
    /** Ellipse. c and a may be functions of (d: 0 center to 1 rim, angle). */
    ellipse(cx, cy, rx, ry, c, a = 1) {
      if (rx <= 0 || ry <= 0) return
      this.shade(cx - rx, cy - ry, cx + rx, cy + ry, (x, y, o) => {
        const dx = (x - cx) / rx,
          dy = (y - cy) / ry,
          d2 = dx * dx + dy * dy
        if (d2 > 1) return
        const d = Math.sqrt(d2),
          ang = Math.atan2(dy, dx)
        o.c = call(c, d, ang)
        o.a = call(a, d, ang)
      })
    }
    /** Ring from radius r - w to r. c and a may be functions of (v: 0 inner to 1 outer, angle). */
    ring(cx, cy, r, w, c, a = 1) {
      const r0 = Math.max(0, r - w)
      this.shade(cx - r, cy - r, cx + r, cy + r, (x, y, o) => {
        const dx = x - cx,
          dy = y - cy,
          d2 = dx * dx + dy * dy
        if (d2 > r * r || d2 < r0 * r0) return
        const v = w > 0 ? (Math.sqrt(d2) - r0) / (r - r0 || 1) : 1,
          ang = Math.atan2(dy, dx)
        o.c = call(c, v, ang)
        o.a = call(a, v, ang)
      })
    }
    /**
     * Band of a ring from angle a0 to a1 (radians, a1 > a0), radius r - w to r: the slash and smear shape.
     * c and a may be functions of (u: 0 at a0 to 1 at a1, v: 0 inner to 1 outer). w can be a function of u
     * for a crescent that tapers at both ends.
     */
    arc(cx, cy, r, w, a0, a1, c, a = 1) {
      const span = a1 - a0,
        wf = typeof w === 'function'
      this.shade(cx - r, cy - r, cx + r, cy + r, (x, y, o) => {
        const dx = x - cx,
          dy = y - cy,
          d = Math.sqrt(dx * dx + dy * dy)
        if (d > r) return
        let ang = Math.atan2(dy, dx) - a0
        ang -= Math.floor(ang / (Math.PI * 2)) * Math.PI * 2
        if (ang > span) return
        const u = ang / span,
          ww = wf ? w(u) : w
        if (ww <= 0 || d < r - ww) return
        const v = (d - (r - ww)) / ww
        o.c = call(c, u, v)
        o.a = call(a, u, v)
      })
    }
    /** Filled rectangle. */
    rect(x, y, w, h, c, a = 1) {
      if (this.sn === 0) {
        const X0 = Math.round(x),
          Y0 = Math.round(y),
          X1 = Math.round(x + w),
          Y1 = Math.round(y + h)
        for (let yy = Y0; yy < Y1; yy++)
          for (let xx = X0; xx < X1; xx++) this.put(this.cellX(xx, yy), this.cellY(xx, yy), c, a)
        return
      }
      this.shade(x, y, x + w, y + h, (lx, ly, o) => {
        if (lx < x || ly < y || lx >= x + w || ly >= y + h) return
        o.c = c
        o.a = a
      })
    }
    /** Filled polygon from points [[x, y], ...] (even-odd rule). */
    poly(pts, c, a = 1) {
      let x0 = Infinity,
        y0 = Infinity,
        x1 = -Infinity,
        y1 = -Infinity
      for (const [x, y] of pts) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
      const n = pts.length
      this.shade(x0, y0, x1, y1, (x, y, o) => {
        let inside = false
        for (let i = 0, j = n - 1; i < n; j = i++) {
          const [xi, yi] = pts[i],
            [xj, yj] = pts[j]
          if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
        }
        if (!inside) return
        o.c = call(c, x, y)
        o.a = call(a, x, y)
      })
    }
    tri(x0, y0, x1, y1, x2, y2, c, a = 1) {
      this.poly(
        [
          [x0, y0],
          [x1, y1],
          [x2, y2],
        ],
        c,
        a
      )
    }
    // ---- light
    /** Radial glow into the light buffer: k at the center, falling to 0 at radius r. */
    glow(x, y, r, c, k = 0.5) {
      if (r < 1 || k <= 4e-3) return
      const cx = this.toX(x, y),
        cy = this.toY(x, y)
      const x0 = Math.floor(cx - r),
        x1 = Math.ceil(cx + r),
        y0 = Math.floor(cy - r),
        y1 = Math.ceil(cy + r)
      for (let sy = y0; sy <= y1; sy++) {
        const dy = (sy + 0.5 - cy) / r
        for (let sx = x0; sx <= x1; sx++) {
          const dx = (sx + 0.5 - cx) / r,
            d = dx * dx + dy * dy
          if (d >= 1) continue
          const f = 1 - Math.sqrt(d)
          this.add(sx, sy, c, f * f * k)
        }
      }
    }
    /** Glow around a segment (a soft beam of light). */
    glowLine(x0, y0, x1, y1, r, c, k = 0.5) {
      if (r < 1 || k <= 4e-3) return
      const ax = this.toX(x0, y0),
        ay = this.toY(x0, y0),
        bx = this.toX(x1, y1),
        by = this.toY(x1, y1)
      const dx = bx - ax,
        dy = by - ay,
        L2 = dx * dx + dy * dy || 1e-9
      const X0 = Math.floor(Math.min(ax, bx) - r),
        X1 = Math.ceil(Math.max(ax, bx) + r)
      const Y0 = Math.floor(Math.min(ay, by) - r),
        Y1 = Math.ceil(Math.max(ay, by) + r)
      for (let sy = Y0; sy <= Y1; sy++)
        for (let sx = X0; sx <= X1; sx++) {
          const px = sx + 0.5,
            py = sy + 0.5,
            u = clamp(((px - ax) * dx + (py - ay) * dy) / L2)
          const ex = ax + dx * u - px,
            ey = ay + dy * u - py,
            d = Math.sqrt(ex * ex + ey * ey) / r
          if (d >= 1) continue
          const f = 1 - d
          this.add(sx, sy, c, f * f * k)
        }
    }
    /** Glow hugging a circle of radius R (a shockwave's light), falling off over width r. */
    glowRing(x, y, R5, r, c, k = 0.5) {
      if (r < 1 || k <= 4e-3) return
      const cx = this.toX(x, y),
        cy = this.toY(x, y),
        E = R5 + r
      for (let sy = Math.floor(cy - E); sy <= Math.ceil(cy + E); sy++)
        for (let sx = Math.floor(cx - E); sx <= Math.ceil(cx + E); sx++) {
          const d = Math.abs(Math.hypot(sx + 0.5 - cx, sy + 0.5 - cy) - R5) / r
          if (d >= 1) continue
          const f = 1 - d
          this.add(sx, sy, c, f * f * k)
        }
    }
    // ---- sprites, text, masks
    /**
     * A little sprite from strings: rows like ["..##..", ".#oo#."], pal maps characters to colors
     * ({ "#": "#222034", o: 0xff... }); "." and " " are empty. Top-left at (x, y).
     * opts: { scale, a, flip (mirror left-right), flipY (upside down), tint (draw every pixel in one color) }.
     */
    sprite(rows, pal, x, y, opts = {}) {
      let s = sprites.get(rows)
      if (!s) sprites.set(rows, (s = rows.map((r) => [...r])))
      const k = opts.scale ?? 1,
        a = opts.a ?? 1,
        W = s[0]?.length ?? 0,
        cache = {}
      for (let r = 0; r < s.length; r++)
        for (let q = 0; q < s[r].length; q++) {
          const ch = s[r][q]
          if (ch === '.' || ch === ' ') continue
          let c = opts.tint
          if (c === void 0) {
            c = cache[ch]
            if (c === void 0) c = cache[ch] = pal[ch] === void 0 ? 0 : hex(pal[ch])
          }
          if (!c) continue
          const col = opts.flip ? W - 1 - q : q,
            row = opts.flipY ? s.length - 1 - r : r
          if (k === 1) this.dot(x + col, y + row, c, a)
          else this.rect(x + col * k, y + row * k, k, k, c, a)
        }
    }
    /**
     * Pixel text. opts: { font: "mini" (3x5) | "big" (5x7), scale, align: "left" | "center" | "right",
     * outline: color, shadow: color, a }. (x, y) is the top of the text, at the left, center or right.
     */
    text(str, x, y, c, opts = {}) {
      const font = opts.font ?? 'mini',
        k = opts.scale ?? 1,
        a = opts.a ?? 1,
        w = textWidth(str, font) * k
      const left = Math.round(
          opts.align === 'center' ? x - w / 2 : opts.align === 'right' ? x - w : x
        ),
        top = Math.round(y)
      const ol = opts.outline,
        sh = opts.shadow
      if (ol !== void 0)
        rasterText(str, font, (gx, gy) =>
          this.rect(left + gx * k - 1, top + gy * k - 1, k + 2, k + 2, ol, a)
        )
      if (sh !== void 0)
        rasterText(str, font, (gx, gy) =>
          this.rect(left + gx * k + 1, top + gy * k + 1, k, k, sh, a)
        )
      rasterText(str, font, (gx, gy) =>
        this.rect(left + gx * k, top + gy * k, k, k, call(c, gx, gy), a)
      )
    }
    /** Size of text in pixels: [w, h]. */
    measure(str, opts = {}) {
      const k = opts.scale ?? 1
      return [textWidth(str, opts.font ?? 'mini') * k, FONTS[opts.font ?? 'mini'].h * k]
    }
    /** Fill a mask ({ w, h, data }) with its top-left at (x, y). c may be a function of (mx, my). */
    mask(m, x, y, c, a = 1) {
      for (let my = 0; my < m.h; my++)
        for (let mx = 0; mx < m.w; mx++)
          if (m.data[my * m.w + mx]) this.dot(x + mx, y + my, call(c, mx, my), call(a, mx, my))
    }
    /** The 1 px outline just outside a mask. */
    outline(m, x, y, c, a = 1) {
      const at = (mx, my) => mx >= 0 && my >= 0 && mx < m.w && my < m.h && m.data[my * m.w + mx]
      for (let my = -1; my <= m.h; my++)
        for (let mx = -1; mx <= m.w; mx++)
          if (!at(mx, my) && (at(mx - 1, my) || at(mx + 1, my) || at(mx, my - 1) || at(mx, my + 1)))
            this.dot(x + mx, y + my, call(c, mx, my), call(a, mx, my))
    }
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/core/actor.js
  var HERO = [
    '....kkkkk...',
    '..kkhhhhhk..',
    '.khhhhhhhhk.',
    '.khhhhhhhhhk',
    '.khhssssshhk',
    '.khsessesshk',
    '.khsessesshk',
    '..ksssssssk.',
    '...kkSSSkk..',
    '..kttttttk..',
    '.kttTttTttk.',
    '.ksttTTttsk.',
    '.kstttttttk.',
    '..kbbbbbbk..',
    '..kppkkppk..',
    '..kppk.kppk.',
    '..kppk.kppk.',
    '..koook.kook',
    '..kkkkk.kkkk',
  ]
  var HERO_PAL = {
    k: '#17121f',
    h: '#7a4128',
    s: '#f3c49d',
    S: '#c98b6c',
    e: '#17121f',
    t: '#5f6f94',
    T: '#46536f',
    b: '#8a5a32',
    p: '#38334a',
    o: '#6a4030',
    // the 2x character's extra detail
    H: '#a35d34',
    w: '#ffffff',
    m: '#a3564a',
    g: '#e8c060',
    L: '#7f90b6',
    O: '#8f5a3f',
    P: '#4b4560',
    // the scarf
    c: '#f53cd1',
    C: '#ff8fe6',
    D: '#a31f8a',
  }
  var DUMMY_PAL = {
    k: '#0e0c14',
    A: '#e4e6ec',
    B: '#b6b9c3',
    C: '#868995',
    D: '#5c5e6a',
    E: '#6e707c',
    F: '#4b4d58',
    G: '#34353f',
    J: '#2a2b33',
    m: '#f53cd1',
  }
  var HERO2 = [
    '...........kkk..........',
    '..........kAABk.........',
    '.........kAAABJk........',
    '.........kABBJJk........',
    '.........kBBBJCDk.......',
    '.........kBCJDDDk.......',
    '.........kkJJJDk........',
    '.......kkkkABBJCkk......',
    '......kAABCJBCCCkDk.....',
    '......kABBCJCCCmDkDk....',
    '......kBBCDDJCDDDkDk....',
    '......kABCDJDDDDDkk.....',
    '.....kAABDkDDDDJkk......',
    '.....kABCDkDDJJGkk......',
    '.....kABCkJJJGGGkk......',
    '....kJJCDkFFFGGGk.......',
    '....kAJJDkJJJGGGk.......',
    '....kJCJJkABBJGGk.......',
    '.....kJCCkBBCDJJJk......',
    '.....kCCCJBBCDJJDk......',
    '.....kCCCDJCCDkJDDk.....',
    '......kCDDJBCDkDDDk.....',
    '.......kDJJJCDkDDDkk....',
    '.......kJBCJCDkDDDkk....',
    '.......kBDJBCDkCDDkk....',
    '........kJJBCDkCDDk.....',
    '........kBBBCDkCCDDk....',
    '........kBBBCDkCCDDk....',
    '.........kBBCDkJDDDk....',
    '........kBJJJJkCJJJk....',
    '........kBBCCDkCCDDk....',
    '........kBBCDDkCDDk.....',
    '........kBBCDkCCDDk.....',
    '........kBCCDkCCDDk.....',
    '........kBCDDkCDDDk.....',
    '.......kJBCJkkkDJkkkk...',
    '.......kAJJAAAAkCCCCCk..',
    '........kkkkkkkkkkkkk...',
  ]
  function maskOf(rows, k = 1) {
    const h = rows.length * k,
      w = rows[0].length * k,
      data = new Uint8Array(w * h)
    rows.forEach((r, y) =>
      [...r].forEach((ch, x) => {
        if (ch === '.') return
        for (let j = 0; j < k * k; j++) data[(y * k + ((j / k) | 0)) * w + x * k + (j % k)] = 1
      })
    )
    return { w, h, data }
  }
  var MASKS = { 1: maskOf(HERO, 1), 2: maskOf(HERO2, 1) }
  function pixelsOf(rows, pal) {
    const w = rows[0].length,
      data = new Uint32Array(w * rows.length)
    rows.forEach((r, y) =>
      [...r].forEach((ch, x) => (data[y * w + x] = ch === '.' ? 0 : hex(pal[ch])))
    )
    return data
  }
  var PIXELS = { 1: pixelsOf(HERO, HERO_PAL), 2: pixelsOf(HERO2, DUMMY_PAL) }
  function stockActor(k = 1) {
    k = k === 2 ? 2 : 1
    const m = MASKS[k],
      x = -Math.floor(m.w / 2),
      y = -m.h
    return {
      mask: m,
      pixels: PIXELS[k],
      x,
      y,
      w: m.w,
      h: m.h,
      k,
      head: [0, y],
      chest: [0, k === 2 ? -26 : y + 11],
      ...(k === 2
        ? {
            eyes: [
              [13, 3],
              [15, 3],
            ],
          }
        : {}),
    }
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/core/fx.js
  function createFrame(w, h, ox = 0, oy = 0) {
    return { w, h, ox, oy, color: new Uint32Array(w * h), light: new Uint32Array(w * h) }
  }
  function clearFrame(f) {
    f.color.fill(0)
    f.light.fill(0)
    return f
  }
  var painters = /* @__PURE__ */ new WeakMap()
  function painterFor(frame2) {
    let p = painters.get(frame2)
    if (!p) painters.set(frame2, (p = new Painter(frame2)))
    return p.reset()
  }
  var FADE = 0.3
  var isRamp = (v) =>
    Array.isArray(v) &&
    v.length > 0 &&
    v.every((c) => typeof c === 'number' || /^#[0-9a-f]{3,8}$/i.test(c))
  function resolveOptions(meta10, o = {}) {
    const opts = { ...(meta10.options ?? {}), ...o }
    for (const [k, def] of Object.entries(meta10.options ?? {}))
      if (isRamp(def) && isRamp(o[k]) && o[k].length !== def.length)
        opts[k] = fit(o[k], def.length).map(toHex)
    if (meta10.actor && !opts.actor) opts.actor = stockActor(meta10.actor === 2 ? 2 : 1)
    return opts
  }
  function createFx(mod, o = {}) {
    const meta10 = mod.meta ?? {}
    const opts = resolveOptions(meta10, o)
    const impl = mod.create ? mod.create(opts) : mod
    const D8 = meta10.duration ?? 1
    let t = 0,
      stopAt = Infinity
    return {
      meta: meta10,
      options: opts,
      get t() {
        return t
      },
      update(dt) {
        t += dt
        if (!impl.update) return
        const n = Math.max(1, Math.ceil(dt * 120 - 1e-9))
        for (let i = 0; i < n; i++) impl.update(dt / n, opts)
      },
      draw(frame2, layer) {
        const p = painterFor(frame2)
        p.place(opts.x ?? 0, opts.y ?? 0, !!opts.flip, opts.angle ?? 0)
        p.fade = stopAt === Infinity ? 1 : clamp(1 - (t - stopAt) / FADE)
        p.lightK = opts.light ?? 1
        const tt = meta10.loop ? t % D8 : Math.min(t, D8)
        if (layer !== 'front' && impl.drawBack) {
          p.layer = 'back'
          impl.drawBack(p, tt, opts)
        }
        if (layer !== 'back') {
          p.layer = 'front'
          impl.draw(p, tt, opts)
        }
      },
      /** Let it end: loops fade out, one-shots cut short. */
      stop() {
        if (stopAt === Infinity) stopAt = t
      },
      done() {
        return t - stopAt >= FADE || (!meta10.loop && t >= D8)
      },
    }
  }
  function composite(f, out, bg = null, lightK = 1) {
    const n = f.w * f.h,
      C = f.color,
      L = f.light,
      flat = typeof bg === 'number'
    for (let i = 0; i < n; i++) {
      const c = C[i],
        l = L[i] & 16777215
      let r, g, b, a
      const ca = c >>> 24
      if (ca === 255) {
        r = c & 255
        g = (c >>> 8) & 255
        b = (c >>> 16) & 255
        a = 255
      } else if (bg === null) {
        r = c & 255
        g = (c >>> 8) & 255
        b = (c >>> 16) & 255
        a = ca
      } else {
        const k = flat ? bg : bg[i],
          f2 = ca / 255
        r = (c & 255) * f2 + (k & 255) * (1 - f2)
        g = ((c >>> 8) & 255) * f2 + ((k >>> 8) & 255) * (1 - f2)
        b = ((c >>> 16) & 255) * f2 + ((k >>> 16) & 255) * (1 - f2)
        a = 255
      }
      if (l) {
        const lr = (l & 255) * lightK,
          lg = ((l >>> 8) & 255) * lightK,
          lb = ((l >>> 16) & 255) * lightK
        if (a < 255) {
          const pa = a / 255,
            pr = r * pa + lr,
            pg = g * pa + lg,
            pb = b * pa + lb
          const na = Math.min(1, Math.max(pa, Math.max(lr, lg, lb) / 255))
          if (na > 0) {
            r = Math.min(255, pr / na)
            g = Math.min(255, pg / na)
            b = Math.min(255, pb / na)
            a = na * 255
          }
        } else {
          r = Math.min(255, r + lr)
          g = Math.min(255, g + lg)
          b = Math.min(255, b + lb)
        }
      }
      const j = i * 4
      out[j] = r
      out[j + 1] = g
      out[j + 2] = b
      out[j + 3] = a
    }
    return out
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/core/scene.js
  var SKY = hex('#15131d')
  var SKY_TOP = hex('#0d0b14')
  var SKY_LOW = hex('#221d33')
  var FLOOR_EDGE = hex('#4a4263')
  var FLOOR = hex('#2b2639')
  var FLOOR_DARK = hex('#211d2d')
  var MORTAR = hex('#1a1724')

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/core/rig.js
  var PAL2 = Object.fromEntries(Object.entries(DUMMY_PAL).map(([k, v]) => [k, hex(v) >>> 0]))
  var INK2 = PAL2.k
  var SEAM = PAL2.J
  var MARK = PAL2.m
  var SHELL = [PAL2.A, PAL2.B, PAL2.C, PAL2.D]
  var CORE = [PAL2.E, PAL2.F, PAL2.G, PAL2.G]
  var DEG = Math.PI / 180
  var add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
  var sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
  var mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s]
  var dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  var cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
  var len = (a) => Math.hypot(a[0], a[1], a[2])
  var unit = (a) => mul(a, 1 / (len(a) || 1e-6))
  var rotY = (t) => {
    const c = Math.cos(t),
      s = Math.sin(t)
    return [c, 0, s, 0, 1, 0, -s, 0, c]
  }
  var rotZ = (t) => {
    const c = Math.cos(t),
      s = Math.sin(t)
    return [c, -s, 0, s, c, 0, 0, 0, 1]
  }
  var mm = (A, B2) => {
    const o = new Array(9)
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        o[r * 3 + c] = A[r * 3] * B2[c] + A[r * 3 + 1] * B2[3 + c] + A[r * 3 + 2] * B2[6 + c]
    return o
  }
  var mv = (M2, v) => [
    M2[0] * v[0] + M2[1] * v[1] + M2[2] * v[2],
    M2[3] * v[0] + M2[4] * v[1] + M2[5] * v[2],
    M2[6] * v[0] + M2[7] * v[1] + M2[8] * v[2],
  ]
  var clamp01 = (v) => Math.max(0, Math.min(1, v))
  var M = {
    pelvis: 19.7,
    spine1: 2.8,
    spine2: 4.6,
    shoulderUp: 2.5,
    shoulderOut: 5.9,
    neckUp: 4,
    headUp: 3.1,
    hipDown: 1.1,
    hipOut: 2.8,
    thigh: 8.6,
    shin: 8.3,
    upper: 7.6,
    fore: 7.4,
    turn: 36 * DEG,
  }
  var STAND = {
    lean: 0,
    crouch: 0,
    yaw: 0,
    fx: -3,
    fy: -15,
    bx: 5,
    by: -15,
    ffx: -2,
    ffy: -4,
    fbx: 3,
    fby: -4,
  }
  function ik(a, target, L1, L2, pole) {
    let to = sub(target, a),
      d = len(to)
    const reach2 = L1 + L2 - 0.02
    if (d > reach2) {
      to = mul(to, reach2 / d)
      d = reach2
    }
    const u = unit(to),
      along = (L1 * L1 - L2 * L2 + d * d) / (2 * d),
      h = Math.sqrt(Math.max(0, L1 * L1 - along * along))
    let v = sub(pole, mul(u, dot(pole, u)))
    v = len(v) < 1e-4 ? unit(cross(u, [0, 0, 1])) : unit(v)
    return { joint: add(a, add(mul(u, along), mul(v, h))), end: add(a, to), u, v }
  }
  function frame(t, R5) {
    return { t, R: R5 }
  }
  function boneFrame(a, b, pole) {
    const x = unit(sub(b, a))
    let y = sub(pole, mul(x, dot(pole, x)))
    y = len(y) < 1e-4 ? unit(cross(x, [0, 0, 1])) : unit(y)
    const z = cross(x, y)
    return frame(a, [x[0], y[0], z[0], x[1], y[1], z[1], x[2], y[2], z[2]])
  }
  var weaponOf = (name) => WEAPONS[name]
  function solve(pose) {
    const q = { ...STAND, ...pose },
      lean = q.lean,
      W = q.weapon && weaponOf(q.weapon),
      OW = q.offWeapon && weaponOf(q.offWeapon)
    const sa = q.sa ?? 0,
      wl = q.wl ?? 1,
      axisZ = Math.sqrt(Math.max(0, 1 - wl * wl)) * (q.wz ?? 1)
    const axis = [Math.cos(sa) * wl, -Math.sin(sa) * wl, axisZ],
      side = [-Math.sin(sa), -Math.cos(sa), 0]
    const two = !!(q.two && W),
      nearZ = q.fz ?? (two ? 3 : 4.5)
    const fwd = (q.fx - STAND.fx) / 24,
      farFwd = two ? 0 : (q.bx - STAND.bx) / 22
    let turn =
      M.turn + (fwd >= 0 ? -44 * DEG * Math.min(1, fwd) : 28 * DEG * Math.min(1, -fwd * 1.8))
    turn += (farFwd > 0 ? 34 * DEG * Math.min(1, farFwd) : 0) + (q.twist ?? 0) * 4 * DEG
    if (q.turn !== void 0) turn = q.turn
    const hipTurn = M.turn + (turn - M.turn) * 0.45,
      tilt = Math.atan2(lean, 13)
    const Rp = mm(rotZ(-tilt * 0.25), rotY(-hipTurn)),
      Rc = mm(rotZ(-tilt), rotY(-turn))
    const ankleN = [q.ffx, -q.ffy - 1.8, q.fzz ?? 2.4],
      ankleF = [q.fbx, -q.fby - 1.8, q.bzz ?? -2.4]
    let pelvis = [lean * 0.2, M.pelvis - q.crouch, 0]
    const hipAt = (s) => add(pelvis, mv(Rp, [0, -M.hipDown, s * M.hipOut]))
    const maxLeg = (M.thigh + M.shin) * 0.995
    for (const [s, a] of [
      [1, ankleN],
      [-1, ankleF],
    ]) {
      const h = hipAt(s),
        dx = h[0] - a[0],
        dz = h[2] - a[2],
        flat = dx * dx + dz * dz
      if (flat < maxLeg * maxLeg) {
        const top = a[1] + Math.sqrt(maxLeg * maxLeg - flat)
        if (h[1] > top) pelvis = [pelvis[0], pelvis[1] - (h[1] - top), pelvis[2]]
      }
    }
    const waist = add(pelvis, [
      Math.sin(tilt * 0.45) * M.spine1,
      Math.cos(tilt * 0.45) * M.spine1,
      0,
    ])
    const chest = add(waist, [Math.sin(tilt) * M.spine2, Math.cos(tilt) * M.spine2, 0])
    const neck = add(chest, mv(Rc, [0, M.neckUp, 0]))
    const headTurn = M.turn * 0.9 + (turn - M.turn) * 0.35,
      nod = tilt * 0.35 + (q.hy ?? 0) * 7 * DEG,
      roll = (q.hx ?? 0) * 7 * DEG
    const Rh = mm(rotZ(-nod - roll), rotY(-headTurn))
    const head = add(neck, mv(Rh, [0.15, M.headUp, 0]))
    const pick = (s, target) => {
      const base = add(chest, mv(Rc, [0, M.shoulderUp, s * M.shoulderOut])),
        to = sub(target, base),
        d = len(to)
      return add(base, mul(unit(to), Math.min(1.8, Math.max(0, d - 11) * 0.35)))
    }
    const nearT = [q.fx, -q.fy, nearZ]
    const farT = two
      ? [q.fx + axis[0] * W.two, -q.fy + axis[1] * W.two, nearZ + axis[2] * W.two]
      : [q.bx, -q.by, q.bz ?? (q.armsFront ? 5.5 : -4.5)]
    const sN = pick(1, nearT),
      sF = pick(-1, farT)
    const pole = (s, T, shoulder, hold) => {
      const up = clamp01((T[1] - shoulder[1] + 2) / 10)
      const base = [-0.55 + up * 1.1, -1 + up * 0.9, s * (0.45 + up * 0.5)]
      if (!hold) return base
      const u = unit(sub(T, shoulder))
      let best = base,
        score = Infinity
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2,
          x = unit(cross(u, [0.3, 1, 0.2])),
          y = cross(u, x),
          v = add(mul(x, Math.cos(a)), mul(y, Math.sin(a)))
        const A = ik(shoulder, T, M.upper, M.fore, v),
          f = unit(sub(A.end, A.joint))
        const cost = Math.abs(dot(f, hold)) * 0.7 + (1 - dot(unit(base), v)) * 0.55
        if (cost < score) {
          score = cost
          best = v
        }
      }
      return best
    }
    const holdN = W ? (W.across ? side : axis) : null,
      holdF = two
        ? W.across
          ? side
          : axis
        : OW
          ? [Math.cos(q.sb ?? Math.PI), -Math.sin(q.sb ?? Math.PI), 0]
          : null
    const armN = ik(sN, nearT, M.upper, M.fore, pole(1, nearT, sN, holdN)),
      armF = ik(sF, farT, M.upper, M.fore, pole(-1, farT, sF, holdF))
    const kneePole = (s) => mv(Rp, [1, 0, s * 0.35])
    const hipN = hipAt(1),
      hipF = hipAt(-1)
    const legN = ik(hipN, ankleN, M.thigh, M.shin, kneePole(1)),
      legF = ik(hipF, ankleF, M.thigh, M.shin, kneePole(-1))
    const footDir = (s) => {
      const t = hipTurn * 0.6 + s * 8 * DEG
      return [Math.cos(t), 0, Math.sin(t)]
    }
    const B2 = {
      pelvis: frame(pelvis, Rp),
      waist: frame(waist, mm(rotZ(-tilt * 0.6), rotY(-(turn + hipTurn) / 2))),
      chest: frame(chest, Rc),
      head: frame(head, Rh),
      neck: frame(neck, Rh),
      upperN: boneFrame(sN, armN.joint, armN.v),
      foreN: boneFrame(armN.joint, armN.end, armN.v),
      upperF: boneFrame(sF, armF.joint, armF.v),
      foreF: boneFrame(armF.joint, armF.end, armF.v),
      thighN: boneFrame(hipN, legN.joint, legN.v),
      shinN: boneFrame(legN.joint, legN.end, legN.v),
      thighF: boneFrame(hipF, legF.joint, legF.v),
      shinF: boneFrame(legF.joint, legF.end, legF.v),
    }
    B2.footN = frame(
      legN.end,
      mm(rotY(-Math.atan2(footDir(1)[2], footDir(1)[0])), rotZ(q.toeF ? -55 * DEG : 0))
    )
    B2.footF = frame(
      legF.end,
      mm(rotY(-Math.atan2(footDir(-1)[2], footDir(-1)[0])), rotZ(q.toeB ? -55 * DEG : 0))
    )
    return { B: B2, W, OW, q, axis, side, armN, armF, legN, legF, sN, sF, hipN, hipF, turn }
  }
  var BW = 300
  var BH = 240
  var OX = 150
  var OY = 180
  var Zb = new Float32Array(BW * BH)
  var Tone = new Float32Array(BW * BH)
  var Part = new Int8Array(BW * BH)
  var Mat = new Int8Array(BW * BH)
  var Fr = new Int8Array(BW * BH)
  var LX = new Float32Array(BW * BH)
  var LY = new Float32Array(BW * BH)
  var Col = new Uint32Array(BW * BH)
  var touched = []
  var LIGHT = unit([-0.55, 0.72, 0.5])
  var curFrameIndex = 0
  var onlyPart = 0
  function plot(i, z, tone, part, mat, wx, wy, color) {
    if (onlyPart && part !== onlyPart) return
    if (Part[i] === 0) touched.push(i)
    else if (z <= Zb[i]) return
    Zb[i] = z
    Tone[i] = tone
    Part[i] = part
    Mat[i] = mat
    Fr[i] = curFrameIndex
    LX[i] = wx
    LY[i] = wy
    Col[i] = color
  }
  var PART = {
    pelvis: 1,
    waist: 2,
    chest: 3,
    neck: 4,
    head: 5,
    face: 6,
    upperN: 7,
    elbowN: 8,
    foreN: 9,
    handN: 10,
    upperF: 11,
    elbowF: 12,
    foreF: 13,
    handF: 14,
    thighN: 15,
    kneeN: 16,
    shinN: 17,
    footN: 18,
    thighF: 19,
    kneeF: 20,
    shinF: 21,
    footF: 22,
    weapon: 23,
    offWeapon: 24,
  }
  var STEEL = Object.fromEntries(
    Object.entries({
      hi: '#ffffff',
      a: '#e8edf6',
      b: '#a4afc6',
      d: '#68748f',
      gold: '#ffd84a',
      goldD: '#b8862a',
      grip: '#7a3a2a',
      gripD: '#4a2018',
      wood: '#8a5a32',
      woodD: '#5a3820',
      dark: '#3a3448',
      darkD: '#262033',
      olive: '#58663f',
      oliveA: '#7d8c58',
      oliveD: '#3a4529',
    }).map(([k, v]) => [k, hex(v) >>> 0])
  )
  function blade(T, from, length, w) {
    for (let i = from; i <= from + length + 0.01; i += 0.4) {
      const r = i - from,
        wd = r > length - 5 ? Math.max(0, ((length - r) / 5) * w) : w
      for (let k = -wd; k <= wd + 0.01; k += 0.4)
        T(i, k, k < -w * 0.4 ? STEEL.hi : k > w * 0.4 ? STEEL.d : STEEL.a)
    }
  }
  var haft = (T, from, to, a, d, r = 0.8) => {
    for (let i = from; i <= to; i += 0.4)
      for (let k = -r; k <= r + 0.01; k += 0.4) T(i, k, k > 0.1 ? d : a)
  }
  var WEAPONS = {
    // the fist is at i = 0; `two` is where the other hand goes; `across`: the handle lies across the weapon's length
    sword: {
      two: -4.4,
      draw(T, q) {
        const end = q.two ? -6.5 : -2.6
        haft(T, end, 2.2, STEEL.grip, STEEL.gripD)
        for (let k = -1.4; k <= 1.4; k += 0.4) T(end - 0.4, k, STEEL.gold)
        for (let k = -4.6; k <= 4.6; k += 0.4)
          (T(2.6, k, Math.abs(k) > 3.8 ? STEEL.goldD : STEEL.gold), T(3, k, STEEL.goldD))
        blade(T, 3.2, 25, 2.2)
      },
    },
    greatsword: {
      two: -4.8,
      draw(T) {
        haft(T, -7.2, 2.2, STEEL.grip, STEEL.gripD)
        for (let k = -1.8; k <= 1.8; k += 0.4) T(-7.6, k, STEEL.gold)
        for (let k = -6.6; k <= 6.6; k += 0.4)
          (T(2.6, k, Math.abs(k) > 5.6 ? STEEL.goldD : STEEL.gold), T(3, k, STEEL.goldD))
        blade(T, 3.2, 31, 3)
        for (let i = 4; i <= 28; i += 0.4) T(i, 0, STEEL.b)
      },
    },
    dagger: {
      draw(T) {
        haft(T, -2.4, 1.8, STEEL.grip, STEEL.gripD)
        for (let k = -2.6; k <= 2.6; k += 0.4) T(2.2, k, STEEL.goldD)
        blade(T, 2.6, 10, 1.3)
      },
    },
    spear: {
      two: -12,
      draw(T) {
        haft(T, -18, 36, STEEL.wood, STEEL.woodD, 0.5)
        blade(T, 36, 11, 2)
        for (let k = -2.4; k <= 2.4; k += 0.4) T(36, k, STEEL.goldD)
      },
    },
    hammer: {
      two: -7,
      draw(T) {
        for (const lift of [-0.8, 0, 0.8])
          for (let i = -10; i <= 18; i += 0.4)
            for (let k = -0.8; k <= 0.81; k += 0.4)
              T(i, k, k > 0.1 ? STEEL.woodD : STEEL.wood, lift)
        for (let i = 18; i <= 28; i += 0.4)
          for (let k = -9; k <= 9; k += 0.4) {
            const face =
              Math.abs(k) > 7.4
                ? k < 0
                  ? STEEL.a
                  : STEEL.d
                : i < 20
                  ? STEEL.hi
                  : i > 26.4
                    ? STEEL.d
                    : Math.abs(k) < 2
                      ? STEEL.gold
                      : STEEL.b
            T(i, k, face, 4.5)
            T(i, k, face, -4.5)
            if (i < 18.4 || i > 27.6 || Math.abs(k) > 8.6)
              for (let l = -4; l <= 4; l += 0.4)
                T(i, k, k < 0 ? STEEL.a : i > 27.6 ? STEEL.d : STEEL.b, l)
          }
      },
    },
    scythe: {
      two: -11,
      draw(T) {
        haft(T, -16, 31, STEEL.dark, STEEL.darkD, 0.5)
        for (let j = 0; j <= 28; j += 0.4) {
          const u = j / 28,
            w = 3.2 * (1 - u) + 0.3,
            b = 31.5 - u * u * 12
          for (let k = -w; k <= w; k += 0.4)
            T(b + k, j + 0.8, k > w * 0.3 ? STEEL.hi : k < -w * 0.4 ? STEEL.d : STEEL.b)
        }
      },
    },
    claw: {
      draw(T) {
        for (const q0 of [-2.4, 0, 2.4])
          for (let i = 2; i <= 9.5; i += 0.4) {
            const u = (i - 2) / 7.5,
              k = q0 + u * u * 1.8
            T(i, k, u > 0.55 ? STEEL.hi : STEEL.a)
            if (u < 0.6) T(i, k + 0.8, STEEL.d)
          }
      },
    },
    bow: {
      across: true,
      draw(T, q, off) {
        for (let u = -1; u <= 1.001; u += 0.025) {
          const k = u * 17,
            i = 6 * (1 - u * u) - 1
          T(i, k, Math.abs(u) > 0.85 ? STEEL.goldD : STEEL.wood)
          T(i + 0.8, k, STEEL.woodD)
        }
        const tipA = T.at(-1, -17),
          tipB = T.at(-1, 17),
          mid = q.pull ? off : T.at(-1, 0)
        const line = (A, B2, c) => {
          const n = Math.max(2, Math.ceil(len(sub(B2, A)) / 0.4)),
            Z = STEEL.a
          for (let k = 0; k <= n; k++) {
            const P2 = add(A, mul(sub(B2, A), k / n)),
              wx = Math.round(P2[0]),
              wy = Math.round(P2[1]),
              idx = (OY - wy) * BW + (OX + wx)
            curFrameIndex = -1
            plot(idx, P2[2] + 0.05, 2, PART.weapon, 2, wx, wy, c ?? Z)
          }
        }
        line(tipA, mid)
        line(tipB, mid)
        if (q.nocked) {
          const nock = mid,
            tip = T.at(13, 0)
          line(nock, tip, STEEL.wood)
          for (let i = 9; i <= 13; i += 0.4)
            for (let k = -(13 - i) * 0.45; k <= (13 - i) * 0.45; k += 0.4) T(i, k, STEEL.hi)
        }
      },
    },
    pistol: {
      across: true,
      draw(T) {
        for (let i = -1; i <= 9.5; i += 0.4)
          for (let k = -4.2; k <= -2.4; k += 0.4)
            T(i, k, k < -3.6 ? STEEL.a : k > -2.9 ? STEEL.d : STEEL.b)
        for (let i = -1.2; i <= 1.2; i += 0.4)
          for (let k = -2.4; k <= 2.4; k += 0.4) T(i, k, STEEL.gripD)
        T(9, -4.6, STEEL.hi)
      },
    },
    launcher: {
      two: -9,
      draw(T) {
        for (let i = -14; i <= 22; i += 0.4)
          for (let k = -6; k <= -1; k += 0.4)
            T(
              i,
              k,
              k < -4.8
                ? STEEL.oliveA
                : k > -2.2
                  ? STEEL.oliveD
                  : Math.abs(i - 3) < 1.4
                    ? STEEL.gold
                    : STEEL.olive
            )
        for (let k = -6.8; k <= -0.2; k += 0.4) (T(22.4, k, STEEL.b), T(-14.4, k, STEEL.d))
      },
    },
    handle: {
      draw(T) {
        haft(T, -2.6, 6, STEEL.grip, STEEL.gripD)
        for (let k = -1.6; k <= 1.6; k += 0.4) (T(-3, k, STEEL.gold), T(6.4, k, STEEL.gold))
      },
    },
  }
  var REST_FRAMES = null
  REST_FRAMES = solve({}).B

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/core/act.js
  var TW = 38
  var TH = 52
  var TP = Object.fromEntries(
    Object.entries({
      ink: '#0b0a1a',
      wood: '#724c2e',
      woodL: '#a0703a',
      woodD: '#4e331f',
      straw: '#d2aa55',
      strawL: '#f0d98a',
      burlapD: '#86643a',
      burlap: '#b38b57',
      burlapL: '#c9a26c',
      red: '#9a2f3c',
      redL: '#c4434f',
      white: '#ffffff',
    }).map(([k, v]) => [k, hex(v)])
  )
  var DUST = ['#efe7dc', '#c9bfb8', '#8f8693', '#5a5468'].map(hex)
  var DUMMY = new Uint32Array(TW * TH)
  ;(function buildDummy() {
    const px = (x, y, c) => {
      if (x >= 0 && y >= 0 && x < TW && y < TH) DUMMY[y * TW + x] = c
    }
    const R5 = (x, y, w, h, c) => {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c)
    }
    R5(15, 38, 8, 14, TP.ink)
    R5(16, 34, 6, 18, TP.wood)
    R5(16, 34, 2, 18, TP.woodL)
    R5(20, 34, 2, 18, TP.woodD)
    R5(1, 18, 36, 1, TP.ink)
    R5(1, 23, 36, 1, TP.ink)
    R5(1, 19, 36, 4, TP.wood)
    R5(1, 19, 36, 1, TP.woodL)
    R5(1, 22, 36, 1, TP.woodD)
    for (const [bx, s] of [
      [0, -1],
      [33, 1],
    ]) {
      R5(bx, 17, 5, 8, TP.straw)
      for (const [dx, dy, c] of [
        [2, 16, TP.straw],
        [3, 15, TP.strawL],
        [1, 17, TP.strawL],
        [2, 25, TP.straw],
        [1, 26, TP.strawL],
        [3, 25, TP.burlapD],
        [2, 19, TP.strawL],
        [3, 21, TP.strawL],
        [1, 22, TP.burlapD],
        [2, 23, TP.strawL],
      ])
        px(bx + dx, dy, c)
      px(s < 0 ? bx - 1 : bx + 5, 19, TP.straw)
      px(s < 0 ? bx - 1 : bx + 5, 22, TP.strawL)
    }
    const sack = (x, y, w, h) => {
      R5(x + 1, y, w - 2, 1, TP.ink)
      R5(x + 1, y + h - 1, w - 2, 1, TP.ink)
      R5(x, y + 1, 1, h - 2, TP.ink)
      R5(x + w - 1, y + 1, 1, h - 2, TP.ink)
      R5(x + 1, y + 1, w - 2, h - 2, TP.burlap)
      R5(x + w - 4, y + 1, 3, h - 2, TP.burlapD)
      R5(x + 1, y + h - 3, w - 2, 2, TP.burlapD)
      R5(x + 1, y + 1, 1, h - 4, TP.burlapL)
      R5(x + 1, y + 1, w - 6, 1, TP.burlapL)
      for (let j = y + 2; j < y + h - 2; j += 3)
        for (let i = x + 3 + (j % 2); i < x + w - 4; i += 4) px(i, j, TP.burlapD)
    }
    sack(9, 17, 20, 24)
    for (let y = 19; y < 36; y++)
      for (let x = 11; x < 27; x++) {
        const d = Math.hypot(x - 18.5, y - 27)
        if ((d > 4 && d < 5.4) || d < 1.9) px(x, y, x + y < 45 ? TP.redL : TP.red)
      }
    for (let x = 10; x < 28; x++) {
      px(x, 36, x & 1 ? TP.woodL : TP.straw)
      px(x, 37, x & 1 ? TP.woodD : TP.wood)
    }
    for (const [x, y, c] of [
      [11, 41, TP.straw],
      [12, 42, TP.strawL],
      [14, 41, TP.strawL],
      [15, 42, TP.straw],
      [23, 41, TP.straw],
      [24, 42, TP.strawL],
      [26, 41, TP.straw],
      [13, 43, TP.straw],
      [25, 43, TP.straw],
    ])
      px(x, y, c)
    sack(10, 1, 18, 16)
    for (const ex of [14, 23])
      for (let d = -2; d <= 2; d++) {
        px(ex + d, 7 + d, TP.ink)
        px(ex - d, 7 + d, TP.ink)
      }
    for (let x = 14; x < 24; x++) px(x, 12, x & 1 ? TP.ink : TP.burlapD)
    for (const x of [15, 18, 21]) {
      px(x, 11, TP.ink)
      px(x, 13, TP.ink)
    }
    for (let x = 12; x < 26; x++) {
      px(x, 16, x & 1 ? TP.woodL : TP.straw)
      px(x, 17, x & 1 ? TP.wood : TP.woodD)
    }
    for (const [x, y, c] of [
      [13, 0, TP.straw],
      [15, 0, TP.strawL],
      [18, 0, TP.straw],
      [21, 0, TP.strawL],
      [24, 0, TP.straw],
      [9, 4, TP.straw],
      [28, 6, TP.straw],
      [8, 7, TP.strawL],
      [29, 3, TP.strawL],
    ])
      px(x, y, c)
  })()
  var SKINS = {
    flash: [TP.white, 1],
    char: [hex('#1a0c0e'), 0.72],
    ice: [hex('#a8e8ff'), 0.72],
    shadow: [hex('#3a1a70'), 0.5],
    holy: [hex('#fff4c0'), 0.5],
    red: [hex('#ff2040'), 0.45],
    shock: [hex('#8fd6ff'), 0.6],
    poison: [hex('#58c43a'), 0.5],
  }
  var STRAW = [TP.strawL, TP.straw, TP.straw, TP.burlapD, TP.burlapD]
  var REST_MASK = new Uint8Array(24 * 38)
  var REST_PX = new Uint32Array(24 * 38)
  HERO2.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch !== '.') {
        REST_MASK[r * 24 + c] = 1
        REST_PX[r * 24 + c] = hex(DUMMY_PAL[ch])
      }
    })
  )
  var NEAREST = new Int16Array(24 * 38).fill(-1)
  for (let r = 0; r < 38; r++)
    for (let c = 0; c < 24; c++) {
      let best = -1,
        bd = 1e9
      for (let y = Math.max(0, r - 7); y < Math.min(38, r + 8); y++)
        for (let x = Math.max(0, c - 7); x < Math.min(24, c + 8); x++) {
          const d = (x - c) * (x - c) + (y - r) * (y - r)
          if (REST_MASK[y * 24 + x] && d < bd) {
            bd = d
            best = y * 24 + x
          }
        }
      NEAREST[r * 24 + c] = best
    }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/fx/status/burning.js
  var burning_exports = {}
  __export(burning_exports, {
    act: () => act,
    actorAlpha: () => actorAlpha,
    draw: () => draw,
    drawBack: () => drawBack,
    meta: () => meta,
  })

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/fx/status/_lib.js
  var SHAPES = /* @__PURE__ */ new WeakMap()
  function shape(a) {
    const m = a.mask
    let s = SHAPES.get(m)
    if (s) return s
    const { w, h, data } = m,
      on = (x, y) => x >= 0 && y >= 0 && x < w && y < h && data[y * w + x] > 0
    const body2 = [],
      up = [],
      side = [],
      outline = [],
      top = [],
      rows = []
    for (let x = 0; x < w; x++) {
      let y = 0
      while (y < h && !on(x, y)) y++
      top.push(y < h ? y : -1)
    }
    for (let y = 0; y < h; y++) {
      let l = -1,
        r = -1
      for (let x = 0; x < w; x++) {
        if (!on(x, y)) continue
        if (l < 0) l = x
        r = x
        body2.push([x, y])
        if (!on(x, y - 1)) up.push([x, y])
        if (!on(x - 1, y)) side.push([x, y, -1])
        if (!on(x + 1, y)) side.push([x, y, 1])
      }
      rows.push([l, r])
    }
    for (let y = -1; y <= h; y++)
      for (let x = -1; x <= w; x++) {
        if (on(x, y)) continue
        let nx = 0,
          ny = 0
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) if (on(x + dx, y + dy)) ((nx -= dx), (ny -= dy))
        if (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1)) {
          const l = Math.hypot(nx, ny) || 1
          outline.push([x, y, nx / l, ny / l])
        }
      }
    s = { w, h, on, body: body2, up, side, outline, top, rows }
    SHAPES.set(m, s)
    return s
  }
  var colorAt = (a, x, y) =>
    a.pixels ? a.pixels[y * a.mask.w + x] : a.mask.data[y * a.mask.w + x] ? 4285229931 : 0
  function wnoise(x, P2, seed2 = 0) {
    const i = Math.floor(x),
      f = x - i,
      u = f * f * (3 - 2 * f)
    const a = rand(wrap(i, P2), seed2),
      b = rand(wrap(i + 1, P2), seed2)
    return (a + (b - a) * u) * 2 - 1
  }
  function tnoise(t, D8, f, seed2 = 0, off = 0) {
    const P2 = Math.max(2, Math.round(f * D8))
    return wnoise((t / D8) * P2 + off, P2, seed2)
  }
  var travel = (v, g, d, a) =>
    d > 0 ? (g / d) * a + ((v - g / d) * (1 - Math.exp(-d * a))) / d : v * a + 0.5 * g * a * a
  var LAYERS = [
    [1, 1, 6],
    [0.76, 0.86, 4],
    [0.54, 0.68, 2],
    [0.3, 0.42, 0],
  ]
  function tongue(p, x, y, h, w, sx, F, t, D8, n, layers = LAYERS) {
    if (h < 1) return
    for (const [lw, lh, ri] of layers) {
      if (ri === 0 && h < 4) continue
      const H = h * lh,
        col = F[ri]
      for (let r = 0; r <= H; r++) {
        const u = r / Math.max(1, H)
        const half =
          w * lw * Math.pow(1 - u, 0.85) * Math.min(1, (r + 1.5) / 3.5) +
          tnoise(t, D8, 9, n, r * 0.45) * 0.5
        if (half < 0.3) continue
        const cx = x + sx * u * u * lh + tnoise(t, D8, 4, n + 7, r * 0.2) * u * 1.1
        for (let px = Math.round(cx - half); px <= Math.round(cx + half); px++)
          p.px(px, Math.round(y - r), col)
      }
    }
  }
  var rampAt2 = (r, t) => r[Math.min(r.length - 1, Math.max(0, Math.floor(t * r.length)))]
  function smoke(p, x, y, size, u, col, k = 1, warm = 0) {
    const r = size * (0.65 + Math.min(1, u * 2.5) * 0.45 + u * 0.4)
    const a = Math.min(1, u * 12) * Math.min(1, (1 - u) * 2.4) * 0.58 * k
    if (a <= 0.01) return
    const c = col ? mix(col, rampAt2(SMOKE_RAMP, u), u) : rampAt2(SMOKE_RAMP, u * 1.05)
    p.disc(x, y, r, c, a * 0.45)
    p.disc(x + r * 0.05, y + r * 0.06, r * 0.74, c, a * 0.62)
    if (warm && u < 0.6)
      p.disc(x + r * 0.1, y + r * 0.3, r * 0.56, mix(c, warm, 0.5), a * 0.7 * (1 - u / 0.6))
    if (u < 0.5)
      p.disc(x - r * 0.22, y - r * 0.3, r * 0.5, mix(c, WHITE, 0.12), a * 0.4 * (1 - u * 2))
  }
  function ember(p, x, y, u, E, ph, k = 1) {
    const left = 1 - u
    if (left < 0.22 && Math.sin(ph * 40) < 0) return
    const c = left > 0.5 ? (Math.sin(ph * 22) > -0.2 ? E[0] : E[1]) : left > 0.22 ? E[1] : E[2]
    p.px(x, y, c)
    p.glow(x, y, 3, c, 0.32 * left * k)
  }
  function bitmap(rows, k = 1, flip = false) {
    const h = rows.length,
      w = rows[0].length,
      ox = Math.floor((w * k) / 2),
      oy = Math.floor((h * k) / 2)
    return (dx, dy) => {
      let bx = Math.floor((dx + ox) / k)
      const by = Math.floor((dy + oy) / k)
      if (bx < 0 || by < 0 || bx >= w || by >= h) return ''
      if (flip) bx = w - 1 - bx
      const c = rows[by][bx]
      return c === '.' ? '' : c
    }
  }
  function icon(p, x, y, ext, inside, R5, a = 1, paint = null) {
    const X = Math.round(x),
      Y = Math.round(y),
      at = (dx, dy) => !!inside(dx, dy)
    for (let dy = -ext - 1; dy <= ext + 1; dy++)
      for (let dx = -ext - 1; dx <= ext + 1; dx++) {
        const ch = inside(dx, dy)
        let c
        if (ch) {
          if (paint && paint[ch] !== void 0) c = paint[ch]
          else {
            const top = !at(dx, dy - 1),
              left = !at(dx - 1, dy),
              bottom = !at(dx, dy + 1),
              right = !at(dx + 1, dy)
            c = top || left ? R5[3] : bottom || right ? R5[1] : R5[2]
          }
        } else if (R5[0] && (at(dx - 1, dy) || at(dx + 1, dy) || at(dx, dy - 1) || at(dx, dy + 1)))
          c = R5[0]
        else continue
        p.dot(X + dx, Y + dy, c, a)
      }
  }
  var shaped = (f, s, ang = 0) => {
    const c = Math.cos(ang),
      n = Math.sin(ang)
    return (dx, dy) => {
      const x = dx + 0.5,
        y = dy + 0.5
      return f((x * c + y * n) / s, (-x * n + y * c) / s) ? '#' : ''
    }
  }
  function starShape(r0 = 0.45) {
    return (u, v) => {
      const a = Math.atan2(v, u) + Math.PI / 2,
        d = Math.hypot(u, v),
        seg2 = (2 * Math.PI) / 5
      const k = 1 - Math.abs((((a % seg2) + seg2) % seg2) - seg2 / 2) / (seg2 / 2)
      return d <= 1 - (1 - r0) * Math.pow(k, 0.8)
    }
  }
  var EYES = /* @__PURE__ */ new WeakMap()
  function eyes(a) {
    let list = EYES.get(a.mask)
    if (list) return list
    if (a.eyes) {
      list = a.eyes.map(([x, y]) => ({
        x0: x,
        x1: x,
        y0: y,
        y1: y + 1,
        px: [
          [x, y],
          [x, y + 1],
        ],
        skin: colorAt(a, x, y),
      }))
      EYES.set(a.mask, list)
      return list
    }
    const S = shape(a),
      W = S.w,
      col = (x, y) => (S.on(x, y) ? colorAt(a, x, y) : 0)
    const dark = (x, y) =>
      S.on(x, y) &&
      y < S.h * 0.4 &&
      luma(col(x, y)) < 0.15 &&
      S.on(x - 1, y) &&
      S.on(x + 1, y) &&
      S.on(x, y - 1) &&
      S.on(x, y + 1)
    const seen = /* @__PURE__ */ new Set()
    list = []
    for (const [x0, y0] of S.body) {
      if (seen.has(y0 * W + x0) || !dark(x0, y0)) continue
      const px = [],
        q = [[x0, y0]]
      seen.add(y0 * W + x0)
      while (q.length) {
        const [x, y] = q.pop()
        px.push([x, y])
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = x + dx,
            ny = y + dy,
            k = ny * W + nx
          if (seen.has(k) || !(dark(nx, ny) || (S.on(nx, ny) && luma(col(nx, ny)) > 0.95))) continue
          seen.add(k)
          q.push([nx, ny])
        }
      }
      if (px.length < 2 || px.length > 14) continue
      const xs = px.map((p) => p[0]),
        ys = px.map((p) => p[1]),
        counts = /* @__PURE__ */ new Map()
      const e = {
        x0: Math.min(...xs),
        x1: Math.max(...xs),
        y0: Math.min(...ys),
        y1: Math.max(...ys),
        px,
      }
      for (const [x, y] of px)
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
          [2, 0],
          [-2, 0],
        ]) {
          const c = col(x + dx, y + dy),
            l = luma(c)
          if (c && l > 0.5 && l < 0.95 && !px.some((p) => p[0] === x + dx && p[1] === y + dy))
            counts.set(c, (counts.get(c) ?? 0) + 1)
        }
      e.skin = [...counts].sort((p, q2) => q2[1] - p[1])[0]?.[0]
      if (e.skin && e.x1 - e.x0 <= 4 && e.y1 - e.y0 <= 5) list.push(e)
    }
    list.sort((p, q) => p.x0 - q.x0)
    if (list.length > 2) list = []
    EYES.set(a.mask, list)
    return list
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/fx/status/burning.js
  var meta = {
    name: 'Burning',
    desc: 'Burning over time: small flames lick from four hot spots, trailing sparks and thin smoke; every 0.6 s they flare, the body flashes white then orange, scorch marks spread.',
    tags: ['status', 'fire', 'burn', 'dot', 'debuff', 'loop'],
    size: [72, 80],
    origin: [36, 70],
    duration: 1.2,
    loop: true,
    fps: 30,
    bg: 'ground',
    actor: 2,
    options: {
      palette: [
        '#4a1712',
        '#8a1f17',
        '#c9281f',
        '#f2561d',
        '#ff8a2a',
        '#ffc23d',
        '#ffe26b',
        '#fff3a6',
        '#ffffff',
      ],
      char: ['#120c0a', '#2a1a14', '#4a2c1c'],
      smoke: '#5b5566',
      seed: 3,
    },
  }
  var A_ = {
    turn: 1,
    crouch: 2,
    lean: 2,
    fx: -13,
    fy: -38,
    bx: 12,
    by: -17,
    ffx: -3,
    ffy: -7,
    fbx: 5,
  }
  var B_ = {
    turn: 0.9,
    crouch: 3,
    lean: -2,
    fx: -12,
    fy: -17,
    bx: 13,
    by: -38,
    ffx: -4,
    fbx: 4,
    fby: -7,
  }
  var act = {
    onBody: true,
    poses: [
      [0, A_],
      [0.15, B_, 'snap'],
      [0.3, A_, 'snap'],
      [0.45, B_, 'snap'],
      [0.6, A_, 'snap'],
      [0.75, B_, 'snap'],
      [0.9, A_, 'snap'],
      [1.05, B_, 'snap'],
      [1.2, A_, 'snap'],
    ],
  }
  var D = meta.duration
  var TICK = 0.6
  var WIND = -14
  var since = (t) => ((t % TICK) + TICK) % TICK
  var flare2 = (t) => Math.exp(-since(t) / 0.12)
  var actorAlpha = (t) => (since(t) < 0.034 ? 0 : 1)
  var SPOTS = /* @__PURE__ */ new WeakMap()
  function spots(a, seed2) {
    let s = SPOTS.get(a.mask)
    if (!s) SPOTS.set(a.mask, (s = /* @__PURE__ */ new Map()))
    if (s.has(seed2)) return s.get(seed2)
    const S = shape(a),
      H = S.h,
      W = S.w,
      R5 = new Rng(seed2 * 13 + 5)
    const at = (q, side) => {
      const my = Math.round(H * q),
        [l, r] = S.rows[my]
      return [side < 0 ? l : r, my]
    }
    const hair = S.up.filter(([x]) => x < W * 0.42).sort((p, q) => p[1] - q[1] || p[0] - q[0])[0]
    const shoulder =
      S.up
        .filter(([x, y]) => x > W / 2 && y > H * 0.4 && y < H * 0.62)
        .sort((p, q) => p[1] - q[1])[0] ?? at(0.5, 1)
    const list = [
      { at: hair, side: -1, n: 3, h: 4.5 },
      { at: shoulder, side: 1, n: 2, h: 4 },
      { at: at(0.62, -1), side: -1, n: 2, h: 3.5 },
      { at: at(0.6, 1), side: 1, n: 2, h: 3.5 },
    ].map((sp, i) => ({
      ...sp,
      x: a.x + sp.at[0] + 0.5,
      y: a.y + sp.at[1] + 1.5,
      tongues: Array.from({ length: sp.n }, (_, j) => ({
        dx: (j - (sp.n - 1) / 2) * 1.6 + R5.range(-0.4, 0.4),
        h: sp.h * R5.range(0.8, 1.2),
        n: i * 17 + j * 5 + seed2,
      })),
    }))
    const scorch = [0, 1].map((tick) =>
      [0, 1].map((k) => {
        const sp = list[(tick * 2 + k + 1) % list.length],
          lum = (x2, y2) => luma(colorAt(a, x2, y2))
        let cand = S.body.filter(
          ([x2, y2]) =>
            Math.hypot(a.x + x2 + 0.5 - sp.x, a.y + y2 + 0.5 - sp.y) < 9 &&
            y2 > H * 0.42 &&
            lum(x2, y2) > 0.3 &&
            lum(x2, y2) < 0.6
        )
        if (!cand.length) cand = S.body.filter(([, y2]) => y2 > H * 0.45)
        const [x, y] = cand[Math.floor(R5.next() * cand.length)]
        return { x: a.x + x + 0.5, y: a.y + y + 0.5, r: R5.range(3.2, 4.4) }
      })
    )
    const out = { list, scorch }
    s.set(seed2, out)
    return out
  }
  function drawBack(p, t, o) {
    const F = fit(o.palette, 9).reverse(),
      a = o.actor,
      fl = flare2(t),
      flick = 0.8 + 0.2 * tnoise(t, D, 7.5, 3)
    p.shade(-30, -3, 30, 7, (x, y, out) => {
      const d = Math.hypot(x / 26, (y - 0.5) / 4.5)
      if (d < 1)
        ((out.l = mix(F[3], F[4], 0.5)), (out.k = (0.16 + 0.22 * fl) * flick * (1 - d) * (1 - d)))
    })
    const smokeC = mix(hex(o.smoke), F[6], 0.2),
      { list } = spots(a, o.seed)
    cycle(
      t,
      D,
      16,
      o.seed + 4,
      (r) => r.range(0.8, 1.2),
      (age, life, r, i) => {
        const sp = list[i % list.length],
          x = sp.x + travel(WIND * 0.6, WIND * 0.5, 0.8, age) + Math.sin(age * 4 + i) * 1.2,
          y = sp.y - 3 - travel(18, 6, 1, age)
        smoke(p, x, y, r.range(1.1, 1.9), age / life, smokeC, 0.9)
      }
    )
  }
  function draw(p, t, o) {
    const F = fit(o.palette, 9).reverse(),
      CH = fit(o.char, 3),
      a = o.actor,
      S = shape(a),
      { list, scorch } = spots(a, o.seed)
    const ph = since(t),
      tick = Math.floor(t / TICK) % 2,
      fl = flare2(t)
    if (ph < 0.034) for (const [mx, my] of S.body) p.px(a.x + mx, a.y + my, WHITE)
    else if (ph < 0.22) {
      const k = 1 - (ph - 0.034) / 0.186
      for (const [mx, my] of S.body) p.blend(a.x + mx, a.y + my, F[4], 0.55 * k)
    }
    for (const sc of scorch[tick]) {
      const grow = clamp(ph / 0.14),
        fade = 1 - clamp((ph - 0.25) / 0.33),
        r = sc.r * (0.4 + 0.6 * grow)
      if (fade <= 0) continue
      for (const [mx, my] of S.body) {
        const x = a.x + mx + 0.5,
          y = a.y + my + 0.5,
          d = Math.hypot(x - sc.x, (y - sc.y) * 1.2) + rand(mx, my, 7) * 0.9
        if (d > r) continue
        const edge = d > r - 1
        if (edge)
          p.dot(x - 0.5, y - 0.5, rand(mx, my, Math.floor(t * 20)) < 0.5 ? F[3] : F[4], fade * 1.2)
        else p.dot(x - 0.5, y - 0.5, d < r * 0.5 ? CH[0] : CH[1], fade * 1.1)
      }
      p.glow(sc.x, sc.y, 6, F[4], 0.3 * fade)
    }
    for (const sp of list) {
      for (const tg of sp.tongues) {
        const h = tg.h * (0.85 + 0.25 * tnoise(t, D, 5, tg.n)) * (1 + 1.6 * fl)
        tongue(
          p,
          sp.x + tg.dx,
          sp.y,
          h,
          1.1 + 0.3 * fl,
          (WIND * 0.08 * h) / 4 + tnoise(t, D, 3, tg.n + 9) * 0.8,
          F,
          t,
          D,
          tg.n
        )
      }
      p.glow(sp.x, sp.y - 2, 9 + 6 * fl, F[4], 0.22 + 0.35 * fl)
    }
    cycle(
      t,
      D,
      20,
      o.seed + 6,
      (r) => r.range(0.5, 0.9),
      (age, life, r, i) => {
        const sp = list[i % list.length],
          x =
            sp.x +
            r.range(-1.5, 1.5) +
            travel(WIND + r.range(-10, 6), WIND * 0.6, 1.2, age) +
            Math.sin(age * 9 + i) * 1.2 * age
        const y = sp.y - 2 + travel(-r.range(25, 55), -18, 1.4, age)
        ember(p, x, y, age / life, [F[1], F[3], F[5]], age + i)
      }
    )
    if (ph < 0.3)
      for (const [k, sp] of list.entries())
        for (let j = 0; j < 4; j++) {
          const an = -Math.PI / 2 + (rand(k, j, tick) - 0.5) * 2.2,
            v = 50 + 50 * rand(k, j, 2),
            x = sp.x + Math.cos(an) * travel(v, 0, 3, ph),
            y = sp.y - 2 + Math.sin(an) * travel(v, 0, 3, ph) + 60 * ph * ph
          p.px(x, y, ph < 0.12 ? F[1] : F[3])
          p.light(x, y, F[3], 0.4 * (1 - ph / 0.3))
        }
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/fx/status/stunned.js
  var stunned_exports = {}
  __export(stunned_exports, {
    act: () => act2,
    draw: () => draw2,
    drawBack: () => drawBack2,
    meta: () => meta2,
  })
  var meta2 = {
    name: 'Stunned',
    desc: 'Seeing stars: three spinning stars and two little birds circle the head on a tilted ring, ducking behind it and sweeping round in front, trailing glitter.',
    tags: ['status', 'stun', 'dizzy', 'daze', 'stars', 'birds', 'debuff', 'loop'],
    size: [60, 64],
    origin: [30, 56],
    duration: 2,
    loop: true,
    fps: 30,
    bg: 'ground',
    actor: 2,
    options: {
      palette: ['#3a1e0c', '#8a4a12', '#d88a1c', '#f5c030', '#ffe36e', '#fff6c8', '#ffffff'],
      birds: ['#1a1422', '#6a7fae', '#b8c8e8', '#f4f8ff'],
      beak: '#ffae35',
      seed: 2,
    },
  }
  var DAZE = { turn: 1, fx: -7, fy: -15, bx: 8, by: -15, ffx: -3, fbx: 4 }
  var act2 = {
    onBody: true,
    poses: [
      [0, { ...DAZE, x: -1, lean: -3, hx: -1 }],
      [0.5, { ...DAZE, x: 0, lean: 0, crouch: 2, hy: 1, ffx: -2 }],
      [1, { ...DAZE, x: 1, lean: 3, hx: 1 }],
      [1.5, { ...DAZE, x: 0, lean: 0, crouch: 2, hy: 1, fbx: 3 }],
      [2, { ...DAZE, x: -1, lean: -3, hx: -1 }],
    ],
  }
  var D2 = meta2.duration
  var TURNS = 2
  var N = 5
  var STAR7 = ['...#...', '..###..', '#######', '.#####.', '..###..', '.##.##.', '.#...#.']
  var BIRD = [true, false].map((up) => (dx, dy) => {
    const x = dx + 0.5,
      y = dy + 0.5
    if (dx === 3 && dy === -2) return 'e'
    if ((dx === 5 || dx === 4) && dy === -1) return dx === 5 ? 'b' : '#'
    const wing = up
      ? [
          [-1, -1],
          [-1, -2],
          [-2, -2],
          [-2, -3],
          [-3, -3],
          [-3, -4],
        ]
      : [
          [-1, 1],
          [-1, 2],
          [-2, 2],
          [-2, 3],
          [0, 1],
        ]
    if (wing.some(([a, b]) => a === dx && b === dy)) return 'w'
    if ((x / 3.3) ** 2 + ((y - 0.6) / 1.9) ** 2 <= 1 || (x - 2.8) ** 2 + (y + 1.2) ** 2 <= 1.7 ** 2)
      return '#'
    if ((dx === -4 && (dy === -1 || dy === 0)) || (dx === -5 && dy === -1)) return '#'
    return ''
  })
  var STAR = shaped.bind(null, starShape(0.44))
  function ring(t, a) {
    const cy = a.y + 2,
      rx = a.w * 0.62,
      ry = 4.5
    return Array.from({ length: N }, (_, i) => {
      const th = TAU * ((TURNS * t) / D2 + i / N),
        s = Math.sin(th)
      return {
        i,
        th,
        x: Math.cos(th) * rx,
        y: cy + s * ry,
        near: s >= 0,
        depth: 0.5 + 0.5 * s,
        bird: i % 2 === 1,
        rx,
        ry,
        cy,
      }
    })
  }
  function draw1(p, t, o, layer) {
    const C = fit(o.palette, 7),
      Bd = fit(o.birds, 4),
      a = o.actor,
      far = layer === 'back'
    const dim = (c) => (far ? mix(c, Bd[0], 0.3) : c)
    for (const it of ring(t, a)) {
      if (it.near === far) continue
      if (!it.bird)
        for (let k = 1; k <= 12; k++) {
          const th = it.th - k * 0.085,
            x = Math.cos(th) * it.rx,
            y = it.cy - 1 + Math.sin(th) * it.ry
          if (
            Math.sin(th) >= 0 === far ||
            rand(it.i, k, Math.floor(((t / D2) * TURNS + k * 0.37) * 9)) < 0.25
          )
            continue
          p.dot(x, y, dim(k < 4 ? C[6] : k < 8 ? C[5] : C[4]), 1.1 - k / 13)
          if (k < 6) p.light(x, y, C[4], 0.3 * (1 - k / 6))
        }
      if (it.bird) {
        const up = Math.floor(t * 8 + it.i * 0.5) % 2 === 0,
          bob = Math.sin((t / D2) * TAU * 4 + it.i) * 0.7,
          flip = it.near
        const f = BIRD[up ? 0 : 1],
          ins = flip ? (dx, dy) => f(-dx, dy) : f
        icon(p, it.x, it.y - 3 + bob, 7, ins, [Bd[0], dim(Bd[1]), dim(Bd[2]), dim(Bd[3])], 1, {
          e: Bd[0],
          b: dim(hex(o.beak)),
          w: dim(Bd[1]),
        })
      } else {
        const spin = (t / D2) * TAU * 3 + it.i,
          R5 = [C[0], dim(C[3]), dim(C[4]), dim(C[5])]
        if (it.depth > 0.55) icon(p, it.x, it.y - 1, 7, STAR(4 + 0.8 * it.depth, spin), R5)
        else icon(p, it.x, it.y - 1, 5, bitmap(STAR7), R5)
        p.px(it.x, it.y - 1, far ? C[5] : C[6])
        p.glow(it.x, it.y - 1, 11, C[4], 0.24 + 0.3 * it.depth)
        p.glow(it.x, it.y - 1, 4, C[6], 0.3 * it.depth)
        const fr = Math.exp(
          -((Math.atan2(Math.sin(it.th - Math.PI / 2), Math.cos(it.th - Math.PI / 2)) / 0.32) ** 2)
        )
        if (!far && fr > 0.08) flare(p, it.x, it.y - 1, 9 * fr, fr, [C[3], C[4], C[5], C[6]])
      }
    }
  }
  function drawBack2(p, t, o) {
    draw1(p, t, o, 'back')
  }
  function draw2(p, t, o) {
    const C = fit(o.palette, 7),
      a = o.actor
    draw1(p, t, o, 'front')
    cycle(
      t,
      D2,
      14,
      o.seed + 3,
      (r) => r.range(0.25, 0.5),
      (age, life, r) => {
        const th = r.range(0, TAU),
          u = age / life,
          x = Math.cos(th) * a.w * r.range(0.45, 0.95),
          y = a.y + 1 + Math.sin(th) * 7 - r.range(0, 9)
        const arm = Math.round(r.range(1, 2.6) * Math.sin(Math.PI * u))
        if (arm < 1) p.dot(x, y, C[6], Math.sin(Math.PI * u) * 1.4)
        sparkle(p, x, y, arm, C[5], C[4], 0.35 * Math.sin(Math.PI * u))
      }
    )
    p.glow(0, a.y + 1, 26, C[4], 0.13)
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/fx/status/poisoned.js
  var poisoned_exports = {}
  __export(poisoned_exports, {
    act: () => act3,
    actorAlpha: () => actorAlpha2,
    draw: () => draw3,
    drawBack: () => drawBack3,
    meta: () => meta3,
  })
  var meta3 = {
    name: 'Poisoned',
    desc: 'Sick to the bone: green rolls up the body in waves, dark veins creep from a wound, toxic sweat drips and hisses; every 0.8 s it wobbles, blisters pop and a ring pulses out.',
    tags: ['status', 'poison', 'toxic', 'dot', 'debuff', 'sick', 'loop'],
    size: [72, 64],
    origin: [36, 54],
    duration: 1.6,
    loop: true,
    fps: 30,
    bg: 'ground',
    actor: 2,
    options: {
      palette: [
        '#0e1d14',
        '#173320',
        '#23552e',
        '#318232',
        '#55b92f',
        '#8eea3f',
        '#cfff63',
        '#f6ffc2',
      ],
      veins: '#2c1a3a',
      seed: 5,
    },
  }
  var SICK = {
    turn: 0.8,
    crouch: 4,
    lean: 4,
    hy: 1,
    fx: 2,
    fy: -20,
    bx: 8,
    by: -14,
    ffx: 3,
    fbx: -3,
  }
  var act3 = {
    onBody: true,
    poses: [
      [0, { ...SICK, x: -1, crouch: 5, lean: 5 }],
      [0.2, { ...SICK, x: 0 }],
      [0.5, { ...SICK, x: 1 }],
      [0.8, { ...SICK, x: 1, crouch: 5, lean: 5 }],
      [1, { ...SICK, x: 0 }],
      [1.3, { ...SICK, x: -1 }],
      [1.6, { ...SICK, x: -1, crouch: 5, lean: 5 }],
    ],
  }
  var D3 = meta3.duration
  var TICK2 = 0.8
  var G = 760
  var since2 = (t) => ((t % TICK2) + TICK2) % TICK2
  var actorAlpha2 = () => 0
  var BODIES = /* @__PURE__ */ new WeakMap()
  function body(a, seed2) {
    let m = BODIES.get(a.mask)
    if (!m) BODIES.set(a.mask, (m = /* @__PURE__ */ new Map()))
    if (m.has(seed2)) return m.get(seed2)
    const S = shape(a),
      H = S.h,
      W = S.w,
      R5 = new Rng(seed2 * 7 + 3)
    const [l, r] = S.rows[Math.round(H * 0.6)],
      wx = r - 1,
      wy = Math.round(H * 0.6)
    const veins = []
    const walk = (x, y, ang, len2, depth) => {
      const pts = []
      for (let s = 0; s < len2; s++) {
        ang += R5.range(-0.5, 0.5)
        x += Math.cos(ang)
        y += Math.sin(ang)
        if (!S.on(Math.round(x), Math.round(y))) break
        pts.push([Math.round(x), Math.round(y), s / len2])
        if (depth < 2 && s > 2 && R5.chance(0.16))
          walk(x, y, ang + R5.sign() * R5.range(0.6, 1.1), len2 * 0.55, depth + 1)
      }
      veins.push(pts)
    }
    for (let i = 0; i < 4; i++) walk(wx, wy, Math.PI + (i / 4 - 0.45) * 2.2, 11, 0)
    const lum = (x, y) => luma(colorAt(a, x, y))
    const skin = S.body.filter(([x, y]) => lum(x, y) > 0.55 && S.on(x - 1, y) && S.on(x + 1, y))
    const pick = (list) => list[Math.floor(R5.next() * list.length)]
    const blisters = [0, 1].map(() =>
      [0, 1, 2].map(() => {
        const [x, y] = pick(
          S.body.filter(
            ([x2, y2]) => y2 > 4 && S.on(x2 - 1, y2) && S.on(x2 + 1, y2) && S.on(x2, y2 - 1)
          )
        )
        return { x, y, r: R5.range(1.1, 1.8) }
      })
    )
    const E = eyes(a),
      sweat = []
    for (const e of E) sweat.push([e.x0 < W / 2 ? e.x0 - 1 : e.x1 + 1, e.y0 - 1])
    for (const side of [-1, 1]) {
      const hand2 = S.body.filter(
        ([x, y]) =>
          y > H * 0.5 && y < H * 0.7 && (side < 0 ? x <= l + 1 : x >= r - 1) && !S.on(x, y + 1)
      )
      if (hand2.length) sweat.push(hand2[0])
    }
    if (!sweat.length) sweat.push(pick(skin.length ? skin : S.body))
    const out = { veins, wound: [wx, wy], blisters, sweat }
    m.set(seed2, out)
    return out
  }
  function offsets(t, H) {
    const lean = 1.3 * Math.sin((t / D3) * TAU),
      ph = since2(t),
      wob = ph < 0.12
    const w = wob ? Math.sin((ph / 0.12) * Math.PI) : 0
    return (my) => Math.round(lean * (1 - my / H) + w * Math.sin(my * 0.42 + ph * 40))
  }
  function drawBack3(p, t, o) {
    const P2 = fit(o.palette, 8),
      ph = since2(t)
    const k = ph / 0.55
    if (k < 1)
      band(
        p,
        0,
        0,
        5 + 22 * Math.sqrt(k),
        0.18,
        Math.max(1, 2.5 * (1 - k)),
        1 - k,
        [P2[3], P2[4], P2[5], P2[6]],
        (g) => Math.sin(g) < 0
      )
    p.shade(-28, -3, 28, 6, (x, y, out) => {
      const d = Math.hypot(x / 24, (y - 0.5) / 4)
      if (d < 1) ((out.l = P2[4]), (out.k = (0.14 + 0.2 * Math.exp(-ph / 0.2)) * (1 - d) * (1 - d)))
    })
  }
  function draw3(p, t, o) {
    const P2 = fit(o.palette, 8),
      a = o.actor,
      S = shape(a),
      H = S.h,
      B2 = body(a, o.seed),
      off = offsets(t, H),
      ph = since2(t),
      tick = Math.floor(t / TICK2) % 2
    const vein = hex(o.veins)
    for (const [mx, my] of S.body) {
      const c = colorAt(a, mx, my),
        l = luma(c),
        wave = 0.5 + 0.5 * Math.sin(TAU * ((my / H) * 1.6 + (t / D3) * 2))
      const sick = P2[clamp(1 + Math.round(l * 6.2), 1, 7)],
        k2 = 0.22 + 0.4 * wave * wave
      p.px(
        a.x + mx + off(my),
        a.y + my,
        mix(c, wave > 0.85 && l > 0.4 ? mix(sick, P2[6], 0.3) : sick, k2)
      )
    }
    const grow = smooth(0, D3 * 0.55, t) * (1 - smooth(D3 * 0.62, D3, t)) * 1.15
    for (const pts of B2.veins)
      for (const [x, y, u] of pts)
        if (u < grow) p.px(a.x + x + off(y), a.y + y, u > grow - 0.12 ? P2[2] : vein)
    const [wx, wy] = B2.wound
    p.px(a.x + wx + off(wy), a.y + wy, P2[6])
    p.px(a.x + wx + off(wy) - 1, a.y + wy, P2[3])
    p.glow(a.x + wx, a.y + wy, 6, P2[5], 0.3)
    for (const bl of B2.blisters[tick]) {
      const x = a.x + bl.x + off(bl.y),
        y = a.y + bl.y,
        grow2 = clamp(ph / 0.16),
        pop = ph > 0.38
      if (!pop) {
        const r = bl.r * grow2
        p.circle(x, y, r + 0.6, P2[3])
        p.circle(x - 0.2, y - 0.2, r, P2[5])
        if (r > 0.8) p.px(x - 0.5, y - 0.8, WHITE)
        p.glow(x, y, 4, P2[5], 0.3 * grow2)
      } else if (ph < 0.56) {
        const k2 = (ph - 0.38) / 0.18
        for (let j = 0; j < 6; j++) {
          const an = (j / 6) * TAU + bl.x,
            d = bl.r + 0.5 + k2 * 3.5
          p.dot(
            x + Math.cos(an) * d,
            y + Math.sin(an) * d - k2 * 2,
            j % 2 ? P2[6] : P2[5],
            1.2 - k2
          )
        }
        p.glow(x, y, 6, P2[6], 0.4 * (1 - k2))
      }
    }
    B2.sweat.forEach(([sx, sy], i) => {
      const per = D3 / 2,
        age = (((t - i * 0.37) % per) + per) % per,
        gather = 0.35
      const x = a.x + sx + 0.5 + off(sy),
        y0 = a.y + sy
      if (age < gather) {
        const k3 = age / gather,
          run = Math.round(k3 * 2)
        p.px(x, y0 + run, k3 > 0.5 ? P2[6] : P2[5])
        if (k3 > 0.5) p.px(x, y0 + run - 1, P2[4])
        return
      }
      const f = age - gather,
        fallH = -1 - (y0 + 2),
        tf = Math.sqrt((2 * Math.max(1, fallH)) / G)
      if (f < tf) {
        const y = y0 + 2 + 0.5 * G * f * f
        p.line(x, y - Math.min(3, G * f * 0.012), x, y, P2[4])
        p.px(x, y, P2[6])
        return
      }
      const h = f - tf
      if (h > 0.4) return
      const k2 = h / 0.4
      p.line(x - 1 - k2 * 2, -1, x + 1 + k2 * 2, -1, P2[k2 < 0.4 ? 6 : 4], 1.2 - k2)
      for (let j = 0; j < 3; j++)
        p.dot(x + (j - 1) * (2 + 3 * k2), -2 - (j % 2) - 5 * k2 * (1 - k2), P2[6], 1 - k2)
      p.disc(x + Math.sin(k2 * 6) * 1.5, -3 - k2 * 6, 1 + 1.5 * k2, P2[5], 0.35 * (1 - k2))
      p.glow(x, -1.5, 5, P2[5], 0.35 * (1 - k2))
    })
    const k = ph / 0.55
    if (k < 1)
      band(
        p,
        0,
        0,
        5 + 22 * Math.sqrt(k),
        0.18,
        Math.max(1, 2.5 * (1 - k)),
        1 - k,
        [P2[3], P2[4], P2[5], P2[6]],
        (g) => Math.sin(g) >= 0
      )
    p.glow(0, a.y + H * 0.45, 26, P2[4], 0.14 + 0.2 * Math.exp(-ph / 0.18))
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/fx/status/slowed.js
  var slowed_exports = {}
  __export(slowed_exports, {
    act: () => act4,
    draw: () => draw4,
    drawBack: () => drawBack4,
    meta: () => meta4,
  })
  var meta4 = {
    name: 'Slowed',
    desc: 'Dragged through time: a glassy clock dial behind the head ticks round in heavy steps, flashing with each, while drops sink in slow motion and spread slow rings.',
    tags: ['status', 'slow', 'time', 'clock', 'debuff', 'loop'],
    size: [64, 76],
    origin: [32, 68],
    duration: 2.4,
    loop: true,
    fps: 30,
    bg: 'ground',
    actor: 2,
    options: {
      palette: [
        '#081a24',
        '#0e3446',
        '#165a6e',
        '#2a8a9a',
        '#52bcc4',
        '#9ee6e0',
        '#e2fff8',
        '#ffffff',
      ],
      seed: 7,
    },
  }
  var S1 = {
    turn: 0.3,
    lean: 3,
    crouch: 3,
    ffx: 11,
    ffy: -5,
    fbx: -9,
    fby: -5,
    toeB: true,
    fx: -5,
    fy: -19,
    bx: 11,
    by: -26,
  }
  var S2 = {
    turn: 0.3,
    lean: 3,
    crouch: 3,
    ffx: -9,
    ffy: -5,
    toeF: true,
    fbx: 11,
    fby: -5,
    fx: 13,
    fy: -26,
    bx: -4,
    by: -19,
  }
  var act4 = {
    onBody: true,
    poses: [
      [0, S1],
      [1.2, S2],
      [2.4, S1],
    ],
  }
  var D4 = meta4.duration
  var TICKS = 4
  var STEP = D4 / TICKS
  var R = 18
  function hand(t) {
    const k = Math.floor(t / STEP),
      ph = (t - k * STEP) / STEP,
      base = -Math.PI / 2 + (k * TAU) / TICKS,
      q = TAU / TICKS
    if (ph < 0.62) return { ang: base, flash: 0, ph }
    if (ph < 0.72)
      return { ang: base - 0.1 * Math.sin(((ph - 0.62) / 0.1) * Math.PI * 0.5), flash: 0, ph }
    const s = (ph - 0.72) / 0.28,
      snap = ease.outBack(clamp(s / 0.35), 2.2),
      wob = Math.exp(-s * 6) * Math.sin(s * 22) * 0.05
    return { ang: base - 0.1 * (1 - clamp(s / 0.2)) + q * snap + wob, flash: Math.exp(-s * 5), ph }
  }
  var afterglow = (t) => {
    const s = (((t - STEP * 0.72) % STEP) + STEP) % STEP
    return Math.exp(-s * 4)
  }
  function dial(p, C, cx, cy, t) {
    const h = hand(t),
      fl = Math.max(h.flash, afterglow(t))
    p.disc(cx, cy, R - 1, C[2], 0.2)
    p.disc(cx - R * 0.25, cy - R * 0.3, R * 0.5, C[4], 0.08)
    p.ring(cx, cy, R + 1, 1, C[0])
    p.ring(cx, cy, R, 2, (v, ang) =>
      Math.sin(ang + 0.8) < -0.3 ? (fl > 0.4 ? C[7] : C[6]) : v > 0.5 ? C[5] : C[4]
    )
    p.ring(cx, cy, R - 3.5, 1, C[3], 0.6)
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue
      const a = (i / 60) * TAU
      p.dot(cx + Math.cos(a) * (R - 2.6), cy + Math.sin(a) * (R - 2.6), C[4], 0.8)
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU,
        big = i % 3 === 0,
        r0 = R - 2.5,
        r1 = R - (big ? 6 : 4.5),
        c = Math.cos(a),
        s = Math.sin(a)
      p.line(cx + c * r0, cy + s * r0, cx + c * r1, cy + s * r1, big ? C[6] : C[5])
    }
    const shud = h.flash * Math.sin(t * 60) * 0.06,
      ha = -Math.PI / 2 + 2.2 + shud
    p.beam(cx, cy, cx + Math.cos(ha) * R * 0.5, cy + Math.sin(ha) * R * 0.5, 2.2, C[5])
    const tx = cx + Math.cos(h.ang) * (R - 4),
      ty = cy + Math.sin(h.ang) * (R - 4)
    p.beam(cx, cy, tx, ty, 2.4, (u) => (u > 0.8 ? C[7] : C[6]))
    p.circle(cx, cy, 2, C[6])
    p.px(cx, cy, C[1])
    p.glow(cx, cy, R + 8, C[4], 0.14 + 0.2 * fl)
    p.glowRing(cx, cy, R, 3, C[5], 0.12 + 0.35 * fl)
    p.glow(tx, ty, 5, C[6], 0.3 + 0.3 * h.flash)
    if (h.flash > 0.02) {
      const s = 1 - h.flash
      p.ring(cx, cy, R + 2 + 10 * s, 1, C[5], h.flash)
      p.glowRing(cx, cy, R + 2 + 10 * s, 3, C[4], 0.3 * h.flash)
    }
  }
  function drawBack4(p, t, o) {
    const C = fit(o.palette, 8),
      a = o.actor
    dial(p, C, 0, a.y + 3, t)
    const lag = afterglow(t)
    if (lag > 0.05) p.outline(a.mask, a.x - 1 - Math.round(2 * lag), a.y, C[5], 0.55 * lag)
  }
  function draw4(p, t, o) {
    const C = fit(o.palette, 8),
      a = o.actor,
      S = shape(a),
      fl = Math.max(hand(t).flash, afterglow(t))
    for (const [mx, my] of S.body) p.blend(a.x + mx, a.y + my, C[5], 0.08 + 0.12 * fl)
    cycle(
      t,
      D4,
      6,
      o.seed + 3,
      (r) => r.range(1.6, 2.2),
      (age, life, r) => {
        const side = r.next() < 0.5 ? -1 : 1,
          x = side * r.range(10, 17),
          y0 = a.y + r.range(6, 22),
          v0 = r.range(18, 30),
          k = 1.1
        const yAt = (g) => y0 + (v0 * (1 - Math.exp(-k * g))) / k + 4 * g
        const y = yAt(age),
          u = age / life
        if (y < -1) {
          for (const [lag, al] of [
            [0.22, 0.35],
            [0.11, 0.6],
          ])
            if (age > lag) p.dot(x, yAt(age - lag), C[4], al)
          p.px(x, y - 1, C[5])
          p.px(x, y, C[6])
          p.px(x, y + 1, C[5])
          p.px(x - 1, y + 1, C[4])
          p.px(x - 1, y, C[7])
          p.glow(x, y, 4, C[5], 0.3 * (1 - u))
        } else {
          let g = age
          while (g > 0 && yAt(g) >= -1) g -= 0.02
          const s = clamp((age - g) / 0.9)
          if (s < 1) {
            const rx = 1 + 7 * Math.sqrt(s),
              c = s < 0.3 ? C[6] : C[5]
            for (const sd of [-1, 1])
              p.line(x + sd * rx, -0.5, x + sd * (rx - 1.5), -0.5, c, (1 - s) * 1.2)
            for (let dx = -rx + 2; dx <= rx - 2; dx += 1)
              p.dot(x + dx, -1.5, C[4], (1 - s) * 0.5 * (1 - Math.abs(dx) / rx))
            p.glow(x, -1, 4 + rx, C[4], 0.12 * (1 - s))
          }
        }
      }
    )
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/fx/status/haste.js
  var haste_exports = {}
  __export(haste_exports, {
    act: () => act5,
    draw: () => draw5,
    drawBack: () => drawBack5,
    meta: () => meta5,
  })
  var meta5 = {
    name: 'Haste',
    desc: 'Sped up: striped after-images stream out behind, speed lines whip past, dust kicks off the heels and the leading edge catches the wind. Faces right.',
    tags: ['status', 'haste', 'speed', 'fast', 'buff', 'directional', 'loop'],
    size: [100, 56],
    origin: [64, 48],
    duration: 1.2,
    loop: true,
    fps: 30,
    bg: 'ground',
    actor: 2,
    options: {
      palette: ['#4c25ab', '#773ae4', '#5b6cff', '#5eb0ff', '#a3dcff', '#ccf6ff', '#ffffff'],
      dust: '#8a8090',
      seed: 4,
    },
  }
  var RUN = { turn: 0.25, lean: 4 }
  var R1 = {
    ...RUN,
    crouch: 3,
    ffx: 12,
    ffy: -5,
    fbx: -10,
    fby: -8,
    toeB: true,
    fx: -7,
    fy: -19,
    bx: 12,
    by: -27,
  }
  var R2 = { ...RUN, crouch: 1, ffx: 4, ffy: -8, fbx: -1, fby: -5, fx: 3, fy: -18, bx: 5, by: -19 }
  var R3 = {
    ...RUN,
    crouch: 3,
    ffx: -10,
    ffy: -8,
    toeF: true,
    fbx: 12,
    fby: -5,
    fx: 14,
    fy: -27,
    bx: -5,
    by: -19,
  }
  var R4 = { ...RUN, crouch: 1, ffx: -1, ffy: -5, fbx: 4, fby: -8, fx: 5, fy: -19, bx: 3, by: -18 }
  var act5 = {
    onBody: true,
    follow: 0,
    poses: [
      [0, R1],
      [0.1, R2, 'snap'],
      [0.2, R3, 'snap'],
      [0.3, R4, 'snap'],
      [0.4, R1, 'snap'],
      [0.5, R2, 'snap'],
      [0.6, R3, 'snap'],
      [0.7, R4, 'snap'],
      [0.8, R1, 'snap'],
      [0.9, R2, 'snap'],
      [1, R3, 'snap'],
      [1.1, R4, 'snap'],
      [1.2, R1, 'snap'],
    ],
  }
  var D5 = meta5.duration
  var LEVELS = /* @__PURE__ */ new WeakMap()
  function levels(a) {
    let l = LEVELS.get(a.mask)
    if (l) return l
    const S = shape(a)
    l = S.body.map(([x, y]) => {
      const v = luma(colorAt(a, x, y))
      return [x, y, v < 0.24 ? 1 : v < 0.66 ? 2 : 3]
    })
    LEVELS.set(a.mask, l)
    return l
  }
  function drawBack5(p, t, o) {
    const C = fit(o.palette, 7),
      a = o.actor,
      L = levels(a),
      S = shape(a),
      f = Math.floor(t * 30)
    for (let g = 3; g >= 1; g--) {
      const dx = -g * 14 - Math.round(rand(f >> 1, g, 3) * 1.6),
        every = [0, 3, 4, 0][g]
      p.outline(a.mask, a.x + dx, a.y, (mx, my) => (g === 3 && (mx + my) % 2 ? 0 : C[5 - g]))
      if (every)
        for (const [x, y, v] of L) {
          if ((((y + f) % every) + every) % every) continue
          p.px(a.x + x + dx, a.y + y, C[Math.max(0, Math.min(6, 5 - g + v - 2))])
        }
      p.glow(a.x + a.w / 2 + dx, a.y + a.h * 0.45, 16, C[3], 0.12 * (1 - g * 0.25))
    }
    for (const [x, y, dir] of S.side) {
      if (dir > 0 || (y + (f >> 1)) % 3) continue
      const len2 = 3 + Math.floor(rand(y, f >> 1, 5) * 6)
      for (let d = 1; d <= len2; d++)
        p.dot(a.x + x - d, a.y + y, d < 3 ? C[5] : C[4], 1 - d / (len2 + 1))
    }
    lines(p, C, a, t, o.seed, false)
    const dust = hex(o.dust)
    cycle(
      t,
      D5,
      12,
      o.seed + 5,
      (r) => r.range(0.45, 0.7),
      (age, life, r, i) => {
        const u = age / life,
          foot = i % 2 ? -7 : 3,
          x = foot + travel(-r.range(50, 100), 0, 3.5, age),
          y = -1.5 - travel(r.range(6, 18), 0, 3.5, age)
        const rad = r.range(2.6, 4.6) * (0.6 + 1 * u),
          k = Math.pow(1 - u, 1.2) * Math.min(1, u * 10)
        p.disc(x, y, rad, dust, k * 0.5)
        p.disc(x + rad * 0.05, y + rad * 0.08, rad * 0.74, dust, k * 0.62)
        p.disc(x - rad * 0.22, y - rad * 0.3, rad * 0.5, C[5], k * 0.25)
      }
    )
  }
  function lines(p, C, a, t, seed2, front) {
    cycle(
      t,
      D5,
      front ? 5 : 11,
      seed2 + (front ? 9 : 7),
      (r) => r.range(0.12, 0.26),
      (age, life, r) => {
        const u = age / life,
          y = a.y + r.range(2, a.h - 3),
          len2 = r.range(10, 26) * (front ? 0.7 : 1)
        const x = r.range(-14, 4) - age * r.range(160, 240)
        for (let d = 0; d < len2; d++) {
          if (d > len2 * 0.45 && d % 2) continue
          p.dot(
            x + d,
            y,
            d < 2 ? C[6] : d < len2 * 0.4 ? C[5] : C[3],
            (1 - d / len2) * (1 - u) * (front ? 0.7 : 1.1)
          )
        }
        p.light(x, y, C[4], 0.4 * (1 - u))
      }
    )
  }
  function draw5(p, t, o) {
    const C = fit(o.palette, 7),
      a = o.actor,
      S = shape(a)
    for (const [x, y, dir] of S.side)
      if (dir > 0 && rand(x, y, Math.floor(t * 15)) < 0.85)
        p.px(a.x + x, a.y + y, rand(y, Math.floor(t * 15), 2) < 0.3 ? C[6] : C[5])
    lines(p, C, a, t, seed(o), true)
    p.glow(-6, a.y + a.h * 0.5, 22, C[3], 0.16)
    p.glow(0, a.y + a.h * 0.45, 30, C[3], 0.16)
    p.glow(a.x + a.w, a.y + a.h * 0.5, 10, C[5], 0.12 + 0.06 * Math.sin((t / D5) * TAU * 3))
  }
  var seed = (o) => o.seed

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/fx/status/rage.js
  var rage_exports = {}
  __export(rage_exports, {
    act: () => act6,
    actorAlpha: () => actorAlpha3,
    draw: () => draw6,
    drawBack: () => drawBack6,
    meta: () => meta6,
  })
  var meta6 = {
    name: 'Rage',
    desc: 'Seething: the body judders on every heartbeat, an anger mark throbs at the temple, eyes burn, steam jets off the head, stress lines flash out and the floor cracks hot underfoot.',
    tags: ['status', 'rage', 'berserk', 'anger', 'buff', 'loop'],
    size: [80, 80],
    origin: [40, 70],
    duration: 1.2,
    loop: true,
    fps: 30,
    bg: 'ground',
    actor: 2,
    options: {
      palette: [
        '#1a0208',
        '#4a0612',
        '#8a0c1c',
        '#c81828',
        '#ff3040',
        '#ff7a7a',
        '#ffc8c8',
        '#ffffff',
      ],
      heat: ['#5a0a0a', '#c8281a', '#ff7a2a', '#ffd27a'],
      steam: '#f2e8ee',
      seed: 6,
    },
  }
  var SEETHE = { turn: 1, crouch: 4, fx: -13, fy: -19, bx: 13, by: -19, ffx: -8, fbx: 9 }
  var THUD = { ...SEETHE, crouch: 6, fy: -23, by: -23 }
  var act6 = {
    onBody: true,
    poses: [
      [0, SEETHE],
      [0.05, THUD, 'snap'],
      [0.17, SEETHE, 'snap'],
      [0.29, { ...THUD, crouch: 5 }, 'snap'],
      [0.4, SEETHE, 'snap'],
      [1.2, SEETHE],
    ],
  }
  var D6 = meta6.duration
  var LUB = 0.05
  var DUB = 0.29
  var G2 = 760
  var pulse = (t, at, w = 0.06) =>
    Math.exp(-(((((((t - at) % D6) + D6 + D6 / 2) % D6) - D6 / 2) / w) ** 2))
  var beat = (t) => pulse(t, LUB) + 0.65 * pulse(t, DUB)
  var since3 = (t, at) => (((t - at) % D6) + D6) % D6
  var shaking = (t) => since3(t, LUB - 0.02) < 0.13 || since3(t, DUB - 0.02) < 0.09
  var actorAlpha3 = (t) => (shaking(t) ? 0 : 1)
  var MARK2 = [
    bitmap(['..#.#..', '..#.#..', '##...##', '.......', '##...##', '..#.#..', '..#.#..']),
    bitmap([
      '...#.#...',
      '...#.#...',
      '..##.##..',
      '###...###',
      '.........',
      '###...###',
      '..##.##..',
      '...#.#...',
      '...#.#...',
    ]),
  ]
  var CRACKS = /* @__PURE__ */ new Map()
  function cracks(a, seed2) {
    if (CRACKS.has(seed2)) return CRACKS.get(seed2)
    const S = shape(a),
      [fl, fr] = S.rows[S.h - 1],
      R5 = new Rng(seed2 * 31 + 7),
      out = []
    for (const [x0, dir] of [
      [a.x + fl + 2, -1],
      [a.x + fr - 1, 1],
      [a.x + (fl + fr) / 2, -1],
      [a.x + (fl + fr) / 2 + 1, 1],
    ]) {
      let x = x0,
        y = 0.5
      const pts = [[x, y]],
        n = R5.int(5, 9)
      for (let i = 0; i < n; i++) {
        x += dir * R5.range(1.2, 2.4)
        y = clamp(y + R5.range(-0.9, 0.9), 0, 2.5)
        pts.push([x, y])
        if (i > 1 && R5.chance(0.3))
          out.push([
            [x, y],
            [x + dir * R5.range(1, 2), clamp(y + R5.sign() * R5.range(0.6, 1.4), 0, 3)],
          ])
      }
      out.push(pts)
    }
    CRACKS.set(seed2, out)
    return out
  }
  function drawBack6(p, t, o) {
    const C = fit(o.palette, 8),
      Hh = fit(o.heat, 4),
      a = o.actor,
      b = beat(t),
      stamp = Math.exp(-since3(t, LUB) / 0.18)
    cycle(
      t,
      D6,
      9,
      o.seed + 2,
      (r) => r.range(0.7, 1.1),
      (age, life, r) => {
        const u = age / life,
          x0 = r.range(-16, 16),
          y = a.y + r.range(10, 40) - age * r.range(14, 22),
          len2 = r.range(6, 11),
          ph = r.range(0, TAU)
        const k = Math.sin(Math.PI * u) * 0.55
        for (let d = 0; d < len2; d++)
          p.dot(
            x0 - len2 / 2 + d,
            y + Math.round(Math.sin(d * 0.9 + ph + age * 12) * 0.8),
            d % 3 ? C[2] : C[1],
            k * (1 - Math.abs(d / len2 - 0.5) * 1.4)
          )
      }
    )
    p.shade(-30, -4, 30, 8, (x, y, out) => {
      const d = Math.hypot(x / 28, (y - 0.5) / 4.5)
      if (d < 1) ((out.l = C[3]), (out.k = (0.2 + 0.3 * b) * (1 - d) * (1 - d)))
    })
    const heat = 0.25 + 0.75 * stamp
    for (const pts of cracks(a, o.seed))
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1],
          [x1, y1] = pts[i],
          far = i / pts.length
        p.line(
          x0,
          y0,
          x1,
          y1,
          heat * (1 - far * 0.6) > 0.6 ? Hh[3] : heat * (1 - far * 0.5) > 0.35 ? Hh[2] : Hh[1]
        )
        if (i % 2) p.glow(x1, y1, 4, Hh[2], 0.25 * heat * (1 - far * 0.5))
      }
  }
  function draw6(p, t, o) {
    const C = fit(o.palette, 8),
      Hh = fit(o.heat, 4),
      a = o.actor,
      S = shape(a),
      b = beat(t),
      steam = hex(o.steam)
    const shake = shaking(t),
      dx = shake ? (Math.floor(t * 60) % 2 ? 1 : -1) : 0,
      dy = shake && since3(t, LUB - 0.02) < 0.06 ? -1 : 0
    for (const [mx2, my2] of S.body) {
      const c = colorAt(a, mx2, my2),
        l = luma(c),
        skin = l > 0.55 && (c & 255) > ((c >>> 16) & 255) + 30
      if (skin) p.px(a.x + mx2 + dx, a.y + my2 + dy, mix(c, C[4], 0.22 + 0.3 * b))
      else if (shake) p.px(a.x + mx2 + dx, a.y + my2 + dy, c)
    }
    for (const e of eyes(a)) {
      const ex = a.x + dx,
        ey = a.y + dy,
        inner = (e.x0 + e.x1) / 2 < a.w / 2 ? 1 : -1
      for (const [x, y] of e.px)
        p.px(ex + x, ey + y, y === e.y0 ? C[7] : y === e.y0 + 1 ? C[6] : C[4])
      const xi = inner > 0 ? e.x1 : e.x0,
        xo = inner > 0 ? e.x0 : e.x1
      p.px(ex + xo - inner, ey + e.y0 - 2, 4280227622)
      p.px(ex + xo, ey + e.y0 - 2, 4280227622)
      p.px(ex + xi, ey + e.y0 - 1, 4280227622)
      p.glow(ex + (e.x0 + e.x1 + 1) / 2, ey + e.y0 + 1, 5, C[5], 0.35 + 0.35 * b)
    }
    const big = pulse(t, LUB + 0.02, 0.05) > 0.35 || pulse(t, DUB + 0.02, 0.04) > 0.6
    const mx = a.x + a.w * 0.86 + dx,
      my = a.y + 3 + dy
    icon(p, mx, my, 5, MARK2[big ? 1 : 0], [C[0], C[3], C[4], C[5]])
    p.px(mx - (big ? 3 : 2), my - (big ? 3 : 2), C[6])
    p.glow(mx, my, 8, C[4], 0.25 + 0.4 * b)
    for (const [at, n, power] of [
      [LUB + 0.04, 7, 1],
      [DUB + 0.04, 4, 0.75],
    ])
      for (const side of [-1, 1])
        for (let i = 0; i < n; i++) {
          const age = since3(t, at + i * 0.016),
            life = 0.22 + 0.12 * rand(i, side, 3)
          if (age >= life) continue
          const u = age / life,
            ang = -Math.PI / 2 + side * (0.5 + 0.2 * rand(i, side, 5)),
            sp = (90 + 40 * rand(i, side, 7)) * power
          const x = side * a.w * 0.36 + Math.cos(ang) * travel(sp, 0, 7, age),
            y = a.y + 3 + Math.sin(ang) * travel(sp, 0, 7, age) - 8 * age
          const rad = (1 + 3.2 * Math.sqrt(u)) * (0.8 + 0.4 * rand(i, side, 9)),
            k = Math.min(1, u * 12) * Math.pow(1 - u, 2)
          p.disc(x, y, rad, steam, 0.7 * k)
          p.disc(x - rad * 0.2, y - rad * 0.25, rad * 0.6, 4294967295, 0.6 * k)
          if (u < 0.3) p.dot(x, y, 4294967295, 1 - u / 0.3)
        }
    for (const [at, n, len2] of [
      [LUB, 8, 7],
      [DUB, 6, 5],
    ]) {
      const age = since3(t, at)
      if (age > 0.2) continue
      const k = age / 0.2
      for (let i = 0; i < n; i++) {
        const ang = -Math.PI / 2 + ((i + 0.5) / n - 0.5) * 4.4,
          r0 = 15 + 6 * k,
          ca = Math.cos(ang),
          sa = Math.sin(ang),
          cx = 0,
          cy = a.y + 12
        const pts = []
        for (let j = 0; j <= 3; j++) {
          const r = r0 + (j / 3) * len2,
            off = j % 2 ? 1.3 : -0.4
          pts.push([cx + ca * r - sa * off, cy + sa * r + ca * off])
        }
        p.polyline(pts, (u) => (u > 0.66 ? C[7] : u > 0.33 ? C[5] : C[4]), 1.2 - k)
        p.glowLine(pts[0][0], pts[0][1], pts[3][0], pts[3][1], 3, C[4], 0.3 * (1 - k))
      }
    }
    const st = since3(t, LUB)
    for (let i = 0; i < 10; i++) {
      const life = 0.5 + 0.5 * rand(i, 11),
        age = st - 0.02 * rand(i, 12)
      if (age < 0 || age > life) continue
      const x = (rand(i, 13) - 0.5) * 30 + Math.sin(age * 9 + i) * 1.5 * age,
        y = -1 + travel(-(40 + 50 * rand(i, 14)), -20, 1.6, age)
      ember(p, x, y, age / life, [Hh[3], Hh[2], Hh[1]], age + i)
    }
    for (let i = 0; i < 12; i++) {
      const vx = (rand(i, 21) - 0.5) * 90,
        vy = -(40 + 70 * rand(i, 22)),
        tt = st
      const x = (rand(i, 23) - 0.5) * 18 + vx * tt,
        y = -1 + vy * tt + 0.5 * G2 * tt * tt
      if (tt > 0.6 || y > 0) continue
      p.px(x, y, i % 3 ? C[2] : 4285161074)
    }
    p.glow(0, a.y + 10, 26, C[4], 0.12 + 0.4 * b)
    p.glow(0, a.y + 22, 34, C[3], 0.08 + 0.18 * b)
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/fx/status/cursed.js
  var cursed_exports = {}
  __export(cursed_exports, {
    act: () => act7,
    draw: () => draw7,
    drawBack: () => drawBack7,
    meta: () => meta7,
  })
  var meta7 = {
    name: 'Cursed',
    desc: 'Hexed: violet smoke rises off the body in winding trails, a dark stain creeps up from the feet with a glowing edge, the eyes burn, a skull glitches in overhead.',
    tags: ['status', 'curse', 'hex', 'dark', 'debuff', 'shadow', 'loop'],
    size: [64, 84],
    origin: [32, 76],
    duration: 2.4,
    loop: true,
    fps: 30,
    bg: 'ground',
    actor: 2,
    options: {
      palette: [
        '#0c0612',
        '#1f0f2e',
        '#3a1a55',
        '#5e2a85',
        '#8a3fc0',
        '#b86ef0',
        '#e0b0ff',
        '#ffffff',
      ],
      seed: 9,
    },
  }
  var HUNCH = {
    turn: 1,
    crouch: 4,
    lean: 3,
    hy: 1,
    fx: -7,
    fy: -33,
    bx: 8,
    by: -33,
    ffx: -3,
    fbx: 4,
  }
  var act7 = {
    onBody: true,
    poses: [
      [0, HUNCH],
      [0.6, { ...HUNCH, crouch: 5 }],
      [1.2, { ...HUNCH, lean: 2 }],
      [1.8, { ...HUNCH, crouch: 5 }],
      [2.4, HUNCH],
    ],
  }
  var D7 = meta7.duration
  var SKULL = bitmap([
    '...#####...',
    '.#########.',
    '###########',
    '##eee#eee##',
    '##eEe#eEe##',
    '##eee#eee##',
    '#####.#####',
    '.####.####.',
    '..#######..',
    '..#.#.#.#..',
    '...#####...',
  ])
  var IN = 0.5
  var HOLD = 0.75
  var OUT2 = 1.85
  var GONE = 2.1
  var tide = (t) => 0.3 + 0.12 * Math.sin((t / D7) * TAU)
  var reach = (x, t, seed2) => tide(t) + 0.13 * tileFbm(x * 0.35, (t / D7) * 4, 0, 4, seed2, 2)
  function trails(p, C, a, S, t, seed2, front) {
    const spots2 = [
      [0.12, -1],
      [0.1, 1],
      [0.5, -1],
      [0.48, 1],
    ]
    spots2.forEach(([q, side], j) => {
      if ((j % 2 === 0) !== front) return
      const my = Math.round(S.h * q),
        [l, r] = S.rows[my] ?? [0, 0]
      const x0 = a.x + (side < 0 ? l : r + 1),
        y0 = a.y + my,
        life = 1.6,
        n = 18
      for (let i = n - 1; i >= 0; i--) {
        const age = (((t - (i / n) * D7 - j * 0.37) % D7) + D7) % D7,
          tb = t - age,
          u = age / life
        if (u >= 1) continue
        const sway = Math.sin((tb / D7) * TAU * 2 + j * 1.7) * 4 * Math.min(1, u * 1.6)
        const x = x0 + side * u * 7 + sway + (rand(i, j, 71) - 0.5) * 2.5 * u,
          y = y0 - age * 19 - 5 * u * u
        const rad = (1.3 + 3.6 * (1 - Math.pow(1 - u, 3))) * (0.7 + 0.6 * rand(i, j, 72)),
          k = smooth(0, 0.12, u) * (1 - smooth(0.45, 1, u)) * (front ? 0.5 : 0.62)
        const c = mix(rand(i, j, 70) < 0.5 ? C[4] : mix(C[4], C[3], 0.4), C[1], u * 0.85)
        p.disc(x, y, rad * 1.08, c, k * 0.4)
        p.disc(x + rad * 0.05, y + rad * 0.08, rad * 0.76, c, k * 0.55)
        p.disc(
          x - rad * 0.22,
          y - rad * 0.3,
          rad * 0.48,
          mix(c, C[6], 0.25),
          k * 0.38 * (1 - u * 0.6)
        )
        if (i % 3 === 0) p.glow(x, y, rad * 1.6, C[4], 0.08 * k)
      }
    })
  }
  function drawBack7(p, t, o) {
    const C = fit(o.palette, 8),
      a = o.actor,
      S = shape(a)
    const [fl, fr] = S.rows[S.h - 1],
      cx = a.x + (fl + fr + 1) / 2,
      rx = (fr - fl) / 2 + 7 + 2 * Math.sin((t / D7) * TAU)
    for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
      const q = Math.abs(x + 0.5 - cx) / rx,
        n = rand(x, 31)
      if (q > 1 + n * 0.12) continue
      p.px(x, 0, q > 0.8 ? C[4] : n < 0.2 ? C[3] : C[2])
      if (q < 0.85) p.px(x, 1, C[1])
      if (q < 0.55 && n < 0.7) p.px(x, 2, C[1])
    }
    p.shade(cx - rx - 6, -4, cx + rx + 6, 5, (x, y, out) => {
      const d = Math.hypot((x - cx) / (rx + 6), y / 4)
      if (d < 1) ((out.l = C[4]), (out.k = 0.2 * (1 - d) * (1 - d)))
    })
    trails(p, C, a, S, t, o.seed, false)
  }
  function draw7(p, t, o) {
    const C = fit(o.palette, 8),
      a = o.actor,
      S = shape(a),
      H = S.h
    for (const [mx, my] of S.body) {
      const c = colorAt(a, mx, my),
        up = 1 - (my + 0.5) / H,
        lv = reach(mx, t, o.seed)
      if (up > lv + 0.035) continue
      const x = a.x + mx,
        y = a.y + my
      if (up > lv - 0.02) p.px(x, y, C[6])
      else if (up > lv - 0.06) p.px(x, y, C[4])
      else p.px(x, y, mix(C[1], C[3], clamp(luma(c) * 1.6)))
    }
    for (let mx = 0; mx < S.w; mx++) {
      const lv = reach(mx, t, o.seed),
        my = Math.floor((1 - lv) * H)
      if (S.on(mx, my)) p.glow(a.x + mx, a.y + my, 4, C[5], 0.14)
    }
    for (const e of eyes(a)) {
      for (const [x, y] of e.px) p.px(a.x + x, a.y + y, y === e.y0 ? C[7] : C[5])
      p.glow(a.x + (e.x0 + e.x1 + 1) / 2, a.y + (e.y0 + e.y1 + 1) / 2, 5, C[5], 0.4)
    }
    trails(p, C, a, S, t, o.seed, true)
    if (t >= IN && t < GONE) {
      const glitch =
        t < HOLD ? 1 - (t - IN) / (HOLD - IN) : t > OUT2 ? (t - OUT2) / (GONE - OUT2) : 0
      const f = Math.floor(t * 30),
        on = glitch < 0.15 || rand(f, 3) > glitch * 0.6
      const x = 0,
        y = a.y - 12 + Math.sin((t / D7) * TAU * 2) * 1.2
      if (on) {
        const tear = (dx, dy) => {
          const row = dy + 6,
            shift =
              glitch > 0 && rand(f, row >> 1, 7) < glitch * 0.8
                ? Math.round((rand(f, row, 9) - 0.5) * 6 * glitch)
                : 0
          return SKULL(dx - shift, dy)
        }
        if (glitch > 0) {
          icon(p, x - 2, y, 7, tear, [0, C[2], C[2], C[3]], 0.7 * glitch)
          icon(p, x + 2, y, 7, tear, [0, C[6], C[6], C[6]], 0.5 * glitch)
        }
        icon(p, x, y, 8, tear, [C[0], C[4], C[6], C[7]], 1, { e: C[0], E: C[7] })
        p.glow(x - 3, y - 1, 5, C[5], 0.6)
        p.glow(x + 3, y - 1, 5, C[5], 0.6)
        p.glow(x, y, 16, C[4], 0.24 + 0.3 * glitch)
      }
      if (glitch > 0.1)
        for (let k = 0; k < 3; k++) {
          const ly = y - 5 + Math.floor(rand(f, k, 11) * 11),
            lx = Math.round((rand(f, k, 12) - 0.5) * 10),
            len2 = 3 + Math.floor(rand(f, k, 13) * 8)
          p.line(lx - len2 / 2, ly, lx + len2 / 2, ly, k % 2 ? C[6] : C[4], glitch)
        }
    }
    p.glow(0, a.y + H * (1 - tide(t)), 24, C[4], 0.2)
    p.glow(0, a.y + H * 0.45, 30, C[3], 0.12)
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/fx/impacts/hit-spark.js
  var hit_spark_exports = {}
  __export(hit_spark_exports, {
    create: () => create,
    meta: () => meta8,
  })
  var meta8 = {
    name: 'Hit spark',
    desc: 'The everyday hit: a sharp, lopsided cross flare with one long ray along the blow round a white diamond core, then a cone of sparks and hot chips that fall and bounce.',
    tags: ['impact', 'hit', 'spark', 'combat', 'directional', 'one-shot'],
    size: [136, 80],
    origin: [44, 64],
    duration: 0.5,
    loop: false,
    fps: 30,
    bg: 'ground',
    options: {
      palette: ['#4a1712', '#c9281f', '#f2561d', '#ff8a2a', '#ffe26b', '#fff3a6', '#ffffff'],
      height: 20,
      aim: 0.1,
      seed: 4,
    },
  }
  function ray(p, x, y, a, L, w, C, from = 0) {
    const c = Math.cos(a),
      s = Math.sin(a)
    for (let d = from * L; d <= L; d += 0.5) {
      const u = d / L,
        hw = w * Math.pow(1 - u, 1.6)
      const col = u < 0.3 ? WHITE : u < 0.62 ? C[5] : u < 0.88 ? C[4] : C[3]
      p.px(x + c * d, y + s * d, col)
      if (hw > 0.45)
        for (let o = 0.5; o <= hw; o += 0.5)
          for (const e of [-o, o])
            p.px(x + c * d - s * e, y + s * d + c * e, u < 0.3 && o < 1 ? C[5] : C[4])
    }
  }
  function diamond(p, x, y, r, C) {
    for (let dy = -r - 1; dy <= r + 1; dy++)
      for (let dx = -r - 1; dx <= r + 1; dx++) {
        const m = Math.abs(dx) + Math.abs(dy)
        if (m <= r) p.px(x + dx, y + dy, WHITE)
        else if (m === r + 1) p.px(x + dx, y + dy, C[3])
      }
  }
  function create(o) {
    const C = fit(o.palette, 7),
      R5 = new Rng(o.seed),
      X = 0,
      Y = -o.height,
      A = o.aim,
      floor = () => 0
    const ps = new Particles({ rng: R5, ground: floor, sparks: [C[6], C[5], C[4], C[2]] })
    const lights = new Lights()
    const tilt = R5.range(-0.08, 0.08)
    const rays = [
      { a: A + tilt, L: R5.range(33, 37), w: 2.2 },
      { a: A + Math.PI + tilt, L: R5.range(8, 10), w: 2.2 },
      { a: A - Math.PI / 2 + tilt, L: R5.range(15, 18), w: 2.6 },
      { a: A + Math.PI / 2 + tilt, L: R5.range(10, 12), w: 2.3 },
      { a: A - Math.PI / 4 + tilt, L: R5.range(5, 7), w: 1 },
    ]
    lights.add(X, Y, 38, C[4], 0.35, 0.18)
    lights.add(X + Math.cos(A) * 10, Y + Math.sin(A) * 10, 22, C[5], 0.45, 0.1)
    lights.add(X, -2, 26, C[3], 0.22, 0.22)
    for (let i = 0; i < 9; i++) {
      const a = A + R5.range(-0.6, 0.6) - 0.15,
        v = R5.range(170, 360)
      ps.spawn(
        P.SPARK,
        X + 1,
        Y,
        Math.cos(a) * v,
        Math.sin(a) * v - 40,
        R5.range(0.25, 0.45),
        WHITE,
        1,
        i > 6 ? R5.range(0.01, 0.03) : 0
      )
    }
    for (let i = 0; i < 6; i++) {
      const a = A + R5.range(-1.1, 0.5) - 0.3,
        v = R5.range(70, 170)
      ps.spawn(
        P.GRIT,
        X + 1,
        Y,
        Math.cos(a) * v,
        Math.sin(a) * v - R5.range(30, 80),
        R5.range(0.35, 0.45),
        R5.pick([C[5], C[4], C[4], C[3]]),
        1
      )
    }
    let t = 0
    return {
      update(dt) {
        t += dt
        ps.update(dt)
        lights.update(dt)
      },
      draw(p) {
        ps.draw(p)
        if (t < 0.025) {
          for (const r of rays) ray(p, X, Y, r.a, r.L, r.w, C)
          diamond(p, X, Y, 4, C)
        } else if (t < 0.058) {
          for (const r of rays) ray(p, X, Y, r.a, r.L * 1.2, r.w * 0.55, C, 0.12)
          diamond(p, X, Y, 3, C)
        } else if (t < 0.092) {
          const r = rays[0]
          ray(p, X, Y, r.a, r.L * 1.3, 0.6, [C[0], C[1], C[2], C[3], C[3], C[4]], 0.4)
        }
        const pop = Math.exp(-t / 0.045)
        if (pop > 0.02) {
          p.glow(X, Y, 22, C[4], 0.3 * pop)
          p.glow(X, Y, 7, WHITE, 0.15 * pop)
          p.glowLine(X, Y, X + Math.cos(A) * 26, Y + Math.sin(A) * 26, 4, C[5], 0.25 * pop)
        }
        lights.draw(p)
      },
    }
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/fx/impacts/crit-hit.js
  var crit_hit_exports = {}
  __export(crit_hit_exports, {
    create: () => create2,
    meta: () => meta9,
  })

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/fx/impacts/_lib.js
  var SOOT = hex('#0d0a12')
  var OUTLINE = hex('#1a1422')
  var LIGHT2 = Math.atan2(-1, -1)
  function spikes(
    R5,
    n,
    aim,
    { len: len2 = [7, 10], w = [1.5, 2.1], fwd = 1.8, back = 0.6, jag = 1, jit = 0.18 } = {}
  ) {
    return Array.from({ length: n }, (_, i) => {
      const a = aim + (i / n) * TAU + R5.range(-jit, jit),
        cb = Math.cos(a - aim)
      const L =
        R5.range(len2[0], len2[1]) *
        (1 + fwd * Math.pow(Math.max(0, cb), 3) + back * Math.pow(Math.max(0, -cb), 3)) *
        (i % 2 ? jag : 1)
      return { a, len: L, w: R5.range(w[0], w[1]) * (i % 2 ? Math.sqrt(jag) : 1) }
    })
  }
  function star(p, x, y, list, sc, th, [rim, body2, inner, core], a = 1, heart = 2.4) {
    for (let pass = 0; pass < 3; pass++)
      for (const s of list) {
        const c = Math.cos(s.a),
          sn = Math.sin(s.a),
          L = s.len * sc
        for (let d = 0; d <= L; d += 0.5) {
          if (pass === 2 && d > L * 0.55) break
          const hw0 = s.w * th * (1 - d / L) * Math.min(1, 0.5 + d / 3)
          const hw = pass === 0 ? hw0 + 0.8 : pass === 1 ? hw0 : hw0 * 0.45
          const col = pass === 0 ? rim : pass === 1 ? (d < L * 0.35 ? inner : body2) : core
          for (let o = -hw; o <= hw; o += 0.5) p.dot(x + c * d - sn * o, y + sn * d + c * o, col, a)
        }
      }
    const r = heart * sc * Math.sqrt(th)
    p.circle(x, y, r + 0.8, inner, a)
    p.circle(x, y, r, core, a)
  }
  function brokenRing(p, x, y, r, th, segs, brk, c, c2 = c, k = 1, sy = 1, maxY = Infinity) {
    if (r <= 0 || k <= 0) return
    const full = TAU / segs.length
    for (const s of segs) {
      const span = full * (1 - s.gap * brk) + 0.02,
        rr = r * (1 + s.dr * brk),
        m = Math.max(4, Math.ceil(rr * span * 1.8))
      for (let j = 0; j <= m; j++) {
        const u = j / m,
          ang = s.a + (u - 0.5) * span,
          w = Math.max(0.5, th * (s.w ?? 1) * (1 - brk * Math.pow(Math.abs(2 * u - 1), 1.6)))
        const ca = Math.cos(ang),
          sa = Math.sin(ang)
        for (let o = -w / 2; o <= w / 2 + 0.01; o += 0.5)
          if (y + sa * (rr + o) * sy < maxY)
            p.dot(x + ca * (rr + o), y + sa * (rr + o) * sy, o > -0.26 ? c : c2, k)
      }
    }
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pixelfx-src/src/fx/impacts/crit-hit.js
  var meta9 = {
    name: 'Critical hit',
    desc: 'A critical hit: a jagged starburst slams in white and overshoots, a ring breaks into flying arcs, sparks streak off, shards tumble to the floor under a big flare.',
    tags: ['impact', 'hit', 'crit', 'critical', 'combat', 'directional', 'one-shot'],
    size: [216, 136],
    origin: [84, 106],
    duration: 0.9,
    loop: false,
    fps: 30,
    bg: 'ground',
    options: {
      palette: [
        '#2a0510',
        '#5c0a1c',
        '#a3142a',
        '#e0302c',
        '#ff7a2a',
        '#ffc23d',
        '#fff09a',
        '#ffffff',
      ],
      height: 26,
      aim: 0.12,
      seed: 3,
    },
  }
  var KEYS = [
    [0, 1, 1, 1, [6, 7, 7, 7]],
    [0.025, 1.3, 1, 1, [2, 5, 6, 7]],
    [0.058, 1.05, 0.72, 1, [2, 4, 5, 6]],
    [0.092, 1.22, 0.3, 1, [1, 2, 3, 4]],
    [0.125],
  ]
  function flare3(p, x, y, L, k, C) {
    for (const [dx, dy, len2] of [
      [1, 0, L],
      [0, 1, L * 0.45],
      [0.7, 0.7, L * 0.16],
      [0.7, -0.7, L * 0.16],
    ])
      for (const s of [-1, 1])
        for (let d = 1; d <= len2; d++) {
          const u = d / len2,
            a = u < 0.7 ? 1 : k * (1.6 - u)
          p.dot(x + s * dx * d, y + s * dy * d, u < 0.35 ? WHITE : u < 0.7 ? C[6] : C[5], a)
          if (dy === 0 && u < 0.42)
            for (const e of [-1, 1]) p.dot(x + s * d, y + e, u < 0.2 ? C[6] : C[5], u < 0.3 ? 1 : k)
        }
    p.glowLine(x - L, y, x + L, y, 6, C[6], 0.5 * k)
    p.glowLine(x, y - L * 0.45, x, y + L * 0.45, 4, C[6], 0.3 * k)
  }
  function create2(o) {
    const C = fit(o.palette, 8),
      R5 = new Rng(o.seed),
      X = 0,
      Y = -o.height,
      A = o.aim,
      floor = () => 0
    const ps = new Particles({ rng: R5, ground: floor, sparks: [C[7], C[6], C[5], C[3]] })
    const bits = new Bits({ ground: floor }),
      lights = new Lights()
    const sp = spikes(R5, 14, A, { len: [11, 15], w: [1.8, 2.5], fwd: 1.4, back: 0.6, jag: 0.5 })
    ;[...sp]
      .sort((a, b) => b.len - a.len)
      .slice(0, 2)
      .forEach((s) => (s.len *= 1.3))
    const segs = Array.from({ length: 7 }, (_, i) => {
      const a = A + (i / 7) * TAU
      return {
        a,
        gap: R5.range(0.55, 0.85),
        dr: R5.range(0.08, 0.4) + 0.15 * Math.max(0, Math.cos(a - A)),
        w: 0.7 + 0.5 * Math.max(0, Math.cos(a - A)),
      }
    })
    lights.add(X, Y, 84, C[5], 0.6, 0.5)
    lights.add(X, Y, 30, WHITE, 0.7, 0.1)
    lights.add(X, -4, 44, C[4], 0.3, 0.45)
    for (let i = 0; i < 36; i++) {
      const back = R5.chance(0.22),
        a = (back ? A + Math.PI : A) + R5.range(-1, 1) * (back ? 0.6 : 0.8),
        v = R5.range(170, 430) * (back ? 0.6 : 1)
      ps.spawn(
        P.SPARK,
        X,
        Y,
        Math.cos(a) * v,
        Math.sin(a) * v - 50,
        R5.range(0.15, 0.5),
        WHITE,
        1,
        R5.chance(0.3) ? R5.range(0, 0.04) : 0
      )
    }
    for (let i = 0; i < 10; i++) {
      const a = A + R5.range(-1, 1) * 1.1 - 0.35,
        v = R5.range(110, 280)
      bits.add({
        kind: B.SHARD,
        x: X,
        y: Y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 40,
        g: 0.8,
        drag: 0.7,
        bounce: 0.35,
        life: R5.range(0.55, 0.85),
        a: R5.range(0, TAU),
        va: R5.range(-25, 25),
        s: R5.range(2, 4.5),
        c: R5.pick([C[7], C[6], C[6], C[5]]),
      })
    }
    for (let i = 0; i < 12; i++) {
      const a = A - Math.PI / 2 + R5.range(-1.4, 1.4),
        v = R5.range(35, 110)
      ps.spawn(
        P.MOTE,
        X + Math.cos(a) * 4,
        Y + Math.sin(a) * 4,
        Math.cos(a) * v,
        Math.sin(a) * v - 15,
        R5.range(0.35, 0.7),
        R5.pick([C[6], C[5], C[5]]),
        0.6,
        R5.range(0, 0.05)
      )
    }
    for (let i = 0; i < 5; i++) {
      const a = R5.range(0, TAU),
        d = R5.range(14, 34)
      ps.spawn(
        P.STAR,
        X + Math.cos(a) * d,
        Y + Math.sin(a) * d * 0.8,
        0,
        -4,
        R5.range(0.22, 0.38),
        R5.chance(0.5) ? C[6] : WHITE,
        R5.range(1.6, 3),
        R5.range(0.08, 0.32)
      )
    }
    let t = 0
    return {
      update(dt) {
        t += dt
        ps.update(dt)
        bits.update(dt)
        lights.update(dt)
      },
      draw(p) {
        const u = clamp((t - 0.03) / 0.37)
        if (t >= 0.03 && u < 1) {
          const r = 10 + 30 * ease.outCubic(u),
            brk = smooth(0.12, 0.6, u),
            th = Math.max(1, 3.6 * Math.pow(1 - u, 1.2))
          const i = u < 0.12 ? 7 : u < 0.3 ? 6 : u < 0.5 ? 5 : u < 0.75 ? 4 : 3
          brokenRing(
            p,
            X,
            Y,
            r,
            th,
            segs,
            brk,
            C[i],
            C[Math.max(2, i - 2)],
            u < 0.6 ? 1 : (1 - u) / 0.4,
            1,
            0
          )
          if (u < 0.6) p.glowRing(X, Y, r, 6, C[5], 0.35 * Math.pow(1 - u / 0.6, 2))
        }
        bits.draw(p)
        ps.draw(p)
        const f = (t - 0.04) / 0.28
        if (f > 0 && f < 1) {
          flare3(p, X, Y, 64 * Math.pow(1 - f, 1.3), 1 - f, C)
          p.glow(X, Y, 56, C[5], 0.4 * (1 - f))
        }
        for (let i = 0; i < KEYS.length - 1; i++)
          if (t >= KEYS[i][0] && t < KEYS[i + 1][0]) {
            const [, sc, th, a, cols] = KEYS[i]
            star(
              p,
              X,
              Y,
              sp,
              sc,
              th,
              cols.map((j) => C[j]),
              a,
              2.6
            )
          }
        const pop = Math.exp(-t / 0.05)
        if (pop > 0.02) {
          p.glow(X, Y, 44, C[5], 0.4 * pop)
          p.glow(X, Y, 12, WHITE, 0.6 * pop)
        }
        lights.draw(p)
      },
    }
  }

  // ../../../tmp/claude-0/-home-user/44484d19-62e0-5881-9fd4-d4ba4d124953/scratchpad/pfx-build/entry.js
  var FX = {
    burning: burning_exports,
    stunned: stunned_exports,
    poisoned: poisoned_exports,
    slowed: slowed_exports,
    haste: haste_exports,
    rage: rage_exports,
    cursed: cursed_exports,
    hitSpark: hit_spark_exports,
    critHit: crit_hit_exports,
  }
  return __toCommonJS(entry_exports)
})()
