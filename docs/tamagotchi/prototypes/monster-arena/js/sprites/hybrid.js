'use strict'
// The 13 cross-line fused forms, from hybrid-bitmaps.js. Still drafts: one part ('body') until the owner
// approves the pictures; the planned cuts, walk, attack and skill motion are in
// docs/tamagotchi/fused-hybrid-prompts.md. `els` is the pair of lines; `el` (cards, particles) is the first.
const HYBRIDS = [
  ['hy_steam', 'ยักษ์ไอน้ำ', ['fire', 'water'], 'มังกรซาลาแมนเดอร์ทะเล หลังลาวาเย็นตัว'],
  ['hy_swamp', 'บึงโบราณ', ['leaf', 'water'], 'จระเข้โบราณ หลังเป็นบึง'],
  ['hy_wildfire', 'จ้าวไฟป่า', ['fire', 'leaf'], 'สิงโตแผงคอใบไม้ลุกไฟ เขากิ่งไม้'],
  ['hy_volcano', 'ภูเขาไฟคำราม', ['fire', 'earth'], 'เต่ามังกร ภูเขาไฟบนกระดอง'],
  [
    'hy_firestorm',
    'พายุเพลิงสายฟ้า',
    ['fire', 'bolt'],
    'นกเพลิงปีกสายฟ้า',
    { hover: 8, fly: true },
  ],
  ['hy_mudotter', 'โคลนมหาสมุทร', ['water', 'earth'], 'นากทะเลเกราะหิน กอดหินก้อนใหญ่'],
  [
    'hy_stormray',
    'พายุทะเลหลวง',
    ['water', 'bolt'],
    'กระเบนยักษ์ลอยฟ้า เส้นสายฟ้าบนตัว',
    { hover: 6 },
  ],
  ['hy_stoneforest', 'ป่าหินโบราณ', ['leaf', 'earth'], 'แรดยักษ์ หลังเป็นป่าหิน'],
  ['hy_leafstorm', 'ไพรอสนี', ['leaf', 'bolt'], 'จิ้งจอกหางใบไม้ เถาวัลย์มีไฟฟ้า'],
  ['hy_thunderram', 'ผาฟ้าผ่า', ['earth', 'bolt'], 'แพะภูเขา เขาผลึกล่อฟ้า ขนเป็นแผ่นหิน'],
  ['hy_balance', 'สมดุลแสงมืด', ['holy', 'dark'], 'สิงโตปีกขนนกข้างหนึ่ง ปีกค้างคาวอีกข้าง'],
  [
    'hy_nightowl',
    'ราชาไร้แสง',
    ['dark', 'shadow'],
    'นกฮูกเขา ปีกผ้าคลุมเป็นควัน',
    { hover: 8, fly: true },
  ],
  ['hy_judge', 'ผู้พิพากษาเงียบ', ['holy', 'shadow'], 'กิเลนเกราะดำ ผ้าปิดตา ตราตาชั่ง'],
]
for (const [id, , els, , extra = {}] of HYBRIDS) {
  ADV_EL[id] = els[0]
  const w = ADV_BMP[id].rows[0].length,
    h = ADV_BMP[id].rows.length
  SPRITES[id] = ADV_SPRITE(id, extra.fly ? FLY : QUAD, [['body']], {
    ...extra,
    mouth: [w - 8, Math.round(h * 0.3)],
  })
}
