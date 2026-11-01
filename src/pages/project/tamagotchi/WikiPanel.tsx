import { Collapse, Spin, Tag } from 'antd'
import { ReactNode } from 'react'
import {
  describeConditions,
  describePctBonus,
  describeSetEffect,
  elementLabel,
  formatAge,
  gradeLabel,
  lineOptions,
  slotLabel,
  stageLabel,
} from './tamagotchi-helper'
import { EnumMonsterLine, EnumMonsterStage, IBattleStats, IWikiData } from './tamagotchi-interface'
import { useGetWiki } from './tamagotchi-service'

// The in-game guide. Every number comes from GET /monster/wiki (the server's rule constants), so
// this page explains the rules exactly as the server applies them.

const percent = (value: number) => `${Math.round(value * 100)}%`
const times = (value: number) => `×${value}`

const Table = (props: { head: string[]; rows: ReactNode[][] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-xs">
      <thead>
        <tr className="border-b border-slate-200 dark:border-slate-700">
          {props.head.map((cell) => (
            <th key={cell} className="py-1 pr-2 font-semibold">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.rows.map((row, index) => (
          <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="py-1 pr-2 align-top">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const List = (props: { items: ReactNode[] }) => (
  <ul className="ml-4 list-disc space-y-1 text-sm">
    {props.items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
)

const Heading = (props: { children: ReactNode }) => (
  <div className="mt-3 mb-1 font-semibold text-slate-900 first:mt-0 dark:text-slate-100">
    {props.children}
  </div>
)

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

const buildSections = (wiki: IWikiData) => {
  const {
    care,
    online,
    evolution,
    merge,
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
  const speciesName = (id: string) => {
    const species = evolution.species.find((entry) => entry.id === id)
    return species ? `${species.emoji} ${species.name}` : id
  }

  return [
    {
      key: 'start',
      label: '🎮 วิธีเล่น',
      children: (
        <List
          items={[
            'เลือกไข่ 1 ใน 3 ธาตุ แล้วรอไข่ฟัก เลี้ยงพร้อมกันได้ 4 ตัว (กดช่องด้านบนเพื่อเลือกตัวที่จะเล่นด้วยในโหมดอื่น ๆ)',
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
              `ระหว่างออนไลน์: วิวัฒนาการเร็วขึ้น ${times(online.evolutionMultiplier)}`,
              'ความหิว ความแข็งแรง อึ และอายุ เดินตามเวลาจริงเสมอ ไม่ว่าออนไลน์หรือไม่',
            ]}
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
          {lineOptions.map((option) => (
            <div key={option.line}>
              <Heading>{elementLabel[option.line]}</Heading>
              <div className="flex flex-col gap-2">
                {evolution.species
                  .filter(
                    (species) =>
                      species.line === option.line && species.stage !== EnumMonsterStage.FUSED
                  )
                  .map((species) => (
                    <div
                      key={species.id}
                      className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700"
                    >
                      <div className="text-sm font-medium">
                        {species.emoji} {species.name} <Tag>{stageLabel[species.stage]}</Tag>
                      </div>
                      {species.stage !== EnumMonsterStage.EGG && (
                        <div className="text-slate-500 dark:text-slate-400">
                          {statsText(species.stats)} · สกิล {species.skill.name} (
                          {times(species.skill.power)}) · น้ำหนักขั้นต่ำ {species.minWeight} g
                        </div>
                      )}
                      {species.evolutions.map((rule) => (
                        <div key={rule.to}>
                          → {speciesName(rule.to)}: {describeConditions(rule)}
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          ))}
          <Heading>ร่างผสาน (รวมร่าง)</Heading>
          <List
            items={[
              `รวมมอนของคุณสองตัวที่เป็นร่างสูงสุด (สายหลักหรือสายแตกก็ได้ ต้องไม่ป่วยและไม่ได้ออกสำรวจ) เป็นร่างผสานหนึ่งตัว จ่าย 🪙 ${merge.coinCost} และ 💎 ${merge.gemCost}`,
              `ค่าพลัง = ร่างสูงสุด ${times(merge.powerMultiplier)} ปรับตามสายของพ่อแม่ทั้งสอง ธาตุและสกิลมาจากตัวหลักที่คุณเลือก`,
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
          <Heading>ลำดับการต่อสู้</Heading>
          <List
            items={[
              'ผลัดกันตีรอบละครั้ง SPD สูงกว่าตีก่อน (เท่ากันสุ่ม)',
              `ทุกรอบที่ ${battle.skillEveryRounds} ใช้สกิล รอบอื่นโจมตีธรรมดา (${times(1)})`,
              `เกิน ${battle.maxRounds} รอบยังไม่จบ นับว่าแพ้`,
              'ผลการต่อสู้ตัดสินที่เซิร์ฟเวอร์ หน้าจอแค่เล่นภาพตามผล',
            ]}
          />
          <Heading>สูตรดาเมจ</Heading>
          <div className="rounded-lg bg-slate-100 p-2 font-mono text-xs dark:bg-slate-800">
            (ATK × พลังท่า × ธาตุ − DEF × {battle.defenseFactor}) × สุ่ม {1 - battle.damageVariance}
            –{1 + battle.damageVariance} × คริติคอล
          </div>
          <List
            items={[
              `คริติคอล: โอกาส ${percent(battle.criticalChance)} ดาเมจ ${times(battle.criticalMultiplier)}`,
              'ดาเมจขั้นต่ำ 1',
            ]}
          />
          <Heading>ธาตุ</Heading>
          <Table
            head={['ธาตุ', 'ได้เปรียบ', 'เสียเปรียบ']}
            rows={(Object.keys(battle.beats) as EnumMonsterLine[]).map((element) => {
              const losesTo = (Object.keys(battle.beats) as EnumMonsterLine[]).find(
                (other) => battle.beats[other] === element
              )
              return [
                elementLabel[element],
                `${elementLabel[battle.beats[element]]} ${times(battle.strongMultiplier)}`,
                losesTo ? `${elementLabel[losesTo]} ${times(battle.weakMultiplier)}` : '–',
              ]
            })}
          />
          <Heading>ค่าใช้จ่าย</Heading>
          <List items={[`สู้ 1 ครั้ง: น้ำหนัก −${battle.weightLoss}`, 'ป่วยอยู่สู้ไม่ได้']} />
        </>
      ),
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
              `ทุก ${formatAge(idle.expeditionDropEveryMinutes)} ได้ไอเทมสะสม 1 ชิ้น (เนื้อชั้นดีหรือโปรตีนเชค)`,
              `เหรียญต่อชั่วโมงขึ้นกับพื้นที่และค่าพลังของมอน (${times(idle.expeditionPowerMultiplierMin)}–${times(idle.expeditionPowerMultiplierMax)} เทียบร่างที่แนะนำ) ล็อกอัตราไว้ตอนออกเดินทาง`,
              'มอนที่ตายระหว่างสำรวจจะเสียรางวัลที่ยังไม่ได้รับ ระหว่างสำรวจสู้ในผจญภัยไม่ได้',
              'ยังไม่มี EXP และวัตถุดิบ จะมาพร้อมระบบอุปกรณ์',
            ]}
          />
          <Table
            head={['พื้นที่', 'เหรียญ/ชม. (ร่างที่แนะนำ)']}
            rows={idle.expeditionAreas.map((area) => [
              `${area.emoji} ${area.name}`,
              `🪙 ${area.baseRatePerHour}`,
            ])}
          />
          <Heading>ต่อสู้อัตโนมัติ (ออนไลน์)</Heading>
          <List
            items={[
              'เปิดหน้าผจญภัยค้างไว้ มอนสู้ด่านที่ชนะแล้ว (ไม่ใช่บอส) วนไปเรื่อย ๆ ปิดหน้าหรือสลับแท็บแล้วหยุด',
              `สู้ได้ทุก ${idle.autoBattleCooldownSeconds} วินาที จ่ายเหรียญตามตารางด้านล่าง`,
              `เพดานรางวัลต่อสู้อัตโนมัติ 🪙 ${idle.autoBattleDailyCoinCap} ต่อวัน (รีเซ็ตเที่ยงคืนเวลาไทย)`,
              'ต่อชั่วโมงได้มากกว่าการสำรวจเล็กน้อย เป็นแรงจูงใจให้เปิดเกมค้างไว้',
            ]}
          />
          <Table
            head={['ด่าน', 'เหรียญต่อการชนะ']}
            rows={idle.expeditionAreas.flatMap((area) =>
              area.autoBattleRewards.map((reward) => [
                `${area.emoji} ${reward.name}`,
                `🪙 ${reward.coins}`,
              ])
            )}
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
              `แต้มได้จาก Dex ร่างละ 1, เคลียร์เรดครั้งแรกบอสละระดับ 1, ล้มบอสโลก 1 และจบซีซัน PvP ที่ผ่านเกณฑ์ (${passive.pvpSeasonPoints
                .map(
                  (tier) =>
                    `${tier.maxRank ? `อันดับ ≤ ${tier.maxRank}` : 'ที่เหลือ'}: ${tier.points}`
                )
                .join(' · ')}) รวมสูงสุด ${passive.maxPoints} แต้ม`,
              `ถอนแต้มคืนได้ ${passive.freeRefunds} แต้มแรกฟรี หลังจากนั้นแต้มละ 💎 ${passive.respecGemPrice}`,
              `โหนดเหรียญสำรวจและโอกาสดรอปอุปกรณ์รวมกันได้ไม่เกิน +${passive.economyCap}% อย่างละ`,
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
              `สวมได้ช่องละ 1 ชิ้น ค่าบวกเข้ากับค่าพลังของมอนตรง ๆ ผูกกับบัญชี ไม่หายเมื่อมอนตาย ส่งต่อให้ตัวใหม่ได้ กระเป๋าเก็บได้ ${equipment.capacity} ชิ้น`,
              'สวม/ถอดไม่ได้ระหว่างมอนออกสำรวจ',
              `เกรดคูณค่าหลัก: ${Object.entries(equipment.gradeMultiplier)
                .map(
                  ([grade, value]) =>
                    `${gradeLabel[grade as keyof typeof gradeLabel]} ${times(value)}`
                )
                .join(' · ')}`,
              'ไอเทมธรรมดามีค่ารองสุ่ม 1–3 ค่า ชุดเซ็ตจะมาพร้อมบอสในเฟสถัดไป',
            ]}
          />
          <Table head={['ช่อง', 'ค่าหลัก']} rows={slotRows} />
          <Heading>ที่มาของอุปกรณ์</Heading>
          <List
            items={[
              `กล่องสุ่มในร้าน 🪙 ${equipment.boxPrice}: ${Object.entries(equipment.boxGradeRates)
                .map(([grade, rate]) => `${gradeLabel[grade as keyof typeof gradeLabel]} ${rate}%`)
                .join(' · ')}`,
              `ชนะด่านผจญภัยด้วยตัวเองมีโอกาสดรอป ${equipment.dropChancePercent}% (ต่อสู้อัตโนมัติและสำรวจไม่ดรอป) เกรดตามพื้นที่`,
              `สำรวจได้หินตีบวก 1 ก้อนทุก ${formatAge(equipment.expeditionStoneEveryMinutes)}`,
              `แยกชิ้นส่วนได้หินตามเกรด (${Object.entries(equipment.dismantleStones)
                .map(
                  ([grade, stones]) => `${gradeLabel[grade as keyof typeof gradeLabel]} ${stones}`
                )
                .join(' · ')}) และเพิ่ม 1 ก้อนต่อ 2 ระดับบวก`,
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
      key: 'raid',
      label: '👹 บอสและชุดเซ็ต',
      children: (
        <>
          <Heading>Boss Raid (เดี่ยว)</Heading>
          <List
            items={[
              `สู้ได้ ${raid.attempts} ครั้ง (รวมทุกบอส) รีเซ็ตทุก ${raid.resetHours} ชม. (นับจากเที่ยงคืน) ชนะต้องภายใน ${battle.maxRounds} รอบ`,
              'ไม่ใช้ตารางธาตุ ความยากมาจากค่าพลังล้วน ๆ ทุกสายชนะได้ทุกบอส ธาตุของบอสเป็นแค่ลายเรื่อง',
              'ต้องถึงร่างที่กำหนดของแต่ละระดับ และชนะระดับก่อนหน้าของบอสตัวเดียวกันก่อน',
              `ชนะ: ได้ชิ้นเซ็ตของบอส 1 ชิ้น (ช่องสุ่ม ช่องละเท่ากัน) เกรดตามระดับ + 🎫 Boss Token ${raid.bossTokensPerWin} + 🎖️ Raid Token (ชนะครั้งแรกของแต่ละบอส/ระดับได้ ${times(raid.firstClearMultiplier)})`,
              'กระเป๋าอุปกรณ์เต็มจะสู้ไม่ได้ (ไม่เสียโควตา) แพ้ไม่ได้อะไรและเสียโควตา',
              'ผลการสู้บอสไม่นับเป็นชนะ/แพ้ของมอนสำหรับเงื่อนไขวิวัฒนาการ',
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
              'ชิ้นเซ็ตมีค่ารองตายตัว และค่าหลักสูงกว่าชิ้นธรรมดาเกรดเดียวกัน เอฟเฟกต์ติดไปกับทีมป้องกัน PvP ด้วย',
            ]}
          />
          <Table
            head={['เซ็ต', '2 ชิ้น', '4 ชิ้น']}
            rows={Object.values(equipment.sets).map((set) => [
              set.name,
              describePctBonus(set.bonuses.find((bonus) => bonus.pieces === 2)?.pct ?? {}),
              describeSetEffect(set.bonuses.find((bonus) => bonus.pieces === 4)?.effect ?? {}),
            ])}
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
              `ทุกคนช่วยกันตีบอสตัวเดียวกัน ${worldBoss.bosses.map((boss) => `${boss.emoji} ${boss.name} (HP ${boss.hp})`).join(' · ')} สัปดาห์ละหนึ่งตัว (นับจันทร์ 00:00 ถึงอาทิตย์ เวลาไทย) ถ้าไม่แตกก็ยังได้รางวัลตามส่วนร่วม`,
              `ต้องเป็นร่างโตขึ้นไป ตีได้ ${worldBoss.hits} ครั้ง รีเซ็ตทุก ${worldBoss.resetHours} ชม. (นับจากเที่ยงคืน) ครั้งละไม่เกิน ${worldBoss.rounds} รอบ (หรือจนมอนล้ม)`,
              'ดาเมจที่ทำได้ลด HP รวมของบอสทันที ใช้ค่าพลังสดของมอนรวมอุปกรณ์และเอฟเฟกต์เซ็ต ไม่ใช้ตารางธาตุ มอนที่ HP/เกราะดีอยู่ได้นานกว่าและทำดาเมจรวมมากกว่า',
              'ผลไม่นับเป็นชนะ/แพ้ของมอนสำหรับเงื่อนไขวิวัฒนาการ',
              `ผู้ตีครั้งสุดท้ายที่ทำให้บอสแตกได้ชิ้นชุดสายฟ้าเร็ว (${gradeLabel[worldBoss.killingBlowGrade]}) การันตี`,
            ]}
          />
          <Heading>รางวัล (รับเองหลังสัปดาห์จบหรือบอสแตก)</Heading>
          <List
            items={[
              `ทุกคนที่ตีอย่างน้อย 1 ครั้ง: ต่อการตี 1 ครั้งได้ 🪙 ${worldBoss.perHit.coin} + 🎖️ ${worldBoss.perHit.raidToken}`,
              `บอสแตกก่อนสัปดาห์จบ: ทุกคนที่ร่วมได้เพิ่ม 🪙 ${worldBoss.defeatedBonus.coin} + 🎖️ ${worldBoss.defeatedBonus.raidToken}`,
              'รางวัลตามอันดับดาเมจ (ด้านล่าง) ชิ้นเซ็ตสุ่มด้วยค่าที่คงที่ต่อผู้เล่นต่อสัปดาห์ รับซ้ำหรือรับหลังเคลียร์กระเป๋าก็ได้ผลเดิม',
              'กระเป๋าอุปกรณ์เต็มรับไม่ได้ถ้ามีชิ้นเซ็ตในรางวัล (ไม่เสียสิทธิ์) แลกชิ้นด้วย 🎫 ได้เฉพาะเกรดหายากและมหากาพย์ หลังเคยรับรางวัลบอสนี้',
            ]}
          />
          <Table
            head={['อันดับดาเมจ', '🎖️', '🎫', 'โอกาสได้ชิ้นเซ็ต']}
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
            ])}
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
              `🪙 ${quest.coinReward}`,
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
  return <Collapse className="w-full" defaultActiveKey={['start']} items={buildSections(data)} />
}
