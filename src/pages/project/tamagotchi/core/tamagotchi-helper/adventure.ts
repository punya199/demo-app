import {
  EnumEquipmentGrade,
  EnumEquipmentSlot,
  EnumMonsterLine,
  EnumMonsterStage,
  IEquipmentItem,
  IMonsterData,
} from '../tamagotchi-interface'
import { formatAge, toHearts } from './basics'

export const elementLabel: Record<EnumMonsterLine, string> = {
  [EnumMonsterLine.FLAME]: '🔥 เพลิง',
  [EnumMonsterLine.TIDE]: '💧 วารี',
  [EnumMonsterLine.LEAF]: '🌿 พฤกษ์',
  [EnumMonsterLine.EARTH]: '🪨 ธรณี',
  [EnumMonsterLine.LIGHTNING]: '⚡ สายฟ้า',
  [EnumMonsterLine.HOLY]: '✨ ศักดิ์สิทธิ์',
  [EnumMonsterLine.DARK]: '🌑 มืด',
  [EnumMonsterLine.SHADOW]: '🌫️ เงา',
}

// Mirrors the server's battle checks (assertCanBattle) so the button explains itself.
export const getBattleBlocker = (monster: IMonsterData | null): string | null => {
  if (!monster) {
    return 'ยังไม่มีมอน'
  }
  if (monster.diedAt) {
    return 'มอนจากไปแล้ว'
  }
  if (monster.stage === EnumMonsterStage.EGG) {
    return 'ไข่ยังไม่ฟัก'
  }
  if (monster.isSick) {
    return 'ป่วยอยู่ สู้ไม่ได้'
  }
  if (monster.expeditionAreaId) {
    return 'มอนออกสำรวจอยู่'
  }
  return null
}

// Adventure fights also need stamina (other battle modes don't): mirrors assertCanAdventure.
export const getAdventureBlocker = (
  monster: IMonsterData | null,
  staminaCost: number
): string | null =>
  getBattleBlocker(monster) ??
  (monster && monster.stamina < staminaCost ? 'Stamina ไม่พอ รอฟื้นหรือเติมก่อน' : null)

// Minutes until stamina is full again at the given regen rate (per hour); 0 when already full.
export const staminaFullInMinutes = (stamina: number, max: number, regenPerHour: number) =>
  Math.max(0, Math.ceil(((max - stamina) / regenPerHour) * 60))

export const getMinigameBlocker = (monster: IMonsterData | null, now: Date): string | null => {
  if (!monster || monster.diedAt || monster.stage === EnumMonsterStage.EGG) {
    return 'ต้องมีมอนที่ฟักแล้ว'
  }
  if (monster.minigameReadyAt && new Date(monster.minigameReadyAt) > now) {
    const minutesLeft = Math.ceil(
      (new Date(monster.minigameReadyAt).getTime() - now.getTime()) / 60_000
    )
    return `เล่นได้อีกครั้งใน ${formatAge(minutesLeft)}`
  }
  return null
}

export const getStaminaRefillBlocker = (
  monster: IMonsterData | null,
  max: number,
  gem: number,
  price: number
): string | null => {
  if (!monster || monster.diedAt || monster.stage === EnumMonsterStage.EGG) {
    return 'ต้องมีมอนที่ฟักแล้ว'
  }
  if (monster.stamina >= max) {
    return 'Stamina เต็มอยู่แล้ว'
  }
  return gem < price ? 'เพชรไม่พอ' : null
}

// Mini-game bar: position 0-100 sweeping back and forth once per `periodMs`.
export const minigameBarPosition = (elapsedMs: number, periodMs: number) => {
  const phase = (elapsedMs % periodMs) / periodMs
  return phase < 0.5 ? phase * 200 : (1 - phase) * 200
}

export const isInZone = (position: number, zone: { start: number; width: number }) =>
  position >= zone.start && position <= zone.start + zone.width

// Enum order is evolution order (egg ... fused).
const stageRank = (stage: EnumMonsterStage) => Object.values(EnumMonsterStage).indexOf(stage)

// Whether a monster at `stage` has evolved far enough to wear `item`.
export const meetsMinStage = (stage: EnumMonsterStage, item: Pick<IEquipmentItem, 'minStage'>) =>
  !item.minStage || stageRank(stage) >= stageRank(item.minStage)

export type BagFilterSlot = EnumEquipmentSlot | 'all'
// One set id, 'none' (pieces without a set) or 'all'.
export type BagFilterSet = string

export const BAG_SET_ALL = 'all'
export const BAG_SET_NONE = 'none'

// The bag as the gear screen lists it: one slot type (or all), one set (or all), optionally only
// pieces nobody wears, optionally only pieces a monster of `usableStage` may wear (stage
// requirement only; pieces another pet wears still count, they can be moved), highest grade first
// then highest level.
export const filterBag = (
  items: IEquipmentItem[],
  filter: {
    slot: BagFilterSlot
    freeOnly: boolean
    setId?: BagFilterSet
    usableStage?: EnumMonsterStage
  }
) => {
  const gradeOrder = Object.values(EnumEquipmentGrade)
  const setId = filter.setId ?? BAG_SET_ALL
  return items
    .filter((item) => filter.slot === 'all' || item.slot === filter.slot)
    .filter((item) => !filter.freeOnly || !item.equipped)
    .filter((item) => !filter.usableStage || meetsMinStage(filter.usableStage, item))
    .filter(
      (item) =>
        setId === BAG_SET_ALL || (setId === BAG_SET_NONE ? !item.setId : item.setId === setId)
    )
    .sort(
      (a, b) =>
        gradeOrder.indexOf(b.grade) - gradeOrder.indexOf(a.grade) || b.enhanceLevel - a.enhanceLevel
    )
}

// Pieces per set for the set dropdown, under the other filters (slot, free only); the key
// BAG_SET_NONE counts pieces without a set.
export const countBagBySet = (
  items: IEquipmentItem[],
  filter: { slot: BagFilterSlot; freeOnly: boolean; usableStage?: EnumMonsterStage }
) => {
  const counts: Record<string, number> = {}
  for (const item of filterBag(items, filter)) {
    const key = item.setId ?? BAG_SET_NONE
    counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

// Mirrors startExpedition's checks so the button explains itself.
export const getExpeditionBlocker = (
  monster: IMonsterData | null,
  isAreaUnlocked: boolean
): string | null => {
  if (!monster || monster.diedAt || monster.stage === EnumMonsterStage.EGG) {
    return 'ต้องมีมอนที่ฟักแล้ว'
  }
  if (monster.expeditionAreaId) {
    return 'มอนออกสำรวจอยู่แล้ว'
  }
  if (monster.isSick || toHearts(monster.fullness) === 0) {
    return 'มอนป่วยหรือหิว ดูแลก่อนออกสำรวจ'
  }
  return isAreaUnlocked ? null : 'ชนะบอสพื้นที่ก่อนหน้าก่อน'
}

// How many runs the stamina pays for, up to the per-request cap.
export const skipRunsAffordable = (stamina: number, staminaCost: number, maxRuns: number) =>
  staminaCost > 0 ? Math.min(maxRuns, Math.floor(stamina / staminaCost)) : maxRuns

// Buying fills the bag, so it needs no monster - only enough coins.
export const getShopBlocker = (
  price: number,
  balance: number,
  currencyLabel = 'เหรียญ'
): string | null => (balance < price ? `${currencyLabel}ไม่พอ` : null)

// Using an item from the bag needs a hatched, living monster.
export const getUseItemBlocker = (monster: IMonsterData | null): string | null =>
  !monster || monster.diedAt || monster.stage === EnumMonsterStage.EGG
    ? 'ต้องมีมอนที่ฟักแล้ว'
    : null
