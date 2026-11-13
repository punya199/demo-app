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
  gacha: 'สุ่มฮีโร่',
  goals: 'ภารกิจ',
  cores: 'คอร์ธาตุ',
  round: 'รอบ {n}/{total}',
  boss: 'บอส!',
  won: 'ชนะแล้ว!',
  pickTitle: 'เลือกสกิล 1 อย่าง',
  netStarting: 'กำลังเริ่มด่าน…',
  netNoEnergy: 'พลังงานไม่พอ รอฟื้นฟูก่อนนะ',
  netStartError: 'เริ่มด่านไม่สำเร็จ ลองใหม่อีกครั้ง',
  netFinishing: 'กำลังตรวจผลการเล่น…',
  netPaid: 'ได้รับ {n} เหรียญ {stars}',
  netPaidClear: 'ผ่านด่านครั้งแรก! ได้รับ {n} เหรียญ และ {gems} เพชร {stars}',
  netLocked: 'ด่านนี้ยังล็อกอยู่ ผ่านด่านก่อนหน้าก่อน',
  stages: 'เลือกด่าน',
  stage: 'ด่าน {n}',
  netFinishError: 'ส่งผลการเล่นไม่สำเร็จ ไม่ได้รับเหรียญ',
  netRetry: 'ลองใหม่',
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
    gacha: 'Summon',
    goals: 'Goals',
    cores: 'Cores',
    round: 'Round {n}/{total}',
    boss: 'Boss!',
    won: 'Victory!',
    pickTitle: 'Pick 1 skill',
    netStarting: 'Starting the stage…',
    netNoEnergy: 'Not enough energy, wait for it to refill',
    netStartError: 'Could not start the stage, please retry',
    netFinishing: 'Checking your run…',
    netPaid: 'Earned {n} coins {stars}',
    netPaidClear: 'First clear! Earned {n} coins and {gems} gems {stars}',
    netLocked: 'This stage is locked. Clear the previous stage first.',
    stages: 'Stages',
    stage: 'Stage {n}',
    netFinishError: 'Could not submit the run, no coins paid',
    netRetry: 'Retry',
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
