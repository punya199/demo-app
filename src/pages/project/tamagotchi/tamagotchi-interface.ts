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
}

export interface ISpeciesSummary {
  id: string
  name: string
  emoji: string
  stage: EnumMonsterStage
}

export interface IEvolutionRuleInfo {
  to: ISpeciesSummary
  maxCareMistakes?: number
  minTrainCount?: number
  minWins?: number
  met: boolean
}

export interface IEvolutionInfo {
  // null once the monster is in a final form.
  durationMinutes: number | null
  progressMinutes: number
  // Stage-progress minutes left; each online minute counts onlineMultiplier of them.
  remainingMinutes: number | null
  onlineMultiplier: number
  // The form it is on track for right now (null = would stay as it is).
  next: ISpeciesSummary | null
  rules: IEvolutionRuleInfo[]
  lifespanRemainingMinutes: number
}

export interface IWallet {
  coin: number
  gem: number
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
  stamina: number
  isSick: boolean
  careMistakes: number
  trainCount: number
  wins: number
  losses: number
  ageMinutes: number
  bornAt: string
  trainReadyAt: string | null
  minigameReadyAt: string | null
  evolution: IEvolutionInfo
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
  gemReward: number
  isFirstClear: boolean
}

export interface IAdventureStage {
  id: string
  isBoss: boolean
  enemy: IFighter
  reward: number
  firstClearReward: number
  firstClearGems: number
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

export interface IWikiSpecies {
  id: string
  line: EnumMonsterLine
  stage: EnumMonsterStage
  name: string
  emoji: string
  minWeight: number
  stats: IBattleStats
  skill: { name: string; power: number }
  evolutions: { to: string; maxCareMistakes?: number; minTrainCount?: number; minWins?: number }[]
}

interface IStageRates {
  fullnessMinutes: number
  strengthMinutes: number
  poopEveryMinutes: number
}

type HatchedStage = Exclude<EnumMonsterStage, EnumMonsterStage.EGG>

// GET /monster/wiki: the game's rule constants and data, used by the in-game guide.
export interface IWikiData {
  care: {
    maxHearts: number
    maxPoops: number
    hatchFullness: number
    hatchStrength: number
    stageRates: Record<HatchedStage, IStageRates>
    neglectFirstMistakeMinutes: number
    neglectRepeatMistakeMinutes: number
    sickAfterHungryMinutes: number
    deathAfterSickMinutes: number
    deathAfterHungryMinutes: number
    lifespanMinutes: number
    feedWeightGain: number
    vitaminWeightGain: number
    trainWeightLoss: number
    trainCooldownMinutes: number
  }
  online: { graceMinutes: number; evolutionMultiplier: number }
  stamina: {
    max: number
    drainFullMinutesOffline: number
    drainFullMinutesOnline: number
    battleCost: number
    noStaminaStatMultiplier: number
    minigameRounds: number
    minigameRewards: number[]
    minigameCooldownMinutes: number
    refillGemPrice: number
  }
  evolution: {
    stageDurationMinutes: Record<EnumMonsterStage, number | null>
    species: IWikiSpecies[]
  }
  battle: {
    atkBonusPerStrengthHeart: number
    hungryAtkMultiplier: number
    overweightRatio: number
    overweightSpdMultiplier: number
    maxRounds: number
    skillEveryRounds: number
    criticalChance: number
    criticalMultiplier: number
    strongMultiplier: number
    weakMultiplier: number
    defenseFactor: number
    damageVariance: number
    weightLoss: number
    beats: Record<EnumMonsterLine, EnumMonsterLine>
  }
  adventure: {
    firstClearMultiplier: number
    areas: {
      id: string
      name: string
      emoji: string
      recommendedStage: EnumMonsterStage
      stages: {
        id: string
        isBoss: boolean
        reward: number
        firstClearGems: number
        enemy: IFighter
      }[]
    }[]
  }
  economy: { shopItems: IShopItem[]; dexDiscoveryGems: number }
}
