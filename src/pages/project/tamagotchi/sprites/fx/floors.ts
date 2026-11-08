// Arena floors in pixel art, after the prototype's themes (js/core.js THEMES / buildFloor): a stone
// tile floor in the theme's colours, a back wall with rocks and crystals, a glowing rim, cracks,
// glowing pools and rubble. The prototype's arena was a perspective trapezoid three screens wide;
// the game's arena is one flat box, so this draws the same parts on a w x h rectangle.

export type FloorTheme =
  | 'cave'
  | 'lava'
  | 'crypt'
  | 'eclipse'
  | 'temple'
  | 'storm'
  | 'canyon'
  | 'forest'

interface ITheme {
  rim: [number, number, number]
  rimDeep: [number, number, number]
  stone: [number, number, number]
  wall: [number, number, number]
  crystal: [string, string, string]
  seed: number
}

export const THEMES: Record<FloorTheme, ITheme> = {
  cave: {
    rim: [57, 198, 255],
    rimDeep: [10, 60, 96],
    stone: [58, 54, 80],
    wall: [22, 19, 34],
    crystal: ['#7ee7ff', '#39c6ff', '#1a6fa0'],
    seed: 7,
  },
  lava: {
    rim: [255, 122, 26],
    rimDeep: [110, 26, 8],
    stone: [62, 46, 46],
    wall: [26, 14, 14],
    crystal: ['#ffd04a', '#ff7a1a', '#a3260f'],
    seed: 99,
  },
  crypt: {
    rim: [150, 140, 210],
    rimDeep: [30, 26, 50],
    stone: [44, 44, 58],
    wall: [12, 12, 18],
    crystal: ['#d4ccec', '#8c82a8', '#b04aff'],
    seed: 53,
  },
  eclipse: {
    rim: [160, 74, 232],
    rimDeep: [40, 16, 70],
    stone: [46, 40, 64],
    wall: [14, 10, 24],
    crystal: ['#e4b8ff', '#a04ae8', '#ffb02a'],
    seed: 97,
  },
  temple: {
    rim: [255, 216, 120],
    rimDeep: [90, 70, 30],
    stone: [88, 80, 70],
    wall: [30, 26, 22],
    crystal: ['#ffffff', '#ffe88a', '#c89a20'],
    seed: 83,
  },
  storm: {
    rim: [255, 225, 74],
    rimDeep: [40, 44, 90],
    stone: [52, 56, 78],
    wall: [16, 18, 32],
    crystal: ['#fffac0', '#ffe14a', '#3a72d4'],
    seed: 61,
  },
  canyon: {
    rim: [255, 176, 80],
    rimDeep: [86, 52, 20],
    stone: [78, 66, 52],
    wall: [30, 22, 16],
    crystal: ['#ffe4a0', '#ffa02a', '#a85a10'],
    seed: 23,
  },
  forest: {
    rim: [110, 230, 90],
    rimDeep: [14, 60, 20],
    stone: [50, 60, 44],
    wall: [16, 24, 16],
    crystal: ['#d8ff8a', '#5ad35a', '#1e6a2a'],
    seed: 41,
  },
}

// A boss fight takes its element's arena (the prototype's choice); everything else is the cave.
// Water has no theme of its own in the prototype, so a water boss fights in the blue cave.
const LINE_THEME: Record<string, FloorTheme> = {
  flame: 'lava',
  leaf: 'forest',
  earth: 'canyon',
  lightning: 'storm',
  holy: 'temple',
  dark: 'eclipse',
  shadow: 'crypt',
}
export const floorThemeOf = (bossLine: string | null | undefined): FloorTheme =>
  (bossLine && LINE_THEME[bossLine]) || 'cave'

export const hash = (x: number, y: number) => {
  let h = x * 374761393 + y * 668265263
  h = (h ^ (h >> 13)) * 1274126177
  return ((h ^ (h >> 16)) >>> 0) / 4294967295
}

// Rim thickness and the back wall's height, in floor pixels.
const RIM = 6
const WALL = 20

// The floor's pixels (RGBA), without canvas, so tests can check them.
export function floorPixels(theme: FloorTheme, w: number, h: number) {
  const T = THEMES[theme]
  const D = new Uint8ClampedArray(w * h * 4)
  const put = (x: number, y: number, r: number, g: number, b: number) => {
    const i = (y * w + x) * 4
    D[i] = r
    D[i + 1] = g
    D[i + 2] = b
    D[i + 3] = 255
  }
  const rows = 14
  const cols = 22
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const edge = Math.min(x, w - 1 - x, h - 1 - y)
      if (y < WALL) {
        // the back wall, darker at the top
        const k = y / WALL
        const n = hash(x >> 2, y >> 2) * 10 + hash(x, y) * 5
        const f = 0.65 + k * 0.55
        put(x, y, T.wall[0] * f + n, T.wall[1] * f + n, T.wall[2] * f + n * 1.2)
        continue
      }
      if (edge < RIM) {
        const glow = edge < 2 ? 0.9 : 0.25 + 0.3 * hash(x >> 1, y)
        put(
          x,
          y,
          T.rimDeep[0] + (T.rim[0] - T.rimDeep[0]) * glow,
          T.rimDeep[1] + (T.rim[1] - T.rimDeep[1]) * glow,
          T.rimDeep[2] + (T.rim[2] - T.rimDeep[2]) * glow
        )
        continue
      }
      // stone tiles, a little larger towards the front
      const v = (y - WALL) / (h - WALL)
      const row = Math.floor(Math.pow(v, 0.82) * rows)
      const rowPrev = Math.floor(Math.pow(Math.max(0, (y - 1 - WALL) / (h - WALL)), 0.82) * rows)
      const col = Math.floor((x / w) * cols)
      const colPrev = Math.floor(((x - 1) / w) * cols)
      const tile = hash(row, col) * 14 - 7
      const n = hash(x, y) * 8 - 4 + hash(x >> 2, y >> 2) * 6
      const f = row !== rowPrev || col !== colPrev ? 0.8 : 1 + v * 0.18
      put(
        x,
        y,
        (T.stone[0] + tile + n) * f,
        (T.stone[1] + tile + n) * f,
        (T.stone[2] + tile + n) * f
      )
    }
  return D
}

// The finished floor: pixels plus cracks, rocks and crystals on the wall, pools and rubble.
export function buildThemeFloor(theme: FloorTheme, w: number, h: number): HTMLCanvasElement {
  const T = THEMES[theme]
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const c = cv.getContext('2d')
  if (!c) return cv
  const img = c.createImageData(w, h)
  img.data.set(floorPixels(theme, w, h))
  c.putImageData(img, 0, 0)
  let seed = T.seed
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const inside = (x: number, y: number) =>
    y > WALL + 2 && y < h - RIM - 2 && x > RIM + 2 && x < w - RIM - 2
  // cracks
  for (let k = 0; k < 60; k++) {
    let x = RIM + rnd() * (w - 2 * RIM)
    let y = WALL + 6 + rnd() * (h - WALL - 12)
    let a = rnd() * Math.PI * 2
    for (let s = 0; s < 18 + rnd() * 22; s++) {
      a += (rnd() - 0.5) * 1.1
      x += Math.cos(a)
      y += Math.sin(a) * 0.6
      if (!inside(x, y)) break
      c.fillStyle = theme === 'lava' && s % 5 === 0 ? 'rgba(255,110,30,.55)' : 'rgba(0,0,0,.45)'
      c.fillRect(Math.round(x), Math.round(y), 1, 1)
      c.fillStyle = 'rgba(255,255,255,.06)'
      c.fillRect(Math.round(x), Math.round(y) + 1, 1, 1)
    }
  }
  // rocks along the back wall
  for (let k = 0; k < 40; k++) {
    const x = rnd() * w
    const rh = 6 + rnd() * 12
    const rw = 4 + rnd() * 9
    c.fillStyle = `rgb(${T.wall[0] + 14},${T.wall[1] + 12},${T.wall[2] + 18})`
    c.beginPath()
    c.moveTo(x - rw, WALL)
    c.lineTo(x - rw * 0.4, WALL - rh)
    c.lineTo(x + rw * 0.3, WALL - rh * 0.8)
    c.lineTo(x + rw, WALL)
    c.fill()
  }
  const crystal = (x: number, y: number, s: number) => {
    const [a, b, d] = T.crystal
    for (const [dx, hh, ww, col] of [
      [-4 * s, 10 * s, 2.5 * s, d],
      [0, 16 * s, 3 * s, b],
      [4 * s, 11 * s, 2.5 * s, b],
      [1 * s, 9 * s, 1.2 * s, a],
    ] as const) {
      c.fillStyle = col
      c.beginPath()
      c.moveTo(x + dx - ww, y)
      c.lineTo(x + dx, y - hh)
      c.lineTo(x + dx + ww, y)
      c.fill()
    }
  }
  // glowing pools and rubble on the floor
  const [pr, pg, pb] = T.rim
  for (let k = 0; k < 6; k++) {
    const y = WALL + 30 + rnd() * (h - WALL - 60)
    const x = RIM + 30 + rnd() * (w - 2 * RIM - 60)
    const rx = 8 + rnd() * 14
    c.fillStyle = `rgba(${pr},${pg},${pb},.16)`
    c.beginPath()
    c.ellipse(x, y, rx + 3, rx * 0.38 + 2, 0, 0, 7)
    c.fill()
    c.fillStyle = `rgba(${pr},${pg},${pb},.28)`
    c.beginPath()
    c.ellipse(x, y, rx, rx * 0.38, 0, 0, 7)
    c.fill()
    c.fillStyle = 'rgba(255,255,255,.3)'
    c.fillRect(Math.round(x - rx * 0.4), Math.round(y - rx * 0.15), Math.round(rx * 0.5), 1)
  }
  for (let k = 0; k < 40; k++) {
    const y = WALL + 8 + rnd() * (h - WALL - 16)
    const x = RIM + 8 + rnd() * (w - 2 * RIM - 16)
    const r = 1 + rnd() * 2.5
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
  // crystals on the wall and in the corners
  for (let x = 16; x < w; x += 34 + rnd() * 40) crystal(x, WALL - 1 + rnd() * 3, 0.6 + rnd() * 0.5)
  for (const [x, y] of [
    [RIM + 6, h - RIM - 2],
    [w - RIM - 6, h - RIM - 2],
  ])
    crystal(x, y, 0.9)
  return cv
}
