import { STAGE_COUNT } from '../../../../td-sim/src'

/** One row of GET /td/stages. The server decides stars, clears and locks; the client only draws them. */
export interface ITdStage {
  stageId: number
  stars: number
  cleared: boolean
  unlocked: boolean
  firstClearGems: number
}

export interface ITdStages {
  energyCost: number
  stages: ITdStage[]
}

/** The stage to play comes from `?stage=N`; anything that is not a stage number means stage 1. The server still refuses a locked stage. */
export const parseStageParam = (value: string | null): number => {
  const n = value !== null && /^\d+$/.test(value) ? Number(value) : 0
  return n >= 1 && n <= STAGE_COUNT ? n : 1
}

export const starRow = (stars: number): string =>
  '★'.repeat(Math.min(3, Math.max(0, stars))).padEnd(3, '☆')

export const stageStatus = (stage: ITdStage): 'locked' | 'new' | 'cleared' =>
  !stage.unlocked ? 'locked' : stage.cleared ? 'cleared' : 'new'

/** Stars a stage needs before the sweep button shows; the server enforces the same rule. */
export const SWEEP_MIN_STARS = 3

export const canSweep = (stage: ITdStage): boolean =>
  stage.unlocked && stage.stars >= SWEEP_MIN_STARS
