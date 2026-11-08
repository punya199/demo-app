import type { EnumMonsterStage, IBattleStats } from './monster'

export enum EnumEquipmentSlot {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  HELMET = 'helmet',
  ACCESSORY = 'accessory',
}

export enum EnumEquipmentGrade {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic',
}

export type StatKey = keyof IBattleStats

// Care perk on a piece, worn by the pet only (value in percent).
export type SpecialKey = 'slowHunger' | 'staminaSaver' | 'treasureNose' | 'tidyPet'
export interface ISpecialOption {
  key: SpecialKey
  value: number
}

export interface IEquipmentItem {
  id: string
  templateId: string
  name: string
  emoji: string
  slot: EnumEquipmentSlot
  setId: string | null
  grade: EnumEquipmentGrade
  mainStat: StatKey
  // Main stat including the enhance level.
  mainValue: number
  subStats: Partial<Record<StatKey, number>>
  specialOptions: ISpecialOption[]
  // A refine roll waiting to be kept or discarded.
  pendingRefine: { key: StatKey; value: number } | null
  // The youngest form that may wear it (null = any).
  minStage: EnumMonsterStage | null
  stats: IBattleStats
  enhanceLevel: number
  pity: number
  equipped: boolean
  // The pet wearing it (null in the bag).
  monsterId: string | null
}

export interface IFighterEffects {
  burnTurns?: number
  shieldPct?: number
  regenPct?: number
  doubleStrikeChance?: number
  critChance?: number
  critDamage?: number
  evasion?: number
  // Boss-set effects made for the real-time arena.
  burnBonus?: number
  shieldRefresh?: number
  cooldownCut?: number
  lastStandShield?: number
  dodgeCdCutSec?: number
  afterDodgeBonus?: number
  // Craft-set effects (arena only). `*OnBasic` are chances in percent.
  damageCut?: number
  executeBonus?: number
  slowOnBasic?: number
  defDownOnBasic?: number
  poisonOnBasic?: number
  curseOnBasic?: number
  stunOnBasic?: number
  poisonBonus?: number
  retort?: number
  lifesteal?: number
  firstStrike?: number
  thorns?: number
}

// One equipment set with how many of its pieces the shown pet wears (GET /equipment).
export interface ISetProgress {
  setId: string
  name: string
  // The full set: its largest bonus tier.
  pieceCount: number
  worn: number
  // Every worn piece is at the enhance threshold or higher: percent bonuses are multiplied.
  isEnhanced: boolean
  tiers: { pieces: number; pct: Partial<IBattleStats> | null; effect: IFighterEffects | null }[]
}

// The pet's arena-only numbers (GET /equipment `arenaStats`). 0 / false / null = it has none.
export interface IArenaStats {
  // HP as it is in a fight (the arena HP lean applied).
  fightHp: number
  eva: number
  acc: number
  res: number
  attackSpeed: number
  cdCut: number
  doubleStrike: number
  firstStrike: boolean
  executeBonus: number
  burnChance: number
  burnBonus: number
  poisonBonus: number
  onBasic: { status: string; chance: number }[]
  afterDodgeBonus: number
  noCrit: boolean
  regenPct: number
  regenPerSec: number
  lifesteal: number
  thorns: number
  damageCut: number
  startShield: number
  periodicShield: { pct: number; sec: number } | null
  lastStand: { belowPct: number; shield: number } | null
  dodgeCdCut: number
  retort: number
}

export interface IEquipmentData {
  capacity: number
  items: IEquipmentItem[]
  // The pet this screen is about (the selected one) and every living pet, to name who wears what.
  monsterId: string | null
  pets: { id: string; name: string; emoji: string; sprite?: string | null }[]
  // Battle effects of the worn four-piece sets.
  activeEffects: IFighterEffects
  setBonuses: { setId: string; name: string; pieces: number }[]
  sets: ISetProgress[]
  enhance: { threshold: number; multiplier: number }
  // The living monster's battle stats with the worn gear and passives; null without a hatched monster.
  stats: IBattleStats | null
  // Its crit rate (%), crit damage (% multiplier) and evasion (%) with gear and passives.
  combat: { critRate: number; critDamage: number; evasion: number } | null
  // Arena-only numbers (regen, lifesteal, line EVA/ACC/RES ...); null without a hatched monster.
  arenaStats: IArenaStats | null
}

export type EnhanceFailure = 'material' | 'drop' | 'drop_or_break'

export type IEnhancePreview =
  | { maxed: true; item: IEquipmentItem }
  | {
      maxed: false
      item: IEquipmentItem
      targetLevel: number
      baseRate: number
      rate: number
      onFail: EnhanceFailure
      canProtect: boolean
      cost: { coin: number; stones: number }
    }

export interface IEnhanceOutcome {
  success: boolean
  broke: boolean
  rate: number
  fromLevel: number
  toLevel: number
  protectUsed: boolean
}
