'use strict'
// leaf sprites, added to the shared SPRITES table.
Object.assign(SPRITES, {
  /* ----- Leaf line: wild animals with plants growing on them (deer, wolf, stump, mushroom) ----- */
  legg: {
    size: 48,
    rig: BLOB,
    draw(s, P) {
      const bx = P.body[0] * 0.6,
        by = P.body[1] * 0.3
      s.E(24 + bx, 31 + by, 9, 12, 'eggl')
      leafShape(s, 16 + bx, 37 + by, 10, -0.75, 2.6, 'leafg', '#b0f490')
      leafShape(s, 32 + bx, 39 + by, 9, -2.35, 2.3, 'leafg2', '#68c060')
      s.E(28 + bx, 25 + by, 1.6, 1.2, 'leafg')
      s.E(20 + bx, 27 + by, 1.2, 1, 'leafg')
      s.E(25 + bx, 34 + by, 1, 0.9, 'leafg')
      s.L(24 + bx, 20 + by, 24.5 + bx, 15 + by, 0.7, 'vine')
      leafShape(s, 24.5 + bx, 15.5 + by, 5.5, -2.6, 1.7, 'leafg', '#b0f490')
      leafShape(s, 24.5 + bx, 15.5 + by, 5.5, -0.55, 1.7, 'leafg', '#b0f490')
      s.d(20 + bx, 23 + by, '#ffffff')
        .d(19 + bx, 24 + by, '#ffffff')
        .d(19 + bx, 25 + by, '#e8f4cc')
    },
    emit: [{ x: 24, y: 14, type: 'pollen', rate: 1.5 }],
    mouth: [24, 28],
  },
  seed: {
    size: 48,
    rig: BLOB,
    draw(s, P) {
      const [bx, by] = P.body,
        m = (pts) => pts.map(([x, y]) => [x + bx, y + by])
      s.E(19, 42 + P.bl[1], 2.6, 1.6, 'bark2')
      s.E(29, 42 + P.fl[1], 2.6, 1.6, 'bark2')
      s.E(24 + bx, 34 + by, 8, 7, 'acorn')
      s.P(
        m([
          [17, 35],
          [31, 35],
          [25.5, 43],
          [22.5, 43],
        ]),
        'acorn'
      )
      s.E(24 + bx, 28 + by, 9.5, 4.2, 'bark')
      for (let x = 17; x <= 31; x += 3)
        s.d(x + bx, 27 + by, '#3e2614').d(x + 1 + bx, 29 + by, '#3e2614')
      s.L(24 + bx, 24.5 + by, 25 + bx, 21 + by, 0.9, 'bark')
      s.L(25 + bx, 21 + by, 27 + bx, 17 + by, 0.6, 'vine')
      leafShape(s, 27 + bx, 17 + by, 7, -0.35 - P.glow * 0.3, 2, 'leafg', '#b0f490')
      leafShape(s, 26 + bx, 18 + by, 4.5, -2.6, 1.4, 'leafg')
      s.eye(20 + bx, 32 + by, 'big').eye(26 + bx, 32 + by, 'big')
      s.d(18 + bx, 36 + by, '#ff9a80').d(29 + bx, 36 + by, '#ff9a80')
      s.d(23 + bx, 37 + by, '#3a1e08').d(24 + bx, 37 + by, '#3a1e08')
      if (P.jaw > 0.5) s.d(23 + bx, 38 + by, '#3a1e08').d(24 + bx, 38 + by, '#ff6a6a')
    },
    emit: [{ x: 30, y: 15, type: 'pollen', rate: 1.2 }],
    mouth: [29, 36],
  },
  sprout: {
    size: 48,
    rig: BLOB,
    draw(s, P) {
      const [bx, by] = P.body,
        sw = P.glow ? 0.3 : 0,
        fl = P.body[1] * 0.06
      s.L(19 + bx * 0.5, 40, 15, 44 + P.bl[1], 1.3, 'bark', 0.6)
      s.L(29 + bx * 0.5, 40, 33, 44 + P.fl[1], 1.3, 'bark', 0.6)
      leafShape(s, 21 + bx, 27 + by, 14, -2.25 - sw + fl, 4.2, 'leafg', '#b0f490')
      leafShape(s, 27 + bx, 27 + by, 13, -0.8 + sw - fl, 3.8, 'leafg', '#b0f490')
      s.E(24 + bx, 34 + by, 9.5, 8.5, 'bud')
      s.E(24 + bx, 37.5 + by, 6, 3.5, 'budl')
      s.L(24 + bx, 26 + by, 24 + bx, 23 + by, 0.7, 'vine')
      s.E(24 + bx, 22 + by, 1.6, 1.4, 'petal')
      s.d(24 + bx, 22 + by, '#fff27a')
      s.eye(19 + bx, 31 + by, 'big').eye(27 + bx, 31 + by, 'big')
      s.d(17 + bx, 35 + by, '#ff9ab0')
        .d(18 + bx, 35 + by, '#ff9ab0')
        .d(30 + bx, 35 + by, '#ff9ab0')
        .d(31 + bx, 35 + by, '#ff9ab0')
      s.d(23 + bx, 36 + by, '#1e4a1a')
        .d(24 + bx, 37 + by, '#1e4a1a')
        .d(25 + bx, 36 + by, '#1e4a1a')
      if (P.jaw > 0.5) s.d(24 + bx, 38 + by, '#ff6a8a')
    },
    emit: [
      { x: 12, y: 18, type: 'leaf', rate: 0.5 },
      { x: 24, y: 20, type: 'pollen', rate: 1.2 },
    ],
    mouth: [29, 36],
  },
  leafdeer: {
    size: 56,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 1.6
      s.L(17 + bx, 43 + by, 16 + P.bf[0], 51 + P.bf[1], 1.3, 'fawn2')
      s.L(33 + bx, 43 + by, 34 + P.ff[0], 51 + P.ff[1], 1.3, 'fawn2')
      s.d(16 + P.bf[0], 52 + P.bf[1], '#2a1408').d(34 + P.ff[0], 52 + P.ff[1], '#2a1408')
      leafShape(s, 14 + bx, 37 + by, 6, -2.5 - t * 0.15, 2, 'leafg', '#b0f490')
      s.E(25 + bx, 40 + by, 11.5, 6.2, 'fawn')
      s.E(26 + bx, 44 + by, 8, 2, 'cream')
      for (const [x, y] of [
        [18, 37],
        [22, 36],
        [26, 37],
        [30, 36],
        [20, 40],
        [25, 40],
        [29, 39],
      ])
        s.d(x + bx, y + by, '#f8e4b4')
      s.L(20 + bx, 43 + by, 20 + P.bl[0], 52 + P.bl[1], 1.5, 'fawn')
      s.L(31 + bx, 43 + by, 32 + P.fl[0], 52 + P.fl[1], 1.5, 'fawn')
      s.d(20 + P.bl[0], 53 + P.bl[1], '#2a1408')
        .d(21 + P.bl[0], 53 + P.bl[1], '#2a1408')
        .d(32 + P.fl[0], 53 + P.fl[1], '#2a1408')
        .d(33 + P.fl[0], 53 + P.fl[1], '#2a1408')
      s.L(33 + bx, 38 + by, 39 + hx, 29 + hy, 3.2, 'fawn', 2.5)
      s.E(34 + bx, 40 + by, 3, 3, 'cream')
      // twig antlers with leaves
      s.L(39 + hx, 23 + hy, 37 + hx, 15 + hy, 0.8, 'bark')
      s.L(38 + hx, 19 + hy, 34 + hx, 17 + hy, 0.6, 'bark')
      s.L(43 + hx, 23 + hy, 45 + hx, 15 + hy, 0.8, 'bark')
      s.L(44 + hx, 19 + hy, 48 + hx, 17 + hy, 0.6, 'bark')
      leafShape(s, 37 + hx, 15 + hy, 5, -1.9, 1.6, 'leafg', '#b0f490')
      leafShape(s, 34 + hx, 17 + hy, 4, -2.7, 1.3, 'leafg')
      leafShape(s, 45 + hx, 15 + hy, 5, -1.3, 1.6, 'leafg', '#b0f490')
      leafShape(s, 48 + hx, 17 + hy, 4, -0.5, 1.3, 'leafg')
      leafShape(s, 38 + hx, 26 + hy, 6, -2.8, 1.9, 'fawn')
      s.d(35 + hx, 25 + hy, '#e06a9a').d(36 + hx, 25 + hy, '#e06a9a')
      s.E(41 + hx, 27 + hy, 4.6, 4, 'fawn')
      s.E(46 + hx, 29 + hy, 3.4, 2.4, 'fawn')
      s.E(48 + hx, 30.5 + hy + j * 0.5, 2, 1.3, 'cream')
      if (j > 1)
        s.line(
          [
            [45 + hx, 31 + hy],
            [49 + hx, 31 + hy + j * 0.5],
          ],
          '#3a1408'
        )
      s.d(50 + hx, 29 + hy, '#1a0a04').d(49 + hx, 28 + hy, '#1a0a04')
      s.eye(42 + hx, 25 + hy, 'big')
      if (P.glow) glowSap(s, 50 + hx, 31 + hy)
    },
    emit: [
      { x: 37, y: 13, type: 'leaf', rate: 0.6 },
      { x: 45, y: 13, type: 'pollen', rate: 1 },
    ],
    mouth: [50, 31],
  },
  mushroom: {
    size: 48,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] * 0.5 + bx,
        hy = P.head[1] * 0.5 + by,
        sq = P.glow ? 1 : 0
      s.E(16 + P.bf[0], 43 + P.bf[1], 2.6, 1.6, 'mbody2')
      s.E(32 + P.ff[0], 43 + P.ff[1], 2.6, 1.6, 'mbody2')
      s.E(22 + bx, 38 + by, 10, 5.5, 'mbody2')
      s.E(19 + P.bl[0], 43 + P.bl[1], 2.8, 1.8, 'mbody2')
      s.E(28 + P.fl[0], 43 + P.fl[1], 2.8, 1.8, 'mbody2')
      s.E(18 + bx, 29 + by - sq, 12 + sq, 6.5, 'mcap')
      s.E(18 + bx, 33.5 + by - sq, 10, 1.4, 'cream')
      for (let x = 10; x <= 26; x += 2) s.d(x + bx, 34 + by - sq, '#9a7e5e')
      for (const [x, y, r] of [
        [12, 27, 1.8],
        [18, 25, 2],
        [24, 27, 1.6],
        [9, 31, 1],
        [27, 31, 1.1],
        [21, 29.5, 1],
      ])
        s.E(x + bx, y + by - sq, r, r * 0.8, 'cream')
      s.E(32 + hx, 37 + hy, 6.5, 5.5, 'mbody')
      s.E(33 + hx, 39.5 + hy, 4, 2, 'cream')
      s.eye(30 + hx, 36 + hy, P.glow ? 'cute' : 'sleepy').eye(
        35 + hx,
        36 + hy,
        P.glow ? 'cute' : 'sleepy'
      )
      s.d(29 + hx, 38 + hy, '#ff9a80').d(37 + hx, 38 + hy, '#ff9a80')
      if (P.jaw > 0.5)
        s.d(33 + hx, 39 + hy, '#3a1e08')
          .d(33 + hx, 40 + hy, '#3a1e08')
          .d(34 + hx, 40 + hy, '#3a1e08')
      else s.d(33 + hx, 39 + hy, '#3a1e08').d(34 + hx, 39 + hy, '#3a1e08')
      if (P.glow) glowSap(s, 38 + hx, 39 + hy)
    },
    emit: [
      { x: 18, y: 24, type: 'spore', rate: 3 },
      { x: 36, y: 31, type: 'zz', rate: 0.5 },
    ],
    mouth: [38, 39],
  },
  wolf: {
    size: 56,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 2.2
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      s.L(14 + bx, 38 + by, 8 + bx, 36 + by - t * 0.5, 2.6, 'wolf', 3)
      s.L(8 + bx, 36 + by - t * 0.5, 4 + bx, 31 + by - t, 3, 'wolf', 1.8)
      leafShape(s, 4 + bx, 30 + by - t, 6, -2.2, 2, 'leafg', '#b0f490')
      leafShape(s, 4 + bx, 30 + by - t, 5, -1.4, 1.6, 'leafg')
      s.L(17 + bx, 42 + by, 16 + P.bf[0], 50 + P.bf[1], 1.8, 'wolf2')
      s.E(17 + P.bf[0], 51 + P.bf[1], 2.4, 1.2, 'wolf2')
      s.L(33 + bx, 42 + by, 34 + P.ff[0], 50 + P.ff[1], 1.8, 'wolf2')
      s.E(35 + P.ff[0], 51 + P.ff[1], 2.4, 1.2, 'wolf2')
      s.E(24 + bx, 39 + by, 12, 6, 'wolf')
      s.E(26 + bx, 43 + by, 8, 2, 'wolfb')
      s.E(22 + bx, 34 + by, 9, 2.2, 'moss')
      s.E(33 + bx, 36 + by, 5.5, 6, 'moss')
      for (const [x, y, a] of [
        [15, 34.5, -2.6],
        [20, 33, -2.4],
        [25, 32.5, -2.2],
        [30, 32, -2],
      ])
        leafShape(s, x + bx, y + by, 4.5, a, 1.5, 'leafg', '#b0f490')
      s.line(
        m(
          [
            [14, 41],
            [17, 39],
            [20, 41],
          ],
          bx,
          by
        ),
        '#2e4038'
      ).line(
        m(
          [
            [24, 40],
            [27, 38],
          ],
          bx,
          by
        ),
        '#2e4038'
      )
      s.L(20 + bx, 42 + by, 19 + P.bl[0], 50 + P.bl[1], 2.1, 'wolf')
      s.E(20 + P.bl[0], 51 + P.bl[1], 2.8, 1.3, 'wolf')
      s.L(31 + bx, 42 + by, 32 + P.fl[0], 50 + P.fl[1], 2.1, 'wolf')
      s.E(33 + P.fl[0], 51 + P.fl[1], 2.8, 1.3, 'wolf')
      s.spike(36 + hx, 27 + hy, 5, 1.8, 'wolf', -1)
      s.spike(40 + hx, 27.5 + hy, 4.5, 1.6, 'wolf')
      s.E(39 + hx, 31 + hy, 6, 5, 'wolf')
      s.P(
        m(
          [
            [41, 29],
            [50, 31.5],
            [50, 34],
            [41, 35],
          ],
          hx,
          hy
        ),
        'wolf'
      )
      s.P(
        m(
          [
            [41, 34.5],
            [49, 34 + j],
            [47, 36.5 + j],
            [41, 37],
          ],
          hx,
          hy
        ),
        'wolfb'
      )
      if (j > 1)
        s.line(
          [
            [43 + hx, 35 + hy],
            [49 + hx, 34.5 + hy + j * 0.5],
          ],
          '#3a0a10'
        )
      s.d(46 + hx, 35 + hy, '#ffffff')
        .d(48 + hx, 35 + hy, '#ffffff')
        .d(50 + hx, 31 + hy, '#0c1410')
        .d(51 + hx, 32 + hy, '#0c1410')
      s.d(41 + hx, 29 + hy, '#0c1410')
        .d(42 + hx, 29 + hy, '#0c1410')
        .d(42 + hx, 30 + hy, '#c8ff6a')
        .d(43 + hx, 30 + hy, '#0c1410')
      s.d(19 + P.bl[0], 52 + P.bl[1], '#f4ede0').d(32 + P.fl[0], 52 + P.fl[1], '#f4ede0')
      if (P.glow) glowSap(s, 51 + hx, 33 + hy)
    },
    glows: [[42, 30, '#c8ff6a', 2]],
    emit: [
      { x: 6, y: 26, type: 'leaf', rate: 0.8 },
      { x: 24, y: 30, type: 'pollen', rate: 1 },
    ],
    mouth: [51, 33],
  },
  stag: {
    size: 64,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 1.8
      s.L(19 + bx, 49 + by, 18 + P.bf[0], 59 + P.bf[1], 1.6, 'deer2')
      s.L(37 + bx, 49 + by, 38 + P.ff[0], 59 + P.ff[1], 1.6, 'deer2')
      s.d(18 + P.bf[0], 60 + P.bf[1], '#2a1408').d(38 + P.ff[0], 60 + P.ff[1], '#2a1408')
      leafShape(s, 15 + bx, 43 + by, 6, -2.6 - t * 0.15, 2, 'leafg', '#b0f490')
      s.E(28 + bx, 45 + by, 14, 7.5, 'deer')
      s.E(29 + bx, 50 + by, 10, 2.4, 'cream')
      s.E(26 + bx, 38.5 + by, 10, 2.4, 'moss')
      for (const [x, y] of [
        [18, 37],
        [24, 36],
        [31, 36],
      ]) {
        leafShape(s, x + bx, y + 1 + by, 4, -1.9, 1.3, 'leafg')
      }
      for (const [x, y] of [
        [19, 42],
        [24, 41],
        [29, 42],
        [34, 41],
        [22, 45],
        [27, 45],
      ])
        s.d(x + bx, y + by, '#f8d8b0')
      s.L(22 + bx, 50 + by, 22 + P.bl[0], 60 + P.bl[1], 1.9, 'deer')
      s.L(35 + bx, 50 + by, 36 + P.fl[0], 60 + P.fl[1], 1.9, 'deer')
      s.d(22 + P.bl[0], 61 + P.bl[1], '#2a1408')
        .d(23 + P.bl[0], 61 + P.bl[1], '#2a1408')
        .d(36 + P.fl[0], 61 + P.fl[1], '#2a1408')
        .d(37 + P.fl[0], 61 + P.fl[1], '#2a1408')
      s.L(38 + bx, 43 + by, 45 + hx, 33 + hy, 4, 'deer', 3.1)
      s.E(40 + bx, 45 + by, 4, 4.5, 'cream')
      // branch antlers with leaves and blossoms
      const A = (pts, r = 0.9) => {
        for (let i = 0; i < pts.length - 1; i++)
          s.L(
            pts[i][0] + hx,
            pts[i][1] + hy,
            pts[i + 1][0] + hx,
            pts[i + 1][1] + hy,
            r * (1 - i * 0.15),
            'antler',
            r * (1 - (i + 1) * 0.15)
          )
      }
      A([
        [49, 28],
        [51, 20],
        [55, 12],
      ])
      A(
        [
          [51, 20],
          [57, 16],
        ],
        0.7
      )
      A(
        [
          [53, 15],
          [50, 8],
        ],
        0.6
      )
      A(
        [
          [45, 28],
          [43, 19],
          [39, 11],
        ],
        1.1
      )
      A(
        [
          [43, 19],
          [36, 16],
        ],
        0.8
      )
      A(
        [
          [41, 14],
          [44, 6],
        ],
        0.7
      )
      A(
        [
          [39, 11],
          [34, 8],
        ],
        0.6
      )
      for (const [x, y, a] of [
        [39, 11, -2.2],
        [36, 16, -2.8],
        [44, 6, -1.4],
        [34, 8, -2.4],
        [55, 12, -1],
        [57, 16, -0.4],
        [50, 8, -1.8],
      ])
        leafShape(s, x + hx, y + hy, 5, a, 1.6, 'leafg', '#b0f490')
      for (const [x, y] of [
        [41, 14],
        [37, 13],
        [53, 15],
        [46, 9],
      ])
        flower(s, x + hx, y + hy)
      leafShape(s, 45 + hx, 31 + hy, 6, -2.9, 1.8, 'deer')
      s.d(42 + hx, 30 + hy, '#e06a9a').d(41 + hx, 30 + hy, '#e06a9a')
      s.E(48 + hx, 31 + hy, 5, 4.2, 'deer')
      s.E(54 + hx, 33 + hy, 3.6, 2.6, 'deer')
      s.E(56 + hx, 34.5 + hy + j * 0.5, 2, 1.4, 'cream')
      if (j > 1)
        s.line(
          [
            [52 + hx, 35 + hy],
            [57 + hx, 35 + hy + j * 0.5],
          ],
          '#3a1408'
        )
      s.d(58 + hx, 33 + hy, '#1a0a04').d(57 + hx, 32 + hy, '#1a0a04')
      s.eye(49 + hx, 29 + hy, 'cute')
      if (P.glow) glowSap(s, 58 + hx, 35 + hy)
    },
    glows: [
      [41, 14, '#ff9ac0', 3],
      [53, 15, '#ff9ac0', 3],
    ],
    emit: [
      { x: 40, y: 10, type: 'petal', rate: 1.2 },
      { x: 54, y: 12, type: 'leaf', rate: 0.7 },
    ],
    mouth: [58, 35],
  },
  stump: {
    size: 64,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] * 0.5 + bx,
        hy = P.head[1] * 0.5 + by,
        t = P.tail
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      s.L(22 + bx, 52 + by, 15 + P.bf[0], 58 + P.bf[1], 2.4, 'bark2', 1.2)
      s.L(42 + bx, 52 + by, 49 + P.ff[0], 58 + P.ff[1], 2.4, 'bark2', 1.2)
      s.L(16 + bx, 42 + by, 9 + bx, 36 + by - t * 0.6, 1.6, 'bark', 0.8)
      leafShape(s, 9 + bx, 36 + by - t * 0.6, 5, -2.2, 1.6, 'leafg', '#b0f490')
      s.E(32 + bx, 50 + by, 15, 7, 'bark')
      s.P(
        m(
          [
            [17, 37],
            [47, 37],
            [47, 50],
            [17, 50],
          ],
          bx,
          by
        ),
        'bark'
      )
      for (const x of [20, 25, 30, 35, 40, 44])
        s.line(
          m(
            [
              [x, 39 + (x % 3)],
              [x + (x % 2 ? 1 : -1), 47 + (x % 4)],
            ],
            bx,
            by
          ),
          '#2e1c0e'
        )
      s.E(32 + bx, 37 + by, 15, 4.6, 'wood')
      for (const [r, c] of [
        [11, '#9a7444'],
        [7, '#9a7444'],
        [3.5, '#86582e'],
      ])
        for (let i = 0; i < 28; i++) {
          const a = (i / 28) * TAU
          s.d(32 + bx + Math.cos(a) * r, 37 + by + Math.sin(a) * r * 0.3, c)
        }
      s.E(23 + bx, 35 + by, 7, 2.2, 'moss')
      s.E(18 + bx, 44 + by, 2, 4, 'moss')
      s.E(41.5 + hx, 46 + hy, 7.5, 6, 'wood')
      s.L(40 + bx, 36 + by, 41 + bx, 28 + by, 0.8, 'vine')
      leafShape(s, 41 + bx, 29 + by, 6, -1, 1.8, 'leafg', '#b0f490')
      leafShape(s, 41 + bx, 31 + by, 5, -2.5, 1.6, 'leafg')
      s.L(22 + bx, 34 + by, 22 + bx, 31 + by, 0.8, 'cream')
      s.E(22 + bx, 30 + by, 3.4, 2, 'mcap')
      s.d(21 + bx, 29 + by, '#ffe0d0').d(23 + bx, 30 + by, '#ffe0d0')
      s.E(39 + hx, 41.5 + hy, 3.2, 1.2, 'moss')
      s.E(46 + hx, 41.5 + hy, 2.6, 1.2, 'moss')
      s.eye(38 + hx, 44 + hy, P.glow ? 'cute' : 'sleepy').eye(
        45 + hx,
        44 + hy,
        P.glow ? 'cute' : 'sleepy'
      )
      s.E(42 + hx, 47 + hy, 1.6, 1.4, 'bark2')
      if (P.jaw > 0.5) s.E(42 + hx, 50 + hy, 2.4, 1.3, 'maw')
      s.P(
        m(
          [
            [35, 51],
            [49, 51],
            [46, 58],
            [43, 55],
            [40, 59],
            [37, 55],
          ],
          hx,
          hy + P.jaw
        ),
        'moss'
      )
      s.d(37 + hx, 46 + hy, '#c4806a').d(46 + hx, 46 + hy, '#c4806a')
      s.L(26 + bx, 54 + by, 19 + P.bl[0], 60 + P.bl[1], 2.8, 'bark', 1.3)
      s.L(39 + bx, 54 + by, 46 + P.fl[0], 60 + P.fl[1], 2.8, 'bark', 1.3)
      if (P.glow) glowSap(s, 42 + hx, 50 + hy)
    },
    emit: [
      { x: 41, y: 26, type: 'leaf', rate: 0.6 },
      { x: 22, y: 28, type: 'spore', rate: 1.4 },
      { x: 44, y: 42, type: 'zz', rate: 0.4 },
    ],
    mouth: [43, 50],
  },
  barkwolf: {
    size: 64,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 2.6
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      s.L(14 + bx, 44 + by, 5 + bx, 36 + by - t, 3.2, 'wolfd', 2.4)
      s.P(
        m(
          [
            [2, 30],
            [8, 34],
            [5, 39],
            [1, 36],
          ],
          bx,
          by - t
        ),
        'bark'
      )
      leafShape(s, 4 + bx, 32 + by - t, 6, -2, 1.8, 'leafg', '#b0f490')
      s.L(19 + bx, 48 + by, 18 + P.bf[0], 57 + P.bf[1], 2.2, 'wolfd2')
      s.E(19 + P.bf[0], 58 + P.bf[1], 3, 1.4, 'wolfd2')
      s.L(38 + bx, 48 + by, 39 + P.ff[0], 57 + P.ff[1], 2.2, 'wolfd2')
      s.E(40 + P.ff[0], 58 + P.ff[1], 3, 1.4, 'wolfd2')
      s.E(28 + bx, 45 + by, 14, 7, 'wolfd')
      s.E(30 + bx, 50 + by, 9, 2.2, 'wolfb')
      s.E(40 + bx, 42 + by, 6.5, 7.5, 'moss')
      const plates = [
        [17, 40, 5],
        [24, 38, 6],
        [31, 37.5, 6],
        [38, 39, 5],
      ]
      for (const [x, y, r] of plates)
        s.P(
          m(
            [
              [x - r, y + 4],
              [x - r + 1, y - 1],
              [x, y - 3],
              [x + r - 1, y - 1.5],
              [x + r, y + 4],
            ],
            bx,
            by
          ),
          'bark'
        )
      for (const [x, y, r] of plates) {
        s.line(
          m(
            [
              [x - r + 2, y],
              [x - 1, y - 2],
            ],
            bx,
            by
          ),
          '#b88a5a'
        )
        s.d(x + r + bx, y + 2 + by, '#8aff6a').d(x + r + bx, y + 3 + by, '#4ad44a')
      }
      s.line(
        m(
          [
            [16, 45],
            [20, 48],
            [26, 46],
            [31, 49],
            [36, 47],
          ],
          bx,
          by
        ),
        '#2e6a24',
        '#4a9234'
      )
      leafShape(s, 26 + bx, 46 + by, 3.5, 0.4, 1.1, 'leafg')
      leafShape(s, 36 + bx, 47 + by, 3.5, -0.3, 1.1, 'leafg')
      s.L(22 + bx, 48 + by, 21 + P.bl[0], 58 + P.bl[1], 2.6, 'wolfd')
      s.E(22 + P.bl[0], 59 + P.bl[1], 3.4, 1.5, 'wolfd')
      s.E(22 + bx + P.bl[0] * 0.4, 51 + by, 2.8, 2, 'bark')
      s.L(35 + bx, 48 + by, 36 + P.fl[0], 58 + P.fl[1], 2.6, 'wolfd')
      s.E(37 + P.fl[0], 59 + P.fl[1], 3.4, 1.5, 'wolfd')
      s.E(35 + bx + P.fl[0] * 0.4, 51 + by, 2.8, 2, 'bark')
      s.line(
        [
          [19 + P.bl[0], 55 + P.bl[1]],
          [23 + P.bl[0], 54 + P.bl[1]],
        ],
        '#4a9234'
      ).line(
        [
          [34 + P.fl[0], 55 + P.fl[1]],
          [38 + P.fl[0], 54 + P.fl[1]],
        ],
        '#4a9234'
      )
      s.spike(42 + hx, 31 + hy, 6, 2, 'wolfd', -1)
      s.spike(47 + hx, 31.5 + hy, 5, 1.8, 'wolfd')
      s.E(46 + hx, 36 + hy, 7, 5.8, 'wolfd')
      s.P(
        m(
          [
            [48, 34],
            [59, 37],
            [59, 40],
            [48, 41],
          ],
          hx,
          hy
        ),
        'wolfd'
      )
      s.P(
        m(
          [
            [48, 40.5],
            [58, 40 + j],
            [56, 43 + j],
            [48, 43],
          ],
          hx,
          hy
        ),
        'wolfb'
      )
      if (j > 1)
        s.P(
          m(
            [
              [50, 40.5],
              [58, 40.5],
              [56, 40 + j],
              [50, 41.5 + j * 0.5],
            ],
            hx,
            hy
          ),
          'maw'
        )
      s.P(
        m(
          [
            [40, 33],
            [45, 30],
            [53, 32.5],
            [55, 36],
            [43, 36],
          ],
          hx,
          hy
        ),
        'bark'
      )
      s.line(
        m(
          [
            [43, 33],
            [51, 33],
          ],
          hx,
          hy
        ),
        '#b88a5a'
      )
      for (const x of [52, 54, 56]) s.d(x + hx, 41 + hy, '#ffffff')
      if (j > 1) for (const x of [53, 55]) s.d(x + hx, 40 + hy + j, '#ffffff')
      s.d(59 + hx, 37 + hy, '#0a0c0a').d(60 + hx, 38 + hy, '#0a0c0a')
      s.d(48 + hx, 37 + hy, '#e0ffb0')
        .d(49 + hx, 37 + hy, '#8aff6a')
        .d(47 + hx, 36 + hy, '#0a0c0a')
        .d(48 + hx, 36 + hy, '#0a0c0a')
        .d(49 + hx, 36 + hy, '#0a0c0a')
      if (P.glow) glowSap(s, 60 + hx, 40 + hy)
    },
    glows: [
      [48, 37, '#8aff6a', 3],
      [22, 42, '#6aff6a', 2],
      [30, 41, '#6aff6a', 2],
      [37, 40, '#6aff6a', 2],
    ],
    emit: [
      { x: 5, y: 28, type: 'leaf', rate: 0.8 },
      { x: 30, y: 34, type: 'spore', rate: 0.8 },
    ],
    mouth: [60, 40],
  },
  forestdeer: {
    size: 80,
    rig: QUAD,
    aura: { type: 'leaves', x: 38, y: 72, r: 30 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 2
      const A = (pts, r) => {
        for (let i = 0; i < pts.length - 1; i++)
          s.L(
            pts[i][0] + hx,
            pts[i][1] + hy,
            pts[i + 1][0] + hx,
            pts[i + 1][1] + hy,
            r * (1 - i * 0.18),
            'antler',
            r * (1 - (i + 1) * 0.18)
          )
      }
      // far antler (behind the head)
      A(
        [
          [64, 30],
          [68, 20],
          [74, 12],
        ],
        1.2
      )
      A(
        [
          [68, 20],
          [76, 18],
        ],
        0.8
      )
      A(
        [
          [71, 15],
          [69, 6],
        ],
        0.7
      )
      s.L(24 + bx, 62 + by, 23 + P.bf[0], 74 + P.bf[1], 2, 'jade2')
      s.L(48 + bx, 62 + by, 49 + P.ff[0], 74 + P.ff[1], 2, 'jade2')
      s.E(23 + P.bf[0], 75 + P.bf[1], 2.4, 1.2, 'gold')
      s.E(49 + P.ff[0], 75 + P.ff[1], 2.4, 1.2, 'gold')
      leafShape(s, 16 + bx, 54 + by, 8, -2.6 - t * 0.12, 2.6, 'leafg', '#b0f490')
      s.E(36 + bx, 57 + by, 19, 9.5, 'jade')
      s.E(38 + bx, 63 + by, 13, 2.8, 'cream')
      s.E(33 + bx, 49 + by, 15, 3.6, 'moss')
      s.line(
        [
          [20 + bx, 58 + by],
          [27 + bx, 61 + by],
          [34 + bx, 58 + by],
          [42 + bx, 61 + by],
          [49 + bx, 57 + by],
        ],
        '#6aff9a',
        '#d0ffd8'
      )
      // a small forest on its back
      grove(s, 22 + bx, 49 + by, 7, 5, 'canopy')
      grove(s, 42 + bx, 48 + by, 8, 5.5, 'canopy')
      grove(s, 32 + bx, 48 + by, 13, 7, 'canopy')
      for (const [x, y] of [
        [30, 30],
        [35, 33],
        [27, 35],
        [43, 37],
        [20, 40],
      ])
        flower(s, x + bx, y + by)
      s.L(28 + bx, 63 + by, 28 + P.bl[0], 76 + P.bl[1], 2.4, 'jade')
      s.L(45 + bx, 63 + by, 46 + P.fl[0], 76 + P.fl[1], 2.4, 'jade')
      s.E(28 + P.bl[0], 77 + P.bl[1], 2.8, 1.3, 'gold')
      s.E(46 + P.fl[0], 77 + P.fl[1], 2.8, 1.3, 'gold')
      s.L(50 + bx, 55 + by, 59 + hx, 41 + hy, 5.2, 'jade', 4)
      s.E(52 + bx, 57 + by, 5, 6, 'cream')
      leafShape(s, 58 + hx, 37 + hy, 8, -2.9, 2.2, 'jade')
      s.E(62 + hx, 38 + hy, 6.5, 5.2, 'jade')
      s.E(70 + hx, 41 + hy, 4.5, 3.2, 'jade')
      s.E(72 + hx, 43 + hy + j * 0.5, 2.4, 1.5, 'cream')
      if (j > 1)
        s.line(
          [
            [67 + hx, 44 + hy],
            [74 + hx, 44 + hy + j * 0.5],
          ],
          '#04140e'
        )
      s.d(75 + hx, 41 + hy, '#04140e').d(74 + hx, 40 + hy, '#04140e')
      s.line(
        [
          [58 + hx, 40 + hy],
          [62 + hx, 42 + hy],
          [66 + hx, 41 + hy],
        ],
        '#6aff9a'
      )
      // near antler: a great branch with leaves
      A(
        [
          [60, 33],
          [56, 22],
          [50, 12],
          [46, 4],
        ],
        1.6
      )
      A(
        [
          [56, 22],
          [46, 20],
        ],
        1
      )
      A(
        [
          [52, 15],
          [58, 8],
        ],
        0.9
      )
      A(
        [
          [50, 12],
          [42, 10],
        ],
        0.8
      )
      A(
        [
          [46, 20],
          [41, 15],
        ],
        0.7
      )
      for (const [x, y, a] of [
        [46, 4, -1.8],
        [42, 10, -2.6],
        [58, 8, -1],
        [41, 15, -2.3],
        [74, 12, -0.9],
        [76, 18, -0.3],
        [69, 6, -1.7],
      ])
        leafShape(s, x + hx, y + hy, 6, a, 2, 'leafg', '#b0f490')
      for (const [x, y] of [
        [52, 15],
        [47, 20],
        [70, 15],
      ])
        flower(s, x + hx, y + hy)
      s.d(64 + hx, 36 + hy, '#e0fff0')
        .d(65 + hx, 36 + hy, '#6aff9a')
        .d(63 + hx, 35 + hy, '#04140e')
        .d(64 + hx, 35 + hy, '#04140e')
        .d(65 + hx, 35 + hy, '#04140e')
      if (P.glow) glowSap(s, 75 + hx, 43 + hy)
    },
    glows: [
      [32, 32, '#a8ff9a', 6],
      [64, 36, '#6aff9a', 3],
      [46, 4, '#c8ff8a', 3],
    ],
    emit: [
      { x: 32, y: 30, type: 'leaf', rate: 1.6 },
      { x: 50, y: 10, type: 'firefly', rate: 1.4 },
      { x: 22, y: 40, type: 'petal', rate: 0.8 },
    ],
    mouth: [75, 43],
  },
  wolfking: {
    size: 80,
    rig: QUAD,
    aura: { type: 'leaves', x: 40, y: 72, r: 30 },
    draw(s, P) {
      const bx = P.body[0],
        by = P.body[1] - 4,
        hx = P.head[0] + bx,
        hy = P.head[1] + by - 1,
        t = P.tail,
        j = P.jaw * 3.2
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      // a vine wrapped across a part of the body: a curve with leaves and glowing buds on it
      const vine = (pts, leaves = [], buds = []) => {
        s.line(pts, '#2e6a24', '#5aa83a')
        s.line(
          pts.map(([x, y]) => [x, y + 1]),
          '#16401a'
        )
        for (const [i, a] of leaves)
          leafShape(s, pts[i][0], pts[i][1], 5, a, 1.6, 'leafg', '#b0f490')
        for (const i of buds) s.E(pts[i][0], pts[i][1], 1, 1, 'sap')
      }
      // long bushy tail sweeping back, fur tufts along it
      s.L(19 + bx, 55 + by, 10 + bx, 57 + by - t * 0.5, 5, 'wolfk', 4.6)
      s.L(10 + bx, 57 + by - t * 0.5, 3 + bx, 51 + by - t, 4.6, 'wolfk', 1.6)
      for (const [x, y, a] of [
        [14, 52, -2],
        [9, 53, -2.3],
        [5, 49, -2.5],
        [13, 60, 2.2],
        [8, 59, 2.5],
        [4, 55, 2.8],
      ])
        s.P(
          m(
            [
              [x - 1.5, y],
              [x + Math.cos(a) * 5, y + Math.sin(a) * 4 - (x < 10 ? t : t * 0.5)],
              [x + 1.5, y],
            ],
            bx,
            by
          ),
          'wolfk'
        )
      s.E(3.5 + bx, 50 + by - t, 2.2, 2, 'wolfm')
      vine(
        m(
          [
            [17, 52],
            [15, 59],
            [11, 59],
            [8, 53],
            [5, 51],
          ],
          bx,
          by - t * 0.4
        ),
        [[3, -2.4]],
        [1]
      )
      // far legs
      s.L(24 + bx, 62 + by, 21 + P.bf[0], 74 + P.bf[1], 2.6, 'wolfk2', 1.9)
      s.E(22 + P.bf[0], 76 + P.bf[1], 3.6, 1.6, 'wolfk2')
      s.L(50 + bx, 62 + by, 53 + P.ff[0], 74 + P.ff[1], 2.6, 'wolfk2', 1.9)
      s.E(54 + P.ff[0], 76 + P.ff[1], 3.6, 1.6, 'wolfk2')
      // lean body, deep chest, strong haunch
      s.P(
        m(
          [
            [18, 52],
            [30, 50],
            [44, 47],
            [54, 50],
            [56, 62],
            [44, 64],
            [28, 64],
            [17, 62],
          ],
          bx,
          by
        ),
        'wolfk'
      )
      s.E(22 + bx, 57 + by, 7.5, 7.5, 'wolfk')
      s.E(49 + bx, 56 + by, 9, 9.5, 'wolfk')
      s.E(37 + bx, 63 + by, 9, 1.4, 'wolfm')
      s.line(
        m(
          [
            [18, 52],
            [22, 50],
            [27, 52],
          ],
          bx,
          by
        ),
        '#1a2030'
      )
        .line(
          m(
            [
              [30, 50],
              [34, 49],
              [38, 51],
            ],
            bx,
            by
          ),
          '#1a2030'
        )
        .line(
          m(
            [
              [16, 60],
              [19, 63],
            ],
            bx,
            by
          ),
          '#1a2030'
        )
      // vines wrapped round the barrel and haunch
      vine(
        m(
          [
            [22, 50],
            [25, 55],
            [24, 60],
            [27, 64],
          ],
          bx,
          by
        ),
        [[1, -0.6]],
        [2]
      )
      vine(
        m(
          [
            [34, 48],
            [36, 54],
            [35, 59],
            [38, 64],
          ],
          bx,
          by
        ),
        [
          [0, -2.2],
          [3, 0.6],
        ],
        [1]
      )
      // near legs: hind leg with a bent hock, foreleg straight and planted
      s.L(24 + bx, 60 + by, 29 + P.bl[0] * 0.5, 68 + P.bl[1] * 0.5, 4.6, 'wolfk', 2.4)
      s.L(29 + P.bl[0] * 0.5, 68 + P.bl[1] * 0.5, 26 + P.bl[0], 76 + P.bl[1], 2.2, 'wolfk', 2)
      s.E(27 + P.bl[0], 77 + P.bl[1], 4.5, 1.8, 'wolfk')
      s.L(49 + bx, 62 + by, 50 + P.fl[0], 76 + P.fl[1], 3.4, 'wolfk', 2.1)
      s.E(51 + P.fl[0], 77 + P.fl[1], 4.5, 1.8, 'wolfk')
      for (const x of [24, 27, 30]) s.d(x + P.bl[0], 79 + P.bl[1], '#f4ede0')
      for (const x of [48, 51, 54]) s.d(x + P.fl[0], 79 + P.fl[1], '#f4ede0')
      vine(
        [
          [47 + P.fl[0] * 0.3, 66],
          [52 + P.fl[0] * 0.5, 68.5],
          [47 + P.fl[0] * 0.7, 71],
          [52 + P.fl[0] * 0.8, 73.5],
        ],
        [[1, -0.4]],
        [2]
      )
      // thick shaggy ruff round the neck and shoulders, tufts flaring back and down
      const nx = 56 + (hx - bx) * 0.55 + bx,
        ny = 48 + (hy - by) * 0.55 + by
      const cx = nx - 3,
        cy = ny + 1
      for (let i = 0; i < 17; i++) {
        const a = 1.05 + i * 0.25,
          r0 = 8,
          r1 = (i % 2 ? 19 : 15.5) - Math.abs(i - 8) * 0.35,
          sw = 0.2
        s.P(
          [
            [cx + Math.cos(a - sw) * r0, cy + Math.sin(a - sw) * r0],
            [cx + Math.cos(a + 0.12) * r1, cy + Math.sin(a + 0.12) * r1 * 0.9],
            [cx + Math.cos(a + sw) * r0, cy + Math.sin(a + sw) * r0],
          ],
          'wolfm'
        )
      }
      s.E(cx, cy, 11, 12, 'wolfm')
      for (let i = 0; i < 14; i++) {
        const a = 1.2 + i * 0.3,
          r = i % 2 ? 13 : 10
        s.line(
          [
            [cx + Math.cos(a) * 4, cy + Math.sin(a) * 4.5],
            [cx + Math.cos(a + 0.1) * r, cy + Math.sin(a + 0.1) * r * 0.9],
          ],
          i % 3 ? '#3a4656' : '#c8d4e4'
        )
      }
      vine(
        [
          [nx - 11, ny - 4],
          [nx - 6, ny + 2],
          [nx - 3, ny + 8],
          [nx + 3, ny + 11],
          [nx + 7, ny + 9],
        ],
        [
          [1, 2.4],
          [4, -0.2],
        ],
        [2, 3]
      )
      // head: tall swept ears, long muzzle, heavy brow, slit eye
      s.spike(59 + hx, 36 + hy, 10, 2.6, 'wolfk', -3)
      s.spike(64.5 + hx, 36.5 + hy, 9, 2.4, 'wolfk', -2)
      s.d(58 + hx, 31 + hy, '#5a3a5a')
        .d(58 + hx, 33 + hy, '#5a3a5a')
        .d(63 + hx, 32 + hy, '#5a3a5a')
      s.E(63 + hx, 41 + hy, 8, 6.5, 'wolfk')
      s.P(
        m(
          [
            [64, 37.5],
            [79, 42.5],
            [78.5, 45.5],
            [65, 47],
          ],
          hx,
          hy
        ),
        'wolfk'
      )
      s.P(
        m(
          [
            [58, 42],
            [51, 43],
            [56, 46],
            [50, 49],
            [60, 48],
          ],
          hx,
          hy
        ),
        'wolfm'
      )
      s.P(
        m(
          [
            [65, 46],
            [77, 45.5 + j],
            [74, 48.5 + j],
            [65, 49.5],
          ],
          hx,
          hy
        ),
        'wolfk2'
      )
      s.line(
        m(
          [
            [66, 46],
            [76, 45.5],
          ],
          hx,
          hy
        ),
        '#8a9cc0'
      )
      if (j > 1)
        s.P(
          m(
            [
              [67, 46.5],
              [78, 46.5],
              [75, 46 + j],
              [67, 47.5 + j * 0.5],
            ],
            hx,
            hy
          ),
          'maw'
        )
      for (const x of [70, 73, 76]) s.d(x + hx, 47 + hy, '#ffffff')
      s.d(68 + hx, 48 + hy, '#ffffff').d(68 + hx, 49 + hy, '#ffffff')
      if (j > 1) for (const x of [71, 74]) s.d(x + hx, 46 + hy + j, '#ffffff')
      s.d(79 + hx, 42 + hy, '#06080e')
        .d(80 + hx, 43 + hy, '#06080e')
        .d(79 + hx, 43 + hy, '#06080e')
      s.line(
        m(
          [
            [62, 39.5],
            [66, 38.5],
            [70, 39.5],
          ],
          hx,
          hy
        ),
        '#06080e'
      )
      s.line(
        m(
          [
            [68, 41],
            [74, 42.5],
          ],
          hx,
          hy
        ),
        '#1a2030'
      )
      s.d(64 + hx, 40.5 + hy, '#06080e')
        .d(65 + hx, 40.5 + hy, '#e8ff8a')
        .d(66 + hx, 40.5 + hy, '#b8ff4a')
        .d(67 + hx, 40.5 + hy, '#06080e')
        .d(65 + hx, 41.5 + hy, '#06080e')
        .d(66 + hx, 41.5 + hy, '#06080e')
      vine(
        m(
          [
            [60, 36],
            [63, 37.5],
            [66, 36.5],
          ],
          hx,
          hy
        ),
        [[2, -1.2]],
        []
      )
      if (P.glow) glowSap(s, 79 + hx, 46 + hy)
    },
    glows: [
      [66, 41, '#b8ff4a', 3],
      [36, 56, '#6aff6a', 2],
      [24, 62, '#6aff6a', 2],
      [55, 58, '#6aff6a', 2],
    ],
    emit: [
      { x: 40, y: 52, type: 'leaf', rate: 1.2 },
      { x: 54, y: 56, type: 'pollen', rate: 1.2 },
      { x: 66, y: 40, type: 'firefly', rate: 0.6 },
    ],
    mouth: [79, 46],
  },
  /* ----- Leaf fused form (พนาผู้ตื่น): the forest elk awakened, gold armour, glowing world-tree antlers ----- */
  lfused: {
    size: 88,
    rig: QUAD,
    aura: { type: 'twinl', x: 40, y: 78, r: 34 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        j = P.jaw * 2.2
      const A = (pts, r) => {
        for (let i = 0; i < pts.length - 1; i++)
          s.L(
            pts[i][0] + hx,
            pts[i][1] + hy,
            pts[i + 1][0] + hx,
            pts[i + 1][1] + hy,
            r * (1 - i * 0.16),
            'antlerg',
            r * (1 - (i + 1) * 0.16)
          )
      }
      A(
        [
          [70, 34],
          [75, 24],
          [82, 16],
        ],
        1.3
      )
      A(
        [
          [75, 24],
          [84, 22],
        ],
        0.9
      )
      A(
        [
          [78, 19],
          [77, 9],
        ],
        0.8
      )
      s.L(26 + bx, 68 + by, 25 + P.bf[0], 81 + P.bf[1], 2.2, 'spirit2')
      s.L(52 + bx, 68 + by, 53 + P.ff[0], 81 + P.ff[1], 2.2, 'spirit2')
      s.E(25 + P.bf[0], 82 + P.bf[1], 2.8, 1.3, 'gold')
      s.E(53 + P.ff[0], 82 + P.ff[1], 2.8, 1.3, 'gold')
      for (const a of [-2.3, -2.7, -3.0]) leafShape(s, 18 + bx, 60 + by - t, 9, a, 2.2, 'sap')
      s.E(39 + bx, 62 + by, 20, 10, 'spirit')
      s.E(41 + bx, 69 + by, 14, 2.8, 'cream')
      // gold barding on the back and chest
      s.P(
        [
          [24 + bx, 56 + by],
          [30 + bx, 51 + by],
          [50 + bx, 51 + by],
          [56 + bx, 57 + by],
          [50 + bx, 59 + by],
          [30 + bx, 59 + by],
        ],
        'gold'
      )
      for (const x of [30, 36, 42, 48]) {
        s.line(
          [
            [x + bx, 53 + by],
            [x + bx, 58 + by],
          ],
          '#7d520a'
        )
        s.d(x + 3 + bx, 55 + by, '#6aff9a')
      }
      s.E(40 + bx, 49 + by, 13, 3, 'moss')
      for (const [x, h] of [
        [30, 6],
        [40, 9],
        [49, 6],
      ]) {
        s.L(x + bx, 50 + by, x + bx, 50 - h + by, 1, 'antlerg', 0.7)
        s.E(x + bx, 49 - h + by, 3.4, 2.6, 'sap')
      }
      s.L(30 + bx, 69 + by, 30 + P.bl[0], 83 + P.bl[1], 2.6, 'spirit')
      s.L(49 + bx, 69 + by, 50 + P.fl[0], 83 + P.fl[1], 2.6, 'spirit')
      s.E(30 + bx + P.bl[0] * 0.5, 76 + by + P.bl[1] * 0.5, 2.8, 1.6, 'gold')
      s.E(50 + bx + P.fl[0] * 0.5, 76 + by + P.fl[1] * 0.5, 2.8, 1.6, 'gold')
      s.E(30 + P.bl[0], 84 + P.bl[1], 3.2, 1.4, 'gold')
      s.E(50 + P.fl[0], 84 + P.fl[1], 3.2, 1.4, 'gold')
      s.L(55 + bx, 60 + by, 64 + hx, 45 + hy, 5.6, 'spirit', 4.2)
      s.P(
        [
          [52 + bx, 56 + by],
          [58 + bx, 52 + by],
          [62 + bx, 60 + by],
          [56 + bx, 66 + by],
          [52 + bx, 64 + by],
        ],
        'gold'
      )
      s.E(57 + bx, 59 + by, 1.8, 1.8, 'sap')
      leafShape(s, 63 + hx, 41 + hy, 9, -2.9, 2.4, 'spirit')
      s.E(67 + hx, 42 + hy, 7, 5.6, 'spirit')
      s.E(76 + hx, 45 + hy, 5, 3.4, 'spirit')
      s.E(78 + hx, 47 + hy + j * 0.5, 2.6, 1.5, 'cream')
      s.P(
        [
          [63 + hx, 38 + hy],
          [70 + hx, 36.5 + hy],
          [79 + hx, 42 + hy],
          [72 + hx, 42.5 + hy],
          [64 + hx, 41.5 + hy],
        ],
        'gold'
      )
      s.E(68 + hx, 38.5 + hy, 1.6, 1.4, 'sap')
      if (j > 1)
        s.line(
          [
            [73 + hx, 48 + hy],
            [80 + hx, 48 + hy + j * 0.5],
          ],
          '#14241c'
        )
      s.d(81 + hx, 45 + hy, '#14241c')
      A(
        [
          [66, 36],
          [62, 24],
          [56, 13],
          [52, 4],
        ],
        1.8
      )
      A(
        [
          [62, 24],
          [51, 22],
        ],
        1.1
      )
      A(
        [
          [58, 17],
          [65, 9],
        ],
        1
      )
      A(
        [
          [56, 13],
          [47, 10],
        ],
        0.9
      )
      A(
        [
          [51, 22],
          [45, 16],
        ],
        0.8
      )
      for (const [x, y, a] of [
        [52, 4, -1.8],
        [47, 10, -2.6],
        [65, 9, -1.1],
        [45, 16, -2.3],
        [82, 16, -0.9],
        [84, 22, -0.3],
        [77, 9, -1.7],
        [56, 20, -1.2],
      ])
        leafShape(s, x + hx, y + hy, 7, a, 2.3, 'sap')
      s.d(70 + hx, 40 + hy, '#ffffff')
        .d(71 + hx, 40 + hy, '#6aff9a')
        .d(69 + hx, 40 + hy, '#14241c')
        .d(72 + hx, 40 + hy, '#14241c')
      if (P.glow) glowSap(s, 81 + hx, 47 + hy)
    },
    glows: [
      [52, 4, '#a8ffa0', 4],
      [47, 10, '#a8ffa0', 3],
      [65, 9, '#a8ffa0', 3],
      [40, 40, '#a8ffa0', 5],
      [70, 40, '#6aff9a', 3],
      [57, 59, '#6aff9a', 3],
    ],
    emit: [
      { x: 56, y: 10, type: 'goldleaf', rate: 2 },
      { x: 40, y: 40, type: 'firefly', rate: 1.5 },
      { x: 40, y: 60, type: 'sparkle', rate: 1.5 },
    ],
    mouth: [81, 47],
  },
  /* ----- Leaf raid boss (พฤกษาโบราณ): an ancient moss bear with a grove growing on its back ----- */
  flora: {
    size: 96,
    rig: QUAD,
    aura: { type: 'bossl', x: 46, y: 88, r: 36 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        j = P.jaw * 4
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      s.L(28 + bx, 74 + by, 28 + P.bf[0], 88 + P.bf[1], 6, 'bear2')
      s.E(29 + P.bf[0], 90 + P.bf[1], 6.5, 2.4, 'bear2')
      s.L(62 + bx, 74 + by, 63 + P.ff[0], 88 + P.ff[1], 5.5, 'bear2')
      s.E(64 + P.ff[0], 90 + P.ff[1], 6, 2.4, 'bear2')
      s.E(44 + bx, 66 + by, 28, 16, 'bear')
      s.E(46 + bx, 77 + by, 18, 4, 'bear2')
      s.E(40 + bx, 52 + by, 24, 8, 'moss')
      s.E(26 + bx, 58 + by, 8, 6, 'moss')
      // the grove: a great blossom tree in the middle, smaller trees around it
      grove(s, 20 + bx, 52 + by, 8, 6, 'canopy')
      grove(s, 58 + bx, 50 + by, 9, 6.5, 'canopy')
      s.L(38 + bx, 50 + by, 37 + bx, 22 + by, 3.6, 'bark', 2.4)
      s.L(37 + bx, 32 + by, 29 + bx, 24 + by, 1.6, 'bark', 0.8)
      s.L(37 + bx, 28 + by, 46 + bx, 20 + by, 1.5, 'bark', 0.7)
      for (const [x, y, rx, ry] of [
        [37, 16, 13, 7],
        [24, 21, 7, 5],
        [50, 20, 7, 5],
        [37, 8, 8, 4.5],
        [28, 12, 6, 4.5],
        [46, 11, 6, 4.5],
        [31, 22, 5, 3.5],
        [43, 23, 5, 3.5],
        [19, 25, 3.5, 2.6],
        [55, 24, 3.5, 2.6],
      ])
        s.E(x + bx, y + by, rx, ry, 'blossom')
      for (const [x, y] of [
        [22, 24],
        [33, 24],
        [44, 25],
        [52, 23],
        [27, 17],
        [48, 15],
      ])
        s.line(
          [
            [x + bx, y + by],
            [x + 2 + bx, y + by],
          ],
          '#c04a7a'
        )
      for (const [x, y] of [
        [20, 26],
        [41, 25],
        [54, 25],
      ])
        leafShape(s, x + bx, y + by, 4, 1.8, 1.2, 'leafg')
      for (const [x, y] of [
        [30, 12],
        [42, 9],
        [46, 17],
        [26, 20],
        [36, 18],
        [52, 21],
        [33, 6],
      ])
        s.d(x + bx, y + by, '#ffffff').d(x + 1 + bx, y + by, '#fff27a')
      for (const [x0, len] of [
        [22, 12],
        [30, 9],
        [48, 11],
        [55, 8],
        [62, 10],
      ])
        s.line(
          [
            [x0 + bx, 56 + by],
            [x0 + 1 + bx, 56 + len + by],
          ],
          '#2e6a24',
          '#4a9234'
        )
      for (const [x, y] of [
        [30, 54],
        [46, 53],
        [52, 55],
      ])
        flower(s, x + bx, y + by)
      s.L(30 + bx, 76 + by, 30 + P.bl[0], 89 + P.bl[1], 7, 'bear')
      s.E(31 + P.bl[0], 91 + P.bl[1], 7.5, 2.6, 'bear')
      s.L(58 + bx, 76 + by, 60 + P.fl[0], 89 + P.fl[1], 6.5, 'bear')
      s.E(61 + P.fl[0], 91 + P.fl[1], 7, 2.6, 'bear')
      for (const x of [26, 30, 34]) s.d(x + P.bl[0], 92 + P.bl[1], '#f4ede0')
      for (const x of [57, 61, 65]) s.d(x + P.fl[0], 92 + P.fl[1], '#f4ede0')
      s.line(
        m(
          [
            [24, 82],
            [28, 80],
            [33, 83],
            [36, 81],
          ],
          P.bl[0],
          P.bl[1]
        ),
        '#4a9234'
      )
      // head: round ears with leaves, mossy brow, glowing amber eyes
      s.L(62 + bx, 64 + by, 70 + hx * 0.5 + bx * 0.5, 58 + hy * 0.5 + by * 0.5, 11, 'bear', 10)
      for (const [x, y] of [
        [50, 70],
        [56, 66],
        [62, 72],
        [44, 74],
        [66, 62],
      ])
        s.line(
          [
            [x + bx, y + by],
            [x + 2 + bx, y + 3 + by],
          ],
          '#2c1a0e'
        )
      s.E(70 + hx, 46 + hy, 4, 4, 'bear')
      s.E(84 + hx, 46 + hy, 3.6, 3.6, 'bear2')
      leafShape(s, 70 + hx, 43 + hy, 6, -2.2, 2, 'leafg', '#b0f490')
      s.E(77 + hx, 56 + hy, 12, 10, 'bear')
      s.E(88 + hx, 61 + hy, 6, 4.5, 'bear')
      s.E(91 + hx, 59 + hy, 2, 1.6, 'bear2')
      s.P(
        m(
          [
            [78, 63],
            [93, 63 + j],
            [90, 67 + j],
            [80, 67],
          ],
          hx,
          hy
        ),
        'bear2'
      )
      if (j > 1)
        s.P(
          m(
            [
              [80, 63],
              [92, 63],
              [90, 63 + j],
              [81, 64 + j * 0.5],
            ],
            hx,
            hy
          ),
          'maw'
        )
      for (const x of [83, 87, 90]) s.d(x + hx, 63 + hy, '#fff4e0')
      if (j > 1) for (const x of [84, 88]) s.d(x + hx, 63 + hy + j, '#fff4e0')
      s.E(77 + hx, 49 + hy, 9, 2.4, 'moss')
      s.E(70 + hx, 63 + hy, 5, 4, 'moss')
      s.d(80 + hx, 53 + hy, '#fff6b0')
        .d(81 + hx, 53 + hy, '#ffb02a')
        .d(82 + hx, 53 + hy, '#ffb02a')
        .d(79 + hx, 52 + hy, '#120a06')
        .d(80 + hx, 52 + hy, '#120a06')
        .d(81 + hx, 52 + hy, '#120a06')
        .d(82 + hx, 52 + hy, '#120a06')
      if (P.glow) glowSap(s, 92 + hx, 64 + hy + j * 0.5)
    },
    glows: [
      [81, 53, '#ffb02a', 4],
      [37, 14, '#ffb0d0', 9],
    ],
    emit: [
      { x: 37, y: 12, type: 'petal', rate: 4 },
      { x: 40, y: 50, type: 'leaf', rate: 2 },
      { x: 60, y: 46, type: 'firefly', rate: 2 },
      { x: 24, y: 48, type: 'spore', rate: 1.5 },
    ],
    mouth: [92, 64],
  },
})
