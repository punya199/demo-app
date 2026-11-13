import { describe, expect, it } from 'vitest'
import { TD_PATCH_NOTES } from './td-patch-notes'

describe('td patch notes', () => {
  it('has Thai, non-empty entries', () => {
    expect(TD_PATCH_NOTES.length).toBeGreaterThan(0)
    for (const note of TD_PATCH_NOTES) {
      expect(note.title).toMatch(/[฀-๿]/)
      expect(note.changes.length).toBeGreaterThan(0)
      for (const c of note.changes) expect(c).toMatch(/[฀-๿]/)
    }
  })

  it('lists entries newest first with valid dates', () => {
    const times = TD_PATCH_NOTES.map((n) => Date.parse(n.date))
    expect(times.every((x) => !Number.isNaN(x))).toBe(true)
    expect(times).toEqual([...times].sort((a, b) => b - a))
  })
})
