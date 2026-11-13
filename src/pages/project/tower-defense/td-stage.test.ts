import { describe, expect, it } from 'vitest'
import { STAGE_COUNT } from '../../../../td-sim/src'
import { buildStartBody } from './td-battle'
import { parseStageParam, starRow, stageStatus, type ITdStage } from './td-stage'

describe('parseStageParam', () => {
  it('reads a valid stage number from the query string', () => {
    for (let n = 1; n <= STAGE_COUNT; n++) expect(parseStageParam(String(n))).toBe(n)
  })
  it('falls back to stage 1 for anything else', () => {
    for (const v of [null, '', '0', String(STAGE_COUNT + 1), '1.5', 'abc', '-1', '2 ']) {
      expect(parseStageParam(v)).toBe(1)
    }
  })
})

describe('buildStartBody', () => {
  it('sends only the stage id', () => {
    expect(buildStartBody(2)).toEqual({ stageId: 2 })
  })
})

describe('starRow', () => {
  it('fills earned stars and empties the rest, always three slots', () => {
    expect(starRow(0)).toBe('☆☆☆')
    expect(starRow(2)).toBe('★★☆')
    expect(starRow(3)).toBe('★★★')
  })
})

describe('stageStatus', () => {
  const stage = (patch: Partial<ITdStage>): ITdStage => ({
    stageId: 2,
    stars: 0,
    cleared: false,
    unlocked: true,
    firstClearGems: 225,
    ...patch,
  })
  it('is locked, new or cleared, as the server says', () => {
    expect(stageStatus(stage({ unlocked: false }))).toBe('locked')
    expect(stageStatus(stage({}))).toBe('new')
    expect(stageStatus(stage({ cleared: true, stars: 1 }))).toBe('cleared')
  })
})
