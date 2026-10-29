// Canvas drawing for the mine: picture wall, the path around it, tunnels,
// locked rooms, miners, slots and the tray of minecarts.

import { DUG, ROCK, isEdge, isLocked } from './board'
import { Cart, Game, GameEvent, Miner, SLOT_LEG } from './game'
import { Pt, entrance } from './rim'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
  size: number
}

interface Layout {
  cell: number
  gridX: number
  gridY: number
  slotY: number
  slotW: number
  slotH: number
  slotXs: number[]
  trayY: number
  trayBottom: number // taps below this are not on the tray
  colXs: number[]
  cartW: number
  cartH: number
  yard: { x: number; y: number; w: number; h: number } // ground the slots stand on
  junction: Pt // where miners turn from the yard toward the mine entrance
}

const TUNNEL = '#3a2a1e'
const ROCK_DARK = '#4a382b'
const PATH = '#7a5a43'
const HIDDEN_CART = '#8a817a'
// One color per linked pair so the two halves can be matched across the tray.
const PAIR_COLORS = ['#ffd54f', '#4dd0e1', '#f06292', '#aed581', '#ba68c8', '#ff8a65']
const FONT = '"Leelawadee UI", Tahoma, sans-serif'

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) =>
    Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt))))
  return `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`
}

function isLight(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16)
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 170
}

const lerp = (a: Pt, b: Pt, t: number): Pt => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
})

/** Point at distance d along a polyline. */
function along(route: Pt[], d: number): Pt {
  for (let i = 1; i < route.length; i++) {
    const seg = Math.hypot(route[i].x - route[i - 1].x, route[i].y - route[i - 1].y)
    if (d <= seg) return lerp(route[i - 1], route[i], seg ? d / seg : 1)
    d -= seg
  }
  return route[route.length - 1]
}

export class Renderer {
  private ctx: CanvasRenderingContext2D
  private w = 0
  private h = 0
  private L!: Layout
  private cartPos = new Map<number, Pt & { s: number }>()
  private leaving: { cart: Cart; pos: Pt; t: number }[] = []
  private particles: Particle[] = []
  private shake = new Map<number, number>() // tray column -> seconds left
  private time = 0
  hint: number[] = [] // tray columns the hint says to tap

  constructor(
    private canvas: HTMLCanvasElement,
    private game: Game
  ) {
    this.ctx = canvas.getContext('2d')!
  }

  setGame(game: Game) {
    this.game = game
    this.cartPos.clear()
    this.leaving = []
    this.particles = []
    this.hint = []
    this.layout()
  }

  resize(width: number, height: number) {
    const dpr = window.devicePixelRatio || 1
    this.w = width
    this.h = height
    this.canvas.width = Math.round(width * dpr)
    this.canvas.height = Math.round(height * dpr)
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.layout()
  }

  layout() {
    // Wide screens (a desktop window) put the picture on the left at full
    // height and the tray on the right, so big pictures get big cells.
    if (this.w >= 760 && this.w > this.h * 1.15) this.layoutWide()
    else this.layoutTall()
  }

  private layoutWide() {
    const { board, slots, tray } = this.game
    const pad = 12
    const side = Math.max(340, Math.min(460, this.w * 0.36))
    const slotH = Math.min(68, Math.max(48, this.h * 0.085))
    const cartH = Math.min(66, Math.max(44, this.h * 0.08))
    const yardH = slotH + 20
    const yardY = this.h - pad - yardH
    const areaW = this.w - side - pad * 3
    const areaH = yardY - pad - 6
    const cell = Math.max(
      6,
      Math.floor(Math.min(areaW / (board.width + 2.6), areaH / (board.height + 2.6)))
    )
    const gridX = Math.round(pad + (areaW - cell * board.width) / 2)
    const gridY = Math.round(pad + (areaH - cell * (board.height + 2.6)) / 2 + cell * 1.3)
    const panelX = this.w - side - pad
    const slotW = Math.min(84, (side - (slots.length - 1) * 8) / slots.length)
    const slotsTotal = slotW * slots.length + 8 * (slots.length - 1)
    const slotXs = slots.map(
      (_, i) => panelX + (side - slotsTotal) / 2 + i * (slotW + 8) + slotW / 2
    )
    const cols = tray.length
    const colGap = Math.min(110, side / cols)
    const colXs = tray.map((_, i) => panelX + side / 2 + (i - (cols - 1) / 2) * colGap)
    const cartW = Math.min(cartH * 1.35, colGap - 22)
    const trayY = pad + 24
    const door = { x: gridX + (board.width / 2) * cell, y: gridY + (board.height + 0.5) * cell }
    this.L = {
      cell,
      gridX,
      gridY,
      slotY: yardY + 10,
      slotW,
      slotH,
      slotXs,
      trayY,
      trayBottom: yardY - 4,
      colXs,
      cartW,
      cartH,
      yard: { x: 0, y: yardY, w: this.w, h: yardH },
      junction: { x: door.x, y: yardY + 10 + slotH * 0.3 },
    }
  }

  private layoutTall() {
    const { board, slots, tray } = this.game
    const pad = 12
    const slotH = Math.min(64, Math.max(46, this.h * 0.085))
    const cartH = Math.min(62, Math.max(42, this.h * 0.075))
    const trayH = cartH * 2.9 + 20
    const below = 14 + slotH + 18 + trayH
    // The picture plus one cell of path on each side plus the rock frame.
    const availW = this.w - pad * 2
    const availH = this.h - pad * 2 - below
    const cell = Math.max(
      8,
      Math.floor(Math.min(availW / (board.width + 2.6), availH / (board.height + 2.6)))
    )
    const gridX = Math.round((this.w - cell * board.width) / 2)
    const gridY = Math.round(pad + cell * 1.3)
    const slotY = gridY + (board.height + 1.3) * cell + 14
    const rowW = Math.min(this.w - pad * 2, 520)
    const slotW = Math.min(84, (rowW - (slots.length - 1) * 8) / slots.length)
    const slotsTotal = slotW * slots.length + 8 * (slots.length - 1)
    const slotXs = slots.map((_, i) => (this.w - slotsTotal) / 2 + i * (slotW + 8) + slotW / 2)
    const cols = tray.length
    const colGap = Math.min(110, rowW / cols)
    const colXs = tray.map((_, i) => this.w / 2 + (i - (cols - 1) / 2) * colGap)
    const cartW = Math.min(cartH * 1.35, colGap - 22)
    const door = { x: gridX + (board.width / 2) * cell, y: gridY + (board.height + 0.5) * cell }
    this.L = {
      cell,
      gridX,
      gridY,
      slotY,
      slotW,
      slotH,
      slotXs,
      trayY: slotY + slotH + 18,
      trayBottom: Infinity,
      colXs,
      cartW,
      cartH,
      yard: { x: 0, y: slotY - 10, w: this.w, h: slotH + 20 },
      junction: { x: door.x, y: slotY + slotH * 0.3 },
    }
  }

  /** Which tray column (if any) is under a canvas point. */
  hitTray(x: number, y: number): number {
    const L = this.L
    if (y < L.trayY - 6 || y > L.trayBottom) return -1
    let best = -1
    let bestD = Infinity
    L.colXs.forEach((cx, i) => {
      const d = Math.abs(x - cx)
      if (d < L.cartW * 0.75 && d < bestD) {
        bestD = d
        best = i
      }
    })
    return best
  }

  handle(ev: GameEvent) {
    if (ev.type === 'dig') {
      this.burst(ev.cell, this.game.colors[ev.color], 9)
    } else if (ev.type === 'crack') {
      this.burst(ev.cell, '#8a8580', 6)
    } else if (ev.type === 'unlock') {
      for (const i of ev.lock.cells) this.burst(i, '#cfd3da', 4)
    } else if (ev.type === 'denied') {
      this.shake.set(ev.column, 0.35)
    } else if (ev.type === 'cartDone') {
      const p = this.cartPos.get(ev.cart.id)
      if (p) this.leaving.push({ cart: ev.cart, pos: { x: p.x, y: p.y }, t: 0 })
      this.cartPos.delete(ev.cart.id)
    }
  }

  private burst(cell: number, color: string, count: number) {
    const c = this.cellCenter(cell)
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = 40 + Math.random() * 90
      this.particles.push({
        x: c.x,
        y: c.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: 0.5 + Math.random() * 0.3,
        color: Math.random() < 0.3 ? '#ffffff' : color,
        size: 2 + Math.random() * this.L.cell * 0.18,
      })
    }
  }

  /** Grid units (a cell spans [x, x+1]) to canvas pixels. */
  private px(p: Pt): Pt {
    return { x: this.L.gridX + p.x * this.L.cell, y: this.L.gridY + p.y * this.L.cell }
  }

  private cellCenter(i: number): Pt {
    const w = this.game.board.width
    return this.px({ x: (i % w) + 0.5, y: Math.floor(i / w) + 0.5 })
  }

  private minerPos(m: Miner): Pt {
    const L = this.L
    const slot = { x: L.slotXs[m.slot] ?? this.w / 2, y: L.slotY + L.slotH * 0.3 }
    const door = this.px(entrance(this.game.board.width, this.game.board.height))
    if (m.pos < SLOT_LEG) {
      // Along the yard to below the entrance, then up into the mine.
      const legs = [slot, L.junction, door]
      const total =
        Math.hypot(L.junction.x - slot.x, L.junction.y - slot.y) +
        Math.hypot(door.x - L.junction.x, door.y - L.junction.y)
      return along(legs, (m.pos / SLOT_LEG) * total)
    }
    return this.px(along(m.route, m.pos - SLOT_LEG))
  }

  draw(dt: number) {
    this.time += dt
    const ctx = this.ctx
    const L = this.L
    const { board } = this.game
    const c = L.cell

    const bg = ctx.createLinearGradient(0, 0, 0, this.h)
    bg.addColorStop(0, '#2c1f16')
    bg.addColorStop(1, '#1a120c')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, this.w, this.h)

    // Yard between the mine and the slots, joined to the entrance.
    const door = this.px(entrance(board.width, board.height))
    ctx.fillStyle = '#4a3427'
    ctx.fillRect(L.yard.x, L.yard.y, L.yard.w, L.yard.h)
    ctx.fillStyle = PATH
    ctx.fillRect(door.x - c * 0.6, door.y, c * 1.2, L.junction.y - door.y)

    // Rock frame, then the walking path that circles the picture.
    const outer = this.px({ x: -1.3, y: -1.3 })
    ctx.fillStyle = ROCK_DARK
    ctx.beginPath()
    ctx.roundRect(outer.x, outer.y, (board.width + 2.6) * c, (board.height + 2.6) * c, c * 0.5)
    ctx.fill()
    const ring = this.px({ x: -1, y: -1 })
    ctx.fillStyle = PATH
    ctx.beginPath()
    ctx.roundRect(ring.x, ring.y, (board.width + 2) * c, (board.height + 2) * c, c * 0.35)
    ctx.fill()
    ctx.fillStyle = PATH
    ctx.fillRect(door.x - c * 0.6, door.y, c * 1.2, c * 0.9)
    const mid = this.px({ x: -0.5, y: -0.5 })
    ctx.strokeStyle = 'rgba(255,230,190,0.18)'
    ctx.setLineDash([c * 0.25, c * 0.25])
    ctx.lineWidth = 2
    ctx.strokeRect(mid.x, mid.y, (board.width + 1) * c, (board.height + 1) * c)
    ctx.setLineDash([])

    this.drawCells()
    this.drawLockBadges()

    // Slots.
    this.game.slots.forEach((cart, i) => {
      const x = L.slotXs[i] - L.slotW / 2
      ctx.strokeStyle = 'rgba(255,230,190,0.35)'
      ctx.setLineDash([5, 4])
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(x, L.slotY, L.slotW, L.slotH, 10)
      ctx.stroke()
      ctx.setLineDash([])
      if (!cart) return
      const blocked = cart.minersOut === 0 && cart.remaining > 0
      const center = { x: L.slotXs[i], y: L.slotY + L.slotH / 2 }
      // When chained carts leave together, keep showing which ones belong together.
      this.drawCart(cart, center, 1, L.slotW - 8, L.slotH - 10, {
        dim: blocked,
        badge: !!this.game.level.together,
      })
      if (this.game.waitingForPartner(cart)) this.drawWaiting(center.x, L.slotY + L.slotH * 0.55)
    })

    this.drawTray(dt)

    // Carts that just finished roll off to the right.
    this.leaving = this.leaving.filter((l) => {
      l.t += dt
      const p = { x: l.pos.x + l.t * l.t * 900, y: l.pos.y - l.t * 30 }
      ctx.globalAlpha = Math.max(0, 1 - l.t * 1.6)
      this.drawCart(l.cart, p, 1, L.slotW - 8, L.slotH - 10, { done: true })
      ctx.globalAlpha = 1
      return l.t < 0.65
    })

    for (const m of this.game.miners) this.drawMiner(m)

    this.particles = this.particles.filter((p) => {
      p.life -= dt
      p.vy += 380 * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 2))
      ctx.fillStyle = p.color
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
      ctx.globalAlpha = 1
      return p.life > 0
    })
  }

  private drawCells() {
    const ctx = this.ctx
    const L = this.L
    const { board, colors, original } = this.game
    const c = L.cell
    const bevel = Math.max(1, c * 0.13)
    for (let i = 0; i < board.cells.length; i++) {
      const x = L.gridX + (i % board.width) * c
      const y = L.gridY + Math.floor(i / board.width) * c
      const v = board.cells[i]
      if (v === DUG) {
        ctx.fillStyle = TUNNEL
        ctx.fillRect(x, y, c, c)
        // Faint imprint of the picture that used to be here.
        ctx.globalAlpha = 0.13
        ctx.fillStyle = colors[original[i]]
        ctx.fillRect(x, y, c, c)
        ctx.globalAlpha = 1
        continue
      }
      if (v === ROCK) {
        ctx.fillStyle = '#5d5d63'
        ctx.fillRect(x, y, c, c)
        ctx.fillStyle = '#7b7b83'
        ctx.fillRect(x + c * 0.12, y + c * 0.12, c * 0.5, c * 0.35)
        ctx.fillStyle = '#45454b'
        ctx.fillRect(x + c * 0.45, y + c * 0.6, c * 0.45, c * 0.28)
        continue
      }
      if (this.game.level.dark && !this.lit(i)) {
        // Dark mine: color unknown until the cell is at the edge or next to a tunnel.
        ctx.fillStyle = (i * 7919) % 5 === 0 ? '#1d1922' : '#17141b'
        ctx.fillRect(x, y, c, c)
        continue
      }
      if (isLocked(board, i)) {
        ctx.fillStyle = '#3d4250'
        ctx.fillRect(x, y, c, c)
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, y + c)
        ctx.lineTo(x + c, y)
        ctx.stroke()
        ctx.strokeStyle = '#2b2f3a'
        ctx.strokeRect(x + 0.5, y + 0.5, c - 1, c - 1)
        continue
      }
      const base = colors[v]
      ctx.fillStyle = base
      ctx.fillRect(x, y, c, c)
      ctx.fillStyle = shade(base, 0.35)
      ctx.fillRect(x, y, c, bevel)
      ctx.fillRect(x, y, bevel, c)
      ctx.fillStyle = shade(base, -0.3)
      ctx.fillRect(x, y + c - bevel, c, bevel)
      ctx.fillRect(x + c - bevel, y, bevel, c)
      if (board.armor[i] > 0) this.drawArmor(x, y, c)
      else if (this.game.originalArmor[i] > 0) this.drawCracks(x, y, c)
      if (this.game.reserved.has(i)) {
        ctx.strokeStyle = `rgba(255,255,255,${0.45 + 0.35 * Math.sin(this.time * 10)})`
        ctx.lineWidth = 2
        ctx.strokeRect(x + 2, y + 2, c - 4, c - 4)
      }
    }
  }

  /** In a dark mine a cell shows its color once it is on the edge or touches a tunnel. */
  private lit(i: number): boolean {
    const { board } = this.game
    if (board.cells[i] === DUG || isEdge(board, i)) return true
    const w = board.width
    const x = i % w
    return (
      (x > 0 && board.cells[i - 1] === DUG) ||
      (x < w - 1 && board.cells[i + 1] === DUG) ||
      board.cells[i - w] === DUG ||
      board.cells[i + w] === DUG
    )
  }

  /** Rock shell around an armored gem: thick stone frame with rivets. */
  private drawArmor(x: number, y: number, c: number) {
    const ctx = this.ctx
    const t = Math.max(2, c * 0.2)
    ctx.fillStyle = '#8a8580'
    ctx.fillRect(x, y, c, t)
    ctx.fillRect(x, y + c - t, c, t)
    ctx.fillRect(x, y, t, c)
    ctx.fillRect(x + c - t, y, t, c)
    ctx.strokeStyle = '#4e4a46'
    ctx.lineWidth = 1
    ctx.strokeRect(x + 0.5, y + 0.5, c - 1, c - 1)
    ctx.strokeRect(x + t - 0.5, y + t - 0.5, c - t * 2 + 1, c - t * 2 + 1)
    ctx.fillStyle = '#c9c4bd'
    const r = Math.max(1, c * 0.06)
    for (const [dx, dy] of [
      [t / 2, t / 2],
      [c - t / 2, t / 2],
      [t / 2, c - t / 2],
      [c - t / 2, c - t / 2],
    ]) {
      ctx.beginPath()
      ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  /** A broken shell: the gem shows, with cracks left over. */
  private drawCracks(x: number, y: number, c: number) {
    const ctx = this.ctx
    ctx.strokeStyle = 'rgba(40,30,20,0.6)'
    ctx.lineWidth = Math.max(1, c * 0.07)
    ctx.beginPath()
    ctx.moveTo(x + c * 0.15, y + c * 0.2)
    ctx.lineTo(x + c * 0.45, y + c * 0.45)
    ctx.lineTo(x + c * 0.35, y + c * 0.8)
    ctx.moveTo(x + c * 0.45, y + c * 0.45)
    ctx.lineTo(x + c * 0.85, y + c * 0.35)
    ctx.stroke()
  }

  /** Padlock badge on each closed room: key color + how many more to mine. */
  private drawLockBadges() {
    const ctx = this.ctx
    const { board, colors } = this.game
    const c = this.L.cell
    for (const lock of board.locks) {
      if (lock.open) continue
      let sx = 0
      let sy = 0
      for (const i of lock.cells) {
        const p = this.cellCenter(i)
        sx += p.x
        sy += p.y
      }
      const cx = sx / lock.cells.length
      const cy = sy / lock.cells.length
      const r = Math.max(14, c * 0.75)
      const left = Math.max(0, lock.need - board.mined[lock.key])
      // Padlock shackle and body.
      ctx.strokeStyle = '#d7dbe2'
      ctx.lineWidth = Math.max(3, r * 0.18)
      ctx.beginPath()
      ctx.arc(cx, cy - r * 0.35, r * 0.45, Math.PI, 0)
      ctx.stroke()
      ctx.fillStyle = colors[lock.key]
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.roundRect(cx - r * 0.8, cy - r * 0.35, r * 1.6, r * 1.15, r * 0.25)
      ctx.fill()
      ctx.stroke()
      ctx.font = `800 ${Math.round(r * 0.75)}px ${FONT}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.lineWidth = 3
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'
      ctx.strokeText(String(left), cx, cy + r * 0.24)
      ctx.fillStyle = '#ffffff'
      ctx.fillText(String(left), cx, cy + r * 0.24)
    }
  }

  private trayTarget(col: number, depth: number): { p: Pt; scale: number } {
    const L = this.L
    const shakeLeft = this.shake.get(col) ?? 0
    const dx = shakeLeft > 0 ? Math.sin(shakeLeft * 60) * 6 : 0
    const scale = depth === 0 ? 1 : 0.82 - (depth - 1) * 0.1
    const y =
      L.trayY + L.cartH / 2 + (depth === 0 ? 0 : L.cartH * 0.95 + (depth - 1) * L.cartH * 0.75)
    return { p: { x: L.colXs[col] + dx, y }, scale }
  }

  private drawTray(dt: number) {
    const ctx = this.ctx
    const L = this.L
    for (const [col, t] of this.shake) this.shake.set(col, t - dt)

    // Chains between chained carts that are visible, each to its nearest partner
    // on the right, drawn behind the carts (center to center, last frame's positions).
    this.game.tray.forEach((col, ci) => {
      col.slice(0, 3).forEach((cart) => {
        const right = cart.links
          .map((l) => ({
            l,
            c: this.game.tray.findIndex((other) => other.slice(0, 3).includes(l)),
          }))
          .filter((x) => x.c > ci)
          .sort((x, y) => x.c - y.c)[0]
        const a = this.cartPos.get(cart.id)
        const b = right && this.cartPos.get(right.l.id)
        if (a && b) this.drawChain(a, b)
      })
    })

    for (const ci of this.hint) this.drawHintMarker(ci)

    // The "ready" glow is a hint; harder modes leave the player to work it out.
    const showReady = !this.game.level.hideReady
    this.game.tray.forEach((col, ci) => {
      const ready = showReady && this.game.frontReady(ci)
      for (let d = Math.min(col.length, 3) - 1; d >= 0; d--) {
        const { p, scale } = this.trayTarget(ci, d)
        this.drawCart(col[d], p, scale, L.cartW, L.cartH, {
          dim: d > 0,
          ring: d === 0 && ready,
          badge: true,
        })
      }
      if (col.length > 3) {
        // "+N" for carts further back, plus the badges of any linked carts hidden among them.
        const deepPairs = col.slice(3).filter((c) => c.pair)
        const r = 10
        const rowW = 26 + deepPairs.length * (r * 2 + 3)
        const y = L.trayY + L.cartH * 2.75 + 4
        let x = L.colXs[ci] - rowW / 2
        ctx.fillStyle = 'rgba(255,240,220,0.6)'
        ctx.font = `600 13px ${FONT}`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(`+${col.length - 3}`, x, y)
        x += 26 + r
        for (const c of deepPairs) {
          this.drawPairBadge(x, y, r, c.pair)
          x += r * 2 + 3
        }
      }
    })
  }

  /** Yellow glow behind the hinted front cart and a bouncing arrow above it. */
  private drawHintMarker(col: number) {
    const ctx = this.ctx
    const L = this.L
    const x = L.colXs[col]
    if (x === undefined) return
    const y = L.trayY
    const pulse = 0.5 + 0.5 * Math.sin(this.time * 6)
    ctx.save()
    ctx.shadowColor = '#ffd23f'
    ctx.shadowBlur = 18 + pulse * 10
    ctx.fillStyle = `rgba(255,210,63,${0.25 + pulse * 0.2})`
    ctx.beginPath()
    ctx.roundRect(x - L.cartW / 2 - 8, y - 8, L.cartW + 16, L.cartH + 16, 14)
    ctx.fill()
    ctx.restore()
    const ay = y - 14 - pulse * 6
    ctx.fillStyle = '#ffd23f'
    ctx.strokeStyle = '#3a2400'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x - 9, ay - 10)
    ctx.lineTo(x + 9, ay - 10)
    ctx.lineTo(x, ay)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  /** Hourglass on a full cart that is waiting for its chained partners to finish. */
  private drawWaiting(x: number, y: number) {
    const ctx = this.ctx
    const s = 9 + Math.sin(this.time * 4) * 1.2
    ctx.fillStyle = '#ffd23f'
    ctx.strokeStyle = '#3a2400'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x - s, y - s)
    ctx.lineTo(x + s, y - s)
    ctx.lineTo(x - s, y + s)
    ctx.lineTo(x + s, y + s)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  /** Round chain-link badge with the pair number, in the pair's color. */
  private drawPairBadge(x: number, y: number, r: number, pair: number) {
    const ctx = this.ctx
    ctx.fillStyle = PAIR_COLORS[(pair - 1) % PAIR_COLORS.length]
    ctx.strokeStyle = '#1b1b1b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#1b1b1b'
    ctx.font = `800 ${Math.round(r * 1.2)}px ${FONT}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(pair), x, y + 1)
  }

  private drawChain(a: Pt, b: Pt) {
    const ctx = this.ctx
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    const n = Math.max(2, Math.round(len / 9))
    const angle = Math.atan2(b.y - a.y, b.x - a.x)
    for (let i = 0; i <= n; i++) {
      const p = lerp(a, b, i / n)
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(angle + (i % 2 ? Math.PI / 2 : 0))
      ctx.strokeStyle = '#2b2b2b'
      ctx.lineWidth = 4.5
      ctx.beginPath()
      ctx.ellipse(0, 0, 5.5, 3.2, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = '#d9dee6'
      ctx.lineWidth = 2.2
      ctx.stroke()
      ctx.restore()
    }
  }

  /** Draws a cart, easing it from wherever it was drawn last time. */
  private drawCart(
    cart: Cart,
    target: Pt,
    scale: number,
    w: number,
    h: number,
    opt: { dim?: boolean; ring?: boolean; done?: boolean; badge?: boolean } = {}
  ) {
    let p = target
    let s = scale
    if (!opt.done) {
      const prev = this.cartPos.get(cart.id)
      const k = 0.22
      p = prev
        ? { x: prev.x + (target.x - prev.x) * k, y: prev.y + (target.y - prev.y) * k }
        : target
      s = prev ? prev.s + (scale - prev.s) * k : scale
      this.cartPos.set(cart.id, { ...p, s })
    }
    const ctx = this.ctx
    const color = cart.hidden ? HIDDEN_CART : this.game.colors[cart.color]
    const cw = w * s
    const ch = h * s
    const x = p.x - cw / 2
    const y = p.y - ch / 2

    if (opt.ring) {
      const pulse = 0.55 + 0.45 * Math.sin(this.time * 5)
      ctx.strokeStyle = `rgba(255,255,255,${pulse})`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.roundRect(x - 5, y - 5, cw + 10, ch + 10, 12)
      ctx.stroke()
    }

    ctx.save()
    if (opt.dim) ctx.globalAlpha *= 0.55
    // Gem pile poking out of the top: more gems as the cart fills up.
    const delivered = cart.total - cart.remaining
    const pile = Math.min(5, Math.ceil((delivered / cart.total) * 5))
    for (let i = 0; i < pile; i++) {
      const gx = x + cw * (0.2 + i * 0.15)
      const gs = ch * 0.2
      ctx.fillStyle = shade(color, 0.25)
      ctx.fillRect(gx - gs / 2, y + ch * 0.12 - gs / 2 - (i % 2) * gs * 0.4, gs, gs)
    }
    // Cart body: a trapezoid, wider at the top.
    const top = y + ch * 0.15
    const bottom = y + ch * 0.8
    ctx.beginPath()
    ctx.moveTo(x, top)
    ctx.lineTo(x + cw, top)
    ctx.lineTo(x + cw * 0.88, bottom)
    ctx.lineTo(x + cw * 0.12, bottom)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
    ctx.lineWidth = 2.5
    ctx.strokeStyle = shade(color, -0.45)
    ctx.stroke()
    ctx.fillStyle = shade(color, -0.25)
    ctx.fillRect(x + 2, top, cw - 4, ch * 0.09)
    // Wheels.
    ctx.fillStyle = '#2b2b2b'
    for (const wx of [0.28, 0.72]) {
      ctx.beginPath()
      ctx.arc(x + cw * wx, bottom + ch * 0.06, ch * 0.11, 0, Math.PI * 2)
      ctx.fill()
    }
    // Count, or a question mark while the color is hidden.
    const fs = Math.round(ch * 0.36)
    ctx.font = `800 ${fs}px ${FONT}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineWidth = 3
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'
    // Miners still waiting in the cart: counts down as each one sets off.
    const toSend = cart.remaining - cart.pending
    const label = cart.hidden ? '?' : toSend > 0 ? String(toSend) : ''
    const ty = (top + bottom) / 2 + ch * 0.03
    ctx.strokeText(label, p.x, ty)
    ctx.fillStyle = isLight(color) && !cart.hidden ? '#2b1d12' : '#ffffff'
    ctx.fillText(label, p.x, ty)
    if (opt.dim && cart.minersOut === 0 && cart.remaining < cart.total) {
      ctx.fillStyle = '#fff'
      ctx.font = `700 ${Math.round(ch * 0.22)}px sans-serif`
      ctx.fillText('z', x + cw - 6, y + 6)
    }
    ctx.restore()
    // Linked carts carry their pair badge at full opacity, even when dimmed further back.
    if (opt.badge && cart.pair)
      this.drawPairBadge(x + 2, y + ch * 0.2, Math.max(9, ch * 0.22), cart.pair)
    const ice = opt.done ? 0 : this.game.iceLeft(cart)
    if (ice > 0) this.drawIce(x, y, cw, ch, ice)
  }

  /** Ice block over a frozen cart, with how many carts must finish before it thaws. */
  private drawIce(x: number, y: number, w: number, h: number, left: number) {
    const ctx = this.ctx
    ctx.fillStyle = 'rgba(190,230,255,0.72)'
    ctx.strokeStyle = '#e8f7ff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(x - 3, y + h * 0.05, w + 6, h * 0.9, 8)
    ctx.fill()
    ctx.stroke()
    // Frost glints.
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x + w * 0.1, y + h * 0.35)
    ctx.lineTo(x + w * 0.25, y + h * 0.2)
    ctx.moveTo(x + w * 0.75, y + h * 0.8)
    ctx.lineTo(x + w * 0.9, y + h * 0.65)
    ctx.stroke()
    ctx.font = `800 ${Math.round(h * 0.34)}px ${FONT}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineWidth = 3
    ctx.strokeStyle = '#1e5f8c'
    const label = `❄${left}`
    ctx.strokeText(label, x + w / 2, y + h / 2)
    ctx.fillStyle = '#ffffff'
    ctx.fillText(label, x + w / 2, y + h / 2)
  }

  private drawMiner(m: Miner) {
    const ctx = this.ctx
    const p = this.minerPos(m)
    const s = Math.max(9, Math.min(22, this.L.cell * 0.62))
    const color = this.game.colors[m.cart.color]
    const bob = m.state === 'dig' ? 0 : Math.sin((this.time + m.id) * 18) * s * 0.06
    const x = p.x
    const y = p.y + bob

    // Body.
    ctx.fillStyle = color
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(x - s * 0.32, y - s * 0.05, s * 0.64, s * 0.55, s * 0.12)
    ctx.fill()
    ctx.stroke()
    // Head.
    ctx.fillStyle = '#f2c28b'
    ctx.beginPath()
    ctx.arc(x, y - s * 0.25, s * 0.24, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    // Helmet with lamp.
    ctx.fillStyle = '#ffcc33'
    ctx.beginPath()
    ctx.arc(x, y - s * 0.3, s * 0.27, Math.PI, 0)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#fffbe0'
    ctx.beginPath()
    ctx.arc(x, y - s * 0.44, s * 0.08, 0, Math.PI * 2)
    ctx.fill()

    if (m.state === 'back') {
      // Carrying a gem home.
      const g = s * 0.34
      ctx.fillStyle = color
      ctx.fillRect(x - g / 2, y - s * 0.9, g, g)
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'
      ctx.strokeRect(x - g / 2, y - s * 0.9, g, g)
    } else {
      // Pickaxe, swinging while digging.
      const swing = m.state === 'dig' ? Math.sin(this.time * 30) * 0.9 : 0.3
      ctx.save()
      ctx.translate(x + s * 0.3, y)
      ctx.rotate(-0.8 + swing)
      ctx.strokeStyle = '#8b5a2b'
      ctx.lineWidth = Math.max(1.5, s * 0.09)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, -s * 0.6)
      ctx.stroke()
      ctx.strokeStyle = '#c9ccd1'
      ctx.lineWidth = Math.max(2, s * 0.12)
      ctx.beginPath()
      ctx.moveTo(-s * 0.25, -s * 0.55)
      ctx.quadraticCurveTo(0, -s * 0.72, s * 0.25, -s * 0.55)
      ctx.stroke()
      ctx.restore()
    }
  }
}

/** Small picture of a level, used in menus and the win screen. */
export function drawThumbnail(
  canvas: HTMLCanvasElement,
  cells: Int16Array,
  width: number,
  colors: string[],
  ghost = false
) {
  const height = cells.length / width
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  for (let i = 0; i < cells.length; i++) {
    const col = cells[i] === ROCK ? '#5d5d63' : colors[cells[i]]
    if (ghost) {
      const n = parseInt(col.slice(1), 16)
      const g = Math.round(0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)) * 0.5 + 40
      ctx.fillStyle = `rgb(${g},${g * 0.9},${g * 0.8})`
    } else ctx.fillStyle = col
    ctx.fillRect(i % width, Math.floor(i / width), 1, 1)
  }
}
