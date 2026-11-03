import {
  ISupportUnit,
  IWorldBossReward,
  IWorldBossStatus,
  IBattleStats,
  IFighterEffects,
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
  ICostume,
  ICostumeState,
  ILoadout,
  EnumCostumeSlot,
  IEquipmentItem,
  ISetProgress,
  IMergeForm,
  IMonsterData,
  IGetMyMonsterResponse,
  IPassiveNode,
  IPotentialStat,
  PassiveEffectKey,
  ISpecialOption,
  SpecialKey,
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
  [EnumMonsterStage.FUSED]: 'ร่างผสาน',
}

export const deathCauseLabel: Record<EnumMonsterDeathCause, string> = {
  [EnumMonsterDeathCause.OLD_AGE]: 'จากไปอย่างสงบตามอายุขัย',
  [EnumMonsterDeathCause.SICKNESS]: 'ป่วยหนักโดยไม่ได้รับการรักษา',
  [EnumMonsterDeathCause.STARVATION]: 'หิวจนทนไม่ไหว',
  [EnumMonsterDeathCause.MERGED]: 'รวมร่างเป็นมอนตัวใหม่แล้ว',
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

// "รีเซ็ตใน 2 ชม. 15 นาที (18:00 น.)": time left to `resetsAt` plus its clock time in Thailand.
export const describeReset = (resetsAt: string, now: Date) => {
  const at = new Date(resetsAt)
  const clock = at.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok',
  })
  return `รีเซ็ตใน ${formatAge(Math.ceil((at.getTime() - now.getTime()) / 60_000))} (${clock} น.)`
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

export type BagFilterSlot = EnumEquipmentSlot | 'all'

// The bag as the gear screen lists it: one slot type (or all), optionally only pieces nobody
// wears, highest grade first then highest level.
export const filterBag = (
  items: IEquipmentItem[],
  filter: { slot: BagFilterSlot; freeOnly: boolean }
) => {
  const gradeOrder = Object.values(EnumEquipmentGrade)
  return items
    .filter((item) => filter.slot === 'all' || item.slot === filter.slot)
    .filter((item) => !filter.freeOnly || !item.equipped)
    .sort(
      (a, b) =>
        gradeOrder.indexOf(b.grade) - gradeOrder.indexOf(a.grade) || b.enhanceLevel - a.enhanceLevel
    )
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

export const describeBattleEvent = (event: IBattleEvent, battle: IBattleData) => {
  // With a rented ally, `member` says which of the player's side acted (or was hit).
  const mine = battle.team?.[event.member ?? 0] ?? battle.player
  const attacker = event.actor === 'player' ? mine : battle.enemy
  // Burn ticks and regeneration affect the side opposite to `actor`.
  const affected = event.actor === 'player' ? battle.enemy : mine
  if (event.kind === 'burn') {
    return `${affected.name} ติดเผาไหม้ เสีย ${event.damage} HP`
  }
  if (event.kind === 'regen') {
    return `${affected.name} ฟื้นฟู +${event.damage} HP`
  }
  if (event.isDodged) {
    return `${affected.name} หลบการโจมตีของ ${attacker.name} ได้`
  }
  const notes = [
    event.effectiveness === 'strong' && 'ได้เปรียบธาตุ!',
    event.effectiveness === 'weak' && 'เสียเปรียบธาตุ',
    event.isCritical && 'คริติคอล!',
  ].filter(Boolean)
  if (event.absorbed) {
    notes.push(`โล่ดูด ${event.absorbed}`)
  }
  if (event.healed) {
    notes.push(`ดูดเลือด +${event.healed}`)
  }
  if (event.reflected) {
    notes.push(`โดนสะท้อน −${event.reflected}`)
  }
  const verb = event.kind === 'double' ? 'โจมตีซ้ำ' : `ใช้ ${event.moveName}`
  return `${attacker.name} ${verb} ${event.damage} ดาเมจ${notes.length ? ` (${notes.join(' ')})` : ''}`
}

// HP of one side after the first `shownEvents` events have played.
export const hpAfter = (
  events: IBattleEvent[],
  shownEvents: number,
  side: BattleSide,
  maxHp: number
) => {
  // In a team fight the player's bar follows the player (member 0), not the rented ally. A hit
  // changes the target's HP; lifesteal and thorns also change the attacker's (`actorHp`).
  let hp = maxHp
  for (const event of events.slice(0, shownEvents)) {
    if (event.actor !== side) {
      if (side !== 'player' || (event.member ?? 0) === 0) {
        hp = event.targetHp
      }
    } else if (event.actorHp !== undefined) {
      hp = event.actorHp
    }
  }
  return hp
}

const serverMessageLabel: Record<string, string> = {
  'Only monsters in their final form can be merged': 'รวมร่างได้เฉพาะมอนร่างสูงสุด',
  'Pick two different monsters': 'เลือกมอนสองตัวที่ต่างกัน',
  'The base must be one of the two monsters': 'ตัวหลักต้องเป็นหนึ่งในสองตัวที่เลือก',
  'Monster not found': 'ไม่พบมอนตัวนี้',
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
  'Not enough raid tokens': 'Raid Token ไม่พอ',
  'Natural and spiritual elements cannot be merged': 'ธาตุธรรมชาติกับธาตุจิตวิญญาณรวมกันไม่ได้',
  'Not enough boss tokens': 'Boss Token ไม่พอ',
  'Raid attempts used up until the next reset': 'สู้บอสครบจำนวนแล้ว รอรีเซ็ต',
  'Your monster is not strong enough for this difficulty': 'ร่างของมอนยังไม่ถึงเกณฑ์ของระดับนี้',
  'Clear the previous difficulty first': 'ต้องชนะระดับก่อนหน้าก่อน',
  'Clear this difficulty first': 'ต้องชนะระดับที่ดรอปเกรดนี้ก่อนถึงจะแลกได้',
  'Boss not found': 'ไม่พบบอส',
  'Invalid friend code': 'รหัสเพื่อนไม่ถูกต้อง',
  'Friend code not found': 'ไม่พบรหัสเพื่อนนี้',
  'You cannot add yourself': 'เพิ่มตัวเองเป็นเพื่อนไม่ได้',
  'Already friends': 'เป็นเพื่อนกันอยู่แล้ว',
  'Friend request already sent': 'ส่งคำขอไปแล้ว รออีกฝ่ายตอบรับ',
  'Friend list is full': 'รายชื่อเพื่อนเต็ม',
  'That player has too many pending requests': 'ผู้เล่นคนนั้นมีคำขอค้างอยู่มากเกินไป',
  'Friend request not found': 'ไม่พบคำขอเป็นเพื่อน',
  'Friend not found': 'ไม่พบเพื่อนคนนี้',
  'You already greeted this friend today': 'ทักทายเพื่อนคนนี้วันนี้แล้ว',
  'Daily gift limit reached': 'ส่งของขวัญครบจำนวนของวันนี้แล้ว',
  'Your monster is too young to be a support unit': 'ต้องเป็นร่างโตขึ้นไปถึงตั้งเป็นตัวซัพพอร์ตได้',
  'Support unit was changed recently': 'เพิ่งเปลี่ยนตัวซัพพอร์ต รอสักครู่',
  'Support unit is not available': 'ใช้ตัวซัพพอร์ตนี้ไม่ได้',
  'Your monster is too young for the world boss': 'ต้องเป็นร่างโตขึ้นไปถึงตีบอสโลกได้',
  'World boss hits used up until the next reset': 'ตีบอสโลกครบจำนวนแล้ว รอรีเซ็ต',
  'World boss is not active': 'บอสโลกตัวนี้ถูกล้มหรือหมดเวลาแล้ว',
  'World boss has not ended yet': 'สัปดาห์นี้ยังไม่จบ',
  'World boss week not found': 'ไม่พบบอสโลกสัปดาห์นี้',
  'No world boss reward to claim': 'ไม่มีรางวัลบอสโลกให้รับ',
  'Take part in this world boss first': 'ต้องเคยรับรางวัลบอสโลกตัวนี้ก่อนถึงแลกได้',
  'Exchange not found': 'ไม่พบรายการแลก',
  'Equipment not found': 'ไม่พบอุปกรณ์',
  'Equipment is worn by another monster': 'ชิ้นนี้ตัวอื่นใส่อยู่ ถอดหรือย้ายมาก่อน',
  'Not enough stamina': 'Stamina ไม่พอ รอฟื้นหรือเติมก่อน',
  'Stamina is already full': 'Stamina เต็มอยู่แล้ว',
  'Take the equipment off first': 'ถอดอุปกรณ์ก่อน',
  'Equipment bag is full': 'กระเป๋าอุปกรณ์เต็ม',
  'Not enough enhance stones': 'หินตีบวกไม่พอ',
  'You do not have a protect scroll': 'ไม่มีใบกันแตก',
  'A protect scroll is not needed at this level': 'ระดับนี้ไม่ต้องใช้ใบกันแตก',
  'Equipment is already at the maximum level': 'ตีบวกสูงสุดแล้ว',
  'Material not found': 'ไม่พบวัตถุดิบ',
  'Monster is on an expedition': 'มอนออกสำรวจอยู่',
  'Pet name must be 1-16 characters': 'ชื่อต้องยาว 1-16 ตัวอักษร',
  'Pet name has characters that are not allowed':
    'ชื่อใช้ได้เฉพาะภาษาไทย อังกฤษ ตัวเลข ช่องว่าง และ - _ .',
  'Pet was renamed recently': 'เพิ่งเปลี่ยนชื่อ รออีกสักครู่ (เปลี่ยนได้ทุก 10 นาที)',
  'Monster is already on an expedition': 'มอนออกสำรวจอยู่แล้ว',
  'Monster is too unwell to explore': 'มอนป่วยหรือหิว ออกสำรวจไม่ได้',
  'Monster is not on an expedition': 'มอนไม่ได้ออกสำรวจ',
  'Area is locked': 'พื้นที่นี้ยังไม่ปลดล็อก',
  'Auto-battle is not ready yet': 'ต่อสู้อัตโนมัติยังไม่พร้อม รออีกสักครู่',
  'Daily auto-battle reward limit reached': 'ครบเพดานรางวัลต่อสู้อัตโนมัติของวันนี้แล้ว',
  'Clear this stage once before auto-battling it': 'ต้องชนะด่านนี้ด้วยตัวเองก่อน',
  'Auto-battle is not available on boss stages': 'บอสต่อสู้อัตโนมัติไม่ได้',
  'You do not have this item': 'ไม่มีไอเทมนี้ในกระเป๋า',
  'Login reward was already claimed today': 'วันนี้รับรางวัลเข้าสู่ระบบไปแล้ว',
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
// The World Boss takes every grown form, fused ones included (the arena does not).
const WORLD_BOSS_STAGES = [...PVP_STAGES, EnumMonsterStage.FUSED]

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

export const describeSetEffect = (effect: IFighterEffects) =>
  [
    effect.burnTurns && `สกิลทำให้ศัตรูติดเผาไหม้ ${effect.burnTurns} เทิร์น`,
    effect.shieldPct && `เริ่มสู้ด้วยโล่ ${toPercent(effect.shieldPct)} ของ HP`,
    effect.regenPct && `ฟื้น HP ${toPercent(effect.regenPct)} ทุกเทิร์น`,
    effect.doubleStrikeChance && `โจมตีซ้ำ ${toPercent(effect.doubleStrikeChance)}`,
    effect.critChance && `อัตราคริติคอล +${toPercent(effect.critChance)}`,
    effect.critDamage && `ดาเมจคริติคอล +${toPercent(effect.critDamage)}`,
  ]
    .filter(Boolean)
    .join(' · ')

export const describePctBonus = (pct: Partial<IBattleStats>) =>
  (Object.keys(statLabel) as StatKey[])
    .filter((key) => (pct[key] ?? 0) > 0)
    .map((key) => `${statLabel[key]} +${toPercent(pct[key] ?? 0)}`)
    .join(' · ')

// Mirrors the server's raid checks so the button explains itself.
export const getRaidBlocker = (
  monster: IMonsterData | null,
  difficulty: { unlocked: boolean },
  attemptsLeft: number
): string | null => {
  if (!monster || monster.diedAt) {
    return 'ต้องมีมอนที่มีชีวิต'
  }
  if (monster.isSick) {
    return 'ป่วยอยู่ สู้ไม่ได้'
  }
  if (monster.expeditionAreaId) {
    return 'มอนออกสำรวจอยู่'
  }
  if (!difficulty.unlocked) {
    return 'ยังไม่ปลดล็อก (ต้องถึงร่างที่กำหนด และชนะระดับก่อนหน้า)'
  }
  if (attemptsLeft <= 0) {
    return 'สู้บอสครบจำนวนแล้ว รอรีเซ็ต'
  }
  return null
}

// Mirrors the server's world boss checks so the button explains itself.
export const getWorldBossBlocker = (
  monster: IMonsterData | null,
  status: IWorldBossStatus | undefined
): string | null => {
  if (!monster || monster.diedAt) {
    return 'ต้องมีมอนที่มีชีวิต'
  }
  if (!WORLD_BOSS_STAGES.includes(monster.stage)) {
    return 'ต้องเป็นร่างโตขึ้นไปถึงตีบอสโลกได้'
  }
  if (monster.isSick) {
    return 'ป่วยอยู่ สู้ไม่ได้'
  }
  if (monster.expeditionAreaId) {
    return 'มอนออกสำรวจอยู่'
  }
  if (status?.boss.isDefeated) {
    return 'บอสตัวนี้ถูกล้มแล้ว รอบอสสัปดาห์หน้า'
  }
  if (status && status.hitsLeft <= 0) {
    return 'ตีครบจำนวนแล้ว รอรีเซ็ต'
  }
  return null
}

export const describeWorldBossReward = (reward: IWorldBossReward, bossTokenName = '🎫') =>
  [
    `🪙 ${reward.coin}`,
    reward.raidToken > 0 && `🎖️ ${reward.raidToken}`,
    reward.bossToken > 0 && `${bossTokenName} ${reward.bossToken}`,
    reward.pieceGrade && `ชิ้นเซ็ต (${gradeLabel[reward.pieceGrade]})`,
  ]
    .filter(Boolean)
    .join(' · ')

// Time left until `endsAt`, in days/hours/minutes ("2 วัน 3 ชม.").
export const formatTimeLeft = (endsAt: string, now: Date) => {
  const minutes = Math.max(0, Math.floor((new Date(endsAt).getTime() - now.getTime()) / 60_000))
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  if (days > 0) {
    return `${days} วัน ${hours} ชม.`
  }
  return hours > 0 ? `${hours} ชม. ${minutes % 60} นาที` : `${minutes} นาที`
}

// "ABCD2345" -> "ABCD-2345", easier to read out loud.
export const formatFriendCode = (code: string) => `${code.slice(0, 4)}-${code.slice(4)}`

export const getSupportBlocker = (
  monster: IMonsterData | null,
  support: ISupportUnit | null | undefined,
  now: Date
): string | null => {
  if (!monster || monster.diedAt || !PVP_STAGES.includes(monster.stage)) {
    return 'ต้องเป็นร่างโตขึ้นไปถึงตั้งเป็นตัวซัพพอร์ตได้'
  }
  if (support && new Date(support.readyAt) > now) {
    const minutesLeft = Math.ceil((new Date(support.readyAt).getTime() - now.getTime()) / 60_000)
    return `เปลี่ยนตัวซัพพอร์ตได้อีกครั้งใน ${minutesLeft} นาที`
  }
  return null
}

export const getGiftBlocker = (giftsLeft: number, ownedItems: number): string | null => {
  if (giftsLeft <= 0) {
    return 'ส่งของขวัญครบจำนวนของวันนี้แล้ว'
  }
  return ownedItems <= 0 ? 'ไม่มีไอเทมในกระเป๋าให้ส่ง' : null
}

export const PASSIVE_HUB = 'hub'

export const passiveEffectLabel: Record<PassiveEffectKey, string> = {
  atk: 'ATK',
  hp: 'HP',
  def: 'DEF',
  spd: 'SPD',
  crit: 'โอกาสคริติคอล',
  critdmg: 'ดาเมจคริติคอล',
  shield: 'โล่เริ่มต้น (% ของ HP)',
  regen: 'ฟื้น HP ต่อเทิร์น (%)',
  dbl: 'โอกาสโจมตีซ้ำ',
  burn: 'เทิร์นเผาไหม้ของท่าพิเศษ',
  hunger: 'ความอิ่มลดช้าลง',
  expCoin: 'เหรียญจากการสำรวจ',
  drop: 'โอกาสดรอปอุปกรณ์',
  lifesteal: 'ดูดเลือด (% ของดาเมจ)',
  thorns: 'สะท้อนดาเมจ (%)',
  firstStrike: 'ลงมือก่อนเสมอ',
  noCrit: 'ไม่ติดคริติคอล',
}

// "+3% ATK", "−20% HP", "เทิร์นเผาไหม้ของท่าพิเศษ +1".
export const describePassiveEffect = (key: PassiveEffectKey, value: number) => {
  const sign = value > 0 ? '+' : '−'
  const amount = Math.abs(value)
  if (key === 'firstStrike' || key === 'noCrit') {
    return passiveEffectLabel[key]
  }
  // These labels already carry their unit.
  if (key === 'burn' || key === 'shield' || key === 'regen') {
    return `${passiveEffectLabel[key]} ${sign}${amount}`
  }
  return `${sign}${amount}% ${passiveEffectLabel[key]}`
}

// Mirrors the server's passive rules (passive-data.ts) so a click can explain itself; the server
// still decides.
export const canAllocatePassive = (nodes: IPassiveNode[], owned: string[], nodeId: string) => {
  const node = nodes.find((entry) => entry.id === nodeId)
  return (
    !!node &&
    !owned.includes(nodeId) &&
    node.adj.some((id) => id === PASSIVE_HUB || owned.includes(id))
  )
}

export const canDeallocatePassive = (nodes: IPassiveNode[], owned: string[], nodeId: string) => {
  if (!owned.includes(nodeId)) {
    return false
  }
  const rest = new Set(owned.filter((id) => id !== nodeId))
  const seen = new Set([PASSIVE_HUB])
  const stack = [PASSIVE_HUB]
  while (stack.length) {
    const node = nodes.find((entry) => entry.id === stack.pop())
    for (const id of node?.adj ?? []) {
      if (rest.has(id) && !seen.has(id)) {
        seen.add(id)
        stack.push(id)
      }
    }
  }
  return [...rest].every((id) => seen.has(id))
}

// Total of every effect over the owned nodes (plus the picked mastery options), in the order of
// passiveEffectLabel.
export const sumPassiveEffects = (
  nodes: IPassiveNode[],
  owned: string[],
  picks: Record<string, number> = {}
) => {
  const totals: Partial<Record<PassiveEffectKey, number>> = {}
  for (const node of nodes) {
    if (owned.includes(node.id)) {
      const fx = { ...node.fx, ...(node.options?.[picks[node.id]]?.fx ?? {}) }
      for (const [key, value] of Object.entries(fx) as [PassiveEffectKey, number][]) {
        totals[key] = Math.round(((totals[key] ?? 0) + value) * 10) / 10
      }
    }
  }
  return (Object.keys(passiveEffectLabel) as PassiveEffectKey[])
    .filter((key) => totals[key])
    .map((key) => ({ key, value: totals[key]! }))
}

// Mirrors the server's ascendancy rule: the first node of a path is free to take, the rest must
// touch an owned node, and only one path can be used.
export const canAllocateAscendancyNode = (
  node: IPassiveNode,
  path: string | null,
  owned: string[]
) => {
  if (node.kind !== 'ascend' || owned.includes(node.id)) {
    return false
  }
  if (owned.length === 0) {
    return node.id.endsWith('-00')
  }
  return node.id.startsWith(`v2-asc-${path}-`) && node.adj.some((id) => owned.includes(id))
}

// `nodeId` plus every owned node that loses its link to the hub without it (a whole branch).
export const getPassiveBranch = (nodes: IPassiveNode[], owned: string[], nodeId: string) => {
  const rest = new Set(owned.filter((id) => id !== nodeId))
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const seen = new Set([PASSIVE_HUB])
  const stack = [PASSIVE_HUB]
  while (stack.length) {
    for (const id of byId.get(stack.pop()!)?.adj ?? []) {
      if (rest.has(id) && !seen.has(id)) {
        seen.add(id)
        stack.push(id)
      }
    }
  }
  return owned.includes(nodeId) ? owned.filter((id) => !seen.has(id)) : []
}

// Ids of nodes whose name or effect text contains `query` (case-insensitive); empty query = none.
export const searchPassiveNodes = (nodes: IPassiveNode[], query: string) => {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return new Set<string>()
  }
  return new Set(
    nodes
      .filter(
        (node) =>
          node.id !== PASSIVE_HUB &&
          (node.name.toLowerCase().includes(needle) ||
            Object.keys(node.fx).some(
              (key) =>
                key.toLowerCase().includes(needle) ||
                passiveEffectLabel[key as PassiveEffectKey].toLowerCase().includes(needle)
            ))
      )
      .map((node) => node.id)
  )
}

// Gems needed to take back `count` points when `refunded` were already taken back.
export const getRespecCost = (
  respec: { refunded: number; freeLeft: number; gemPrice: number },
  count: number
) => Math.max(0, count - respec.freeLeft) * respec.gemPrice

// A branch refund costs the same per point but never more than the cap.
export const getBranchRespecCost = (
  respec: { refunded: number; freeLeft: number; gemPrice: number; branchCap: number },
  count: number
) => Math.min(getRespecCost(respec, count), respec.branchCap)

// Mirrors the server's merge checks for one parent, so the picker explains itself.
export const getMergeParentBlocker = (monster: IMonsterData): string | null => {
  if (monster.diedAt) {
    return 'ตายไปแล้ว'
  }
  if (monster.stage !== EnumMonsterStage.ULTIMATE) {
    return 'ต้องเป็นร่างสูงสุด (ยังไม่ใช่ร่างสุดท้าย)'
  }
  if (monster.isSick) {
    return 'ป่วยอยู่'
  }
  return monster.expeditionAreaId ? 'ออกสำรวจอยู่' : null
}

// The form two parents make, whichever order they are picked in.
export const findMergeForm = (
  forms: IMergeForm[],
  first: EnumMonsterLine,
  second: EnumMonsterLine
) =>
  forms.find(
    (form) =>
      (form.lines[0] === first && form.lines[1] === second) ||
      (form.lines[0] === second && form.lines[1] === first)
  )

export const getMergeBlocker = (
  first: IMonsterData | undefined,
  second: IMonsterData | undefined,
  wallet: { coin: number; gem: number } | undefined,
  cost: { coin: number; gem: number },
  spiritualLines: EnumMonsterLine[] = []
): string | null => {
  if (!first || !second) {
    return 'เลือกมอนสองตัว'
  }
  const parentBlocker = getMergeParentBlocker(first) ?? getMergeParentBlocker(second)
  if (parentBlocker) {
    return parentBlocker
  }
  if (spiritualLines.includes(first.line) !== spiritualLines.includes(second.line)) {
    return 'ธาตุธรรมชาติกับธาตุจิตวิญญาณรวมกันไม่ได้'
  }
  if ((wallet?.coin ?? 0) < cost.coin) {
    return 'เหรียญไม่พอ'
  }
  return (wallet?.gem ?? 0) < cost.gem ? 'เพชรไม่พอ' : null
}

// Where a rolled value sits inside its range, 0-100 (a fixed stat sits at 0).
export const potentialPercent = (stat: IPotentialStat) =>
  stat.max === stat.min ? 0 : Math.round(((stat.value - stat.min) / (stat.max - stat.min)) * 100)

export const signed = (value: number) =>
  `${value >= 0 ? '+' : '−'}${Math.abs(Math.round(value * 10) / 10)}`

// Endpoints that answer with a single monster (hatch, action, expedition...) must not wipe the
// other living pets from the cached list: replace the monster in place, or append a new one
// (a fresh egg) and make it the selected one.
export const foldSelectedMonster = (
  old: IGetMyMonsterResponse | undefined,
  monster: IMonsterData
): IGetMyMonsterResponse => {
  const monsters = old?.monsters ?? []
  return {
    maxMonsters: old?.maxMonsters ?? 4,
    monster,
    monsters: monsters.some((row) => row.id === monster.id)
      ? monsters.map((row) => (row.id === monster.id ? monster : row))
      : [...monsters, monster],
  }
}

// A piece counts as worn on the gear screen only for the pet that screen is about.
export const isWornBy = (item: IEquipmentItem, monsterId: string | null) =>
  item.equipped && item.monsterId === monsterId

// Species name with the owner's nickname in front when the pet has one.
export const petLabel = (speciesName: string, nickname?: string | null) =>
  nickname ? `${nickname} (${speciesName})` : speciesName

export const costumeSlotLabel: Record<EnumCostumeSlot, string> = {
  [EnumCostumeSlot.HAT]: 'หมวก',
  [EnumCostumeSlot.FACE]: 'หน้า',
  [EnumCostumeSlot.BACK]: 'หลัง',
  [EnumCostumeSlot.AURA]: 'ออร่า',
  [EnumCostumeSlot.BACKDROP]: 'ฉากหลัง',
}

export const costumeThemeLabel: Record<string, string> = {
  casual: 'ลำลอง',
  spring: 'ฤดูใบไม้ผลิ',
  winter: 'ฤดูหนาว',
  festival: 'เทศกาล',
  knight: 'อัศวิน',
  sea: 'ทะเล',
  spirit: 'วิญญาณ',
  element: 'ธาตุ',
  royal: 'ราชวงศ์',
}

// The costumes a loadout names, by slot, looked up in the catalog; ids the catalog does not know
// are skipped, so a stale or odd id can never break the drawing.
export const resolveLoadout = (
  loadout: ILoadout | null | undefined,
  catalog: ICostume[] | undefined
): Partial<Record<EnumCostumeSlot, ICostume>> => {
  const layers: Partial<Record<EnumCostumeSlot, ICostume>> = {}
  for (const slot of Object.values(EnumCostumeSlot)) {
    const costume = catalog?.find((row) => row.id === loadout?.[slot])
    if (costume && costume.slot === slot) {
      layers[slot] = costume
    }
  }
  return layers
}

export const describeCostumePrice = (costume: ICostume) => {
  const { currency, amount } = costume.price
  if (currency === 'season') {
    return 'รางวัลซีซัน PvP'
  }
  if (currency === 'boss_token') {
    return `🎫 ${amount} เหรียญบอส`
  }
  if (amount === 0) {
    return 'ฟรี'
  }
  return `${currency === 'gem' ? '💎' : '🪙'} ${amount}`
}

// Mirrors the server's buy checks so the button explains itself. The server decides.
export const getCostumeBuyBlocker = (
  costume: ICostume,
  state: ICostumeState,
  coin: number,
  gem: number,
  now: Date
): string | null => {
  if (state.owned.includes(costume.id)) {
    return 'มีแล้ว'
  }
  if (costume.price.currency === 'season') {
    return 'ซื้อไม่ได้ เป็นรางวัลซีซัน'
  }
  if (costume.endsAt && now.getTime() >= new Date(costume.endsAt).getTime()) {
    return 'หมดเวลาจำหน่ายแล้ว'
  }
  if (costume.price.currency === 'coin' && coin < costume.price.amount) {
    return 'เหรียญไม่พอ'
  }
  if (costume.price.currency === 'gem' && gem < costume.price.amount) {
    return 'เพชรไม่พอ'
  }
  return null
}

// 'ชุดเพลิงกัลป์ 2/4': how many pieces of the set the shown pet wears out of the full set.
export const setPieceLabel = (set: ISetProgress) => `${set.name} ${set.worn}/${set.pieceCount}`

// Green once the whole set is worn, muted before that.
export const isSetComplete = (set: ISetProgress) => set.worn >= set.pieceCount

// One bonus tier in words: its stat bonus and/or special effect.
export const describeSetTier = (tier: ISetProgress['tiers'][number]) =>
  [tier.pct && describePctBonus(tier.pct), tier.effect && describeSetEffect(tier.effect)]
    .filter(Boolean)
    .join(' · ')

// Whether a bonus tier is on for this many worn pieces.
export const isSetTierActive = (set: ISetProgress, tier: ISetProgress['tiers'][number]) =>
  set.worn >= tier.pieces
