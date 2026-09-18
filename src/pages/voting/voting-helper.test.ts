import { describe, expect, it } from 'vitest'
import { moveItem } from './voting-helper'

describe('moveItem', () => {
  it('swaps an item with its next neighbor when moving down', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c'])
  })

  it('swaps an item with its previous neighbor when moving up', () => {
    expect(moveItem(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b'])
  })

  it('is a no-op moving past the start of the list', () => {
    expect(moveItem(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c'])
  })

  it('is a no-op moving past the end of the list', () => {
    expect(moveItem(['a', 'b', 'c'], 2, 1)).toEqual(['a', 'b', 'c'])
  })

  it('does not mutate the input array', () => {
    const input = ['a', 'b', 'c']
    moveItem(input, 0, 1)
    expect(input).toEqual(['a', 'b', 'c'])
  })
})
