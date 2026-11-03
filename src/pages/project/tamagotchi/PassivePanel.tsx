import { Button, Input, Popconfirm, Spin } from 'antd'
import { PointerEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  canAllocatePassive,
  canDeallocatePassive,
  describePassiveEffect,
  getBranchRespecCost,
  getPassiveBranch,
  getRespecCost,
  PASSIVE_HUB,
  searchPassiveNodes,
  sumPassiveEffects,
} from './tamagotchi-helper'
import { IPassiveNode, PassiveEffectKey } from './tamagotchi-interface'
import {
  useGetPassive,
  usePassiveAllocate,
  usePassiveDeallocate,
  usePassiveDeallocateBranch,
  usePassiveRespec,
} from './tamagotchi-service'

interface IPassivePanelProps {
  onError: (error: unknown) => void
}

const ARM_COLOR: Record<IPassiveNode['arm'], string> = {
  flame: '#e0663c',
  tide: '#3b8fd1',
  leaf: '#5fae4e',
  earth: '#b08a4a',
  lightning: '#d9c52e',
  spirit: '#a56fe0',
  bridge: '#8d85a0',
}
const ARM_LABEL = {
  flame: 'เพลิง',
  tide: 'วารี',
  leaf: 'พฤกษ์',
  earth: 'ปฐพี',
  lightning: 'อสนี',
  spirit: 'วิญญาณ',
} as const
const KIND_LABEL = { small: 'โหนดเล็ก', notable: 'โหนดเด่น', key: 'คีย์สโตน' }

// The tree spans about +-520 around the hub; the view is a square window onto it.
const FULL = 1100
const MIN_SCALE = 0.7
const MAX_SCALE = 5
const DRAG_PIXELS = 6

const hexagon = (r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const t = (i * Math.PI) / 3
    return `${(r * Math.cos(t)).toFixed(1)},${(r * Math.sin(t)).toFixed(1)}`
  }).join(' ')

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const PassivePanel = (props: IPassivePanelProps) => {
  const { onError } = props
  const { data, isLoading } = useGetPassive()
  const { mutate: allocate, isPending: isAllocating } = usePassiveAllocate()
  const { mutate: deallocate, isPending: isDeallocating } = usePassiveDeallocate()
  const { mutate: deallocateBranch, isPending: isBranching } = usePassiveDeallocateBranch()
  const { mutate: respec, isPending: isRespeccing } = usePassiveRespec()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 })
  const svgRef = useRef<SVGSVGElement>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef({ moved: 0, pinch: 0 })

  const nodes = useMemo(() => data?.nodes ?? [], [data])
  const allocated = useMemo(() => data?.allocated ?? [], [data])
  const owned = useMemo(() => new Set(allocated), [allocated])
  const byId = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])
  const edges = useMemo(
    () =>
      nodes.flatMap((node) =>
        node.adj.filter((id) => id > node.id).map((id) => [node, byId.get(id)!] as const)
      ),
    [nodes, byId]
  )
  const matches = useMemo(() => searchPassiveNodes(nodes, query), [nodes, query])

  // Wheel zoom needs a non-passive listener to stop the page from scrolling.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) {
      return
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      setView((v) => ({
        ...v,
        scale: clamp(v.scale * (event.deltaY < 0 ? 1.15 : 0.87), MIN_SCALE, MAX_SCALE),
      }))
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [isLoading])

  if (isLoading || !data) {
    return <Spin />
  }

  const { points, respec: refunds } = data
  const isBusy = isAllocating || isDeallocating || isBranching || isRespeccing
  const selected = byId.get(selectedId ?? PASSIVE_HUB)!
  const isOwned = (id: string) => id === PASSIVE_HUB || owned.has(id)
  const totals = sumPassiveEffects(nodes, allocated)
  const size = FULL / view.scale
  const viewBox = `${view.x - size / 2} ${view.y - size / 2} ${size} ${size}`

  const canTake = !owned.has(selected.id) && canAllocatePassive(nodes, allocated, selected.id)
  const canDrop = owned.has(selected.id) && canDeallocatePassive(nodes, allocated, selected.id)
  const branch = owned.has(selected.id) ? getPassiveBranch(nodes, allocated, selected.id) : []
  const branchCost = getBranchRespecCost(refunds, branch.length)
  const respecCost = getRespecCost(refunds, allocated.length)

  const pickHint = (() => {
    if (selected.id === PASSIVE_HUB) {
      return 'แตะโหนดเพื่อดูรายละเอียด แล้วกดปุ่มด้านล่างเพื่อเลือก'
    }
    if (owned.has(selected.id)) {
      return canDrop ? null : 'เอาโหนดนี้ออกเดี่ยวๆ ไม่ได้ เพราะโหนดอื่นต่อสายผ่านมัน ลองถอนทั้งสาย'
    }
    if (!canTake) {
      return 'ยังไม่ติดกับโหนดที่มี เลือกโหนดข้างเคียงก่อน'
    }
    return points.left <= 0 ? 'แต้มหมดแล้ว หาแต้มเพิ่มจาก Dex เรด ด่านผจญภัย บอสโลก และ PvP' : null
  })()

  // Pan with one pointer, pinch with two; a press that barely moved still counts as a tap.
  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    gesture.current = { moved: 0, pinch: 0 }
  }
  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const last = pointers.current.get(event.pointerId)
    if (!last) {
      return
    }
    const rect = svgRef.current!.getBoundingClientRect()
    const unit = size / rect.width
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const all = [...pointers.current.values()]
    if (all.length >= 2) {
      const distance = Math.hypot(all[0].x - all[1].x, all[0].y - all[1].y)
      if (gesture.current.pinch) {
        const ratio = distance / gesture.current.pinch
        setView((v) => ({ ...v, scale: clamp(v.scale * ratio, MIN_SCALE, MAX_SCALE) }))
      }
      gesture.current.pinch = distance
      gesture.current.moved += DRAG_PIXELS
      return
    }
    const dx = event.clientX - last.x
    const dy = event.clientY - last.y
    gesture.current.moved += Math.abs(dx) + Math.abs(dy)
    if (gesture.current.moved > DRAG_PIXELS) {
      setView((v) => ({ ...v, x: v.x - dx * unit, y: v.y - dy * unit }))
    }
  }
  const onPointerUp = (event: PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(event.pointerId)
    gesture.current.pinch = 0
  }
  const zoomBy = (factor: number) =>
    setView((v) => ({ ...v, scale: clamp(v.scale * factor, MIN_SCALE, MAX_SCALE) }))
  const focus = (node: IPassiveNode) => {
    setSelectedId(node.id)
    setView((v) => ({ x: node.x, y: node.y, scale: Math.max(v.scale, 2) }))
  }

  const nodeShape = (
    node: IPassiveNode,
    on: boolean,
    reachable: boolean,
    picked: boolean,
    found: boolean
  ) => {
    const color = ARM_COLOR[node.arm]
    const common = {
      stroke: on || reachable ? color : undefined,
      strokeWidth: picked || found ? 4 : 2.5,
      strokeDasharray: reachable ? '3 3' : undefined,
      fill: on ? color : undefined,
      className: `${on ? '' : 'fill-white dark:fill-slate-900'} ${on || reachable ? '' : 'stroke-slate-300 dark:stroke-slate-600'}`,
    }
    if (node.kind === 'key') {
      return <polygon points={hexagon(17)} {...common} />
    }
    if (node.kind === 'notable') {
      return <rect x={-9} y={-9} width={18} height={18} transform="rotate(45)" {...common} />
    }
    return <circle r={8} {...common} />
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-slate-500 dark:text-slate-400">แต้มที่เหลือ</span>
        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {points.left}
          <span className="text-sm font-normal text-slate-500"> / {points.earned}</span>
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Dex {points.sources.dexSpecies} · เรด {points.sources.raidFirstClears} · ผจญภัย{' '}
        {points.sources.adventureClears} · ชนะสะสม {points.sources.totalWins} · บอสโลก{' '}
        {points.sources.worldBossDefeats} · ซีซัน PvP {points.sources.pvpSeasons}
      </p>

      <Input
        allowClear
        placeholder="ค้นหาโหนด เช่น ATK, คริติคอล, Deep Pool"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        suffix={query ? <span className="text-xs text-slate-500">{matches.size}</span> : null}
      />

      <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="h-[min(92vw,560px)] w-full cursor-grab touch-none select-none active:cursor-grabbing"
          role="group"
          aria-label="ต้นไม้ความสามารถ"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {edges.map(([a, b]) => {
            const on = isOwned(a.id) && isOwned(b.id)
            const arm = a.id === PASSIVE_HUB || a.arm === 'bridge' ? b.arm : a.arm
            return (
              <line
                key={`${a.id}-${b.id}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                strokeWidth={on ? 5 : 3}
                stroke={on ? ARM_COLOR[arm] : undefined}
                className={on ? '' : 'stroke-slate-200 dark:stroke-slate-800'}
              />
            )
          })}
          {(Object.keys(ARM_LABEL) as (keyof typeof ARM_LABEL)[]).map((arm) => {
            const tip = byId.get(`v2-${arm}-1-15`)
            if (!tip) {
              return null
            }
            const length = Math.hypot(tip.x, tip.y)
            return (
              <text
                key={arm}
                x={(tip.x / length) * (length + 46)}
                y={(tip.y / length) * (length + 46) + 6}
                textAnchor="middle"
                fontSize={20}
                fontWeight={700}
                fill={ARM_COLOR[arm]}
              >
                {ARM_LABEL[arm]}
              </text>
            )
          })}
          <circle r={14} fill={ARM_COLOR.bridge} />
          {nodes
            .filter((node) => node.id !== PASSIVE_HUB)
            .map((node) => {
              const on = owned.has(node.id)
              const reachable = !on && canAllocatePassive(nodes, allocated, node.id)
              const found = matches.has(node.id)
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x} ${node.y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={node.name}
                  aria-pressed={on}
                  className="cursor-pointer outline-none"
                  opacity={matches.size && !found ? 0.35 : 1}
                  onClick={() => gesture.current.moved <= DRAG_PIXELS && setSelectedId(node.id)}
                  onFocus={() => setSelectedId(node.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedId(node.id)
                    }
                  }}
                >
                  {found && <circle r={20} fill="none" stroke="#f5c542" strokeWidth={3} />}
                  {nodeShape(node, on, reachable, node.id === selected.id, found)}
                </g>
              )
            })}
        </svg>

        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Button size="small" aria-label="ขยาย" onClick={() => zoomBy(1.3)}>
            +
          </Button>
          <Button size="small" aria-label="ย่อ" onClick={() => zoomBy(1 / 1.3)}>
            −
          </Button>
          <Button
            size="small"
            aria-label="รีเซ็ตมุมมอง"
            onClick={() => setView({ x: 0, y: 0, scale: 1 })}
          >
            ⟲
          </Button>
        </div>

        <svg
          viewBox={`${-FULL / 2} ${-FULL / 2} ${FULL} ${FULL}`}
          className="absolute bottom-2 left-2 h-24 w-24 cursor-pointer rounded border border-slate-300 bg-white/80 dark:border-slate-600 dark:bg-slate-900/80"
          role="img"
          aria-label="แผนที่ย่อ"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect()
            setView((v) => ({
              ...v,
              x: ((event.clientX - rect.left) / rect.width - 0.5) * FULL,
              y: ((event.clientY - rect.top) / rect.height - 0.5) * FULL,
            }))
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
      </div>

      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {selected.id === PASSIVE_HUB ? 'จุดเริ่มต้น' : KIND_LABEL[selected.kind]}
          {owned.has(selected.id) && ' · มีแล้ว'}
        </div>
        <div className="font-semibold text-slate-900 dark:text-slate-100">
          {selected.id === PASSIVE_HUB ? 'จุดกลางของผู้ฝึก' : selected.name}
        </div>
        <ul className="mt-1 text-sm">
          {(Object.entries(selected.fx) as [PassiveEffectKey, number][]).map(([key, value]) => (
            <li
              key={key}
              className={value < 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}
            >
              {describePassiveEffect(key, value)}
            </li>
          ))}
        </ul>
        {pickHint && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{pickHint}</p>}
        {selected.id !== PASSIVE_HUB && (
          <div className="mt-2 flex flex-wrap gap-2">
            {!owned.has(selected.id) && (
              <Button
                type="primary"
                size="small"
                disabled={!canTake || points.left <= 0 || isBusy}
                onClick={() => allocate(selected.id, { onError })}
              >
                เลือกโหนดนี้ (1 แต้ม)
              </Button>
            )}
            {owned.has(selected.id) && (
              <Button
                size="small"
                disabled={!canDrop || isBusy}
                onClick={() => deallocate(selected.id, { onError })}
              >
                ถอนโหนดนี้
              </Button>
            )}
            {branch.length > 1 && (
              <Popconfirm
                title={`ถอนทั้งสาย ${branch.length} โหนด?`}
                description={branchCost > 0 ? `ใช้ 💎 ${branchCost}` : 'ไม่เสียเพชร'}
                okText="ถอน"
                cancelText="ยกเลิก"
                onConfirm={() => deallocateBranch(selected.id, { onError })}
              >
                <Button size="small" disabled={isBusy}>
                  ถอนทั้งสาย ({branch.length})
                </Button>
              </Popconfirm>
            )}
            <Button size="small" onClick={() => focus(selected)}>
              โฟกัส
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
        <div className="text-xs text-slate-500 dark:text-slate-400">โบนัสรวมที่ได้</div>
        {totals.length === 0 ? (
          <div className="text-sm text-slate-500">ยังไม่มี</div>
        ) : (
          <ul className="mt-1 text-sm">
            {totals.map(({ key, value }) => (
              <li
                key={key}
                className={value < 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}
              >
                {describePassiveEffect(key, value)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          ถอนฟรีอีก {refunds.freeLeft} แต้ม แล้วแต้มละ 💎 {refunds.gemPrice} (ทั้งสายสูงสุด 💎{' '}
          {refunds.branchCap})
        </span>
        <Popconfirm
          title="ถอนแต้มทั้งหมด?"
          description={respecCost > 0 ? `ใช้ 💎 ${respecCost}` : 'ไม่เสียเพชร'}
          okText="ถอน"
          cancelText="ยกเลิก"
          onConfirm={() => respec(undefined, { onError })}
        >
          <Button size="small" disabled={allocated.length === 0 || isBusy}>
            ถอนทั้งหมด
          </Button>
        </Popconfirm>
      </div>
    </div>
  )
}
