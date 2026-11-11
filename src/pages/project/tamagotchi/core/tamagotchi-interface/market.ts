import type { EnumMonsterLine, EnumMonsterStage } from './monster'

// What a buyer sees of a listed pet. No owner or seller id: the seller is shown by display name.
export interface IMarketPet {
  speciesId: string
  name: string
  emoji: string
  sprite: string | null
  line: EnumMonsterLine
  stage: EnumMonsterStage
  nickname: string | null
  wins: number
  losses: number
  ageMinutes: number
  potentialGrade: string | null
  potentialAverage: number | null
  referenceValue: number
}

export interface IMarketListing {
  listingId: string
  price: number
  expiresAt: string
  sellerName: string
  mine: boolean
  pet: IMarketPet
}

export interface IMarketSellablePet {
  monsterId: string
  speciesId: string
  name: string
  emoji: string
  line: EnumMonsterLine
  stage: EnumMonsterStage
  nickname: string | null
  blocker: string | null
  referenceValue: number | null
  priceBand: { min: number; max: number } | null
}

export interface IMarketHistoryEntry {
  listingId: string
  status: 'sold' | 'cancelled' | 'expired'
  price: number
  fee: number
  soldAt: string | null
  updatedAt: string
}

export interface IMarketMine {
  listings: IMarketListing[]
  history: IMarketHistoryEntry[]
  pets: IMarketSellablePet[]
  limits: {
    maxActiveListings: number
    maxBuysPerDay: number
    boughtToday: number
    maxMonsters: number
  }
}

export type MarketSort = 'newest' | 'price_asc' | 'price_desc'

export interface IMarketFilter {
  line?: EnumMonsterLine
  stage?: EnumMonsterStage
  sort?: MarketSort
}
