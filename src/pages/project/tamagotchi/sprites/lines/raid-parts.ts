import type { PartOffset } from '../engine/bmp-rig'
import type { Pt } from '../engine/spr'
import type { IPose } from '../sprite-types'
// The golem's rocks as the owner circled them on the preview (2026-11-08), as ellipses on the 90 x 87
// bitmap: name, centre x, centre y, radius x, radius y. Each pixel belongs to the nearest rock, except
// the chest in the middle, which nobody circled and stays as the body.
export const GOLEM_ROCKS: [string, number, number, number, number][] = [
  ['head', 62, 15, 12, 9],
  ['shoulderB', 29, 15, 14.4, 12.4],
  ['upperB', 22, 30, 13, 9],
  ['foreB', 17, 49, 11, 11],
  ['fistB', 17, 69, 11, 10],
  ['thighB', 41, 57, 8, 9],
  ['shinB', 37, 72, 8, 12],
  ['thighF', 57, 61, 8, 7],
  ['footF', 58, 78, 11, 8],
  ['shoulderF', 74, 28, 8, 7.6],
  ['upperF', 74, 41, 7.6, 3.6],
  ['foreF', 76, 56, 9, 8],
  ['fistF', 77, 75, 9, 8],
]

export function golemRock(x: number, y: number) {
  let best = Infinity,
    name = 'body'
  for (const [n, cx, cy, rx, ry] of GOLEM_ROCKS) {
    const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
    if (d < best) [best, name] = [d, n]
  }
  return best > 1 && x >= 36 && x <= 67 && y >= 16 && y <= 52 ? 'body' : name
}

// The shark's parts on the 150 x 59 bitmap. The crest is cut into its spikes along the line of the back
// (backY); each spike bends from its base, so the base row never moves and nothing tears. The pectoral
// fin and the small belly fins bend only below the belly line, for the same reason.
export const SHARK_CREST: [string, number, number][] = [
  ['c1', 28, 38],
  ['c2', 39, 48],
  ['c3', 49, 57],
  ['c4', 58, 80],
  ['dorsal', 81, 97],
  ['c5', 98, 106],
  ['c6', 107, 113],
  ['c7', 114, 127],
]

export const SHARK_PEC_L = [102, 98, 96, 94, 92, 91, 91, 90, 91, 90, 90]

export const SHARK_PEC_R = [105, 106, 107, 108, 108, 107, 107, 107, 106, 105, 105]

export const sharkBackY = (x: number) => 29 - (x - 28) * 0.08

export function sharkPart(x: number, y: number) {
  if (x >= 28 && x <= 127 && y < sharkBackY(x))
    for (const [n, a, b] of SHARK_CREST) if (x >= a && x <= b) return n
  if (x < 36) return 'tail'
  if (x >= 128 && y >= 36) return 'jaw'
  if (y >= 36 && y <= 46 && x >= SHARK_PEC_L[y - 36] && x <= SHARK_PEC_R[y - 36]) return 'pec'
  if (y >= 46 && y <= 52 && x >= 76 && x < 85) return 'fin3'
  if (y >= 47 && x >= 78 && x < 115) return 'pec'
  if (y >= 39 && x >= 39 && x <= 46) return 'fin1'
  if (y >= 41 && x >= 55 && x <= 69 && (y >= 43 || x >= 61)) return 'fin2'
  return 'body'
}

// Offsets for each part from the SWIM pose: spikes bend back and forth in a wave from tail to head,
// the fins row by row (a shear), capped at cap px.
export function sharkOffsets(P: IPose) {
  const body = P.body,
    t = P.tail,
    w = P.wing,
    clamp = (v: number, cap: number) => Math.max(-cap, Math.min(cap, v)),
    o: Record<string, PartOffset> = {
      body,
      tail: (x) => [body[0], body[1] - t * 0.8 * (1 - x / 36)],
      jaw: (x) => [body[0], body[1] + P.jaw * (1.5 + (x - 128) * 0.35)],
    }
  SHARK_CREST.forEach(([n], i) => {
    const ph = i * 0.55,
      sway = t * Math.cos(ph) * 0.9 - body[1] * Math.sin(ph) * 1.6 - w * 0.6,
      tall = n === 'dorsal' ? 22 : 14
    o[n] = (x, y) => {
      const h = Math.min(1, (sharkBackY(x) - y) / tall)
      return [body[0] + Math.round(clamp(-sway * h * 1.4, 3)), body[1]]
    }
  })
  const fin =
    (top: number, len: number, amp: number, cap: number): PartOffset =>
    (_x, y) => {
      const d = Math.max(0, Math.min(1, (y - top) / len))
      return [body[0] + Math.round(clamp(amp * d, cap)), body[1]]
    }
  o.pec = fin(45, 13, -w * 3 + P.ff[0] * 1.2, 3)
  o.fin1 = fin(41, 7, P.bf[0] * 1.2 - w * 1.5, 2)
  o.fin2 = fin(43, 8, P.ff[0] * 1.2 - w * 1.5, 2)
  o.fin3 = fin(46, 5, P.bf[0] - w, 1)
  return o
}

export const SHARK_ORDER = [
  'tail',
  'c1',
  'c2',
  'c3',
  'c4',
  'dorsal',
  'c5',
  'c6',
  'c7',
  'body',
  'fin1',
  'fin2',
  'fin3',
  'pec',
  'jaw',
]

// เซราฟรัศมี: the owner's AI-made peacock (1024 px, fake checker background removed, reduced by 10.5x to
// 88 x 91). The crest and halo are drawn in code so they follow the head. Parts: head, the two raised
// wings (bend sideways from their base), the spread middle wing and the low wing (tips flap up and down,
// column by column), and two legs (shear from the hip); the fan tail stays with the body.
export const seraphTop = (x: number) =>
  x <= 25 ? 42 : x <= 29 ? 41 : x <= 35 ? 40 : x <= 46 ? 39 : 40

export const seraphBot = (x: number) => 44 + (x - 16) * 0.29

export function seraphPart(x: number, y: number) {
  if (x >= 67 && y <= 40) return 'head'
  if ((y >= 77 && y <= 82 && x >= 53 && x <= 59) || (y >= 83 && x >= 50 && x <= 61)) return 'legB'
  if ((y >= 77 && y <= 82 && x >= 60 && x <= 63) || (y >= 83 && x >= 62)) return 'legF'
  if (y < 34 && x >= 31 + (y - 8) * 0.3 && x <= 66 && !(x >= 42 && x <= 53 && y >= 8 && y <= 19))
    return 'wingUp'
  if (x >= 16 && x <= 57 && y >= seraphTop(x) && y <= seraphBot(x)) return 'wingMid'
  if (x >= 24 && x <= 52 && y > seraphBot(x) && y <= 85) return 'wingLow'
  return 'body'
}

export function seraphOffsets(P: IPose) {
  const clamp = (v: number, c: number) => Math.max(-c, Math.min(c, v)),
    body: Pt = [P.body[0] * 0.6, P.body[1] * 0.6],
    at = (dx: number, dy: number): Pt => [body[0] + Math.round(dx), body[1] + Math.round(dy)],
    w = P.wing
  return {
    body,
    head: at(clamp(P.head[0] * 0.7, 2), clamp(P.head[1] * 0.7, 2)),
    wingUp: (_x: number, y: number) => at((clamp(-w * 2.5, 3) * (34 - y)) / 34, 0),
    wingMid: (x: number) => at(0, (clamp(-w * 3, 3) * (58 - x)) / 42),
    wingLow: (x: number) => at(0, (clamp(w * 1.6, 2) * (52 - x)) / 28),
    legB: (_x: number, y: number) =>
      at((P.bl[0] * 0.7 * (y - 77)) / 13, y >= 86 ? clamp(P.bl[1], 2) : 0),
    legF: (_x: number, y: number) =>
      at((P.bf[0] * 0.7 * (y - 77)) / 13, y >= 86 ? clamp(P.bf[1], 2) : 0),
  }
}

export const SERAPH_ORDER = ['wingLow', 'body', 'legB', 'legF', 'wingMid', 'wingUp', 'head']

// จ้าวมืดมิด: the owner's AI-made Dracula (1024 px JPG with a painted checkerboard, removed by flood fill;
// the two bats were cut out and are drawn in code), reduced by 13.1x to 43 x 69 on the 72 grid. Parts:
// head, the reaching hand, the two hanging edges of the cape (they sway row by row, the hem most) and
// the legs (shear from the knee, the foot lifts).
export function vampPart(x: number, y: number) {
  if ((y <= 3 && x >= 22 && x <= 34) || (y <= 12 && x >= 24 && x <= 32)) return 'head'
  if (y >= 30 && y <= 39 && x >= 4 && x <= 12) return 'hand'
  if (y >= 60 && x <= 25) return 'legB'
  if (y >= 60 && x >= 27 && (x <= 33 || y >= 65)) return 'legF'
  if (y >= 38 && x <= 10) return 'capeL'
  if (y >= 30 && x >= 34) return 'capeR'
  return 'body'
}

export function vampOffsets(P: IPose) {
  const clamp = (v: number, c: number) => Math.max(-c, Math.min(c, v)),
    body: Pt = [P.body[0] * 0.5, P.body[1] * 0.5],
    at = (dx: number, dy: number): Pt => [body[0] + Math.round(dx), body[1] + Math.round(dy)],
    sway = clamp(P.tail * 1.2 - P.body[0] * 0.8, 3)
  return {
    body,
    head: at(clamp(P.head[0] * 0.6, 1.5), clamp(P.head[1] * 0.6, 1.5)),
    hand: at(clamp(P.arm[0] * 0.7, 3), clamp(P.arm[1] * 0.7, 3)),
    capeL: (_x: number, y: number) => at((-sway * (y - 38)) / 20, 0),
    capeR: (_x: number, y: number) => at((sway * 0.6 * (y - 30)) / 33, 0),
    legB: (_x: number, y: number) =>
      at((P.bl[0] * 0.6 * (y - 58)) / 10, y >= 66 ? clamp(P.bl[1], 2) : 0),
    legF: (_x: number, y: number) =>
      at((P.bf[0] * 0.6 * (y - 58)) / 10, y >= 66 ? clamp(P.bf[1], 2) : 0),
  }
}

export const VAMP_ORDER = ['legB', 'capeL', 'body', 'capeR', 'legF', 'hand', 'head']

// ราชันย์เงานิรนาม: the owner's AI-made headless knight (1024 px JPG on a dark grey painted checkerboard,
// removed by flood-filling the neutral greys; the armour is tinted violet so it survives), reduced by
// 10.8x to 85 x 91. The thin chain did not survive the shrink, so it is cut out and drawn in code
// between the fist and the spiked ball, which swings on its own. Parts: the flaming head, the fist, the
// ball, the outer cape edge (sways row by row) and the two legs.
export function namelessPart(x: number, y: number) {
  if (y <= 19 && x <= 47) return 'head'
  if (x >= 63 && y >= 74) return 'ball'
  if (x >= 53 && y >= 43 && y <= 53) return 'fist'
  if (y >= 79 && x <= 33) return 'legB'
  if (y >= 79 && x >= 38 && x <= 58) return 'legF'
  if (y >= 45 && x <= 15) return 'cape'
  return 'body'
}

export function namelessOffsets(P: IPose) {
  const clamp = (v: number, c: number) => Math.max(-c, Math.min(c, v)),
    body: Pt = [P.body[0] * 0.6, P.body[1] * 0.6],
    at = (dx: number, dy: number): Pt => [body[0] + Math.round(dx), body[1] + Math.round(dy)],
    fist = at(clamp(P.arm[0] * 0.6, 3), clamp(P.arm[1] * 0.6, 2)),
    swing = clamp(P.arm[0] * 1.4 + P.tail * 1.5, 5)
  return {
    body,
    head: at(clamp(P.head[0] * 0.6, 1.5), clamp(P.head[1] * 0.6, 1.5)),
    fist,
    ball: [fist[0] + Math.round(swing), fist[1] - Math.round(Math.abs(swing) * 0.35)],
    cape: (_x: number, y: number) => at((-clamp(P.tail * 1.2 - P.body[0], 2.5) * (y - 45)) / 46, 0),
    legB: (_x: number, y: number) =>
      at((P.bl[0] * 0.6 * (y - 77)) / 14, y >= 86 ? clamp(P.bl[1], 2) : 0),
    legF: (_x: number, y: number) =>
      at((P.bf[0] * 0.6 * (y - 77)) / 14, y >= 86 ? clamp(P.bf[1], 2) : 0),
  }
}

export const NAMELESS_ORDER = ['legB', 'cape', 'body', 'legF', 'head', 'fist', 'ball']
