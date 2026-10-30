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
  ageMinutes: number
  bornAt: string
  trainReadyAt: string | null
  diedAt: string | null
  deathCause: EnumMonsterDeathCause | null
}
