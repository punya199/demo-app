import type { EnumMonsterLine, EnumMonsterStage, IBattleStats, IFighter } from './monster'
import type { EnumFurnitureKind } from './farm'
import type {
  EnumEquipmentSlot,
  EnumEquipmentGrade,
  StatKey,
  SpecialKey,
  IFighterEffects,
  EnhanceFailure,
} from './equipment'
import type { IShopItem, IQuest } from './social'
import type { ISeasonRewardTier } from './pvp'

export interface IDexEntry {
  id: string
  line: EnumMonsterLine
  stage: EnumMonsterStage
  discovered: boolean
  name: string | null
  emoji: string | null
  // Pixel-art sprite id (sprites/sprite-registry.ts); null = no art yet, show the emoji.
  sprite?: string | null
}

export interface IWikiSpecies {
  id: string
  line: EnumMonsterLine
  stage: EnumMonsterStage
  name: string
  emoji: string
  // Pixel-art sprite id; null for a form without art.
  sprite?: string | null
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
  // Pixel-art sprite id (awakened forms and the 13 hybrids of two lines all have one).
  sprite?: string | null
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
    // False while only two monsters of the same line can merge (the server then lists only those forms).
    crossLineEnabled?: boolean
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
    // Most runs one skip may sweep.
    skipMaxRuns: number
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
    }[]
  }
  // The real-time arena: only what the guide shows (statuses and crowd-control rules).
  arena: {
    timeLimitSec: number
    // Forms that fight with skills, and the wait every skill has after any cast (seconds).
    skilledStages: EnumMonsterStage[]
    // Skill strength (percent) by the stage of the form that carries the skill. Absent on an older
    // backend.
    skillTierPct?: {
      baby2: number
      adult: number
      perfect: number
      ultimate: number
      fused: number
    }
    skillDelaySec: number
    defenseK: number
    maxDefenseReduction: number
    damageVarianceMin: number
    damageVarianceMax: number
    strongMultiplier: number
    weakMultiplier: number
    // Percent (15 = 15%) and a multiplier (1.5).
    critChance: number
    critMultiplier: number
    dodgeBase: number
    dodgeMax: number
    dodgeMinCooldown: number
    bossRes: number
    lineEva: Record<EnumMonsterLine, number>
    lineAcc: Record<EnumMonsterLine, number>
    lineRes: Record<EnumMonsterLine, number>
    maxResist: number
    statuses: Record<
      string,
      { label: string; icon: string; kind: 'buff' | 'debuff'; cc?: boolean; note: string }
    >
    statusNumbers: { ccWindowSec: number; ccSteps: number[]; poisonMaxStacks: number }
  }
  // Craft (phase 5.6): every number the craft screen and its guide page use.
  // The Farm: bonus on a care timer's minutes by tier (index 0 = none), and what tiers 2 and 3 cost.
  farm: {
    buyCoin: number
    craft: Record<
      '2' | '3',
      { coin: number; minutes: number; essence: number; rune: number; catalyst: number }
    >
    furniture: { kind: EnumFurnitureKind; bonus: number[]; essence: string }[]
  }
  petCore: { stages: EnumMonsterStage[]; perReturn: number; itemPrefix: string }
  dummy: { fightSec: number; defMax: number; defenseK: number; maxDefenseReduction: number }
  craft: {
    tiers: Record<
      'standard' | 'flagship',
      { coin: number; minutes: number; baseGrade: EnumEquipmentGrade; maxGrade: EnumEquipmentGrade }
    >
    catalystChance: number
    pityAfterFails: number
    adventureEssence: {
      chance: number
      min: number
      max: number
      areaElement: Record<string, string | undefined>
    }
    raidCores: Record<string, number>
    worldBoss: {
      unique: number
      catalyst: number
      topRank: number
      topUnique: number
      topCatalyst: number
    }
    materials: {
      id: string
      name: string
      emoji: string
      description: string
      source: 'adventure' | 'expedition' | 'raid' | 'world_boss'
      tier: 'common' | 'rare' | 'unique' | 'catalyst'
    }[]
    sets: {
      id: string
      name: string
      style: string
      flagship: boolean
      care: boolean
      essence: string
      rare: string
      unique: string | null
    }[]
  }
  equipment: {
    capacity: number
    slots: Record<EnumEquipmentSlot, { stat: StatKey; base: number }>
    gradeMultiplier: Record<EnumEquipmentGrade, number>
    subStatCount: Record<EnumEquipmentGrade, { min: number; max: number }>
    minStageByGrade: Record<EnumEquipmentGrade, EnumMonsterStage | null>
    special: {
      // Per grade: chance to have any option, `guaranteed` options (default 1) before the bonus
      // `secondChance` roll, and how far along each option's range the value rolls (lo-hi).
      byGrade: Record<
        EnumEquipmentGrade,
        { chance: number; secondChance: number; lo: number; hi: number; guaranteed?: number }
      >
      totalCapMultiplier: number
    }
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
          // Craft care sets: perks (in percent) from the 2-piece bonus.
          care?: Partial<Record<SpecialKey, number>>
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
    secondsPerTurn: number
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
    // Every boss grows a stage at each of these seconds of a fight: +atk% ATK and +def% DEF.
    grow: { secs: number[]; atk: number; def: number }
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
