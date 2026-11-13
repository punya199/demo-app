export interface ITdProfile {
  energy: { current: number; cap: number; stageCost: number; secondsToNext: number | null }
  balances: { coins: number; gems: number; shards: number; clovers: number }
}

// Matches the server's rule (+1 per 6 minutes); only used to keep the countdown moving between
// fetches. The server stays the source of truth and every refetch replaces this estimate.
export const REGEN_SECONDS = 6 * 60

export const liveEnergy = (profile: ITdProfile, fetchedAtMs: number, nowMs: number) => {
  const { current, cap, secondsToNext } = profile.energy
  const elapsed = Math.max(0, Math.floor((nowMs - fetchedAtMs) / 1000))
  if (secondsToNext === null || current >= cap) {
    return { current, secondsToNext }
  }
  if (elapsed < secondsToNext) {
    return { current, secondsToNext: secondsToNext - elapsed }
  }
  const past = elapsed - secondsToNext
  const gained = 1 + Math.floor(past / REGEN_SECONDS)
  if (current + gained >= cap) {
    return { current: cap, secondsToNext: null }
  }
  return { current: current + gained, secondsToNext: REGEN_SECONDS - (past % REGEN_SECONDS) }
}
