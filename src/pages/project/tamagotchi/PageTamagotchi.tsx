import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Card, message, Progress, Spin, Tabs, Tag, Tooltip } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { appPath } from '../../../config/app-paths'
import { useGetMeSuspense } from '../../../service'
import { AdventurePanel } from './AdventurePanel'
import { CostumePanel } from './CostumePanel'
import { DexPanel } from './DexPanel'
import { EquipmentPanel } from './EquipmentPanel'
import { ExpeditionPanel } from './ExpeditionPanel'
import { MergeModal } from './MergeModal'
import { PassivePanel } from './PassivePanel'
import { PetSprite } from './PetSprite'
import { RenamePet } from './RenamePet'
import { StatusPanel } from './StatusPanel'
import { FriendsPanel } from './FriendsPanel'
import { WorldBossPanel } from './WorldBossPanel'
import { RaidPanel } from './RaidPanel'
import { PvpPanel } from './PvpPanel'
import { QuestPanel } from './QuestPanel'
import { ShopPanel } from './ShopPanel'
import { WikiPanel } from './WikiPanel'
import {
  actionOptions,
  deathCauseLabel,
  describeMissingConditions,
  formatAge,
  getActionBlocker,
  getEvolutionCountdown,
  lineOptions,
  MAX_HEARTS,
  petLabel,
  stageLabel,
  toHearts,
  toThaiErrorMessage,
} from './tamagotchi-helper'
import { EnumMonsterStage, IMonsterData } from './tamagotchi-interface'
import {
  useGetMonsterHistory,
  useGetMyMonster,
  useGetWallet,
  useGetWiki,
  useHatchMonster,
  useMonsterAction,
  useSelectMonster,
} from './tamagotchi-service'

const showError = (error: unknown) => {
  message.error(
    toThaiErrorMessage(error instanceof AxiosError ? error.response?.data?.message : undefined)
  )
}

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

// One slot per monster the player can raise at once; tapping a slot selects it.
const MonsterSlots = (props: {
  monsters: IMonsterData[]
  selectedId: string | undefined
  max: number
  onNewEgg: () => void
}) => {
  const { monsters, selectedId, max, onNewEgg } = props
  const { mutate: select, isPending } = useSelectMonster()
  return (
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: max }, (_, index) => {
        const monster = monsters[index]
        if (!monster) {
          return (
            <Button
              key={`empty-${index}`}
              className="!h-auto !py-2"
              onClick={onNewEgg}
              aria-label="รับไข่ใบใหม่"
            >
              <span className="flex flex-col items-center leading-tight">
                <span className="text-xl">➕</span>
                <span className="text-xs">ไข่ใหม่</span>
              </span>
            </Button>
          )
        }
        return (
          <Button
            key={monster.id}
            type={monster.id === selectedId ? 'primary' : 'default'}
            disabled={isPending}
            className="!h-auto !py-2"
            onClick={() => monster.id !== selectedId && select(monster.id, { onError: showError })}
          >
            <span className="flex flex-col items-center leading-tight">
              <span className="text-xl">{monster.isSick ? '🤒' : monster.emoji}</span>
              <span className="w-full truncate text-xs">{monster.displayName}</span>
            </span>
          </Button>
        )
      })}
    </div>
  )
}

const MonsterScreen = (props: { monster: IMonsterData; fetchedAt: number }) => {
  const { monster, fetchedAt } = props
  const now = useNow(5000)
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
    </div>
  )
}

const HallOfFame = () => {
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
            <span className="text-2xl">{monster.emoji}</span>
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

const TamagotchiGame = () => {
  const { data, isLoading, dataUpdatedAt } = useGetMyMonster()
  const queryClient = useQueryClient()
  const { data: wallet } = useGetWallet()
  const { data: wiki } = useGetWiki()
  const [isChoosingEgg, setIsChoosingEgg] = useState(false)
  const [isMerging, setIsMerging] = useState(false)
  const monster = data?.monster ?? null
  const monsters = data?.monsters ?? []
  const diedAt = monster?.diedAt

  // A new egg was hatched: back from the picker to the care screen.
  useEffect(() => {
    setIsChoosingEgg(false)
  }, [monsters.length])

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
      <MonsterSlots
        monsters={monsters}
        selectedId={monster.id}
        max={data?.maxMonsters ?? 4}
        onNewEgg={() => setIsChoosingEgg(true)}
      />
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
        <MonsterScreen key={monster.id} monster={monster} fetchedAt={dataUpdatedAt} />
      )}
    </div>
  )
}

const GameTabs = () => {
  const queryClient = useQueryClient()
  const { data: monsterData } = useGetMyMonster()
  const { data: wallet } = useGetWallet()
  const monster = monsterData?.monster ?? null
  const coin = wallet?.coin ?? 0
  const speciesId = monster?.speciesId

  // Reaching a new form can pay Dex-discovery gems on the server, so refresh the wallet and Dex.
  useEffect(() => {
    if (speciesId) {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['monster', 'dex'] })
    }
  }, [speciesId, queryClient])

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex justify-end gap-4 font-semibold">
        <span className="text-amber-600 dark:text-amber-400">🪙 {coin}</span>
        <span className="text-sky-600 dark:text-sky-400">💎 {wallet?.gem ?? 0}</span>
        <span className="text-purple-600 dark:text-purple-400">🎖️ {wallet?.raidToken ?? 0}</span>
      </div>
      <Tabs
        centered
        destroyOnHidden
        items={[
          {
            key: 'care',
            label: 'เลี้ยง',
            children: (
              <div className="flex flex-col items-center gap-8">
                <TamagotchiGame />
                <HallOfFame />
              </div>
            ),
          },
          {
            key: 'expedition',
            label: 'สำรวจ',
            children: <ExpeditionPanel monster={monster} onError={showError} />,
          },
          {
            key: 'adventure',
            label: 'ผจญภัย',
            children: <AdventurePanel monster={monster} onError={showError} />,
          },
          { key: 'quests', label: 'ภารกิจ', children: <QuestPanel onError={showError} /> },
          {
            key: 'friends',
            label: 'เพื่อน',
            children: <FriendsPanel monster={monster} onError={showError} />,
          },
          {
            key: 'world-boss',
            label: 'บอสโลก',
            children: <WorldBossPanel monster={monster} onError={showError} />,
          },
          {
            key: 'raid',
            label: 'บอส',
            children: <RaidPanel monster={monster} onError={showError} />,
          },
          {
            key: 'pvp',
            label: 'สนามประลอง',
            children: <PvpPanel monster={monster} onError={showError} />,
          },
          {
            key: 'equipment',
            label: 'อุปกรณ์',
            children: <EquipmentPanel monster={monster} coin={coin} onError={showError} />,
          },
          { key: 'passive', label: 'ต้นไม้', children: <PassivePanel onError={showError} /> },
          {
            key: 'shop',
            label: 'ร้านค้า',
            children: <ShopPanel monster={monster} coin={coin} onError={showError} />,
          },
          {
            key: 'costume',
            label: 'ชุดแต่งตัว',
            children: <CostumePanel monster={monster} onError={showError} />,
          },
          { key: 'dex', label: 'Dex', children: <DexPanel /> },
          { key: 'wiki', label: 'คู่มือ', children: <WikiPanel /> },
        ]}
      />
    </div>
  )
}

const PageTamagotchi = () => {
  const { data: getMeResponse } = useGetMeSuspense()
  if (!getMeResponse?.user?.id) {
    return (
      <Navigate to={appPath.login()} state={{ message: 'กรุณาเข้าสู่ระบบก่อนเข้าถึงหน้านี้' }} />
    )
  }

  return (
    <div className="flex min-h-full flex-col items-center gap-6 px-6 py-16">
      <div className="relative flex w-full max-w-sm items-center justify-center">
        <Link
          to={appPath.games()}
          className="absolute left-0 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          aria-label="กลับหน้าเกม"
        >
          <ArrowLeftOutlined className="text-lg" />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">มอนสเตอร์</h1>
      </div>
      <div className="flex w-full max-w-sm flex-col items-center">
        <GameTabs />
      </div>
    </div>
  )
}

export default PageTamagotchi
