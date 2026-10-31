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
  raidToken: number
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
  autoBattleReadyAt: string | null
  // Set while out on an expedition; `expeditionReturned` = back home, waiting to be collected.
  expeditionAreaId: string | null
  expeditionMinutes: number
  expeditionReturned: boolean
  expeditionPendingCoins: number
  expeditionPendingDrops: number
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
  // Set effects: a burn tick or regen (the side whose HP changed is opposite to `actor`), or the
  // extra hit of a double strike. `absorbed` is damage a set shield soaked up (part of `damage`).
  kind?: 'burn' | 'regen' | 'double'
  absorbed?: number
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
  // A piece of equipment this win dropped, or null; `dropBagFull` = it would have, but no room.
  drop: IEquipmentItem | null
  dropBagFull: boolean
}

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
}

export type StatKey = keyof IBattleStats

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
  stats: IBattleStats
  enhanceLevel: number
  pity: number
  equipped: boolean
}

export interface IFighterEffects {
  burnTurns?: number
  shieldPct?: number
  regenPct?: number
  doubleStrikeChance?: number
}

export interface IEquipmentData {
  capacity: number
  items: IEquipmentItem[]
  // Battle effects of the worn four-piece sets.
  activeEffects: IFighterEffects
  setBonuses: { setId: string; name: string; pieces: number }[]
  // The living monster's battle stats with the worn gear; null without a hatched monster.
  stats: IBattleStats | null
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

export interface IAdventureStage {
  id: string
  isBoss: boolean
  enemy: IFighter
  reward: number
  firstClearReward: number
  firstClearGems: number
  // Coins one auto-battle win pays; null for bosses, which can't be auto-battled.
  autoReward: number | null
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

export interface IInventoryItem {
  itemId: string
  quantity: number
}

export interface IQuest {
  id: string
  name: string
  emoji: string
  target: number
  coinReward: number
  progress: number
  claimed: boolean
}

export interface IQuestsData {
  date: string
  resetsAt: string
  quests: IQuest[]
}

export interface IExpeditionArea {
  id: string
  name: string
  emoji: string
  unlocked: boolean
  baseRatePerHour: number
  // What this monster earns here per hour; null without a hatched monster.
  ratePerHour: number | null
}

export interface IExpeditionData {
  maxMinutes: number
  areas: IExpeditionArea[]
}

export interface IExpeditionSummary {
  areaId: string
  minutes: number
  coins: number
  items: string[]
}

export interface IRaidDifficultyInfo {
  difficulty: 'normal' | 'hard' | 'nightmare'
  minStage: EnumMonsterStage
  grade: EnumEquipmentGrade
  raidTokens: number
  exchangeCost: number
  enemy: IFighter
  clearCount: number
  unlocked: boolean
}

export interface IRaidBossInfo {
  id: string
  name: string
  emoji: string
  element: EnumMonsterLine
  setId: string
  setName: string
  bossTokens: number
  difficulties: IRaidDifficultyInfo[]
}

export interface IRaidData {
  attemptsLeft: number
  bosses: IRaidBossInfo[]
}

export interface IRaidBattleResponse {
  monster: IMonsterData
  battle: {
    won: boolean
    rounds: number
    events: IBattleEvent[]
    player: IFighter
    enemy: IFighter
  }
  isFirstClear: boolean
  raidTokens: number
  bossTokens: number
  drop: IEquipmentItem | null
  attemptsLeft: number
  wallet: IWallet
}

export interface IPvpOpponent {
  id: string
  displayName: string
  emoji: string
  name: string
  element: EnumMonsterLine
  stats: IBattleStats
  rating: number
  isNpc: boolean
}

export interface ISeasonRewardTier {
  maxRank: number | null
  coin: number
  gem: number
  raidToken: number
}

export interface IPvpStatus {
  season: string
  resetsAt: string
  rating: number
  wins: number
  losses: number
  rank: number | null
  attemptsLeft: number
  defense: {
    displayName: string
    fighter: IFighter
    stage: EnumMonsterStage
    setAt: string
    readyAt: string
  } | null
  claimableSeasons: {
    season: string
    rank: number
    rating: number
    reward: ISeasonRewardTier | null
  }[]
}

export interface IPvpBattleResponse {
  monster: IMonsterData
  battle: {
    won: boolean
    rounds: number
    events: IBattleEvent[]
    player: IFighter
    enemy: IFighter
    reward: number
  }
  rating: { before: number; after: number }
  attemptsLeft: number
  wallet: IWallet
}

export interface IPvpHistoryEntry {
  id: string
  season: string
  role: 'attacker' | 'defender'
  won: boolean
  opponentName: string
  opponentEmoji: string
  ratingBefore: number
  ratingAfter: number | null
  createdAt: string
}

export interface IPvpReplay {
  role: 'attacker' | 'defender'
  attackerWon: boolean
  rounds: number
  events: IBattleEvent[]
  attacker: IFighter
  defender: IFighter
}

export interface IPvpLeaderboardEntry {
  rank: number
  displayName: string
  emoji: string | null
  name: string | null
  rating: number
  wins: number
  losses: number
  isMe: boolean
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
    recoveryPerMinute: number
    recoveryOnlineMultiplier: number
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
  idle: {
    expeditionMaxMinutes: number
    expeditionDrainMultiplier: number
    expeditionDropEveryMinutes: number
    expeditionPowerMultiplierMin: number
    expeditionPowerMultiplierMax: number
    expeditionAreas: {
      id: string
      name: string
      emoji: string
      baseRatePerHour: number
      autoBattleRewards: { name: string; coins: number }[]
    }[]
    autoBattleCooldownSeconds: number
    autoBattleStaminaCost: number
    autoBattleDailyCoinCap: number
  }
  equipment: {
    capacity: number
    slots: Record<EnumEquipmentSlot, { stat: StatKey; base: number }>
    gradeMultiplier: Record<EnumEquipmentGrade, number>
    boxPrice: number
    boxGradeRates: Partial<Record<EnumEquipmentGrade, number>>
    dropChancePercent: number
    dropGradeRatesByArea: Record<string, Partial<Record<EnumEquipmentGrade, number>>>
    dismantleStones: Record<EnumEquipmentGrade, number>
    materials: {
      id: string
      name: string
      emoji: string
      description: string
      price: number
      currency: 'coin' | 'gem' | 'raid_token'
    }[]
    sets: Record<
      string,
      {
        name: string
        bonuses: {
          pieces: 2 | 4
          pct?: Partial<IBattleStats>
          effect?: IFighterEffects
        }[]
      }
    >
    expeditionStoneEveryMinutes: number
    enhance: {
      maxLevel: number
      bonusPerLevel: number
      milestoneBonus: number
      milestoneEvery: number
      pityPerFail: number
      pityMax: number
      steps: {
        level: number
        rate: number
        onFail: EnhanceFailure
        coin: number
        stones: number
      }[]
    }
  }
  raid: {
    dailyAttempts: number
    bossTokensPerWin: number
    firstClearMultiplier: number
    exchangeCost: Partial<Record<EnumEquipmentGrade, number>>
    bosses: { id: string; name: string; emoji: string; element: EnumMonsterLine; setId: string }[]
    difficulties: {
      difficulty: string
      minStage: EnumMonsterStage
      grade: EnumEquipmentGrade
      raidTokens: number
    }[]
    setEnhanceThreshold: number
    setEnhanceMultiplier: number
  }
  pvp: {
    stages: EnumMonsterStage[]
    startRating: number
    kAttacker: number
    kDefender: number
    dailyAttempts: number
    winCoin: number
    lossCoin: number
    defenseCooldownMinutes: number
    opponentCount: number
    maxFightsPerOpponentPerDay: number
    ratingWindow: number
    seasonMinFights: number
    seasonResetKeep: number
    seasonRewards: ISeasonRewardTier[]
    npcs: { stage: EnumMonsterStage; name: string; emoji: string; rating: number }[]
  }
  economy: {
    shopItems: IShopItem[]
    dailyQuests: Pick<IQuest, 'id' | 'name' | 'emoji' | 'coinReward'>[]
    dexDiscoveryGems: number
  }
}
