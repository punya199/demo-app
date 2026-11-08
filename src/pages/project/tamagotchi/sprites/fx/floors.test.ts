import { describe, expect, it } from 'vitest'
import { floorPixels, floorThemeOf, THEMES } from './floors'

describe('arena floors', () => {
  it('gives a boss fight its element arena and everything else the cave', () => {
    expect(floorThemeOf('flame')).toBe('lava')
    expect(floorThemeOf('shadow')).toBe('crypt')
    expect(floorThemeOf('tide')).toBe('cave')
    expect(floorThemeOf(undefined)).toBe('cave')
  })

  it('paints every pixel, with the rim in the theme colour', () => {
    const w = 120
    const h = 80
    const px = floorPixels('lava', w, h)
    for (let i = 3; i < px.length; i += 4) expect(px[i]).toBe(255)
    // the outermost rim pixel at the bottom-left is mostly the bright rim colour
    const i = ((h - 1) * w + 0) * 4
    const [r, g, b] = THEMES.lava.rim
    expect(Math.abs(px[i] - r * 0.9 - THEMES.lava.rimDeep[0] * 0.1)).toBeLessThan(2)
    expect(px[i + 1]).toBeLessThan(g)
    expect(px[i + 2]).toBeLessThan(b + 1)
  })

  it('is the same every time (no randomness)', () => {
    expect(floorPixels('forest', 50, 40)).toEqual(floorPixels('forest', 50, 40))
  })
})
