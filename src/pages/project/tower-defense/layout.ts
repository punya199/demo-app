import { COLS, LANE_LENGTH, ROWS, TILE_COUNT } from '../../../../td-sim/src'

/** Fixed logical canvas; the page scales it with CSS. */
export const VIEW = { width: 360, height: 520 }
const TILE = 64

export const LANE = { x: 20, y: 40, width: 320, height: 44 }
export const BOARD = {
  x: (VIEW.width - COLS * TILE) / 2,
  y: 120,
  width: COLS * TILE,
  height: ROWS * TILE,
}

export function tileRect(tile: number): { x: number; y: number; size: number } {
  return {
    x: BOARD.x + (tile % COLS) * TILE,
    y: BOARD.y + Math.floor(tile / COLS) * TILE,
    size: TILE,
  }
}

/** Tile index under a logical-canvas point, or -1. */
export function tileAt(x: number, y: number): number {
  const col = Math.floor((x - BOARD.x) / TILE)
  const row = Math.floor((y - BOARD.y) / TILE)
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return -1
  const tile = row * COLS + col
  return tile < TILE_COUNT ? tile : -1
}

export function enemyX(pos: number): number {
  return LANE.x + (pos / LANE_LENGTH) * LANE.width
}
