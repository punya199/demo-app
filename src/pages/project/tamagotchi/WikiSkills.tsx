import { SKILL_KIND_LABEL } from './arena-helper'
import { ArenaSkillKind } from './arena-interface'
import { stageLabel } from './tamagotchi-helper'
import { EnumMonsterStage, IWikiData } from './tamagotchi-interface'
import { skillKindMeaning } from './wiki-helper'
import { Heading, List, Table } from './WikiParts'

// How arena skills work: who has them, how they unlock, what can be equipped and when they fire.
// The full catalogue (numbers and effects of every skill) lives on the Skills screen.

export const SkillsWikiTab = (props: { wiki: IWikiData }) => {
  const { arena } = props.wiki
  return (
    <>
      <Heading>สกิลในสนามเรียลไทม์</Heading>
      <List
        items={[
          `เฉพาะร่าง ${arena.skilledStages.map((stage) => stageLabel[stage]).join(' · ')} ที่ใช้สกิลได้ ไข่และร่างเด็กสู้ด้วยตีธรรมดาอย่างเดียว`,
          'ทุกตัวมีสกิลประจำร่าง (innate) ใส่ให้เองอัตโนมัติ ร่างผสานใช้สกิลประจำของร่างสูงสุดในสายที่เป็นฐาน',
          'เลือกใส่เพิ่มได้ 2 ช่องสกิล และ 1 ช่องสกิลหลบ ตั้งที่เมนู "สกิล" แยกต่อมอนแต่ละตัว',
          'หลังเปลี่ยนร่าง สกิลที่ใช้ไม่ได้อีกจะถูกถอดออกให้เอง',
        ]}
      />
      <Heading>ปลดล็อกสกิล</Heading>
      <List
        items={[
          'ปลดล็อกจาก Dex: ทุกร่างที่คุณเคยเลี้ยงสำเร็จ (อยู่ใน Dex) ปลดล็อกสกิลที่ร่างนั้นมี',
          `ร่าง ${stageLabel[EnumMonsterStage.ADULT]} ขึ้นไป: สกิลประจำร่าง · ${stageLabel[EnumMonsterStage.BABY_2]}: สกิลไร้ธาตุ · ${stageLabel[EnumMonsterStage.BABY_1]}: สกิลหลบ`,
          'เมนู "สกิล" แสดงสกิลทั้งหมดรวมที่ยังล็อก พร้อมบอกว่าปลดล็อกได้จากร่างไหน',
        ]}
      />
      <Heading>ใส่สกิลได้เมื่อ</Heading>
      <List
        items={[
          'สกิลเป็นธาตุเดียวกับมอน (ร่างผสาน: ธาตุของพ่อแม่ตัวใดตัวหนึ่ง) หรือเป็นสกิลไร้ธาตุ',
          'ใส่สกิลประจำร่างซ้ำไม่ได้',
          'สกิลพาสซีฟใส่ได้เพียง 1 ในทั้งชุด (นับสกิลประจำร่างด้วย)',
          'สกิลหลบใส่ได้ทุกตัว ไม่จำกัดธาตุ',
        ]}
      />
      <Heading>การใช้สกิลในไฟต์</Heading>
      <List
        items={[
          'ใช้สกิลเองอัตโนมัติเมื่อพร้อม ไม่ต้องกด',
          'แต่ละสกิลมีคูลดาวน์ของตัวเอง (ชุดเซ็ตบางชุดลดคูลดาวน์ให้) และมีช่วงร่ายสั้น ๆ ก่อนปล่อย',
          `หลังร่ายสกิลใด ๆ ทุกสกิลต้องรอ ${arena.skillDelaySec} วินาที (สกิลเสริมตัวเองรอครึ่งหนึ่ง เร็วขึ้นตามความเร็วโจมตี) นอกเหนือจากคูลดาวน์ของตัวมันเอง`,
          'ผลของสกิลที่ติดสถานะ ดูตารางสถานะในแท็บ "การต่อสู้"',
        ]}
      />
      <Heading>ประเภทสกิล</Heading>
      <Table
        head={['ประเภท', 'ทำอะไร']}
        rows={(Object.keys(SKILL_KIND_LABEL) as ArenaSkillKind[]).map((kind) => [
          SKILL_KIND_LABEL[kind],
          skillKindMeaning[kind] ?? '-',
        ])}
      />
      <p className="mt-1 text-xs">
        ตัวเลขและเอฟเฟกต์ของแต่ละสกิล (ดาเมจ ระยะ สถานะที่ติด) ดูได้ในเมนู "สกิล"
      </p>
    </>
  )
}
