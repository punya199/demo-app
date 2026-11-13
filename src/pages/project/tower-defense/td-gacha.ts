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
}

export interface ITdGacha {
  config: ITdGachaConfig
  state: {
    pity: number
    pullsUntilLegendary: number
    freePullAvailable: boolean
    ownedHeroIds: string[]
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
