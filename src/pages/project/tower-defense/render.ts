import {
  CHARGE_SCALE,
  HEROES,
  PENALTY_TILES,
  SOURCE_TILE,
  TILE_COUNT,
  linkedTiles,
  type HeroId,
  type SimState,
} from '../../../../td-sim/src'
import { LANE, VIEW, enemyX, tileRect } from './layout'

// Shapes only: every hero is a coloured polygon, no image assets.
const HERO_COLOR: Record<HeroId, string> = { archer: '#22c55e', mage: '#a855f7', knight: '#f59e0b' }
const SIDES: Record<HeroId, number> = { archer: 3, mage: 5, knight: 4 }

function polygon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, sides: number) {
  ctx.beginPath()
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

export function draw(ctx: CanvasRenderingContext2D, s: SimState, selected = -1): void {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height)

  // lane + HQ
  ctx.fillStyle = '#334155'
  ctx.fillRect(LANE.x, LANE.y, LANE.width, LANE.height)
  ctx.fillStyle = '#ef4444'
  ctx.fillRect(LANE.x + LANE.width - 6, LANE.y - 6, 12, LANE.height + 12)
  const cy = LANE.y + LANE.height / 2
  for (const e of s.enemies) {
    const x = Math.min(enemyX(e.pos), LANE.x + LANE.width)
    ctx.fillStyle = '#e11d48'
    ctx.beginPath()
    ctx.arc(x, cy, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(e.hp), x, cy - 14)
  }

  // board
  const gearAt = new Map(s.gears.map((g) => [g.tile, g]))
  const linked = linkedTiles(s.gears)
  for (let i = 0; i < TILE_COUNT; i++) {
    const r = tileRect(i)
    ctx.fillStyle = (Math.floor(i / 5) + (i % 5)) % 2 ? '#1e293b' : '#273449'
    ctx.fillRect(r.x, r.y, r.size, r.size)
    if (PENALTY_TILES.includes(i)) {
      ctx.fillStyle = 'rgba(239,68,68,0.25)'
      ctx.fillRect(r.x, r.y, r.size, r.size)
      ctx.fillStyle = '#fca5a5'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('-2', r.x + 4, r.y + 12)
    }
    if (i === SOURCE_TILE) {
      ctx.fillStyle = '#facc15'
      ctx.fillRect(r.x + 8, r.y + r.size - 3, r.size - 16, 3)
    }
    if (i === selected) {
      ctx.strokeStyle = '#fff'
      ctx.strokeRect(r.x + 1, r.y + 1, r.size - 2, r.size - 2)
    }
    const g = gearAt.get(i)
    if (!g) continue
    ctx.globalAlpha = linked.has(i) ? 1 : 0.35
    ctx.fillStyle = HERO_COLOR[g.hero]
    polygon(ctx, r.x + r.size / 2, r.y + r.size / 2, 22, SIDES[g.hero])
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(g.level), r.x + r.size / 2, r.y + r.size / 2 + 4)
    // charge bar: fills as a linked gear charges
    const ready = 1 - g.cooldown / (HEROES[g.hero].cooldown * CHARGE_SCALE)
    ctx.fillRect(r.x + 8, r.y + r.size - 8, (r.size - 16) * ready, 3)
  }
}
