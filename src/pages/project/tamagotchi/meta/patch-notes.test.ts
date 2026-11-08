import { describe, expect, it } from 'vitest'
import { formatPatchDate, hasUnreadPatch, PATCH_NOTES } from './patch-notes'

describe('patch notes', () => {
  it('shows the release time in Thai time (UTC+7)', () => {
    expect(formatPatchDate('2026-11-04T13:53:06Z')).toBe('2026-11-04 20:53 น.')
    // Crosses midnight in Thai time.
    expect(formatPatchDate('2026-11-03T18:00:00Z')).toBe('2026-11-04 01:00 น.')
  })

  it('lists releases newest first, each with a valid time', () => {
    const times = PATCH_NOTES.map((note) => new Date(note.releasedAt).getTime())
    expect(times.every((time) => !Number.isNaN(time))).toBe(true)
    expect(times).toEqual([...times].sort((a, b) => b - a))
  })

  it('flags unread only when a stored version differs from the newest', () => {
    const latest = PATCH_NOTES[0].version
    expect(hasUnreadPatch(null)).toBe(false)
    expect(hasUnreadPatch(latest)).toBe(false)
    expect(hasUnreadPatch('0.0.1')).toBe(true)
  })

  it("keeps unreleased changes in a single 'next' entry at the top, with no future times", () => {
    const nextIndexes = PATCH_NOTES.flatMap((note, i) => (note.version === 'next' ? [i] : []))
    expect(nextIndexes.every((i) => i === 0)).toBe(true)
    expect(nextIndexes.length).toBeLessThanOrEqual(1)
    const newest = new Date(PATCH_NOTES[0].releasedAt).getTime()
    expect(newest).toBeLessThanOrEqual(Date.now())
  })
})
