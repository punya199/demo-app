// Pure text helpers for arena skills (cards, tooltips, replay log). The numbers come from the
// server's catalog (already tuned); nothing here changes a fight.
import {
  ArenaElement,
  ArenaSkillKind,
  IArenaDodge,
  IArenaEvent,
  IArenaFighterSummary,
  IArenaPassive,
  IArenaSkill,
  IArenaStatusInfo,
  StatusId,
} from './arena-interface'

export const ARENA_TICK = 20
export const ARENA_SCALE = 100
export const ARENA_W = 640
export const ARENA_H = 440
// The arena's minimum dodge cooldown (seconds), whatever a dodge skill says.
export const DODGE_MIN_CD = 4

export type StatusMap = Record<StatusId, IArenaStatusInfo>

export const ARENA_ELEMENT_COLOR: Record<ArenaElement, string> = {
  flame: '#ff8a4c',
  tide: '#4cb8ff',
  leaf: '#6fe08a',
  earth: '#c9a36a',
  lightning: '#ffe14a',
  holy: '#fff2b0',
  dark: '#b07cff',
  shadow: '#8fa3c7',
  neutral: '#c8c8d8',
}

export const ARENA_ELEMENT_LABEL: Record<ArenaElement, string> = {
  flame: '🔥 เพลิง',
  tide: '💧 วารี',
  leaf: '🌿 พฤกษ์',
  earth: '🪨 ธรณี',
  lightning: '⚡ สายฟ้า',
  holy: '✨ ศักดิ์สิทธิ์',
  dark: '🌑 มืด',
  shadow: '🌫️ เงา',
  neutral: '⚪ กลาง',
}

export const SKILL_KIND_LABEL: Record<ArenaSkillKind, string> = {
  melee: 'ประชิด',
  multi: 'ตีรัว',
  shot: 'ยิง',
  spread: 'ยิงกระจาย',
  charge: 'พุ่งชน',
  burst: 'ระเบิดรอบตัว',
  zone: 'วงพื้นที่',
  beam: 'ลำแสงทะลุ',
  self: 'เสริมตัวเอง',
  passive: 'พาสซีฟ',
  dodge: 'สกิลหลบ',
}

const AOE: ArenaSkillKind[] = ['burst', 'zone', 'spread', 'beam']

export const formatNumber = (x: number) => {
  const r = Math.round(x * 10) / 10
  return Number.isInteger(r) ? String(r) : r.toFixed(1)
}

const fxText = (s: IArenaSkill, statuses: StatusMap) => {
  const parts: string[] = []
  for (const e of s.fx ?? []) {
    const info = statuses[e.st]
    const chance = e.ch < 100 ? ` โอกาส ${e.ch}%` : ''
    const val = e.st === 'regen' && e.val ? ` ${formatNumber(e.val)}%/วิ` : ''
    const mag = e.mag && e.mag > 100 ? ` (แรงขึ้น ×${formatNumber(e.mag / 100)})` : ''
    parts.push(
      e.to === 'self'
        ? `ตัวเองได้ ${info.icon} ${info.label}${val}${mag} ${formatNumber(e.dur)} วิ`
        : `ติด ${info.icon} ${info.label} ${formatNumber(e.dur)} วิ${chance}`
    )
  }
  if (s.heal) parts.push(`ฟื้น HP ${formatNumber(s.heal)}%`)
  if (s.shield)
    parts.push(`โล่ ${formatNumber(s.shield)}% ของ HP ${formatNumber(s.shieldSec ?? 4)} วิ`)
  if (s.cleanse) parts.push('ล้างสถานะผิดปกติ')
  if (s.cleanseOnly) parts.push(`ล้าง${s.cleanseOnly.map((x) => statuses[x].label).join(', ')}`)
  if (s.execute) parts.push(`เป้า HP ต่ำกว่า 35% แรงขึ้น ${s.execute}%`)
  if (s.lifesteal) parts.push(`ดูดเลือด ${s.lifesteal}% ของดาเมจ`)
  return parts
}

const passiveText = (p: IArenaPassive, statuses: StatusMap) => {
  const parts: string[] = []
  if (p.rebirthPct) parts.push(`ครั้งแรกที่ HP จะหมด ฟื้นคืนด้วย HP ${formatNumber(p.rebirthPct)}%`)
  if (p.meleeRetort) {
    const r = p.meleeRetort
    parts.push(
      `โดนตีระยะประชิด: ${r.power > 0 ? `สวนกลับ ${formatNumber(r.power)}% ของ ATK และ` : ''}โอกาส ${formatNumber(r.ch)}% ให้ผู้ตีติด ${statuses[r.st].icon} ${statuses[r.st].label} ${formatNumber(r.dur)} วิ`
    )
  }
  if (p.regenPct) parts.push(`ฟื้น HP ${formatNumber(p.regenPct)}% ทุกวินาที`)
  if (p.damageCut) parts.push(`รับดาเมจน้อยลง ${formatNumber(p.damageCut)}%`)
  if (p.tenacity) parts.push(`ติดสตัน/ตรึง/ใบ้สั้นลง ${formatNumber(p.tenacity)}%`)
  if (p.moveCut) parts.push(`แต่เดินช้าลง ${formatNumber(p.moveCut)}%`)
  if (p.lastStand) {
    parts.push(
      `ครั้งแรกที่ HP ต่ำกว่า ${p.lastStand.belowPct}%: โล่ ${formatNumber(p.lastStand.shield)}% ล้างสถานะ และคุ้มกัน CC ${p.lastStand.immuneSec} วิ`
    )
  }
  if (p.basicLifesteal) parts.push(`ตีธรรมดาดูดเลือด ${formatNumber(p.basicLifesteal)}%`)
  if (p.enrage) parts.push(`HP ต่ำกว่า ${p.enrage.belowPct}% ATK +${formatNumber(p.enrage.atk)}%`)
  if (p.onBasic) {
    parts.push(
      `ตีธรรมดามีโอกาส ${formatNumber(p.onBasic.ch)}% ติด ${statuses[p.onBasic.st].icon} ${statuses[p.onBasic.st].label} ${p.onBasic.dur} วิ`
    )
  }
  if (p.eva) parts.push(`ค่าหลบ +${formatNumber(p.eva)}`)
  if (p.dodgeCdCut)
    parts.push(`คูลดาวน์หลบสั้นลง ${formatNumber(p.dodgeCdCut)} วิ (ไม่ต่ำกว่า ${DODGE_MIN_CD} วิ)`)
  if (p.afterDodge)
    parts.push(`หลังหลบสำเร็จ ครั้งถัดไปคริติคอลและแรงขึ้น ${formatNumber(p.afterDodge.bonus)}%`)
  return parts
}

const dodgeText = (d: IArenaDodge) => {
  const parts = [`โอกาสหลบ ${d.chance >= 0 ? '+' : ''}${formatNumber(d.chance)}%`]
  if (d.parry) parts.push(`ไม่ถอย แต่ปัดดาเมจ ${d.parry}% (กัน AOE ได้ด้วย)`)
  const o = d.onDodge ?? {}
  if (o.haste) parts.push(`หลบแล้วได้ 💨 เร่งความเร็ว ${o.haste} วิ`)
  if (o.cleanse) parts.push('หลบแล้วล้างสถานะผิดปกติ')
  if (o.blindAttacker) parts.push(`หลบแล้วผู้โจมตีติด 🌫️ ตาบอด ${o.blindAttacker} วิ`)
  if (o.counter) parts.push(`หลบแล้วสวนทันที ${o.counter}% ของ ATK`)
  if (o.vanish) parts.push(`หลบแล้วหายตัว ${o.vanish} วิ และครั้งถัดไปคริติคอล`)
  if (parts.length === 1) parts.push('หลบเฉยๆ ไม่มีผลเสริม')
  return parts
}

export const skillEffectLines = (s: IArenaSkill, statuses: StatusMap) => {
  if (s.slot === 'passive' && s.passive) return passiveText(s.passive, statuses)
  if (s.slot === 'dodge' && s.dodge) return dodgeText(s.dodge)
  return fxText(s, statuses)
}

export const skillNumbers = (s: IArenaSkill) => {
  if (s.slot === 'passive') return 'ไม่มีคูลดาวน์'
  if (s.slot === 'dodge')
    return `คูลดาวน์ ${formatNumber(Math.max(DODGE_MIN_CD, s.dodge?.cd ?? 0))} วิ`
  const bits = [
    `คูลดาวน์ ${formatNumber(s.cd)} วิ`,
    `ร่าย ${formatNumber((s.wind ?? 8) / ARENA_TICK)} วิ`,
  ]
  if (s.power) bits.unshift(`พลัง ${(s.hits ?? 1) > 1 ? `${s.hits} × ` : ''}${s.power}%`)
  if (s.radius) bits.push(`รัศมี ${s.radius}`)
  if (s.delay) bits.push(`ลงหลัง ${formatNumber(s.delay / ARENA_TICK)} วิ`)
  return bits.join(' · ')
}

export type SkillTag = [label: string, tone: 'up' | 'down']

// Strengths and costs at a glance, from the skill's numbers.
export const skillTags = (s: IArenaSkill): SkillTag[] => {
  if (s.slot === 'passive') {
    return [
      ['ทำงานตลอด', 'up'],
      ['เสียช่องแอคทีฟ', 'down'],
    ]
  }
  const tags: SkillTag[] = []
  if (s.slot === 'dodge' && s.dodge) {
    const cd = Math.max(DODGE_MIN_CD, s.dodge.cd)
    if (cd <= 5) tags.push(['คูลดาวน์สั้น', 'up'])
    if (cd >= 10) tags.push(['คูลดาวน์นาน', 'down'])
    if (s.dodge.chance > 0) tags.push(['หลบง่าย', 'up'])
    if (s.dodge.chance < 0) tags.push(['หลบยาก', 'down'])
    return tags
  }
  const total = (s.power ?? 0) * (s.hits ?? 1)
  if (total >= 200) tags.push(['แรง', 'up'])
  else if (total > 0 && total <= 110) tags.push(['ดาเมจเบา', 'down'])
  if (AOE.includes(s.kind)) tags.push(['AOE', 'up'])
  if (s.cd <= 4.5) tags.push(['คูลดาวน์สั้น', 'up'])
  if (s.cd >= 10) tags.push(['คูลดาวน์นาน', 'down'])
  if ((s.wind ?? 8) >= 12) tags.push(['ร่ายนาน หลบง่าย', 'down'])
  if (s.kind === 'zone') tags.push(['ลงช้า เดินหนีได้', 'down'])
  if (['shot', 'spread', 'beam', 'zone'].includes(s.kind)) tags.push(['ระยะไกล', 'up'])
  if (s.kind === 'melee' || s.kind === 'multi') tags.push(['ต้องประชิด', 'down'])
  const fx = s.fx ?? []
  if (fx.some((e) => e.to !== 'self' && ['stun', 'root', 'silence'].includes(e.st))) {
    tags.push(['ควบคุม', 'up'])
  } else if (fx.some((e) => e.to !== 'self')) tags.push(['ติดสถานะ', 'up'])
  if (fx.some((e) => e.to === 'self')) tags.push(['บัพ', 'up'])
  if (s.heal || s.shield) tags.push(['เอาตัวรอด', 'up'])
  if (s.execute) tags.push(['ปิดเกม', 'up'])
  if (s.lifesteal) tags.push(['ดูดเลือด', 'up'])
  return tags
}

export const skillSummary = (s: IArenaSkill, statuses: StatusMap) => {
  const lines = skillEffectLines(s, statuses)
  return `${SKILL_KIND_LABEL[s.kind]} · ${skillNumbers(s)}${lines.length ? ` · ${lines.join(' · ')}` : ''}`
}

// One replay log line, or null for events that only draw something.
export const describeArenaEvent = (
  e: IArenaEvent,
  fighters: IArenaFighterSummary[],
  statuses: StatusMap
): [tone: '' | 'crit' | 'dodge' | 'bad' | 'good' | 'ko', text: string] | null => {
  const n = (i: number | undefined) => (i === undefined ? '' : (fighters[i]?.name ?? ''))
  const st = e.st ? statuses[e.st] : null
  switch (e.kind) {
    case 'start':
      return ['', 'เริ่มการต่อสู้!']
    case 'skill':
      return ['', `${n(e.who)} ใช้ ${e.icon ?? ''} ${e.skill ?? ''}`]
    case 'hit': {
      const notes = [
        e.elem === 110 && 'ได้เปรียบธาตุ',
        e.elem === 90 && 'เสียเปรียบธาตุ',
        e.crit && 'คริติคอล!',
        e.parried && 'ถูกปัด',
        (e.absorbed ?? 0) > 0 && `โล่กัน ${e.absorbed}`,
        (e.healed ?? 0) > 0 && `ดูดเลือด +${e.healed}`,
      ].filter(Boolean)
      return [
        e.crit ? 'crit' : '',
        `${e.skill} ของ${n(e.who)} โดน${n(e.target)} ${e.dmg}${notes.length ? ` (${notes.join(' · ')})` : ''}`,
      ]
    }
    case 'dot':
      return st ? ['bad', `${n(e.who)} เสีย ${e.dmg} จาก${st.label}`] : null
    case 'rage':
      return ['bad', `${n(e.who)} คลั่ง! โจมตีแรงขึ้น`]
    case 'thorns':
      return ['bad', `${n(e.who)} โดนสะท้อน ${e.dmg} จาก${n(e.by)}`]
    case 'status':
      return st
        ? [
            st.kind === 'buff' ? 'good' : 'bad',
            `${n(e.who)} ${st.kind === 'buff' ? 'ได้' : 'ติด'} ${st.icon} ${st.label} ${((e.dur ?? 0) / ARENA_TICK).toFixed(1)} วิ`,
          ]
        : null
    case 'resist':
      return st ? ['good', `${n(e.who)} ต้านทาน${st.label}`] : null
    case 'cleanse':
      return ['good', `${n(e.who)} ล้างสถานะผิดปกติ`]
    case 'heal':
      return e.amount ? ['good', `${n(e.who)} ฟื้น HP +${e.amount}`] : null
    case 'shield':
      return ['good', `${n(e.who)} ได้โล่ ${e.amount}`]
    case 'dodge':
      return ['dodge', `${n(e.who)} หลบการโจมตีของ${n(e.by)}!`]
    case 'miss':
      return ['', `${n(e.who)} ตีพลาด`]
    case 'seize':
      return ['bad', `${n(e.who)} ชะงักเพราะไฟฟ้าสถิต`]
    case 'rebirth':
      return ['good', `${n(e.who)} ฟื้นคืนจากเถ้าถ่าน! HP ${e.amount}`]
    case 'laststand':
      return ['good', `${n(e.who)} ปีกคุ้มครองทำงาน!`]
    case 'ko':
      return ['ko', `${n(e.who)} หมดแรง`]
    case 'end':
      return [
        'ko',
        e.reason === 'ko'
          ? `${e.who === 0 ? 'เรา' : 'ศัตรู'}ชนะ!`
          : `หมดเวลา · ${e.who === 0 ? 'เรา' : 'ศัตรู'}ชนะ (HP เหลือมากกว่า)`,
      ]
    default:
      return null
  }
}

// Status ids in the bit order the server packs them (its status table order).
export const statusesFromBits = (bits: number, order: StatusId[]) =>
  order.filter((_, i) => bits & (1 << i))

export interface IArenaCooldown {
  id: string
  name: string
  icon: string
  // Seconds until it can be used again; 0 = ready.
  left: number
  // Share of the full cooldown still to wait, 0 to 1.
  fraction: number
}

// Index of the dodge cooldown in a frame row; the active skills' cooldowns follow it.
const FRAME_DODGE_CD = 10

// A fighter's active skills, then its dodge, as they stand in one replay frame row.
export const fighterCooldowns = (
  row: number[],
  fighter: Pick<IArenaFighterSummary, 'skills' | 'dodge'>,
  skills: Record<string, IArenaSkill>
): IArenaCooldown[] => {
  const toCooldown = (id: string, ticks: number, fullSeconds: number): IArenaCooldown => {
    const left = Math.max(0, ticks) / ARENA_TICK
    return {
      id,
      name: skills[id]?.name ?? id,
      icon: skills[id]?.icon ?? '✨',
      left,
      fraction: fullSeconds > 0 ? Math.min(1, left / fullSeconds) : 0,
    }
  }
  const cooldowns = fighter.skills.map((id, i) =>
    toCooldown(id, row[FRAME_DODGE_CD + 1 + i] ?? 0, skills[id]?.cd ?? 0)
  )
  if (fighter.dodge) {
    const full = Math.max(DODGE_MIN_CD, skills[fighter.dodge]?.dodge?.cd ?? 0)
    cooldowns.push(toCooldown(fighter.dodge, row[FRAME_DODGE_CD] ?? 0, full))
  }
  return cooldowns
}

// Mirrors the server's equip rule (canEquipArenaSkill) so the pickers only offer legal skills:
// the pet's own element(s) or neutral, never its innate, at most one passive in the loadout.
export const canEquipSkill = (
  pet: { elements: string[]; innate: string | null },
  skill: IArenaSkill,
  others: (IArenaSkill | undefined)[]
) => {
  if (skill.slot === 'dodge') return true
  if (skill.el !== 'neutral' && !pet.elements.includes(skill.el)) return false
  if (skill.id === pet.innate) return false
  if (skill.slot === 'passive') {
    return !others.some((other) => other?.slot === 'passive')
  }
  return true
}
