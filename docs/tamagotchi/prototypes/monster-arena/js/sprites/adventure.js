'use strict'
// The 20 adventure enemies (adventure-data.ts, in game order) and the training dummy (dummy-data.ts),
// added to the shared SPRITES table. Each is one bitmap from adventure-bitmaps.js cut into parts like a
// paper puppet (bmpRig). A part is [name, test(x, y), kind, ...args], listed back to front; the first test
// that matches names the pixel, and 'body' takes the rest. Kinds:
//   rigid key [k cap]      moves whole with pose P[key] (head, a claw, a fist)
//   leg key y0 y1          bends from its top row y0 with P[key] (a shear), the bottom row lifts
//   swing src px py ax ay span   bends round a pivot: the offset grows with the distance from (px, py)
//                          (px or py null = distance along one axis only), times P[src] (tail or wing)
// Under every moving part its own pixels are painted first at rest, so a gap never shows a hole or a seam.

// Which line each enemy belongs to in the game (adventure-data.ts), and its stage badge.
const ADV_EL = {
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

function advRig(id, parts) {
  const b = ADV_BMP[id],
    tests = parts.filter((p) => p[1])
  const part = (x, y) => {
    for (const p of tests) if (p[1](x, y)) return p[0]
    return 'body'
  }
  const clamp = (v, c) => Math.max(-c, Math.min(c, v))
  function offs(P) {
    const body = [P.body[0] * 0.6, P.body[1] * 0.6],
      at = (dx, dy) => [body[0] + Math.round(dx), body[1] + Math.round(dy)],
      o = { body }
    for (const [name, , kind, ...a] of parts) {
      if (name === 'body') continue
      if (kind === 'rigid') {
        const [key, k = 0.6, cap = 1.5] = a
        o[name] = at(clamp(P[key][0] * k, cap), clamp(P[key][1] * k, cap))
      } else if (kind === 'leg') {
        const [key, y0, y1] = a
        o[name] = (x, y) =>
          at(
            (P[key][0] * 0.7 * Math.max(0, y - y0)) / (y1 - y0),
            y >= y1 - 1 ? clamp(P[key][1] * 0.6, 1.5) : 0
          )
      } else {
        const [src, px, py, ax, ay, span] = a,
          v = P[src]
        o[name] = (x, y) => {
          const dist =
            px == null
              ? Math.abs(y - py)
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
  return { b, part, offs, order, under: order.filter((n) => n !== 'body') }
}

// A sprite from a rig: the bitmap sits centred on the grid with its feet 2 px above the bottom. Positions in
// extra (mouth, emitters) are on the bitmap and are moved onto the grid here.
function ADV_SPRITE(id, size, rig, parts, extra = {}) {
  const R = advRig(id, parts),
    ox = Math.round((size - R.b.rows[0].length) / 2),
    oy = size - R.b.rows.length - 2,
    mouth = extra.mouth && [extra.mouth[0] + ox, extra.mouth[1] + oy]
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
    emit: (extra.emit || []).map((e) => ({ ...e, x: e.x + ox, y: e.y + oy })),
  }
}

const box = (x0, y0, x1, y1) => (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1

Object.assign(SPRITES, {
  // ทุ่งหญ้าเริ่มต้น
  advworm: ADV_SPRITE(
    'advworm',
    40,
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
    48,
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
    48,
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
    64,
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
    56,
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
    56,
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
    56,
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
    72,
    SWIM,
    [['tail', (x) => x <= 17, 'swing', 'tail', 18, null, 0, -2.5, 18], ['body']],
    { hover: 6, mouth: [58, 33], emit: [{ x: 30, y: 30, type: 'mist', rate: 1.5 }] }
  ),
  // ภูเขาไฟหลับ
  advsnake: ADV_SPRITE(
    'advsnake',
    64,
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
    64,
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
    64,
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
    80,
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
    72,
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
    72,
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
    72,
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
    80,
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
    72,
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
    72,
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
    72,
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
    80,
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
  dummy: ADV_SPRITE('dummy', 56, BLOB, [['body']]),
})
