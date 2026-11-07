import { Badge } from 'antd'
import { GAME_MENU, GameMenuKey } from '../core/game-menu'

export const GameMenu = (props: {
  active: GameMenuKey
  onSelect: (key: GameMenuKey) => void
  hasUnreadPatch: boolean
}) => (
  <nav aria-label="เมนูเกม" className="flex flex-col gap-2">
    {GAME_MENU.map((group) => (
      <div key={group.title}>
        <div className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {group.title}
        </div>
        <div className="grid grid-cols-5 gap-1.5 lg:grid-cols-3">
          {group.items.map((item) => {
            const isActive = item.key === props.active
            return (
              <button
                key={item.key}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => props.onSelect(item.key)}
                className={`flex min-h-14 flex-col items-center justify-center rounded-lg border px-1 py-1.5 text-center text-[11px] leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 ${
                  isActive
                    ? 'border-amber-500 bg-amber-50 font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                }`}
              >
                <Badge dot={item.key === 'patch-notes' && props.hasUnreadPatch} offset={[2, 0]}>
                  <span className="text-lg">{item.emoji}</span>
                </Badge>
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    ))}
  </nav>
)
