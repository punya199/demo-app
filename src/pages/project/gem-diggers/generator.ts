// Builds the tray of minecarts for a level and checks the result can be won.
//
// Carts are cut by simulating a playthrough (dig a run of one reachable color,
// that run becomes one cart), so a perfect order always exists. The order is
// then shuffled a little, dealt into tray columns, some neighbouring carts are
// chained together and some are hidden. A solver confirms the result is still
// winnable, and among winnable candidates we keep the one whose difficulty is
// closest to the level's target.

import { Board, cloneBoard, dig, gemsLeft, isReachable, pickTarget, tunnelMap } from './board'

export interface CartSpec {
  color: number
  count: number
  hidden?: boolean // color unknown until it reaches the front
  links?: [number, number][] // [column, index] of the other carts chained to this one: all go together
  frozen?: number // can't be tapped until this many carts have finished
}

export interface TrayLayout {
  columns: CartSpec[][] // index 0 = front of the column (tappable)
}

/** Rules that change how a tray plays out (set by the difficulty mode). */
export interface PlayRules {
  slots: number
  together?: boolean // chained carts leave their slots only when every one of them is done
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const randInt = (rng: () => number, lo: number, hi: number) =>
  lo + Math.floor(rng() * (hi - lo + 1))

function reachableColors(b: Board): number[] {
  const { dist } = tunnelMap(b)
  const set = new Set<number>()
  for (let i = 0; i < b.cells.length; i++) if (isReachable(b, i, dist)) set.add(b.cells[i])
  return [...set]
}

function cutCarts(start: Board, rng: () => number, minSize: number, maxSize: number): CartSpec[] {
  const b = cloneBoard(start)
  const carts: CartSpec[] = []
  while (gemsLeft(b) > 0) {
    const colors = reachableColors(b)
    if (!colors.length) throw new Error('Level is stuck: remaining gems are locked away for good')
    const color = colors[Math.floor(rng() * colors.length)]
    const want = randInt(rng, minSize, maxSize)
    let got = 0
    while (got < want) {
      const t = pickTarget(b, color)
      if (!t) break
      dig(b, t.cell)
      got++
    }
    // Fold tiny leftovers into the previous cart of the same color when possible.
    const prev = carts[carts.length - 1]
    if (got < 3 && prev && prev.color === color) prev.count += got
    else carts.push({ color, count: got })
  }
  return carts
}

/**
 * Big carts that can't be filled in one go: up to `openLimit` carts collect at
 * once, each needing more gems of its color than are reachable when it starts,
 * so other colors must be dug to open the way. Carts come out in the order they
 * were started, which (with a spare slot) is always a winning order.
 */
function cutBigCarts(
  start: Board,
  rng: () => number,
  minSize: number,
  maxSize: number,
  openLimit: number
): CartSpec[] {
  const b = cloneBoard(start)
  const carts: CartSpec[] = []
  const open: { spec: CartSpec; want: number }[] = []
  const colorLeft = (c: number) => b.cells.reduce((n, v) => n + (v === c ? 1 : 0), 0)
  while (gemsLeft(b) > 0) {
    // Let every open cart collect what it can reach, as play would.
    let progress = true
    while (progress) {
      progress = false
      for (const o of open) {
        while (o.spec.count < o.want) {
          const t = pickTarget(b, o.spec.color)
          if (!t) break
          dig(b, t.cell)
          o.spec.count++
          progress = true
        }
      }
    }
    // Close carts that are full, or whose color has run out.
    for (let i = open.length - 1; i >= 0; i--) {
      if (open[i].spec.count >= open[i].want || colorLeft(open[i].spec.color) === 0)
        open.splice(i, 1)
    }
    if (gemsLeft(b) === 0) break
    const fresh = reachableColors(b).filter((c) => !open.some((o) => o.spec.color === c))
    if (open.length < openLimit && fresh.length) {
      const spec = { color: fresh[Math.floor(rng() * fresh.length)], count: 0 }
      carts.push(spec)
      open.push({ spec, want: randInt(rng, minSize, maxSize) })
    } else if (open.length) {
      // Every slot is busy waiting: settle for less on the cart that has the most.
      open.sort((x, y) => y.spec.count - x.spec.count)
      open.shift()
    } else {
      throw new Error('Level is stuck: remaining gems are locked away for good')
    }
  }
  return carts.filter((c) => c.count > 0)
}

function shuffleNearby<T>(list: T[], rng: () => number, window: number): T[] {
  const keyed = list.map((item, i) => ({ item, key: i + rng() * window }))
  keyed.sort((a, b) => a.key - b.key)
  return keyed.map((k) => k.item)
}

function deal(carts: CartSpec[], columnCount: number, rng: () => number): TrayLayout {
  const columns: CartSpec[][] = Array.from({ length: columnCount }, () => [])
  for (const cart of carts) {
    const shortest = Math.min(...columns.map((c) => c.length))
    const options = columns.filter((c) => c.length <= shortest + 1)
    options[Math.floor(rng() * options.length)].push({ ...cart })
  }
  return { columns }
}

/**
 * Chain carts that sit side by side (or one step apart) in neighbouring
 * columns: `pairs` groups of two and `triples` groups of three.
 */
function addLinks(tray: TrayLayout, pairs: number, triples: number, rng: () => number) {
  const cols = tray.columns
  const want = [...Array(triples).fill(3), ...Array(pairs).fill(2)] as number[]
  for (const size of want) {
    if (cols.length < size) continue
    for (let tries = 0; tries < 200; tries++) {
      const c = Math.floor(rng() * (cols.length - size + 1))
      const i = Math.floor(rng() * Math.min(cols[c].length, 5))
      const members: [number, number][] = [[c, i]]
      for (let k = 1; k < size; k++) {
        const prev = members[k - 1][1]
        members.push([
          c + k,
          Math.min(cols[c + k].length - 1, Math.max(0, prev + randInt(rng, -1, 1))),
        ])
      }
      const carts = members.map(([col, idx]) => cols[col][idx])
      if (carts.some((cart) => !cart || cart.links || cart.frozen)) continue
      carts.forEach((cart, k) => (cart.links = members.filter((_, j) => j !== k)))
      break
    }
  }
}

/** Freeze some carts near the front: each thaws once enough other carts have finished. */
function addFrozen(tray: TrayLayout, count: number, rng: () => number) {
  for (let made = 0, tries = 0; made < count && tries < 200; tries++) {
    const col = tray.columns[Math.floor(rng() * tray.columns.length)]
    const i = Math.floor(rng() * Math.min(col.length, 3))
    const cart = col[i]
    if (!cart || cart.links || cart.frozen) continue
    cart.frozen = randInt(rng, 2 + i, 5 + i * 2)
    made++
  }
}

function addMystery(tray: TrayLayout, share: number, rng: () => number) {
  for (const col of tray.columns) col.forEach((cart, i) => (cart.hidden = i > 0 && rng() < share))
}

/**
 * Tap options from the current fronts: a single cart, or a chained group whose
 * other members are all at the front too. `done` = carts finished so far
 * (thaws frozen ones).
 */
export function frontMoves(tray: TrayLayout, ptr: number[], done: number): number[][] {
  const moves: number[][] = []
  const thawed = (c: CartSpec) => (c.frozen ?? 0) <= done
  tray.columns.forEach((col, c) => {
    const cart = col[ptr[c]]
    if (!cart || !thawed(cart)) return
    if (!cart.links) {
      moves.push([c])
      return
    }
    // List each group once, from its leftmost column.
    if (cart.links.some(([lc]) => lc < c)) return
    if (cart.links.every(([lc, li]) => ptr[lc] === li && thawed(tray.columns[lc][li]))) {
      moves.push([c, ...cart.links.map(([lc]) => lc)])
    }
  })
  return moves
}

interface SimSlot {
  color: number
  left: number
  group?: number // carts tapped together share this
}

/** Let every cart in the slots dig until nothing more can be dug. Instant version of play. */
export function settle(b: Board, slots: SimSlot[], together = false): SimSlot[] {
  let progress = true
  while (progress) {
    progress = false
    for (const s of slots) {
      while (s.left > 0) {
        const t = pickTarget(b, s.color)
        if (!t) break
        dig(b, t.cell)
        s.left--
        progress = true
      }
    }
  }
  // A finished cart leaves, unless it is chained and a partner is still collecting.
  const waiting = (s: SimSlot) =>
    together && s.group !== undefined && slots.some((o) => o.group === s.group && o.left > 0)
  return slots.filter((s) => s.left > 0 || waiting(s))
}

const finished = (ptr: number[], slots: SimSlot[]) => ptr.reduce((a, b) => a + b, 0) - slots.length

let nextGroup = 1

function applyMove(
  b: Board,
  tray: TrayLayout,
  ptr: number[],
  slots: SimSlot[],
  move: number[],
  rules: PlayRules
) {
  const nb = cloneBoard(b)
  const nptr = ptr.slice()
  const group = move.length > 1 ? nextGroup++ : undefined
  const added = move.map((c) => {
    const cart = tray.columns[c][nptr[c]++]
    return { color: cart.color, left: cart.count, group }
  })
  const nslots = settle(nb, [...slots.map((s) => ({ ...s })), ...added], rules.together)
  return { b: nb, ptr: nptr, slots: nslots }
}

/** Depth-first search over tap orders. Returns true if some order clears the board. */
export function solvable(
  start: Board,
  tray: TrayLayout,
  rules: PlayRules,
  budget = 40000
): boolean {
  const seen = new Set<string>()
  let nodes = 0

  const search = (b: Board, ptr: number[], slots: SimSlot[]): boolean => {
    if (gemsLeft(b) === 0) return true
    if (++nodes > budget) return false
    const key =
      ptr.join(',') + '|' + b.cells.join(',') + '|' + b.armor.join('') + '|' + slots.length
    if (seen.has(key)) return false
    seen.add(key)

    const open = new Set(reachableColors(b))
    const moves = frontMoves(tray, ptr, finished(ptr, slots))
      .filter((m) => slots.length + m.length <= rules.slots)
      .map((m) => ({ m, useful: m.some((c) => open.has(tray.columns[c][ptr[c]].color)) }))
      .sort((a, z) => Number(z.useful) - Number(a.useful))

    for (const { m } of moves) {
      const next = applyMove(b, tray, ptr, slots, m, rules)
      if (search(next.b, next.ptr, next.slots)) return true
    }
    return false
  }

  return search(
    cloneBoard(start),
    tray.columns.map(() => 0),
    []
  )
}

/**
 * How often a player who always taps a cart that can dig right now (random
 * among those) wins. Close to 1 means no planning needed.
 */
export function greedyWinRate(
  board: Board,
  tray: TrayLayout,
  rules: PlayRules,
  runs: number,
  rng: () => number
): number {
  let wins = 0
  for (let r = 0; r < runs; r++) {
    let state = { b: cloneBoard(board), ptr: tray.columns.map(() => 0), slots: [] as SimSlot[] }
    while (gemsLeft(state.b) > 0) {
      let moves = frontMoves(tray, state.ptr, finished(state.ptr, state.slots)).filter(
        (m) => state.slots.length + m.length <= rules.slots
      )
      if (!moves.length) break
      const open = new Set(reachableColors(state.b))
      const useful = moves.filter((m) =>
        m.some((c) => open.has(tray.columns[c][state.ptr[c]].color))
      )
      if (useful.length) moves = useful
      state = applyMove(
        state.b,
        tray,
        state.ptr,
        state.slots,
        moves[Math.floor(rng() * moves.length)],
        rules
      )
    }
    if (gemsLeft(state.b) === 0) wins++
  }
  return wins / runs
}

export interface GenOptions extends PlayRules {
  seed: number
  columns: number
  minCart: number
  maxCart: number
  bigCarts?: boolean // carts bigger than what is reachable at once (see cutBigCarts)
  shuffle: number // how far carts may drift from the ideal order
  links: number // chained pairs
  triples?: number // chained groups of three
  mystery: number // share of non-front carts with hidden color (0..1)
  frozen: number // frozen carts
  greedyTarget: number // desired greedyWinRate: 1 = trivial, ~0.3 = needs real planning
  attempts?: number // candidates to try (more = closer to the target, slower)
  greedyRuns?: number // games sampled per candidate when estimating difficulty
  solverBudget?: number // positions the winnability check may explore per candidate
}

// Bump when a rule change could make previously generated trays invalid.
export const GEN_VERSION = 5

/** Fingerprint of everything that shapes a level's tray, for the pre-generated file. */
export function trayKey(level: object, seed: number): string {
  const text = JSON.stringify({ level, seed, v: GEN_VERSION })
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return (h >>> 0).toString(16)
}

function cut(board: Board, rng: () => number, opt: GenOptions): CartSpec[] {
  return opt.bigCarts
    ? cutBigCarts(board, rng, opt.minCart, opt.maxCart, opt.slots - 1)
    : cutCarts(board, rng, opt.minCart, opt.maxCart)
}

/**
 * Winnable candidate trays, closest to the difficulty target first. Stops early
 * once `keep` candidates are within a few percent of the target.
 */
export function generateCandidates(
  board: Board,
  opt: GenOptions,
  keep = 1
): { tray: TrayLayout; gap: number }[] {
  const found: { tray: TrayLayout; gap: number }[] = []
  for (let attempt = 0; attempt < (opt.attempts ?? 50); attempt++) {
    const rng = mulberry32(opt.seed * 7919 + attempt * 104729)
    const drift = opt.shuffle * (1 + 5 * rng())
    const carts = shuffleNearby(cut(board, rng, opt), rng, drift)
    const tray = deal(carts, opt.columns, rng)
    addLinks(tray, opt.links, opt.triples ?? 0, rng)
    addFrozen(tray, opt.frozen, rng)
    if (!solvable(board, tray, opt, opt.solverBudget)) continue
    addMystery(tray, opt.mystery, rng)
    const gap = Math.abs(
      greedyWinRate(board, tray, opt, opt.greedyRuns ?? 24, rng) - opt.greedyTarget
    )
    found.push({ tray, gap })
    if (found.filter((f) => f.gap <= 0.08).length >= keep) break
  }
  return found.sort((a, b) => a.gap - b.gap)
}

/** Fallback tray: the unshuffled, unchained order, winnable with a single free slot. */
export function plainTray(board: Board, opt: GenOptions): TrayLayout {
  const rng = mulberry32(opt.seed)
  return deal(cut(board, rng, opt), opt.columns, rng)
}

export function generateTray(board: Board, opt: GenOptions): TrayLayout {
  return generateCandidates(board, opt)[0]?.tray ?? plainTray(board, opt)
}
