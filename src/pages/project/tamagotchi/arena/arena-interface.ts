// Types for the real-time arena (adventure fights) and the skill screen, mirroring the backend's
// arena module (demo-app-backend src/modules/monster/arena/).
import type {
  EnumMonsterLine,
  EnumMonsterStage,
  IEquipmentItem,
} from '../core/tamagotchi-interface'

export type ArenaElement = `${EnumMonsterLine}` | 'neutral'

export type StatusId =
  | 'burn'
  | 'poison'
  | 'slow'
  | 'root'
  | 'stun'
  | 'silence'
  | 'blind'
  | 'static'
  | 'atkDown'
  | 'defDown'
  | 'evaDown'
  | 'curse'
  | 'atkUp'
  | 'defUp'
  | 'haste'
  | 'regen'
  | 'evaUp'
  | 'focus'
  | 'immune'

export interface IArenaStatusInfo {
  label: string
  icon: string
  kind: 'buff' | 'debuff'
  cc?: boolean
  note: string
}

export interface IArenaFx {
  st: StatusId
  dur: number
  ch: number
  to?: 'self'
  val?: number
  mag?: number
}

export interface IArenaPassive {
  rebirthPct?: number
  regenPct?: number
  damageCut?: number
  tenacity?: number
  moveCut?: number
  basicLifesteal?: number
  eva?: number
  dodgeCdCut?: number
  meleeRetort?: { power: number; st: StatusId; dur: number; ch: number }
  onBasic?: { st: StatusId; dur: number; ch: number }
  lastStand?: { belowPct: number; shield: number; immuneSec: number }
  enrage?: { belowPct: number; atk: number }
  afterDodge?: { critNext: boolean; bonus: number }
  critDamage?: number
  noCrit?: boolean
  doubleStrike?: number
  startShield?: number
  firstStrike?: boolean
  thorns?: number
  attackSpeed?: number
  flatShield?: number
  rage?: { sec: number; atk: number }
}

export interface IArenaDodge {
  cd: number
  chance: number
  parry?: number
  onDodge?: {
    haste?: number
    cleanse?: boolean
    blindAttacker?: number
    counter?: number
    vanish?: number
    critNext?: boolean
  }
}

export type ArenaSkillKind =
  | 'melee'
  | 'multi'
  | 'shot'
  | 'spread'
  | 'charge'
  | 'burst'
  | 'zone'
  | 'beam'
  | 'self'
  | 'passive'
  | 'dodge'

export interface IArenaSkill {
  id: string
  name: string
  icon: string
  el: ArenaElement
  src: string
  slot: 'active' | 'passive' | 'dodge'
  kind: ArenaSkillKind
  cd: number
  wind?: number
  power?: number
  hits?: number
  range?: number
  radius?: number
  width?: number
  length?: number
  delay?: number
  fx?: IArenaFx[]
  heal?: number
  shield?: number
  shieldSec?: number
  cleanse?: boolean
  cleanseOnly?: StatusId[]
  execute?: number
  lifesteal?: number
  passive?: IArenaPassive
  dodge?: IArenaDodge
  // Catalog only: the species that unlocks it.
  source?: {
    speciesId: string
    name: string
    emoji: string
    sprite?: string | null
    stage: EnumMonsterStage
  } | null
}

export interface IArenaLoadout {
  s1: string | null
  s2: string | null
  dodge: string | null
}

export interface ISkillPet {
  id: string
  speciesId: string
  stage: EnumMonsterStage
  elements: `${EnumMonsterLine}`[]
  hasSkills: boolean
  innate: string | null
  loadout: IArenaLoadout
}

export interface ISkillState {
  catalog: IArenaSkill[]
  statuses: Record<StatusId, IArenaStatusInfo>
  unlocked: string[]
  selectedId: string | null
  pets: ISkillPet[]
}

export interface IArenaEnemy {
  name: string
  emoji: string
  // Pixel-art sprite id (sprites/sprite-registry.ts); null = no art yet, show the emoji.
  sprite?: string | null
  element: EnumMonsterLine
  isBoss: boolean
  stats: { hp: number; atk: number; def: number; spd: number }
  eva: number
  acc: number
  res: number
  skills: IArenaSkill[]
}

export interface IArenaEvent {
  t: number
  kind: string
  who?: number
  target?: number
  by?: number
  dmg?: number
  absorbed?: number
  crit?: boolean
  elem?: number
  skill?: string
  icon?: string
  x?: number
  y?: number
  x2?: number
  y2?: number
  r?: number
  w?: number
  el?: ArenaElement | null
  st?: StatusId
  dur?: number
  amount?: number
  parried?: boolean
  healed?: number
  reason?: 'ko' | 'time'
}

// f: per fighter [x, y, hp, act, kind, actT, inv, face, shield, statusBits, dodgeCd, ...cooldowns]
export interface IArenaFrame {
  f: number[][]
  p: (number | string)[][]
  z: (number | string)[][]
}

export interface IArenaFighterSummary {
  idx: number
  team: number
  name: string
  emoji: string
  // Pixel-art sprite id (sprites/sprite-registry.ts); null = no art yet, show the emoji.
  sprite?: string | null
  el: `${EnumMonsterLine}`
  maxHp: number
  hp: number
  dealt: number
  taken: number
  healed: number
  dodges: number
  casts: number
  skills: string[]
  allSlots: string[]
  dodge: string | null
  spd: number
  eva: number
  acc: number
  res: number
  boss: boolean
}

export interface IArenaReplay {
  seed: number
  winner: number
  ticks: number
  // Frames are every `step`-th tick; the replay interpolates between them.
  step: number
  frames: IArenaFrame[]
  events: IArenaEvent[]
  fighters: IArenaFighterSummary[]
  checksum: string
}

// A recorded fight, whatever the mode.
export interface IArenaFight {
  kind: 'arena'
  won: boolean
  // Seconds the fight lasted.
  rounds: number
  // Null for auto-battles (not recorded).
  replay: IArenaReplay | null
  player: { name: string; emoji: string; sprite?: string | null; element: EnumMonsterLine }
  enemy: IArenaEnemy | null
}

export interface IArenaBattleData extends IArenaFight {
  stageId: string
  reward: number
  gemReward: number
  isFirstClear: boolean
  drop: IEquipmentItem | null
  dropBagFull: boolean
}
