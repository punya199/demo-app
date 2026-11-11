import { Button, Card, InputNumber, Popconfirm, Select, Spin, Tabs, Tag, Tooltip } from 'antd'
import { useState } from 'react'
import { lineOptions, stageLabel, toThaiErrorMessage } from '../core/tamagotchi-helper'
import {
  EnumMonsterLine,
  EnumMonsterStage,
  IMarketFilter,
  IMarketListing,
  IMarketSellablePet,
  MarketSort,
} from '../core/tamagotchi-interface'
import {
  useBuyListing,
  useCancelListing,
  useCreateListing,
  useGetMarket,
  useGetMyMarket,
  useGetWiki,
} from '../core/tamagotchi-service'

interface IMarketPanelProps {
  gem: number
  onError: (error: unknown) => void
}

const SORT_OPTIONS: { value: MarketSort; label: string }[] = [
  { value: 'newest', label: 'ใหม่สุด' },
  { value: 'price_asc', label: 'ราคาต่ำ → สูง' },
  { value: 'price_desc', label: 'ราคาสูง → ต่ำ' },
]

const hoursLeft = (expiresAt: string) =>
  Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 3_600_000))

const ListingCard = (props: { listing: IMarketListing; action: React.ReactNode }) => {
  const { listing, action } = props
  const { pet } = listing
  return (
    <Card size="small" className="dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{pet.emoji}</span>
        <div className="flex-1 text-sm">
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {pet.nickname ?? pet.name} <Tag>{stageLabel[pet.stage]}</Tag>
            {pet.potentialGrade && <Tag color="gold">{pet.potentialGrade}</Tag>}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            ชนะ {pet.wins} · แพ้ {pet.losses} · ผู้ขาย {listing.sellerName} · เหลือ{' '}
            {hoursLeft(listing.expiresAt)} ชม.
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-semibold text-sky-600 dark:text-sky-400">💎 {listing.price}</span>
          {action}
        </div>
      </div>
    </Card>
  )
}

const BrowseTab = (props: IMarketPanelProps) => {
  const { gem, onError } = props
  const [filter, setFilter] = useState<IMarketFilter>({ sort: 'newest' })
  const { data, isLoading } = useGetMarket(filter)
  const { mutate: buy, isPending } = useBuyListing()
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Select
          allowClear
          placeholder="ทุกธาตุ"
          className="min-w-32"
          value={filter.line}
          onChange={(line?: EnumMonsterLine) => setFilter({ ...filter, line })}
          options={lineOptions.map((option) => ({
            value: option.line,
            label: `${option.emoji} ${option.title}`,
          }))}
        />
        <Select
          allowClear
          placeholder="ทุกร่าง"
          className="min-w-32"
          value={filter.stage}
          onChange={(stage?: EnumMonsterStage) => setFilter({ ...filter, stage })}
          options={[
            EnumMonsterStage.PERFECT,
            EnumMonsterStage.ULTIMATE,
            EnumMonsterStage.FUSED,
          ].map((stage) => ({ value: stage, label: stageLabel[stage] }))}
        />
        <Select
          className="min-w-36"
          value={filter.sort}
          onChange={(sort: MarketSort) => setFilter({ ...filter, sort })}
          options={SORT_OPTIONS}
        />
      </div>
      {isLoading && <Spin />}
      {data?.listings.length === 0 && (
        <p className="py-6 text-center text-sm text-slate-500">ยังไม่มีมอนขายในตลาด</p>
      )}
      {data?.listings.map((listing) => (
        <ListingCard
          key={listing.listingId}
          listing={listing}
          action={
            listing.mine ? (
              <Tag>ของคุณ</Tag>
            ) : (
              <Popconfirm
                title={`ซื้อ ${listing.pet.nickname ?? listing.pet.name} ราคา 💎 ${listing.price}?`}
                okText="ซื้อ"
                cancelText="ยกเลิก"
                onConfirm={() => buy(listing.listingId, { onError })}
              >
                <Button size="small" type="primary" disabled={isPending || gem < listing.price}>
                  ซื้อ
                </Button>
              </Popconfirm>
            )
          }
        />
      ))}
    </div>
  )
}

const SellablePet = (props: { pet: IMarketSellablePet; onError: (error: unknown) => void }) => {
  const { pet, onError } = props
  const band = pet.priceBand
  const [price, setPrice] = useState<number | null>(pet.referenceValue)
  const { mutate: list, isPending } = useCreateListing()
  return (
    <Card size="small" className="dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-3xl">{pet.emoji}</span>
        <div className="flex-1 text-sm">
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {pet.nickname ?? pet.name} <Tag>{stageLabel[pet.stage]}</Tag>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {band
              ? `ราคาแนะนำ 💎 ${pet.referenceValue} (ตั้งได้ ${band.min}–${band.max})`
              : 'ยังขายไม่ได้'}
          </div>
        </div>
        {band && (
          <InputNumber
            size="small"
            min={band.min}
            max={band.max}
            value={price}
            onChange={setPrice}
          />
        )}
        <Tooltip title={pet.blocker ? toThaiErrorMessage(pet.blocker) : undefined}>
          <Button
            size="small"
            type="primary"
            disabled={!!pet.blocker || !price || isPending}
            onClick={() => price && list({ monsterId: pet.monsterId, price }, { onError })}
          >
            ลงขาย
          </Button>
        </Tooltip>
      </div>
    </Card>
  )
}

const SellTab = (props: Pick<IMarketPanelProps, 'onError'>) => {
  const { onError } = props
  const { data, isLoading } = useGetMyMarket()
  const { data: wiki } = useGetWiki()
  const { mutate: cancel, isPending } = useCancelListing()
  if (isLoading || !data) {
    return <Spin />
  }
  const fee = Math.round((wiki?.market.feeRate ?? 0.1) * 100)
  return (
    <div className="flex flex-col gap-2">
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        ประกาศ {data.listings.length}/{data.limits.maxActiveListings} · ค่าธรรมเนียมตอนขายได้ {fee}%
        · มอนที่ลงขายจะถูกหยุดเวลาและถอดอุปกรณ์ไว้จนกว่าจะขายหรือยกเลิก
      </p>
      {data.listings.map((listing) => (
        <ListingCard
          key={listing.listingId}
          listing={listing}
          action={
            <Button
              size="small"
              danger
              disabled={isPending}
              onClick={() => cancel(listing.listingId, { onError })}
            >
              ยกเลิก
            </Button>
          }
        />
      ))}
      {data.pets.map((pet) => (
        <SellablePet key={pet.monsterId} pet={pet} onError={onError} />
      ))}
      {data.history.length > 0 && (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          ประวัติล่าสุด:{' '}
          {data.history
            .map(
              (row) =>
                `${{ sold: 'ขายได้', cancelled: 'ยกเลิก', expired: 'หมดเวลา' }[row.status]} 💎 ${row.price}`
            )
            .join(' · ')}
        </div>
      )}
    </div>
  )
}

export const MarketPanel = (props: IMarketPanelProps) => (
  <Tabs
    items={[
      { key: 'browse', label: 'ซื้อมอน', children: <BrowseTab {...props} /> },
      { key: 'sell', label: 'ขายมอน', children: <SellTab onError={props.onError} /> },
    ]}
  />
)
