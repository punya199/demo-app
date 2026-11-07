import {
  describePctBonus,
  describeSetEffect,
  gradeLabel,
  slotLabel,
  stageLabel,
} from '../core/tamagotchi-helper'
import { IWikiData } from '../core/tamagotchi-interface'
import { describeCareBonus, isCraftSet, percent, times } from './wiki-helper'
import { Heading, List, Table } from './WikiParts'

export const EquipmentWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { adventure, equipment } = wiki
  const slotRows = Object.entries(equipment.slots).map(([slot, main]) => [
    slotLabel[slot as keyof typeof slotLabel],
    `${main.stat.toUpperCase()} (ฐาน ${main.base})`,
  ])

  return (
    <>
      <Heading>อุปกรณ์ 4 ช่อง</Heading>
      <List
        items={[
          `สวมได้ช่องละ 1 ชิ้น ค่าบวกเข้ากับค่าพลังของมอนตรง ๆ กระเป๋าผูกกับบัญชี เก็บได้ ${equipment.capacity} ชิ้น`,
          'มอนแต่ละตัวมีชุดอุปกรณ์ของตัวเอง ชิ้นหนึ่งใส่ได้ทีละตัว (ย้ายจากตัวอื่นได้ มีให้ยืนยัน) เมื่อมอนตายหรือถูกรวมร่าง ชิ้นที่ใส่อยู่จะกลับเข้ากระเป๋า',
          'สวม/ถอดไม่ได้ระหว่างมอนออกสำรวจ',
          `เกรดคูณค่าหลัก: ${Object.entries(equipment.gradeMultiplier)
            .map(
              ([grade, value]) => `${gradeLabel[grade as keyof typeof gradeLabel]} ${times(value)}`
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
            .map(([grade, stones]) => `${gradeLabel[grade as keyof typeof gradeLabel]} ${stones}`)
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
  )
}

export const RaidWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { equipment, raid } = wiki
  return (
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
  )
}
