import { Tag } from 'antd'
import { useMemo, useState } from 'react'
import {
  describeConditions,
  elementLabel,
  formatAge,
  lineOptions,
  stageLabel,
} from '../core/tamagotchi-helper'
import {
  EnumMonsterLine,
  EnumMonsterStage,
  IWikiData,
  IWikiSpecies,
} from '../core/tamagotchi-interface'
import { percent, times } from './wiki-helper'
import { hatchedStages, statsText } from './wiki-shared'
import { Heading, List, Table } from './WikiParts'
import { buildEvolutionTree } from '../pet/evolution-tree'
import { EvolutionTree } from '../pet/EvolutionTree'

// The guide's evolution trees: pick a line, tap a form for its stats and branch conditions.
const WikiEvolutionTrees = (props: { species: IWikiSpecies[] }) => {
  const { species } = props
  const [line, setLine] = useState<EnumMonsterLine>(EnumMonsterLine.FLAME)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const layout = useMemo(() => buildEvolutionTree(species, line), [species, line])
  const byId = new Map(species.map((entry) => [entry.id, entry]))
  const selected = selectedId ? byId.get(selectedId) : undefined
  const name = (id: string) => {
    const entry = byId.get(id)
    return entry ? `${entry.emoji} ${entry.name}` : id
  }
  // A rule with no conditions is the fallback branch: taken when no earlier one matches.
  const conditions = (rule: IWikiSpecies['evolutions'][number]) =>
    rule.maxCareMistakes === undefined &&
    rule.minTrainCount === undefined &&
    rule.minWins === undefined
      ? 'ถ้าไม่ผ่านทางอื่น'
      : describeConditions(rule)
  const incoming = selected
    ? species.flatMap((from) =>
        from.evolutions.filter((rule) => rule.to === selected.id).map((rule) => ({ from, rule }))
      )
    : []

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {lineOptions.map((option) => (
          <button
            key={option.line}
            type="button"
            onClick={() => {
              setLine(option.line)
              setSelectedId(null)
            }}
            className={`rounded-full border px-3 py-0.5 text-xs ${
              option.line === line
                ? 'border-amber-500 bg-amber-50 font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {elementLabel[option.line]}
          </button>
        ))}
      </div>
      <EvolutionTree layout={layout} selectedId={selectedId} onSelect={setSelectedId} />
      {selected ? (
        <div className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700">
          <div className="text-sm font-medium">
            {selected.emoji} {selected.name} <Tag>{stageLabel[selected.stage]}</Tag>
          </div>
          {selected.stage !== EnumMonsterStage.EGG && (
            <div className="text-slate-500 dark:text-slate-400">
              {statsText(selected.stats)} · สกิล {selected.skill.name} (
              {times(selected.skill.power)}) · น้ำหนักขั้นต่ำ {selected.minWeight} g
            </div>
          )}
          {incoming.length > 0 && (
            <div className="mt-1">
              มาจาก:{' '}
              {incoming
                .map(({ from, rule }) => `${name(from.id)} (${conditions(rule)})`)
                .join(' · ')}
            </div>
          )}
          <div className="mt-1">
            ไปต่อ:{' '}
            {selected.evolutions.length === 0
              ? selected.stage === EnumMonsterStage.ULTIMATE
                ? 'ร่างสุดท้าย (นำไปรวมร่างได้)'
                : 'ทางตัน · ไปร่างสูงสุดไม่ได้'
              : selected.evolutions
                  .map((rule) => `${name(rule.to)} (${conditions(rule)})`)
                  .join(' · ')}
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          กดที่ร่างเพื่อดูค่าพลัง สกิล และเงื่อนไขของแต่ละทาง
        </p>
      )}
    </div>
  )
}

export const EvolutionWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { online, evolution, merge } = wiki
  return (
    <>
      <Table
        head={['ร่าง', 'ปิดเกม', `เปิดเกม (${times(online.evolutionMultiplier)})`]}
        rows={[EnumMonsterStage.EGG, ...hatchedStages].map((stage) => {
          const duration = evolution.stageDurationMinutes[stage]
          return [
            stageLabel[stage],
            duration === null ? 'ร่างสุดท้าย' : formatAge(duration),
            duration === null ? '–' : formatAge(Math.ceil(duration / online.evolutionMultiplier)),
          ]
        })}
      />
      <List
        items={[
          'ครบเวลาแล้วจะดูเงื่อนไขตามลำดับ เงื่อนไขแรกที่ผ่านคือร่างที่ได้',
          'ดูแลพลาดและการฝึกนับเฉพาะในร่างปัจจุบัน (เริ่มนับใหม่ทุกร่าง) · การชนะนับตลอดชีวิต',
          'ร่างสมบูรณ์จะดูเงื่อนไขครั้งเดียว ถ้าไม่ผ่านจะอยู่ร่างเดิมไปจนครบอายุ',
        ]}
      />
      <Heading>ต้นไม้วิวัฒนาการ</Heading>
      <WikiEvolutionTrees species={evolution.species} />
      <Heading>ร่างผสาน (รวมร่าง)</Heading>
      <List
        items={[
          `รวมมอนของคุณสองตัวที่เป็นร่างสูงสุด (สายหลักหรือสายแตกก็ได้ ต้องไม่ป่วยและไม่ได้ออกสำรวจ) เป็นร่างผสานหนึ่งตัว จ่าย 🪙 ${merge.coinCost} และ 💎 ${merge.gemCost}`,
          `ค่าพลัง = ร่างสูงสุด ${times(merge.powerMultiplier)} ปรับตามสายของพ่อแม่ทั้งสอง ธาตุและสกิลมาจากตัวหลักที่คุณเลือก`,
          merge.crossLineEnabled === false
            ? 'ตอนนี้รวมร่างได้เฉพาะมอนสายเดียวกัน (เช่น เพลิง + เพลิง) ได้ร่างผู้ตื่นของสายนั้น ร่างผสมข้ามสายปิดไว้ชั่วคราวระหว่างออกแบบใหม่ ร่างผสมข้ามสายที่มีอยู่แล้วยังใช้ได้ตามเดิม'
            : 'ธาตุธรรมชาติ (เพลิง วารี พฤกษ์ ธรณี สายฟ้า) รวมกันเองได้ และธาตุจิตวิญญาณ (ศักดิ์สิทธิ์ มืด เงา) รวมกันเองได้ ข้ามกลุ่มไม่ได้',
          `เริ่มชีวิตใหม่: อายุเริ่มนับ 0 อายุขัย ${formatAge(merge.lifespanMinutes)} ชนะ/แพ้เริ่มใหม่ ความอิ่มและความแข็งแรงเฉลี่ยจากพ่อแม่`,
          'ร่างผสานไม่วิวัฒนาการต่อและรวมซ้ำไม่ได้ เข้าสนามประลองไม่ได้ ตีบอสโลกและ Raid ได้ พ่อแม่หายไปถาวร (ย้อนกลับไม่ได้) ส่วนอุปกรณ์และต้นไม้เป็นของบัญชี ไม่หาย',
          'แต่ละร่างผสานเป็นรายการใหม่ใน Dex (ได้เพชรและแต้มต้นไม้เหมือนร่างอื่น)',
          'ร่างผสมข้ามธาตุ 13 ร่าง (เช่น เพลิง + วารี ได้ยักษ์ไอน้ำ) มีภาพพิกเซลและสกิลประจำร่างที่มีผลของทั้งสองธาตุ ดูชื่อสกิลได้ในแท็บสกิล',
        ]}
      />
      <Table
        head={['ร่าง', 'พ่อแม่', 'ค่าพลัง']}
        rows={merge.forms.map((form) => [
          `${form.emoji} ${form.name}`,
          form.lines.map((line) => elementLabel[line]).join(' + '),
          statsText(form.stats),
        ])}
      />
    </>
  )
}

export const PotentialWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { potential, battle } = wiki
  return (
    <>
      <List
        items={[
          'มอนแต่ละตัวสุ่มค่าพลัง 7 ค่าตอนไข่ฟัก และคงที่ตลอดชีวิต หน้าเลี้ยงแสดงต่ำสุด สูงสุด และตำแหน่งที่ได้ของทุกค่า',
          `HP ATK DEF SPD: สุ่ม ${times(1 - potential.statSpread)} ถึง ${times(1 + potential.statSpread)} ของค่าร่างนั้น (ค่ากลางเท่ากับค่าเดิม)`,
          `คริติคอล: ${percent(battle.criticalChance)} ถึง ${percent(battle.criticalChance + potential.critRateBonusMax)} · ดาเมจคริติคอล: ${times(battle.criticalMultiplier)} ถึง ${times(battle.criticalMultiplier + potential.critDamageBonusMax)} · หลบหลีก: 0% ถึง ${percent(potential.evasionMax)}`,
          `ค่าที่ได้จากอุปกรณ์และต้นไม้บวกทับ แต่ไม่เกินเพดาน: คริติคอล ${percent(potential.critRateCap)} ดาเมจคริติคอล ${times(potential.critDamageCap)} หลบหลีก ${percent(potential.evasionCap)}`,
          'เกรดรวมมาจากค่าเฉลี่ยของ 7 ค่า: ' +
            potential.grades.map((g) => `${g.grade} ≥ ${percent(g.minAverage)}`).join(' · '),
          'กล่องสถานะต่อสู้แบ่งเป็นแท็บ โจมตี / ป้องกัน / อื่นๆ ใต้แถบค่าสุ่มมีค่าที่ใช้เฉพาะในสนามต่อสู้ เช่น ฟื้น HP ต่อวินาที (% ของ HP สูงสุด) ดูดเลือด สะท้อนดาเมจ ลดดาเมจ โล่ ความเร็วโจมตี ลดคูลดาวน์ ACC / EVA / RES (ค่าตามธาตุ + อุปกรณ์ + ต้นไม้) ค่าที่มอนยังไม่มีจะไม่แสดง',
          'รวมร่าง: ได้ค่าสุ่มที่ดีกว่าของพ่อแม่ในแต่ละค่า มอนรุ่นเก่าไม่มีค่าสุ่มและค่าพลังเหมือนเดิม',
        ]}
      />
    </>
  )
}
