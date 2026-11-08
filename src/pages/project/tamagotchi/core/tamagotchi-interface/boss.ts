import type { IArenaFight } from '../../arena/arena-interface'
import type { EnumMonsterLine, EnumMonsterStage, IWallet, IMonsterData, IFighter } from './monster'
import type { EnumEquipmentGrade, IEquipmentItem } from './equipment'
import type { ILoadout } from './progression'

export interface IBossSkillView {
  id: string
  name: string
  icon: string
  element: string
  kind: string
  slot: 'active' | 'passive' | 'dodge'
  // Seconds; 0 for a passive.
  cooldown: number
  description: string
}

// What a boss screen shows about a boss: final stats, the damage its DEF cuts, and its skills.
export interface IBossDetail {
  stats: { hp: number; atk: number; def: number; spd: number }
  // Base cut from DEF alone, in percent (status effects such as DEF down change it in a fight).
  defReductionPct: number
  skills: IBossSkillView[]
  passives: string[]
  dodge: IBossSkillView | null
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
    sprite?: string
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
    // `stats.hp` is the week's shared pool.
    detail: IBossDetail
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
  ally: { name: string; emoji: string; sprite?: string | null; damage: number; fee: number } | null
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
  defReductionPct: number
  clearCount: number
  unlocked: boolean
}

export interface IRaidBossInfo {
  id: string
  name: string
  emoji: string
  sprite?: string
  element: EnumMonsterLine
  setId: string
  setName: string
  bossTokens: number
  // Skills are the same on every difficulty; stats are on each difficulty's `enemy`.
  detail: IBossDetail
  difficulties: IRaidDifficultyInfo[]
}

export type DummyPreset = 'plain' | 'raid' | 'world'

export interface IDummyPresets {
  fightSec: number
  defDefault: number
  defMax: number
  elements: string[]
  raidBosses: { id: string; name: string; emoji: string; sprite?: string }[]
  difficulties: string[]
  worldBosses: { id: string; name: string; emoji: string; sprite?: string }[]
}

export interface IDummyFightInput {
  preset: DummyPreset
  def?: number
  element?: string
  bossId?: string
  difficulty?: string
}

export interface IDummySummary {
  totalDamage: number
  seconds: number
  dps: number
  hits: number
  crits: number
  avgHit: number
  bestHit: { damage: number; skill: string | null } | null
}

export interface IDummyFightResponse {
  battle: IArenaFight
  summary: IDummySummary
  dummy: { def: number; defReductionPct: number }
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
