import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('joins class names together', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    const isHidden: boolean = false
    expect(cn('a', isHidden && 'hidden', undefined, 'b')).toBe('a b')
  })

  it('resolves conflicting Tailwind classes, keeping the last one', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})
