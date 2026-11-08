import { Button, Input, Spin } from 'antd'
import { PointerEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  canAllocateAscendancyNode,
  canAllocatePassive,
  canDeallocatePassive,
  canDropAscendancyNode,
  diffPassiveDraft,
  getAscendancyPathOf,
  getPassiveBranch,
  getPassiveSaveCost,
  PASSIVE_HUB,
  searchPassiveNodes,
  sumPassiveEffects,
} from '../core/tamagotchi-helper'
import { IPassiveDraft, IPassiveNode } from '../core/tamagotchi-interface'
import { useGetPassive, usePassiveSave } from '../core/tamagotchi-service'
import { PassiveHoverCard } from './PassiveHoverCard'
import { PassiveAscendancyBar } from './PassiveAscendancyBar'
import { PassiveHeader } from './PassiveHeader'
import { PassiveMinimap } from './PassiveMinimap'
import { PassiveNodeShape } from './PassiveNodeShape'
import { PassiveSaveBar } from './PassiveSaveBar'
import { PassiveSelectedCard } from './PassiveSelectedCard'
import { PassiveTotals } from './PassiveTotals'
import {
  ARM_COLOR,
  ARM_LABEL,
  clamp,
  DRAG_PIXELS,
  FULL,
  GLYPH_MIN_PX,
  GLYPH_UNITS,
  MAX_SCALE,
  MIN_SCALE,
} from './passive-constants'

interface IPassivePanelProps {
  onError: (error: unknown) => void
}

interface IPassivePanelProps {
  onError: (error: unknown) => void
}

export const PassivePanel = (props: IPassivePanelProps) => {
  const { onError } = props
  const { data, isLoading } = useGetPassive()
  const { mutate: save, isPending: isSaving } = usePassiveSave()
  // The tree being edited. null = nothing changed, so what the server sent is what is shown.
  const [draft, setDraft] = useState<IPassiveDraft | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
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
  const saved = useMemo<IPassiveDraft>(
    () => ({
      nodeIds: data?.allocated ?? [],
      masteries: data?.masteries ?? {},
      ascendancyNodeIds: data?.ascendancy.nodeIds ?? [],
    }),
    [data]
  )
  const current = draft ?? saved
  const allocated = current.nodeIds
  const masteries = current.masteries
  const ascendancyIds = current.ascendancyNodeIds
  const owned = useMemo(() => new Set(allocated), [allocated])
  const ascOwned = useMemo(() => new Set(ascendancyIds), [ascendancyIds])
  const savedOwned = useMemo(() => new Set([...saved.nodeIds, ...saved.ascendancyNodeIds]), [saved])
  const ascendancyPath = getAscendancyPathOf(ascendancyIds)
  const byId = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])
  const edges = useMemo(
    () =>
      nodes.flatMap((node) =>
        node.adj.filter((id) => id > node.id).map((id) => [node, byId.get(id)!] as const)
      ),
    [nodes, byId]
  )
  const matches = useMemo(() => searchPassiveNodes(nodes, query), [nodes, query])

  // A new state from the server (after a save, or a refetch) replaces whatever was being edited.
  useEffect(() => {
    setDraft(null)
  }, [saved])

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

  const { points: savedPoints, respec: refunds, ascendancy } = data
  const points = {
    ...savedPoints,
    used: allocated.length,
    left: savedPoints.earned - allocated.length,
  }
  const ascPoints = {
    ...ascendancy.points,
    used: ascendancyIds.length,
    left: ascendancy.points.earned - ascendancyIds.length,
  }
  const selected = byId.get(selectedId ?? PASSIVE_HUB)!
  const isOwned = (id: string) => id === PASSIVE_HUB || owned.has(id) || ascOwned.has(id)
  const totals = sumPassiveEffects(nodes, [...allocated, ...ascendancyIds], masteries)
  const size = FULL / view.scale
  const viewBox = `${view.x - size / 2} ${view.y - size / 2} ${size} ${size}`

  const diff = diffPassiveDraft(saved, current)
  const cost = getPassiveSaveCost(saved, current, {
    respec: refunds,
    masteryRepick: ascendancy.masteryRepickPrice,
    ascendancyReset: ascendancy.resetPrice,
  })

  const isAscend = selected.kind === 'ascend'
  const canTake = isAscend
    ? canAllocateAscendancyNode(selected, ascendancyPath, ascendancyIds)
    : !owned.has(selected.id) && canAllocatePassive(nodes, allocated, selected.id)
  const poolLeft = isAscend ? ascPoints.left : points.left
  const canDrop = isAscend
    ? ascOwned.has(selected.id) && canDropAscendancyNode(nodes, ascendancyIds, selected.id)
    : owned.has(selected.id) && canDeallocatePassive(nodes, allocated, selected.id)
  const branch = owned.has(selected.id) ? getPassiveBranch(nodes, allocated, selected.id) : []

  const edit = (next: IPassiveDraft) => {
    setNotice(null)
    setDraft(next)
  }
  const withoutNodes = (ids: string[]): IPassiveDraft => {
    const gone = new Set(ids)
    return {
      ...current,
      nodeIds: allocated.filter((id) => !gone.has(id)),
      masteries: Object.fromEntries(Object.entries(masteries).filter(([id]) => !gone.has(id))),
    }
  }
  const whyNot = (node: IPassiveNode): string | null => {
    if (node.id === PASSIVE_HUB) {
      return null
    }
    if (node.kind === 'ascend') {
      if (ascOwned.has(node.id)) {
        return canDropAscendancyNode(nodes, ascendancyIds, node.id)
          ? null
          : 'ถอนโหนดนี้ไม่ได้ เพราะโหนดถัดไปต่อสายผ่านมัน ถอนจากปลายสายก่อน'
      }
      if (!canAllocateAscendancyNode(node, ascendancyPath, ascendancyIds)) {
        return 'เริ่มที่โหนดแรกของเส้นทาง แล้วต่อไปทีละโหนด (เลือกได้เส้นทางเดียว)'
      }
      return ascPoints.left > 0
        ? null
        : 'แต้มเส้นทางสูงสุดหมดแล้ว ได้จากเรดระดับ Nightmare และล้มบอสโลก'
    }
    if (owned.has(node.id)) {
      return canDeallocatePassive(nodes, allocated, node.id)
        ? null
        : 'เอาโหนดนี้ออกเดี่ยวๆ ไม่ได้ เพราะโหนดอื่นต่อสายผ่านมัน ลองถอนทั้งสาย'
    }
    if (!canAllocatePassive(nodes, allocated, node.id)) {
      return 'ยังไม่ติดกับโหนดที่มี เลือกโหนดข้างเคียงก่อน'
    }
    return points.left > 0 ? null : 'แต้มหมดแล้ว หาแต้มเพิ่มจาก Dex เรด ด่านผจญภัย บอสโลก และ PvP'
  }
  // Tapping a node takes it or drops it in the draft. Nothing is saved until Save.
  const toggleNode = (node: IPassiveNode) => {
    setSelectedId(node.id)
    if (node.id === PASSIVE_HUB) {
      return
    }
    const blocker = whyNot(node)
    if (blocker) {
      setNotice(blocker)
      return
    }
    if (node.kind === 'ascend') {
      edit({
        ...current,
        ascendancyNodeIds: ascOwned.has(node.id)
          ? ascendancyIds.filter((id) => id !== node.id)
          : [...ascendancyIds, node.id],
      })
    } else if (owned.has(node.id)) {
      edit(withoutNodes([node.id]))
    } else {
      edit({ ...current, nodeIds: [...allocated, node.id] })
    }
  }
  const pickHint = notice ?? whyNot(selected)

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
      ? canAllocateAscendancyNode(hovered, ascendancyPath, ascendancyIds)
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

  return (
    <div className="flex w-full flex-col gap-3">
      <PassiveHeader points={points} />

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
                x={(tip.x / length) * (length + 62)}
                y={(tip.y / length) * (length + 62) + 7}
                textAnchor="middle"
                fontSize={24}
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
                  ? canAllocateAscendancyNode(node, ascendancyPath, ascendancyIds)
                  : canAllocatePassive(nodes, allocated, node.id))
              const found = matches.has(node.id)
              const wasSaved = savedOwned.has(node.id)
              const pending = on === wasSaved ? null : on ? 'add' : 'remove'
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
                  onClick={() => gesture.current.moved <= DRAG_PIXELS && toggleNode(node)}
                  onFocus={() => setSelectedId(node.id)}
                  onPointerEnter={(event) => trackHover(event, node.id)}
                  onPointerMove={(event) => trackHover(event, node.id)}
                  onPointerLeave={() => setHover(null)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      toggleNode(node)
                    }
                  }}
                >
                  {found && <circle r={26} fill="none" stroke="#f5c542" strokeWidth={3} />}
                  <PassiveNodeShape
                    node={node}
                    on={on}
                    reachable={reachable}
                    picked={node.id === selected.id}
                    found={found}
                    pending={pending}
                    showGlyphs={showGlyphs}
                    mastery={masteries[node.id]}
                  />
                </g>
              )
            })}
        </svg>

        {hover && hovered && (
          <PassiveHoverCard
            hovered={hovered}
            hover={hover}
            box={boxRef.current}
            state={hoveredState}
            masteries={masteries}
          />
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

        <PassiveMinimap
          nodes={nodes}
          isOwned={isOwned}
          view={view}
          size={size}
          onPick={(x, y) => setView((v) => ({ ...v, x, y }))}
        />
      </div>

      <PassiveSelectedCard
        selected={selected}
        current={current}
        savedMasteries={saved.masteries}
        masteryRepickPrice={ascendancy.masteryRepickPrice}
        isOwned={isOwned(selected.id)}
        isAscend={isAscend}
        canTake={canTake}
        canDrop={canDrop}
        poolLeft={poolLeft}
        branch={branch}
        pickHint={pickHint}
        edit={edit}
        toggleNode={toggleNode}
        dropBranch={() => edit(withoutNodes(branch))}
        focus={focus}
      />

      <PassiveAscendancyBar
        path={ascendancyPath}
        points={ascPoints}
        canReset={ascendancyIds.length > 0}
        onReset={() => edit({ ...current, ascendancyNodeIds: [] })}
      />

      <PassiveTotals totals={totals} />

      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          ถอนฟรีอีก {refunds.freeLeft} แต้ม แล้วแต้มละ 💎 {refunds.gemPrice} · เปลี่ยนมาสเตอรี 💎{' '}
          {ascendancy.masteryRepickPrice} · เริ่มเส้นทางสูงสุดใหม่ 💎 {ascendancy.resetPrice}
        </span>
        <Button
          size="small"
          disabled={allocated.length === 0}
          onClick={() => edit({ ...current, nodeIds: [], masteries: {} })}
        >
          ถอนทั้งหมด
        </Button>
      </div>

      {diff.isDirty && (
        <PassiveSaveBar
          diff={diff}
          costTotal={cost.total}
          pointsLeft={points.left}
          isSaving={isSaving}
          onCancel={() => {
            setDraft(null)
            setNotice(null)
          }}
          onSave={() =>
            save({ nodeIds: allocated, masteries, ascendancyNodeIds: ascendancyIds }, { onError })
          }
        />
      )}
    </div>
  )
}
