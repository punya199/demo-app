import { potentialPercent, signed } from './tamagotchi-helper'
import { IMonsterData, PotentialStatKey } from './tamagotchi-interface'
import { useGetEquipment } from './tamagotchi-service'

const ROWS: { key: PotentialStatKey; label: string; unit: string }[] = [
  { key: 'hp', label: 'HP', unit: '' },
  { key: 'atk', label: 'ATK', unit: '' },
  { key: 'def', label: 'DEF', unit: '' },
  { key: 'spd', label: 'SPD', unit: '' },
  { key: 'critRate', label: 'คริติคอล', unit: '%' },
  { key: 'critDamage', label: 'ดาเมจคริ', unit: '%' },
  { key: 'evasion', label: 'หลบหลีก', unit: '%' },
]

const GRADE_COLOR: Record<string, string> = {
  S: 'text-amber-500',
  A: 'text-purple-500',
  B: 'text-sky-500',
  C: 'text-green-600',
  D: 'text-slate-500',
}

// Fighting stats with their roll range: the bar shows where this monster's roll sits between the
// minimum and maximum of its form, the number is the total with care, gear and passives.
export const StatusPanel = (props: { monster: IMonsterData }) => {
  const { monster } = props
  const { data: equipment } = useGetEquipment()
  const care = monster.battleStats
  const view = monster.potentialView
  if (!care) {
    return null
  }
  const total = (key: PotentialStatKey) => {
    if (key === 'hp' || key === 'atk' || key === 'def' || key === 'spd') {
      return (equipment?.stats ?? care)[key]
    }
    return equipment?.combat?.[key] ?? view.stats[key].value
  }

  return (
    <div className="rounded-lg bg-white/60 p-2 text-sm dark:bg-slate-700/60">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          สถานะต่อสู้ (รวมอุปกรณ์และต้นไม้)
        </span>
        {view.grade ? (
          <span
            className={`text-lg font-bold ${GRADE_COLOR[view.grade] ?? ''}`}
            title={`ค่าสุ่มเฉลี่ย ${view.average}% ของช่วง`}
          >
            เกรด {view.grade}
          </span>
        ) : (
          <span className="text-xs text-slate-500">มอนรุ่นเก่า (ไม่มีค่าสุ่ม)</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {ROWS.map(({ key, label, unit }) => {
          const stat = view.stats[key]
          const isBase = key === 'hp' || key === 'atk' || key === 'def' || key === 'spd'
          const final = total(key)
          const percent = potentialPercent(stat)
          return (
            <div key={key}>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">{label}</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {final}
                  {unit}
                </span>
              </div>
              <div
                className="relative my-1 h-2 rounded bg-slate-300 dark:bg-slate-600"
                role="img"
                aria-label={`${label} ค่าสุ่ม ${stat.value}${unit} จากช่วง ${stat.min}-${stat.max}${unit}`}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded bg-sky-400/60"
                  style={{ width: `${percent}%` }}
                />
                <div
                  className="absolute -top-1 h-4 w-1 -translate-x-1/2 rounded bg-slate-800 dark:bg-slate-100"
                  style={{ left: `${percent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  ต่ำสุด {stat.min}
                  {unit}
                </span>
                <span>
                  ค่าสุ่ม {stat.value}
                  {unit}
                  {isBase
                    ? ` · ค่าเลี้ยง ${signed(care[key as 'hp'] - stat.value)} · อุปกรณ์/ต้นไม้ ${signed(final - care[key as 'hp'])}`
                    : ` · อุปกรณ์/ต้นไม้ ${signed(final - stat.value)}${unit}`}
                </span>
                <span>
                  สูงสุด {stat.max}
                  {unit}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
