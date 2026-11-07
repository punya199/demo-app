import {
  EnumMonsterAction,
  EnumMonsterDeathCause,
  EnumMonsterLine,
  EnumMonsterStage,
  IMonsterData,
} from '../tamagotchi-interface'

// just greys out buttons the server would reject anyway, so players get the reason up front.

export const MAX_HEARTS = 4

export const stageLabel: Record<EnumMonsterStage, string> = {
  [EnumMonsterStage.EGG]: 'ไข่',
  [EnumMonsterStage.BABY_1]: 'ร่างเด็ก 1',
  [EnumMonsterStage.BABY_2]: 'ร่างเด็ก 2',
  [EnumMonsterStage.ADULT]: 'ร่างโต',
  [EnumMonsterStage.PERFECT]: 'ร่างสมบูรณ์',
  [EnumMonsterStage.ULTIMATE]: 'ร่างสูงสุด',
  [EnumMonsterStage.FUSED]: 'ร่างผสาน',
}

export const deathCauseLabel: Record<EnumMonsterDeathCause, string> = {
  [EnumMonsterDeathCause.OLD_AGE]: 'จากไปอย่างสงบตามอายุขัย',
  [EnumMonsterDeathCause.SICKNESS]: 'ป่วยหนักโดยไม่ได้รับการรักษา',
  [EnumMonsterDeathCause.STARVATION]: 'หิวจนทนไม่ไหว',
  [EnumMonsterDeathCause.MERGED]: 'รวมร่างเป็นมอนตัวใหม่แล้ว',
  [EnumMonsterDeathCause.RETURNED]: 'กลับดาวแล้ว ทิ้งแกนสัตว์เลี้ยงไว้',
}

interface ILineOption {
  line: EnumMonsterLine
  title: string
  emoji: string
  description: string
  // Rare eggs cost Raid Tokens to hatch (price comes from the server's guide data).
  isRare?: boolean
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
  {
    line: EnumMonsterLine.EARTH,
    title: 'ไข่ศิลา',
    emoji: '🪨',
    description: 'ธาตุธรณี หนักแน่น แกร่ง เชื่องช้า',
  },
  {
    line: EnumMonsterLine.LIGHTNING,
    title: 'ไข่อสนี',
    emoji: '⚡',
    description: 'ธาตุสายฟ้า ว่องไว พลังระเบิด เปราะบาง',
  },
  {
    line: EnumMonsterLine.HOLY,
    title: 'ไข่รัศมี',
    emoji: '✨',
    description: 'ธาตุศักดิ์สิทธิ์ อึดและฟื้นฟู ไข่หายาก',
    isRare: true,
  },
  {
    line: EnumMonsterLine.DARK,
    title: 'ไข่รัตติกาล',
    emoji: '🌑',
    description: 'ธาตุมืด พลังโจมตีสูง ไข่หายาก',
    isRare: true,
  },
  {
    line: EnumMonsterLine.SHADOW,
    title: 'ไข่เงา',
    emoji: '🌫️',
    description: 'ธาตุเงา ว่องไว หลบเก่ง ไข่หายาก',
    isRare: true,
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
]

// Hearts are stored as fractions; any partly-filled heart still shows as a full one.
export const toHearts = (value: number) =>
  Math.min(MAX_HEARTS, Math.max(0, Math.ceil(Math.round(value * 1000) / 1000)))

const BANGKOK_ZONE = 'Asia/Bangkok'
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

// "18:00 น." in Thailand, with the weekday and date ("จ. 10 พ.ย. 00:00 น.") when `withDate`.
export const formatResetAt = (resetsAt: string, withDate = true) => {
  const at = new Date(resetsAt)
  const clock = at.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: BANGKOK_ZONE,
  })
  const date = withDate
    ? `${at.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', timeZone: BANGKOK_ZONE })} `
    : ''
  return `${date}${clock} น.`
}

// "รีเซ็ตใน 2 ชม. 15 นาที (18:00 น.)": time left to `resetsAt` plus its clock time in Thailand.
// A reset a day or more away also names its weekday and date (a bare clock time would be ambiguous).
export const describeReset = (resetsAt: string, now: Date) => {
  const minutesLeft = Math.ceil((new Date(resetsAt).getTime() - now.getTime()) / 60_000)
  return `รีเซ็ตใน ${formatAge(minutesLeft)} (${formatResetAt(resetsAt, minutesLeft >= 1440)})`
}

// How the server schedules a reset, all on the Thai clock (UTC+7, no DST): quest day and PvP
// attempts at midnight, weekly quests and the world boss on Monday 00:00, PvP seasons on Monday 00:00 too,
// and boss attempts in `hours`-long windows counted from midnight (as daily-fights.ts).
export type ResetSchedule =
  | { kind: 'daily' }
  | { kind: 'weekly' }
  | { kind: 'monthly' }
  | { kind: 'window'; hours: number }

// The first reset strictly after `now`, as an ISO string.
export const nextResetAt = (schedule: ResetSchedule, now: Date) => {
  const shifted = now.getTime() + BANGKOK_OFFSET_MS
  const dayStart = Math.floor(shifted / DAY_MS) * DAY_MS
  let next: number
  if (schedule.kind === 'daily') {
    next = dayStart + DAY_MS
  } else if (schedule.kind === 'weekly') {
    const sinceMonday = (new Date(dayStart).getUTCDay() + 6) % 7
    next = dayStart + (7 - sinceMonday) * DAY_MS
  } else if (schedule.kind === 'monthly') {
    const local = new Date(shifted)
    next = Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + 1, 1)
  } else {
    const windowMs = schedule.hours * 60 * 60 * 1000
    next = dayStart + (Math.floor((shifted - dayStart) / windowMs) + 1) * windowMs
  }
  return new Date(next - BANGKOK_OFFSET_MS).toISOString()
}

export const formatAge = (ageMinutes: number) => {
  const rounded = Math.max(0, Math.round(ageMinutes))
  const days = Math.floor(rounded / 1440)
  const hours = Math.floor((rounded % 1440) / 60)
  const minutes = rounded % 60
  if (days > 0) {
    return hours > 0 ? `${days} วัน ${hours} ชม.` : `${days} วัน`
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours} ชม. ${minutes} นาที` : `${hours} ชม.`
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
