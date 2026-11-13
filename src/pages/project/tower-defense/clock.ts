import { TICK_MS } from '../../../../td-sim/src'

/** Longest frame gap that counts, so a background tab does not fast-forward the run. */
const MAX_FRAME_MS = 250

/**
 * Turn elapsed wall time into whole sim ticks. Speed only changes how many ticks fit in a frame,
 * never what a tick does, so a 2x run is the same replay as a 1x run, just sooner.
 */
export function advance(
  acc: number,
  dtMs: number,
  speed: number,
  paused: boolean
): { acc: number; ticks: number } {
  const total = acc + Math.min(dtMs, MAX_FRAME_MS) * (paused ? 0 : speed)
  const ticks = Math.floor(total / TICK_MS)
  return { acc: total - ticks * TICK_MS, ticks }
}
