import { Heading, List, Table } from './WikiParts'
import {
  craftMaterialLabel,
  formatAge,
  formatBonus,
  furnitureLabel,
} from '../core/tamagotchi-helper'
import { IWikiData } from '../core/tamagotchi-interface'

// The guide's farm page. Every number is the server's (wiki.farm).

export const FarmWikiTab = (props: { wiki: IWikiData }) => {
  const { farm } = props.wiki
  const tier2 = farm.craft['2']
  const tier3 = farm.craft['3']
  const essenceName = (element: string) =>
    craftMaterialLabel[`craft_essence_${element}`] ?? `เอสเซนซ์${element}`

  return (
    <>
      <Heading>ฟาร์ม</Heading>
      <List
        items={[
          'ฟาร์มคือห้องของผู้เล่น สัตว์เลี้ยงทุกตัวที่ยังมีชีวิตอยู่ในห้องเดียวกัน หิวก็ไปกินที่โต๊ะ อ่อนแรงก็ไปออกกำลัง ป่วยก็นอนที่เตียง ตัวที่ว่างจะเดินเล่นหรืองีบ ภาพในห้องเป็นแค่การแสดงผล ค่าจริงอยู่ที่เซิร์ฟเวอร์',
          'เฟอร์นิเจอร์มี 4 ชนิด ชนิดละ 1 ชิ้น แต่ละชนิดยืดเวลาของเรื่องที่ต้องดูแลเรื่องเดียว และใช้กับสัตว์ทุกตัวพร้อมกัน ทำงานตลอดแม้ปิดเกมและตอนสัตว์ออกสำรวจ',
          'เฟอร์นิเจอร์ไม่ได้เติมค่าให้เอง ยังต้องกดให้อาหารและเก็บอึเหมือนเดิม และไม่ทำให้เวลาตายยืดออก (ตายเพราะหิวหรือป่วย หรืออายุขัยเท่าเดิมเสมอ)',
          'ความอิ่มและความแข็งแรงที่ลดช้าลงทำให้ค่าสู้จากการดูแลเต็มนานขึ้น สัตว์จึงสู้ได้ดีขึ้นทางอ้อม โบนัสมีเพดานตามตารางด้านล่าง และคูณรวมกับของสวมใส่และต้นไม้ความสามารถ',
        ]}
      />
      <Table
        head={['เฟอร์นิเจอร์', 'ยืดเวลา', 'ระดับ 1', 'ระดับ 2', 'ระดับ 3', 'เอสเซนซ์ที่ใช้']}
        rows={farm.furniture.map((item) => [
          furnitureLabel[item.kind].name,
          furnitureLabel[item.kind].timer,
          formatBonus(item.bonus[1]),
          formatBonus(item.bonus[2]),
          formatBonus(item.bonus[3]),
          essenceName(item.essence),
        ])}
      />
      <Heading>ซื้อและอัปเกรด</Heading>
      <List
        items={[
          `ระดับ 1 ซื้อด้วยเหรียญ 🪙 ${farm.buyCoin}`,
          `ระดับ 2 คราฟต์: 🪙 ${tier2.coin} · รอ ${formatAge(tier2.minutes)} · เอสเซนซ์ของเฟอร์นิเจอร์ ×${tier2.essence} + เศษรูนพิทักษ์ ×${tier2.rune}`,
          `ระดับ 3 คราฟต์: 🪙 ${tier3.coin} · รอ ${formatAge(tier3.minutes)} · เอสเซนซ์ ×${tier3.essence} + เศษรูนพิทักษ์ ×${tier3.rune} + Catalyst ×${tier3.catalyst}`,
          'อัปเกรดสำเร็จแน่นอน ไม่มีสุ่มและไม่มี pity Catalyst ในที่นี้เป็นวัตถุดิบธรรมดา',
          'ใช้คิวคราฟต์เดียวกับอุปกรณ์ (ทีละ 1 งาน) ข้ามเวลาด้วยเหรียญไม่ได้ ระหว่างรอระดับเดิมยังใช้ได้ และระดับใหม่เริ่มทำงานตอนกดรับ',
        ]}
      />
    </>
  )
}
