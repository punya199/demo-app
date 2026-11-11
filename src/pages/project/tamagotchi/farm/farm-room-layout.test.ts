import { describe, expect, it } from 'vitest'
import { EnumFurnitureKind, IFarmData } from '../core/tamagotchi-interface'
import { FOOT, pieceAt, pieceStates } from './farm-room-layout'

const NOW = new Date('2026-01-01T00:00:00Z')

const farm = (over: Partial<IFarmData> = {}): IFarmData =>
  ({
    furniture: [
      { kind: EnumFurnitureKind.BED, tier: 2 },
      { kind: EnumFurnitureKind.TABLE, tier: 1 },
    ],
    queue: null,
    ...over,
  }) as unknown as IFarmData

describe('pieceStates', () => {
  it('shows what the player owns, and a ghost (tier 0) for the rest', () => {
    const pieces = pieceStates(farm(), NOW)
    expect(pieces.bed).toMatchObject({ tier: 2, status: 'idle' })
    expect(pieces.table.tier).toBe(1)
    expect(pieces.gym).toMatchObject({ tier: 0, status: 'idle' })
    expect(pieceStates(undefined, NOW).toilet.tier).toBe(0)
  })

  it('marks only the crafted piece as upgrading, with its countdown', () => {
    const queue = {
      kind: EnumFurnitureKind.BED,
      toTier: 3,
      startedAt: '2025-12-31T23:00:00Z',
      finishAt: '2026-01-01T01:02:03Z',
      status: 'running' as const,
    }
    const pieces = pieceStates(farm({ queue }), NOW)
    expect(pieces.bed).toMatchObject({ tier: 2, status: 'building', label: '1:02:03' })
    expect(pieces.table.status).toBe('idle')
  })

  it('turns ready once the timer has passed, even before the server says so', () => {
    const queue = {
      kind: EnumFurnitureKind.TABLE,
      toTier: 2,
      startedAt: '2025-12-31T23:00:00Z',
      finishAt: '2025-12-31T23:59:59Z',
      status: 'running' as const,
    }
    expect(pieceStates(farm({ queue }), NOW).table).toMatchObject({
      status: 'ready',
      label: 'รับของ',
    })
  })
})

describe('pieceAt', () => {
  it('finds each piece at the centre of its footprint', () => {
    for (const [kind, [x, y, w, h]] of Object.entries(FOOT)) {
      expect(pieceAt(x + w / 2, y + h / 2)).toBe(kind)
    }
  })

  it('reaches the parts that stand above a footprint (canopy, bar)', () => {
    expect(pieceAt(FOOT.gym[0] + 5, FOOT.gym[1] - 10)).toBe('gym')
  })

  it('returns nothing on empty floor or outside the room', () => {
    expect(pieceAt(200, 160)).toBeNull()
    expect(pieceAt(-5, 10)).toBeNull()
    expect(pieceAt(10, 9999)).toBeNull()
  })
})
