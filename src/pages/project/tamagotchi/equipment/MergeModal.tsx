import { Button, Modal, Tooltip } from 'antd'
import { useState } from 'react'
import {
  elementLabel,
  findMergeForm,
  getMergeBlocker,
  getMergeParentBlocker,
  formatAge,
} from '../core/tamagotchi-helper'
import { IMonsterData, IWallet, IWikiData } from '../core/tamagotchi-interface'
import { useMergeMonsters } from '../core/tamagotchi-service'

interface IMergeModalProps {
  open: boolean
  onClose: () => void
  monsters: IMonsterData[]
  wallet: IWallet | undefined
  merge: IWikiData['merge']
  onError: (error: unknown) => void
}

// Two steps so the irreversible part is explicit: pick and preview, then confirm.
export const MergeModal = (props: IMergeModalProps) => {
  const { open, onClose, monsters, wallet, merge, onError } = props
  const [picks, setPicks] = useState<string[]>([])
  const [baseId, setBaseId] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const { mutate, isPending } = useMergeMonsters()

  const first = monsters.find((monster) => monster.id === picks[0])
  const second = monsters.find((monster) => monster.id === picks[1])
  const base = second && baseId === second.id ? second : first
  const form = first && second ? findMergeForm(merge.forms, first.line, second.line) : undefined
  const blocker = getMergeBlocker(
    first,
    second,
    wallet,
    { coin: merge.coinCost, gem: merge.gemCost },
    merge.spiritualLines,
    merge.crossLineEnabled ?? true
  )

  const reset = () => {
    setPicks([])
    setBaseId(null)
    setIsConfirming(false)
  }
  const close = () => {
    reset()
    onClose()
  }
  const toggle = (id: string) => {
    setBaseId(null)
    setPicks((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id].slice(-2)
    )
  }
  const submit = () => {
    if (!first || !second || !base) {
      return
    }
    mutate(
      { firstId: first.id, secondId: second.id, baseId: base.id },
      { onError, onSuccess: close }
    )
  }

  return (
    <Modal open={open} onCancel={close} title="🧬 รวมร่างมอน" footer={null} destroyOnHidden>
      {isConfirming && first && second && base && form ? (
        <div className="flex flex-col gap-3 text-sm">
          <div className="text-center text-5xl">{form.emoji}</div>
          <div className="text-center text-lg font-semibold">{form.name}</div>
          <p className="rounded border border-amber-400 p-2 text-amber-700 dark:text-amber-300">
            {first.emoji} {first.displayName} และ {second.emoji} {second.displayName} จะหายไปถาวร
            ย้อนกลับไม่ได้ จ่าย 🪙 {merge.coinCost} และ 💎 {merge.gemCost}
          </p>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsConfirming(false)} disabled={isPending}>
              กลับ
            </Button>
            <Button type="primary" danger loading={isPending} onClick={submit}>
              ยืนยันรวมร่าง
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-slate-500 dark:text-slate-400">
            เลือกมอนร่างสูงสุดสองตัว ได้ร่างผสานที่แรงขึ้นและอายุขัย{' '}
            {formatAge(merge.lifespanMinutes)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {monsters.map((monster) => {
              const parentBlocker = getMergeParentBlocker(monster)
              const index = picks.indexOf(monster.id)
              return (
                <Tooltip key={monster.id} title={parentBlocker}>
                  <Button
                    className="!h-auto !py-2"
                    type={index >= 0 ? 'primary' : 'default'}
                    disabled={!!parentBlocker}
                    aria-pressed={index >= 0}
                    onClick={() => toggle(monster.id)}
                  >
                    <span className="flex flex-col items-center leading-tight">
                      <span className="text-xl">{monster.emoji}</span>
                      <span className="text-xs">{monster.displayName}</span>
                    </span>
                  </Button>
                </Tooltip>
              )
            })}
          </div>
          {first && second && form && (
            <div className="rounded border border-slate-200 p-3 dark:border-slate-700">
              <div className="text-center text-4xl">{form.emoji}</div>
              <div className="text-center font-semibold">{form.name}</div>
              <div className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
                HP {form.stats.hp} · ATK {form.stats.atk} · DEF {form.stats.def} · SPD{' '}
                {form.stats.spd}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-slate-500">ตัวหลัก (ธาตุและสกิล)</span>
                {[first, second].map((monster) => (
                  <Button
                    key={monster.id}
                    size="small"
                    type={base?.id === monster.id ? 'primary' : 'default'}
                    aria-pressed={base?.id === monster.id}
                    onClick={() => setBaseId(monster.id)}
                  >
                    {monster.emoji} {elementLabel[monster.line]}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500">
              🪙 {merge.coinCost} · 💎 {merge.gemCost}
            </span>
            <Tooltip title={blocker}>
              <Button type="primary" disabled={!!blocker} onClick={() => setIsConfirming(true)}>
                ต่อไป
              </Button>
            </Tooltip>
          </div>
        </div>
      )}
    </Modal>
  )
}
