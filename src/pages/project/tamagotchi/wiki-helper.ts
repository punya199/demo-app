import { specialLabel } from './tamagotchi-helper'
import { IWikiData, SpecialKey } from './tamagotchi-interface'

// Pure helpers for the guide's craft and status sections. Every number comes from the server.

export const percent = (value: number) => `${Math.round(value * 100)}%`
export const times = (value: number) => `×${value}`

// "หิวช้าลง 10% · อึน้อยลง 15%" for a craft care set's 2-piece perks ('' when it has none).
export const describeCareBonus = (care: Partial<Record<SpecialKey, number>> | undefined) =>
  Object.entries(care ?? {})
    .map(([key, value]) => `${specialLabel[key as SpecialKey]} ${value}%`)
    .join(' · ')

// Craft sets are told apart from boss sets by the ids the server lists under `craft.sets`.
export const isCraftSet = (wiki: IWikiData, setId: string) =>
  wiki.craft.sets.some((set) => set.id === setId)

export type WikiStatusEntry = IWikiData['arena']['statuses'][string] & { id: string }

// Arena statuses split into debuffs and buffs, in the server's order.
export const splitStatuses = (statuses: IWikiData['arena']['statuses']) => {
  const entries: WikiStatusEntry[] = Object.entries(statuses).map(([id, info]) => ({
    id,
    ...info,
  }))
  return {
    debuffs: entries.filter((entry) => entry.kind === 'debuff'),
    buffs: entries.filter((entry) => entry.kind === 'buff'),
  }
}

// Hard crowd control shortens when it lands again soon: "100% → 50% → ไม่ติด".
export const describeCcSteps = (steps: number[]) =>
  steps.map((step) => (step === 0 ? 'ไม่ติด' : `${step}%`)).join(' → ')

// What a Catalyst or a skip costs, as shown on the craft screen: the skip price at the start
// of a job (the screen shows the live prorated price).
export const fullSkipCoin = (coin: number, multiplier: number) => Math.ceil(coin * multiplier)

// The 12 craft sets' playstyles (ids as the server's `style`).
export const craftStyleLabel: Record<string, string> = {
  tank: 'แทงก์',
  regen: 'ฟื้นฟู',
  burst: 'เบิร์สต์',
  crit: 'คริติคอล',
  speed: 'ความเร็ว',
  evasion: 'หลบหลีก',
  dot: 'ดาเมจต่อเนื่อง',
  control: 'คุมเกม',
  reflect: 'สะท้อน',
  support: 'ซัพพอร์ต',
  care: 'ดูแล',
  explore: 'สำรวจ',
}

const FORGE_CORE_ID = 'craft_forge_core'
const RUNE_SHARD_ID = 'craft_rune_shard'

// The craft sets whose recipes use a material (the Catalyst is optional for all of them).
export const craftSetsUsing = (wiki: IWikiData, materialId: string) =>
  wiki.craft.sets.filter(
    (set) =>
      materialId === `craft_essence_${set.essence}` ||
      materialId === (set.rare === 'forge' ? FORGE_CORE_ID : RUNE_SHARD_ID) ||
      materialId === `craft_unique_${set.unique}`
  )

// What each kind of skill does in a fight (the labels are arena-helper's SKILL_KIND_LABEL).
export const skillKindMeaning: Record<string, string> = {
  melee: 'ตีในระยะประชิด',
  multi: 'ตีประชิดหลายครั้งรวด',
  shot: 'ยิงกระสุนไปหาเป้าหมาย',
  spread: 'ยิงกระจายออกหลายทิศ โดนได้หลายตัว',
  charge: 'พุ่งเข้าชนเป้าหมาย',
  burst: 'ระเบิดพลังรอบตัว โดนทุกตัวที่อยู่ใกล้',
  zone: 'ปักวงบนพื้น ตัวที่อยู่ในวงโดนผลของสกิล (ถอยออกจากวงได้)',
  beam: 'ลำแสงเป็นแนวตรง ทะลุโดนหลายตัว',
  self: 'เสริมตัวเอง เช่น ฟื้น HP โล่ หรือบัฟ',
  passive: 'ผลถาวรตลอดไฟต์ ไม่ต้องร่าย',
  dodge: 'ท่าหลบ มีคูลดาวน์ บางท่ามีผลพิเศษเมื่อหลบสำเร็จ',
}
