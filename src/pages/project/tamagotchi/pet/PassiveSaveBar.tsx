import { Button } from 'antd'
import { diffPassiveDraft } from '../core/tamagotchi-helper'

interface IPassiveSaveBarProps {
  diff: ReturnType<typeof diffPassiveDraft>
  costTotal: number
  pointsLeft: number
  isSaving: boolean
  onCancel: () => void
  onSave: () => void
}

export const PassiveSaveBar = (props: IPassiveSaveBarProps) => {
  const { diff, costTotal, pointsLeft, isSaving, onCancel, onSave } = props
  return (
    <div className="sticky bottom-2 z-20 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-400 bg-white/95 p-3 shadow-lg dark:border-amber-500 dark:bg-slate-900/95">
      <div className="text-sm text-slate-800 dark:text-slate-100">
        <div className="font-semibold">ยังไม่ได้บันทึก</div>
        <div className="text-xs text-slate-600 dark:text-slate-300">
          เพิ่ม {diff.added + diff.ascAdded} · ถอน {diff.removed + diff.ascRemoved}
          {diff.picked > 0 && ` · มาสเตอรี ${diff.picked}`} ·{' '}
          {costTotal > 0 ? `ใช้ 💎 ${costTotal}` : 'ไม่เสียเพชร'} · แต้มเหลือ {pointsLeft}
        </div>
      </div>
      <div className="flex gap-2">
        <Button disabled={isSaving} onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="primary" loading={isSaving} onClick={onSave}>
          บันทึก
        </Button>
      </div>
    </div>
  )
}
