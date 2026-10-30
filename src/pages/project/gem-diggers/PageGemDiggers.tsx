import { useEffect } from 'react'
import { mountGemDiggers } from './gem-diggers-app'

// "นักขุดอัญมณี" (Gem Diggers): a canvas puzzle game. React only renders the
// fixed skeleton below; the game itself (gem-diggers-app.ts) drives it directly
// and is torn down when the page is left.
const PageGemDiggers = () => {
  useEffect(() => mountGemDiggers(), [])

  return (
    <div className="gem-diggers">
      <div id="app">
        <header id="hud">
          <button id="btn-levels" className="icon" title="เลือกด่าน">
            ☰
          </button>
          <div id="title">
            <div id="level-name"></div>
            <div id="progress">
              <div id="progress-fill"></div>
            </div>
          </div>
          <button id="btn-speed" className="icon" title="ความเร็ว (Space)">
            1x
          </button>
        </header>
        <main id="stage">
          <canvas id="game"></canvas>
          <div id="toast" hidden></div>
        </main>
        <footer id="tools">
          <button id="btn-slot" title="เพิ่มช่องรอ 1 ช่อง">
            +1<span className="long"> ช่อง</span> <span id="slot-count"></span>
          </button>
          <button id="btn-hint" className="icon" title="คำใบ้ (H)">
            💡
          </button>
          <button id="btn-restart" className="icon" title="เริ่มด่านใหม่ (R)">
            ↻
          </button>
          <button id="btn-help" className="icon" title="วิธีเล่น">
            ?
          </button>
          <button id="btn-sound" className="icon" title="เปิด/ปิดเสียง">
            🔊
          </button>
        </footer>
        <div id="overlay" hidden>
          <div id="panel"></div>
        </div>
      </div>
    </div>
  )
}

export default PageGemDiggers
