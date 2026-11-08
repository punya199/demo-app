import type { Pt } from '../engine/spr'
import { RAID_BMP } from '../bitmaps/raid-bitmaps'
import { bmpRig } from '../engine/bmp-rig'
import { BIPED, SWIM } from '../engine/rigs'
import { glowMouth, haloRing } from '../engine/shapes'
import {
  NAMELESS_ORDER,
  SERAPH_ORDER,
  SHARK_ORDER,
  VAMP_ORDER,
  golemRock,
  namelessOffsets,
  namelessPart,
  seraphOffsets,
  seraphPart,
  sharkOffsets,
  sharkPart,
  vampOffsets,
  vampPart,
} from './raid-parts'
import type { ISpriteDef } from '../sprite-types'

// Raid bosses drawn from the owner's AI-made pictures (bitmaps in raid-bitmaps.ts), cut into parts.
// Ported from the prototype (docs/tamagotchi/prototypes/monster-arena/js/sprites).
export const RAID_SPRITES: Record<string, ISpriteDef> = {
  /* ----- Raid bosses (still drafts): one per element that has a raid boss, each from its line's animal family ----- */
  // ราชันย์ลาวา (fire raid): the owner's AI-made lava golem (bitmap in raid-bitmaps.ts), animated by
  // cutting it into head, arms and legs that follow the BIPED pose; lava shows at the neck when the
  // head moves. Smoke and embers are particles.
  lavaking: {
    size: 96,
    rig: BIPED,
    aura: { type: 'boss', x: 48, y: 92, r: 38 },
    draw(s, P) {
      const k = 0.6,
        sc = (v: Pt, f = 1) => [v[0] * k * f, v[1] * k * f],
        lim = (v: Pt, m: number) => [
          Math.max(-m, Math.min(m, v[0])),
          Math.max(-m, Math.min(m, v[1])),
        ],
        add = (u: Pt, v: Pt) => [u[0] + v[0], u[1] + v[1]],
        mix = (u: Pt, v: Pt, f: number) => [u[0] + (v[0] - u[0]) * f, u[1] + (v[1] - u[1]) * f],
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
  // อสูรห้วงลึก (water raid): the owner's AI-made shark (bitmap in raid-bitmaps.ts), 150 x 59 on a 160 grid.
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
  // เซราฟรัศมี (holy raid): the owner's AI-made six-winged peacock (bitmap in raid-bitmaps.ts), cut into
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

  // จ้าวมืดมิด (dark raid): the owner's AI-made Dracula, person-sized on a 72 grid (bitmap in
  // raid-bitmaps.ts), cut into head, hand, cape edges and legs (vampPart); two bats are drawn in code.
  vampire: {
    size: 72,
    rig: BIPED,
    aura: { type: 'bossd', x: 36, y: 68, r: 26 },
    draw(s, P) {
      const o = vampOffsets(P),
        dark = { col: '#08060c', off: o.body, inner: 1 },
        lining = { col: '#460614', off: o.body, inner: 1 }
      bmpRig(s, RAID_BMP.vampire, 14, 2, vampPart, o, VAMP_ORDER, {
        head: dark,
        hand: { ...lining, inner: 2 },
        capeL: { col: '#28232c', off: o.body, inner: 1 },
        capeR: dark,
      })
      // two bats flapping by his shoulders
      for (const [x, y, f] of [
        [24, 10, 1],
        [60, 14, -1],
      ] as const) {
        const bx = x + o.body[0],
          by = y + o.body[1] + f * P.wing,
          up = P.wing * f > 0 ? -1 : 1
        const k = 1.2
        s.P(
          [
            [-6, -2 + up * 2],
            [-3, -0.5],
            [-1, -1.5],
            [0, -0.5],
            [1, -1.5],
            [3, -0.5],
            [6, -2 + up * 2],
            [5, 1],
            [3, 0.5],
            [1.5, 2],
            [0, 3],
            [-1.5, 2],
            [-3, 0.5],
            [-5, 1],
          ].map(([px, py]) => [bx + px * k, by + py * k]),
          'bat'
        )
      }
      if (P.glow) glowMouth(s, 45 + o.head[0], 12 + o.head[1])
    },
    glows: [
      [43, 9, '#ff3b3b', 2, 'head'],
      [46, 9, '#ff3b3b', 2, 'head'],
      [44, 19, '#ff3b3b', 2, 'body'],
    ],
    emit: [{ x: 34, y: 66, type: 'mist', rate: 2 }],
    mouth: [45, 12],
  },
  // ราชันย์เงานิรนาม (shadow raid): the owner's AI-made headless knight (bitmap in raid-bitmaps.ts), cut
  // into flaming head, fist, swinging flail ball, cape edge and legs (namelessPart); the chain is drawn.
  nameless: {
    size: 96,
    rig: BIPED,
    aura: { type: 'bosss', x: 48, y: 90, r: 36 },
    draw(s, P) {
      const o = namelessOffsets(P),
        dark = { col: '#1e1a26', off: o.body, inner: 1 }
      bmpRig(s, RAID_BMP.nameless, 5, 3, namelessPart, o, NAMELESS_ORDER, {
        head: dark,
        fist: dark,
        cape: { col: '#4e4258', off: o.body, inner: 1 },
      })
      // the chain: links from the fist to the top of the ball, sagging in the middle
      const x0 = 66 + o.fist[0],
        y0 = 52 + o.fist[1],
        x1 = 80 + o.ball[0],
        y1 = 76 + o.ball[1],
        n = 16
      for (let i = 0; i <= n; i++) {
        const t = i / n,
          x = x0 + (x1 - x0) * t,
          y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 4
        s.d(x, y, i % 2 ? '#8a8aa8' : '#2a2632')
      }
      if (P.glow) glowMouth(s, 45 + o.head[0], 18 + o.head[1])
    },
    glows: [
      [45, 12, '#a04aff', 10, 'head'],
      [47, 37, '#a04aff', 4, 'body'],
    ],
    emit: [
      { x: 42, y: 5, type: 'ember', rate: 4 },
      { x: 46, y: 88, type: 'mist', rate: 2 },
    ],
    mouth: [45, 18],
  },
}
