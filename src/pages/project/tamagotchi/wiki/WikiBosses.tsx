import { describeRefineStones, elementLabel, gradeLabel } from '../core/tamagotchi-helper'
import { IWikiData } from '../core/tamagotchi-interface'
import { percent } from './wiki-helper'
import { Heading, List, Table } from './WikiParts'

export const WorldBossWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { worldBoss } = wiki
  return (
    <>
      <Heading>วิธีเล่น</Heading>
      <List
        items={[
          `ทุกคนช่วยกันตีบอสตัวเดียวกัน สัปดาห์ละหนึ่งตัวตามลำดับ วนใหม่เมื่อครบ: ${worldBoss.bosses.map((boss) => `${boss.emoji} ${boss.name} (${elementLabel[boss.element]}, ${boss.ability}, HP ${boss.hp}${boss.shield ? `, เกราะ ${boss.shield}` : ''}${boss.enrage ? `, โกรธวินาทีที่ ${boss.enrage.sec} ×${boss.enrage.mult}` : ''})`).join(' · ')} (นับจันทร์ 00:00 ถึงอาทิตย์ เวลาไทย) ถ้าไม่แตกก็ยังได้รางวัลตามส่วนร่วม`,
          `บอสแข็งแกร่งขึ้นระหว่างสู้: ทุก ๆ วินาทีที่ ${worldBoss.grow.secs.join(' และ ')} จะโตขึ้นหนึ่งขั้น ATK +${worldBoss.grow.atk}% และ DEF +${worldBoss.grow.def}% ต่อขั้น และทุกตัวมีสกิลโจมตีทั่วสนาม (เตือน 1 วินาที) ต้องใช้สกิลหลบ`,
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
  )
}

export const BossDetailWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  return (
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
  )
}
