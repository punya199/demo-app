import { Button, Card, InputNumber, Select, Spin } from 'antd'
import { useState } from 'react'
import { ArenaBattleModal } from './ArenaBattleModal'
import { defCutPct, describeDef, elementLabel, summaryRows } from './tamagotchi-helper'
import { DummyPreset, IDummyFightResponse, IMonsterData } from './tamagotchi-interface'
import { useDummyFight, useGetDummyPresets, useGetSkills, useGetWiki } from './tamagotchi-service'
import { Table } from './WikiParts'

interface IDummyPanelProps {
  monster: IMonsterData | null
  onError: (error: unknown) => void
}

const PRESET_OPTIONS: { value: DummyPreset; label: string }[] = [
  { value: 'plain', label: '🎯 หุ่นกลาง (ปรับ DEF/ธาตุเอง)' },
  { value: 'raid', label: '🐉 จำลองบอส Raid' },
  { value: 'world', label: '🌋 จำลองบอสโลก' },
]

export const DummyPanel = (props: IDummyPanelProps) => {
  const { monster, onError } = props
  const { data: presets } = useGetDummyPresets()
  const { data: wiki } = useGetWiki()
  const { data: skillState } = useGetSkills()
  const { mutate: fight, isPending } = useDummyFight()
  const [preset, setPreset] = useState<DummyPreset>('plain')
  const [def, setDef] = useState<number | null>(null)
  const [element, setElement] = useState('flame')
  const [raidBossId, setRaidBossId] = useState<string | undefined>()
  const [difficulty, setDifficulty] = useState('normal')
  const [worldBossId, setWorldBossId] = useState<string | undefined>()
  const [result, setResult] = useState<IDummyFightResponse | null>(null)
  const [replayOpen, setReplayOpen] = useState(false)

  if (!presets) {
    return <Spin />
  }

  const bossId =
    preset === 'raid'
      ? (raidBossId ?? presets.raidBosses[0]?.id)
      : (worldBossId ?? presets.worldBosses[0]?.id)
  const defValue = def ?? presets.defDefault
  const dummy = wiki?.dummy
  const blocker = monster ? null : 'ยังไม่มีมอนที่สู้ได้'

  const start = () => {
    fight(
      preset === 'plain'
        ? { preset, def: defValue, element }
        : { preset, bossId, difficulty: preset === 'raid' ? difficulty : undefined },
      {
        onSuccess: (data) => {
          setResult(data)
          setReplayOpen(true)
        },
        onError,
      }
    )
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <Card size="small" className="dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              className="min-w-56"
              value={preset}
              onChange={setPreset}
              options={PRESET_OPTIONS}
            />
            {preset === 'plain' && (
              <>
                <span>DEF</span>
                <InputNumber
                  min={0}
                  max={presets.defMax}
                  value={defValue}
                  onChange={setDef}
                  aria-label="DEF"
                />
                <Select
                  value={element}
                  onChange={setElement}
                  options={presets.elements.map((value) => ({
                    value,
                    label: (elementLabel as Record<string, string>)[value] ?? value,
                  }))}
                />
              </>
            )}
            {preset === 'raid' && (
              <>
                <Select
                  value={bossId}
                  onChange={setRaidBossId}
                  options={presets.raidBosses.map((boss) => ({
                    value: boss.id,
                    label: `${boss.emoji} ${boss.name}`,
                  }))}
                />
                <Select
                  value={difficulty}
                  onChange={setDifficulty}
                  options={presets.difficulties.map((value) => ({ value, label: value }))}
                />
              </>
            )}
            {preset === 'world' && (
              <Select
                value={bossId}
                onChange={setWorldBossId}
                options={presets.worldBosses.map((boss) => ({
                  value: boss.id,
                  label: `${boss.emoji} ${boss.name}`,
                }))}
              />
            )}
            <Button
              type="primary"
              disabled={!!blocker || isPending}
              loading={isPending}
              onClick={start}
            >
              🎯 เริ่มซ้อม (ฟรี ไม่ได้รางวัล)
            </Button>
          </div>
          {preset === 'plain' && dummy && (
            <div className="text-xs text-slate-500">
              {describeDef(
                defValue,
                defCutPct(defValue, dummy.defenseK, dummy.maxDefenseReduction)
              )}
            </div>
          )}
          <div className="text-xs text-slate-500">
            หุ่นไม่ตีกลับ สู้ {presets.fightSec} วินาที ไม่เสียโควตา ไม่บันทึกผล
            {preset !== 'plain' && ' · ใช้ DEF ธาตุ และเกราะจริงของบอส แต่ไม่โจมตี'}
          </div>
        </div>
      </Card>

      {result && (
        <Card
          size="small"
          className="dark:border-slate-700 dark:bg-slate-900"
          title="ผลการซ้อม"
          extra={
            <Button size="small" onClick={() => setReplayOpen(true)}>
              ▶ ดู replay
            </Button>
          }
        >
          <div className="mb-2 text-xs text-slate-500">
            {describeDef(result.dummy.def, result.dummy.defReductionPct)}
          </div>
          <Table head={['รายการ', 'ค่า']} rows={summaryRows(result.summary)} />
        </Card>
      )}

      <ArenaBattleModal
        battle={replayOpen ? (result?.battle ?? null) : null}
        statuses={skillState?.statuses}
        catalog={skillState?.catalog}
        title="ซ้อมกับหุ่น"
        summary={
          result ? `ดาเมจรวม ${result.summary.totalDamage} · DPS ${result.summary.dps}` : undefined
        }
        onClose={() => setReplayOpen(false)}
      />
    </div>
  )
}
