import { Button, InputNumber, Modal, Slider } from 'antd'
import { useEffect, useState } from 'react'
import { gradeLabel, skipRunsAffordable } from '../core/tamagotchi-helper'
import { IAdventureStage } from '../core/tamagotchi-interface'
import { IAdventureSkipResponse, useAdventureSkip } from '../core/tamagotchi-service'

interface IAdventureSkipModalProps {
  // The cleared stage to skip; null keeps the modal closed.
  stage: IAdventureStage | null
  stamina: number
  staminaCost: number
  maxRuns: number
  onClose: () => void
  onError: (error: unknown) => void
}

// Skip: pick how many runs of a cleared stage to sweep with stamina, then show what came back.
export const AdventureSkipModal = (props: IAdventureSkipModalProps) => {
  const { stage, stamina, staminaCost, maxRuns, onClose, onError } = props
  const { mutate: skip, isPending } = useAdventureSkip()
  const affordable = skipRunsAffordable(stamina, staminaCost, maxRuns)
  const [runs, setRuns] = useState(1)
  const [result, setResult] = useState<IAdventureSkipResponse['skip'] | null>(null)

  useEffect(() => {
    setRuns(Math.max(1, affordable))
    setResult(null)
    // Reset only when another stage is opened, not when stamina changes after a skip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage?.id])

  if (!stage) {
    return null
  }

  const title = `ข้าม: ${stage.enemy?.emoji ?? ''} ${stage.enemy?.name ?? ''}`
  if (result) {
    return (
      <Modal
        open
        title={title}
        onCancel={onClose}
        footer={
          <Button type="primary" onClick={onClose}>
            ปิด
          </Button>
        }
      >
        <div className="flex flex-col gap-2 text-center">
          <div className="text-lg font-bold text-emerald-600">ชนะ {result.runs} รอบ</div>
          <div className="text-slate-700 dark:text-slate-200">🪙 {result.coins}</div>
          {result.drops.length > 0 ? (
            <ul className="text-sm text-slate-700 dark:text-slate-200">
              {result.drops.map((drop) => (
                <li key={drop.id}>
                  ได้อุปกรณ์: {drop.name} ({gradeLabel[drop.grade]})
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-400">ไม่ได้อุปกรณ์</div>
          )}
          {result.dropsLost > 0 && (
            <div className="text-sm text-amber-600">
              กระเป๋าเต็ม อุปกรณ์หายไป {result.dropsLost} ชิ้น
            </div>
          )}
        </div>
      </Modal>
    )
  }

  const canSkip = affordable >= 1
  return (
    <Modal
      open
      title={title}
      onCancel={onClose}
      footer={
        <Button
          type="primary"
          loading={isPending}
          disabled={!canSkip}
          onClick={() =>
            skip(
              { stageId: stage.id, runs },
              { onSuccess: (data) => setResult(data.skip), onError }
            )
          }
        >
          ข้าม {runs} รอบ
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          ไม่ต้องสู้ ใช้ stamina แล้วรับรางวัลเหมือนชนะทันที สูงสุด {maxRuns} รอบต่อครั้ง
          แต่ละรอบมีโอกาสได้อุปกรณ์
        </p>
        {canSkip ? (
          <div className="flex items-center gap-3">
            <Slider
              className="flex-1"
              min={1}
              max={Math.max(1, affordable)}
              value={runs}
              onChange={setRuns}
              disabled={affordable <= 1}
            />
            <InputNumber
              min={1}
              max={affordable}
              value={runs}
              onChange={(value) => setRuns(Math.min(affordable, Math.max(1, value ?? 1)))}
            />
          </div>
        ) : (
          <div className="text-sm text-rose-500">stamina ไม่พอ ต้องมีอย่างน้อย {staminaCost}</div>
        )}
        <div className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          ใช้ stamina {runs * staminaCost} (มี {Math.floor(stamina)}) · ได้ 🪙 {runs * stage.reward}
        </div>
      </div>
    </Modal>
  )
}
