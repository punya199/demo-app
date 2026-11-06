import { craftMaterialLabel, refineStoneLabel, stageLabel } from './tamagotchi-helper'
import { EnumMonsterStage, IInventoryItem, IWikiData } from './tamagotchi-interface'

// Display-only helpers for the bag's materials tab. The server owns every rule; these only name
// and group the rows of GET /inventory.

interface INamed {
  id: string
  name: string
  emoji: string
}

export interface IItemSources {
  shopItems: INamed[]
  materials: INamed[]
  craftMaterials: INamed[]
  bosses: INamed[]
  // Every species, to name the Pet Cores (`petcore:<speciesId>`).
  species: (INamed & { stage: EnumMonsterStage })[]
}

export type InventoryGroupKey = 'craft' | 'core' | 'upgrade' | 'token' | 'consumable' | 'other'

export interface IInventoryEntry {
  itemId: string
  label: string
  quantity: number
}

export interface IInventoryGroup {
  key: InventoryGroupKey
  title: string
  entries: IInventoryEntry[]
}

const BOSS_TOKEN_PREFIX = 'boss_token:'
const CRAFT_PREFIX = 'craft_'
// Same as PET_CORE_ITEM_PREFIX on the server (the wiki also publishes it).
export const PET_CORE_PREFIX = 'petcore:'

export const INVENTORY_GROUP_TITLE: Record<InventoryGroupKey, string> = {
  craft: 'วัตถุดิบคราฟต์',
  core: 'แกนสัตว์เลี้ยง (กลับดาว)',
  upgrade: 'วัตถุดิบตีบวก / รีไฟน์',
  token: 'เหรียญบอส',
  consumable: 'ไอเทมใช้งาน',
  other: 'อื่น ๆ',
}

// Fixed display order.
const GROUP_ORDER: InventoryGroupKey[] = [
  'craft',
  'core',
  'upgrade',
  'token',
  'consumable',
  'other',
]

export const itemSourcesOf = (wiki: IWikiData | undefined): IItemSources => ({
  shopItems: wiki?.economy.shopItems ?? [],
  materials: wiki?.equipment.materials ?? [],
  craftMaterials: wiki?.craft.materials ?? [],
  bosses: [...(wiki?.raid.bosses ?? []), ...(wiki?.worldBoss.bosses ?? [])],
  species: wiki?.evolution.species ?? [],
})

const named = <T extends INamed>(list: T[], id: string) => list.find((entry) => entry.id === id)
const show = (entry: INamed) => `${entry.emoji} ${entry.name}`

// "emoji name" for any inventory item id; the raw id when nothing knows it.
export const itemLabel = (itemId: string, sources: IItemSources): string => {
  if (itemId.startsWith(BOSS_TOKEN_PREFIX)) {
    const boss = named(sources.bosses, itemId.slice(BOSS_TOKEN_PREFIX.length))
    return boss ? `🎫 ${boss.emoji} ${boss.name}` : '🎫 เหรียญบอส'
  }
  if (itemId.startsWith(PET_CORE_PREFIX)) {
    const species = named(sources.species, itemId.slice(PET_CORE_PREFIX.length))
    return species
      ? `🔮 ${species.emoji} ${species.name} (${stageLabel[species.stage]})`
      : '🔮 แกนสัตว์เลี้ยง'
  }
  const shop = named(sources.shopItems, itemId)
  const material = named(sources.materials, itemId)
  const craft = named(sources.craftMaterials, itemId)
  return (
    (craft && show(craft)) ??
    craftMaterialLabel[itemId] ??
    refineStoneLabel[itemId] ??
    (shop && show(shop)) ??
    (material && show(material)) ??
    itemId
  )
}

export const inventoryGroupOf = (itemId: string, sources: IItemSources): InventoryGroupKey => {
  if (itemId.startsWith(BOSS_TOKEN_PREFIX)) return 'token'
  if (itemId.startsWith(PET_CORE_PREFIX)) return 'core'
  if (itemId.startsWith(CRAFT_PREFIX)) return 'craft'
  if (itemId in refineStoneLabel || named(sources.materials, itemId)) return 'upgrade'
  if (named(sources.shopItems, itemId)) return 'consumable'
  return 'other'
}

// Owned items only (quantity > 0), grouped in a fixed order; empty groups are left out.
export const groupInventory = (items: IInventoryItem[], sources: IItemSources): IInventoryGroup[] =>
  GROUP_ORDER.map((key) => ({
    key,
    title: INVENTORY_GROUP_TITLE[key],
    entries: items
      .filter((item) => item.quantity > 0 && inventoryGroupOf(item.itemId, sources) === key)
      .map((item) => ({
        itemId: item.itemId,
        label: itemLabel(item.itemId, sources),
        quantity: item.quantity,
      }))
      .sort((left, right) => left.itemId.localeCompare(right.itemId)),
  })).filter((group) => group.entries.length > 0)
