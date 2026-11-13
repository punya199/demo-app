import type { SkillId } from '../../../../td-sim/src'

export type Lang = 'th' | 'en'

const th = {
  title: 'ป้องกันฐาน',
  back: 'กลับหน้าเกม',
  lost: 'ฐานแตก!',
  playAgain: 'เล่นใหม่',
  hint: 'แตะช่องว่างเพื่อเรียกเฟือง ({n} ทอง) · ต้องต่อกับแถบเหลือง · แตะเฟืองเหมือนกันสองตัวเพื่อรวม',
  keys: 'คีย์ลัด: P พัก · F เร็ว · R เริ่มใหม่ · L ภาษา',
  pause: 'พัก',
  resume: 'เล่นต่อ',
  restart: 'เริ่มใหม่',
  lang: 'EN',
  menu: 'เมนู',
  round: 'รอบ {n}/{total}',
  boss: 'บอส!',
  won: 'ชนะแล้ว!',
  pickTitle: 'เลือกสกิล 1 อย่าง',
  skill_power: 'พลังโจมตี +25%',
  skill_haste: 'ชาร์จเร็วขึ้น +25%',
  skill_crit: 'คริติคอล +10%',
  skill_bounty: 'ค่าหัวศัตรู +2 ทอง',
  skill_bank: 'รับทอง +25 ทันที',
  skill_repair: 'ซ่อมฐาน +3',
} as const

export const STRINGS: Record<Lang, Record<keyof typeof th, string>> = {
  th,
  en: {
    title: 'Base Defense',
    back: 'Back to games',
    lost: 'Base destroyed!',
    playAgain: 'Play again',
    hint: 'Tap an empty tile to summon a gear ({n} gold) · link to the yellow source · tap two identical gears to merge',
    keys: 'Keys: P pause · F speed · R restart · L language',
    pause: 'Pause',
    resume: 'Resume',
    restart: 'Restart',
    lang: 'ไทย',
    menu: 'Menu',
    round: 'Round {n}/{total}',
    boss: 'Boss!',
    won: 'Victory!',
    pickTitle: 'Pick 1 skill',
    skill_power: 'Attack power +25%',
    skill_haste: 'Charge speed +25%',
    skill_crit: 'Crit chance +10%',
    skill_bounty: 'Kill bounty +2 gold',
    skill_bank: 'Gain 25 gold now',
    skill_repair: 'Repair HQ +3',
  },
}

export function t(lang: Lang, key: keyof typeof th, params?: Record<string, string | number>) {
  const s = STRINGS[lang][key]
  return params ? s.replace(/\{(\w+)\}/g, (m, k) => String(params[k] ?? m)) : s
}

export const skillLabel = (lang: Lang, id: SkillId) => t(lang, `skill_${id}`)
