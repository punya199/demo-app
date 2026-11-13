import { describe, expect, it } from 'vitest'
import { goalLabel, goalProgressText, goalState, type ITdGoal } from './td-goals'

const goal = (over: Partial<ITdGoal>): ITdGoal => ({
  id: 'win_battle',
  progress: 0,
  target: 2,
  gems: 30,
  complete: false,
  claimed: false,
  ...over,
})

describe('goalState', () => {
  it('is pending until complete, claimable once complete, claimed after the claim', () => {
    expect(goalState(goal({}))).toBe('pending')
    expect(goalState(goal({ progress: 2, complete: true }))).toBe('claimable')
    expect(goalState(goal({ progress: 2, complete: true, claimed: true }))).toBe('claimed')
  })
})

describe('goalProgressText', () => {
  it('shows progress over target', () => {
    expect(goalProgressText(goal({ progress: 1 }))).toBe('1/2')
  })
})

describe('goalLabel', () => {
  it('names known ids and falls back to the id', () => {
    expect(goalLabel('win_battle')).not.toBe('win_battle')
    expect(goalLabel('brand_new')).toBe('brand_new')
  })
})
