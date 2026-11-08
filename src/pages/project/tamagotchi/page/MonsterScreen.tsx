import { Button, Progress, Tag, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import {
  actionOptions,
  describeMissingConditions,
  formatAge,
  getActionBlocker,
  getReturnHomeBlocker,
  getEvolutionCountdown,
  MAX_HEARTS,
  petLabel,
  stageLabel,
  toHearts,
} from '../core/tamagotchi-helper'
import {
  EnumMonsterStage,
  IMonsterData,
  IWikiData,
  IWikiSpecies,
} from '../core/tamagotchi-interface'
import { useMonsterAction } from '../core/tamagotchi-service'
import { EvolutionTreeModal } from '../pet/EvolutionTreeModal'
import { RenamePet } from '../pet/RenamePet'
import { StatusPanel } from '../pet/StatusPanel'
import { ReturnHomeModal } from '../adventure/ReturnHomeModal'
import { PetSprite } from '../shared/PetSprite'
import { showError } from './show-error'

// Ticks once in a while so cooldown-based buttons re-enable without waiting for the next poll.
const useNow = (intervalMs: number) => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}

const Hearts = (props: { label: string; value: number }) => {
  const hearts = toHearts(props.value)
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600 dark:text-slate-300">{props.label}</span>
      <span aria-label={`${hearts}/${MAX_HEARTS}`}>
        {Array.from({ length: MAX_HEARTS }, (_, index) => (index < hearts ? '❤️' : '🤍')).join('')}
      </span>
    </div>
  )
}

const StatRow = (props: { label: string; value: string | number }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-600 dark:text-slate-300">{props.label}</span>
    <span className="font-medium text-slate-900 dark:text-slate-100">{props.value}</span>
  </div>
)

const EvolutionPanel = (props: { monster: IMonsterData; fetchedAt: number; now: Date }) => {
  const { monster, fetchedAt, now } = props
  const { evolution } = monster
  const countdown = getEvolutionCountdown(evolution, fetchedAt, now)
  const isEgg = monster.stage === EnumMonsterStage.EGG

  if (!countdown) {
    const ruleToFinal = evolution.rules[0]
    return (
      <div className="text-sm text-slate-600 dark:text-slate-300">
        {monster.stage === EnumMonsterStage.ULTIMATE
          ? '🏆 ร่างสูงสุดแล้ว'
          : ruleToFinal
            ? `ไม่ผ่านเงื่อนไข${ruleToFinal.to.name} อยู่ร่างนี้ไปจนครบอายุ`
            : 'ร่างสุดท้ายของสายนี้'}
        <div className="text-xs text-slate-500 dark:text-slate-400">
          อายุขัยเหลือ {formatAge(evolution.lifespanRemainingMinutes)}
        </div>
      </div>
    )
  }

  // A perfect form only evolves if it meets the ultimate's conditions, so show what's missing.
  const missing =
    !evolution.next && evolution.rules[0]
      ? describeMissingConditions(evolution.rules[0], monster)
      : []

  return (
    <div className="text-sm">
      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
        <span>
          {isEgg ? 'ฟักเป็น' : 'วิวัฒนาการเป็น'}{' '}
          {evolution.next
            ? `${evolution.next.emoji} ${evolution.next.name}`
            : evolution.rules[0]
              ? `${evolution.rules[0].to.emoji} ${evolution.rules[0].to.name} (ถ้าผ่านเงื่อนไข)`
              : '???'}
        </span>
        <span className="text-xs">{countdown.percent}%</span>
      </div>
      <Progress percent={countdown.percent} showInfo={false} size="small" />
      <div className="text-xs text-slate-500 dark:text-slate-400">
        ⚡ เปิดเกมไว้ (x{evolution.onlineMultiplier}): อีก ~
        {formatAge(Math.ceil(countdown.onlineMinutes))}
        {' · '}ปิดเกม: อีก ~{formatAge(Math.ceil(countdown.offlineMinutes))}
      </div>
      {missing.length > 0 && (
        <div className="text-xs text-amber-600 dark:text-amber-400">
          ยังขาด: {missing.join(' · ')}
        </div>
      )}
    </div>
  )
}

export const MonsterScreen = (props: {
  monster: IMonsterData
  fetchedAt: number
  species: IWikiSpecies[] | undefined
  petCore: IWikiData['petCore'] | undefined
}) => {
  const { monster, fetchedAt, species, petCore } = props
  const now = useNow(5000)
  const [isTreeOpen, setIsTreeOpen] = useState(false)
  const [isReturning, setIsReturning] = useState(false)
  const returnBlocker = getReturnHomeBlocker(monster, petCore?.stages)
  const { mutate: act, isPending } = useMonsterAction()
  const isEgg = monster.stage === EnumMonsterStage.EGG

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-[2rem] border-4 border-slate-300 bg-slate-100 p-4 shadow-lg dark:border-slate-600 dark:bg-slate-800">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex min-w-0 items-center gap-1">
            <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
              {petLabel(monster.name, monster.nickname)}
            </span>
            <RenamePet monster={monster} onError={showError} />
          </span>
          <Tag color="blue">{stageLabel[monster.stage]}</Tag>
        </div>
        <div className="rounded-2xl bg-lime-100 p-4 dark:bg-lime-200">
          <PetSprite
            emoji={monster.emoji}
            isSick={monster.isSick}
            isEgg={isEgg}
            costume={monster.costume}
          />
          <div className="h-7 text-center text-xl" aria-label={`อึ ${monster.poops} กอง`}>
            {'💩'.repeat(monster.poops)}
          </div>
        </div>
        <div className="mt-3">
          <EvolutionPanel monster={monster} fetchedAt={fetchedAt} now={now} />
          {species && (
            <>
              <Button size="small" className="mt-2" onClick={() => setIsTreeOpen(true)}>
                🌳 สายวิวัฒนาการ
              </Button>
              <EvolutionTreeModal
                open={isTreeOpen}
                monster={monster}
                species={species}
                onClose={() => setIsTreeOpen(false)}
              />
            </>
          )}
        </div>
        {!isEgg && (
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <StatusPanel monster={monster} />
            <Hearts label="ความอิ่ม" value={monster.fullness} />
            <Hearts label="ความแข็งแรง" value={monster.strength} />
            <StatRow label="น้ำหนัก" value={`${monster.weight} g`} />
            <StatRow label="อายุ" value={formatAge(monster.ageMinutes)} />
            <StatRow label="ฝึกในร่างนี้" value={`${monster.trainCount} ครั้ง`} />
            <StatRow label="ดูแลพลาดในร่างนี้" value={`${monster.careMistakes} ครั้ง`} />
            <StatRow label="ผลการต่อสู้" value={`ชนะ ${monster.wins} · แพ้ ${monster.losses}`} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {actionOptions.map((option) => {
          const blocker = getActionBlocker(monster, option.action, now)
          return (
            <Tooltip key={option.action} title={blocker}>
              <Button
                size="large"
                disabled={!!blocker || isPending}
                onClick={() =>
                  act({ type: option.action, monsterId: monster.id }, { onError: showError })
                }
                className="!h-auto !px-1 !py-2"
              >
                <span className="flex flex-col items-center leading-tight">
                  <span className="text-xl">{option.emoji}</span>
                  <span className="text-xs">{option.label}</span>
                </span>
              </Button>
            </Tooltip>
          )
        })}
      </div>
      {!isEgg && petCore && (
        <>
          <Tooltip title={returnBlocker}>
            <Button disabled={!!returnBlocker} onClick={() => setIsReturning(true)}>
              🌠 กลับดาว
            </Button>
          </Tooltip>
          <ReturnHomeModal
            open={isReturning}
            onClose={() => setIsReturning(false)}
            monster={monster}
            petCore={petCore}
            onError={showError}
          />
        </>
      )}
    </div>
  )
}
