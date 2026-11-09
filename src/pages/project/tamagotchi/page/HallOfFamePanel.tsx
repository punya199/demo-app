import { Spin } from 'antd'
import { deathCauseLabel, formatAge, petLabel, stageLabel } from '../core/tamagotchi-helper'
import { useGetMonsterHistory } from '../core/tamagotchi-service'
import { MonsterSprite } from '../shared/MonsterSprite'

export const HallOfFamePanel = () => {
  const { data, isLoading } = useGetMonsterHistory()
  if (isLoading) {
    return <Spin size="large" />
  }
  if (!data?.monsters.length) {
    return (
      <div className="w-full text-center text-sm text-slate-500 dark:text-slate-400">
        ยังไม่มีสัตว์เลี้ยงในหอเกียรติยศ
      </div>
    )
  }
  return (
    <div className="w-full">
      <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">หอเกียรติยศ</h2>
      <div className="flex flex-col gap-2">
        {data.monsters.map((monster) => (
          <div
            key={monster.id}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <MonsterSprite sprite={monster.sprite} emoji={monster.emoji} size={36} />
            <div className="flex-1">
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {petLabel(monster.name, monster.nickname)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {stageLabel[monster.stage]} · อายุ {formatAge(monster.ageMinutes)}
                {monster.deathCause && ` · ${deathCauseLabel[monster.deathCause]}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
