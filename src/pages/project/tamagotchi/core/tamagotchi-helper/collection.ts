import {
  EnumMonsterLine,
  EnumMonsterStage,
  ICostume,
  ICostumeState,
  ILoadout,
  EnumCostumeSlot,
  IEquipmentItem,
  ISetProgress,
  IMergeForm,
  IMonsterData,
  IGetMyMonsterResponse,
  IPotentialStat,
  IDummySummary,
} from '../tamagotchi-interface'
import { stageLabel } from './basics'
import { describePctBonus, describeSetEffect } from './pvp'

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

// Mirrors the server's return-home check (pet-core.ts), so the button explains itself.
// `stages` comes from the wiki (the server's list); null = the button is fine to press.
export const getReturnHomeBlocker = (
  monster: IMonsterData,
  stages: EnumMonsterStage[] | undefined
): string | null => {
  if (monster.diedAt) {
    return 'จากไปแล้ว'
  }
  if (!stages) {
    return 'กำลังโหลดข้อมูล'
  }
  if (!stages.includes(monster.stage)) {
    return `ต้องเป็น${stageLabel[stages[0]]}ขึ้นไป`
  }
  return monster.expeditionAreaId ? 'ออกสำรวจอยู่ ต้องรับกลับมาก่อน' : null
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
  spiritualLines: EnumMonsterLine[] = [],
  // Off while the cross-line forms are redesigned: only two of the same line merge.
  crossLineEnabled = true
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
  if (!crossLineEnabled && first.line !== second.line) {
    return 'ตอนนี้รวมร่างได้เฉพาะมอนสายเดียวกัน'
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

// The 12 craft-only materials (ids and names as the server's craft-materials.ts; the wiki's
// `craft.materials` is preferred when loaded, this is the fallback).
export const craftMaterialLabel: Record<string, string> = {
  craft_essence_flame: '🔥 เอสเซนซ์ไฟ',
  craft_essence_tide: '💧 เอสเซนซ์น้ำ',
  craft_essence_leaf: '🍃 เอสเซนซ์ใบไม้',
  craft_essence_earth: '🪨 เอสเซนซ์ดิน',
  craft_essence_lightning: '⚡ เอสเซนซ์สายฟ้า',
  craft_essence_holy: '✨ เอสเซนซ์แสง',
  craft_forge_core: '⚒️ แกนหลอมศึก',
  craft_rune_shard: '🔷 เศษรูนพิทักษ์',
  craft_unique_verdant_heart: '💚 หัวใจพนา',
  craft_unique_reaper_edge: '🗡️ คมเคียวเพชฌฆาต',
  craft_unique_storm_sigil: '🌀 ตราพายุ',
  craft_catalyst: '🧿 ตัวเร่งคราฟต์',
}

// Where each craft material drops (display text only).
export const craftMaterialSource: Record<string, string> = {
  craft_essence_flame: 'ผจญภัย / สำรวจ',
  craft_essence_tide: 'ผจญภัย / สำรวจ',
  craft_essence_leaf: 'ผจญภัย / สำรวจ',
  craft_essence_earth: 'ผจญภัย / สำรวจ',
  craft_essence_lightning: 'ผจญภัย / สำรวจ',
  craft_essence_holy: 'ผจญภัย / สำรวจ',
  craft_forge_core: 'บอส (Raid)',
  craft_rune_shard: 'บอส (Raid)',
  craft_unique_verdant_heart: 'บอสโลก (รางวัลรายสัปดาห์)',
  craft_unique_reaper_edge: 'บอสโลก (รางวัลรายสัปดาห์)',
  craft_unique_storm_sigil: 'บอสโลก (รางวัลรายสัปดาห์)',
  craft_catalyst: 'บอสโลก (รางวัลรายสัปดาห์) / กล่องปริศนา M',
}

// "1:02:03" / "12:03" until `finishAt` (empty-safe: never negative).
export const formatCountdown = (finishAt: string, now: Date) => {
  const total = Math.max(0, Math.ceil((new Date(finishAt).getTime() - now.getTime()) / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const seconds = String(total % 60).padStart(2, '0')
  return hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`
}

// Materials a recipe is short of: [{ itemId, missing }].
export const missingMaterials = (materials: { itemId: string; qty: number; owned: number }[]) =>
  materials
    .filter((material) => material.owned < material.qty)
    .map((material) => ({ itemId: material.itemId, missing: material.qty - material.owned }))

// Share of damage a DEF value cuts (the arena formula, constants from the wiki), in whole percent.
export const defCutPct = (def: number, k: number, maxReduction: number) =>
  Math.round(Math.min(def / (def + k), maxReduction) * 100)

// "DEF 60 (−60% damage)" for the boss and dummy screens.
export const describeDef = (def: number, cutPct: number) => `DEF ${def} (ลดดาเมจ ${cutPct}%)`

// Rows of the training dummy's result table.
export const summaryRows = (summary: IDummySummary): [string, string][] => [
  ['ดาเมจรวม', String(summary.totalDamage)],
  ['DPS', String(summary.dps)],
  ['ดาเมจเฉลี่ยต่อครั้ง', String(summary.avgHit)],
  ['จำนวนครั้งที่ตี (คริ)', `${summary.hits} (${summary.crits})`],
  [
    'ครั้งที่แรงที่สุด',
    summary.bestHit
      ? `${summary.bestHit.damage}${summary.bestHit.skill ? ` (${summary.bestHit.skill})` : ''}`
      : '-',
  ],
]
