import { Tag } from 'antd'
import {
  compareEquipment,
  describeSpecials,
  describeStats,
  gradeColor,
  gradeLabel,
  isSetComplete,
  setPieceLabel,
  statLabel,
} from './tamagotchi-helper'
import { IEquipmentItem, ISetProgress } from './tamagotchi-interface'

export const ItemLine = (props: { item: IEquipmentItem; set?: ISetProgress }) => {
  const { item, set } = props
  return (
    <div className="min-w-0 flex-1">
      <div className="font-medium text-slate-900 dark:text-slate-100">
        {item.emoji} {item.name} <Tag color={gradeColor[item.grade]}>{gradeLabel[item.grade]}</Tag>
        {item.enhanceLevel > 0 && <Tag color="orange">+{item.enhanceLevel}</Tag>}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">
        {statLabel[item.mainStat]} {item.mainValue}
        {describeStats(item.subStats) && ` · ${describeStats(item.subStats)}`}
      </div>
      {describeSpecials(item.specialOptions) && (
        <div className="text-xs text-violet-600 dark:text-violet-400">
          ✨ {describeSpecials(item.specialOptions)}
        </div>
      )}
      {set && (
        <div
          className={`text-xs ${
            isSetComplete(set) ? 'text-emerald-600' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {setPieceLabel(set)}
        </div>
      )}
    </div>
  )
}

// Stat changes if `item` replaced the worn piece of its slot: green up, red down.
export const CompareLine = (props: { item: IEquipmentItem; worn: IEquipmentItem | undefined }) => {
  const { item, worn } = props
  const changes = compareEquipment(item, worn)
  return (
    <div className="flex flex-wrap items-center gap-x-2 text-xs">
      <span className="text-slate-500 dark:text-slate-400">
        {worn ? `เทียบกับ ${worn.name}:` : 'ช่องว่าง สวมแล้วได้:'}
      </span>
      {changes.length === 0 && <span className="text-slate-400">ค่าพลังเท่ากัน</span>}
      {changes.map(({ key, diff }) => (
        <span key={key} className={diff > 0 ? 'text-emerald-600' : 'text-rose-500'}>
          {statLabel[key]} {diff > 0 ? `▲ +${diff}` : `▼ ${diff}`}
        </span>
      ))}
      {worn && item.setId !== worn.setId && (
        <span className="text-slate-500 dark:text-slate-400">· เปลี่ยนเซ็ต</span>
      )}
    </div>
  )
}
