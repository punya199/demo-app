import { EnumFurnitureKind } from '../core/tamagotchi-interface'
import type { FarmActivity } from '../core/tamagotchi-helper'

// Where each pet stands and what it is doing in the Farm room. Purely cosmetic: the needs that
// drive it (hungry, weak, sick, egg, away) come from the server; the tiers only decide whether the
// furniture is there to walk to. Coordinates are the room's own grid (ROOM_W x ROOM_H).

export const ROOM_W = 420
export const ROOM_H = 280
const WALK_SPEED = 44

export type RoomMode =
  | 'idle'
  | 'walk'
  | 'sleep'
  | 'eat'
  | 'gym'
  | 'toilet'
  | 'sick'
  | 'egg'
  | 'away'

export interface IRoomPet {
  x: number
  y: number
  tx: number | null
  ty: number | null
  face: 1 | -1
  mode: RoomMode
  // The mode to enter on arrival.
  pending: RoomMode
  activity: FarmActivity | null
  timer: number
  walkPhase: number
}

export type FarmTiers = Record<EnumFurnitureKind, number>

export const SPOTS = {
  bed: { x: 56, y: 84 },
  seats: [
    { x: 262, y: 112 },
    { x: 306, y: 112 },
  ],
  toilet: { x: 338, y: 186 },
  gym: { x: 190, y: 232 },
  bowl: { x: 190, y: 196 },
}

const floorSpot = (rand: () => number) => ({ x: 30 + rand() * 360, y: 150 + rand() * 112 })

export const newRoomPet = (index: number, rand: () => number): IRoomPet => ({
  ...{ x: 60 + ((index * 83) % 300), y: 170 + ((index * 37) % 80) },
  tx: null,
  ty: null,
  face: 1,
  mode: 'idle',
  pending: 'idle',
  activity: null,
  timer: 0.5 + rand() * 2,
  walkPhase: rand() * 12,
})

// Pets that share a spot stand a little apart, by their position in the list.
const apart = (spot: { x: number; y: number }, index: number) => ({
  x: spot.x + [0, 14, -14][index % 3],
  y: spot.y + Math.floor(index / 3) * 6,
})

// Where a need takes the pet, or null when it just stays put (egg, away). Without the furniture a
// hungry pet eats from a bowl on the floor, a weak one stands on bare floor, a sick one lies down.
export const needSpot = (activity: FarmActivity, tiers: FarmTiers, index: number) => {
  switch (activity) {
    case 'eat':
      return {
        ...apart(tiers.table > 0 ? SPOTS.seats[index % 2] : SPOTS.bowl, index),
        mode: 'eat' as const,
      }
    case 'gym':
      return { ...apart(SPOTS.gym, index), mode: 'gym' as const }
    case 'sick':
      return {
        ...apart(tiers.bed > 0 ? SPOTS.bed : { x: 70, y: 200 }, index),
        mode: 'sick' as const,
      }
    default:
      return null
  }
}

const goTo = (pet: IRoomPet, x: number, y: number, mode: RoomMode) => {
  pet.tx = x
  pet.ty = y
  pet.pending = mode
  pet.mode = 'walk'
  if (x !== pet.x) pet.face = x < pet.x ? -1 : 1
}

// One step of the room's clock: returns the next state (the input is not changed).
export const stepRoomPet = (
  before: IRoomPet,
  activity: FarmActivity,
  tiers: FarmTiers,
  index: number,
  dt: number,
  rand: () => number
): IRoomPet => {
  const pet = { ...before }
  if (activity !== pet.activity) {
    pet.activity = activity
    pet.timer = 0
    const spot = needSpot(activity, tiers, index)
    if (activity === 'egg') {
      Object.assign(pet, {
        tx: null,
        ty: null,
        mode: 'egg' as const,
        ...apart({ x: 70, y: 200 }, index),
      })
    } else if (activity === 'away') {
      Object.assign(pet, { tx: null, ty: null, mode: 'away' as const })
    } else if (spot) {
      goTo(pet, spot.x, spot.y, spot.mode)
    } else {
      pet.mode = 'idle'
      pet.tx = pet.ty = null
    }
  }

  if (pet.tx !== null && pet.ty !== null) {
    const dx = pet.tx - pet.x
    const dy = pet.ty - pet.y
    const dist = Math.hypot(dx, dy)
    const step = WALK_SPEED * dt
    if (dist <= step) {
      pet.x = pet.tx
      pet.y = pet.ty
      pet.tx = pet.ty = null
      pet.mode = pet.pending
      pet.timer =
        pet.pending === 'idle' ? 1 + rand() * 2 : pet.pending === 'toilet' ? 2.5 : 8 + rand() * 4
    } else {
      pet.x += (dx / dist) * step
      pet.y += (dy / dist) * step
      pet.walkPhase += step / 22
    }
    return pet
  }

  // A pet with no need lives its own life; eating, working out and being sick last while they last.
  if (activity === 'free') {
    pet.timer -= dt
    if (pet.timer <= 0) {
      const roll = rand()
      if (roll < 0.5) {
        const spot = floorSpot(rand)
        goTo(pet, spot.x, spot.y, 'idle')
      } else if (roll < 0.7) {
        pet.mode = 'idle'
        pet.timer = 1.5 + rand() * 2
      } else if (roll < 0.85 && tiers.bed > 0) {
        const spot = apart(SPOTS.bed, index)
        goTo(pet, spot.x, spot.y, 'sleep')
      } else if (tiers.toilet > 0) {
        const spot = apart(SPOTS.toilet, index)
        goTo(pet, spot.x, spot.y, 'toilet')
      } else {
        pet.mode = 'idle'
        pet.timer = 1.5 + rand() * 2
      }
    }
  }
  return pet
}
