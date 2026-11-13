import { linkedTiles, outputOf, touchingSides } from './board'
import {
  CHARGE_BASE,
  CHARGE_PER_SIDE,
  CHARGE_SCALE,
  CRIT_OUTPUT_PCT,
  ENEMY_BASE_HP,
  ENEMY_HP_PER_SPAWN,
  ENEMY_SPEED,
  HERO_IDS,
  HEROES,
  KILL_REWARD,
  INCOME_EVERY,
  LANE_LENGTH,
  MAX_LEVEL,
  SPAWN_EVERY,
  START_GOLD,
  START_HP,
  SUMMON_COST,
  TILE_COUNT,
  type HeroId,
} from './config'
import { createRng } from './rng'

/** Fixed timestep: one tick is 50 ms of game time. Rendering interpolates; the sim never reads a clock. */
export const TICK_MS = 50
/** Server-side ceiling on replay length (about 10 minutes of game time). */
export const DEFAULT_MAX_TICKS = 12_000

export type SimInput =
  | { tick: number; type: 'summon'; tile: number }
  /** Merge the gear on `from` into the identical gear on `to`. */
  | { tick: number; type: 'merge'; from: number; to: number }

export interface Gear {
  tile: number
  hero: HeroId
  /** 1 to MAX_LEVEL; merging two identical gears gives level + 1. */
  level: number
  /** Charge units still needed before the next shot (hero.cooldown * CHARGE_SCALE when empty). Only linked gears charge. */
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
  if (state.status !== 'running') return state
  const rng = createRng(0, state.rng)
  let gold = state.gold
  const gears = [...state.gears]
  const onBoard = (t: unknown): t is number =>
    Number.isInteger(t) && (t as number) >= 0 && (t as number) < TILE_COUNT
  for (const input of inputs) {
    if (input.type === 'merge') {
      const from = gears.findIndex((g) => g.tile === input.from)
      const to = gears.findIndex((g) => g.tile === input.to)
      if (from < 0 || to < 0 || from === to) continue
      const a = gears[from]
      const b = gears[to]
      if (a.hero !== b.hero || a.level !== b.level || a.level >= MAX_LEVEL) continue
      gears[to] = { ...b, level: b.level + 1, cooldown: HEROES[b.hero].cooldown * CHARGE_SCALE }
      gears.splice(from, 1)
      continue
    }
    const free = onBoard(input.tile) && !gears.some((g) => g.tile === input.tile)
    if (!free || gold < SUMMON_COST) continue
    gold -= SUMMON_COST
    const hero = HERO_IDS[rng.int(HERO_IDS.length)]
    gears.push({ tile: input.tile, hero, level: 1, cooldown: HEROES[hero].cooldown * CHARGE_SCALE })
  }
  if (state.tick % INCOME_EVERY === 0) gold += 1

  let spawned = state.spawned
  let enemies = state.enemies
  if (state.tick % SPAWN_EVERY === 0) {
    enemies = [
      ...enemies,
      { id: spawned, pos: 0, hp: ENEMY_BASE_HP + ENEMY_HP_PER_SPAWN * spawned },
    ]
    spawned++
  }

  // ponytail: gears reach the whole lane and always hit the front-most enemy; range and targeting rules come later.
  enemies = enemies.map((e) => ({ ...e }))
  const firing = gears.map((g) => ({ ...g }))
  const linked = linkedTiles(firing)
  for (const gear of firing) {
    if (!linked.has(gear.tile)) continue
    if (gear.cooldown > 0) {
      gear.cooldown = Math.max(
        0,
        gear.cooldown - CHARGE_BASE - CHARGE_PER_SIDE * touchingSides(gear.tile, firing)
      )
      continue
    }
    let target: Enemy | undefined
    for (const e of enemies) if (!target || e.pos > target.pos) target = e
    if (!target) continue
    const { damage, critPct } = outputOf(gear, firing)
    const crit = critPct > 0 && rng.int(100) < critPct
    target.hp -= crit ? Math.floor((damage * CRIT_OUTPUT_PCT) / 100) : damage
    gear.cooldown = HEROES[gear.hero].cooldown * CHARGE_SCALE
    if (target.hp <= 0) {
      gold += KILL_REWARD
      enemies = enemies.filter((e) => e !== target)
    }
  }

  enemies = enemies.map((e) => ({ ...e, pos: e.pos + ENEMY_SPEED }))
  const leaked = enemies.filter((e) => e.pos >= LANE_LENGTH).length
  enemies = enemies.filter((e) => e.pos < LANE_LENGTH)
  const hp = Math.max(0, state.hp - leaked)

  return {
    tick: state.tick + 1,
    rng: rng.state(),
    gold,
    hp,
    status: hp === 0 ? 'lost' : 'running',
    spawned,
    enemies,
    gears: firing,
  }
}

function assertValidReplay(replay: Replay, maxTicks: number): void {
  const { seed, ticks, inputs } = replay
  if (!Number.isInteger(seed)) throw new RangeError('seed must be an integer')
  if (!Number.isInteger(ticks) || ticks < 0 || ticks > maxTicks) {
    throw new RangeError(`ticks must be an integer in [0, ${maxTicks}]`)
  }
  let prev = 0
  for (const input of inputs) {
    if (input?.type !== 'summon' && input?.type !== 'merge')
      throw new RangeError('unknown input type')
    if (!Number.isInteger(input.tick) || input.tick < prev || input.tick >= ticks) {
      throw new RangeError('input ticks must be integers, in order, and within the replay')
    }
    const tiles = input.type === 'summon' ? [input.tile] : [input.from, input.to]
    if (!tiles.every((t) => Number.isInteger(t) && t >= 0 && t < TILE_COUNT)) {
      throw new RangeError('input tiles must be integers on the board')
    }
    prev = input.tick
  }
}

/** Replay a battle from its seed and input log. Throws RangeError on a malformed or over-long log. */
export function runReplay(replay: Replay, opts: { maxTicks?: number } = {}): SimState {
  assertValidReplay(replay, opts.maxTicks ?? DEFAULT_MAX_TICKS)
  let state = createState(replay.seed)
  let i = 0
  while (state.tick < replay.ticks && state.status === 'running') {
    const now: SimInput[] = []
    while (i < replay.inputs.length && replay.inputs[i].tick === state.tick)
      now.push(replay.inputs[i++])
    state = step(state, now)
  }
  return state
}

/** FNV-1a over a fixed-order string form of the state: a cheap, engine-independent fingerprint. */
export function hashState(state: SimState): string {
  const text = JSON.stringify([
    state.tick,
    state.rng,
    state.gold,
    state.hp,
    state.status,
    state.spawned,
    state.enemies.map((e) => [e.id, e.pos, e.hp]),
    state.gears.map((g) => [g.tile, g.hero, g.level, g.cooldown]),
  ])
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}
