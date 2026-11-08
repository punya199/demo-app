import { IPassiveNode } from '../core/tamagotchi-interface'

export const ARM_COLOR: Record<IPassiveNode['arm'], string> = {
  flame: '#e0663c',
  tide: '#3b8fd1',
  leaf: '#5fae4e',
  earth: '#b08a4a',
  lightning: '#d9c52e',
  spirit: '#a56fe0',
  bridge: '#8d85a0',
  ascend: '#c9a227',
}
export const ARM_LABEL = {
  flame: 'เพลิง',
  tide: 'วารี',
  leaf: 'พฤกษ์',
  earth: 'ปฐพี',
  lightning: 'อสนี',
  spirit: 'วิญญาณ',
} as const
export const KIND_LABEL = {
  small: 'โหนดเล็ก',
  notable: 'โหนดเด่น',
  key: 'คีย์สโตน',
  mastery: 'มาสเตอรี (เลือก 1 จาก 3)',
  ascend: 'เส้นทางสูงสุด',
}
export const PATH_LABEL = { vanguard: 'แวนการ์ด', striker: 'สไตรเกอร์', warden: 'วอร์เดน' } as const

// The tree spans about +-630 around the hub and the ascendancy ring about +-810.
export const FULL = 1700
export const MIN_SCALE = 0.7
export const MAX_SCALE = 5
export const DRAG_PIXELS = 6
// A small node's glyph is this many units wide; it shows once that is at least this many pixels.
export const GLYPH_UNITS = 14
export const GLYPH_MIN_PX = 11

export const hexagon = (r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const t = (i * Math.PI) / 3
    return `${(r * Math.cos(t)).toFixed(1)},${(r * Math.sin(t)).toFixed(1)}`
  }).join(' ')

export const star = (r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 ? r * 0.45 : r
    const t = -Math.PI / 2 + (i * Math.PI) / 5
    return `${(radius * Math.cos(t)).toFixed(1)},${(radius * Math.sin(t)).toFixed(1)}`
  }).join(' ')

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))
