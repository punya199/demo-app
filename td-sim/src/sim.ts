import { HERO_IDS, INCOME_EVERY, START_GOLD, START_HP, SUMMON_COST, TILE_COUNT, type HeroId } from './config'
import { createRng } from './rng'

/** Fixed timestep: one tick is 50 ms of game time. Rendering interpolates; the sim never reads a clock. */
export const TICK_MS = 50
/** Server-side ceiling on replay length (about 10 minutes of game time). */
export const DEFAULT_MAX_TICKS = 12_000

export type SimInput = { tick: number; type: 'summon'; tile: number }

export interface Gear {
  tile: number
  hero: HeroId
  /** Ticks until the next shot. */
  cooldown: number
}

export interface Enemy {
  id: number
  /** Lane-units walked, 0 to LANE_LENGTH. */
  pos: number
  hp: number
}

export interface SimState {
  tick: number
  rng: number
  gold: number
  hp: number
  status: 'running' | 'lost'
  spawned: number
  enemies: Enemy[]
  gears: Gear[]
}

export interface Replay {
  seed: number
  ticks: number
  inputs: SimInput[]
}

export function createState(seed: number): SimState {
  return {
    tick: 0,
    rng: seed >>> 0,
    gold: START_GOLD,
    hp: START_HP,
    status: 'running',
    spawned: 0,
    enemies: [],
    gears: [],
  }
}

/** Advance one tick, applying the inputs stamped with the current tick. */
export function step(state: SimState, inputs: readonly SimInput[]): SimState {
  const rng = createRng(0, state.rng)
  let gold = state.gold
  const gears = [...state.gears]
  for (const input of inputs) {
    const free =
      Number.isInteger(input.tile) &&
      input.tile >= 0 &&
      input.tile < TILE_COUNT &&
      !gears.some((g) => g.tile === input.tile)
    if (!free || gold < SUMMON_COST) continue
    gold -= SUMMON_COST
    gears.push({ tile: input.tile, hero: HERO_IDS[rng.int(HERO_IDS.length)], cooldown: 0 })
  }
  if (state.tick % INCOME_EVERY === 0) gold += 1
  return { ...state, tick: state.tick + 1, rng: rng.state(), gold, gears }
}

function assertValidReplay(replay: Replay, maxTicks: number): void {
  const { seed, ticks, inputs } = replay
  if (!Number.isInteger(seed)) throw new RangeError('seed must be an integer')
  if (!Number.isInteger(ticks) || ticks < 0 || ticks > maxTicks) {
    throw new RangeError(`ticks must be an integer in [0, ${maxTicks}]`)
  }
  let prev = 0
  for (const input of inputs) {
    if (input?.type !== 'spend') throw new RangeError('unknown input type')
    if (!Number.isInteger(input.tick) || input.tick < prev || input.tick >= ticks) {
      throw new RangeError('input ticks must be integers, in order, and within the replay')
    }
    if (!Number.isInteger(input.amount) || input.amount < 0) {
      throw new RangeError('spend amount must be a non-negative integer')
    }
    prev = input.tick
  }
}

/** Replay a battle from its seed and input log. Throws RangeError on a malformed or over-long log. */
export function runReplay(replay: Replay, opts: { maxTicks?: number } = {}): SimState {
  assertValidReplay(replay, opts.maxTicks ?? DEFAULT_MAX_TICKS)
  let state = createState(replay.seed)
  let i = 0
  while (state.tick < replay.ticks) {
    const now: SimInput[] = []
    while (i < replay.inputs.length && replay.inputs[i].tick === state.tick)
      now.push(replay.inputs[i++])
    state = step(state, now)
  }
  return state
}

/** FNV-1a over a fixed-order string form of the state: a cheap, engine-independent fingerprint. */
export function hashState(state: SimState): string {
  const text = `${state.tick}|${state.rng}|${state.gold}`
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}
