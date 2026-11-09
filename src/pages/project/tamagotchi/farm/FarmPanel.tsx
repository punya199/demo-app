import { Alert, Button, Card, Empty, Spin, Tag } from 'antd'
import { useEffect, useState } from 'react'
import {
  craftMaterialLabel,
  craftMaterialSource,
  formatBonus,
  formatCountdown,
  furnitureLabel,
  tierOf,
} from '../core/tamagotchi-helper'
import { EnumFurnitureKind, IFarmFurniture } from '../core/tamagotchi-interface'
import {
  useBuyFurniture,
  useClaimFurniture,
  useGetFarm,
  useGetMyMonster,
  useUpgradeFurniture,
} from '../core/tamagotchi-service'
import { FarmRoom } from './FarmRoom'

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

  if (isLoading || !farm) {
    return <Spin />
  }
  const living = (monsterData?.monsters ?? []).filter((monster) => !monster.diedAt)
  const tiers = {
    [EnumFurnitureKind.TABLE]: tierOf(farm, EnumFurnitureKind.TABLE),
    [EnumFurnitureKind.GYM]: tierOf(farm, EnumFurnitureKind.GYM),
    [EnumFurnitureKind.TOILET]: tierOf(farm, EnumFurnitureKind.TOILET),
    [EnumFurnitureKind.BED]: tierOf(farm, EnumFurnitureKind.BED),
  }
  const isBusy = isBuying || isUpgrading || isClaiming
  const { queue } = farm
  const isReady = !!queue && (queue.status === 'ready' || new Date(queue.finishAt) <= now)

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
            next.via === 'buy' ? buy(item.kind, { onError }) : upgrade(item.kind, { onError })
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
          <FarmRoom monsters={living} tiers={tiers} />
        ) : (
          <Empty description="ยังไม่มีสัตว์เลี้ยงในฟาร์ม" />
        )}
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          สัตว์ทุกตัวของคุณอยู่ในห้องนี้ ท่าทางตามความต้องการจริง: หิวไปกินที่โต๊ะ อ่อนแรงไปออกกำลัง
          ป่วยนอนที่เตียง ส่วนตัวที่ว่างจะเดินเล่น งีบ หรือเข้าห้องน้ำ
        </div>
      </Card>

      {queue && (
        <Card
          size="small"
          title="คราฟต์เฟอร์นิเจอร์"
          className="dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {furnitureLabel[queue.kind].name} → ระดับ {queue.toTier}
            </div>
            <div className="text-2xl font-semibold text-slate-900 tabular-nums dark:text-slate-100">
              {isReady ? 'เสร็จแล้ว' : formatCountdown(queue.finishAt, now)}
            </div>
            <Button
              size="small"
              type="primary"
              className="self-start"
              disabled={!isReady || isBusy}
              loading={isClaiming}
              onClick={() => claim(undefined, { onError })}
            >
              รับของ
            </Button>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              ระหว่างรอ ระดับเดิมยังใช้งานได้ตามปกติ
            </div>
          </div>
        </Card>
      )}
      {farm.queueBusy && (
        <Alert
          type="info"
          showIcon
          message="คิวคราฟต์ติดงานอุปกรณ์อยู่ รอให้รับของก่อนจึงจะอัปเกรดเฟอร์นิเจอร์ได้"
        />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {farm.furniture.map((item) => (
          <Card
            key={item.kind}
            size="small"
            className="dark:border-slate-700 dark:bg-slate-900"
            title={
              <span className="flex items-center gap-2">
                {furnitureLabel[item.kind].name}
                <Tag color={item.tier ? 'green' : 'default'}>
                  {item.tier ? `ระดับ ${item.tier}/3` : 'ยังไม่มี'}
                </Tag>
              </span>
            }
          >
            <div className="flex flex-col gap-2">
              <div className="text-sm text-slate-700 dark:text-slate-200">
                {furnitureLabel[item.kind].effect} ({furnitureLabel[item.kind].timer}){' '}
                <b>{formatBonus(item.bonus)}</b>
              </div>
              {renderUpgrade(item)}
            </div>
          </Card>
        ))}
      </div>

      <Alert
        type="info"
        showIcon
        message="เฟอร์นิเจอร์ใช้กับสัตว์ทุกตัว ทำงานตลอดแม้ปิดเกม และยืดเวลาที่ต้องดูแล ไม่ได้ทำให้ค่าเพิ่มทันที (ยังกดให้อาหารและเก็บอึได้เหมือนเดิม) สัตว์ที่อิ่มและแข็งแรงนานขึ้นก็สู้ได้ดีขึ้นเช่นกัน"
      />
    </div>
  )
}
