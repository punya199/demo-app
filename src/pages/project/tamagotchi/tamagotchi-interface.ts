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
  emoji: string
  fullness: number
  strength: number
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
  // The target dodged the hit (damage is 0).
  isDodged?: boolean
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
  // The pet wearing it (null in the bag).
  monsterId: string | null
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
  // The pet this screen is about (the selected one) and every living pet, to name who wears what.
  monsterId: string | null
  pets: { id: string; name: string; emoji: string }[]
  // Battle effects of the worn four-piece sets.
  activeEffects: IFighterEffects
  setBonuses: { setId: string; name: string; pieces: number }[]
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

export interface IProfile {
  displayName: string
  friendCode: string
}

export interface IFriend {
  relationId: string
  displayName: string
  monster: { emoji: string; stage: EnumMonsterStage } | null
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
  stage: EnumMonsterStage
  stats: IBattleStats
  effects: IFighterEffects | null
  setAt: string
  readyAt: string
}

export interface IRentableUnit extends ISupportUnit {
  ownerName: string
}

export interface IWorldBossReward {
  coin: number
  raidToken: number
  bossToken: number
  pieceGrade: EnumEquipmentGrade | null
}

export interface IWorldBossStatus {
  week: string
  endsAt: string
  boss: {
    id: string
    name: string
    emoji: string
    setId: string
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
  battle: {
    rounds: number
    events: IBattleEvent[]
    player: IFighter
    team: IFighter[]
    // The boss as it was going in, with the HP the whole server had left.
    enemy: IFighter
    damage: number
    survived: boolean
  }
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
  resetsAt: string
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
  online: { graceMinutes: number; evolutionMultiplier: number }
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
    defenseFactor: number
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
    pvpSeasonPoints: { maxRank: number | null; points: number }[]
  }
  worldBoss: {
    hits: number
    resetHours: number
    rounds: number
    bosses: { id: string; name: string; emoji: string; setId: string; hp: number }[]
    perHit: { coin: number; raidToken: number }
    defeatedBonus: { coin: number; raidToken: number }
    killingBlowGrade: EnumEquipmentGrade
    rankRewards: {
      maxRank: number | null
      raidToken: number
      bossToken: number
      pieceChance: number
      pieceGrade: EnumEquipmentGrade
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

export interface IPassiveNode {
  id: string
  name: string
  kind: 'small' | 'notable' | 'key'
  arm: 'flame' | 'tide' | 'leaf' | 'bridge'
  fx: Partial<Record<PassiveEffectKey, number>>
  x: number
  y: number
  adj: string[]
}

// GET /passive: the whole graph (drawn as is), what the player owns and what they can still do.
export interface IPassiveState {
  nodes: IPassiveNode[]
  allocated: string[]
  points: {
    earned: number
    used: number
    left: number
    sources: {
      dexSpecies: number
      raidFirstClears: number
      worldBossDefeats: number
      pvpSeasons: number
    }
  }
  respec: { refunded: number; freeLeft: number; gemPrice: number }
}

// GET /monster/me
export interface IGetMyMonsterResponse {
  // The selected monster, which every other tab plays with.
  monster: IMonsterData | null
  // Every living monster (up to maxMonsters), selected one included.
  monsters: IMonsterData[]
  maxMonsters: number
}
