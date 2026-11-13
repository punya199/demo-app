/** One goal or achievement row of GET /td/goals. The server derives progress and decides claims. */
export interface ITdGoal {
  id: string
  progress: number
  target: number
  gems: number
  complete: boolean
  claimed: boolean
}

export interface ITdGoals {
  config: { trackGems: number[]; resetAt: string }
  daily: ITdGoal[]
  track: { day: number; gems: number; claimedToday: boolean; claimable: boolean }
  achievements: ITdGoal[]
}

export interface ITdGoalClaim {
  claimKey: string
  gems: number
}

// Player-facing names, keyed by the server's goal ids. An id the client does not know shows as is.
const GOAL_LABELS: Record<string, string> = {
  win_battle: 'ชนะ 1 ด่าน',
  pull_once: 'สุ่มฮีโร่ 1 ครั้ง',
  upgrade_gear: 'อัปเกรดม็อดเฟือง 1 ครั้ง',
  stars_3: 'สะสมดาวรวม 3 ดวง',
  stars_9: 'สะสมดาวรวม 9 ดวง',
  heroes_3: 'มีฮีโร่ 3 ตัว',
  heroes_8: 'มีฮีโร่ 8 ตัว',
  pulls_10: 'สุ่มฮีโร่รวม 10 ครั้ง',
  pulls_50: 'สุ่มฮีโร่รวม 50 ครั้ง',
}

export const goalLabel = (id: string): string => GOAL_LABELS[id] ?? id

export const goalProgressText = (g: ITdGoal): string => `${g.progress}/${g.target}`

export type GoalState = 'claimed' | 'claimable' | 'pending'

export const goalState = (g: ITdGoal): GoalState =>
  g.claimed ? 'claimed' : g.complete ? 'claimable' : 'pending'
