import { Button } from 'antd'
import { AscendancyPath } from '../core/tamagotchi-interface'
import { PATH_LABEL } from './passive-constants'

interface IPassiveAscendancyBarProps {
  path: AscendancyPath | null
  points: { left: number; earned: number }
  canReset: boolean
  onReset: () => void
}

export const PassiveAscendancyBar = (props: IPassiveAscendancyBarProps) => {
  const { path: ascendancyPath, points: ascPoints, canReset, onReset } = props
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
      <div>
        <div className="text-xs text-slate-500 dark:text-slate-400">เส้นทางสูงสุด (วงนอกสุด)</div>
        <div className="text-slate-900 dark:text-slate-100">
          {ascendancyPath ? PATH_LABEL[ascendancyPath] : 'ยังไม่เลือกเส้นทาง'} · แต้ม{' '}
          {ascPoints.left} / {ascPoints.earned}
        </div>
      </div>
      <Button size="small" disabled={!canReset} onClick={onReset}>
        เริ่มเส้นทางใหม่
      </Button>
    </div>
  )
}
