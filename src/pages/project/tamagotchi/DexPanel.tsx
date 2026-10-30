import { Spin, Tooltip } from 'antd'
import { elementLabel, lineOptions, stageLabel } from './tamagotchi-helper'
import { useGetMonsterDex } from './tamagotchi-service'

export const DexPanel = () => {
  const { data, isLoading } = useGetMonsterDex()

  if (isLoading || !data) {
    return <Spin />
  }

  const discoveredCount = data.species.filter((entry) => entry.discovered).length

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        ค้นพบแล้ว {discoveredCount}/{data.species.length} ร่าง
      </p>
      {lineOptions.map((option) => (
        <div key={option.line}>
          <div className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
            {elementLabel[option.line]}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {data.species
              .filter((entry) => entry.line === option.line)
              .map((entry) => (
                <Tooltip key={entry.id} title={stageLabel[entry.stage]}>
                  <div className="flex flex-col items-center rounded-lg border border-slate-200 bg-white p-2 text-center dark:border-slate-700 dark:bg-slate-900">
                    <span className={`text-3xl ${entry.discovered ? '' : 'opacity-30 grayscale'}`}>
                      {entry.emoji ?? '❓'}
                    </span>
                    <span className="mt-1 text-[11px] leading-tight text-slate-600 dark:text-slate-300">
                      {entry.name ?? '???'}
                    </span>
                  </div>
                </Tooltip>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
