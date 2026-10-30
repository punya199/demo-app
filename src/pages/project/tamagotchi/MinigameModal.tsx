import { Button, Modal } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { isInZone, minigameBarPosition } from './tamagotchi-helper'
import { usePlayMinigame } from './tamagotchi-service'

// Must match MINIGAME_ROUNDS on the server, which rejects a higher hit count.
const ROUNDS = 3
const SWEEP_MS = 1400
const ZONE_WIDTH = 20

const randomZone = () => ({ start: 10 + Math.random() * (90 - ZONE_WIDTH - 10), width: ZONE_WIDTH })

interface IMinigameModalProps {
  open: boolean
  onClose: () => void
  onError: (error: unknown) => void
}

// "Stop the bar in the green zone" for ROUNDS rounds; the hit count is sent to the server, which
// caps and rate-limits the stamina it pays out.
export const MinigameModal = (props: IMinigameModalProps) => {
  const { open, onClose, onError } = props
  const { mutate: play, isPending, data: result, reset } = usePlayMinigame()
  const [results, setResults] = useState<boolean[]>([])
  const [zone, setZone] = useState(randomZone)
  const [position, setPosition] = useState(0)
  const startedAt = useRef(0)
  const isPlaying = open && results.length < ROUNDS

  useEffect(() => {
    if (open) {
      setResults([])
      setZone(randomZone())
      reset()
    }
  }, [open, reset])

  useEffect(() => {
    if (!isPlaying) {
      return
    }
    startedAt.current = performance.now()
    let frame = requestAnimationFrame(function animate(time) {
      setPosition(minigameBarPosition(time - startedAt.current, SWEEP_MS))
      frame = requestAnimationFrame(animate)
    })
    return () => cancelAnimationFrame(frame)
  }, [isPlaying, results.length])

  const stop = () => {
    const next = [...results, isInZone(position, zone)]
    setResults(next)
    setZone(randomZone())
    if (next.length === ROUNDS) {
      play(next.filter(Boolean).length, { onError })
    }
  }

  return (
    <Modal
      open={open}
      title="มินิเกม: หยุดให้ตรงโซนเขียว"
      onCancel={isPlaying ? undefined : onClose}
      closable={!isPlaying}
      maskClosable={false}
      footer={
        isPlaying ? (
          <Button type="primary" size="large" block onClick={stop}>
            หยุด!
          </Button>
        ) : (
          <Button type="primary" onClick={onClose} loading={isPending}>
            ปิด
          </Button>
        )
      }
    >
      <div className="relative my-4 h-8 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        {isPlaying && (
          <div
            className="absolute inset-y-0 bg-green-400/80"
            style={{ left: `${zone.start}%`, width: `${zone.width}%` }}
          />
        )}
        <div
          className="absolute inset-y-0 w-1.5 -translate-x-1/2 bg-slate-900 dark:bg-white"
          style={{ left: `${position}%` }}
        />
      </div>
      <div className="flex justify-center gap-3 text-2xl">
        {Array.from({ length: ROUNDS }, (_, index) => (
          <span key={index}>{index < results.length ? (results[index] ? '✅' : '❌') : '⬜'}</span>
        ))}
      </div>
      {!isPlaying && (
        <p className="mt-4 text-center font-semibold">
          {result
            ? `ได้ stamina +${result.reward}`
            : isPending
              ? 'กำลังบันทึก...'
              : `โดน ${results.filter(Boolean).length}/${ROUNDS}`}
        </p>
      )}
    </Modal>
  )
}
