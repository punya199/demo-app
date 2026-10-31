import { Button, Card, Spin, Tag, Tooltip } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { BattleModal } from './BattleModal'
import {
  elementLabel,
  getAutoBattleDelayMs,
  getBattleBlocker,
  stageLabel,
} from './tamagotchi-helper'
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
  // Stage being auto-battled; the loop runs while this page is open and visible.
  const [autoStageId, setAutoStageId] = useState<string | null>(null)
  const blocker = getBattleBlocker(monster)
  const autoReadyAt = monster?.autoBattleReadyAt

  const closeReplay = useCallback(() => {
    if (replay) {
      applyBattleResult(replay)
    }
    setReplay(null)
  }, [replay, applyBattleResult])

  // One fight at a time: wait out the server's cooldown, fight, replay, repeat. Any refusal
  // (stamina, daily cap, hidden tab...) stops the loop.
  useEffect(() => {
    if (!autoStageId || replay || isPending) {
      return
    }
    if (blocker) {
      setAutoStageId(null)
      return
    }
    const timer = setTimeout(
      () => {
        if (document.hidden) {
          setAutoStageId(null)
          return
        }
        battle(
          { stageId: autoStageId, auto: true },
          {
            onSuccess: setReplay,
            onError: (error) => {
              setAutoStageId(null)
              onError(error)
            },
          }
        )
      },
      getAutoBattleDelayMs(monster, Date.now()) + 500
    )
    return () => clearTimeout(timer)
    // `monster` is read through autoReadyAt: a new fight changes it, and that restarts the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStageId, replay, isPending, blocker, autoReadyAt])

  if (isLoading) {
    return <Spin />
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        สู้แต่ละครั้งใช้ stamina 10 · ชนะครั้งแรกได้เหรียญ x2 · บอสครั้งแรกได้เพชร
        <br />
        ด่านที่ชนะแล้ว (ไม่ใช่บอส) ตั้งต่อสู้อัตโนมัติได้ ต้องเปิดหน้านี้ค้างไว้
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
                  {stage.autoReward !== null && stage.clearCount > 0 && (
                    <Tooltip title={`อัตโนมัติ: 🪙 ${stage.autoReward} ต่อการชนะ`}>
                      <Button
                        size="small"
                        type={autoStageId === stage.id ? 'primary' : 'default'}
                        danger={autoStageId === stage.id}
                        disabled={!!blocker && autoStageId !== stage.id}
                        onClick={() => setAutoStageId(autoStageId === stage.id ? null : stage.id)}
                      >
                        {autoStageId === stage.id ? 'หยุด' : 'อัตโนมัติ'}
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip title={reason}>
                    <Button
                      type="primary"
                      size="small"
                      disabled={!!reason || isPending}
                      onClick={() =>
                        battle(
                          { stageId: stage.id },
                          {
                            onSuccess: setReplay,
                            onError,
                          }
                        )
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
        onClose={closeReplay}
        autoCloseMs={autoStageId ? 1500 : undefined}
      />
    </div>
  )
}
