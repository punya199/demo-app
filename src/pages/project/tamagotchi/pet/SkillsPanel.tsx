import { Button, Card, Segmented, Select, Spin, Tag } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import {
  ARENA_ELEMENT_LABEL,
  canEquipSkill,
  SKILL_KIND_LABEL,
  skillEffectLines,
  skillNumbers,
  skillTags,
  StatusMap,
} from '../arena/arena-helper'
import { ArenaElement, IArenaLoadout, IArenaSkill } from '../arena/arena-interface'
import { stageLabel } from '../core/tamagotchi-helper'
import { IMonsterData } from '../core/tamagotchi-interface'
import { useGetSkills, useSetSkillLoadout } from '../core/tamagotchi-service'

interface ISkillsPanelProps {
  monster: IMonsterData | null
  onError: (error: unknown) => void
}

const SkillCard = (props: { skill: IArenaSkill; statuses: StatusMap; locked?: boolean }) => {
  const { skill, statuses, locked } = props
  const lines = skillEffectLines(skill, statuses)
  return (
    <div
      className={`flex flex-col gap-1 rounded-lg border border-slate-200 p-2 dark:border-slate-700 ${
        locked ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{locked ? '🔒' : skill.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-slate-900 dark:text-slate-100">{skill.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {ARENA_ELEMENT_LABEL[skill.el]} · {SKILL_KIND_LABEL[skill.kind]}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {skillTags(skill).map(([label, tone]) => (
          <Tag key={label} color={tone === 'up' ? 'green' : 'red'} className="m-0">
            {label}
          </Tag>
        ))}
      </div>
      <div className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
        {skillNumbers(skill)}
      </div>
      {lines.length > 0 && (
        <div className="text-sm text-slate-700 dark:text-slate-200">{lines.join(' · ')}</div>
      )}
      {skill.source && (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {locked ? 'ปลดล็อกเมื่อเลี้ยงถึง' : 'ได้จาก'} {skill.source.emoji} {skill.source.name} (
          {stageLabel[skill.source.stage]})
        </div>
      )}
    </div>
  )
}

type Filter = 'mine' | 'all' | 'dodge'

// Skill loadout for the selected pet (innate + 2 slots + dodge) and the full skill catalog.
export const SkillsPanel = (props: ISkillsPanelProps) => {
  const { monster, onError } = props
  const { data, isLoading } = useGetSkills()
  const { mutate: save, isPending } = useSetSkillLoadout()
  const [draft, setDraft] = useState<IArenaLoadout | null>(null)
  const [filter, setFilter] = useState<Filter>('mine')

  const pet = data?.pets.find((p) => p.id === monster?.id) ?? data?.pets[0] ?? null
  useEffect(() => {
    setDraft(pet ? { ...pet.loadout } : null)
    // Reset the draft when the pet or its saved loadout changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet?.id, pet?.loadout.s1, pet?.loadout.s2, pet?.loadout.dodge])

  const byId = useMemo(
    () => Object.fromEntries((data?.catalog ?? []).map((s) => [s.id, s])),
    [data]
  )
  const unlocked = useMemo(() => new Set(data?.unlocked ?? []), [data])

  if (isLoading || !data) return <Spin />
  if (!pet) {
    return (
      <p className="text-center text-slate-500 dark:text-slate-400">ยังไม่มีมอนที่มีชีวิตอยู่</p>
    )
  }

  const innate = pet.innate ? byId[pet.innate] : undefined
  const options = (slot: 's1' | 's2' | 'dodge') => {
    const other = slot === 's1' ? draft?.s2 : slot === 's2' ? draft?.s1 : null
    return data.catalog
      .filter((s) => unlocked.has(s.id) && (slot === 'dodge') === (s.slot === 'dodge'))
      .filter(
        (s) => s.id !== other && canEquipSkill(pet, s, [innate, other ? byId[other] : undefined])
      )
      .map((s) => ({
        value: s.id,
        label: `${s.icon} ${s.name}${s.slot === 'passive' ? ' (พาสซีฟ)' : ''} · ${ARENA_ELEMENT_LABEL[s.el]}`,
      }))
  }
  const dirty =
    !!draft &&
    (draft.s1 !== pet.loadout.s1 ||
      draft.s2 !== pet.loadout.s2 ||
      draft.dodge !== pet.loadout.dodge)

  const visible = data.catalog.filter((s) =>
    filter === 'dodge'
      ? s.slot === 'dodge'
      : filter === 'mine'
        ? s.slot !== 'dodge' && (s.el === 'neutral' || pet.elements.includes(s.el as never))
        : s.slot !== 'dodge'
  )
  const elementOrder: ArenaElement[] = [
    'flame',
    'tide',
    'leaf',
    'earth',
    'lightning',
    'holy',
    'dark',
    'shadow',
    'neutral',
  ]
  visible.sort((a, b) => elementOrder.indexOf(a.el) - elementOrder.indexOf(b.el))

  return (
    <div className="flex w-full flex-col gap-4">
      <Card size="small" title="ชุดสกิล" className="dark:border-slate-700 dark:bg-slate-900">
        {!pet.hasSkills ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ไข่และร่างเด็กยังใช้สกิลไม่ได้ สู้ด้วยการตีธรรมดาอย่างเดียว
            เลี้ยงถึงร่างโตแล้วจะมีสกิลติดตัว 1 สกิล และใส่เพิ่มได้อีก 2 ช่องกับสกิลหลบ 1 ช่อง
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {innate && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  สกิลติดตัว (เปลี่ยนไม่ได้)
                </span>
                <SkillCard skill={innate} statuses={data.statuses} />
              </div>
            )}
            {(['s1', 's2', 'dodge'] as const).map((slot) => {
              const id = draft?.[slot] ?? null
              return (
                <div key={slot} className="flex flex-col gap-1">
                  <label
                    htmlFor={`skill-${slot}`}
                    className="text-xs text-slate-500 dark:text-slate-400"
                  >
                    {slot === 'dodge' ? 'สกิลหลบ' : `ช่อง ${slot === 's1' ? 1 : 2}`}
                  </label>
                  <Select
                    id={`skill-${slot}`}
                    allowClear
                    placeholder="ว่าง"
                    value={id ?? undefined}
                    options={options(slot)}
                    onChange={(value?: string) =>
                      setDraft((d) => (d ? { ...d, [slot]: value ?? null } : d))
                    }
                    notFoundContent="ยังไม่มีสกิลที่ใส่ได้ (ปลดล็อกจากการเลี้ยงร่างใหม่ใน Dex)"
                  />
                  {id && byId[id] && <SkillCard skill={byId[id]} statuses={data.statuses} />}
                </div>
              )
            })}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ใส่ได้เฉพาะสกิลธาตุเดียวกับมอน (
              {pet.elements.map((el) => ARENA_ELEMENT_LABEL[el]).join(', ')}) และสกิลกลาง พาสซีฟได้
              1 สกิลทั้งชุด (นับสกิลติดตัวด้วย)
            </p>
            <Button
              type="primary"
              disabled={!dirty || isPending}
              loading={isPending}
              onClick={() => draft && save({ ...draft, monsterId: pet.id }, { onError })}
            >
              บันทึกชุดสกิล
            </Button>
          </div>
        )}
      </Card>
      <Card
        size="small"
        title={`คลังสกิล · ปลดล็อกแล้ว ${data.unlocked.length} จาก ${data.catalog.length}`}
        extra={
          <Segmented
            size="small"
            value={filter}
            onChange={(value) => setFilter(value as Filter)}
            options={[
              { label: 'ใส่ได้', value: 'mine' },
              { label: 'ทั้งหมด', value: 'all' },
              { label: 'หลบ', value: 'dodge' },
            ]}
          />
        }
        className="dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {visible.map((s) => (
            <SkillCard key={s.id} skill={s} statuses={data.statuses} locked={!unlocked.has(s.id)} />
          ))}
        </div>
      </Card>
    </div>
  )
}
