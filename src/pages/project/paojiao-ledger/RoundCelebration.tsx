import { CSSProperties, useEffect, useMemo } from 'react'
import { THB } from './ledger-format'
import { ledgerColor, ledgerFont } from './ledger-tokens'

const CONFETTI_COLORS = [ledgerColor.moneyIn, ledgerColor.accent, ledgerColor.darkSurface]
const PIECE_COUNT = 26
const VISIBLE_MS = 2200

interface ConfettiPiece {
  left: number // vw%
  delayMs: number
  durationMs: number
  color: string
  rotate: number
  drift: number // px, how far it sways sideways while falling
}

// Small, once-off burst - not a persistent decoration - celebrating a round that just closed in
// the black (profit > 0). Pure CSS keyframes, no animation library, matching how the rest of this
// module hand-rolls its few other animations (see PageLedgerSummary's fade-in).
export const RoundCelebration = ({
  profit,
  onDone,
}: {
  profit: number | null
  onDone: () => void
}) => {
  const pieces = useMemo<ConfettiPiece[]>(() => {
    if (profit === null) return []
    return Array.from({ length: PIECE_COUNT }, (_, i) => ({
      left: Math.random() * 100,
      delayMs: Math.random() * 220,
      durationMs: 1400 + Math.random() * 700,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 60,
    }))
  }, [profit])

  useEffect(() => {
    if (profit === null) return
    const t = setTimeout(onDone, VISIBLE_MS)
    return () => clearTimeout(t)
  }, [profit, onDone])

  if (profit === null) return null

  return (
    <div
      // pointerEvents: none - this sits over the whole page while it plays, but must never block
      // a click on whatever's underneath (e.g. the "บันทึกรายการ" button the user just pressed).
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes ledgerConfettiFall {
          from { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 1; }
          to { transform: translateY(110vh) translateX(var(--drift)) rotate(360deg); opacity: 0; }
        }
        @keyframes ledgerCelebrateBannerIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
          60% { opacity: 1; transform: translate(-50%, -50%) scale(1.04); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes ledgerCelebrateBannerOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>

      {pieces.map((p, i) => (
        <div
          key={i}
          style={
            {
              position: 'absolute',
              top: 0,
              left: `${p.left}%`,
              width: 8,
              height: 14,
              background: p.color,
              borderRadius: 2,
              '--drift': `${p.drift}px`,
              animation: `ledgerConfettiFall ${p.durationMs}ms ease-in ${p.delayMs}ms forwards`,
              transform: `rotate(${p.rotate}deg)`,
            } as CSSProperties
          }
        />
      ))}

      <div
        style={{
          position: 'absolute',
          top: '18%',
          left: '50%',
          background: ledgerColor.darkSurface,
          color: ledgerColor.cardSurface,
          borderRadius: 16,
          padding: '16px 26px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          boxShadow: '0 16px 40px rgba(26, 25, 23, 0.28)',
          animation: `ledgerCelebrateBannerIn 0.35s ease forwards, ledgerCelebrateBannerOut 0.3s ease ${
            VISIBLE_MS - 350
          }ms forwards`,
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 700 }}>ปิดรอบกำไร! 🎉</span>
        <span style={{ fontFamily: ledgerFont.mono, fontSize: 24, fontWeight: 600 }}>
          +{THB(profit)} บาท
        </span>
      </div>
    </div>
  )
}
