import { percent, times } from './wiki-helper'
import { Heading, List, Table } from './WikiParts'
import { elementLabel } from '../core/tamagotchi-helper'
import { EnumMonsterLine, IWikiData } from '../core/tamagotchi-interface'

// How a fight really plays: the real-time arena (adventure, Raid, World Boss and PvP). Numbers
// are the arena's own (wiki.arena), not the old turn engine's (wiki.battle).

const damageFormula = (arena: IWikiData['arena']) =>
  `(ATK × พลังท่า × ธาตุ × (1 − min(${Math.round(arena.maxDefenseReduction * 100)}%, DEF/(DEF+${arena.defenseK}))))` +
  ` × สุ่ม ${percent(arena.damageVarianceMin)}–${percent(arena.damageVarianceMax)} × คริติคอล`

export const ArenaBattleSection = (props: { wiki: IWikiData }) => {
  const { wiki } = props
  const { arena, battle } = wiki
  const lines = Object.keys(arena.lineEva) as EnumMonsterLine[]
  return (
    <>
      <Heading>ลำดับการต่อสู้ (เรียลไทม์)</Heading>
      <List
        items={[
          'ผจญภัย Boss Raid บอสโลก และ PvP สู้แบบเรียลไทม์ในสนาม ทั้งสองฝั่งเคลื่อนที่และลงมือพร้อมกัน ไม่ผลัดตา',
          'แต่ละตัวมีตีธรรมดา สกิลประจำร่าง สกิลที่เลือกใส่ได้ 2 ช่อง และสกิลหลบ 1 ช่อง (ตั้งในหน้าสกิล)',
          `จบเมื่อฝั่งใดฝั่งหนึ่งล้มหมด หรือครบเวลา ${arena.timeLimitSec} วินาที ถ้าหมดเวลาฝั่งที่เหลือ HP รวมเป็นสัดส่วนมากกว่าชนะ`,
          'ผลการต่อสู้ตัดสินที่เซิร์ฟเวอร์ หน้าจอแค่เล่นภาพตามผล',
          'หน้าจอวาดมอนเป็นภาพพิกเซลพร้อมท่าเดิน โจมตี ร่ายสกิล โดนตี และล้ม สถานะที่ติดอยู่เห็นได้บนตัวมอน (มึน = ดาวหมุน, รากพัน = รากที่เท้า, ใบ้ = ป้ายห้ามพูด, คำสาป = วงม่วง, ลูกศรสีส้ม/แดง = พลังโจมตีขึ้น/ลง, สีเขียว/เทา = ป้องกันขึ้น/ลง) บอสโลกตัวใหญ่ขึ้นทุกครั้งที่โต และขอบจอกะพริบแดงก่อนบอสโจมตีทั้งสนาม',
          `ไฟต์ PvP ที่บันทึกก่อนย้ายมาสนามเรียลไทม์ยังเล่นซ้ำด้วยกติกาผลัดตาเดิม (ตีรอบละครั้ง ใช้สกิลทุกรอบที่ ${battle.skillEveryRounds} สูงสุด ${battle.maxRounds} รอบ)`,
        ]}
      />
      <Heading>สูตรดาเมจ</Heading>
      <div className="rounded-lg bg-slate-100 p-2 font-mono text-xs dark:bg-slate-800">
        {damageFormula(arena)}
      </div>
      <List
        items={[
          `คริติคอล: โอกาส ${arena.critChance}% (บวกจากศักยภาพ อุปกรณ์ และต้นไม้) ดาเมจ ${times(arena.critMultiplier)}`,
          'โล่ดูดดาเมจก่อนเสีย HP · ดาเมจขั้นต่ำ 1',
        ]}
      />
      <Heading>ธาตุ</Heading>
      <List
        items={[
          `ได้เปรียบ ${times(arena.strongMultiplier)} เสียเปรียบ ${times(arena.weakMultiplier)} (ในสนามเรียลไทม์ ต่างจากกติกาผลัดตาเดิมที่ ${times(battle.strongMultiplier)} / ${times(battle.weakMultiplier)})`,
          'บอสผจญภัยและ Boss Raid ไม่ใช้ตารางธาตุ ทั้งสองทาง',
        ]}
      />
      <Table
        head={['ธาตุ', 'ได้เปรียบ', 'เสียเปรียบ']}
        rows={(Object.keys(battle.beats) as EnumMonsterLine[]).map((element) => {
          const losesTo = (Object.keys(battle.beats) as EnumMonsterLine[]).filter((other) =>
            battle.beats[other].includes(element)
          )
          return [
            elementLabel[element],
            battle.beats[element].map((target) => elementLabel[target]).join(' · '),
            losesTo.length ? losesTo.map((other) => elementLabel[other]).join(' · ') : '–',
          ]
        })}
      />
      <Heading>หลบหลีกและค่าประจำสาย</Heading>
      <List
        items={[
          `โอกาสหลบ = ${arena.dodgeBase} + EVA ของมอน − ACC ของผู้ตี + โอกาสของสกิลหลบ (ไม่เกิน ${arena.dodgeMax}%) SPD ไม่มีผลต่อการหลบ`,
          `สกิลหลบมีคูลดาวน์อย่างน้อย ${arena.dodgeMinCooldown} วินาที (อุปกรณ์บางชิ้นลดให้ได้ แต่ไม่ต่ำกว่านี้)`,
          'EVA = โอกาสหลบ · ACC = ลดโอกาสหลบของเป้าหมายแต้มต่อแต้ม · RES = ลดโอกาสและเวลาของสถานะลบ',
          `RES รวมสูงสุด ${arena.maxResist}% บอสผจญภัยได้ RES เพิ่ม ${arena.bossRes}`,
        ]}
      />
      <Table
        head={['สาย', 'EVA', 'ACC', 'RES']}
        rows={lines.map((line) => [
          elementLabel[line],
          arena.lineEva[line],
          arena.lineAcc[line],
          arena.lineRes[line],
        ])}
      />
    </>
  )
}
