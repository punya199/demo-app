import { Alert, Button, Modal, Radio, Tag } from 'antd'
import { useState } from 'react'
import {
  gradeColor,
  gradeLabel,
  pickRefineTier,
  refineStoneLabel,
  statLabel,
} from '../core/tamagotchi-helper'
import { IEquipmentItem, StatKey } from '../core/tamagotchi-interface'
import {
  useGetInventory,
  useGetWiki,
  useRefine,
  useResolveRefine,
} from '../core/tamagotchi-service'

interface IRefineModalProps {
  // Always the live row from the equipment query, so a roll shows up as soon as it is made.
  item: IEquipmentItem | null
  coin: number
  onClose: () => void
  onError: (error: unknown) => void
}

export const RefineModal = (props: IRefineModalProps) => {
  const { item, coin, onClose, onError } = props
  const { data: wiki } = useGetWiki()
  const { data: inventory } = useGetInventory()
  const { mutate: refine, isPending: isRolling } = useRefine()
  const { mutate: resolve, isPending: isResolving } = useResolveRefine()
  const [line, setLine] = useState<StatKey | null>(null)

  const tiers = wiki?.equipment.refineTiers ?? []
  const quantityOf = (material: string) =>
    inventory?.items.find((entry) => entry.itemId === material)?.quantity ?? 0
  const lines = item ? (Object.keys(item.subStats) as StatKey[]) : []
  const chosen = line && lines.includes(line) ? line : (lines[0] ?? null)
  const tier = item ? pickRefineTier(tiers, item.enhanceLevel, quantityOf) : null
  const pending = item?.pendingRefine ?? null
  const isBusy = isRolling || isResolving

  const blocker = !tier
    ? 'ไม่มีหินรีไฟน์ที่ใช้กับระดับตีบวกนี้ได้'
    : coin < tier.coin
      ? 'เหรียญไม่พอ'
      : null

  return (
    <Modal
      open={!!item}
      title={item ? `${item.emoji} ${item.name} +${item.enhanceLevel}` : ''}
      onCancel={onClose}
      footer={<Button onClick={onClose}>ปิด</Button>}
    >
      {item && (
        <div className="flex flex-col gap-3 text-sm">
          <div>
            <Tag color={gradeColor[item.grade]}>{gradeLabel[item.grade]}</Tag>
            สุ่มค่ารองใหม่ 1 ช่อง ค่าที่ได้อยู่ในช่วงเดียวกับตอนดรอป
          </div>
          {pending ? (
            <>
              <Alert
                type="info"
                showIcon
                message={`${statLabel[pending.key]}: ${item.subStats[pending.key]} → ${pending.value}`}
                description="เก็บค่าใหม่หรือคงค่าเดิม (หินและเหรียญถูกใช้ไปแล้วทั้งสองกรณี) ค่าเดิมใช้งานอยู่จนกว่าจะเลือกเก็บ"
              />
              <div className="flex gap-2">
                <Button
                  type="primary"
                  disabled={isBusy}
                  onClick={() => resolve({ equipmentId: item.id, keep: true }, { onError })}
                >
                  เก็บค่าใหม่
                </Button>
                <Button
                  disabled={isBusy}
                  onClick={() => resolve({ equipmentId: item.id, keep: false }, { onError })}
                >
                  คงค่าเดิม
                </Button>
              </div>
            </>
          ) : (
            <>
              <Radio.Group
                value={chosen}
                onChange={(event) => setLine(event.target.value as StatKey)}
                options={lines.map((key) => ({
                  value: key,
                  label: `${statLabel[key]} ${item.subStats[key]}`,
                }))}
              />
              <div className="text-slate-600 dark:text-slate-300">
                {tier
                  ? `ใช้ ${refineStoneLabel[tier.material] ?? tier.material} 1 ก้อน + 🪙 ${tier.coin} (มี ${quantityOf(tier.material)} ก้อน)`
                  : 'ไม่มีหินรีไฟน์ที่ใช้กับระดับตีบวกนี้ได้'}
              </div>
              <Button
                type="primary"
                disabled={!chosen || !!blocker || isBusy}
                onClick={() =>
                  chosen && refine({ equipmentId: item.id, line: chosen }, { onError })
                }
              >
                {blocker ?? 'รีไฟน์'}
              </Button>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
