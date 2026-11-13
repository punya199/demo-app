import { describe, expect, it } from 'vitest'
import { LANE_LENGTH, TILE_COUNT } from '../../../../td-sim/src'
import { BOARD, LANE, canvasBackingSize, enemyX, layoutFor, layoutMode, tileAt, tileRect } from './layout'

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

describe('responsive layout', () => {
  it('layoutMode switches at 768px', () => {
    expect(layoutMode(767)).toBe('phone')
    expect(layoutMode(768)).toBe('desktop')
  })

  it('desktop puts lane and board side by side without overlap', () => {
    const d = layoutFor('desktop')
    expect(d.view.width).toBeGreaterThan(layoutFor('phone').view.width)
    expect(d.lane.x + d.lane.width).toBeLessThanOrEqual(d.board.x)
    expect(d.board.x + d.board.width).toBeLessThanOrEqual(d.view.width)
  })

  it('phone stacks the lane above the board', () => {
    const p = layoutFor('phone')
    expect(p.lane.y + p.lane.height).toBeLessThanOrEqual(p.board.y)
  })

  it('every tile centre maps back to its tile in both modes', () => {
    for (const mode of ['phone', 'desktop'] as const) {
      const l = layoutFor(mode)
      for (let i = 0; i < TILE_COUNT; i++) {
        const r = l.tileRect(i)
        expect(l.tileAt(r.x + r.size / 2, r.y + r.size / 2)).toBe(i)
      }
    }
  })
})

describe('canvasBackingSize', () => {
  const view = { width: 360, height: 520 }
  it('scales by dpr', () => {
    expect(canvasBackingSize(180, view, 1.5)).toEqual({ width: 270, height: 390, scale: 0.75 })
  })
  it('caps dpr at 2', () => {
    expect(canvasBackingSize(360, view, 3)).toEqual({ width: 720, height: 1040, scale: 2 })
  })
  it('falls back to dpr 1 for bad values', () => {
    expect(canvasBackingSize(360, view, 0).width).toBe(360)
  })
})
