export type TdRarity = 'common' | 'rare' | 'epic' | 'legendary'
export type TdGachaMode = 'single' | 'ten' | 'free'

export interface ITdHeroDef {
  id: string
  name: string
  role: 'aoe' | 'support' | 'dps'
  rarity: TdRarity
}

// Shapes returned by GET /td/gacha and POST /td/gacha/pull. Rates and prices always come from
// the server, so the screen shows exactly what is rolled.
export interface ITdGachaConfig {
  rates: Record<TdRarity, number>
  singleCost: number
  tenCost: number
  pityLimit: number
  duplicateShards: Record<TdRarity, number>
  heroes: ITdHeroDef[]
  /** Shards for each star step: index 0 is star 1 -> 2. Its length plus one is the top star. */
  starUpCosts: number[]
  /** Coins for each gear mod step: index 0 is level 0 -> 1. Its length is the top level. */
  gearModCosts: number[]
}

export interface ITdGacha {
  config: ITdGachaConfig
  state: {
    pity: number
    pullsUntilLegendary: number
    freePullAvailable: boolean
    ownedHeroIds: string[]
    ownedHeroes: { heroId: string; starLevel: number; modLevel: number }[]
  }
}

export interface ITdPullResult {
  pulls: { heroId: string; rarity: TdRarity; duplicate: boolean; shards: number }[]
  cost: number
  pity: number
  pullsUntilLegendary: number
  balances: { gems: number; shards: number }
}

export const RARITIES: TdRarity[] = ['common', 'rare', 'epic', 'legendary']

export const formatRate = (rate: number) => `${rate}%`

// Only a convenience for disabling buttons; the server re-checks everything.
export const pullAvailability = (
  mode: TdGachaMode,
  gems: number,
  config: ITdGachaConfig,
  freePullAvailable: boolean
) => {
  if (mode === 'free') return freePullAvailable
  return gems >= (mode === 'ten' ? config.tenCost : config.singleCost)
}

export interface ITdStarUpResult {
  heroId: string
  starLevel: number
  cost: number
  balances: { shards: number }
}

/** Cost of the next star, or null at the top star. Only a convenience for the button; the server re-checks. */
export const nextStarCost = (starLevel: number, config: ITdGachaConfig): number | null =>
  config.starUpCosts[starLevel - 1] ?? null

export const canStarUp = (starLevel: number, shards: number, config: ITdGachaConfig) => {
  const cost = nextStarCost(starLevel, config)
  return cost !== null && shards >= cost
}

export interface ITdGearUpgradeResult {
  heroId: string
  modLevel: number
  cost: number
  balances: { coins: number }
}

/** Coins for the next gear mod level, or null at the top level. Only a convenience for the button; the server re-checks. */
export const nextGearCost = (modLevel: number, config: ITdGachaConfig): number | null =>
  config.gearModCosts[modLevel] ?? null

export const canUpgradeGear = (modLevel: number, coins: number, config: ITdGachaConfig) => {
  const cost = nextGearCost(modLevel, config)
  return cost !== null && coins >= cost
}
