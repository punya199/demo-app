import { Button, Modal, Progress, Segmented } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { ArenaReplay } from './ArenaReplay'
import {
  ARENA_TICK,
  describeArenaEvent,
  fighterCooldowns,
  formatNumber,
  IArenaCooldown,
  StatusMap,
  statusesFromBits,
} from './arena-helper'
import { IArenaBattleData, IArenaFight, IArenaSkill, StatusId } from './arena-interface'
import { gradeLabel } from './tamagotchi-helper'

interface IArenaBattleModalProps {
  // Adventure fights bring their rewards; the other modes say the result in `summary`.
  battle: (IArenaFight & Partial<IArenaBattleData>) | null
  statuses: StatusMap | undefined
  catalog: IArenaSkill[] | undefined
  onClose: () => void
  // Close by itself this long after the replay ends (auto-battle); omit to wait for the player.
  autoCloseMs?: number
  title?: string
  // Replaces the result block once the replay ends.
  summary?: string
}

const TONE_CLASS: Record<string, string> = {
  crit: 'text-amber-500',
  dodge: 'text-cyan-500',
  bad: 'text-rose-500',
  good: 'text-emerald-500',
  ko: 'font-bold text-rose-600',
  '': 'text-slate-700 dark:text-slate-200',
}

// One skill's icon: a shade drains away as it recovers, with the seconds left on top.
const CooldownChip = ({ cooldown }: { cooldown: IArenaCooldown }) => {
  const { name, icon, left, fraction } = cooldown
  const isReady = left <= 0
  const label = `${name} · ${isReady ? 'พร้อมใช้' : `อีก ${formatNumber(left)} วิ`}`
  return (
    <div
      title={label}
      aria-label={label}
      className={`relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border text-base ${
        isReady
          ? 'border-emerald-400 bg-emerald-400/15'
          : 'border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700'
      }`}
    >
      {icon}
      {!isReady && (
        <>
          <span
            className="absolute inset-x-0 bottom-0 bg-slate-900/60"
            style={{ height: `${fraction * 100}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white tabular-nums [text-shadow:0_1px_2px_#000]">
            {Math.ceil(left)}
          </span>
        </>
      )}
    </div>
  )
}

// Plays the server's recorded arena fight, then shows the result.
export const ArenaBattleModal = (props: IArenaBattleModalProps) => {
  const { battle, statuses, catalog, onClose, autoCloseMs, title, summary } = props
  const [tick, setTick] = useState(0)
  const [speed, setSpeed] = useState(1)
  // "Skip" fast-forwards this fight only; the chosen 1x/2x/4x carries over to the next fight.
  const [skipping, setSkipping] = useState(false)
  const replay = battle?.replay ?? null
  const lastTick = replay ? (replay.frames.length - 1) * replay.step : 0
  const isFinished = !replay || tick >= lastTick

  useEffect(() => {
    setTick(0)
    setSkipping(false)
  }, [battle])

  useEffect(() => {
    if (!battle || !isFinished || autoCloseMs === undefined) return
    const timer = setTimeout(onClose, autoCloseMs)
    return () => clearTimeout(timer)
  }, [battle, isFinished, autoCloseMs, onClose])

  const skills = useMemo(() => {
    const map: Record<string, IArenaSkill> = {}
    for (const skill of [...(catalog ?? []), ...(battle?.enemy?.skills ?? [])])
      map[skill.id] = skill
    return map
  }, [catalog, battle])

  if (!battle) return null

  const statusOrder = statuses ? (Object.keys(statuses) as StatusId[]) : []
  const row = (idx: number) => {
    if (!replay) return null
    return replay.frames[Math.min(replay.frames.length - 1, Math.floor(tick / replay.step))].f[idx]
  }
  const log =
    replay && statuses
      ? replay.events
          .filter((e) => e.t <= tick)
          .map((e) => ({ e, line: describeArenaEvent(e, replay.fighters, statuses) }))
          .filter((x) => x.line)
          .slice(-6)
          .reverse()
      : []

  return (
    <Modal
      open
      onCancel={onClose}
      width={760}
      title={
        title ??
        `${battle.player.emoji} ${battle.player.name} ปะทะ ${battle.enemy?.emoji ?? ''} ${battle.enemy?.name ?? ''}`
      }
      footer={
        isFinished ? (
          <Button type="primary" onClick={onClose}>
            ปิด
          </Button>
        ) : (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Segmented
              size="small"
              value={speed}
              onChange={(value) => setSpeed(Number(value))}
              options={[
                { label: '1x', value: 1 },
                { label: '2x', value: 2 },
                { label: '4x', value: 4 },
              ]}
            />
            <Button size="small" onClick={() => setSkipping(true)}>
              ข้าม
            </Button>
          </div>
        )
      }
    >
      {replay && statuses ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            {replay.fighters.map((f) => {
              const r = row(f.idx)
              const hp = r ? r[2] : f.hp
              const shield = r ? r[8] : 0
              const bits = r ? r[9] : 0
              return (
                <div key={f.idx} className={f.team === 1 ? 'text-right' : ''}>
                  <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {f.emoji} {f.name}
                    {f.boss && <span className="ml-1 text-xs text-rose-500">บอส</span>}
                  </div>
                  <Progress
                    percent={Math.round((hp / f.maxHp) * 100)}
                    showInfo={false}
                    strokeColor={hp * 100 < f.maxHp * 30 ? '#ff5d62' : '#4fd47c'}
                    size="small"
                  />
                  <div className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                    {hp} / {f.maxHp}
                    {shield > 0 ? ` +โล่ ${shield}` : ''}{' '}
                    {statusesFromBits(bits, statusOrder).map((id) => (
                      <span key={id} title={statuses[id].label}>
                        {statuses[id].icon}
                      </span>
                    ))}
                  </div>
                  {r && (
                    <div
                      className={`mt-1 flex flex-wrap gap-1 ${f.team === 1 ? 'justify-end' : ''}`}
                    >
                      {fighterCooldowns(r, f, skills).map((cooldown) => (
                        <CooldownChip key={cooldown.id} cooldown={cooldown} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <ArenaReplay
            replay={replay}
            statuses={statuses}
            skills={skills}
            speed={skipping ? 1000 : speed}
            onTick={setTick}
          />
          <div className="text-right text-xs text-slate-500 tabular-nums dark:text-slate-400">
            {Math.floor(tick / ARENA_TICK)} / {Math.floor(lastTick / ARENA_TICK)} วินาที
          </div>
          <ol className="flex max-h-36 flex-col gap-0.5 overflow-y-auto text-sm">
            {log.map(({ e, line }, i) => (
              <li key={`${e.t}-${i}`} className={TONE_CLASS[line?.[0] ?? '']}>
                {line?.[1]}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          ต่อสู้อัตโนมัติ (ไม่แสดงการต่อสู้)
        </p>
      )}
      {isFinished && summary && (
        <div className="mt-3 rounded-lg bg-slate-100 p-3 text-center text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {summary}
        </div>
      )}
      {isFinished && !summary && (
        <div className="mt-3 rounded-lg bg-slate-100 p-3 text-center dark:bg-slate-800">
          <div className={`text-lg font-bold ${battle.won ? 'text-emerald-600' : 'text-rose-600'}`}>
            {battle.won ? 'ชนะ!' : 'แพ้'} · {battle.rounds} วินาที
          </div>
          {battle.won && (
            <div className="text-sm text-slate-700 dark:text-slate-200">
              🪙 {battle.reward}
              {battle.gemReward ? ` · 💎 ${battle.gemReward}` : ''}
              {battle.isFirstClear ? ' (ชนะครั้งแรก)' : ''}
            </div>
          )}
          {battle.drop && (
            <div className="text-sm text-slate-700 dark:text-slate-200">
              ได้อุปกรณ์: {battle.drop.name} ({gradeLabel[battle.drop.grade]})
            </div>
          )}
          {battle.dropBagFull && (
            <div className="text-sm text-amber-600">กระเป๋าเต็ม อุปกรณ์ที่ดรอปหายไป</div>
          )}
        </div>
      )}
    </Modal>
  )
}
