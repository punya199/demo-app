import { describe, expect, it } from 'vitest'
import { buildEvolutionTree, getTreeStates } from './evolution-tree'
import { EnumMonsterLine, EnumMonsterStage, IWikiSpecies } from '../core/tamagotchi-interface'

const form = (
  id: string,
  stage: EnumMonsterStage,
  to: string[] = [],
  line = EnumMonsterLine.FLAME
): IWikiSpecies => ({
  id,
  line,
  stage,
  name: id,
  emoji: '🔥',
  minWeight: 1,
  stats: { hp: 1, atk: 1, def: 1, spd: 1 },
  skill: { name: 's', power: 1 },
  evolutions: to.map((target) => ({ to: target })),
})

// The shape every line has: one egg/baby chain, three adults, three perfects, two ultimates.
const SPECIES = [
  form('flame_egg', EnumMonsterStage.EGG, ['flame_baby1']),
  form('flame_baby1', EnumMonsterStage.BABY_1, ['flame_baby2']),
  form('flame_baby2', EnumMonsterStage.BABY_2, [
    'flame_adultAlt',
    'flame_adultGood',
    'flame_adultPoor',
  ]),
  form('flame_adultPoor', EnumMonsterStage.ADULT, [
    'flame_perfectAlt',
    'flame_perfectGood',
    'flame_perfectPoor',
  ]),
  form('flame_adultGood', EnumMonsterStage.ADULT, [
    'flame_perfectAlt',
    'flame_perfectGood',
    'flame_perfectPoor',
  ]),
  form('flame_adultAlt', EnumMonsterStage.ADULT, [
    'flame_perfectAlt',
    'flame_perfectGood',
    'flame_perfectPoor',
  ]),
  form('flame_perfectGood', EnumMonsterStage.PERFECT, ['flame_ultimate']),
  form('flame_perfectPoor', EnumMonsterStage.PERFECT),
  form('flame_perfectAlt', EnumMonsterStage.PERFECT, ['flame_ultimateAlt', 'flame_ultimate']),
  form('flame_ultimate', EnumMonsterStage.ULTIMATE),
  form('flame_ultimateAlt', EnumMonsterStage.ULTIMATE),
  form('flame_tide_fused', EnumMonsterStage.FUSED),
  form('tide_egg', EnumMonsterStage.EGG, [], EnumMonsterLine.TIDE),
]

const layout = buildEvolutionTree(SPECIES, EnumMonsterLine.FLAME)
const at = (id: string) => {
  const node = layout.nodes.find((entry) => entry.species.id === id)!
  return [node.column, node.row]
}

describe('buildEvolutionTree', () => {
  it('keeps only the line, without fused forms', () => {
    expect(layout.nodes).toHaveLength(11)
    expect(layout.rows).toBe(3)
  })

  it('puts each stage in its column: alt on top, good in the middle, poor at the bottom', () => {
    expect(at('flame_egg')).toEqual([0, 1])
    expect(at('flame_baby2')).toEqual([2, 1])
    expect(at('flame_adultAlt')).toEqual([3, 0])
    expect(at('flame_adultGood')).toEqual([3, 1])
    expect(at('flame_adultPoor')).toEqual([3, 2])
    expect(at('flame_perfectAlt')).toEqual([4, 0])
    expect(at('flame_ultimateAlt')).toEqual([5, 0])
    expect(at('flame_ultimate')).toEqual([5, 1])
  })

  it('draws every evolution as an edge and marks dead ends', () => {
    expect(layout.edges).toHaveLength(2 + 3 + 9 + 1 + 2)
    const dead = layout.nodes.filter((node) => node.isDeadEnd).map((node) => node.species.id)
    expect(dead).toEqual(['flame_perfectPoor'])
  })
})

describe('getTreeStates', () => {
  it('is plain without a monster', () => {
    expect(getTreeStates(layout, null).nodeStates.size).toBe(0)
  })

  it("colors one monster's history, its next options and the branches it skipped", () => {
    const { nodeStates, edgeStates, edgeKey } = getTreeStates(layout, {
      path: ['flame_egg', 'flame_baby1', 'flame_baby2', 'flame_adultGood'],
    })
    expect(nodeStates.get('flame_baby2')).toBe('done')
    expect(nodeStates.get('flame_adultGood')).toBe('current')
    expect(nodeStates.get('flame_adultAlt')).toBe('skipped')
    expect(nodeStates.get('flame_perfectAlt')).toBe('next')
    expect(nodeStates.get('flame_perfectPoor')).toBe('next-dead')
    expect(nodeStates.get('flame_ultimate')).toBe('future')
    expect(edgeStates.get(edgeKey({ from: 'flame_baby2', to: 'flame_adultGood' }))).toBe('done')
    expect(edgeStates.get(edgeKey({ from: 'flame_adultGood', to: 'flame_perfectGood' }))).toBe(
      'next'
    )
    expect(edgeStates.get(edgeKey({ from: 'flame_adultAlt', to: 'flame_perfectGood' }))).toBe(
      'idle'
    )
  })
})
