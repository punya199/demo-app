import { Button, Card, Spin, Tag, Tooltip } from 'antd'
import { useCallback, useState } from 'react'
import { AdventureSkipModal } from './AdventureSkipModal'
import { ArenaBattleModal } from './ArenaBattleModal'
import { StaminaCard } from './StaminaCard'
import { elementLabel, getAdventureBlocker, stageLabel } from './tamagotchi-helper'
import { EnumMonsterStage, IAdventureStage, IMonsterData } from './tamagotchi-interface'
import {
  IAdventureBattleResponse,
  useAdventureBattle,
  useApplyBattleResult,
  useGetAdventure,
  useGetSkills,
  useGetWallet,
  useGetWiki,
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
  const [replay, setReplay] = useState<IAdventureBattleResponse | null>(null)
  const { data: skillState } = useGetSkills()
  // The cleared stage whose skip window is open.
  const [skipStage, setSkipStage] = useState<IAdventureStage | null>(null)
  const { data: wiki } = useGetWiki()
  const { data: wallet } = useGetWallet()
  const blocker = getAdventureBlocker(monster, wiki?.stamina.adventureCost ?? 0)

  const closeReplay = useCallback(() => {
    if (replay) {
      applyBattleResult(replay)
    }
    setReplay(null)
  }, [replay, applyBattleResult])

  if (isLoading) {
    return <Spin />
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {monster && wiki && !monster.diedAt && monster.stage !== EnumMonsterStage.EGG && (
        <StaminaCard
          monster={monster}
          rules={wiki.stamina}
          gem={wallet?.gem ?? 0}
          onError={onError}
        />
      )}
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        สู้แต่ละครั้งใช้ stamina {wiki?.stamina.adventureCost} · ชนะครั้งแรกได้เหรียญ x2 ·
        บอสครั้งแรกได้เพชร
        <br />
        ด่านที่ชนะแล้วกด "ข้าม" ได้ ใช้ stamina รับรางวัลทันทีโดยไม่ต้องสู้ (ครั้งละ 1–
        {wiki?.adventure.skipMaxRuns} รอบ)
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
                  <span className="text-2xl">{stage.unlocked ? stage.enemy?.emoji : '🔒'}</span>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {stage.enemy?.name}
                      {stage.isBoss && (
                        <Tag color="red" className="ml-2">
                          บอส
                        </Tag>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {stage.enemy && (
                        <>
                          {elementLabel[stage.enemy.element]} · HP {stage.enemy.stats.hp} · ATK{' '}
                          {stage.enemy.stats.atk} · สกิล{' '}
                          {stage.enemy.skills.map((skill) => (
                            <Tooltip key={skill.id} title={skill.name}>
                              <span>{skill.icon}</span>
                            </Tooltip>
                          ))}{' '}
                          ·{' '}
                        </>
                      )}
                      {stage.clearCount > 0
                        ? `🪙 ${stage.reward} · ชนะแล้ว ${stage.clearCount} ครั้ง`
                        : `🪙 ${stage.firstClearReward}${
                            stage.firstClearGems ? ` + 💎 ${stage.firstClearGems}` : ''
                          } (ครั้งแรก)`}
                    </div>
                  </div>
                  {stage.clearCount > 0 && (
                    <Tooltip title={blocker ?? 'ไม่ต้องสู้ ใช้ stamina รับรางวัลทันที'}>
                      <Button
                        size="small"
                        disabled={!!blocker || isPending}
                        onClick={() => setSkipStage(stage)}
                      >
                        ข้าม
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
      <ArenaBattleModal
        battle={replay?.battle ?? null}
        statuses={skillState?.statuses}
        catalog={skillState?.catalog}
        onClose={closeReplay}
      />
      <AdventureSkipModal
        stage={skipStage}
        stamina={monster?.stamina ?? 0}
        staminaCost={wiki?.stamina.adventureCost ?? 0}
        maxRuns={wiki?.adventure.skipMaxRuns ?? 10}
        onClose={() => setSkipStage(null)}
        onError={onError}
      />
    </div>
  )
}
