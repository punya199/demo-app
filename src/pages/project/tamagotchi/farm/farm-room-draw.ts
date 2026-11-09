import { ROOM_H, ROOM_W, SPOTS, type FarmTiers } from './farm-room-sim'

// Draws the Farm room on its pixel grid: wall, floor and the furniture the player owns. A higher
// tier shows in the trim colour (tier 1 wood, tier 2 blue, tier 3 gold).

const TRIM = ['#6b4423', '#6b4423', '#3d6fa3', '#c98a12']
const trim = (tier: number) => TRIM[Math.max(0, Math.min(3, tier))]

type Ctx = CanvasRenderingContext2D
const rect = (ctx: Ctx, x: number, y: number, w: number, h: number, color: string) => {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

export const drawRoom = (ctx: Ctx, tiers: FarmTiers) => {
  rect(ctx, 0, 0, ROOM_W, 74, '#b9855a')
  rect(ctx, 0, 70, ROOM_W, 4, '#6b4423')
  for (let x = 0; x < ROOM_W; x += 44) {
    rect(ctx, x, 74, 22, ROOM_H - 74, '#d9b98a')
    rect(ctx, x + 22, 74, 22, ROOM_H - 74, '#cfae7e')
  }
  rect(ctx, 180, 12, 56, 42, '#6b4423')
  rect(ctx, 184, 16, 48, 34, '#9fd3e8')
  rect(ctx, 206, 16, 4, 34, '#6b4423')

  if (tiers.bed > 0) {
    rect(ctx, 10, 32, 92, 54, trim(tiers.bed))
    rect(ctx, 13, 35, 86, 48, '#8a5a33')
    rect(ctx, 16, 38, 26, 22, '#fbf5e9')
    rect(ctx, 40, 38, 56, 42, '#5b8db8')
    rect(ctx, 40, 38, 56, 6, '#7aa8cf')
  }
  if (tiers.table > 0) {
    rect(ctx, 236, 70, 108, 52, trim(tiers.table))
    rect(ctx, 239, 73, 102, 46, '#8a5a33')
    for (const bowl of [250, 294]) {
      rect(ctx, bowl, 82, 34, 14, '#b4531e')
      rect(ctx, bowl + 3, 84, 28, 9, '#e07a3f')
    }
  } else {
    rect(ctx, SPOTS.bowl.x - 14, SPOTS.bowl.y - 6, 28, 10, '#b4531e')
  }
  if (tiers.gym > 0) {
    rect(ctx, 150, 218, 80, 40, trim(tiers.gym))
    rect(ctx, 153, 221, 74, 34, '#7fb069')
    rect(ctx, 168, 236, 44, 4, '#6b4423')
    rect(ctx, 164, 232, 6, 12, '#444444')
    rect(ctx, 210, 232, 6, 12, '#444444')
  }
  if (tiers.toilet > 0) {
    rect(ctx, 364, 150, 44, 14, trim(tiers.toilet) === '#6b4423' ? '#9a9a92' : trim(tiers.toilet))
    rect(ctx, 366, 152, 40, 10, '#f4f4f0')
    rect(ctx, 360, 164, 52, 28, trim(tiers.toilet) === '#6b4423' ? '#9a9a92' : trim(tiers.toilet))
    rect(ctx, 362, 166, 48, 24, '#f4f4f0')
  }
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
