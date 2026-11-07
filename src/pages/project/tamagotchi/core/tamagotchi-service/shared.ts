import { QueryClient } from '@tanstack/react-query'
import { IArenaBattleData } from '../../arena/arena-interface'
import { foldSelectedMonster } from '../tamagotchi-helper'
import {
  IBattleData,
  IInventoryItem,
  IGetMyMonsterResponse,
  IMonsterData,
  IWallet,
} from '../tamagotchi-interface'

export interface IGetMonsterHistoryResponse {
  monsters: IMonsterData[]
}

export interface IBattleResponse {
  monster: IMonsterData
  battle: IBattleData
  wallet: IWallet
}

// Adventure fights run in the real-time arena.
export interface IAdventureBattleResponse {
  monster: IMonsterData
  battle: IArenaBattleData
  wallet: IWallet
}

export interface IMonsterWithWalletResponse {
  monster: IMonsterData
  wallet: IWallet
}

export interface IInventoryResponse {
  items: IInventoryItem[]
}

export const INVENTORY_KEY = ['inventory']
export const EQUIPMENT_KEY = ['equipment']
export const MY_MONSTER_KEY = ['monster', 'me']
export const WALLET_KEY = ['wallet']

// Other endpoints return only the selected monster; fold it into the cached list so the care
// tab's slots don't lose the rest until the next poll.
export const setSelectedMonster = (queryClient: QueryClient, monster: IMonsterData) => {
  queryClient.setQueryData<IGetMyMonsterResponse>(MY_MONSTER_KEY, (old) =>
    foldSelectedMonster(old, monster)
  )
}

// The server advances the monster's clock on every read, so polling keeps hearts and poops fresh.
// Each poll also marks the player online (evolution x2, stamina regains x2); TanStack Query
// pauses the interval while the tab is in the background, which is what "online" should mean.
export const REFETCH_INTERVAL_MS = 60 * 1000
