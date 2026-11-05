import { describe, expect, it } from 'vitest'
import { groupInventory, inventoryGroupOf, IItemSources, itemLabel } from './inventory-helper'

const sources: IItemSources = {
  shopItems: [{ id: 'meat', name: 'เนื้อ', emoji: '🍖' }],
  materials: [{ id: 'enhance_stone', name: 'หินตีบวก', emoji: '🪨' }],
  bosses: [{ id: 'lava_king', name: 'ราชันย์ลาวา', emoji: '🔥' }],
}

describe('itemLabel', () => {
  it('names every kind of item, and falls back to the raw id', () => {
    expect(itemLabel('craft_catalyst', sources)).toBe('💎 Catalyst')
    expect(itemLabel('refine_stone_rare', sources)).toBe('💠 รีไฟน์หายาก')
    expect(itemLabel('meat', sources)).toBe('🍖 เนื้อ')
    expect(itemLabel('enhance_stone', sources)).toBe('🪨 หินตีบวก')
    expect(itemLabel('boss_token:lava_king', sources)).toBe('🎫 🔥 ราชันย์ลาวา')
    expect(itemLabel('boss_token:gone', sources)).toBe('🎫 เหรียญบอส')
    expect(itemLabel('mystery', sources)).toBe('mystery')
  })
})

describe('inventoryGroupOf', () => {
  it('sorts ids into the four groups, with the rest as other', () => {
    expect(inventoryGroupOf('craft_forge_core', sources)).toBe('craft')
    expect(inventoryGroupOf('refine_stone_epic', sources)).toBe('upgrade')
    expect(inventoryGroupOf('enhance_stone', sources)).toBe('upgrade')
    expect(inventoryGroupOf('boss_token:lava_king', sources)).toBe('token')
    expect(inventoryGroupOf('meat', sources)).toBe('consumable')
    expect(inventoryGroupOf('mystery', sources)).toBe('other')
  })
})

describe('groupInventory', () => {
  it('lists owned items only, in a fixed group order, without empty groups', () => {
    const groups = groupInventory(
      [
        { itemId: 'meat', quantity: 2 },
        { itemId: 'craft_catalyst', quantity: 1 },
        { itemId: 'craft_essence_flame', quantity: 0 },
        { itemId: 'enhance_stone', quantity: 5 },
        { itemId: 'craft_forge_core', quantity: 3 },
      ],
      sources
    )
    expect(groups.map((group) => group.key)).toEqual(['craft', 'upgrade', 'consumable'])
    expect(groups[0].entries.map((entry) => entry.itemId)).toEqual([
      'craft_catalyst',
      'craft_forge_core',
    ])
  })

  it('returns nothing for an empty bag', () => {
    expect(groupInventory([], sources)).toEqual([])
  })
})
