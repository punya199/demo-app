// Player-facing patch notes, newest first. Hand-written (CHANGELOG.md is generated from commits and
// reads like a dev log). Add an entry here with every release the players should hear about.

export type PatchNoteKind = 'new' | 'update' | 'fix'

export interface IPatchNote {
  version: string
  // When it shipped, ISO 8601 in UTC (the release commit time); shown in Thai time.
  releasedAt: string
  changes: { kind: PatchNoteKind; text: string }[]
}

export const PATCH_NOTES: IPatchNote[] = [
  {
    version: '1.43.0',
    releasedAt: '2026-11-04T16:09:30Z',
    changes: [
      {
        kind: 'new',
        text: 'บอส บอสโลก และสนามประลองสู้แบบเรียลไทม์แล้ว ใช้สกิลและช่องสกิลได้เต็มเหมือนผจญภัย',
      },
      {
        kind: 'update',
        text: 'บอสโลกมาตามลำดับสัปดาห์ละตัว ไม่สุ่มแล้ว ทั้ง 7 ตัวมีความสามารถต่างกัน และปรับ HP ใหม่',
      },
      {
        kind: 'new',
        text: 'แสดงคูลดาวน์สกิลใต้หลอดเลือดทั้งสองฝั่งระหว่างต่อสู้',
      },
      {
        kind: 'update',
        text: 'ผลจากต้นไม้และอุปกรณ์มีผลในไฟต์เรียลไทม์ครบ (ดาเมจคริ ตีสองครั้ง โล่ สะท้อนดาเมจ ฟื้นเลือด เผาไหม้) และ SPD ที่เพิ่มทำให้โจมตีเร็วขึ้น',
      },
      {
        kind: 'update',
        text: 'ทีมป้องกันและตัวเช่าที่ตั้งไว้ก่อนอัปเดตจะใช้สกิลมาตรฐาน ตั้งใหม่เพื่อใช้สกิลของตัวเอง',
      },
    ],
  },
  {
    version: '1.40.0',
    releasedAt: '2026-11-04T13:53:06Z',
    changes: [
      {
        kind: 'update',
        text: 'ร้านค้าขายหินรีไฟน์ธรรมดาแล้ว (🪙 40) และการสำรวจไม่ให้หินตีบวกอีกต่อไป หินอื่นได้จากแยกชิ้นส่วนหรือบอส',
      },
      {
        kind: 'new',
        text: 'บอสโลกเพิ่มอีก 6 ตัว สุ่มเปลี่ยนทุกสัปดาห์ แต่ละตัวมีธาตุและดรอปชุดเซ็ตของตัวเอง',
      },
      { kind: 'new', text: 'บอสบางตัวมีเกราะหักดาเมจทุกการตี หรือโกรธโจมตีแรงขึ้นเมื่อผ่านบางรอบ' },
      {
        kind: 'update',
        text: 'บอสโลกใช้ตารางธาตุแล้ว เลือกมอนที่ได้เปรียบธาตุบอสจะทำดาเมจได้มากขึ้น',
      },
      { kind: 'update', text: 'ปรับ HP บอสโลกให้ผู้เล่นระดับท็อป 10 คนล้มได้ในราว 3-5 วัน' },
    ],
  },
  {
    version: '1.38.0',
    releasedAt: '2026-11-03T15:49:30Z',
    changes: [{ kind: 'update', text: 'คู่มือแสดงสูตรความเสียหายแบบ DEF เป็นเปอร์เซ็นต์' }],
  },
  {
    version: '1.37.0',
    releasedAt: '2026-11-03T15:35:55Z',
    changes: [{ kind: 'new', text: 'หน้าต่างรีไฟน์ และข้อมูลหินรีไฟน์ในคู่มือ' }],
  },
  {
    version: '1.36.0',
    releasedAt: '2026-11-03T15:33:45Z',
    changes: [{ kind: 'update', text: 'เลือกอุปกรณ์หลายชิ้นในกระเป๋าแล้วแยกชิ้นส่วนพร้อมกันได้' }],
  },
  {
    version: '1.35.0',
    releasedAt: '2026-11-03T14:58:24Z',
    changes: [
      {
        kind: 'update',
        text: 'อุปกรณ์ที่สัตว์เลี้ยงยังเด็กเกินไปจะถูกล็อก และเพิ่มคำอธิบายการสุ่มค่าของชุดเซ็ต',
      },
    ],
  },
]

export const PATCH_KIND_LABEL: Record<PatchNoteKind, string> = {
  new: 'ใหม่',
  update: 'ปรับปรุง',
  fix: 'แก้ไข',
}

// '2026-11-04 20:53 น.' in Thai time, whatever the viewer's own time zone is.
export const formatPatchDate = (releasedAt: string) =>
  `${new Date(releasedAt).toLocaleString('sv-SE', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })} น.`
