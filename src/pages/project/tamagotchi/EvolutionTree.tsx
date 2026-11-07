import { useEffect, useRef } from 'react'
import {
  getTreeStates,
  ITreeLayout,
  ITreeProgress,
  TREE_STAGES,
  TreeEdgeState,
  TreeNodeState,
} from './evolution-tree'
import { stageLabel } from './tamagotchi-helper'

const NODE_W = 156
const NODE_H = 48
const COL_W = 184
const ROW_H = 76
const PAD = 12
const HEADER = 26
const MAX_NAME_CHARS = 10

// Thai combining marks (vowels above/below, tone marks) sit on the previous letter.
const isCombining = (char: string) => /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/.test(char)
const visibleLength = (text: string) => [...text].filter((char) => !isCombining(char)).length
const truncateVisible = (text: string, max: number) => {
  let count = 0
  let out = ''
  for (const char of text) {
    if (!isCombining(char)) {
      if (count === max) {
        break
      }
      count += 1
    }
    out += char
  }
  return out
}

const nodeClass: Record<TreeNodeState | 'plain', string> = {
  plain: 'fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-slate-600',
  done: 'fill-emerald-50 stroke-emerald-600 dark:fill-emerald-950 dark:stroke-emerald-500',
  current: 'fill-amber-50 stroke-amber-500 dark:fill-amber-950 dark:stroke-amber-400',
  next: 'fill-white stroke-amber-500 dark:fill-slate-900 dark:stroke-amber-400',
  'next-dead': 'fill-white stroke-red-500 dark:fill-slate-900 dark:stroke-red-400',
  skipped: 'fill-white stroke-slate-300 opacity-40 dark:fill-slate-900 dark:stroke-slate-600',
  future: 'fill-white stroke-slate-300 opacity-75 dark:fill-slate-900 dark:stroke-slate-600',
}

const edgeClass: Record<TreeEdgeState, string> = {
  idle: 'stroke-slate-300 dark:stroke-slate-600',
  done: 'stroke-emerald-600 dark:stroke-emerald-500',
  next: 'stroke-amber-500 dark:stroke-amber-400',
  'next-dead': 'stroke-red-500 dark:stroke-red-400',
}

interface IEvolutionTreeProps {
  layout: ITreeLayout
  // One monster's history; without it the tree is drawn plain (the guide).
  progress?: ITreeProgress | null
  selectedId?: string | null
  onSelect?: (speciesId: string) => void
  // Species ids already recorded in the Dex; those nodes get a 📖 badge.
  collected?: ReadonlySet<string>
}

export const EvolutionTree = (props: IEvolutionTreeProps) => {
  const { layout, progress = null, selectedId, onSelect, collected } = props
  const scrollRef = useRef<HTMLDivElement>(null)
  const { nodeStates, edgeStates, edgeKey } = getTreeStates(layout, progress)
  const width = PAD * 2 + (TREE_STAGES.length - 1) * COL_W + NODE_W
  const height = HEADER + (layout.rows - 1) * ROW_H + NODE_H + PAD
  const position = (id: string) => {
    const node = layout.nodes.find((entry) => entry.species.id === id)!
    return { x: PAD + node.column * COL_W, y: HEADER + node.row * ROW_H }
  }
  const currentId = progress?.path[progress.path.length - 1]

  // On a narrow screen, bring the monster's current form into view.
  useEffect(() => {
    const container = scrollRef.current
    if (!container || !currentId || !layout.nodes.some((node) => node.species.id === currentId)) {
      return
    }
    const { x } = position(currentId)
    container.scrollLeft = Math.max(0, x - container.clientWidth / 2 + NODE_W / 2)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, layout])

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950"
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="ต้นไม้วิวัฒนาการ"
        className="block"
      >
        {TREE_STAGES.map((stage, index) => (
          <text
            key={stage}
            x={PAD + index * COL_W + NODE_W / 2}
            y={16}
            textAnchor="middle"
            className="fill-slate-500 text-[11px] font-semibold dark:fill-slate-400"
          >
            {stageLabel[stage]}
          </text>
        ))}
        {layout.edges.map((edge) => {
          const from = position(edge.from)
          const to = position(edge.to)
          const x1 = from.x + NODE_W
          const y1 = from.y + NODE_H / 2
          const x2 = to.x
          const y2 = to.y + NODE_H / 2
          const mid = (x1 + x2) / 2
          const state = edgeStates.get(edgeKey(edge)) ?? 'idle'
          return (
            <path
              key={edgeKey(edge)}
              d={`M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`}
              fill="none"
              strokeWidth={state === 'done' ? 2.5 : state === 'idle' ? 1.5 : 2}
              strokeDasharray={state === 'next' || state === 'next-dead' ? '5 4' : undefined}
              className={edgeClass[state]}
            />
          )
        })}
        {layout.nodes.map((node) => {
          const { x, y } = position(node.species.id)
          const state = nodeStates.get(node.species.id) ?? 'plain'
          const isSelected = node.species.id === selectedId
          return (
            <g
              key={node.species.id}
              role={onSelect ? 'button' : undefined}
              tabIndex={onSelect ? 0 : undefined}
              aria-label={`${node.species.name} (${stageLabel[node.species.stage]})`}
              className={onSelect ? 'cursor-pointer outline-none' : undefined}
              onClick={() => onSelect?.(node.species.id)}
              onKeyDown={(event) => {
                if (onSelect && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault()
                  onSelect(node.species.id)
                }
              }}
            >
              <rect
                x={x}
                y={y}
                width={NODE_W}
                height={NODE_H}
                rx={10}
                strokeWidth={state === 'current' || isSelected ? 2.5 : 1.5}
                strokeDasharray={state === 'next' || state === 'next-dead' ? '5 4' : undefined}
                className={`${nodeClass[state]} ${isSelected ? '!stroke-sky-500' : ''}`}
              />
              <text x={x + 10} y={y + 31} className="text-lg">
                {node.species.emoji}
              </text>
              <text
                x={x + 38}
                y={y + 29}
                className="fill-slate-900 text-[12.5px] dark:fill-slate-100"
              >
                {/* Thai vowel and tone marks take no width, so count only base letters. */}
                {visibleLength(node.species.name) > MAX_NAME_CHARS
                  ? `${truncateVisible(node.species.name, MAX_NAME_CHARS)}…`
                  : node.species.name}
              </text>
              {collected?.has(node.species.id) && (
                <text x={x + NODE_W - 4} y={y + 13} textAnchor="end" className="text-[11px]">
                  <title>บันทึกในสมุดภาพแล้ว</title>
                  📖
                </text>
              )}
              {node.isDeadEnd && (
                <text
                  x={x + NODE_W - 6}
                  y={y + NODE_H - 6}
                  textAnchor="end"
                  className="fill-red-500 text-[10px]"
                >
                  ทางตัน
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export const TreeLegend = (props: { showCollected?: boolean }) => (
  <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
    <span>
      <span className="mr-1 inline-block h-3 w-3 rounded border-2 border-emerald-600 bg-emerald-50 align-[-2px]" />
      ผ่านมาแล้ว
    </span>
    <span>
      <span className="mr-1 inline-block h-3 w-3 rounded border-2 border-amber-500 bg-amber-50 align-[-2px]" />
      ร่างปัจจุบัน
    </span>
    <span>
      <span className="mr-1 inline-block h-3 w-3 rounded border-2 border-dashed border-amber-500 align-[-2px]" />
      ขั้นถัดไปที่เป็นไปได้
    </span>
    <span>
      <span className="mr-1 inline-block h-3 w-3 rounded border-2 border-dashed border-red-500 align-[-2px]" />
      ทางตัน (ไปร่างสูงสุดไม่ได้)
    </span>
    {props.showCollected && <span>📖 บันทึกในสมุดภาพแล้ว</span>}
  </div>
)
