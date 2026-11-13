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
