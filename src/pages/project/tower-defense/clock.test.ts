import { describe, expect, it } from 'vitest'
import { TICK_MS } from '../../../../td-sim/src'
import { advance } from './clock'

const run = (frames: number[], speed: number, paused = false) => {
  let acc = 0
  let total = 0
  for (const dt of frames) {
    const r = advance(acc, dt, speed, paused)
    acc = r.acc
    total += r.ticks
  }
  return total
}

describe('advance', () => {
  it('gives the same tick count however the time is sliced into frames', () => {
    expect(run([16, 17, 16, 17, 16, 18, 100], 1)).toBe(run([200], 1))
  })

  it('2x runs exactly twice the ticks of 1x', () => {
    const frames = Array.from({ length: 100 }, () => TICK_MS)
    expect(run(frames, 2)).toBe(2 * run(frames, 1))
  })

  it('does nothing while paused, and resumes without a burst', () => {
    expect(run([200, 200, 200], 1, true)).toBe(0)
    expect(advance(0, 200, 1, true).acc).toBe(0)
  })

  it('caps a long gap (background tab)', () => {
    expect(advance(0, 60_000, 1, false).ticks).toBeLessThanOrEqual(5)
  })
})
