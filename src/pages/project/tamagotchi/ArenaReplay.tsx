import { useEffect, useMemo, useRef } from 'react'
import {
  ARENA_ELEMENT_COLOR,
  ARENA_H,
  ARENA_SCALE,
  ARENA_TICK,
  ARENA_W,
  StatusMap,
  statusesFromBits,
} from './arena-helper'
import { ArenaElement, IArenaReplay, IArenaSkill, StatusId } from './arena-interface'

interface IArenaReplayProps {
  replay: IArenaReplay
  statuses: StatusMap
  // Skill details by id (catalog + the enemy's skills), for wind-up rings and AOE sizes.
  skills: Record<string, IArenaSkill>
  speed: number
  // Called with the tick being shown, about 10 times a second.
  onTick: (tick: number) => void
}

const S = ARENA_SCALE
const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'
const colorOf = (el: unknown) =>
  ARENA_ELEMENT_COLOR[(el as ArenaElement) ?? 'neutral'] ?? ARENA_ELEMENT_COLOR.neutral

// A cave-floor background drawn once per mount.
const buildFloor = () => {
  const off = document.createElement('canvas')
  off.width = ARENA_W * 2
  off.height = ARENA_H * 2
  const g = off.getContext('2d')
  if (!g) return off
  g.scale(2, 2)
  const grad = g.createRadialGradient(
    ARENA_W / 2,
    ARENA_H / 2,
    40,
    ARENA_W / 2,
    ARENA_H / 2,
    ARENA_W * 0.7
  )
  grad.addColorStop(0, '#3b3c63')
  grad.addColorStop(1, '#22233f')
  g.fillStyle = grad
  g.fillRect(0, 0, ARENA_W, ARENA_H)
  let v = 7
  const r = () => {
    v = (Math.imul(v, 1103515245) + 12345) >>> 0
    return v >>> 8
  }
  g.strokeStyle = 'rgba(16,17,36,.75)'
  g.lineWidth = 1.4
  for (let i = 0; i < 46; i++) {
    let x = r() % ARENA_W
    let y = r() % ARENA_H
    g.beginPath()
    g.moveTo(x, y)
    for (let k = 0; k < 4; k++) {
      x += (r() % 70) - 35
      y += (r() % 70) - 35
      g.lineTo(x, y)
    }
    g.stroke()
  }
  g.lineWidth = 6
  g.strokeStyle = 'rgba(73,220,255,.55)'
  g.shadowColor = '#49dcff'
  g.shadowBlur = 18
  g.strokeRect(10, 10, ARENA_W - 20, ARENA_H - 20)
  return off
}

// Draws a recorded arena fight on a canvas. Purely visual: the server already decided the result.
export const ArenaReplay = (props: IArenaReplayProps) => {
  const { replay, statuses, skills, speed, onTick } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const speedRef = useRef(speed)
  const onTickRef = useRef(onTick)
  speedRef.current = speed
  onTickRef.current = onTick
  const statusOrder = useMemo(() => Object.keys(statuses) as StatusId[], [statuses])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const floor = buildFloor()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const { frames, events, fighters, step } = replay
    const lastTick = (frames.length - 1) * step
    let tick = 0
    let lastTime = 0
    let lastReported = -1
    let raf = 0

    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const cssW = canvas.clientWidth || ARENA_W
      canvas.width = Math.round(cssW * dpr)
      canvas.height = Math.round(((cssW * ARENA_H) / ARENA_W) * dpr)
    }
    fit()
    window.addEventListener('resize', fit)

    const drawText = (
      text: string,
      x: number,
      y: number,
      size: number,
      color: string,
      alpha: number
    ) => {
      ctx.globalAlpha = alpha
      ctx.font = `${size}px Kanit, system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.lineWidth = Math.max(3, size / 6)
      ctx.strokeStyle = '#0b0c18'
      ctx.strokeText(text, x, y)
      ctx.fillStyle = color
      ctx.fillText(text, x, y)
      ctx.globalAlpha = 1
    }
    // Position of a fighter at a tick (frames are every `step` ticks).
    const rowAt = (t: number, idx: number) =>
      frames[Math.min(frames.length - 1, Math.floor(t / step))].f[idx]

    const render = () => {
      const scale = canvas.width / ARENA_W
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      ctx.clearRect(0, 0, ARENA_W, ARENA_H)
      ctx.drawImage(floor, 0, 0, ARENA_W, ARENA_H)
      const fi = tick / step
      const i0 = Math.min(frames.length - 1, Math.floor(fi))
      const i1 = Math.min(frames.length - 1, i0 + 1)
      const k = fi - i0
      const f0 = frames[i0]
      const f1 = frames[i1]
      const now = performance.now() / 1000

      for (const z of f0.z) {
        const [x, y, r, left, total, el] = z as [number, number, number, number, number, string]
        const c = colorOf(el)
        ctx.setLineDash([7, 6])
        ctx.strokeStyle = c
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc(x / S, y / S, r, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = `${c}33`
        ctx.beginPath()
        ctx.arc(x / S, y / S, r * (1 - left / total), 0, Math.PI * 2)
        ctx.fill()
      }
      for (const e of events) {
        const age = (tick - e.t) / ARENA_TICK
        if (age < 0 || age > 0.5) continue
        const a = 1 - age / 0.5
        const c = colorOf(e.el ?? (e.who !== undefined ? fighters[e.who]?.el : 'neutral'))
        if (
          (e.kind === 'burst' || e.kind === 'zoneHit') &&
          e.x !== undefined &&
          e.y !== undefined
        ) {
          ctx.globalAlpha = a
          ctx.fillStyle = `${c}33`
          ctx.strokeStyle = c
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.arc(e.x / S, e.y / S, (e.r ?? 0) * (0.6 + age * 0.8), 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
          ctx.globalAlpha = 1
        } else if (e.kind === 'beam' && e.x !== undefined && e.y !== undefined) {
          ctx.globalAlpha = a
          ctx.strokeStyle = c
          ctx.lineCap = 'round'
          ctx.lineWidth = (e.w ?? 20) * 1.2 * a + 2
          ctx.beginPath()
          ctx.moveTo(e.x / S, e.y / S)
          ctx.lineTo((e.x2 ?? e.x) / S, (e.y2 ?? e.y) / S)
          ctx.stroke()
          ctx.lineCap = 'butt'
          ctx.globalAlpha = 1
        }
      }
      for (const p of f0.p) {
        const [x, y, , el] = p as [number, number, number, string]
        ctx.fillStyle = colorOf(el)
        ctx.beginPath()
        ctx.arc(x / S, y / S, 8, 0, Math.PI * 2)
        ctx.fill()
      }

      fighters.forEach((info, idx) => {
        const a = f0.f[idx]
        const b = f1.f[idx]
        const x = (a[0] + (b[0] - a[0]) * k) / S
        const y = (a[1] + (b[1] - a[1]) * k) / S
        const [, , hp, act, kind, actT, inv, face, shield, bits] = a
        const size = 44
        const ko = hp === 0
        const skill = kind >= 0 ? skills[info.skills[kind]] : undefined
        ctx.fillStyle = info.team === 0 ? 'rgba(73,220,255,.28)' : 'rgba(255,93,98,.28)'
        ctx.beginPath()
        ctx.ellipse(x, y + size * 0.45, size * 0.5, 7, 0, 0, Math.PI * 2)
        ctx.fill()
        if (act === 1 && !ko) {
          const total = skill?.wind ?? 7
          const prog = 1 - actT / total
          const c = skill
            ? colorOf(skill.el === 'neutral' ? info.el : skill.el)
            : 'rgba(255,207,58,.9)'
          ctx.strokeStyle = c
          ctx.lineWidth = skill ? 3.5 : 2.5
          if (skill?.kind === 'burst') {
            const radius = skill.radius ?? 0
            ctx.setLineDash([6, 6])
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.stroke()
            ctx.setLineDash([])
            ctx.fillStyle = `${c}22`
            ctx.beginPath()
            ctx.arc(x, y, radius * prog, 0, Math.PI * 2)
            ctx.fill()
          } else {
            ctx.beginPath()
            ctx.arc(x, y, 18 + prog * 18, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
        if (shield > 0 && !ko) {
          ctx.strokeStyle = 'rgba(150,230,255,.85)'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(x, y, size * 0.7, 0, Math.PI * 2)
          ctx.stroke()
        }
        const bob = act === 0 && !ko && !reduceMotion ? Math.sin(now * 10 + idx) * 2 : 0
        ctx.save()
        ctx.translate(x, y + bob)
        ctx.scale(face, 1)
        if (ko) {
          ctx.globalAlpha = 0.4
          ctx.rotate(face * 1.2)
        } else if (inv && act !== 2) ctx.globalAlpha = 0.35
        ctx.font = `${size}px ${EMOJI_FONT}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(info.emoji, 0, 0)
        ctx.restore()
        ctx.globalAlpha = 1
        ctx.textBaseline = 'alphabetic'
        if (inv && act === 2) {
          ctx.strokeStyle = 'rgba(73,220,255,.7)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(x, y, size * 0.6, 0, Math.PI * 2)
          ctx.stroke()
        }
        if (!ko && bits) {
          ctx.font = `13px ${EMOJI_FONT}`
          ctx.textAlign = 'center'
          ctx.fillText(
            statusesFromBits(bits, statusOrder)
              .slice(0, 5)
              .map((id) => statuses[id].icon)
              .join(''),
            x,
            y - size * 0.62
          )
        }
      })

      for (const e of events) {
        const age = (tick - e.t) / ARENA_TICK
        if (age < 0 || age > 1.1) continue
        const rise = age * 34
        const alpha = Math.max(0, 1 - age / 1.1)
        const at = (i: number) => {
          const row = rowAt(e.t, i)
          return [row[0] / S, row[1] / S]
        }
        const ex = (e.x ?? 0) / S
        const ey = (e.y ?? 0) / S
        if (e.kind === 'hit') {
          drawText(
            String(e.dmg),
            ex,
            ey - 30 - rise,
            e.crit ? 26 : 19,
            e.crit ? '#ffcf3a' : '#ffffff',
            alpha
          )
          if (e.elem === 110) drawText('ได้เปรียบ!', ex, ey - 52 - rise, 13, '#ff9f6b', alpha)
          if (e.parried) drawText('ปัด!', ex, ey - 52 - rise, 14, '#49dcff', alpha)
        } else if (e.kind === 'dot') {
          drawText(
            String(e.dmg),
            ex + 16,
            ey - 20 - rise,
            15,
            e.st === 'burn' ? '#ff8a4c' : '#b6f27a',
            alpha
          )
        } else if (e.kind === 'heal' && e.amount) {
          drawText(`+${e.amount}`, ex, ey - 34 - rise, 20, '#4fd47c', alpha)
        } else if (e.kind === 'dodge') {
          drawText('หลบ!', ex, ey - 34 - rise, 18, '#49dcff', alpha)
        } else if (e.kind === 'skill') {
          drawText(`${e.skill}!`, ex, ey - 46 - rise * 0.4, 17, '#ffcf3a', alpha)
        } else if (e.kind === 'miss' && e.who !== undefined) {
          const [x, y] = at(e.who)
          drawText('พลาด', x, y - 34 - rise, 15, '#9c9ec9', alpha)
        } else if (
          (e.kind === 'status' || e.kind === 'resist' || e.kind === 'seize') &&
          e.who !== undefined
        ) {
          const [x, y] = at(e.who)
          const info = e.st ? statuses[e.st] : undefined
          const text =
            e.kind === 'status' ? (info?.label ?? '') : e.kind === 'resist' ? 'ต้านทาน' : 'ชะงัก!'
          const good = e.kind === 'resist' || info?.kind === 'buff'
          drawText(text, x, y + 40 + rise * 0.5, 13, good ? '#6fe08a' : '#ff8b8f', alpha)
        }
      }
      if (tick < ARENA_TICK * 1.2) {
        drawText(
          'FIGHT!',
          ARENA_W / 2,
          ARENA_H / 2 + 20,
          64,
          '#ffcf3a',
          Math.min(1, (ARENA_TICK * 1.2 - tick) / 8)
        )
      }
    }

    const frame = (time: number) => {
      const dt = lastTime ? Math.min(0.1, (time - lastTime) / 1000) : 0
      lastTime = time
      tick = Math.min(lastTick, tick + dt * ARENA_TICK * speedRef.current)
      render()
      const shown = Math.floor(tick)
      if (shown - lastReported >= 2 || (tick >= lastTick && lastReported !== lastTick)) {
        lastReported = tick >= lastTick ? lastTick : shown
        onTickRef.current(lastReported)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', fit)
    }
  }, [replay, statuses, skills, statusOrder])

  return (
    <canvas
      ref={canvasRef}
      className="block aspect-[16/11] w-full max-w-full rounded-lg bg-[#13142a]"
      aria-label="สนามต่อสู้"
    />
  )
}
