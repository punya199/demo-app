import { Button } from 'antd'
import { describePassiveEffect, PASSIVE_HUB } from '../core/tamagotchi-helper'
import { IPassiveDraft, IPassiveNode, PassiveEffectKey } from '../core/tamagotchi-interface'
import { KIND_LABEL } from './passive-constants'

interface IPassiveSelectedCardProps {
  selected: IPassiveNode
  current: IPassiveDraft
  savedMasteries: Record<string, number>
  masteryRepickPrice: number
  isOwned: boolean
  isAscend: boolean
  canTake: boolean
  canDrop: boolean
  poolLeft: number
  branch: string[]
  // Gems the drop adds to the save price (0 = free).
  dropCost: number
  branchCost: number
  pickHint: string | null
  edit: (next: IPassiveDraft) => void
  toggleNode: (node: IPassiveNode) => void
  dropBranch: () => void
  focus: (node: IPassiveNode) => void
}

export const PassiveSelectedCard = (props: IPassiveSelectedCardProps) => {
  const { selected, current, savedMasteries, masteryRepickPrice, isOwned, isAscend } = props
  const { canTake, canDrop, poolLeft, branch, dropCost, branchCost, pickHint } = props
  const { edit, toggleNode, dropBranch, focus } = props
  const masteries = current.masteries
  // Passive nodes are owned through nodeIds, ascendancy ones through ascendancyNodeIds.
  const passiveOwned = current.nodeIds.includes(selected.id)
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <div className="text-xs text-slate-500 dark:text-slate-400">
        {selected.id === PASSIVE_HUB ? 'จุดเริ่มต้น' : KIND_LABEL[selected.kind]}
        {isOwned && selected.id !== PASSIVE_HUB && ' · มีแล้ว'}
      </div>
      <div className="font-semibold text-slate-900 dark:text-slate-100">
        {selected.id === PASSIVE_HUB ? 'จุดกลางของผู้ฝึก' : selected.name}
      </div>
      <ul className="mt-1 text-sm">
        {(Object.entries(selected.fx) as [PassiveEffectKey, number][]).map(([key, value]) => (
          <li
            key={key}
            className={value < 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}
          >
            {describePassiveEffect(key, value)}
          </li>
        ))}
      </ul>
      {selected.kind === 'mastery' && selected.options && (
        <div className="mt-2 flex flex-col gap-1">
          {selected.options.map((option, index) => {
            const picked = masteries[selected.id] === index
            return (
              <Button
                key={option.name}
                size="small"
                type={picked ? 'primary' : 'default'}
                disabled={!passiveOwned || picked}
                onClick={() =>
                  edit({ ...current, masteries: { ...masteries, [selected.id]: index } })
                }
              >
                <span className="font-medium">{option.name}</span>{' '}
                <span className="text-xs">
                  {(Object.entries(option.fx) as [PassiveEffectKey, number][])
                    .map(([key, value]) => describePassiveEffect(key, value))
                    .join(', ')}
                </span>
              </Button>
            )
          })}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {passiveOwned
              ? masteries[selected.id] === undefined
                ? 'เลือกครั้งแรกฟรี'
                : savedMasteries[selected.id] === undefined
                  ? 'เลือกครั้งแรกฟรี'
                  : `เปลี่ยนจากที่บันทึกไว้ใช้ 💎 ${masteryRepickPrice}`
              : 'เลือกโหนดนี้ก่อน แล้วค่อยเลือกตัวเลือก'}
          </p>
        </div>
      )}
      {pickHint && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{pickHint}</p>}
      {isAscend && canDrop && dropCost > 0 && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          ถอนโหนดเส้นทางสูงสุดนับเป็นการเริ่มเส้นทางใหม่ ต้องจ่าย 💎 {dropCost}
        </p>
      )}
      {selected.id !== PASSIVE_HUB && (
        <div className="mt-2 flex flex-wrap gap-2">
          {!isOwned && (
            <Button
              type="primary"
              size="small"
              disabled={!canTake || poolLeft <= 0}
              onClick={() => toggleNode(selected)}
            >
              เลือกโหนดนี้ (1 แต้ม{isAscend ? 'เส้นทางสูงสุด' : ''})
            </Button>
          )}
          {isOwned && (
            <Button size="small" disabled={!canDrop} onClick={() => toggleNode(selected)}>
              ถอนโหนดนี้{dropCost > 0 && ` 💎 ${dropCost}`}
            </Button>
          )}
          {branch.length > 1 && (
            <Button size="small" onClick={() => dropBranch()}>
              ถอนทั้งสาย ({branch.length}){branchCost > 0 && ` 💎 ${branchCost}`}
            </Button>
          )}
          <Button size="small" onClick={() => focus(selected)}>
            โฟกัส
          </Button>
        </div>
      )}
    </div>
  )
}
