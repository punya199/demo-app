import type { IArenaFight } from '../../arena/arena-interface'
import type {
  EnumMonsterLine,
  EnumMonsterStage,
  IWallet,
  IMonsterData,
  IBattleStats,
  IFighter,
  IBattleEvent,
} from './monster'
import type { ILoadout } from './progression'

export interface IPvpOpponent {
  id: string
  displayName: string
  emoji: string
  name: string
  nickname: string | null
  costume: ILoadout | null
  element: EnumMonsterLine
  stats: IBattleStats
  rating: number
  isNpc: boolean
}

export interface ISeasonRewardTier {
  maxRank: number | null
  coin: number
  gem: number
  raidToken: number
}

export interface IPvpStatus {
  season: string
  resetsAt: string
  rating: number
  wins: number
  losses: number
  rank: number | null
  attemptsLeft: number
  defense: {
    displayName: string
    fighter: IFighter
    stage: EnumMonsterStage
    setAt: string
    readyAt: string
  } | null
  claimableSeasons: {
    season: string
    rank: number
    rating: number
    reward: ISeasonRewardTier | null
  }[]
}

export interface IPvpBattleResponse {
  monster: IMonsterData
  battle: IArenaFight & { reward: number }
  rating: { before: number; after: number }
  attemptsLeft: number
  wallet: IWallet
}

export interface IPvpHistoryEntry {
  id: string
  season: string
  role: 'attacker' | 'defender'
  won: boolean
  opponentName: string
  opponentEmoji: string
  ratingBefore: number
  ratingAfter: number | null
  createdAt: string
}

// A fight from before PvP moved to the arena replays on the old turn screen.
export interface IPvpTurnReplay {
  kind?: undefined
  role: 'attacker' | 'defender'
  attackerWon: boolean
  rounds: number
  events: IBattleEvent[]
  attacker: IFighter
  defender: IFighter
}

export type IPvpReplay =
  | IPvpTurnReplay
  | (IArenaFight & { role: 'attacker' | 'defender'; attackerWon: boolean })

export interface IPvpLeaderboardEntry {
  rank: number
  displayName: string
  emoji: string | null
  name: string | null
  nickname: string | null
  costume: ILoadout | null
  rating: number
  wins: number
  losses: number
  isMe: boolean
}
