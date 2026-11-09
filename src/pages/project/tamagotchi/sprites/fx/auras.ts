import { TAU } from '../engine/math'
import type { IAura, IPose, ISpriteDef } from '../sprite-types'

// Glows and auras drawn with a sprite, ported from the prototype's js/core.js. Coordinates are in
// sprite pixels: (x, y) is the top-left of the sprite's grid on the canvas.

// A glow is [x, y, colour, radius, part?]: with part 'head' it moves with the head (head + body pose
// offsets of the frame shown), with 'body' with the body; without one it stays on the sprite grid.
function glowShift(pose: IPose | undefined, part: string | undefined): [number, number] {
  if (!pose || !part) return [0, 0]
  const b = pose.body || [0, 0],
    h = pose.head || [0, 0]
  return part === 'head' ? [b[0] + h[0], b[1] + h[1]] : part === 'body' ? b : [0, 0]
}
export function drawGlows(
  ctx: CanvasRenderingContext2D,
  def: ISpriteDef,
  x: number,
  y: number,
  sx: number,
  sy: number,
  flip: boolean,
  t: number,
  alpha = 1,
  img: { pose?: IPose } | null = null
) {
  if (!def.glows) return
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  def.glows.forEach(([gx0, gy0, col, r, part], i) => {
    const [dx, dy] = glowShift(img?.pose, part),
      gx = gx0 + dx,
      gy = gy0 + dy
    const px = x + (flip ? def.size - gx : gx) * sx,
      py = y + gy * sy,
      rr = r * (1 + 0.25 * Math.sin(t * 3 + i * 1.7))
    const g = ctx.createRadialGradient(px, py, 0, px, py, rr)
    g.addColorStop(0, col)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.globalAlpha = 0.55 * alpha
    ctx.fillStyle = g
    ctx.fillRect(px - rr, py - rr, rr * 2, rr * 2)
  })
  ctx.restore()
}
export function drawAura(
  ctx: CanvasRenderingContext2D,
  a: IAura,
  ox: number,
  oy: number,
  t: number,
  flip: boolean,
  w: number
) {
  const x = ox + (flip ? w - a.x : a.x),
    y = oy + a.y
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  if (a.type === 'sun' || a.type === 'twin') {
    const rings: [number, number][] =
      a.type === 'twin'
        ? [
            [a.r, 1],
            [a.r * 0.66, -1.6],
          ]
        : [[a.r, 1]]
    for (const [r, spd] of rings) {
      const n = 14
      ctx.globalAlpha = 0.55 + 0.2 * Math.sin(t * 3)
      for (let i = 0; i < n; i++) {
        const ang = t * 0.6 * spd + (i * Math.PI * 2) / n
        for (let d = r - 2; d <= r + (i % 2 ? 5 : 3); d++) {
          ctx.fillStyle = d > r + 2 ? '#ff9a2a' : '#ffd04a'
          ctx.fillRect(Math.round(x + Math.cos(ang) * d), Math.round(y + Math.sin(ang) * d), 1, 1)
        }
      }
      ctx.globalAlpha = 0.35
      ctx.strokeStyle = '#ffc444'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(x, y, r - 3, 0, Math.PI * 2)
      ctx.stroke()
    }
  } else if (a.type === 'ripple' || a.type === 'whirl') {
    ctx.globalAlpha = 0.55
    ctx.strokeStyle = '#a0dcff'
    ctx.lineWidth = 1
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.5 + i / 3) % 1
      ctx.globalAlpha = 0.6 * (1 - k)
      ctx.beginPath()
      ctx.ellipse(x, y, a.r * (0.4 + k * 0.8), a.r * 0.3 * (0.4 + k * 0.8), 0, 0, 7)
      ctx.stroke()
    }
    if (a.type === 'whirl')
      for (let i = 0; i < 16; i++) {
        const an = t * 2.4 + i * 0.63,
          r = a.r * (0.5 + (i % 3) * 0.2)
        ctx.globalAlpha = 0.8
        ctx.fillStyle = i % 2 ? '#ffffff' : '#7ee7ff'
        ctx.fillRect(x + Math.cos(an) * r, y + Math.sin(an) * r * 0.3, 2, 1)
      }
  } else if (a.type === 'twinw') {
    for (const [r, spd, col] of [
      [a.r, 1, '#7ee7ff'],
      [a.r * 0.7, -1.6, '#f4c85a'],
    ] as const)
      for (let i = 0; i < 40; i++) {
        const an = t * 1.1 * spd - i * 0.08 * spd,
          px = x + Math.cos(an) * r,
          py = y + Math.sin(an) * r * 0.36 + Math.sin(an * 3 + t) * 2
        ctx.globalAlpha = 0.7 * (1 - i / 40)
        ctx.fillStyle = i < 3 ? '#ffffff' : col
        ctx.fillRect(px, py, 2, 2)
      }
  } else if (a.type === 'ribbons') {
    for (const off of [0, Math.PI])
      for (let i = 0; i < 46; i++) {
        const an = t * 1.3 + off - i * 0.07,
          px = x + Math.cos(an) * a.r,
          py = y + Math.sin(an) * a.r * 0.38 + Math.sin(an * 2 + t * 2) * 5
        ctx.globalAlpha = 0.75 * (1 - i / 46)
        ctx.fillStyle = i < 4 ? '#ffffff' : i % 3 ? '#7ee7ff' : '#c8f4ff'
        ctx.fillRect(px, py, 2, 2)
      }
  } else if (a.type === 'leaves' || a.type === 'twinl') {
    const rings: [number, number, string[]][] =
      a.type === 'twinl'
        ? [
            [a.r, 1, ['#6aff6a', '#b0f490']],
            [a.r * 0.7, -1.5, ['#f4c85a', '#fff0a0']],
          ]
        : [[a.r, 1, ['#4cc44a', '#b0f490', '#26942e']]]
    for (const [r, spd, cols] of rings)
      for (let i = 0; i < 22; i++) {
        const an = t * 0.9 * spd + (i * TAU) / 22,
          px = Math.round(x + Math.cos(an) * r),
          py = Math.round(y + Math.sin(an) * r * 0.34 - (i % 3) * 1.5 + Math.sin(t * 2 + i) * 1.5)
        ctx.globalAlpha = 0.55 + 0.35 * Math.sin(an * 2 + t * 3)
        ctx.fillStyle = cols[i % cols.length]
        ctx.fillRect(px, py, 2, 1)
        ctx.fillRect(px + (Math.cos(an) > 0 ? 1 : 0), py - 1, 1, 1)
      }
  } else if (a.type === 'bossl') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, a.r * 1.4)
    g.addColorStop(0, 'rgba(110,230,90,.38)')
    g.addColorStop(1, 'rgba(40,160,40,0)')
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 2)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, a.r * 1.5, a.r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (a.type === 'sparks' || a.type === 'twinb') {
    const rings: [number, number, string][] =
      a.type === 'twinb'
        ? [
            [a.r, 1, '#ffe14a'],
            [a.r * 0.7, -1.5, '#9cc4ff'],
          ]
        : [[a.r, 1, '#ffe14a']]
    for (const [r, spd, col] of rings)
      for (let i = 0; i < 6; i++) {
        const an = t * 0.9 * spd + (i * TAU) / 6,
          px = x + Math.cos(an) * r,
          py = y + Math.sin(an) * r * 0.32
        ctx.globalAlpha = 0.55 + 0.4 * Math.sin(t * 9 + i * 2)
        ctx.fillStyle = col
        let qx = px,
          qy = py
        for (let k = 0; k < 4; k++) {
          const nx = qx + ((k + i) % 2 ? 2 : -2),
            ny = qy - 2
          ctx.fillRect(Math.round(Math.min(qx, nx)), Math.round(ny), 2, 1)
          ctx.fillRect(Math.round(nx), Math.round(ny), 1, 2)
          qx = nx
          qy = ny
        }
      }
  } else if (a.type === 'halo') {
    // a sun wheel behind the head: two dotted rings turning opposite ways and short rays
    for (const [r, spd, n] of [
      [a.r, 0.5, 20],
      [a.r * 0.7, -0.8, 14],
    ])
      for (let i = 0; i < n; i++) {
        const an = t * spd + (i * TAU) / n
        ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 2 + i)
        ctx.fillStyle = i % 2 ? '#fff6c8' : '#ffd84a'
        ctx.fillRect(Math.round(x + Math.cos(an) * r), Math.round(y + Math.sin(an) * r), 1, 1)
      }
    for (let i = 0; i < 12; i++) {
      const an = -t * 0.2 + (i * TAU) / 12
      ctx.globalAlpha = 0.35
      ctx.fillStyle = '#fff0a0'
      for (let d = a.r + 2; d < a.r + (i % 2 ? 5 : 8); d++)
        ctx.fillRect(Math.round(x + Math.cos(an) * d), Math.round(y + Math.sin(an) * d), 1, 1)
    }
  } else if (a.type === 'twinx') {
    // cross-line fused forms (lines/hybrid.ts): the twin rings in the colours of both parent lines
    const cols = a.cols ?? ['#ffffff', '#ffffff']
    for (const [r, spd, col] of [
      [a.r, 1, cols[0]],
      [a.r * 0.7, -1.6, cols[1]],
    ] as const)
      for (let i = 0; i < 40; i++) {
        const an = t * 1.1 * spd - i * 0.08 * spd,
          px = x + Math.cos(an) * r,
          py = y + Math.sin(an) * r * 0.36 + Math.sin(an * 3 + t) * 2
        ctx.globalAlpha = 0.7 * (1 - i / 40)
        ctx.fillStyle = i < 3 ? '#ffffff' : col
        ctx.fillRect(px, py, 2, 2)
      }
  } else if (a.type === 'motes' || a.type === 'twinh') {
    const rings: [number, number, string[]][] =
      a.type === 'twinh'
        ? [
            [a.r, 1, ['#ffd84a', '#fff0a0']],
            [a.r * 0.7, -1.5, ['#ffffff', '#bcdcf8']],
          ]
        : [[a.r, 1, ['#fff6c8', '#ffd84a', '#ffffff']]]
    for (const [r, spd, cols] of rings)
      for (let i = 0; i < 20; i++) {
        const an = t * 0.8 * spd + (i * TAU) / 20,
          px = Math.round(x + Math.cos(an) * r),
          py = Math.round(y + Math.sin(an) * r * 0.32 - (i % 3) * 2 - ((t * 6 + i * 3) % 8))
        ctx.globalAlpha = 0.45 + 0.4 * Math.sin(t * 4 + i * 1.3)
        ctx.fillStyle = cols[i % cols.length]
        ctx.fillRect(px, py, 1, 1)
        if (i % 4 === 0) {
          ctx.fillRect(px - 1, py, 3, 1)
          ctx.fillRect(px, py - 1, 1, 3)
        }
      }
  } else if (a.type === 'nightm' || a.type === 'twind') {
    const rings: [number, number, string[]][] =
      a.type === 'twind'
        ? [
            [a.r, 1, ['#a04ae8', '#e4b8ff']],
            [a.r * 0.7, -1.5, ['#ff3a4a', '#ff9a9a']],
          ]
        : [[a.r, 1, ['#a04ae8', '#c47aff', '#4a5aa8']]]
    for (const [r, spd, cols] of rings)
      for (let i = 0; i < 18; i++) {
        const an = t * 0.7 * spd + (i * TAU) / 18,
          px = Math.round(x + Math.cos(an) * r),
          py = Math.round(y + Math.sin(an) * r * 0.32 - (i % 3) - ((t * 4 + i * 2) % 6))
        ctx.globalAlpha = 0.4 + 0.4 * Math.sin(t * 3 + i * 1.7)
        ctx.fillStyle = cols[i % cols.length]
        ctx.fillRect(px, py, i % 3 ? 1 : 2, 1)
        if (i % 6 === 0) {
          ctx.fillRect(px - 2, py - 1, 2, 1)
          ctx.fillRect(px + 2, py - 1, 2, 1)
        }
      }
  } else if (a.type === 'shadm' || a.type === 'twins') {
    const rings: [number, number, string[]][] =
      a.type === 'twins'
        ? [
            [a.r, 1, ['#a04aff', '#f0d8ff']],
            [a.r * 0.7, -1.5, ['#d08aff', '#8c82a8']],
          ]
        : [[a.r, 1, ['#a04aff', '#8c82a8', '#f0d8ff']]]
    for (const [r, spd, cols] of rings)
      for (let i = 0; i < 18; i++) {
        const an = t * 0.7 * spd + (i * TAU) / 18,
          px = Math.round(x + Math.cos(an) * r),
          py = Math.round(y + Math.sin(an) * r * 0.32 - (i % 3) - ((t * 4 + i * 2) % 6))
        ctx.globalAlpha = 0.4 + 0.4 * Math.sin(t * 3 + i * 1.7)
        ctx.fillStyle = cols[i % cols.length]
        ctx.fillRect(px, py, i % 3 ? 1 : 2, 1)
        if (i % 6 === 0) {
          ctx.fillRect(px - 2, py - 1, 2, 1)
          ctx.fillRect(px + 2, py - 1, 2, 1)
        }
      }
  } else if (a.type === 'bosss') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, a.r * 1.4)
    g.addColorStop(0, 'rgba(160,74,255,.4)')
    g.addColorStop(1, 'rgba(50,20,100,0)')
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 1.8)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, a.r * 1.5, a.r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (a.type === 'bossd') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, a.r * 1.4)
    g.addColorStop(0, 'rgba(160,74,232,.45)')
    g.addColorStop(1, 'rgba(60,20,90,0)')
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 1.8)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, a.r * 1.5, a.r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (a.type === 'bossh') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, a.r * 1.4)
    g.addColorStop(0, 'rgba(255,230,140,.4)')
    g.addColorStop(1, 'rgba(255,200,80,0)')
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 2)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, a.r * 1.5, a.r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (a.type === 'bossb') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, a.r * 1.4)
    g.addColorStop(0, 'rgba(255,225,74,.32)')
    g.addColorStop(1, 'rgba(90,100,160,0)')
    ctx.globalAlpha = 0.75
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, a.r * 1.5, a.r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (a.type === 'dust' || a.type === 'twine') {
    const rings: [number, number, string[]][] =
      a.type === 'twine'
        ? [
            [a.r, 1, ['#ffa02a', '#ffe4a0']],
            [a.r * 0.7, -1.5, ['#f4c85a', '#fff0a0']],
          ]
        : [[a.r, 1, ['#c4a06a', '#e2c492', '#9a7a4a']]]
    for (const [r, spd, cols] of rings)
      for (let i = 0; i < 24; i++) {
        const an = t * 0.7 * spd + (i * TAU) / 24,
          px = Math.round(x + Math.cos(an) * r),
          py = Math.round(y + Math.sin(an) * r * 0.32 - (i % 3))
        ctx.globalAlpha = 0.5 + 0.3 * Math.sin(an * 2 + t * 2)
        ctx.fillStyle = cols[i % cols.length]
        ctx.fillRect(px, py, i % 4 ? 1 : 2, 1)
      }
  } else if (a.type === 'bosse') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, a.r * 1.4)
    g.addColorStop(0, 'rgba(255,160,42,.36)')
    g.addColorStop(1, 'rgba(150,90,30,0)')
    ctx.globalAlpha = 0.75
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, a.r * 1.5, a.r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (a.type === 'bossw') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, a.r * 1.4)
    g.addColorStop(0, 'rgba(60,180,255,.4)')
    g.addColorStop(1, 'rgba(20,120,255,0)')
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 2.2)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, a.r * 1.5, a.r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (a.type === 'boss') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, a.r * 1.4)
    g.addColorStop(0, 'rgba(255,90,20,.45)')
    g.addColorStop(1, 'rgba(255,40,0,0)')
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 2.4)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, a.r * 1.5, a.r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}
