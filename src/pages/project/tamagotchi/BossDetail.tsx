import { Tag, Tooltip } from 'antd'
import { elementLabel } from './tamagotchi-helper'
import { IBossDetail, IBossSkillView, IRaidDifficultyInfo } from './tamagotchi-interface'

const stageStat = (label: string, value: number | string, hint?: string) => (
  <div className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    {hint && <div className="text-xs text-slate-500">{hint}</div>}
  </div>
)

// ATK / DEF / SPD (and HP unless the screen shows it elsewhere) with the damage DEF cuts.
export const BossStats = (props: { detail: IBossDetail; showHp?: boolean }) => {
  const { detail, showHp = true } = props
  const { stats } = detail
  return (
    <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
      {showHp && stageStat('HP', stats.hp)}
      {stageStat('ATK', stats.atk)}
      {stageStat('DEF', stats.def, `ลดดาเมจ ${detail.defReductionPct}%`)}
      {stageStat('SPD', stats.spd)}
    </div>
  )
}

const skillTip = (skill: IBossSkillView) => (
  <div className="text-xs">
    <div className="font-semibold">
      {skill.icon} {skill.name}
    </div>
    <div>
      ธาตุ{(elementLabel as Record<string, string>)[skill.element] ?? 'กลาง'}
      {skill.cooldown > 0 && ` · คูลดาวน์ ${skill.cooldown} วิ`}
    </div>
    <div>{skill.description}</div>
  </div>
)

const SkillIcon = (props: { skill: IBossSkillView }) => (
  <Tooltip title={skillTip(props.skill)} trigger={['hover', 'click']}>
    <button
      type="button"
      aria-label={props.skill.name}
      className="flex w-16 cursor-help flex-col items-center gap-0.5 rounded bg-slate-100 p-1 dark:bg-slate-800"
    >
      <span className="text-2xl">{props.skill.icon}</span>
      <span className="w-full truncate text-center text-[10px] text-slate-500">
        {props.skill.name}
      </span>
    </button>
  </Tooltip>
)

// Skill icons; hover (or tap) one for its full detail. Passive traits are listed below.
export const BossSkills = (props: { detail: IBossDetail }) => {
  const { skills, dodge, passives } = props.detail
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {[...skills, ...(dodge ? [dodge] : [])].map((skill) => (
          <SkillIcon key={skill.id} skill={skill} />
        ))}
      </div>
      {passives.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {passives.map((line) => (
            <Tag key={line}>{line}</Tag>
          ))}
        </div>
      )}
    </div>
  )
}

const DIFFICULTY_LABEL: Record<string, string> = {
  normal: 'Normal',
  hard: 'Hard',
  nightmare: 'Nightmare',
}

// Stats of every difficulty side by side.
export const RaidStatTable = (props: { difficulties: IRaidDifficultyInfo[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-right text-xs">
      <thead>
        <tr className="border-b border-slate-200 dark:border-slate-700">
          <th className="py-1 text-left" />
          {props.difficulties.map((entry) => (
            <th key={entry.difficulty} className="py-1 pl-2">
              {DIFFICULTY_LABEL[entry.difficulty]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(['hp', 'atk', 'def', 'spd'] as const).map((key) => (
          <tr key={key} className="border-b border-slate-100 dark:border-slate-800">
            <td className="py-1 text-left uppercase">{key}</td>
            {props.difficulties.map((entry) => (
              <td key={entry.difficulty} className="py-1 pl-2">
                {entry.enemy.stats[key]}
                {key === 'def' && (
                  <span className="text-slate-500"> (−{entry.defReductionPct}%)</span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
