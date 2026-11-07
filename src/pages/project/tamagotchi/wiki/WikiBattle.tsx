import { Tag } from 'antd'
import { elementLabel, formatAge, stageLabel } from '../core/tamagotchi-helper'
import { IWikiData } from '../core/tamagotchi-interface'
import { percent, times } from './wiki-helper'
import { statsText } from './wiki-shared'
import { ArenaBattleSection } from './WikiArena'
import { StatusEffectsSection } from './WikiStatus'
import { Heading, List, Table } from './WikiParts'

export const BattleWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { battle } = wiki
  return (
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
  )
}

export const AdventureWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { adventure } = wiki
  return (
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
  )
}

export const IdleWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { idle } = wiki
  return (
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
  )
}
