import { ArrowLeftOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SUMMON_COST,
  START_HP,
  TICK_MS,
  createState,
  step,
  type SimInput,
  type SimState,
} from '../../../../td-sim/src'
import { appPath } from '../../../config/app-paths'
import { VIEW, tileAt } from './layout'
import { draw } from './render'

const MAX_DPR = 2
const newSeed = () => (Math.random() * 0x100000000) >>> 0

// "Tower Defense": canvas + rAF loop around the pure td-sim. React only renders
// the chrome; the sim state lives in a ref and is stepped at a fixed timestep.
const PageTowerDefense = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<SimState>(createState(newSeed()))
  const pending = useRef<SimInput[]>([])
  const paused = useRef(false)
  const speed = useRef(1)
  const [hud, setHud] = useState({ gold: 0, hp: START_HP, lost: false })
  const [view, setView] = useState({ paused: false, fast: false })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    canvas.width = VIEW.width * dpr
    canvas.height = VIEW.height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let raf = 0
    let last = performance.now()
    let acc = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      // cap the catch-up so a background tab does not fast-forward the run
      acc += Math.min(now - last, 250) * (paused.current ? 0 : speed.current)
      last = now
      let s = stateRef.current
      while (acc >= TICK_MS) {
        acc -= TICK_MS
        s = step(s, pending.current.splice(0))
      }
      stateRef.current = s
      draw(ctx, s)
      setHud((h) =>
        h.gold === s.gold && h.hp === s.hp && h.lost === (s.status === 'lost')
          ? h
          : { gold: s.gold, hp: s.hp, lost: s.status === 'lost' }
      )
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (paused.current || stateRef.current.status !== 'running') return
    const rect = e.currentTarget.getBoundingClientRect()
    const tile = tileAt(
      ((e.clientX - rect.left) / rect.width) * VIEW.width,
      ((e.clientY - rect.top) / rect.height) * VIEW.height
    )
    if (tile >= 0) pending.current.push({ tick: stateRef.current.tick, type: 'summon', tile })
  }, [])

  const restart = () => {
    stateRef.current = createState(newSeed())
    pending.current = []
  }
  const togglePause = () => {
    paused.current = !paused.current
    setView((v) => ({ ...v, paused: paused.current }))
  }
  const toggleSpeed = () => {
    speed.current = speed.current === 1 ? 2 : 1
    setView((v) => ({ ...v, fast: speed.current === 2 }))
  }

  const btn =
    'rounded bg-slate-700 px-3 py-1 text-sm text-white hover:bg-slate-600 dark:bg-slate-800'
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col items-center gap-3 px-4 py-6">
      <div className="flex w-full items-center justify-between">
        <Link
          to={appPath.games()}
          className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          aria-label="กลับหน้าเกม"
        >
          <ArrowLeftOutlined className="text-lg" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">ป้องกันฐาน</h1>
        <span className="w-4" />
      </div>
      <div className="flex w-full justify-between text-sm font-semibold text-slate-900 dark:text-slate-100">
        <span>🪙 {hud.gold}</span>
        <span>❤️ {hud.hp}</span>
      </div>
      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          className="w-full touch-none rounded bg-slate-900"
          style={{ aspectRatio: `${VIEW.width} / ${VIEW.height}` }}
        />
        {hud.lost && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded bg-black/70 text-white">
            <div className="text-2xl font-bold">ฐานแตก!</div>
            <button className={btn} onClick={restart}>
              เล่นใหม่
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        แตะช่องว่างเพื่อเรียกเฟือง ({SUMMON_COST} ทอง)
      </p>
      <div className="flex gap-2">
        <button className={btn} onClick={togglePause}>
          {view.paused ? 'เล่นต่อ' : 'พัก'}
        </button>
        <button className={btn} onClick={toggleSpeed}>
          {view.fast ? '2x' : '1x'}
        </button>
        <button className={btn} onClick={restart}>
          เริ่มใหม่
        </button>
      </div>
    </div>
  )
}

export default PageTowerDefense
