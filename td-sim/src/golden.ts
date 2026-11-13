import type { Replay } from './sim'

/** Pinned replay shared by both repos' tests. Change GOLDEN_HASH only on purpose: it means sim behaviour changed. */
export const GOLDEN_REPLAY: Replay = {
  seed: 20260101,
  ticks: 600,
  inputs: [
    // source tile and a chain off it, then a -2 tile (16), then a merge of the two knights (21 into 26)
    { tick: 0, type: 'summon', tile: 27 },
    { tick: 0, type: 'summon', tile: 22 },
    { tick: 0, type: 'summon', tile: 26 },
    { tick: 60, type: 'summon', tile: 28 },
    { tick: 100, type: 'summon', tile: 21 },
    { tick: 140, type: 'summon', tile: 23 },
    { tick: 200, type: 'summon', tile: 17 },
    { tick: 250, type: 'summon', tile: 16 },
    { tick: 300, type: 'merge', from: 21, to: 26 },
    { tick: 599, type: 'summon', tile: 0 },
  ],
}

/** Rebaselined on purpose in ticket 03: charging, adjacency output, -2 tiles, merge and Resonance changed the rules and the golden inputs. */
export const GOLDEN_HASH = '3e397472'
