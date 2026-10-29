// Real-time game state. Pure logic: no drawing here, the renderer reads this.
//
// Tapping a tray column sends its front minecart to a free slot (a chained
// group of two or three goes together and needs that many free slots; in the
// harder modes the group also leaves together, once every one of them is done). A cart in a slot releases one miner per
// gem it must collect, in a steady stream. Each miner claims the reachable gem
// of its color with the shortest walk from the mine entrance (around the path
// that circles the picture, then through tunnels), digs it and carries it
// back. The cart leaves once every gem is delivered. Run out of slots with
// nothing diggable and the level is lost.

import {
  Board,
  Lock,
  ROCK,
  cloneBoard,
  colorReachable,
  computeEdgeCost,
  dig,
  gemsLeft,
  pickTarget,
  tunnelMap,
} from './board'
import { GenOptions, TrayLayout, generateTray, trayKey } from './generator'
import { LevelDef, SLOTS } from './levels'
import { Pt, routeLength, routeToEdgeCell } from './rim'
import { PREGENERATED_TRAYS } from './trays'

export const MAX_SLOTS = 7
const RELEASE_GAP = 0.12 // seconds between miners leaving the same cart
const WALK_SPEED = 10 // grid cells per second
const DIG_TIME = 0.2
// The simulation always advances in steps of this size, whatever the frame
// rate, so the same taps always give the same result (the level checker
// relies on this to replay games without drawing them).
export const FIXED_STEP = 1 / 60
export const SLOT_LEG = 2 // route length credited to the walk from a slot to the entrance

export interface Cart {
  id: number
  color: number
  total: number
  remaining: number // gems still to be delivered
  pending: number // miners on their way to a reserved gem
  minersOut: number
  cooldown: number // seconds until the next miner may leave
  hidden: boolean // color not shown until it reaches the front
  links: Cart[] // other carts chained to this one: all are tapped together
  pair: number // 1-based label shared by the carts of a chained group, 0 if not chained
  frozen: number // can't be tapped until this many carts have finished (0 = not frozen)
}

export interface Miner {
  id: number
  cart: Cart
  slot: number
  target: number
  route: Pt[] // grid units, from the mine entrance to the gem's face
  pos: number // distance travelled, including SLOT_LEG
  length: number
  state: 'out' | 'dig' | 'back'
  timer: number
}

export type GameEvent =
  | { type: 'tap'; carts: Cart[] }
  | { type: 'denied'; column: number }
  | { type: 'dig'; cell: number; color: number }
  | { type: 'crack'; cell: number }
  | { type: 'unlock'; lock: Lock }
  | { type: 'cartDone'; cart: Cart; slot: number }
  | { type: 'won' }
  | { type: 'lost' }

export type Status = 'playing' | 'won' | 'lost'

/** A player action and the simulation step it happened at, so a game can be replayed exactly. */
export type Action = { step: number; tap: number } | { step: number; addSlot: true }

let nextId = 1

// Trays made ahead of time by `yarn gem:gen` (trays.ts; big levels take
// seconds to generate) are keyed by trayKey, so every mode's version of a
// level has its own. Trays generated in the browser are kept for restarts.
const trayCache = new Map<string, TrayLayout>()

export function trayOptions(level: LevelDef, seed: number): GenOptions {
  return {
    seed,
    columns: level.columns,
    slots: SLOTS,
    together: level.together,
    minCart: level.cart[0],
    maxCart: level.cart[1],
    bigCarts: level.bigCarts,
    shuffle: level.shuffle,
    links: level.links,
    triples: level.triples,
    mystery: level.mystery,
    frozen: level.frozen ?? 0,
    greedyTarget: level.greedy,
  }
}

/** The level's tray: pre-generated if it still matches the level, otherwise generated now. */
function loadTray(level: LevelDef, board: Board, seed: number): TrayLayout {
  const key = trayKey(level, seed)
  const pre = PREGENERATED_TRAYS[key]
  if (pre) return pre.layout
  let layout = trayCache.get(key)
  if (!layout) {
    // eslint-disable-next-line no-console -- tells a developer to run yarn gem:gen
    console.warn(
      `${level.name}: no up-to-date pre-generated tray (run yarn gem:gen), generating now`
    )
    layout = generateTray(board, trayOptions(level, seed))
    trayCache.set(key, layout)
  }
  return layout
}

export function buildBoard(level: LevelDef): { board: Board; colors: string[] } {
  const keys = Object.keys(level.palette)
  const width = level.art[0].length
  const height = level.art.length
  const cells = new Int16Array(width * height)
  const lockOf = new Int16Array(width * height).fill(-1)
  const armor = new Uint8Array(width * height)
  const lockNames = Object.keys(level.locks ?? {})
  const locks: Lock[] = lockNames.map((name) => {
    const def = level.locks![name]
    const key = keys.indexOf(def.key)
    if (key < 0) throw new Error(`${level.name}: lock ${name} has unknown key '${def.key}'`)
    return { key, need: def.need, open: false, cells: [] }
  })
  level.art.forEach((row, y) => {
    if (row.length !== width)
      throw new Error(`${level.name}: row ${y} has length ${row.length}, expected ${width}`)
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      if (row[x] === '#') {
        cells[i] = ROCK
        continue
      }
      const idx = keys.indexOf(row[x])
      if (idx < 0) throw new Error(`${level.name}: unknown color '${row[x]}'`)
      cells[i] = idx
      if (level.armored?.includes(row[x])) armor[i] = 1
      const mark = level.lockMap?.[y]?.[x] ?? '.'
      const l = lockNames.indexOf(mark)
      if (l >= 0) {
        lockOf[i] = l
        locks[l].cells.push(i)
      }
    }
  })
  const board: Board = {
    width,
    height,
    cells,
    lockOf,
    locks,
    mined: new Int32Array(keys.length),
    edgeCost: computeEdgeCost(width, height),
    armor,
  }
  return { board, colors: keys.map((k) => level.palette[k]) }
}

/** Full walk: entrance -> around the path -> into the edge cell -> tunnels -> face of the target. */
function buildRoute(b: Board, path: number[]): Pt[] {
  const w = b.width
  const center = (i: number): Pt => ({ x: (i % w) + 0.5, y: Math.floor(i / w) + 0.5 })
  const route = [...routeToEdgeCell(w, b.height, path[0]), ...path.map(center)]
  // Stop at the gem's face rather than its center.
  const t = route[route.length - 1]
  const prev = route[route.length - 2]
  route[route.length - 1] = { x: prev.x + (t.x - prev.x) * 0.55, y: prev.y + (t.y - prev.y) * 0.55 }
  return route
}

export class Game {
  readonly board: Board
  readonly colors: string[]
  readonly totalGems: number
  readonly original: Int16Array // picture before digging
  readonly originalArmor: Uint8Array // to tell cracked armored gems from intact ones
  // Big maps mean long walks: miners walk faster and leave more often there,
  // so a level takes minutes rather than a quarter of an hour. 1 on normal maps.
  readonly pace: number
  tray: Cart[][]
  slots: (Cart | null)[]
  miners: Miner[] = []
  reserved = new Set<number>()
  status: Status = 'playing'
  events: GameEvent[] = []
  cartsDone = 0 // thaws frozen carts
  private clock = 0 // time not yet simulated, always < FIXED_STEP
  steps = 0 // fixed steps simulated so far
  log: Action[] = [] // everything the player did, for replaying (hints)

  /** `layout` overrides the level's stored tray (used when checking new trays). */
  constructor(
    readonly level: LevelDef,
    seed: number,
    layout?: TrayLayout
  ) {
    const { board, colors } = buildBoard(level)
    this.board = board
    this.colors = colors
    this.totalGems = gemsLeft(board)
    this.original = board.cells.slice()
    this.originalArmor = board.armor.slice()
    this.pace = Math.max(1, (board.width + board.height) / 48)
    layout ??= loadTray(level, board, seed)
    this.tray = layout.columns.map((col) =>
      col.map((c) => ({
        id: nextId++,
        color: c.color,
        total: c.count,
        remaining: c.count,
        pending: 0,
        minersOut: 0,
        cooldown: 0,
        hidden: !!c.hidden,
        links: [] as Cart[],
        pair: 0,
        frozen: c.frozen ?? 0,
      }))
    )
    let groups = 0
    layout.columns.forEach((col, ci) =>
      col.forEach((c, i) => {
        if (!c.links) return
        const cart = this.tray[ci][i]
        cart.links = c.links.map(([lc, li]) => this.tray[lc][li])
        cart.pair = cart.links.find((l) => l.pair)?.pair || ++groups
      })
    )
    this.slots = Array(SLOTS).fill(null)
  }

  get gemsLeft(): number {
    return gemsLeft(this.board)
  }

  /** Carts that a tap on this column would send, or null if the tap isn't allowed now. */
  private tapGroup(column: number): { cart: Cart; column: number }[] | null {
    const cart = this.tray[column]?.[0]
    if (!cart) return null
    const group = [{ cart, column }]
    for (const link of cart.links) {
      const lc = this.tray.findIndex((col) => col[0] === link)
      if (lc < 0) return null // a chained partner isn't at the front yet
      group.push({ cart: link, column: lc })
    }
    if (group.some((g) => this.iceLeft(g.cart) > 0)) return null
    const free = this.slots.filter((s) => s === null).length
    return free >= group.length ? group : null
  }

  /** Carts that still have to finish before this frozen cart can be tapped. */
  iceLeft(cart: Cart): number {
    return Math.max(0, cart.frozen - this.cartsDone)
  }

  /** Whether tapping this column now would send at least one cart that can dig right away. */
  frontReady(column: number): boolean {
    const group = this.tapGroup(column)
    return !!group && group.some((g) => colorReachable(this.board, g.cart.color, this.reserved))
  }

  tap(column: number): boolean {
    if (this.status !== 'playing') return false
    const group = this.tapGroup(column)
    if (!group) {
      this.events.push({ type: 'denied', column })
      return false
    }
    for (const g of group) {
      this.tray[g.column].shift()
      this.slots[this.slots.indexOf(null)] = g.cart
      const next = this.tray[g.column][0]
      if (next) next.hidden = false
    }
    this.events.push({ type: 'tap', carts: group.map((g) => g.cart) })
    this.log.push({ step: this.steps, tap: column })
    return true
  }

  addSlot(): boolean {
    if (this.slots.length >= MAX_SLOTS || this.status === 'won') return false
    this.slots.push(null)
    this.log.push({ step: this.steps, addSlot: true })
    if (this.status === 'lost') this.status = 'playing'
    return true
  }

  /** Copy of the whole game state, for trying out taps without touching this one. */
  clone(): Game {
    const copies = new Map<Cart, Cart>()
    const copy = (c: Cart): Cart => {
      let n = copies.get(c)
      if (!n) {
        n = { ...c }
        copies.set(c, n)
        n.links = c.links.map(copy)
      }
      return n
    }
    const g = Object.create(Game.prototype) as Game
    Object.assign(g, this, {
      board: cloneBoard(this.board),
      tray: this.tray.map((col) => col.map(copy)),
      slots: this.slots.map((c) => c && copy(c)),
      miners: this.miners.map((m) => ({ ...m, cart: copy(m.cart) })),
      reserved: new Set(this.reserved),
      events: [],
      log: [...this.log],
    })
    return g
  }

  /** Rebuilds a game by applying the same actions at the same steps. */
  static replay(
    level: LevelDef,
    seed: number,
    log: Action[],
    steps: number,
    layout?: TrayLayout
  ): Game {
    const g = new Game(level, seed, layout)
    for (const a of log) {
      while (g.steps < a.step) g.update(FIXED_STEP)
      if ('tap' in a) g.tap(a.tap)
      else g.addSlot()
    }
    while (g.steps < steps) g.update(FIXED_STEP)
    g.events.length = 0
    return g
  }

  /** Columns holding the carts a tap on `column` would send (more than one for a chained group). */
  groupColumns(column: number): number[] {
    const links = this.tray[column]?.[0]?.links ?? []
    const cols = links
      .map((l) => this.tray.findIndex((col) => col.includes(l)))
      .filter((c) => c >= 0)
    return [column, ...cols].sort((a, b) => a - b)
  }

  /** A cart that is done but held in its slot because a chained partner is still collecting. */
  waitingForPartner(cart: Cart): boolean {
    return !!this.level.together && cart.remaining === 0 && cart.links.some((l) => !this.isDone(l))
  }

  private isDone(cart: Cart): boolean {
    return cart.remaining === 0 && cart.minersOut === 0
  }

  /** True when nothing is moving: no miners out and no cart about to send one. */
  get quiet(): boolean {
    return this.miners.length === 0 && this.slots.every((c) => !c || c.cooldown <= 0)
  }

  /** Whether tapping this column is allowed right now. */
  canTap(column: number): boolean {
    return this.status === 'playing' && !!this.tapGroup(column)
  }

  update(dt: number) {
    this.clock += dt
    while (this.clock >= FIXED_STEP - 1e-9) {
      this.clock -= FIXED_STEP
      this.steps++
      this.step(FIXED_STEP)
    }
  }

  private step(dt: number) {
    if (this.status !== 'playing') return
    this.dispatch(dt)

    const step = WALK_SPEED * this.pace * dt
    for (const m of this.miners) {
      if (m.state === 'out') {
        m.pos += step
        if (m.pos >= m.length) {
          m.pos = m.length
          m.state = 'dig'
          m.timer = DIG_TIME
        }
      } else if (m.state === 'dig') {
        m.timer -= dt
        if (m.timer <= 0) {
          const opened = dig(this.board, m.target)
          this.reserved.delete(m.target)
          m.cart.remaining--
          m.cart.pending--
          m.state = 'back'
          // An armored gem only cracks on the first hit; the next miner breaks it.
          if (this.board.cells[m.target] >= 0) this.events.push({ type: 'crack', cell: m.target })
          else this.events.push({ type: 'dig', cell: m.target, color: m.cart.color })
          for (const k of opened) this.events.push({ type: 'unlock', lock: this.board.locks[k] })
        }
      } else {
        m.pos -= step
      }
    }
    this.miners = this.miners.filter((m) => {
      if (m.state === 'back' && m.pos <= 0) {
        m.cart.minersOut--
        return false
      }
      return true
    })

    this.slots.forEach((cart, i) => {
      if (cart && this.isDone(cart) && !this.waitingForPartner(cart)) {
        this.slots[i] = null
        this.cartsDone++
        this.events.push({ type: 'cartDone', cart, slot: i })
      }
    })

    this.checkEnd()
  }

  /** Each cart lets out its next miner once the previous one has had a head start. */
  private dispatch(dt: number) {
    let map: ReturnType<typeof tunnelMap> | null = null
    this.slots.forEach((cart, slot) => {
      if (!cart) return
      cart.cooldown -= dt
      if (cart.cooldown <= 0 && cart.remaining - cart.pending > 0) {
        map ??= tunnelMap(this.board)
        const t = pickTarget(this.board, cart.color, this.reserved, map)
        if (!t) return
        cart.cooldown = RELEASE_GAP / this.pace
        this.reserved.add(t.cell)
        cart.pending++
        cart.minersOut++
        const route = buildRoute(this.board, t.path)
        this.miners.push({
          id: nextId++,
          cart,
          slot,
          target: t.cell,
          route,
          pos: 0,
          length: SLOT_LEG + routeLength(route),
          state: 'out',
          timer: 0,
        })
      }
    })
  }

  private checkEnd() {
    if (this.gemsLeft === 0) {
      if (this.miners.length === 0) {
        this.status = 'won'
        this.events.push({ type: 'won' })
      }
      return
    }
    if (this.miners.length > 0) return
    if (this.tray.some((_, c) => this.tapGroup(c))) return
    const anyWorking = this.slots.some(
      (c) => c && c.remaining - c.pending > 0 && colorReachable(this.board, c.color, this.reserved)
    )
    if (!anyWorking) {
      this.status = 'lost'
      this.events.push({ type: 'lost' })
    }
  }
}
