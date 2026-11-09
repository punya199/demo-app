import { HYBRID_BMP, HYBRID_DESIGN_W } from '../bitmaps/hybrid-bitmaps'
import { BIPED, FLY, QUAD, SWIM } from '../engine/rigs'
import type { IRig, ISpriteDef } from '../sprite-types'
import { ADV_SPRITE, type AdvPart, type IAdvExtra } from './adventure'

// The 13 cross-line Fused forms, ported from the prototype (docs/tamagotchi/prototypes/monster-arena/js/
// sprites/hybrid.js): bitmaps from hybrid-bitmaps.ts cut into parts like the adventure enemies (ADV_SPRITE,
// see adventure.ts for the part kinds). QUAD legs: bl / fl are the far hind / fore leg, bf / ff the near
// ones; bl moves with ff and fl with bf, so the gait alternates diagonally. `els` is the pair of lines;
// the first one is the sprite's line (cards, particles). The plan for each form is in
// docs/tamagotchi/fused-hybrid-prompts.md.

export type HybridEntry = [
  id: string,
  name: string,
  els: [string, string],
  animal: string,
  rig: IRig,
  parts: AdvPart[],
  extra: IAdvExtra,
]

export const HYBRIDS: HybridEntry[] = [
  [
    'hy_steam',
    'ยักษ์ไอน้ำ',
    ['fire', 'water'],
    'มังกรซาลาแมนเดอร์ทะเล หลังลาวาเย็นตัว',
    QUAD,
    [
      ['tail', (x, y) => x <= 11 && y <= 46, 'swing', 'tail', 12, null, 0, -1.5, 12],
      ['legBL', (x, y) => x >= 28 && x <= 48 && y >= 43, 'leg', 'bl', 43, 54],
      ['body'],
      ['legBF', (x, y) => x >= 10 && x <= 27 && y >= 40, 'leg', 'bf', 40, 54],
      ['legFF', (x, y) => x >= 62 && y >= 36, 'leg', 'ff', 36, 54],
      ['head', (x, y) => x >= 60 && y <= 31, 'rigid', 'head', 0.7, 2],
    ],
    {
      mouth: [80, 18],
      emit: [
        { x: 36, y: 12, type: 'mist', rate: 2.5 },
        { x: 54, y: 7, type: 'mist', rate: 2.5 },
      ],
    },
  ],
  [
    'hy_swamp',
    'บึงโบราณ',
    ['leaf', 'water'],
    'จระเข้โบราณ หลังเป็นบึง',
    QUAD,
    [
      ['legBL', (x, y) => x >= 30 && x <= 53 && y >= 54, 'leg', 'bl', 54, 65],
      ['body'],
      ['legBF', (x, y) => x <= 22 && y >= 52, 'leg', 'bf', 52, 65],
      ['legFF', (x, y) => x >= 56 && x <= 75 && y >= 55, 'leg', 'ff', 55, 65],
      ['tree', (x, y) => x >= 16 && x <= 56 && y <= 18, 'swing', 'tail', null, 19, 0.8, 0, 18],
      ['reeds', (x, y) => x <= 20 && y <= 30, 'swing', 'tail', null, 31, -0.6, 0, 18],
      ['head', (x, y) => x >= 54 && y >= 30 && y <= 54, 'rigid', 'head', 0.8, 2],
    ],
    { mouth: [82, 46], emit: [{ x: 30, y: 30, type: 'firefly', rate: 0.6 }] },
  ],
  [
    'hy_wildfire',
    'จ้าวไฟป่า',
    ['fire', 'leaf'],
    'สิงโตแผงคอใบไม้ลุกไฟ เขากิ่งไม้',
    QUAD,
    [
      ['tail', (x, y) => x <= 22 && y <= 68, 'swing', 'tail', 23, 62, 0, -2, 30],
      ['legBL', (x, y) => x >= 8 && x <= 26 && y >= 66, 'leg', 'bl', 66, 84],
      ['legFL', (x, y) => x >= 46 && x <= 63 && y >= 66, 'leg', 'fl', 66, 84],
      ['body'],
      ['legBF', (x, y) => x >= 28 && x <= 45 && y >= 66, 'leg', 'bf', 66, 84],
      ['legFF', (x, y) => x >= 64 && y >= 66, 'leg', 'ff', 66, 84],
      ['head', (x, y) => (x >= 56 && y <= 50) || y <= 22, 'rigid', 'head', 0.7, 2],
    ],
    {
      mouth: [78, 40],
      emit: [
        { x: 45, y: 9, type: 'flame', rate: 4 },
        { x: 72, y: 9, type: 'flame', rate: 4 },
        { x: 12, y: 38, type: 'ember', rate: 2 },
      ],
    },
  ],
  [
    'hy_volcano',
    'ภูเขาไฟคำราม',
    ['fire', 'earth'],
    'เต่ามังกร ภูเขาไฟบนกระดอง',
    QUAD,
    [
      ['legBL', (x, y) => x >= 31 && x <= 55 && y >= 57, 'leg', 'bl', 57, 72],
      ['body'],
      ['legBF', (x, y) => x <= 29 && y >= 56, 'leg', 'bf', 56, 72],
      ['legFF', (x, y) => x >= 58 && y >= 57, 'leg', 'ff', 57, 72],
      ['head', (x, y) => x >= 62 && y >= 24 && y <= 56, 'rigid', 'head', 0.6, 1.5],
    ],
    {
      mouth: [80, 42],
      emit: [
        { x: 41, y: 8, type: 'ember', rate: 4 },
        { x: 41, y: 6, type: 'smoke', rate: 1.5 },
      ],
    },
  ],
  [
    'hy_firestorm',
    'พายุเพลิงสายฟ้า',
    ['fire', 'bolt'],
    'นกเพลิงปีกสายฟ้า',
    FLY,
    [
      ['wingLow', (x, y) => x <= 52 && y >= 50, 'swing', 'wing', 52, 50, 0, 2.5, 40],
      ['body'],
      ['wingTop', (x, y) => x <= 56 && y <= 49, 'swing', 'wing', 56, 42, 0.3, -3, 45],
      ['head', (x, y) => x >= 56 && y <= 36, 'rigid', 'head', 0.7, 2],
    ],
    {
      hover: 8,
      fly: true,
      mouth: [78, 22],
      emit: [
        { x: 30, y: 40, type: 'ember', rate: 3 },
        { x: 25, y: 70, type: 'flame', rate: 3 },
        { x: 40, y: 30, type: 'zap', rate: 1.5 },
      ],
    },
  ],
  [
    'hy_mudotter',
    'โคลนมหาสมุทร',
    ['water', 'earth'],
    'นากทะเลเกราะหิน กอดหินก้อนใหญ่',
    BIPED,
    [
      ['tail', (x, y) => x <= 30 && y >= 48, 'swing', 'tail', 31, null, 0, -1.5, 30],
      ['legBL', (x, y) => x >= 31 && x <= 43 && y >= 60, 'leg', 'bl', 60, 72],
      ['body'],
      ['legBF', (x, y) => x >= 44 && x <= 62 && y >= 58, 'leg', 'bf', 58, 72],
      ['arm', (x, y) => x >= 46 && y >= 26 && y <= 57, 'rigid', 'arm', 0.6, 3],
      ['head', (x, y) => x >= 52 && y <= 25, 'rigid', 'head', 0.7, 2],
    ],
    { mouth: [78, 18], emit: [{ x: 52, y: 52, type: 'drip', rate: 1.2 }] },
  ],
  [
    'hy_stormray',
    'พายุทะเลหลวง',
    ['water', 'bolt'],
    'กระเบนยักษ์ลอยฟ้า เส้นสายฟ้าบนตัว',
    SWIM,
    [
      ['tail', (x, y) => x <= 25 && y >= 42 && y <= 68, 'swing', 'tail', 26, 44, 0, 2, 30],
      ['body'],
      ['fin', (x, y) => x <= 58 && y <= 36, 'swing', 'wing', 58, 32, 0.3, -3, 50],
    ],
    {
      hover: 6,
      mouth: [82, 38],
      emit: [
        { x: 60, y: 28, type: 'zap', rate: 2 },
        { x: 45, y: 72, type: 'mist', rate: 2 },
      ],
    },
  ],
  [
    'hy_stoneforest',
    'ป่าหินโบราณ',
    ['leaf', 'earth'],
    'แรดยักษ์ หลังเป็นป่าหิน',
    QUAD,
    [
      ['legBL', (x, y) => x >= 24 && x <= 52 && y >= 60, 'leg', 'bl', 60, 78],
      ['body'],
      ['legBF', (x, y) => x <= 22 && y >= 58, 'leg', 'bf', 58, 78],
      ['legFF', (x, y) => x >= 54 && x <= 76 && y >= 58, 'leg', 'ff', 58, 78],
      ['tree', (x, y) => x >= 28 && x <= 46 && y <= 20, 'swing', 'tail', null, 21, 0.8, 0, 20],
      ['head', (x, y) => x >= 60 && y <= 57, 'rigid', 'head', 0.7, 2],
    ],
    { mouth: [80, 40], emit: [{ x: 30, y: 30, type: 'grit', rate: 0.8 }] },
  ],
  [
    'hy_leafstorm',
    'ไพรอสนี',
    ['leaf', 'bolt'],
    'จิ้งจอกหางใบไม้ เถาวัลย์มีไฟฟ้า',
    QUAD,
    [
      ['tailTop', (x, y) => x <= 45 && y <= 30, 'swing', 'tail', 46, 45, 0, -2.5, 40],
      ['tailMid', (x, y) => x <= 40 && y <= 50, 'swing', 'tail', 46, 45, 0, -2, 38],
      ['tailLow', (x, y) => x <= 35 && y <= 75, 'swing', 'tail', 46, 45, 0, 2, 35],
      ['legBL', (x, y) => x >= 16 && x <= 33 && y >= 66, 'leg', 'bl', 66, 84],
      ['legFL', (x, y) => x >= 52 && x <= 67 && y >= 66, 'leg', 'fl', 66, 84],
      ['body'],
      ['legBF', (x, y) => x >= 34 && x <= 50 && y >= 66, 'leg', 'bf', 66, 84],
      ['legFF', (x, y) => x >= 68 && y >= 66, 'leg', 'ff', 66, 84],
      ['head', (x, y) => x >= 62 && y <= 45, 'rigid', 'head', 0.7, 2],
    ],
    {
      mouth: [80, 32],
      emit: [
        { x: 50, y: 58, type: 'zap', rate: 2 },
        { x: 20, y: 40, type: 'leaf', rate: 0.8 },
      ],
    },
  ],
  [
    'hy_thunderram',
    'ผาฟ้าผ่า',
    ['earth', 'bolt'],
    'แพะภูเขา เขาผลึกล่อฟ้า ขนเป็นแผ่นหิน',
    QUAD,
    [
      ['legBL', (x, y) => x <= 18 && y >= 60, 'leg', 'bl', 60, 84],
      ['body'],
      ['legBF', (x, y) => x >= 19 && x <= 40 && y >= 60, 'leg', 'bf', 60, 84],
      ['legFF', (x, y) => x >= 44 && x <= 72 && y >= 62, 'leg', 'ff', 62, 84],
      ['head', (x, y) => (x >= 28 && y <= 30) || (x >= 56 && y <= 46), 'rigid', 'head', 0.7, 2],
    ],
    { mouth: [76, 32], emit: [{ x: 45, y: 12, type: 'zap', rate: 2.5 }] },
  ],
  [
    'hy_balance',
    'สมดุลแสงมืด',
    ['holy', 'dark'],
    'สิงโตปีกขนนกข้างหนึ่ง ปีกค้างคาวอีกข้าง',
    QUAD,
    [
      ['batWing', (x, y) => x >= 71 && y <= 62, 'swing', 'wing', 70, 28, 0, -2, 22],
      ['legBL', (x, y) => x >= 13 && x <= 30 && y >= 58, 'leg', 'bl', 58, 77],
      ['legFL', (x, y) => x >= 45 && x <= 58 && y >= 58, 'leg', 'fl', 58, 77],
      ['tail', (x, y) => x <= 12 && y >= 50, 'swing', 'tail', 13, 55, 0, -1.5, 14],
      ['body'],
      ['legBF', (x, y) => x >= 31 && x <= 44 && y >= 58, 'leg', 'bf', 58, 77],
      ['legFF', (x, y) => x >= 59 && y >= 58, 'leg', 'ff', 58, 77],
      ['wing', (x, y) => x <= 36 && y <= 55, 'swing', 'wing', 37, 30, 0, -2.5, 34],
      ['head', (x, y) => x >= 44 && x <= 70 && y >= 4 && y <= 38, 'rigid', 'head', 0.7, 2],
    ],
    { mouth: [70, 24], emit: [{ x: 58, y: 44, type: 'sparkle', rate: 1.2 }] },
  ],
  [
    'hy_nightowl',
    'ราชาไร้แสง',
    ['dark', 'shadow'],
    'นกฮูกเขา ปีกผ้าคลุมเป็นควัน',
    FLY,
    [
      ['wingBack', (x, y) => x <= 40 && y <= 62, 'swing', 'wing', 42, 40, 0.3, -3, 42],
      ['body'],
      ['wingFront', (x, y) => x >= 62 && y <= 42, 'swing', 'wing', 60, 36, 0, -2.5, 22],
      ['head', (x, y) => x >= 40 && x <= 62 && y >= 10 && y <= 36, 'rigid', 'head', 0.7, 2],
    ],
    {
      hover: 8,
      fly: true,
      mouth: [58, 26],
      emit: [
        { x: 30, y: 70, type: 'smoke', rate: 1.5 },
        { x: 20, y: 30, type: 'smoke', rate: 1 },
      ],
    },
  ],
  [
    'hy_judge',
    'ผู้พิพากษาเงียบ',
    ['holy', 'shadow'],
    'กิเลนเกราะดำ ผ้าปิดตา ตราตาชั่ง',
    QUAD,
    [
      ['tail', (x, y) => x <= 28 && y <= 62, 'swing', 'tail', 29, 40, 0, -1.5, 28],
      ['legBL', (x, y) => x >= 4 && x <= 20 && y >= 62, 'leg', 'bl', 62, 84],
      ['legFL', (x, y) => x >= 44 && x <= 60 && y >= 62, 'leg', 'fl', 62, 84],
      ['body'],
      ['legBF', (x, y) => x >= 24 && x <= 43 && y >= 62, 'leg', 'bf', 62, 84],
      ['legFF', (x, y) => x >= 63 && y >= 62, 'leg', 'ff', 62, 84],
      ['head', (x, y) => x >= 43 && y <= 38, 'rigid', 'head', 0.7, 2],
    ],
    {
      mouth: [76, 20],
      emit: [
        { x: 12, y: 35, type: 'mist', rate: 1.5 },
        { x: 70, y: 6, type: 'sparkle', rate: 1 },
      ],
    },
  ],
]

// The twin aura every fused form has, in the colours of both parent lines (drawAura 'twinx').
const HYBRID_AURA_COL: Record<string, string> = {
  fire: '#ff9a2a',
  water: '#7ee7ff',
  leaf: '#6aff6a',
  earth: '#e0b060',
  bolt: '#ffe14a',
  holy: '#fff0a0',
  dark: '#c060ff',
  shadow: '#a890e0',
}

export const HYBRID_EL: Record<string, string> = Object.fromEntries(
  HYBRIDS.map(([id, , els]) => [id, els[0]])
)

export const HYBRID_SPRITES: Record<string, ISpriteDef> = Object.fromEntries(
  HYBRIDS.map(([id, , els, , rig, parts, extra]) => {
    const def = ADV_SPRITE(id, rig, parts, extra, { b: HYBRID_BMP[id], w: HYBRID_DESIGN_W[id] })
    def.aura = {
      type: 'twinx',
      x: def.size / 2,
      y: def.size - 6,
      r: 34,
      cols: els.map((e) => HYBRID_AURA_COL[e]),
    }
    return [id, def]
  })
)
