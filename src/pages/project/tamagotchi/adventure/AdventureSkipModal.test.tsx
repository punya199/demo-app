import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdventureSkipModal } from './AdventureSkipModal'
import { IAdventureStage } from '../core/tamagotchi-interface'

const mutate = vi.fn()
vi.mock('../core/tamagotchi-service', () => ({
  useAdventureSkip: () => ({ mutate, isPending: false }),
}))

const stage = {
  id: 'meadow_1',
  isBoss: false,
  enemy: null,
  reward: 12,
  firstClearReward: 24,
  firstClearGems: 0,
  clearCount: 1,
  unlocked: true,
} as IAdventureStage

describe('AdventureSkipModal', () => {
  it('starts at the most runs the stamina pays for and sends that count', () => {
    render(
      <AdventureSkipModal
        stage={stage}
        stamina={35}
        staminaCost={10}
        maxRuns={10}
        onClose={() => {}}
        onError={() => {}}
      />
    )
    expect(screen.getByText(/ใช้ stamina 30/)).toBeTruthy()
    expect(screen.getByText(/ได้ 🪙 36/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'ข้าม 3 รอบ' }))
    expect(mutate).toHaveBeenCalledWith({ stageId: 'meadow_1', runs: 3 }, expect.anything())
  })

  it('cannot skip without stamina for one run', () => {
    render(
      <AdventureSkipModal
        stage={stage}
        stamina={5}
        staminaCost={10}
        maxRuns={10}
        onClose={() => {}}
        onError={() => {}}
      />
    )
    expect(screen.getByText(/stamina ไม่พอ/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'ข้าม 1 รอบ' }).hasAttribute('disabled')).toBe(true)
  })
})
