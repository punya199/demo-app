import { drawBackdrop, drawFloorBowl, drawPiece } from './farm-room-art'
import { DRAW_ORDER, FOOT, PieceKind, PieceStates } from './farm-room-layout'

// Draws the Farm room on its pixel grid (art in farm-room-art.ts): the backdrop, then each piece of
// furniture in its state (ghost, tier 1 to 3, upgrading, ready), then pets and piles on top.

type Ctx = CanvasRenderingContext2D
const rect = (ctx: Ctx, x: number, y: number, w: number, h: number, color: string) => {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

export const drawRoom = (ctx: Ctx, pieces: PieceStates, t = 0) => {
  drawBackdrop(ctx, t)
  if (!pieces.table.tier) drawFloorBowl(ctx)
  for (const kind of DRAW_ORDER) drawPiece(ctx, kind, pieces[kind])
}

// A short burst of gold sparks over a piece whose upgrade was just claimed. `age` is in seconds.
export const SPARKLE_SECONDS = 0.9
export const drawSparkle = (ctx: Ctx, kind: PieceKind, age: number) => {
  if (age < 0 || age > SPARKLE_SECONDS) return
  const [x, y, w, h] = FOOT[kind]
  const progress = age / SPARKLE_SECONDS
  ctx.globalAlpha = 1 - progress
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2
    const reach = (14 + (i % 3) * 8) * progress * 2.2
    const size = i % 2 ? 3 : 2
    rect(
      ctx,
      Math.round(x + w / 2 + Math.cos(angle) * reach * 1.6),
      Math.round(y + h / 2 + Math.sin(angle) * reach),
      size,
      size,
      i % 3 ? '#f6d56a' : '#fffaf0'
    )
  }
  ctx.globalAlpha = 1
}

export const drawPile = (ctx: Ctx, x: number, y: number) => {
  rect(ctx, x - 8, y - 4, 16, 5, '#6b4423')
  rect(ctx, x - 6, y - 8, 12, 5, '#8a5a33')
  rect(ctx, x - 3, y - 11, 6, 4, '#9a6a3f')
}

export const drawCaption = (ctx: Ctx, x: number, y: number, text: string) => {
  ctx.font = '600 7px Prompt, system-ui, sans-serif'
  ctx.textAlign = 'center'
  const w = Math.ceil(ctx.measureText(text).width) + 8
  rect(ctx, x - w / 2 - 1, y - 11, w + 2, 13, '#6b4423')
  rect(ctx, x - w / 2, y - 10, w, 11, '#fbf5e9')
  ctx.fillStyle = '#0f172a'
  ctx.fillText(text, x, y - 2)
}
