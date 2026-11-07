import { ReactNode } from 'react'
import { IPassiveNode } from '../core/tamagotchi-interface'
import { ARM_COLOR, GLYPH_UNITS, hexagon, star } from './passive-constants'
import { getNodeGlyph } from './passive-glyphs'
import { PassiveGlyph } from './passive-icons'

interface IPassiveNodeShapeProps {
  node: IPassiveNode
  on: boolean
  reachable: boolean
  picked: boolean
  found: boolean
  pending: 'add' | 'remove' | null
  showGlyphs: boolean
  mastery: number | undefined
}

export const PassiveNodeShape = (props: IPassiveNodeShapeProps) => {
  const { node, on, reachable, picked, found, pending, showGlyphs, mastery } = props
  const color = ARM_COLOR[node.arm]
  const common = {
    stroke: on || reachable ? color : undefined,
    strokeWidth: picked || found ? 4 : 2.5,
    strokeDasharray: reachable ? '3 3' : undefined,
    fill: on ? color : undefined,
    className: `${on ? '' : 'fill-white dark:fill-slate-900'} ${on || reachable ? '' : 'stroke-slate-300 dark:stroke-slate-600'}`,
  }
  const glyph = showGlyphs ? getNodeGlyph(node, mastery) : null
  const ink = on ? '#14121a' : reachable ? color : undefined
  const inkClass = on || reachable ? undefined : 'text-slate-400 dark:text-slate-600'
  const halo = reachable ? 17 : 0
  const draw = (frame: ReactNode, size: number) => (
    <>
      {pending && (
        <circle
          r={node.kind === 'key' ? 30 : 22}
          fill="none"
          stroke={pending === 'add' ? '#f5c542' : '#e5484d'}
          strokeWidth={3}
          strokeDasharray={pending === 'remove' ? '5 4' : undefined}
        />
      )}
      {halo > 0 && (
        <circle
          r={halo + (node.kind === 'key' ? 8 : 0)}
          fill={color}
          opacity={0.22}
          className="motion-safe:animate-pulse"
        />
      )}
      {frame}
      {glyph && <PassiveGlyph glyph={glyph.main} size={size} stroke={ink} className={inkClass} />}
      {glyph?.second && (
        <>
          <circle
            cx={12}
            cy={-12}
            r={6.5}
            className="fill-white dark:fill-slate-900"
            stroke={color}
          />
          <PassiveGlyph glyph={glyph.second} x={12} y={-12} size={8.5} stroke={color} />
        </>
      )}
      {glyph?.drawback && (
        <>
          <circle
            cx={17}
            cy={17}
            r={8}
            className="fill-white dark:fill-slate-900"
            stroke="#e5484d"
          />
          <PassiveGlyph glyph={glyph.drawback} x={17} y={17} size={10.5} stroke="#e5484d" />
        </>
      )}
    </>
  )
  if (node.kind === 'key') {
    return draw(<polygon points={hexagon(22)} {...common} />, 23)
  }
  if (node.kind === 'mastery') {
    return draw(<rect x={-14} y={-14} width={28} height={28} rx={8} {...common} />, 18)
  }
  if (node.kind === 'ascend') {
    return draw(<polygon points={star(18)} {...common} />, 14)
  }
  if (node.kind === 'notable') {
    return draw(
      <rect x={-12} y={-12} width={24} height={24} transform="rotate(45)" {...common} />,
      GLYPH_UNITS
    )
  }
  return draw(<circle r={12} {...common} />, GLYPH_UNITS)
}
