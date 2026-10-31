import {
  IPvpStatus,
  EnhanceFailure,
  EnumEquipmentGrade,
  EnumEquipmentSlot,
  IEnhancePreview,
  StatKey,
  BattleSide,
  EnumMonsterAction,
  EnumMonsterDeathCause,
  EnumMonsterLine,
  EnumMonsterStage,
  IBattleData,
  IBattleEvent,
  IEvolutionInfo,
  IEvolutionRuleInfo,
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
]

// Hearts are stored as fractions; any partly-filled heart still shows as a full one.
export const toHearts = (value: number) =>
  Math.min(MAX_HEARTS, Math.max(0, Math.ceil(Math.round(value * 1000) / 1000)))

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

export const elementLabel: Record<EnumMonsterLine, string> = {
  [EnumMonsterLine.FLAME]: '🔥 เพลิง',
  [EnumMonsterLine.TIDE]: '💧 วารี',
  [EnumMonsterLine.LEAF]: '🌿 พฤกษ์',
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

// Milliseconds until the next auto-battle may start (0 = now).
export const getAutoBattleDelayMs = (monster: IMonsterData | null, now: number) =>
  monster?.autoBattleReadyAt ? Math.max(0, new Date(monster.autoBattleReadyAt).getTime() - now) : 0

// Buying fills the bag, so it needs no monster - only enough coins.
export const getShopBlocker = (price: number, coin: number): string | null =>
  coin < price ? 'เหรียญไม่พอ' : null

// Using an item from the bag needs a hatched, living monster.
export const getUseItemBlocker = (monster: IMonsterData | null): string | null =>
  !monster || monster.diedAt || monster.stage === EnumMonsterStage.EGG
    ? 'ต้องมีมอนที่ฟักแล้ว'
    : null

export const describeBattleEvent = (event: IBattleEvent, battle: IBattleData) => {
  const attacker = event.actor === 'player' ? battle.player : battle.enemy
  const notes = [
    event.effectiveness === 'strong' && 'ได้เปรียบธาตุ!',
    event.effectiveness === 'weak' && 'เสียเปรียบธาตุ',
    event.isCritical && 'คริติคอล!',
  ].filter(Boolean)
  return `${attacker.name} ใช้ ${event.moveName} ${event.damage} ดาเมจ${
    notes.length ? ` (${notes.join(' ')})` : ''
  }`
}

// HP of one side after the first `shownEvents` events have played.
export const hpAfter = (
  events: IBattleEvent[],
  shownEvents: number,
  side: BattleSide,
  maxHp: number
) => {
  const hits = events.slice(0, shownEvents).filter((event) => event.actor !== side)
  return hits.length ? hits[hits.length - 1].targetHp : maxHp
}

const serverMessageLabel: Record<string, string> = {
  'Monster is sick': 'มอนป่วยอยู่ ฝึกไม่ได้',
  'Monster is still resting from training': 'มอนยังพักจากการฝึกอยู่',
  'Monster is not sick': 'มอนไม่ได้ป่วย',
  'Monster is no longer alive': 'มอนจากไปแล้ว',
  'The egg has not hatched yet': 'ไข่ยังไม่ฟัก',
  'You already have a living monster': 'คุณมีมอนที่ยังมีชีวิตอยู่แล้ว',
  'You do not have a monster yet': 'ยังไม่มีมอน',
  'Stage is locked': 'ด่านนี้ยังไม่ปลดล็อก',
  'Not enough coins': 'เหรียญไม่พอ',
  'Not enough gems': 'เพชรไม่พอ',
  'Stamina is already full': 'Stamina เต็มอยู่แล้ว',
  'Mini-game is not ready yet': 'มินิเกมยังไม่พร้อม รออีกสักครู่',
  'Invalid mini-game score': 'คะแนนมินิเกมไม่ถูกต้อง',
  'Your monster is too young for the arena': 'ต้องเป็นร่างโตขึ้นไปถึงเข้าสนามได้',
  'Set your defense team first': 'ตั้งทีมป้องกันก่อน',
  'Daily PvP limit reached': 'ท้าครบจำนวนของวันนี้แล้ว',
  'Opponent is not available': 'ท้าคู่ต่อสู้คนนี้ไม่ได้แล้ว ลองรีเฟรชรายชื่อ',
  'Defense team was changed recently': 'เพิ่งเปลี่ยนทีมป้องกัน รอสักครู่',
  'Season has not ended yet': 'ซีซันยังไม่จบ',
  'No season reward to claim': 'ไม่มีรางวัลซีซันให้รับ',
  'Not enough fights to earn a season reward': 'สู้ไม่ถึงเกณฑ์รับรางวัลซีซัน',
  'Battle not found': 'ไม่พบการต่อสู้',
  'Equipment not found': 'ไม่พบอุปกรณ์',
  'Take the equipment off first': 'ถอดอุปกรณ์ก่อน',
  'Equipment bag is full': 'กระเป๋าอุปกรณ์เต็ม',
  'Not enough enhance stones': 'หินตีบวกไม่พอ',
  'You do not have a protect scroll': 'ไม่มีใบกันแตก',
  'A protect scroll is not needed at this level': 'ระดับนี้ไม่ต้องใช้ใบกันแตก',
  'Equipment is already at the maximum level': 'ตีบวกสูงสุดแล้ว',
  'Material not found': 'ไม่พบวัตถุดิบ',
  'Monster is on an expedition': 'มอนออกสำรวจอยู่',
  'Monster is already on an expedition': 'มอนออกสำรวจอยู่แล้ว',
  'Monster is too unwell to explore': 'มอนป่วยหรือหิว ออกสำรวจไม่ได้',
  'Monster is not on an expedition': 'มอนไม่ได้ออกสำรวจ',
  'Area is locked': 'พื้นที่นี้ยังไม่ปลดล็อก',
  'Auto-battle is not ready yet': 'ต่อสู้อัตโนมัติยังไม่พร้อม รออีกสักครู่',
  'Daily auto-battle reward limit reached': 'ครบเพดานรางวัลต่อสู้อัตโนมัติของวันนี้แล้ว',
  'Clear this stage once before auto-battling it': 'ต้องชนะด่านนี้ด้วยตัวเองก่อน',
  'Auto-battle is not available on boss stages': 'บอสต่อสู้อัตโนมัติไม่ได้',
  'You do not have this item': 'ไม่มีไอเทมนี้ในกระเป๋า',
  'Quest is not complete or was already claimed': 'ภารกิจยังไม่สำเร็จ หรือรับรางวัลไปแล้ว',
}

export const toThaiErrorMessage = (serverMessage: unknown) =>
  (typeof serverMessage === 'string' && serverMessageLabel[serverMessage]) || 'ทำรายการไม่สำเร็จ'

const minutesSince = (isoTime: number, now: Date) => Math.max(0, (now.getTime() - isoTime) / 60_000)

interface IEvolutionCountdown {
  percent: number
  // Real minutes left if the page stays open (online) vs. if it is closed (offline).
  onlineMinutes: number
  offlineMinutes: number
}

// Counts the server's remaining stage progress down between polls. The page is open (online)
// while this runs, so progress is assumed to advance at the online rate since the last fetch.
export const getEvolutionCountdown = (
  evolution: IEvolutionInfo,
  fetchedAt: number,
  now: Date
): IEvolutionCountdown | null => {
  if (evolution.durationMinutes === null || evolution.remainingMinutes === null) {
    return null
  }
  const advanced = minutesSince(fetchedAt, now) * evolution.onlineMultiplier
  const remaining = Math.max(0, evolution.remainingMinutes - advanced)
  const done = evolution.durationMinutes - remaining
  return {
    percent: Math.min(100, Math.round((done / evolution.durationMinutes) * 100)),
    onlineMinutes: remaining / evolution.onlineMultiplier,
    offlineMinutes: remaining,
  }
}

// What a monster still needs for an evolution rule, e.g. ['ชนะอีก 3 ครั้ง'].
export const describeMissingConditions = (rule: IEvolutionRuleInfo, monster: IMonsterData) => {
  const missing: string[] = []
  if (rule.maxCareMistakes !== undefined && monster.careMistakes > rule.maxCareMistakes) {
    missing.push(`ดูแลพลาดเกินแล้ว (ได้ไม่เกิน ${rule.maxCareMistakes} ครั้ง)`)
  }
  if (rule.minTrainCount !== undefined && monster.trainCount < rule.minTrainCount) {
    missing.push(`ฝึกอีก ${rule.minTrainCount - monster.trainCount} ครั้ง`)
  }
  if (rule.minWins !== undefined && monster.wins < rule.minWins) {
    missing.push(`ชนะอีก ${rule.minWins - monster.wins} ครั้ง`)
  }
  return missing
}

export const describeConditions = (rule: {
  maxCareMistakes?: number
  minTrainCount?: number
  minWins?: number
}) => {
  const parts = [
    rule.maxCareMistakes !== undefined && `ดูแลพลาด ≤ ${rule.maxCareMistakes}`,
    rule.minTrainCount !== undefined && `ฝึก ≥ ${rule.minTrainCount}`,
    rule.minWins !== undefined && `ชนะรวม ≥ ${rule.minWins}`,
  ].filter((part): part is string => !!part)
  return parts.length ? parts.join(' · ') : 'ไม่มีเงื่อนไข'
}

export const getMinigameBlocker = (monster: IMonsterData, now: Date): string | null => {
  if (monster.diedAt || monster.stage === EnumMonsterStage.EGG) {
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

// Mini-game bar: position 0-100 sweeping back and forth once per `periodMs`.
export const minigameBarPosition = (elapsedMs: number, periodMs: number) => {
  const phase = (elapsedMs % periodMs) / periodMs
  return phase < 0.5 ? phase * 200 : (1 - phase) * 200
}

export const isInZone = (position: number, zone: { start: number; width: number }) =>
  position >= zone.start && position <= zone.start + zone.width

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
}

export const gradeColor: Record<EnumEquipmentGrade, string> = {
  [EnumEquipmentGrade.COMMON]: 'default',
  [EnumEquipmentGrade.RARE]: 'blue',
  [EnumEquipmentGrade.EPIC]: 'purple',
  [EnumEquipmentGrade.LEGENDARY]: 'gold',
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

// Gear can't change while the monster is away (the server refuses).
export const getEquipBlocker = (monster: IMonsterData | null): string | null =>
  monster?.expeditionAreaId ? 'มอนออกสำรวจอยู่' : null

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

const PVP_STAGES = [EnumMonsterStage.ADULT, EnumMonsterStage.PERFECT, EnumMonsterStage.ULTIMATE]

// Mirrors the server's arena checks so the button explains itself.
export const getPvpBlocker = (
  monster: IMonsterData | null,
  status: IPvpStatus | undefined
): string | null => {
  if (!monster || monster.diedAt) {
    return 'ต้องมีมอนที่มีชีวิต'
  }
  if (!PVP_STAGES.includes(monster.stage)) {
    return 'ต้องเป็นร่างโตขึ้นไปถึงเข้าสนามได้'
  }
  if (monster.isSick) {
    return 'ป่วยอยู่ สู้ไม่ได้'
  }
  if (monster.expeditionAreaId) {
    return 'มอนออกสำรวจอยู่'
  }
  if (!status?.defense) {
    return 'ตั้งทีมป้องกันก่อน'
  }
  if (status.attemptsLeft <= 0) {
    return 'ท้าครบจำนวนของวันนี้แล้ว'
  }
  return null
}

export const getDefenseBlocker = (
  monster: IMonsterData | null,
  status: IPvpStatus | undefined,
  now: Date
): string | null => {
  if (!monster || monster.diedAt || !PVP_STAGES.includes(monster.stage)) {
    return 'ต้องเป็นร่างโตขึ้นไปถึงเข้าสนามได้'
  }
  if (status?.defense && new Date(status.defense.readyAt) > now) {
    const minutesLeft = Math.ceil(
      (new Date(status.defense.readyAt).getTime() - now.getTime()) / 60_000
    )
    return `เปลี่ยนทีมป้องกันได้อีกครั้งใน ${minutesLeft} นาที`
  }
  return null
}

export const formatRatingChange = (before: number, after: number) =>
  `${before} → ${after} (${after >= before ? '+' : ''}${after - before})`
