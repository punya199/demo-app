'use strict'
// raid sprites, added to the shared SPRITES table.
Object.assign(SPRITES, {
  /* ----- Raid bosses (still drafts): one per element that has a raid boss, each from its line's animal family ----- */
  // ราชันย์ลาวา (fire raid): the owner's AI-made lava golem (bitmap in raid-bitmaps.js), animated by
  // cutting it into head, arms and legs that follow the BIPED pose; lava shows at the neck when the
  // head moves. Smoke and embers are particles.
  lavaking: {
    size: 96,
    rig: BIPED,
    aura: { type: 'boss', x: 48, y: 92, r: 38 },
    draw(s, P) {
      const k = 0.6,
        sc = (v, f = 1) => [v[0] * k * f, v[1] * k * f],
        lim = (v, m) => [Math.max(-m, Math.min(m, v[0])), Math.max(-m, Math.min(m, v[1]))],
        add = (u, v) => [u[0] + v[0], u[1] + v[1]],
        mix = (u, v, f) => [u[0] + (v[0] - u[0]) * f, u[1] + (v[1] - u[1]) * f],
        body = sc(P.body),
        armF = add(body, lim(sc(P.arm), 4)),
        armB = add(body, lim(sc(P.arm2), 3.5)),
        legB = sc(P.bl),
        legF = sc(P.bf)
      // every rock the owner circled moves whole: along an arm the shoulder moves a little and the fist the most
      const offs = {
        body,
        head: add(body, lim(sc(P.head), 2)),
        shoulderB: mix(body, armB, 0.25),
        upperB: mix(body, armB, 0.5),
        foreB: mix(body, armB, 0.8),
        fistB: armB,
        shoulderF: mix(body, armF, 0.25),
        upperF: mix(body, armF, 0.5),
        foreF: mix(body, armF, 0.8),
        fistF: armF,
        thighB: mix(body, legB, 0.5),
        shinB: legB,
        thighF: mix(body, legF, 0.5),
        footF: legF,
      }
      const order = [
        'fistB',
        'foreB',
        'upperB',
        'shinB',
        'thighB',
        'body',
        'shoulderB',
        'head',
        'thighF',
        'footF',
        'upperF',
        'foreF',
        'fistF',
        'shoulderF',
      ]
      // molten lava sits behind every rock, so a gap opened by a moving rock glows instead of leaving a hole
      const under = Object.fromEntries(
        order.filter((n) => n !== 'body').map((n) => [n, { col: '#6a1206', off: body, inner: 3 }])
      )
      bmpRig(s, RAID_BMP.lavaking, 3, 7, golemRock, offs, order, under)
      if (P.glow) glowMouth(s, 60 + body[0], 47 + body[1])
    },
    glows: [
      [60, 47, '#ff9a2a', 10, 'body'],
      [66, 22, '#ffd04a', 3, 'head'],
    ],
    emit: [
      { x: 22, y: 10, type: 'smoke', rate: 2 },
      { x: 70, y: 12, type: 'smoke', rate: 2 },
      { x: 60, y: 47, type: 'ember', rate: 3 },
      { x: 84, y: 92, type: 'drip', rate: 1 },
    ],
    mouth: [60, 47],
  },
  // อสูรห้วงลึก (water raid): the owner's AI-made shark (bitmap in raid-bitmaps.js), 150 x 59 on a 160 grid.
  // Cut into tail, eight crest spikes, pectoral fin, three belly fins and the lower jaw (sharkPart):
  // the tail sways, the spikes ripple in a wave, the fins paddle and the jaw drops open on a red mouth.
  abyssfish: {
    size: 160,
    rig: SWIM,
    hover: 6,
    aura: { type: 'bossw', x: 80, y: 154, r: 52 },
    draw(s, P) {
      bmpRig(s, RAID_BMP.abyssfish, 5, 96, sharkPart, sharkOffsets(P), SHARK_ORDER, {
        jaw: { col: '#5f1125', off: P.body },
      })
      if (P.glow) glowMouth(s, 146 + P.body[0], 134 + P.body[1])
    },
    emit: [
      { x: 90, y: 104, type: 'bubble', rate: 2.5 },
      { x: 12, y: 118, type: 'mist', rate: 2 },
    ],
    mouth: [146, 134],
  },
  // เซราฟรัศมี (holy raid): the owner's AI-made six-winged peacock (bitmap in raid-bitmaps.js), cut into
  // head, raised wings, middle and low wings and legs (seraphPart). Crest and halo are drawn in code.
  raidseraph: {
    size: 96,
    rig: BIPED,
    aura: { type: 'bossh', x: 48, y: 92, r: 36 },
    draw(s, P) {
      const o = seraphOffsets(P),
        cream = { col: '#f0e8ce', off: o.body, inner: 1 }
      bmpRig(s, RAID_BMP.raidseraph, 4, 4, seraphPart, o, SERAPH_ORDER, {
        wingUp: cream,
        wingMid: cream,
        wingLow: cream,
        head: { col: '#40aae8', off: o.body, inner: 1 },
      })
      const hx = 4 + o.head[0],
        hy = 4 + o.head[1],
        sway = P.head[0] * 0.3
      // crest: three thin sky stems ending in gold orbs, and the halo ring round them
      for (const [tx, ty] of [
        [69, 22],
        [74, 19],
        [79, 21],
      ]) {
        s.L(75 + hx, 29 + hy, tx + hx + sway, ty + hy, 0.5, 'sky', 0.4)
        s.E(tx + hx + sway, ty + hy, 1.4, 1.4, 'gold')
      }
      haloRing(s, 75 + hx, 26 + hy, 9, 2.6)
      if (P.glow) glowMouth(s, 83 + hx, 33 + hy)
    },
    glows: [
      [74 + 4, 20 + 4, '#fff3a8', 9, 'head'],
      [40, 50, '#fff3a8', 10, 'body'],
    ],
    emit: [
      { x: 40, y: 40, type: 'sparkle', rate: 4 },
      { x: 50, y: 60, type: 'glint', rate: 2 },
      { x: 30, y: 20, type: 'sparkle', rate: 2 },
    ],
    mouth: [87, 37],
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
