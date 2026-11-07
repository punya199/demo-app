import { EnumMonsterStage, IBattleStats } from '../core/tamagotchi-interface'

// Bits shared by the guide's tabs.

export const statsText = (stats: IBattleStats) =>
  `HP ${stats.hp} · ATK ${stats.atk} · DEF ${stats.def} · SPD ${stats.spd}`

export const hatchedStages = [
  EnumMonsterStage.BABY_1,
  EnumMonsterStage.BABY_2,
  EnumMonsterStage.ADULT,
  EnumMonsterStage.PERFECT,
  EnumMonsterStage.ULTIMATE,
  EnumMonsterStage.FUSED,
] as const
