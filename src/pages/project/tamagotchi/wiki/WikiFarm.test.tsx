import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EnumFurnitureKind, IWikiData } from '../core/tamagotchi-interface'
import { FarmWikiTab } from './WikiFarm'

// A trimmed copy of what GET /monster/wiki sends for the farm page.
const wiki = {
  farm: {
    buyCoin: 240,
    craft: {
      '2': { coin: 300, minutes: 30, essence: 3, rune: 1, catalyst: 0 },
      '3': { coin: 800, minutes: 240, essence: 4, rune: 2, catalyst: 1 },
    },
    furniture: [
      { kind: EnumFurnitureKind.TABLE, bonus: [0, 0.15, 0.3, 0.5], essence: 'leaf' },
      { kind: EnumFurnitureKind.BED, bonus: [0, 0.25, 0.5, 1], essence: 'holy' },
    ],
  },
} as unknown as IWikiData

describe('FarmWikiTab', () => {
  it('shows the server prices and bonuses, and that there is no skip', () => {
    render(<FarmWikiTab wiki={wiki} />)
    expect(screen.getByText(/ระดับ 1 ซื้อด้วยเหรียญ 🪙 240/)).toBeTruthy()
    expect(screen.getByText(/ระดับ 3 คราฟต์: 🪙 800/)).toBeTruthy()
    expect(screen.getByText('+100%')).toBeTruthy()
    expect(screen.getByText('🍃 เอสเซนซ์ใบไม้')).toBeTruthy()
    expect(screen.getByText(/ข้ามเวลาด้วยเหรียญไม่ได้/)).toBeTruthy()
  })
})
