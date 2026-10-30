export enum EnumMonsterLine {
  FLAME = 'flame',
  TIDE = 'tide',
  LEAF = 'leaf',
}

export enum EnumMonsterStage {
  EGG = 'egg',
  BABY_1 = 'baby_1',
  BABY_2 = 'baby_2',
  ADULT = 'adult',
  PERFECT = 'perfect',
  ULTIMATE = 'ultimate',
}

export enum EnumMonsterDeathCause {
  OLD_AGE = 'old_age',
  SICKNESS = 'sickness',
  STARVATION = 'starvation',
}

export enum EnumMonsterAction {
  FEED = 'feed',
  VITAMIN = 'vitamin',
  TRAIN = 'train',
  CLEAN = 'clean',
  MEDICINE = 'medicine',
  LIGHTS = 'lights',
}

// Mirrors the backend's monster view (demo-app-backend src/modules/monster/monster.service.ts).
// All game rules run on the server - these values are only displayed.
export interface IMonsterData {
  id: string
  line: EnumMonsterLine
  speciesId: string
  stage: EnumMonsterStage
  name: string
  emoji: string
  fullness: number
  strength: number
  weight: number
  poops: number
  isSick: boolean
  isSleeping: boolean
  lightsOn: boolean
  careMistakes: number
  trainCount: number
  wins: number
  losses: number
  ageMinutes: number
  bornAt: string
  trainReadyAt: string | null
  diedAt: string | null
  deathCause: EnumMonsterDeathCause | null
}

export interface IBattleStats {
  hp: number
  atk: number
  def: number
  spd: number
}

export interface IFighter {
  name: string
  emoji: string
  element: EnumMonsterLine
  stats: IBattleStats
  skill: { name: string; power: number }
}

export type BattleSide = 'player' | 'enemy'

export interface IBattleEvent {
  round: number
  actor: BattleSide
  moveName: string
  isSkill: boolean
  damage: number
  isCritical: boolean
  effectiveness: 'strong' | 'weak' | 'normal'
  targetHp: number
}

export interface IBattleData {
  stageId: string
  won: boolean
  rounds: number
  events: IBattleEvent[]
  player: IFighter
  enemy: IFighter
  reward: number
  isFirstClear: boolean
}

export interface IAdventureStage {
  id: string
  isBoss: boolean
  enemy: IFighter
  reward: number
  firstClearReward: number
  clearCount: number
  unlocked: boolean
}

export interface IAdventureArea {
  id: string
  name: string
  emoji: string
  recommendedStage: EnumMonsterStage
  stages: IAdventureStage[]
}

export interface IShopItem {
  id: string
  name: string
  emoji: string
  description: string
  price: number
}

export interface IDexEntry {
  id: string
  line: EnumMonsterLine
  stage: EnumMonsterStage
  discovered: boolean
  name: string | null
  emoji: string | null
}
