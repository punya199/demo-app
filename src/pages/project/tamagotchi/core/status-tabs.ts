import { IArenaStats } from './tamagotchi-interface'

export type StatusTabKey = 'offense' | 'defense' | 'other'

export interface IStatusExtraRow {
  label: string
  value: string
  hint?: string
}

const STATUS_LABEL: Record<string, string> = {
  burn: 'เผาไหม้',
  poison: 'พิษ',
  slow: 'ชะลอ',
  stun: 'สตัน',
  defDown: 'ลด DEF',
  curse: 'คำสาป',
  blind: 'บอด',
}

const pct = (value: number) => `${Math.round(value * 10) / 10}%`

// Arena-only numbers sorted into the status tabs. A stat the pet doesn't have is left out, so a
// pet without gear sees a short list instead of a screen of zeros. The seven bar rows
// (HP/ATK/DEF/SPD/crit/crit damage/evasion) are drawn by StatusPanel itself.
export const groupArenaStats = (stats: IArenaStats): Record<StatusTabKey, IStatusExtraRow[]> => {
  const offense: IStatusExtraRow[] = []
  const defense: IStatusExtraRow[] = []
  const other: IStatusExtraRow[] = []
  const add = (
    rows: IStatusExtraRow[],
    isOn: boolean,
    label: string,
    value: string,
    hint?: string
  ) => isOn && rows.push({ label, value, hint })

  add(
    offense,
    stats.acc > 0,
    'ความแม่นยำ (ACC)',
    `${stats.acc}`,
    'หักโอกาสหลบของเป้าหมายแต้มต่อแต้ม'
  )
  add(offense, stats.attackSpeed > 0, 'ความเร็วโจมตี', `+${pct(stats.attackSpeed)}`)
  add(offense, stats.cdCut > 0, 'ลดคูลดาวน์สกิล', `−${pct(stats.cdCut)}`)
  add(
    offense,
    stats.doubleStrike > 0,
    'โจมตีซ้ำ',
    pct(stats.doubleStrike),
    'โอกาสตีธรรมดาซ้ำอีกครั้ง'
  )
  add(offense, stats.firstStrike, 'ลงมือก่อน', 'มี', 'ตีธรรมดาและสกิลพร้อมใช้ตั้งแต่เริ่มสู้')
  add(offense, stats.executeBonus > 0, 'ดาเมจใส่ศัตรูเลือดต่ำ', `+${pct(stats.executeBonus)}`)
  add(offense, stats.burnChance > 0, 'โอกาสเผาเมื่อตีธรรมดา', pct(stats.burnChance))
  add(offense, stats.burnBonus > 0, 'ดาเมจใส่เป้าที่ติดเผา', `+${pct(stats.burnBonus)}`)
  add(offense, stats.poisonBonus > 0, 'ดาเมจใส่เป้าที่ติดพิษ', `+${pct(stats.poisonBonus)}`)
  stats.onBasic.forEach((entry) =>
    add(
      offense,
      entry.chance > 0,
      `ตีธรรมดาติด${STATUS_LABEL[entry.status] ?? entry.status}`,
      pct(entry.chance)
    )
  )
  add(
    offense,
    stats.afterDodgeBonus > 0,
    'ดาเมจหลังหลบสำเร็จ',
    `+${pct(stats.afterDodgeBonus)}`,
    'ตีถัดไปคริติคอลแน่นอน'
  )
  add(offense, stats.noCrit, 'ไม่คริติคอล', 'ใช่', 'ตีไม่ติดคริติคอลเลย (แลกกับโบนัสอื่น)')

  add(defense, stats.eva > 0, 'หลบหลีกในสนาม (EVA)', `${stats.eva}%`, 'รวมค่าธาตุกับอุปกรณ์')
  add(
    defense,
    stats.res > 0,
    'ต้านทาน (RES)',
    `${stats.res}%`,
    'ลดโอกาสและเวลาของสถานะผิดปกติ สูงสุด 70%'
  )
  add(
    defense,
    stats.regenPct > 0,
    'ฟื้น HP ต่อวินาที',
    `${pct(stats.regenPct)} ของ HP สูงสุด (≈ ${stats.regenPerSec}/วิ)`
  )
  add(defense, stats.lifesteal > 0, 'ดูดเลือด', pct(stats.lifesteal), 'จากดาเมจของการตีธรรมดา')
  add(defense, stats.thorns > 0, 'สะท้อนดาเมจ', pct(stats.thorns))
  add(defense, stats.damageCut > 0, 'ลดดาเมจที่โดน', pct(stats.damageCut))
  add(defense, stats.startShield > 0, 'โล่เริ่มต้น', `${pct(stats.startShield)} ของ HP`)
  if (stats.periodicShield) {
    defense.push({
      label: 'โล่ทุกช่วง',
      value: `${pct(stats.periodicShield.pct)} ของ HP ทุก ${stats.periodicShield.sec} วิ`,
    })
  }
  if (stats.lastStand) {
    defense.push({
      label: 'ยืนหยัดครั้งสุดท้าย',
      value: `โล่ ${pct(stats.lastStand.shield)} เมื่อ HP ต่ำกว่า ${stats.lastStand.belowPct}%`,
    })
  }
  add(defense, stats.dodgeCdCut > 0, 'ลดคูลดาวน์สกิลหลบ', `−${stats.dodgeCdCut} วิ`)
  add(defense, stats.retort > 0, 'ตอบโต้ทำให้บอด', pct(stats.retort), 'เมื่อโดนตีระยะประชิด')

  add(
    other,
    stats.fightHp > 0,
    'HP ในสนามต่อสู้',
    `${stats.fightHp}`,
    'HP จริงตอนสู้ในสนาม ต่างจาก HP ในแถบเพราะค่าปรับตามธาตุ'
  )

  return { offense, defense, other }
}
