import { Tag } from 'antd'
import {
  compareEquipment,
  describeSpecials,
  describeSetTier,
  describeStats,
  gradeColor,
  gradeLabel,
  isSetComplete,
  isSetTierActive,
  setPieceLabel,
  statLabel,
} from '../core/tamagotchi-helper'
import { EnumEquipmentGrade, IEquipmentItem, ISetProgress } from '../core/tamagotchi-interface'

export const ItemLine = (props: { item: IEquipmentItem; set?: ISetProgress }) => {
  const { item, set } = props
  return (
    <div className="min-w-0 flex-1 break-words">
      <div
        className={`font-medium ${
          item.grade === EnumEquipmentGrade.MYTHIC
            ? 'bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-500 bg-clip-text font-bold text-transparent'
            : 'text-slate-900 dark:text-slate-100'
        }`}
      >
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

// Pieces worn of a set, each bonus tier (✔ when on) and the enhance multiplier state.
export const SetStatus = (props: {
  set: ISetProgress
  enhance: { threshold: number; multiplier: number }
}) => {
  const { set, enhance } = props
  const muted = 'text-slate-500 dark:text-slate-400'
  return (
    <div className="flex flex-col gap-1">
      <div className={`text-sm font-medium ${isSetComplete(set) ? 'text-emerald-600' : ''}`}>
        {setPieceLabel(set)}
      </div>
      {set.tiers.map((tier) => (
        <div
          key={tier.pieces}
          className={`text-xs ${isSetTierActive(set, tier) ? 'text-emerald-600' : muted}`}
        >
          {isSetTierActive(set, tier) ? '✔' : '○'} {tier.pieces} ชิ้น: {describeSetTier(tier)}
        </div>
      ))}
      <div className={`text-xs ${set.isEnhanced ? 'text-emerald-600' : muted}`}>
        ตีบวกทุกชิ้นที่ใส่ถึง +{enhance.threshold} ขึ้นไป โบนัสเปอร์เซ็นต์คูณ ×{enhance.multiplier}{' '}
        · {set.isEnhanced ? 'ถึงแล้ว ✔' : 'ยังไม่ถึง'}
      </div>
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
