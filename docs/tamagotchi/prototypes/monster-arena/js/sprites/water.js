'use strict'
// water sprites, added to the shared SPRITES table.
Object.assign(SPRITES, {
  /* ----- Tide line v2: richer colour, patterns, glowing spots and see-through fins ----- */
  wegg: {
    size: 48,
    rig: BLOB,
    draw(s, P) {
      const bx = P.body[0] * 0.6,
        by = P.body[1] * 0.3,
        m = (pts) => pts.map(([x, y]) => [x + bx, y + by])
      s.E(24 + bx, 31 + by, 9, 12, 'shellb')
      s.P(
        m([
          [15, 31],
          [18, 29],
          [21, 31],
          [24, 29],
          [27, 31],
          [30, 29],
          [33, 31],
          [33, 35],
          [30, 33],
          [27, 35],
          [24, 33],
          [21, 35],
          [18, 33],
          [15, 35],
        ]),
        'cobalt'
      )
      s.line(
        m([
          [15, 31],
          [18, 29],
          [21, 31],
          [24, 29],
          [27, 31],
          [30, 29],
          [33, 31],
        ]),
        '#9ccaff',
        '#ffffff'
      )
      s.E(20 + bx, 25 + by, 2, 1.4, 'dropw')
      s.E(28 + bx, 23 + by, 1.4, 1, 'dropw')
      s.E(19 + bx, 21 + by, 1.6, 2.6, 'foam')
      s.line(
        m([
          [22, 37],
          [24, 36],
          [26, 37],
        ]),
        '#7ee7ff'
      )
    },
    glows: [[24, 36, '#7ee7ff', 5]],
    emit: [
      { x: 24, y: 22, type: 'bubble', rate: 1.5 },
      { x: 24, y: 30, type: 'glint', rate: 1 },
    ],
    mouth: [24, 28],
  },
  drop: {
    size: 48,
    rig: BLOB,
    hover: 4,
    draw(s, P) {
      const [bx, by] = P.body,
        m = (pts) => pts.map(([x, y]) => [x + bx, y + by])
      s.L(24 + bx, 16 + by, 27 + bx, 11 + by, 0.8, 'dropw')
      s.E(28.5 + bx, 11 + by, 1.6, 1.6, 'dropw')
      s.P(
        m([
          [24, 15],
          [27, 22],
          [32, 29],
          [33, 35],
          [30, 41],
          [18, 41],
          [15, 35],
          [16, 29],
          [21, 22],
        ]),
        'dropw'
      )
      s.E(24 + bx, 35 + by, 8.5, 6.5, 'dropw')
      s.line(
        m([
          [20, 37],
          [20, 34],
          [22, 32],
          [26, 32],
          [28, 35],
          [26, 38],
          [23, 37],
        ]),
        '#bfeaff'
      )
      s.E(19.5 + bx, 29 + by, 1.6, 3.4, 'foam')
      s.d(26 + bx, 23 + by, '#ffffff').d(29 + bx, 40 + by, '#86d4ff')
      s.eye(20 + bx, 33 + by, 'big').eye(26 + bx, 33 + by, 'big')
      s.d(18 + bx, 37 + by, '#ff9ad0')
        .d(19 + bx, 37 + by, '#ff9ad0')
        .d(28 + bx, 37 + by, '#ff9ad0')
        .d(29 + bx, 37 + by, '#ff9ad0')
      s.d(23 + bx, 38 + by, '#06243e').d(24 + bx, 38 + by, '#06243e')
      if (P.jaw > 0.5) s.d(23 + bx, 39 + by, '#06243e').d(24 + bx, 39 + by, '#ff6a9a')
    },
    glows: [[24, 35, '#7ee7ff', 7]],
    emit: [
      { x: 28, y: 11, type: 'glint', rate: 2 },
      { x: 24, y: 30, type: 'bubble', rate: 1.5 },
      { x: 24, y: 41, type: 'drop', rate: 1 },
    ],
    mouth: [29, 36],
  },
  bubble: {
    size: 48,
    rig: BLOB,
    hover: 6,
    draw(s, P) {
      const [bx, by] = P.body,
        rim = (cx, cy, r) => {
          for (let i = 0; i < 20; i++) {
            const a = (i / 20) * Math.PI * 2
            const col = a < 1.6 ? '#ffa8d8' : a < 3.1 ? '#fff0a0' : a < 4.7 ? '#ffffff' : '#a8ffe0'
            s.d(cx + Math.cos(a) * (r - 0.6), cy + Math.sin(a) * (r - 0.6), col)
          }
          s.d(cx - r * 0.45, cy - r * 0.5, '#ffffff').d(cx - r * 0.3, cy - r * 0.6, '#ffffff')
        }
      const sm = [
        [14 + bx * 0.6, 30 + by * 0.6 + P.bl[1], 4.5],
        [34 + bx * 0.6, 22 + by * 0.6 + P.fl[1], 3.6],
        [32 + bx * 0.5, 43 + by * 0.5, 2.6],
      ]
      for (const [x, y, r] of sm) s.E(x, y, r, r, 'bub')
      s.E(24 + bx, 34 + by, 10, 9, 'bub')
      s.E(17 + bx, 26 + by, 3.4, 3.4, 'bub')
      s.E(31 + bx, 26 + by, 3.4, 3.4, 'bub')
      for (const [x, y, r] of sm) rim(x, y, r)
      rim(24 + bx, 34 + by, 10)
      rim(17 + bx, 26 + by, 3.4)
      rim(31 + bx, 26 + by, 3.4)
      s.eye(20 + bx, 33 + by, 'big').eye(27 + bx, 33 + by, 'big')
      s.d(18 + bx, 37 + by, '#ff9ad0').d(30 + bx, 37 + by, '#ff9ad0')
      s.d(23 + bx, 38 + by, '#2a3e6a')
        .d(24 + bx, 39 + by, '#2a3e6a')
        .d(25 + bx, 38 + by, '#2a3e6a')
    },
    glows: [[24, 34, '#c8f0ff', 9]],
    emit: [
      { x: 24, y: 26, type: 'bubble', rate: 3 },
      { x: 24, y: 34, type: 'glint', rate: 1.5 },
    ],
    mouth: [30, 36],
  },
  swordwhale: {
    size: 56,
    rig: SWIM,
    hover: 7,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 1.8
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      s.L(16 + bx, 38 + by, 8 + bx, 34 + by - t, 3.6, 'cobalt', 2.2)
      s.P(
        m(
          [
            [2, 24],
            [11, 33],
            [3, 44],
            [9, 34],
          ],
          bx,
          by - t * 1.5
        ),
        'cobalt'
      )
      s.d(3 + bx, 25 + by - t * 1.5, '#ffffff').d(4 + bx, 43 + by - t * 1.5, '#ffffff')
      s.E(31 + bx + P.bl[0] * 0.3, 46 + by + P.bl[1], 3, 1.8, 'cobalt2')
      s.E(26 + bx, 37 + by, 13, 8.5, 'cobalt')
      s.E(28 + bx, 41.5 + by, 11, 3.2, 'pearl')
      for (const x of [24, 28, 32])
        s.line(
          [
            [x + bx, 40 + by],
            [x + 1 + bx, 44 + by],
          ],
          '#a8bcd0'
        )
      s.line(
        m(
          [
            [15, 36],
            [21, 35],
            [29, 35],
            [36, 36],
          ],
          bx,
          by
        ),
        '#ffd84a',
        '#fff0a0'
      )
      s.P(
        m(
          [
            [22, 30],
            [26, 24],
            [28, 30],
          ],
          bx,
          by
        ),
        'cobalt'
      )
      s.d(26 + bx, 25 + by, '#7ee7ff').d(25 + bx, 27 + by, '#7ee7ff')
      s.E(38 + hx, 35 + hy, 7.5, 7, 'cobalt')
      s.E(39 + hx, 39 + hy + j * 0.5, 4.5, 2, 'pearl')
      s.E(40 + hx, 37.5 + hy, 3, 2, 'pearl')
      if (j > 1)
        s.line(
          [
            [37 + hx, 38 + hy],
            [43 + hx, 38 + hy + j * 0.5],
          ],
          '#040e2e'
        )
      s.E(45 + hx, 34 + hy, 1.8, 2, 'gold')
      s.L(46 + hx, 34 + hy, 55 + hx, 33 + hy, 1.5, 'bone', 0.4)
      s.d(48 + hx, 34 + hy, '#9a9080').d(51 + hx, 34 + hy, '#9a9080')
      s.E(34 + bx + P.fl[0] * 0.3, 46 + by + P.fl[1], 3.6, 2, 'cobalt')
      s.d(31 + bx + P.fl[0] * 0.3, 47 + by + P.fl[1], '#7ee7ff').d(
        37 + bx + P.fl[0] * 0.3,
        47 + by + P.fl[1],
        '#7ee7ff'
      )
      s.eye(38 + hx, 32 + hy, 'big').d(30 + bx, 29 + by, '#040e2e')
      if (P.glow) glowMouth(s, 55 + hx, 33 + hy)
    },
    glows: [[45, 34, '#ffd84a', 3]],
    emit: [
      { x: 30, y: 28, type: 'mist', rate: 2 },
      { x: 20, y: 44, type: 'bubble', rate: 1.2 },
      { x: 54, y: 33, type: 'glint', rate: 1.5 },
    ],
    mouth: [55, 33],
  },
  jelly: {
    size: 56,
    rig: SWIM,
    hover: 9,
    draw(s, P) {
      const [bx, by] = P.body,
        sw = [P.fl[1], P.bl[1], P.ff[0], P.bf[0]]
      for (let i = 0; i < 6; i++) {
        const x0 = 15 + i * 5 + bx,
          w = sw[i % 4] * (i % 2 ? 1 : -1),
          a = x0 + w * 0.6,
          b = x0 - w * 0.4 + (i - 2.5) * 1.2,
          c = x0 + w * 0.5 + (i - 2.5) * 1.8
        s.L(x0, 32 + by, a, 40 + by * 0.7, 0.9, 'jtent')
        s.L(a, 40 + by * 0.7, b, 47 + by * 0.4, 0.8, 'jtent')
        s.L(b, 47 + by * 0.4, c, 53, 0.6, 'jtent')
        s.d(c, 53, '#ffb0f0')
      }
      for (const [x0, k] of [
        [22, 1],
        [30, -1],
      ]) {
        const w = sw[k > 0 ? 0 : 1] * k
        s.L(x0 + bx, 31 + by, x0 + w + bx, 42 + by * 0.6, 1.6, 'jellyv', 1.1)
        s.line(
          [
            [x0 - 1 + bx, 33 + by],
            [x0 + 1 + bx, 35 + by],
            [x0 - 1 + w * 0.5 + bx, 37 + by],
            [x0 + 1 + w * 0.7 + bx, 39 + by * 0.7],
          ],
          '#ffd8ff'
        )
      }
      s.P(
        [
          [11, 31],
          [12, 22],
          [18, 14],
          [26, 12],
          [34, 14],
          [40, 22],
          [41, 31],
        ].map(([x, y]) => [x + bx, y + by]),
        'jellyv'
      )
      for (let x = 12; x <= 40; x += 4)
        s.E(x + bx, 31 + by, 2.4, 1.6, (x / 4) % 2 ? 'jellyv' : 'jglow')
      s.E(22 + bx, 21 + by, 2.4, 1.8, 'jglow')
      s.E(30 + bx, 21 + by, 2.4, 1.8, 'jglow')
      s.E(26 + bx, 18 + by, 1.8, 2.2, 'jglow')
      s.E(26 + bx, 24 + by, 1.8, 2, 'jglow')
      for (const [x, y] of [
        [16, 20],
        [36, 20],
        [20, 15],
        [32, 15],
        [14, 26],
        [38, 26],
      ])
        s.d(x + bx, y + by, '#ffe0ff')
      s.E(19 + bx, 17 + by, 2, 1.4, 'foam')
      s.eye(21 + bx, 27 + by, P.glow ? 'big' : 'sleepy').eye(
        30 + bx,
        27 + by,
        P.glow ? 'big' : 'sleepy'
      )
      s.d(25 + bx, 29 + by, '#2a0636').d(26 + bx, 29 + by, '#2a0636')
    },
    glows: [
      [26, 21, '#ff7ae0', 9],
      [15, 53, '#ffb0f0', 2],
      [30, 53, '#ffb0f0', 2],
      [40, 53, '#ffb0f0', 2],
    ],
    emit: [
      { x: 26, y: 12, type: 'bubble', rate: 1 },
      { x: 26, y: 46, type: 'zap', rate: 1 },
    ],
    mouth: [26, 28],
  },
  shark: {
    size: 56,
    rig: SWIM,
    hover: 4,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 2.6
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      s.P(
        m(
          [
            [2, 24],
            [12, 34],
            [3, 46],
            [7, 35],
          ],
          bx,
          by - t * 1.3
        ),
        'sharktop'
      )
      s.d(3 + bx, 25 + by - t * 1.3, '#c8d8e0').d(4 + bx, 45 + by - t * 1.3, '#c8d8e0')
      s.P(
        m(
          [
            [19, 40],
            [15, 49],
            [24, 43],
          ],
          bx + P.bl[0] * 0.3,
          by + P.bl[1]
        ),
        'sharktop'
      )
      s.P(
        m(
          [
            [9, 35],
            [18, 28],
            [34, 26],
            [44, 29],
            [44, 41],
            [28, 44],
            [14, 40],
          ],
          bx,
          by
        ),
        'sharktop'
      )
      s.P(
        m(
          [
            [34, 26],
            [46, 30],
            [52, 36],
            [44, 38],
          ],
          hx,
          hy
        ),
        'sharktop'
      )
      s.P(
        m(
          [
            [38, 38],
            [52, 36.5],
            [49, 39 + j],
            [40, 41 + j * 0.6],
          ],
          hx,
          hy
        ),
        'seaB'
      )
      s.P(
        m(
          [
            [16, 39],
            [28, 42],
            [40, 41],
            [40, 37],
            [34, 38],
            [20, 37],
          ],
          bx,
          by
        ),
        'seaB'
      )
      for (const x of [16, 21, 26, 31])
        s.line(
          [
            [x + bx, 28 + by + (x === 16 ? 3 : 0)],
            [x - 2 + bx, 34 + by],
          ],
          '#0a1630'
        )
      s.P(
        m(
          [
            [22, 28],
            [28, 14],
            [33, 27],
          ],
          bx,
          by
        ),
        'sharktop'
      )
      s.line(
        m(
          [
            [28, 15],
            [27, 20],
          ],
          bx,
          by
        ),
        '#6a96d0'
      )
      s.spike(16 + bx, 31 + by, 3.4, 1.4, 'bone')
      s.spike(38 + hx, 27 + hy, 3.4, 1.4, 'bone')
      s.spike(43 + hx, 28.5 + hy, 2.8, 1.2, 'bone')
      s.P(
        m(
          [
            [34, 42],
            [32, 50],
            [39, 44],
          ],
          bx + P.fl[0] * 0.3,
          by + P.fl[1]
        ),
        'sharktop'
      )
      s.line(
        [
          [41 + hx, 36 + hy],
          [50 + hx, 36 + hy + j * 0.4],
        ],
        '#050c1e'
      )
      for (const x of [42, 44, 46, 48]) s.d(x + hx, 37 + hy, '#ffffff')
      if (j > 1) for (const x of [43, 45, 47]) s.d(x + hx, 37 + hy + j * 0.6, '#ffffff')
      for (const x of [34, 36, 38])
        s.line(
          [
            [x + bx, 31 + by],
            [x + bx, 35 + by],
          ],
          '#0a1630'
        )
      s.line(
        [
          [45 + hx, 29 + hy],
          [48 + hx, 31 + hy],
        ],
        '#c8d8e0'
      )
      s.d(44 + hx, 32 + hy, '#ff3b3b')
        .d(45 + hx, 32 + hy, '#ffb0b0')
        .d(43 + hx, 31 + hy, '#050c1e')
        .d(44 + hx, 31 + hy, '#050c1e')
        .d(45 + hx, 31 + hy, '#050c1e')
      if (P.glow) glowMouth(s, 51 + hx, 37 + hy)
    },
    glows: [[44, 32, '#ff3b3b', 3]],
    emit: [
      { x: 46, y: 28, type: 'bubble', rate: 2 },
      { x: 24, y: 44, type: 'drop', rate: 1.6 },
    ],
    mouth: [51, 36],
  },
  armorwhale: {
    size: 64,
    rig: SWIM,
    hover: 7,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 2
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      s.L(14 + bx, 42 + by, 6 + bx, 38 + by - t, 4, 'slate2', 2.6)
      s.P(
        m(
          [
            [1, 26],
            [10, 36],
            [2, 50],
            [8, 38],
          ],
          bx,
          by - t * 1.5
        ),
        'slate2'
      )
      s.line(
        m(
          [
            [2, 27],
            [9, 36],
            [3, 49],
          ],
          bx,
          by - t * 1.5
        ),
        '#4e5a66'
      )
      s.E(36 + bx + P.bl[0] * 0.3, 52 + by + P.bl[1], 4, 2.2, 'slate2')
      s.E(30 + bx, 40 + by, 18, 10.5, 'slate2')
      s.E(33 + bx, 46 + by, 13, 3.4, 'pearl')
      for (const x of [28, 32, 36, 40])
        s.line(
          [
            [x + bx, 44 + by],
            [x + 1 + bx, 49 + by],
          ],
          '#a8bcd0'
        )
      for (const x of [16, 24, 32, 40]) {
        s.P(
          m(
            [
              [x - 4, 33],
              [x - 2, 28.5],
              [x + 4, 28.5],
              [x + 5, 33],
            ],
            bx,
            by
          ),
          'armor'
        )
        s.d(x - 2 + bx, 31 + by, '#f2c13a').d(x + 3 + bx, 31 + by, '#f2c13a')
        s.line(
          [
            [x + 5 + bx, 30 + by],
            [x + 5 + bx, 33 + by],
          ],
          '#7ee7ff'
        )
      }
      for (const [x, y] of [
        [20, 44],
        [24, 46],
        [41, 45],
        [12, 40],
      ]) {
        s.E(x + bx, y + by, 1.8, 1.4, 'shellb')
        s.d(x + bx, y + by, '#2a3e4a')
      }
      s.E(46 + hx, 39 + hy, 8.5, 8, 'slate2')
      s.E(48 + hx, 45 + hy + j * 0.5, 6, 2, 'pearl')
      s.P(
        m(
          [
            [39, 34],
            [43, 30.5],
            [52, 31],
            [54, 35],
            [41, 36.5],
          ],
          hx,
          hy
        ),
        'armor'
      )
      s.d(44 + hx, 32 + hy, '#f2c13a').d(50 + hx, 32 + hy, '#f2c13a')
      s.L(52 + hx, 42 + hy, 61 + hx, 41 + hy, 1.3, 'bone', 0.5)
      if (j > 1)
        s.line(
          [
            [46 + hx, 44 + hy],
            [53 + hx, 44 + hy + j * 0.5],
          ],
          '#0a1220'
        )
      s.E(39 + bx + P.fl[0] * 0.3, 52 + by + P.fl[1], 5, 2.3, 'slate2')
      s.line(
        [
          [35 + bx + P.fl[0] * 0.3, 53 + by + P.fl[1]],
          [43 + bx + P.fl[0] * 0.3, 53 + by + P.fl[1]],
        ],
        '#f2c13a'
      )
      s.d(48 + hx, 37 + hy, '#e0ffff')
        .d(49 + hx, 37 + hy, '#7ee7ff')
        .d(47 + hx, 36 + hy, '#0a1220')
        .d(48 + hx, 36 + hy, '#0a1220')
        .d(49 + hx, 36 + hy, '#0a1220')
      if (P.glow) glowMouth(s, 60 + hx, 41 + hy)
    },
    glows: [
      [21, 31, '#7ee7ff', 3],
      [29, 31, '#7ee7ff', 3],
      [37, 31, '#7ee7ff', 3],
      [45, 31, '#7ee7ff', 3],
      [48, 37, '#7ee7ff', 3],
    ],
    emit: [
      { x: 34, y: 27, type: 'mist', rate: 3 },
      { x: 24, y: 50, type: 'bubble', rate: 1.2 },
    ],
    mouth: [60, 41],
  },
  octopus: {
    size: 64,
    rig: SWIM,
    draw(s, P) {
      const [bx, by] = P.body,
        sw = [P.fl[1], P.bl[1], P.ff[0], P.bf[0]]
      for (let i = 0; i < 6; i++) {
        const x0 = 20 + i * 5 + bx,
          dx = (i - 2.5) * 3.8,
          w = sw[i % 4] * (i % 2 ? 1 : -1),
          col = i === 0 || i === 5 ? 'octov2' : 'octov'
        const mx = x0 + dx + w,
          my = 50 + by * 0.5,
          ex = x0 + dx * 1.6 - w * 0.5,
          ey = 57
        s.L(x0, 38 + by, mx, my, 2.6, col, 2)
        s.L(mx, my, ex, ey, 2, col, 1.2)
        const cx = ex + (dx > 0 ? 2 : -2)
        s.E(cx, ey - 1.5, 1.8, 1.8, col)
        s.d(cx, ey - 1.5, '#06201c')
        for (const q of [0.3, 0.6, 0.85])
          s.d(x0 + (mx - x0) * q + (dx > 0 ? -1 : 1), 38 + by + (my - 38 - by) * q + 1, '#ffa0c4')
        s.d(mx + (dx > 0 ? -1 : 1), my + 2, '#ffa0c4').d(
          (mx + ex) / 2,
          (my + ey) / 2 + 1,
          '#ffa0c4'
        )
      }
      s.L(45 + bx, 40 + by, 50 + bx + sw[2], 46 + by, 1.8, 'octov', 1.4)
      s.E(51 + bx + sw[2], 46 + by, 3, 3, 'pearl')
      s.E(32 + bx, 28 + by, 14, 13, 'octov')
      s.E(32 + bx, 37 + by, 12, 4, 'octov')
      for (const [x, y, r] of [
        [26, 21, 2.2],
        [37, 19, 2.6],
        [34, 30, 1.6],
        [23, 29, 1.4],
        [41, 26, 1.6],
        [30, 16, 1.4],
      ])
        s.E(x + bx, y + by, r, r * 0.8, 'coral')
      s.E(26 + bx, 18 + by, 3, 2.2, 'foam')
      for (const ex of [26, 38]) {
        s.E(ex + bx, 32 + by, 3.6, 3.2, 'shellb')
        if (P.glow) s.eye(ex - 1 + bx, 31 + by, 'big')
        else {
          s.E(ex + bx, 30.5 + by, 3.8, 1.8, 'octov')
          s.line(
            [
              [ex - 3 + bx, 32 + by],
              [ex + 3 + bx, 32 + by],
            ],
            '#06201c'
          )
          s.d(ex + bx, 33 + by, '#06201c')
        }
      }
      s.E(
        32 + bx + P.jaw * 2,
        37 + by,
        P.jaw > 0.5 ? 2.2 : 1.4,
        P.jaw > 0.5 ? 1.8 : 1.1,
        'octopink'
      )
    },
    glows: [[51, 46, '#ffffff', 4]],
    emit: [
      { x: 32, y: 14, type: 'bubble', rate: 1 },
      { x: 51, y: 45, type: 'glint', rate: 1.2 },
    ],
    mouth: [34, 37],
  },
  seadragon: {
    size: 64,
    rig: SWIM,
    hover: 8,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 2.4
      const pts = []
      for (let i = 0; i <= 20; i++) {
        const q = i / 20
        pts.push([
          6 + q * 34 + bx,
          50 - q * 18 + Math.sin(q * 3 * Math.PI + t * 0.7) * 4 * (1 - q) + by,
          1.8 + q * 3.4,
        ])
      }
      pts.forEach(([x, y, r], i) => {
        if (i % 3 === 1 && i < 19) {
          s.P(
            [
              [x - 3, y - r + 1],
              [x - 1, y - r - 7],
              [x + 3, y - r + 1],
            ],
            'finglass'
          )
          s.line(
            [
              [x - 1, y - r - 6],
              [x, y - r],
            ],
            '#4ad4ff'
          )
        }
      })
      s.P(
        [
          [2, 40],
          [-1, 33],
          [7, 40],
          [0, 52],
          [6, 46],
        ].map(([x, y]) => [x + 3 + bx, y + by + Math.sin(t * 0.7) * 4]),
        'finglass'
      )
      pts.forEach(([x, y, r]) => s.E(x, y, r, r, 'abyss2'))
      pts.forEach(([x, y, r], i) => {
        if (i > 3) s.d(x, y + r - 1, '#6a84e0')
        if (i % 3 === 0 && i > 2) s.d(x, y - r * 0.2, i % 2 ? '#ff8ae8' : '#7ee7ff')
      })
      s.P(
        [
          [34, 40],
          [30, 52],
          [40, 44],
        ].map(([x, y]) => [x + bx + P.fl[0] * 0.3, y + by + P.fl[1]]),
        'finglass'
      )
      s.line(
        [
          [34 + bx, 41 + by],
          [31 + bx, 50 + by],
        ],
        '#4ad4ff'
      )
      s.L(40 + bx, 32 + by, 44 + hx, 26 + hy, 4.4, 'abyss2', 3.8)
      s.P(
        [
          [42 + hx, 21 + hy],
          [33 + hx, 15 + hy],
          [43 + hx, 19 + hy],
        ],
        'bone'
      )
      s.P(
        [
          [44 + hx, 20 + hy],
          [40 + hx, 11 + hy],
          [46 + hx, 19 + hy],
        ],
        'bone'
      )
      s.L(46 + hx, 19 + hy, 50 + hx, 12 + hy, 0.6, 'abyss2')
      s.L(50 + hx, 12 + hy, 56 + hx, 10 + hy, 0.6, 'abyss2')
      s.E(57 + hx, 10.5 + hy, 2.2, 2.2, 'magglow')
      s.E(47 + hx, 24 + hy, 7, 5.4, 'abyss2')
      s.E(54 + hx, 26 + hy, 5, 3.2, 'abyss2')
      s.P(
        [
          [45 + hx, 28.5 + hy],
          [59 + hx, 27.5 + hy + j],
          [56 + hx, 31 + hy + j],
          [48 + hx, 31 + hy],
        ],
        'abyss2'
      )
      for (const x of [50, 53, 56]) {
        s.d(x + hx, 28 + hy, '#ffffff').d(x + hx, 29 + hy, '#ffffff')
      }
      if (j > 1) {
        s.line(
          [
            [48 + hx, 29.5 + hy],
            [57 + hx, 29 + hy + j * 0.6],
          ],
          '#ff4ad8'
        )
        for (const x of [51, 54]) s.d(x + hx, 29 + hy + j * 0.7, '#ffffff')
      }
      s.line(
        [
          [55 + hx, 27 + hy],
          [59 + hx, 30 + hy],
          [61 + hx, 35 + hy],
        ],
        '#4ad4ff'
      ).line(
        [
          [53 + hx, 27 + hy],
          [55 + hx, 33 + hy],
        ],
        '#4ad4ff'
      )
      s.d(49 + hx, 22 + hy, '#e0ffff')
        .d(50 + hx, 22 + hy, '#7ee7ff')
        .d(48 + hx, 21 + hy, '#04061a')
        .d(49 + hx, 21 + hy, '#04061a')
        .d(50 + hx, 21 + hy, '#04061a')
      if (P.glow) glowMouth(s, 59 + hx, 29 + hy + j * 0.5)
    },
    glows: [
      [57, 10, '#ff4ad8', 7],
      [29, 39, '#7ee7ff', 2],
      [19, 44, '#ff8ae8', 2],
      [12, 47, '#7ee7ff', 2],
      [49, 22, '#7ee7ff', 2],
    ],
    emit: [
      { x: 22, y: 38, type: 'bubble', rate: 2 },
      { x: 57, y: 10, type: 'glint', rate: 2 },
    ],
    mouth: [59, 29],
  },
  whaleking: {
    size: 80,
    rig: SWIM,
    hover: 9,
    aura: { type: 'ribbons', x: 40, y: 48, r: 34 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 2.6,
        w = -3 * P.wing
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      s.P(
        m(
          [
            [36, 44],
            [22, 30 + w],
            [10, 32 + w],
            [2, 46],
            [12, 46],
            [6, 60],
            [24, 54],
          ],
          bx,
          by
        ),
        'finglass'
      )
      s.line(
        m(
          [
            [34, 44],
            [14, 34 + w],
          ],
          bx,
          by
        ),
        '#a8dcff'
      ).line(
        m(
          [
            [34, 46],
            [8, 50],
          ],
          bx,
          by
        ),
        '#a8dcff'
      )
      s.L(18 + bx, 52 + by, 10 + bx, 48 + by - t, 4.5, 'royalv', 3)
      s.P(
        m(
          [
            [2, 32],
            [13, 46],
            [3, 62],
            [10, 48],
          ],
          bx,
          by - t * 1.6
        ),
        'royalv'
      )
      s.line(
        m(
          [
            [2, 33],
            [12, 46],
            [3, 61],
          ],
          bx,
          by - t * 1.6
        ),
        '#f2c13a'
      )
      s.E(44 + bx + P.bl[0] * 0.3, 64 + by + P.bl[1], 5, 2.6, 'royalv2')
      s.E(36 + bx, 50 + by, 23, 14, 'royalv')
      s.E(40 + bx, 58 + by, 18, 4.4, 'pearl')
      for (const x of [33, 38, 43, 48])
        s.line(
          [
            [x + bx, 56 + by],
            [x + 1 + bx, 62 + by],
          ],
          '#a8bcd0'
        )
      for (const [x, y] of [
        [20, 42],
        [28, 39],
        [36, 38],
        [44, 39],
      ]) {
        s.P(
          m(
            [
              [x - 4, y + 3],
              [x - 2, y - 2],
              [x + 4, y - 2],
              [x + 5, y + 3],
            ],
            bx,
            by
          ),
          'gold'
        )
        s.line(
          m(
            [
              [x - 1, y],
              [x + 3, y],
            ],
            bx,
            by
          ),
          '#7d520a'
        )
        s.d(x + 1 + bx, y + 1 + by, x % 16 === 4 ? '#ff3b6a' : '#7ee7ff')
      }
      for (const [x, y, h] of [
        [50, 38, 10],
        [54, 36, 13],
        [58, 37, 9],
      ]) {
        s.L(x + hx, y + hy, x - 1 + hx, y - h + hy, 1.2, 'coral', 0.7)
        s.L(x - 0.5 + hx, y - h * 0.5 + hy, x + 3 + hx, y - h * 0.7 + hy, 0.8, 'coral')
        s.E(x - 1 + hx, y - h + hy, 1.3, 1.3, 'pearl')
      }
      s.E(58 + hx, 50 + hy, 11.5, 10.5, 'royalv')
      s.E(60 + hx, 58 + hy + j * 0.5, 8, 2.6, 'pearl')
      s.E(62 + hx, 54 + hy, 3.4, 2.2, 'pearl')
      for (let i = 0; i < 7; i++) {
        const a = 0.3 + i * 0.32
        s.E(56 + hx + Math.cos(a) * 9, 52 + hy + Math.sin(a) * 6, 1.3, 1.3, 'pearl')
      }
      s.L(64 + hx, 44 + hy, 72 + hx, 28 + hy, 1.6, 'gold')
      s.spike(72 + hx, 28 + hy, 8, 1.4, 'gold')
      s.spike(68.5 + hx, 30 + hy, 5, 1.1, 'gold', -2)
      s.spike(75.5 + hx, 30 + hy, 5, 1.1, 'gold', 2)
      s.E(72 + hx, 29 + hy, 2.6, 1.2, 'gold')
      s.E(48 + bx + P.fl[0] * 0.3, 64 + by + P.fl[1], 6, 2.8, 'royalv')
      s.line(
        [
          [43 + bx + P.fl[0] * 0.3, 66 + by + P.fl[1]],
          [53 + bx + P.fl[0] * 0.3, 66 + by + P.fl[1]],
        ],
        '#f2c13a'
      )
      if (j > 1)
        s.line(
          [
            [58 + hx, 57 + hy],
            [67 + hx, 56 + hy + j * 0.5],
          ],
          '#160a38'
        )
      s.eye(61 + hx, 47 + hy, 'fierce')
      if (P.glow) {
        glowMouth(s, 72 + hx, 21 + hy)
        s.d(72 + hx, 19 + hy, '#ffffff')
      }
    },
    glows: [
      [72, 21, '#fff3a8', 8],
      [46, 42, '#ff3b6a', 2],
      [30, 42, '#7ee7ff', 2],
      [38, 40, '#7ee7ff', 2],
    ],
    emit: [
      { x: 42, y: 36, type: 'mist', rate: 4 },
      { x: 72, y: 20, type: 'sparkle', rate: 4 },
      { x: 30, y: 64, type: 'bubble', rate: 2 },
    ],
    mouth: [72, 22],
  },
  leviathan: {
    size: 80,
    rig: SWIM,
    aura: { type: 'whirl', x: 36, y: 70, r: 30 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 3
      const coil = []
      for (let i = 0; i < 18; i++) {
        const a = Math.PI * 0.1 + (i / 18) * Math.PI * 1.9 + t * 0.05
        coil.push([
          36 + Math.cos(a) * 21 + bx * 0.3,
          66 + Math.sin(a) * 7 + by * 0.3,
          5.4 + i * 0.06,
        ])
      }
      const neck = []
      for (let i = 0; i <= 16; i++) {
        const u = i / 16
        neck.push([
          56 - Math.sin(u * Math.PI) * 9 + u * 6 + (hx - bx) * u + bx * (1 - u),
          64 - u * 42 + (hy - by) * u + by * (1 - u),
          6.2 - u * 1.6,
        ])
      }
      const back = coil.filter(([, y]) => y < 66 + by * 0.3),
        front = coil.filter(([, y]) => y >= 66 + by * 0.3)
      back.forEach(([x, y, r]) => s.E(x, y, r, r, 'levi2'))
      neck.forEach(([x, y, r], i) => {
        if (i % 2 === 0 && i < 15) {
          s.P(
            [
              [x - 2, y - r + 1],
              [x - 7, y - r - 5],
              [x - 1, y - r + 2],
            ],
            'finglass'
          )
          s.line(
            [
              [x - 2, y - r],
              [x - 6, y - r - 4],
            ],
            '#4ad4ff'
          )
        }
      })
      neck.forEach(([x, y, r]) => s.E(x, y, r, r, 'levi'))
      neck.forEach(([x, y, r], i) => {
        if (i < 15) {
          s.d(x + r - 1, y, '#e8e08a').d(x + r - 2, y + 1, '#c4bc5a')
          if (i % 2) s.d(x - 1, y - 1, '#043a36').d(x, y - 2, '#043a36')
        }
      })
      front.forEach(([x, y, r]) => s.E(x, y, r, r, 'levi'))
      front.forEach(([x, y, r], i) => {
        s.d(x, y + r - 1, '#e8e08a')
        if (i % 2) s.d(x - 1, y - 1, '#043a36').d(x + 1, y - 1, '#043a36')
      })
      const [ex, ey] = neck[16]
      s.P(
        [
          [ex - 6, ey - 2],
          [ex - 14, ey - 6],
          [ex - 9, ey + 1],
          [ex - 15, ey + 4],
          [ex - 6, ey + 3],
        ],
        'foam'
      )
      s.L(ex - 2, ey - 3, ex - 14, ey - 11, 1.6, 'bone', 0.6)
      s.L(ex, ey - 4, ex - 9, ey - 15, 1.4, 'bone', 0.5)
      s.L(ex + 3, ey - 4, ex - 2, ey - 14, 1.1, 'bone', 0.4)
      s.E(ex + 2, ey - 1, 8, 6.4, 'levi')
      s.E(ex + 10, ey + 1, 6.5, 4, 'levi')
      s.P(
        [
          [ex, ey + 4],
          [ex + 16, ey + 3 + j],
          [ex + 13, ey + 7 + j],
          [ex + 2, ey + 7],
        ],
        'levi2'
      )
      for (const x of [6, 9, 12, 15])
        s.d(ex + x, ey + 3.4, '#ffffff').d(ex + x, ey + 4.4, '#ffffff')
      if (j > 1) {
        s.line(
          [
            [ex + 3, ey + 4.5],
            [ex + 14, ey + 4 + j * 0.6],
          ],
          '#ff4a5a'
        )
        for (const x of [7, 11]) s.d(ex + x, ey + 4 + j * 0.8, '#ffffff')
      }
      s.line(
        [
          [ex + 12, ey + 2],
          [ex + 16, ey + 6],
          [ex + 17, ey + 11],
        ],
        '#4ad4ff'
      )
      s.d(ex + 4, ey - 3, '#e0ffff')
        .d(ex + 5, ey - 3, '#7ee7ff')
        .d(ex + 3, ey - 4, '#021616')
        .d(ex + 4, ey - 4, '#021616')
        .d(ex + 5, ey - 4, '#021616')
      if (P.glow) glowMouth(s, ex + 16, ey + 4 + j * 0.5)
    },
    glows: [[62, 19, '#7ee7ff', 4]],
    emit: [
      { x: 36, y: 64, type: 'mist', rate: 5 },
      { x: 18, y: 68, type: 'bubble', rate: 3 },
      { x: 58, y: 68, type: 'drop', rate: 2 },
      { x: 52, y: 14, type: 'glint', rate: 1.5 },
    ],
    mouth: [72, 22],
  },
  /* ----- Ultimate whale: three simpler options with a sharp horn (no trident) ----- */
  whaleA: {
    size: 80,
    rig: SWIM,
    hover: 9,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 2.4
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      s.L(18 + bx, 52 + by, 10 + bx, 48 + by - t, 4.5, 'narw', 3)
      s.P(
        m(
          [
            [2, 35],
            [9, 42],
            [14, 48],
            [9, 54],
            [2, 61],
            [7, 48],
          ],
          bx,
          by - t * 1.6
        ),
        'narw'
      )
      s.E(44 + bx + P.bl[0] * 0.3, 64 + by + P.bl[1], 5, 2.4, 'narw2')
      s.E(36 + bx, 50 + by, 22, 13, 'narw')
      s.E(40 + bx, 58 + by, 17, 4, 'pearl')
      s.P(
        m(
          [
            [28, 39],
            [33, 34],
            [38, 38],
          ],
          bx,
          by
        ),
        'narw'
      )
      for (const [x, y] of [
        [24, 46],
        [31, 44],
        [42, 45],
        [20, 52],
      ])
        s.d(x + bx, y + by, '#a8c8f0')
      s.E(56 + hx, 50 + hy, 11, 10, 'narw')
      s.E(59 + hx, 58 + hy + j * 0.5, 7, 2.2, 'pearl')
      s.L(64 + hx, 44 + hy, 78 + hx, 28 + hy, 2, 'bone', 0.5)
      for (let q = 1; q < 7; q++) s.d(64 + hx + q * 2, 44 + hy - q * 2.3, '#9a9080')
      s.E(48 + bx + P.fl[0] * 0.3, 64 + by + P.fl[1], 6, 2.6, 'narw')
      if (j > 1)
        s.line(
          [
            [56 + hx, 57 + hy],
            [65 + hx, 56 + hy + j * 0.5],
          ],
          '#0a1028'
        )
      s.eye(60 + hx, 47 + hy, 'fierce')
      if (P.glow) glowMouth(s, 78 + hx, 27 + hy)
    },
    emit: [
      { x: 40, y: 37, type: 'mist', rate: 3 },
      { x: 30, y: 64, type: 'bubble', rate: 1.5 },
    ],
    mouth: [78, 28],
  },
  whaleB: {
    size: 80,
    rig: SWIM,
    hover: 8,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 2.6
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      s.L(16 + bx, 54 + by, 8 + bx, 50 + by - t, 4.5, 'brute', 3)
      s.P(
        m(
          [
            [1, 37],
            [8, 44],
            [13, 50],
            [8, 56],
            [1, 63],
            [6, 50],
          ],
          bx,
          by - t * 1.6
        ),
        'brute'
      )
      s.E(42 + bx + P.bl[0] * 0.3, 66 + by + P.bl[1], 5, 2.4, 'brute2')
      s.E(32 + bx, 53 + by, 20, 12, 'brute')
      s.E(36 + bx, 61 + by, 15, 3.6, 'pearl')
      s.L(50 + hx, 38 + hy, 55 + hx, 31 + hy, 2, 'horn', 1.2)
      s.L(55 + hx, 31 + hy, 60 + hx, 29 + hy, 1.2, 'horn', 0.4)
      s.P(
        m(
          [
            [42, 48],
            [52, 37],
            [66, 37],
            [70, 46],
            [68, 58],
            [44, 60],
          ],
          hx,
          hy
        ),
        'brute'
      )
      s.E(58 + hx, 60 + hy + j * 0.5, 9, 2.4, 'pearl')
      s.L(56 + hx, 38 + hy, 62 + hx, 30 + hy, 2.4, 'bone', 1.4)
      s.L(62 + hx, 30 + hy, 69 + hx, 28 + hy, 1.4, 'bone', 0.4)
      s.line(
        m(
          [
            [46, 44],
            [50, 48],
          ],
          hx,
          hy
        ),
        '#a6cccc'
      ).line(
        m(
          [
            [26, 48],
            [29, 51],
          ],
          bx,
          by
        ),
        '#a6cccc'
      )
      s.E(46 + bx + P.fl[0] * 0.3, 66 + by + P.fl[1], 6, 2.6, 'brute')
      if (j > 1)
        s.line(
          [
            [52 + hx, 59 + hy],
            [68 + hx, 58 + hy + j * 0.5],
          ],
          '#0a1618'
        )
      s.eye(62 + hx, 46 + hy, 'fierce')
      if (P.glow) glowMouth(s, 69 + hx, 28 + hy)
    },
    emit: [
      { x: 50, y: 37, type: 'mist', rate: 3 },
      { x: 30, y: 66, type: 'bubble', rate: 1.5 },
    ],
    mouth: [69, 28],
  },
  whaleC: {
    size: 80,
    rig: SWIM,
    hover: 9,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 2.4
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      // far pectoral fin, behind the body
      s.P(
        m(
          [
            [52, 53],
            [47, 59],
            [40, 65 + P.bl[1] * 0.6],
            [32, 70 + P.bl[1]],
            [34, 65 + P.bl[1]],
            [40, 58],
            [46, 53],
          ],
          bx,
          by
        ),
        'deepv2'
      )
      s.L(18 + bx, 52 + by, 10 + bx, 48 + by - t, 4.5, 'deepv', 3)
      s.P(
        m(
          [
            [2, 35],
            [9, 42],
            [14, 48],
            [9, 54],
            [2, 61],
            [7, 48],
          ],
          bx,
          by - t * 1.6
        ),
        'deepv'
      )
      s.E(36 + bx, 50 + by, 22, 13, 'deepv')
      s.E(40 + bx, 58 + by, 17, 4, 'pearl')
      // thick armour along the back: overlapping plates, crystals growing out of the seams
      const plates = [
        [20, 44, 6],
        [27, 40, 7],
        [35, 38, 7.5],
        [43, 38.5, 7],
        [50, 41, 6],
      ]
      for (const [x, y, r] of plates)
        s.P(
          m(
            [
              [x - r, y + 5],
              [x - r + 1.5, y - 1],
              [x - r * 0.3, y - 3.5],
              [x + r * 0.5, y - 3.5],
              [x + r, y],
              [x + r - 0.5, y + 5],
            ],
            bx,
            by
          ),
          'armorice'
        )
      for (const [x, y, r] of plates) {
        s.line(
          m(
            [
              [x - r + 2, y - 0.5],
              [x + r * 0.4, y - 2.5],
            ],
            bx,
            by
          ),
          '#b4c4e0'
        )
        s.line(
          m(
            [
              [x + r - 0.5, y + 1],
              [x + r - 0.5, y + 4],
            ],
            bx,
            by
          ),
          '#0c1220'
        )
      }
      s.spike(31 + bx, 37 + by, 5, 1.6, 'ice', -1)
      s.spike(39 + bx, 35.5 + by, 4, 1.4, 'ice', -1)
      s.spike(46.5 + bx, 36 + by, 3.5, 1.3, 'ice', -1)
      s.E(56 + hx, 50 + hy, 11, 10, 'deepv')
      s.E(59 + hx, 58 + hy + j * 0.5, 7, 2.2, 'pearl')
      s.P(
        m(
          [
            [48, 43],
            [52, 40],
            [60, 40],
            [63, 43],
            [50, 45],
          ],
          hx,
          hy
        ),
        'armorice'
      )
      s.line(
        m(
          [
            [51, 41.5],
            [59, 41],
          ],
          hx,
          hy
        ),
        '#b4c4e0'
      )
      s.spike(59 + hx, 41 + hy, 14, 2.4, 'ice', 4)
      s.spike(54 + hx, 41 + hy, 8, 1.7, 'ice', -1)
      s.spike(64 + hx, 43 + hy, 7, 1.6, 'ice', 4)
      // near pectoral fin: a whale flipper sweeping back from behind the head
      s.P(
        m(
          [
            [58, 54],
            [54, 61],
            [46, 68 + P.fl[1] * 0.6],
            [36, 75 + P.fl[1]],
            [37, 69 + P.fl[1]],
            [44, 61],
            [50, 54],
          ],
          bx,
          by
        ),
        'deepv'
      )
      s.line(
        m(
          [
            [55, 56],
            [39, 72 + P.fl[1]],
          ],
          bx,
          by
        ),
        '#a8a4f4'
      ).line(
        m(
          [
            [57, 57],
            [46, 66],
          ],
          bx,
          by
        ),
        '#2a2272'
      )
      if (j > 1)
        s.line(
          [
            [56 + hx, 57 + hy],
            [65 + hx, 56 + hy + j * 0.5],
          ],
          '#120c30'
        )
      s.eye(61 + hx, 47 + hy, 'fierce')
      if (P.glow) glowMouth(s, 63 + hx, 27 + hy)
    },
    glows: [[63, 28, '#7ee7ff', 6, 'head']],
    emit: [
      { x: 40, y: 34, type: 'mist', rate: 3 },
      { x: 63, y: 28, type: 'glint', rate: 2 },
      { x: 30, y: 64, type: 'bubble', rate: 1.5 },
    ],
    mouth: [63, 28],
  },
  /* ----- Tide fused form (สมุทรผู้ตื่น): a roaring sea dragon rising in an S-curve.
     The belly always faces one side of the path (front/below), the back the other. ----- */
  wfused: {
    size: 88,
    rig: SWIM,
    hover: 5,
    aura: { type: 'twinw', x: 34, y: 66, r: 34 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 4.5,
        w = -3 * P.wing
      const C = [
        [3, 54],
        [3, 70],
        [14, 80],
        [32, 79],
        [45, 68],
        [47, 52],
        [42, 40],
        [47, 28],
        [58, 21],
      ]
      const raw = []
      for (let i = 0; i < C.length - 1; i++) {
        const p0 = C[Math.max(0, i - 1)],
          p1 = C[i],
          p2 = C[i + 1],
          p3 = C[Math.min(C.length - 1, i + 2)]
        for (let k = 0; k < 6; k++) {
          const u = k / 6,
            u2 = u * u,
            u3 = u2 * u,
            f = (a, b, c, d) =>
              0.5 *
              (2 * b +
                (-a + c) * u +
                (2 * a - 5 * b + 4 * c - d) * u2 +
                (-a + 3 * b - 3 * c + d) * u3)
          raw.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])])
        }
      }
      raw.push(C[C.length - 1])
      const n = raw.length,
        pts = raw.map(([x, y], i) => {
          const q = i / (n - 1)
          return [
            x + bx * (1 - q) + hx * q + Math.sin(q * Math.PI * 2 + t * 0.6) * 2 * (1 - q),
            y + by * (1 - q) + hy * q,
          ]
        })
      const rad = (q) =>
        q < 0.14
          ? 1.8 + (q / 0.14) * 3.4
          : q < 0.62
            ? 5.2 + ((q - 0.14) / 0.48) * 3
            : 8.2 - ((q - 0.62) / 0.38) * 2.4
      // back = left of the direction of travel (tail -> head); belly = right of it
      const back = (i) => {
        const a = pts[Math.max(0, i - 1)],
          b = pts[Math.min(n - 1, i + 1)]
        const dx = b[0] - a[0],
          dy = b[1] - a[1],
          L = Math.hypot(dx, dy) || 1
        return [dy / L, -dx / L]
      }
      const [tx0, ty0] = pts[0]
      // big crescent tail fin
      s.P(
        [
          [tx0 + 1, ty0 + 2],
          [tx0 - 7, ty0 - 9],
          [tx0 - 2, ty0 - 2],
          [tx0 + 6, ty0 - 12],
          [tx0 + 4, ty0 + 1],
        ],
        'finglass'
      )
      s.line(
        [
          [tx0, ty0 + 1],
          [tx0 - 6, ty0 - 8],
        ],
        '#4ad4ff'
      ).line(
        [
          [tx0 + 1, ty0],
          [tx0 + 5, ty0 - 11],
        ],
        '#4ad4ff'
      )
      // far shoulder fin-wing (behind the body)
      const si = Math.round(n * 0.6),
        [sx0, sy0] = pts[si]
      s.P(
        [
          [sx0 - 2, sy0 - 2],
          [sx0 - 18, sy0 - 16 + w],
          [sx0 - 14, sy0 - 8 + w * 0.5],
          [sx0 - 20, sy0 - 4 + w * 0.5],
          [sx0 - 6, sy0 + 3],
        ],
        'finglass'
      )
      s.line(
        [
          [sx0 - 3, sy0 - 2],
          [sx0 - 17, sy0 - 15 + w],
        ],
        '#4ad4ff'
      ).line(
        [
          [sx0 - 4, sy0],
          [sx0 - 19, sy0 - 4 + w * 0.5],
        ],
        '#4ad4ff'
      )
      // one continuous dorsal sail along the back, with spines
      const edge = [],
        tips = []
      for (let i = Math.round(n * 0.16); i <= Math.round(n * 0.93); i++) {
        const q = i / (n - 1),
          [x, y] = pts[i],
          [bxn, byn] = back(i),
          r = rad(q),
          h = r + 4 + (i % 3 === 0 ? 4 : 1.5) + w * 0.3
        edge.push([x + bxn * (r - 1), y + byn * (r - 1)])
        tips.push([x + bxn * h, y + byn * h, i % 3 === 0])
      }
      s.P([...edge, ...tips.map(([x, y]) => [x, y]).reverse()], 'finglass')
      tips.forEach(([x, y, big], k) => {
        if (big) {
          const [ex0, ey0] = edge[k]
          s.line(
            [
              [ex0, ey0],
              [x, y],
            ],
            '#4ad4ff'
          )
        }
      })
      pts.forEach(([x, y], i) => {
        const r = rad(i / (n - 1))
        s.E(x, y, r, r, 'serp')
      })
      // belly plates (gold, on the belly side), scale marks on the back, glowing lateral line
      pts.forEach(([x, y], i) => {
        const q = i / (n - 1)
        if (q < 0.1 || q > 0.97) return
        const [bxn, byn] = back(i),
          r = rad(q)
        s.E(x - bxn * r * 0.58, y - byn * r * 0.58, r * 0.48, r * 0.48, 'serpb')
        if (i % 2 === 0) s.d(x - bxn * r * 0.9, y - byn * r * 0.9, '#9a6a12')
        if (i % 2)
          s.d(x + bxn * r * 0.55, y + byn * r * 0.55, '#03141a').d(
            x + bxn * r * 0.3,
            y + byn * r * 0.3,
            '#2a909a'
          )
        if (i % 2 === 0 && q > 0.15) s.d(x, y, '#4ad4ff')
      })
      // near shoulder fin-wing (in front)
      s.P(
        [
          [sx0 + 2, sy0 + 1],
          [sx0 + 20, sy0 + 8 + P.fl[1]],
          [sx0 + 15, sy0 + 11 + P.fl[1]],
          [sx0 + 18, sy0 + 15 + P.fl[1]],
          [sx0 + 4, sy0 + 7],
        ],
        'finglass'
      )
      s.line(
        [
          [sx0 + 3, sy0 + 2],
          [sx0 + 19, sy0 + 9 + P.fl[1]],
        ],
        '#4ad4ff'
      ).line(
        [
          [sx0 + 4, sy0 + 5],
          [sx0 + 17, sy0 + 14 + P.fl[1]],
        ],
        '#4ad4ff'
      )
      // head: crest, swept-back horns, long snout, roaring jaw
      const [ex, ey] = pts[n - 1]
      s.P(
        [
          [ex - 1, ey - 4],
          [ex - 14, ey - 13],
          [ex - 8, ey - 4],
          [ex - 16, ey - 1],
          [ex - 7, ey + 1],
          [ex - 13, ey + 7],
          [ex - 2, ey + 3],
        ],
        'finglass'
      )
      s.line(
        [
          [ex - 2, ey - 4],
          [ex - 13, ey - 12],
        ],
        '#4ad4ff'
      ).line(
        [
          [ex - 3, ey],
          [ex - 15, ey - 1],
        ],
        '#4ad4ff'
      )
      s.L(ex + 1, ey - 5, ex - 9, ey - 13, 1.6, 'ice', 0.5)
      s.L(ex + 5, ey - 6, ex - 3, ey - 16, 1.4, 'ice', 0.4)
      s.E(ex + 3, ey, 8, 6.6, 'serp')
      s.P(
        [
          [ex + 6, ey - 4],
          [ex + 23, ey - 1],
          [ex + 23, ey + 3],
          [ex + 6, ey + 4],
        ],
        'serp'
      )
      s.E(ex + 6, ey - 5, 6.5, 2, 'serp2')
      s.line(
        [
          [ex + 1, ey - 6],
          [ex + 10, ey - 5],
          [ex + 22, ey - 2],
        ],
        '#86dce0'
      )
      s.P(
        [
          [ex + 2, ey + 4],
          [ex + 22, ey + 4 + j],
          [ex + 19, ey + 8 + j],
          [ex + 4, ey + 8],
        ],
        'serp2'
      )
      s.P(
        [
          [ex + 4, ey + 6],
          [ex + 19, ey + 6 + j],
          [ex + 17, ey + 8 + j],
          [ex + 5, ey + 8],
        ],
        'serpb'
      )
      if (j > 1)
        s.P(
          [
            [ex + 4, ey + 3.5],
            [ex + 21, ey + 3.5],
            [ex + 19, ey + 3 + j],
            [ex + 5, ey + 4 + j * 0.7],
          ],
          'maw'
        )
      for (const x of [7, 11, 15, 19]) s.d(ex + x, ey + 3, '#ffffff').d(ex + x, ey + 4, '#ffffff')
      for (const x of [9, 13, 17])
        s.d(ex + x, ey + 3 + j, '#ffffff').d(ex + x, ey + 2 + j, '#ffffff')
      s.d(ex + 22, ey - 1, '#03141a')
      s.P(
        [
          [ex, ey + 2],
          [ex - 6, ey + 7],
          [ex + 2, ey + 6],
        ],
        'finglass'
      )
      s.line(
        [
          [ex + 18, ey + 1],
          [ex + 22, ey + 6],
          [ex + 22, ey + 14],
          [ex + 19, ey + 19],
        ],
        '#7ee7ff'
      ).line(
        [
          [ex + 15, ey + 2],
          [ex + 16, ey + 9],
          [ex + 13, ey + 15],
        ],
        '#7ee7ff'
      )
      s.d(ex + 5, ey - 3, '#fff3a8')
        .d(ex + 6, ey - 3, '#ffb02a')
        .d(ex + 7, ey - 3, '#ffb02a')
        .d(ex + 4, ey - 4, '#03141a')
        .d(ex + 5, ey - 4, '#03141a')
        .d(ex + 6, ey - 4, '#03141a')
        .d(ex + 7, ey - 4, '#03141a')
        .d(ex + 8, ey - 4, '#03141a')
      if (P.glow) glowMouth(s, ex + 22, ey + 4 + j * 0.5)
    },
    glows: [
      [64, 18, '#ffb02a', 3],
      [49, 7, '#7ee7ff', 3],
    ],
    emit: [
      { x: 34, y: 74, type: 'mist', rate: 5 },
      { x: 72, y: 30, type: 'drop', rate: 2 },
      { x: 49, y: 7, type: 'glint', rate: 2 },
      { x: 14, y: 78, type: 'bubble', rate: 3 },
    ],
    mouth: [80, 25],
  },
  turtle: {
    size: 96,
    rig: QUAD,
    aura: { type: 'bossw', x: 46, y: 84, r: 36 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        j = P.jaw * 4
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      s.L(10 + bx, 70 + by, 4 + bx, 74 + by, 3, 'tskin', 1.5)
      s.E(26 + P.bf[0], 82 + P.bf[1], 6, 7, 'tskin2')
      s.E(66 + P.ff[0], 82 + P.ff[1], 6, 7, 'tskin2')
      s.E(26 + P.bf[0], 88 + P.bf[1], 7, 2.4, 'tskin2')
      s.E(66 + P.ff[0], 88 + P.ff[1], 7, 2.4, 'tskin2')
      s.E(46 + bx, 72 + by, 30, 8, 'tbelly')
      s.E(46 + bx, 56 + by, 31, 20, 'tshell')
      s.P(
        m(
          [
            [16, 62],
            [76, 62],
            [78, 70],
            [14, 70],
          ],
          bx,
          by
        ),
        'tshell2'
      )
      for (const [x, y] of [
        [34, 48],
        [46, 44],
        [58, 48],
        [28, 60],
        [46, 58],
        [64, 60],
      ])
        s.P(
          m(
            [
              [x - 6, y],
              [x - 3, y - 5],
              [x + 3, y - 5],
              [x + 6, y],
              [x + 3, y + 5],
              [x - 3, y + 5],
            ],
            bx,
            by
          ),
          'tshell2'
        )
      for (const [x, y] of [
        [34, 48],
        [46, 44],
        [58, 48],
        [28, 60],
        [46, 58],
        [64, 60],
      ])
        s.d(x - 1 + bx, y - 2 + by, '#b8c87e').d(x + bx, y - 2 + by, '#b8c87e')
      for (const [x, y, h] of [
        [36, 37, 12],
        [42, 35, 16],
        [50, 36, 10],
        [56, 39, 13],
      ]) {
        s.L(x + bx, y + by, x - 1 + bx, y - h + by, 1.6, 'coral', 1)
        s.L(x - 0.5 + bx, y - h * 0.5 + by, x + 3 + bx, y - h * 0.75 + by, 1, 'coral', 0.6)
        s.L(x + bx, y - h * 0.3 + by, x - 3 + bx, y - h * 0.55 + by, 0.9, 'coral', 0.5)
      }
      s.E(46 + bx, 38 + by, 9, 3, 'rock')
      s.E(44 + bx, 36 + by, 5, 2, 'rock')
      s.E(32 + P.bl[0], 80 + P.bl[1], 7, 8, 'tskin')
      s.E(32 + P.bl[0], 87 + P.bl[1], 8, 2.6, 'tskin')
      s.E(62 + P.fl[0], 80 + P.fl[1], 7, 8, 'tskin')
      s.E(62 + P.fl[0], 87 + P.fl[1], 8, 2.6, 'tskin')
      for (const x of [27, 31, 35]) s.d(x + P.bl[0], 89 + P.bl[1], '#f4ede0')
      for (const x of [57, 61, 65]) s.d(x + P.fl[0], 89 + P.fl[1], '#f4ede0')
      s.L(74 + bx, 62 + by, 80 + hx, 56 + hy, 7, 'tskin', 6)
      s.E(84 + hx, 52 + hy, 9, 7.5, 'tskin')
      s.P(
        m(
          [
            [86, 52],
            [94, 55],
            [90, 58],
          ],
          hx,
          hy
        ),
        'bone'
      )
      s.P(
        m(
          [
            [78, 58],
            [92, 58 + j],
            [88, 62 + j],
            [80, 61],
          ],
          hx,
          hy
        ),
        'tskin2'
      )
      if (j > 1)
        s.P(
          m(
            [
              [80, 57.5],
              [91, 57.8],
              [88, 58 + j],
              [81, 59 + j * 0.5],
            ],
            hx,
            hy
          ),
          'foam'
        )
      s.line(
        m(
          [
            [78, 47],
            [82, 46],
            [86, 47],
          ],
          hx,
          hy
        ),
        '#2a4a50'
      )
      s.eye(85 + hx, 50 + hy, 'glow')
      s.d(85 + hx, 50 + hy, '#e0ffff')
        .d(86 + hx, 50 + hy, '#e0ffff')
        .d(84 + hx, 50 + hy, '#7ee7ff')
        .d(87 + hx, 50 + hy, '#7ee7ff')
      if (P.glow) {
        glowMouth(s, 92 + hx, 58 + hy + j * 0.5)
      }
    },
    emit: [
      { x: 18, y: 62, type: 'fall', rate: 6 },
      { x: 74, y: 62, type: 'fall', rate: 6 },
      { x: 46, y: 70, type: 'mist', rate: 5 },
      { x: 44, y: 30, type: 'bubble', rate: 2 },
    ],
    mouth: [92, 58],
  },
})
