// Endless mode: builds a level definition for any depth past the hand-made
// levels. Each picture is a symmetric "mine creature" standing on the ground
// under a sky, drawn from random noise smoothed into a blob, then shaded. The
// mechanics ramp up with depth. Everything is derived from the level number,
// so the same depth always gives the same level.

import { mulberry32 } from './generator'
import type { LevelDef } from './levels'
import type { Mode } from './modes'

const NAMES = [
  'ภูตหิน',
  'อสูรอัญมณี',
  'เจ้าก้อนกลม',
  'ผีเสื้อเหมือง',
  'หุ่นยนต์โบราณ',
  'ราชาตะเกียง',
  'มังกรคริสตัล',
  'ปูยักษ์',
  'นกเหล็ก',
  'เห็ดเรืองแสง',
  'แมงมุมทอง',
  'ปีศาจน้อย',
]

function hsl(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
  const hex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${hex(f(0))}${hex(f(8))}${hex(f(4))}`
}

function rgbDistance(a: string, b: string): number {
  const p = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
  const [x, y] = [p(a), p(b)]
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2])
}

/**
 * Creature silhouette of size w x h: drawn at half resolution and scaled up 2x
 * so it comes out chunky, which reads better as pixel art. Retries for a shape
 * that fills a fair share of its box.
 */
function creature(w: number, h: number, rng: () => number): boolean[][] {
  const sw = Math.ceil(w / 2)
  const sh = Math.ceil(h / 2)
  let best: boolean[][] = []
  let bestFill = -1
  for (let i = 0; i < 20 && bestFill < 0.5; i++) {
    const small = creatureMask(sw, sh, rng)
    const fill = small.flat().filter(Boolean).length / (sw * sh)
    if (fill > bestFill) {
      bestFill = fill
      best = small
    }
  }
  return Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      // Mirror the scaled-up half so odd widths stay symmetric.
      const mx = x < w / 2 ? x : w - 1 - x
      return best[Math.floor(y / 2)][Math.floor(mx / 2)]
    })
  )
}

/** Symmetric blob: random half, smoothed a few rounds, mirrored, largest piece kept. */
function creatureMask(w: number, h: number, rng: () => number): boolean[][] {
  const half = Math.ceil(w / 2)
  let g = Array.from({ length: h }, (_, y) =>
    Array.from({ length: half }, (_, x) => {
      // Denser toward the middle so the creature holds together.
      const centre = 1 - Math.abs(y / (h - 1) - 0.5) - (half - 1 - x) / half / 2
      return rng() < 0.35 + centre * 0.35
    })
  )
  const at = (m: boolean[][], x: number, y: number) => {
    if (y < 0 || y >= h || x < 0) return false
    return m[y][x >= half ? 2 * half - 1 - x : x]
  }
  for (let round = 0; round < 3; round++) {
    g = g.map((row, y) =>
      row.map((alive, x) => {
        let n = 0
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && at(g, x + dx, y + dy)) n++
        return alive ? n >= 4 : n >= 5
      })
    )
  }
  const full = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => g[y][x < half ? x : w - 1 - x])
  )
  // Keep only the largest connected piece.
  const seen = full.map((r) => r.map(() => false))
  let best: [number, number][] = []
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!full[y][x] || seen[y][x]) continue
      const piece: [number, number][] = []
      const stack: [number, number][] = [[x, y]]
      seen[y][x] = true
      while (stack.length) {
        const [cx, cy] = stack.pop()!
        piece.push([cx, cy])
        for (const [nx, ny] of [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1],
        ]) {
          if (nx >= 0 && ny >= 0 && nx < w && ny < h && full[ny][nx] && !seen[ny][nx]) {
            seen[ny][nx] = true
            stack.push([nx, ny])
          }
        }
      }
      if (piece.length > best.length) best = piece
    }
  const out = full.map((r) => r.map(() => false))
  for (const [x, y] of best) out[y][x] = true
  return out
}

// Bump when the picture or mechanics recipe changes, so saved endless levels are rebuilt.
export const PROCGEN_VERSION = 2

/** First endless depth; levels before it are hand-made. */
export const ENDLESS_FROM = 17

/**
 * Level for depth `n` (1-based, n >= ENDLESS_FROM). `variant` gives another
 * take on the same depth, used when a generated level turns out unwinnable.
 */
export function makeLevel(n: number, variant = 0, mode: Mode = 'easy'): LevelDef {
  const rng = mulberry32(n * 9973 + variant * 31337 + 7)
  const depth = n - ENDLESS_FROM // 0, 1, 2, ...
  const pick = <T>(xs: T[]) => xs[Math.floor(rng() * xs.length)]
  const randInt = (lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1))

  // Harder modes get bigger pictures, for room to fit more of everything.
  const grow = mode === 'hard' ? 4 : mode === 'medium' ? 2 : 0
  const W = Math.min(20 + grow, 14 + grow + Math.floor(depth / 3) * 2 + (rng() < 0.5 ? 0 : 2))
  const H = Math.min(22 + grow, W + randInt(-2, 2))
  const horizon = Math.round(H * (0.72 + rng() * 0.1))

  // Colors: two sky bands, two ground tones, five creature tones, one star.
  const skyHue = rng() * 360
  const bodyHue = skyHue + 120 + rng() * 120
  const palette: Record<string, string> = {
    '.': hsl(skyHue, 55, 84),
    s: hsl(skyHue + 15, 50, 68),
    g: hsl(skyHue + 200, 35, 38),
    h: hsl(skyHue + 210, 50, 55),
    o: hsl(bodyHue, 45, 20),
    m: hsl(bodyHue, 65, 52),
    d: hsl(bodyHue + 10, 60, 36),
    l: hsl(bodyHue - 10, 75, 74),
    x: hsl(bodyHue + 180, 80, 55),
    y: hsl(50, 95, 62),
  }
  // Nudge any color that sits too close to an earlier one.
  const keys = Object.keys(palette)
  keys.forEach((k, i) => {
    for (
      let tries = 0;
      tries < 8 && keys.slice(0, i).some((j) => rgbDistance(palette[j], palette[k]) < 55);
      tries++
    ) {
      palette[k] = hsl(skyHue + i * 37 + tries * 23, 60, 30 + ((tries * 17 + i * 11) % 50))
    }
  })

  const grid: string[][] = Array.from({ length: H }, (_, y) =>
    Array.from({ length: W }, () => (y >= horizon ? 'g' : y < horizon / 2 ? '.' : 's'))
  )
  // Grass along the horizon.
  for (let x = 0; x < W; x++) if (rng() < 0.7) grid[horizon][x] = 'h'

  // The creature, standing on the ground.
  const legLen = randInt(0, 2)
  const raw = creature(
    Math.max(10, Math.round(W * (0.7 + rng() * 0.2))),
    Math.max(10, Math.round((horizon - legLen) * (0.75 + rng() * 0.15))),
    rng
  )
  // Crop to the shape itself so it can be centred and stood on the ground.
  const rows = raw.map((r, y) => (r.some(Boolean) ? y : -1)).filter((y) => y >= 0)
  const cols = raw[0].map((_, x) => (raw.some((r) => r[x]) ? x : -1)).filter((x) => x >= 0)
  const mask = raw
    .slice(rows[0], rows[rows.length - 1] + 1)
    .map((r) => r.slice(cols[0], cols[cols.length - 1] + 1))
  const cw = mask[0].length
  const ch = mask.length
  const ox = Math.floor((W - cw) / 2)
  const oy = Math.max(1, horizon - legLen - ch)
  // Legs down to the grass.
  for (let k = 0; k < legLen; k++) {
    const lx = ox + Math.floor(cw * 0.28)
    for (const x of [lx, W - 1 - lx]) grid[oy + ch + k][x] = 'd'
  }
  // Horns or ears on top, arms on the sides.
  const topRow = mask[0].map((v, x) => (v ? x : -1)).filter((x) => x >= 0)
  if (rng() < 0.6 && oy >= 2 && topRow.length >= 3) {
    const hx = ox + topRow[0]
    for (let k = 1; k <= randInt(1, 2); k++) for (const x of [hx, W - 1 - hx]) grid[oy - k][x] = 'x'
  }
  if (rng() < 0.5) {
    const ay = oy + Math.floor(ch * 0.55)
    for (let k = 1; k <= 2; k++)
      for (const x of [ox - k, ox + cw - 1 + k]) if (x >= 0 && x < W) grid[ay][x] = 'd'
  }
  const inBody = (x: number, y: number) => y >= 0 && y < ch && x >= 0 && x < cw && mask[y][x]
  const interior: [number, number][] = []
  for (let y = 0; y < ch; y++)
    for (let x = 0; x < cw; x++) {
      if (!mask[y][x]) continue
      const edge = !inBody(x + 1, y) || !inBody(x - 1, y) || !inBody(x, y + 1) || !inBody(x, y - 1)
      const t = y / ch
      const tone = edge ? 'o' : t < 0.3 ? 'l' : t > 0.72 ? 'd' : 'm'
      if (oy + y < H) grid[oy + y][ox + x] = tone
      if (!edge && oy + y < H) interior.push([ox + x, oy + y])
    }
  // Eyes: a mirrored pair of accent spots in the upper body.
  const upper = interior.filter(([x, y]) => y < oy + ch * 0.45 && x < W / 2 - 1)
  if (upper.length) {
    const [ex, ey] = pick(upper)
    grid[ey][ex] = 'x'
    grid[ey][W - 1 - ex] = 'x'
  }
  // Stars in the sky.
  for (let i = 0; i < 3 + randInt(0, 3); i++) {
    const x = randInt(0, W - 1)
    const y = randInt(0, Math.max(0, oy - 2))
    if (grid[y][x] === '.' || grid[y][x] === 's') grid[y][x] = 'y'
  }

  // ---- Mechanics, ramping with depth ----
  const rocks = rng() < 0.4
  if (rocks) {
    for (let i = 0; i < randInt(2, 4); i++) grid[H - 1][randInt(0, W - 1)] = '#'
    if (rng() < 0.5) for (let y = horizon + 1; y < H; y++) grid[y][0] = grid[y][W - 1] = '#'
  }
  const art = grid.map((r) => r.join(''))

  // A locked core inside the creature, opened by mining sky.
  let lockMap: string[] | undefined
  let locks: LevelDef['locks']
  const core = interior.filter(([x, y]) =>
    [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
      [x + 2, y],
      [x - 2, y],
      [x, y + 2],
      [x, y - 2],
    ].every(([a, b]) => grid[b]?.[a] && !'.sghy#'.includes(grid[b][a]))
  )
  const skyCount = art
    .join('')
    .split('')
    .filter((c) => c === '.').length
  if (core.length >= 4 && rng() < 0.6 && skyCount > 10) {
    const lm = Array.from({ length: H }, () => Array(W).fill('.'))
    for (const [x, y] of core) lm[y][x] = 'A'
    lockMap = lm.map((r) => r.join(''))
    locks = { A: { key: '.', need: Math.max(4, Math.floor(skyCount * (0.3 + rng() * 0.3))) } }
  }

  // Only keep colors that are actually in the picture.
  const used = new Set(art.join(''))
  for (const k of Object.keys(palette)) if (!used.has(k)) delete palette[k]

  return {
    name: pick(NAMES),
    palette,
    art,
    lockMap,
    locks,
    columns: W >= 18 ? 5 : 4,
    cart: [8, Math.min(20, 14 + Math.floor(depth / 2))],
    shuffle: 16 + Math.min(8, depth),
    links: Math.min(6, 3 + Math.floor(depth / 3)),
    mystery: Math.min(0.5, 0.35 + depth * 0.01),
    frozen: Math.min(5, 2 + Math.floor(depth / 3)),
    armored: rng() < 0.45 ? 'o' : undefined,
    dark: depth % 3 === 2,
    greedy: Math.max(0.2, 0.4 - depth * 0.01),
  }
}
