import { formatAge, stageLabel } from '../core/tamagotchi-helper'
import { IWikiData } from '../core/tamagotchi-interface'
import { times } from './wiki-helper'
import { hatchedStages } from './wiki-shared'
import { Heading, List, Table } from './WikiParts'

export const StartWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { care, online, rareEgg } = wiki
  return (
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
  )
}

export const CareWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { care } = wiki
  return (
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
  )
}

export const OnlineWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { online } = wiki
  return (
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
  )
}

export const StaminaWikiTab = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  return (
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
  )
}
