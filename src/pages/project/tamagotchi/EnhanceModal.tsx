import { Alert, Button, Modal, Spin, Switch, Tag } from 'antd'
import { useState } from 'react'
import {
  describeStats,
  enhanceFailureLabel,
  getEnhanceBlocker,
  gradeColor,
  gradeLabel,
  statLabel,
  toPercent,
} from './tamagotchi-helper'
import { IEnhanceOutcome, IEquipmentItem } from './tamagotchi-interface'
import { useEnhance, useGetEnhancePreview, useGetInventory } from './tamagotchi-service'

interface IEnhanceModalProps {
  item: IEquipmentItem | null
  coin: number
  onClose: () => void
  onError: (error: unknown) => void
}

const describeOutcome = (outcome: IEnhanceOutcome) => {
  if (outcome.broke) {
    return { type: 'error' as const, text: 'อุปกรณ์แตก!' }
  }
  if (outcome.success) {
    return { type: 'success' as const, text: `สำเร็จ! +${outcome.fromLevel} → +${outcome.toLevel}` }
  }
  const kept = outcome.protectUsed ? ' (ใบกันแตกช่วยไว้)' : ''
  return {
    type: 'warning' as const,
    text:
      outcome.toLevel < outcome.fromLevel
        ? `ล้มเหลว ระดับลดเหลือ +${outcome.toLevel}${kept}`
        : `ล้มเหลว ระดับเท่าเดิม${kept}`,
  }
}

export const EnhanceModal = (props: IEnhanceModalProps) => {
  const { item, coin, onClose, onError } = props
  const { data: preview, isLoading, refetch } = useGetEnhancePreview(item?.id ?? null)
  const { data: inventory } = useGetInventory()
  const { mutate: enhance, isPending } = useEnhance()
  const [useProtect, setUseProtect] = useState(false)
  const [outcome, setOutcome] = useState<IEnhanceOutcome | null>(null)

  const quantityOf = (itemId: string) =>
    inventory?.items.find((entry) => entry.itemId === itemId)?.quantity ?? 0
  const funds = {
    coin,
    stones: quantityOf('enhance_stone'),
    scrolls: quantityOf('protect_scroll'),
  }

  const close = () => {
    setOutcome(null)
    setUseProtect(false)
    onClose()
  }

  const current = preview?.item ?? item
  const blocker = preview ? getEnhanceBlocker(preview, funds, useProtect) : null
  const outcomeView = outcome ? describeOutcome(outcome) : null

  return (
    <Modal
      open={!!item}
      title={item ? `${item.emoji} ${item.name} +${current?.enhanceLevel ?? 0}` : ''}
      onCancel={close}
      footer={<Button onClick={close}>ปิด</Button>}
    >
      {isLoading || !preview || !current ? (
        <Spin />
      ) : (
        <div className="flex flex-col gap-3 text-sm">
          <div>
            <Tag color={gradeColor[current.grade]}>{gradeLabel[current.grade]}</Tag>
            {statLabel[current.mainStat]} {current.mainValue}
            {describeStats(current.subStats) && ` · ${describeStats(current.subStats)}`}
          </div>
          {preview.maxed ? (
            <Alert type="info" message="ตีบวกสูงสุดแล้ว" />
          ) : (
            <>
              <div>
                ตีบวกเป็น <b>+{preview.targetLevel}</b> · อัตราสำเร็จ{' '}
                <b>{toPercent(preview.rate)}</b>
                {preview.rate > preview.baseRate &&
                  ` (รวมโบนัสล้มเหลวติดกัน ${current.pity} ครั้ง จากฐาน ${toPercent(preview.baseRate)})`}
              </div>
              <div>
                ค่าใช้จ่าย 🪙 {preview.cost.coin} · 🪨 {preview.cost.stones} (มี 🪙 {coin} · 🪨{' '}
                {funds.stones}) ใช้ทุกครั้งที่ลอง
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                {enhanceFailureLabel[preview.onFail]}
              </div>
              {preview.canProtect && (
                <label className="flex items-center gap-2">
                  <Switch checked={useProtect} onChange={setUseProtect} />
                  ใช้ใบกันแตก 📜 (มี {funds.scrolls}) ใช้เฉพาะเมื่อช่วยได้จริง
                </label>
              )}
              <Button
                type="primary"
                disabled={!!blocker || isPending}
                title={blocker ?? undefined}
                onClick={() =>
                  enhance(
                    { equipmentId: current.id, useProtect: useProtect && preview.canProtect },
                    {
                      onSuccess: ({ result }) => {
                        setOutcome(result)
                        if (result.broke) {
                          close()
                        } else {
                          void refetch()
                        }
                      },
                      onError,
                    }
                  )
                }
              >
                {blocker ?? 'ตีบวก'}
              </Button>
            </>
          )}
          {outcomeView && <Alert type={outcomeView.type} message={outcomeView.text} />}
        </div>
      )}
    </Modal>
  )
}
