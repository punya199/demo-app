import { ArrowLeftOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import { ReactNode, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { appPath } from '../../../config/app-paths'
import { useGetMeSuspense } from '../../../service'
import { AdventurePanel } from './adventure/AdventurePanel'
import { CostumePanel } from './equipment/CostumePanel'
import { DexPanel } from './pet/DexPanel'
import { EquipmentPanel } from './equipment/EquipmentPanel'
import { ExpeditionPanel } from './adventure/ExpeditionPanel'
import { PassivePanel } from './pet/PassivePanel'
import { FriendsPanel } from './social/FriendsPanel'
import { WorldBossPanel } from './boss/WorldBossPanel'
import { DummyPanel } from './arena/DummyPanel'
import { RaidPanel } from './boss/RaidPanel'
import { CraftPanel } from './equipment/CraftPanel'
import { FarmPanel } from './farm/FarmPanel'
import { PvpPanel } from './arena/PvpPanel'
import { QuestPanel } from './adventure/QuestPanel'
import { ShopPanel } from './social/ShopPanel'
import { MarketPanel } from './market/MarketPanel'
import { SkillsPanel } from './pet/SkillsPanel'
import { WikiPanel } from './wiki/WikiPanel'
import { PatchNotesPanel } from './meta/PatchNotesPanel'
import { GameMenuKey } from './core/game-menu'
import { ActivePetBar } from './page/ActivePetBar'
import { GameMenu } from './page/GameMenu'
import { useMenuFromHash, usePatchUnread } from './page/game-menu-hooks'
import { showError } from './page/show-error'
import { HallOfFamePanel } from './page/HallOfFamePanel'
import { TamagotchiGame } from './page/TamagotchiGame'

import { useGetMyMonster, useGetWallet } from './core/tamagotchi-service'

const GameShell = () => {
  const queryClient = useQueryClient()
  const { data: monsterData } = useGetMyMonster()
  const { data: wallet } = useGetWallet()
  const [menu, setMenu] = useMenuFromHash()
  const isPatchUnread = usePatchUnread(menu)
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
    care: <TamagotchiGame isChoosingEgg={isChoosingEgg} setIsChoosingEgg={setIsChoosingEgg} />,
    equipment: <EquipmentPanel monster={monster} coin={coin} onError={showError} />,
    skills: <SkillsPanel monster={monster} onError={showError} />,
    passive: <PassivePanel onError={showError} />,
    costume: <CostumePanel monster={monster} onError={showError} />,
    shop: <ShopPanel monster={monster} coin={coin} onError={showError} />,
    market: <MarketPanel gem={wallet?.gem ?? 0} onError={showError} />,
    craft: <CraftPanel onError={showError} />,
    farm: <FarmPanel onError={showError} />,
    adventure: <AdventurePanel monster={monster} onError={showError} />,
    expedition: <ExpeditionPanel monster={monster} onError={showError} />,
    raid: <RaidPanel monster={monster} onError={showError} />,
    'world-boss': <WorldBossPanel monster={monster} onError={showError} />,
    dummy: <DummyPanel monster={monster} onError={showError} />,
    pvp: <PvpPanel monster={monster} onError={showError} />,
    quests: <QuestPanel onError={showError} />,
    friends: <FriendsPanel monster={monster} onError={showError} />,
    dex: <DexPanel />,
    'hall-of-fame': <HallOfFamePanel />,
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
          <GameMenu active={menu} onSelect={setMenu} hasUnreadPatch={isPatchUnread} />
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
