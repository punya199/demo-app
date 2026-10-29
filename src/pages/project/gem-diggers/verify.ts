// Checks a tray against the real game rules (not the faster model the
// generator uses): replays games headlessly with the actual Game class, tapping
// only when everything has settled, and searches for a tap order that wins.

import { Game } from './game'
import type { TrayLayout } from './generator'
import type { LevelDef } from './levels'

/** Run until nothing is moving (or the game ends). */
function settle(g: Game) {
  for (let i = 0; i < 60 * 600 && g.status === 'playing'; i++) {
    g.update(1 / 60)
    g.events.length = 0
    if (g.quiet) return
  }
}

/**
 * A winning list of tray columns to tap (0-based; tapping one half of a linked
 * pair sends both), or null if none was found within `budget` positions.
 */
export function solveReal(
  level: LevelDef,
  seed: number,
  layout: TrayLayout,
  budget = 4000
): number[] | null {
  return solveFrom(new Game(level, seed, layout), budget)
}

/**
 * Same search starting from a game in progress (left untouched): first lets
 * everything in motion finish, as if the player waits, then looks for taps.
 */
export function solveFrom(start: Game, budget = 4000): number[] | null {
  const root = start.clone()
  const seen = new Set<string>()
  let nodes = 0

  const search = (g: Game): number[] | null => {
    if (g.status === 'won') return []
    if (g.status !== 'playing' || ++nodes > budget) return null
    const key =
      g.tray.map((c) => c.length).join(',') +
      '|' +
      g.board.cells.join(',') +
      '|' +
      g.board.armor.join('')
    if (seen.has(key)) return null
    seen.add(key)

    // Tapping any cart of a chained group is the same move: keep the leftmost column.
    const moves = g.tray.map((_, c) => c).filter((c) => g.canTap(c) && g.groupColumns(c)[0] === c)
    moves.sort((a, b) => Number(g.frontReady(b)) - Number(g.frontReady(a)))

    for (const c of moves) {
      const next = g.clone()
      next.tap(c)
      settle(next)
      const rest = search(next)
      if (rest) return [c, ...rest]
    }
    return null
  }

  settle(root)
  return search(root)
}
