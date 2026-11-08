'use strict'
// raid sprites, added to the shared SPRITES table.
Object.assign(SPRITES, {
  /* ----- Raid bosses (still drafts): one per element that has a raid boss, each from its line's animal family ----- */
  // ราชันย์ลาวา (fire raid): a lava golem, basalt boulders stacked into a hunched giant, lava glowing in every seam
  lavaking: {
    size: 96,
    rig: BIPED,
    aura: { type: 'boss', x: 48, y: 90, r: 36 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        a1 = P.arm,
        a2 = P.arm2,
        j = P.jaw * 2
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      // molten insides first: the stones sit on top, so lava shows in every gap
      s.L(20 + bx, 40 + by, 18 + a2[0], 76 + a2[1], 4, 'fire')
      s.L(76 + bx, 40 + by, 82 + a1[0], 76 + a1[1], 4, 'fire')
      s.E(48 + bx, 50 + by, 22, 20, 'fire')
      s.L(38 + bx, 66 + by, 36 + P.bl[0], 86 + P.bl[1], 4, 'fire')
      s.L(58 + bx, 66 + by, 60 + P.bf[0], 86 + P.bf[1], 4, 'fire')
      // far arm: stacked stones down to a fist on the ground
      s.E(20 + bx, 50 + by, 6.5, 7.5, 'basalt2')
      s.E(18 + (bx + a2[0]) / 2, 63 + (by + a2[1]) / 2, 6, 6.5, 'basalt2')
      s.E(18 + a2[0], 78 + a2[1], 9, 8, 'basalt2')
      // legs: short thick columns
      s.E(36 + P.bl[0] * 0.5, 76 + by, 8, 8, 'basalt2')
      s.E(36 + P.bl[0], 87 + P.bl[1], 9, 4.5, 'basalt2')
      s.E(60 + P.bf[0] * 0.5, 76 + by, 8, 8, 'basalt')
      s.E(60 + P.bf[0], 87 + P.bf[1], 9, 4.5, 'basalt')
      s.E(48 + bx, 67 + by, 15, 6.5, 'basalt2')
      // the chest boulder with a molten core and glowing cracks
      s.P(
        m(
          [
            [27, 38],
            [36, 28],
            [50, 25],
            [64, 28],
            [72, 40],
            [68, 58],
            [52, 63],
            [32, 58],
          ],
          bx,
          by
        ),
        'basalt'
      )
      s.E(52 + bx, 45 + by, 6, 6, 'fire')
      s.E(52 + bx, 45 + by, 3.5, 3.5, 'core')
      for (const pts of [
        [
          [44, 32],
          [47, 38],
          [46, 42],
        ],
        [
          [58, 52],
          [62, 56],
          [61, 60],
        ],
        [
          [36, 46],
          [40, 50],
        ],
      ])
        s.line(m(pts, bx, by), '#ff8a24', '#ffd04a')
      // shoulders, then a small head boulder sunk between them: a glowing visor slit, a jaw that opens on lava
      s.E(26 + bx, 36 + by, 10, 8.5, 'basalt')
      s.E(72 + bx, 36 + by, 10, 8.5, 'basalt')
      s.spike(24 + bx, 30 + by, 6, 2.4, 'basalt2', -2)
      s.spike(72 + bx, 30 + by, 6, 2.4, 'basalt2', 2)
      s.E(54 + hx, 24 + hy, 9, 7, 'basalt2')
      s.P(
        m(
          [
            [46, 20],
            [54, 17],
            [63, 20],
            [61, 23],
            [48, 23],
          ],
          hx,
          hy
        ),
        'basalt'
      )
      s.line(
        m(
          [
            [52, 24],
            [61, 23],
          ],
          hx,
          hy
        ),
        '#ffd04a',
        '#fff3a8'
      )
      s.P(
        m(
          [
            [50, 28],
            [62, 28 + j],
            [60, 31 + j],
            [51, 31],
          ],
          hx,
          hy
        ),
        'basalt'
      )
      if (j > 0.5)
        s.line(
          m(
            [
              [52, 28.5],
              [60, 28.5],
            ],
            hx,
            hy
          ),
          '#ff8a24'
        )
      // near arm: three stones and a huge fist knuckling the ground
      s.E(77 + bx, 50 + by, 7, 8, 'basalt')
      s.E(80 + (bx + a1[0]) / 2, 63 + (by + a1[1]) / 2, 6.5, 7, 'basalt')
      s.E(82 + a1[0], 78 + a1[1], 10.5, 9, 'basalt')
      for (const x of [77, 82, 87])
        s.line(
          [
            [x + a1[0], 82 + a1[1]],
            [x + a1[0], 86 + a1[1]],
          ],
          '#1a0604'
        )
      for (const [x, y] of [
        [80, 57],
        [20, 57],
        [30, 66],
        [66, 66],
      ])
        s.line(
          [
            [x + bx, y + by],
            [x + 3 + bx, y + by],
          ],
          '#ff8a24'
        )
      if (P.glow) glowMouth(s, 56 + hx, 30 + hy)
    },
    glows: [
      [52, 45, '#ff9a2a', 10, 'body'],
      [57, 23, '#ffd04a', 4, 'head'],
    ],
    emit: [
      { x: 26, y: 30, type: 'smoke', rate: 2 },
      { x: 72, y: 30, type: 'smoke', rate: 2 },
      { x: 52, y: 45, type: 'ember', rate: 3 },
      { x: 82, y: 86, type: 'drip', rate: 1.2 },
    ],
    mouth: [56, 30],
  },
  // อสูรห้วงลึก (water raid): the owner's AI-made shark (bitmap in raid-bitmaps.js), a long blue shark with a
  // jagged spine crest. Wider than the other bosses (160 grid) because the picture is 150 x 59.
  // The tail sways with the pose and the whole body bobs; the jaw itself does not move.
  abyssfish: {
    size: 160,
    rig: SWIM,
    hover: 6,
    aura: { type: 'bossw', x: 80, y: 154, r: 52 },
    draw(s, P) {
      const [bx, by] = P.body,
        t = P.tail
      s.bmp(RAID_BMP.abyssfish, 5 + bx, 96 + by, (x) =>
        x < 36 ? [0, -t * 1.4 * (1 - x / 36)] : [0, 0]
      )
    },
    emit: [
      { x: 90, y: 104, type: 'bubble', rate: 2.5 },
      { x: 12, y: 118, type: 'mist', rate: 2 },
    ],
    mouth: [150, 132],
  },
  // เซราฟรัศมี (holy raid): a six-winged peacock of light, its fan tail spread behind it, each feather with a gold eye
  raidseraph: {
    size: 96,
    rig: BIPED,
    aura: { type: 'bossh', x: 48, y: 90, r: 36 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        w = P.wing
      // fan tail behind everything: nine long feathers, each ending in a big gold-and-sky eye
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (1.04 + i * 0.115),
          x1 = 40 + Math.cos(a) * 42 + bx,
          y1 = 66 + Math.sin(a) * 40 + by
        s.L(42 + bx, 66 + by, x1, y1, 1.4, 'feath2', 4.6)
        s.E(x1, y1, 4.6, 3.8, 'gold')
        s.E(x1, y1, 2.8, 2.2, 'sky')
        s.d(x1, y1, '#1e3a6e')
      }
      // six wings, warm ivory so they stand off the cool fan: a raised top pair, a spread middle pair, a low pair over the legs
      plumeWing(s, 46 + bx, 52 + by, 30, 10, -2.0 - w * 0.1, 'ivory', 1, '#c48a16')
      plumeWing(s, 54 + bx, 52 + by, 30, 10, -1.15 + w * 0.1, 'ivory', -1, '#c48a16')
      plumeWing(s, 44 + bx, 60 + by, 22, 8, -2.85, 'ivory2', 1, '#c48a16')
      plumeWing(s, 56 + bx, 60 + by, 22, 8, -0.3, 'ivory2', -1, '#c48a16')
      s.L(46 + bx, 72 + by, 44 + P.bl[0], 88 + P.bl[1], 2, 'gold')
      s.L(54 + bx, 72 + by, 56 + P.bf[0], 88 + P.bf[1], 2, 'gold')
      s.line(
        [
          [40 + P.bl[0], 89 + P.bl[1]],
          [47 + P.bl[0], 89 + P.bl[1]],
        ],
        '#c48a16'
      )
      s.line(
        [
          [53 + P.bf[0], 89 + P.bf[1]],
          [60 + P.bf[0], 89 + P.bf[1]],
        ],
        '#c48a16'
      )
      s.E(50 + bx, 62 + by, 14, 14, 'ivory')
      s.E(56 + bx, 60 + by, 8, 11, 'sky')
      plumeWing(s, 42 + bx, 68 + by, 16, 6, 2.6, 'halo', 1, '#c48a16')
      plumeWing(s, 58 + bx, 68 + by, 16, 6, 0.55, 'halo', -1, '#c48a16')
      // neck and head: sky-blue throat, halo behind, three crest plumes with gold orbs, hooked gold beak
      s.L(56 + bx, 54 + by, 64 + hx, 30 + hy, 6, 'ivory', 4.5)
      s.L(59 + bx, 54 + by, 67 + hx, 32 + hy, 3, 'sky', 2.2)
      haloRing(s, 63 + hx, 21 + hy, 11, 3.4, 0.1)
      for (const [x, y] of [
        [61, 8],
        [66, 6],
        [71, 9],
      ]) {
        s.line(
          [
            [66 + hx, 21 + hy],
            [x + hx, y + hy],
          ],
          '#c48a16'
        )
        s.E(x + hx, y + hy, 1.8, 1.8, 'halo')
      }
      s.E(67 + hx, 25 + hy, 7.5, 6, 'ivory')
      s.P(
        [
          [73 + hx, 23 + hy],
          [81 + hx, 26 + hy],
          [74 + hx, 29 + hy],
        ],
        'gold'
      )
      s.d(70 + hx, 24 + hy, '#1a1a3a')
        .d(71 + hx, 24 + hy, '#1a1a3a')
        .d(70 + hx, 23 + hy, '#ffffff')
      s.line(
        [
          [69 + hx, 27 + hy],
          [72 + hx, 27 + hy],
        ],
        '#7ee7ff'
      )
      if (P.glow) glowMouth(s, 80 + hx, 26 + hy)
    },
    glows: [
      [66, 21, '#fff3a8', 10, 'head'],
      [50, 60, '#fff3a8', 9, 'body'],
    ],
    emit: [
      { x: 40, y: 40, type: 'sparkle', rate: 4 },
      { x: 50, y: 60, type: 'glint', rate: 2 },
      { x: 66, y: 8, type: 'goldleaf', rate: 1 },
    ],
    mouth: [80, 26],
  },
  // จ้าวมืดมิด (dark raid): Dracula, the vampire count, a person-sized boss: high red-lined collar, slicked hair with a widow's peak, red eyes and fangs
  vampire: {
    size: 72,
    rig: BIPED,
    aura: { type: 'bossd', x: 36, y: 68, r: 26 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        a1 = P.arm
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      // the cape behind: black outside, blood-red lining showing on the far side, the high collar standing up behind the head
      s.P(
        m(
          [
            [24, 22],
            [46, 22],
            [56, 52],
            [60, 68],
            [8, 68],
            [14, 46],
          ],
          bx,
          by
        ),
        'cloak'
      )
      s.P(
        m(
          [
            [25, 24],
            [15, 48],
            [10, 67],
            [20, 66],
            [27, 34],
          ],
          bx,
          by
        ),
        'blood'
      )
      s.P(
        m(
          [
            [27, 22],
            [21, 3],
            [33, 14],
          ],
          hx,
          hy
        ),
        'blood'
      )
      s.P(
        m(
          [
            [43, 20],
            [49, 3],
            [45, 15],
          ],
          hx,
          hy
        ),
        'blood'
      )
      s.line(
        m(
          [
            [21, 3],
            [27, 21],
          ],
          hx,
          hy
        ),
        '#120a12'
      ).line(
        m(
          [
            [49, 3],
            [44, 20],
          ],
          hx,
          hy
        ),
        '#120a12'
      )
      // legs and shoes
      s.L(32 + bx, 48 + by, 31 + P.bl[0], 66 + P.bl[1], 2.6, 'cloak2')
      s.E(32 + P.bl[0], 67 + P.bl[1], 3.4, 1.4, 'cloak')
      s.L(40 + bx, 48 + by, 42 + P.bf[0], 66 + P.bf[1], 2.6, 'cloak2')
      s.E(43 + P.bf[0], 67 + P.bf[1], 3.4, 1.4, 'cloak')
      // black suit, white shirt front, a red medallion on a gold chain
      s.P(
        m(
          [
            [28, 24],
            [44, 24],
            [45, 50],
            [27, 50],
          ],
          bx,
          by
        ),
        'cloak2'
      )
      s.P(
        m(
          [
            [34, 24],
            [39, 24],
            [37, 36],
          ],
          bx,
          by
        ),
        'pearl'
      )
      s.line(
        m(
          [
            [33, 24],
            [37, 30],
            [40, 24],
          ],
          bx,
          by
        ),
        '#c48a16'
      )
      s.E(37 + bx, 31 + by, 2, 2, 'blood')
      s.d(36.5 + bx, 30.5 + by, '#ff8a8a')
      // the near arm lifts the cape's edge, a pale clawed hand
      s.L(43 + bx, 27 + by, 50 + a1[0], 34 + a1[1], 2.4, 'cloak2')
      s.P(
        m(
          [
            [44, 26],
            [52, 32],
            [54, 48],
            [46, 46],
          ],
          a1[0] * 0.5 + bx,
          a1[1] * 0.5 + by
        ),
        'cloak'
      )
      s.E(51 + a1[0], 34 + a1[1], 2, 2.2, 'pearl')
      for (const dy of [0, 1.5]) s.d(53 + a1[0], 34 + dy + a1[1], '#e8f0ff')
      // head: pale face in profile, slicked-back black hair with a sharp widow's peak, pointed ear, red eye, two fangs
      s.E(37 + hx, 14 + hy, 6.6, 7.4, 'pearl')
      s.P(
        m(
          [
            [42, 15],
            [45.5, 17.5],
            [42, 19],
          ],
          hx,
          hy
        ),
        'pearl'
      )
      s.P(
        m(
          [
            [30, 17],
            [30, 9],
            [33, 5],
            [40, 4],
            [45, 7],
            [42, 8.5],
            [40, 11.5],
            [37.5, 8.5],
            [34, 11],
            [32.5, 18],
          ],
          hx,
          hy
        ),
        'cloak'
      )
      s.P(
        m(
          [
            [33, 13],
            [30, 9],
            [35, 15],
          ],
          hx,
          hy
        ),
        'pearl'
      )
      s.line(
        m(
          [
            [38, 11],
            [42, 11.5],
          ],
          hx,
          hy
        ),
        '#120a12'
      )
      s.d(40 + hx, 12.5 + hy, '#ff3b3b').d(41 + hx, 12.5 + hy, '#ff3b3b')
      s.line(
        m(
          [
            [38, 19],
            [42, 19],
          ],
          hx,
          hy
        ),
        '#5a0a1a'
      )
      s.d(39 + hx, 20 + hy, '#ffffff').d(41 + hx, 20 + hy, '#ffffff')
      s.line(
        m(
          [
            [36, 15],
            [36, 17],
          ],
          hx,
          hy
        ),
        '#a8bcd0'
      )
      // two bats circling his shoulders
      for (const [x, y, f] of [
        [14, 14, 1],
        [56, 10, -1],
      ])
        s.P(
          m(
            [
              [x - 4, y - 1],
              [x - 2, y + 1],
              [x, y],
              [x + 2, y + 1],
              [x + 4, y - 1],
              [x + 1, y + 2.5],
              [x, y + 3],
              [x - 1, y + 2.5],
            ],
            bx,
            by + f * P.wing
          ),
          'bat'
        )
      if (P.glow) glowMouth(s, 42 + hx, 19 + hy)
    },
    glows: [
      [40.5, 12.5, '#ff3b3b', 2.5, 'head'],
      [37, 31, '#ff3b3b', 2.5, 'body'],
    ],
    emit: [{ x: 34, y: 60, type: 'mist', rate: 2 }],
    mouth: [42, 19],
  },
  // ราชันย์เงานิรนาม (shadow raid): a giant headless knight; violet fire burns from its collar round a blank cracked mask, a chain flail drags at its side
  nameless: {
    size: 96,
    rig: BIPED,
    aura: { type: 'bosss', x: 48, y: 90, r: 36 },
    draw(s, P) {
      const [bx, by] = P.body,
        hx = P.head[0] + bx,
        hy = P.head[1] + by,
        a2 = P.arm2,
        a1 = P.arm
      const m = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
      // tattered banner cape behind
      s.P(
        m(
          [
            [30, 32],
            [64, 32],
            [72, 72],
            [70, 88],
            [64, 82],
            [58, 90],
            [50, 82],
            [42, 90],
            [34, 82],
            [26, 88],
            [22, 72],
          ],
          bx,
          by
        ),
        'cape'
      )
      s.line(
        m(
          [
            [36, 40],
            [30, 80],
          ],
          bx,
          by
        ),
        '#3a2a48'
      ).line(
        m(
          [
            [58, 40],
            [64, 80],
          ],
          bx,
          by
        ),
        '#3a2a48'
      )
      // far arm hanging, a gauntlet with claws
      s.L(32 + bx, 40 + by, 26 + a2[0], 62 + a2[1], 4.5, 'arm2')
      s.E(25 + a2[0], 64 + a2[1], 4, 4, 'arm2')
      // legs: greaves and pointed sabatons
      s.L(42 + bx, 64 + by, 40 + P.bl[0], 86 + P.bl[1], 5, 'arm2')
      s.P(
        [
          [34 + P.bl[0], 90 + P.bl[1]],
          [40 + P.bl[0], 84 + P.bl[1]],
          [47 + P.bl[0], 90 + P.bl[1]],
        ],
        'arm2'
      )
      s.L(54 + bx, 64 + by, 56 + P.bf[0], 86 + P.bf[1], 5, 'arm')
      s.P(
        [
          [50 + P.bf[0], 90 + P.bf[1]],
          [56 + P.bf[0], 84 + P.bf[1]],
          [64 + P.bf[0], 90 + P.bf[1]],
        ],
        'arm'
      )
      // torso: breastplate with a violet crack, tassets, wide spiked pauldrons
      s.P(
        m(
          [
            [34, 34],
            [62, 34],
            [60, 58],
            [52, 66],
            [44, 66],
            [36, 58],
          ],
          bx,
          by
        ),
        'arm'
      )
      s.line(
        m(
          [
            [48, 38],
            [46, 46],
            [50, 52],
            [47, 60],
          ],
          bx,
          by
        ),
        '#a04aff',
        '#d070e8'
      )
      s.P(
        m(
          [
            [36, 60],
            [60, 60],
            [62, 70],
            [34, 70],
          ],
          bx,
          by
        ),
        'arm2'
      )
      s.line(
        m(
          [
            [48, 61],
            [48, 70],
          ],
          bx,
          by
        ),
        '#0c0c14'
      )
      s.E(32 + bx, 36 + by, 9, 6.5, 'arm2')
      s.E(64 + bx, 36 + by, 9, 6.5, 'arm')
      s.spike(28 + bx, 32 + by, 7, 1.8, 'arm2', -3)
      s.spike(34 + bx, 31 + by, 6, 1.6, 'arm2', -1)
      s.spike(62 + bx, 31 + by, 6, 1.6, 'arm', 1)
      s.spike(68 + bx, 32 + by, 7, 1.8, 'arm', 3)
      s.E(48 + bx, 31 + by, 10, 3.5, 'arm2')
      // no head: violet fire rises from the collar, a blank mask with one crack floats in it
      s.P(
        m(
          [
            [39, 30],
            [41, 18],
            [44, 22],
            [46, 6],
            [49, 16],
            [52, 4],
            [54, 20],
            [57, 16],
            [57, 30],
          ],
          hx,
          hy
        ),
        'vio'
      )
      s.P(
        m(
          [
            [43, 30],
            [45, 20],
            [48, 24],
            [51, 12],
            [53, 24],
            [54, 30],
          ],
          hx,
          hy
        ),
        'soulc'
      )
      s.E(49 + hx, 19 + hy, 5, 6.5, 'bone')
      s.line(
        m(
          [
            [50, 13],
            [49, 17],
            [51, 20],
            [49, 25],
          ],
          hx,
          hy
        ),
        '#2a2620'
      )
      // near arm holding the chain flail; the chain sags to a spiked orb on the ground
      s.L(64 + bx, 40 + by, 72 + a1[0], 58 + a1[1], 5, 'arm')
      s.E(73 + a1[0], 60 + a1[1], 4.5, 4.5, 'arm')
      const ch = [
        [75, 63],
        [78, 67],
        [80, 71],
        [81, 75],
        [80, 79],
        [79, 82],
      ]
      for (const [x, y] of ch) s.E(x + a1[0], y + a1[1] * 0.5, 1.4, 1.2, 'iron')
      s.E(78 + a1[0] * 0.3, 86, 6, 5.5, 'arm2')
      for (const [dx, dy] of [
        [0, -7],
        [6, -3],
        [-6, -3],
        [4, 4],
        [-4, 4],
      ])
        s.d(78 + dx + a1[0] * 0.3, 86 + dy, '#8a8aa8')
      s.E(78 + a1[0] * 0.3, 86, 2.4, 2.2, 'vio')
      if (P.glow) glowMouth(s, 49 + hx, 19 + hy)
    },
    glows: [
      [49, 14, '#a04aff', 10, 'head'],
      [78, 86, '#a04aff', 5],
      [48, 48, '#a04aff', 4, 'body'],
    ],
    emit: [
      { x: 49, y: 8, type: 'ember', rate: 4 },
      { x: 46, y: 88, type: 'mist', rate: 2 },
    ],
    mouth: [49, 19],
  },
})
