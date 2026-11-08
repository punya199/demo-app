import { describePassiveEffect } from '../core/tamagotchi-helper'
import { IPassiveNode, PassiveEffectKey } from '../core/tamagotchi-interface'
import { KIND_LABEL } from './passive-constants'

interface IPassiveHoverCardProps {
  hovered: IPassiveNode
  hover: { x: number; y: number }
  box: HTMLDivElement | null
  state: string
  masteries: Record<string, number>
}

export const PassiveHoverCard = (props: IPassiveHoverCardProps) => {
  const { hovered, hover, box, state: hoveredState, masteries } = props
  return (
    <div
      className="pointer-events-none absolute z-10 w-56 rounded-md border border-slate-300 bg-white/95 p-2 text-xs shadow-lg dark:border-slate-600 dark:bg-slate-900/95"
      style={{
        left: hover.x,
        top: hover.y,
        transform: `translate(${hover.x > (box?.clientWidth ?? 0) / 2 ? 'calc(-100% - 14px)' : '14px'}, ${hover.y > (box?.clientHeight ?? 0) * 0.55 ? 'calc(-100% - 14px)' : '14px'})`,
      }}
    >
      <div className="text-slate-500 dark:text-slate-400">
        {KIND_LABEL[hovered.kind]} · {hoveredState}
      </div>
      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{hovered.name}</div>
      <ul>
        {(Object.entries(hovered.fx) as [PassiveEffectKey, number][]).map(([key, value]) => (
          <li
            key={key}
            className={value < 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}
          >
            {describePassiveEffect(key, value)}
          </li>
        ))}
      </ul>
      {hovered.options && (
        <ul className="mt-1 border-t border-slate-200 pt-1 dark:border-slate-700">
          {hovered.options.map((option, index) => (
            <li
              key={option.name}
              className={
                masteries[hovered.id] === index
                  ? 'font-semibold text-amber-600 dark:text-amber-400'
                  : 'text-slate-700 dark:text-slate-200'
              }
            >
              {masteries[hovered.id] === index ? '✓ ' : '• '}
              {option.name}:{' '}
              {(Object.entries(option.fx) as [PassiveEffectKey, number][])
                .map(([key, value]) => describePassiveEffect(key, value))
                .join(', ')}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
