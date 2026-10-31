import { Button, Modal, Progress } from 'antd'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { describeBattleEvent, hpAfter } from './tamagotchi-helper'
import { BattleSide, IBattleData } from './tamagotchi-interface'

const STEP_MS = 700

interface IBattleModalProps {
  battle: IBattleData | null
  onClose: () => void
  // Close by itself this long after the replay ends (auto-battle); omit to wait for the player.
  autoCloseMs?: number
}

// Replays the server's battle events one by one; the result is already decided.
export const BattleModal = (props: IBattleModalProps) => {
  const { battle, onClose, autoCloseMs } = props
  const [shown, setShown] = useState(0)
  const total = battle?.events.length ?? 0
  const isFinished = shown >= total

  useEffect(() => {
    setShown(0)
  }, [battle])

  useEffect(() => {
    if (!battle || isFinished) {
      return
    }
    const timer = setTimeout(() => setShown((count) => count + 1), STEP_MS)
    return () => clearTimeout(timer)
  }, [battle, shown, isFinished])

  useEffect(() => {
    if (!battle || !isFinished || autoCloseMs === undefined) {
      return
    }
    const timer = setTimeout(onClose, autoCloseMs)
    return () => clearTimeout(timer)
  }, [battle, isFinished, autoCloseMs, onClose])

  if (!battle) {
    return null
  }

  const lastEvent = shown > 0 ? battle.events[shown - 1] : null

  const fighterCard = (side: BattleSide) => {
    const fighter = side === 'player' ? battle.player : battle.enemy
    const hp = hpAfter(battle.events, shown, side, fighter.stats.hp)
    const isHit = lastEvent && lastEvent.actor !== side
    return (
      <div className="flex flex-1 flex-col items-center gap-1">
        <motion.div
          key={`${side}-${shown}`}
          className="text-5xl"
          animate={isHit ? { x: [0, -6, 6, -6, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          {fighter.emoji}
        </motion.div>
        <div className="text-sm font-medium">{fighter.name}</div>
        <Progress
          percent={Math.round((hp / fighter.stats.hp) * 100)}
          showInfo={false}
          strokeColor={side === 'player' ? '#22c55e' : '#ef4444'}
          size="small"
        />
        <div className="text-xs text-slate-500">
          {hp}/{fighter.stats.hp}
        </div>
      </div>
    )
  }

  return (
    <Modal
      open
      title="การต่อสู้"
      onCancel={isFinished ? onClose : undefined}
      closable={isFinished}
      maskClosable={false}
      footer={
        isFinished ? (
          <Button type="primary" onClick={onClose}>
            ปิด
          </Button>
        ) : (
          <Button onClick={() => setShown(total)}>ข้าม</Button>
        )
      }
    >
      <div className="flex items-start gap-4">
        {fighterCard('player')}
        <div className="self-center text-lg font-bold text-slate-400">VS</div>
        {fighterCard('enemy')}
      </div>
      <div className="mt-4 min-h-12 rounded-lg bg-slate-100 p-3 text-center text-sm dark:bg-slate-800">
        {isFinished ? (
          battle.won ? (
            <span className="font-semibold text-green-600">
              ชนะ! ได้ {battle.reward} 🪙{battle.gemReward > 0 && ` + ${battle.gemReward} 💎`}
              {battle.isFirstClear && ' (เคลียร์ครั้งแรก)'}
            </span>
          ) : (
            <span className="font-semibold text-red-500">
              แพ้...{' '}
              {battle.rounds >= 20 ? 'หมดเวลา' : 'ลองดูแลให้แข็งแรงหรือเติม stamina แล้วมาใหม่'}
            </span>
          )
        ) : lastEvent ? (
          describeBattleEvent(lastEvent, battle)
        ) : (
          'เริ่มการต่อสู้!'
        )}
      </div>
    </Modal>
  )
}
