// Web Worker that finds the next good tap, off the main thread so the game
// keeps running while it searches. It rebuilds the exact game state by
// replaying the player's actions, then runs the real-rules search.

import { Action, Game } from './game'
import type { TrayLayout } from './generator'
import type { LevelDef } from './levels'
import { solveFrom } from './verify'

export interface HintRequest {
  id: number
  def: LevelDef
  seed: number
  layout?: TrayLayout // endless levels carry their tray; hand-made ones use trays.json
  log: Action[]
  steps: number
}

export interface HintReply {
  id: number
  // Winning taps from here (after letting current miners finish);
  // [] = nothing to tap, just wait; null = no winning line found.
  line: number[] | null
}

self.onmessage = (e: MessageEvent<HintRequest>) => {
  const { id, def, seed, layout, log, steps } = e.data
  const game = Game.replay(def, seed, log, steps, layout)
  const reply: HintReply = { id, line: solveFrom(game) }
  ;(self as unknown as Worker).postMessage(reply)
}
