import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingSpin } from './LoadingSpin'

describe('LoadingSpin', () => {
  it('renders three bouncing dots', () => {
    const { container } = render(<LoadingSpin />)

    expect(container.querySelectorAll('span')).toHaveLength(3)
  })
})
