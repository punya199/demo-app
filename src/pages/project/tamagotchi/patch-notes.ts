// Player-facing patch notes, newest first. Hand-written (CHANGELOG.md is generated from commits and
// reads like a dev log). Add an entry here with every release the players should hear about.

export type PatchNoteKind = 'new' | 'update' | 'fix'

export interface IPatchNote {
  version: string
  // YYYY-MM-DD
  date: string
  changes: { kind: PatchNoteKind; text: string }[]
}

export const PATCH_NOTES: IPatchNote[] = [
  {
    version: '1.38.0',
    date: '2026-11-03',
    changes: [{ kind: 'update', text: 'คู่มือแสดงสูตรความเสียหายแบบ DEF เป็นเปอร์เซ็นต์' }],
  },
  {
    version: '1.37.0',
    date: '2026-11-03',
    changes: [{ kind: 'new', text: 'หน้าต่างรีไฟน์ และข้อมูลหินรีไฟน์ในคู่มือ' }],
  },
  {
    version: '1.36.0',
    date: '2026-11-03',
    changes: [{ kind: 'update', text: 'เลือกอุปกรณ์หลายชิ้นในกระเป๋าแล้วแยกชิ้นส่วนพร้อมกันได้' }],
  },
  {
    version: '1.35.0',
    date: '2026-11-03',
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
