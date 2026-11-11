import { FOOT, IPieceState, PieceKind } from './farm-room-layout'
import { ROOM_H, ROOM_W } from './farm-room-sim'

// The Farm room's pixel art (prototype: docs/tamagotchi/prototypes/farm-room). Every shape is a
// filled rectangle on the room grid: a 1 px dark outline, light from the top-left (hi on the top and
// left edges, lo on the bottom and right), one warm palette in light and dark mode. Each piece has one
// draw function and the tier adds parts: tier 1 is the plain piece, tier 3 the grandest.

type Ctx = CanvasRenderingContext2D
interface IMat {
  c: string
  hi: string
  lo: string
}

const OL = '#2a1a10'
const mat = (c: string, hi: string, lo: string): IMat => ({ c, hi, lo })
const WOOD = mat('#8a5a33', '#b07a4a', '#5e3a1c')
const OAK = mat('#a8744a', '#c99468', '#774c28')
const BLUE = mat('#4d86b8', '#7fb0dc', '#2f5f8c')
const NAVY = mat('#3d6fa3', '#6fa2d6', '#264d78')
const GOLD = mat('#d9a21b', '#f6d56a', '#9c6a0a')
const CREAM = mat('#f1e8d2', '#fffaf0', '#c9bb9a')
const GREEN = mat('#7fb069', '#a3d18c', '#3e6b2e')
const WINE = mat('#7b3148', '#a3516c', '#4d1c2d')
const STONE = mat('#a9a9a0', '#cfcfc6', '#74746c')
const PORCELAIN = mat('#f4f4f0', '#ffffff', '#c4c4bc')
const CLAY = mat('#b4531e', '#e07a3f', '#7a3410')
const DARK = mat('#4a4a52', '#71717c', '#2a2a30')
const CURTAIN = mat('#b8484f', '#d9707a', '#7d2a30')
const PURPLE = mat('#8a3a9a', '#b25fc4', '#5a2266')

const rect = (ctx: Ctx, x: number, y: number, w: number, h: number, color: string) => {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

const box = (ctx: Ctx, x: number, y: number, w: number, h: number, m: IMat) => {
  rect(ctx, x, y, w, h, OL)
  rect(ctx, x + 1, y + 1, w - 2, h - 2, m.c)
  rect(ctx, x + 1, y + 1, w - 2, 1, m.hi)
  rect(ctx, x + 1, y + 1, 1, h - 2, m.hi)
  rect(ctx, x + 1, y + h - 2, w - 2, 1, m.lo)
  rect(ctx, x + w - 2, y + 1, 1, h - 2, m.lo)
}

const foodBowl = (ctx: Ctx, x: number, y: number, m: IMat) => {
  box(ctx, x, y, 34, 14, m)
  rect(ctx, x + 3, y + 3, 28, 8, '#c98a3a')
  rect(ctx, x + 5, y + 4, 24, 3, '#e8c45a')
}

// Origin (0, 0) is the footprint's top-left corner; parts may reach above it.
const PIECES: Record<PieceKind, (ctx: Ctx, tier: number) => void> = {
  bed: (ctx, tier) => {
    if (tier <= 1) {
      box(ctx, 0, 8, 92, 46, WOOD)
      box(ctx, 4, 12, 84, 30, CREAM)
      box(ctx, 7, 16, 24, 16, PORCELAIN)
      box(ctx, 34, 16, 54, 26, BLUE)
      rect(ctx, 35, 17, 52, 4, BLUE.hi)
      box(ctx, 0, 42, 92, 12, OAK)
    } else if (tier === 2) {
      box(ctx, 0, 0, 10, 54, OAK)
      box(ctx, 8, 10, 84, 44, NAVY)
      box(ctx, 12, 14, 76, 28, CREAM)
      box(ctx, 14, 17, 20, 11, PORCELAIN)
      box(ctx, 14, 29, 20, 11, PORCELAIN)
      box(ctx, 38, 16, 50, 26, BLUE)
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) rect(ctx, 40 + i * 12, 18 + j * 8, 6, 4, BLUE.hi)
      }
      box(ctx, 8, 42, 84, 12, NAVY)
    } else {
      box(ctx, 6, 14, 80, 40, WINE)
      box(ctx, 10, 18, 72, 26, CREAM)
      box(ctx, 12, 20, 20, 11, PORCELAIN)
      box(ctx, 12, 32, 20, 11, PORCELAIN)
      box(ctx, 36, 20, 46, 22, PURPLE)
      rect(ctx, 37, 29, 44, 2, GOLD.c)
      rect(ctx, 55, 24, 4, 4, GOLD.hi)
      box(ctx, 6, 42, 80, 12, GOLD)
      rect(ctx, 44, 46, 4, 4, '#ff6b8a')
      rect(ctx, 6, 6, 12, 24, '#a8324a')
      rect(ctx, 8, 6, 3, 24, '#c4506a')
      rect(ctx, 74, 6, 12, 24, '#a8324a')
      rect(ctx, 76, 6, 3, 24, '#c4506a')
      box(ctx, 0, 0, 6, 54, GOLD)
      box(ctx, 86, 0, 6, 54, GOLD)
      box(ctx, 0, 0, 92, 6, GOLD)
      rect(ctx, 2, -3, 2, 2, '#fff6c0')
      rect(ctx, 88, -3, 2, 2, '#fff6c0')
    }
  },
  table: (ctx, tier) => {
    if (tier <= 1) {
      box(ctx, 0, 30, 108, 14, WOOD)
      box(ctx, 4, 44, 8, 8, WOOD)
      box(ctx, 96, 44, 8, 8, WOOD)
      box(ctx, 0, 0, 108, 32, OAK)
      foodBowl(ctx, 14, 12, CLAY)
      foodBowl(ctx, 58, 12, CLAY)
    } else if (tier === 2) {
      box(ctx, 4, 44, 8, 8, WOOD)
      box(ctx, 96, 44, 8, 8, WOOD)
      box(ctx, 0, 28, 108, 18, NAVY)
      for (let x = 0; x < 108; x += 12) rect(ctx, x + 1, 43, 10, 3, BLUE.hi)
      box(ctx, 0, 0, 108, 32, BLUE)
      foodBowl(ctx, 14, 12, CREAM)
      foodBowl(ctx, 58, 12, CREAM)
      box(ctx, 96, 8, 8, 8, mat('#c0392b', '#e8604f', '#7d1f16'))
      box(ctx, 88, 12, 8, 8, mat('#e3b23c', '#f6d56a', '#9c6a0a'))
    } else {
      box(ctx, 4, 44, 8, 8, GOLD)
      box(ctx, 96, 44, 8, 8, GOLD)
      box(ctx, 0, 28, 108, 18, CREAM)
      rect(ctx, 1, 41, 106, 4, GOLD.c)
      rect(ctx, 1, 41, 106, 1, GOLD.hi)
      box(ctx, 0, 0, 108, 32, CREAM)
      rect(ctx, 3, 3, 102, 1, GOLD.c)
      rect(ctx, 3, 28, 102, 1, GOLD.c)
      rect(ctx, 3, 3, 1, 26, GOLD.c)
      rect(ctx, 104, 3, 1, 26, GOLD.c)
      foodBowl(ctx, 14, 12, GOLD)
      foodBowl(ctx, 58, 12, GOLD)
      rect(ctx, 50, 20, 8, 3, GOLD.c)
      rect(ctx, 53, 8, 3, 12, '#fffaf0')
      rect(ctx, 53, 4, 3, 4, '#ffb43a')
      rect(ctx, 54, 5, 1, 2, '#fff2a0')
    }
  },
  gym: (ctx, tier) => {
    const m = tier <= 1 ? GREEN : tier === 2 ? BLUE : GOLD
    box(ctx, 0, 8, 80, 32, m)
    rect(ctx, 16, 22, 48, 2, m.lo)
    if (tier === 2) {
      for (const x of [8, 48]) {
        rect(ctx, x + 4, 18, 20, 3, '#9aa0a8')
        box(ctx, x, 13, 6, 12, DARK)
        box(ctx, x + 22, 13, 6, 12, DARK)
      }
    }
    if (tier >= 3) {
      box(ctx, 3, 11, 74, 26, GREEN)
      rect(ctx, 16, 22, 48, 2, GREEN.lo)
      box(ctx, 4, -26, 5, 38, DARK)
      box(ctx, 71, -26, 5, 38, DARK)
      rect(ctx, 4, -23, 72, 3, '#cfd6dc')
      rect(ctx, 4, -23, 72, 1, '#ffffff')
      rect(ctx, 38, -20, 2, 9, '#555555')
      box(ctx, 31, -11, 16, 24, mat('#b23a3a', '#d96363', '#7a2020'))
      rect(ctx, 31, -3, 16, 2, '#7a2020')
    }
  },
  toilet: (ctx, tier) => {
    const body = tier <= 1 ? STONE : tier === 2 ? PORCELAIN : CREAM
    box(ctx, 4, 0, 44, 14, body)
    box(ctx, 0, 14, 52, 28, body)
    const seat = tier <= 1 ? mat('#e8e8e0', '#ffffff', '#b6b6ae') : tier === 2 ? BLUE : GOLD
    box(ctx, 6, 18, 40, 18, seat)
    rect(ctx, 12, 22, 28, 10, tier <= 1 ? '#7aa3b8' : '#9fd3e8')
    rect(ctx, 14, 23, 8, 2, '#ffffff')
    if (tier >= 2) rect(ctx, 5, 10, 42, 2, tier === 2 ? BLUE.c : GOLD.c)
    if (tier === 2) {
      rect(ctx, 36, -5, 8, 5, CLAY.c)
      rect(ctx, 36, -5, 8, 1, CLAY.hi)
      rect(ctx, 37, -10, 2, 5, GREEN.c)
      rect(ctx, 41, -9, 2, 4, GREEN.hi)
    }
    if (tier >= 3) {
      box(ctx, 14, -8, 24, 10, GOLD)
      rect(ctx, 24, -5, 4, 4, '#ff6b8a')
      rect(ctx, 1, 15, 50, 2, GOLD.c)
      rect(ctx, 30, 24, 2, 2, '#ffffff')
    }
  },
}

const badge = (
  ctx: Ctx,
  cx: number,
  cy: number,
  color: string,
  glyph: 'plus' | 'hammer' | 'check'
) => {
  rect(ctx, cx - 8, cy - 8, 16, 16, OL)
  rect(ctx, cx - 7, cy - 7, 14, 14, color)
  rect(ctx, cx - 7, cy - 7, 14, 1, 'rgba(255,255,255,.45)')
  if (glyph === 'plus') {
    rect(ctx, cx - 4, cy - 1, 9, 2, '#ffffff')
    rect(ctx, cx - 1, cy - 4, 2, 9, '#ffffff')
  } else if (glyph === 'hammer') {
    rect(ctx, cx - 4, cy - 5, 8, 4, '#e6ebf0')
    rect(ctx, cx - 1, cy - 1, 3, 7, '#8a5a33')
  } else {
    for (const [dx, dy] of [
      [-4, 0],
      [-2, 2],
      [0, 0],
      [2, -2],
      [4, -4],
    ]) {
      rect(ctx, cx + dx - 1, cy + dy, 2, 2, '#ffffff')
    }
  }
}

const pill = (ctx: Ctx, cx: number, y: number, text: string) => {
  ctx.font = '600 8px Prompt, system-ui, sans-serif'
  ctx.textAlign = 'center'
  const w = Math.ceil(ctx.measureText(text).width) + 8
  rect(ctx, cx - w / 2 - 1, y, w + 2, 13, OL)
  rect(ctx, cx - w / 2, y + 1, w, 11, '#fbf5e9')
  ctx.fillStyle = '#2a1a10'
  ctx.fillText(text, cx, y + 9)
}

// The tier 1 piece as a flat blue-grey silhouette: what an unowned spot looks like. Cached per kind.
const ghosts = new Map<PieceKind, { canvas: HTMLCanvasElement; pad: number }>()
const ghostOf = (kind: PieceKind) => {
  const cached = ghosts.get(kind)
  if (cached) return cached
  const [, , w, h] = FOOT[kind]
  const pad = 40
  const canvas = document.createElement('canvas')
  canvas.width = w + pad * 2
  canvas.height = h + pad + 20
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.translate(pad, pad)
  PIECES[kind](ctx, 1)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const px = image.data
  for (let i = 0; i < px.length; i += 4) {
    if (!px[i + 3]) continue
    const outline = px[i] + px[i + 1] + px[i + 2] < 220
    px[i] = outline ? 96 : 176
    px[i + 1] = outline ? 124 : 198
    px[i + 2] = outline ? 150 : 220
    px[i + 3] = outline ? 190 : 120
  }
  ctx.putImageData(image, 0, 0)
  const ghost = { canvas, pad }
  ghosts.set(kind, ghost)
  return ghost
}

export const drawPiece = (ctx: Ctx, kind: PieceKind, state: IPieceState) => {
  const [x, y, w, h] = FOOT[kind]
  ctx.save()
  ctx.translate(x, y)
  rect(ctx, 3, h - 1, w - 4, 4, 'rgba(40,20,5,.24)')
  if (!state.tier) {
    const ghost = ghostOf(kind)
    if (ghost) ctx.drawImage(ghost.canvas, -ghost.pad, -ghost.pad)
    badge(ctx, w / 2, h / 2, '#3d9a4a', 'plus')
  } else {
    PIECES[kind](ctx, state.tier)
    if (state.status === 'building') {
      for (let i = 0; i < w - 2; i += 8) {
        rect(ctx, 1 + i, h - 4, Math.min(4, w - 2 - i), 3, '#f2c230')
        rect(ctx, 5 + i, h - 4, Math.min(4, w - 6 - i), 3, OL)
      }
    }
    if (state.status !== 'idle') {
      badge(
        ctx,
        w - 8,
        4,
        state.status === 'ready' ? '#2f9e44' : '#c98a12',
        state.status === 'ready' ? 'check' : 'hammer'
      )
      pill(ctx, w / 2, -12, state.label)
    }
  }
  ctx.restore()
}

// Wallpaper, wainscot, planked floor with depth shading, rug, window and wall props. `t` (seconds)
// only breathes the window light; pass 0 for a still frame.
export const drawBackdrop = (ctx: Ctx, t: number) => {
  rect(ctx, 0, 0, ROOM_W, 74, '#c9a074')
  for (let x = 0; x < ROOM_W; x += 14) rect(ctx, x, 0, 7, 50, '#c39a6d')
  rect(ctx, 0, 46, ROOM_W, 4, 'rgba(60,30,10,.12)')
  rect(ctx, 0, 50, ROOM_W, 3, '#6b4423')
  rect(ctx, 0, 50, ROOM_W, 1, '#8a5a33')
  rect(ctx, 0, 53, ROOM_W, 17, '#a8744a')
  for (let x = 0; x < ROOM_W; x += 42) {
    rect(ctx, x + 4, 56, 34, 11, '#9a6a3f')
    rect(ctx, x + 4, 56, 34, 1, '#c99468')
    rect(ctx, x + 4, 66, 34, 1, '#6b4423')
  }
  rect(ctx, 0, 70, ROOM_W, 4, '#5e3a1c')
  rect(ctx, 0, 70, ROOM_W, 1, '#8a5a33')
  for (let row = 0, y = 74; y < ROOM_H; row++, y += 16) {
    rect(ctx, 0, y, ROOM_W, 16, row % 2 ? '#d1af7e' : '#d9b98a')
    for (let x = row % 2 ? 30 : 0; x < ROOM_W; x += 60) rect(ctx, x, y, 1, 16, 'rgba(90,55,25,.35)')
    rect(ctx, 0, y + 15, ROOM_W, 1, 'rgba(90,55,25,.3)')
  }
  rect(ctx, 0, 74, ROOM_W, 3, 'rgba(0,0,0,.28)')
  rect(ctx, 0, 77, ROOM_W, 8, 'rgba(60,30,10,.14)')
  rect(ctx, 0, 85, ROOM_W, 10, 'rgba(60,30,10,.06)')
  // rug
  rect(ctx, 110, 130, 190, 56, '#5d2538')
  rect(ctx, 113, 133, 184, 50, '#8a3a52')
  rect(ctx, 119, 139, 172, 38, '#e8d3a0')
  rect(ctx, 123, 143, 164, 30, '#8a3a52')
  for (let x = 134; x < 280; x += 22) {
    rect(ctx, x, 152, 8, 8, '#e8d3a0')
    rect(ctx, x + 2, 154, 4, 4, '#d9a21b')
  }
  for (let x = 112; x < 300; x += 4) {
    rect(ctx, x, 186, 2, 3, '#e8d3a0')
    rect(ctx, x, 127, 2, 3, '#e8d3a0')
  }
  // window light on the floor, breathing a little
  ctx.fillStyle = `rgba(255,244,200,${(0.14 + Math.sin(t * 0.8) * 0.03).toFixed(3)})`
  ctx.beginPath()
  ctx.moveTo(186, 78)
  ctx.lineTo(230, 78)
  ctx.lineTo(296, 168)
  ctx.lineTo(214, 168)
  ctx.fill()
  box(ctx, 180, 12, 56, 42, WOOD)
  rect(ctx, 184, 16, 48, 34, '#bfe4f2')
  rect(ctx, 184, 16, 48, 12, '#9fd3e8')
  rect(ctx, 206, 16, 4, 34, WOOD.c)
  rect(ctx, 184, 31, 48, 3, WOOD.c)
  rect(ctx, 190, 36, 10, 6, 'rgba(255,255,255,.5)')
  rect(ctx, 177, 53, 62, 4, OL)
  rect(ctx, 178, 53, 60, 3, OAK.c)
  box(ctx, 172, 10, 12, 42, CURTAIN)
  box(ctx, 232, 10, 12, 42, CURTAIN)
  // wall props: picture, shelf with a plant, a jar and a book
  box(ctx, 118, 16, 30, 24, WOOD)
  rect(ctx, 121, 19, 24, 18, '#7fa6c4')
  rect(ctx, 121, 30, 24, 7, GREEN.c)
  rect(ctx, 136, 22, 5, 5, '#f6d56a')
  rect(ctx, 256, 40, 62, 4, OL)
  rect(ctx, 257, 40, 60, 3, OAK.c)
  rect(ctx, 262, 30, 10, 10, CLAY.c)
  rect(ctx, 262, 30, 10, 2, CLAY.hi)
  rect(ctx, 264, 24, 6, 6, GREEN.c)
  rect(ctx, 266, 21, 2, 4, GREEN.hi)
  rect(ctx, 282, 32, 8, 8, '#9fd3e8')
  rect(ctx, 284, 30, 4, 2, OL)
  rect(ctx, 298, 34, 14, 6, BLUE.c)
  rect(ctx, 298, 34, 14, 1, BLUE.hi)
}

// The feeding bowl pets use while there is no table.
export const drawFloorBowl = (ctx: Ctx) => {
  box(ctx, 176, 190, 28, 10, CLAY)
  rect(ctx, 179, 192, 22, 4, '#c98a3a')
}
