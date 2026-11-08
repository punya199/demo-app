import type { EyeKind, Mat, Pt, Spr } from './spr'
import type { IPose } from '../sprite-types'
import { TAU, lerp } from './math'

// Shape helpers shared by the sprite designs (wings, heads, halos, leaves...), ported from the
// prototype's js/engine.js. Each draws onto a Spr grid in material keys or detail colours.

export const glowMouth = (s: Spr, x: number, y: number) =>
  s
    .d(x, y, '#fff6b0')
    .d(x + 1, y, '#ffd04a')
    .d(x, y - 1, '#ffd04a')
    .d(x, y + 1, '#ff8a24')
    .d(x - 1, y, '#ffd04a')
    .d(x + 2, y, '#ff8a24')

// A bushy tail that zigzags like a lightning bolt from (x0, y0) along relative points, tapering to a glowing tip.
export function boltTail(s: Spr, x0: number, y0: number, path: Pt[], r: number, k: Mat, sway = 0) {
  r *= 1.5
  const pts = [
    [x0, y0],
    ...path.map(([dx, dy], i: number) => [
      x0 + dx + ((sway * (i + 1)) / path.length) * 1.4,
      y0 + dy - ((Math.abs(sway) * (i + 1)) / path.length) * 0.4,
    ]),
  ]
  for (let i = 0; i < pts.length - 1; i++)
    s.L(
      pts[i][0],
      pts[i][1],
      pts[i + 1][0],
      pts[i + 1][1],
      r * (1 - (i / pts.length) * 0.55),
      k,
      r * (1 - ((i + 1) / pts.length) * 0.7)
    )
  const [a, b] = [pts[pts.length - 2], pts[pts.length - 1]],
    ang = Math.atan2(b[1] - a[1], b[0] - a[0])
  s.P(
    [
      [b[0] - Math.sin(ang) * r * 0.6, b[1] + Math.cos(ang) * r * 0.6],
      [b[0] + Math.cos(ang) * r * 1.6, b[1] + Math.sin(ang) * r * 1.6],
      [b[0] + Math.sin(ang) * r * 0.6, b[1] - Math.cos(ang) * r * 0.6],
    ],
    'volt'
  )
  s.line(pts.slice(1), '#ffe14a', '#fffac0')
}

// Dragon parts shared by the lightning fused options.
// A bat wing: arm spar from the shoulder S to the wrist W, finger spars to the tips, membrane panels between them
// in two alternating shades with scalloped trailing edges, back to the body at B.
export function dragonWing(
  s: Spr,
  S: Pt,
  W: Pt,
  tips: Pt[],
  B: Pt,
  k1: Mat,
  k2: Mat,
  clawed: boolean
) {
  const sc = (a: Pt, b: Pt) => [
    (a[0] + b[0]) / 2 + (W[0] - (a[0] + b[0]) / 2) * 0.22,
    (a[1] + b[1]) / 2 + (W[1] - (a[1] + b[1]) / 2) * 0.22,
  ]
  s.P([S, W, tips[0]], k1)
  for (let i = 0; i < tips.length - 1; i++)
    s.P([W, tips[i], sc(tips[i], tips[i + 1]), tips[i + 1]], i % 2 ? k1 : k2)
  s.P([W, tips[tips.length - 1], sc(tips[tips.length - 1], B), B, S], tips.length % 2 ? k1 : k2)
  s.L(S[0], S[1], W[0], W[1], 1.6, 'gold', 1.2)
  for (const p of tips) s.L(W[0], W[1], p[0], p[1], 0.9, 'gold', 0.5)
  s.line(
    [
      [S[0], S[1] - 1],
      [W[0], W[1] - 1],
      [tips[0][0], tips[0][1] - 1],
    ],
    '#fff4c0'
  )
  if (clawed) s.spike(W[0], W[1] + 1, 4, 1.2, 'gold', (W[0] - S[0]) * 0.1)
}

export const claws = (s: Spr, x: number, y: number, sc = 1) => {
  for (const a of [-0.5, 0.2, 0.9])
    s.L(x, y, x + 2.6 * sc * Math.cos(a), y + 1.6 * sc * Math.sin(a) + 0.4, 0.5, 'gold')
}

// A broad bird wing from the shoulder (sx, sy): leading edge up and back to the tip, finger feathers along the
// trailing edge. dir -1 = near wing (sweeps back over the body), 1 = far wing (behind, toward the front).
// lift raises the tip; vein draws a lightning line along it; puff adds storm-cloud lumps on the trailing edge.
export function birdWing(
  s: Spr,
  sx: number,
  sy: number,
  sc: number,
  dir: number,
  lift: number,
  k: Mat,
  vein?: string | null,
  puff?: Mat
) {
  const d = dir < 0 ? -1 : 0.75,
    base = [
      [0, 0],
      [5 * d, -10],
      [12 * d, -20],
      [22 * d, -28],
      [27 * d, -31],
      [24 * d, -26],
      [28 * d, -24],
      [21 * d, -20],
      [25 * d, -17],
      [17 * d, -14],
      [20 * d, -9],
      [11 * d, -6],
      [12 * d, 0],
      [4 * d, 2],
    ]
  const pts = base.map(([x, y]) => [sx + x * sc, sy + y * sc + lift * Math.min(1, -y / 28)])
  s.P(pts, k)
  if (puff) for (const i of [5, 7, 9, 11]) s.E(pts[i][0], pts[i][1], 3.4 * sc, 2.8 * sc, puff)
  for (const i of [6, 8, 10])
    s.line(
      [
        [pts[i][0], pts[i][1]],
        [(pts[i][0] + sx) / 2, (pts[i][1] + sy) / 2],
      ],
      '#0c0a18'
    )
  if (vein)
    s.line(
      [[sx + 2 * d * sc, sy - 2 * sc], pts[2], [pts[2][0] - 2 * d, pts[2][1] + 2], pts[3]],
      vein,
      '#fffac0'
    )
}

// Holy line helpers.
// A thin glowing halo ring of detail pixels (always drawn on top), tilt leans it to one side.
export function haloRing(
  s: Spr,
  x: number,
  y: number,
  rx: number,
  ry: number,
  tilt = 0,
  thick = 1
) {
  const n = Math.ceil(rx * 8)
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU,
      px = x + Math.cos(a) * rx,
      py = y + Math.sin(a) * ry + Math.cos(a) * rx * tilt
    const c = Math.sin(a) < -0.2 ? '#fff6c8' : Math.sin(a) > 0.4 ? '#e8a820' : '#ffd84a'
    s.d(px, py, c)
    if (thick > 1) s.d(px, py + 1, Math.sin(a) < 0 ? '#ffd84a' : '#c48a16')
  }
}

// A light ray (thin pointed wedge) from radius r0 to r1 at angle a around (cx, cy).
export function ray(
  s: Spr,
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  a: number,
  w: number,
  k: Mat
) {
  const c = Math.cos(a),
    sn = Math.sin(a)
  s.P(
    [
      [cx + c * r0 - sn * w, cy + sn * r0 + c * w],
      [cx + c * r1, cy + sn * r1],
      [cx + c * r0 + sn * w, cy + sn * r0 - c * w],
    ],
    k
  )
}

// A lion's mane of light: alternating long gold and short white rays round a gold disc.
export function lightMane(
  s: Spr,
  cx: number,
  cy: number,
  r: number,
  n: number,
  k = 'mane',
  k2 = 'hlight'
) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + 0.2
    ray(s, cx, cy, r * 0.5, r * (i % 2 ? 1.05 : 1.45), a, r * 0.3, i % 2 ? k2 : k)
  }
  s.E(cx, cy, r * 0.85, r * 0.8, k)
}

// A long feathered wing pointing along angle a from (sx, sy): smooth leading edge, scalloped trailing edge.
// side flips which edge carries the feather tips.
export function plumeWing(
  s: Spr,
  sx: number,
  sy: number,
  len: number,
  wid: number,
  a: number,
  k: Mat,
  side = 1,
  line = '#7e88a4'
) {
  const c = Math.cos(a),
    sn = Math.sin(a),
    T = (u: number, v: number) => [sx + c * u - sn * v * side, sy + sn * u + c * v * side],
    pts = []
  for (let i = 0; i <= 8; i++) {
    const q = i / 8
    pts.push(T(len * q, -wid * 0.35 * Math.sin(Math.PI * Math.min(1, q * 1.05))))
  }
  for (let i = 10; i >= 0; i--) {
    const q = i / 10
    pts.push(
      T(
        len * (q * 0.94),
        wid * (0.2 + 0.8 * Math.sin(Math.PI * Math.min(1, q * 0.9 + 0.08))) * (i % 2 ? 0.62 : 1)
      )
    )
  }
  s.P(pts, k)
  for (const q of [0.3, 0.5, 0.7])
    s.line([T(len * q, wid * 0.1), T(len * (q - 0.12), wid * 0.6 * Math.sin(Math.PI * q))], line)
}

// Gold scale plates in a row along the back.
export function scaleRow(s: Spr, pts: Pt[], rx: number, ry: number, k = 'gold') {
  for (const [x, y] of pts) s.E(x, y, rx, ry, k)
  for (const [x, y] of pts) s.d(x - rx * 0.4, y - ry * 0.3, '#fff0a0')
}

// A qilin head at (ex, ey) facing right: long snout, one swept-back horn, cloud brow, whisker.
export function qilinHead(
  s: Spr,
  ex: number,
  ey: number,
  sc: number,
  j: number,
  horn = 'gold',
  hornGlow = false
) {
  s.L(ex - 1 * sc, ey - 3 * sc, ex - 6 * sc, ey - 12 * sc, 1.3 * sc, horn, 0.5 * sc)
  s.L(ex - 6 * sc, ey - 12 * sc, ex - 9 * sc, ey - 14 * sc, 0.6 * sc, horn, 0.4)
  s.P(
    [
      [ex - 4 * sc, ey - 2 * sc],
      [ex - 8 * sc, ey - 6 * sc],
      [ex - 2 * sc, ey - 4 * sc],
    ],
    'ivory2'
  )
  s.E(ex, ey, 5 * sc, 4.2 * sc, 'ivory')
  s.P(
    [
      [ex + 2 * sc, ey - 2.5 * sc],
      [ex + 10 * sc, ey],
      [ex + 10 * sc, ey + 2.6 * sc],
      [ex + 2 * sc, ey + 3.4 * sc],
    ],
    'ivory'
  )
  s.P(
    [
      [ex + 2 * sc, ey + 2.4 * sc],
      [ex + 9 * sc, ey + 2.6 * sc + j],
      [ex + 7 * sc, ey + 4.6 * sc + j],
      [ex + 2 * sc, ey + 4.2 * sc],
    ],
    'ivory2'
  )
  s.E(ex - 1 * sc, ey - 3.6 * sc, 3.4 * sc, 1.6 * sc, 'sky')
  s.line(
    [
      [ex + 8 * sc, ey + 1.5 * sc],
      [ex + 11 * sc, ey + 4 * sc],
      [ex + 10 * sc, ey + 7 * sc],
    ],
    '#f2c13a',
    '#fff0a0'
  )
  s.d(ex + 2 * sc, ey - 1 * sc, '#ffffff')
    .d(ex + 3 * sc, ey - 1 * sc, '#2a1802')
    .d(ex + 1 * sc, ey - 2 * sc, '#2a1802')
    .d(ex + 2 * sc, ey - 2 * sc, '#2a1802')
    .d(ex + 3 * sc, ey - 2 * sc, '#2a1802')
  s.d(ex + 9.5 * sc, ey + 0.4 * sc, '#2a2620')
  if (hornGlow) s.d(ex - 9 * sc, ey - 14 * sc, '#ffffff').d(ex - 8 * sc, ey - 14 * sc, '#fff6c8')
}

// A lion head at (cx, cy) in its mane: cream face, short muzzle, gold eyes.
export function lionFace(s: Spr, cx: number, cy: number, sc: number, j: number, eye = 'cute') {
  s.E(cx + 1.6 * sc, cy + 0.8 * sc, 4.6 * sc, 4.3 * sc, 'lionb')
  s.E(cx - 1.4 * sc, cy - 3.6 * sc, 1.5 * sc, 1.5 * sc, 'lionb')
  s.E(cx + 4.8 * sc, cy + 2 * sc, 2.8 * sc, 2.1 * sc + j * 0.3, 'ivory')
  s.d(cx + 7 * sc, cy + 0.8 * sc, '#6a3a2a').d(cx + 6.4 * sc, cy + 0.8 * sc, '#6a3a2a')
  if (j > 0.5)
    s.line(
      [
        [cx + 4 * sc, cy + 3.4 * sc],
        [cx + 7 * sc, cy + 3.4 * sc],
      ],
      '#5a0a1a'
    )
  if (eye === 'cute') s.eye(cx + 2 * sc, cy - 1 * sc, 'cute')
  else
    s.d(cx + 2 * sc, cy - 1 * sc, '#fff6b0')
      .d(cx + 3 * sc, cy - 1 * sc, '#c48a16')
      .line(
        [
          [cx + 0.5 * sc, cy - 2.4 * sc],
          [cx + 4 * sc, cy - 1.8 * sc],
        ],
        '#2a1a04'
      )
}

// Dark line helpers.
// A bat wing: arm spar from the shoulder S to the wrist W, finger spars to the tips, membrane panels in two
// alternating shades with scalloped trailing edges, back to the body at B. torn cuts notches out of the edge.
export function memWing(
  s: Spr,
  S: Pt,
  W: Pt,
  tips: Pt[],
  B: Pt,
  k1: Mat,
  k2: Mat,
  spar: Mat,
  torn = 0
) {
  const sc = (a: Pt, b: Pt) => [
    (a[0] + b[0]) / 2 + (W[0] - (a[0] + b[0]) / 2) * 0.25,
    (a[1] + b[1]) / 2 + (W[1] - (a[1] + b[1]) / 2) * 0.25,
  ]
  s.P([S, W, tips[0]], k1)
  for (let i = 0; i < tips.length - 1; i++)
    s.P([W, tips[i], sc(tips[i], tips[i + 1]), tips[i + 1]], i % 2 ? k1 : k2)
  s.P([W, tips[tips.length - 1], sc(tips[tips.length - 1], B), B, S], tips.length % 2 ? k1 : k2)
  for (let i = 0; i < torn; i++) {
    const a = tips[i],
      b = tips[i + 1] || B,
      m = sc(a, b)
    s.E(lerp(a[0], m[0], 0.55), lerp(a[1], m[1], 0.55), 1.6, 1.4, 0)
  }
  s.L(S[0], S[1], W[0], W[1], 1.2, spar, 0.9)
  for (const p of tips) s.L(W[0], W[1], p[0], p[1], 0.7, spar, 0.4)
  s.spike(W[0], W[1] + 0.5, 2.6, 0.9, 'bone', (W[0] - S[0]) * 0.08)
}

// One jointed leg: hip → knee (raised) → foot.
export function jLeg(s: Spr, h: Pt, kn: Pt, f: Pt, r: number, k: Mat) {
  s.L(h[0], h[1], kn[0], kn[1], r, k, r * 0.85)
  s.L(kn[0], kn[1], f[0], f[1], r * 0.8, k, r * 0.45)
}

// A ring of red eyes for spiders.
export function spiderEyes(s: Spr, x: number, y: number, big = 1) {
  for (const [dx, dy, b] of [
    [0, 0, 1],
    [2.4, -0.4, 1],
    [1.2, -2, 0.6],
    [3.4, -1.8, 0.6],
    [-1.4, -1.2, 0.5],
    [4.4, 0.4, 0.5],
  ]) {
    s.d(x + dx * big, y + dy * big, b > 0.8 ? '#ff3a4a' : '#c8102a')
    if (b > 0.8 && big > 1) s.d(x + dx * big + 1, y + dy * big, '#ff8a8a')
  }
}

export const starDots = (s: Spr, pts: Pt[]) => {
  for (const [x, y, b] of pts) {
    s.d(x, y, b ? '#ffffff' : '#a8b4ff')
    if (b)
      s.d(x + 1, y, '#6a7ad8')
        .d(x - 1, y, '#6a7ad8')
        .d(x, y - 1, '#6a7ad8')
        .d(x, y + 1, '#6a7ad8')
  }
}

// Shadow line helpers.
// A violet glowing eye: 'o' round and cute, 'n' narrow and angry, 's' a sleepy line.
export function shEye(s: Spr, x: number, y: number, kind = 'o') {
  if (kind === 'o')
    s.d(x, y, '#f0d8ff')
      .d(x + 1, y, '#b04aff')
      .d(x, y + 1, '#b04aff')
      .d(x + 1, y + 1, '#4a1a8a')
  else if (kind === 'n')
    s.d(x - 1, y - 1, '#7a2ad0')
      .d(x, y, '#f0d8ff')
      .d(x + 1, y, '#d08aff')
      .d(x + 2, y, '#a04aff')
      .d(x + 2, y + 1, '#7a2ad0')
  else
    s.d(x, y, '#b04aff')
      .d(x + 1, y, '#b04aff')
      .d(x + 2, y, '#b04aff')
  return s
}

// A tapered ribbon along a list of points.
export function ribbon(s: Spr, pts: Pt[], r0: number, r1: number, k: Mat) {
  const n = pts.length - 1
  for (let i = 0; i < n; i++)
    s.L(
      pts[i][0],
      pts[i][1],
      pts[i + 1][0],
      pts[i + 1][1],
      r0 + ((r1 - r0) * i) / n,
      k,
      r0 + ((r1 - r0) * (i + 1)) / n
    )
}

// A pixel arc of a circle centred (cx, cy), radius r, from angle a0 to a1 (radians), drawn as detail dots.
export function arc(
  s: Spr,
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
  c: string,
  rx = r
) {
  const pts = []
  for (let i = 0; i <= 8; i++) {
    const a = a0 + ((a1 - a0) * i) / 8
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * r])
  }
  return s.line(pts, c)
}

// Drawing on a design grid: scale sc, offset (ox, oy).
export function tf(s: Spr, sc: number, ox: number, oy: number) {
  const X = (x: number) => x * sc + ox,
    Y = (y: number) => y * sc + oy,
    M = (pts: Pt[]) => pts.map(([x, y]) => [X(x), Y(y)])
  return {
    X,
    Y,
    M,
    E: (x: number, y: number, rx: number, ry: number, k: Mat) =>
      s.E(X(x), Y(y), rx * sc, ry * sc, k),
    L: (x0: number, y0: number, x1: number, y1: number, r0: number, k: Mat, r1 = r0) =>
      s.L(X(x0), Y(y0), X(x1), Y(y1), r0 * sc, k, r1 * sc),
    P: (pts: Pt[], k: Mat) => s.P(M(pts), k),
    d: (x: number, y: number, c: string) => s.d(X(x), Y(y), c),
    ln: (pts: Pt[], c: string, c2?: string) => s.line(M(pts), c, c2),
    R: (pts: Pt[], r0: number, r1: number, k: Mat) => ribbon(s, M(pts), r0 * sc, r1 * sc, k),
    sp: (x: number, y: number, h: number, w: number, k: Mat, l = 0) =>
      s.spike(X(x), Y(y), h * sc, w * sc, k, l * sc),
  }
}

export const glowSap = (s: Spr, x: number, y: number) =>
  s
    .d(x, y, '#f0ffe0')
    .d(x + 1, y, '#a8ffa0')
    .d(x, y - 1, '#a8ffa0')
    .d(x, y + 1, '#4ad44a')
    .d(x - 1, y, '#a8ffa0')
    .d(x + 2, y, '#4ad44a')

// A pointed leaf from (x, y) along angle a, with an optional vein colour.
export function leafShape(
  s: Spr,
  x: number,
  y: number,
  len: number,
  a: number,
  wid: number,
  k: Mat,
  vein?: string
) {
  const c = Math.cos(a),
    sn = Math.sin(a),
    nx = -sn,
    ny = c,
    pts = []
  for (let i = 0; i <= 8; i++) {
    const q = i / 8,
      w = Math.sin(q * Math.PI) * wid * (q < 0.5 ? 1 : 1 - (q - 0.5) * 0.4)
    pts.push([x + c * len * q + nx * w, y + sn * len * q + ny * w])
  }
  for (let i = 7; i >= 1; i--) {
    const q = i / 8,
      w = Math.sin(q * Math.PI) * wid * (q < 0.5 ? 1 : 1 - (q - 0.5) * 0.4)
    pts.push([x + c * len * q - nx * w, y + sn * len * q - ny * w])
  }
  s.P(pts, k)
  if (vein)
    s.line(
      [
        [x + c, y + sn],
        [x + c * len * 0.8, y + sn * len * 0.8],
      ],
      vein
    )
}

export const flower = (s: Spr, x: number, y: number) =>
  s
    .d(x - 1, y, '#ff9ac0')
    .d(x + 1, y, '#ff9ac0')
    .d(x, y - 1, '#ffd0e0')
    .d(x, y + 1, '#e06a9a')
    .d(x, y, '#fff27a')

// A small tree: trunk plus a lumpy canopy.
export function grove(s: Spr, x: number, y: number, h: number, r: number, k = 'canopy') {
  s.L(x, y, x, y - h, Math.max(1, r * 0.24), 'bark', Math.max(0.7, r * 0.16))
  s.E(x, y - h - r * 0.35, r, r * 0.78, k)
  s.E(x - r * 0.62, y - h + r * 0.15, r * 0.62, r * 0.5, k)
  s.E(x + r * 0.62, y - h + r * 0.2, r * 0.62, r * 0.5, k)
  s.d(x - r * 0.4, y - h - r * 0.7, '#d8ff9a').d(x - r * 0.2, y - h - r * 0.8, '#d8ff9a')
}

// The fire line's lizards share one body; o picks its materials and extras.
export interface IGeckoOpts {
  body: Mat
  far: Mat
  belly: Mat
  spike: Mat
  tailFire?: boolean
  headDy?: number
  spikeH?: number
  eye?: EyeKind
}

export function gecko(s: Spr, o: IGeckoOpts, P: IPose) {
  const B = o.body,
    F = o.far,
    [bx, by] = P.body,
    hx = P.head[0] + bx,
    hy = P.head[1] + by + (o.headDy || 0),
    t = P.tail
  s.L(5 + bx, 27 + by - t, 9 + bx, 33 + by, 1.2, B, 2)
  s.L(9 + bx, 33 + by, 15 + bx, 35 + by, 2, B, 3)
  s.E(14 + P.bf[0], 40 + P.bf[1], 2.2, 3.5, F)
  s.E(30 + P.ff[0], 40 + P.ff[1], 2, 3.5, F)
  s.E(21 + bx, 34 + by, 9, 5.5, B)
  s.E(22 + bx, 37 + by, 7, 2.5, o.belly)
  s.E(17 + P.bl[0], 40 + P.bl[1], 2.6, 3.6, B)
  s.E(18 + P.bl[0], 43 + P.bl[1], 3, 1.2, B)
  s.E(27 + P.fl[0], 40 + P.fl[1], 2.4, 3.6, B)
  s.E(28 + P.fl[0], 43 + P.fl[1], 3, 1.2, B)
  s.E(31 + (hx + bx) / 2, 30 + (hy + by) / 2, 5, 4.5, B)
  s.E(34 + hx, 27 + hy, 6.5, 5.5, B)
  s.E(39 + hx, 29 + hy, 4, 3.2, B)
  s.E(36 + hx, 31.5 + hy + P.jaw * 1.8, 4.5, 1.6, o.belly)
  if (P.jaw > 0.5)
    s.line(
      [
        [36 + hx, 31 + hy],
        [41 + hx, 31 + hy],
      ],
      '#5a0a06'
    )
  for (const [x, y] of [
    [15, 29],
    [19, 28.5],
    [23, 28.5],
    [28, 26],
  ])
    s.spike(x + bx, y + 1 + by, o.spikeH || 3.5, 1.6, o.spike)
  if (o.tailFire) {
    s.P(
      [
        [2, 27],
        [4, 20],
        [6, 24],
        [7, 18],
        [9, 26],
        [7, 29],
        [4, 29],
      ].map(([x, y]) => [x + bx, y + by - t]),
      'fire'
    )
    s.E(5 + bx, 26 + by - t, 1.6, 2, 'core')
  }
  s.eye(35 + hx, 25 + hy, o.eye || 'cute').d(41 + hx, 28 + hy, '#2a0806')
  if (P.jaw <= 0.5) s.d(38 + hx, 31 + hy, '#2a0806').d(39 + hx, 31 + hy, '#2a0806')
  s.d(19 + P.bl[0], 44 + P.bl[1], '#f4ede0').d(29 + P.fl[0], 44 + P.fl[1], '#f4ede0')
  if (P.glow) glowMouth(s, 43 + hx, 30 + hy + P.jaw)
}
