import { useQueryClient } from '@tanstack/react-query'
import { Button, Card, Spin, Tag, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import {
  deathCauseLabel,
  formatAge,
  lineOptions,
  petLabel,
  stageLabel,
} from '../core/tamagotchi-helper'
import { IMonsterData } from '../core/tamagotchi-interface'
import {
  useGetMonsterHistory,
  useGetMyMonster,
  useGetWallet,
  useGetWiki,
  useHatchMonster,
} from '../core/tamagotchi-service'
import { MergeModal } from '../equipment/MergeModal'
import { MonsterScreen } from './MonsterScreen'
import { showError } from './show-error'
import { MonsterSprite } from '../shared/MonsterSprite'

const EggPicker = () => {
  const { mutate: hatch, isPending } = useHatchMonster()
  const { data: wallet } = useGetWallet()
  const { data: wiki } = useGetWiki()
  const price = wiki?.rareEgg.raidTokenPrice ?? 0
  const tokens = wallet?.raidToken ?? 0
  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-center text-slate-600 dark:text-slate-300">เลือกไข่ที่จะเลี้ยง</p>
      {lineOptions.map((option) => {
        const blocker = option.isRare && tokens < price ? 'Raid Token ไม่พอ' : null
        return (
          <Tooltip key={option.line} title={blocker}>
            <Card
              hoverable={!isPending && !blocker}
              className={`dark:border-slate-700 dark:bg-slate-900 ${blocker ? 'opacity-60' : ''}`}
              onClick={() => !isPending && !blocker && hatch(option.line, { onError: showError })}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🥚{option.emoji}</div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {option.title}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {option.description}
                  </div>
                </div>
                {option.isRare && <Tag color="purple">🎖️ {price}</Tag>}
              </div>
            </Card>
          </Tooltip>
        )
      })}
    </div>
  )
}

const Memorial = (props: { monster: IMonsterData; onNewEgg: () => void }) => {
  const { monster, onNewEgg } = props
  return (
    <Card className="w-full text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="text-6xl">🪦</div>
      <div className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
        {monster.emoji} {petLabel(monster.name, monster.nickname)}
      </div>
      <div className="mt-1 text-slate-500 dark:text-slate-400">
        {monster.deathCause && deathCauseLabel[monster.deathCause]} · อายุ{' '}
        {formatAge(monster.ageMinutes)}
      </div>
      <Button type="primary" className="mt-4" onClick={onNewEgg}>
        รับไข่ใบใหม่
      </Button>
    </Card>
  )
}

export const HallOfFame = () => {
  const { data } = useGetMonsterHistory()
  if (!data?.monsters.length) {
    return null
  }
  return (
    <div className="w-full">
      <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Hall of Fame</h2>
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

export const TamagotchiGame = (props: {
  isChoosingEgg: boolean
  setIsChoosingEgg: (value: boolean) => void
}) => {
  const { isChoosingEgg, setIsChoosingEgg } = props
  const { data, isLoading, dataUpdatedAt } = useGetMyMonster()
  const queryClient = useQueryClient()
  const { data: wallet } = useGetWallet()
  const { data: wiki } = useGetWiki()
  const [isMerging, setIsMerging] = useState(false)
  const monster = data?.monster ?? null
  // Fixed slot order (oldest first), whichever pet is selected.
  const monsters = [...(data?.monsters ?? [])].sort(
    (a, b) => new Date(a.bornAt).getTime() - new Date(b.bornAt).getTime()
  )
  const diedAt = monster?.diedAt

  // A new egg was hatched: back from the picker to the care screen.
  useEffect(() => {
    setIsChoosingEgg(false)
  }, [monsters.length, setIsChoosingEgg])

  // The server only records a death when it ticks the monster, which can happen after the
  // history was fetched - refresh it so the Hall of Fame includes the monster that just died.
  useEffect(() => {
    if (diedAt) {
      queryClient.invalidateQueries({ queryKey: ['monster', 'history'] })
    }
  }, [diedAt, queryClient])

  if (isLoading) {
    return <Spin size="large" />
  }

  if (!monster || (isChoosingEgg && monsters.length === 0)) {
    return <EggPicker />
  }
  if (monster.diedAt) {
    return <Memorial monster={monster} onNewEgg={() => setIsChoosingEgg(true)} />
  }
  return (
    <div className="flex w-full flex-col gap-4">
      {monsters.length >= 2 && wiki && (
        <>
          <Button onClick={() => setIsMerging(true)}>🧬 รวมร่างมอนสูงสุด</Button>
          <MergeModal
            open={isMerging}
            onClose={() => setIsMerging(false)}
            monsters={monsters}
            wallet={wallet}
            merge={wiki.merge}
            onError={showError}
          />
        </>
      )}
      {isChoosingEgg ? (
        <>
          <EggPicker />
          <Button onClick={() => setIsChoosingEgg(false)}>ยกเลิก</Button>
        </>
      ) : (
        <MonsterScreen
          key={monster.id}
          monster={monster}
          fetchedAt={dataUpdatedAt}
          species={wiki?.evolution.species}
          petCore={wiki?.petCore}
        />
      )}
    </div>
  )
}
