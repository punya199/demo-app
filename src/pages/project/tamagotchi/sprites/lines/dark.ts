import type { Pt } from '../engine/spr'
import { BLOB, FLY, QUAD } from '../engine/rigs'
import { jLeg, memWing, shEye, spiderEyes, starDots } from '../engine/shapes'
import type { ISpriteDef } from '../sprite-types'

// Dark line: the 11 forms, the awakened fused form and the world boss (darksoul).
// Ported from the prototype (docs/tamagotchi/prototypes/monster-arena/js/sprites).
export const DARK_SPRITES: Record<string, ISpriteDef> = {
  /* ----- Dark line (still drafts for the owner to choose from): bats and spiders ----- */
  degg: {
    size: 48,
    rig: BLOB,
    draw(s, P) {
      const bx = P.body[0] * 0.6,
        by = P.body[1] * 0.3,
        m = (pts: Pt[]) => pts.map(([x, y]) => [x + bx, y + by])
      s.P(
        m([
          [16, 27],
          [9, 22],
          [11, 26],
          [7, 28],
          [12, 30],
          [16, 31],
        ]),
        'batw'
      )
      s.P(
        m([
          [32, 27],
          [39, 22],
          [37, 26],
          [41, 28],
          [36, 30],
          [32, 31],
        ]),
        'batw'
      )
      s.E(24 + bx, 31 + by, 9, 12, 'night')
      s.E(20 + bx, 26 + by, 3.4, 3.4, 'moon')
      s.E(21.6 + bx, 25 + by, 3, 3, 'night')
      s.line(
        m([
          [24, 33],
          [26, 35],
          [24, 37],
          [27, 39],
          [25, 41],
        ]),
        '#ff3a4a',
        '#ffb0b0'
      )
      starDots(
        s,
        m([
          [28, 25, 1],
          [30, 30, 0],
          [19, 36, 0],
          [29, 37, 0],
        ])
      )
    },
    glows: [
      [26, 37, '#ff3a4a', 5],
      [20, 26, '#c8c4ff', 4],
    ],
    emit: [],
    mouth: [24, 28],
  },
  mote: {
    size: 48,
    rig: BLOB,
    hover: 5,
    draw(s, P) {
      const [bx, by] = P.body,
        cx = 24 + bx,
        cy = 33 + by
      s.P(
        [
          [cx - 5, cy + 2],
          [cx - 10, cy + 8],
          [cx - 15, cy + 7],
          [cx - 11, cy + 5],
          [cx - 6, cy - 2],
        ],
        'night2'
      )
      s.E(cx, cy, 7, 6.2, 'night')
      for (const [dx, h, l] of [
        [-4, 6, -2],
        [0, 8, 0],
        [4, 6, 2],
      ])
        s.spike(cx + dx, cy - 4, h, 1.8, 'night', l)
      s.E(cx + 1, cy + 1, 3.6, 3, 'curse')
      s.d(cx - 3, cy - 1, '#ff3a4a')
        .d(cx - 2, cy - 1, '#ff8a8a')
        .d(cx + 3, cy - 1, '#ff3a4a')
        .d(cx + 4, cy - 1, '#ff8a8a')
      s.d(cx, cy + 3, '#1a0a24').d(cx + 1, cy + 3, '#1a0a24')
    },
    glows: [[24, 34, '#a04ae8', 11]],
    emit: [],
    mouth: [29, 35],
  },
  batling: {
    size: 48,
    rig: FLY,
    hover: 6,
    fly: true,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        w = -6 * P.wing,
        o = (pts: Pt[]) => pts.map(([x, y]) => [x + bx, y + by])
      memWing(
        s,
        [28 + bx, 31 + by],
        [34 + bx, 20 + by + w],
        o([
          [43, 17 + w],
          [45, 25 + w * 0.8],
          [41, 31 + w * 0.5],
        ]),
        [31 + bx, 35 + by],
        'batw2',
        'batw',
        'bat2'
      )
      s.L(24 + bx, 37 + by, 23 + P.bf[0], 42 + P.bf[1], 0.6, 'bat2')
      s.L(28 + bx, 37 + by, 29 + P.bl[0], 42 + P.bl[1], 0.6, 'bat2')
      s.E(26 + bx, 34 + by, 5.5, 5, 'bat')
      s.E(27 + bx, 36 + by, 3, 2.4, 'bat2')
      memWing(
        s,
        [24 + bx, 32 + by],
        [15 + bx, 20 + by + w],
        o([
          [4, 18 + w],
          [5, 27 + w * 0.7],
          [10, 34 + w * 0.4],
        ]),
        [21 + bx, 37 + by],
        'batw',
        'batw2',
        'bat2'
      )
      s.E(31 + hx, 29 + hy, 4.6, 4.1, 'bat')
      s.spike(29 + hx, 26 + hy, 6, 1.8, 'bat', -1.5)
      s.spike(33.5 + hx, 26 + hy, 6, 1.8, 'bat', 1.5)
      s.d(29 + hx, 23 + hy, '#c06a88').d(33.5 + hx, 23 + hy, '#c06a88')
      s.E(34 + hx, 31 + hy, 2.4, 1.8, 'bat')
      s.d(36 + hx, 30 + hy, '#1a0a14')
      s.d(30 + hx, 28 + hy, '#ffffff')
        .d(31 + hx, 28 + hy, '#ff3a4a')
        .d(30 + hx, 29 + hy, '#c8102a')
        .d(31 + hx, 29 + hy, '#c8102a')
      s.d(33 + hx, 33 + hy, '#ffffff').d(35 + hx, 33 + hy, '#ffffff')
    },
    glows: [],
    emit: [],
    mouth: [37, 31],
  },
  spider: {
    size: 56,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] * 0.6 + bx,
        hy = P.head[1] * 0.6 + by
      for (const [i, l] of [
        [0, P.bf],
        [1, P.ff],
        [2, P.bf],
        [3, P.ff],
      ] as const)
        jLeg(
          s,
          [27 + i * 2.5 + bx, 41 + by],
          [17 + i * 9 + bx, 31 + by],
          [12 + i * 11 + l[0], 50 + l[1]],
          1,
          'spid2'
        )
      s.E(17 + bx, 37 + by, 11, 9, 'spid')
      for (const [x, y, l] of [
        [10, 30, -2],
        [15, 28, -1],
        [20, 28, 0],
        [25, 30, 1],
      ])
        s.spike(x + bx, y + by, 3, 1, 'spid', l)
      s.line(
        [
          [12 + bx, 36 + by],
          [15 + bx, 33 + by],
          [19 + bx, 32 + by],
          [22 + bx, 34 + by],
        ],
        '#c47aff'
      )
      s.line(
        [
          [13 + bx, 39 + by],
          [21 + bx, 39 + by],
        ],
        '#a04ae8'
      )
      s.d(17 + bx, 36 + by, '#ff3a4a')
        .d(18 + bx, 36 + by, '#ff3a4a')
        .d(17 + bx, 37 + by, '#c8102a')
      s.E(33 + bx, 41 + by, 7, 5.5, 'spid')
      s.E(40 + hx, 40 + hy, 4.6, 4, 'spid')
      s.L(42 + hx, 43 + hy, 43 + hx, 47 + hy + P.jaw, 0.8, 'bone', 0.4)
      s.L(44 + hx, 42 + hy, 46 + hx, 46 + hy + P.jaw, 0.8, 'bone', 0.4)
      for (const [i, l] of [
        [0, P.bl],
        [1, P.fl],
        [2, P.bl],
        [3, P.fl],
      ] as const)
        jLeg(
          s,
          [30 + i * 2.5 + bx, 44 + by],
          [[20, 30, 42, 50][i] + bx, [33, 31, 31, 34][i] + by],
          [[14, 26, 41, 52][i] + l[0], 52 + l[1]],
          1.2,
          'spid'
        )
      spiderEyes(s, 40 + hx, 39 + hy)
    },
    glows: [
      [17, 36, '#a04ae8', 6],
      [42, 39, '#ff3a4a', 3],
    ],
    emit: [],
    mouth: [46, 44],
  },
  rat: {
    size: 48,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail
      s.L(13 + bx, 39 + by, 7 + bx, 41 + by - t, 1, 'ratt', 0.8)
      s.L(7 + bx, 41 + by - t, 3 + bx, 36 + by - t * 1.5, 0.8, 'ratt', 0.5)
      s.E(17 + P.bf[0], 43 + P.bf[1], 1.8, 1.2, 'ratt')
      s.E(27 + P.ff[0], 43 + P.ff[1], 1.8, 1.2, 'ratt')
      s.E(21 + bx, 37 + by, 9, 6.2, 'ratg')
      s.E(22 + bx, 41 + by, 6, 2, 'ratg2')
      for (const [x, y] of [
        [16, 34],
        [22, 33],
        [19, 38],
      ])
        s.d(x + bx, y + by, '#3a5a2a').d(x + 1 + bx, y + by, '#5a7a3a')
      s.E(20 + P.bl[0], 44 + P.bl[1], 2, 1.2, 'ratt')
      s.E(29 + P.fl[0], 44 + P.fl[1], 2, 1.2, 'ratt')
      s.E(31 + hx, 34 + hy, 5, 4.4, 'ratg')
      s.P(
        [
          [33 + hx, 31 + hy],
          [41 + hx, 35 + hy],
          [34 + hx, 38 + hy],
        ],
        'ratg'
      )
      s.E(40.5 + hx, 35 + hy, 1.2, 1.2, 'ratt')
      s.E(28 + hx, 29 + hy, 3.2, 3.2, 'ratg')
      s.E(28.4 + hx, 29.4 + hy, 1.8, 1.8, 'ratt')
      s.eye(32 + hx, 33 + hy, 'sleepy')
      s.d(37 + hx, 37 + hy, '#ffffff').d(37 + hx, 38 + hy, '#e8e0c8')
      s.line(
        [
          [39 + hx, 36 + hy],
          [43 + hx, 35 + hy],
        ],
        '#2a2020'
      ).line(
        [
          [39 + hx, 37 + hy],
          [43 + hx, 38 + hy],
        ],
        '#2a2020'
      )
      s.d(34 + hx, 39 + hy, '#7ad35a').d(34 + hx, 40 + hy, '#5aa83a')
    },
    glows: [],
    emit: [{ x: 24, y: 28, type: 'zz', rate: 0.5 }],
    mouth: [41, 36],
  },
  vampbat: {
    size: 56,
    rig: FLY,
    hover: 7,
    fly: true,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        w = -8 * P.wing,
        o = (pts: Pt[]) => pts.map(([x, y]) => [x + bx, y + by])
      memWing(
        s,
        [32 + bx, 34 + by],
        [40 + bx, 20 + by + w],
        o([
          [51, 15 + w],
          [54, 24 + w * 0.8],
          [52, 32 + w * 0.6],
          [46, 37 + w * 0.3],
        ]),
        [35 + bx, 39 + by],
        'batw2',
        'crim2',
        'bat2'
      )
      s.L(28 + bx, 42 + by, 27 + P.bf[0], 49 + P.bf[1], 0.8, 'bat2')
      s.L(33 + bx, 42 + by, 34 + P.bl[0], 49 + P.bl[1], 0.8, 'bat2')
      s.E(30 + bx, 38 + by, 7, 6.5, 'bat')
      s.E(31 + bx, 41 + by, 4, 3, 'crim2')
      memWing(
        s,
        [27 + bx, 35 + by],
        [16 + bx, 19 + by + w],
        o([
          [3, 16 + w],
          [2, 26 + w * 0.75],
          [6, 35 + w * 0.5],
          [14, 41 + w * 0.3],
        ]),
        [25 + bx, 42 + by],
        'batw',
        'crim2',
        'bat2'
      )
      s.line(
        o([
          [16, 22],
          [10, 28],
          [8, 34],
        ]).map(([x, y]) => [x, y + w * 0.7]),
        '#ff3a4a'
      )
      s.E(36 + hx, 31 + hy, 5.6, 5, 'bat')
      s.spike(33 + hx, 27 + hy, 8, 2.2, 'bat', -2)
      s.spike(39 + hx, 27 + hy, 8, 2.2, 'bat', 2)
      s.d(33 + hx, 23 + hy, '#c06a88').d(39 + hx, 23 + hy, '#c06a88')
      s.E(40 + hx, 33.5 + hy, 3, 2.2, 'bat')
      s.d(42.5 + hx, 32.5 + hy, '#1a0a14')
      s.d(35 + hx, 30 + hy, '#ffd0d0')
        .d(36 + hx, 30 + hy, '#ff3a4a')
        .d(38 + hx, 30 + hy, '#ffd0d0')
        .d(39 + hx, 30 + hy, '#ff3a4a')
        .line(
          [
            [34 + hx, 29 + hy],
            [40 + hx, 29 + hy],
          ],
          '#0e080e'
        )
      s.d(38 + hx, 36 + hy, '#ffffff')
        .d(38 + hx, 37 + hy, '#ffffff')
        .d(41 + hx, 36 + hy, '#ffffff')
        .d(41 + hx, 37 + hy, '#ffffff')
        .d(41 + hx, 38 + hy, '#ff3a4a')
    },
    glows: [[37, 30, '#ff3a4a', 4]],
    emit: [],
    mouth: [43, 34],
  },
  eyespider: {
    size: 64,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] * 0.6 + bx,
        hy = P.head[1] * 0.6 + by
      for (const [i, l] of [
        [0, P.bf],
        [1, P.ff],
        [2, P.bf],
        [3, P.ff],
      ] as const)
        jLeg(
          s,
          [31 + i * 3 + bx, 46 + by],
          [19 + i * 11 + bx, 33 + by],
          [12 + i * 13 + l[0], 58 + l[1]],
          1.2,
          'spid2'
        )
      s.E(19 + bx, 41 + by, 14, 11, 'spid')
      for (let i = 0; i < 7; i++)
        s.spike(
          9 + i * 3.6 + bx,
          32 + Math.abs(i - 3) * 1.2 + by,
          4.5 - Math.abs(i - 3) * 0.5,
          1.2,
          'spid',
          (i - 3) * 0.7
        )
      s.P(
        [
          [15 + bx, 36 + by],
          [23 + bx, 36 + by],
          [19 + bx, 41 + by],
        ],
        'blood'
      )
      s.P(
        [
          [19 + bx, 41 + by],
          [15 + bx, 46 + by],
          [23 + bx, 46 + by],
        ],
        'blood'
      )
      s.E(37 + bx, 46 + by, 8.5, 6.5, 'spid')
      s.E(46 + hx, 44 + hy, 6, 5, 'spid')
      s.spike(43 + hx, 40 + hy, 5, 1.4, 'spid', -2)
      s.spike(48 + hx, 40 + hy, 5, 1.4, 'spid', 1.5)
      s.L(49 + hx, 48 + hy, 50 + hx, 53 + hy + P.jaw, 1, 'blood', 0.5)
      s.L(51 + hx, 47 + hy, 54 + hx, 52 + hy + P.jaw, 1, 'blood', 0.5)
      for (const [i, l] of [
        [0, P.bl],
        [1, P.fl],
        [2, P.bl],
        [3, P.fl],
      ] as const)
        jLeg(
          s,
          [34 + i * 3 + bx, 49 + by],
          [[22, 34, 50, 58][i] + bx, [36, 33, 33, 37][i] + by],
          [[15, 30, 48, 61][i] + l[0], 60 + l[1]],
          1.5,
          'spid'
        )
      spiderEyes(s, 45 + hx, 43 + hy, 1.4)
    },
    glows: [
      [19, 41, '#ff3a4a', 6],
      [48, 42, '#ff3a4a', 5],
    ],
    emit: [],
    mouth: [54, 50],
  },
  zrat: {
    size: 56,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] * 0.6 + bx,
        hy = P.head[1] * 0.6 + by + 2,
        t = P.tail
      s.L(14 + bx, 45 + by, 6 + bx, 47 + by - t, 1.2, 'ratt', 0.9)
      s.L(6 + bx, 47 + by - t, 3 + bx, 41 + by - t * 1.4, 0.9, 'ratt', 0.5)
      s.E(7 + bx, 46 + by - t, 1.6, 1.6, 'bone')
      s.E(18 + P.bf[0], 50 + P.bf[1], 2.2, 1.3, 'rotg2')
      s.E(32 + P.ff[0], 50 + P.ff[1], 2.2, 1.3, 'rotg2')
      s.E(24 + bx, 43 + by, 12, 7.5, 'rotg')
      s.E(25 + bx, 47 + by, 8, 2.4, 'rotg2')
      for (const x of [21, 24, 27])
        s.line(
          [
            [x + bx, 41 + by],
            [x + bx, 46 + by],
          ],
          '#d6ccbb'
        )
      s.line(
        [
          [14 + bx, 39 + by],
          [20 + bx, 37 + by],
        ],
        '#2a1a1a'
      )
      for (const x of [15, 17, 19])
        s.d(x + bx, 37.5 + by, '#2a1a1a').d(x + bx, 39.5 + by, '#2a1a1a')
      s.E(21 + P.bl[0], 51 + P.bl[1], 2.4, 1.3, 'rotg')
      s.E(34 + P.fl[0], 51 + P.fl[1], 2.4, 1.3, 'rotg')
      s.E(37 + hx, 42 + hy, 6, 5, 'rotg')
      s.P(
        [
          [39 + hx, 39 + hy],
          [48 + hx, 44 + hy],
          [40 + hx, 46 + hy],
        ],
        'rotg'
      )
      s.E(47.5 + hx, 44 + hy, 1.3, 1.3, 'ratt')
      s.E(33 + hx, 36 + hy, 3.4, 3, 'rotg')
      s.E(33.4 + hx, 36.6 + hy, 1.8, 1.6, 'ratt')
      s.E(34 + hx, 35 + hy, 0.9, 0.9, 0)
      s.d(37 + hx, 40 + hy, '#2a1a1a')
        .d(38 + hx, 41 + hy, '#2a1a1a')
        .d(38 + hx, 40 + hy, '#2a1a1a')
        .d(37 + hx, 41 + hy, '#2a1a1a')
      s.d(41 + hx, 41 + hy, '#e8e0a0')
        .d(42 + hx, 41 + hy, '#1a1a10')
        .line(
          [
            [40 + hx, 40 + hy],
            [43 + hx, 40.5 + hy],
          ],
          '#2a1a1a'
        )
      s.d(44 + hx, 46 + hy, '#e06a7a')
        .d(44 + hx, 47 + hy, '#c04a5a')
        .d(42 + hx, 45 + hy, '#ffffff')
    },
    glows: [[41, 41, '#c8f07a', 2]],
    emit: [{ x: 30, y: 30, type: 'zz', rate: 0.5 }],
    mouth: [48, 45],
  },
  batlord: {
    size: 64,
    rig: FLY,
    hover: 8,
    fly: true,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        w = -9 * P.wing,
        o = (pts: Pt[]) => pts.map(([x, y]) => [x + bx, y + by])
      memWing(
        s,
        [36 + bx, 38 + by],
        [45 + bx, 20 + by + w],
        o([
          [58, 14 + w],
          [62, 24 + w * 0.8],
          [60, 33 + w * 0.6],
          [54, 40 + w * 0.3],
        ]),
        [39 + bx, 44 + by],
        'batw2',
        'night2',
        'night'
      )
      s.L(31 + bx, 49 + by, 30 + P.bf[0], 57 + P.bf[1], 1, 'night')
      s.L(37 + bx, 49 + by, 38 + P.bl[0], 57 + P.bl[1], 1, 'night')
      for (const [x, l] of [
        [30, P.bf],
        [38, P.bl],
      ] as const) {
        s.L(x + l[0], 57 + l[1], x - 2 + l[0], 59 + l[1], 0.5, 'bone')
        s.L(x + l[0], 57 + l[1], x + 2 + l[0], 59 + l[1], 0.5, 'bone')
      }
      s.E(33 + bx, 43 + by, 8.5, 8, 'night')
      s.E(35 + bx, 47 + by, 5, 3.5, 'curse')
      for (const [x, y, l] of [
        [30, 35, -2],
        [34, 34, 0],
        [38, 35, 2],
      ])
        s.spike(x + bx, y + by, 4, 1.6, 'night', l)
      memWing(
        s,
        [30 + bx, 39 + by],
        [18 + bx, 19 + by + w],
        o([
          [3, 14 + w],
          [1, 25 + w * 0.8],
          [4, 35 + w * 0.55],
          [12, 44 + w * 0.3],
        ]),
        [28 + bx, 47 + by],
        'batw',
        'night',
        'night'
      )
      s.E(41 + hx, 34 + hy, 6.2, 5.6, 'night')
      s.L(37 + hx, 30 + hy, 33 + hx, 22 + hy, 1.4, 'horn', 0.6)
      s.L(44 + hx, 30 + hy, 47 + hx, 22 + hy, 1.4, 'horn', 0.6)
      s.spike(37 + hx, 31 + hy, 7, 2, 'night', -3)
      s.spike(45 + hx, 31 + hy, 7, 2, 'night', 3)
      s.E(46 + hx, 36.5 + hy, 3.2, 2.4, 'night')
      s.d(49 + hx, 35.5 + hy, '#0a0612')
      s.d(39 + hx, 33 + hy, '#ffd0d0')
        .d(40 + hx, 33 + hy, '#ff3a4a')
        .d(43 + hx, 33 + hy, '#ffd0d0')
        .d(44 + hx, 33 + hy, '#ff3a4a')
        .line(
          [
            [38 + hx, 32 + hy],
            [45 + hx, 32 + hy],
          ],
          '#0a0612'
        )
      s.d(43 + hx, 39 + hy, '#ffffff')
        .d(43 + hx, 40 + hy, '#ffffff')
        .d(46 + hx, 39 + hy, '#ffffff')
        .d(46 + hx, 40 + hy, '#ffffff')
    },
    glows: [
      [41, 33, '#ff3a4a', 4],
      [35, 47, '#a04ae8', 5],
    ],
    emit: [],
    mouth: [50, 37],
  },
  spiderqueen: {
    size: 80,
    rig: QUAD,
    aura: { type: 'nightm', x: 40, y: 74, r: 32 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] * 0.7 + bx,
        hy = P.head[1] * 0.7 + by
      for (const [i, l] of [
        [0, P.bf],
        [1, P.ff],
        [2, P.bf],
        [3, P.ff],
      ] as const)
        jLeg(
          s,
          [38 + i * 3 + bx, 58 + by],
          [22 + i * 14 + bx, 40 + by],
          [12 + i * 17 + l[0], 74 + l[1]],
          1.5,
          'spid2'
        )
      s.E(23 + bx, 50 + by, 18, 15, 'starsky')
      s.E(16 + bx, 44 + by, 4.6, 4.6, 'moon')
      s.E(18.4 + bx, 42.6 + by, 4, 4, 'starsky')
      starDots(
        s,
        [
          [26, 41, 1],
          [32, 48, 1],
          [12, 54, 0],
          [20, 58, 1],
          [30, 56, 0],
          [24, 47, 0],
          [35, 52, 0],
          [9, 48, 0],
        ].map(([x, y, b]) => [x + bx, y + by, b])
      )
      s.line(
        [
          [8 + bx, 52 + by],
          [16 + bx, 50 + by],
          [24 + bx, 52 + by],
          [34 + bx, 49 + by],
        ],
        '#4a5aa8'
      )
      for (const [i, l] of [
        [0, P.bl],
        [1, P.fl],
        [2, P.bl],
        [3, P.fl],
      ] as const)
        jLeg(
          s,
          [42 + i * 3.5 + bx, 61 + by],
          [[26, 40, 60, 70][i] + bx, [44, 40, 40, 46][i] + by],
          [[18, 36, 60, 76][i] + l[0], 76 + l[1]],
          1.9,
          'spid'
        )
      s.E(46 + bx, 58 + by, 10, 8, 'spid')
      s.E(56 + hx, 55 + hy, 7, 6, 'spid')
      for (const [dx, h, l] of [
        [-4, 9, -3],
        [-1, 12, -1],
        [2, 12, 1],
        [5, 9, 3],
      ])
        s.spike(56 + dx + hx, 50 + hy, h, 1.6, 'night', l)
      s.d(55 + hx, 41 + hy, '#c47aff').d(58 + hx, 41 + hy, '#c47aff')
      s.L(60 + hx, 60 + hy, 61 + hx, 66 + hy + P.jaw * 1.5, 1.2, 'curse', 0.5)
      s.L(62 + hx, 59 + hy, 66 + hx, 64 + hy + P.jaw * 1.5, 1.2, 'curse', 0.5)
      for (const [i, l] of [
        [1, P.fl],
        [2, P.bl],
      ] as const)
        s.d([36, 60][i - 1] + l[0], 75 + l[1], '#c47aff')
      spiderEyes(s, 55 + hx, 54 + hy, 1.6)
    },
    glows: [
      [16, 44, '#c8c4ff', 6],
      [56, 42, '#c47aff', 4],
      [58, 53, '#ff3a4a', 5],
    ],
    emit: [{ x: 22, y: 46, type: 'glint', rate: 1.5 }],
    mouth: [66, 62],
  },
  batemperor: {
    size: 80,
    rig: FLY,
    hover: 9,
    fly: true,
    aura: { type: 'nightm', x: 40, y: 76, r: 30 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        w = -11 * P.wing,
        o = (pts: Pt[]) => pts.map(([x, y]) => [x + bx, y + by])
      memWing(
        s,
        [44 + bx, 46 + by],
        [56 + bx, 24 + by + w],
        o([
          [72, 16 + w],
          [77, 30 + w * 0.8],
          [75, 42 + w * 0.6],
          [67, 51 + w * 0.3],
        ]),
        [48 + bx, 54 + by],
        'batw2',
        'crim2',
        'bat2',
        3
      )
      s.L(38 + bx, 61 + by, 37 + P.bf[0], 71 + P.bf[1], 1.2, 'bat2')
      s.L(46 + bx, 61 + by, 47 + P.bl[0], 71 + P.bl[1], 1.2, 'bat2')
      for (const [x, l] of [
        [37, P.bf],
        [47, P.bl],
      ] as const) {
        s.L(x + l[0], 71 + l[1], x - 3 + l[0], 74 + l[1], 0.6, 'bone')
        s.L(x + l[0], 71 + l[1], x + 3 + l[0], 74 + l[1], 0.6, 'bone')
      }
      s.E(41 + bx, 52 + by, 11, 10.5, 'bat')
      // skull breastplate
      s.E(43 + bx, 54 + by, 5.4, 5, 'bone')
      s.E(43 + bx, 59 + by, 3.4, 1.8, 'bone')
      s.E(41 + bx, 53.5 + by, 1.4, 1.6, 'maw')
      s.E(45 + bx, 53.5 + by, 1.4, 1.6, 'maw')
      s.d(41 + bx, 53 + by, '#ff3a4a').d(45 + bx, 53 + by, '#ff3a4a')
      for (const x of [41, 43, 45]) s.d(x + bx, 59 + by, '#4a4038')
      memWing(
        s,
        [37 + bx, 47 + by],
        [22 + bx, 22 + by + w],
        o([
          [4, 14 + w],
          [1, 28 + w * 0.8],
          [4, 42 + w * 0.55],
          [14, 54 + w * 0.3],
        ]),
        [34 + bx, 57 + by],
        'batw',
        'crim2',
        'bat2',
        3
      )
      s.line(
        o([
          [22, 26],
          [12, 34],
          [9, 44],
        ]).map(([x, y]) => [x, y + w * 0.7]),
        '#ff3a4a'
      )
      s.E(49 + hx, 40 + hy, 7.4, 6.8, 'bat')
      for (const [x, y, l, h] of [
        [44, 35, -4, 11],
        [48, 34, -1, 9],
        [52, 34, 1, 9],
        [55, 35, 4, 11],
      ])
        s.spike(x + hx, y + hy, h, 1.6, 'horn', l)
      s.spike(44 + hx, 37 + hy, 9, 2.6, 'bat', -4)
      s.spike(55 + hx, 37 + hy, 9, 2.6, 'bat', 4)
      s.E(55 + hx, 43 + hy, 4, 3, 'bat')
      s.d(58.5 + hx, 42 + hy, '#0e080e')
      s.d(46 + hx, 39 + hy, '#ffd0d0')
        .d(47 + hx, 39 + hy, '#ff3a4a')
        .d(51 + hx, 39 + hy, '#ffd0d0')
        .d(52 + hx, 39 + hy, '#ff3a4a')
        .line(
          [
            [45 + hx, 38 + hy],
            [53 + hx, 38 + hy],
          ],
          '#0e080e'
        )
      s.d(52 + hx, 46 + hy, '#ffffff')
        .d(52 + hx, 47 + hy, '#ffffff')
        .d(55 + hx, 46 + hy, '#ffffff')
        .d(55 + hx, 47 + hy, '#ffffff')
        .d(55 + hx, 48 + hy, '#ff3a4a')
    },
    glows: [
      [49, 39, '#ff3a4a', 5],
      [43, 54, '#ff3a4a', 4],
    ],
    emit: [],
    mouth: [59, 44],
  },
  /* ----- Dark fused form (รัตติกาลผู้ตื่น): the night-sky spider queen awakened, black-gold armour, twin rings ----- */
  dfused: {
    size: 88,
    rig: QUAD,
    aura: { type: 'twind', x: 44, y: 82, r: 34 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] * 0.7 + bx,
        hy = P.head[1] * 0.7 + by
      for (const [i, l] of [
        [0, P.bf],
        [1, P.ff],
        [2, P.bf],
        [3, P.ff],
      ] as const)
        jLeg(
          s,
          [42 + i * 3 + bx, 64 + by],
          [24 + i * 15 + bx, 44 + by],
          [13 + i * 19 + l[0], 82 + l[1]],
          1.7,
          'spid2'
        )
      s.E(25 + bx, 54 + by, 20, 17, 'starsky')
      for (let i = 0; i < 26; i++) {
        const an = i * 0.55,
          r = 2 + i * 0.55
        s.d(
          25 + bx + Math.cos(an) * r,
          54 + by + Math.sin(an) * r * 0.8,
          i % 3 ? '#8a6ae8' : '#d8c8ff'
        )
      }
      starDots(
        s,
        [
          [14, 46, 1],
          [36, 47, 1],
          [12, 60, 0],
          [22, 66, 1],
          [36, 62, 0],
          [30, 44, 0],
          [8, 53, 0],
        ].map(([x, y, b]) => [x + bx, y + by, b])
      )
      s.P(
        [
          [30 + bx, 38 + by],
          [40 + bx, 40 + by],
          [44 + bx, 48 + by],
          [38 + bx, 46 + by],
        ],
        'gold'
      )
      s.d(37 + bx, 42 + by, '#ff3a4a')
      for (const [i, l] of [
        [0, P.bl],
        [1, P.fl],
        [2, P.bl],
        [3, P.fl],
      ] as const) {
        const kn = [
            [28, 48],
            [44, 43],
            [66, 43],
            [78, 50],
          ][i],
          f = [[19, 40, 66, 84][i] + l[0], 84 + l[1]]
        jLeg(s, [46 + i * 4 + bx, 67 + by], [kn[0] + bx, kn[1] + by], f, 2.1, 'spid')
        s.E(kn[0] + bx, kn[1] + by, 2.4, 2, 'gold')
      }
      s.E(51 + bx, 64 + by, 11, 9, 'spid')
      s.P(
        [
          [44 + bx, 58 + by],
          [56 + bx, 57 + by],
          [60 + bx, 62 + by],
          [46 + bx, 63 + by],
        ],
        'gold'
      )
      s.line(
        [
          [46 + bx, 59 + by],
          [56 + bx, 58.5 + by],
        ],
        '#fff0a0'
      )
      s.E(62 + hx, 60 + hy, 7.6, 6.6, 'spid')
      s.P(
        [
          [55 + hx, 54 + hy],
          [58 + hx, 44 + hy],
          [61 + hx, 52 + hy],
          [64 + hx, 41 + hy],
          [67 + hx, 52 + hy],
          [70 + hx, 45 + hy],
          [70 + hx, 56 + hy],
        ],
        'gold'
      )
      s.E(64 + hx, 49 + hy, 3, 3, 'moon')
      s.E(65.4 + hx, 48 + hy, 2.6, 2.6, 'gold')
      s.L(67 + hx, 66 + hy, 68 + hx, 73 + hy + P.jaw * 1.5, 1.3, 'gold', 0.5)
      s.L(69 + hx, 65 + hy, 73 + hx, 71 + hy + P.jaw * 1.5, 1.3, 'gold', 0.5)
      spiderEyes(s, 61 + hx, 59 + hy, 1.7)
    },
    glows: [
      [25, 54, '#a04ae8', 9],
      [64, 49, '#c8c4ff', 5],
      [63, 58, '#ff3a4a', 5],
    ],
    emit: [{ x: 25, y: 50, type: 'glint', rate: 2 }],
    mouth: [73, 68],
  },
  /* ----- Dark world boss (game: จอมราตรี, a moon emoji): a giant spirit hanging in front of a black eclipse ----- */
  darksoul: {
    size: 96,
    rig: BLOB,
    hover: 6,
    aura: { type: 'bossd', x: 48, y: 92, r: 36 },
    draw(s, P) {
      const [bx, by] = P.body,
        j = P.jaw,
        g = P.glow
      // eclipse behind the head: a black disc with a burning gold rim
      s.E(50 + bx, 28 + by, 21, 21, 'eclipse')
      s.E(50 + bx, 28 + by, 18, 18, 'void')
      // a great ball of drifting smoke: no arms, no legs, only loose puffs of it curling off the edge
      for (const [x, y, r] of [
        [20, 58, 7],
        [76, 56, 7],
        [24, 72, 6],
        [72, 70, 6],
        [34, 80, 6],
        [62, 80, 6],
        [48, 84, 7],
        [14, 46, 4],
        [84, 44, 4],
      ])
        s.E(x + bx + Math.sin(y) * P.glow, y + by, r, r * 0.85, 'soul2')
      s.E(48 + bx, 58 + by, 31, 28, 'soul')
      s.E(46 + bx, 52 + by, 23, 19, 'soulm')
      for (const [x, y, r] of [
        [28, 44, 6],
        [68, 46, 6],
        [30, 70, 6],
        [66, 72, 6],
      ])
        s.E(x + bx, y + by, r, r * 0.8, 'soul')
      s.E(48 + bx, 62 + by, 14, 11, 'soulc')
      // crown: five tines of cold fire
      for (const [x, h, l] of [
        [34, 9, -3],
        [41, 12, -1],
        [48, 14, 0],
        [55, 12, 1],
        [62, 9, 3],
      ])
        s.spike(x + bx, 34 + by, h, 2, 'soulc', l)
      // hollow eyes burning amber like the eclipse, and a wide mouth
      for (const x of [38, 60]) {
        s.E(x + bx, 50 + by, 6, 7.4, 'void')
        s.E(x + 1 + bx, 50 + by, 2.4, 3.2, 'eclipse')
        s.d(x + bx, 49 + by, '#ffffff').d(x + 1 + bx, 49 + by, '#fff6c8')
      }
      s.E(49 + bx, 66 + by, 9 + j * 3, 3 + j * 4, 'void')
      for (const x of [43, 46, 49, 52, 55]) s.d(x + bx, 64 + by, '#f0e8ff')
      if (j > 0.5) for (const x of [44, 48, 52]) s.d(x + bx, 70 + j * 2 + by, '#f0e8ff')
      // small faces drifting on the body: the souls it keeps
      for (const [x, y] of [
        [26, 62],
        [72, 64],
        [34, 36],
      ]) {
        s.d(x + bx, y + by, '#1a0a2a')
          .d(x + 3 + bx, y + by, '#1a0a2a')
          .d(x + 1 + bx, y + 3 + by, '#1a0a2a')
          .d(x + 2 + bx, y + 3 + by, '#1a0a2a')
      }
      if (g) s.E(49 + bx, 62 + by, 18, 14, 'soulc')
    },
    glows: [
      [50, 28, '#ffb02a', 12],
      [39, 50, '#ffb02a', 4],
      [61, 50, '#ffb02a', 4],
      [48, 62, '#a04ae8', 12],
    ],
    emit: [
      { x: 48, y: 8, type: 'ember', rate: 1.5 },
      { x: 48, y: 82, type: 'smoke', rate: 3 },
      { x: 24, y: 70, type: 'glint', rate: 1.5 },
    ],
    mouth: [64, 66],
  },
  segg: {
    size: 48,
    rig: BLOB,
    draw(s, P) {
      const bx = P.body[0] * 0.6,
        by = P.body[1] * 0.3,
        m = (pts: Pt[]) => pts.map(([x, y]) => [x + bx, y + by])
      s.E(24 + bx, 42 + by, 15, 3.4, 'shdw')
      s.E(24 + bx, 40 + by, 10, 2.4, 'shdw')
      s.E(24 + bx, 28 + by, 10.5, 13.5, 'shd')
      s.E(21 + bx, 22 + by, 4.6, 4.6, 'shdl')
      s.E(23.2 + bx, 20.8 + by, 4, 4, 'shd')
      shEye(s, 25 + bx, 28 + by, 'n')
      shEye(s, 28 + bx, 29 + by, 'n')
      s.line(
        m([
          [24, 40],
          [26, 37],
          [24, 35],
          [27, 32],
        ]),
        '#b04aff',
        '#f0d8ff'
      )
      for (const [x, y] of [
        [17, 33],
        [30, 24],
        [18, 38],
        [31, 36],
      ])
        s.d(x + bx, y + by, '#8c82a8')
      s.line(
        m([
          [12, 39],
          [8, 36],
          [6, 38],
        ]),
        '#403a5c'
      ).line(
        m([
          [36, 40],
          [41, 37],
          [43, 39],
        ]),
        '#403a5c'
      )
    },
    glows: [
      [26, 36, '#b04aff', 5],
      [26, 28, '#d08aff', 4],
    ],
    emit: [],
    mouth: [24, 28],
  },
  shyghost: {
    size: 48,
    rig: BLOB,
    hover: 4,
    draw(s, P) {
      const [bx, by] = P.body,
        cx = 24 + bx,
        cy = 28 + by
      s.P(
        [
          [cx + 5, cy + 8],
          [cx + 14, cy + 14],
          [cx + 19, cy + 12],
          [cx + 13, cy + 9],
          [cx + 8, cy + 4],
        ],
        'ghost'
      )
      s.E(cx, cy, 10.5, 11, 'ghost')
      s.P(
        [
          [cx - 10, cy + 4],
          [cx - 11, cy + 14],
          [cx - 7, cy + 11],
          [cx - 3.5, cy + 15],
          [cx, cy + 11],
          [cx + 3.5, cy + 15],
          [cx + 7, cy + 11],
          [cx + 10.5, cy + 14],
          [cx + 10, cy + 4],
        ],
        'ghost'
      )
      for (const ex of [-4, 4]) {
        s.E(cx + ex, cy - 3, 2.3, 2.7, 'shd')
        s.d(cx + ex + 1, cy - 4, '#f0d8ff')
          .d(cx + ex + 1, cy - 3, '#b04aff')
          .d(cx + ex + 2, cy - 3, '#b04aff')
      }
      s.E(cx - 2.5, cy + 4.5, 2.4, 2, 'shdl')
      s.E(cx + 2.5, cy + 4.5, 2.4, 2, 'shdl')
      s.d(cx - 3, cy + 3, '#8c82a8').d(cx + 2, cy + 3, '#8c82a8')
      s.d(cx - 8, cy, '#ff9ab4')
        .d(cx - 7, cy, '#ff9ab4')
        .d(cx + 8, cy, '#ff9ab4')
        .d(cx + 7, cy, '#ff9ab4')
      s.spike(cx - 5, cy - 9, 4, 1.4, 'ghost', -1)
      s.spike(cx + 3, cy - 10, 4, 1.4, 'ghost', 1)
    },
    glows: [[27, 24, '#b04aff', 3]],
    emit: [],
    mouth: [30, 33],
  },
  mistblob: {
    size: 64,
    rig: BLOB,
    hover: 3,
    draw(s, P) {
      const [bx, by] = P.body,
        cx = 32 + bx,
        cy = 38 + by
      s.E(cx, cy + 15, 24, 4, 'mist')
      s.E(cx + 6, cy + 17, 15, 2.6, 'mist')
      s.E(cx, cy + 4, 21, 14, 'mist')
      for (const [x, y, r] of [
        [-16, -3, 8],
        [-8, -11, 9],
        [4, -13, 10],
        [15, -6, 9],
        [18, 4, 8],
        [-19, 7, 7],
      ])
        s.E(cx + x, cy + y, r, r * 0.85, 'mist')
      s.P(
        [
          [cx - 20, cy + 8],
          [cx - 22, cy + 18],
          [cx - 15, cy + 13],
          [cx - 10, cy + 19],
          [cx - 4, cy + 13],
          [cx + 2, cy + 20],
          [cx + 9, cy + 13],
          [cx + 15, cy + 19],
          [cx + 20, cy + 9],
        ],
        'mist'
      )
      s.line(
        [
          [cx - 11, cy - 4],
          [cx - 7, cy - 2.4],
          [cx - 3, cy - 4],
        ],
        '#1a2038'
      )
      s.line(
        [
          [cx + 3, cy - 4],
          [cx + 7, cy - 2.4],
          [cx + 11, cy - 4],
        ],
        '#1a2038'
      )
      s.d(cx - 11, cy - 5, '#1a2038').d(cx + 11, cy - 5, '#1a2038')
      s.E(cx - 0.5, cy + 1, 1.8, 1.3, 'shd')
      s.E(cx - 1, cy + 5, 3, 2, 'shd')
      s.E(cx + 6, cy + 6, 3, 3, 'ghost')
      s.d(cx + 5, cy + 5, '#ffffff')
      s.d(cx - 13, cy - 1, '#ff9ab4')
        .d(cx - 12, cy - 1, '#ff9ab4')
        .d(cx + 11, cy - 1, '#ff9ab4')
        .d(cx + 12, cy - 1, '#ff9ab4')
      for (const [x, y] of [
        [-8, -12],
        [3, -14],
        [10, -6],
        [-4, 12],
        [-16, 2],
      ])
        s.d(cx + x, cy + y, '#f0eefc')
    },
    glows: [],
    emit: [{ x: 46, y: 18, type: 'zz', rate: 0.5 }],
    mouth: [36, 44],
  },
}
