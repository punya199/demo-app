import {
  BattleSide,
  IBattleData,
  IBattleEvent,
  IEvolutionInfo,
  IEvolutionRuleInfo,
  IMonsterData,
} from '../tamagotchi-interface'

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
  'Only two monsters of the same line can be merged for now': 'ตอนนี้รวมร่างได้เฉพาะมอนสายเดียวกัน',
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
  'Clear this stage once before skipping it': 'ต้องชนะด่านนี้ด้วยตัวเองก่อนจึงจะข้ามได้',
  'Skip 1 to 10 runs at a time': 'ข้ามได้ครั้งละ 1–10 รอบ',
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
