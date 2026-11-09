import { craftSetsUsing, craftStyleLabel, describeCareBonus, percent, times } from './wiki-helper'
import { Heading, List, Table } from './WikiParts'
import {
  describePctBonus,
  describeSetEffect,
  elementLabel,
  formatAge,
  gradeLabel,
  stageLabel,
} from '../core/tamagotchi-helper'
import { EnumEquipmentGrade, EnumMonsterLine, IWikiData } from '../core/tamagotchi-interface'

// The guide's craft page. Every number is the server's (wiki.craft / wiki.equipment).

const MYTHIC = EnumEquipmentGrade.MYTHIC

const rangeText = (range: { min: number; max: number }) => `${range.min}–${range.max}`

const sourceText = (wiki: IWikiData, tier: IWikiData['craft']['materials'][number]['tier']) => {
  const { adventureEssence, raidCores, worldBoss } = wiki.craft
  if (tier === 'common') {
    return `ผจญภัย: ชนะแล้วมีโอกาส ${percent(adventureEssence.chance)} ได้ ${rangeText(adventureEssence)} ชิ้น (ข้ามด่านก็มีโอกาสทุกรอบ) · สำรวจ: ของสะสมทุก ${formatAge(wiki.idle.expeditionDropEveryMinutes)} อาจเป็นเอสเซนซ์`
  }
  if (tier === 'rare') {
    return `Boss Raid ชนะ: ${Object.entries(raidCores)
      .map(([difficulty, count]) => `${difficulty} ${count}`)
      .join(' · ')} ก้อน/ครั้ง`
  }
  const each = tier === 'unique' ? worldBoss.unique : worldBoss.catalyst
  const top = tier === 'unique' ? worldBoss.topUnique : worldBoss.topCatalyst
  const bossText = `บอสโลก รางวัลรายสัปดาห์: ทุกคนที่ร่วม ${each} ชิ้น อันดับ 1–${worldBoss.topRank} เพิ่มอีก ${top}${tier === 'unique' ? ' (ชนิดสุ่ม)' : ''}`
  // The Catalyst also has a small chance in the size-M mystery box (login calendar, day 27).
  return tier === 'catalyst'
    ? `${bossText} · กล่องปริศนาไซส์ M (เช็คอินรายเดือนช่อง 27) มีโอกาสน้อยมาก`
    : bossText
}

export const CraftWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { craft, equipment, adventure } = wiki
  const { standard, flagship } = craft.tiers
  const mythicSpecial = equipment.special.byGrade[MYTHIC]
  const mythicStage = equipment.minStageByGrade[MYTHIC]
  const areaEssences = adventure.areas
    .map((area) => {
      const element = craft.adventureEssence.areaElement[area.id]
      return `${area.emoji} ${area.name} → ${element ? elementLabel[element as EnumMonsterLine] : 'สุ่ม'}`
    })
    .join(' · ')

  return (
    <>
      <Heading>คราฟต์อุปกรณ์</Heading>
      <List
        items={[
          'คราฟต์ได้ทีละ 1 ชิ้น (คิวเดียว) เลือกสูตรของชิ้นที่ต้องการ ใช้วัตถุดิบและเหรียญตั้งแต่ตอนเริ่ม แล้วรอเวลา ได้ครบแล้วกดรับ ไม่มีรอบยกเลิกและไม่คืนวัตถุดิบ',
          'เห็นทุกสูตรตั้งแต่ต้น สูตรที่ขาดวัตถุดิบจะบอกว่าขาดอะไรและได้จากไหน เซ็ตเรือธงต้องมีวัตถุดิบเฉพาะจากบอสโลก',
          'ต้องรอจนครบเวลา ข้ามเวลาด้วยเหรียญไม่ได้ (ระหว่างรอเล่นอย่างอื่นได้ตามปกติ)',
          `กดรับต้องมีที่ว่างในกระเป๋าอุปกรณ์ (${equipment.capacity} ชิ้น) ถ้าเต็มจะรับไม่ได้แต่งานยังอยู่ในคิว ไม่หาย`,
          'ค่ารองและ Special ของชิ้นที่ได้สุ่มบนเซิร์ฟเวอร์เหมือนชิ้นดรอป ชิ้นคราฟต์ตีบวก รีไฟน์ และแยกชิ้นส่วนได้เหมือนชิ้นอื่น (แยกแล้วได้หิน ไม่ได้วัตถุดิบคราฟต์คืน)',
          'แท็บ "วัตถุดิบ" ในกระเป๋าแสดงวัตถุดิบที่มีทั้งหมด และกรองอุปกรณ์ตามชื่อเซ็ตได้',
        ]}
      />
      <Table
        head={['ระดับ', 'เหรียญ', 'เวลารอ', 'เกรดที่ได้', 'เกรดสูงสุด (Catalyst)']}
        rows={[
          ['มาตรฐาน', standard],
          ['เรือธง', flagship],
        ].map(([name, tier]) => {
          const row = tier as typeof standard
          return [
            name as string,
            `🪙 ${row.coin}`,
            formatAge(row.minutes),
            gradeLabel[row.baseGrade],
            gradeLabel[row.maxGrade],
          ]
        })}
      />

      <Heading>Catalyst และ pity</Heading>
      <List
        items={[
          `ใช้ Catalyst 1 ก้อนตอนเริ่มคราฟต์ (เลือกได้) มีโอกาส ${percent(craft.catalystChance)} อัปเกรดเกรดของชิ้นขึ้น 1 ขั้น ไม่เกินเกรดสูงสุดของสูตร`,
          `Pity: อัปเกรดพลาดติดกัน ${craft.pityAfterFails} ครั้ง ครั้งถัดไปสำเร็จแน่นอน นับแยกแต่ละขั้น (มหากาพย์→ตำนาน และ ตำนาน→มิธิก) สำเร็จแล้วรีเซ็ต`,
          'Catalyst หมดไปไม่ว่าอัปเกรดสำเร็จหรือไม่ ผลสุ่มตอนกดรับ',
        ]}
      />

      <Heading>เกรด {gradeLabel[MYTHIC]} (Mythic)</Heading>
      <List
        items={[
          `เกรดสูงสุด ได้จากการคราฟต์เซ็ตเรือธงแล้วอัปเกรดด้วย Catalyst เท่านั้น ไม่ดรอป ไม่มีในกล่อง และแลกกับบอสไม่ได้`,
          `ค่าหลัก ${times(equipment.gradeMultiplier[MYTHIC])} เท่าเกรดตำนาน (ไม่เพิ่มเพดานค่าหลัก) แต่ค่ารองมากกว่า: ${rangeText(equipment.subStatCount[MYTHIC])} ค่า (ตำนาน ${rangeText(equipment.subStatCount[EnumEquipmentGrade.LEGENDARY])})`,
          `Special ${mythicSpecial.guaranteed ?? 1} ตัวแน่นอน และโอกาส ${percent(mythicSpecial.secondChance)} ได้ตัวเพิ่ม ค่าสุ่มได้ ${percent(mythicSpecial.lo)}–${percent(mythicSpecial.hi)} ของช่วง รวมข้ามชิ้นไม่เกิน ${times(equipment.special.totalCapMultiplier)} ของค่าสูงสุดเหมือนเดิม`,
          `${mythicStage ? `สวมได้ตั้งแต่ร่าง ${stageLabel[mythicStage]} ขึ้นไป · ` : ''}ตีบวกและรีไฟน์ใช้ระดับหินเดียวกับเกรดตำนาน`,
        ]}
      />

      <Heading>วัตถุดิบคราฟต์</Heading>
      <p className="text-xs">ได้จากการดรอปเท่านั้น ไม่ขาย ไม่มีเพดานจำนวน</p>
      <Table
        head={['วัตถุดิบ', 'ใช้กับ', 'ได้จาก']}
        rows={craft.materials.map((material) => {
          const users = craftSetsUsing(wiki, material.id)
          return [
            `${material.emoji} ${material.name}`,
            material.tier === 'catalyst'
              ? 'ทุกสูตร (ไม่บังคับ)'
              : users.map((set) => set.name).join(' · '),
            sourceText(wiki, material.tier),
          ]
        })}
      />
      <p className="mt-1 text-xs">เอสเซนซ์จากผจญภัยตามธาตุของพื้นที่: {areaEssences}</p>

      <Heading>เซ็ตคราฟต์ ({craft.sets.length} ชุด)</Heading>
      <List
        items={[
          'ได้จากการคราฟต์เท่านั้น 4 ชิ้นต่อชุด (อาวุธ เกราะ หมวก เครื่องประดับ) ผสมกับเซ็ตบอสได้ (2 ชิ้น + 2 ชิ้น)',
          `เซ็ตมาตรฐานคราฟต์ที่เกรด${gradeLabel[standard.baseGrade]} (อัปได้ถึง${gradeLabel[standard.maxGrade]}) เซ็ตเรือธงคราฟต์ที่เกรด${gradeLabel[flagship.baseGrade]} (อัปได้ถึง${gradeLabel[flagship.maxGrade]})`,
          'โบนัส 4 ชิ้นเป็นเอฟเฟกต์ในไฟต์เรียลไทม์ ชุดสายดูแลให้ของดีฝั่งเลี้ยงสัตว์ที่ 2 ชิ้น แลกกับพลังต่อสู้ที่น้อยกว่า',
        ]}
      />
      <Table
        head={['เซ็ต', 'สไตล์', 'ระดับ', '2 ชิ้น', '4 ชิ้น']}
        rows={craft.sets.map((set) => {
          const bonuses = equipment.sets[set.id]?.bonuses ?? []
          const two = bonuses.find((bonus) => bonus.pieces === 2)
          const four = bonuses.find((bonus) => bonus.pieces === 4)
          return [
            set.name,
            craftStyleLabel[set.style] ?? set.style,
            set.flagship ? 'เรือธง' : 'มาตรฐาน',
            [describePctBonus(two?.pct ?? {}), describeCareBonus(two?.care)]
              .filter(Boolean)
              .join(' · '),
            describeSetEffect(four?.effect ?? {}),
          ]
        })}
      />
    </>
  )
}
