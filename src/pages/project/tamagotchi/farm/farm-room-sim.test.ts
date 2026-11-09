import { describe, expect, it } from 'vitest'
import { EnumFurnitureKind } from '../core/tamagotchi-interface'
import { FarmTiers, newRoomPet, needSpot, SPOTS, stepRoomPet } from './farm-room-sim'

const tiers = (over: Partial<FarmTiers> = {}): FarmTiers => ({
  [EnumFurnitureKind.TABLE]: 0,
  [EnumFurnitureKind.GYM]: 0,
  [EnumFurnitureKind.TOILET]: 0,
  [EnumFurnitureKind.BED]: 0,
  ...over,
})
const rand = () => 0.3
const settle = (activity: Parameters<typeof stepRoomPet>[1], t: FarmTiers) => {
  let pet = newRoomPet(0, rand)
  for (let i = 0; i < 200; i++) pet = stepRoomPet(pet, activity, t, 0, 0.5, rand)
  return pet
}

describe('needSpot', () => {
  it('sends a hungry pet to the table when it exists, else to the floor bowl', () => {
    expect(needSpot('eat', tiers({ table: 1 }), 0)?.y).toBe(SPOTS.seats[0].y)
    expect(needSpot('eat', tiers(), 0)?.y).toBe(SPOTS.bowl.y)
  })

  it('has nowhere to go for an egg, a pet away or a free pet', () => {
    expect(needSpot('egg', tiers(), 0)).toBeNull()
    expect(needSpot('away', tiers(), 0)).toBeNull()
    expect(needSpot('free', tiers(), 0)).toBeNull()
  })

  it('keeps pets that share a spot apart', () => {
    const a = needSpot('gym', tiers(), 0)!
    const b = needSpot('gym', tiers(), 1)!
    expect(a.x).not.toBe(b.x)
  })
})

describe('stepRoomPet', () => {
  it('walks a hungry pet to its seat and then eats', () => {
    const pet = settle('eat', tiers({ table: 2 }))
    expect(pet.mode).toBe('eat')
    expect(pet.y).toBe(SPOTS.seats[0].y)
  })

  it('lies a sick pet in the bed it owns', () => {
    const pet = settle('sick', tiers({ bed: 1 }))
    expect(pet.mode).toBe('sick')
    expect(pet.x).toBeCloseTo(SPOTS.bed.x)
  })

  it('keeps an egg and an away pet where they are', () => {
    expect(settle('egg', tiers()).mode).toBe('egg')
    expect(settle('away', tiers()).mode).toBe('away')
  })

  it('never visits a toilet or bed it does not have', () => {
    const modes = new Set<string>()
    let pet = newRoomPet(0, rand)
    let seed = 1
    const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
    for (let i = 0; i < 4000; i++) {
      pet = stepRoomPet(pet, 'free', tiers(), 0, 0.25, r)
      modes.add(pet.mode)
    }
    expect(modes.has('toilet')).toBe(false)
    expect(modes.has('sleep')).toBe(false)
  })

  it('returns to free life once the need is met', () => {
    let pet = settle('eat', tiers({ table: 1 }))
    pet = stepRoomPet(pet, 'free', tiers({ table: 1 }), 0, 0.5, rand)
    expect(pet.activity).toBe('free')
    expect(pet.mode).not.toBe('eat')
  })
})
