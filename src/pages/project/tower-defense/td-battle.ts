import type { PoolEntry, SimInput } from '../../../../td-sim/src'

export interface ITdBattleStart {
  battleId: string
  seed: number
  /** Owned heroes snapshotted at start; the server replays with the same pool. */
  pool: PoolEntry[]
  expiresAt: string
}

export interface ITdBattleResult {
  result: 'won' | 'lost'
  rounds: number
  coins: number
  balances: { coins: number }
}

/** The finish request carries only the seed and the input log: the server replays it and decides the result and the reward itself. */
export const buildFinishBody = (seed: number, ticks: number, inputs: readonly SimInput[]) => ({
  seed,
  ticks,
  inputs: inputs.map((i) => ({ ...i })),
})

/** 409 on start means not enough energy. */
export const battleErrorKind = (error: unknown): 'energy' | 'other' =>
  (error as { response?: { status?: number } } | null)?.response?.status === 409
    ? 'energy'
    : 'other'
