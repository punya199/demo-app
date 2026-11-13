import { useEffect, useState } from 'react'
import { liveEnergy } from './td-energy'
import { useGetTdProfile } from './td-profile-query'

const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

// Energy badge for the game screen: current / cap, with a countdown to the next point.
export const TdEnergy = () => {
  const { data, dataUpdatedAt } = useGetTdProfile()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!data) return null
  const energy = liveEnergy(data, dataUpdatedAt, now)
  return (
    <div role="status" aria-label="พลังงาน">
      ⚡ {energy.current}/{data.energy.cap}
      {energy.secondsToNext !== null && (
        <small> (+1 ใน {formatCountdown(energy.secondsToNext)})</small>
      )}
    </div>
  )
}
