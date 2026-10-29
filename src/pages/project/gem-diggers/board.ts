// Mine wall: a grid of gem cells. A cell holds a color index, DUG once mined,
// or ROCK (bedrock: never dug, blocks tunnels).
//
// Miners walk a path that circles the whole picture, so any gem on the outer
// edge can be reached. Inner gems need a dug tunnel leading to them.
//
// Some cells sit in locked rooms: hidden and undiggable until enough gems of
// the room's key color have been mined.

import { routeLength, routeToEdgeCell } from './rim'

export const DUG = -1
export const ROCK = -2

export interface Lock {
  key: number // color index that opens it
  need: number // gems of that color to mine first
  open: boolean
  cells: number[]
}

export interface Board {
  width: number
  height: number
  cells: Int16Array
  lockOf: Int16Array // lock index per cell, or -1
  locks: Lock[]
  mined: Int32Array // gems mined so far, per color
  edgeCost: Int32Array // walk from the entrance to each edge cell, in half cells (-1: not an edge cell)
  armor: Uint8Array // extra hits a gem needs before it breaks (rock-wrapped gems)
}

// Walking distances are kept in half cells so they stay whole numbers.
const STEP = 2

/** Walking cost from the entrance, around the path, into each edge cell. */
export function computeEdgeCost(width: number, height: number): Int32Array {
  const cost = new Int32Array(width * height).fill(-1)
  for (let i = 0; i < cost.length; i++) {
    const route = routeToEdgeCell(width, height, i)
    if (route.length) cost[i] = Math.round((routeLength(route) + 1) * 2)
  }
  return cost
}

export function cloneBoard(b: Board): Board {
  return {
    width: b.width,
    height: b.height,
    cells: b.cells.slice(),
    lockOf: b.lockOf,
    locks: b.locks.map((l) => ({ ...l })),
    mined: b.mined.slice(),
    edgeCost: b.edgeCost,
    armor: b.armor.slice(),
  }
}

/** Hits still needed to clear the board (armored gems count more than once). */
export function hitsLeft(b: Board): number {
  let n = 0
  for (let i = 0; i < b.cells.length; i++) if (b.cells[i] >= 0) n += 1 + b.armor[i]
  return n
}

export function gemsLeft(b: Board): number {
  let n = 0
  for (const c of b.cells) if (c >= 0) n++
  return n
}

export function isLocked(b: Board, i: number): boolean {
  const l = b.lockOf[i]
  return l >= 0 && !b.locks[l].open
}

/**
 * One hit on a gem. Armored gems only crack (the cell stays put); otherwise the
 * gem is mined. Returns the indexes of any locks that opened because of it.
 */
export function dig(b: Board, i: number): number[] {
  if (b.armor[i] > 0) {
    b.armor[i]--
    return []
  }
  const color = b.cells[i]
  b.cells[i] = DUG
  b.mined[color]++
  const opened: number[] = []
  b.locks.forEach((l, k) => {
    if (!l.open && l.key === color && b.mined[color] >= l.need) {
      l.open = true
      opened.push(k)
    }
  })
  return opened
}

function neighbors(b: Board, i: number): number[] {
  const x = i % b.width
  const y = (i - x) / b.width
  const out: number[] = []
  if (x > 0) out.push(i - 1)
  if (x < b.width - 1) out.push(i + 1)
  if (y > 0) out.push(i - b.width)
  if (y < b.height - 1) out.push(i + b.width)
  return out
}

export function isEdge(b: Board, i: number): boolean {
  const x = i % b.width
  const y = (i - x) / b.width
  return x === 0 || y === 0 || x === b.width - 1 || y === b.height - 1
}

/**
 * Shortest walk from the entrance to every dug cell (around the path, then
 * through tunnels), in half cells; -1 if walled off. Dial's algorithm: costs
 * are small whole numbers, so a bucket per cost beats a heap.
 */
export function tunnelMap(b: Board): { dist: Int32Array; parent: Int32Array } {
  const n = b.cells.length
  const dist = new Int32Array(n).fill(-1)
  const parent = new Int32Array(n).fill(-1)
  const buckets: number[][] = []
  const push = (i: number, d: number) => (buckets[d] ??= []).push(i)
  for (let i = 0; i < n; i++) {
    if (b.cells[i] === DUG && b.edgeCost[i] >= 0) push(i, b.edgeCost[i])
  }
  const best = new Int32Array(n).fill(0x7fffffff)
  for (let d = 0; d < buckets.length; d++) {
    for (const i of buckets[d] ?? []) {
      if (dist[i] >= 0) continue
      dist[i] = d
      for (const j of neighbors(b, i)) {
        if (b.cells[j] === DUG && dist[j] < 0 && d + STEP < best[j]) {
          best[j] = d + STEP
          parent[j] = i
          push(j, d + STEP)
        }
      }
    }
  }
  return { dist, parent }
}

/** Walking cost to gem i (half cells) and the dug cell it is entered from (-1: straight off the path). */
function reachCost(b: Board, i: number, dist: Int32Array): { cost: number; via: number } {
  if (isLocked(b, i)) return { cost: -1, via: -1 }
  let best = isEdge(b, i) ? b.edgeCost[i] : -1
  let via = -1
  for (const j of neighbors(b, i)) {
    if (b.cells[j] === DUG && dist[j] >= 0 && (best < 0 || dist[j] + STEP < best)) {
      best = dist[j] + STEP
      via = j
    }
  }
  return { cost: best, via }
}

export function isReachable(b: Board, i: number, dist: Int32Array): boolean {
  return b.cells[i] >= 0 && reachCost(b, i, dist).cost >= 0
}

export function colorReachable(b: Board, color: number, reserved?: Set<number>): boolean {
  const { dist } = tunnelMap(b)
  for (let i = 0; i < b.cells.length; i++) {
    if (b.cells[i] === color && !reserved?.has(i) && isReachable(b, i, dist)) return true
  }
  return false
}

/**
 * Reachable gem of `color` with the shortest walk from the entrance.
 * Returns the cells walked from the edge to the gem, or null.
 */
export function pickTarget(
  b: Board,
  color: number,
  reserved?: Set<number>,
  map = tunnelMap(b)
): { cell: number; path: number[] } | null {
  const { dist, parent } = map
  let bestCell = -1
  let bestCost = Infinity
  let bestVia = -1
  for (let i = b.cells.length - 1; i >= 0; i--) {
    if (b.cells[i] !== color || reserved?.has(i)) continue
    const { cost, via } = reachCost(b, i, dist)
    if (cost < 0) continue
    if (cost < bestCost) {
      bestCost = cost
      bestCell = i
      bestVia = via
    }
  }
  if (bestCell < 0) return null
  const path: number[] = [bestCell]
  for (let j = bestVia; j >= 0; j = parent[j]) path.unshift(j)
  return { cell: bestCell, path }
}
