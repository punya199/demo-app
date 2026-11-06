import { Collapse, Spin, Tag } from 'antd'
import { useMemo, useState } from 'react'
import { buildEvolutionTree } from './evolution-tree'
import { EvolutionTree } from './EvolutionTree'
import {
  describeConditions,
  describePctBonus,
  describeRefineStones,
  describeSetEffect,
  elementLabel,
  formatAge,
  gradeLabel,
  lineOptions,
  slotLabel,
  stageLabel,
} from './tamagotchi-helper'
import {
  EnumMonsterLine,
  EnumMonsterStage,
  IBattleStats,
  IWikiData,
  IWikiSpecies,
} from './tamagotchi-interface'
import { useGetWiki } from './tamagotchi-service'
import { describeCareBonus, isCraftSet, percent, times } from './wiki-helper'
import { ArenaBattleSection } from './WikiArena'
import { CraftWikiTab } from './WikiCraft'
import { ResetWikiTab } from './WikiReset'
import { SkillsWikiTab } from './WikiSkills'
import { Heading, List, Table } from './WikiParts'
import { StatusEffectsSection } from './WikiStatus'

// The in-game guide. Every number comes from GET /monster/wiki (the server's rule constants), so
// this page explains the rules exactly as the server applies them.

const statsText = (stats: IBattleStats) =>
  `HP ${stats.hp} · ATK ${stats.atk} · DEF ${stats.def} · SPD ${stats.spd}`

const hatchedStages = [
  EnumMonsterStage.BABY_1,
  EnumMonsterStage.BABY_2,
  EnumMonsterStage.ADULT,
  EnumMonsterStage.PERFECT,
  EnumMonsterStage.ULTIMATE,
  EnumMonsterStage.FUSED,
] as const

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

const buildSections = (wiki: IWikiData) => {
  const {
    care,
    online,
    evolution,
    merge,
    rareEgg,
    potential,
    battle,
    adventure,
    idle,
    equipment,
    raid,
    passive,
    worldBoss,
    social,
    pvp,
    economy,
  } = wiki
  const slotRows = Object.entries(equipment.slots).map(([slot, main]) => [
    slotLabel[slot as keyof typeof slotLabel],
    `${main.stat.toUpperCase()} (ฐาน ${main.base})`,
  ])

  return [
    {
      key: 'start',
      label: '🎮 วิธีเล่น',
      children: (
        <List
          items={[
            `ไข่ธาตุจิตวิญญาณ (ศักดิ์สิทธิ์ มืด เงา) เป็นไข่หายาก ฟักครั้งละ 🎖️ ${rareEgg.raidTokenPrice} Raid Token ธาตุจิตวิญญาณชนะแพ้กันเองเป็นวงสามเหลี่ยม และตีธาตุธรรมชาติเป็นดาเมจปกติทั้งสองทาง`,
            'เลือกไข่ธาตุปกติ 1 ใน 5 ธาตุ (เพลิง วารี พฤกษ์ ธรณี สายฟ้า) แล้วรอไข่ฟัก เลี้ยงพร้อมกันได้ 4 ตัว (กดช่องด้านบนเพื่อเลือกตัวที่จะเล่นด้วยในโหมดอื่น ๆ)',
            'ดูแลให้อิ่ม แข็งแรง สะอาด และหายป่วย เวลาในเกมเดินต่อแม้ปิดแอป',
            'ครบเวลาแต่ละร่าง มอนจะวิวัฒนาการ ร่างที่ได้ขึ้นกับการเลี้ยง การฝึก และการชนะ',
            'พามอนไปสู้ในโหมดผจญภัย ทำภารกิจประจำวัน เก็บเหรียญและเพชรไว้ซื้อของ',
            `เปิดเกมค้างไว้ = ออนไลน์: วิวัฒนาการเร็วขึ้น ${times(online.evolutionMultiplier)} `,
            `มอนมีอายุขัย ${formatAge(care.lifespanMinutes)} นับจากฟัก (ร่างผสาน ${formatAge(care.fusedLifespanMinutes)}) ตายแล้วได้ไข่ใบใหม่ ความคืบหน้าผจญภัย เหรียญ เพชร และ Dex ยังอยู่`,
          ]}
        />
      ),
    },
    {
      key: 'care',
      label: '🍖 การเลี้ยง',
      children: (
        <>
          <Heading>ค่าสถานะ</Heading>
          <List
            items={[
              `ความอิ่ม และความแข็งแรง: 0–${care.maxHearts} หัวใจ ลดลงตามเวลา (หัวใจที่ยังเหลือบางส่วนแสดงเป็นเต็มดวง)`,
              `ไข่ฟักออกมาพร้อมความอิ่ม ${care.hatchFullness} และความแข็งแรง ${care.hatchStrength} หัวใจ`,
              'น้ำหนัก: เพิ่มเมื่อกิน ลดเมื่อฝึกหรือสู้ ไม่ต่ำกว่าน้ำหนักขั้นต่ำของร่าง',
              `อึ: เพิ่มตามเวลา สูงสุด ${care.maxPoops} กอง`,
            ]}
          />
          <Heading>อัตราการลดตามร่าง</Heading>
          <Table
            head={['ร่าง', 'ความอิ่ม −1', 'แข็งแรง −1', 'อึทุก']}
            rows={hatchedStages.map((stage) => [
              stageLabel[stage],
              formatAge(care.stageRates[stage].fullnessMinutes),
              formatAge(care.stageRates[stage].strengthMinutes),
              formatAge(care.stageRates[stage].poopEveryMinutes),
            ])}
          />
          <Heading>ปุ่มดูแล</Heading>
          <Table
            head={['ปุ่ม', 'ผล']}
            rows={[
              ['🍖 ให้อาหาร', `ความอิ่ม +1, น้ำหนัก +${care.feedWeightGain}`],
              ['💊 วิตามิน', `ความแข็งแรง +1, น้ำหนัก +${care.vitaminWeightGain}`],
              [
                '🥊 ฝึก',
                `ความแข็งแรง +1, น้ำหนัก −${care.trainWeightLoss}, นับการฝึก +1 · พัก ${formatAge(care.trainCooldownMinutes)} · ป่วยอยู่ฝึกไม่ได้`,
              ],
              ['🧹 เก็บอึ', 'อึ = 0'],
              ['💉 ให้ยา', 'หายป่วย (ใช้ได้เฉพาะตอนป่วย)'],
            ]}
          />
          <Heading>ดูแลพลาด (care mistake)</Heading>
          <List
            items={[
              `ความอิ่มหรือความแข็งแรงเป็น 0 ต่อเนื่อง ${formatAge(care.neglectFirstMistakeMinutes)} นับ 1 ครั้ง แล้วนับเพิ่มทุก ${formatAge(care.neglectRepeatMistakeMinutes)} ที่ยังเป็น 0`,
              'นับใหม่ทุกครั้งที่วิวัฒนาการ และใช้เป็นเงื่อนไขแตกสาย',
            ]}
          />
          <Heading>ป่วยและตาย</Heading>
          <List
            items={[
              `ป่วยเมื่อ: อึครบ ${care.maxPoops} กอง หรือหิว (ความอิ่ม 0) ต่อเนื่อง ${formatAge(care.sickAfterHungryMinutes)}`,
              `ตายเมื่อ: ป่วยไม่รักษา ${formatAge(care.deathAfterSickMinutes)} · หิวต่อเนื่อง ${formatAge(care.deathAfterHungryMinutes)} · อายุครบ ${formatAge(care.lifespanMinutes)}`,
            ]}
          />
        </>
      ),
    },
    {
      key: 'online',
      label: '⚡ ออนไลน์',
      children: (
        <>
          <Heading>ออนไลน์</Heading>
          <List
            items={[
              `เปิดหน้าเกมไว้บนจอ หน้าเกมจะเช็กกับเซิร์ฟเวอร์ทุก 1 นาที แต่ละนาทีที่อยู่ภายใน ${online.graceMinutes} นาทีหลังการเช็กล่าสุดนับเป็นออนไลน์`,
              `ระหว่างออนไลน์: วิวัฒนาการเร็วขึ้น ${times(online.evolutionMultiplier)} และ stamina ฟื้นเร็วขึ้น ${times(online.staminaRegenMultiplier)}`,
              'ความหิว ความแข็งแรง อึ และอายุ เดินตามเวลาจริงเสมอ ไม่ว่าออนไลน์หรือไม่',
            ]}
          />
        </>
      ),
    },
    {
      key: 'stamina',
      label: '🔋 Stamina (ผจญภัย)',
      children: (
        <>
          <List
            items={[
              `มอนแต่ละตัวมี stamina ของตัวเอง 0–${wiki.stamina.max} ใช้กับการผจญภัยเท่านั้น (สู้เองและข้ามด่าน) ครั้งละ ${wiki.stamina.adventureCost}`,
              `stamina ไม่พอ ${wiki.stamina.adventureCost} สู้ผจญภัยไม่ได้ · บอส บอสโลก สนามประลอง และการสำรวจ ไม่ใช้ stamina`,
              `ฟื้นเอง +${wiki.stamina.regenPerHour} ต่อชั่วโมง (เต็มใน ${formatAge(Math.ceil((wiki.stamina.max / wiki.stamina.regenPerHour) * 60))}) · เปิดเกมไว้ฟื้นเร็วขึ้น ${times(wiki.stamina.onlineRegenMultiplier)}`,
              `มินิเกม: หยุดแถบให้ตรงโซนเขียว ${wiki.stamina.minigameRounds} รอบ เล่นได้ทุก ${formatAge(wiki.stamina.minigameCooldownMinutes)}`,
              `เติมเต็มทันทีด้วย 💎 ${wiki.stamina.refillGemPrice}`,
            ]}
          />
          <Table
            head={['มินิเกมโดน', 'ได้ stamina']}
            rows={wiki.stamina.minigameRewards.map((reward, hits) => [
              `${hits}/${wiki.stamina.minigameRounds}`,
              `+${reward}`,
            ])}
          />
        </>
      ),
    },
    {
      key: 'evolution',
      label: '🧬 วิวัฒนาการ',
      children: (
        <>
          <Table
            head={['ร่าง', 'ปิดเกม', `เปิดเกม (${times(online.evolutionMultiplier)})`]}
            rows={[EnumMonsterStage.EGG, ...hatchedStages].map((stage) => {
              const duration = evolution.stageDurationMinutes[stage]
              return [
                stageLabel[stage],
                duration === null ? 'ร่างสุดท้าย' : formatAge(duration),
                duration === null
                  ? '–'
                  : formatAge(Math.ceil(duration / online.evolutionMultiplier)),
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
              'ธาตุธรรมชาติ (เพลิง วารี พฤกษ์ ธรณี สายฟ้า) รวมกันเองได้ และธาตุจิตวิญญาณ (ศักดิ์สิทธิ์ มืด เงา) รวมกันเองได้ ข้ามกลุ่มไม่ได้',
              `เริ่มชีวิตใหม่: อายุเริ่มนับ 0 อายุขัย ${formatAge(merge.lifespanMinutes)} ชนะ/แพ้เริ่มใหม่ ความอิ่มและความแข็งแรงเฉลี่ยจากพ่อแม่`,
              'ร่างผสานไม่วิวัฒนาการต่อและรวมซ้ำไม่ได้ เข้าสนามประลองไม่ได้ ตีบอสโลกและ Raid ได้ พ่อแม่หายไปถาวร (ย้อนกลับไม่ได้) ส่วนอุปกรณ์และต้นไม้เป็นของบัญชี ไม่หาย',
              'แต่ละร่างผสานเป็นรายการใหม่ใน Dex (ได้เพชรและแต้มต้นไม้เหมือนร่างอื่น)',
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
      ),
    },
    {
      key: 'potential',
      label: '🎲 ค่าสุ่มมอน',
      children: (
        <>
          <List
            items={[
              'มอนแต่ละตัวสุ่มค่าพลัง 7 ค่าตอนไข่ฟัก และคงที่ตลอดชีวิต หน้าเลี้ยงแสดงต่ำสุด สูงสุด และตำแหน่งที่ได้ของทุกค่า',
              `HP ATK DEF SPD: สุ่ม ${times(1 - potential.statSpread)} ถึง ${times(1 + potential.statSpread)} ของค่าร่างนั้น (ค่ากลางเท่ากับค่าเดิม)`,
              `คริติคอล: ${percent(battle.criticalChance)} ถึง ${percent(battle.criticalChance + potential.critRateBonusMax)} · ดาเมจคริติคอล: ${times(battle.criticalMultiplier)} ถึง ${times(battle.criticalMultiplier + potential.critDamageBonusMax)} · หลบหลีก: 0% ถึง ${percent(potential.evasionMax)}`,
              `ค่าที่ได้จากอุปกรณ์และต้นไม้บวกทับ แต่ไม่เกินเพดาน: คริติคอล ${percent(potential.critRateCap)} ดาเมจคริติคอล ${times(potential.critDamageCap)} หลบหลีก ${percent(potential.evasionCap)}`,
              'เกรดรวมมาจากค่าเฉลี่ยของ 7 ค่า: ' +
                potential.grades.map((g) => `${g.grade} ≥ ${percent(g.minAverage)}`).join(' · '),
              'รวมร่าง: ได้ค่าสุ่มที่ดีกว่าของพ่อแม่ในแต่ละค่า มอนรุ่นเก่าไม่มีค่าสุ่มและค่าพลังเหมือนเดิม',
            ]}
          />
        </>
      ),
    },
    {
      key: 'battle',
      label: '⚔️ การต่อสู้',
      children: (
        <>
          <Heading>ค่าพลังตอนสู้</Heading>
          <List
            items={[
              'เริ่มจากค่าพลังของร่าง (ดูในหัวข้อวิวัฒนาการ)',
              `ATK +${percent(battle.atkBonusPerStrengthHeart)} ต่อหัวใจความแข็งแรง`,
              `หิว (ความอิ่ม 0): ATK ${times(battle.hungryAtkMultiplier)}`,
              `น้ำหนักเกิน ${battle.overweightRatio} เท่าของขั้นต่ำ: SPD ${times(battle.overweightSpdMultiplier)}`,
            ]}
          />
          <ArenaBattleSection wiki={wiki} />
          <Heading>ค่าใช้จ่าย</Heading>
          <List items={[`สู้ 1 ครั้ง: น้ำหนัก −${battle.weightLoss}`, 'ป่วยอยู่สู้ไม่ได้']} />
          <StatusEffectsSection arena={wiki.arena} />
        </>
      ),
    },
    {
      key: 'skills',
      label: '🌀 สกิล',
      children: <SkillsWikiTab wiki={wiki} />,
    },
    {
      key: 'adventure',
      label: '🗺️ ผจญภัย',
      children: (
        <>
          <List
            items={[
              'ปลดล็อกทีละด่าน ชนะบอสท้ายพื้นที่เพื่อเปิดพื้นที่ถัดไป',
              `ชนะครั้งแรกได้เหรียญ ${times(adventure.firstClearMultiplier)} · บอสครั้งแรกได้เพชร`,
              'ความคืบหน้าผูกกับบัญชี ไม่หายเมื่อเปลี่ยนมอน',
              `ด่านที่ชนะแล้ว (รวมบอส) กด "ข้าม" ได้ ไม่ต้องสู้ ใช้ stamina รอบละเท่าการสู้ ได้เหรียญและโอกาสดรอปอุปกรณ์เหมือนชนะ เลือกได้ครั้งละ 1–${adventure.skipMaxRuns} รอบ`,
              `ชนะมีโอกาส ${percent(wiki.craft.adventureEssence.chance)} ได้เอสเซนซ์วัตถุดิบคราฟต์ตามธาตุของพื้นที่ (ดูแท็บ คราฟต์)`,
            ]}
          />
          {adventure.areas.map((area) => (
            <div key={area.id}>
              <Heading>
                {area.emoji} {area.name} <Tag>แนะนำ: {stageLabel[area.recommendedStage]}</Tag>
              </Heading>
              <Table
                head={['ศัตรู', 'ธาตุ', 'ค่าพลัง', 'รางวัล']}
                rows={area.stages.map((stage) => [
                  `${stage.enemy.emoji} ${stage.enemy.name}${stage.isBoss ? ' (บอส)' : ''}`,
                  elementLabel[stage.enemy.element],
                  `${statsText(stage.enemy.stats)} · ${stage.enemy.skill.name} ${times(stage.enemy.skill.power)}`,
                  `🪙 ${stage.reward}${stage.firstClearGems ? ` · 💎 ${stage.firstClearGems} ครั้งแรก` : ''}`,
                ])}
              />
            </div>
          ))}
        </>
      ),
    },
    {
      key: 'idle',
      label: '💤 โหมด Idle',
      children: (
        <>
          <Heading>ส่งมอนออกสำรวจ (ออฟไลน์)</Heading>
          <List
            items={[
              `กดส่งสำรวจแล้วปิดแอปได้ เก็บเหรียญตามเวลาจริงสูงสุด ${formatAge(idle.expeditionMaxMinutes)} แล้วต้องกลับมากดรับ`,
              `ระหว่างสำรวจ ความอิ่มและความแข็งแรงลดช้าลง ${times(idle.expeditionDrainMultiplier)} และอึไม่เพิ่ม`,
              'ถ้ามอนป่วยหรือความอิ่มเป็น 0 จะกลับบ้านเองและหยุดเก็บ ส่งสำรวจตอนป่วยหรือหิวไม่ได้',
              `ทุก ${formatAge(idle.expeditionDropEveryMinutes)} ได้ไอเทมสะสม 1 ชิ้น (เนื้อชั้นดี โปรตีนเชค หรือเอสเซนซ์วัตถุดิบคราฟต์)`,
              `เหรียญต่อชั่วโมงขึ้นกับพื้นที่และค่าพลังของมอน (${times(idle.expeditionPowerMultiplierMin)}–${times(idle.expeditionPowerMultiplierMax)} เทียบร่างที่แนะนำ) ล็อกอัตราไว้ตอนออกเดินทาง`,
              'มอนที่ตายระหว่างสำรวจจะเสียรางวัลที่ยังไม่ได้รับ ระหว่างสำรวจสู้ในผจญภัยไม่ได้',
              'ยังไม่มี EXP',
            ]}
          />
          <Table
            head={['พื้นที่', 'เหรียญ/ชม. (ร่างที่แนะนำ)']}
            rows={idle.expeditionAreas.map((area) => [
              `${area.emoji} ${area.name}`,
              `🪙 ${area.baseRatePerHour}`,
            ])}
          />
        </>
      ),
    },
    {
      key: 'passive',
      label: '🌳 ต้นไม้ความสามารถ',
      children: (
        <>
          <Heading>ต้นไม้ของผู้ฝึก</Heading>
          <List
            items={[
              'ผูกกับบัญชี ไม่หายเมื่อมอนตาย ใช้ได้ทุกโหมดรวมถึง PvP',
              'เริ่มจากจุดกลาง เลือกได้เฉพาะโหนดที่ติดกับโหนดที่มีอยู่ ถอนได้เฉพาะโหนดที่ไม่ตัดสายอื่นขาด',
              'โหนดคีย์สโตนแลกกัน: ค่าหนึ่งเพิ่มมาก อีกค่าลดลง',
              `ในไฟต์ผจญภัยแบบเรียลไทม์: ฟื้น HP ต่อวินาทีเท่ากับ ${passive.arenaRegenPerSecPct}% ของค่าที่เขียนไว้, เผาไหม้มีโอกาสติด ${passive.arenaBurnChance}% ต่อการตีธรรมดาและนานเท่าจำนวนเทิร์นเป็นวินาที, ตีสองครั้งใช้กับตีธรรมดา, โล่เริ่มต้นอยู่จนกว่าจะแตก, ตีก่อนทำให้ตีธรรมดาและสกิลพร้อมใช้ตั้งแต่เริ่มไฟต์, SPD % ที่เพิ่มจากต้นไม้และอุปกรณ์ทำให้โจมตีเร็วขึ้น ${passive.arenaAttackSpeedPct}% ของค่านั้น (สูงสุด ${passive.arenaAttackSpeedCap}%)`,
              `แต้มได้จาก Dex ร่างละ 1, เคลียร์เรดครั้งแรกบอสละระดับ 1, เคลียร์ด่านผจญภัยครั้งแรกด่านละ 1 (สูงสุด ${passive.adventureMaxPoints}), ชนะสะสมทุก ${passive.winsPerPoint} ครั้ง 1 แต้ม (สูงสุด ${passive.winMaxPoints}), ล้มบอสโลก 1 และจบซีซัน PvP ที่ผ่านเกณฑ์ (${passive.pvpSeasonPoints
                .map(
                  (tier) =>
                    `${tier.maxRank ? `อันดับ ≤ ${tier.maxRank}` : 'ที่เหลือ'}: ${tier.points}`
                )
                .join(' · ')}) รวมสูงสุด ${passive.maxPoints} แต้ม`,
              `ถอนแต้มคืนได้ ${passive.freeRefunds} แต้มแรกฟรี หลังจากนั้นแต้มละ 💎 ${passive.respecGemPrice} (ถอนทั้งสายสูงสุด 💎 ${passive.branchRefundCap} ต่อครั้ง)`,
              `โหนดเหรียญสำรวจและโอกาสดรอปอุปกรณ์รวมกันได้ไม่เกิน +${passive.economyCap}% อย่างละ`,
              `มาสเตอรีเลือก 1 จาก 3 ตัวเลือก เลือกครั้งแรกฟรี เปลี่ยนใช้ 💎 ${passive.masteryRepickGemPrice}`,
              `เส้นทางสูงสุด 3 เส้นทาง เลือกได้เส้นทางเดียว ใช้แต้มแยก (สูงสุด ${passive.ascendancyMaxPoints} แต้ม จากเรด Nightmare และบอสโลก) เริ่มใหม่ใช้ 💎 ${passive.ascendancyResetGemPrice}`,
            ]}
          />
        </>
      ),
    },
    {
      key: 'costume',
      label: '👗 ชุดแต่งตัว',
      children: (
        <>
          <Heading>ชุดแต่งตัว</Heading>
          <List
            items={[
              'แต่งตัวมอนได้ 5 ช่อง: หมวก หน้า หลัง ออร่า ฉากหลัง ช่องละ 1 ชิ้น ผสมกันได้',
              'เป็นความสวยงามล้วน ไม่มีผลกับค่าพลัง ซื้อขายหรือแลกเปลี่ยนไม่ได้',
              'ซื้อครั้งเดียวเป็นของบัญชี ใช้ได้กับมอนทุกตัว แต่มอนแต่ละตัวใส่ชุดของตัวเอง',
              'จ่ายด้วยเหรียญ เพชร หรือเหรียญบอส บางชิ้นเป็นรางวัลซีซัน PvP (3 อันดับแรก) ซื้อไม่ได้',
              'ลองใส่ฟรีก่อนซื้อ สะสมหมวก หน้า หลังครบธีมได้เหรียญตรา',
              'เพื่อน คู่ต่อสู้ในสนามประลอง อันดับ และตัวเช่า จะเห็นชุดของมอนตัวที่คุณเลือกอยู่ ปิดการแสดงได้ในแท็บชุดแต่งตัว',
            ]}
          />
        </>
      ),
    },
    {
      key: 'equipment',
      label: '🛡️ อุปกรณ์และตีบวก',
      children: (
        <>
          <Heading>อุปกรณ์ 4 ช่อง</Heading>
          <List
            items={[
              `สวมได้ช่องละ 1 ชิ้น ค่าบวกเข้ากับค่าพลังของมอนตรง ๆ กระเป๋าผูกกับบัญชี เก็บได้ ${equipment.capacity} ชิ้น`,
              'มอนแต่ละตัวมีชุดอุปกรณ์ของตัวเอง ชิ้นหนึ่งใส่ได้ทีละตัว (ย้ายจากตัวอื่นได้ มีให้ยืนยัน) เมื่อมอนตายหรือถูกรวมร่าง ชิ้นที่ใส่อยู่จะกลับเข้ากระเป๋า',
              'สวม/ถอดไม่ได้ระหว่างมอนออกสำรวจ',
              `เกรดคูณค่าหลัก: ${Object.entries(equipment.gradeMultiplier)
                .map(
                  ([grade, value]) =>
                    `${gradeLabel[grade as keyof typeof gradeLabel]} ${times(value)}`
                )
                .join(' · ')}`,
              `ค่ารองสุ่มตามเกรด: ${Object.entries(equipment.subStatCount)
                .map(
                  ([grade, range]) =>
                    `${gradeLabel[grade as keyof typeof gradeLabel]} ${range.min}–${range.max}`
                )
                .join(' · ')}`,
              `ชุดเซ็ตมี ${Object.keys(equipment.sets).length - wiki.craft.sets.length} ชุดจากบอส และ ${wiki.craft.sets.length} ชุดที่คราฟต์ได้อย่างเดียว (ดูแท็บ คราฟต์)`,
            ]}
          />
          <Table head={['ช่อง', 'ค่าหลัก']} rows={slotRows} />
          <Heading>ที่มาของอุปกรณ์</Heading>
          <List
            items={[
              `กล่องสุ่มในร้าน 🪙 ${equipment.boxPrice}: ${Object.entries(equipment.boxGradeRates)
                .map(([grade, rate]) => `${gradeLabel[grade as keyof typeof gradeLabel]} ${rate}%`)
                .join(' · ')}`,
              `ชนะด่านผจญภัยด้วยตัวเองมีโอกาสดรอป ${equipment.dropChancePercent}% (ข้ามด่านก็มีโอกาสดรอปทุกรอบ ส่วนการสำรวจไม่ดรอป) เกรดตามพื้นที่`,
              'หินตีบวกและหินรีไฟน์ธรรมดาซื้อได้ในร้านค้า ส่วนหินอื่นต้องแยกชิ้นส่วนหรือได้จากบอส (การสำรวจไม่ให้หินแล้ว)',
              `แยกชิ้นส่วนได้หินตามเกรด (${Object.entries(equipment.dismantleStones)
                .map(
                  ([grade, stones]) => `${gradeLabel[grade as keyof typeof gradeLabel]} ${stones}`
                )
                .join(
                  ' · '
                )}) และเพิ่ม 1 ก้อนต่อ ${equipment.dismantleStoneLevelStep} ระดับบวก พร้อมหินรีไฟน์ 1 ก้อน (ชิ้นที่บวกไม่เกิน +${equipment.refineTiers[0].maxLevel} ได้ ${equipment.refineTiers[0].name} ที่เหลือได้ ${equipment.refineTiers[1].name})`,
              `รีไฟน์: สุ่มค่ารองใหม่ 1 ช่อง (ช่วงค่าเท่ากับตอนดรอป) เลือกเก็บค่าใหม่หรือคงค่าเดิมได้ ใช้หิน 1 ก้อนกับเหรียญทุกครั้ง ระบบใช้หินระดับต่ำสุดที่ครอบคลุม: ${equipment.refineTiers
                .map((tier) => `${tier.name} ถึง +${tier.maxLevel} 🪙 ${tier.coin}`)
                .join(' · ')}`,
              'หินรีไฟน์มหากาพย์/ตำนานได้จากบอสเท่านั้น: Boss Raid ระดับ Hard/Nightmare ชนะได้ 1 ก้อน และรางวัลอันดับ World Boss',
              'คราฟต์: สร้างชิ้นเซ็ตจากวัตถุดิบที่ดรอป เกรดมิธิกได้จากการคราฟต์เท่านั้น (ดูแท็บ คราฟต์)',
            ]}
          />
          <Table
            head={['พื้นที่', 'เกรดที่ดรอป']}
            rows={Object.entries(equipment.dropGradeRatesByArea).map(([areaId, rates]) => [
              adventure.areas.find((area) => area.id === areaId)?.name ?? areaId,
              Object.entries(rates)
                .map(([grade, rate]) => `${gradeLabel[grade as keyof typeof gradeLabel]} ${rate}%`)
                .join(' · '),
            ])}
          />
          <Heading>ตีบวก (สูงสุด +{equipment.enhance.maxLevel})</Heading>
          <List
            items={[
              `เพิ่มค่าหลัก ${percent(equipment.enhance.bonusPerLevel)} ต่อระดับ และอีก ${percent(equipment.enhance.milestoneBonus)} ทุก ${equipment.enhance.milestoneEvery} ระดับ`,
              'เหรียญและหินถูกใช้ทุกครั้งที่ลอง ไม่ว่าสำเร็จหรือล้มเหลว',
              `ล้มเหลวติดกันเพิ่มอัตราสำเร็จครั้งละ ${percent(equipment.enhance.pityPerFail)} สูงสุด ${percent(equipment.enhance.pityMax)} รีเซ็ตเมื่อสำเร็จ หน้าตีบวกแสดงอัตราจริงก่อนกดเสมอ`,
              'ใบกันแตก: ใช้ได้ตั้งแต่ระดับที่ล้มเหลวแล้วเสียระดับหรือแตก ตัดเฉพาะเมื่อช่วยได้จริง',
            ]}
          />
          <Table
            head={['เป็นระดับ', 'อัตราสำเร็จ', 'ถ้าล้มเหลว', 'เหรียญ', 'หิน']}
            rows={equipment.enhance.steps.map((step) => [
              `+${step.level}`,
              percent(step.rate),
              step.onFail === 'material'
                ? 'เสียวัตถุดิบ'
                : step.onFail === 'drop'
                  ? 'ระดับลด 1'
                  : 'ระดับลด 1 หรือแตก',
              `🪙 ${step.coin}`,
              `🪨 ${step.stones}`,
            ])}
          />
        </>
      ),
    },
    {
      key: 'craft',
      label: '🔨 คราฟต์',
      children: <CraftWikiTab wiki={wiki} />,
    },
    {
      key: 'raid',
      label: '👹 บอสและชุดเซ็ต',
      children: (
        <>
          <Heading>Boss Raid (เดี่ยว)</Heading>
          <List
            items={[
              `สู้ได้ ${raid.attempts} ครั้ง (รวมทุกบอส) รีเซ็ตทุก ${raid.resetHours} ชม. (นับจากเที่ยงคืน) สู้แบบเรียลไทม์เหมือนผจญภัย สกิลและช่องสกิลใช้ได้เต็ม`,
              'ไม่ใช้ตารางธาตุ ความยากมาจากค่าพลังล้วน ๆ ทุกสายชนะได้ทุกบอส ธาตุของบอสเป็นแค่ลายเรื่อง',
              'ต้องถึงร่างที่กำหนดของแต่ละระดับ และชนะระดับก่อนหน้าของบอสตัวเดียวกันก่อน',
              `ชนะ: ได้ชิ้นเซ็ตของบอส 1 ชิ้น (ช่องสุ่ม ช่องละเท่ากัน) เกรดตามระดับ + 🎫 Boss Token ${raid.bossTokensPerWin} + 🎖️ Raid Token (ชนะครั้งแรกของแต่ละบอส/ระดับได้ ${times(raid.firstClearMultiplier)})`,
              'กระเป๋าอุปกรณ์เต็มจะสู้ไม่ได้ (ไม่เสียโควตา) แพ้ไม่ได้อะไรและเสียโควตา',
              'ผลการสู้บอสไม่นับเป็นชนะ/แพ้ของมอนสำหรับเงื่อนไขวิวัฒนาการ',
              'ชนะยังได้แกนวัตถุดิบคราฟต์ตามระดับ (ดูแท็บ คราฟต์)',
            ]}
          />
          <Table
            head={['ระดับ', 'ต้อง', 'เกรดที่ดรอป', '🎖️ ต่อชัยชนะ', 'แลกชิ้น 🎫']}
            rows={raid.difficulties.map((difficulty) => [
              difficulty.difficulty,
              stageLabel[difficulty.minStage],
              gradeLabel[difficulty.grade],
              difficulty.raidTokens,
              raid.exchangeCost[difficulty.grade] ?? '-',
            ])}
          />
          <p className="mt-1 text-xs">
            แลกชิ้นเซ็ตด้วย Boss Token ได้เฉพาะเกรดที่คุณเคยชนะระดับที่ดรอปมาแล้ว
          </p>
          <Heading>ชุดเซ็ต</Heading>
          <List
            items={[
              `โบนัสเปอร์เซ็นต์ของเซ็ตคูณ ${raid.setEnhanceMultiplier} เมื่อทุกชิ้นของเซ็ตที่สวมตีบวกถึง +${raid.setEnhanceThreshold} ขึ้นไป (เอฟเฟกต์ 4 ชิ้นไม่เปลี่ยน)`,
              'ผสมเซ็ตได้ เช่น 2 ชิ้นของเซ็ตหนึ่ง + 2 ชิ้นของอีกเซ็ต ได้โบนัส 2 ชิ้นของทั้งสองเซ็ต',
              'ชิ้นเซ็ตสุ่มค่ารองและ Special เหมือนชิ้นธรรมดาตามเกรด และค่าหลักสูงกว่าชิ้นธรรมดาเกรดเดียวกัน เอฟเฟกต์ติดไปกับทีมป้องกัน PvP ด้วย',
            ]}
          />
          <Table
            head={['เซ็ต', 'ที่มา', '2 ชิ้น', '4 ชิ้น']}
            rows={Object.entries(equipment.sets).map(([setId, set]) => {
              const two = set.bonuses.find((bonus) => bonus.pieces === 2)
              return [
                set.name,
                isCraftSet(wiki, setId) ? 'คราฟต์' : 'บอส',
                [describePctBonus(two?.pct ?? {}), describeCareBonus(two?.care)]
                  .filter(Boolean)
                  .join(' · '),
                describeSetEffect(set.bonuses.find((bonus) => bonus.pieces === 4)?.effect ?? {}),
              ]
            })}
          />
        </>
      ),
    },
    {
      key: 'world-boss',
      label: '🌩️ บอสโลก',
      children: (
        <>
          <Heading>วิธีเล่น</Heading>
          <List
            items={[
              `ทุกคนช่วยกันตีบอสตัวเดียวกัน สัปดาห์ละหนึ่งตัวตามลำดับ วนใหม่เมื่อครบ: ${worldBoss.bosses.map((boss) => `${boss.emoji} ${boss.name} (${elementLabel[boss.element]}, ${boss.ability}, HP ${boss.hp}${boss.shield ? `, เกราะ ${boss.shield}` : ''}${boss.enrage ? `, โกรธวินาทีที่ ${boss.enrage.sec} ×${boss.enrage.mult}` : ''})`).join(' · ')} (นับจันทร์ 00:00 ถึงอาทิตย์ เวลาไทย) ถ้าไม่แตกก็ยังได้รางวัลตามส่วนร่วม`,
              `ต้องเป็นร่างโตขึ้นไป ตีได้ ${worldBoss.hits} ครั้ง รีเซ็ตทุก ${worldBoss.resetHours} ชม. (นับจากเที่ยงคืน) ครั้งละไม่เกิน 1 นาที แบบเรียลไทม์ (หรือจนมอนล้ม)`,
              'ดาเมจที่ทำได้ลด HP รวมของบอสทันที ใช้ค่าพลังสดของมอนรวมอุปกรณ์และเอฟเฟกต์เซ็ต ใช้ตารางธาตุทั้งสองฝั่ง (ได้เปรียบ ×1.3 เสียเปรียบ ×0.8) เกราะของบอสหักจากดาเมจของการตีแต่ละครั้งก่อน และบอสที่โกรธจะโจมตีแรงขึ้นตามรอบ มอนที่ HP/เกราะดีอยู่ได้นานกว่าและทำดาเมจรวมมากกว่า',
              'ผลไม่นับเป็นชนะ/แพ้ของมอนสำหรับเงื่อนไขวิวัฒนาการ',
              `ผู้ตีครั้งสุดท้ายที่ทำให้บอสแตกได้ชิ้นชุดของบอสตัวนั้น (${gradeLabel[worldBoss.killingBlowGrade]}) การันตี`,
            ]}
          />
          <Heading>รางวัล (รับเองหลังสัปดาห์จบหรือบอสแตก)</Heading>
          <List
            items={[
              `ทุกคนที่ตีอย่างน้อย 1 ครั้ง: ต่อการตี 1 ครั้งได้ 🪙 ${worldBoss.perHit.coin} + 🎖️ ${worldBoss.perHit.raidToken}`,
              `บอสแตกก่อนสัปดาห์จบ: ทุกคนที่ร่วมได้เพิ่ม 🪙 ${worldBoss.defeatedBonus.coin} + 🎖️ ${worldBoss.defeatedBonus.raidToken}`,
              'รางวัลตามอันดับดาเมจ (ด้านล่าง) ชิ้นเซ็ตสุ่มด้วยค่าที่คงที่ต่อผู้เล่นต่อสัปดาห์ รับซ้ำหรือรับหลังเคลียร์กระเป๋าก็ได้ผลเดิม',
              'ผู้ตีครั้งสุดท้ายที่ทำให้บอสแตกได้หินรีไฟน์มหากาพย์เพิ่ม 1 ก้อน',
              `รางวัลรายสัปดาห์ยังมีวัตถุดิบเฉพาะเซ็ตเรือธง ${wiki.craft.worldBoss.unique} ชิ้น และ Catalyst ${wiki.craft.worldBoss.catalyst} ก้อน (อันดับ 1–${wiki.craft.worldBoss.topRank} เพิ่มอีกอย่างละ ${wiki.craft.worldBoss.topUnique}/${wiki.craft.worldBoss.topCatalyst}) ดูแท็บ คราฟต์`,
              'กระเป๋าอุปกรณ์เต็มรับไม่ได้ถ้ามีชิ้นเซ็ตในรางวัล (ไม่เสียสิทธิ์) แลกชิ้นด้วย 🎫 ได้เฉพาะเกรดหายากและมหากาพย์ หลังเคยรับรางวัลบอสนี้',
            ]}
          />
          <Table
            head={['อันดับดาเมจ', '🎖️', '🎫', 'โอกาสได้ชิ้นเซ็ต', 'หินรีไฟน์']}
            rows={worldBoss.rankRewards.map((tier, index) => [
              tier.maxRank === null
                ? 'ที่เหลือ'
                : tier.maxRank === 1
                  ? 'อันดับ 1'
                  : `อันดับ ${(worldBoss.rankRewards[index - 1]?.maxRank ?? 0) + 1}–${tier.maxRank}`,
              tier.raidToken,
              tier.bossToken,
              tier.pieceChance > 0
                ? `${percent(tier.pieceChance)} (${gradeLabel[tier.pieceGrade]})`
                : '-',
              describeRefineStones(tier.refineStones) || '-',
            ])}
          />
        </>
      ),
    },
    {
      key: 'boss-detail',
      label: '🎯 ค่าบอสและหุ่นซ้อม',
      children: (
        <>
          <Heading>ค่าพลังและสกิลของบอส</Heading>
          <List
            items={[
              'หน้า บอส และ บอสโลก แสดง ATK / DEF / SPD ของบอส (Raid แสดงทุกระดับเทียบกัน) พร้อมไอคอนสกิล เอาเมาส์ชี้ (หรือแตะ) เพื่อดูรายละเอียดสกิลเต็ม',
              `ข้าง DEF แสดง "ลดดาเมจ %" คือดาเมจที่ DEF ตัดออก = DEF ÷ (DEF + ${wiki.dummy.defenseK}) สูงสุด ${percent(wiki.dummy.maxDefenseReduction)} เป็นค่าพื้นฐาน สถานะอย่าง "DEF ลด" จะเปลี่ยนค่านี้ระหว่างไฟต์`,
              'สกิลที่แสดงคือสกิลจริงที่บอสใช้ในสนาม รวมพาสซีฟและสกิลหลบ',
            ]}
          />
          <Heading>หุ่นซ้อม</Heading>
          <List
            items={[
              `เมนู 🎯 หุ่นซ้อม ให้มอนของคุณสู้กับหุ่นที่ไม่ตีกลับ ${wiki.dummy.fightSec} วินาที เพื่อวัดดาเมจของตัวเอง ฟรี ไม่เสียโควตา ไม่ได้รางวัล และไม่บันทึกผล`,
              `หุ่นกลาง: ปรับ DEF (0–${wiki.dummy.defMax}) และธาตุเองได้ ใช้ตารางธาตุตามปกติ`,
              'จำลองบอส: ใช้ DEF ธาตุ เกราะ และพาสซีฟป้องกันจริงของบอส Raid (เลือกระดับได้) หรือบอสโลก แต่บอสไม่โจมตี',
              'หลังจบแสดงดาเมจรวม DPS ดาเมจเฉลี่ยต่อครั้ง จำนวนคริ และครั้งที่แรงที่สุด ดู replay ได้',
            ]}
          />
        </>
      ),
    },
    {
      key: 'social',
      label: '🤝 เพื่อนและเช่าตัว',
      children: (
        <>
          <Heading>เพื่อน</Heading>
          <List
            items={[
              'เพิ่มเพื่อนด้วยรหัสเพื่อนที่เจ้าตัวแจกให้เท่านั้น ไม่ค้นหาจากชื่อผู้ใช้หรืออีเมล คนอื่นเห็นเฉพาะชื่อที่ตั้งเอง (ชื่อเดียวกับในสนามประลองและอันดับบอสโลก)',
              `มีเพื่อนได้ ${social.friendLimit} คน (รวมคำขอที่ส่งไปแล้วรออยู่) แต่ละคนมีคำขอค้างได้ไม่เกิน ${social.requestLimit} คำขอ ถ้าสองคนขอพร้อมกัน จะกลายเป็นเพื่อนกัน`,
              `เยี่ยมมอนเพื่อนดูได้อย่างเดียว ทักทายวันละ ${social.greetsPerDayPerFriend} ครั้งต่อเพื่อน (+${social.pointsGreet} แต้มมิตรภาพ)`,
              `ส่งของขวัญได้วันละ ${social.giftsPerDay} ชิ้น เป็นไอเทมจากกระเป๋าของคุณเอง ไม่ส่งเหรียญหรือเพชร (+${social.pointsGift} แต้ม)`,
            ]}
          />
          <Heading>ตัวซัพพอร์ตและเช่าตัว</Heading>
          <List
            items={[
              `ตั้งมอนของคุณเป็นตัวซัพพอร์ตให้เพื่อนเช่า (ร่างโตขึ้นไป เปลี่ยนได้ทุก ${social.supportCooldownMinutes} นาที) ระบบจำค่าพลังรวมอุปกรณ์ตอนตั้งไว้`,
              'เช่าได้เฉพาะตัวของเพื่อน ใช้ตีบอสโลกพร้อมกัน ตัวเช่าต่อสู้เอง (AI) ไม่ได้ EXP หรือรางวัล ใช้ในสนามประลอง (PvP) ไม่ได้',
              `ผู้เช่าจ่ายเจ้าของ 🪙 ${social.rentalFee} ต่อครั้ง เจ้าของรับได้สูงสุด 🪙 ${social.rentalOwnerDailyCap} ต่อวัน เกินแล้วเช่าได้ฟรี (ผู้เช่าไม่ต้องเสียส่วนที่เจ้าของรับไม่ได้) และได้ +${social.pointsRental} แต้มมิตรภาพ`,
              'ดาเมจของตัวเช่าลด HP รวมของบอสจริง แต่ไม่นับในอันดับดาเมจของผู้เช่า',
            ]}
          />
        </>
      ),
    },
    {
      key: 'pvp',
      label: '🏟️ สนามประลอง (PvP)',
      children: (
        <>
          <Heading>วิธีเล่น</Heading>
          <List
            items={[
              `ต้องเป็นร่างโตขึ้นไปถึงเข้าสนามได้ ตั้ง "ทีมป้องกัน" ไว้ก่อน (ระบบจำค่าพลังรวมอุปกรณ์ของมอนตอนนั้น) ถึงจะท้าคนอื่นได้ เปลี่ยนทีมได้ทุก ${pvp.defenseCooldownMinutes} นาที`,
              `ท้าได้วันละ ${pvp.dailyAttempts} ครั้ง ระบบเสนอ ${pvp.opponentCount} คนที่เป็นร่างเดียวกัน เรตติ้งห่างไม่เกิน ${pvp.ratingWindow} คนเดิมท้าได้ไม่เกิน ${pvp.maxFightsPerOpponentPerDay} ครั้งต่อวัน`,
              `ท้าด้วยค่าพลังสดของมอนคุณ ผลไม่นับเป็นชนะ/แพ้ของมอนสำหรับเงื่อนไขวิวัฒนาการ`,
              `ชนะได้ 🪙 ${pvp.winCoin} แพ้ได้ 🪙 ${pvp.lossCoin}`,
              'ผู้ที่ถูกท้าก็ได้/เสียเรตติ้งแม้ไม่ได้ออนไลน์ และดูการต่อสู้ย้อนหลังได้ในประวัติ',
              'ชื่อที่คนอื่นเห็นคือชื่อสนามที่คุณตั้งเอง ไม่แสดงชื่อผู้ใช้',
            ]}
          />
          <Heading>เรตติ้ง (ELO)</Heading>
          <List
            items={[
              `เริ่ม ${pvp.startRating} ผู้ท้าเปลี่ยนสูงสุด ${pvp.kAttacker / 2} แต้ม/ครั้งในแมตช์สูสี ผู้ป้องกันเปลี่ยนสูงสุด ${pvp.kDefender / 2}`,
              `ชนะคนเรตติ้งสูงกว่าได้แต้มมากกว่า ซีซันละเดือน (รีเซ็ตเที่ยงคืนเวลาไทยวันที่ 1) เริ่มซีซันใหม่ด้วยครึ่งหนึ่งของส่วนต่างจาก ${pvp.startRating} (${percent(pvp.seasonResetKeep)})`,
              `ไม่มีผู้เล่นพอ ระบบเติมคู่ต่อสู้ NPC ให้ (เรตติ้งคงที่ ไม่เปลี่ยน)`,
            ]}
          />
          <Table
            head={['NPC', 'ร่าง', 'เรตติ้ง']}
            rows={pvp.npcs.map((npc) => [
              `${npc.emoji} ${npc.name}`,
              stageLabel[npc.stage],
              npc.rating,
            ])}
          />
          <Heading>รางวัลซีซัน</Heading>
          <p className="mb-1 text-xs">
            รับได้หลังซีซันจบ ต้องสู้อย่างน้อย {pvp.seasonMinFights} ครั้ง
            จัดอันดับในกลุ่มที่สู้ถึงเกณฑ์
          </p>
          <Table
            head={['อันดับ', 'รางวัล']}
            rows={pvp.seasonRewards.map((tier, index) => [
              tier.maxRank === null
                ? 'ผู้เข้าร่วม'
                : tier.maxRank === 1
                  ? 'อันดับ 1'
                  : `อันดับ ${(pvp.seasonRewards[index - 1]?.maxRank ?? 0) + 1}–${tier.maxRank}`,
              `🪙 ${tier.coin} + 💎 ${tier.gem} + 🎖️ ${tier.raidToken}`,
            ])}
          />
        </>
      ),
    },
    {
      key: 'reset',
      label: '🕒 ตารางรีเซ็ต',
      children: <ResetWikiTab wiki={wiki} />,
    },
    {
      key: 'economy',
      label: '💰 เหรียญ เพชร และร้านค้า',
      children: (
        <>
          <Table
            head={['', 'ได้จาก', 'ใช้ทำอะไร']}
            rows={[
              ['🪙 เหรียญ', 'ชนะด่านผจญภัย · ภารกิจประจำวัน', 'ซื้อของในร้านค้า'],
              [
                '💎 เพชร',
                `ชนะบอสครั้งแรก · ค้นพบร่างใหม่ใน Dex (+${economy.dexDiscoveryGems})`,
                'ซื้อวัตถุดิบตีบวกบางชนิด',
              ],
            ]}
          />
          <Heading>ร้านค้า (ซื้อเก็บในกระเป๋า แล้วกดใช้กับมอนทีหลัง)</Heading>
          <Table
            head={['ไอเทม', 'ราคา', 'ผล']}
            rows={economy.shopItems.map((item) => [
              `${item.emoji} ${item.name}`,
              `🪙 ${item.price}`,
              item.description,
            ])}
          />
          <Heading>ภารกิจประจำวัน (รีเซ็ตเที่ยงคืนเวลาไทย)</Heading>
          <Table
            head={['ภารกิจ', 'รางวัล']}
            rows={economy.dailyQuests.map((quest) => [
              `${quest.emoji} ${quest.name}`,
              `🪙 ${quest.coinReward}${quest.gemReward ? ` 💎 ${quest.gemReward}` : ''}`,
            ])}
          />
          <Heading>ภารกิจประจำสัปดาห์ (รีเซ็ตเที่ยงคืนวันจันทร์เวลาไทย)</Heading>
          <Table
            head={['ภารกิจ', 'รางวัล']}
            rows={economy.weeklyQuests.map((quest) => [
              `${quest.emoji} ${quest.name}`,
              `🪙 ${quest.coinReward} 💎 ${quest.gemReward}`,
            ])}
          />
        </>
      ),
    },
  ]
}

export const WikiPanel = () => {
  const { data, isLoading } = useGetWiki()
  if (isLoading || !data) {
    return <Spin />
  }
  // accordion: opening a section closes the one that was open.
  return (
    <Collapse
      accordion
      className="w-full"
      defaultActiveKey={['start']}
      items={buildSections(data)}
    />
  )
}
