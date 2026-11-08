import type { IEquipmentItem } from './equipment'
import type { ILoadout } from './progression'

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
  // Sent home (กลับดาว) for a Pet Core.
  RETURNED = 'returned',
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
  // Pixel-art sprite id (sprites/sprite-registry.ts); null = no art yet, show the emoji.
  sprite?: string | null
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
  // Pixel-art sprite id (sprites/sprite-registry.ts); null = no art yet, show the emoji.
  sprite?: string | null
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
