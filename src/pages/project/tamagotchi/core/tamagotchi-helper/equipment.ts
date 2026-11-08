import {
  EnhanceFailure,
  EnumEquipmentGrade,
  EnumEquipmentSlot,
  IEnhancePreview,
  StatKey,
  IEquipmentItem,
  IMonsterData,
  ISpecialOption,
  SpecialKey,
} from '../tamagotchi-interface'
import { stageLabel } from './basics'
import { meetsMinStage } from './adventure'

export const slotLabel: Record<EnumEquipmentSlot, string> = {
  [EnumEquipmentSlot.WEAPON]: '⚔️ อาวุธ',
  [EnumEquipmentSlot.ARMOR]: '🛡️ เกราะ',
  [EnumEquipmentSlot.HELMET]: '⛑️ หมวก',
  [EnumEquipmentSlot.ACCESSORY]: '💍 เครื่องประดับ',
}

export const gradeLabel: Record<EnumEquipmentGrade, string> = {
  [EnumEquipmentGrade.COMMON]: 'ธรรมดา',
  [EnumEquipmentGrade.RARE]: 'หายาก',
  [EnumEquipmentGrade.EPIC]: 'มหากาพย์',
  [EnumEquipmentGrade.LEGENDARY]: 'ตำนาน',
  [EnumEquipmentGrade.MYTHIC]: 'มิธิก',
}

export const gradeColor: Record<EnumEquipmentGrade, string> = {
  [EnumEquipmentGrade.COMMON]: 'default',
  [EnumEquipmentGrade.RARE]: 'blue',
  [EnumEquipmentGrade.EPIC]: 'purple',
  [EnumEquipmentGrade.LEGENDARY]: 'gold',
  [EnumEquipmentGrade.MYTHIC]: 'magenta',
}

export const statLabel: Record<StatKey, string> = { hp: 'HP', atk: 'ATK', def: 'DEF', spd: 'SPD' }

export const enhanceFailureLabel: Record<EnhanceFailure, string> = {
  material: 'ล้มเหลว: เสียหินกับเหรียญ ระดับเท่าเดิม',
  drop: 'ล้มเหลว: ระดับลด 1',
  drop_or_break: 'ล้มเหลว: ระดับลด 1 หรืออาจแตก',
}

// "+3 ATK · +2 HP", skipping stats that are zero.
export const describeStats = (stats: Partial<Record<StatKey, number>>) =>
  (Object.keys(statLabel) as StatKey[])
    .filter((key) => (stats[key] ?? 0) > 0)
    .map((key) => `+${stats[key]} ${statLabel[key]}`)
    .join(' · ')

export const specialLabel: Record<SpecialKey, string> = {
  slowHunger: 'หิวช้าลง',
  staminaSaver: 'ใช้ stamina น้อยลง',
  treasureNose: 'ดรอปอุปกรณ์เพิ่ม',
  tidyPet: 'อึน้อยลง',
}

// "หิวช้าลง 12% · อึน้อยลง 20%", or '' for a piece without a special option.
export const describeSpecials = (options: ISpecialOption[] | undefined) =>
  (options ?? []).map(({ key, value }) => `${specialLabel[key]} ${value}%`).join(' · ')

// What swapping the worn piece (or an empty slot) for `item` changes, per stat, skipping stats
// that stay the same. A positive diff means the candidate is stronger.
export const compareEquipment = (item: IEquipmentItem, worn: IEquipmentItem | undefined) =>
  (Object.keys(statLabel) as StatKey[])
    .map((key) => ({ key, diff: item.stats[key] - (worn?.stats[key] ?? 0) }))
    .filter(({ diff }) => diff !== 0)

// Gear can't change while the monster is away (the server refuses).
export const getEquipBlocker = (
  monster: IMonsterData | null,
  item?: Pick<IEquipmentItem, 'minStage'>
): string | null => {
  if (monster?.expeditionAreaId) {
    return 'มอนออกสำรวจอยู่'
  }
  if (monster && item?.minStage && !meetsMinStage(monster.stage, item)) {
    return `ต้องวิวัฒนาการถึง ${stageLabel[item.minStage]} ขึ้นไป`
  }
  return null
}

// Mirrors the server's enhance checks so the button explains itself.
export const getEnhanceBlocker = (
  preview: IEnhancePreview,
  funds: { coin: number; stones: number; scrolls: number },
  useProtect: boolean
): string | null => {
  if (preview.maxed) {
    return 'ตีบวกสูงสุดแล้ว'
  }
  if (funds.coin < preview.cost.coin) {
    return 'เหรียญไม่พอ'
  }
  if (funds.stones < preview.cost.stones) {
    return 'หินตีบวกไม่พอ'
  }
  if (useProtect && funds.scrolls < 1) {
    return 'ไม่มีใบกันแตก'
  }
  return null
}

export const toPercent = (fraction: number) => `${Math.round(fraction * 1000) / 10}%`
