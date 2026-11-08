import type { IMonsterData } from './monster'
import type { EnumEquipmentSlot, EnumEquipmentGrade, IEquipmentItem } from './equipment'

export type PassiveEffectKey =
  | 'atk'
  | 'hp'
  | 'def'
  | 'spd'
  | 'crit'
  | 'critdmg'
  | 'shield'
  | 'regen'
  | 'dbl'
  | 'burn'
  | 'hunger'
  | 'expCoin'
  | 'drop'
  | 'lifesteal'
  | 'thorns'
  | 'firstStrike'
  | 'noCrit'

export interface IPassiveNode {
  id: string
  name: string
  kind: 'small' | 'notable' | 'key' | 'mastery' | 'ascend'
  arm: 'flame' | 'tide' | 'leaf' | 'earth' | 'lightning' | 'spirit' | 'bridge' | 'ascend'
  fx: Partial<Record<PassiveEffectKey, number>>
  // Masteries: pick one (index 0..2); `fx` is empty until then.
  options?: { name: string; fx: Partial<Record<PassiveEffectKey, number>> }[]
  x: number
  y: number
  adj: string[]
}

// GET /passive: the whole graph (drawn as is), what the player owns and what they can still do.
// A tree as edited on the client and saved in one request (POST /passive/save).
export interface IPassiveDraft {
  nodeIds: string[]
  masteries: Record<string, number>
  ascendancyNodeIds: string[]
}

export type AscendancyPath = 'vanguard' | 'striker' | 'warden'

export interface IPassiveState {
  nodes: IPassiveNode[]
  allocated: string[]
  // Mastery node id -> picked option index.
  masteries: Record<string, number>
  ascendancy: {
    path: AscendancyPath | null
    nodeIds: string[]
    points: { earned: number; used: number; left: number; max: number }
    // Gems to start the ascendancy over (0 while it is empty).
    resetCost: number
    // What starting the ascendancy over costs, whether or not there is anything to reset.
    resetPrice: number
    masteryRepickPrice: number
  }
  points: {
    earned: number
    used: number
    left: number
    sources: {
      dexSpecies: number
      raidFirstClears: number
      adventureClears: number
      totalWins: number
      worldBossDefeats: number
      pvpSeasons: number
    }
  }
  respec: { refunded: number; freeLeft: number; gemPrice: number; branchCap: number }
}

// GET /monster/me
export interface IGetMyMonsterResponse {
  // The selected monster, which every other tab plays with.
  monster: IMonsterData | null
  // Every living monster (up to maxMonsters), selected one included.
  monsters: IMonsterData[]
  maxMonsters: number
}

export enum EnumCostumeSlot {
  HAT = 'hat',
  FACE = 'face',
  BACK = 'back',
  AURA = 'aura',
  BACKDROP = 'backdrop',
}

// What a pet wears: slot -> costume id (ids from the server's catalog).
export type ILoadout = Partial<Record<EnumCostumeSlot, string>>

export interface ICostume {
  id: string
  slot: EnumCostumeSlot
  name: string
  emoji?: string
  color?: string
  gradient?: string
  rarity: EnumEquipmentGrade
  theme: string | null
  price: { currency: 'coin' | 'gem' | 'boss_token' | 'season'; amount: number; bossId?: string }
  endsAt?: string
}

// GET /costume
export interface ICostumeState {
  catalog: ICostume[]
  owned: string[]
  themes: { theme: string; total: number; owned: number; isComplete: boolean }[]
  selectedId: string | null
  pets: { id: string; costume: ILoadout }[]
  showCostume: boolean
}

// Craft queue (GET/POST /monster/craft*). Every number comes from the server.
export type CraftPityStep = 'epic_legendary' | 'legendary_mythic'

export interface ICraftRecipeView {
  id: string
  setId: string
  slot: EnumEquipmentSlot
  name: string
  flagship: boolean
  baseGrade: EnumEquipmentGrade.EPIC | EnumEquipmentGrade.LEGENDARY
  maxGrade: EnumEquipmentGrade.LEGENDARY | EnumEquipmentGrade.MYTHIC
  coin: number
  minutes: number
  materials: { itemId: string; qty: number; owned: number }[]
  canStart: boolean
}

export interface ICraftQueue {
  recipeId: string
  useCatalyst: boolean
  startedAt: string
  finishAt: string
  status: 'running' | 'ready'
  skipCoin: number
}

export interface ICraftOverview {
  recipes: ICraftRecipeView[]
  queue: ICraftQueue | null
  catalyst: {
    owned: number
    chance: number
    pity: { step: CraftPityStep; fails: number; guaranteeAfter: number }[]
  }
  coin: number
}

export interface ICraftClaimResult {
  item: IEquipmentItem
  upgraded: boolean
  overview: ICraftOverview
}

// POST /monster/return-home: the Pet Core the pet left behind.
export interface IReturnHomeResult {
  itemId: string
  quantity: number
}
