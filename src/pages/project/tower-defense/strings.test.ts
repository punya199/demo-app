import { describe, expect, it } from 'vitest'
import { SKILL_IDS } from '../../../../td-sim/src'
import { STRINGS, skillLabel, t } from './strings'

describe('strings', () => {
  it('looks up Thai and English', () => {
    expect(t('th', 'pause')).toBe('พัก')
    expect(t('en', 'pause')).toBe('Pause')
  })

  it('substitutes {n} params', () => {
    expect(t('en', 'hint', { n: 10 })).toContain('10')
  })

  it('both tables have exactly the same keys', () => {
    expect(Object.keys(STRINGS.en).sort()).toEqual(Object.keys(STRINGS.th).sort())
  })

  it('names every draft skill in both languages', () => {
    for (const id of SKILL_IDS) {
      expect(skillLabel('th', id)).toBeTruthy()
      expect(skillLabel('en', id)).toBeTruthy()
    }
  })
})
