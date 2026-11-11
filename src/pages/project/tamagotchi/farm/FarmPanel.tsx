import { Alert, Button, Card, Drawer, Empty, Grid, Spin, Tag } from 'antd'
import { useEffect, useState } from 'react'
import {
  craftMaterialLabel,
  craftMaterialSource,
  formatBonus,
  formatCountdown,
  furnitureLabel,
} from '../core/tamagotchi-helper'
import { IFarmFurniture } from '../core/tamagotchi-interface'
import {
  useBuyFurniture,
  useClaimFurniture,
  useGetFarm,
  useGetMyMonster,
  useUpgradeFurniture,
} from '../core/tamagotchi-service'
import { FarmRoom } from './FarmRoom'
import { PieceKind, pieceStates } from './farm-room-layout'

interface IFarmPanelProps {
  onError: (error: unknown) => void
}

// Ticks every second while `active`, for the craft countdown.
const useNow = (active: boolean) => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [active])
  return now
}

const duration = (minutes: number) => (minutes >= 60 ? `${minutes / 60} ชม.` : `${minutes} นาที`)

export const FarmPanel = (props: IFarmPanelProps) => {
  const { onError } = props
  const { data: farm, isLoading } = useGetFarm()
  const { data: monsterData } = useGetMyMonster()
  const { mutate: buy, isPending: isBuying } = useBuyFurniture()
  const { mutate: upgrade, isPending: isUpgrading } = useUpgradeFurniture()
  const { mutate: claim, isPending: isClaiming } = useClaimFurniture()
  const now = useNow(farm?.queue?.status === 'running')
  const screens = Grid.useBreakpoint()
  const [selected, setSelected] = useState<PieceKind | null>(null)
  const [sparkle, setSparkle] = useState<{ kind: PieceKind; at: number } | null>(null)

  if (isLoading || !farm) {
    return <Spin />
  }
  const living = (monsterData?.monsters ?? []).filter((monster) => !monster.diedAt)
  const pieces = pieceStates(farm, now)
  const isBusy = isBuying || isUpgrading || isClaiming
  const { queue } = farm
  const close = () => setSelected(null)

  // A finished craft is claimed straight from the room; any other piece opens its drawer.
  const pick = (kind: PieceKind) => {
    if (pieces[kind].status === 'ready') {
      claim(undefined, { onError, onSuccess: () => setSparkle({ kind, at: Date.now() }) })
    } else {
      setSelected(kind)
    }
  }
  const item = farm.furniture.find((entry) => entry.kind === selected)

  const renderUpgrade = (item: IFarmFurniture) => {
    const next = item.next
    if (!next) {
      return <div className="text-xs text-emerald-600">ระดับสูงสุดแล้ว</div>
    }
    const lacksMaterial = next.materials.some((material) => material.owned < material.qty)
    return (
      <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
        <div>
          ระดับ {next.toTier}: {formatBonus(item.nextBonus ?? 0)}
          {next.via === 'buy'
            ? ' · ซื้อได้เลย'
            : ` · คราฟต์ ${duration(next.minutes)} (รอจนครบ ข้ามไม่ได้)`}
        </div>
        {next.materials.length > 0 && (
          <div className="flex flex-wrap gap-x-3">
            {next.materials.map((material) => (
              <span
                key={material.itemId}
                className={material.owned >= material.qty ? 'text-emerald-600' : 'text-rose-500'}
              >
                {craftMaterialLabel[material.itemId] ?? material.itemId} {material.owned}/
                {material.qty}
              </span>
            ))}
          </div>
        )}
        {queue && next.via === 'craft' && (
          <div>
            คิวคราฟต์เฟอร์นิเจอร์ติดงานอยู่ ต้องรับของที่คราฟต์อยู่ก่อนจึงจะเริ่มชิ้นต่อไปได้
          </div>
        )}
        {lacksMaterial && (
          <div>
            ขาด:{' '}
            {next.materials
              .filter((material) => material.owned < material.qty)
              .map(
                (material) =>
                  `${craftMaterialLabel[material.itemId] ?? material.itemId} ×${material.qty - material.owned} (${craftMaterialSource[material.itemId] ?? 'ดรอป'})`
              )
              .join(' · ')}
          </div>
        )}
        <Button
          size="small"
          type="primary"
          className="self-start"
          disabled={!next.canStart || isBusy}
          onClick={() =>
            next.via === 'buy'
              ? buy(item.kind, { onError, onSuccess: close })
              : upgrade(item.kind, { onError, onSuccess: close })
          }
        >
          {next.via === 'buy' ? `ซื้อ 🪙 ${next.coin}` : `เริ่มคราฟต์ 🪙 ${next.coin}`}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Card size="small" title="ฟาร์ม" className="dark:border-slate-700 dark:bg-slate-900">
        {living.length ? (
          <FarmRoom monsters={living} pieces={pieces} sparkle={sparkle} onPick={pick} />
        ) : (
          <Empty description="ยังไม่มีสัตว์เลี้ยงในฟาร์ม" />
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {farm.furniture.map((entry) => {
            const piece = pieces[entry.kind]
            return (
              <Button key={entry.kind} size="small" onClick={() => pick(entry.kind)}>
                {furnitureLabel[entry.kind].name} {piece.tier ? `${piece.tier}/3` : '+'}
                {piece.status === 'building' && ` ⚒ ${piece.label}`}
                {piece.status === 'ready' && ' ✓ รับของ'}
              </Button>
            )
          })}
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          แตะเฟอร์นิเจอร์ในห้องเพื่อซื้อหรืออัปเกรด สัตว์ทุกตัวของคุณอยู่ในห้องนี้
          ท่าทางตามความต้องการจริง: หิวไปกินที่โต๊ะ อ่อนแรงไปออกกำลัง ป่วยนอนที่เตียง
          ส่วนตัวที่ว่างจะเดินเล่น งีบ หรือเข้าห้องน้ำ
        </div>
      </Card>

      <Drawer
        open={!!item}
        onClose={close}
        placement={screens.md ? 'right' : 'bottom'}
        title={
          item && (
            <span className="flex items-center gap-2">
              {furnitureLabel[item.kind].name}
              <Tag color={item.tier ? 'green' : 'default'}>
                {item.tier ? `ระดับ ${item.tier}/3` : 'ยังไม่มี'}
              </Tag>
            </span>
          )
        }
      >
        {item && (
          <div className="flex flex-col gap-3">
            <div className="text-sm text-slate-700 dark:text-slate-200">
              {furnitureLabel[item.kind].effect} ({furnitureLabel[item.kind].timer}){' '}
              <b>{formatBonus(item.bonus)}</b>
            </div>
            {queue?.kind === item.kind ? (
              <div className="flex flex-col gap-1">
                <div className="text-sm">กำลังคราฟต์ → ระดับ {queue.toTier}</div>
                <div className="text-2xl font-semibold tabular-nums">
                  {formatCountdown(queue.finishAt, now)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  ระหว่างรอ ระดับเดิมยังใช้งานได้ตามปกติ
                </div>
              </div>
            ) : (
              renderUpgrade(item)
            )}
          </div>
        )}
      </Drawer>

      <Alert
        type="info"
        showIcon
        message="เฟอร์นิเจอร์ใช้กับสัตว์ทุกตัว ทำงานตลอดแม้ปิดเกม และยืดเวลาที่ต้องดูแล ไม่ได้ทำให้ค่าเพิ่มทันที (ยังกดให้อาหารและเก็บอึได้เหมือนเดิม) สัตว์ที่อิ่มและแข็งแรงนานขึ้นก็สู้ได้ดีขึ้นเช่นกัน คราฟต์เฟอร์นิเจอร์มีคิวของตัวเอง ทำพร้อมกับคราฟต์อุปกรณ์ได้"
      />
    </div>
  )
}
