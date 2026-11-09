import type { IArenaEnemy } from '../../arena/arena-interface'
import type { EnumMonsterStage, IBattleStats } from './monster'
import type { IFighterEffects } from './equipment'
import type { ILoadout } from './progression'

export interface IAdventureStage {
  id: string
  isBoss: boolean
  // The stage's arena enemy (adventure fights run in the real-time arena).
  enemy: IArenaEnemy | null
  reward: number
  firstClearReward: number
  firstClearGems: number
  clearCount: number
  unlocked: boolean
}

export interface IAdventureArea {
  id: string
  name: string
  emoji: string
  recommendedStage: EnumMonsterStage
  stages: IAdventureStage[]
}

export interface IShopItem {
  id: string
  name: string
  emoji: string
  description: string
  price: number
}

export interface IInventoryItem {
  itemId: string
  quantity: number
}

export interface IQuest {
  id: string
  name: string
  emoji: string
  target: number
  coinReward: number
  gemReward: number
  progress: number
  claimed: boolean
}

export interface ILoginReward {
  coin: number
  gem: number
  items?: { itemId: string; qty: number }[]
  // Mystery box size, opened on the spot when the slot is claimed.
  box?: 'S' | 'M' | 'L'
  costume?: string
}

// What a login claim actually paid (box prizes included).
export interface ILoginGranted {
  coin: number
  gem: number
  items: { itemId: string; qty: number }[]
  costume: string | null
}

export interface IQuestsData {
  date: string
  resetsAt: string
  quests: IQuest[]
  weekly: { week: string; resetsAt: string; quests: IQuest[] }
  login: {
    claimedToday: boolean
    // Claims made this month.
    claimed: number
    // 1-based slot of the 28-day board: today's reward if claimed, otherwise the next one.
    day: number
    // Null once all 28 slots are claimed.
    reward: ILoginReward | null
    rewards: ILoginReward[]
  }
}

export interface IExpeditionArea {
  id: string
  name: string
  emoji: string
  unlocked: boolean
  baseRatePerHour: number
  // What this monster earns here per hour; null without a hatched monster.
  ratePerHour: number | null
}

export interface IExpeditionData {
  maxMinutes: number
  areas: IExpeditionArea[]
}

export interface IExpeditionSummary {
  areaId: string
  minutes: number
  coins: number
  items: string[]
}

export interface IProfile {
  displayName: string
  friendCode: string
}

export interface IFriend {
  relationId: string
  displayName: string
  monster: {
    emoji: string
    sprite?: string | null
    stage: EnumMonsterStage
    costume: ILoadout | null
  } | null
  points: number
  hasSupport: boolean
  canGreet: boolean
}

export interface IFriendRequest {
  relationId: string
  displayName: string
}

export interface IFriendsData {
  friendLimit: number
  giftsLeft: number
  friends: IFriend[]
  incoming: IFriendRequest[]
  outgoing: IFriendRequest[]
}

export interface IFriendVisit {
  displayName: string
  points: number
  monster: {
    emoji: string
    name: string
    sprite?: string | null
    nickname: string | null
    costume: ILoadout | null
    stage: EnumMonsterStage
    ageMinutes: number
    isSick: boolean
    isExploring: boolean
    wins: number
    losses: number
    stats: IBattleStats
  } | null
}

export interface ISupportUnit {
  supportId: string
  emoji: string
  name: string
  nickname: string | null
  stage: EnumMonsterStage
  stats: IBattleStats
  effects: IFighterEffects | null
  setAt: string
  readyAt: string
}

export interface IRentableUnit extends ISupportUnit {
  ownerName: string
  costume: ILoadout | null
}
