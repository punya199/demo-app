import { useEffect, useState } from 'react'
import { describeReset } from './tamagotchi-helper'

// "รีเซ็ตใน 2 ชม. 15 นาที (18:00 น.)", counting down while the panel is open.
export const ResetCountdown = (props: { resetsAt: string }) => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])
  return <>{describeReset(props.resetsAt, now)}</>
}
