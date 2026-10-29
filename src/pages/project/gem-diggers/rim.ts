// Geometry of the walking path that circles the picture.
// In grid units a cell spans [x, x+1]; the path runs half a cell outside the
// picture and the mine entrance sits in the middle of its bottom side.

export interface Pt {
  x: number
  y: number
}

export function entrance(width: number, height: number): Pt {
  return { x: width / 2, y: height + 0.5 }
}

export function routeLength(route: Pt[]): number {
  let len = 0
  for (let i = 1; i < route.length; i++)
    len += Math.hypot(route[i].x - route[i - 1].x, route[i].y - route[i - 1].y)
  return len
}

/** Shortest way along the path between two points on it (either direction), corners included. */
export function rimRoute(w: number, h: number, from: Pt, to: Pt): Pt[] {
  const x0 = -0.5
  const y0 = -0.5
  const x1 = w + 0.5
  const y1 = h + 0.5
  const H = y1 - y0
  const W = x1 - x0
  const P = 2 * (W + H)
  // Distance along the loop, clockwise from the bottom-left corner.
  const along = (p: Pt) => {
    if (p.x === x0) return y1 - p.y
    if (p.y === y0) return H + (p.x - x0)
    if (p.x === x1) return H + W + (p.y - y0)
    return 2 * H + W + (x1 - p.x)
  }
  const corners = [
    { s: 0, p: { x: x0, y: y1 } },
    { s: H, p: { x: x0, y: y0 } },
    { s: H + W, p: { x: x1, y: y0 } },
    { s: 2 * H + W, p: { x: x1, y: y1 } },
  ]
  const sa = along(from)
  const sb = along(to)
  const cw = (sb - sa + P) % P
  const out: Pt[] = [from]
  const forward = cw <= P - cw
  corners
    .map((c) => ({ ...c, d: forward ? (c.s - sa + P) % P : (sa - c.s + P) % P }))
    .filter((c) => c.d > 0 && c.d < (forward ? cw : P - cw))
    .sort((a, b) => a.d - b.d)
    .forEach((c) => out.push(c.p))
  out.push(to)
  return out
}

/** Points on the path right outside an edge cell (a corner cell has two). */
export function doorsOf(w: number, h: number, cell: number): Pt[] {
  const x = cell % w
  const y = Math.floor(cell / w)
  const doors: Pt[] = []
  if (y === h - 1) doors.push({ x: x + 0.5, y: h + 0.5 })
  if (x === 0) doors.push({ x: -0.5, y: y + 0.5 })
  if (x === w - 1) doors.push({ x: w + 0.5, y: y + 0.5 })
  if (y === 0) doors.push({ x: x + 0.5, y: -0.5 })
  return doors
}

/** Walk from the entrance along the path to the nearest door of an edge cell. */
export function routeToEdgeCell(w: number, h: number, cell: number): Pt[] {
  const start = entrance(w, h)
  let best: Pt[] = []
  for (const d of doorsOf(w, h, cell)) {
    const r = rimRoute(w, h, start, d)
    if (!best.length || routeLength(r) < routeLength(best)) best = r
  }
  return best
}
