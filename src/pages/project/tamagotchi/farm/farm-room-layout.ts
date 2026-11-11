import { formatCountdown, tierOf } from '../core/tamagotchi-helper'
import { EnumFurnitureKind, IFarmData } from '../core/tamagotchi-interface'
import { ROOM_H, ROOM_W } from './farm-room-sim'

// Where each piece of furniture sits on the room grid and what state it is in. The footprints match
// the spots the pets walk to (SPOTS in farm-room-sim.ts), so the sim never needs to know the art.

export type PieceKind = `${EnumFurnitureKind}`

// x, y, width, height of the piece's footprint.
export const FOOT: Record<PieceKind, readonly [number, number, number, number]> = {
  bed: [10, 32, 92, 54],
  table: [236, 70, 108, 52],
  gym: [150, 218, 80, 40],
  toilet: [360, 150, 52, 42],
}

// Drawn back to front, so a nearer piece covers a farther one.
export const DRAW_ORDER: PieceKind[] = ['bed', 'table', 'toilet', 'gym']

export interface IPieceState {
  // 0 = not bought yet: shown as a ghost with a buy badge.
  tier: number
  // 'building' while a craft runs, 'ready' once it can be claimed.
  status: 'idle' | 'building' | 'ready'
  // The badge text under the piece: the countdown, or "รับของ" when ready.
  label: string
}

export type PieceStates = Record<PieceKind, IPieceState>

export const pieceStates = (farm: IFarmData | undefined, now: Date): PieceStates => {
  const queue = farm?.queue ?? null
  const state = (kind: EnumFurnitureKind): IPieceState => {
    const tier = tierOf(farm, kind)
    if (!queue || queue.kind !== kind) return { tier, status: 'idle', label: '' }
    const done = queue.status === 'ready' || new Date(queue.finishAt) <= now
    return done
      ? { tier, status: 'ready', label: 'รับของ' }
      : { tier, status: 'building', label: formatCountdown(queue.finishAt, now) }
  }
  return {
    bed: state(EnumFurnitureKind.BED),
    table: state(EnumFurnitureKind.TABLE),
    gym: state(EnumFurnitureKind.GYM),
    toilet: state(EnumFurnitureKind.TOILET),
  }
}

// The piece under a point given in room-grid coordinates. The top edge reaches 12 px higher than the
// footprint, because canopies, bars and plants stand above it. The nearest piece wins.
export const pieceAt = (x: number, y: number): PieceKind | null => {
  if (x < 0 || y < 0 || x > ROOM_W || y > ROOM_H) return null
  for (const kind of [...DRAW_ORDER].reverse()) {
    const [fx, fy, fw, fh] = FOOT[kind]
    if (x >= fx && x <= fx + fw && y >= fy - 12 && y <= fy + fh) return kind
  }
  return null
}
