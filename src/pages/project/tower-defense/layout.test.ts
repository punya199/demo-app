import { describe, expect, it } from 'vitest'
import { LANE_LENGTH, TILE_COUNT } from '../../../../td-sim/src'
import { BOARD, LANE, enemyX, tileAt, tileRect } from './layout'

describe('layout', () => {
  it('tileAt finds the tile under a point, row-major', () => {
    const r = tileRect(7)
    expect(tileAt(r.x + 1, r.y + 1)).toBe(7)
    expect(tileAt(r.x + r.size - 1, r.y + r.size - 1)).toBe(7)
  })

  it('every tile centre maps back to its own tile', () => {
    for (let i = 0; i < TILE_COUNT; i++) {
      const r = tileRect(i)
      expect(tileAt(r.x + r.size / 2, r.y + r.size / 2)).toBe(i)
    }
  })

  it('tileAt is -1 outside the board', () => {
    expect(tileAt(BOARD.x - 1, BOARD.y + 5)).toBe(-1)
    expect(tileAt(BOARD.x + 5, BOARD.y - 1)).toBe(-1)
    expect(tileAt(BOARD.x + BOARD.width + 1, BOARD.y + 5)).toBe(-1)
    expect(tileAt(BOARD.x + 5, BOARD.y + BOARD.height + 1)).toBe(-1)
  })

  it('enemyX runs from the lane start to the HQ end', () => {
    expect(enemyX(0)).toBe(LANE.x)
    expect(enemyX(LANE_LENGTH)).toBe(LANE.x + LANE.width)
  })
})
