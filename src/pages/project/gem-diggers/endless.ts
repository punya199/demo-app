// Builds a playable endless level: makes the picture, searches for a tray near
// the difficulty target, and keeps the first one the real game rules can win.
// Runs inside a worker in the browser (it takes a few seconds).

import { buildBoard, trayOptions } from './game'
import { TrayLayout, generateCandidates } from './generator'
import type { LevelDef } from './levels'
import { Mode, applyMode } from './modes'
import { makeLevel } from './procgen'
import { solveReal } from './verify'

export interface BuiltLevel {
  def: LevelDef
  layout: TrayLayout
  solution: number[]
}

export function buildEndless(n: number, mode: Mode): BuiltLevel {
  for (let variant = 0; variant < 12; variant++) {
    const def = applyMode(makeLevel(n, variant, mode), mode, false)
    try {
      const { board } = buildBoard(def)
      // Fewer candidates than the offline generator: the player is waiting.
      const opt = { ...trayOptions(def, n), attempts: 30, greedyRuns: 16, solverBudget: 2000 }
      // Only trays reasonably near the difficulty target; else try another picture.
      const near = generateCandidates(board, opt, 3).filter((c) => c.gap <= 0.25)
      for (const { tray } of near.slice(0, 3)) {
        const solution = solveReal(def, n, tray, 3000)
        if (solution) return { def, layout: tray, solution }
      }
    } catch {
      // A picture whose locked core can never open: try the next variant.
    }
  }
  throw new Error(`could not build endless level ${n}`)
}
