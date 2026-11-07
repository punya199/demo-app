import { IPassiveNode } from '../core/tamagotchi-interface'
import { ARM_COLOR, FULL } from './passive-constants'

interface IPassiveMinimapProps {
  nodes: IPassiveNode[]
  isOwned: (id: string) => boolean
  view: { x: number; y: number }
  size: number
  onPick: (x: number, y: number) => void
}

export const PassiveMinimap = (props: IPassiveMinimapProps) => {
  const { nodes, isOwned, view, size, onPick } = props
  return (
    <svg
      viewBox={`${-FULL / 2} ${-FULL / 2} ${FULL} ${FULL}`}
      className="absolute bottom-2 left-2 h-24 w-24 cursor-pointer rounded border border-slate-300 bg-white/80 dark:border-slate-600 dark:bg-slate-900/80"
      role="img"
      aria-label="แผนที่ย่อ"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        onPick(
          ((event.clientX - rect.left) / rect.width - 0.5) * FULL,
          ((event.clientY - rect.top) / rect.height - 0.5) * FULL
        )
      }}
    >
      {nodes.map((node) => (
        <circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r={isOwned(node.id) ? 11 : 7}
          fill={isOwned(node.id) ? ARM_COLOR[node.arm] : '#94a3b8'}
          opacity={isOwned(node.id) ? 1 : 0.5}
        />
      ))}
      <rect
        x={view.x - size / 2}
        y={view.y - size / 2}
        width={size}
        height={size}
        fill="none"
        stroke="#f5c542"
        strokeWidth={16}
      />
    </svg>
  )
}
