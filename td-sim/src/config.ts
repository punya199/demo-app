/** Every tunable number lives here. All placeholders (see SPEC section 2): integers only, so the sim stays deterministic. */
export const COLS = 5
export const ROWS = 6
export const TILE_COUNT = COLS * ROWS

export const START_GOLD = 30
export const START_HP = 10
export const SUMMON_COST = 10
/** +1 run-gold every this many ticks. */
export const INCOME_EVERY = 4
export const KILL_REWARD = 3

/** Lane length in lane-units; enemies walk from 0 to LANE_LENGTH, then leak. */
export const LANE_LENGTH = 1000
export const SPAWN_EVERY = 40
export const ENEMY_SPEED = 4
export const ENEMY_BASE_HP = 10
export const ENEMY_HP_PER_SPAWN = 3

export type HeroId = 'archer' | 'mage' | 'knight'
/** damage per shot and ticks between shots. */
export const HEROES: Record<HeroId, { damage: number; cooldown: number }> = {
  archer: { damage: 3, cooldown: 8 },
  mage: { damage: 8, cooldown: 20 },
  knight: { damage: 5, cooldown: 12 },
}
export const HERO_IDS = Object.keys(HEROES) as HeroId[]

/** Energy source: sits just off the board edge, feeding this tile (bottom row, middle). A gear here is linked. */
export const SOURCE_TILE = 27
/** -2 tiles: a gear standing here deals only PENALTY_OUTPUT_PCT of its output. */
export const PENALTY_TILES: readonly number[] = [6, 8, 16, 18]
export const PENALTY_OUTPUT_PCT = 50

/** Charge units: a gear needs hero.cooldown * CHARGE_SCALE to fire, and gains CHARGE_BASE + CHARGE_PER_SIDE * touching each tick while linked. */
export const CHARGE_SCALE = 10
export const CHARGE_BASE = 10
export const CHARGE_PER_SIDE = 5
/** Output grows with every touching side (percent of base damage). */
export const SIDE_OUTPUT_PCT = 20

/** Damage multiplier (percent) per gear level; index 0 is level 1. Each step is at least 2x the one below, so a merge never loses power. */
export const LEVEL_OUTPUT_PCT: readonly number[] = [100, 220, 480, 1000, 2100]
export const MAX_LEVEL = LEVEL_OUTPUT_PCT.length

/** Resonance: crit chance (percent) per adjacent gear of the same hero, capped; a crit multiplies damage. */
export const RESONANCE_CRIT_PCT = 15
export const MAX_CRIT_PCT = 60
export const CRIT_OUTPUT_PCT = 200
