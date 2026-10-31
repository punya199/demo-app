import { Alert, Button, Card, Collapse, Progress, Select, Spin, Tag, Tooltip } from 'antd'
import { useState } from 'react'
import { BattleModal } from './BattleModal'
import {
  describeWorldBossReward,
  formatTimeLeft,
  getWorldBossBlocker,
  gradeLabel,
  slotLabel,
} from './tamagotchi-helper'
import {
  EnumEquipmentGrade,
  EnumEquipmentSlot,
  IBattleData,
  IMonsterData,
  IWorldBossAttackResponse,
} from './tamagotchi-interface'
import {
  useApplyWorldBossResult,
  useClaimWorldBoss,
  useExchangeWorldBoss,
  useGetInventory,
  useGetWiki,
  useGetWorldBoss,
  useGetWorldBossRanking,
  useWorldBossAttack,
} from './tamagotchi-service'

interface IWorldBossPanelProps {
  monster: IMonsterData | null
  onError: (error: unknown) => void
}

const toBattleData = (result: IWorldBossAttackResponse): IBattleData => ({
  stageId: 'world-boss',
  won: result.isKillingBlow,
  rounds: result.battle.rounds,
  events: result.battle.events,
  player: result.battle.player,
  enemy: result.battle.enemy,
  reward: 0,
  gemReward: 0,
  isFirstClear: false,
  drop: null,
  dropBagFull: false,
})

const describeAttack = (result: IWorldBossAttackResponse) =>
  [
    result.isKillingBlow ? 'ปลิดชีพบอส! 🎉' : `ทำดาเมจ ${result.damage}`,
    result.isKillingBlow && `ทำดาเมจ ${result.damage}`,
    result.battle.survived ? 'มอนยังรอดครบรอบ' : 'มอนล้มก่อนครบรอบ',
    `บอสเหลือ ${result.bossHp}/${result.maxHp}`,
  ]
    .filter(Boolean)
    .join(' · ')

const RankingList = () => {
  const { data, isLoading } = useGetWorldBossRanking()
  if (isLoading || !data) {
    return <Spin />
  }
  if (data.entries.length === 0) {
    return <span className="text-sm text-slate-500">ยังไม่มีใครตีบอสสัปดาห์นี้</span>
  }
  return (
    <div className="flex flex-col gap-1 text-sm">
      {data.entries.map((entry) => (
        <div
          key={`${entry.rank}-${entry.displayName}`}
          className={`flex items-center gap-2 rounded px-2 py-1 ${
            entry.isMe ? 'bg-amber-100 dark:bg-amber-900/30' : ''
          }`}
        >
          <span className="w-8 text-right font-semibold">#{entry.rank}</span>
          <span className="text-xl">{entry.emoji ?? '👤'}</span>
          <span className="flex-1 truncate">{entry.displayName}</span>
          <Tag>{entry.damage}</Tag>
          <span className="w-12 text-right text-xs text-slate-500">{entry.hits} ครั้ง</span>
        </div>
      ))}
    </div>
  )
}

export const WorldBossPanel = (props: IWorldBossPanelProps) => {
  const { monster, onError } = props
  const { data: status, isLoading } = useGetWorldBoss()
  const { data: wiki } = useGetWiki()
  const { data: inventory } = useGetInventory()
  const { mutate: attack, isPending } = useWorldBossAttack()
  const { mutate: claim, isPending: isClaiming } = useClaimWorldBoss()
  const { mutate: exchange, isPending: isExchanging } = useExchangeWorldBoss()
  const applyResult = useApplyWorldBossResult()
  const [replay, setReplay] = useState<IWorldBossAttackResponse | null>(null)
  const [slot, setSlot] = useState<EnumEquipmentSlot>(EnumEquipmentSlot.WEAPON)
  const [grade, setGrade] = useState<EnumEquipmentGrade>(EnumEquipmentGrade.RARE)

  if (isLoading || !status) {
    return <Spin />
  }

  const blocker = getWorldBossBlocker(monster, status)
  const tokens =
    inventory?.items.find((item) => item.itemId === `boss_token:${status.boss.id}`)?.quantity ?? 0
  const exchangeCost = wiki?.raid.exchangeCost[grade]
  const exchangeBlocker =
    exchangeCost !== undefined && tokens < exchangeCost ? 'Boss Token ไม่พอ' : null
  const hpPercent = Math.round((status.boss.hp / status.boss.maxHp) * 100)

  return (
    <div className="flex w-full flex-col gap-3">
      <Card size="small" className="dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{status.boss.emoji}</span>
          <div className="flex-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {status.boss.name} <Tag>{status.week}</Tag>
            </div>
            <Progress
              percent={hpPercent}
              status={status.boss.isDefeated ? 'success' : 'exception'}
              format={() => `${status.boss.hp}/${status.boss.maxHp}`}
            />
            <div className="text-xs text-slate-500">
              {status.boss.isDefeated
                ? 'บอสถูกล้มแล้ว 🎉'
                : `จบใน ${formatTimeLeft(status.endsAt, new Date())}`}{' '}
              · ผู้ร่วมตี {status.participants} คน
            </div>
          </div>
        </div>
      </Card>

      <Card size="small" className="dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between text-sm">
          <div>
            <div>
              ดาเมจของคุณ <b>{status.myDamage}</b> ({status.myHits} ครั้ง)
            </div>
            <div className="text-xs text-slate-500">
              {status.myRank ? `อันดับ #${status.myRank}` : 'ยังไม่ได้ตี'} · ตีได้อีก{' '}
              {status.hitsLeft} ครั้งวันนี้
            </div>
          </div>
          <Tooltip title={blocker}>
            <Button
              type="primary"
              size="large"
              disabled={!!blocker || isPending}
              onClick={() => attack(undefined, { onSuccess: setReplay, onError })}
            >
              ⚔️ ตีบอส
            </Button>
          </Tooltip>
        </div>
      </Card>

      {status.claimable.map((entry) => (
        <Alert
          key={entry.week}
          type="success"
          message={`${entry.bossName} สัปดาห์ ${entry.week}: คุณได้อันดับ #${entry.rank}${
            entry.defeated ? ' (ล้มบอสได้!)' : ''
          }`}
          description={describeWorldBossReward(entry.reward)}
          action={
            <Button
              size="small"
              type="primary"
              disabled={isClaiming}
              onClick={() => claim(entry.week, { onError })}
            >
              รับรางวัล
            </Button>
          }
        />
      ))}

      <Collapse
        items={[
          { key: 'ranking', label: 'อันดับดาเมจสัปดาห์นี้', children: <RankingList /> },
          {
            key: 'exchange',
            label: `แลกชิ้นชุดสายฟ้าเร็ว (🎫 ${tokens})`,
            children: (
              <div className="flex flex-wrap items-center gap-2 text-sm">
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
                  options={[EnumEquipmentGrade.RARE, EnumEquipmentGrade.EPIC].map((value) => ({
                    value,
                    label: gradeLabel[value],
                  }))}
                />
                <Tooltip title={exchangeBlocker}>
                  <Button
                    size="small"
                    disabled={!!exchangeBlocker || isExchanging}
                    onClick={() => exchange({ bossId: status.boss.id, slot, grade }, { onError })}
                  >
                    แลก 🎫 {exchangeCost}
                  </Button>
                </Tooltip>
                <span className="text-xs text-slate-500">ต้องเคยรับรางวัลบอสนี้แล้ว</span>
              </div>
            ),
          },
        ]}
      />

      <BattleModal
        battle={replay ? toBattleData(replay) : null}
        title={replay ? `ตี ${replay.battle.enemy.name}` : undefined}
        summary={replay ? describeAttack(replay) : undefined}
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
