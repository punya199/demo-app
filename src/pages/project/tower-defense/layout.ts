import { COLS, LANE_LENGTH, ROWS, TILE_COUNT } from '../../../../td-sim/src'

export type LayoutMode = 'phone' | 'desktop'
export const DESKTOP_MIN_WIDTH = 768
export const MAX_DPR = 2
const TILE = 64

export const layoutMode = (width: number): LayoutMode =>
  width >= DESKTOP_MIN_WIDTH ? 'desktop' : 'phone'

/** Fixed logical canvas per mode; the page scales it with CSS. */
export function layoutFor(mode: LayoutMode) {
  const phone = { width: 360, height: 520 }
  const desktop = mode === 'desktop'
  const view = desktop ? { width: 720, height: phone.height } : phone
  // desktop: lane in the left half, board in the right half, same vertical rhythm
  const lane = { x: 20, y: 40, width: 320, height: 44 }
  const board = {
    x: (desktop ? phone.width : 0) + (phone.width - COLS * TILE) / 2,
    y: desktop ? 40 : 120,
    width: COLS * TILE,
    height: ROWS * TILE,
  }
  const tileRect = (tile: number) => ({
    x: board.x + (tile % COLS) * TILE,
    y: board.y + Math.floor(tile / COLS) * TILE,
    size: TILE,
  })
  /** Tile index under a logical-canvas point, or -1. */
  const tileAt = (x: number, y: number) => {
    const col = Math.floor((x - board.x) / TILE)
    const row = Math.floor((y - board.y) / TILE)
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return -1
    const tile = row * COLS + col
    return tile < TILE_COUNT ? tile : -1
  }
  const enemyX = (pos: number) => lane.x + (pos / LANE_LENGTH) * lane.width
  return { view, lane, board, tileRect, tileAt, enemyX }
}

export type Layout = ReturnType<typeof layoutFor>

/** Backing-store size for a canvas shown `cssWidth` px wide; dpr capped at MAX_DPR. */
export function canvasBackingSize(
  cssWidth: number,
  view: { width: number; height: number },
  rawDpr: number
) {
  const dpr = rawDpr > 0 ? Math.min(rawDpr, MAX_DPR) : 1
  const scale = (cssWidth * dpr) / view.width
  return { width: Math.round(view.width * scale), height: Math.round(view.height * scale), scale }
}

// Phone layout, kept as named exports for existing callers and tests.
const phone = layoutFor('phone')
export const VIEW = phone.view
export const LANE = phone.lane
export const BOARD = phone.board
export const tileRect = phone.tileRect
export const tileAt = phone.tileAt
export const enemyX = phone.enemyX
