import { ArrowLeftOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BOSS_ROUND,
  ROUND_COUNT,
  SUMMON_COST,
  START_HP,
  createState,
  step,
  type SimInput,
  type SimState,
} from '../../../../td-sim/src'
import { appPath } from '../../../config/app-paths'
import { advance } from './clock'
import { keyAction, pointerToLogical } from './input'
import { canvasBackingSize, layoutFor, layoutMode, type LayoutMode } from './layout'
import { draw } from './render'
import { skillLabel, t, type Lang } from './strings'
import { TdEnergy } from './TdEnergy'
import { TdBattleNotice, type TdNet } from './TdBattleNotice'
import { battleErrorKind } from './td-battle'
import { useFinishTdBattle, useStartTdBattle } from './td-battle-query'

type Hud = Pick<SimState, 'gold' | 'hp' | 'round' | 'status' | 'offer'>

// "Tower Defense": canvas + rAF loop around the pure td-sim. React only renders
// the chrome; the sim state lives in a ref and is stepped at a fixed timestep.
const PageTowerDefense = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // The seed comes from the server (POST /td/battles); nothing steps until a battle has started.
  const stateRef = useRef<SimState>(createState(0))
  const battle = useRef<{ id: string; seed: number } | null>(null)
  const log = useRef<SimInput[]>([])
  const booted = useRef(false)
  const [net, setNet] = useState<TdNet>({ phase: 'starting' })
  const startBattle = useStartTdBattle().mutateAsync
  const finishBattle = useFinishTdBattle().mutateAsync
  const pending = useRef<SimInput[]>([])
  const paused = useRef(false)
  const speed = useRef(1)
  const selected = useRef(-1)
  const [hud, setHud] = useState<Hud>({
    gold: 0,
    hp: START_HP,
    round: 0,
    status: 'running',
    offer: [],
  })
  const [view, setView] = useState({ paused: false, fast: false })
  const [lang, setLang] = useState<Lang>('th')
  const [mode, setMode] = useState<LayoutMode>(() => layoutMode(window.innerWidth))
  const layout = useMemo(() => layoutFor(mode), [mode])
  const layoutRef = useRef(layout)
  layoutRef.current = layout

  // Layout mode follows the viewport width (rotation included).
  useEffect(() => {
    const onResize = () => setMode(layoutMode(window.innerWidth))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Keep the backing store sharp: CSS size x DPR (capped), re-run on any resize.
    const fit = () => {
      const size = canvasBackingSize(
        canvas.clientWidth || layout.view.width,
        layout.view,
        window.devicePixelRatio
      )
      canvas.width = size.width
      canvas.height = size.height
      ctx.setTransform(size.scale, 0, 0, size.scale, 0, 0)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(canvas)

    let raf = 0
    let last = performance.now()
    let acc = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const next = advance(acc, now - last, speed.current, paused.current || !battle.current)
      acc = next.acc
      last = now
      let s = stateRef.current
      for (let i = 0; i < next.ticks; i++) {
        const inputs = pending.current.splice(0)
        log.current.push(...inputs)
        s = step(s, inputs)
      }
      stateRef.current = s
      draw(ctx, s, layout, selected.current)
      setHud((h) =>
        h.gold === s.gold &&
        h.hp === s.hp &&
        h.round === s.round &&
        h.status === s.status &&
        h.offer === s.offer
          ? h
          : { gold: s.gold, hp: s.hp, round: s.round, status: s.status, offer: s.offer }
      )
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [layout])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (paused.current || !battle.current || stateRef.current.status !== 'running') return
    const l = layoutRef.current
    const { x, y } = pointerToLogical(
      e.clientX,
      e.clientY,
      e.currentTarget.getBoundingClientRect(),
      l.view
    )
    const tile = l.tileAt(x, y)
    if (tile < 0) return
    const tick = stateRef.current.tick
    const at = (t: number) => stateRef.current.gears.find((g) => g.tile === t)
    const from = selected.current
    const a = at(from)
    const b = at(tile)
    if (a && b && from !== tile && a.hero === b.hero && a.level === b.level) {
      pending.current.push({ tick, type: 'merge', from, to: tile })
      selected.current = -1
    } else if (b) {
      selected.current = tile === from ? -1 : tile
    } else {
      selected.current = -1
      pending.current.push({ tick, type: 'summon', tile })
    }
  }, [])

  const pick = useCallback((index: number) => {
    pending.current.push({ tick: stateRef.current.tick, type: 'pick', index })
  }, [])

  // Every battle, including the first and every restart, is started on the server and spends energy.
  const restart = useCallback(() => {
    battle.current = null
    pending.current = []
    log.current = []
    selected.current = -1
    setNet({ phase: 'starting' })
    startBattle()
      .then((b) => {
        stateRef.current = createState(b.seed, b.pool)
        battle.current = { id: b.battleId, seed: b.seed }
        setNet({ phase: 'ready' })
      })
      .catch((e) => setNet({ phase: 'start-error', kind: battleErrorKind(e) }))
  }, [startBattle])

  useEffect(() => {
    if (booted.current) return
    booted.current = true
    restart()
  }, [restart])

  // When the run ends, send the seed and the input log; the server replays it and pays the coins.
  useEffect(() => {
    const b = battle.current
    if (hud.status === 'running' || !b) return
    battle.current = null
    setNet({ phase: 'finishing' })
    finishBattle({
      battleId: b.id,
      seed: b.seed,
      ticks: stateRef.current.tick,
      inputs: log.current,
    })
      .then((r) => setNet({ phase: 'paid', coins: r.coins }))
      .catch(() => setNet({ phase: 'finish-error' }))
  }, [hud.status, finishBattle])
  const togglePause = useCallback(() => {
    paused.current = !paused.current
    setView((v) => ({ ...v, paused: paused.current }))
  }, [])
  const toggleSpeed = useCallback(() => {
    speed.current = speed.current === 1 ? 2 : 1
    setView((v) => ({ ...v, fast: speed.current === 2 }))
  }, [])
  const toggleLang = useCallback(() => setLang((l) => (l === 'th' ? 'en' : 'th')), [])

  // Desktop keyboard shortcuts; ignore when a button/link has focus so Space does not double-fire.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return
      if ((e.target as HTMLElement)?.closest('button, a, input, textarea')) return
      const action = keyAction(e.key)
      if (!action) return
      e.preventDefault()
      ;({ pause: togglePause, speed: toggleSpeed, restart, lang: toggleLang })[action]()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePause, toggleSpeed, restart, toggleLang])

  const btn =
    'rounded bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600 dark:bg-slate-800'
  return (
    <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col gap-3 overflow-x-hidden px-4 py-4 md:flex-row">
      {/* menu: left rail on desktop, bottom tab bar on phone (order-last) */}
      <nav
        aria-label={t(lang, 'menu')}
        className="order-last flex justify-around gap-2 md:order-first md:w-32 md:flex-col md:justify-start"
      >
        <Link
          to={appPath.games()}
          className="hidden items-center gap-2 text-slate-500 hover:text-blue-600 md:flex dark:text-slate-400 dark:hover:text-blue-400"
          aria-label={t(lang, 'back')}
        >
          <ArrowLeftOutlined className="text-lg" />
        </Link>
        <button className={btn} onClick={togglePause}>
          {view.paused ? t(lang, 'resume') : t(lang, 'pause')}
        </button>
        <button className={btn} onClick={toggleSpeed}>
          {view.fast ? '2x' : '1x'}
        </button>
        <button className={btn} onClick={restart}>
          {t(lang, 'restart')}
        </button>
        <button className={btn} onClick={toggleLang}>
          {t(lang, 'lang')}
        </button>
        <Link to={appPath.towerDefenseGacha()} className={`${btn} text-center`}>
          {t(lang, 'gacha')}
        </Link>
      </nav>
      <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
        <div className="flex w-full items-center justify-between">
          <Link
            to={appPath.games()}
            className="text-slate-500 hover:text-blue-600 md:hidden dark:text-slate-400 dark:hover:text-blue-400"
            aria-label={t(lang, 'back')}
          >
            <ArrowLeftOutlined className="text-lg" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t(lang, 'title')}</h1>
          <TdEnergy />
        </div>
        <div className="flex w-full justify-between text-sm font-semibold text-slate-900 dark:text-slate-100">
          <span>🪙 {hud.gold}</span>
          <span>
            {hud.round === BOSS_ROUND
              ? t(lang, 'boss')
              : t(lang, 'round', { n: hud.round + 1, total: ROUND_COUNT })}
          </span>
          <span>❤️ {hud.hp}</span>
        </div>
        <div className="relative w-full">
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            className="w-full touch-none rounded bg-slate-900"
            style={{ aspectRatio: `${layout.view.width} / ${layout.view.height}` }}
          />
          {hud.offer.length > 0 && hud.status === 'running' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded bg-black/70 p-4 text-white">
              <div className="text-xl font-bold">{t(lang, 'pickTitle')}</div>
              {hud.offer.map((id, i) => (
                <button key={id} className={`${btn} w-full max-w-xs`} onClick={() => pick(i)}>
                  {skillLabel(lang, id)}
                </button>
              ))}
            </div>
          )}
          {hud.status !== 'running' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded bg-black/70 text-white">
              <div className="text-2xl font-bold">
                {t(lang, hud.status === 'won' ? 'won' : 'lost')}
              </div>
              <button className={btn} onClick={restart}>
                {t(lang, 'playAgain')}
              </button>
            </div>
          )}
        </div>
        <TdBattleNotice net={net} lang={lang} onRetry={restart} />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t(lang, 'hint', { n: SUMMON_COST })}
        </p>
        <p className="hidden text-xs text-slate-500 md:block dark:text-slate-400">
          {t(lang, 'keys')}
        </p>
      </div>
    </div>
  )
}

export default PageTowerDefense
