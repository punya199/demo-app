import { Modal, Spin, Tag } from 'antd'
import { useMemo } from 'react'
import { buildEvolutionTree } from './evolution-tree'
import { EvolutionTree, TreeLegend } from './EvolutionTree'
import { elementLabel, stageLabel } from './tamagotchi-helper'
import {
  EnumMonsterStage,
  IEvolutionRuleInfo,
  IMonsterData,
  IWikiSpecies,
} from './tamagotchi-interface'
import { useGetEvolutionPath, useGetMonsterDex } from './tamagotchi-service'

interface IConditionRow {
  label: string
  value: string
  ok: boolean
}

const conditionRows = (rule: IEvolutionRuleInfo, monster: IMonsterData): IConditionRow[] => {
  const rows: IConditionRow[] = []
  if (rule.maxCareMistakes !== undefined) {
    rows.push({
      label: `ดูแลพลาด ≤ ${rule.maxCareMistakes}`,
      value: `${monster.careMistakes}`,
      ok: monster.careMistakes <= rule.maxCareMistakes,
    })
  }
  if (rule.minTrainCount !== undefined) {
    rows.push({
      label: `ฝึก ≥ ${rule.minTrainCount}`,
      value: `${monster.trainCount} / ${rule.minTrainCount}`,
      ok: monster.trainCount >= rule.minTrainCount,
    })
  }
  if (rule.minWins !== undefined) {
    rows.push({
      label: `ชนะรวม ≥ ${rule.minWins}`,
      value: `${monster.wins} / ${rule.minWins}`,
      ok: monster.wins >= rule.minWins,
    })
  }
  return rows
}

const isDeadEnd = (species: IWikiSpecies | undefined) =>
  !!species &&
  species.evolutions.length === 0 &&
  species.stage !== EnumMonsterStage.ULTIMATE &&
  species.stage !== EnumMonsterStage.FUSED

interface IEvolutionTreeModalProps {
  open: boolean
  monster: IMonsterData
  species: IWikiSpecies[]
  onClose: () => void
}

// One pet's evolution tree: the forms it has been, where it is now, and what it needs next.
export const EvolutionTreeModal = (props: IEvolutionTreeModalProps) => {
  const { open, monster, species, onClose } = props
  const { data, isLoading } = useGetEvolutionPath(open ? monster.id : null)
  const { data: dex } = useGetMonsterDex()
  // No Dex data (loading or failed) just means no badges.
  const collected = useMemo(
    () => new Set(dex?.species.filter((entry) => entry.discovered).map((entry) => entry.id)),
    [dex]
  )
  const layout = useMemo(() => buildEvolutionTree(species, monster.line), [species, monster.line])
  const path = data?.path ?? [monster.speciesId]
  const speciesById = new Map(species.map((entry) => [entry.id, entry]))
  const rules = monster.evolution.rules
  const isFinal = monster.evolution.durationMinutes === null

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="min(960px, calc(100vw - 16px))"
      style={{ top: 16 }}
      title={`🌳 สายวิวัฒนาการ · ${monster.displayName} (${elementLabel[monster.line]})`}
    >
      {monster.stage === EnumMonsterStage.FUSED ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          ร่างรวม (Fused) ไม่อยู่ในต้นไม้ของสายใดสายหนึ่ง และไม่วิวัฒนาการต่อ
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <TreeLegend showCollected={collected.size > 0} />
          {isLoading ? (
            <Spin />
          ) : (
            <EvolutionTree layout={layout} progress={{ path }} collected={collected} />
          )}
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            {isFinal ? 'ร่างสุดท้ายแล้ว' : `ขั้นถัดไปจาก ${monster.name}`}
          </div>
          {!isFinal &&
            rules.map((rule) => {
              const target = speciesById.get(rule.to.id)
              const rows = conditionRows(rule, monster)
              const dead = isDeadEnd(target)
              return (
                <div
                  key={rule.to.id}
                  className={`rounded-lg border p-3 text-sm ${
                    dead
                      ? 'border-red-300 dark:border-red-800'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      {rule.to.emoji} {rule.to.name}
                    </span>
                    <span className="flex gap-1">
                      <Tag>{stageLabel[rule.to.stage]}</Tag>
                      {dead && <Tag color="red">ทางตัน</Tag>}
                      {rule.met && rows.length > 0 && <Tag color="green">ผ่านเงื่อนไขแล้ว</Tag>}
                    </span>
                  </div>
                  {rows.length === 0 ? (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      ได้ร่างนี้ถ้าไม่ผ่านเงื่อนไขของทางข้างบน
                      {dead && ' · ไปร่างสูงสุดไม่ได้'}
                    </div>
                  ) : (
                    <div className="mt-1 grid grid-cols-[1fr_auto] gap-x-4 text-xs">
                      {rows.map((row) => (
                        <div key={row.label} className="contents">
                          <span>{row.label}</span>
                          <span
                            className={`text-right tabular-nums ${
                              row.ok ? 'text-emerald-600' : 'text-red-500'
                            }`}
                          >
                            {row.value} {row.ok ? '✓' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          {!isFinal && rules.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ตรวจตามลำดับ ทางแรกที่ผ่านคือร่างที่ได้ · ดูแลพลาดและการฝึกนับเฉพาะร่างนี้ ·
              ชนะนับรวมตลอดชีวิต
            </p>
          )}
        </div>
      )}
    </Modal>
  )
}
