import { makeParticle, PSys, FLAME_COLS } from '../../sprites/fx/particles'
import { lerp, TAU } from '../../sprites/engine/math'

// The stage the skill animations play on, ported from the monster-arena prototype (js/core.js).
// The prototype's skill scripts also moved the fighters and dealt damage; here the server's replay
// already decided all of that, so those calls are puppets: damage(), approach() and friends do
// nothing, and the timing helpers wait on the replay's clock. A cast's wind-up, release and hits
// come from the replay (see casts.ts), so a slash lands exactly when the server's hit does.
//
// Coordinates are "scene" units: sprite pixels (world px / PX), the same space particles live in.

export { makeParticle, FLAME_COLS, lerp, TAU }

export interface IFx {
  age: number
  life: number
  draw: (c: CanvasRenderingContext2D, k: number) => void
}

// A projectile drawn by a skill script (the server's own orb is hidden meanwhile).
export interface ICurProj {
  x: number
  y: number
  draw: (c: CanvasRenderingContext2D, x: number, y: number) => void
}

export interface IGhost {
  x: number
  y: number
  a: number
  img?: { white: CanvasImageSource } | null
  tint?: string
}

export interface ICastHit {
  // Replay seconds.
  t: number
  target: number
  crit: boolean
}

// One cast of a skill, read from the replay.
export interface ICast {
  skill: string
  who: number
  target: number
  // Replay seconds: wind-up start, release (the server's `skill` event), the zone landing.
  startT: number
  releaseT: number
  zoneT: number | null
  hits: ICastHit[]
}

export interface IFxDef {
  size: number
  mouth: number[]
  img: { foot: number }
  hover?: number
}

// A fighter as the scripts see it: where it stands (feet, scene units) and the visual offsets a
// script may set (ox/oy shift, sx/sy squash, alpha, after-images). Status fields the prototype set
// (blindT, rootT...) are kept but not drawn from here: the replay's status bits draw statuses.
export interface IEnt {
  idx: number
  side: number
  x: number
  y: number
  flip: boolean
  grow: number
  def: IFxDef
  hp: number
  hpMax: number
  ox: number
  oy: number
  sx: number
  sy: number
  alpha: number
  flash: number
  ghosts: IGhost[]
  anim: { name: string; t: number } | null
  cast: ICast | null
  status: string | null
  statusT: number
  charging: string | null
  castEl: string | null
  released: number
  goal: { x: number; y: number } | null
  slowT: number
  blindT: number
  blindLight: boolean
  defT: number
  defUpT: number
  stunT: number
  staticT: number
  rootT: number
  poisonT: number
  poisonAcc: number
  silenceT: number
  curseT: number
  atkDownT: number
  atkUpT: number
  immuneT: number
  evaT: number
  hasteT: number
  focusT: number
  regenT: number
  regenAcc: number
  bubbleT: number
  bubbleHp: number
  bubbleMax: number
  bubbleStone: boolean
  bubbleHoly: boolean
  bubbleHit: number
  stoneSkin: boolean
  staticRetort: boolean
  retort: boolean
  rebirth: boolean
  rebirthUsed: boolean
  lastStand: boolean
  lastStandUsed: boolean
  enraged: boolean
  voidP: boolean
  venom: boolean
  undead: boolean
  ent: boolean
  critNext: boolean
}

export const newEnt = (idx: number, side: number): IEnt => ({
  idx,
  side,
  x: 0,
  y: 0,
  flip: false,
  grow: 1,
  def: { size: 32, mouth: [16, 16], img: { foot: 28 } },
  hp: 1,
  hpMax: 1,
  ox: 0,
  oy: 0,
  sx: 1,
  sy: 1,
  alpha: 1,
  flash: 0,
  ghosts: [],
  anim: null,
  cast: null,
  status: null,
  statusT: 0,
  charging: null,
  castEl: null,
  released: 0,
  goal: null,
  slowT: 0,
  blindT: 0,
  blindLight: false,
  defT: 0,
  defUpT: 0,
  stunT: 0,
  staticT: 0,
  rootT: 0,
  poisonT: 0,
  poisonAcc: 0,
  silenceT: 0,
  curseT: 0,
  atkDownT: 0,
  atkUpT: 0,
  immuneT: 0,
  evaT: 0,
  hasteT: 0,
  focusT: 0,
  regenT: 0,
  regenAcc: 0,
  bubbleT: 0,
  bubbleHp: 0,
  bubbleMax: 0,
  bubbleStone: false,
  bubbleHoly: false,
  bubbleHit: 0,
  stoneSkin: false,
  staticRetort: false,
  retort: false,
  rebirth: false,
  rebirthUsed: false,
  lastStand: false,
  lastStandUsed: false,
  enraged: false,
  voidP: false,
  venom: false,
  undead: false,
  ent: false,
  critNext: false,
})

// Screen-wide effects a script can set; they fade on their own.
export const scene = {
  shake: 0,
  flashScreen: 0,
  darken: 0,
  tintA: 0,
  hitstop: 0,
  curProj: null as ICurProj | null,
  curGlyph: null as { x: number; y: number; r: number; a: number } | null,
  curOrb: null as { x: number; y: number; r: number } | null,
  // Teams whose server projectiles are hidden while a script draws its own.
  ownProj: new Set<number>(),
  // The current frame of a fighter, for after-images (set by the sprite layer).
  frameOf: (e: IEnt): { white: CanvasImageSource } | null => (e ? null : null),
}

// Live values the scripts read (ES module bindings stay live).
export let clock = 0
export let WW = 640
export let WH = 440
export const cam = { x: 0, y: 0 }
export const ps = new PSys()
export const fxs: IFx[] = []

interface ITask {
  t0: number
  ms: number
  fn: (k: number) => void
  res: () => void
}
const tasks = new Set<ITask>()
const waiting = new Set<{ t: number; res: () => void }>()

// Runs fn(k) for k 0..1 over ms of replay time, then resolves.
export const tween = (ms: number, fn: (k: number) => void = () => {}) =>
  new Promise<void>((res) => tasks.add({ t0: clock, ms: Math.max(1, ms), fn, res }))
export const wait = (ms: number) => tween(ms)
// Resolves when the replay reaches t (seconds).
export const untilT = (t: number) =>
  t <= clock ? Promise.resolve() : new Promise<void>((res) => waiting.add({ t, res }))

export const ease = (k: number) => 1 - Math.pow(1 - k, 3)
export const easeIn = (k: number) => k * k

export const resetStage = (w: number, h: number) => {
  clock = 0
  WW = w
  WH = h
  tasks.clear()
  waiting.clear()
  fxs.length = 0
  ps.list.length = 0
  scene.shake = scene.flashScreen = scene.darken = scene.tintA = scene.hitstop = 0
  scene.curProj = scene.curGlyph = scene.curOrb = null
  scene.ownProj.clear()
}

// Advances the stage to replay time `now` (seconds): tweens, waits, fxs and particles.
export const advanceStage = (now: number) => {
  const dt = Math.max(0, now - clock)
  clock = now
  for (const task of [...tasks]) {
    const k = Math.min(1, ((now - task.t0) * 1000) / task.ms)
    task.fn(k)
    if (k >= 1) {
      tasks.delete(task)
      task.res()
    }
  }
  for (const w of [...waiting])
    if (w.t <= now) {
      waiting.delete(w)
      w.res()
    }
  for (let i = fxs.length - 1; i >= 0; i--) {
    fxs[i].age += dt
    if (fxs[i].age >= fxs[i].life) fxs.splice(i, 1)
  }
  ps.update(dt)
  scene.shake = Math.max(0, scene.shake - dt * 18)
  scene.flashScreen = Math.max(0, scene.flashScreen - dt * 4)
  scene.hitstop = Math.max(0, scene.hitstop - dt)
}

// ----- where a fighter is (prototype js/core.js) -----
export const anchor = (e: IEnt) => ({ x: e.x + e.ox, y: e.y + e.oy })
export const centerOf = (e: IEnt) => {
  const a = anchor(e)
  return { x: a.x, y: a.y - e.def.img.foot * 0.45 * (e.grow || 1) }
}
export const mouthOf = (e: IEnt) => {
  const d = e.def
  const a = anchor(e)
  const mx = e.flip ? d.size - d.mouth[0] : d.mouth[0]
  const g = e.grow || 1
  return { x: a.x + (mx - d.size / 2) * g, y: a.y - (d.img.foot - d.mouth[1]) * g }
}
export const reachOf = (a: IEnt, b: IEnt) => (a.def.size + b.def.size) * 0.3 + 8
export const clampPos = (_e: IEnt, x: number, y: number) => ({ x, y })

export function impactBurst(x: number, y: number, col = '#ffffff', n = 14) {
  ps.burst(n, () => {
    const a = Math.random() * Math.PI * 2
    const sp = 30 + Math.random() * 50
    return {
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp * 0.6,
      drag: 5,
      life: 0.25 + Math.random() * 0.2,
      size: 1,
      cols: ['#ffffff', col],
      glow: true,
    }
  })
  fxs.push({
    age: 0,
    life: 0.18,
    draw(c, k) {
      c.globalCompositeOperation = 'lighter'
      c.globalAlpha = 1 - k
      c.strokeStyle = '#fff'
      c.lineWidth = 1
      c.beginPath()
      c.ellipse(x, y, 4 + k * 12, 2 + k * 6, 0, 0, Math.PI * 2)
      c.stroke()
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 + 0.3
        c.fillStyle = col
        c.fillRect(
          Math.round(x + Math.cos(a) * (3 + k * 10)),
          Math.round(y + Math.sin(a) * (2 + k * 6)),
          2,
          2
        )
      }
    },
  })
}

// A projectile thrown by `e` from `from` to `to`; it lands when the server's first hit of the cast
// does, and the server's own orb for that side is hidden meanwhile.
export function projectileOf(
  e: IEnt | undefined,
  from: { x: number; y: number },
  to: { x: number; y: number },
  ms: number,
  drawFn: (c: CanvasRenderingContext2D, x: number, y: number) => void,
  trail?: (x: number, y: number) => void
) {
  const hit = e?.cast?.hits.find((h) => h.t > clock)
  const dur = hit ? (hit.t - clock) * 1000 : ms
  if (e) scene.ownProj.add(e.side)
  return tween(dur, (k) => {
    const x = from.x + (to.x - from.x) * k
    const y = from.y + (to.y - from.y) * k - Math.sin(k * Math.PI) * 10
    scene.curProj = { x, y, draw: drawFn }
    if (trail) trail(x, y)
    if (k >= 1) {
      scene.curProj = null
      if (e) scene.ownProj.delete(e.side)
    }
  })
}

// How long until the cast's zone lands (the server's zoneHit), or the prototype's own delay.
export const zoneDelay = (e: IEnt, ms: number) =>
  e.cast?.zoneT != null ? Math.max(100, (e.cast.zoneT - clock) * 1000) : ms

// ----- puppets: the server already moved the fighters and dealt the damage -----
export const damage = (...args: unknown[]) => Promise.resolve(void args)
export const sayAt = (...args: unknown[]) => void args
export const approach = (...args: unknown[]) => Promise.resolve(void args)
export const walkTo = (...args: unknown[]) => Promise.resolve(void args)
export const keepRange = (...args: unknown[]) => Promise.resolve(void args)
export const lungeHit = (...args: unknown[]) => Promise.resolve(void args)
export const frameOf = (e: IEnt, t?: number) => (void t, scene.frameOf(e))

// Whether the server's cast reached `def` (the prototype checked the range itself).
// (`r`, the prototype's range, is ignored.)
export const inRange = (att: IEnt, def: IEnt, ...r: unknown[]) =>
  !!att.cast && r.length >= 0 && att.cast.hits.some((h) => h.target === def.idx)

// The prototype's cast pose: charging lasts until the server's release, then the release.
export function castPose(att: IEnt, _chargeMs: number, releaseMs = 560, el = 'fire') {
  att.charging = el
  att.castEl = el
  const charged = untilT(att.cast?.releaseT ?? clock).then(() => {
    att.charging = null
  })
  const release = () => {
    att.released = 0.25
    return tween(releaseMs)
  }
  return { charged, release }
}

interface IMeleeOpts {
  wind: number
  rush?: number
  hits?: number
  gap?: number
  windFx?: (k: number) => void
  onHit: (i: number, dir: number) => Promise<unknown> | unknown
}

// The prototype's dash-and-strike, without the dash: wind-up effects until the release, then each
// of the server's hits of this cast at its own moment.
export async function meleeStrike(att: IEnt, def: IEnt, o: IMeleeOpts) {
  const cast = att.cast
  const dir = Math.sign(def.x - att.x) || 1
  const release = cast?.releaseT ?? clock
  await tween(Math.max(60, (release - clock) * 1000), (k) => o.windFx?.(k))
  const hits = cast?.hits.length ? cast.hits : [{ t: release, target: def.idx, crit: false }]
  const pending: unknown[] = []
  for (let i = 0; i < hits.length; i++) {
    await untilT(hits[i].t)
    pending.push(o.onHit(i, dir))
  }
  await Promise.all(pending)
}

// One skill's animation. `game` names the arena skill id when it differs from the key, `boss` the
// sprite whose version it is (two raid bosses share e_mistbite).
export interface ISkillFx {
  name: string
  icon: string
  reach?: number
  passive?: boolean
  game?: string
  boss?: string
  el?: string
  run: (att: IEnt, def: IEnt) => Promise<unknown>
}

// The prototype tagged a fighter with the skill's name; the replay already shows it.
export const tag = (...args: unknown[]) => void args
