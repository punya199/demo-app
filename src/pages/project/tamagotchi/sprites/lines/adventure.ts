import { ADV_BMP } from '../bitmaps/adventure-bitmaps'
import { bmpRig } from '../engine/bmp-rig'
import { BIPED, BLOB, FLY, QUAD, SWIM } from '../engine/rigs'
import { glowMouth } from '../engine/shapes'
import type { PartOffset } from '../engine/bmp-rig'
import type { Pt } from '../engine/spr'
import type { IEmitter, IGlow, IPose, IRig, ISpriteDef } from '../sprite-types'

// The 20 adventure enemies (adventure-data.ts, in game order) and the training dummy (dummy-data.ts),
// each one bitmap from adventure-bitmaps.ts cut into parts like a
// paper puppet (bmpRig). A part is [name, test(x, y), kind, ...args], listed back to front; the first test
// that matches names the pixel, and 'body' takes the rest. Kinds:
//   rigid key [k cap]      moves whole with pose P[key] (head, a claw, a fist)
//   leg key y0 y1          bends from its top row y0 with P[key] (a shear), the bottom row lifts
//   swing src px py ax ay span   bends round a pivot: the offset grows with the distance from (px, py)
//                          (px or py null = distance along one axis only), times P[src] (tail or wing)
// Under every moving part its own pixels are painted first at rest, so a gap never shows a hole or a seam.

// Which line each enemy belongs to in the game (adventure-data.ts), and its stage badge.
export const ADV_EL: Record<string, string> = {
  advworm: 'leaf',
  advcrab: 'water',
  advbat: 'fire',
  advrabbit: 'leaf',
  advgull: 'water',
  advscorp: 'fire',
  advturtle: 'water',
  advmshark: 'water',
  advsnake: 'fire',
  advboar: 'leaf',
  adveagle: 'leaf',
  advdragon: 'fire',
  advbeetle: 'earth',
  advcbat: 'bolt',
  advant: 'earth',
  advgolem: 'earth',
  advsquirrel: 'bolt',
  advgoat: 'earth',
  advhawk: 'bolt',
  advpeacock: 'bolt',
}

// The part cuts below were measured on the first reduction (by stage); the bitmaps were later reduced again
// to each animal's own size, so every cut, pivot, mouth and emitter is given on that first grid and scaled
// by k = new width / ADV_DESIGN_W.
export const ADV_DESIGN_W = {
  advworm: 36,
  advcrab: 44,
  advbat: 44,
  advrabbit: 56,
  advgull: 52,
  advscorp: 52,
  advturtle: 52,
  advmshark: 64,
  advsnake: 58,
  advboar: 58,
  adveagle: 55,
  advdragon: 72,
  advbeetle: 64,
  advcbat: 64,
  advant: 64,
  advgolem: 72,
  advsquirrel: 56,
  advgoat: 57,
  advhawk: 64,
  advpeacock: 71,
  dummy: 37,
}

type PartTest = (x: number, y: number) => boolean
type VecKey = 'fl' | 'bl' | 'ff' | 'bf' | 'arm' | 'arm2' | 'head' | 'body'
type NumKey = 'jaw' | 'tail' | 'wing' | 'glow'

// One part of an adventure enemy, as described above.
export type AdvPart =
  | ['body']
  | [name: string, test: PartTest, kind: 'rigid', key: VecKey, k?: number, cap?: number]
  | [name: string, test: PartTest, kind: 'leg', key: VecKey, y0: number, y1: number]
  | [
      name: string,
      test: PartTest,
      kind: 'swing',
      src: NumKey,
      px: number | null,
      py: number | null,
      ax: number,
      ay: number,
      span: number,
    ]

export type AdvId = keyof typeof ADV_DESIGN_W

export function advRig(id: AdvId, parts: AdvPart[]) {
  const b = ADV_BMP[id],
    k = b.rows[0].length / ADV_DESIGN_W[id],
    tests = parts.filter((p): p is Exclude<AdvPart, ['body']> => p.length > 1)
  const part = (x: number, y: number) => {
    for (const p of tests) if (p[1](x / k, y / k)) return p[0]
    return 'body'
  }
  const clamp = (v: number, c: number) => Math.max(-c, Math.min(c, v))
  function offs(P: IPose) {
    const body: Pt = [P.body[0] * 0.6, P.body[1] * 0.6],
      at = (dx: number, dy: number): Pt => [body[0] + Math.round(dx), body[1] + Math.round(dy)],
      o: Record<string, PartOffset> & { body: Pt } = { body }
    for (const p of tests) {
      const name = p[0]
      if (p[2] === 'rigid') {
        const [, , , key, k = 0.6, cap = 1.5] = p
        o[name] = at(clamp(P[key][0] * k, cap), clamp(P[key][1] * k, cap))
      } else if (p[2] === 'leg') {
        const [, , , key, y0, y1] = p
        o[name] = (_x, y) => {
          y /= k
          return at(
            (P[key][0] * 0.7 * Math.max(0, y - y0)) / (y1 - y0),
            y >= y1 - 1 ? clamp(P[key][1] * 0.6, 1.5) : 0
          )
        }
      } else {
        const [, , , src, px, py, ax, ay, span] = p,
          v = P[src]
        o[name] = (x, y) => {
          x /= k
          y /= k
          const dist =
            px == null
              ? Math.abs(y - (py as number))
              : py == null
                ? Math.abs(x - px)
                : Math.hypot(x - px, y - py)
          const f = (v * Math.min(dist, span)) / span
          return at(ax * f, ay * f)
        }
      }
    }
    return o
  }
  const order = parts.map((p) => p[0])
  return { b, k, part, offs, order, under: order.filter((n) => n !== 'body') }
}

// Where an enemy's mouth and particle emitters are, on its design grid.
interface IAdvExtra {
  mouth?: Pt
  emit?: IEmitter[]
  hover?: number
  fly?: boolean
  glows?: IGlow[]
}

// A sprite from a rig: the grid is the bitmap's longer side plus a margin, rounded up to 8, so each animal
// keeps its own size (a worm is small, a boar big; every card and the arena draw at one pixel scale). The
// bitmap sits centred with its feet 2 px above the bottom. Positions in extra (mouth, emitters) are on the
// design grid and are moved onto the sprite grid here.
export function ADV_SPRITE(
  id: AdvId,
  rig: IRig,
  parts: AdvPart[],
  extra: IAdvExtra = {}
): ISpriteDef {
  const R = advRig(id, parts),
    w = R.b.rows[0].length,
    h = R.b.rows.length,
    size = Math.ceil((Math.max(w, h) + 6) / 8) * 8,
    ox = Math.round((size - w) / 2),
    oy = size - h - 2,
    mouth = extra.mouth && [
      Math.round(extra.mouth[0] * R.k) + ox,
      Math.round(extra.mouth[1] * R.k) + oy,
    ]
  return {
    ...extra,
    size,
    rig,
    draw(s, P) {
      const o = R.offs(P),
        under = Object.fromEntries(R.under.map((n) => [n, { off: o.body, inner: 1 }]))
      bmpRig(s, R.b, ox, oy, R.part, o, R.order, under)
      if (P.glow && mouth) glowMouth(s, mouth[0] + o.body[0], mouth[1] + o.body[1])
    },
    mouth: mouth || [size / 2, size / 2],
    emit: (extra.emit || []).map((e) => ({ ...e, x: e.x * R.k + ox, y: e.y * R.k + oy })),
  }
}

export const box = (x0: number, y0: number, x1: number, y1: number) => (x: number, y: number) =>
  x >= x0 && x <= x1 && y >= y0 && y <= y1

export const ADVENTURE_SPRITES: Record<string, ISpriteDef> = {
  // ทุ่งหญ้าเริ่มต้น
  advworm: ADV_SPRITE(
    'advworm',
    QUAD,
    [
      ['tail', box(0, 0, 9, 40), 'swing', 'tail', 10, null, 0, -1.5, 10],
      ['body'],
      ['head', (x, y) => x >= 22 && y <= 20, 'rigid', 'head', 0.7, 2],
    ],
    { mouth: [33, 14] }
  ),
  advcrab: ADV_SPRITE(
    'advcrab',
    QUAD,
    [
      ['legB', (x, y) => x <= 15 && y >= 22, 'leg', 'bl', 22, 34],
      ['legF', (x, y) => x >= 29 && x <= 40 && y >= 26, 'leg', 'bf', 26, 34],
      ['body'],
      ['claw', (x, y) => x >= 28 && y <= 21, 'rigid', 'fl', 0.7, 2],
    ],
    { mouth: [36, 22] }
  ),
  advbat: ADV_SPRITE(
    'advbat',
    FLY,
    [
      ['wingL', (x) => x <= 13, 'swing', 'wing', 14, null, 0, -3, 14],
      ['wingR', (x) => x >= 31, 'swing', 'wing', 30, null, 0, -3, 13],
      ['body'],
    ],
    { hover: 6, fly: true, mouth: [24, 16], emit: [{ x: 22, y: 20, type: 'ember', rate: 1.5 }] }
  ),
  advrabbit: ADV_SPRITE(
    'advrabbit',
    QUAD,
    [
      ['tail', box(0, 26, 7, 46), 'swing', 'tail', 8, null, 0, -1, 7],
      ['legB', (x, y) => x >= 10 && x <= 34 && y >= 50, 'leg', 'bl', 50, 57],
      ['body'],
      ['legF', (x, y) => x >= 36 && y >= 48, 'leg', 'ff', 48, 57],
      ['head', (x, y) => (x >= 30 && y <= 31) || (x >= 22 && y <= 18), 'rigid', 'head', 0.7, 2],
    ],
    { mouth: [50, 26], emit: [{ x: 30, y: 30, type: 'fall', rate: 0.6 }] }
  ),
  // ชายฝั่งหมอก
  advgull: ADV_SPRITE(
    'advgull',
    BIPED,
    [
      ['legB', (x, y) => x <= 27 && y >= 32, 'leg', 'bl', 32, 42],
      ['legF', (x, y) => x >= 28 && y >= 32, 'leg', 'bf', 32, 42],
      ['body'],
      ['wing', (x, y) => x <= 33 && y >= 14 && y <= 31, 'swing', 'wing', 34, null, 0, -2.5, 30],
      ['head', (x, y) => x >= 33 && y <= 13, 'rigid', 'head', 0.7, 2],
    ],
    { mouth: [50, 9] }
  ),
  advscorp: ADV_SPRITE(
    'advscorp',
    QUAD,
    [
      ['tail', (x, y) => x <= 20 && y <= 22, 'swing', 'tail', null, 22, 2, 0, 22],
      ['legs', (x, y) => x <= 20 && y >= 30, 'leg', 'bl', 28, 44],
      ['body'],
      ['clawLow', (x, y) => x >= 22 && x <= 42 && y >= 37, 'rigid', 'ff', 0.6, 1.5],
      ['claw', (x, y) => x >= 38 && y >= 24 && y <= 36, 'rigid', 'fl', 0.7, 2],
    ],
    { mouth: [36, 28] }
  ),
  advturtle: ADV_SPRITE(
    'advturtle',
    QUAD,
    [
      ['legB', (x, y) => x >= 4 && x <= 13 && y >= 31, 'leg', 'bl', 31, 39],
      ['legFF', (x, y) => x >= 38 && y >= 33, 'leg', 'ff', 33, 40],
      ['body'],
      ['legF', (x, y) => x >= 25 && x <= 35 && y >= 31, 'leg', 'bf', 31, 44],
      ['head', (x, y) => x >= 37 && y >= 17 && y <= 32, 'rigid', 'head', 0.8, 2],
    ],
    { mouth: [50, 27] }
  ),
  advmshark: ADV_SPRITE(
    'advmshark',
    SWIM,
    [['tail', (x) => x <= 17, 'swing', 'tail', 18, null, 0, -2.5, 18], ['body']],
    { hover: 6, mouth: [58, 33], emit: [{ x: 30, y: 30, type: 'mist', rate: 1.5 }] }
  ),
  // ภูเขาไฟหลับ
  advsnake: ADV_SPRITE(
    'advsnake',
    QUAD,
    [
      ['tail', (x, y) => x <= 18 && y <= 34, 'swing', 'tail', null, 34, 2, 0, 20],
      ['body'],
      ['head', (x, y) => x >= 33 && y <= 18, 'rigid', 'head', 0.8, 2],
    ],
    { mouth: [54, 12], emit: [{ x: 40, y: 40, type: 'ember', rate: 2 }] }
  ),
  advboar: ADV_SPRITE(
    'advboar',
    QUAD,
    [
      ['tail', (x, y) => x <= 5 && y <= 34, 'swing', 'tail', 6, null, 0, -1.5, 6],
      ['legBL', (x, y) => x >= 8 && x <= 16 && y >= 33, 'leg', 'bl', 33, 46],
      ['legFL', (x, y) => x >= 33 && x <= 40 && y >= 33, 'leg', 'fl', 33, 46],
      ['body'],
      ['legBF', (x, y) => x >= 19 && x <= 27 && y >= 33, 'leg', 'bf', 33, 46],
      ['legFF', (x, y) => x >= 42 && x <= 50 && y >= 33, 'leg', 'ff', 33, 46],
      ['head', (x, y) => x >= 44 && y >= 6 && y <= 32, 'rigid', 'head', 0.8, 2],
    ],
    { mouth: [54, 26] }
  ),
  adveagle: ADV_SPRITE(
    'adveagle',
    FLY,
    [
      ['wingLow', (x, y) => x <= 22 && y >= 38, 'swing', 'wing', 22, 40, 0, 2, 20],
      ['wingBack', (x, y) => x <= 24 && y <= 37, 'swing', 'wing', 26, 32, 0.6, -3, 32],
      ['body'],
      [
        'wingFront',
        (x, y) => x >= 26 && x <= 40 && y <= 20,
        'swing',
        'wing',
        34,
        22,
        0.4,
        -2.5,
        20,
      ],
      ['head', (x, y) => x >= 41 && y >= 12 && y <= 26, 'rigid', 'head', 0.7, 2],
    ],
    { hover: 7, fly: true, mouth: [53, 20] }
  ),
  advdragon: ADV_SPRITE(
    'advdragon',
    QUAD,
    [
      ['wing', (x, y) => x <= 35 && y <= 36, 'swing', 'wing', 36, 22, 0.5, -3, 34],
      ['tail', (x, y) => x <= 22 && y >= 48, 'swing', 'tail', 22, null, 0, -2, 22],
      ['body'],
      ['head', (x, y) => (x >= 44 && y <= 36) || (x >= 36 && y <= 13), 'rigid', 'head', 0.7, 2],
    ],
    { mouth: [70, 28], emit: [{ x: 64, y: 22, type: 'smoke', rate: 0.8 }] }
  ),
  // ถ้ำผลึกลึก
  advbeetle: ADV_SPRITE(
    'advbeetle',
    FLY,
    [
      ['wingL', (x, y) => x <= 24 && y >= 19 && y <= 32, 'swing', 'wing', 26, 24, 0, 3, 24],
      ['wingR', (x, y) => x >= 50 && y >= 16 && y <= 31, 'swing', 'wing', 48, 24, 0, 3, 16],
      ['body'],
      ['shellL', (x, y) => x <= 36 && y <= 19, 'swing', 'wing', 34, 20, 0, -2, 30],
      ['shellR', (x, y) => x >= 40 && x <= 56 && y <= 15, 'swing', 'wing', 42, 18, 0, -2, 16],
    ],
    { hover: 7, fly: true, mouth: [44, 30] }
  ),
  advcbat: ADV_SPRITE(
    'advcbat',
    FLY,
    [
      ['wingL', (x) => x <= 22, 'swing', 'wing', 23, null, 0, -4, 22],
      ['wingR', (x) => x >= 42, 'swing', 'wing', 41, null, 0, -4, 22],
      ['body'],
    ],
    { hover: 8, fly: true, mouth: [34, 30], emit: [{ x: 32, y: 30, type: 'zap', rate: 1.5 }] }
  ),
  advant: ADV_SPRITE(
    'advant',
    QUAD,
    [
      ['abdomen', (x, y) => x <= 20 && y < 38, 'swing', 'tail', 21, null, 0, -1, 20],
      ['legBL', (x, y) => x <= 22 && y >= 38, 'leg', 'bl', 38, 53],
      ['legFL', (x, y) => x >= 35 && x <= 47 && y >= 38, 'leg', 'fl', 38, 53],
      ['body'],
      ['legBF', (x, y) => x >= 23 && x <= 34 && y >= 38, 'leg', 'bf', 38, 53],
      ['legFF', (x, y) => x >= 48 && y >= 38, 'leg', 'ff', 38, 53],
      [
        'head',
        (x, y) => (x >= 46 && y >= 14 && y <= 37) || (x >= 36 && y <= 17),
        'rigid',
        'head',
        0.7,
        2,
      ],
    ],
    { mouth: [60, 32] }
  ),
  advgolem: ADV_SPRITE(
    'advgolem',
    BIPED,
    [
      ['armB', (x, y) => x <= 14 && y >= 36, 'rigid', 'arm2', 0.6, 3],
      ['legB', (x, y) => x >= 18 && x <= 34 && y >= 58, 'leg', 'bl', 58, 70],
      ['body'],
      ['legF', (x, y) => x >= 40 && x <= 56 && y >= 56, 'leg', 'bf', 56, 70],
      ['head', box(36, 18, 54, 34), 'rigid', 'head', 0.6, 1.5],
      ['armF', (x, y) => x >= 58 && y >= 34, 'rigid', 'arm', 0.6, 3],
    ],
    { mouth: [46, 28], emit: [{ x: 34, y: 6, type: 'zap', rate: 1 }] }
  ),
  // ยอดผาพายุ
  advsquirrel: ADV_SPRITE(
    'advsquirrel',
    BIPED,
    [
      ['tail', (x, y) => x <= 22 && y <= 60, 'swing', 'tail', null, 60, 2.5, 0, 60],
      ['body'],
      ['head', (x, y) => x >= 36 && y <= 39, 'rigid', 'head', 0.7, 2],
    ],
    { mouth: [52, 34], emit: [{ x: 4, y: 4, type: 'zap', rate: 2 }] }
  ),
  advgoat: ADV_SPRITE(
    'advgoat',
    QUAD,
    [
      ['tail', (x, y) => x <= 5 && y <= 34, 'swing', 'tail', 6, null, 0, -1.5, 6],
      ['legBL', (x, y) => x <= 13 && y >= 46, 'leg', 'bl', 46, 63],
      ['legFL', (x, y) => x >= 30 && x <= 39 && y >= 46, 'leg', 'fl', 46, 63],
      ['body'],
      ['legBF', (x, y) => x >= 14 && x <= 23 && y >= 46, 'leg', 'bf', 46, 63],
      ['legFF', (x, y) => x >= 40 && y >= 46, 'leg', 'ff', 46, 63],
      ['head', (x, y) => (x >= 40 && y <= 34) || (x >= 26 && y <= 14), 'rigid', 'head', 0.7, 2],
    ],
    { mouth: [54, 26] }
  ),
  advhawk: ADV_SPRITE(
    'advhawk',
    BIPED,
    [
      ['tail', (x, y) => x <= 24 && y >= 36, 'swing', 'tail', 26, null, 0, -1.5, 26],
      ['legB', (x, y) => x >= 30 && x <= 40 && y >= 52, 'leg', 'bl', 52, 63],
      ['body'],
      ['legF', (x, y) => x >= 41 && y >= 52, 'leg', 'bf', 52, 63],
      ['head', (x, y) => x >= 42 && y <= 26, 'rigid', 'head', 0.7, 2],
    ],
    { mouth: [60, 15], emit: [{ x: 40, y: 30, type: 'zap', rate: 1 }] }
  ),
  advpeacock: ADV_SPRITE(
    'advpeacock',
    BIPED,
    [
      ['fan', (x, y) => (y <= 40 && x <= 54) || x <= 18, 'swing', 'tail', null, 52, 1.2, 0, 50],
      ['legB', (x, y) => x <= 40 && y >= 60, 'leg', 'bl', 60, 71],
      ['body'],
      ['legF', (x, y) => x >= 41 && y >= 60, 'leg', 'bf', 60, 71],
      ['head', (x, y) => x >= 55 && y >= 8 && y <= 30, 'rigid', 'head', 0.7, 2],
    ],
    { mouth: [66, 18], emit: [{ x: 30, y: 16, type: 'zap', rate: 2 }] }
  ),
  // หุ่นซ้อม: a post that only rocks when hit
  dummy: ADV_SPRITE('dummy', BLOB, [['body']]),
}
