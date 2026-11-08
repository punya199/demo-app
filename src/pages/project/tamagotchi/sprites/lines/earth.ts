import type { Pt } from '../engine/spr'
import { TAU, lerp } from '../engine/math'
import { BLOB, QUAD } from '../engine/rigs'
import { flower, glowMouth } from '../engine/shapes'
import type { ISpriteDef } from '../sprite-types'

// Earth line: the 11 forms, the awakened fused form and the world boss (pangolin).
// Ported from the prototype (docs/tamagotchi/prototypes/monster-arena/js/sprites).
export const EARTH_SPRITES: Record<string, ISpriteDef> = {
  /* ----- Earth line (static drafts for the owner to choose from): stone-armoured animals, tortoise and rhino ----- */
  eegg: {
    size: 48,
    rig: BLOB,
    draw(s, P) {
      const bx = P.body[0] * 0.6,
        by = P.body[1] * 0.3,
        m = (pts: Pt[]) => pts.map(([x, y]) => [x + bx, y + by])
      s.E(24 + bx, 31 + by, 9, 12, 'sand')
      s.E(20 + bx, 25 + by, 2.2, 1.6, 'stone')
      s.E(28.5 + bx, 34 + by, 2.6, 1.9, 'stone')
      s.E(21 + bx, 39 + by, 1.6, 1.2, 'stone2')
      s.E(29 + bx, 24 + by, 1.3, 1, 'stone')
      s.line(
        m([
          [16, 31],
          [19, 33],
          [21, 31],
          [24, 34],
          [27, 31],
          [30, 33],
          [32, 31],
        ]),
        '#ffa02a',
        '#ffe4a0'
      )
      s.d(20 + bx, 21 + by, '#ffffff').d(19 + bx, 22 + by, '#fff0cc')
    },
    glows: [[24, 32, '#ffa02a', 6]],
    emit: [],
    mouth: [24, 28],
  },
  pebble: {
    size: 48,
    rig: BLOB,
    draw(s, P) {
      const [bx, by] = P.body
      s.E(19, 42 + P.bl[1], 2.6, 1.5, 'stone2')
      s.E(29, 42 + P.fl[1], 2.6, 1.5, 'stone2')
      s.E(24 + bx, 35 + by, 9.5, 7.5, 'stone')
      s.E(27.5 + bx, 27.5 + by, 2.6, 1.6, 'stone2')
      for (const [x, y, c] of [
        [17, 31, '#c8bca6'],
        [30, 38, '#6e6456'],
        [16, 37, '#6e6456'],
        [31, 31, '#c8bca6'],
        [23, 40, '#6e6456'],
      ] as const)
        s.d(x + bx, y + by, c)
      s.eye(20 + bx, 33 + by, 'big').eye(26 + bx, 33 + by, 'big')
      s.d(18 + bx, 37 + by, '#ff9a80')
        .d(29 + bx, 37 + by, '#ff9a80')
        .d(23 + bx, 38 + by, '#2a2016')
        .d(24 + bx, 38 + by, '#2a2016')
    },
    emit: [],
    mouth: [30, 36],
  },
  clay: {
    size: 48,
    rig: BLOB,
    draw(s, P) {
      const [bx, by] = P.body
      s.E(13 + bx, 37 + by, 2.2, 1.7, 'clay')
      s.E(35 + bx, 36 + by, 2.2, 1.7, 'clay')
      s.E(24 + bx, 37 + by, 10, 7, 'clay')
      s.E(23 + bx, 30.5 + by, 7, 5.5, 'clay')
      s.E(31 + bx, 42 + by, 2, 2.2, 'clay')
      for (const [x, y] of [
        [17, 40],
        [27, 41],
        [21, 27],
        [30, 34],
      ])
        s.d(x + bx, y + by, '#8a3e22').d(x + 1 + bx, y + by, '#8a3e22')
      s.line(
        [
          [15 + bx, 33 + by],
          [16 + bx, 35 + by],
          [15 + bx, 37 + by],
        ],
        '#f4b48a'
      )
      s.E(28 + bx, 28 + by, 1.6, 1.2, 'stone')
      s.eye(19 + bx, 33 + by, 'big').eye(26 + bx, 33 + by, 'big')
      s.d(22 + bx, 38 + by, '#4a1a0c')
        .d(23 + bx, 38 + by, '#4a1a0c')
        .d(22 + bx, 39 + by, '#4a1a0c')
        .d(23 + bx, 39 + by, '#4a1a0c')
    },
    emit: [],
    mouth: [30, 36],
  },
  tortoise: {
    size: 56,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by
      s.E(17 + P.bf[0], 47 + P.bf[1], 3, 3.5, 'tort2')
      s.E(35 + P.ff[0], 47 + P.ff[1], 3, 3.5, 'tort2')
      s.P(
        [
          [10 + bx, 43 + by],
          [6 + bx, 45 + by],
          [11 + bx, 46 + by],
        ],
        'tort'
      )
      s.E(26 + bx, 38 + by, 14, 9.5, 'shellE')
      s.E(26 + bx, 44 + by, 14.5, 2.6, 'stone2')
      for (const [x, y] of [
        [19, 37],
        [26, 33],
        [33, 37],
        [26, 40],
      ]) {
        s.P(
          [
            [x - 3.5, y],
            [x - 1.8, y - 3],
            [x + 1.8, y - 3],
            [x + 3.5, y],
            [x + 1.8, y + 3],
            [x - 1.8, y + 3],
          ].map(([a, b]) => [a + bx, b + by]),
          'stone'
        )
        s.d(x - 1 + bx, y - 2 + by, '#c8bca6')
      }
      s.E(19 + P.bl[0], 48 + P.bl[1], 3.4, 4, 'tort')
      s.E(33 + P.fl[0], 48 + P.fl[1], 3.4, 4, 'tort')
      for (const x of [17, 19, 21]) s.d(x + P.bl[0], 51 + P.bl[1], '#f4ede0')
      for (const x of [31, 33, 35]) s.d(x + P.fl[0], 51 + P.fl[1], '#f4ede0')
      s.L(38 + bx, 42 + by, 43 + hx, 38 + hy, 3, 'tort', 2.6)
      s.E(45 + hx, 37 + hy, 4.8, 3.8, 'tort')
      s.P(
        [
          [48 + hx, 36 + hy],
          [51 + hx, 38 + hy],
          [48 + hx, 40 + hy],
        ],
        'stone2'
      )
      s.eye(45 + hx, 35 + hy, 'cute')
      s.line(
        [
          [44 + hx, 39 + hy],
          [48 + hx, 39 + hy],
        ],
        '#2a2016'
      )
    },
    emit: [],
    mouth: [50, 38],
  },
  worm: {
    size: 48,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        pts = []
      for (let i = 0; i <= 10; i++) {
        const q = i / 10
        pts.push([
          7 + q * 30 + bx,
          42 - Math.sin(q * Math.PI) * 5 + by + (q > 0.8 ? (q - 0.8) * -10 : 0),
          3.6 + Math.sin(q * Math.PI) * 1.6,
        ])
      }
      pts.forEach(([x, y, r]) => s.E(x, y, r, r, 'worm'))
      s.E(pts[7][0], pts[7][1], pts[7][2] + 0.4, pts[7][2] + 0.4, 'clay')
      pts.forEach(([x, y, r], i) => {
        if (i > 0 && i < 10)
          s.line(
            [
              [x, y - r + 1],
              [x, y + r - 1],
            ],
            '#8a4a4a'
          )
      })
      for (const [x, y, r] of [
        [5, 45, 2.4],
        [20, 46, 1.6],
        [42, 45, 2],
      ])
        s.E(x + bx, y + by, r, r * 0.6, 'sand')
      s.E(18 + bx, 34 + by, 1.8, 1.4, 'stone')
      const [ex, ey] = pts[10]
      s.eye(ex - 1, ey - 1, 'sleepy').eye(ex + 2, ey - 1, 'sleepy')
      s.d(ex + 1, ey + 1.5, '#4a1a1a')
    },
    emit: [{ x: 40, y: 30, type: 'zz', rate: 0.5 }],
    mouth: [40, 37],
  },
  rhino: {
    size: 56,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by
      s.L(18 + bx, 44 + by, 17 + P.bf[0], 51 + P.bf[1], 3, 'rhino2')
      s.L(33 + bx, 44 + by, 34 + P.ff[0], 51 + P.ff[1], 3, 'rhino2')
      s.L(13 + bx, 39 + by, 9 + bx, 43 + by, 1, 'rhino')
      s.E(25 + bx, 40 + by, 13, 8, 'rhino')
      s.E(26 + bx, 45 + by, 9, 2, 'rhino2')
      for (const [x, y, w] of [
        [15, 35, 4],
        [22, 33, 4.5],
        [29, 33, 4.5],
      ]) {
        s.P(
          [
            [x - w, y + 3],
            [x - w + 1, y - 1.5],
            [x + w - 1, y - 2],
            [x + w, y + 3],
          ].map(([a, b]) => [a + bx, b + by]),
          'stone'
        )
        s.line(
          [
            [x - 1 + bx, y - 1 + by],
            [x + bx, y + 2 + by],
          ],
          '#4a4238'
        )
      }
      s.L(20 + bx, 45 + by, 20 + P.bl[0], 52 + P.bl[1], 3.4, 'rhino')
      s.L(31 + bx, 45 + by, 32 + P.fl[0], 52 + P.fl[1], 3.4, 'rhino')
      for (const x of [18, 20, 22]) s.d(x + P.bl[0], 54 + P.bl[1], '#f4ede0')
      for (const x of [30, 32, 34]) s.d(x + P.fl[0], 54 + P.fl[1], '#f4ede0')
      s.E(40 + hx, 39 + hy, 6.5, 5.5, 'rhino')
      s.P(
        [
          [42 + hx, 35 + hy],
          [51 + hx, 39 + hy],
          [50 + hx, 45 + hy],
          [42 + hx, 45 + hy],
        ],
        'rhino'
      )
      s.P(
        [
          [45 + hx, 37 + hy],
          [49 + hx, 26 + hy],
          [51.5 + hx, 38 + hy],
        ],
        'stone'
      )
      s.P(
        [
          [41.5 + hx, 35.5 + hy],
          [43 + hx, 30 + hy],
          [45 + hx, 36 + hy],
        ],
        'stone'
      )
      s.spike(37 + hx, 35 + hy, 4, 1.4, 'rhino', -1)
      s.d(43 + hx, 38 + hy, '#160806').d(44 + hx, 38 + hy, '#160806')
      s.line(
        [
          [45 + hx, 43 + hy],
          [50 + hx, 43 + hy],
        ],
        '#2e2826'
      )
    },
    emit: [],
    mouth: [51, 42],
  },
  pillarturtle: {
    size: 64,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by
      s.L(19 + bx, 50 + by, 19 + P.bf[0], 58 + P.bf[1], 3.4, 'tort2')
      s.L(41 + bx, 50 + by, 41 + P.ff[0], 58 + P.ff[1], 3.4, 'tort2')
      s.E(30 + bx, 45 + by, 17, 10.5, 'shellE')
      s.E(30 + bx, 52 + by, 17.5, 3, 'stone2')
      for (const [x, h] of [
        [21, 9],
        [27, 14],
        [33, 11],
        [39, 7],
        [24, 6],
      ]) {
        const top = 40 - h
        s.P(
          [
            [x - 2.6 + bx, 41 + by],
            [x - 2.6 + bx, top + by],
            [x + 2.6 + bx, top + by],
            [x + 2.6 + bx, 41 + by],
          ],
          'stone'
        )
        s.E(x + bx, top + by, 2.6, 1.1, 'sand')
        s.line(
          [
            [x + 1.5 + bx, top + 2 + by],
            [x + 1.5 + bx, 40 + by],
          ],
          '#4a4238'
        )
      }
      s.E(25 + bx, 41 + by, 4, 1.5, 'moss')
      s.L(22 + bx, 52 + by, 22 + P.bl[0], 58.5 + P.bl[1], 3.9, 'tort')
      s.L(38 + bx, 52 + by, 38 + P.fl[0], 58.5 + P.fl[1], 3.9, 'tort')
      for (const x of [19, 22, 25]) s.d(x + P.bl[0], 60 + P.bl[1], '#f4ede0')
      for (const x of [35, 38, 41]) s.d(x + P.fl[0], 60 + P.fl[1], '#f4ede0')
      s.L(45 + bx, 50 + by, 51 + hx, 45 + hy, 3.8, 'tort', 3.2)
      s.E(53 + hx, 44 + hy, 5.6, 4.6, 'tort')
      s.P(
        [
          [50 + hx, 40 + hy],
          [57 + hx, 40.5 + hy],
          [55 + hx, 42 + hy],
          [50 + hx, 42 + hy],
        ],
        'stone'
      )
      s.P(
        [
          [57 + hx, 43 + hy],
          [61 + hx, 45 + hy],
          [57 + hx, 47.5 + hy],
        ],
        'stone2'
      )
      s.eye(54 + hx, 43 + hy, 'fierce')
      s.line(
        [
          [52 + hx, 47 + hy],
          [57 + hx, 47 + hy],
        ],
        '#2a2016'
      )
    },
    emit: [],
    mouth: [60, 45],
  },
  boulder: {
    size: 64,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body
      s.E(20 + P.bf[0], 57 + P.bf[1], 3.6, 2, 'stone2')
      s.E(44 + P.ff[0], 57 + P.ff[1], 3.6, 2, 'stone2')
      s.E(32 + bx, 44 + by, 17, 13.5, 'stone')
      s.E(29 + bx, 32.5 + by, 12, 4.4, 'moss')
      for (const x of [22, 26, 31, 36])
        s.line(
          [
            [x + bx, 30 + by],
            [x + 1 + bx, 27 + by],
          ],
          '#6e9a2c'
        )
      s.L(37 + bx, 30 + by, 37 + bx, 25 + by, 0.6, 'vine')
      flower(s, 37 + bx, 24 + by)
      s.line(
        [
          [18 + bx, 40 + by],
          [21 + bx, 44 + by],
          [19 + bx, 49 + by],
        ],
        '#4a4238'
      ).line(
        [
          [26 + bx, 52 + by],
          [30 + bx, 54 + by],
        ],
        '#4a4238'
      )
      s.d(20 + bx, 36 + by, '#c8bca6').d(22 + bx, 35 + by, '#c8bca6')
      s.E(24 + P.bl[0], 58 + P.bl[1], 4, 2.2, 'stone')
      s.E(40 + P.fl[0], 58 + P.fl[1], 4, 2.2, 'stone')
      s.eye(36 + bx, 45 + by, 'sleepy').eye(43 + bx, 45 + by, 'sleepy')
      s.line(
        [
          [38 + bx, 49 + by],
          [41 + bx, 49 + by],
        ],
        '#2a2016'
      )
      s.d(41 + bx, 50 + by, '#86d4ff').d(41 + bx, 51 + by, '#86d4ff')
    },
    emit: [{ x: 44, y: 36, type: 'zz', rate: 0.4 }],
    mouth: [42, 49],
  },
  orerhino: {
    size: 64,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by
      s.L(20 + bx, 52 + by, 19 + P.bf[0], 59 + P.bf[1], 3.6, 'rhino2')
      s.L(39 + bx, 52 + by, 40 + P.ff[0], 59 + P.ff[1], 3.6, 'rhino2')
      s.L(15 + bx, 46 + by, 10 + bx, 50 + by, 1.2, 'rhino')
      s.E(29 + bx, 47 + by, 15, 9, 'rhino')
      for (const [x, y, w] of [
        [17, 41, 5],
        [25, 38.5, 5.5],
        [33, 38, 5.5],
        [41, 40, 5],
      ]) {
        s.P(
          [
            [x - w, y + 4],
            [x - w + 1, y - 2],
            [x + w - 1, y - 2.5],
            [x + w, y + 4],
          ].map(([a, b]) => [a + bx, b + by]),
          'ore'
        )
        s.line(
          [
            [x - w + 2 + bx, y - 1 + by],
            [x + w - 2 + bx, y - 1.5 + by],
          ],
          '#d0daea'
        )
        s.line(
          [
            [x - 1 + bx, y + 1 + by],
            [x + 1 + bx, y + 3 + by],
          ],
          '#c46a34'
        )
      }
      s.L(23 + bx, 53 + by, 23 + P.bl[0], 60 + P.bl[1], 3.8, 'rhino')
      s.L(37 + bx, 53 + by, 38 + P.fl[0], 60 + P.fl[1], 3.8, 'rhino')
      s.E(23 + bx + P.bl[0] * 0.5, 56 + by, 3.6, 1.4, 'ore')
      s.E(37.5 + bx + P.fl[0] * 0.5, 56 + by, 3.6, 1.4, 'ore')
      for (const x of [21, 23, 25]) s.d(x + P.bl[0], 62 + P.bl[1], '#f4ede0')
      for (const x of [36, 38, 40]) s.d(x + P.fl[0], 62 + P.fl[1], '#f4ede0')
      s.E(47 + hx, 45 + hy, 7, 6, 'rhino')
      s.P(
        [
          [49 + hx, 41 + hy],
          [60 + hx, 45 + hy],
          [59 + hx, 52 + hy],
          [49 + hx, 52 + hy],
        ],
        'rhino'
      )
      s.P(
        [
          [44 + hx, 41 + hy],
          [49 + hx, 38 + hy],
          [53 + hx, 41 + hy],
          [48 + hx, 43 + hy],
        ],
        'ore'
      )
      s.P(
        [
          [53 + hx, 43 + hy],
          [58 + hx, 27 + hy],
          [61 + hx, 44 + hy],
        ],
        'ore'
      )
      s.line(
        [
          [55 + hx, 41 + hy],
          [58 + hx, 29 + hy],
        ],
        '#d0daea'
      )
      s.P(
        [
          [49.5 + hx, 41.5 + hy],
          [51.5 + hx, 34 + hy],
          [54 + hx, 42 + hy],
        ],
        'ore'
      )
      s.spike(44 + hx, 40 + hy, 5, 1.6, 'rhino', -1.5)
      s.eye(50 + hx, 44 + hy, 'fierce')
      s.line(
        [
          [53 + hx, 50 + hy],
          [59 + hx, 50 + hy],
        ],
        '#2e2826'
      )
    },
    glows: [[58, 30, '#d0daea', 2]],
    emit: [],
    mouth: [60, 49],
  },
  mountturtle: {
    size: 80,
    rig: QUAD,
    aura: { type: 'dust', x: 38, y: 74, r: 30 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        m = (pts: Pt[]) => pts.map(([x, y]) => [x + bx, y + by])
      s.L(20 + bx, 64 + by, 20 + P.bf[0], 74 + P.bf[1], 4.4, 'tort2')
      s.L(52 + bx, 64 + by, 52 + P.ff[0], 74 + P.ff[1], 4.4, 'tort2')
      s.E(36 + bx, 58 + by, 23, 11, 'shellE')
      s.E(36 + bx, 65 + by, 23.5, 3.4, 'stone2')
      s.P(
        m([
          [14, 56],
          [22, 42],
          [26, 46],
          [36, 24],
          [44, 38],
          [49, 33],
          [59, 56],
        ]),
        'stone'
      )
      s.P(
        m([
          [32, 31.5],
          [36, 24],
          [40, 31],
          [38, 30],
          [36, 32],
          [34, 30],
        ]),
        'snow'
      )
      s.P(
        m([
          [47, 35.5],
          [49, 33],
          [51, 36],
          [49, 36.5],
        ]),
        'snow'
      )
      s.line(
        m([
          [36, 25],
          [33, 36],
          [30, 44],
        ]),
        '#4a4238'
      )
        .line(
          m([
            [44, 39],
            [40, 48],
          ]),
          '#4a4238'
        )
        .line(
          m([
            [24, 46],
            [22, 52],
          ]),
          '#4a4238'
        )
      for (const [x, y] of [
        [19, 52],
        [23, 50],
        [52, 50],
        [55, 53],
        [29, 50],
        [45, 47],
      ])
        s.P(
          m([
            [x - 2, y + 2],
            [x, y - 3],
            [x + 2, y + 2],
          ]),
          'canopy'
        )
      s.line(
        m([
          [41, 42],
          [41, 47],
          [42, 52],
        ]),
        '#a0dcff',
        '#ffffff'
      )
      s.L(25 + bx, 66 + by, 25 + P.bl[0], 75 + P.bl[1], 5, 'tort')
      s.L(48 + bx, 66 + by, 48 + P.fl[0], 75 + P.fl[1], 5, 'tort')
      for (const [x, l] of [
        [25, P.bl],
        [48, P.fl],
      ] as const)
        s.line(
          [
            [x - 4 + l[0], 70 + l[1]],
            [x + 4 + l[0], 70 + l[1]],
          ],
          '#5a4a30'
        )
      for (const x of [21, 25, 29]) s.d(x + P.bl[0], 78 + P.bl[1], '#f4ede0')
      for (const x of [44, 48, 52]) s.d(x + P.fl[0], 78 + P.fl[1], '#f4ede0')
      s.L(57 + bx, 62 + by, 65 + hx, 56 + hy, 5.2, 'tort', 4.4)
      s.E(68 + hx, 54 + hy, 7.4, 6, 'tort')
      s.P(
        [
          [71 + hx, 52 + hy],
          [77 + hx, 55 + hy],
          [72 + hx, 59 + hy],
        ],
        'stone2'
      )
      s.P(
        [
          [63 + hx, 49.5 + hy],
          [71 + hx, 49 + hy],
          [70 + hx, 51.5 + hy],
          [63 + hx, 52 + hy],
        ],
        'stone'
      )
      s.P(
        [
          [63 + hx, 58 + hy],
          [70 + hx, 58 + hy],
          [67 + hx, 64 + hy],
          [65 + hx, 61 + hy],
        ],
        'moss'
      )
      s.d(68 + hx, 52.5 + hy, '#fff0a0')
        .d(69 + hx, 52.5 + hy, '#ffa02a')
        .d(67 + hx, 52.5 + hy, '#1a140c')
    },
    glows: [[69, 53, '#ffa02a', 2]],
    emit: [],
    mouth: [76, 56],
  },
  crystalrhino: {
    size: 80,
    rig: QUAD,
    aura: { type: 'dust', x: 38, y: 74, r: 30 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by
      s.L(24 + bx, 64 + by, 23 + P.bf[0], 74 + P.bf[1], 4.4, 'rhino2')
      s.L(50 + bx, 64 + by, 51 + P.ff[0], 74 + P.ff[1], 4.4, 'rhino2')
      s.L(17 + bx, 56 + by, 11 + bx, 61 + by, 1.4, 'rhino')
      s.E(36 + bx, 58 + by, 20, 11, 'rhino')
      s.E(50 + bx, 53 + by, 9, 9.5, 'rhino')
      for (const [x, y, h, l] of [
        [22, 50, 8, -2],
        [28, 48, 12, -2],
        [34, 46.5, 15, -3],
        [40, 46, 11, -1],
        [46, 45, 13, -2],
        [31, 49, 7, 2],
      ]) {
        s.spike(x + bx, y + by, h, 2.4, 'topaz', l)
        s.line(
          [
            [x + bx, y - 1 + by],
            [x + l + bx, y - h + 2 + by],
          ],
          '#fff4cc'
        )
      }
      s.line(
        [
          [20 + bx, 58 + by],
          [27 + bx, 61 + by],
          [34 + bx, 58 + by],
          [42 + bx, 62 + by],
          [50 + bx, 58 + by],
        ],
        '#ffa02a',
        '#ffe4a0'
      )
      s.L(28 + bx, 65 + by, 28 + P.bl[0], 75 + P.bl[1], 4.8, 'rhino')
      s.L(47 + bx, 65 + by, 48 + P.fl[0], 75 + P.fl[1], 4.8, 'rhino')
      for (const x of [25, 28, 31]) s.d(x + P.bl[0], 78 + P.bl[1], '#f4ede0')
      for (const x of [45, 48, 51]) s.d(x + P.fl[0], 78 + P.fl[1], '#f4ede0')
      s.E(61 + hx, 54 + hy, 8.5, 7, 'rhino')
      s.P(
        [
          [63 + hx, 49 + hy],
          [77 + hx, 54 + hy],
          [76 + hx, 61 + hy],
          [63 + hx, 61 + hy],
        ],
        'rhino'
      )
      s.P(
        [
          [67 + hx, 51 + hy],
          [73 + hx, 27 + hy],
          [78 + hx, 53 + hy],
        ],
        'topaz'
      )
      s.line(
        [
          [70 + hx, 49 + hy],
          [73 + hx, 30 + hy],
        ],
        '#fff4cc'
      )
      s.P(
        [
          [63 + hx, 50 + hy],
          [65.5 + hx, 41 + hy],
          [68.5 + hx, 50.5 + hy],
        ],
        'topaz'
      )
      s.spike(56 + hx, 49 + hy, 6, 2, 'rhino', -2)
      s.eye(63 + hx, 53 + hy, 'fierce')
      s.line(
        [
          [67 + hx, 59 + hy],
          [76 + hx, 59 + hy],
        ],
        '#2e2826'
      )
    },
    glows: [
      [73, 32, '#ffc45a', 6],
      [34, 36, '#ffa02a', 5],
      [46, 36, '#ffa02a', 4],
    ],
    emit: [],
    mouth: [77, 58],
  },
  /* ----- Earth fused form (ธรณีผู้ตื่น): a crouching rock beast in charcoal scale tufts with amber stripes,
     a bone mask with one glowing eye, an amber belly, and a heavy tail curled up over its back ----- */
  efused: {
    size: 88,
    rig: QUAD,
    aura: { type: 'twine', x: 44, y: 82, r: 34 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 3.4
      // tail: rises from the rump, arcs up and over, tip pointing up
      const C = [
          [30, 64],
          [16, 60],
          [8, 48],
          [9, 34],
          [16, 22],
          [26, 14],
          [32, 5],
        ],
        tail = []
      for (let i = 0; i < C.length - 1; i++)
        for (let k = 0; k < 5; k++) {
          const u = k / 5
          tail.push([lerp(C[i][0], C[i + 1][0], u), lerp(C[i][1], C[i + 1][1], u)])
        }
      tail.push(C[C.length - 1])
      const n = tail.length,
        tp = tail.map(([x, y], i) => {
          const q = i / (n - 1)
          return [x + bx * (1 - q) + t * q * q * 1.6, y + by * (1 - q), 7 - q * 5.8]
        })
      tp.forEach(([x, y, r], i) => {
        if (i % 2 === 0 && i < n - 3) {
          const a = Math.atan2(y - 44, x - 26)
          s.E(
            x + Math.cos(a) * r * 0.8,
            y + Math.sin(a) * r * 0.8,
            r * 0.45 + 0.8,
            r * 0.45 + 0.8,
            'basalt'
          )
        }
      })
      tp.forEach(([x, y, r]) => s.E(x, y, r, r, 'basalt'))
      tp.forEach(([x, y, r], i) => {
        if (i % 3 === 1 && i < n - 2)
          s.line(
            [
              [x - r * 0.8, y - r * 0.3],
              [x + r * 0.4, y + r * 0.7],
            ],
            '#b86a2e',
            '#dc9050'
          )
        if (i % 2 === 0) s.d(x - r * 0.4, y - r * 0.5, '#55555c')
      })
      // far legs
      s.L(36 + bx, 72 + by, 34 + P.bf[0], 82 + P.bf[1], 4.2, 'basalt2')
      s.E(34 + P.bf[0], 84 + P.bf[1], 4.6, 1.8, 'amberB2')
      s.L(68 + bx, 70 + by, 70 + P.ff[0], 81 + P.ff[1], 4, 'basalt2')
      s.E(71 + P.ff[0], 83.5 + P.ff[1], 4.4, 1.8, 'amberB2')
      // body: low crouching barrel, round amber belly under the chest
      s.E(48 + bx, 65 + by, 24, 10, 'basalt')
      s.E(62 + bx, 61 + by, 10, 9, 'basalt')
      {
        const pts = []
        for (let i = 0; i <= 32; i++) {
          const a = (i / 32) * TAU,
            x = 52 + Math.cos(a) * 15,
            y = 70 + Math.sin(a) * 8
          pts.push([x + bx, Math.max(y, 66 + Math.abs(x - 52) * 0.04) + by])
        }
        s.P(pts, 'amberB')
      }
      s.line(
        [
          [40 + bx, 70 + by],
          [44 + bx, 75 + by],
          [52 + bx, 77 + by],
          [61 + bx, 75 + by],
        ],
        '#f8c08a'
      )
      // scale tufts: a ragged outline along the back and rows of tufts with amber stripes
      for (let i = 0; i < 12; i++) {
        const a = Math.PI * (1.02 + i * 0.085),
          x = 48 + Math.cos(a) * 24,
          y = 65 + Math.sin(a) * 10.5
        s.E(x + bx, y + by, 3, 2.6, 'basalt')
      }
      for (const [x, y] of [
        [57, 53],
        [63, 52.5],
        [68, 54],
        [71, 57],
      ])
        s.E(x + bx, y + by, 3.2, 2.8, 'basalt')
      for (let row = 0; row < 2; row++)
        for (let k = 0; k < 7; k++) {
          const x = 30 + k * 6.5 + (row % 2) * 3,
            y = 58 + row * 4 + Math.abs(k - 3) * 0.6
          s.line(
            [
              [x - 2 + bx, y + 1 + by],
              [x + bx, y + by],
              [x + 2 + bx, y + 1 + by],
            ],
            '#0c0c0e'
          )
          s.d(x + bx, y - 1 + by, '#55555c')
        }
      for (const [x, y] of [
        [30, 57],
        [42, 56],
        [54, 56],
        [64, 56],
        [26, 62],
        [36, 61],
      ])
        s.line(
          [
            [x + bx, y + by],
            [x + 5 + bx, y + 5 + by],
          ],
          '#b86a2e',
          '#dc9050'
        )
      // near legs: thick, scaled, tan claws
      s.L(30 + bx, 70 + by, 28 + P.bl[0], 82 + P.bl[1], 5, 'basalt')
      s.E(28 + P.bl[0], 84.5 + P.bl[1], 5.6, 2, 'amberB')
      s.L(66 + bx, 68 + by, 67 + P.fl[0], 82 + P.fl[1], 4.8, 'basalt')
      s.E(68 + P.fl[0], 84.5 + P.fl[1], 5.4, 2, 'amberB')
      for (const x of [24, 28, 32]) s.d(x + P.bl[0], 85 + P.bl[1], '#5a2a10')
      for (const x of [64, 68, 72]) s.d(x + P.fl[0], 85 + P.fl[1], '#5a2a10')
      s.line(
        [
          [26 + P.bl[0] * 0.5, 74],
          [30 + P.bl[0] * 0.5, 77],
        ],
        '#b86a2e'
      ).line(
        [
          [65 + P.fl[0] * 0.5, 74],
          [69 + P.fl[0] * 0.5, 77],
        ],
        '#b86a2e'
      )
      // head: short neck, long jaw, and the three-lobed bone mask with one glowing eye
      s.L(64 + bx, 61 + by, 72 + hx - 4, 61 + hy, 7, 'basalt', 7)
      s.E(74 + hx - 4, 62 + hy, 9, 8, 'basalt')
      s.P(
        [
          [76 + hx - 4, 58 + hy],
          [87 + hx - 4, 61 + hy],
          [86 + hx - 4, 66 + hy],
          [76 + hx - 4, 67 + hy],
        ],
        'basalt'
      )
      s.P(
        [
          [75 + hx - 4, 66 + hy],
          [86 + hx - 4, 66 + j + hy],
          [83 + hx - 4, 69.5 + j + hy],
          [75 + hx - 4, 69.5 + hy],
        ],
        'basalt2'
      )
      if (j > 1)
        s.P(
          [
            [77 + hx - 4, 66 + hy],
            [86 + hx - 4, 66 + hy],
            [83 + hx - 4, 66 + j + hy],
            [77 + hx - 4, 67 + j * 0.5 + hy],
          ],
          'maw'
        )
      for (const x of [78, 81, 84]) s.d(x + hx - 4, 66 + hy, '#fff4e0')
      if (j > 1) for (const x of [79, 82]) s.d(x + hx - 4, 65 + j + hy, '#fff4e0')
      s.d(87 + hx - 4, 62 + hy, '#0c0c0e')
      const mx = 73 + hx - 4,
        my = 58 + hy
      s.E(mx - 2, my - 8, 5, 7.5, 'maskb')
      s.E(mx + 8, my + 1, 7.5, 5, 'maskb')
      s.E(mx - 4, my + 7, 5.5, 5.5, 'maskb')
      s.E(mx, my, 5.6, 5.6, 'maskb')
      for (const [dx, dy, h, l] of [
        [-6, -12, 5, -2],
        [-2, -15, 6, 0],
        [2, -12, 5, 2],
        [13, -1, 4, 3],
        [-8, 11, 4, -3],
        [14, 4, 3, 3],
      ])
        s.spike(mx + dx, my + dy, h, 1.5, 'maskb', l)
      s.line(
        [
          [mx, my - 4],
          [mx - 2, my - 13],
        ],
        '#a8906a'
      )
        .line(
          [
            [mx + 4, my],
            [mx + 14, my + 1],
          ],
          '#a8906a'
        )
        .line(
          [
            [mx - 2, my + 4],
            [mx - 5, my + 11],
          ],
          '#a8906a'
        )
      s.line(
        [
          [mx - 5, my - 12],
          [mx - 6, my - 6],
        ],
        '#fff4e0'
      )
        .line(
          [
            [mx + 7, my - 3],
            [mx + 12, my - 2],
          ],
          '#fff4e0'
        )
        .line(
          [
            [mx - 7, my + 5],
            [mx - 7, my + 9],
          ],
          '#fff4e0'
        )
      s.E(mx + 0.5, my, 1.8, 3, 'ice')
      s.d(mx, my - 1, '#ffffff').d(mx, my - 2, '#ffffff')
      if (P.glow) glowMouth(s, 82 + hx, 66 + hy + j * 0.5)
    },
    glows: [
      [69.5, 58, '#7ee7ff', 7],
      [69.5, 58, '#ffffff', 2],
    ],
    emit: [
      { x: 50, y: 52, type: 'grit', rate: 2 },
      { x: 70, y: 57, type: 'glint', rate: 1 },
      { x: 30, y: 6, type: 'ember', rate: 1.5 },
    ],
    mouth: [82, 66],
  },
  /* ----- Earth world boss (game: ต้นไม้โบราณ, reflects damage): an ancient pangolin of thorned stone scales ----- */
  pangolin: {
    size: 96,
    rig: QUAD,
    aura: { type: 'bosse', x: 46, y: 88, r: 36 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by
      // tail curling round the back, scaled
      const tail = []
      for (let i = 0; i <= 12; i++) {
        const q = i / 12,
          a = Math.PI * (0.55 + q * 1.1)
        tail.push([
          18 + Math.cos(a) * 12 * (1 - q * 0.5) + bx,
          70 + Math.sin(a) * 12 * (1 - q * 0.4) + by,
          8 - q * 5,
        ])
      }
      tail.forEach(([x, y, r]) => s.E(x, y, r, r, 'stone'))
      tail.forEach(([x, y, r], i) => {
        if (i % 2 === 0)
          s.line(
            [
              [x - r * 0.7, y],
              [x + r * 0.7, y + 1],
            ],
            '#3a342c'
          )
      })
      s.L(32 + bx, 78 + by, 31 + P.bf[0], 88 + P.bf[1], 5, 'tort2')
      s.E(32 + P.bf[0], 90 + P.bf[1], 5, 2, 'tort2')
      s.L(60 + bx, 78 + by, 62 + P.ff[0], 88 + P.ff[1], 4.5, 'tort2')
      s.E(63 + P.ff[0], 90 + P.ff[1], 5, 2, 'tort2')
      s.E(46 + bx, 66 + by, 27, 17, 'stone2')
      // neat rows of overlapping stone scales over the dome, each row tucked under the one above; thorns on the top row
      for (let row = 0; row < 5; row++) {
        const y = 50 + row * 5.5,
          half = 27 * Math.sqrt(Math.max(0, 1 - ((y + 3 - 66) / 17.5) ** 2)) - 3
        for (let x = 46 - half + (row % 2) * 4.5; x <= 46 + half; x += 9) {
          s.P(
            [
              [x - 4.6, y],
              [x + 4.6, y],
              [x + 4.6, y + 4],
              [x, y + 7],
              [x - 4.6, y + 4],
            ].map(([p, q]) => [p + bx, q + by]),
            row % 2 ? 'stone2' : 'stone'
          )
          s.line(
            [
              [x - 4 + bx, y + 4 + by],
              [x + bx, y + 7 + by],
              [x + 4 + bx, y + 4 + by],
            ],
            '#1a140c'
          )
          s.line(
            [
              [x - 3 + bx, y + 1 + by],
              [x + 2 + bx, y + 1 + by],
            ],
            row % 2 ? '#9a8e7c' : '#c8bca6'
          )
          if (row === 0) s.spike(x + bx, y + 1 + by, 7, 1.8, 'stone', -2)
        }
      }
      for (const [x, y] of [
        [33, 55],
        [52, 52],
        [42, 60],
      ])
        s.E(x + bx, y + by, 2.6, 1.2, 'moss')
      s.L(38 + bx, 80 + by, 37 + P.bl[0], 89 + P.bl[1], 6, 'tort')
      s.E(38 + P.bl[0], 91 + P.bl[1], 6.5, 2.4, 'tort')
      s.L(66 + bx, 78 + by, 68 + P.fl[0], 89 + P.fl[1], 5.5, 'tort')
      s.E(70 + P.fl[0], 91 + P.fl[1], 6, 2.4, 'tort')
      for (const x of [41, 44])
        s.L(x + P.bl[0], 91 + P.bl[1], x + 3 + P.bl[0], 93 + P.bl[1], 0.7, 'bone')
      for (const x of [73, 76])
        s.L(x + P.fl[0], 91 + P.fl[1], x + 3 + P.fl[0], 93 + P.fl[1], 0.7, 'bone')
      s.L(66 + bx, 70 + by, 76 + hx, 73 + hy, 7, 'tort', 5.5)
      s.E(78 + hx, 73 + hy, 6, 5, 'tort')
      s.P(
        [
          [80 + hx, 70 + hy],
          [93 + hx, 76 + hy],
          [92 + hx, 78.5 + hy],
          [80 + hx, 78 + hy],
        ],
        'tort'
      )
      s.E(75 + hx, 69 + hy, 1.8, 1.6, 'tort2')
      for (const [x, y] of [
        [70, 66],
        [75, 65.5],
        [80, 67],
      ])
        s.P(
          [
            [x - 3.5 + hx, y + 2 + hy],
            [x - 1 + hx, y - 3 + hy],
            [x + 3.5 + hx, y + 2 + hy],
          ],
          'stone'
        )
      s.d(81 + hx, 73 + hy, '#fff6b0')
        .d(82 + hx, 73 + hy, '#ffa02a')
        .d(80 + hx, 72 + hy, '#1a140c')
        .d(81 + hx, 72 + hy, '#1a140c')
        .d(82 + hx, 72 + hy, '#1a140c')
      s.d(93 + hx, 78 + hy, '#1a140c')
    },
    glows: [[82, 73, '#ffa02a', 4]],
    emit: [],
    mouth: [92, 78],
  },
}
