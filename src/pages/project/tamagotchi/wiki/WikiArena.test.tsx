import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IWikiData } from '../core/tamagotchi-interface'
import { ArenaBattleSection } from './WikiArena'

// A trimmed copy of what GET /monster/wiki sends for the arena and the old turn rules.
const wiki = {
  battle: {
    strongMultiplier: 1.3,
    weakMultiplier: 0.8,
    skillEveryRounds: 3,
    maxRounds: 20,
    beats: { flame: ['leaf'], leaf: ['tide'], tide: ['flame'] },
  },
  arena: {
    timeLimitSec: 60,
    defenseK: 40,
    maxDefenseReduction: 0.75,
    damageVarianceMin: 0.8,
    damageVarianceMax: 1.2,
    strongMultiplier: 1.1,
    weakMultiplier: 0.9,
    critChance: 15,
    critMultiplier: 1.5,
    dodgeBase: 50,
    dodgeMax: 75,
    dodgeMinCooldown: 4,
    bossRes: 15,
    maxResist: 70,
    lineEva: { flame: 5, leaf: 8, tide: 4 },
    lineAcc: { flame: 8, leaf: 6, tide: 6 },
    lineRes: { flame: 8, leaf: 10, tide: 14 },
  },
} as unknown as IWikiData

describe('ArenaBattleSection', () => {
  it('describes the real-time arena with its own numbers, not the turn engine', () => {
    render(<ArenaBattleSection wiki={wiki} />)
    expect(screen.getByText(/ครบเวลา 60 วินาที/)).toBeTruthy()
    // Damage formula: arena defense, 80%-120% spread.
    expect(screen.getByText(/DEF\/\(DEF\+40\)/)).toBeTruthy()
    expect(screen.getByText(/สุ่ม 80%–120%/)).toBeTruthy()
    // Elements: the arena's x1.1 / x0.9, with the old values only as a comparison.
    expect(screen.getByText(/ได้เปรียบ ×1\.1 เสียเปรียบ ×0\.9/)).toBeTruthy()
    expect(screen.getByText(/ที่ ×1\.3 \/ ×0\.8/)).toBeTruthy()
    expect(screen.getByText(/โอกาสหลบ = 50 \+ EVA/)).toBeTruthy()
    // Per-line stats table.
    expect(screen.getAllByText('14').length).toBeGreaterThan(0)
  })
})
