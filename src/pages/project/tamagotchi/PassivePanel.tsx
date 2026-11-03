import { Button, Input, Popconfirm, Spin } from 'antd'
import { PointerEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import {
  canAllocateAscendancyNode,
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
import { getNodeGlyph } from './passive-glyphs'
import { PassiveGlyph } from './passive-icons'
import { IPassiveNode, PassiveEffectKey } from './tamagotchi-interface'
import {
  useGetPassive,
  usePassiveAllocate,
  usePassiveDeallocate,
  usePassiveAllocateAscendancy,
  usePassiveDeallocateBranch,
  usePassivePickMastery,
  usePassiveResetAscendancy,
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
  ascend: '#c9a227',
}
const ARM_LABEL = {
  flame: 'เพลิง',
  tide: 'วารี',
  leaf: 'พฤกษ์',
  earth: 'ปฐพี',
  lightning: 'อสนี',
  spirit: 'วิญญาณ',
} as const
const KIND_LABEL = {
  small: 'โหนดเล็ก',
  notable: 'โหนดเด่น',
  key: 'คีย์สโตน',
  mastery: 'มาสเตอรี (เลือก 1 จาก 3)',
  ascend: 'เส้นทางสูงสุด',
}
const PATH_LABEL = { vanguard: 'แวนการ์ด', striker: 'สไตรเกอร์', warden: 'วอร์เดน' } as const

// The tree spans about +-520 around the hub and the ascendancy ring about +-640.
const FULL = 1400
const MIN_SCALE = 0.7
const MAX_SCALE = 5
const DRAG_PIXELS = 6
// A small node's glyph is this many units wide; it shows once that is at least this many pixels.
const GLYPH_UNITS = 12
const GLYPH_MIN_PX = 11

const hexagon = (r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const t = (i * Math.PI) / 3
    return `${(r * Math.cos(t)).toFixed(1)},${(r * Math.sin(t)).toFixed(1)}`
  }).join(' ')

const star = (r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 ? r * 0.45 : r
    const t = -Math.PI / 2 + (i * Math.PI) / 5
    return `${(radius * Math.cos(t)).toFixed(1)},${(radius * Math.sin(t)).toFixed(1)}`
  }).join(' ')

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const PassivePanel = (props: IPassivePanelProps) => {
  const { onError } = props
  const { data, isLoading } = useGetPassive()
  const { mutate: allocate, isPending: isAllocating } = usePassiveAllocate()
  const { mutate: deallocate, isPending: isDeallocating } = usePassiveDeallocate()
  const { mutate: deallocateBranch, isPending: isBranching } = usePassiveDeallocateBranch()
  const { mutate: respec, isPending: isRespeccing } = usePassiveRespec()
  const { mutate: pickMastery, isPending: isPicking } = usePassivePickMastery()
  const { mutate: allocateAscendancy, isPending: isAscending } = usePassiveAllocateAscendancy()
  const { mutate: resetAscendancy, isPending: isResetting } = usePassiveResetAscendancy()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 })
  const svgRef = useRef<SVGSVGElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  // Mouse hover: the node under the cursor and where, relative to the map box.
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef({ moved: 0, pinch: 0 })

  const nodes = useMemo(() => data?.nodes ?? [], [data])
  const allocated = useMemo(() => data?.allocated ?? [], [data])
  const owned = useMemo(() => new Set(allocated), [allocated])
  const ascendancyIds = useMemo(() => data?.ascendancy.nodeIds ?? [], [data])
  const ascOwned = useMemo(() => new Set(ascendancyIds), [ascendancyIds])
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

  const { points, respec: refunds, ascendancy, masteries } = data
  const isBusy =
    isAllocating ||
    isDeallocating ||
    isBranching ||
    isRespeccing ||
    isPicking ||
    isAscending ||
    isResetting
  const selected = byId.get(selectedId ?? PASSIVE_HUB)!
  const isOwned = (id: string) => id === PASSIVE_HUB || owned.has(id) || ascOwned.has(id)
  const totals = sumPassiveEffects(nodes, [...allocated, ...ascendancyIds], masteries)
  const size = FULL / view.scale
  const viewBox = `${view.x - size / 2} ${view.y - size / 2} ${size} ${size}`

  const isAscend = selected.kind === 'ascend'
  const canTake = isAscend
    ? canAllocateAscendancyNode(selected, ascendancy.path, ascendancyIds)
    : !owned.has(selected.id) && canAllocatePassive(nodes, allocated, selected.id)
  const poolLeft = isAscend ? ascendancy.points.left : points.left
  const canDrop = owned.has(selected.id) && canDeallocatePassive(nodes, allocated, selected.id)
  const branch = owned.has(selected.id) ? getPassiveBranch(nodes, allocated, selected.id) : []
  const branchCost = getBranchRespecCost(refunds, branch.length)
  const respecCost = getRespecCost(refunds, allocated.length)

  const pickHint = (() => {
    if (selected.id === PASSIVE_HUB) {
      return 'แตะโหนดเพื่อดูรายละเอียด แล้วกดปุ่มด้านล่างเพื่อเลือก'
    }
    if (ascOwned.has(selected.id)) {
      return 'เส้นทางสูงสุดถอนทีละโหนดไม่ได้ ใช้ปุ่มรีเซ็ตด้านล่าง'
    }
    if (owned.has(selected.id)) {
      return canDrop ? null : 'เอาโหนดนี้ออกเดี่ยวๆ ไม่ได้ เพราะโหนดอื่นต่อสายผ่านมัน ลองถอนทั้งสาย'
    }
    if (!canTake) {
      return isAscend
        ? 'เริ่มที่โหนดแรกของเส้นทาง แล้วต่อไปทีละโหนด (เลือกได้เส้นทางเดียว)'
        : 'ยังไม่ติดกับโหนดที่มี เลือกโหนดข้างเคียงก่อน'
    }
    if (poolLeft <= 0) {
      return isAscend
        ? 'แต้มเส้นทางสูงสุดหมดแล้ว ได้จากเรดระดับ Nightmare และล้มบอสโลก'
        : 'แต้มหมดแล้ว หาแต้มเพิ่มจาก Dex เรด ด่านผจญภัย บอสโลก และ PvP'
    }
    return null
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
      setHover(null)
      setView((v) => ({ ...v, x: v.x - dx * unit, y: v.y - dy * unit }))
    }
  }
  const onPointerUp = (event: PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(event.pointerId)
    gesture.current.pinch = 0
  }
  const trackHover = (event: PointerEvent<SVGGElement>, id: string) => {
    const rect = boxRef.current?.getBoundingClientRect()
    if (event.pointerType !== 'mouse' || !rect || event.buttons) {
      return
    }
    setHover({ id, x: event.clientX - rect.left, y: event.clientY - rect.top })
  }
  const hovered = hover ? byId.get(hover.id) : undefined
  const hoveredCanTake =
    !!hovered &&
    (hovered.kind === 'ascend'
      ? canAllocateAscendancyNode(hovered, ascendancy.path, ascendancyIds)
      : canAllocatePassive(nodes, allocated, hovered.id))
  const hoveredState = !hovered
    ? ''
    : isOwned(hovered.id)
      ? 'มีแล้ว'
      : hoveredCanTake
        ? 'เลือกได้ (1 แต้ม)'
        : 'ยังไม่ติดกับโหนดที่มี'
  const zoomBy = (factor: number) =>
    setView((v) => ({ ...v, scale: clamp(v.scale * factor, MIN_SCALE, MAX_SCALE) }))
  const focus = (node: IPassiveNode) => {
    setSelectedId(node.id)
    setView((v) => ({ x: node.x, y: node.y, scale: Math.max(v.scale, 2) }))
  }

  // Frames show the kind at every zoom; the glyph inside only once it would be big enough to read
  // (about 11px on screen), so a zoomed-out tree stays light.
  const pxPerUnit = (svgRef.current?.clientWidth ?? 560) / size
  const showGlyphs = GLYPH_UNITS * pxPerUnit >= GLYPH_MIN_PX

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
    const glyph = showGlyphs ? getNodeGlyph(node, masteries[node.id]) : null
    const ink = on ? '#14121a' : reachable ? color : undefined
    const inkClass = on || reachable ? undefined : 'text-slate-400 dark:text-slate-600'
    const halo = reachable ? 15 : 0
    const draw = (frame: ReactNode, size: number) => (
      <>
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
              cx={10}
              cy={-10}
              r={5.5}
              className="fill-white dark:fill-slate-900"
              stroke={color}
            />
            <PassiveGlyph glyph={glyph.second} x={10} y={-10} size={7} stroke={color} />
          </>
        )}
        {glyph?.drawback && (
          <>
            <circle
              cx={14}
              cy={14}
              r={7}
              className="fill-white dark:fill-slate-900"
              stroke="#e5484d"
            />
            <PassiveGlyph glyph={glyph.drawback} x={14} y={14} size={9} stroke="#e5484d" />
          </>
        )}
      </>
    )
    if (node.kind === 'key') {
      return draw(<polygon points={hexagon(19)} {...common} />, 20)
    }
    if (node.kind === 'mastery') {
      return draw(<rect x={-12} y={-12} width={24} height={24} rx={7} {...common} />, 16)
    }
    if (node.kind === 'ascend') {
      return draw(<polygon points={star(15)} {...common} />, 12)
    }
    if (node.kind === 'notable') {
      return draw(
        <rect x={-10.5} y={-10.5} width={21} height={21} transform="rotate(45)" {...common} />,
        GLYPH_UNITS
      )
    }
    return draw(<circle r={10} {...common} />, GLYPH_UNITS)
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

      <div
        ref={boxRef}
        className="relative overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
      >
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
              const on = owned.has(node.id) || ascOwned.has(node.id)
              const reachable =
                !on &&
                (node.kind === 'ascend'
                  ? canAllocateAscendancyNode(node, ascendancy.path, ascendancyIds)
                  : canAllocatePassive(nodes, allocated, node.id))
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
                  onPointerEnter={(event) => trackHover(event, node.id)}
                  onPointerMove={(event) => trackHover(event, node.id)}
                  onPointerLeave={() => setHover(null)}
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

        {hover && hovered && (
          <div
            className="pointer-events-none absolute z-10 w-56 rounded-md border border-slate-300 bg-white/95 p-2 text-xs shadow-lg dark:border-slate-600 dark:bg-slate-900/95"
            style={{
              left: hover.x,
              top: hover.y,
              transform: `translate(${hover.x > (boxRef.current?.clientWidth ?? 0) / 2 ? 'calc(-100% - 14px)' : '14px'}, ${hover.y > (boxRef.current?.clientHeight ?? 0) * 0.55 ? 'calc(-100% - 14px)' : '14px'})`,
            }}
          >
            <div className="text-slate-500 dark:text-slate-400">
              {KIND_LABEL[hovered.kind]} · {hoveredState}
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {hovered.name}
            </div>
            <ul>
              {(Object.entries(hovered.fx) as [PassiveEffectKey, number][]).map(([key, value]) => (
                <li
                  key={key}
                  className={value < 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}
                >
                  {describePassiveEffect(key, value)}
                </li>
              ))}
            </ul>
            {hovered.options && (
              <ul className="mt-1 border-t border-slate-200 pt-1 dark:border-slate-700">
                {hovered.options.map((option, index) => (
                  <li
                    key={option.name}
                    className={
                      masteries[hovered.id] === index
                        ? 'font-semibold text-amber-600 dark:text-amber-400'
                        : 'text-slate-700 dark:text-slate-200'
                    }
                  >
                    {masteries[hovered.id] === index ? '✓ ' : '• '}
                    {option.name}:{' '}
                    {(Object.entries(option.fx) as [PassiveEffectKey, number][])
                      .map(([key, value]) => describePassiveEffect(key, value))
                      .join(', ')}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

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
          {(owned.has(selected.id) || ascOwned.has(selected.id)) && ' · มีแล้ว'}
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
        {selected.kind === 'mastery' && selected.options && (
          <div className="mt-2 flex flex-col gap-1">
            {selected.options.map((option, index) => {
              const picked = masteries[selected.id] === index
              return (
                <Button
                  key={option.name}
                  size="small"
                  type={picked ? 'primary' : 'default'}
                  disabled={!owned.has(selected.id) || picked || isBusy}
                  onClick={() => pickMastery({ nodeId: selected.id, option: index }, { onError })}
                >
                  <span className="font-medium">{option.name}</span>{' '}
                  <span className="text-xs">
                    {(Object.entries(option.fx) as [PassiveEffectKey, number][])
                      .map(([key, value]) => describePassiveEffect(key, value))
                      .join(', ')}
                  </span>
                </Button>
              )
            })}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {owned.has(selected.id)
                ? masteries[selected.id] === undefined
                  ? 'เลือกครั้งแรกฟรี'
                  : `เปลี่ยนตัวเลือกใช้ 💎 ${ascendancy.masteryRepickPrice}`
                : 'เลือกโหนดนี้ก่อน แล้วค่อยเลือกตัวเลือก'}
            </p>
          </div>
        )}
        {pickHint && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{pickHint}</p>}
        {selected.id !== PASSIVE_HUB && (
          <div className="mt-2 flex flex-wrap gap-2">
            {!owned.has(selected.id) && !ascOwned.has(selected.id) && (
              <Button
                type="primary"
                size="small"
                disabled={!canTake || poolLeft <= 0 || isBusy}
                onClick={() =>
                  isAscend
                    ? allocateAscendancy(selected.id, { onError })
                    : allocate(selected.id, { onError })
                }
              >
                เลือกโหนดนี้ (1 แต้ม{isAscend ? 'เส้นทางสูงสุด' : ''})
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

      <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">เส้นทางสูงสุด (วงนอกสุด)</div>
          <div className="text-slate-900 dark:text-slate-100">
            {ascendancy.path ? PATH_LABEL[ascendancy.path] : 'ยังไม่เลือกเส้นทาง'} · แต้ม{' '}
            {ascendancy.points.left} / {ascendancy.points.earned}
          </div>
        </div>
        <Popconfirm
          title="เริ่มเส้นทางสูงสุดใหม่?"
          description={`ใช้ 💎 ${ascendancy.resetCost}`}
          okText="รีเซ็ต"
          cancelText="ยกเลิก"
          onConfirm={() => resetAscendancy(undefined, { onError })}
        >
          <Button size="small" disabled={ascendancy.nodeIds.length === 0 || isBusy}>
            รีเซ็ต
          </Button>
        </Popconfirm>
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
