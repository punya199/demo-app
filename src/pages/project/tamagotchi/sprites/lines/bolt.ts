import type { Pt } from '../engine/spr'
import { TAU } from '../engine/math'
import { BLOB, QUAD } from '../engine/rigs'
import type { ISpriteDef } from '../sprite-types'
import { BOLT_REMODEL_SPRITES } from './bolt-remodel'

// Lightning line: the 11 forms (adult up from bolt-remodel.ts), the awakened fused form and the world boss (stormbison).
// Ported from the prototype (docs/tamagotchi/prototypes/monster-arena/js/sprites).
export const BOLT_SPRITES: Record<string, ISpriteDef> = {
  /* ----- Lightning line (still drafts for the owner to choose from): storm animals, thunderbirds and big cats ----- */
  begg: {
    size: 48,
    rig: BLOB,
    draw(s, P) {
      const bx = P.body[0] * 0.6,
        by = P.body[1] * 0.3,
        m = (pts: Pt[]) => pts.map(([x, y]) => [x + bx, y + by])
      s.E(24 + bx, 31 + by, 9, 12, 'cloudw')
      s.P(
        m([
          [15, 30],
          [20, 28],
          [18, 32],
          [24, 30],
          [22, 34],
          [30, 31],
          [33, 30],
          [33, 33],
          [28, 34],
          [30, 31],
          [24, 36],
          [26, 32],
          [19, 35],
          [21, 31],
          [15, 33],
        ]),
        'stormc'
      )
      s.line(
        m([
          [16, 30],
          [20, 28],
          [19, 31],
          [24, 29],
          [23, 33],
          [30, 30],
          [33, 31],
        ]),
        '#ffe14a',
        '#fffac0'
      )
      s.E(20 + bx, 24 + by, 2, 1.4, 'cloudw')
      s.d(20 + bx, 21 + by, '#ffffff').d(19 + bx, 22 + by, '#ffffff')
    },
    glows: [[24, 31, '#ffe14a', 6]],
    emit: [],
    mouth: [24, 28],
  },
  spark: {
    size: 48,
    rig: BLOB,
    hover: 4,
    draw(s, P) {
      const [bx, by] = P.body,
        cx = 24 + bx,
        cy = 34 + by
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI / 2 + (i * TAU) / 7,
          l = i % 2 ? 6 : 8.5
        s.P(
          [
            [cx + Math.cos(a - 0.32) * 5, cy + Math.sin(a - 0.32) * 5],
            [cx + Math.cos(a) * (5 + l), cy + Math.sin(a) * (5 + l)],
            [cx + Math.cos(a + 0.32) * 5, cy + Math.sin(a + 0.32) * 5],
          ],
          'volt'
        )
      }
      s.E(cx, cy, 7, 6.5, 'volt')
      s.E(cx, cy + 1, 4.6, 4, 'vcore')
      s.eye(cx - 4, cy - 2, 'big').eye(cx + 2, cy - 2, 'big')
      s.d(cx - 1, cy + 3, '#5a4a04').d(cx, cy + 3, '#5a4a04')
      s.d(cx - 6, cy + 2, '#ffa040').d(cx + 5, cy + 2, '#ffa040')
    },
    glows: [[24, 34, '#ffe14a', 12]],
    emit: [],
    mouth: [29, 36],
  },
  cloudpuff: {
    size: 48,
    rig: BLOB,
    hover: 5,
    draw(s, P) {
      const [bx, by] = P.body
      s.line(
        [
          [24 + bx, 41 + by],
          [22 + bx, 44 + by],
          [25 + bx, 45 + by],
          [23 + bx, 48],
        ],
        '#ffe14a',
        '#fffac0'
      )
      s.E(24 + bx, 37 + by, 11, 5, 'stormc')
      for (const [x, y, r] of [
        [16, 34, 5],
        [24, 30, 7],
        [32, 33, 5.5],
        [20, 35, 5],
        [29, 36, 5],
      ])
        s.E(x + bx, y + by, r, r * 0.9, 'cloudw')
      s.eye(20 + bx, 33 + by, 'big').eye(27 + bx, 33 + by, 'big')
      s.d(18 + bx, 37 + by, '#ff9ad0')
        .d(30 + bx, 37 + by, '#ff9ad0')
        .d(23 + bx, 38 + by, '#3e4660')
        .d(24 + bx, 38 + by, '#3e4660')
    },
    glows: [[23, 45, '#ffe14a', 4]],
    emit: [],
    mouth: [30, 36],
  },
  // tbird ... foxking and the awakened bfused: the remodel (2026-11-10) in bolt-remodel.ts.
  ...BOLT_REMODEL_SPRITES,
  /* ----- Lightning world boss (game: จักรกลพายุ, a machine): a storm bison with a thundercloud mane ----- */
  stormbison: {
    size: 96,
    rig: QUAD,
    aura: { type: 'bossb', x: 48, y: 88, r: 36 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        m = (pts: Pt[], dx: number, dy: number) => pts.map(([x, y]) => [x + dx, y + dy])
      s.L(16 + bx, 66 + by, 8 + bx, 74 + by - t, 1.6, 'bison', 1.2)
      s.E(7 + bx, 76 + by - t, 2.4, 3, 'storm2')
      s.L(26 + bx, 74 + by, 25 + P.bf[0], 88 + P.bf[1], 4.6, 'bison2')
      s.L(62 + bx, 74 + by, 64 + P.ff[0], 88 + P.ff[1], 4.6, 'bison2')
      s.E(25 + P.bf[0], 90 + P.bf[1], 4.6, 2, 'storm2')
      s.E(64 + P.ff[0], 90 + P.ff[1], 4.6, 2, 'storm2')
      s.E(38 + bx, 68 + by, 24, 13, 'bison')
      s.E(58 + bx, 60 + by, 16, 19, 'bison')
      // thundercloud mane over the hump and shoulders
      for (const [x, y, r] of [
        [46, 44, 9],
        [56, 40, 11],
        [66, 44, 9],
        [40, 52, 7],
        [62, 54, 9],
        [72, 52, 7],
        [52, 54, 8],
      ])
        s.E(x + bx, y + by, r, r * 0.85, 'stormc')
      for (const [x, y, r] of [
        [54, 34, 5],
        [44, 40, 3.5],
        [64, 38, 4],
      ])
        s.E(x + bx, y + by, r, r * 0.7, 'cloudw')
      s.line(
        m(
          [
            [48, 40],
            [52, 46],
            [49, 47],
            [55, 54],
          ],
          bx,
          by
        ),
        '#ffe14a',
        '#ffffff'
      ).line(
        m(
          [
            [64, 42],
            [62, 48],
            [66, 49],
            [63, 56],
          ],
          bx,
          by
        ),
        '#ffe14a',
        '#ffffff'
      )
      s.L(30 + bx, 76 + by, 29 + P.bl[0], 89 + P.bl[1], 5.2, 'bison')
      s.L(56 + bx, 76 + by, 58 + P.fl[0], 89 + P.fl[1], 5.4, 'bison')
      s.E(29 + P.bl[0], 91 + P.bl[1], 5.4, 2, 'storm2')
      s.E(58 + P.fl[0], 91 + P.fl[1], 5.6, 2, 'storm2')
      s.E(56 + bx + P.fl[0] * 0.3, 80 + by, 6.5, 4, 'stormc')
      // heavy low head, horns crackling with lightning
      s.E(76 + hx, 66 + hy, 10, 10, 'bison')
      s.E(84 + hx, 72 + hy, 7, 6, 'bison')
      s.E(86 + hx, 75 + hy, 4, 2.6, 'bison2')
      s.L(72 + hx, 58 + hy, 64 + hx, 52 + hy, 2.6, 'horn', 1.8)
      s.L(64 + hx, 52 + hy, 66 + hx, 44 + hy, 1.8, 'horn', 0.8)
      s.L(80 + hx, 58 + hy, 86 + hx, 51 + hy, 2.4, 'horn', 1.6)
      s.L(86 + hx, 51 + hy, 84 + hx, 44 + hy, 1.6, 'horn', 0.7)
      s.line(
        m(
          [
            [66, 44],
            [72, 40],
            [76, 44],
            [80, 39],
            [84, 44],
          ],
          hx,
          hy
        ),
        '#ffe14a',
        '#ffffff'
      )
      s.E(80 + hx, 80 + hy, 5, 3, 'stormc')
      s.d(80 + hx, 64 + hy, '#ffffff')
        .d(81 + hx, 64 + hy, '#ffe14a')
        .d(79 + hx, 63 + hy, '#0e0c10')
        .d(80 + hx, 63 + hy, '#0e0c10')
        .d(81 + hx, 63 + hy, '#0e0c10')
      s.d(89 + hx, 74 + hy, '#0e0c10')
    },
    glows: [
      [75, 42, '#ffe14a', 6],
      [52, 48, '#ffe14a', 5],
      [80, 64, '#ffe14a', 3],
    ],
    emit: [],
    mouth: [89, 76],
  },
}
