import { describe, expect, it } from 'vitest'
import { COSTUMES_ENABLED, GAME_MENU, parseMenuHash } from './game-menu'

describe('game menu', () => {
  it('lists every screen once', () => {
    const keys = GAME_MENU.flatMap((group) => group.items.map((item) => item.key))
    expect(keys).toHaveLength(COSTUMES_ENABLED ? 19 : 18)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('reads the open screen from the URL hash, falling back to care', () => {
    expect(parseMenuHash('#adventure')).toBe('adventure')
    expect(parseMenuHash('world-boss')).toBe('world-boss')
    expect(parseMenuHash('')).toBe('care')
    expect(parseMenuHash('#nope')).toBe('care')
  })

  it('hides the costume screen while costumes are switched off', () => {
    const keys = GAME_MENU.flatMap((group) => group.items.map((item) => item.key))
    expect(keys.includes('costume')).toBe(COSTUMES_ENABLED)
    if (!COSTUMES_ENABLED) expect(parseMenuHash('#costume')).toBe('care')
  })
})
