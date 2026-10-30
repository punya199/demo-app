import {
  EnumMonsterAction,
  EnumMonsterDeathCause,
  EnumMonsterLine,
  EnumMonsterStage,
  IMonsterData,
} from './tamagotchi-interface'

// Display helpers only. Whether an action is allowed is decided by the server; getActionBlocker
// just greys out buttons the server would reject anyway, so players get the reason up front.

export const MAX_HEARTS = 4

export const stageLabel: Record<EnumMonsterStage, string> = {
  [EnumMonsterStage.EGG]: 'ไข่',
  [EnumMonsterStage.BABY_1]: 'ร่างเด็ก 1',
  [EnumMonsterStage.BABY_2]: 'ร่างเด็ก 2',
  [EnumMonsterStage.ADULT]: 'ร่างโต',
  [EnumMonsterStage.PERFECT]: 'ร่างสมบูรณ์',
  [EnumMonsterStage.ULTIMATE]: 'ร่างสูงสุด',
}

export const deathCauseLabel: Record<EnumMonsterDeathCause, string> = {
  [EnumMonsterDeathCause.OLD_AGE]: 'จากไปอย่างสงบตามอายุขัย',
  [EnumMonsterDeathCause.SICKNESS]: 'ป่วยหนักโดยไม่ได้รับการรักษา',
  [EnumMonsterDeathCause.STARVATION]: 'หิวจนทนไม่ไหว',
}

interface ILineOption {
  line: EnumMonsterLine
  title: string
  emoji: string
  description: string
}

export const lineOptions: ILineOption[] = [
  {
    line: EnumMonsterLine.FLAME,
    title: 'ไข่เพลิง',
    emoji: '🔥',
    description: 'ธาตุเพลิง ร้อนแรง ซุกซน',
  },
  { line: EnumMonsterLine.TIDE, title: 'ไข่วารี', emoji: '💧', description: 'ธาตุวารี ใจเย็น อึด' },
  {
    line: EnumMonsterLine.LEAF,
    title: 'ไข่พฤกษ์',
    emoji: '🌿',
    description: 'ธาตุพฤกษ์ อ่อนโยน ฟื้นตัวไว',
  },
]

interface IActionOption {
  action: EnumMonsterAction
  label: string
  emoji: string
}

export const actionOptions: IActionOption[] = [
  { action: EnumMonsterAction.FEED, label: 'ให้อาหาร', emoji: '🍖' },
  { action: EnumMonsterAction.VITAMIN, label: 'วิตามิน', emoji: '💊' },
  { action: EnumMonsterAction.TRAIN, label: 'ฝึก', emoji: '🥊' },
  { action: EnumMonsterAction.CLEAN, label: 'เก็บอึ', emoji: '🧹' },
  { action: EnumMonsterAction.MEDICINE, label: 'ให้ยา', emoji: '💉' },
  { action: EnumMonsterAction.LIGHTS, label: 'ไฟ', emoji: '💡' },
]

// Hearts are stored as fractions; any partly-filled heart still shows as a full one.
export const toHearts = (value: number) =>
  Math.min(MAX_HEARTS, Math.max(0, Math.ceil(Math.round(value * 1000) / 1000)))

export const formatAge = (ageMinutes: number) => {
  const days = Math.floor(ageMinutes / 1440)
  const hours = Math.floor((ageMinutes % 1440) / 60)
  const minutes = ageMinutes % 60
  if (days > 0) {
    return `${days} วัน ${hours} ชม.`
  }
  if (hours > 0) {
    return `${hours} ชม. ${minutes} นาที`
  }
  return `${minutes} นาที`
}

export const getActionBlocker = (
  monster: IMonsterData,
  action: EnumMonsterAction,
  now: Date
): string | null => {
  if (monster.diedAt) {
    return 'มอนจากไปแล้ว'
  }
  if (monster.stage === EnumMonsterStage.EGG) {
    return 'ไข่ยังไม่ฟัก'
  }
  const needsAwake = [EnumMonsterAction.FEED, EnumMonsterAction.VITAMIN, EnumMonsterAction.TRAIN]
  if (needsAwake.includes(action) && monster.isSleeping) {
    return 'มอนกำลังหลับ'
  }
  if (action === EnumMonsterAction.TRAIN) {
    if (monster.isSick) {
      return 'ป่วยอยู่ ฝึกไม่ได้'
    }
    if (monster.trainReadyAt && new Date(monster.trainReadyAt) > now) {
      return 'กำลังพักจากการฝึก'
    }
  }
  if (action === EnumMonsterAction.MEDICINE && !monster.isSick) {
    return 'ไม่ได้ป่วย'
  }
  if (action === EnumMonsterAction.CLEAN && monster.poops === 0) {
    return 'สะอาดอยู่แล้ว'
  }
  return null
}

const serverMessageLabel: Record<string, string> = {
  'Monster is asleep': 'มอนกำลังหลับ',
  'Monster is sick': 'มอนป่วยอยู่ ฝึกไม่ได้',
  'Monster is still resting from training': 'มอนยังพักจากการฝึกอยู่',
  'Monster is not sick': 'มอนไม่ได้ป่วย',
  'Monster is no longer alive': 'มอนจากไปแล้ว',
  'The egg has not hatched yet': 'ไข่ยังไม่ฟัก',
  'You already have a living monster': 'คุณมีมอนที่ยังมีชีวิตอยู่แล้ว',
}

export const toThaiErrorMessage = (serverMessage: unknown) =>
  (typeof serverMessage === 'string' && serverMessageLabel[serverMessage]) || 'ทำรายการไม่สำเร็จ'
