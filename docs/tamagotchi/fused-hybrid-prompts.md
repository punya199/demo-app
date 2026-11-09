# ร่างผสมข้ามธาตุ 13 ตัว: prompt ภาพ AI และแผนจุดขยับ

ร่างผสมในเกม (`FUSED_FORMS` ใน `demo-app-backend` `species-data.ts`) มี 21 ตัว ร่างผสมธาตุเดียวกัน 8 ตัว
(`ffused`/`wfused`/…/`sfused`) วาดเสร็จแล้วในหน้า prototype ส่วนอีก 13 ตัวที่ผสมข้ามธาตุ ในเกมยังเป็นอีโมจิ
(`sprite: null`) ไฟล์นี้มี prompt ไว้ให้ AI อีกตัววาดภาพนิ่ง และแผนว่าแต่ละตัวจะตัดเป็นชิ้นไหน
แล้วเดินกับโจมตียังไง ส่วนแอนิเมชันเราทำเองด้วย `bmpRig` เหมือนบอสเรดกับศัตรูผจญภัย

กติกาเดิมยังใช้: ทุกตัวเป็นสัตว์ ไม่ใช่สิ่งของหรือคน แต่ละตัวผสมตระกูลสัตว์ของทั้งสองสาย
(เพลิง = กิ้งก่า/มังกร/สิงห์แผงคอ, วารี = วาฬ/ฉลาม/มังกรทะเล, พฤกษ์ = กวาง/หมาป่ามีพืชงอก,
ศิลา = เต่า/แรดเกราะหิน, อสนี = นก/จิ้งจอกพายุ, รัศมี = แกะ/กิเลน/สิงห์มีปีก, รัตติกาล = ค้างคาว/แมงมุม,
เงา = อัศวินเงา/ภูตฮู้ด) ร่างผสมใช้กรอบ 88 พิกเซล ใหญ่และอลังการกว่าร่างสุดท้าย ในเกมมีวงแหวนออร่าสองสี
(สีของทั้งสองธาตุ) หมุนสวนกัน ซึ่งเราวาดด้วยโค้ด ไม่ต้องให้ AI วาด

## ลำดับในตาราง (อ่านซ้ายไปขวา บนลงล่าง)

| ช่อง | ชื่อในเกม | ธาตุ | id ที่เสนอ | สัตว์ | ท่าเคลื่อนที่ |
|---|---|---|---|---|---|
| 1 | ยักษ์ไอน้ำ | เพลิง + วารี | `hy_steam` | มังกรซาลาแมนเดอร์ทะเลตัวหนา หลังเป็นลาวาเย็นตัว มีปล่องไอน้ำ | เดินสี่ขา |
| 2 | บึงโบราณ | พฤกษ์ + วารี | `hy_swamp` | จระเข้โบราณ หลังเป็นบึงมีมอส ใบบัว ต้นกก ต้นไม้เล็ก | เดินสี่ขา ต่ำติดพื้น |
| 3 | จ้าวไฟป่า | เพลิง + พฤกษ์ | `hy_wildfire` | สิงโตแผงคอเป็นใบไม้ร่วงที่กำลังลุกไฟ เขากิ่งไม้ไหม้ | เดินสี่ขา |
| 4 | ภูเขาไฟคำราม | เพลิง + ศิลา | `hy_volcano` | เต่ามังกรเกราะหินบะซอลต์ มีกรวยภูเขาไฟบนหลัง | เดินสี่ขา หนักและช้า |
| 5 | พายุเพลิงสายฟ้า | เพลิง + อสนี | `hy_firestorm` | นกเพลิงปีกมีริ้วสายฟ้า หางยาวเป็นเปลว | บิน (rig `FLY`) |
| 6 | โคลนมหาสมุทร | วารี + ศิลา | `hy_mudotter` | นากทะเลยักษ์ เกราะเป็นหินแม่น้ำและเปลือกหอย ถือหินก้อนใหญ่ | เดินสี่ขา ยืนสองขาตอนตี |
| 7 | พายุทะเลหลวง | วารี + อสนี | `hy_stormray` | ปลากระเบนยักษ์ลอยกลางอากาศ เส้นสายฟ้าเรืองบนตัว มีน้ำวนรอบ | ลอยว่าย |
| 8 | ป่าหินโบราณ | พฤกษ์ + ศิลา | `hy_stoneforest` | แรดยักษ์ หลังเป็นป่าหินกลายเป็นหิน มีกระบองเพชรและมอส | เดินสี่ขา หนัก |
| 9 | ไพรอสนี | พฤกษ์ + อสนี | `hy_leafstorm` | จิ้งจอกสามหาง หางเป็นใบไม้ เถาวัลย์บนตัวมีไฟฟ้าวิ่ง | เดินสี่ขา เร็ว |
| 10 | ผาฟ้าผ่า | ศิลา + อสนี | `hy_thunderram` | แพะภูเขา เขาเป็นผลึกแร่ล่อฟ้า ขนเป็นแผ่นหิน | เดินสี่ขา กระโดด |
| 11 | สมดุลแสงมืด | รัศมี + รัตติกาล | `hy_balance` | สิงโตมีปีก ปีกซ้ายเป็นขนนกขาวทอง ปีกขวาเป็นปีกค้างคาวดำ | เดินสี่ขา ปีกกาง |
| 12 | ราชาไร้แสง | รัตติกาล + เงา | `hy_nightowl` | นกฮูกเขายักษ์ ปีกเหมือนผ้าคลุมขาดเป็นควัน ตาเป็นโคมม่วง | บิน (rig `FLY`) |
| 13 | ผู้พิพากษาเงียบ | รัศมี + เงา | `hy_judge` | กิเลนในชุดเกราะเหล็กดำ ผ้าปิดตาสีขาว ตราตาชั่งทองที่อก | เดินสี่ขา สง่า |

ตัวที่ต้องระวังไม่ให้ซ้ำกับตัวที่มีอยู่แล้ว: จ้าวไฟป่าต้องไม่เหมือนสิงห์สายเพลิงหรือมหาราชสีห์เทวะ
(ต้องมีใบไม้และเขากิ่งไม้ชัด) ผาฟ้าผ่าต้องไม่เหมือนกระทิงพายุคำราม (บอสโลกอสนี) จึงเป็นแพะ
ภูเขาไฟคำรามต้องไม่เหมือนราชันย์ลาวาหรือเต่าภูเขา พายุทะเลหลวงต้องไม่เหมือนอสูรห้วงลึก (ฉลาม)

## Prompt (คัดลอกทั้งก้อนไปให้ AI)

```text
Create ONE pixel-art sprite sheet with 13 original fantasy monsters, arranged in a 4 x 4 grid
(read left to right, top to bottom; cells 14, 15 and 16 stay completely empty).

SHEET LAYOUT (very important)
- Every cell is the same square size. Separate the cells with straight, solid, pure black (#000000)
  grid lines, 4 px thick, including a black border round the whole sheet.
- Inside every cell the background is one flat solid magenta (#FF00FF). No checkerboard, no gradient,
  no shadow on the background, no floor, no scenery.
- Exactly one monster per cell, centred, with clear empty space round it. Nothing may touch or cross
  a grid line.
- No text, letters, numbers, labels or watermarks anywhere.

STYLE (same for all 13)
- True pixel art on an exact pixel grid, no anti-aliasing, no blur, no soft gradients.
- Each monster drawn at about 88 x 88 pixels of real pixel resolution, then the whole sheet upscaled
  with nearest-neighbour so every pixel is a crisp square block.
- Strict side view, facing RIGHT. 1 px dark outline. Light from the top-left. At most 16 colours per
  monster, saturated and readable.
- They are animals and beasts, never people, robots or objects. Big, grand, final-form monsters with
  a strong, chunky, readable silhouette (no tiny thin details that vanish when small).
- Pose for animation: standing neutral pose, legs clearly apart from each other and from the belly,
  tail held away from the body, wings spread away from the body, jaw closed, head clearly separate
  from the neck line. Flyers are shown in the air with wings half raised.

THE 13 MONSTERS
1. Steam Giant (fire + water): a thick-bodied sea salamander dragon, four sturdy legs, finned tail.
   Its back is cooled black lava with glowing orange cracks; two vent holes on the shoulders puff
   white steam; teal sea-water skin on belly and legs; small fin crest.
2. Ancient Swamp (leaf + water): a huge ancient crocodile, low to the ground, four short legs, long
   tail. Its back is a little swamp: moss, lily pads with a pink flower, reeds and one small tree.
   Dark green and murky teal, yellow eyes.
3. Wildfire Lord (fire + leaf): a lion whose big mane is made of autumn leaves that are burning at
   the tips, two antlers like charred branches with small flames at the ends, bark-plated shoulders,
   tail tuft of embers. Orange, red, deep green and dark brown.
4. Roaring Volcano (fire + earth): a heavy dragon tortoise with a shell of black basalt plates and a
   small erupting volcano cone in the middle of the shell (lava trickling down), thick elephant-like
   legs, lava glowing between plates, short horned head.
5. Firestorm (fire + lightning): a phoenix-like thunderbird in flight, wings of flame with bright
   yellow lightning streaks along the feathers, long flowing fire tail, sharp crest, glowing eye.
6. Ocean Mud (water + earth): a giant sea otter armoured with smooth river stones and shell plates
   on its back and head, wet mud dripping, holding a big round stone against its chest with its front
   paws, four legs, thick flat tail. Brown, slate grey and sea blue.
7. Great Sea Storm (water + lightning): a giant manta ray floating in the air, wide wing fins, long
   whip tail, glowing electric-yellow veins on a deep navy body, a ring of swirling water spray
   under it.
8. Ancient Stone Forest (leaf + earth): a giant rhino whose back is a petrified forest: stone tree
   stumps, cacti and moss growing from rock plates, one big stone horn, thick legs. Grey stone,
   sage green and sandy ochre.
9. Leaf Thunder (leaf + lightning): a slim fox with three big tails made of layered leaves, vines
   wrapped round its legs with electric sparks running along them, leaf-shaped ears, glowing yellow
   eyes. Fresh green with electric yellow and navy.
10. Thunder Cliff (earth + lightning): a mountain goat with huge curled horns made of yellow ore
   crystal that crackle with lightning, a coat of layered rock plates, sturdy legs on small hooves,
   stormy navy and stone grey.
11. Balance of Light and Dark (holy + dark): a proud winged lion; the near wing is white and gold
   feathers, the far wing is a black-and-purple bat wing; mane half golden, half dark violet; a small
   glowing yin-yang orb on the chest.
12. Lightless King (dark + shadow): a giant horned owl in flight, wings like a torn dark cloak whose
   edges fade into purple smoke, two violet lantern-like glowing eyes, a dark iron crown between the
   ear tufts, sharp talons.
13. Silent Judge (holy + shadow): a qilin (a horned, scaled, horse-like holy beast) wearing black iron
   knight armour plates, a white cloth blindfold over the eyes, a single pale glowing horn, a mane of
   pale smoke, a small golden scales emblem on the chest plate.

Make all 13 clearly different from each other in silhouette and colour, in one consistent style.
```

ถ้า AI ทำ 13 ตัวในภาพเดียวไม่ไหว (ตัวเล็กเกินหรือนับช่องผิด) ให้แบ่งเป็นสองภาพ ใช้ prompt เดิม
เปลี่ยนแค่บรรทัดแรกและรายชื่อ:

- ภาพที่ 1 สายกายภาพ 10 ตัว (ช่อง 1–10): `arranged in a 5 x 2 grid (read left to right, top to bottom)`
- ภาพที่ 2 สายจิตวิญญาณ 3 ตัว (ช่อง 11–13): `arranged in a 3 x 1 grid`

## แผนจุดขยับ (เราทำแอนิเมชันเอง)

แต่ละตัวตัดเป็นชิ้นด้วย `part(x, y)` แบบบอสเรด (ชิ้นที่ขยับต้องมีสีพื้นทาไว้ข้างใต้ เวลาขยับจะได้ไม่เห็นรู)
ท่ามาตรฐานของเกม: ยืน (หายใจ) เดิน โจมตี (ง้าง พุ่ง ค้างตอนโดน ถอยกลับ) ใช้สกิล (ชาร์จแล้วปล่อย) โดนตี

| ตัว | ชิ้นที่ตัด | เดิน / ลอย | โจมตี (ตีธรรมดา) | ใช้สกิล |
|---|---|---|---|---|
| ยักษ์ไอน้ำ | หัว, ขากรรไกรล่าง, ขาหน้า 2, ขาหลัง 2, หาง, ปล่องไอน้ำ 2 (จุดปล่อยอนุภาค) | ก้าวขาทแยงสลับ ตัวโยกขึ้นลงหนัก หางแกว่ง ไอน้ำพ่นเป็นจังหวะตามก้าว | ย่อตัว หัวพุ่งไปข้างหน้า อ้าปากงับ ไอน้ำพ่นแรงตอนโดน | ปล่องทั้งสองพ่นไอขึ้นสูง ปากอ้าพ่นลำไอร้อน |
| บึงโบราณ | หัว, ขากรรไกรบน+ล่าง, ขา 4, หาง (ตัด 3 ท่อนให้โค้งเป็นคลื่น) ต้นไม้และกกบนหลังไม่ขยับแยก | ขาสั้นก้าวสลับ ลำตัวส่ายซ้ายขวา หางโค้งเป็นคลื่นจากโคนไปปลาย | ยืดคอไปข้างหน้า ขากรรไกรอ้ากว้างแล้วงับดัง หางสะบัด | หางฟาดพื้นเป็นคลื่นโคลน ใบบัวบนหลังกระเพื่อม |
| จ้าวไฟป่า | หัว, ขากรรไกรล่าง, แผงคอ (3 ชั้น โยกไม่พร้อมกัน), ขา 4, หาง, เขากิ่งไม้ 2 | เดินแบบแมวใหญ่ ไหล่ขึ้นลง แผงคอพลิ้วตามก้าว ใบไม้ไฟร่วงจากแผงคอ | ยกขาหน้าตะปบ เขาก้มชน ไฟที่ปลายแผงคอวูบ | แผงคอลุกโชน คำรามอ้าปาก ใบไม้ไฟพุ่งออกเป็นวง |
| ภูเขาไฟคำราม | หัว, ขา 4, หาง, กรวยภูเขาไฟ (ไม่ขยับ แต่เป็นจุดปล่อยลาวา) | ก้าวช้ามาก ทีละขา จอสั่นเบา ๆ ทุกก้าว ฝุ่นที่เท้า | ยกขาหน้าทั้งสองแล้วกระทืบ (ใช้น้ำหนักทั้งตัว) | ยอดภูเขาไฟระเบิด ก้อนลาวาพุ่งขึ้นแล้วตกใส่ศัตรู |
| พายุเพลิงสายฟ้า | หัว, ปีกหน้า, ปีกหลัง, หางเปลว (2 ท่อน), กรงเล็บ | กระพือปีก ตัวลอยขึ้นลงตามจังหวะปีก หางเปลวพลิ้วตามหลัง | หุบปีก พุ่งเฉียงลงจิกด้วยกรงเล็บ แล้วกางปีกบินกลับ | กางปีกสุด สายฟ้าวิ่งตามขนปีก ยิงลูกไฟสายฟ้า |
| โคลนมหาสมุทร | หัว, แขนหน้า 2 (พร้อมหิน), ขาหลัง 2, หาง | เดินสี่ขาเตี้ย ๆ หินหนีบไว้กับอก หางแบนตบพื้น | ลุกยืนสองขา ยกหินเหนือหัว ทุบลง โคลนกระเด็น | กอดหินหมุนตัว แล้วโยนหินใส่ศัตรู |
| พายุทะเลหลวง | ครีบปีกซ้าย, ครีบปีกขวา (ตัดเป็นแถบให้โค้งเป็นคลื่น), หาง | ลอยเหนือพื้น ครีบโบกเป็นคลื่นจากโคนไปปลาย หางแส้แกว่ง วงน้ำหมุนใต้ตัว | พุ่งตรงไปข้างหน้า สะบัดหางแส้ใส่ ประกายไฟฟ้าตอนโดน | เส้นสายฟ้าบนตัวเรืองจ้า น้ำวนใต้ตัวขยายเป็นพายุ |
| ป่าหินโบราณ | หัว+นอ, ขา 4, หาง ป่าหินบนหลังไม่ขยับแยก (โยกตามตัว) | ก้าวหนักช้า ตัวโยกหน้าหลัง กรวดร่วงจากหลัง | ก้มหัว วิ่งพุ่งชนด้วยนอ (พุ่งไกลกว่าตัวอื่น) | กระทืบพื้น เสาหินและกระบองเพชรงอกขึ้นใต้ศัตรู |
| ไพรอสนี | หัว, หู 2, ขา 4, หาง 3 เส้น (แต่ละเส้นแกว่งไม่พร้อมกัน) | วิ่งเหยาะเร็ว หางทั้งสามพลิ้วเหลื่อมจังหวะ ประกายไฟฟ้าวิ่งตามเถาวัลย์ | กระโดดพุ่งไปกัด แล้วกระโดดถอยกลับ | หางทั้งสามกางออกเป็นพัด ยิงใบไม้สายฟ้าเป็นสาย |
| ผาฟ้าผ่า | หัว+เขา, ขา 4, หางสั้น | เดินเป็นจังหวะกีบ หัวผงกตามก้าว | ถอยครึ่งก้าว แล้วพุ่งชนด้วยเขา (โขกหัว) | ยกหัว เขาผลึกเรืองแล้วฟ้าผ่าลงที่ศัตรู |
| สมดุลแสงมืด | หัว, ขากรรไกรล่าง, ปีกขาว, ปีกค้างคาว, ขา 4, หาง | เดินแบบสิงห์ ปีกทั้งสองกระพือเบา ๆ คนละจังหวะ | ตะปบด้วยขาหน้า ปีกกางออกตอนโดน | ปีกขาวกับปีกดำกางเต็ม ลูกแก้วหยินหยางที่อกหมุนแล้วยิงลำแสงสองสี |
| ราชาไร้แสง | หัว (หันได้), ปีกหน้า, ปีกหลัง (ขอบปีกเป็นควัน), กรงเล็บ | บินกระพือช้า ๆ ลอยนิ่ง ควันลากจากขอบปีก | โฉบลงตะครุบด้วยกรงเล็บ แล้วบินกลับขึ้น | หัวหมุนจ้อง ตาโคมม่วงสว่าง ปีกกางคลุม ควันเงาแผ่ออก |
| ผู้พิพากษาเงียบ | หัว+เขา, ขา 4, หาง, แผงคอควัน | เดินช้าสง่า ยกกีบสูง แผงคอควันลอยตามหลัง | ก้มหัวแทงด้วยเขาเดียว | ยืนสองขาหลัง เขาเรืองแสง แสงตาชั่งที่อกส่องลงเป็นเสาแสง |

หลังได้ภาพ: ตัดทีละช่องตามเส้นดำ ลบพื้นชมพู ย่อเป็นกรอบ 88 พิกเซล (ตัวบินกับกระเบนอาจกว้างกว่านั้นได้)
ลดสีเหลือไม่เกิน 16 สี ใส่ภาพนิ่งในหน้า prototype ให้เจ้าของเกมดูก่อน ได้รับอนุมัติแล้วค่อยตัดชิ้นตามตารางด้านบน
และทำแอนิเมชัน แล้วใส่ id ลง `species-data.ts` (ตอนนี้ร่างผสมข้ามธาตุส่ง `sprite: null`)
