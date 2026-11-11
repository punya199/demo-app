import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { IPassiveDraft, IPassiveNode } from '../core/tamagotchi-interface'
import { PassiveSelectedCard } from './PassiveSelectedCard'

const selected = {
  id: 'a',
  name: 'Ember Might',
  kind: 'small',
  fx: { atk: 1 },
  adj: [],
} as never as IPassiveNode
const draft = (nodeIds: string[]): IPassiveDraft => ({
  nodeIds,
  masteries: {},
  ascendancyNodeIds: [],
})

const renderCard = (over: Partial<Parameters<typeof PassiveSelectedCard>[0]> = {}) =>
  render(
    <PassiveSelectedCard
      selected={selected}
      current={draft(['a'])}
      savedMasteries={{}}
      masteryRepickPrice={1}
      isOwned
      isAscend={false}
      canTake={false}
      canDrop
      poolLeft={0}
      branch={['a']}
      dropCost={0}
      branchCost={0}
      pickHint={null}
      edit={vi.fn()}
      toggleNode={vi.fn()}
      dropBranch={vi.fn()}
      focus={vi.fn()}
      {...over}
    />
  )

describe('PassiveSelectedCard removal buttons', () => {
  afterEach(cleanup)

  it('shows no gem price and no branch button for a free single removal', () => {
    renderCard()
    const drop = screen.getByRole('button', { name: /ถอนโหนดนี้/ })
    expect(drop).toBeEnabled()
    expect(drop.textContent).not.toContain('💎')
    expect(screen.queryByRole('button', { name: /ถอนทั้งสาย/ })).toBeNull()
  })

  it('shows the gem price on both removal buttons', () => {
    renderCard({ branch: ['a', 'b', 'c'], dropCost: 1, branchCost: 3, canDrop: false })
    expect(screen.getByRole('button', { name: /ถอนโหนดนี้/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /ถอนโหนดนี้ 💎 1/ })).toBeDefined()
    expect(screen.getByRole('button', { name: /ถอนทั้งสาย \(3\) 💎 3/ })).toBeEnabled()
  })

  it('warns that dropping an ascendancy node restarts the path', () => {
    renderCard({
      selected: { ...selected, id: 'v2-asc-striker-01', kind: 'ascend' } as never as IPassiveNode,
      isAscend: true,
      branch: [],
      dropCost: 20,
    })
    expect(screen.getByText(/เริ่มเส้นทางใหม่ ต้องจ่าย 💎 20/)).toBeDefined()
  })

  it('shows the reason and keeps the button disabled when the node cannot go', () => {
    renderCard({ canDrop: false, pickHint: 'เอาโหนดนี้ออกเดี่ยวๆ ไม่ได้' })
    expect(screen.getByRole('button', { name: /ถอนโหนดนี้/ })).toBeDisabled()
    expect(screen.getByText(/เอาโหนดนี้ออกเดี่ยวๆ ไม่ได้/)).toBeDefined()
  })
})
