// Particles, ported from the prototype's js/core.js: embers, bubbles, leaves, sparks... Each lives
// in sprite-pixel space (one unit = one sprite pixel); the caller scales the canvas to draw them.

export interface IParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
  cols: string[]
  glow?: boolean
  sway?: number
  alpha?: number
  g?: number
  drag?: number
  twinkle?: boolean
  age?: number
}

export type ParticleType =
  | 'flame'
  | 'ember'
  | 'smoke'
  | 'drip'
  | 'sparkle'
  | 'shard'
  | 'mist'
  | 'glint'
  | 'zap'
  | 'fall'
  | 'bubble'
  | 'drop'
  | 'grit'
  | 'dust'
  | 'leaf'
  | 'pollen'
  | 'spore'
  | 'petal'
  | 'firefly'
  | 'goldleaf'
  | 'zz'

export const FLAME_COLS = ['#fff3a8', '#ffd04a', '#ff9a2a', '#ff5a14', '#a3260f']
// A new particle of a type at (x, y); f widens the spawn spread for bigger sprites.
export function makeParticle(
  type: ParticleType,
  x: number,
  y: number,
  f = 1,
  R: () => number = Math.random
): IParticle | undefined {
  switch (type) {
    case 'flame':
      return {
        x: x + (R() - 0.5) * 2,
        y,
        vx: (R() - 0.5) * 6,
        vy: -14 - R() * 12,
        life: 0.35 + R() * 0.3,
        size: R() < 0.3 ? 2 : 1,
        cols: FLAME_COLS,
        glow: true,
      }
    case 'ember':
      return {
        x: x + (R() - 0.5) * 10 * f,
        y: y + (R() - 0.5) * 6,
        vx: (R() - 0.5) * 6,
        vy: -8 - R() * 10,
        life: 0.9 + R() * 0.8,
        size: 1,
        cols: ['#ffe680', '#ff9a2a', '#ff5a14'],
        glow: true,
        sway: 1,
      }
    case 'smoke':
      return {
        x: x + (R() - 0.5) * 3,
        y,
        vx: (R() - 0.5) * 4,
        vy: -6 - R() * 5,
        life: 1 + R() * 0.8,
        size: 2,
        cols: ['#8a8186', '#5a5257', '#3a3438'],
        alpha: 0.6,
      }
    case 'drip':
      return {
        x: x + (R() - 0.5) * 3,
        y,
        vx: 0,
        vy: 2,
        g: 60,
        life: 0.9,
        size: 1,
        cols: ['#ffd04a', '#ff7a1a', '#a6371a'],
        glow: true,
      }
    case 'sparkle':
      return {
        x: x + (R() - 0.5) * 14,
        y: y + (R() - 0.5) * 14,
        vx: 0,
        vy: -3,
        life: 0.6 + R() * 0.4,
        size: 1,
        cols: ['#ffffff', '#fff0a0', '#f2c13a'],
        glow: true,
        twinkle: true,
      }
    case 'shard':
      return {
        x: x + (R() - 0.5) * 30,
        y: y + (R() - 0.5) * 8,
        vx: 0,
        vy: -5 - R() * 4,
        life: 1.6,
        size: 2,
        cols: ['#fff0a0', '#f2c13a', '#c48a16'],
        glow: false,
      }
    case 'mist':
      return {
        x: x + (R() - 0.5) * 4,
        y,
        vx: (R() - 0.5) * 10,
        vy: -14 - R() * 10,
        drag: 1.5,
        life: 0.8 + R() * 0.4,
        size: 2,
        cols: ['#ffffff', '#c8eeff', '#7ac8f0'],
        alpha: 0.55,
      }
    case 'glint':
      return {
        x: x + (R() - 0.5) * 10,
        y: y + (R() - 0.5) * 10,
        vx: 0,
        vy: -4,
        life: 0.5 + R() * 0.3,
        size: 1,
        cols: ['#ffffff', '#c8f4ff', '#7ee7ff'],
        glow: true,
        twinkle: true,
      }
    case 'zap':
      return {
        x: x + (R() - 0.5) * 14,
        y: y + (R() - 0.5) * 8,
        vx: 0,
        vy: 0,
        life: 0.12,
        size: 1,
        cols: ['#ffffff', '#7ee7ff'],
        glow: true,
      }
    case 'fall':
      return {
        x: x + (R() - 0.5) * 6,
        y,
        vx: (R() - 0.5) * 4,
        vy: 4,
        g: 120,
        life: 0.55,
        size: R() < 0.5 ? 2 : 1,
        cols: ['#e0f6ff', '#8ad4ff', '#3a90d2'],
        alpha: 0.9,
      }
    case 'bubble':
      return {
        x: x + (R() - 0.5) * 4,
        y,
        vx: (R() - 0.5) * 2,
        vy: -8 - R() * 4,
        life: 1.1,
        size: 1,
        cols: ['#e2f2f8', '#a0dcff', '#3a90d2'],
        glow: true,
        sway: 1,
      }
    case 'drop':
      return {
        x: x + (R() - 0.5) * 4,
        y,
        vx: 0,
        vy: 2,
        g: 50,
        life: 0.7,
        size: 1,
        cols: ['#a0dcff', '#3a90d2'],
        glow: false,
      }
    case 'grit':
      return {
        x: x + (R() - 0.5) * 30,
        y: y + (R() - 0.5) * 6,
        vx: (R() - 0.5) * 4,
        vy: 2,
        g: 40,
        life: 0.8 + R() * 0.4,
        size: R() < 0.3 ? 2 : 1,
        cols: ['#c8bca6', '#968a78', '#6e6456'],
      }
    case 'dust':
      return {
        x: x + (R() - 0.5) * 8,
        y,
        vx: (R() - 0.5) * 14,
        vy: -6 - R() * 6,
        drag: 2,
        life: 0.8 + R() * 0.5,
        size: 2,
        cols: ['#c4a06a', '#9a7a4a', '#6e5a3a'],
        alpha: 0.55,
      }
    case 'leaf':
      return {
        x: x + (R() - 0.5) * 10 * f,
        y: y + (R() - 0.5) * 4,
        vx: (R() - 0.5) * 8,
        vy: 5 + R() * 5,
        life: 1.5 + R() * 0.7,
        size: R() < 0.5 ? 2 : 1,
        cols: ['#b0f490', '#4cc44a', '#26942e'],
        sway: 1,
      }
    case 'pollen':
      return {
        x: x + (R() - 0.5) * 12,
        y: y + (R() - 0.5) * 8,
        vx: (R() - 0.5) * 3,
        vy: -3 - R() * 3,
        life: 0.9 + R() * 0.5,
        size: 1,
        cols: ['#fff6c8', '#e8ff8a', '#a8f088'],
        glow: true,
        twinkle: true,
      }
    case 'spore':
      return {
        x: x + (R() - 0.5) * 14,
        y: y + (R() - 0.5) * 4,
        vx: (R() - 0.5) * 6,
        vy: -4 - R() * 4,
        life: 1.4 + R() * 0.6,
        size: 1,
        cols: ['#f6ecff', '#d8c8ff', '#b89ad8'],
        glow: true,
        sway: 1,
        alpha: 0.8,
      }
    case 'petal':
      return {
        x: x + (R() - 0.5) * 20 * f,
        y: y + (R() - 0.5) * 6,
        vx: (R() - 0.5) * 10,
        vy: 6 + R() * 6,
        life: 1.6 + R() * 0.6,
        size: R() < 0.4 ? 2 : 1,
        cols: ['#fff0f6', '#ffb0cc', '#ec7aa6'],
        sway: 1,
      }
    case 'firefly':
      return {
        x: x + (R() - 0.5) * 30,
        y: y + (R() - 0.5) * 16,
        vx: (R() - 0.5) * 10,
        vy: (R() - 0.5) * 6 - 2,
        life: 1.4 + R() * 0.8,
        size: 1,
        cols: ['#f4ffb0', '#d8ff6a', '#8ae84a'],
        glow: true,
        twinkle: true,
        sway: 1,
      }
    case 'goldleaf':
      return {
        x: x + (R() - 0.5) * 30,
        y: y + (R() - 0.5) * 8,
        vx: (R() - 0.5) * 8,
        vy: 5 + R() * 5,
        life: 1.6 + R() * 0.6,
        size: R() < 0.5 ? 2 : 1,
        cols: ['#fff0a0', '#f2c13a', '#a8ffa0'],
        glow: true,
        sway: 1,
      }
    case 'zz':
      return {
        x: x + (R() - 0.5) * 4,
        y,
        vx: 3 + R() * 2,
        vy: -6 - R() * 3,
        life: 1.2,
        size: 1,
        cols: ['#e8e0ff', '#b8b0d8'],
        sway: 1,
      }
  }
}
// A particle list: add, step (gravity, drag, sway) and draw (glowing ones added on top).
export class PSys {
  list: IParticle[] = []
  add(p: IParticle | undefined) {
    if (p) {
      p.age = 0
      this.list.push(p)
    }
  }
  update(dt: number) {
    const L = this.list
    for (let i = L.length - 1; i >= 0; i--) {
      const p = L[i]
      p.age = (p.age ?? 0) + dt
      if (p.age >= p.life) {
        L.splice(i, 1)
        continue
      }
      if (p.g) p.vy += p.g * dt
      if (p.drag) {
        p.vx *= 1 - p.drag * dt
        p.vy *= 1 - p.drag * dt
      }
      p.x += p.vx * dt + (p.sway ? Math.sin(p.age * 6 + p.x) * 0.15 : 0)
      p.y += p.vy * dt
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (const glow of [false, true]) {
      ctx.globalCompositeOperation = glow ? 'lighter' : 'source-over'
      for (const p of this.list) {
        if (!!p.glow !== glow) continue
        const age = p.age ?? 0
        const k = age / p.life
        const c = p.cols[Math.min(p.cols.length - 1, Math.floor(k * p.cols.length))]
        let a = (p.alpha ?? 1) * (1 - k * 0.6)
        if (p.twinkle) a *= 0.5 + 0.5 * Math.sin(age * 30)
        ctx.globalAlpha = Math.max(0, a)
        ctx.fillStyle = c
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
      }
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }
}
