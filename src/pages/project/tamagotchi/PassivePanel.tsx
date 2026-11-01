import { Button, Popconfirm, Spin } from 'antd'
import { useState } from 'react'
import {
  canAllocatePassive,
  canDeallocatePassive,
  describePassiveEffect,
  getRespecCost,
  PASSIVE_HUB,
  sumPassiveEffects,
} from './tamagotchi-helper'
import { IPassiveNode, PassiveEffectKey } from './tamagotchi-interface'
import {
  useGetPassive,
  usePassiveAllocate,
  usePassiveDeallocate,
  usePassiveRespec,
} from './tamagotchi-service'

interface IPassivePanelProps {
  onError: (error: unknown) => void
}

const ARM_COLOR: Record<IPassiveNode['arm'], string> = {
  flame: '#e0663c',
  tide: '#3b8fd1',
  leaf: '#5fae4e',
  bridge: '#c9a227',
}
const ARM_LABEL = { flame: 'เพลิง', tide: 'วารี', leaf: 'พฤกษ์' } as const
const RADIUS = { small: 9, notable: 14, key: 19 }
const KIND_LABEL = { small: 'โหนดเล็ก', notable: 'โหนดเด่น', key: 'คีย์สโตน' }

export const PassivePanel = (props: IPassivePanelProps) => {
  const { onError } = props
  const { data, isLoading } = useGetPassive()
  const { mutate: allocate, isPending: isAllocating } = usePassiveAllocate()
  const { mutate: deallocate, isPending: isDeallocating } = usePassiveDeallocate()
  const { mutate: respec, isPending: isRespeccing } = usePassiveRespec()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [message, setMessage] = useState('เริ่มจากจุดกลาง แล้วกดโหนดที่ติดกับจุดนั้น')

  if (isLoading || !data) {
    return <Spin />
  }

  const { nodes, allocated, points, respec: refunds } = data
  const owned = new Set(allocated)
  const isBusy = isAllocating || isDeallocating || isRespeccing
  const selected = nodes.find((node) => node.id === (selectedId ?? PASSIVE_HUB))!
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const edges = nodes.flatMap((node) =>
    node.adj.filter((id) => id > node.id).map((id) => [node, byId.get(id)!] as const)
  )
  const isOwned = (id: string) => id === PASSIVE_HUB || owned.has(id)
  const totals = sumPassiveEffects(nodes, allocated)

  const onNodeClick = (node: IPassiveNode) => {
    setSelectedId(node.id)
    if (isBusy) {
      return
    }
    if (owned.has(node.id)) {
      if (!canDeallocatePassive(nodes, allocated, node.id)) {
        setMessage(`เอา ${node.name} ออกไม่ได้ เพราะโหนดอื่นต่อสายผ่านมัน`)
        return
      }
      deallocate(node.id, { onError })
    } else if (!canAllocatePassive(nodes, allocated, node.id)) {
      setMessage('ยังไม่ติดกับโหนดที่มี เลือกโหนดข้างเคียงก่อน')
    } else if (points.left <= 0) {
      setMessage('แต้มหมดแล้ว หาแต้มเพิ่มจาก Dex เรด บอสโลก และซีซัน PvP')
    } else {
      allocate(node.id, { onError })
    }
  }

  const respecCost = getRespecCost(refunds, allocated.length)

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
        แต้มจาก Dex {points.sources.dexSpecies} · เรด {points.sources.raidFirstClears} · บอสโลก{' '}
        {points.sources.worldBossDefeats} · ซีซัน PvP {points.sources.pvpSeasons} (รวมแล้ว)
      </p>

      <div className="rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
        <svg
          viewBox="-380 -380 760 760"
          className="h-auto w-full"
          role="group"
          aria-label="ต้นไม้ความสามารถ"
        >
          {edges.map(([a, b]) => {
            const on = isOwned(a.id) && isOwned(b.id)
            return (
              <line
                key={`${a.id}-${b.id}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                strokeWidth={on ? 4 : 3}
                stroke={on ? ARM_COLOR[a.id === PASSIVE_HUB ? b.arm : a.arm] : undefined}
                className={on ? '' : 'stroke-slate-200 dark:stroke-slate-700'}
              />
            )
          })}
          {(['flame', 'tide', 'leaf'] as const).map((arm) => {
            const tip = byId.get(`${arm}-s4`)!
            const length = Math.hypot(tip.x, tip.y)
            return (
              <text
                key={arm}
                x={(tip.x / length) * 352}
                y={(tip.y / length) * 352 + 5}
                textAnchor="middle"
                fontSize={15}
                fontWeight={700}
                fill={ARM_COLOR[arm]}
              >
                {ARM_LABEL[arm]}
              </text>
            )
          })}
          <circle r={12} fill={ARM_COLOR.bridge} />
          {nodes
            .filter((node) => node.id !== PASSIVE_HUB)
            .map((node) => {
              const on = owned.has(node.id)
              const reachable = !on && canAllocatePassive(nodes, allocated, node.id)
              const color = ARM_COLOR[node.arm]
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x} ${node.y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={node.name}
                  aria-pressed={on}
                  className="cursor-pointer outline-none"
                  onMouseEnter={() => setSelectedId(node.id)}
                  onFocus={() => setSelectedId(node.id)}
                  onClick={() => onNodeClick(node)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onNodeClick(node)
                    }
                  }}
                >
                  {node.kind === 'key' && (
                    <circle r={RADIUS.key + 5} fill="none" stroke={color} opacity={0.55} />
                  )}
                  <circle
                    r={RADIUS[node.kind]}
                    strokeWidth={node.id === selected.id ? 4 : 2.5}
                    stroke={on || reachable ? color : undefined}
                    strokeDasharray={reachable ? '3 3' : undefined}
                    fill={on ? color : undefined}
                    className={`${on ? '' : 'fill-white dark:fill-slate-900'} ${on || reachable ? '' : 'stroke-slate-300 dark:stroke-slate-600'}`}
                  />
                </g>
              )
            })}
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
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{message}</p>
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
          ถอนฟรีอีก {refunds.freeLeft} แต้ม แล้วแต้มละ 💎 {refunds.gemPrice}
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
