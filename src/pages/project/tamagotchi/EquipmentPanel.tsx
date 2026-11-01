import { Button, Card, Checkbox, Popconfirm, Segmented, Spin, Tag, Tooltip } from 'antd'
import { useState } from 'react'
import { EnhanceModal } from './EnhanceModal'
import { CompareLine, ItemLine } from './EquipmentParts'
import {
  BagFilterSlot,
  describeSetEffect,
  filterBag,
  describeSetTier,
  getEquipBlocker,
  isSetComplete,
  isSetTierActive,
  isWornBy,
  setPieceLabel,
  slotLabel,
} from './tamagotchi-helper'
import { EnumEquipmentSlot, IEquipmentItem, IMonsterData } from './tamagotchi-interface'
import { useDismantle, useEquip, useGetEquipment, useUnequip } from './tamagotchi-service'

interface IEquipmentPanelProps {
  monster: IMonsterData | null
  coin: number
  onError: (error: unknown) => void
}

export const EquipmentPanel = (props: IEquipmentPanelProps) => {
  const { monster, coin, onError } = props
  const { data, isLoading } = useGetEquipment()
  const { mutate: equip, isPending: isEquipping } = useEquip()
  const { mutate: unequip, isPending: isUnequipping } = useUnequip()
  const { mutate: dismantle, isPending: isDismantling } = useDismantle()
  const [enhancing, setEnhancing] = useState<IEquipmentItem | null>(null)
  const [bagSlot, setBagSlot] = useState<BagFilterSlot>('all')
  const [freeOnly, setFreeOnly] = useState(false)

  if (isLoading || !data) {
    return <Spin />
  }

  const blocker = getEquipBlocker(monster)
  const isBusy = isEquipping || isUnequipping || isDismantling
  const isWorn = (item: IEquipmentItem) => isWornBy(item, data.monsterId)
  const worn = new Map(data.items.filter(isWorn).map((item) => [item.slot, item]))
  const bag = data.items.filter((item) => !isWorn(item))
  const shownBag = filterBag(bag, { slot: bagSlot, freeOnly })
  const countIn = (slot: BagFilterSlot) => filterBag(bag, { slot, freeOnly }).length
  const petOf = (item: IEquipmentItem) => data.pets.find((pet) => pet.id === item.monsterId)
  const pet = data.pets.find((row) => row.id === data.monsterId)
  const setOf = (item: IEquipmentItem) => data.sets.find((set) => set.setId === item.setId)
  const wornSets = data.sets.filter((set) => set.worn > 0)

  return (
    <div className="flex w-full flex-col gap-3">
      {pet && (
        <div className="text-center text-sm text-slate-600 dark:text-slate-300">
          อุปกรณ์ของ {pet.emoji} {pet.name} (เปลี่ยนตัวที่แถบด้านบน แต่ละตัวมีชุดของตัวเอง
          ชิ้นหนึ่งใส่ได้ทีละตัว)
        </div>
      )}
      {data.stats && (
        <div className="text-center text-sm text-slate-600 dark:text-slate-300">
          ค่าพลังรวมอุปกรณ์: HP {data.stats.hp} · ATK {data.stats.atk} · DEF {data.stats.def} · SPD{' '}
          {data.stats.spd}
        </div>
      )}
      {describeSetEffect(data.activeEffects) && (
        <div className="text-center text-xs text-emerald-600">
          เอฟเฟกต์เซ็ต: {describeSetEffect(data.activeEffects)}
        </div>
      )}
      {wornSets.length > 0 && (
        <Card size="small" title="โบนัสเซ็ต" className="dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3">
            {wornSets.map((set) => (
              <div key={set.setId} className="flex flex-col gap-1">
                <div
                  className={`text-sm font-medium ${isSetComplete(set) ? 'text-emerald-600' : ''}`}
                >
                  {setPieceLabel(set)}
                </div>
                {set.tiers.map((tier) => (
                  <div
                    key={tier.pieces}
                    className={`text-xs ${
                      isSetTierActive(set, tier)
                        ? 'text-emerald-600'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isSetTierActive(set, tier) ? '✔' : '○'} {tier.pieces} ชิ้น:{' '}
                    {describeSetTier(tier)}
                  </div>
                ))}
                <div
                  className={`text-xs ${
                    set.isEnhanced ? 'text-emerald-600' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  ตีบวกทุกชิ้นที่ใส่ถึง +{data.enhance.threshold} ขึ้นไป โบนัสเปอร์เซ็นต์คูณ ×
                  {data.enhance.multiplier} · {set.isEnhanced ? 'ถึงแล้ว ✔' : 'ยังไม่ถึง'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 gap-2">
        {Object.values(EnumEquipmentSlot).map((slot) => {
          const item = worn.get(slot)
          return (
            <Card key={slot} size="small" className="dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm">{slotLabel[slot]}</span>
                {item ? (
                  <>
                    <ItemLine item={item} set={setOf(item)} />
                    <Button size="small" onClick={() => setEnhancing(item)}>
                      ตีบวก
                    </Button>
                    <Tooltip title={blocker}>
                      <Button
                        size="small"
                        disabled={!!blocker || isBusy}
                        onClick={() => unequip(slot, { onError })}
                      >
                        ถอด
                      </Button>
                    </Tooltip>
                  </>
                ) : (
                  <Button
                    type="link"
                    size="small"
                    className="!px-0"
                    onClick={() => setBagSlot(slot)}
                  >
                    ว่าง · เลือกจากกระเป๋า
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="font-semibold text-slate-900 dark:text-slate-100">กระเป๋าอุปกรณ์</span>
        <span className="text-xs text-slate-500">
          {data.items.length}/{data.capacity}
        </span>
      </div>
      <div className="overflow-x-auto">
        <Segmented<BagFilterSlot>
          value={bagSlot}
          onChange={setBagSlot}
          options={[
            { value: 'all', label: `ทั้งหมด (${countIn('all')})` },
            ...Object.values(EnumEquipmentSlot).map((slot) => ({
              value: slot,
              label: `${slotLabel[slot]} (${countIn(slot)})`,
            })),
          ]}
        />
      </div>
      <Checkbox checked={freeOnly} onChange={(event) => setFreeOnly(event.target.checked)}>
        เฉพาะชิ้นที่ยังไม่มีใครใส่
      </Checkbox>
      {shownBag.length === 0 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {bag.length === 0
            ? 'ยังไม่มีอุปกรณ์ในกระเป๋า ซื้อกล่องสุ่มที่ร้านค้า หรือสู้ในผจญภัยเพื่อลุ้นดรอป'
            : 'ไม่มีอุปกรณ์ประเภทนี้'}
        </p>
      )}
      {shownBag.map((item) => (
        <Card key={item.id} size="small" className="dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">{slotLabel[item.slot]}</span>
            <ItemLine item={item} set={setOf(item)} />
            {petOf(item) && (
              <Tag color="purple">
                ใส่อยู่กับ {petOf(item)!.emoji} {petOf(item)!.name}
              </Tag>
            )}
            {petOf(item) ? (
              // One pet at a time: a piece another pet wears only moves on an explicit confirm.
              <Tooltip title={blocker}>
                <Popconfirm
                  title="ย้ายมาใส่ตัวนี้?"
                  description={`ถอดจาก ${petOf(item)!.name} แล้วใส่ให้ ${pet?.name ?? 'ตัวนี้'}`}
                  okText="ย้าย"
                  cancelText="ยกเลิก"
                  disabled={!!blocker || isBusy}
                  onConfirm={() => equip({ equipmentId: item.id, move: true }, { onError })}
                >
                  <Button size="small" disabled={!!blocker || isBusy}>
                    ย้ายมาใส่ตัวนี้
                  </Button>
                </Popconfirm>
              </Tooltip>
            ) : (
              <Tooltip title={blocker}>
                <Button
                  size="small"
                  type="primary"
                  disabled={!!blocker || isBusy}
                  onClick={() => equip({ equipmentId: item.id }, { onError })}
                >
                  สวม
                </Button>
              </Tooltip>
            )}
            <Button size="small" onClick={() => setEnhancing(item)}>
              ตีบวก
            </Button>
            <Popconfirm
              title="แยกชิ้นส่วนเป็นหินตีบวก?"
              description="อุปกรณ์ชิ้นนี้จะหายไป"
              okText="แยก"
              cancelText="ยกเลิก"
              onConfirm={() => dismantle(item.id, { onError })}
            >
              <Button size="small" danger disabled={isBusy || !!petOf(item)}>
                แยก
              </Button>
            </Popconfirm>
            <div className="basis-full">
              <CompareLine item={item} worn={worn.get(item.slot)} />
            </div>
          </div>
        </Card>
      ))}
      <EnhanceModal
        item={enhancing}
        coin={coin}
        onClose={() => setEnhancing(null)}
        onError={onError}
      />
    </div>
  )
}
