import { Tabs, Tooltip } from 'antd'
import { groupArenaStats, IStatusExtraRow, StatusTabKey } from './status-tabs'
import { potentialPercent, signed } from './tamagotchi-helper'
import { IMonsterData, PotentialStatKey } from './tamagotchi-interface'
import { useGetEquipment } from './tamagotchi-service'

interface IBarRow {
  key: PotentialStatKey
  label: string
  unit: string
}

const BAR_ROWS: Record<PotentialStatKey, IBarRow> = {
  hp: { key: 'hp', label: 'HP', unit: '' },
  atk: { key: 'atk', label: 'ATK', unit: '' },
  def: { key: 'def', label: 'DEF', unit: '' },
  spd: { key: 'spd', label: 'SPD', unit: '' },
  critRate: { key: 'critRate', label: 'คริติคอล', unit: '%' },
  critDamage: { key: 'critDamage', label: 'ดาเมจคริ', unit: '%' },
  evasion: { key: 'evasion', label: 'หลบหลีก', unit: '%' },
}

// Which of the seven roll-bar stats sit on which tab.
const BAR_KEYS: Record<StatusTabKey, PotentialStatKey[]> = {
  offense: ['atk', 'spd', 'critRate', 'critDamage'],
  defense: ['hp', 'def', 'evasion'],
  other: [],
}

const TABS: { key: StatusTabKey; label: string }[] = [
  { key: 'offense', label: '⚔️ โจมตี' },
  { key: 'defense', label: '🛡️ ป้องกัน' },
  { key: 'other', label: '✨ อื่นๆ' },
]

const GRADE_COLOR: Record<string, string> = {
  S: 'text-amber-500',
  A: 'text-purple-500',
  B: 'text-sky-500',
  C: 'text-green-600',
  D: 'text-slate-500',
}

const ExtraRow = (props: { row: IStatusExtraRow }) => {
  const { row } = props
  const label = <span className="text-slate-600 dark:text-slate-300">{row.label}</span>
  return (
    <div className="flex items-center justify-between gap-2">
      {row.hint ? <Tooltip title={row.hint}>{label}</Tooltip> : label}
      <span className="text-right font-semibold text-slate-900 dark:text-slate-100">
        {row.value}
      </span>
    </div>
  )
}

// Fighting stats with their roll range: the bar shows where this monster's roll sits between the
// minimum and maximum of its form, the number is the total with care, gear and passives. Stats
// that only exist in the arena (regen, lifesteal ...) follow the bars, grouped by tab.
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
  const extras = equipment?.arenaStats
    ? groupArenaStats(equipment.arenaStats)
    : { offense: [], defense: [], other: [] }
  // The equipment screen follows the selected pet; wait until it is this one.
  const sets = equipment?.monsterId === monster.id ? (equipment.setBonuses ?? []) : []

  const renderBar = ({ key, label, unit }: IBarRow) => {
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
  }

  const renderTab = (tab: StatusTabKey) => {
    const bars = BAR_KEYS[tab].map((key) => renderBar(BAR_ROWS[key]))
    const rows = extras[tab]
    const isOther = tab === 'other'
    return (
      <div className="flex flex-col gap-2">
        {bars}
        {rows.length > 0 && (
          <div
            className={`flex flex-col gap-1 ${bars.length > 0 ? 'border-t pt-2' : ''} border-slate-300 dark:border-slate-600`}
          >
            {rows.map((row) => (
              <ExtraRow key={row.label} row={row} />
            ))}
          </div>
        )}
        {isOther &&
          sets.map((set) => (
            <ExtraRow
              key={set.setId}
              row={{ label: `เซ็ต ${set.name}`, value: `${set.pieces} ชิ้น` }}
            />
          ))}
        {!bars.length && !rows.length && !(isOther && sets.length > 0) && (
          <div className="text-xs text-slate-500">ยังไม่มีโบนัส</div>
        )}
      </div>
    )
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
      <Tabs
        size="small"
        defaultActiveKey="offense"
        items={TABS.map(({ key, label }) => ({ key, label, children: renderTab(key) }))}
      />
    </div>
  )
}
