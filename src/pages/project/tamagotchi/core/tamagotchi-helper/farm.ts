import {
  EnumFurnitureKind,
  EnumMonsterStage,
  IFarmData,
  IMonsterData,
} from '../tamagotchi-interface'
import { toHearts } from './basics'

// The Farm only draws what the server says (docs/adr/0001-farm-effects-are-server-side.md): these
// helpers turn a monster's server state into what it does in the room, never into a game stat.

export const furnitureLabel: Record<
  EnumFurnitureKind,
  { name: string; timer: string; effect: string }
> = {
  [EnumFurnitureKind.TABLE]: {
    name: 'โต๊ะอาหาร',
    timer: 'เวลาหิว',
    effect: 'ความอิ่มลดช้าลง',
  },
  [EnumFurnitureKind.GYM]: {
    name: 'เสื่อออกกำลัง',
    timer: 'เวลาอ่อนแรง',
    effect: 'ความแข็งแรงลดช้าลง',
  },
  [EnumFurnitureKind.TOILET]: {
    name: 'ห้องน้ำ',
    timer: 'เวลาอึ',
    effect: 'อึออกช้าลง',
  },
  [EnumFurnitureKind.BED]: {
    name: 'เตียง',
    timer: 'เวลาป่วย',
    effect: 'หิวนานขึ้นกว่าจะป่วย',
  },
}

// 0.15 -> "+15%"; no bonus -> "ยังไม่มี".
export const formatBonus = (bonus: number) =>
  bonus > 0 ? `+${Math.round(bonus * 100)}%` : 'ยังไม่มี'

// Tier of one furniture kind, 0 when the player never bought it.
export const tierOf = (farm: IFarmData | undefined, kind: EnumFurnitureKind) =>
  farm?.furniture.find((item) => item.kind === kind)?.tier ?? 0

export type FarmActivity = 'egg' | 'away' | 'sick' | 'eat' | 'gym' | 'free'

// What a monster does in the room, from its server state. The needs come first, in this order;
// a monster with no need is "free" and the room lets it wander, sit, sleep or visit the toilet.
export const farmActivity = (monster: IMonsterData): FarmActivity => {
  if (monster.diedAt) return 'free'
  if (monster.stage === EnumMonsterStage.EGG) return 'egg'
  if (monster.expeditionAreaId && !monster.expeditionReturned) return 'away'
  if (monster.isSick) return 'sick'
  if (toHearts(monster.fullness) <= 1) return 'eat'
  if (toHearts(monster.strength) <= 1) return 'gym'
  return 'free'
}

// Thai caption under a pet in the room.
export const farmActivityLabel: Record<FarmActivity, string> = {
  egg: 'ไข่กำลังอุ่น',
  away: 'ออกสำรวจ',
  sick: 'ป่วย นอนพัก',
  eat: 'หิวแล้ว',
  gym: 'ออกกำลัง',
  free: 'ว่าง',
}
