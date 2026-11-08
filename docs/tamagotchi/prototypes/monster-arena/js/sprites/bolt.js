'use strict'
// bolt sprites, added to the shared SPRITES table.
Object.assign(SPRITES, {
  /* ----- Lightning line (still drafts for the owner to choose from): storm animals, thunderbirds and big cats ----- */
  begg: {
    size: 48,
    rig: BLOB,
    draw(s, P) {
      const bx = P.body[0] * 0.6,
        by = P.body[1] * 0.3,
        m = (pts) => pts.map(([x, y]) => [x + bx, y + by])
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
  tbird: {
    size: 48,
    rig: FLY,
    hover: 6,
    fly: true,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        w = -7 * P.wing,
        m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      s.P(
        m(
          [
            [14, 32],
            [4, 30],
            [8, 33],
            [2, 36],
            [9, 36],
            [5, 40],
            [15, 36],
          ],
          bx,
          by
        ),
        'tbird2'
      )
      s.L(22 + bx, 37 + by, 21 + P.bf[0], 42 + P.bf[1], 0.6, 'gold')
      s.L(25 + bx, 37 + by, 26 + P.bl[0], 42 + P.bl[1], 0.6, 'gold')
      s.d(20 + P.bf[0], 43 + P.bf[1], '#c48a16')
        .d(22 + P.bf[0], 43 + P.bf[1], '#c48a16')
        .d(25 + P.bl[0], 43 + P.bl[1], '#c48a16')
        .d(27 + P.bl[0], 43 + P.bl[1], '#c48a16')
      s.E(22 + bx, 31 + by, 8.5, 6.5, 'tbird')
      s.E(24 + bx, 34 + by, 5.5, 3.6, 'cloudw')
      s.P(
        m(
          [
            [15, 28],
            [21, 22 + w],
            [25, 27 + w * 0.5],
            [29, 24 + w],
            [27, 31],
            [18, 34],
          ],
          bx,
          by
        ),
        'tbird2'
      )
      s.line(
        m(
          [
            [18, 30],
            [22, 26],
            [21, 29],
            [26, 26],
          ],
          bx,
          by + w * 0.5
        ),
        '#ffe14a'
      )
      s.E(31 + hx, 25 + hy, 5, 4.5, 'tbird')
      s.P(
        m(
          [
            [29, 21],
            [27, 15],
            [31, 19],
            [32, 13],
            [33, 20],
          ],
          hx,
          hy
        ),
        'volt'
      )
      s.P(
        m(
          [
            [35, 24],
            [40, 26],
            [35, 27.5],
          ],
          hx,
          hy
        ),
        'gold'
      )
      s.eye(32 + hx, 24 + hy, 'cute')
    },
    glows: [[31, 17, '#ffe14a', 4]],
    emit: [],
    mouth: [40, 26],
  },
  staticcat: {
    size: 48,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] * 0.6 + bx,
        hy = P.head[1] * 0.6 + by
      s.L(13 + bx, 36 + by, 8 + bx, 27 + by, 3.4, 'cat', 3)
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU
        s.spike(
          8 + bx + Math.cos(a) * 3,
          27 + by + Math.sin(a) * 3 + 1,
          3,
          1.2,
          'cat',
          Math.cos(a) * 3
        )
      }
      s.E(16 + P.bl[0], 42 + P.bl[1], 2.6, 1.6, 'cat')
      s.E(30 + P.fl[0], 42 + P.fl[1], 2.6, 1.6, 'cat')
      s.E(23 + bx, 35 + by, 10.5, 8, 'cat')
      for (let i = 0; i < 16; i++) {
        const a = Math.PI * (0.95 + i * 0.072),
          x = 23 + Math.cos(a) * 10,
          y = 35 + Math.sin(a) * 7.5
        s.spike(x + bx, y + 1 + by, 3.2, 1.3, 'cat', Math.cos(a) * 2.4)
      }
      s.E(32 + hx, 30 + hy, 6.5, 6, 'cat')
      s.spike(28.5 + hx, 25.5 + hy, 5, 2, 'cat', -1)
      s.spike(35 + hx, 25.5 + hy, 5, 2, 'cat', 1)
      s.d(28 + hx, 23 + hy, '#e0a0a0').d(35 + hx, 23 + hy, '#e0a0a0')
      for (const [x, y] of [
        [29.5, 29],
        [34.5, 29],
      ]) {
        s.d(x + hx, y + hy, '#ffffff')
          .d(x + 1 + hx, y + hy, '#2a2210')
          .d(x + hx, y + 1 + hy, '#2a2210')
          .d(x + 1 + hx, y + 1 + hy, '#ffe14a')
      }
      s.line(
        [
          [30 + hx, 33 + hy],
          [32 + hx, 32 + hy],
          [34 + hx, 33 + hy],
        ],
        '#5a4a20'
      )
      s.line(
        [
          [25 + hx, 31 + hy],
          [22 + hx, 30 + hy],
        ],
        '#5a4a20'
      ).line(
        [
          [38 + hx, 31 + hy],
          [41 + hx, 30 + hy],
        ],
        '#5a4a20'
      )
      for (const [x, y] of [
        [12, 30],
        [20, 26],
        [36, 37],
        [14, 40],
      ])
        s.line(
          [
            [x + bx, y + by],
            [x + 1 + bx, y + 1 + by],
            [x + bx, y + 2 + by],
          ],
          '#fff07a'
        )
    },
    glows: [
      [20, 30, '#ffe14a', 4],
      [36, 37, '#ffe14a', 3],
    ],
    emit: [],
    mouth: [33, 33],
  },
  stormfox: {
    size: 56,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      boltTail(
        s,
        15 + bx,
        40 + by,
        [
          [-6, -4],
          [-4, -10],
          [-9, -15],
          [-6, -22],
        ],
        3.2,
        'navyT',
        t
      )
      s.L(18 + bx, 43 + by, 17 + P.bf[0], 50 + P.bf[1], 1.6, 'navyT2', 1.3)
      s.L(33 + bx, 43 + by, 34 + P.ff[0], 50 + P.ff[1], 1.6, 'navyT2', 1.3)
      s.E(25 + bx, 40 + by, 11, 5.5, 'navyT')
      s.E(27 + bx, 44 + by, 7, 1.8, 'cloudw')
      for (const x of [18, 24, 30])
        s.line(
          m(
            [
              [x, 36],
              [x + 2, 38.5],
              [x, 39],
              [x + 2, 41.5],
            ],
            bx,
            by
          ),
          '#ffe14a'
        )
      s.L(21 + bx, 43 + by, 21 + P.bl[0], 51 + P.bl[1], 1.9, 'navyT', 1.5)
      s.L(31 + bx, 43 + by, 32 + P.fl[0], 51 + P.fl[1], 1.9, 'navyT', 1.5)
      s.E(21 + P.bl[0], 51.5 + P.bl[1], 2.2, 1.1, 'cloudw')
      s.E(32 + P.fl[0], 51.5 + P.fl[1], 2.2, 1.1, 'cloudw')
      s.L(33 + bx, 39 + by, 38 + hx, 34 + hy, 3.2, 'navyT', 2.8)
      s.E(36 + bx, 41 + by, 3, 2.6, 'cloudw')
      s.spike(37 + hx, 30 + hy, 8, 2.2, 'navyT', -2)
      s.spike(42 + hx, 30.5 + hy, 7.5, 2.1, 'navyT', 1)
      s.spike(37 + hx, 30 + hy, 5, 1, 'volt', -1.5)
      s.E(40 + hx, 33 + hy, 5.2, 4.2, 'navyT')
      s.P(
        m(
          [
            [42, 31],
            [50, 34.5],
            [43, 37],
          ],
          hx,
          hy
        ),
        'navyT'
      )
      s.E(44 + hx, 36 + hy + P.jaw, 3.6, 1.3, 'cloudw')
      s.d(50 + hx, 34 + hy, '#0a0c1a')
      s.line(
        m(
          [
            [40, 31.5],
            [43, 32.5],
          ],
          hx,
          hy
        ),
        '#0a0c1a'
      )
      s.d(42 + hx, 33 + hy, '#ffe14a')
    },
    glows: [[9, 20, '#ffe14a', 4]],
    emit: [],
    mouth: [50, 35],
  },
  hawk: {
    size: 64,
    rig: FLY,
    hover: 7,
    fly: true,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        w = -9 * P.wing,
        m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      birdWing(s, 38 + bx, 36 + by, 0.78, 1, w, 'hawk2')
      s.P(
        m(
          [
            [22, 46],
            [8, 54],
            [12, 49],
            [4, 50],
            [12, 45],
            [6, 42],
            [22, 42],
          ],
          bx,
          by
        ),
        'hawk2'
      )
      s.L(30 + bx, 50 + by, 29 + P.bf[0], 58 + P.bf[1], 0.9, 'gold')
      s.L(35 + bx, 50 + by, 36 + P.bl[0], 58 + P.bl[1], 0.9, 'gold')
      for (const [x, l] of [
        [29, P.bf],
        [36, P.bl],
      ]) {
        s.L(x + l[0], 58 + l[1], x - 2 + l[0], 60 + l[1], 0.6, 'gold')
        s.L(x + l[0], 58 + l[1], x + 3 + l[0], 60 + l[1], 0.6, 'gold')
      }
      s.E(32 + bx, 42 + by, 10, 9, 'hawk')
      s.E(35 + bx, 45 + by, 6, 5, 'cloudw')
      for (const [x, y] of [
        [33, 42],
        [36, 45],
        [34, 48],
      ])
        s.d(x + bx, y + by, '#8a94b8')
      birdWing(s, 32 + bx, 38 + by, 1, -1, w, 'hawk', '#ffe14a')
      s.L(38 + bx, 36 + by, 44 + hx, 28 + hy, 4, 'hawk', 3.6)
      s.E(46 + hx, 26 + hy, 6.5, 5.5, 'hawk')
      s.P(
        m(
          [
            [40, 22],
            [34, 18],
            [41, 21],
            [37, 15],
            [44, 20],
          ],
          hx,
          hy
        ),
        'hawk'
      )
      s.P(
        m(
          [
            [51, 23],
            [58, 26],
            [56, 31],
            [52, 28.5],
          ],
          hx,
          hy
        ),
        'gold'
      )
      s.line(
        m(
          [
            [43, 23],
            [50, 24],
          ],
          hx,
          hy
        ),
        '#100e1e'
      )
      s.d(48 + hx, 25 + hy, '#fff07a').d(47 + hx, 25 + hy, '#100e1e')
    },
    glows: [[20, 20, '#ffe14a', 5]],
    emit: [],
    mouth: [58, 28],
  },
  gloomcloud: {
    size: 64,
    rig: BLOB,
    hover: 4,
    draw(s, P) {
      const [bx, by] = P.body
      s.E(32 + bx, 46 + by, 18, 7, 'storm2')
      for (const [x, y, r] of [
        [18, 40, 8],
        [30, 33, 11],
        [43, 37, 9],
        [24, 44, 8],
        [38, 44, 8],
        [50, 43, 6],
      ])
        s.E(x + bx, y + by, r, r * 0.85, 'stormc')
      s.E(28 + bx, 30 + by, 4, 2.4, 'cloudw')
      s.E(17 + bx, 37 + by, 2.6, 1.6, 'cloudw')
      s.eye(28 + bx, 41 + by, 'sleepy').eye(37 + bx, 41 + by, 'sleepy')
      s.line(
        [
          [31 + bx, 46 + by],
          [34 + bx, 46 + by],
        ],
        '#141824'
      )
      for (const [x, y] of [
        [20, 53],
        [28, 55],
        [36, 54],
        [44, 52],
      ])
        s.line(
          [
            [x + bx, y + by],
            [x - 1 + bx, y + 2 + by],
          ],
          '#7ac8f0'
        )
      s.line(
        [
          [47 + bx, 50 + by],
          [45 + bx, 53 + by],
          [48 + bx, 54 + by],
          [46 + bx, 57 + by],
        ],
        '#ffe14a'
      )
    },
    glows: [[46, 54, '#ffe14a', 3]],
    emit: [],
    mouth: [34, 46],
  },
  boltfox: {
    size: 64,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      boltTail(
        s,
        16 + bx,
        44 + by,
        [
          [-7, -3],
          [-6, -10],
          [-12, -14],
          [-10, -22],
        ],
        3.4,
        'cat',
        t * 0.8
      )
      boltTail(
        s,
        16 + bx,
        45 + by,
        [
          [-8, 1],
          [-10, -5],
          [-16, -6],
          [-17, -13],
        ],
        3,
        'cat2',
        t
      )
      s.L(20 + bx, 49 + by, 18 + P.bf[0], 59 + P.bf[1], 1.8, 'navyT2', 1.4)
      s.L(41 + bx, 48 + by, 43 + P.ff[0], 59 + P.ff[1], 1.8, 'navyT2', 1.4)
      s.E(30 + bx, 45 + by, 14, 6.5, 'cat')
      s.E(32 + bx, 50 + by, 9, 1.8, 'cloudw')
      for (const x of [20, 27, 34])
        s.line(
          m(
            [
              [x, 40],
              [x + 2.5, 43],
              [x, 43.5],
              [x + 2.5, 47],
            ],
            bx,
            by
          ),
          '#24284e'
        )
      s.L(23 + bx, 49 + by, 22 + P.bl[0], 60 + P.bl[1], 2.2, 'cat', 1.4)
      s.L(39 + bx, 49 + by, 40 + P.fl[0], 60 + P.fl[1], 2.2, 'cat', 1.4)
      s.L(22 + P.bl[0] * 0.6, 55 + P.bl[1] * 0.6, 22 + P.bl[0], 60 + P.bl[1], 1.6, 'navyT')
      s.L(40 + P.fl[0] * 0.6, 55 + P.fl[1] * 0.6, 40 + P.fl[0], 60 + P.fl[1], 1.6, 'navyT')
      s.L(41 + bx, 44 + by, 47 + hx, 38 + hy, 3.6, 'cat', 3)
      s.E(44 + bx, 46 + by, 3.6, 3, 'cloudw')
      s.spike(46 + hx, 34 + hy, 9, 2.4, 'cat', -2.5)
      s.spike(51 + hx, 34.5 + hy, 8.5, 2.3, 'cat', 1)
      s.spike(46 + hx, 34 + hy, 5, 1.1, 'navyT', -2)
      s.spike(51 + hx, 34.5 + hy, 4.5, 1, 'navyT', 0.5)
      s.E(49 + hx, 37.5 + hy, 5.6, 4.6, 'cat')
      s.P(
        m(
          [
            [51, 35.5],
            [61, 39],
            [52, 42],
          ],
          hx,
          hy
        ),
        'cat'
      )
      s.E(54 + hx, 41 + hy + P.jaw, 4, 1.4, 'cloudw')
      s.d(61 + hx, 38.5 + hy, '#0a0c1a')
      s.line(
        m(
          [
            [48, 35.5],
            [52, 36.5],
          ],
          hx,
          hy
        ),
        '#24284e'
      )
      s.d(51 + hx, 37 + hy, '#9cc4ff')
      s.line(
        m(
          [
            [45, 39],
            [43, 42],
          ],
          hx,
          hy
        ),
        '#24284e'
      )
    },
    glows: [
      [6, 22, '#ffe14a', 4],
      [-1, 31, '#ffe14a', 3],
    ],
    emit: [],
    mouth: [61, 40],
  },
  thunderking: {
    size: 80,
    rig: FLY,
    hover: 8,
    fly: true,
    aura: { type: 'sparks', x: 40, y: 74, r: 30 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        w = -11 * P.wing,
        m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      birdWing(s, 48 + bx, 44 + by, 0.95, 1, w, 'storm2', null, 'storm2')
      s.P(
        m(
          [
            [30, 60],
            [8, 70],
            [14, 64],
            [2, 64],
            [14, 58],
            [6, 52],
            [28, 55],
          ],
          bx,
          by
        ),
        'tbird2'
      )
      s.line(
        m(
          [
            [26, 58],
            [8, 66],
          ],
          bx,
          by
        ),
        '#ffe14a'
      )
      s.L(38 + bx, 64 + by, 37 + P.bf[0], 74 + P.bf[1], 1.1, 'gold')
      s.L(44 + bx, 64 + by, 45 + P.bl[0], 74 + P.bl[1], 1.1, 'gold')
      for (const [x, l] of [
        [37, P.bf],
        [45, P.bl],
      ]) {
        s.L(x + l[0], 74 + l[1], x - 3 + l[0], 77 + l[1], 0.7, 'gold')
        s.L(x + l[0], 74 + l[1], x + 3 + l[0], 77 + l[1], 0.7, 'gold')
      }
      s.E(41 + bx, 55 + by, 13, 11, 'tbird')
      s.E(45 + bx, 59 + by, 8, 6, 'cloudw')
      birdWing(s, 40 + bx, 48 + by, 1.25, -1, w, 'stormc', '#ffe14a', 'stormc')
      s.L(49 + bx, 47 + by, 56 + hx, 36 + hy, 5, 'tbird', 4.2)
      s.E(58 + hx, 32 + hy, 7.5, 6.5, 'tbird')
      for (const [x, y, h, l] of [
        [52, 27, 9, -3],
        [56, 26, 11, -1],
        [60, 27, 9, 2],
      ])
        s.spike(x + hx, y + hy, h, 1.6, 'volt', l)
      s.P(
        m(
          [
            [63, 30],
            [72, 33],
            [70, 37],
            [64, 35],
          ],
          hx,
          hy
        ),
        'gold'
      )
      s.line(
        m(
          [
            [56, 30],
            [62, 30.5],
          ],
          hx,
          hy
        ),
        '#060c22'
      )
      s.d(60 + hx, 31 + hy, '#fffac0')
        .d(61 + hx, 31 + hy, '#ffe14a')
        .d(59 + hx, 31 + hy, '#060c22')
    },
    glows: [
      [56, 17, '#ffe14a', 6],
      [22, 26, '#ffe14a', 6],
    ],
    emit: [],
    mouth: [72, 34],
  },
  foxking: {
    size: 80,
    rig: QUAD,
    aura: { type: 'sparks', x: 40, y: 72, r: 30 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      // five lightning tails fanning up behind
      for (const [i, path] of [
        [
          [-6, -6],
          [-4, -14],
          [-10, -20],
          [-6, -30],
        ],
        [
          [-9, -3],
          [-10, -11],
          [-17, -15],
          [-16, -24],
        ],
        [
          [-10, 1],
          [-14, -5],
          [-21, -6],
          [-23, -13],
        ],
        [
          [-3, -8],
          [2, -15],
          [-2, -21],
          [3, -29],
        ],
        [
          [-10, 4],
          [-17, 3],
          [-22, 7],
          [-28, 4],
        ],
      ].entries())
        boltTail(
          s,
          20 + bx,
          56 + by,
          path,
          3.6 - (i > 2 ? 0.6 : 0),
          i % 2 ? 'navyT2' : 'navyT',
          t * (1 - i * 0.1)
        )
      s.L(26 + bx, 63 + by, 23 + P.bf[0], 74 + P.bf[1], 2.6, 'navyT2', 2)
      s.L(52 + bx, 62 + by, 55 + P.ff[0], 74 + P.ff[1], 2.6, 'navyT2', 2)
      s.E(37 + bx, 58 + by, 18, 8.5, 'navyT')
      s.E(39 + bx, 64 + by, 12, 2.2, 'cloudw')
      for (const x of [24, 32, 40, 48])
        s.line(
          m(
            [
              [x, 51],
              [x + 3, 55],
              [x, 55.5],
              [x + 3, 60],
            ],
            bx,
            by
          ),
          '#ffe14a',
          '#fffac0'
        )
      // storm-cloud ruff round the neck and shoulders, crackling
      for (const [x, y, r] of [
        [52, 50, 7],
        [58, 54, 6],
        [50, 57, 6],
        [56, 46, 5],
      ])
        s.E(x + bx, y + by, r, r * 0.85, 'stormc')
      s.E(54 + bx, 46 + by, 3, 1.8, 'cloudw')
      s.line(
        m(
          [
            [50, 49],
            [53, 52],
            [51, 53],
            [55, 57],
          ],
          bx,
          by
        ),
        '#ffe14a'
      )
      s.L(28 + bx, 63 + by, 27 + P.bl[0], 75 + P.bl[1], 3.2, 'navyT', 2)
      s.L(48 + bx, 63 + by, 50 + P.fl[0], 75 + P.fl[1], 3.2, 'navyT', 2)
      s.E(27 + P.bl[0], 76.5 + P.bl[1], 3.4, 1.4, 'volt')
      s.E(50 + P.fl[0], 76.5 + P.fl[1], 3.4, 1.4, 'volt')
      s.L(58 + bx, 52 + by, 63 + hx, 46 + hy, 4.5, 'navyT', 4)
      s.spike(61 + hx, 41 + hy, 12, 3, 'navyT', -3)
      s.spike(67 + hx, 41.5 + hy, 11, 2.8, 'navyT', 1.5)
      s.spike(61 + hx, 41 + hy, 7, 1.3, 'volt', -2.5)
      s.spike(67 + hx, 41.5 + hy, 6.5, 1.2, 'volt', 1)
      s.E(64 + hx, 46 + hy, 7.5, 6, 'navyT')
      s.P(
        m(
          [
            [66, 43],
            [79, 48],
            [67, 52],
          ],
          hx,
          hy
        ),
        'navyT'
      )
      s.E(71 + hx, 50 + hy + P.jaw * 2, 5, 1.8, 'cloudw')
      s.P(
        m(
          [
            [60, 42],
            [64, 37],
            [66, 41],
            [69, 37],
            [70, 43],
          ],
          hx,
          hy
        ),
        'gold'
      )
      s.d(79 + hx, 47.5 + hy, '#0a0c1a')
      s.line(
        m(
          [
            [63, 44.5],
            [68, 45.5],
          ],
          hx,
          hy
        ),
        '#0a0c1a'
      )
      s.d(66 + hx, 45.5 + hy, '#fffac0').d(67 + hx, 45.5 + hy, '#ffe14a')
      for (const x of [70, 73]) s.d(x + hx, 51 + hy, '#ffffff')
    },
    glows: [
      [14, 26, '#ffe14a', 5],
      [23, 27, '#ffe14a', 4],
      [-3, 44, '#ffe14a', 4],
      [66, 40, '#ffe14a', 3],
    ],
    emit: [],
    mouth: [79, 49],
  },
  /* ----- Lightning fused form (อสนีผู้ตื่น), the owner's pick (option C): a heavy storm wyvern that flies on the FLY rig ----- */
  // the arms are the wings, two strong legs, a crest of lightning, cloud-grey belly
  bfused: {
    size: 88,
    rig: FLY,
    hover: 9,
    fly: true,
    aura: { type: 'twinb', x: 44, y: 84, r: 30 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 3.4,
        w = P.wing > 0 ? 8 * P.wing : 16 * P.wing
      const o = (pts) => pts.map(([x, y]) => [x + bx, y + by])
      dragonWing(
        s,
        [52 + bx, 46 + by],
        [62 + bx, 22 + by - w * 0.7],
        o([
          [84, 12 - w],
          [84, 28 - w * 0.8],
          [76, 38 - w * 0.5],
        ]),
        [58 + bx, 54 + by],
        'storm2',
        'tbird2',
        true
      )
      s.L(34 + bx, 60 + by, 22 + bx, 66 + by - t * 0.5, 5.5, 'navyT', 4)
      s.L(22 + bx, 66 + by - t * 0.5, 8 + bx, 64 + by - t, 4, 'navyT', 1.6)
      s.P(
        [
          [6 + bx, 60 + by - t],
          [10 + bx, 63 + by - t],
          [5 + bx, 64 + by - t],
          [9 + bx, 68 + by - t],
          [2 + bx, 64 + by - t],
        ],
        'volt'
      )
      for (const x of [14, 20, 26])
        s.spike(x + bx, 63 + by - (t * 0.5 * (30 - x)) / 20, 3.6, 1.4, 'volt', -1)
      s.L(38 + bx, 64 + by, 36 + P.bf[0], 74 + P.bf[1], 3.6, 'navyT2', 2.6)
      claws(s, 36 + P.bf[0], 75 + P.bf[1], 1.3)
      s.E(44 + bx, 56 + by, 14, 11, 'navyT')
      s.E(47 + bx, 61 + by, 9, 6, 'stormc')
      for (const [x, y] of [
        [40, 50],
        [46, 48],
        [36, 54],
        [44, 54],
      ])
        s.line(
          [
            [x + bx, y + by],
            [x + 2 + bx, y + 3 + by],
            [x + bx, y + 4 + by],
          ],
          '#ffe14a'
        )
      s.L(46 + bx, 64 + by, 46 + P.bl[0], 75 + P.bl[1], 4, 'navyT', 3)
      claws(s, 46 + P.bl[0], 76 + P.bl[1], 1.4)
      s.L(54 + bx, 52 + by, 60 + hx, 42 + hy, 6.5, 'navyT', 5)
      for (let k = 0; k < 4; k++)
        s.spike(
          56 + k * 3 + bx + ((hx - bx) * k) / 4,
          47 - k * 2.6 + by + ((hy - by) * k) / 4,
          4.5,
          1.4,
          'volt',
          -2
        )
      dragonWing(
        s,
        [46 + bx, 48 + by],
        [28 + bx, 16 + by - w * 0.8],
        o([
          [2, 10 - w],
          [4, 28 - w * 0.8],
          [16, 40 - w * 0.55],
        ]),
        [40 + bx, 58 + by],
        'stormc',
        'storm2',
        true
      )
      // wyvern head: blunt, heavy jaw, swept crest of lightning, gold brow plate
      const ex = 61 + hx,
        ey = 40 + hy
      for (const [dx, dy, h, l] of [
        [-4, -3, 9, -6],
        [-1, -4, 10, -5],
        [2, -4, 8, -3],
      ])
        s.spike(ex + dx, ey + dy, h, 1.6, 'volt', l)
      s.E(ex + 2, ey, 7.5, 6, 'navyT')
      s.P(
        [
          [ex + 4, ey - 4],
          [ex + 18, ey - 1],
          [ex + 18, ey + 3],
          [ex + 4, ey + 4],
        ],
        'navyT'
      )
      s.P(
        [
          [ex + 1, ey - 5.5],
          [ex + 11, ey - 4],
          [ex + 12, ey - 1.5],
          [ex + 2, ey - 1.5],
        ],
        'gold'
      )
      s.P(
        [
          [ex + 3, ey + 3],
          [ex + 17, ey + 3 + j],
          [ex + 14, ey + 7 + j],
          [ex + 4, ey + 7],
        ],
        'navyT2'
      )
      if (j > 1)
        s.P(
          [
            [ex + 5, ey + 3],
            [ex + 17, ey + 3],
            [ex + 14, ey + 3 + j],
            [ex + 5, ey + 4 + j * 0.6],
          ],
          'maw'
        )
      for (const x of [8, 11, 14, 17]) s.d(ex + x, ey + 3, '#ffffff')
      s.d(ex + 18, ey - 1, '#0a0c1a')
      s.d(ex + 5, ey - 1, '#fffac0')
        .d(ex + 6, ey - 1, '#ffe14a')
        .d(ex + 4, ey - 2, '#0a0c1a')
        .d(ex + 5, ey - 2, '#0a0c1a')
        .d(ex + 6, ey - 2, '#0a0c1a')
        .d(ex + 7, ey - 2, '#0a0c1a')
      if (P.glow) glowSap(s, ex + 18, ey + 3 + j * 0.5)
    },
    glows: [
      [56, 30, '#ffe14a', 5],
      [6, 64, '#ffe14a', 4],
    ],
    emit: [{ x: 6, y: 64, type: 'zap', rate: 3 }],
    mouth: [79, 43],
  },
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
        m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
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
})
