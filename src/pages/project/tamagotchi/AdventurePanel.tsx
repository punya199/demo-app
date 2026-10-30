import { Button, Card, Spin, Tag, Tooltip } from 'antd'
import { useState } from 'react'
import { BattleModal } from './BattleModal'
import { elementLabel, getBattleBlocker, stageLabel } from './tamagotchi-helper'
import { IMonsterData } from './tamagotchi-interface'
import {
  IBattleResponse,
  useAdventureBattle,
  useApplyBattleResult,
  useGetAdventure,
} from './tamagotchi-service'

interface IAdventurePanelProps {
  monster: IMonsterData | null
  onError: (error: unknown) => void
}

export const AdventurePanel = (props: IAdventurePanelProps) => {
  const { monster, onError } = props
  const { data, isLoading } = useGetAdventure()
  const { mutate: battle, isPending } = useAdventureBattle()
  const applyBattleResult = useApplyBattleResult()
  const [replay, setReplay] = useState<IBattleResponse | null>(null)
  const blocker = getBattleBlocker(monster)

  if (isLoading) {
    return <Spin />
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        สู้แต่ละครั้งใช้ stamina 10 · ชนะครั้งแรกได้เหรียญ x2 · บอสครั้งแรกได้เพชร
      </p>
      {data?.areas.map((area) => (
        <Card
          key={area.id}
          size="small"
          className="dark:border-slate-700 dark:bg-slate-900"
          title={
            <span>
              {area.emoji} {area.name}
            </span>
          }
          extra={<Tag>แนะนำ: {stageLabel[area.recommendedStage]}</Tag>}
        >
          <div className="flex flex-col gap-2">
            {area.stages.map((stage) => {
              const reason = stage.unlocked ? blocker : 'ชนะด่านก่อนหน้าก่อน'
              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-3 ${stage.unlocked ? '' : 'opacity-50'}`}
                >
                  <span className="text-2xl">{stage.unlocked ? stage.enemy.emoji : '🔒'}</span>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {stage.enemy.name}
                      {stage.isBoss && (
                        <Tag color="red" className="ml-2">
                          บอส
                        </Tag>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {elementLabel[stage.enemy.element]} · HP {stage.enemy.stats.hp} ·{' '}
                      {stage.clearCount > 0
                        ? `🪙 ${stage.reward} · ชนะแล้ว ${stage.clearCount} ครั้ง`
                        : `🪙 ${stage.firstClearReward}${
                            stage.firstClearGems ? ` + 💎 ${stage.firstClearGems}` : ''
                          } (ครั้งแรก)`}
                    </div>
                  </div>
                  <Tooltip title={reason}>
                    <Button
                      type="primary"
                      size="small"
                      disabled={!!reason || isPending}
                      onClick={() =>
                        battle(stage.id, {
                          onSuccess: setReplay,
                          onError,
                        })
                      }
                    >
                      สู้
                    </Button>
                  </Tooltip>
                </div>
              )
            })}
          </div>
        </Card>
      ))}
      <BattleModal
        battle={replay?.battle ?? null}
        onClose={() => {
          if (replay) {
            applyBattleResult(replay)
          }
          setReplay(null)
        }}
      />
    </div>
  )
}
