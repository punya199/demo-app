import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Card, message, Progress, Spin, Tag, Tooltip } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { ReactNode, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { appPath } from '../../../config/app-paths'
import { useGetMeSuspense } from '../../../service'
import { AdventurePanel } from './AdventurePanel'
import { CostumePanel } from './CostumePanel'
import { DexPanel } from './DexPanel'
import { EquipmentPanel } from './EquipmentPanel'
import { EvolutionTreeModal } from './EvolutionTreeModal'
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
import { PatchNotesPanel } from './PatchNotesPanel'
import { GAME_MENU, GameMenuKey, parseMenuHash } from './game-menu'
import {
  actionOptions,
  deathCauseLabel,
  describeMissingConditions,
  elementLabel,
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
import { EnumMonsterStage, IMonsterData, IWikiSpecies } from './tamagotchi-interface'
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
  onSelected: () => void
}) => {
  const { monsters, selectedId, max, onNewEgg, onSelected } = props
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
            onClick={() =>
              monster.id === selectedId
                ? onSelected()
                : select(monster.id, { onError: showError, onSuccess: onSelected })
            }
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

const MonsterScreen = (props: {
  monster: IMonsterData
  fetchedAt: number
  species: IWikiSpecies[] | undefined
}) => {
  const { monster, fetchedAt, species } = props
  const now = useNow(5000)
  const [isTreeOpen, setIsTreeOpen] = useState(false)
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

const TamagotchiGame = (props: {
  isChoosingEgg: boolean
  setIsChoosingEgg: (value: boolean) => void
}) => {
  const { isChoosingEgg, setIsChoosingEgg } = props
  const { data, isLoading, dataUpdatedAt } = useGetMyMonster()
  const queryClient = useQueryClient()
  const { data: wallet } = useGetWallet()
  const { data: wiki } = useGetWiki()
  const [isMerging, setIsMerging] = useState(false)
  const monster = data?.monster ?? null
  // Fixed slot order (oldest first), whichever pet is selected.
  const monsters = [...(data?.monsters ?? [])].sort(
    (a, b) => new Date(a.bornAt).getTime() - new Date(b.bornAt).getTime()
  )
  const diedAt = monster?.diedAt

  // A new egg was hatched: back from the picker to the care screen.
  useEffect(() => {
    setIsChoosingEgg(false)
  }, [monsters.length, setIsChoosingEgg])

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
        <MonsterScreen
          key={monster.id}
          monster={monster}
          fetchedAt={dataUpdatedAt}
          species={wiki?.evolution.species}
        />
      )}
    </div>
  )
}

// The selected pet, shown above every screen: who the actions and fights apply to.
const ActivePetBar = (props: {
  monster: IMonsterData | null
  monsters: IMonsterData[]
  max: number
  onNewEgg: () => void
}) => {
  const { monster, monsters, max, onNewEgg } = props
  const [isPicking, setIsPicking] = useState(false)
  const isEgg = monster?.stage === EnumMonsterStage.EGG

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <div className="flex items-center gap-2">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-lime-100 text-2xl dark:bg-lime-200">
          {monster ? (monster.isSick ? '🤒' : monster.emoji) : '🥚'}
        </div>
        <div className="min-w-0 flex-1">
          {monster ? (
            <>
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {monster.displayName}
                <span className="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">
                  {stageLabel[monster.stage]} · {elementLabel[monster.line]}
                </span>
              </div>
              {!isEgg && !monster.diedAt && (
                <div className="flex flex-wrap gap-x-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    อิ่ม {toHearts(monster.fullness)}/{MAX_HEARTS}
                  </span>
                  <span>
                    แรง {toHearts(monster.strength)}/{MAX_HEARTS}
                  </span>
                  <span>⚡ {Math.floor(monster.stamina)}</span>
                  {monster.isSick && <span className="text-red-500">ป่วย</span>}
                  {monster.expeditionAreaId && <span className="text-sky-600">ออกสำรวจ</span>}
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-400">ยังไม่มีมอน</div>
          )}
        </div>
        {monsters.length > 0 && (
          <Button
            size="small"
            onClick={() => setIsPicking((value) => !value)}
            aria-expanded={isPicking}
          >
            เปลี่ยน {isPicking ? '▴' : '▾'}
          </Button>
        )}
      </div>
      {isPicking && (
        <div className="mt-2">
          <MonsterSlots
            monsters={monsters}
            selectedId={monster?.id}
            max={max}
            onNewEgg={() => {
              setIsPicking(false)
              onNewEgg()
            }}
            onSelected={() => setIsPicking(false)}
          />
        </div>
      )}
    </div>
  )
}

const GameMenu = (props: { active: GameMenuKey; onSelect: (key: GameMenuKey) => void }) => (
  <nav aria-label="เมนูเกม" className="flex flex-col gap-2">
    {GAME_MENU.map((group) => (
      <div key={group.title}>
        <div className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {group.title}
        </div>
        <div className="grid grid-cols-5 gap-1.5 lg:grid-cols-3">
          {group.items.map((item) => {
            const isActive = item.key === props.active
            return (
              <button
                key={item.key}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => props.onSelect(item.key)}
                className={`flex min-h-14 flex-col items-center justify-center rounded-lg border px-1 py-1.5 text-center text-[11px] leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 ${
                  isActive
                    ? 'border-amber-500 bg-amber-50 font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                }`}
              >
                <span className="text-lg">{item.emoji}</span>
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    ))}
  </nav>
)

// Which screen is open lives in the URL hash, so a reload or a shared link keeps it.
const useMenuFromHash = () => {
  const [menu, setMenu] = useState<GameMenuKey>(() => parseMenuHash(window.location.hash))
  useEffect(() => {
    const onHashChange = () => setMenu(parseMenuHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  const select = (key: GameMenuKey) => {
    window.history.replaceState(null, '', `#${key}`)
    setMenu(key)
  }
  return [menu, select] as const
}

const GameShell = () => {
  const queryClient = useQueryClient()
  const { data: monsterData } = useGetMyMonster()
  const { data: wallet } = useGetWallet()
  const [menu, setMenu] = useMenuFromHash()
  const [isChoosingEgg, setIsChoosingEgg] = useState(false)
  const monster = monsterData?.monster ?? null
  const monsters = [...(monsterData?.monsters ?? [])].sort(
    (a, b) => new Date(a.bornAt).getTime() - new Date(b.bornAt).getTime()
  )
  const coin = wallet?.coin ?? 0
  const speciesId = monster?.speciesId

  // Reaching a new form can pay Dex-discovery gems on the server, so refresh the wallet and Dex.
  useEffect(() => {
    if (speciesId) {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['monster', 'dex'] })
    }
  }, [speciesId, queryClient])

  const panels: Record<GameMenuKey, ReactNode> = {
    care: (
      <div className="flex flex-col items-center gap-8">
        <TamagotchiGame isChoosingEgg={isChoosingEgg} setIsChoosingEgg={setIsChoosingEgg} />
        <HallOfFame />
      </div>
    ),
    equipment: <EquipmentPanel monster={monster} coin={coin} onError={showError} />,
    passive: <PassivePanel onError={showError} />,
    costume: <CostumePanel monster={monster} onError={showError} />,
    shop: <ShopPanel monster={monster} coin={coin} onError={showError} />,
    adventure: <AdventurePanel monster={monster} onError={showError} />,
    expedition: <ExpeditionPanel monster={monster} onError={showError} />,
    raid: <RaidPanel monster={monster} onError={showError} />,
    'world-boss': <WorldBossPanel monster={monster} onError={showError} />,
    pvp: <PvpPanel monster={monster} onError={showError} />,
    quests: <QuestPanel onError={showError} />,
    friends: <FriendsPanel monster={monster} onError={showError} />,
    dex: <DexPanel />,
    wiki: <WikiPanel />,
    'patch-notes': <PatchNotesPanel />,
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex justify-end gap-4 text-sm font-semibold">
        <span className="text-amber-600 dark:text-amber-400">🪙 {coin}</span>
        <span className="text-sky-600 dark:text-sky-400">💎 {wallet?.gem ?? 0}</span>
        <span className="text-purple-600 dark:text-purple-400">🎖️ {wallet?.raidToken ?? 0}</span>
      </div>
      {/* Phone: pet bar (sticky), menu and screen stack in one column. Wide screens: the pet bar
          and menu stay put in a side column next to the screen. */}
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        <aside className="contents lg:sticky lg:top-4 lg:flex lg:flex-col lg:gap-4">
          <div className="sticky top-0 z-20 lg:static">
            <ActivePetBar
              monster={monster}
              monsters={monsters}
              max={monsterData?.maxMonsters ?? 4}
              onNewEgg={() => {
                setIsChoosingEgg(true)
                setMenu('care')
              }}
            />
          </div>
          <GameMenu active={menu} onSelect={setMenu} />
        </aside>
        <section className="min-w-0" aria-live="polite">
          {panels[menu]}
        </section>
      </div>
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
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 sm:py-12">
      <div className="relative flex w-full items-center justify-center">
        <Link
          to={appPath.games()}
          className="absolute left-0 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          aria-label="กลับหน้าเกม"
        >
          <ArrowLeftOutlined className="text-lg" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">มอนสเตอร์</h1>
      </div>
      <GameShell />
    </div>
  )
}

export default PageTamagotchi
