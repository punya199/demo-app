import { describe, expect, it } from 'vitest'
import { keyAction, pointerToLogical } from './input'

describe('keyAction', () => {
  it('maps shortcuts, case-insensitive', () => {
    expect(keyAction('p')).toBe('pause')
    expect(keyAction('P')).toBe('pause')
    expect(keyAction(' ')).toBe('pause')
    expect(keyAction('f')).toBe('speed')
    expect(keyAction('r')).toBe('restart')
    expect(keyAction('l')).toBe('lang')
  })
  it('ignores other keys', () => {
    expect(keyAction('x')).toBeNull()
    expect(keyAction('Enter')).toBeNull()
  })
})

describe('pointerToLogical', () => {
  it('maps client coords through the canvas rect to logical space', () => {
    const rect = { left: 10, top: 20, width: 180, height: 260 }
    expect(pointerToLogical(100, 150, rect, { width: 360, height: 520 })).toEqual({ x: 180, y: 260 })
  })
})
