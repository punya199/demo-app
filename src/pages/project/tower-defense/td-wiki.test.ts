import { describe, expect, it } from 'vitest'
import { ADVANTAGE_PCT, CORE_SLOTS, MAX_STAR } from '../../../../td-sim/src'
import type { ITdGachaConfig } from './td-gacha'
import { SWEEP_MIN_STARS } from './td-stage'
import { elementCycle, wikiSections } from './td-wiki'

// Deliberately odd numbers: if a wiki line shows them, they came from the input, not a typed constant.
const gacha: ITdGachaConfig = {
  rates: { common: 41, rare: 33, epic: 17, legendary: 9 },
  singleCost: 123,
  tenCost: 1111,
  pityLimit: 77,
  duplicateShards: { common: 1, rare: 2, epic: 3, legendary: 4 },
  heroes: [],
  starUpCosts: [10, 20, 30, 40],
  gearModCosts: [5],
}
const energy = { current: 3, cap: 99, stageCost: 13, secondsToNext: null }
const text = (lang: 'th' | 'en', input = { gacha, energy }) =>
  wikiSections(lang, input)
    .flatMap((s) => [s.title, ...s.lines])
    .join('\n')

describe('wikiSections', () => {
  it('covers every topic the ticket lists, in both languages', () => {
    const ids = wikiSections('en', { gacha, energy }).map((s) => s.id)
    expect(ids).toEqual([
      'battle',
      'charging',
      'merging',
      'resonance',
      'energy',
      'gacha',
      'stars',
      'cores',
      'relics',
      'sweep',
    ])
    expect(wikiSections('th', { gacha, energy }).map((s) => s.id)).toEqual(ids)
  })

  it('shows server numbers (energy, gacha) from the data it is given', () => {
    const en = text('en')
    expect(en).toContain('99') // energy cap
    expect(en).toContain('13') // stage cost
    expect(en).toContain('41%') // common rate
    expect(en).toContain('9%') // legendary rate
    expect(en).toContain('77') // pity limit
    expect(en).toContain('1111')
    expect(text('th')).toContain('77')
  })

  it('shows sim numbers from the td-sim config', () => {
    const en = text('en')
    expect(en).toContain(`${ADVANTAGE_PCT}%`)
    expect(en).toContain(String(CORE_SLOTS))
    expect(en).toContain(String(MAX_STAR))
    expect(en).toContain(String(SWEEP_MIN_STARS))
  })

  it('leaves no placeholder, undefined or NaN, even before the server data has loaded', () => {
    for (const lang of ['th', 'en'] as const) {
      for (const input of [{ gacha, energy }, { gacha: undefined, energy: undefined }]) {
        expect(text(lang, input as never)).not.toMatch(/\{\w+\}|undefined|NaN/)
      }
    }
  })

  it('shows a dash instead of a number that has not loaded', () => {
    expect(text('en', { gacha: undefined, energy: undefined } as never)).toContain('–')
  })
})

describe('elementCycle', () => {
  it('follows the advantage rule from the config until it closes', () => {
    expect(elementCycle()).toEqual(['fire', 'nature', 'ice', 'fire'])
  })

  it('is printed with element names in the wiki', () => {
    expect(text('en')).toContain('Fire > Nature > Ice > Fire')
    expect(text('th')).toContain('ไฟ > ธรรมชาติ > น้ำแข็ง > ไฟ')
  })
})
