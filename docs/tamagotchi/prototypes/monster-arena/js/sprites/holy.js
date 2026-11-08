'use strict'
// holy sprites, added to the shared SPRITES table.
Object.assign(SPRITES, {
  /* ----- Holy line (still drafts for the owner to choose from): sacred animals, sheep and qilin main branch, lion branch ----- */
  hegg: {
    size: 48,
    rig: BLOB,
    draw(s, P) {
      const bx = P.body[0] * 0.6,
        by = P.body[1] * 0.3,
        m = (pts) => pts.map(([x, y]) => [x + bx, y + by])
      s.P(
        m([
          [16, 29],
          [9, 24],
          [11, 28],
          [7, 29],
          [11, 31],
          [8, 33],
          [15, 33],
        ]),
        'feath'
      )
      s.P(
        m([
          [32, 29],
          [39, 24],
          [37, 28],
          [41, 29],
          [37, 31],
          [40, 33],
          [33, 33],
        ]),
        'feath2'
      )
      s.E(24 + bx, 31 + by, 9, 12, 'ivory')
      s.line(
        m([
          [16, 31],
          [18, 30],
          [20, 31],
          [22, 30],
          [24, 31],
          [26, 30],
          [28, 31],
          [30, 30],
          [32, 31],
        ]),
        '#c48a16',
        '#f2c13a'
      )
      s.d(24 + bx, 34 + by, '#ffd84a')
        .d(23 + bx, 35 + by, '#f2c13a')
        .d(25 + bx, 35 + by, '#f2c13a')
        .d(24 + bx, 36 + by, '#c48a16')
        .d(24 + bx, 35 + by, '#fff6c8')
      s.d(20 + bx, 23 + by, '#ffffff')
        .d(19 + bx, 24 + by, '#ffffff')
        .d(20 + bx, 24 + by, '#ffffff')
      haloRing(s, 24 + bx, 16 + by, 6, 1.6)
    },
    glows: [
      [24, 16, '#fff0a0', 6],
      [24, 35, '#ffd84a', 4],
    ],
    emit: [],
    mouth: [24, 28],
  },
  glint: {
    size: 48,
    rig: BLOB,
    hover: 5,
    draw(s, P) {
      const [bx, by] = P.body,
        cx = 24 + bx,
        cy = 33 + by
      s.P(
        [
          [cx - 5, cy - 2],
          [cx - 12, cy - 9],
          [cx - 10, cy - 4],
          [cx - 14, cy - 3],
          [cx - 10, cy],
          [cx - 12, cy + 2],
          [cx - 5, cy + 2],
        ],
        'feath2'
      )
      s.P(
        [
          [cx + 5, cy - 2],
          [cx + 12, cy - 9],
          [cx + 10, cy - 4],
          [cx + 14, cy - 3],
          [cx + 10, cy],
          [cx + 12, cy + 2],
          [cx + 5, cy + 2],
        ],
        'feath'
      )
      s.P(
        [
          [cx, cy - 14],
          [cx + 2, cy - 4],
          [cx, cy + 12],
          [cx - 2, cy - 4],
        ],
        'hlight'
      )
      s.E(cx, cy, 6.5, 6, 'hlight')
      s.E(cx, cy + 1, 4.2, 3.6, 'halo')
      s.eye(cx - 4, cy - 2, 'big').eye(cx + 2, cy - 2, 'big')
      s.d(cx - 1, cy + 3, '#7a6a30').d(cx, cy + 3, '#7a6a30')
      s.d(cx - 6, cy + 2, '#ffa0b0').d(cx + 5, cy + 2, '#ffa0b0')
    },
    glows: [
      [24, 33, '#fff0b0', 13],
      [24, 20, '#ffffff', 4],
    ],
    emit: [],
    mouth: [29, 35],
  },
  lamb: {
    size: 48,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail
      s.L(17 + bx, 37 + by, 17 + P.bf[0], 43 + P.bf[1], 1.2, 'ivory2')
      s.L(29 + bx, 37 + by, 29 + P.ff[0], 43 + P.ff[1], 1.2, 'ivory2')
      s.E(17 + P.bf[0], 44 + P.bf[1], 1.6, 0.9, 'gold')
      s.E(29 + P.ff[0], 44 + P.ff[1], 1.6, 0.9, 'gold')
      s.E(10 + bx, 31 + by - t, 2.6, 2.4, 'fleece')
      for (const [x, y, r] of [
        [14, 33, 4.5],
        [19, 30, 5],
        [25, 30, 5],
        [30, 32, 4.5],
        [17, 36, 4.5],
        [24, 36, 4.8],
        [30, 36, 3.6],
      ])
        s.E(x + bx, y + by, r, r * 0.9, 'fleece')
      s.L(20 + bx, 38 + by, 20 + P.bl[0], 44 + P.bl[1], 1.4, 'ivory')
      s.L(32 + bx, 38 + by, 32 + P.fl[0], 44 + P.fl[1], 1.4, 'ivory')
      s.E(20 + P.bl[0], 45 + P.bl[1], 1.8, 1, 'gold')
      s.E(32 + P.fl[0], 45 + P.fl[1], 1.8, 1, 'gold')
      s.E(35 + hx, 29 + hy, 4.6, 4.2, 'ivory')
      s.E(38 + hx, 31 + hy, 2.6, 2, 'ivory')
      s.E(32 + hx, 30 + hy, 2.8, 1.4, 'ivory2')
      s.E(34 + hx, 25 + hy, 3.4, 2.4, 'fleece')
      s.E(31 + hx, 26.5 + hy, 1.6, 1.6, 'gold')
      s.d(31 + hx, 26 + hy, '#7d520a')
      s.eye(36 + hx, 28 + hy, 'cute')
      s.d(40 + hx, 31 + hy, '#e8a0a8')
      s.d(35 + hx, 31 + hy, '#ffb0c0')
    },
    glows: [[24, 30, '#fff0b0', 5]],
    emit: [],
    mouth: [40, 31],
  },
  wingsheep: {
    size: 56,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        w = -5 * P.wing
      birdWing(s, 30 + bx, 34 + by, 0.52, 1, w, 'feath2')
      s.L(19 + bx, 42 + by, 19 + P.bf[0], 50 + P.bf[1], 1.5, 'ivory2')
      s.L(35 + bx, 42 + by, 35 + P.ff[0], 50 + P.ff[1], 1.5, 'ivory2')
      s.E(19 + P.bf[0], 51 + P.bf[1], 2, 1, 'gold')
      s.E(35 + P.ff[0], 51 + P.ff[1], 2, 1, 'gold')
      s.E(11 + bx, 35 + by - t, 3, 2.8, 'fleece')
      for (const [x, y, r] of [
        [16, 37, 5],
        [22, 33, 6],
        [29, 33, 6],
        [35, 36, 5],
        [19, 41, 5],
        [27, 41, 5.5],
        [34, 41, 4.5],
      ])
        s.E(x + bx, y + by, r, r * 0.9, 'fleece')
      for (const [x, y] of [
        [20, 31],
        [27, 30],
        [33, 33],
      ])
        s.d(x + bx, y + by, '#fff6c8').d(x + 1 + bx, y + by, '#ffe88a')
      s.L(22 + bx, 43 + by, 22 + P.bl[0], 51 + P.bl[1], 1.8, 'ivory')
      s.L(37 + bx, 43 + by, 37 + P.fl[0], 51 + P.fl[1], 1.8, 'ivory')
      s.E(22 + P.bl[0], 52 + P.bl[1], 2.2, 1.1, 'gold')
      s.E(37 + P.fl[0], 52 + P.fl[1], 2.2, 1.1, 'gold')
      s.E(39 + bx, 36 + by, 4, 4, 'fleece')
      s.E(43 + hx, 31 + hy, 5, 4.6, 'ivory')
      s.E(47 + hx, 33.5 + hy, 3, 2.4, 'ivory')
      s.E(39 + hx, 32 + hy, 3.2, 1.5, 'ivory2')
      s.E(41 + hx, 26.5 + hy, 4, 2.6, 'fleece')
      s.L(39 + hx, 28 + hy, 36 + hx, 27 + hy, 1.2, 'gold', 1)
      s.E(36 + hx, 29.5 + hy, 1.8, 1.8, 'gold')
      s.d(36 + hx, 29 + hy, '#7d520a')
      birdWing(s, 25 + bx, 34 + by, 0.62, -1, w, 'feath')
      s.eye(44 + hx, 30 + hy, 'cute')
      s.d(49 + hx, 33 + hy, '#e8a0a8')
      s.d(43 + hx, 33 + hy, '#ffb0c0')
      haloRing(s, 43 + hx, 21 + hy, 5, 1.4)
    },
    glows: [[43, 21, '#fff0a0', 6]],
    emit: [],
    mouth: [50, 34],
  },
  cherub: {
    size: 48,
    rig: BLOB,
    hover: 6,
    draw(s, P) {
      const [bx, by] = P.body,
        cx = 24 + bx,
        cy = 33 + by
      s.P(
        [
          [cx - 6, cy - 3],
          [cx - 13, cy - 8],
          [cx - 11, cy - 4],
          [cx - 14, cy - 2],
          [cx - 10, cy],
          [cx - 12, cy + 2],
          [cx - 6, cy + 1],
        ],
        'feath2'
      )
      s.P(
        [
          [cx + 6, cy - 3],
          [cx + 12, cy - 7],
          [cx + 11, cy - 3],
          [cx + 13, cy - 1],
          [cx + 6, cy + 1],
        ],
        'feath'
      )
      for (const [x, y, r] of [
        [-5, -2, 4.5],
        [0, -4, 5],
        [5, -2, 4.5],
        [-3, 3, 5],
        [3, 3, 5],
      ])
        s.E(cx + x, cy + y, r, r * 0.9, 'fleece')
      s.E(cx + 1, cy + 4, 5, 3, 'ivory')
      s.eye(cx - 3, cy - 1, 'sleepy').eye(cx + 3, cy - 1, 'sleepy')
      s.d(cx, cy + 3, '#7a5a5a').d(cx + 1, cy + 3, '#7a5a5a')
      s.d(cx - 5, cy + 2, '#ffa0b0').d(cx + 6, cy + 2, '#ffa0b0')
      s.E(cx + 3, cy + 5, 1.4, 1.4, 'sky')
      haloRing(s, cx + 4, cy - 11, 5, 1.2, 0.25)
    },
    glows: [[28, 22, '#fff0a0', 5]],
    emit: [{ x: 31, y: 24, type: 'zz', rate: 0.7 }],
    mouth: [26, 36],
  },
  lioncub: {
    size: 56,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail
      s.L(16 + bx, 40 + by, 10 + bx, 33 + by - t, 1.2, 'lionb', 1)
      s.E(9 + bx, 32 + by - t, 2.4, 2.4, 'mane')
      s.d(9 + bx, 31 + by - t, '#fff6c8')
      s.L(20 + bx, 44 + by, 20 + P.bf[0], 50 + P.bf[1], 2, 'lionb2', 1.8)
      s.L(34 + bx, 44 + by, 34 + P.ff[0], 50 + P.ff[1], 2, 'lionb2', 1.8)
      s.E(26 + bx, 41 + by, 11, 6.5, 'lionb')
      s.E(28 + bx, 45 + by, 7, 2, 'ivory')
      s.L(23 + bx, 44 + by, 23 + P.bl[0], 50 + P.bl[1], 2.3, 'lionb', 2)
      s.L(36 + bx, 44 + by, 36 + P.fl[0], 50 + P.fl[1], 2.3, 'lionb', 2)
      s.E(24 + P.bl[0], 51 + P.bl[1], 2.7, 1.4, 'lionb')
      s.E(37 + P.fl[0], 51 + P.fl[1], 2.7, 1.4, 'lionb')
      const cx = 39 + hx,
        cy = 33 + hy
      lightMane(s, cx, cy, 5.4, 12)
      s.E(cx - 1, cy - 5, 1.6, 1.6, 'lionb')
      lionFace(s, cx, cy, 1, P.jaw)
    },
    glows: [[39, 33, '#ffe88a', 8]],
    emit: [],
    mouth: [46, 35],
  },
  qilin: {
    size: 64,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail
      for (const [x, y, r, k] of [
        [16, 43, 3, 'sky'],
        [12, 39, 3.4, 'feath'],
        [9, 35, 3, 'sky'],
        [8, 31, 2.2, 'feath'],
      ])
        s.E(x + bx + t * (44 - y) * 0.1, y + by - t, r, r * 0.9, k)
      s.L(21 + bx, 47 + by, 20 + P.bf[0], 58 + P.bf[1], 1.5, 'ivory2', 1.1)
      s.L(39 + bx, 47 + by, 40 + P.ff[0], 58 + P.ff[1], 1.5, 'ivory2', 1.1)
      s.E(20 + P.bf[0], 59 + P.bf[1], 1.9, 1.1, 'gold')
      s.E(40 + P.ff[0], 59 + P.ff[1], 1.9, 1.1, 'gold')
      s.E(29 + bx, 44 + by, 13, 7, 'ivory')
      s.E(31 + bx, 49 + by, 9, 2, 'ivory2')
      scaleRow(
        s,
        [
          [18, 41],
          [22, 39],
          [26, 38],
          [30, 38],
          [34, 39],
          [38, 41],
        ].map(([x, y]) => [x + bx, y + by]),
        2.6,
        2
      )
      for (const [x, y] of [
        [22, 44],
        [27, 44],
        [32, 44],
        [25, 47],
        [30, 47],
      ])
        s.d(x + bx, y + by, '#d8b050').d(x + 1 + bx, y + 1 + by, '#d8b050')
      s.L(24 + bx, 48 + by, 24 + P.bl[0], 59 + P.bl[1], 1.8, 'ivory', 1.3)
      s.L(42 + bx, 47 + by, 43 + P.fl[0], 59 + P.fl[1], 1.8, 'ivory', 1.3)
      s.E(24 + P.bl[0], 60 + P.bl[1], 2.2, 1.2, 'gold')
      s.E(43 + P.fl[0], 60 + P.fl[1], 2.2, 1.2, 'gold')
      s.E(24 + P.bl[0] * 0.6, 53 + P.bl[1] * 0.6, 2.6, 1.6, 'feath')
      s.E(43 + P.fl[0] * 0.6, 53 + P.fl[1] * 0.6, 2.6, 1.6, 'feath')
      s.L(39 + bx, 42 + by, 46 + hx, 33 + hy, 3.6, 'ivory', 3)
      for (let k = 0; k < 4; k++)
        s.E(
          37 + k * 2.4 + bx + ((hx - bx) * k) / 4,
          39 - k * 2.6 + by + ((hy - by) * k) / 4,
          3,
          2.6,
          k % 2 ? 'feath' : 'sky'
        )
      qilinHead(s, 48 + hx, 30 + hy, 1, P.jaw * 1.5)
    },
    glows: [[40, 17, '#fff0a0', 4]],
    emit: [],
    mouth: [58, 32],
  },
  bellcrab: {
    size: 56,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] * 0.5 + bx,
        hy = P.head[1] * 0.5 + by,
        m = (pts) => pts.map(([x, y]) => [x + bx, y + by])
      for (const [x, l] of [
        [16, P.bf],
        [21, P.bl],
        [27, P.ff],
        [32, P.fl],
      ]) {
        s.L(x + bx, 44 + by, x - 3 + l[0], 48 + l[1], 0.7, 'crabp', 0.6)
        s.L(x - 3 + l[0], 48 + l[1], x - 4 + l[0], 51 + l[1], 0.6, 'crabp', 0.4)
      }
      s.E(24 + bx, 26 + by, 6, 3, 'bronze')
      s.E(24 + bx, 21.5 + by, 2, 2, 'bronze2')
      s.P(
        m([
          [18, 26],
          [30, 26],
          [31, 31],
          [33, 39],
          [38, 44],
          [10, 44],
          [15, 39],
          [17, 31],
        ]),
        'bronze'
      )
      s.L(10 + bx, 43.5 + by, 38 + bx, 43.5 + by, 1.3, 'bronze2')
      s.E(34 + bx, 44 + by, 2.2, 1.6, 0)
      s.line(
        m([
          [25, 26],
          [24, 30],
          [26, 33],
          [24, 37],
          [25, 41],
          [23, 43],
        ]),
        '#1a1006'
      )
      s.line(
        m([
          [16, 34],
          [32, 34],
        ]),
        '#f0cc80'
      )
      s.d(19 + bx, 29 + by, '#fff0c0').d(19 + bx, 30 + by, '#f0cc80')
      s.E(40 + hx, 44.5 + hy, 5, 3.6, 'crabp')
      s.L(38 + hx, 42 + hy, 37 + hx, 37 + hy, 0.6, 'crabp')
      s.L(41 + hx, 42 + hy, 42 + hx, 37.5 + hy, 0.6, 'crabp')
      s.E(37 + hx, 36.5 + hy, 1.6, 1.6, 'ivory')
      s.E(42 + hx, 37 + hy, 1.6, 1.6, 'ivory')
      s.line(
        [
          [36 + hx, 36 + hy],
          [38 + hx, 36 + hy],
        ],
        '#1a0a0a'
      ).line(
        [
          [41 + hx, 36.5 + hy],
          [43 + hx, 36.5 + hy],
        ],
        '#1a0a0a'
      )
      s.E(46 + hx + P.fl[0] * 0.5, 44 + hy, 3.4, 2.6, 'crabp')
      s.P(
        [
          [47 + hx, 42 + hy],
          [51 + hx, 41 + hy],
          [49 + hx, 44 + hy],
        ],
        'crabp'
      )
      s.d(48 + hx, 44 + hy, '#2a0e12')
      s.L(42 + hx, 47 + hy, 43 + P.ff[0], 51 + P.ff[1], 0.7, 'crabp', 0.5)
    },
    glows: [[24, 34, '#ffd84a', 3]],
    emit: [{ x: 30, y: 22, type: 'zz', rate: 0.6 }],
    mouth: [50, 42],
  },
  winglion: {
    size: 64,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        w = P.wing * 0.25
      plumeWing(s, 36 + bx, 40 + by, 18, 6, -1.75 + w, 'feath2', -1)
      plumeWing(s, 34 + bx, 42 + by, 15, 5, -2.5 + w, 'feath2', -1)
      s.L(16 + bx, 46 + by, 8 + bx, 38 + by - t, 1.4, 'lionb', 1.1)
      s.E(7 + bx, 37 + by - t, 2.8, 2.8, 'mane')
      s.d(7 + bx, 36 + by - t, '#fff6c8')
      s.L(21 + bx, 50 + by, 21 + P.bf[0], 58 + P.bf[1], 2.6, 'lionb2', 2.2)
      s.L(40 + bx, 50 + by, 40 + P.ff[0], 58 + P.ff[1], 2.6, 'lionb2', 2.2)
      s.E(28 + bx, 46 + by, 14, 7.5, 'lionb')
      s.E(30 + bx, 51 + by, 9, 2, 'ivory')
      s.L(25 + bx, 50 + by, 25 + P.bl[0], 59 + P.bl[1], 2.9, 'lionb', 2.4)
      s.L(42 + bx, 50 + by, 43 + P.fl[0], 59 + P.fl[1], 2.9, 'lionb', 2.4)
      s.E(26 + P.bl[0], 60 + P.bl[1], 3.2, 1.5, 'lionb')
      s.E(44 + P.fl[0], 60 + P.fl[1], 3.2, 1.5, 'lionb')
      plumeWing(s, 30 + bx, 42 + by, 24, 7, -2.0 + w, 'feath', -1)
      plumeWing(s, 29 + bx, 44 + by, 20, 6, -2.65 + w, 'feath', -1)
      plumeWing(s, 29 + bx, 46 + by, 14, 4.5, 2.95 + w, 'feath', -1)
      const cx = 46 + hx,
        cy = 37 + hy
      lightMane(s, cx, cy, 7, 16)
      lionFace(s, cx, cy, 1.25, P.jaw, 'fierce')
    },
    glows: [[46, 37, '#ffe88a', 11]],
    emit: [],
    mouth: [56, 40],
  },
  sunqilin: {
    size: 80,
    rig: QUAD,
    aura: { type: 'halo', x: 58, y: 36, r: 15 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail
      for (const [x, y, r, k] of [
        [20, 54, 4, 'sky'],
        [14, 50, 4.6, 'feath'],
        [10, 45, 4.4, 'sky'],
        [8, 39, 3.6, 'feath'],
        [9, 34, 2.6, 'hlight'],
      ])
        s.E(x + bx + t * (56 - y) * 0.08, y + by - t, r, r * 0.9, k)
      s.L(27 + bx, 61 + by, 26 + P.bf[0], 74 + P.bf[1], 2, 'ivory2', 1.5)
      s.L(50 + bx, 60 + by, 51 + P.ff[0], 74 + P.ff[1], 2, 'ivory2', 1.5)
      s.E(26 + P.bf[0], 75 + P.bf[1], 2.6, 1.3, 'gold')
      s.E(51 + P.ff[0], 75 + P.ff[1], 2.6, 1.3, 'gold')
      s.E(37 + bx, 56 + by, 17, 9, 'ivory')
      s.E(39 + bx, 62 + by, 12, 2.4, 'ivory2')
      scaleRow(
        s,
        [
          [22, 52],
          [27, 49.5],
          [32, 48],
          [37, 47.5],
          [42, 48],
          [47, 50],
          [51, 53],
        ].map(([x, y]) => [x + bx, y + by]),
        3.2,
        2.4
      )
      for (const [x, y] of [
        [26, 56],
        [32, 55],
        [38, 55],
        [44, 56],
        [29, 59],
        [35, 59],
        [41, 59],
      ])
        s.d(x + bx, y + by, '#d8b050').d(x + 1 + bx, y + 1 + by, '#d8b050')
      s.L(30 + bx, 62 + by, 30 + P.bl[0], 75 + P.bl[1], 2.4, 'ivory', 1.8)
      s.L(53 + bx, 60 + by, 54 + P.fl[0], 75 + P.fl[1], 2.4, 'ivory', 1.8)
      s.E(30 + P.bl[0], 76 + P.bl[1], 2.8, 1.4, 'gold')
      s.E(54 + P.fl[0], 76 + P.fl[1], 2.8, 1.4, 'gold')
      for (const [x, l] of [
        [30, P.bl],
        [54, P.fl],
        [26, P.bf],
        [51, P.ff],
      ])
        s.E(x + l[0] * 0.6, 68 + l[1] * 0.6, 3.2, 2, 'feath')
      s.L(50 + bx, 54 + by, 58 + hx, 42 + hy, 4.6, 'ivory', 4)
      for (let k = 0; k < 5; k++)
        s.E(
          47 + k * 2.6 + bx + ((hx - bx) * k) / 5,
          51 - k * 2.8 + by + ((hy - by) * k) / 5,
          3.8,
          3.2,
          k % 2 ? 'feath' : 'sky'
        )
      s.E(53 + bx, 57 + by, 4, 3.4, 'gold')
      s.d(52 + bx, 56 + by, '#fff6c8')
      qilinHead(s, 60 + hx, 38 + hy, 1.3, P.jaw * 2, 'gold', true)
    },
    glows: [
      [48, 20, '#ffffff', 5],
      [53, 57, '#ffd84a', 4],
    ],
    emit: [{ x: 48, y: 20, type: 'sparkle', rate: 2 }],
    mouth: [73, 40],
  },
  lionking: {
    size: 80,
    rig: QUAD,
    aura: { type: 'motes', x: 40, y: 74, r: 30 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        w = P.wing * 0.25
      plumeWing(s, 44 + bx, 50 + by, 26, 8, -1.65 + w, 'feath2', -1)
      plumeWing(s, 42 + bx, 52 + by, 20, 6, -2.4 + w, 'hlight', -1, '#c8b880')
      s.L(18 + bx, 58 + by, 8 + bx, 48 + by - t, 1.8, 'lionb', 1.4)
      s.E(7 + bx, 46 + by - t, 3.4, 3.4, 'mane')
      s.d(6 + bx, 45 + by - t, '#fff6c8')
      s.L(25 + bx, 62 + by, 24 + P.bf[0], 74 + P.bf[1], 3.4, 'lionb2', 2.8)
      s.L(50 + bx, 62 + by, 51 + P.ff[0], 74 + P.ff[1], 3.4, 'lionb2', 2.8)
      s.E(34 + bx, 57 + by, 18, 9.5, 'lionb')
      s.E(36 + bx, 63 + by, 12, 2.4, 'ivory')
      s.L(29 + bx, 63 + by, 29 + P.bl[0], 75 + P.bl[1], 3.8, 'lionb', 3.1)
      s.L(53 + bx, 62 + by, 54 + P.fl[0], 75 + P.fl[1], 3.8, 'lionb', 3.1)
      s.E(30 + P.bl[0], 76 + P.bl[1], 4, 1.8, 'lionb')
      s.E(55 + P.fl[0], 76 + P.fl[1], 4, 1.8, 'lionb')
      s.E(29 + P.bl[0] * 0.5, 69 + P.bl[1] * 0.5, 4.2, 1.6, 'gold')
      s.E(54 + P.fl[0] * 0.5, 69 + P.fl[1] * 0.5, 4.2, 1.6, 'gold')
      plumeWing(s, 36 + bx, 52 + by, 32, 10, -1.95 + w, 'feath', -1)
      plumeWing(s, 35 + bx, 55 + by, 24, 7, -2.6 + w, 'hlight', -1, '#c8b880')
      const cx = 56 + hx,
        cy = 44 + hy
      lightMane(s, cx, cy, 9, 18)
      lionFace(s, cx, cy, 1.55, P.jaw, 'fierce')
      s.P(
        [
          [cx - 6, cy - 6],
          [cx - 6, cy - 12],
          [cx - 3, cy - 9],
          [cx, cy - 14],
          [cx + 3, cy - 9],
          [cx + 6, cy - 12],
          [cx + 6, cy - 6],
        ],
        'gold'
      )
      s.d(cx, cy - 9, '#ff5a6a')
        .d(cx - 5, cy - 8, '#7ee7ff')
        .d(cx + 5, cy - 8, '#7ee7ff')
    },
    glows: [
      [56, 44, '#ffe88a', 14],
      [56, 33, '#fff0a0', 4],
    ],
    emit: [],
    mouth: [70, 48],
  },
  /* ----- Holy fused form (ศักดิ์สิทธิ์ผู้ตื่น): the sun qilin awakened, gold armour, light wings, twin rings of light ----- */
  hfused: {
    size: 88,
    rig: QUAD,
    aura: { type: 'twinh', x: 44, y: 82, r: 32 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        w = P.wing * 0.25
      plumeWing(s, 50 + bx, 54 + by, 24, 7, -1.7 + w, 'hlight', -1, '#c8b880')
      for (const [x, y, r, k] of [
        [22, 60, 4.4, 'hlight'],
        [15, 55, 5, 'sky'],
        [10, 49, 4.8, 'hlight'],
        [8, 42, 4, 'sky'],
        [9, 36, 3, 'hlight'],
      ])
        s.E(x + bx + t * (62 - y) * 0.08, y + by - t, r, r * 0.9, k)
      s.L(30 + bx, 67 + by, 29 + P.bf[0], 80 + P.bf[1], 2.3, 'ivory2', 1.8)
      s.L(56 + bx, 66 + by, 57 + P.ff[0], 80 + P.ff[1], 2.3, 'ivory2', 1.8)
      s.L(29 + P.bf[0] * 0.85, 76 + P.bf[1] * 0.6, 29 + P.bf[0], 80 + P.bf[1], 2, 'gold')
      s.L(57 + P.ff[0] * 0.85, 76 + P.ff[1] * 0.6, 57 + P.ff[0], 80 + P.ff[1], 2, 'gold')
      s.E(40 + bx, 61 + by, 19, 10, 'ivory')
      s.E(42 + bx, 68 + by, 13, 2.6, 'ivory2')
      s.P(
        [
          [24 + bx, 55 + by],
          [30 + bx, 51 + by],
          [48 + bx, 50 + by],
          [54 + bx, 54 + by],
          [50 + bx, 57 + by],
          [28 + bx, 58 + by],
        ],
        'gold'
      )
      for (const x of [30, 36, 42, 48])
        s.line(
          [
            [x + bx, 52 + by],
            [x + bx, 57 + by],
          ],
          '#7d520a'
        )
      s.line(
        [
          [30 + bx, 52 + by],
          [48 + bx, 51 + by],
        ],
        '#fff0a0'
      )
      s.E(39 + bx, 54 + by, 2.4, 2, 'halo')
      s.L(34 + bx, 68 + by, 34 + P.bl[0], 81 + P.bl[1], 2.7, 'ivory', 2.1)
      s.L(59 + bx, 66 + by, 60 + P.fl[0], 81 + P.fl[1], 2.7, 'ivory', 2.1)
      s.L(34 + P.bl[0] * 0.85, 77 + P.bl[1] * 0.6, 34 + P.bl[0], 81 + P.bl[1], 2.4, 'gold')
      s.L(60 + P.fl[0] * 0.85, 77 + P.fl[1] * 0.6, 60 + P.fl[0], 81 + P.fl[1], 2.4, 'gold')
      for (const [x, l] of [
        [34, P.bl],
        [60, P.fl],
      ])
        s.E(x + l[0], 82 + l[1], 3, 1.4, 'halo')
      s.L(55 + bx, 60 + by, 64 + hx, 46 + hy, 5.2, 'ivory', 4.4)
      s.P(
        [
          [58 + bx, 62 + by],
          [61 + bx, 58 + by],
          [64 + bx, 61 + by],
          [62 + bx, 66 + by],
        ],
        'gold'
      )
      s.d(61 + bx, 61 + by, '#7ee7ff')
      for (let k = 0; k < 5; k++)
        s.E(
          51 + k * 2.6 + bx + ((hx - bx) * k) / 5,
          55 - k * 3 + by + ((hy - by) * k) / 5,
          4,
          3.4,
          k % 2 ? 'hlight' : 'sky'
        )
      plumeWing(s, 42 + bx, 56 + by, 30, 9, -1.95 + w, 'feath', -1)
      plumeWing(s, 41 + bx, 58 + by, 22, 6.5, -2.55 + w, 'hlight', -1, '#c8b880')
      const ex = 66 + hx,
        ey = 42 + hy
      qilinHead(s, ex, ey, 1.4, P.jaw * 2.2, 'halo', true)
      s.P(
        [
          [ex - 2, ey - 6],
          [ex + 9, ey - 4],
          [ex + 12, ey - 0.5],
          [ex + 3, ey - 1.5],
        ],
        'gold'
      )
      s.d(ex + 5, ey - 4, '#7ee7ff')
    },
    glows: [
      [52, 22, '#ffffff', 6],
      [39, 54, '#ffd84a', 4],
      [30, 30, '#fff6c8', 6],
    ],
    emit: [{ x: 52, y: 22, type: 'sparkle', rate: 3 }],
    mouth: [81, 44],
  },
  /* ----- Holy world boss (game: เทวทูตรัศมี, an angel): a white celestial elephant with a gold headdress ----- */
  holyele: {
    size: 96,
    rig: QUAD,
    aura: { type: 'bossh', x: 48, y: 90, r: 36 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        w = P.wing * 0.25,
        m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      plumeWing(s, 54 + bx, 50 + by, 24, 8, -1.8 + w, 'feath2', -1)
      s.L(14 + bx, 62 + by, 9 + bx, 74 + by - t, 1.4, 'elew', 1)
      s.E(9 + bx, 76 + by - t, 1.8, 2.6, 'elew2')
      s.L(24 + bx, 72 + by, 24 + P.bf[0], 88 + P.bf[1], 5.6, 'elew2', 5)
      s.L(58 + bx, 72 + by, 59 + P.ff[0], 88 + P.ff[1], 5.6, 'elew2', 5)
      s.E(24 + P.bf[0], 89 + P.bf[1], 5.6, 2.2, 'elew2')
      s.E(59 + P.ff[0], 89 + P.ff[1], 5.6, 2.2, 'elew2')
      s.E(38 + bx, 62 + by, 26, 17, 'elew')
      // caparison: crimson cloth with a gold border and fringe over the back
      s.P(
        m(
          [
            [20, 52],
            [30, 46],
            [52, 46],
            [60, 52],
            [58, 68],
            [22, 68],
          ],
          bx,
          by
        ),
        'crim'
      )
      s.L(22 + bx, 68 + by, 58 + bx, 68 + by, 1.4, 'gold')
      s.L(20 + bx, 52 + by, 30 + bx, 46 + by, 1, 'gold')
      s.L(52 + bx, 46 + by, 60 + bx, 52 + by, 1, 'gold')
      for (let x = 23; x < 58; x += 3) s.d(x + bx, 70 + by, '#f2c13a').d(x + bx, 71 + by, '#c48a16')
      for (const [x, y] of [
        [32, 56],
        [40, 54],
        [48, 56],
        [36, 62],
        [44, 62],
      ])
        s.d(x + bx, y + by, '#ffd84a').d(x + 1 + bx, y + by, '#fff0a0')
      s.E(40 + bx, 46 + by, 5, 2.4, 'gold')
      s.P(
        m(
          [
            [36, 46],
            [40, 36],
            [44, 46],
          ],
          bx,
          by
        ),
        'gold'
      )
      s.d(40 + bx, 41 + by, '#7ee7ff')
      s.L(29 + bx, 74 + by, 29 + P.bl[0], 89 + P.bl[1], 6, 'elew', 5.4)
      s.L(62 + bx, 72 + by, 63 + P.fl[0], 89 + P.fl[1], 6, 'elew', 5.4)
      s.E(29 + P.bl[0], 90 + P.bl[1], 6, 2.2, 'elew')
      s.E(63 + P.fl[0], 90 + P.fl[1], 6, 2.2, 'elew')
      for (const [x, l] of [
        [29, P.bl],
        [63, P.fl],
      ]) {
        s.E(x + l[0] * 0.7, 84 + l[1] * 0.7, 6, 1.5, 'gold')
        for (const dx of [-3, 0, 3]) s.d(x + dx + l[0], 91 + l[1], '#f4ede0')
      }
      plumeWing(s, 46 + bx, 52 + by, 28, 9, -2.0 + w, 'feath', -1)
      plumeWing(s, 45 + bx, 55 + by, 20, 6, -2.6 + w, 'hlight', -1, '#c8b880')
      // head: big domed brow, fan ear, long tusks, trunk raised in a curl
      s.E(71 + hx, 57 + hy, 12, 12, 'elew')
      s.P(
        m(
          [
            [64, 48],
            [56, 54],
            [55, 68],
            [62, 75],
            [68, 66],
            [69, 52],
          ],
          hx,
          hy
        ),
        'elew'
      )
      s.line(
        m(
          [
            [63, 51],
            [59, 56],
            [58, 66],
            [62, 71],
          ],
          hx,
          hy
        ),
        '#d8a8b4'
      )
      s.line(
        m(
          [
            [68, 52],
            [68, 66],
          ],
          hx,
          hy
        ),
        '#8e8a98'
      )
      s.L(76 + hx, 64 + hy, 88 + hx, 72 + hy, 1.6, 'bone', 1)
      s.L(88 + hx, 72 + hy, 92 + hx, 68 + hy, 1, 'bone', 0.5)
      s.L(74 + hx, 66 + hy, 82 + hx, 74 + hy, 1.1, 'bone', 0.7)
      s.L(79 + hx, 60 + hy, 86 + hx, 64 + hy, 3.6, 'elew', 3)
      s.L(86 + hx, 64 + hy, 90 + hx, 56 + hy, 3, 'elew', 2.4)
      s.L(90 + hx, 56 + hy, 89 + hx, 49 + hy, 2.4, 'elew', 1.8)
      s.L(89 + hx, 49 + hy, 86 + hx, 47 + hy, 1.8, 'elew', 1.4)
      for (const [x, y] of [
        [84, 63],
        [88, 59],
        [90, 54],
        [89, 50],
      ])
        s.d(x + hx, y + hy, '#8e8a98')
      // tiered gold headdress
      s.P(
        m(
          [
            [62, 46],
            [64, 40],
            [78, 40],
            [80, 46],
            [76, 49],
            [66, 49],
          ],
          hx,
          hy
        ),
        'gold'
      )
      s.P(
        m(
          [
            [66, 40],
            [67, 34],
            [75, 34],
            [76, 40],
          ],
          hx,
          hy
        ),
        'gold'
      )
      s.P(
        m(
          [
            [69, 34],
            [71, 26],
            [73, 34],
          ],
          hx,
          hy
        ),
        'gold'
      )
      s.line(
        m(
          [
            [63, 45],
            [79, 45],
          ],
          hx,
          hy
        ),
        '#7d520a'
      )
      s.line(
        m(
          [
            [67, 38],
            [75, 38],
          ],
          hx,
          hy
        ),
        '#7d520a'
      )
      s.d(71 + hx, 43 + hy, '#ff5a6a')
        .d(67 + hx, 43 + hy, '#7ee7ff')
        .d(75 + hx, 43 + hy, '#7ee7ff')
        .d(71 + hx, 31 + hy, '#ff5a6a')
      s.P(
        m(
          [
            [78, 48],
            [84, 50],
            [82, 53],
            [78, 52],
          ],
          hx,
          hy
        ),
        'gold'
      )
      s.d(77 + hx, 57 + hy, '#fff6b0')
        .d(78 + hx, 57 + hy, '#c48a16')
        .d(77 + hx, 58 + hy, '#1e1c22')
        .d(78 + hx, 58 + hy, '#1e1c22')
        .line(
          m(
            [
              [75, 55],
              [79, 55.5],
            ],
            hx,
            hy
          ),
          '#1e1c22'
        )
      haloRing(s, 71 + hx, 20 + hy, 9, 2.4, 0, 2)
    },
    glows: [
      [71, 20, '#fff0a0', 10],
      [40, 40, '#ffd84a', 5],
      [30, 30, '#fff6c8', 7],
    ],
    emit: [{ x: 71, y: 20, type: 'sparkle', rate: 3 }],
    mouth: [88, 50],
  },
})
