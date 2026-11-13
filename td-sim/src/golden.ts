import type { Replay } from './sim'

/** Pinned replay shared by both repos' tests. Change GOLDEN_HASH only on purpose: it means sim behaviour changed. */
export const GOLDEN_REPLAY: Replay = {
  seed: 20260101,
  ticks: 600,
  inputs: [
    { tick: 0, type: 'summon', tile: 0 },
    { tick: 0, type: 'summon', tile: 1 },
    { tick: 60, type: 'summon', tile: 6 },
    { tick: 60, type: 'summon', tile: 6 },
    { tick: 200, type: 'summon', tile: 12 },
    { tick: 599, type: 'summon', tile: 29 },
  ],
}

/** Rebaselined in ticket 02: the sim became the real battle (summon, lane, firing). */
export const GOLDEN_HASH = '4085d72c'
