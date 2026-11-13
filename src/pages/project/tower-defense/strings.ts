export type Lang = 'th' | 'en'

const th = {
  title: 'ป้องกันฐาน',
  back: 'กลับหน้าเกม',
  lost: 'ฐานแตก!',
  playAgain: 'เล่นใหม่',
  hint: 'แตะช่องว่างเพื่อเรียกเฟือง ({n} ทอง)',
  keys: 'คีย์ลัด: P พัก · F เร็ว · R เริ่มใหม่ · L ภาษา',
  pause: 'พัก',
  resume: 'เล่นต่อ',
  restart: 'เริ่มใหม่',
  lang: 'EN',
  menu: 'เมนู',
} as const

export const STRINGS: Record<Lang, Record<keyof typeof th, string>> = {
  th,
  en: {
    title: 'Base Defense',
    back: 'Back to games',
    lost: 'Base destroyed!',
    playAgain: 'Play again',
    hint: 'Tap an empty tile to summon a gear ({n} gold)',
    keys: 'Keys: P pause · F speed · R restart · L language',
    pause: 'Pause',
    resume: 'Resume',
    restart: 'Restart',
    lang: 'ไทย',
    menu: 'Menu',
  },
}

export function t(lang: Lang, key: keyof typeof th, params?: Record<string, string | number>) {
  const s = STRINGS[lang][key]
  return params ? s.replace(/\{(\w+)\}/g, (m, k) => String(params[k] ?? m)) : s
}
