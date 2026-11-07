import { describePassiveEffect } from '../core/tamagotchi-helper'
import { PassiveEffectKey } from '../core/tamagotchi-interface'

interface IPassiveTotalsProps {
  totals: { key: PassiveEffectKey; value: number }[]
}

export const PassiveTotals = (props: IPassiveTotalsProps) => {
  const { totals } = props
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <div className="text-xs text-slate-500 dark:text-slate-400">โบนัสรวมที่ได้</div>
      {totals.length === 0 ? (
        <div className="text-sm text-slate-500">ยังไม่มี</div>
      ) : (
        <ul className="mt-1 text-sm">
          {totals.map(({ key, value }) => (
            <li
              key={key}
              className={value < 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}
            >
              {describePassiveEffect(key, value)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
