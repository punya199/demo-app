import { PetAvatar } from './PetAvatar'
import { ResetCountdown } from './ResetCountdown'
import { Alert, Button, Card, Collapse, Progress, Select, Spin, Tag, Tooltip } from 'antd'
import { useState } from 'react'
import { ArenaBattleModal } from './ArenaBattleModal'
import {
  describeWorldBossReward,
  elementLabel,
  formatTimeLeft,
  getWorldBossBlocker,
  gradeLabel,
  petLabel,
  slotLabel,
} from './tamagotchi-helper'
import {
  EnumEquipmentGrade,
  EnumEquipmentSlot,
  IMonsterData,
  IWorldBossAttackResponse,
  IWorldBossStatus,
} from './tamagotchi-interface'
import {
  useApplyWorldBossResult,
  useClaimWorldBoss,
  useExchangeWorldBoss,
  useGetInventory,
  useGetRentable,
  useGetSkills,
  useGetWiki,
  useGetWorldBoss,
  useGetWorldBossRanking,
  useWorldBossAttack,
} from './tamagotchi-service'

interface IWorldBossPanelProps {
  monster: IMonsterData | null
  onError: (error: unknown) => void
}

const describeAttack = (result: IWorldBossAttackResponse) =>
  [
    result.ally &&
      `${result.ally.emoji} ${result.ally.name} ช่วยตี ${result.ally.damage} (ค่าเช่า 🪙 ${result.ally.fee})`,
    result.isKillingBlow ? 'ปลิดชีพบอส! 🎉' : `ทำดาเมจ ${result.damage}`,
    result.isKillingBlow && `ทำดาเมจ ${result.damage}`,
    result.battle.survived ? 'มอนยังรอดจนจบไฟต์' : 'มอนล้มก่อนจบไฟต์',
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
          <PetAvatar
            emoji={entry.emoji ?? '👤'}
            costume={entry.costume}
            scale={0.3}
            label={entry.displayName}
          />
          <span className="flex-1 truncate">{entry.displayName}</span>
          <Tag>{entry.damage}</Tag>
          <span className="w-12 text-right text-xs text-slate-500">{entry.hits} ครั้ง</span>
        </div>
      ))}
    </div>
  )
}

// What makes this week's boss different, shown under its name.
const bossTraits = (boss: IWorldBossStatus['boss']) => [
  `ธาตุ${elementLabel[boss.element]}`,
  boss.ability,
  ...(boss.shield > 0 ? [`🛡️ เกราะ ${boss.shield} ต่อการตี`] : []),
  ...(boss.enrage
    ? [`😡 โกรธตั้งแต่วินาทีที่ ${boss.enrage.sec} (โจมตี ×${boss.enrage.mult})`]
    : []),
]

export const WorldBossPanel = (props: IWorldBossPanelProps) => {
  const { monster, onError } = props
  const { data: status, isLoading } = useGetWorldBoss()
  const { data: wiki } = useGetWiki()
  const { data: inventory } = useGetInventory()
  const { data: rentable } = useGetRentable()
  const { mutate: attack, isPending } = useWorldBossAttack()
  const { mutate: claim, isPending: isClaiming } = useClaimWorldBoss()
  const { mutate: exchange, isPending: isExchanging } = useExchangeWorldBoss()
  const applyResult = useApplyWorldBossResult()
  const [replay, setReplay] = useState<IWorldBossAttackResponse | null>(null)
  const { data: skillState } = useGetSkills()
  // A friend's support unit to rent for the next hit; none = fight alone.
  const [supportId, setSupportId] = useState<string | undefined>()
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
            <div className="text-xs text-slate-500">{bossTraits(status.boss).join(' · ')}</div>
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
              {status.hitsLeft} ครั้ง
            </div>
            <div className="text-xs text-slate-500">
              🕒 ตีได้อีกครั้ง: <ResetCountdown resetsAt={status.resetsAt} />
            </div>
            <div className="text-xs text-slate-500">
              🗓️ บอสใหม่: <ResetCountdown resetsAt={status.endsAt} />
            </div>
          </div>
          <Tooltip title={blocker}>
            <Button
              type="primary"
              size="large"
              disabled={!!blocker || isPending}
              onClick={() => attack(supportId, { onSuccess: setReplay, onError })}
            >
              ⚔️ ตีบอส
            </Button>
          </Tooltip>
        </div>
      </Card>

      {rentable && rentable.units.length > 0 && (
        <Card size="small" className="dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span>เช่าตัวเพื่อนช่วยตี:</span>
            <Select
              size="small"
              className="min-w-48"
              allowClear
              placeholder="ไม่เช่า (ตีคนเดียว)"
              value={supportId}
              onChange={setSupportId}
              options={rentable.units.map((unit) => ({
                value: unit.supportId,
                label: (
                  <span className="flex items-center gap-2">
                    <PetAvatar
                      emoji={unit.emoji}
                      costume={unit.costume}
                      scale={0.3}
                      label={unit.ownerName}
                    />
                    {`${petLabel(unit.name, unit.nickname)} (${unit.ownerName}) ATK ${unit.stats.atk}`}
                  </span>
                ),
              }))}
            />
            <span className="text-xs text-slate-500">
              ค่าเช่าสูงสุด 🪙 {rentable.fee} จ่ายให้เจ้าของ ดาเมจของตัวเช่าลด HP
              บอสแต่ไม่นับอันดับของคุณ
            </span>
          </div>
        </Card>
      )}

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
            label: `แลกชิ้น${status.boss.setName} (🎫 ${tokens})`,
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

      <ArenaBattleModal
        battle={replay?.battle ?? null}
        statuses={skillState?.statuses}
        catalog={skillState?.catalog}
        title={replay ? `ตี ${replay.battle.enemy?.name}` : undefined}
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
