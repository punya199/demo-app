import { IPassiveNode, PassiveEffectKey } from '../core/tamagotchi-interface'

// Which glyph each passive node shows (see passive-icons.tsx for how they are drawn).
export type PassiveGlyphKey = PassiveEffectKey | 'mastery' | 'ascend'

// Which effect a node is shown by: the first one present, in this order.
const PRIORITY: PassiveEffectKey[] = [
  'atk',
  'hp',
  'def',
  'spd',
  'crit',
  'critdmg',
  'shield',
  'regen',
  'dbl',
  'burn',
  'lifesteal',
  'thorns',
  'firstStrike',
  'hunger',
  'expCoin',
  'drop',
  'noCrit',
]

export const PASSIVE_GLYPH_KEYS: PassiveGlyphKey[] = [...PRIORITY, 'mastery', 'ascend']

export interface INodeGlyph {
  main: PassiveGlyphKey
  // Notables: a small second glyph in the corner.
  second?: PassiveGlyphKey
  // Keystones: the trade-off, drawn as a red badge.
  drawback?: PassiveGlyphKey
}

const byPriority = (keys: PassiveEffectKey[]) =>
  [...keys].sort((a, b) => PRIORITY.indexOf(a) - PRIORITY.indexOf(b))

// The glyph(s) a node shows, or null for filler (hub, hub ring, bridges). `pick` is the index of
// the chosen option on a mastery.
export const getNodeGlyph = (node: IPassiveNode, pick?: number): INodeGlyph | null => {
  if (node.kind === 'mastery') {
    const option = pick === undefined ? undefined : node.options?.[pick]
    const key = option && byPriority(Object.keys(option.fx) as PassiveEffectKey[])[0]
    return { main: key ?? 'mastery' }
  }
  if (node.kind === 'ascend') {
    // The last node of a path is its capstone.
    if (node.id.endsWith('-11')) {
      return { main: 'ascend' }
    }
  }
  if (node.arm === 'bridge') {
    return null
  }
  const entries = Object.entries(node.fx) as [PassiveEffectKey, number][]
  const gains = byPriority(entries.filter(([, value]) => value > 0).map(([key]) => key))
  if (!gains.length) {
    return null
  }
  if (node.kind === 'key') {
    const costly = entries.find(([, value]) => value < 0)?.[0]
    // "Cannot crit" is a drawback written as a positive flag.
    const drawback = costly ?? (node.fx.noCrit ? 'noCrit' : undefined)
    const main = gains.find((key) => key !== 'noCrit') ?? gains[0]
    return { main, ...(drawback && drawback !== main && { drawback }) }
  }
  return { main: gains[0], ...(node.kind === 'notable' && gains[1] && { second: gains[1] }) }
}
