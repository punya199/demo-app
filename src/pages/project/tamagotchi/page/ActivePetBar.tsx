import { Button } from 'antd'
import { elementLabel, MAX_HEARTS, stageLabel, toHearts } from '../core/tamagotchi-helper'
import { EnumMonsterStage, IMonsterData } from '../core/tamagotchi-interface'
import { useSelectMonster } from '../core/tamagotchi-service'
import { showError } from './show-error'
import { MonsterSprite } from '../shared/MonsterSprite'

// One slot per monster the player can raise at once; tapping a slot selects it.
const MonsterSlots = (props: {
  monsters: IMonsterData[]
  selectedId: string | undefined
  max: number
  onNewEgg: () => void
}) => {
  const { monsters, selectedId, max, onNewEgg } = props
  const { mutate: select, isPending } = useSelectMonster()
  return (
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: max }, (_, index) => {
        const monster = monsters[index]
        if (!monster) {
          return (
            <Button
              key={`empty-${index}`}
              className="!h-auto !py-2"
              onClick={onNewEgg}
              aria-label="รับไข่ใบใหม่"
            >
              <span className="flex flex-col items-center leading-tight">
                <span className="text-xl">➕</span>
                <span className="text-xs">ไข่ใหม่</span>
              </span>
            </Button>
          )
        }
        return (
          <Button
            key={monster.id}
            type={monster.id === selectedId ? 'primary' : 'default'}
            disabled={isPending}
            className="!h-auto !py-2"
            onClick={() => {
              if (monster.id !== selectedId) select(monster.id, { onError: showError })
            }}
          >
            <span className="flex flex-col items-center leading-tight">
              {monster.isSick ? (
                <span className="text-xl">🤒</span>
              ) : (
                <MonsterSprite sprite={monster.sprite} emoji={monster.emoji} size={30} />
              )}
              <span className="w-full truncate text-xs">{monster.displayName}</span>
            </span>
          </Button>
        )
      })}
    </div>
  )
}

// The selected pet, shown above every screen: who the actions and fights apply to.
export const ActivePetBar = (props: {
  monster: IMonsterData | null
  monsters: IMonsterData[]
  max: number
  onNewEgg: () => void
}) => {
  const { monster, monsters, max, onNewEgg } = props
  const isEgg = monster?.stage === EnumMonsterStage.EGG

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <div className="flex items-center gap-2">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-lime-100 text-2xl dark:bg-lime-200">
          {monster ? (
            monster.isSick ? (
              '🤒'
            ) : (
              <MonsterSprite sprite={monster.sprite} emoji={monster.emoji} size={40} />
            )
          ) : (
            '🥚'
          )}
        </div>
        <div className="min-w-0 flex-1">
          {monster ? (
            <>
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {monster.displayName}
                <span className="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">
                  {stageLabel[monster.stage]} · {elementLabel[monster.line]}
                </span>
              </div>
              {!isEgg && !monster.diedAt && (
                <div className="flex flex-wrap gap-x-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    อิ่ม {toHearts(monster.fullness)}/{MAX_HEARTS}
                  </span>
                  <span>
                    แรง {toHearts(monster.strength)}/{MAX_HEARTS}
                  </span>
                  <span>⚡ {Math.floor(monster.stamina)}</span>
                  {monster.isSick && <span className="text-red-500">ป่วย</span>}
                  {monster.expeditionAreaId && <span className="text-sky-600">ออกสำรวจ</span>}
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-400">ยังไม่มีมอน</div>
          )}
        </div>
      </div>
      {monsters.length > 0 && (
        <div className="mt-2">
          <MonsterSlots
            monsters={monsters}
            selectedId={monster?.id}
            max={max}
            onNewEgg={onNewEgg}
          />
        </div>
      )}
    </div>
  )
}
