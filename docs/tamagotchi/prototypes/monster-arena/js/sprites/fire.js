'use strict'
// Fire line sprites (also opens the shared SPRITES table that the other sprite files add to).
const SPRITES = {
  egg: {
    size: 48,
    rig: BLOB,
    draw(s, P) {
      const bx = P.body[0] * 0.6,
        by = P.body[1] * 0.3
      s.E(24 + bx, 31 + by, 9, 12, 'shell')
      s.E(20 + bx, 26 + by, 2.2, 1.6, 'red')
      s.E(28 + bx, 33 + by, 2.4, 2, 'red')
      s.E(21 + bx, 38 + by, 1.6, 1.2, 'red')
      s.E(29 + bx, 23 + by, 1.2, 1, 'red')
      s.line(
        [
          [21, 23],
          [22, 24],
          [23, 23],
          [24, 24],
          [25, 23],
          [26, 24],
          [27, 23],
        ].map(([x, y]) => [x + bx, y + by]),
        '#ffb43a',
        '#fff0a0'
      )
    },
    emit: [{ x: 24, y: 23, type: 'ember', rate: 2 }],
    mouth: [24, 28],
  },
  wisp: {
    size: 48,
    rig: BLOB,
    draw(s, P) {
      const [bx, by] = P.body,
        m = (pts) => pts.map(([x, y]) => [x + bx, y + by])
      s.P(
        m([
          [24, 17],
          [27, 24],
          [31, 30],
          [32, 36],
          [29, 41],
          [19, 41],
          [16, 36],
          [17, 30],
          [21, 24],
        ]),
        'fire'
      )
      s.E(24 + bx, 35 + by, 7, 6.5, 'fire')
      s.E(24 + bx, 36 + by, P.glow ? 5 : 4, P.glow ? 5.5 : 4.5, 'core')
      s.eye(21 + bx, 33 + by)
        .eye(26 + bx, 33 + by)
        .d(23 + bx, 37 + by, '#7a2a04')
        .d(24 + bx, 37 + by, '#7a2a04')
      if (P.jaw > 0.5) s.d(23 + bx, 38 + by, '#7a2a04').d(24 + bx, 38 + by, '#7a2a04')
    },
    emit: [
      { x: 24, y: 19, type: 'flame', rate: 14 },
      { x: 24, y: 30, type: 'ember', rate: 3 },
    ],
    mouth: [28, 35],
  },
  coal: {
    size: 48,
    rig: BLOB,
    draw(s, P) {
      const [bx, by] = P.body
      s.E(17, 42 + P.bl[1], 3, 2, 'coal')
      s.E(31, 42 + P.fl[1], 3, 2, 'coal')
      s.E(24 + bx, 35 + by, 11, 8.5, 'coal')
      s.P(
        [
          [18, 30],
          [20, 23],
          [22, 27],
          [24, 18],
          [27, 26],
          [29, 22],
          [31, 30],
        ].map(([x, y]) => [x + bx, y + by - (P.glow ? 2 : 0)]),
        'fire'
      )
      s.E(24 + bx, 29 + by, 6, 2.5, 'fire')
      s.line(
        [
          [14 + bx, 36 + by],
          [16 + bx, 37 + by],
          [18 + bx, 37 + by],
        ],
        '#ff8a2a'
      )
        .line(
          [
            [30 + bx, 39 + by],
            [32 + bx, 37 + by],
          ],
          '#ff8a2a'
        )
        .line(
          [
            [22 + bx, 42 + by],
            [24 + bx, 41 + by],
            [26 + bx, 42 + by],
          ],
          '#ff8a2a',
          '#ffd04a'
        )
      s.eye(20 + bx, 33 + by)
        .eye(27 + bx, 33 + by)
        .d(19 + bx, 36 + by, '#ff7a4a')
        .d(29 + bx, 36 + by, '#ff7a4a')
        .d(23 + bx, 37 + by, '#160806')
        .d(24 + bx, 37 + by, '#160806')
      if (P.jaw > 0.5) s.d(23 + bx, 38 + by, '#160806').d(24 + bx, 38 + by, '#160806')
    },
    emit: [
      { x: 24, y: 20, type: 'flame', rate: 16 },
      { x: 24, y: 34, type: 'ember', rate: 3 },
    ],
    mouth: [30, 35],
  },
  gecko: {
    size: 48,
    rig: QUAD,
    draw(s, P) {
      gecko(s, { body: 'red', far: 'red2', belly: 'belly', spike: 'fire', tailFire: true }, P)
    },
    emit: [
      { x: 5, y: 20, type: 'flame', rate: 14 },
      { x: 22, y: 26, type: 'flame', rate: 4 },
    ],
    mouth: [42, 30],
  },
  smoke: {
    size: 48,
    rig: QUAD,
    draw(s, P) {
      gecko(
        s,
        {
          body: 'ash',
          far: 'ash2',
          belly: 'bone',
          spike: 'ash',
          spikeH: 2,
          headDy: 2,
          eye: 'sleepy',
        },
        P
      )
      s.E(5 + P.body[0], 27 + P.body[1] - P.tail, 2.4, 2.4, 'ash')
    },
    emit: [
      { x: 5, y: 25, type: 'smoke', rate: 5 },
      { x: 20, y: 27, type: 'smoke', rate: 3 },
      { x: 40, y: 30, type: 'ember', rate: 0.8 },
    ],
    mouth: [42, 32],
  },
  raptor: {
    size: 48,
    rig: BIPED,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        [fx, fy] = P.bf,
        [nx, ny] = P.bl,
        [ax, ay] = P.arm,
        j = P.jaw * 2.5
      s.L(3 + bx, 22 + by - t, 10 + bx, 27 + by, 1, 'crim', 2.4)
      s.L(10 + bx, 27 + by, 17 + bx, 29 + by, 2.4, 'crim', 4)
      s.L(25 + bx, 33 + by, 27 + fx, 39 + fy, 1.6, 'crim2')
      s.L(27 + fx, 39 + fy, 25 + fx, 43 + fy, 1.2, 'crim2')
      s.E(27 + fx, 43.5 + fy, 2.5, 1, 'crim2')
      s.E(21 + bx, 29 + by, 8, 6.5, 'crim')
      s.E(24 + bx, 32 + by, 5, 3.5, 'belly')
      s.E(19 + bx, 34 + by, 4.5, 5, 'crim')
      s.L(20 + bx, 37 + by, 17 + nx, 42 + ny, 1.4, 'crim')
      s.E(19 + nx, 43.5 + ny, 3.5, 1.2, 'crim')
      s.P(
        [
          [29, 13],
          [31, 7],
          [33, 11],
          [35, 6],
          [36, 11],
          [33, 13],
        ].map(([x, y]) => [x + hx, y + hy]),
        'fire'
      )
      s.P(
        [
          [26 + bx, 19 + by],
          [25 + bx, 13 + by],
          [29 + bx, 17 + by],
        ],
        'fire'
      )
      s.P(
        [
          [22 + bx, 24 + by],
          [20 + bx, 18 + by],
          [25 + bx, 23 + by],
        ],
        'fire'
      )
      s.L(26 + bx, 26 + by, 31 + hx, 18 + hy, 3, 'crim', 2.6)
      s.E(34 + hx, 15 + hy, 5.5, 4.2, 'crim')
      s.E(39 + hx, 16.5 + hy, 4.5, 2.6, 'crim')
      s.P(
        [
          [31 + hx, 18 + hy],
          [43 + hx, 18 + hy + j],
          [41 + hx, 20.5 + hy + j],
          [33 + hx, 20.5 + hy],
        ],
        'belly'
      )
      if (j > 1)
        s.line(
          [
            [34 + hx, 19 + hy],
            [42 + hx, 19 + hy + j * 0.6],
          ],
          '#5a0a06'
        )
      s.L(29 + bx, 26 + by, 33 + bx + ax, 29 + by + ay, 1, 'crim')
      s.L(33 + bx + ax, 29 + by + ay, 34 + bx + ax, 31 + by + ay, 0.8, 'crim')
      s.d(37 + hx, 18 + hy, '#fff')
        .d(39 + hx, 18 + hy, '#fff')
        .d(41 + hx, 18 + hy, '#fff')
        .d(35 + bx + ax, 31 + by + ay, '#f4ede0')
        .d(22 + nx, 43 + ny, '#f4ede0')
      s.line(
        [
          [16 + bx, 25 + by],
          [18 + bx, 29 + by],
        ],
        '#3a0610'
      )
        .line(
          [
            [20 + bx, 24 + by],
            [22 + bx, 28 + by],
          ],
          '#3a0610'
        )
        .line(
          [
            [11 + bx, 27 + by],
            [13 + bx, 30 + by],
          ],
          '#3a0610'
        )
        .line(
          [
            [30 + bx, 21 + by],
            [32 + bx, 24 + by],
          ],
          '#3a0610'
        )
      s.eye(36 + hx, 13 + hy, 'fierce').d(43 + hx, 15 + hy, '#2a0806')
      if (P.glow) glowMouth(s, 44 + hx, 18 + hy + j * 0.5)
    },
    emit: [
      { x: 33, y: 7, type: 'flame', rate: 12 },
      { x: 21, y: 19, type: 'flame', rate: 6 },
    ],
    mouth: [43, 18],
  },
  frill: {
    size: 56,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail
      const cx = 36 + hx * 0.7,
        cy = 30 + hy * 0.7,
        fr = P.glow ? 1.15 : 1
      s.E(cx, cy, 9 * fr, 9.5 * fr, 'fire')
      for (const a of [120, 145, 170, 195, 220, 245, 270, 95]) {
        const r = (a * Math.PI) / 180,
          b1 = r - 0.2,
          b2 = r + 0.2
        s.P(
          [
            [cx + Math.cos(b1) * 8 * fr, cy + Math.sin(b1) * 8 * fr],
            [cx + Math.cos(r) * 14 * fr, cy + Math.sin(r) * 14 * fr],
            [cx + Math.cos(b2) * 8 * fr, cy + Math.sin(b2) * 8 * fr],
          ],
          'fire'
        )
      }
      s.E(cx, cy, 6.5 * fr, 7 * fr, 'core')
      s.L(4 + bx, 36 + by - t, 12 + bx, 41 + by, 1.3, 'amber', 2.6)
      s.L(12 + bx, 41 + by, 20 + bx, 43 + by, 2.6, 'amber', 4)
      s.P(
        [
          [1, 36],
          [3, 29],
          [5, 33],
          [6, 28],
          [8, 35],
          [6, 38],
          [3, 38],
        ].map(([x, y]) => [x + bx, y + by - t]),
        'fire'
      )
      s.E(17 + P.bf[0], 47 + P.bf[1], 2.6, 4, 'amber2')
      s.E(35 + P.ff[0], 47 + P.ff[1], 2.4, 4, 'amber2')
      s.E(24 + bx, 41 + by, 12, 6.5, 'amber')
      s.E(26 + bx, 44.5 + by, 8.5, 2.4, 'belly')
      s.E(18 + bx, 36 + by, 2, 1.2, 'gold')
      s.E(24 + bx, 35 + by, 2, 1.2, 'gold')
      s.E(30 + bx, 36 + by, 2, 1.2, 'gold')
      s.E(20 + P.bl[0], 47 + P.bl[1], 3, 4, 'amber')
      s.E(32 + P.fl[0], 47 + P.fl[1], 2.8, 4, 'amber')
      s.E(21 + P.bl[0], 51 + P.bl[1], 3.5, 1.3, 'amber')
      s.E(33 + P.fl[0], 51 + P.fl[1], 3.5, 1.3, 'amber')
      s.P(
        [
          [36 + hx, 26 + hy],
          [33 + hx, 19 + hy],
          [38 + hx, 24 + hy],
        ],
        'horn'
      )
      s.P(
        [
          [40 + hx, 26 + hy],
          [40 + hx, 20 + hy],
          [42 + hx, 25 + hy],
        ],
        'horn'
      )
      s.E(38 + hx, 31 + hy, 6.5, 5.5, 'amber')
      s.E(44 + hx, 33 + hy, 4.5, 3.4, 'amber')
      s.E(41 + hx, 36 + hy + P.jaw * 1.8, 5, 1.6, 'belly')
      if (P.jaw > 0.5)
        s.line(
          [
            [40 + hx, 35 + hy],
            [47 + hx, 35 + hy],
          ],
          '#5a0a06'
        )
      s.line(
        [
          [14 + bx, 40 + by],
          [17 + bx, 38 + by],
        ],
        '#8a2214'
      )
        .line(
          [
            [22 + bx, 39 + by],
            [25 + bx, 37 + by],
          ],
          '#8a2214'
        )
        .line(
          [
            [29 + bx, 40 + by],
            [31 + bx, 38 + by],
          ],
          '#8a2214'
        )
      s.eye(41 + hx, 29 + hy, 'fierce')
        .d(47 + hx, 32 + hy, '#2a0806')
        .d(23 + P.bl[0], 52 + P.bl[1], '#f4ede0')
        .d(35 + P.fl[0], 52 + P.fl[1], '#f4ede0')
      if (P.glow) glowMouth(s, 49 + hx, 34 + hy + P.jaw)
    },
    emit: [
      { x: 24, y: 24, type: 'flame', rate: 5 },
      { x: 28, y: 18, type: 'flame', rate: 5 },
      { x: 34, y: 16, type: 'flame', rate: 5 },
      { x: 4, y: 29, type: 'flame', rate: 10 },
    ],
    mouth: [48, 34],
  },
  lava: {
    size: 56,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by
      s.E(16 + P.bl[0], 51 + P.bl[1], 4, 2.5, 'coal')
      s.E(36 + P.fl[0], 51 + P.fl[1], 4, 2.5, 'coal')
      s.E(26 + bx, 40 + by, 19, 12, 'lava')
      s.E(18 + bx, 33 + by, 7, 3.5, 'coal')
      s.E(30 + bx, 31 + by, 8, 3.5, 'coal')
      s.E(39 + bx, 37 + by, 5, 3.5, 'coal')
      s.E(43 + hx, 39 + hy, 8, 7, 'lava')
      s.E(44 + hx, 34 + hy, 5, 2.4, 'coal')
      s.line(
        [
          [10, 40],
          [14, 42],
          [18, 41],
          [22, 44],
        ].map(([x, y]) => [x + bx, y + by]),
        '#ff8a2a',
        '#ffd04a'
      )
        .line(
          [
            [27 + bx, 46 + by],
            [31 + bx, 44 + by],
            [35 + bx, 46 + by],
          ],
          '#ff8a2a',
          '#ffd04a'
        )
        .line(
          [
            [13 + bx, 47 + by],
            [17 + bx, 48 + by],
          ],
          '#ff8a2a'
        )
        .line(
          [
            [44 + hx, 44 + hy],
            [48 + hx, 45 + hy],
          ],
          '#ff8a2a'
        )
      s.eye(42 + hx, 38 + hy, P.glow ? 'cute' : 'sleepy').eye(
        47 + hx,
        38 + hy,
        P.glow ? 'cute' : 'sleepy'
      )
      if (P.jaw > 0.5) {
        s.line(
          [
            [44 + hx, 42 + hy],
            [48 + hx, 42 + hy],
          ],
          '#1a0604'
        ).line(
          [
            [44 + hx, 43 + hy],
            [48 + hx, 43 + hy],
          ],
          '#ff8a2a'
        )
      } else
        s.line(
          [
            [44 + hx, 42 + hy],
            [47 + hx, 42 + hy],
          ],
          '#1a0604'
        )
      if (P.glow) glowMouth(s, 49 + hx, 42 + hy)
    },
    emit: [
      { x: 26, y: 30, type: 'smoke', rate: 3 },
      { x: 20, y: 50, type: 'drip', rate: 1.4 },
      { x: 34, y: 50, type: 'drip', rate: 1.2 },
      { x: 30, y: 38, type: 'ember', rate: 2 },
    ],
    mouth: [48, 42],
  },
  dragon: {
    size: 56,
    rig: QUAD,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        w = -6 * P.wing,
        j = P.jaw * 2.5
      s.P(
        [
          [30 + bx, 34 + by],
          [30 + bx, 12 + by + w],
          [36 + bx, 18 + by + w * 0.6],
          [40 + bx, 10 + by + w],
          [42 + bx, 28 + by],
          [36 + bx, 34 + by],
        ],
        'char2'
      )
      s.L(3 + bx, 40 + by - t, 12 + bx, 44 + by, 1.3, 'char', 2.8)
      s.L(12 + bx, 44 + by, 20 + bx, 44 + by, 2.8, 'char', 4.5)
      s.P(
        [
          [2 + bx, 35 + by - t],
          [7 + bx, 38 + by - t],
          [3 + bx, 42 + by - t],
        ],
        'gold'
      )
      s.E(18 + P.bf[0], 49 + P.bf[1], 3, 4, 'char2')
      s.E(34 + P.ff[0], 49 + P.ff[1], 2.8, 4, 'char2')
      s.E(25 + bx, 42 + by, 12, 7, 'char')
      s.E(27 + bx, 46.5 + by, 9, 2.3, 'belly')
      s.E(21 + P.bl[0], 49 + P.bl[1], 3.4, 4.5, 'char')
      s.E(33 + P.fl[0], 49 + P.fl[1], 3.2, 4.5, 'char')
      s.E(22 + P.bl[0], 53 + P.bl[1], 4, 1.3, 'char')
      s.E(34 + P.fl[0], 53 + P.fl[1], 4, 1.3, 'char')
      s.E(20 + bx, 36 + by, 3, 2, 'gold')
      s.E(25 + bx, 35 + by, 3, 2, 'gold')
      s.L(32 + bx, 38 + by, 37 + hx, 26 + hy, 4, 'char', 3.2)
      s.E(31 + bx, 38 + by, 4.5, 3.5, 'gold')
      s.P(
        [
          [36 + hx, 20 + hy],
          [28 + hx, 14 + hy],
          [37 + hx, 17 + hy],
        ],
        'horn'
      )
      s.P(
        [
          [38 + hx, 18 + hy],
          [34 + hx, 9 + hy],
          [40 + hx, 16 + hy],
        ],
        'horn'
      )
      s.E(40 + hx, 22 + hy, 6, 4.8, 'char')
      s.E(46 + hx, 24 + hy, 4.5, 3, 'char')
      s.P(
        [
          [38 + hx, 26 + hy],
          [50 + hx, 25 + hy + j],
          [48 + hx, 28.5 + hy + j],
          [41 + hx, 28.5 + hy],
        ],
        'belly'
      )
      s.E(40 + hx, 19 + hy, 4, 1.8, 'gold')
      if (j > 1)
        s.line(
          [
            [41 + hx, 26 + hy],
            [49 + hx, 26 + hy + j * 0.6],
          ],
          '#ff7a1a'
        )
      s.P(
        [
          [24 + bx, 36 + by],
          [12 + bx, 10 + by + w],
          [20 + bx, 15 + by + w * 0.6],
          [24 + bx, 4 + by + w],
          [30 + bx, 16 + by + w * 0.6],
          [36 + bx, 8 + by + w],
          [35 + bx, 30 + by],
          [30 + bx, 36 + by],
        ],
        'wing'
      )
      s.L(24 + bx, 34 + by, 13 + bx, 11 + by + w, 0.7, 'char')
      s.L(27 + bx, 34 + by, 24 + bx, 6 + by + w, 0.7, 'char')
      s.L(29 + bx, 34 + by, 35 + bx, 10 + by + w, 0.7, 'char')
      s.d(42 + hx, 27 + hy, '#fff')
        .d(44 + hx, 27 + hy, '#fff')
        .d(46 + hx, 27 + hy, '#fff')
        .d(24 + P.bl[0], 54 + P.bl[1], '#f4ede0')
        .d(36 + P.fl[0], 54 + P.fl[1], '#f4ede0')
      s.line(
        [
          [16 + bx, 42 + by],
          [20 + bx, 44 + by],
          [24 + bx, 42 + by],
          [28 + bx, 44 + by],
        ],
        '#ff7a1a',
        '#ffd04a'
      )
        .line(
          [
            [36 + bx, 30 + by],
            [38 + bx, 26 + by],
          ],
          '#ff7a1a'
        )
        .line(
          [
            [42 + hx, 24 + hy],
            [44 + hx, 25 + hy],
          ],
          '#ff7a1a'
        )
      s.eye(43 + hx, 20 + hy, 'fierce').d(49 + hx, 23 + hy, '#2a0806')
      if (P.glow) glowMouth(s, 51 + hx, 27 + hy + j * 0.5)
    },
    emit: [
      { x: 50, y: 23, type: 'smoke', rate: 2 },
      { x: 49, y: 27, type: 'flame', rate: 4 },
      { x: 24, y: 14, type: 'ember', rate: 3 },
    ],
    mouth: [50, 26],
  },
  sunking: {
    size: 64,
    rig: BIPED,
    aura: { type: 'sun', x: 40, y: 22, r: 15 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        w = -6 * P.wing,
        [ax, ay] = P.arm,
        [a2x, a2y] = P.arm2,
        j = P.jaw * 2.5
      s.P(
        [
          [24, 40],
          [12, 24 + w],
          [19, 27 + w * 0.5],
          [14, 15 + w],
          [23, 24 + w * 0.5],
          [22, 12 + w],
          [29, 28],
          [28, 38],
        ].map(([x, y]) => [x + bx, y + by]),
        'fire'
      )
      s.L(4 + bx, 52 + by - t, 12 + bx, 56 + by, 1.5, 'sun', 3)
      s.L(12 + bx, 56 + by, 22 + bx, 55 + by, 3, 'sun', 5)
      s.P(
        [
          [2, 52],
          [3, 44],
          [6, 48],
          [8, 43],
          [9, 50],
          [6, 54],
        ].map(([x, y]) => [x + bx, y + by - t]),
        'fire'
      )
      s.L(36 + bx, 48 + by, 38 + P.bf[0], 58 + P.bf[1], 3, 'sun2')
      s.E(39 + P.bf[0], 59.5 + P.bf[1], 4, 1.4, 'sun2')
      s.L(36 + bx, 38 + by, 42 + bx + a2x, 44 + by + a2y, 1.6, 'sun2')
      s.E(29 + bx, 44 + by, 10, 12, 'sun')
      s.E(32 + bx, 44 + by, 5.5, 9, 'gold')
      for (const y of [38, 41, 44, 47, 50])
        s.line(
          [
            [28 + bx, y + by],
            [36 + bx, y + by],
          ],
          '#7d520a'
        )
      s.E(26 + bx, 52 + by, 5, 5.5, 'sun')
      s.L(26 + bx, 55 + by, 24 + P.bl[0], 59 + P.bl[1], 2.2, 'sun')
      s.E(26 + P.bl[0], 60 + P.bl[1], 4.5, 1.4, 'sun')
      s.P(
        [
          [33, 22],
          [25, 17],
          [30, 26],
        ].map(([x, y]) => [x + hx, y + hy]),
        'fire'
      )
      s.P(
        [
          [32, 26],
          [23, 27],
          [30, 30],
        ].map(([x, y]) => [x + hx, y + hy]),
        'fire'
      )
      s.P(
        [
          [33, 30],
          [26, 35],
          [33, 33],
        ].map(([x, y]) => [x + hx, y + hy]),
        'fire'
      )
      s.L(31 + bx, 36 + by, 36 + hx, 27 + hy, 4.5, 'sun', 3.8)
      s.E(40 + hx, 23 + hy, 7, 5.8, 'sun')
      s.E(47 + hx, 25 + hy, 5, 3.6, 'sun')
      s.P(
        [
          [38 + hx, 28 + hy],
          [52 + hx, 27 + hy + j],
          [50 + hx, 30.5 + hy + j],
          [40 + hx, 30.5 + hy],
        ],
        'belly'
      )
      if (j > 1)
        s.line(
          [
            [41 + hx, 28 + hy],
            [51 + hx, 28 + hy + j * 0.6],
          ],
          '#ff7a1a'
        )
      s.P(
        [
          [34, 20],
          [33, 10],
          [37, 18],
        ].map(([x, y]) => [x + hx, y + hy]),
        'gold'
      )
      s.P(
        [
          [37, 18],
          [38, 6],
          [41, 17],
        ].map(([x, y]) => [x + hx, y + hy]),
        'gold'
      )
      s.P(
        [
          [40, 18],
          [44, 8],
          [43, 19],
        ].map(([x, y]) => [x + hx, y + hy]),
        'gold'
      )
      s.E(39 + hx, 19.5 + hy, 5.5, 1.6, 'gold')
      s.d(39 + hx, 19 + hy, '#ff3b2a').d(40 + hx, 19 + hy, '#ff3b2a')
      s.L(25 + bx, 38 + by, 31 + bx + ax, 46 + by + ay, 2, 'sun')
      s.E(32 + bx + ax, 47 + by + ay, 2, 1.6, 'sun')
      s.d(34 + bx + ax, 48 + by + ay, '#f4ede0')
        .d(33 + bx + ax, 49 + by + ay, '#f4ede0')
        .d(23 + P.bl[0], 61 + P.bl[1], '#f4ede0')
        .d(29 + P.bl[0], 61 + P.bl[1], '#f4ede0')
        .d(44 + hx, 30 + hy, '#fff')
        .d(46 + hx, 30 + hy, '#fff')
        .d(48 + hx, 30 + hy, '#fff')
      s.eye(43 + hx, 21 + hy, 'fierce').d(51 + hx, 24 + hy, '#2a0806')
      if (P.glow) glowMouth(s, 53 + hx, 28 + hy + j * 0.5)
    },
    emit: [
      { x: 25, y: 18, type: 'flame', rate: 8 },
      { x: 23, y: 27, type: 'flame', rate: 6 },
      { x: 15, y: 16, type: 'flame', rate: 9 },
      { x: 22, y: 13, type: 'flame', rate: 9 },
      { x: 4, y: 45, type: 'flame', rate: 10 },
      { x: 34, y: 40, type: 'sparkle', rate: 2 },
    ],
    mouth: [52, 28],
  },
  phoenix: {
    size: 64,
    rig: BIPED,
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        w = -7 * P.wing
      s.P(
        [
          [30, 36],
          [36, 12 + w],
          [42, 6 + w],
          [44, 16 + w * 0.6],
          [50, 10 + w],
          [50, 24],
          [42, 34],
        ].map(([x, y]) => [x + bx, y + by]),
        'fire'
      )
      s.L(14 + bx, 52 + by - t, 24 + bx, 50 + by, 1.4, 'rose', 2.4)
      s.P(
        [
          [18, 48],
          [3, 57],
          [9, 51],
          [2, 50],
          [10, 46],
          [4, 42],
          [16, 46],
        ].map(([x, y]) => [x + bx, y + by - t]),
        'fire'
      )
      s.L(35 + bx, 51 + by, 37 + P.bf[0], 59 + P.bf[1], 1.8, 'rose2')
      s.E(38 + P.bf[0], 60 + P.bf[1], 3.2, 1.2, 'rose2')
      s.E(30 + bx, 46 + by, 8, 7, 'rose')
      s.E(32 + bx, 49 + by, 5.5, 3, 'gold')
      s.L(28 + bx, 51 + by, 27 + P.bl[0], 59 + P.bl[1], 2, 'rose')
      s.E(28 + P.bl[0], 60 + P.bl[1], 3.5, 1.2, 'rose')
      s.L(34 + bx, 42 + by, 39 + hx, 30 + hy, 3, 'rose', 2.5)
      s.P(
        [
          [38, 25],
          [34, 14],
          [40, 21],
        ].map(([x, y]) => [x + hx, y + hy]),
        'fire'
      )
      s.P(
        [
          [40, 23],
          [40, 11],
          [43, 21],
        ].map(([x, y]) => [x + hx, y + hy]),
        'fire'
      )
      s.E(42 + hx, 26 + hy, 5.5, 4.4, 'rose')
      s.E(47 + hx, 27.5 + hy, 4, 2.4, 'gold')
      if (P.jaw > 0.5) s.E(46 + hx, 30 + hy + P.jaw, 3, 1, 'gold')
      s.P(
        [
          [26, 38],
          [6, 20 + w],
          [3, 7 + w],
          [13, 13 + w * 0.7],
          [13, 3 + w],
          [21, 11 + w * 0.7],
          [24, 2 + w],
          [29, 15 + w * 0.5],
          [34, 31],
        ].map(([x, y]) => [x + bx, y + by]),
        'fire'
      )
      s.P(
        [
          [26, 36],
          [12, 20 + w * 0.7],
          [18, 21 + w * 0.5],
          [19, 10 + w * 0.7],
          [26, 22],
        ].map(([x, y]) => [x + bx, y + by]),
        'core'
      )
      s.line(
        [
          [24 + bx, 34 + by],
          [9 + bx, 15 + by + w],
        ],
        '#ff6a1a'
      )
        .line(
          [
            [25 + bx, 33 + by],
            [16 + bx, 6 + by + w],
          ],
          '#ff6a1a'
        )
        .line(
          [
            [27 + bx, 33 + by],
            [24 + bx, 5 + by + w],
          ],
          '#ff6a1a'
        )
      s.eye(44 + hx, 24 + hy, 'fierce')
      if (P.glow) glowMouth(s, 52 + hx, 28 + hy + P.jaw)
    },
    emit: [
      { x: 4, y: 8, type: 'flame', rate: 9 },
      { x: 13, y: 4, type: 'flame', rate: 9 },
      { x: 24, y: 3, type: 'flame', rate: 9 },
      { x: 44, y: 8, type: 'flame', rate: 7 },
      { x: 4, y: 53, type: 'flame', rate: 8 },
      { x: 20, y: 20, type: 'ember', rate: 5 },
    ],
    mouth: [51, 28],
  },
  avatar: {
    size: 64,
    rig: BIPED,
    aura: { type: 'twin', x: 32, y: 18, r: 15 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        [ax, ay] = P.arm,
        [a2x, a2y] = P.arm2
      s.P(
        [
          [27, 16],
          [22, 5],
          [29, 11],
          [32, 2],
          [35, 11],
          [42, 5],
          [38, 17],
        ].map(([x, y]) => [x + hx, y + hy]),
        'fire'
      )
      s.L(46 + bx, 30 + by, 50 + bx + a2x, 40 + by + a2y, 2.6, 'red2')
      s.E(50 + bx + a2x, 43 + by + a2y, 3, 2.6, 'fire')
      s.L(37 + bx, 46 + by, 40 + P.bf[0], 57 + P.bf[1], 3.2, 'coal')
      s.E(40 + P.bf[0], 54 + P.bf[1], 3.2, 2.3, 'gold')
      s.E(41 + P.bf[0], 60 + P.bf[1], 4.5, 1.5, 'gold')
      s.L(25 + bx, 46 + by, 23 + P.bl[0], 57 + P.bl[1], 3.5, 'lava')
      s.E(23 + P.bl[0], 54 + P.bl[1], 3.6, 2.5, 'gold')
      s.E(22 + P.bl[0], 60 + P.bl[1], 5, 1.6, 'gold')
      s.E(31 + bx, 44 + by, 9, 4, 'gold')
      s.P(
        [
          [20, 26],
          [44, 26],
          [40, 42],
          [24, 42],
        ].map(([x, y]) => [x + bx, y + by]),
        'red'
      )
      s.E(32 + bx, 33 + by, P.glow ? 5.2 : 4.2, P.glow ? 5.2 : 4.2, 'core')
      s.line(
        [
          [28 + bx, 29 + by],
          [36 + bx, 29 + by],
        ],
        '#c48a16'
      ).line(
        [
          [28 + bx, 37 + by],
          [36 + bx, 37 + by],
        ],
        '#c48a16'
      )
      s.E(45 + bx, 27 + by, 5.5, 4.2, 'gold')
      s.E(19 + bx, 27 + by, 6, 4.5, 'gold')
      s.spike(16 + bx, 24 + by, 5, 1.6, 'horn', -2)
      s.spike(21 + bx, 24 + by, 4, 1.4, 'horn')
      s.L(18 + bx, 30 + by, 14 + bx + ax, 42 + by + ay, 3, 'red')
      s.E(14 + bx + ax, 45 + by + ay, 3.5, 3, 'fire')
      s.E(32 + hx, 18 + hy, 6, 5.5, 'gold')
      s.E(34 + hx, 19.5 + hy, 4, 2.4, 'coal')
      s.P(
        [
          [27 + hx, 15 + hy],
          [24 + hx, 7 + hy],
          [30 + hx, 13 + hy],
        ],
        'gold'
      )
      s.P(
        [
          [36 + hx, 14 + hy],
          [40 + hx, 6 + hy],
          [38 + hx, 15 + hy],
        ],
        'gold'
      )
      s.d(34 + hx, 19 + hy, '#fff6b0')
        .d(35 + hx, 19 + hy, '#fff6b0')
        .d(37 + hx, 19 + hy, '#ffb02a')
        .d(32 + hx, 19 + hy, '#ffb02a')
    },
    emit: [
      { x: 32, y: 4, type: 'flame', rate: 10 },
      { x: 24, y: 7, type: 'flame', rate: 6 },
      { x: 41, y: 7, type: 'flame', rate: 6 },
      { x: 14, y: 44, type: 'flame', rate: 10 },
      { x: 50, y: 42, type: 'flame', rate: 8 },
      { x: 32, y: 33, type: 'sparkle', rate: 3 },
      { x: 32, y: 50, type: 'shard', rate: 1.2 },
    ],
    mouth: [36, 33],
  },
  boss: {
    size: 96,
    rig: QUAD,
    aura: { type: 'boss', x: 48, y: 86, r: 34 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        t = P.tail,
        w = -8 * P.wing,
        j = P.jaw * 5
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      // far wing, raised behind the back
      s.P(
        m(
          [
            [50, 50],
            [58, 22 + w * 0.5],
            [74, 6 + w],
            [72, 18 + w * 0.7],
            [86, 16 + w],
            [78, 28 + w * 0.6],
            [88, 36 + w * 0.5],
            [66, 46],
          ],
          bx,
          by
        ),
        'wing2'
      )
      s.L(52 + bx, 48 + by, 58 + bx, 22 + by + w * 0.5, 1.4, 'coal')
      s.L(58 + bx, 22 + by + w * 0.5, 74 + bx, 6 + by + w, 0.8, 'coal')
      s.L(58 + bx, 22 + by + w * 0.5, 86 + bx, 16 + by + w, 0.8, 'coal')
      s.L(58 + bx, 22 + by + w * 0.5, 88 + bx, 36 + by + w * 0.5, 0.8, 'coal')
      // near wing, raised behind the body
      s.P(
        m(
          [
            [46, 54],
            [36, 18 + w * 0.5],
            [16, 4 + w],
            [20, 16 + w * 0.7],
            [4, 18 + w],
            [14, 28 + w * 0.6],
            [4, 40 + w * 0.5],
            [24, 50],
          ],
          bx,
          by
        ),
        'wing'
      )
      s.L(46 + bx, 52 + by, 36 + bx, 18 + by + w * 0.5, 1.6, 'coal')
      s.L(36 + bx, 18 + by + w * 0.5, 16 + bx, 4 + by + w, 0.9, 'coal')
      s.L(36 + bx, 18 + by + w * 0.5, 4 + bx, 18 + by + w, 0.9, 'coal')
      s.L(36 + bx, 18 + by + w * 0.5, 4 + bx, 40 + by + w * 0.5, 0.9, 'coal')
      s.line(
        m(
          [
            [30, 30],
            [20, 22],
          ],
          bx,
          by + w * 0.6
        ),
        '#ff7a1a'
      ).line(
        m(
          [
            [26, 40],
            [14, 34],
          ],
          bx,
          by + w * 0.5
        ),
        '#ff7a1a'
      )
      // tail
      s.L(26 + bx, 72 + by, 14 + bx, 80 + by - t * 0.5, 7, 'lava', 5)
      s.L(14 + bx, 80 + by - t * 0.5, 4 + bx, 74 + by - t, 5, 'lava', 2.5)
      s.P(
        m(
          [
            [2, 65],
            [8, 71],
            [2, 77],
          ],
          bx,
          by - t
        ),
        'horn'
      )
      // far legs
      s.L(36 + bx, 72 + by, 34 + P.bf[0], 86 + P.bf[1], 4.5, 'lava2')
      s.E(35 + P.bf[0], 89 + P.bf[1], 5, 2, 'lava2')
      s.L(62 + bx, 70 + by, 66 + P.ff[0], 86 + P.ff[1], 4, 'lava2')
      s.E(67 + P.ff[0], 89 + P.ff[1], 4.5, 2, 'lava2')
      // body, chest and belly plates
      s.E(42 + bx, 66 + by, 21, 13, 'lava')
      s.E(60 + bx, 62 + by, 11, 12, 'lava')
      for (let i = 0; i < 7; i++)
        s.E(32 + i * 5 + bx, 77 - Math.sin((i / 6) * Math.PI) * 1.5 + by, 2.8, 2, 'belly')
      for (const [x, y, h] of [
        [22, 58, 5],
        [29, 55, 6],
        [36, 53, 7],
        [43, 52, 7],
        [50, 52, 6],
        [57, 51, 5],
      ])
        s.spike(x + bx, y + by, h, 2, 'horn', -1.5)
      // near legs
      s.E(32 + bx, 74 + by, 8, 9, 'lava')
      s.L(31 + bx, 79 + by, 29 + P.bl[0], 87 + P.bl[1], 4.5, 'lava')
      s.E(30 + P.bl[0], 90 + P.bl[1], 6, 2.2, 'lava')
      s.E(60 + bx, 72 + by, 6.5, 8, 'lava')
      s.L(60 + bx, 76 + by, 62 + P.fl[0], 87 + P.fl[1], 4, 'lava')
      s.E(63 + P.fl[0], 90 + P.fl[1], 5.5, 2.2, 'lava')
      // neck in two segments so it bends with the head
      const nx = 68 + (hx + bx) / 2,
        ny = 44 + (hy + by) / 2
      s.L(60 + bx, 58 + by, nx, ny, 8, 'lava', 7)
      s.L(nx, ny, 72 + hx, 34 + hy, 7, 'lava', 6)
      // swept-back horns
      s.L(70 + hx, 24 + hy, 60 + hx, 15 + hy, 2.6, 'horn', 1.4)
      s.L(60 + hx, 15 + hy, 52 + hx, 17 + hy, 1.4, 'horn', 0.6)
      s.L(76 + hx, 22 + hy, 70 + hx, 10 + hy, 2.2, 'horn', 1.2)
      s.L(70 + hx, 10 + hy, 64 + hx, 7 + hy, 1.2, 'horn', 0.5)
      // head and jaw
      s.E(76 + hx, 29 + hy, 9, 7, 'lava')
      s.E(86 + hx, 32 + hy, 8, 4.5, 'lava')
      s.P(
        m(
          [
            [70, 34],
            [92, 35 + j],
            [89, 39.5 + j],
            [72, 39],
          ],
          hx,
          hy
        ),
        'lava2'
      )
      if (j > 1)
        s.P(
          m(
            [
              [72, 34.5],
              [90, 35.5],
              [88, 34.5 + j],
              [73, 36 + j * 0.6],
            ],
            hx,
            hy
          ),
          'core'
        )
      s.E(77 + hx, 25 + hy, 7, 2, 'coal')
      for (const x of [80, 84, 88]) s.d(x + hx, 35 + hy, '#fff4e0')
      for (const x of [79, 83, 87]) s.d(x + hx, 36 + hy + j, '#fff4e0')
      s.d(92 + hx, 31 + hy, '#2a0806')
      s.line(
        m(
          [
            [26, 62],
            [32, 65],
            [36, 62],
            [42, 66],
            [48, 63],
          ],
          bx,
          by
        ),
        '#ff8a2a',
        '#ffd04a'
      )
        .line(
          m(
            [
              [52, 68],
              [58, 66],
              [62, 69],
            ],
            bx,
            by
          ),
          '#ff8a2a'
        )
        .line(
          m(
            [
              [22, 70],
              [26, 73],
            ],
            bx,
            by
          ),
          '#ff8a2a'
        )
        .line(
          m(
            [
              [72, 30],
              [76, 32],
            ],
            hx,
            hy
          ),
          '#ff8a2a'
        )
      s.d(26 + P.bl[0], 91 + P.bl[1], '#f4ede0')
        .d(33 + P.bl[0], 91 + P.bl[1], '#f4ede0')
        .d(60 + P.fl[0], 91 + P.fl[1], '#f4ede0')
        .d(66 + P.fl[0], 91 + P.fl[1], '#f4ede0')
      s.eye(79 + hx, 27 + hy, 'glow')
      if (P.glow) {
        glowMouth(s, 91 + hx, 36 + hy + j * 0.5)
        glowMouth(s, 86 + hx, 36 + hy + j * 0.5)
      }
    },
    emit: [
      { x: 40, y: 60, type: 'ember', rate: 10 },
      { x: 88, y: 41, type: 'drip', rate: 2 },
      { x: 30, y: 55, type: 'smoke', rate: 3 },
      { x: 90, y: 36, type: 'flame', rate: 8 },
      { x: 20, y: 20, type: 'ember', rate: 4 },
    ],
    mouth: [91, 36],
  },
}
