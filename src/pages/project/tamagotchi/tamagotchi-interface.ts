import type { IArenaEnemy, IArenaFight } from './arena-interface'
export enum EnumMonsterLine {
  FLAME = 'flame',
  TIDE = 'tide',
  LEAF = 'leaf',
  EARTH = 'earth',
  LIGHTNING = 'lightning',
  HOLY = 'holy',
  DARK = 'dark',
  SHADOW = 'shadow',
}

export enum EnumMonsterStage {
  EGG = 'egg',
  BABY_1 = 'baby_1',
  BABY_2 = 'baby_2',
  ADULT = 'adult',
  PERFECT = 'perfect',
  ULTIMATE = 'ultimate',
  // Two merged Ultimates: the final form.
  FUSED = 'fused',
}

export enum EnumMonsterDeathCause {
  OLD_AGE = 'old_age',
  SICKNESS = 'sickness',
  STARVATION = 'starvation',
  // Consumed as a parent of a merge.
  MERGED = 'merged',
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
// min / max / rolled value of one stat. HP/ATK/DEF/SPD are the form's own numbers; the extra stats
// are in percent (crit damage as a percent multiplier).
export interface IPotentialStat {
  min: number
  max: number
  value: number
}

export type PotentialStatKey = 'hp' | 'atk' | 'def' | 'spd' | 'critRate' | 'critDamage' | 'evasion'

export interface IPotentialView {
  // A monster from before potential existed: no grade, old fixed stats.
  isLegacy: boolean
  grade: string | null
  // Average roll in percent of the range.
  average: number | null
  stats: Record<PotentialStatKey, IPotentialStat>
}

export interface IMonsterData {
  id: string
  line: EnumMonsterLine
  speciesId: string
  stage: EnumMonsterStage
  name: string
  // The owner's name for it (null = none), and what to show: nickname or species name.
  nickname: string | null
  displayName: string
  // What it wears: slot -> costume id.
  costume: ILoadout
  emoji: string
  fullness: number
  strength: number
  // Adventure stamina (0-100): regained over time, spent by adventure fights.
  stamina: number
  weight: number
  poops: number
  isSick: boolean
  careMistakes: number
  trainCount: number
  wins: number
  losses: number
  ageMinutes: number
  bornAt: string
  // Fighting stats from care (hunger, strength, weight) before gear; null for an egg.
  battleStats: IBattleStats | null
  potentialView: IPotentialView
  trainReadyAt: string | null
  autoBattleReadyAt: string | null
  minigameReadyAt: string | null
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
  nickname?: string
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
  // The target dodged the hit (damage is 0).
  isDodged?: boolean
  // Passive keystones: HP the attacker healed (lifesteal) or took back from thorns, and its HP
  // afterwards (present whenever one of them is).
  healed?: number
  reflected?: number
  actorHp?: number
  // Team fights: which member of the player's side attacked, or was hit when the enemy attacks.
  member?: number
}

export interface IBattleData {
  stageId: string
  won: boolean
  rounds: number
  events: IBattleEvent[]
  player: IFighter
  // Everyone on the player's side, the player first (a rented ally makes it two).
  team?: IFighter[]
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

export interface IEquipmentData {
  capacity: number
  items: IEquipmentItem[]
  // The pet this screen is about (the selected one) and every living pet, to name who wears what.
  monsterId: string | null
  pets: { id: string; name: string; emoji: string }[]
  // Battle effects of the worn four-piece sets.
  activeEffects: IFighterEffects
  setBonuses: { setId: string; name: string; pieces: number }[]
  sets: ISetProgress[]
  enhance: { threshold: number; multiplier: number }
  // The living monster's battle stats with the worn gear and passives; null without a hatched monster.
  stats: IBattleStats | null
  // Its crit rate (%), crit damage (% multiplier) and evasion (%) with gear and passives.
  combat: { critRate: number; critDamage: number; evasion: number } | null
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
  // The stage's arena enemy (adventure fights run in the real-time arena).
  enemy: IArenaEnemy | null
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
  gemReward: number
  progress: number
  claimed: boolean
}

export interface ILoginReward {
  coin: number
  gem: number
}

export interface IQuestsData {
  date: string
  resetsAt: string
  quests: IQuest[]
  weekly: { week: string; resetsAt: string; quests: IQuest[] }
  login: {
    claimedToday: boolean
    streak: number
    // 1-based day in the 7-day cycle: today's reward if claimed, otherwise the next one.
    day: number
    reward: ILoginReward
    rewards: ILoginReward[]
  }
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

export interface IProfile {
  displayName: string
  friendCode: string
}

export interface IFriend {
  relationId: string
  displayName: string
  monster: { emoji: string; stage: EnumMonsterStage; costume: ILoadout | null } | null
  points: number
  hasSupport: boolean
  canGreet: boolean
}

export interface IFriendRequest {
  relationId: string
  displayName: string
}

export interface IFriendsData {
  friendLimit: number
  giftsLeft: number
  friends: IFriend[]
  incoming: IFriendRequest[]
  outgoing: IFriendRequest[]
}

export interface IFriendVisit {
  displayName: string
  points: number
  monster: {
    emoji: string
    name: string
    nickname: string | null
    costume: ILoadout | null
    stage: EnumMonsterStage
    ageMinutes: number
    isSick: boolean
    isExploring: boolean
    wins: number
    losses: number
    stats: IBattleStats
  } | null
}

export interface ISupportUnit {
  supportId: string
  emoji: string
  name: string
  nickname: string | null
  stage: EnumMonsterStage
  stats: IBattleStats
  effects: IFighterEffects | null
  setAt: string
  readyAt: string
}

export interface IRentableUnit extends ISupportUnit {
  ownerName: string
  costume: ILoadout | null
}

export interface IWorldBossReward {
  coin: number
  raidToken: number
  bossToken: number
  pieceGrade: EnumEquipmentGrade | null
  refineStones: Record<string, number>
}

export interface IWorldBossStatus {
  week: string
  endsAt: string
  boss: {
    id: string
    name: string
    emoji: string
    setId: string
    setName: string
    element: EnumMonsterLine
    // Flat damage every hit has to chew through first (0 = none).
    shield: number
    // From this round on the boss hits harder (null = never).
    enrage: { sec: number; mult: number } | null
    ability: string
    hp: number
    maxHp: number
    isDefeated: boolean
  }
  hitsLeft: number
  // When the hit allowance refills.
  resetsAt: string
  participants: number
  myDamage: number
  myHits: number
  myRank: number | null
  // Finished weeks (or fallen bosses) with a reward waiting to be claimed.
  claimable: {
    week: string
    bossName: string
    rank: number
    defeated: boolean
    reward: IWorldBossReward
  }[]
}

export interface IWorldBossAttackResponse {
  monster: IMonsterData
  battle: IArenaFight & { damage: number; survived: boolean }
  // The renter's own damage (what the ranking counts).
  damage: number
  ally: { name: string; emoji: string; damage: number; fee: number } | null
  bossHp: number
  maxHp: number
  isKillingBlow: boolean
  hitsLeft: number
  // When the hit allowance refills.
  resetsAt: string
}

export interface IWorldBossRankingEntry {
  rank: number
  displayName: string
  emoji: string | null
  costume: ILoadout | null
  damage: number
  hits: number
  isMe: boolean
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
  // When the attempts refill.
  resetsAt: string
  bosses: IRaidBossInfo[]
}

export interface IRaidBattleResponse {
  monster: IMonsterData
  battle: IArenaFight
  isFirstClear: boolean
  raidTokens: number
  bossTokens: number
  // The refine stone a win dropped (null on a loss or on Normal).
  refineStone: string | null
  drop: IEquipmentItem | null
  attemptsLeft: number
  resetsAt: string
  wallet: IWallet
}

export interface IPvpOpponent {
  id: string
  displayName: string
  emoji: string
  name: string
  nickname: string | null
  costume: ILoadout | null
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
  battle: IArenaFight & { reward: number }
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

// A fight from before PvP moved to the arena replays on the old turn screen.
export interface IPvpTurnReplay {
  kind?: undefined
  role: 'attacker' | 'defender'
  attackerWon: boolean
  rounds: number
  events: IBattleEvent[]
  attacker: IFighter
  defender: IFighter
}

export type IPvpReplay =
  | IPvpTurnReplay
  | (IArenaFight & { role: 'attacker' | 'defender'; attackerWon: boolean })

export interface IPvpLeaderboardEntry {
  rank: number
  displayName: string
  emoji: string | null
  name: string | null
  nickname: string | null
  costume: ILoadout | null
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

export interface IMergeForm {
  id: string
  // The two parent lines this form is made from (the same twice for an awakened form).
  lines: [EnumMonsterLine, EnumMonsterLine]
  name: string
  emoji: string
  stats: IBattleStats
}

interface IStageRates {
  fullnessMinutes: number
  strengthMinutes: number
  poopEveryMinutes: number
}

type HatchedStage = Exclude<EnumMonsterStage, EnumMonsterStage.EGG>

// GET /monster/wiki: the game's rule constants and data, used by the in-game guide.
export interface IWikiStamina {
  max: number
  adventureCost: number
  regenPerHour: number
  onlineRegenMultiplier: number
  minigameRounds: number
  minigameRewards: number[]
  minigameCooldownMinutes: number
  refillGemPrice: number
}

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
    fusedLifespanMinutes: number
    feedWeightGain: number
    vitaminWeightGain: number
    trainWeightLoss: number
    trainCooldownMinutes: number
  }
  online: { graceMinutes: number; evolutionMultiplier: number; staminaRegenMultiplier: number }
  stamina: IWikiStamina
  evolution: {
    stageDurationMinutes: Record<EnumMonsterStage, number | null>
    species: IWikiSpecies[]
  }
  merge: {
    coinCost: number
    gemCost: number
    powerMultiplier: number
    // Spiritual elements only merge with each other, natural ones with natural ones.
    spiritualLines: EnumMonsterLine[]
    lifespanMinutes: number
    forms: IMergeForm[]
  }
  // Spiritual eggs are rare: hatching one costs Raid Tokens.
  rareEgg: { lines: EnumMonsterLine[]; raidTokenPrice: number }
  potential: {
    statSpread: number
    critRateBonusMax: number
    critDamageBonusMax: number
    evasionMax: number
    critRateCap: number
    critDamageCap: number
    evasionCap: number
    grades: { grade: string; minAverage: number }[]
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
    defenseK: number
    maxDefenseReduction: number
    damageVariance: number
    weightLoss: number
    beats: Record<EnumMonsterLine, EnumMonsterLine[]>
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
    dismantleStoneLevelStep: number
    refineTiers: { material: string; name: string; maxLevel: number; coin: number }[]
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
  social: {
    friendLimit: number
    requestLimit: number
    greetsPerDayPerFriend: number
    giftsPerDay: number
    pointsGreet: number
    pointsGift: number
    pointsRental: number
    supportCooldownMinutes: number
    rentalFee: number
    rentalOwnerDailyCap: number
  }
  passive: {
    maxPoints: number
    freeRefunds: number
    respecGemPrice: number
    economyCap: number
    branchRefundCap: number
    ascendancyMaxPoints: number
    ascendancyResetGemPrice: number
    masteryRepickGemPrice: number
    adventureMaxPoints: number
    winsPerPoint: number
    winMaxPoints: number
    pvpSeasonPoints: { maxRank: number | null; points: number }[]
    arenaRegenPerSecPct: number
    arenaBurnChance: number
    arenaAttackSpeedPct: number
    arenaAttackSpeedCap: number
  }
  worldBoss: {
    hits: number
    resetHours: number
    rounds: number
    bosses: {
      id: string
      name: string
      emoji: string
      setId: string
      element: EnumMonsterLine
      hp: number
      shield?: number
      enrage?: { sec: number; mult: number }
      ability: string
    }[]
    perHit: { coin: number; raidToken: number }
    defeatedBonus: { coin: number; raidToken: number }
    killingBlowGrade: EnumEquipmentGrade
    rankRewards: {
      maxRank: number | null
      raidToken: number
      bossToken: number
      pieceChance: number
      pieceGrade: EnumEquipmentGrade
      refineStones: Record<string, number>
    }[]
  }
  raid: {
    attempts: number
    resetHours: number
    bossTokensPerWin: number
    firstClearMultiplier: number
    exchangeCost: Partial<Record<EnumEquipmentGrade, number>>
    bosses: { id: string; name: string; emoji: string; element: EnumMonsterLine; setId: string }[]
    difficulties: {
      difficulty: string
      minStage: EnumMonsterStage
      grade: EnumEquipmentGrade
      raidTokens: number
      refineStone: string | null
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
    dailyQuests: Pick<IQuest, 'id' | 'name' | 'emoji' | 'coinReward' | 'gemReward'>[]
    weeklyQuests: Pick<IQuest, 'id' | 'name' | 'emoji' | 'coinReward' | 'gemReward'>[]
    dexDiscoveryGems: number
  }
}

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
