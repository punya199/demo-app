import type { PoolEntry, SimInput } from '../../../../td-sim/src'

export interface ITdBattleStart {
  battleId: string
  seed: number
  stageId: number
  /** Owned heroes snapshotted at start; the server replays with the same pool. */
  pool: PoolEntry[]
  expiresAt: string
}

export interface ITdBattleResult {
  result: 'won' | 'lost'
  rounds: number
  coins: number
  /** Stars earned in this battle and gems paid for a first clear, both decided by the server replay. */
  stars: number
  gems: number
  firstClear: boolean
  balances: { coins: number }
}

/** Starting a battle names only the stage; the server checks that it is unlocked. */
export const buildStartBody = (stageId: number) => ({ stageId })

/** The finish request carries only the seed and the input log: the server replays it and decides the result and the reward itself. */
export const buildFinishBody = (seed: number, ticks: number, inputs: readonly SimInput[]) => ({
  seed,
  ticks,
  inputs: inputs.map((i) => ({ ...i })),
})

/** 409 on start means not enough energy, 403 means the stage is locked. */
export const battleErrorKind = (error: unknown): 'energy' | 'locked' | 'other' => {
  const status = (error as { response?: { status?: number } } | null)?.response?.status
  return status === 409 ? 'energy' : status === 403 ? 'locked' : 'other'
}
