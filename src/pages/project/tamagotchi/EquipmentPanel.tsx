import { Button, Card, Checkbox, Popconfirm, Segmented, Select, Spin, Tag, Tooltip } from 'antd'
import { useState } from 'react'
import { EnhanceModal } from './EnhanceModal'
import { RefineModal } from './RefineModal'
import { CompareLine, ItemLine, SetStatus } from './EquipmentParts'
import { MaterialsBag } from './MaterialsBag'
import {
  BAG_SET_ALL,
  BAG_SET_NONE,
  BagFilterSet,
  BagFilterSlot,
  countBagBySet,
  describeSetEffect,
  filterBag,
  getEquipBlocker,
  isWornBy,
  slotLabel,
} from './tamagotchi-helper'
import {
  EnumEquipmentGrade,
  EnumEquipmentSlot,
  IEquipmentItem,
  IMonsterData,
} from './tamagotchi-interface'
import {
  useDismantle,
  useDismantleMany,
  useEquip,
  useGetEquipment,
  useGetWiki,
  useUnequip,
} from './tamagotchi-service'

interface IEquipmentPanelProps {
  monster: IMonsterData | null
  coin: number
  onError: (error: unknown) => void
}

export const EquipmentPanel = (props: IEquipmentPanelProps) => {
  const { monster, coin, onError } = props
  const { data, isLoading } = useGetEquipment()
  const { data: wiki } = useGetWiki()
  const { mutate: equip, isPending: isEquipping } = useEquip()
  const { mutate: unequip, isPending: isUnequipping } = useUnequip()
  const { mutate: dismantle, isPending: isDismantling } = useDismantle()
  const { mutate: dismantleMany, isPending: isDismantlingMany } = useDismantleMany()
  const [selected, setSelected] = useState<string[] | null>(null)
  const [enhancing, setEnhancing] = useState<IEquipmentItem | null>(null)
  const [refiningId, setRefiningId] = useState<string | null>(null)
  const [bagSlot, setBagSlot] = useState<BagFilterSlot>('all')
  const [freeOnly, setFreeOnly] = useState(false)
  const [bagSet, setBagSet] = useState<BagFilterSet>(BAG_SET_ALL)
  const [bagTab, setBagTab] = useState<'gear' | 'materials'>('gear')

  if (isLoading || !data) {
    return <Spin />
  }

  const isBusy = isEquipping || isUnequipping || isDismantling || isDismantlingMany
  const isWorn = (item: IEquipmentItem) => isWornBy(item, data.monsterId)
  const worn = new Map(data.items.filter(isWorn).map((item) => [item.slot, item]))
  const bag = data.items.filter((item) => !isWorn(item))
  const shownBag = filterBag(bag, { slot: bagSlot, freeOnly, setId: bagSet })
  const countIn = (slot: BagFilterSlot) => filterBag(bag, { slot, freeOnly }).length
  const setCounts = countBagBySet(bag, { slot: bagSlot, freeOnly })
  const setOptions = [
    {
      value: BAG_SET_ALL,
      label: `ทุกเซ็ต (${Object.values(setCounts).reduce((a, b) => a + b, 0)})`,
    },
    ...Object.entries(wiki?.equipment.sets ?? {}).map(([setId, set]) => ({
      value: setId,
      label: `${set.name} (${setCounts[setId] ?? 0})`,
    })),
    { value: BAG_SET_NONE, label: `ไม่มีเซ็ต (${setCounts[BAG_SET_NONE] ?? 0})` },
  ]
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
              <SetStatus key={set.setId} set={set} enhance={data.enhance} />
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
                    {Object.keys(item.subStats).length > 0 && (
                      <Button size="small" onClick={() => setRefiningId(item.id)}>
                        รีไฟน์{item.pendingRefine ? ' (รอเลือก)' : ''}
                      </Button>
                    )}
                    <Tooltip title={getEquipBlocker(monster)}>
                      <Button
                        size="small"
                        disabled={!!getEquipBlocker(monster) || isBusy}
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

      <Segmented<'gear' | 'materials'>
        value={bagTab}
        onChange={setBagTab}
        options={[
          { value: 'gear', label: 'อุปกรณ์' },
          { value: 'materials', label: 'วัตถุดิบ' },
        ]}
      />
      {bagTab === 'materials' ? (
        <MaterialsBag onOpenGear={() => setBagTab('gear')} />
      ) : (
        <>
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
          <Select<BagFilterSet>
            value={bagSet}
            onChange={setBagSet}
            options={setOptions}
            className="w-full"
            showSearch
            optionFilterProp="label"
          />
          <Checkbox checked={freeOnly} onChange={(event) => setFreeOnly(event.target.checked)}>
            เฉพาะชิ้นที่ยังไม่มีใครใส่
          </Checkbox>
          {selected === null ? (
            <Button size="small" onClick={() => setSelected([])}>
              เลือกแยกหลายชิ้น
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="small"
                onClick={() =>
                  setSelected(shownBag.filter((item) => !petOf(item)).map((item) => item.id))
                }
              >
                เลือกทั้งหมดที่แสดง
              </Button>
              <Button size="small" onClick={() => setSelected([])}>
                ล้าง
              </Button>
              <Popconfirm
                title={`แยก ${selected.length} ชิ้นเป็นหินตีบวก?`}
                description={(() => {
                  const risky = data.items.filter(
                    (item) =>
                      selected.includes(item.id) &&
                      (item.grade === EnumEquipmentGrade.EPIC ||
                        item.grade === EnumEquipmentGrade.LEGENDARY ||
                        item.grade === EnumEquipmentGrade.MYTHIC ||
                        item.enhanceLevel > 0)
                  ).length
                  return risky > 0
                    ? `มีชิ้นเกรดสูงหรือตีบวกแล้ว ${risky} ชิ้น อุปกรณ์ทั้งหมดจะหายไป`
                    : 'อุปกรณ์ทั้งหมดจะหายไป'
                })()}
                okText="แยก"
                cancelText="ยกเลิก"
                disabled={selected.length === 0 || isBusy}
                onConfirm={() =>
                  dismantleMany(selected, { onError, onSuccess: () => setSelected(null) })
                }
              >
                <Button size="small" danger disabled={selected.length === 0 || isBusy}>
                  แยกที่เลือก ({selected.length})
                </Button>
              </Popconfirm>
              <Button size="small" type="link" onClick={() => setSelected(null)}>
                เสร็จสิ้น
              </Button>
            </div>
          )}
          {shownBag.length === 0 && (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {bag.length === 0
                ? 'ยังไม่มีอุปกรณ์ในกระเป๋า ซื้อกล่องสุ่มที่ร้านค้า หรือสู้ในผจญภัยเพื่อลุ้นดรอป'
                : 'ไม่มีอุปกรณ์ประเภทนี้'}
            </p>
          )}
          {shownBag.map((item) => {
            const blocker = getEquipBlocker(monster, item)
            return (
              <Card key={item.id} size="small" className="dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    {selected !== null && (
                      <Checkbox
                        className="mt-1"
                        checked={selected.includes(item.id)}
                        disabled={!!petOf(item) || isBusy}
                        onChange={(event) =>
                          setSelected(
                            event.target.checked
                              ? [...selected, item.id]
                              : selected.filter((id) => id !== item.id)
                          )
                        }
                      />
                    )}
                    <ItemLine item={item} set={setOf(item)} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {slotLabel[item.slot]}
                    </span>
                    {petOf(item) && (
                      <Tag color="purple" className="!m-0">
                        ใส่อยู่กับ {petOf(item)!.emoji} {petOf(item)!.name}
                      </Tag>
                    )}
                  </div>
                  <CompareLine item={item} worn={worn.get(item.slot)} />
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
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
                          <Button disabled={!!blocker || isBusy}>ย้ายมาใส่ตัวนี้</Button>
                        </Popconfirm>
                      </Tooltip>
                    ) : (
                      <Tooltip title={blocker}>
                        <Button
                          type="primary"
                          disabled={!!blocker || isBusy}
                          onClick={() => equip({ equipmentId: item.id }, { onError })}
                        >
                          สวม
                        </Button>
                      </Tooltip>
                    )}
                    <Button onClick={() => setEnhancing(item)}>ตีบวก</Button>
                    {Object.keys(item.subStats).length > 0 && (
                      <Button onClick={() => setRefiningId(item.id)}>
                        รีไฟน์{item.pendingRefine ? ' (รอเลือก)' : ''}
                      </Button>
                    )}
                    <Popconfirm
                      title="แยกชิ้นส่วนเป็นหินตีบวก?"
                      description="อุปกรณ์ชิ้นนี้จะหายไป"
                      okText="แยก"
                      cancelText="ยกเลิก"
                      onConfirm={() => dismantle(item.id, { onError })}
                    >
                      <Button danger disabled={isBusy || !!petOf(item)}>
                        แยก
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              </Card>
            )
          })}
        </>
      )}
      <RefineModal
        item={data.items.find((row) => row.id === refiningId) ?? null}
        coin={coin}
        onClose={() => setRefiningId(null)}
        onError={onError}
      />
      <EnhanceModal
        item={enhancing}
        coin={coin}
        onClose={() => setEnhancing(null)}
        onError={onError}
      />
    </div>
  )
}
