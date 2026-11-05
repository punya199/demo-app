import { describeCcSteps, splitStatuses, WikiStatusEntry } from './wiki-helper'
import { Heading, List, Table } from './WikiParts'
import { IWikiData } from './tamagotchi-interface'

// Every status the real-time arena can apply, as the server defines them (name, kind, effect).

const statusRows = (entries: WikiStatusEntry[]) =>
  entries.map((entry) => [
    `${entry.icon} ${entry.label}`,
    entry.cc ? 'คุมตัว (CC)' : '-',
    entry.note,
  ])

export const StatusEffectsSection = (props: { arena: IWikiData['arena'] }) => {
  const { arena } = props
  const { debuffs, buffs } = splitStatuses(arena.statuses)
  const head = ['สถานะ', 'ประเภท', 'ผล']
  return (
    <>
      <Heading>สถานะในไฟต์เรียลไทม์</Heading>
      <List
        items={[
          'ผจญภัย Raid บอสโลก และ PvP สู้แบบเรียลไทม์ สกิล ชุดเซ็ต และต้นไม้ผู้ฝึกติดสถานะให้ศัตรู (หรือให้ตัวเอง) ได้ตามตารางนี้',
          `สถานะ "คุมตัว (CC)" ที่ติดซ้ำภายใน ${arena.statusNumbers.ccWindowSec} วินาทีหลังจบครั้งก่อนจะสั้นลง: ${describeCcSteps(arena.statusNumbers.ccSteps)} ของเวลาปกติ จึงสตันต่อเนื่องไม่ได้`,
          `ค่าต้านทาน (RES) ของแต่ละสายลดโอกาสติดสถานะ สูงสุด ${arena.maxResist}%`,
        ]}
      />
      <Heading>สถานะลบ</Heading>
      <Table head={head} rows={statusRows(debuffs)} />
      <Heading>สถานะบวก</Heading>
      <Table head={head} rows={statusRows(buffs)} />
    </>
  )
}
