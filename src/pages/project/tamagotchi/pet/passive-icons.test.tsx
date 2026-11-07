import { describe, expect, it } from 'vitest'
import { getNodeGlyph, PASSIVE_GLYPH_KEYS } from './passive-glyphs'
import { passiveEffectLabel } from '../core/tamagotchi-helper'
import { IPassiveNode } from '../core/tamagotchi-interface'

const node = (overrides: Partial<IPassiveNode>): IPassiveNode =>
  ({
    id: 'n',
    name: 'n',
    kind: 'small',
    arm: 'flame',
    fx: {},
    x: 0,
    y: 0,
    adj: [],
    ...overrides,
  }) as IPassiveNode

describe('passive glyphs', () => {
  it('has a glyph for every effect the tree can carry', () => {
    for (const key of Object.keys(passiveEffectLabel)) {
      expect(PASSIVE_GLYPH_KEYS).toContain(key)
    }
    expect(PASSIVE_GLYPH_KEYS).toEqual(expect.arrayContaining(['mastery', 'ascend']))
  })

  it('shows a small node by its strongest effect, in a fixed order', () => {
    expect(getNodeGlyph(node({ fx: { drop: 2, spd: 2 } }))).toEqual({ main: 'spd' })
    expect(getNodeGlyph(node({ fx: { hp: 2 } }))).toEqual({ main: 'hp' })
  })

  it('adds a second glyph on a notable only', () => {
    const fx = { atk: 5, hp: 2 }
    expect(getNodeGlyph(node({ kind: 'notable', fx }))).toEqual({ main: 'atk', second: 'hp' })
    expect(getNodeGlyph(node({ kind: 'small', fx }))).toEqual({ main: 'atk' })
  })

  it('shows a keystone by its gain and badges the drawback', () => {
    expect(getNodeGlyph(node({ kind: 'key', fx: { atk: 50, def: -40 } }))).toEqual({
      main: 'atk',
      drawback: 'def',
    })
    expect(getNodeGlyph(node({ kind: 'key', fx: { regen: 3, noCrit: 1 } }))).toEqual({
      main: 'regen',
      drawback: 'noCrit',
    })
    expect(getNodeGlyph(node({ kind: 'key', fx: { firstStrike: 1, hp: -20 } }))).toEqual({
      main: 'firstStrike',
      drawback: 'hp',
    })
  })

  it('shows a mastery as pips until an option is picked, then by that option', () => {
    const mastery = node({
      kind: 'mastery',
      options: [
        { name: 'a', fx: { burn: 1 } },
        { name: 'b', fx: { atk: 8 } },
      ],
    })
    expect(getNodeGlyph(mastery)).toEqual({ main: 'mastery' })
    expect(getNodeGlyph(mastery, 1)).toEqual({ main: 'atk' })
  })

  it('leaves the hub, hub ring and bridges plain, and crowns an ascendancy capstone', () => {
    expect(getNodeGlyph(node({ id: 'hub', arm: 'bridge', fx: {} }))).toBeNull()
    expect(getNodeGlyph(node({ arm: 'bridge', fx: { atk: 1, spd: 1 } }))).toBeNull()
    expect(
      getNodeGlyph(
        node({ id: 'v2-asc-striker-11', kind: 'ascend', arm: 'ascend', fx: { crit: 8 } })
      )
    ).toEqual({ main: 'ascend' })
    expect(
      getNodeGlyph(
        node({ id: 'v2-asc-striker-03', kind: 'ascend', arm: 'ascend', fx: { crit: 4 } })
      )
    ).toEqual({ main: 'crit' })
  })
})
