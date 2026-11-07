import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ArenaBattleModal } from './ArenaBattleModal'
import { IArenaFight } from './arena-interface'
import { EnumMonsterLine } from '../core/tamagotchi-interface'

// The canvas replay is replaced by a stub that shows the speed it was given.
vi.mock('./ArenaReplay', () => ({
  ArenaReplay: (props: { speed: number }) => <div data-testid="replay-speed">{props.speed}</div>,
}))

const fight = (seed: number): IArenaFight => ({
  kind: 'arena',
  won: true,
  rounds: 10,
  player: { name: 'A', emoji: '🦎', element: EnumMonsterLine.FLAME },
  enemy: null,
  replay: {
    seed,
    winner: 0,
    ticks: 200,
    step: 2,
    frames: Array.from({ length: 101 }, () => ({ f: [], p: [], z: [] })),
    events: [],
    fighters: [],
    checksum: String(seed),
  },
})

describe('ArenaBattleModal', () => {
  it('skips only the current fight, not the next one', () => {
    const props = { statuses: {} as never, catalog: [], onClose: () => {} }
    const { rerender } = render(<ArenaBattleModal {...props} battle={fight(1)} />)
    expect(screen.getByTestId('replay-speed').textContent).toBe('1')

    fireEvent.click(screen.getByRole('button', { name: 'ข้าม' }))
    expect(screen.getByTestId('replay-speed').textContent).toBe('1000')

    rerender(<ArenaBattleModal {...props} battle={fight(2)} />)
    expect(screen.getByTestId('replay-speed').textContent).toBe('1')
  })

  it('keeps a close button above the log once the fight is over', () => {
    const onClose = vi.fn()
    render(
      <ArenaBattleModal
        statuses={{} as never}
        catalog={[]}
        onClose={onClose}
        battle={{ ...fight(3), replay: undefined } as never}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'ปิด' }))
    expect(onClose).toHaveBeenCalled()
  })
})
