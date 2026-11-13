import { CORE_DAMAGE_PCT, CORE_SLOTS, type CoreRarity, type Element } from '../../../../td-sim/src'

// Shapes returned by GET /td/cores and the equip and promote calls. Costs and rules come from the
// server; the checks here only decide which buttons are enabled.
export interface ITdCore {
  id: string
  element: Element
  rarity: CoreRarity
  slot: number | null
  /** Price of the next rarity, or null at the top rarity. */
  promoteCost: { coins: number; shards: number } | null
}

export interface ITdCores {
  slots: number
  cores: ITdCore[]
}

const ELEMENT_TH: Record<Element, string> = {
  fire: 'ไฟ',
  ice: 'น้ำแข็ง',
  nature: 'ธรรมชาติ',
  physical: 'กายภาพ',
}
const RARITY_TH: Record<CoreRarity, string> = {
  common: 'ธรรมดา',
  rare: 'หายาก',
  epic: 'เอปิก',
  legendary: 'ตำนาน',
}

export const elementLabel = (e: Element) => ELEMENT_TH[e]
export const rarityLabel = (r: CoreRarity) => RARITY_TH[r]

/** One entry per slot: the core equipped there, or null. */
export const slotCores = (cores: readonly ITdCore[]): (ITdCore | null)[] =>
  Array.from({ length: CORE_SLOTS }, (_, i) => cores.find((c) => c.slot === i) ?? null)

export const canPromoteCore = (core: ITdCore, balances: { coins: number; shards: number }) =>
  core.promoteCost !== null &&
  balances.coins >= core.promoteCost.coins &&
  balances.shards >= core.promoteCost.shards

export const coreBonusText = (core: ITdCore) =>
  `ฮีโร่ธาตุ${elementLabel(core.element)} โจมตี +${CORE_DAMAGE_PCT[core.rarity]}%`
