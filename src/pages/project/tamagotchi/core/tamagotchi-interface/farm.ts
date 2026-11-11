// Mirrors the backend's farm view (demo-app-backend src/modules/monster/farm/farm.service.ts).
// The server owns every number: furniture only stretches the care timers there.

export enum EnumFurnitureKind {
  TABLE = 'table',
  GYM = 'gym',
  TOILET = 'toilet',
  BED = 'bed',
}

export interface IFarmMaterial {
  itemId: string
  qty: number
  owned: number
}

export interface IFarmUpgrade {
  // Tier 1 is bought with coins; tiers 2 and 3 are crafted in the furniture craft queue.
  via: 'buy' | 'craft'
  toTier: number
  coin: number
  minutes: number
  materials: IFarmMaterial[]
  canStart: boolean
}

export interface IFarmFurniture {
  kind: EnumFurnitureKind
  // 0 = not bought yet.
  tier: number
  // Bonus on the timer's minutes now / at the next tier (0.15 = +15%).
  bonus: number
  nextBonus: number | null
  next: IFarmUpgrade | null
}

export interface IFarmQueue {
  kind: EnumFurnitureKind
  toTier: number
  startedAt: string
  finishAt: string
  status: 'running' | 'ready'
}

export interface IFarmData {
  furniture: IFarmFurniture[]
  queue: IFarmQueue | null
  effects: {
    fullnessDrain: number
    strengthDrain: number
    poopRate: number
    sickAfterHungryMinutes: number
  }
  coin: number
}
