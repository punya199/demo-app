import { Alert, Button, Card, Collapse, Input, Spin, Tag, Tooltip } from 'antd'
import { useState } from 'react'
import { BattleModal } from './BattleModal'
import { PvpLeaderboard } from './PvpLeaderboard'
import {
  elementLabel,
  formatRatingChange,
  getDefenseBlocker,
  getPvpBlocker,
  stageLabel,
} from './tamagotchi-helper'
import {
  IBattleData,
  IMonsterData,
  IPvpBattleResponse,
  IPvpHistoryEntry,
  IPvpReplay,
} from './tamagotchi-interface'
import {
  useApplyPvpResult,
  useClaimPvpSeason,
  useGetPvpHistory,
  useGetPvpOpponents,
  useGetPvpReplay,
  useGetPvpStatus,
  usePvpBattle,
  useSetPvpDefense,
} from './tamagotchi-service'

interface IPvpPanelProps {
  monster: IMonsterData | null
  onError: (error: unknown) => void
}

interface IModalState {
  battle: IBattleData
  summary: string
  title: string
  // Set for a fresh fight: applied to the cache when the player closes the replay.
  result: IPvpBattleResponse | null
}

const toBattleData = (
  won: boolean,
  rounds: number,
  events: IBattleData['events'],
  player: IBattleData['player'],
  enemy: IBattleData['enemy'],
  reward = 0
): IBattleData => ({
  stageId: 'pvp',
  won,
  rounds,
  events,
  player,
  enemy,
  reward,
  gemReward: 0,
  isFirstClear: false,
  drop: null,
  dropBagFull: false,
})

const describeReplay = (entry: IPvpHistoryEntry, replay: IPvpReplay) => {
  const iWon = replay.role === 'attacker' ? replay.attackerWon : !replay.attackerWon
  return `${iWon ? 'คุณชนะ' : 'คุณแพ้'}${replay.role === 'defender' ? ' (ถูกท้า)' : ''} · ${entry.opponentName}`
}

export const PvpPanel = (props: IPvpPanelProps) => {
  const { monster, onError } = props
  const { data: status, isLoading } = useGetPvpStatus()
  const { data: history } = useGetPvpHistory()
  const { mutate: setDefense, isPending: isSettingDefense } = useSetPvpDefense()
  const { mutate: fight, isPending: isFighting } = usePvpBattle()
  const { mutate: loadReplay, isPending: isLoadingReplay } = useGetPvpReplay()
  const { mutate: claim, isPending: isClaiming } = useClaimPvpSeason()
  const applyResult = useApplyPvpResult()
  const [name, setName] = useState('')
  const [modal, setModal] = useState<IModalState | null>(null)

  const blocker = getPvpBlocker(monster, status)
  const defenseBlocker = getDefenseBlocker(monster, status, new Date())
  const { data: opponents, refetch } = useGetPvpOpponents(!!status?.defense && !blocker)

  if (isLoading || !status) {
    return <Spin />
  }

  const closeModal = () => {
    if (modal?.result) {
      applyResult(modal.result)
      void refetch()
    }
    setModal(null)
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <Card size="small" className="dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">ซีซัน {status.season}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {status.rating}
              {status.rank && (
                <span className="ml-2 text-sm font-normal">อันดับ #{status.rank}</span>
              )}
            </div>
          </div>
          <div className="text-right text-sm">
            <div>
              ชนะ {status.wins} · แพ้ {status.losses}
            </div>
            <div className="text-slate-500">ท้าได้อีก {status.attemptsLeft} ครั้งวันนี้</div>
          </div>
        </div>
      </Card>

      {status.claimableSeasons.map((entry) => (
        <Alert
          key={entry.season}
          type="success"
          message={`ซีซัน ${entry.season} จบแล้ว คุณได้อันดับ #${entry.rank}`}
          action={
            entry.reward && (
              <Button
                size="small"
                type="primary"
                disabled={isClaiming}
                onClick={() => claim(entry.season, { onError })}
              >
                รับ 🪙 {entry.reward.coin} + 💎 {entry.reward.gem}
              </Button>
            )
          }
        />
      ))}

      <Card size="small" className="dark:border-slate-700 dark:bg-slate-900" title="ทีมป้องกัน">
        {status.defense ? (
          <div className="mb-2 flex items-center gap-3">
            <span className="text-3xl">{status.defense.fighter.emoji}</span>
            <div className="flex-1 text-sm">
              <div className="font-medium">
                {status.defense.displayName} · {status.defense.fighter.name}
              </div>
              <div className="text-xs text-slate-500">
                {stageLabel[status.defense.stage]} · HP {status.defense.fighter.stats.hp} · ATK{' '}
                {status.defense.fighter.stats.atk} · DEF {status.defense.fighter.stats.def} · SPD{' '}
                {status.defense.fighter.stats.spd}
              </div>
            </div>
          </div>
        ) : (
          <p className="mb-2 text-sm text-slate-500">
            ตั้งทีมป้องกันก่อนถึงจะท้าคนอื่นได้ ระบบจะจำค่าพลังของมอนตัวนี้ไว้ให้คนอื่นท้า
          </p>
        )}
        <div className="flex gap-2">
          <Input
            value={name}
            maxLength={16}
            placeholder={
              status.defense ? 'ชื่อสนาม (เว้นว่าง = ใช้ชื่อเดิม)' : 'ชื่อสนาม (ไม่ใส่ก็ได้)'
            }
            onChange={(event) => setName(event.target.value)}
          />
          <Tooltip title={defenseBlocker}>
            <Button
              type="primary"
              disabled={!!defenseBlocker || isSettingDefense}
              onClick={() => setDefense(name.trim() || undefined, { onError })}
            >
              {status.defense ? 'อัปเดตทีม' : 'ตั้งทีมป้องกัน'}
            </Button>
          </Tooltip>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          ชื่อสนามคือชื่อที่คนอื่นเห็น ระบบไม่แสดงชื่อผู้ใช้ของคุณ
        </p>
      </Card>

      <div className="font-semibold text-slate-900 dark:text-slate-100">คู่ต่อสู้</div>
      {blocker && <p className="text-sm text-slate-500">{blocker}</p>}
      {opponents?.opponents.map((opponent) => (
        <Card key={opponent.id} size="small" className="dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{opponent.emoji}</span>
            <div className="flex-1 text-sm">
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {opponent.displayName} {opponent.isNpc && <Tag>NPC</Tag>}
              </div>
              <div className="text-xs text-slate-500">
                {elementLabel[opponent.element]} · HP {opponent.stats.hp} · ATK {opponent.stats.atk}{' '}
                · เรตติ้ง {opponent.rating}
              </div>
            </div>
            <Tooltip title={blocker}>
              <Button
                type="primary"
                disabled={!!blocker || isFighting}
                onClick={() =>
                  fight(opponent.id, {
                    onSuccess: (result) =>
                      setModal({
                        battle: toBattleData(
                          result.battle.won,
                          result.battle.rounds,
                          result.battle.events,
                          result.battle.player,
                          result.battle.enemy,
                          result.battle.reward
                        ),
                        title: `ท้า ${opponent.displayName}`,
                        summary: `${result.battle.won ? 'ชนะ!' : 'แพ้...'} เรตติ้ง ${formatRatingChange(
                          result.rating.before,
                          result.rating.after
                        )} · 🪙 +${result.battle.reward}`,
                        result,
                      }),
                    onError: (error) => {
                      onError(error)
                      void refetch()
                    },
                  })
                }
              >
                ท้า
              </Button>
            </Tooltip>
          </div>
        </Card>
      ))}

      <Collapse
        items={[
          {
            key: 'history',
            label: 'ประวัติการต่อสู้',
            children: (
              <div className="flex flex-col gap-1 text-sm">
                {history?.battles.length === 0 && (
                  <span className="text-slate-500">ยังไม่มีประวัติ</span>
                )}
                {history?.battles.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-2">
                    <Tag color={entry.won ? 'green' : 'red'}>{entry.won ? 'ชนะ' : 'แพ้'}</Tag>
                    <span className="text-xl">{entry.opponentEmoji}</span>
                    <span className="flex-1 truncate">
                      {entry.role === 'defender' ? 'ถูกท้าโดย ' : 'ท้า '}
                      {entry.opponentName}
                    </span>
                    {entry.ratingAfter !== null && (
                      <span className="text-xs text-slate-500">
                        {formatRatingChange(entry.ratingBefore, entry.ratingAfter)}
                      </span>
                    )}
                    <Button
                      size="small"
                      disabled={isLoadingReplay}
                      onClick={() =>
                        loadReplay(entry.id, {
                          onSuccess: (replay) =>
                            setModal({
                              battle: toBattleData(
                                replay.attackerWon,
                                replay.rounds,
                                replay.events,
                                replay.attacker,
                                replay.defender
                              ),
                              title: 'ดูย้อนหลัง',
                              summary: describeReplay(entry, replay),
                              result: null,
                            }),
                          onError,
                        })
                      }
                    >
                      ดู
                    </Button>
                  </div>
                ))}
              </div>
            ),
          },
          { key: 'leaderboard', label: 'อันดับซีซันนี้', children: <PvpLeaderboard /> },
        ]}
      />

      <BattleModal
        battle={modal?.battle ?? null}
        onClose={closeModal}
        summary={modal?.summary}
        title={modal?.title}
      />
    </div>
  )
}
