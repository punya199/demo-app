// The game's whole UI: save data, level flow, menus, hints, input and the
// main loop. mountGemDiggers() runs it against the DOM that PageGemDiggers
// renders and returns a function that shuts everything down again.

import { appConfig } from '../../../config/app-config'
import './gem-diggers.css'
import type { BuiltLevel } from './endless'
import type { EndlessReply } from './endless-worker'
import { Game, GameEvent, MAX_SLOTS, buildBoard } from './game'
import { GEN_VERSION, TrayLayout } from './generator'
import type { HintReply, HintRequest } from './hint-worker'
import { LEVELS, LevelDef } from './levels'
import { MODES, MODE_INFO, MODE_NAMES, Mode, applyMode } from './modes'
import { ENDLESS_FROM, PROCGEN_VERSION } from './procgen'
import { Renderer, drawThumbnail } from './render'
import { setMuted, sfx } from './sfx'

// ---------- Save data (per browser) ----------

interface Progress {
  unlocked: number // highest playable level (1-based)
  stars: number[]
  deepest: number // deepest endless level reached (1-based level number)
}

interface Save extends Partial<Progress> {
  mode: Mode
  byMode: Partial<Record<Mode, Progress>> // each difficulty keeps its own progress
  slotBoosters: number
  muted: boolean
  seenHelp: boolean
  seenIntro: number[] // levels whose new-mechanic intro was shown
  seenModes: Mode[] // modes whose rules were explained
}

const SAVE_KEY = 'gem-diggers-save-v1'
// Testing: every level is playable from the level menu. Set to false to unlock levels one by one again.
const UNLOCK_ALL = true
export function mountGemDiggers(): () => void {
  let disposed = false // set once the page is left; late callbacks then do nothing
  const timers: number[] = []

  const save: Save = {
    mode: 'easy',
    byMode: {},
    slotBoosters: 3,
    muted: false,
    seenHelp: false,
    seenIntro: [],
    seenModes: ['easy'],
  }
  try {
    Object.assign(save, JSON.parse(localStorage.getItem(SAVE_KEY) ?? '{}'))
  } catch {
    // Private mode or corrupt data: start fresh.
  }
  // Saves from before difficulty modes kept progress at the top level: that was easy mode.
  if (save.unlocked && !save.byMode.easy) {
    save.byMode.easy = {
      unlocked: save.unlocked,
      stars: save.stars ?? [],
      deepest: save.deepest ?? ENDLESS_FROM,
    }
  }
  delete save.unlocked
  delete save.stars
  delete save.deepest

  /** Progress in the current mode. */
  function prog(): Progress {
    return (save.byMode[save.mode] ??= { unlocked: 1, stars: [], deepest: ENDLESS_FROM })
  }
  function persist() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save))
    } catch {
      // Ignore: progress just won't be remembered.
    }
  }
  setMuted(save.muted)

  // ---------- DOM ----------

  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
  const canvas = $<HTMLCanvasElement>('game')
  const stage = $('stage')
  const overlay = $('overlay')
  const panel = $('panel')
  const levelName = $('level-name')
  const progressFill = $('progress-fill')
  const btnSlot = $<HTMLButtonElement>('btn-slot')
  const slotCount = $('slot-count')
  const btnSpeed = $('btn-speed')
  const btnSound = $('btn-sound')

  // ---------- Game state ----------

  let levelIndex = Math.min(prog().unlocked, LEVELS.length) - 1
  // What is being played: a hand-made level (tray from trays.json) or an endless one (tray built in a worker).
  let current: { def: LevelDef; seed: number; layout?: TrayLayout } | null = null
  let currentMode: Mode = save.mode // the mode the level on screen was started in
  let game: Game | null = null
  let renderer: Renderer | null = null
  let speed = 1
  let usedBooster = false // boosters and hints cost the third star

  function showPanel(
    html: string,
    buttons: { label: string; primary?: boolean; disabled?: boolean; onClick: () => void }[] = []
  ) {
    panel.innerHTML = html
    if (buttons.length) {
      const row = document.createElement('div')
      row.className = 'actions'
      for (const b of buttons) {
        const el = document.createElement('button')
        el.textContent = b.label
        if (b.primary) el.className = 'primary'
        el.disabled = !!b.disabled
        el.onclick = b.onClick
        row.appendChild(el)
      }
      panel.appendChild(row)
    }
    overlay.hidden = false
  }

  function hidePanel() {
    overlay.hidden = true
  }

  // ---------- Endless levels ----------
  // Built in a worker (a few seconds each), kept in memory and in localStorage,
  // and the next one is built ahead while the current one is played.

  const isEndless = (index: number) => index + 1 >= ENDLESS_FROM
  const levelLabel = (index: number) =>
    isEndless(index) ? `ชั้น ${index + 1}` : `ด่าน ${index + 1}`
  // Endless levels differ per mode, so everything is keyed by "mode:n".
  const endlessId = (mode: Mode, n: number) => `${mode}:${n}`
  const endlessKey = (id: string) => `gem-diggers-endless-${GEN_VERSION}.${PROCGEN_VERSION}-${id}`
  const endlessBuilt = new Map<string, BuiltLevel>()
  const endlessWaiting = new Map<
    string,
    { resolve: (b: BuiltLevel) => void; reject: (e: Error) => void }[]
  >()
  let endlessWorker: Worker | null = null

  function onEndlessBuilt(reply: EndlessReply) {
    const id = endlessId(reply.mode, reply.n)
    const waiting = endlessWaiting.get(id) ?? []
    endlessWaiting.delete(id)
    if (!reply.built) {
      for (const w of waiting) w.reject(new Error(reply.error))
      return
    }
    endlessBuilt.set(id, reply.built)
    try {
      localStorage.setItem(endlessKey(id), JSON.stringify(reply.built))
    } catch {
      // Storage full or blocked: it just gets rebuilt next time.
    }
    for (const w of waiting) w.resolve(reply.built)
  }

  /** The endless level for level number n in a mode, building it if needed. */
  function endlessLevel(n: number, mode = save.mode): Promise<BuiltLevel> {
    const id = endlessId(mode, n)
    let built = endlessBuilt.get(id)
    if (!built) {
      try {
        const stored = localStorage.getItem(endlessKey(id))
        if (stored) endlessBuilt.set(id, (built = JSON.parse(stored) as BuiltLevel))
      } catch {
        // Unreadable: rebuild.
      }
    }
    if (built) return Promise.resolve(built)
    return new Promise((resolve, reject) => {
      const waiting = endlessWaiting.get(id)
      if (waiting) {
        waiting.push({ resolve, reject })
        return
      }
      endlessWaiting.set(id, [{ resolve, reject }])
      if (!endlessWorker) {
        endlessWorker = new Worker(new URL('./endless-worker.ts', import.meta.url), {
          type: 'module',
        })
        endlessWorker.onmessage = (e: MessageEvent<EndlessReply>) => onEndlessBuilt(e.data)
      }
      endlessWorker.postMessage({ n, mode })
    })
  }

  /** Start building the level after this one if it will be endless, so it is ready in time. */
  function prefetchNext(index: number) {
    if (isEndless(index + 1)) endlessLevel(index + 2).catch(() => {}) // a failure shows when it is played
  }

  let startToken = 0 // a newer startLevel call wins over one still waiting for its level

  async function startLevel(index: number) {
    const token = ++startToken
    levelIndex = index
    let next: { def: LevelDef; seed: number; layout?: TrayLayout }
    if (isEndless(index)) {
      showPanel(
        `<h2>⛏️ กำลังขุดเหมืองชั้น ${index + 1}…</h2><p>สร้างภาพใหม่และตรวจว่ามีทางชนะ อาจใช้เวลาสักครู่</p>`
      )
      let built: BuiltLevel
      try {
        built = await endlessLevel(index + 1)
      } catch (err) {
        if (token !== startToken) return
        // eslint-disable-next-line no-console
        console.error(err)
        showPanel(
          `<h2>สร้างชั้น ${index + 1} ไม่สำเร็จ 😵</h2><p>หาภาพที่มีทางชนะไม่เจอ ข้ามไปชั้นถัดไปได้</p>`,
          [
            { label: 'เลือกด่าน', onClick: showLevels },
            { label: 'ข้ามไปชั้นถัดไป ▶', primary: true, onClick: () => startLevel(index + 1) },
          ]
        )
        return
      }
      next = { def: built.def, seed: index + 1, layout: built.layout }
      prog().deepest = Math.max(prog().deepest, index + 1)
      persist()
    } else {
      showPanel(`<h2>⛏️ กำลังเตรียมเหมือง…</h2><p>ด่าน ${index + 1}: ${LEVELS[index].name}</p>`)
      next = { def: applyMode(LEVELS[index], save.mode), seed: index + 1 }
      // Let the panel paint before setting up the level.
      await new Promise((r) => setTimeout(r, 30))
    }
    if (token !== startToken || disposed) return
    current = next
    currentMode = save.mode
    game = new Game(next.def, next.seed, next.layout)
    usedBooster = false
    clearHint()
    toast.hidden = true
    if (!renderer) renderer = new Renderer(canvas, game)
    renderer.setGame(game)
    renderer.resize(stage.clientWidth, stage.clientHeight)
    hidePanel()
    updateHud()
    prefetchNext(index)
    if (!save.seenHelp) showHelp()
    else showIntro()
  }

  function updateHud() {
    if (!game) return
    const mode = save.mode === 'easy' ? '' : `[${MODE_NAMES[save.mode]}] `
    levelName.textContent = `${mode}${levelLabel(levelIndex)}: ${game.level.name}`
    slotCount.textContent = `×${save.slotBoosters}`
    btnSlot.disabled =
      save.slotBoosters <= 0 || game.slots.length >= MAX_SLOTS || game.status === 'won'
    btnSpeed.textContent = `${speed}x`
    btnSound.textContent = save.muted ? '🔇' : '🔊'
  }

  function spendSlotBooster(): boolean {
    if (!game || !renderer || save.slotBoosters <= 0) return false
    if (!game.addSlot()) return false
    save.slotBoosters--
    usedBooster = true
    clearHint()
    persist()
    renderer.layout()
    updateHud()
    return true
  }

  // ---------- Hints ----------
  // The search runs in a worker: it replays the player's actions to rebuild the
  // exact game, then looks for a winning line with the real rules.

  const toast = $('toast')
  let toastTimer = 0
  let hintWorker: Worker | null = null
  let hintId = 0 // bumped on every request and every move, so stale answers are dropped

  function showToast(text: string, ms = 3000) {
    toast.textContent = text
    toast.hidden = false
    clearTimeout(toastTimer)
    if (ms) toastTimer = window.setTimeout(() => (toast.hidden = true), ms)
  }

  function clearHint() {
    hintId++
    if (renderer) renderer.hint = []
  }

  function requestHint() {
    if (!game || !current || game.status !== 'playing' || !overlay.hidden) return
    if (!hintWorker) {
      hintWorker = new Worker(new URL('./hint-worker.ts', import.meta.url), { type: 'module' })
      hintWorker.onmessage = (e: MessageEvent<HintReply>) => showHint(e.data)
    }
    const req: HintRequest = { id: ++hintId, ...current, log: game.log, steps: game.steps }
    hintWorker.postMessage(req)
    usedBooster = true
    showToast('💡 กำลังคิด…', 0)
  }

  function showHint(reply: HintReply) {
    if (reply.id !== hintId || !game || !renderer) return
    if (!reply.line) {
      showToast('😵 จากตรงนี้ไม่มีทางชนะแล้ว ลองใช้ +1 ช่อง หรือเริ่มใหม่', 4500)
      return
    }
    if (!reply.line.length) {
      showToast('⏳ ไม่ต้องแตะเพิ่มแล้ว รอนักขุดทำงานให้เสร็จ')
      return
    }
    const cols = game.groupColumns(reply.line[0])
    renderer.hint = cols
    const wait = game.canTap(reply.line[0]) ? '' : ' (รอให้ช่องรอว่างก่อน)'
    showToast(
      `💡 แตะแถว ${cols.map((c) => c + 1).join(' + ')}${wait} · เหลืออีก ${reply.line.length} ครั้ง`,
      4500
    )
  }

  function thumbnail(def: LevelDef, ghost = false): HTMLCanvasElement {
    const { board, colors } = buildBoard(def)
    const c = document.createElement('canvas')
    drawThumbnail(c, board.cells, board.width, colors, ghost)
    return c
  }

  function starsHtml(n: number) {
    return [1, 2, 3].map((i) => (i <= n ? '★' : '<span class="off">★</span>')).join('')
  }

  function showWin() {
    if (!game) return
    const stars = usedBooster ? 2 : 3
    const p = prog()
    const first = !p.stars[levelIndex]
    p.stars[levelIndex] = Math.max(p.stars[levelIndex] ?? 0, stars)
    p.unlocked = Math.max(p.unlocked, levelIndex + 2)
    if (isEndless(levelIndex + 1)) p.deepest = Math.max(p.deepest, levelIndex + 2)
    let reward = ''
    if (stars === 3 && first) {
      save.slotBoosters++
      reward = '<p>🎁 ได้บูสเตอร์ +1 ช่อง เพิ่ม 1 อัน</p>'
    }
    persist()
    updateHud()
    const intoEndless = levelIndex + 2 === ENDLESS_FROM
    showPanel(
      `<h2>ขุดสำเร็จ! 🎉</h2><div class="stars">${starsHtml(stars)}</div>
     <div id="win-thumb"></div>
     <p>ได้ภาพ “${game.level.name}” เข้าคอลเลกชันแล้ว</p>${reward}
     ${intoEndless ? '<p>ผ่านครบทุกด่านแล้ว! ต่อจากนี้คือ <b>เหมืองไม่รู้จบ</b> ภาพใหม่ทุกชั้น ยิ่งลึกยิ่งยาก</p>' : ''}`,
      [
        { label: 'เล่นอีกครั้ง', onClick: () => startLevel(levelIndex) },
        {
          label: isEndless(levelIndex + 1) ? 'ชั้นต่อไป ▶' : 'ด่านต่อไป ▶',
          primary: true,
          onClick: () => startLevel(levelIndex + 1),
        },
      ]
    )
    const t = thumbnail(game.level)
    t.className = 'thumb'
    $('win-thumb').appendChild(t)
  }

  function showLose() {
    if (!game) return
    const canBoost = save.slotBoosters > 0 && game.slots.length < MAX_SLOTS
    showPanel(
      `<h2>ช่องรอเต็มแล้ว 😵</h2>
     <p>รถเหมืองทุกคันในช่องรอขุดต่อไม่ได้ เพราะอัญมณีสีนั้นยังถูกหินสีอื่นบังอยู่</p>
     <p>เคล็ดลับ: ขุดสีที่อยู่ข้างล่างก่อน และเก็บช่องว่างไว้อย่างน้อย 1 ช่อง</p>`,
      [
        { label: 'เริ่มใหม่', onClick: () => startLevel(levelIndex) },
        {
          label: `ใช้ +1 ช่อง (เหลือ ${save.slotBoosters})`,
          primary: true,
          disabled: !canBoost,
          onClick: () => {
            if (spendSlotBooster()) hidePanel()
          },
        },
      ]
    )
  }

  function showHelp() {
    save.seenHelp = true
    persist()
    showPanel(
      `<h2>⛏️ วิธีเล่น</h2>
     <ol class="help">
       <li>แตะ <b>รถเหมือง</b> คันหน้าสุดในถาดด้านล่าง รถจะวิ่งไปจอดใน <b>ช่องรอ</b> (มี 5 ช่อง)</li>
       <li>นักขุดสีเดียวกับรถจะเดินรอบภาพ ไปขุดอัญมณีสีนั้นที่ <b>เดินไปถึง</b> คือช่องที่อยู่ขอบภาพ หรือติดกับอุโมงค์ที่ขุดแล้ว</li>
       <li>ตัวเลขบนรถ = จำนวนที่ต้องขุด ครบแล้วรถออก ช่องว่างคืน</li>
       <li>รถที่มี <b>กรอบขาวกระพริบ</b> = แตะแล้วขุดได้ทันที</li>
       <li>🔗 รถพ่วงต้องไปพร้อมกัน · ❓ รถปริศนาเผยสีเมื่อขึ้นหน้าสุด · 🔒 ห้องลับเปิดเมื่อขุดสีกุญแจครบ · 🪨 หินขุดไม่ได้</li>
       <li>🧊 รถแช่แข็งรอรถอื่นเสร็จก่อน · 💎 อัญมณีหุ้มหินต้องขุด 2 ครั้ง · 🌑 เหมืองมืดเห็นสีเฉพาะช่องที่ขุดถึง</li>
       <li>ขุดภาพจนหมด = ชนะ · ช่องรอเต็มแล้วไม่มีใครขุดต่อได้ = แพ้</li>
     </ol>
     <p>เลือกความยาก ง่าย / กลาง / ยาก ได้ที่เมนู ☰ (ความคืบหน้าแยกกันแต่ละโหมด)</p>
     <p>💡 คำใบ้: บอกแถวที่ควรแตะต่อ (ใช้แล้วได้สูงสุด 2 ดาว)</p>
     <p>คีย์ลัด: 1–5 แตะถาด · H คำใบ้ · Space ความเร็ว · R เริ่มใหม่</p>`,
      [
        {
          label: 'เริ่มขุด!',
          primary: true,
          onClick: () => {
            hidePanel()
            showIntro()
          },
        },
      ]
    )
  }

  /** First time a level brings in a new mechanic (or a harder mode is tried), explain it. */
  function showIntro() {
    if (!save.seenModes.includes(save.mode)) {
      save.seenModes.push(save.mode)
      persist()
      showPanel(`<h2>โหมด${MODE_NAMES[save.mode]}</h2><p>${MODE_INFO[save.mode]}</p>`, [
        {
          label: 'เข้าใจแล้ว',
          primary: true,
          onClick: () => {
            hidePanel()
            showIntro()
          },
        },
      ])
      return
    }
    const intro = isEndless(levelIndex) ? undefined : LEVELS[levelIndex].intro
    if (!intro || save.seenIntro.includes(levelIndex)) return
    save.seenIntro.push(levelIndex)
    persist()
    showPanel(`<h2>ใหม่! ${intro.title}</h2><p>${intro.text}</p>`, [
      { label: 'เข้าใจแล้ว', primary: true, onClick: hidePanel },
    ])
  }

  function showLevels() {
    showPanel(
      `<h2>เลือกด่าน</h2><div class="mode-picker" id="mode-picker"></div><p class="mode-info">${MODE_INFO[save.mode]}</p><div class="level-grid" id="level-grid"></div>`,
      [
        // After switching modes, closing the menu restarts the level in the new mode.
        {
          label: 'ปิด',
          onClick: () => (game && currentMode === save.mode ? hidePanel() : startLevel(levelIndex)),
        },
      ]
    )
    const picker = $('mode-picker')
    for (const m of MODES) {
      const b = document.createElement('button')
      b.textContent = MODE_NAMES[m]
      b.className = m === save.mode ? 'primary' : ''
      b.onclick = () => {
        if (m === save.mode) return
        save.mode = m
        persist()
        showLevels()
      }
      picker.appendChild(b)
    }
    const grid = $('level-grid')
    LEVELS.forEach((lv, i) => {
      const card = document.createElement('button')
      card.className = 'level-card' + (i === levelIndex ? ' current' : '')
      const locked = !UNLOCK_ALL && i + 1 > prog().unlocked
      const stars = prog().stars[i] ?? 0
      if (locked) {
        card.innerHTML = '<div class="lock">🔒</div>'
        card.disabled = true
      } else {
        card.appendChild(thumbnail(lv, stars === 0))
      }
      const label = document.createElement('div')
      label.textContent = `${i + 1}. ${locked ? '???' : lv.name}`
      card.appendChild(label)
      const s = document.createElement('small')
      s.innerHTML = stars ? '★'.repeat(stars) : '&nbsp;'
      card.appendChild(s)
      card.onclick = () => startLevel(i)
      grid.appendChild(card)
    })
    // Endless mode: carry on from the deepest level reached.
    const endlessOpen = UNLOCK_ALL || prog().unlocked >= ENDLESS_FROM
    const card = document.createElement('button')
    card.className = 'level-card endless' + (isEndless(levelIndex) ? ' current' : '')
    card.innerHTML = `<div class="lock">${endlessOpen ? '♾️' : '🔒'}</div><div>เหมืองไม่รู้จบ</div><small>${
      endlessOpen ? `ชั้น ${prog().deepest}` : `ผ่านด่าน ${ENDLESS_FROM - 1} ก่อน`
    }</small>`
    card.disabled = !endlessOpen
    card.onclick = () => startLevel(prog().deepest - 1)
    grid.appendChild(card)
  }

  function handleEvent(ev: GameEvent) {
    renderer?.handle(ev)
    switch (ev.type) {
      case 'tap':
        clearHint()
        sfx.tap()
        break
      case 'denied':
        sfx.denied()
        break
      case 'crack':
        sfx.crack()
        break
      case 'unlock':
        sfx.unlock()
        break
      case 'dig':
        sfx.dig()
        break
      case 'cartDone':
        sfx.cartDone()
        break
      case 'won':
        sfx.win()
        timers.push(window.setTimeout(showWin, 700))
        break
      case 'lost':
        sfx.lose()
        timers.push(window.setTimeout(showLose, 500))
        break
    }
  }

  function tapColumn(col: number) {
    if (!game || !overlay.hidden) return
    game.tap(col)
  }

  // ---------- Input ----------

  const onPointer = (e: PointerEvent) => {
    if (!renderer) return
    const rect = canvas.getBoundingClientRect()
    const col = renderer.hitTray(e.clientX - rect.left, e.clientY - rect.top)
    if (col >= 0) tapColumn(col)
  }
  canvas.addEventListener('pointerdown', onPointer)

  const onKey = (e: KeyboardEvent) => {
    // Leave typing in other inputs alone.
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    if (e.key >= '1' && e.key <= '9') tapColumn(Number(e.key) - 1)
    else if (e.key === 'r' || e.key === 'R') startLevel(levelIndex)
    else if (e.key === 'h' || e.key === 'H') requestHint()
    else if (e.key === ' ') {
      e.preventDefault()
      btnSpeed.click()
    }
  }
  window.addEventListener('keydown', onKey)

  $('btn-levels').onclick = showLevels
  $('btn-restart').onclick = () => startLevel(levelIndex)
  $('btn-help').onclick = showHelp
  $('btn-hint').onclick = requestHint
  btnSlot.onclick = () => {
    if (!spendSlotBooster()) sfx.denied()
  }
  btnSpeed.onclick = () => {
    speed = speed === 1 ? 2 : 1
    updateHud()
  }
  btnSound.onclick = () => {
    save.muted = !save.muted
    setMuted(save.muted)
    persist()
    updateHud()
  }

  const resizer = new ResizeObserver(() => renderer?.resize(stage.clientWidth, stage.clientHeight))
  resizer.observe(stage)

  // ---------- Main loop ----------

  function tick(dt: number) {
    if (game && renderer) {
      // The game advances in fixed steps internally, so 2x speed plays out exactly like 1x.
      game.update(dt * speed)
      for (const ev of game.events.splice(0)) handleEvent(ev)
      renderer.draw(dt)
      const pct = 100 * (1 - game.gemsLeft / game.totalGems)
      progressFill.style.width = `${pct}%`
    }
  }

  let last = performance.now()
  let raf = 0
  function frame(now: number) {
    tick(Math.min(0.05, (now - last) / 1000))
    last = now
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  // Dev-only handle for poking at the game from the console.
  if (appConfig().VITE_IS_DEVELOPMENT) {
    Object.assign(window, {
      __gd: {
        get game() {
          return game
        },
        tap: tapColumn,
        start: startLevel,
        step(seconds: number) {
          for (let t = 0; t < seconds; t += 0.05) tick(0.05)
        },
      },
    })
  }

  startLevel(levelIndex)

  return () => {
    disposed = true
    cancelAnimationFrame(raf)
    window.removeEventListener('keydown', onKey)
    canvas.removeEventListener('pointerdown', onPointer)
    resizer.disconnect()
    timers.forEach((t) => clearTimeout(t))
    clearTimeout(toastTimer)
    hintWorker?.terminate()
    endlessWorker?.terminate()
    Reflect.deleteProperty(window, '__gd')
  }
}
