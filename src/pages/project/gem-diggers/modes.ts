// Difficulty modes. Easy is the game as designed; medium and hard derive a
// tougher version of every level from the same picture.

import { BIG_PICTURES, IBigPicture } from './big-pictures'
import type { LevelDef } from './levels'

export type Mode = 'easy' | 'medium' | 'hard'
export const MODES: Mode[] = ['easy', 'medium', 'hard']
export const MODE_NAMES: Record<Mode, string> = { easy: 'ง่าย', medium: 'กลาง', hard: 'ยาก' }

export const MODE_INFO: Record<Mode, string> = {
  easy: 'เกมแบบปกติ มีกรอบกระพริบบอกรถที่แตะแล้วขุดได้ทันที',
  medium:
    'ไม่มีกรอบกระพริบบอกรถที่ควรแตะ · รถพ่วงต้องขุดครบ <b>ทั้งกลุ่ม</b> ถึงจะออกจากช่องรอ · บางด่านมีรถพ่วง 3 คัน · รถใหญ่ขึ้น',
  hard: 'ทุกอย่างของโหมดกลาง + <b>ภาพใหญ่ราว 48×42 วาดละเอียด</b> · <b>รถ 5 แถว</b> ให้เลือกน้อยลง · <b>รถใหญ่สูงสุด 60 บล็อก</b> ที่เก็บรวดเดียวไม่ได้ ต้องขุดสีอื่นเปิดทางไปด้วย · แช่แข็งมากขึ้น',
}

/** Every pixel becomes a k x k block. */
function upscale(rows: string[], k: number): string[] {
  return rows.flatMap((r) => {
    const wide = [...r].map((c) => c.repeat(k)).join('')
    return Array(k).fill(wide)
  })
}

/**
 * A level's hand-drawn big picture (hard mode). Locked rooms open after the
 * same share of the key color as in the small picture, but never more than
 * most of the key color outside the rooms.
 */
function bigPicture(def: LevelDef, big: IBigPicture) {
  const { art, lockMap } = big
  const w = art[0].length
  const scale = (w * art.length) / (def.art[0].length * def.art.length)
  const locks =
    def.locks &&
    Object.fromEntries(
      Object.entries(def.locks).map(([room, l]) => {
        let free = 0
        art.forEach((row, y) => {
          for (let x = 0; x < w; x++)
            if (row[x] === l.key && (lockMap?.[y][x] ?? '.') === '.') free++
        })
        const need = Math.min(Math.round(l.need * scale), Math.floor(free * 0.6))
        return [room, { ...l, need: Math.max(1, need) }]
      })
    )
  return { art, lockMap, locks, palette: { ...def.palette, ...big.palette } }
}

/**
 * `enlarge`: in hard mode, use the level's hand-drawn big picture, or else blow
 * the small one up to roughly 36 cells across (3x for small ones, 2x for the
 * bigger ones). Endless pictures are drawn big instead.
 */
export function applyMode(def: LevelDef, mode: Mode, enlarge = true): LevelDef {
  if (mode === 'easy') return def
  const hard = mode === 'hard'
  const drawn = hard && enlarge ? BIG_PICTURES[def.name] : undefined
  const big = drawn ? bigPicture(def, drawn) : null
  const scale = hard && enlarge && !big ? (def.art[0].length <= 14 ? 3 : 2) : 1
  const art = big?.art ?? (scale > 1 ? upscale(def.art, scale) : def.art)
  const area = art.length * art[0].length
  const locks =
    big?.locks ??
    (def.locks &&
      Object.fromEntries(
        Object.entries(def.locks).map(([k, l]) => [k, { ...l, need: l.need * scale * scale }])
      ))
  // Pictures under ~400 cells only fit a handful of huge carts, which leaves
  // too few choices to be hard: they get more, smaller carts instead. Bigger
  // pictures get carts sized to keep the count around 35-45.
  const bigCarts = hard && area >= 400
  return {
    ...def,
    art,
    lockMap: big
      ? big.lockMap
      : def.lockMap && scale > 1
        ? upscale(def.lockMap, scale)
        : def.lockMap,
    locks,
    ...(big && { palette: big.palette }),
    hideReady: true,
    together: true,
    bigCarts,
    cart: bigCarts
      ? big
        ? // Hand-drawn big pictures: about 50 carts of 25-60 gems.
          [Math.max(10, Math.round(area / 80)), Math.min(60, Math.max(30, Math.round(area / 32)))]
        : scale === 2
          ? // Pictures blown up only 2x keep their many colours close together;
            // with ordinary carts nearly every winnable tray came out easy, so
            // they get even bigger carts (up to 80) to put real pressure on the slots.
            [Math.round(area / 50), Math.min(80, Math.round(area / 16))]
          : [Math.max(10, Math.round(area / 80)), Math.min(60, Math.max(30, Math.round(area / 25)))]
      : hard
        ? [def.cart[0] + 3, def.cart[1] + 10]
        : [def.cart[0] + 2, def.cart[1] + 6],
    // Five columns leave room for triple chains and extra frozen carts. The
    // hand-drawn big pictures keep chains few: fewer columns already make them hard.
    columns: Math.max(def.columns, hard ? 5 : 3),
    links: big ? 2 : Math.max(def.links, hard ? 2 : 1),
    triples: big ? 1 : hard ? 2 : def.links >= 3 ? 1 : 0,
    frozen: hard ? (def.frozen ?? 0) + 2 : def.frozen,
    mystery: Math.min(0.6, def.mystery + (hard ? 0.15 : 0.05)),
    shuffle: def.shuffle * (hard ? 1.5 : 1.2),
    greedy: Math.max(hard ? 0.05 : 0.1, def.greedy - (hard ? 0.25 : 0.12)),
  }
}
