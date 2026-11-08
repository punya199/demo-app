import type { IBitmap, Pt, Spr } from './spr'

// A bitmap that bmpRig animates: it remembers each pixel's part and its depth inside the outline.
export interface IRigBitmap extends IBitmap {
  parts?: string[][]
  depth?: number[][]
}

// How far a part moves: one offset for all its pixels, or one per pixel (a bend or a shear).
export type PartOffset = Pt | ((x: number, y: number) => Pt)

// Painted under a part before it moves: one colour (col) or the part's own pixels, at offset off,
// skipping pixels within `inner` of the outline.
export interface IUnderFill {
  col?: string
  off?: PartOffset
  inner?: number
}

// Animates a bitmap by cutting it into parts, like a paper puppet. part(x, y) names the part of each
// pixel (worked out once per bitmap); offs[name] is [dx, dy] or (x, y) => [dx, dy]; order lists the
// parts back to front. under[name] = { col, off } first paints that part's pixels in one colour at
// offset off, which is what shows where the part has moved away (e.g. the inside of an open mouth);
// without col the part's own pixels are painted there, so the gap shows the part itself, not a hole.
export function bmpRig(
  s: Spr,
  b: IRigBitmap,
  ox: number,
  oy: number,
  part: (x: number, y: number) => string,
  offs: Record<string, PartOffset>,
  order: string[],
  under: Record<string, IUnderFill> = {}
) {
  const parts = (b.parts ??= b.rows.map((row, y) => Array.from(row, (_, x) => part(x, y))))
  const put = (x: number, y: number, c: string) =>
    s.pix.push([Math.round(ox + x), Math.round(oy + y), c])
  const each = (name: string, fn: (x: number, y: number, k: number) => void) =>
    b.rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++)
        if (row[x] !== '.' && parts[y][x] === name) fn(x, y, row.charCodeAt(x) - 97)
    })
  const at = (o: PartOffset | undefined, x: number, y: number): Pt =>
    typeof o === 'function' ? o(x, y) : o || [0, 0]
  // depth = how many pixels in from the outline (worked out once); an under fill can skip the rim (u.inner)
  if (!b.depth) {
    const W = b.rows[0].length,
      H = b.rows.length,
      solid = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && b.rows[y][x] !== '.'
    let depth: number[][] = b.rows.map((row) => Array.from(row, (c) => (c === '.' ? 0 : 1)))
    for (let d = 1; d < 4; d++)
      depth = depth.map((row, y) =>
        row.map((v, x) =>
          v === d &&
          [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ].every(([dx, dy]) => solid(x + dx, y + dy) && depth[y + dy][x + dx] >= d)
            ? d + 1
            : v
        )
      )
    b.depth = depth
  }
  const depth = b.depth
  for (const [name, u] of Object.entries(under))
    each(name, (x, y, k) => {
      if (depth[y][x] <= (u.inner || 0)) return
      const [dx, dy] = at(u.off, x, y)
      put(x + dx, y + dy, u.col || b.pal[k]) // no col: the part's own pixels stay behind at rest
    })
  for (const name of order)
    each(name, (x, y, k) => {
      const [dx, dy] = at(offs[name], x, y)
      put(x + dx, y + dy, b.pal[k])
    })
}
