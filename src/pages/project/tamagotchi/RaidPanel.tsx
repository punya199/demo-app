import { Button, Card, Select, Spin, Tag, Tooltip } from 'antd'
import { useState } from 'react'
import { BattleModal } from './BattleModal'
import {
  describePctBonus,
  describeSetEffect,
  getRaidBlocker,
  gradeColor,
  gradeLabel,
  slotLabel,
  stageLabel,
} from './tamagotchi-helper'
import {
  EnumEquipmentGrade,
  EnumEquipmentSlot,
  IBattleData,
  IMonsterData,
  IRaidBattleResponse,
  IRaidBossInfo,
} from './tamagotchi-interface'
import {
  useApplyRaidResult,
  useExchangeRaid,
  useGetRaid,
  useGetWiki,
  useRaidBattle,
} from './tamagotchi-service'

interface IRaidPanelProps {
  monster: IMonsterData | null
  onError: (error: unknown) => void
}

const difficultyLabel: Record<string, string> = {
  normal: 'Normal',
  hard: 'Hard',
  nightmare: 'Nightmare',
}

const toBattleData = (result: IRaidBattleResponse): IBattleData => ({
  stageId: 'raid',
  won: result.battle.won,
  rounds: result.battle.rounds,
  events: result.battle.events,
  player: result.battle.player,
  enemy: result.battle.enemy,
  reward: 0,
  gemReward: 0,
  isFirstClear: result.isFirstClear,
  drop: null,
  dropBagFull: false,
})

const describeResult = (result: IRaidBattleResponse) => {
  if (!result.battle.won) {
    return 'แพ้... ยังเสียโควตาของวัน ลองเลี้ยงให้แข็งแรงหรือใส่อุปกรณ์เพิ่ม'
  }
  const drop = result.drop
  return [
    'ชนะ!',
    `🎖️ Raid Token +${result.raidTokens}${result.isFirstClear ? ' (ชนะครั้งแรก x2)' : ''}`,
    `🎫 Boss Token +${result.bossTokens}`,
    drop && `ได้ ${drop.emoji} ${drop.name} (${gradeLabel[drop.grade]})`,
  ]
    .filter(Boolean)
    .join(' · ')
}

const BossCard = (props: {
  boss: IRaidBossInfo
  monster: IMonsterData | null
  attemptsLeft: number
  isPending: boolean
  onFight: (difficulty: string) => void
  onError: (error: unknown) => void
}) => {
  const { boss, monster, attemptsLeft, isPending, onFight, onError } = props
  const { data: wiki } = useGetWiki()
  const { mutate: exchange, isPending: isExchanging } = useExchangeRaid()
  const [slot, setSlot] = useState<EnumEquipmentSlot>(EnumEquipmentSlot.WEAPON)
  const [grade, setGrade] = useState<EnumEquipmentGrade>(EnumEquipmentGrade.RARE)

  const set = wiki?.equipment.sets[boss.setId]
  const cost = boss.difficulties.find((entry) => entry.grade === grade)
  // The grade is only on sale once the difficulty that drops it has been cleared.
  const exchangeBlocker = !cost
    ? null
    : cost.clearCount === 0
      ? 'ต้องชนะระดับที่ดรอปเกรดนี้ก่อน'
      : boss.bossTokens < cost.exchangeCost
        ? 'Boss Token ไม่พอ'
        : null

  return (
    <Card
      size="small"
      className="dark:border-slate-700 dark:bg-slate-900"
      title={
        <span>
          {boss.emoji} {boss.name}
        </span>
      }
      extra={<Tag color="gold">🎫 {boss.bossTokens}</Tag>}
    >
      <div className="flex flex-col gap-2">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          ดรอปชิ้นของ <b>{boss.setName}</b>
          {set?.bonuses.map((bonus) => (
            <div key={bonus.pieces}>
              {bonus.pieces} ชิ้น: {describePctBonus(bonus.pct ?? {})}
              {bonus.effect && describeSetEffect(bonus.effect)}
            </div>
          ))}
        </div>
        {boss.difficulties.map((difficulty) => {
          const blocker = getRaidBlocker(monster, difficulty, attemptsLeft)
          return (
            <div key={difficulty.difficulty} className="flex items-center gap-2 text-sm">
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {difficultyLabel[difficulty.difficulty]}{' '}
                  <Tag color={gradeColor[difficulty.grade]}>{gradeLabel[difficulty.grade]}</Tag>
                </div>
                <div className="text-xs text-slate-500">
                  ต้อง{stageLabel[difficulty.minStage]}ขึ้นไป · HP {difficulty.enemy.stats.hp} · ATK{' '}
                  {difficulty.enemy.stats.atk} · 🎖️ {difficulty.raidTokens} · ชนะแล้ว{' '}
                  {difficulty.clearCount} ครั้ง
                </div>
              </div>
              <Tooltip title={blocker}>
                <Button
                  type="primary"
                  size="small"
                  disabled={!!blocker || isPending}
                  onClick={() => onFight(difficulty.difficulty)}
                >
                  ท้า
                </Button>
              </Tooltip>
            </div>
          )
        })}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-2 text-sm dark:border-slate-700">
          <span>แลกชิ้น:</span>
          <Select
            size="small"
            value={slot}
            onChange={setSlot}
            options={Object.values(EnumEquipmentSlot).map((value) => ({
              value,
              label: slotLabel[value],
            }))}
          />
          <Select
            size="small"
            value={grade}
            onChange={setGrade}
            options={[
              EnumEquipmentGrade.RARE,
              EnumEquipmentGrade.EPIC,
              EnumEquipmentGrade.LEGENDARY,
            ].map((value) => ({ value, label: gradeLabel[value] }))}
          />
          <Tooltip title={exchangeBlocker}>
            <Button
              size="small"
              disabled={!!exchangeBlocker || isExchanging}
              onClick={() => exchange({ bossId: boss.id, slot, grade }, { onError })}
            >
              แลก 🎫 {cost?.exchangeCost}
            </Button>
          </Tooltip>
        </div>
      </div>
    </Card>
  )
}

export const RaidPanel = (props: IRaidPanelProps) => {
  const { monster, onError } = props
  const { data, isLoading } = useGetRaid()
  const { mutate: fight, isPending } = useRaidBattle()
  const applyResult = useApplyRaidResult()
  const [replay, setReplay] = useState<IRaidBattleResponse | null>(null)

  if (isLoading || !data) {
    return <Spin />
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        สู้บอสเดี่ยววันละ {data.attemptsLeft} ครั้งที่เหลือ · ชนะได้ชิ้นเซ็ตการันตี 1 ชิ้น
        ไม่ใช้ตารางธาตุ ทุกสายชนะได้ทุกบอส
      </p>
      {data.bosses.map((boss) => (
        <BossCard
          key={boss.id}
          boss={boss}
          monster={monster}
          attemptsLeft={data.attemptsLeft}
          isPending={isPending}
          onError={onError}
          onFight={(difficulty) =>
            fight({ bossId: boss.id, difficulty }, { onSuccess: setReplay, onError })
          }
        />
      ))}
      <BattleModal
        battle={replay ? toBattleData(replay) : null}
        title={replay ? `ท้า ${replay.battle.enemy.name}` : undefined}
        summary={replay ? describeResult(replay) : undefined}
        onClose={() => {
          if (replay) {
            applyResult(replay)
          }
          setReplay(null)
        }}
      />
    </div>
  )
}
