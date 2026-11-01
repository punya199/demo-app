import { Button, Popconfirm, Progress, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { MinigameModal } from './MinigameModal'
import {
  formatAge,
  getMinigameBlocker,
  getStaminaRefillBlocker,
  staminaFullInMinutes,
} from './tamagotchi-helper'
import { IMonsterData, IWikiStamina } from './tamagotchi-interface'
import { useRefillStamina } from './tamagotchi-service'

// Adventure stamina of the selected pet, with the two ways to top it up.
export const StaminaCard = (props: {
  monster: IMonsterData
  rules: IWikiStamina
  gem: number
  onError: (error: unknown) => void
}) => {
  const { monster, rules, gem, onError } = props
  const [isMinigameOpen, setIsMinigameOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const { mutate: refill, isPending } = useRefillStamina()
  const stamina = Math.floor(monster.stamina)
  const fights = Math.floor(monster.stamina / rules.adventureCost)
  const fullIn = staminaFullInMinutes(monster.stamina, rules.max, rules.regenPerHour)
  const minigameBlocker = getMinigameBlocker(monster, now)
  const refillBlocker = getStaminaRefillBlocker(monster, rules.max, gem, rules.refillGemPrice)

  // Re-enable the mini-game button when its cooldown runs out.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          ⚡ Stamina · {monster.displayName}
        </span>
        <span className="tabular-nums">
          {stamina}/{rules.max}
        </span>
      </div>
      <Progress
        percent={(monster.stamina / rules.max) * 100}
        showInfo={false}
        size="small"
        strokeColor={fights === 0 ? '#ef4444' : '#f59e0b'}
      />
      <div className="text-xs text-slate-500 dark:text-slate-400">
        สู้ได้อีก {fights} ครั้ง (ครั้งละ {rules.adventureCost}) ·{' '}
        {fullIn === 0
          ? 'เต็มแล้ว'
          : `เต็มในอีก ~${formatAge(fullIn)} · เปิดเกมไว้ ~${formatAge(
              Math.ceil(fullIn / rules.onlineRegenMultiplier)
            )}`}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Tooltip title={minigameBlocker}>
          <Button size="small" disabled={!!minigameBlocker} onClick={() => setIsMinigameOpen(true)}>
            🎯 มินิเกม (+{rules.minigameRewards[0]}–{rules.minigameRewards.at(-1) ?? 0})
          </Button>
        </Tooltip>
        <Tooltip title={refillBlocker}>
          <Popconfirm
            title={`ใช้ 💎 ${rules.refillGemPrice} เติม stamina ให้เต็ม?`}
            okText="เติม"
            cancelText="ยกเลิก"
            disabled={!!refillBlocker}
            onConfirm={() => refill(monster.id, { onError })}
          >
            <Button size="small" disabled={!!refillBlocker || isPending}>
              💎 {rules.refillGemPrice} เติมเต็ม
            </Button>
          </Popconfirm>
        </Tooltip>
      </div>
      <MinigameModal
        open={isMinigameOpen}
        monsterId={monster.id}
        onClose={() => setIsMinigameOpen(false)}
        onError={onError}
      />
    </div>
  )
}
