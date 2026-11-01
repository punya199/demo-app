import { Button, Card, Popconfirm, Spin, Tag, Tooltip } from 'antd'
import { useState } from 'react'
import { EnhanceModal } from './EnhanceModal'
import { CompareLine, ItemLine } from './EquipmentParts'
import { describeSetEffect, getEquipBlocker, isWornBy, slotLabel } from './tamagotchi-helper'
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

  if (isLoading || !data) {
    return <Spin />
  }

  const blocker = getEquipBlocker(monster)
  const isBusy = isEquipping || isUnequipping || isDismantling
  const isWorn = (item: IEquipmentItem) => isWornBy(item, data.monsterId)
  const worn = new Map(data.items.filter(isWorn).map((item) => [item.slot, item]))
  const bag = data.items.filter((item) => !isWorn(item))
  const petOf = (item: IEquipmentItem) => data.pets.find((pet) => pet.id === item.monsterId)
  const pet = data.pets.find((row) => row.id === data.monsterId)

  return (
    <div className="flex w-full flex-col gap-3">
      {pet && (
        <div className="text-center text-sm text-slate-600 dark:text-slate-300">
          อุปกรณ์ของ {pet.emoji} {pet.name} (เปลี่ยนตัวที่หน้าเลี้ยง แต่ละตัวมีชุดของตัวเอง)
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
      {data.setBonuses.length > 0 && (
        <div className="text-center text-xs text-emerald-600">
          โบนัสเซ็ต: {data.setBonuses.map((set) => `${set.name} (${set.pieces} ชิ้น)`).join(' · ')}
        </div>
      )}
      <div className="grid grid-cols-1 gap-2">
        {Object.values(EnumEquipmentSlot).map((slot) => {
          const item = worn.get(slot)
          return (
            <Card key={slot} size="small" className="dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <span className="w-24 text-sm">{slotLabel[slot]}</span>
                {item ? (
                  <>
                    <ItemLine item={item} />
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
                  <span className="flex-1 text-sm text-slate-400">ว่าง</span>
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
      {bag.length === 0 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          ยังไม่มีอุปกรณ์ในกระเป๋า ซื้อกล่องสุ่มที่ร้านค้า หรือสู้ในผจญภัยเพื่อลุ้นดรอป
        </p>
      )}
      {bag.map((item) => (
        <Card key={item.id} size="small" className="dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">{slotLabel[item.slot]}</span>
            <ItemLine item={item} />
            {petOf(item) && (
              <Tag color="purple">
                ใส่อยู่กับ {petOf(item)!.emoji} {petOf(item)!.name}
              </Tag>
            )}
            <Tooltip title={blocker}>
              <Popconfirm
                title="ย้ายมาใส่ตัวนี้?"
                description={`${petOf(item)?.name ?? 'ตัวเดิม'} จะเสียชิ้นนี้ไป`}
                okText="ย้าย"
                cancelText="ยกเลิก"
                disabled={!petOf(item)}
                onConfirm={() => equip(item.id, { onError })}
              >
                <Button
                  size="small"
                  type="primary"
                  disabled={!!blocker || isBusy}
                  onClick={() => !petOf(item) && equip(item.id, { onError })}
                >
                  สวม
                </Button>
              </Popconfirm>
            </Tooltip>
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
