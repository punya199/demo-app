import { ReactNode } from 'react'
import { PassiveGlyphKey } from './passive-glyphs'

// Line glyphs for the passive tree, drawn on a 24px grid with a 2px stroke (stroke and colour come
// from the caller). One per effect, plus `mastery` (three pips) and `ascend` (crown).
const GLYPHS: Record<PassiveGlyphKey, ReactNode> = {
  atk: <path d="M8 12l8-8h4v4l-8 8M8 12l4 4M5 19l4-4M6 18l-1 1" />,
  hp: <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" />,
  def: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />,
  spd: <path d="M5 7l6 5-6 5M12 7l6 5-6 5" />,
  crit: (
    <>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 2v5M12 17v5M2 12h5M17 12h5" />
    </>
  ),
  critdmg: <path d="M12 3l2.2 5.3L20 9l-4.3 3.8L17 19l-5-3-5 3 1.3-6.2L4 9l5.8-.7z" />,
  shield: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M8 11a4 4 0 0 1 4-4" />
    </>
  ),
  regen: <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" />,
  dbl: <path d="M6 19L14 4M11 20L19 5" />,
  burn: <path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" />,
  hunger: <path d="M4 12h16a8 8 0 0 1-16 0zM9 8c0-2 2-2 2-4M14 8c0-2 2-2 2-4" />,
  expCoin: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M9.5 9.5c0-1.5 5-1.5 5 0s-5 1.5-5 3 5 1.5 5 0M12 7v10" />
    </>
  ),
  drop: <path d="M6 4h12l4 6-10 11L2 10zM2 10h20M9 4l-2 6 5 11 5-11-2-6" />,
  lifesteal: <path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" />,
  thorns: <path d="M4 19l3-11 3 7 2-11 2 11 3-7 3 11z" />,
  firstStrike: <path d="M13 2L5 14h6l-1 8 9-13h-6z" />,
  noCrit: (
    <>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l14 14" />
    </>
  ),
  mastery: (
    <>
      <circle cx="6" cy="14" r="2.2" />
      <circle cx="12" cy="9" r="2.2" />
      <circle cx="18" cy="14" r="2.2" />
    </>
  ),
  ascend: <path d="M3 18l2-10 5 5 2-8 2 8 5-5 2 10z" />,
}

interface IPassiveGlyphProps {
  glyph: PassiveGlyphKey
  // Centre, in the node's own coordinates, and the drawn size.
  x?: number
  y?: number
  size: number
  stroke?: string
  className?: string
}

export const PassiveGlyph = (props: IPassiveGlyphProps) => {
  const { glyph, x = 0, y = 0, size, stroke, className } = props
  return (
    <g
      transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})`}
      fill="none"
      stroke={stroke ?? 'currentColor'}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      pointerEvents="none"
    >
      {GLYPHS[glyph]}
    </g>
  )
}
