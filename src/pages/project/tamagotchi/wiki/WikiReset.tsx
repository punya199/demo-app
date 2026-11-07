import { formatResetAt, nextResetAt, ResetSchedule } from '../core/tamagotchi-helper'
import { IWikiData } from '../core/tamagotchi-interface'
import { percent } from './wiki-helper'
import { Heading, List, Table } from './WikiParts'

// The guide's reset schedule. The numbers are the server's; the clock rules (Thai midnight, Monday,
// the 1st, windows from midnight) are fixed server behavior, see getQuestResetAt / getWeek.

const scheduleText = (schedule: ResetSchedule) => {
  if (schedule.kind === 'daily') {
    return 'ทุกวัน 00:00 น.'
  }
  if (schedule.kind === 'weekly') {
    return 'ทุกวันจันทร์ 00:00 น.'
  }
  if (schedule.kind === 'monthly') {
    return 'วันที่ 1 ของทุกเดือน 00:00 น.'
  }
  return schedule.hours === 1
    ? 'ทุกชั่วโมงตรง'
    : `ทุก ${schedule.hours} ชม. นับจาก 00:00 น. (เช่น 00:00, ${String(schedule.hours).padStart(2, '0')}:00, …)`
}

export const ResetWikiTab = (props: { wiki: IWikiData; now?: Date }) => {
  const { wiki, now = new Date() } = props
  const { pvp, raid, worldBoss, social } = wiki
  const rows: { event: string; what: string; schedule: ResetSchedule }[] = [
    {
      event: '📋 ภารกิจประจำวัน',
      what: 'ความคืบหน้าภารกิจรายวันเริ่มนับใหม่',
      schedule: { kind: 'daily' },
    },
    {
      event: '📅 ภารกิจประจำสัปดาห์',
      what: 'ความคืบหน้าภารกิจรายสัปดาห์เริ่มนับใหม่',
      schedule: { kind: 'weekly' },
    },
    {
      event: '🏟️ PvP: จำนวนครั้งที่ท้า',
      what: `ท้าได้ ${pvp.dailyAttempts} ครั้ง/วัน และคู่ต่อสู้คนเดิมไม่เกิน ${pvp.maxFightsPerOpponentPerDay} ครั้ง/วัน`,
      schedule: { kind: 'daily' },
    },
    {
      event: '🏆 PvP: ซีซัน',
      what: `ซีซันใหม่เริ่ม เรตติ้งเก็บ ${percent(pvp.seasonResetKeep)} ของส่วนต่างจากเรตเริ่มต้น และรับรางวัลซีซันที่จบแล้วได้`,
      schedule: { kind: 'weekly' },
    },
    {
      event: '👹 Boss Raid',
      what: `ตีได้ ${raid.attempts} ครั้งต่อรอบ`,
      schedule: { kind: 'window', hours: raid.resetHours },
    },
    {
      event: '🌩️ บอสโลก: จำนวนครั้งที่ตี',
      what: `ตีได้ ${worldBoss.hits} ครั้งต่อรอบ`,
      schedule: { kind: 'window', hours: worldBoss.resetHours },
    },
    {
      event: '🌩️ บอสโลก: บอสประจำสัปดาห์',
      what: 'บอสใหม่พร้อมหลอด HP ใหม่ และรับรางวัลของสัปดาห์ที่จบแล้วได้',
      schedule: { kind: 'weekly' },
    },
    {
      event: '🤝 เพื่อน: ของขวัญและทักทาย',
      what: `ส่งของขวัญได้ ${social.giftsPerDay} ชิ้น/วัน ทักทายเพื่อนแต่ละคน ${social.greetsPerDayPerFriend} ครั้ง/วัน`,
      schedule: { kind: 'daily' },
    },
    {
      event: '🤝 เพื่อน: รายได้จากการให้เช่า',
      what: `เจ้าของได้ค่าเช่าสูงสุด ${social.rentalOwnerDailyCap} เหรียญ/วัน`,
      schedule: { kind: 'daily' },
    },
  ]

  return (
    <>
      <Heading>ตารางรีเซ็ต</Heading>
      <List
        items={[
          'ทุกเวลาเป็นเวลาไทย (UTC+7) รอบ "นับจาก 00:00" คือแบ่งวันเป็นช่วงเท่า ๆ กันตั้งแต่เที่ยงคืน ไม่ได้นับจากครั้งที่ใช้ล่าสุด',
          'วันที่และเวลาในคอลัมน์สุดท้ายคือรีเซ็ตครั้งถัดไปนับจากตอนนี้',
        ]}
      />
      <Table
        head={['กิจกรรม', 'อะไรรีเซ็ต', 'รอบ', 'รีเซ็ตครั้งถัดไป']}
        rows={rows.map((row) => [
          row.event,
          row.what,
          scheduleText(row.schedule),
          formatResetAt(nextResetAt(row.schedule, now)),
        ])}
      />
    </>
  )
}
