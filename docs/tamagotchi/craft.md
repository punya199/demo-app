# คราฟต์อุปกรณ์ (Craft) + เกรด Mythic + 12 เซ็ตใหม่

ต่อยอดจาก [item-rank.md](./item-rank.md) (เกรด/ค่ารอง/Special) · [refine-stone.md](./refine-stone.md) (รีไฟน์) · [phase-5.md](./phase-5.md) (เซ็ตบอส, World Boss, Raid)

> **สถานะ: 🚧 กำลังทำ** · ตัวเลขทุกตัวในเอกสารนี้เป็น **ค่าเริ่มต้นที่เสนอ** (provisional) ค่าต่อสู้ของ 4 ชิ้นจะถูกจูนด้วย balance gate (หัวข้อ 9) ส่วนราคา/เวลาต้องตรวจกับรายได้ Coin จริงของ Adventure/Expedition ก่อนล็อก

## เป้าหมาย

1. ให้ผู้เล่นมี **ทางสร้างอุปกรณ์เอง** จากของดรอป ไม่ต้องรอดวงอย่างเดียว
2. เพิ่ม **12 เซ็ตที่คราฟต์ได้อย่างเดียว** (48 ชิ้น) ครอบคลุมทุกสไตล์การเล่น ไม่ใช่เซ็ตแรงขึ้น แต่เป็นเซ็ตทางเลือก (sidegrade)
3. เพิ่มเกรด **Mythic** เป็นเกรดสูงสุด เป็นเป้าหมายระยะยาวของ World Boss โดยไม่ยกเพดานพลังหลัก (main stat ยัง ×3)

ไม่แตะ: กติกาตีบวก/รีไฟน์ (ใช้ร่วมกันทุกกลไก), อัตราดรอปกล่องสุ่ม, เซ็ตบอสเดิม 7 เซ็ต, turn engine เดิม (`battle-engine.ts`)

## ข้อตัดสินใจที่ตกลงแล้ว

| เรื่อง | ข้อสรุป |
|---|---|
| ขอบเขต | อุปกรณ์เท่านั้น (4 ช่องเดิม) · ไม่ทำของกิน/ของใช้ |
| เซ็ต | 12 เซ็ต · 48 ชิ้น · โบนัส 2/4 ชิ้น · ผสมกับเซ็ตบอสได้ (2+2) · ธีมตามสไตล์การเล่น · 2 เซ็ตเป็นสายดูแล |
| วัตถุดิบ | ได้จากการดรอปเท่านั้น (ไม่ได้คืนจากการแยกชิ้น) · บางตัวมาจากบอส/World Boss เท่านั้น |
| สุ่ม | สูตรตายตัว ผลลัพธ์ตายตัว (ชิ้นไหน เกรดไหน) · **ค่ารองยังสุ่ม** เหมือนของดรอป · Catalyst สุ่มอัปเกรดเกรด มี pity |
| เพดาน | Mythic ใช้ main stat ×3 เท่าเดิม · พลังที่เพิ่มมาจากค่ารอง/Special |
| เวลา | คิวเดียว (1 ช่อง) · มี timer · จ่าย Coin เพื่อข้าม |
| ตีบวก/รีไฟน์ | ใช้ของเดิมทั้งหมด ไม่มีกติกาใหม่ |
| UI | เมนู "คราฟต์" ใหม่ · เห็นทุกสูตรตั้งแต่แรก · กระเป๋า 200 ช่อง + ตัวกรองตามชื่อเซ็ต |
| ปล่อย | PvE และ PvP พร้อมกัน ผ่าน balance gate |

### จุดที่ลงมือแล้วต่างจากที่คุยกันไว้ (ตามโค้ดจริง)

- **เอฟเฟกต์ใหม่ทำที่ arena engine ไม่ใช่ turn engine.** ตามโค้ด การผจญภัย/Raid/PvP/World Boss ทั้งหมดรันบน `arena/arena-engine.ts` ส่วน `battle-engine.ts` เก็บไว้เล่นซ้ำ PvP เก่าเท่านั้น และ `battle-engine.golden.spec.ts` ล็อกผลไว้ จึง **ห้ามแก้ turn engine** (golden ต้องผ่านโดยไม่ regenerate) arena มีสถานะครบแล้ว (poison, slow, stun, curse, defDown ฯลฯ) จึงไม่ต้อง "port" อะไร
- **ไม่มีเงื่อนไข unlock สูตรแยก.** ตอนคุยกันไว้ว่า "kill World Boss ครั้งแรก = ประตูเดียว" แต่ World Boss ไม่มีสถานะ "ผู้เล่นฆ่า" ที่ใช้ได้จริง (มีแค่ killing blow คนเดียวต่อสัปดาห์) จึงใช้ **วัตถุดิบ unique** ที่ดรอปเฉพาะ World Boss เป็นประตูโดยธรรมชาติ ทุกสูตรเห็นได้ตั้งแต่แรก เซ็ต flagship คราฟต์ไม่ได้จนกว่าจะมีวัตถุดิบ
- **ตัวเลข 2 ชิ้น/4 ชิ้นใช้สเกลของโค้ดจริง** (2 ชิ้น +6–10%, 4 ชิ้นจูนให้ชนะกันเอง 45–55%) ไม่ใช่ตัวเลขในหน้า `pet-balance.html` ที่เก่ากว่า

## เกรด Mythic

เพิ่ม `EnumEquipmentGrade.MYTHIC = 'mythic'` (คอลัมน์ `grade` เป็น varchar อยู่แล้ว ไม่ต้อง migration)

| | ตำนาน (เดิม) | Mythic (ใหม่) |
|---|---|---|
| ตัวคูณค่าหลัก | ×3 | ×3 (เท่าเดิม) |
| ค่ารอง | 3–4 | **4–5** |
| โอกาสมี Special | 100% (+25% ตัวที่ 2) | 100% · **2 ตัวแน่นอน** + 25% ตัวที่ 3 |
| ช่วงค่า Special | 90–100% | **95–100%** |
| ใส่ได้เมื่อ | Perfect ขึ้นไป | Perfect ขึ้นไป |
| ได้จาก | ดรอป/คราฟต์ | **คราฟต์เท่านั้น** (อัปเกรดจาก Legendary ด้วย Catalyst) เฉพาะเซ็ต flagship |

- เพดานรวม Special ข้ามชิ้น (`SPECIAL_TOTAL_CAP_MULTIPLIER = 2`) คงเดิม
- ตีบวก/รีไฟน์ใช้ระดับหิน **ตำนาน** (สูงสุด +15) ไม่มีหินใหม่
- ไม่อยู่ใน `BOX_GRADE_RATES` / `DROP_GRADE_RATES_BY_AREA` / `RAID_*` จึงไม่ดรอปและแลกไม่ได้ · World Boss exchange ปฏิเสธชิ้น Mythic (และชิ้นเซ็ต flagship)
- ตารางที่เป็น `Record<EnumEquipmentGrade, …>` ต้องเติม (TypeScript จะบังคับ) และ enum ของ `costume-data.ts` ที่ใช้ร่วมกันต้องไม่พัง

## 12 เซ็ตใหม่

**Standard** = คราฟต์ที่เกรด Epic (Catalyst อัปได้ถึง Legendary) · **Flagship** = คราฟต์ที่เกรด Legendary (Catalyst อัปได้ถึง Mythic) ต้องใช้วัตถุดิบ unique

2 ชิ้น = โบนัส % ของสถานะ (เล็ก) · 4 ชิ้น = เอฟเฟกต์ (ตัวเลขด้านล่างเป็นค่าตั้งต้น จูนด้วย balance gate) · ชิ้นต่อเซ็ต = อาวุธ/เกราะ/หมวก/เครื่องประดับ

| # | `setId` | ชื่อ | สไตล์ | ระดับ | 2 ชิ้น | 4 ชิ้น (effects) |
|---|---|---|---|---|---|---|
| 1 | `bulwark` | ชุดปราการศิลา | แทงก์ | Standard | def +10% | `damageCut` 0.12, `shieldPct` 0.03 |
| 2 | `evergreen` | ชุดพนาอมตะ | ฟื้นฟู | **Flagship** | hp +10% | `lifesteal` 0.10, `regenPct` 0.03 |
| 3 | `executioner` | ชุดเพชฌฆาต | เบิร์สต์ | **Flagship** | atk +8% | `executeBonus` 0.35, `critDamage` 0.10 |
| 4 | `marksman` | ชุดพลแม่นปืน | คริ | Standard | atk +6% | `critChance` 0.08, `defDownOnBasic` 30 |
| 5 | `tempo` | ชุดจังหวะลม | ความเร็ว | Standard | spd +8% | `firstStrike` 1, `slowOnBasic` 25 |
| 6 | `mirage` | ชุดมายาภาพ | หลบ | Standard | spd +6% | `evasion` 0.10, `retort` 0.6 (ทำให้ผู้ตีบอด) |
| 7 | `venomancer` | ชุดพิษพรายน้ำ | Damage over time | Standard | atk +6% | `poisonOnBasic` 35, `poisonBonus` 0.12 |
| 8 | `tempest_binder` | ชุดพันธนาการพายุ | คุมเกม | **Flagship** | spd +8% | `slowOnBasic` 30, `stunOnBasic` 8, `cooldownCut` 0.12 |
| 9 | `thornmail` | ชุดเกราะหนาม | สะท้อน | Standard | def +8% | `thorns` 0.25, `shieldPct` 0.04 |
| 10 | `aegis_oracle` | ชุดโหราผู้พิทักษ์ | ซัพพอร์ต | Standard | hp +8% | `shieldRefresh` 0.05, `curseOnBasic` 25 |
| 11 | `caretaker` | ชุดผู้ดูแล | ดูแลสัตว์เลี้ยง | Standard | hp +5% · care: `slowHunger` 10, `tidyPet` 15 | `regenPct` 0.01 |
| 12 | `wayfarer` | ชุดนักเดินทาง | ดูแล/สำรวจ | Standard | hp +5% · care: `staminaSaver` 10, `treasureNose` 10 | `shieldPct` 0.02 |

- โบนัส care ของ 2 ชิ้นไปบวกเข้า `calcSpecialBonuses` (ฟิลด์ใหม่ `care` ใน `ISetBonus`) ทำงานภายใต้เพดาน 2× เดิม
- ชื่อไทยเป็นชื่อชั่วคราว เปลี่ยนได้ใน `SET_DEFINITIONS` ที่เดียว
- เซ็ตเดิม 7 เซ็ต (`blazing`, `tidal_guard`, `deep_root`, `swift_thunder`, `radiant`, `nightfall`, `shadow_veil`) ไม่เปลี่ยน

## เอฟเฟกต์ใหม่ (arena เท่านั้น)

เพิ่มคีย์ใน `IFighterEffects` (`battle-stats.ts`) → map เป็น `IArenaPassive` ใน `effectsToPassive` (`arena/arena-fighter.ts`) · turn engine ไม่อ่านคีย์เหล่านี้

| คีย์ใหม่ | ความหมาย | ทำที่ไหน | เพดาน (`capEffects`) |
|---|---|---|---|
| `damageCut` | ลดดาเมจที่ได้รับ | map ไป `passive.damageCut` (มีอยู่แล้ว) | 0.25 |
| `executeBonus` | โจมตีเป้าที่ HP < 30% แรงขึ้น | passive ใหม่ `executeVs {belowPct, pct}` ที่ `arena-engine.ts` ตอนคิดดาเมจ (ใกล้ `bonusVsStatus`) | 0.5 |
| `slowOnBasic` / `defDownOnBasic` / `poisonOnBasic` / `curseOnBasic` | โอกาส % ที่ตีปกติแล้วติดสถานะ (slow/defDown/poison/curse) | passive ใหม่ `onBasicExtra[]` ประมวลผลที่เดียวกับ `onBasic` | 50 |
| `stunOnBasic` | โอกาส % ติด stun จากตีปกติ | `onBasicExtra` + DR ของ CC ที่ arena มีอยู่แล้วกันสตันต่อเนื่อง | **15** |
| `poisonBonus` | ตีเป้าที่ติด poison แรงขึ้น | map ไป `bonusVsStatus` (st: `poison`) | 0.3 |
| `retort` | โดนตีระยะประชิดแล้วสวนกลับ + ทำให้ผู้ตีบอด | map ไป `meleeRetort` (st: `blind`) | 1.0 |

- คีย์เดิมที่เซ็ตใหม่ใช้ซ้ำ: `shieldPct`, `lifesteal`, `regenPct`, `critChance`, `critDamage`, `firstStrike`, `evasion`, `cooldownCut`, `thorns`, `shieldRefresh`
- ต้องเติมคีย์ใหม่ทุกตัวใน `mergeEffects` (รายการคีย์ที่บวกกัน) ไม่งั้นถูกทิ้งเงียบ ๆ
- มีเซ็ต 4 ชิ้นได้แค่ชุดเดียวต่อมอน จึงไม่ชนกับ `onBasic`/`bonusVsStatus` ช่องเดียวของเซ็ตบอส; ถ้า passive tree ให้ `burnTurns` มาด้วย ให้ `onBasicExtra` ต่อท้าย ไม่ทับ `onBasic`
- สถานะ/passive ที่ไม่มีเอฟเฟกต์นี้ ต้อง **ไม่เปลี่ยนผลต่อสู้เดิม** (arena spec + golden ผ่านโดยไม่ regenerate)

## วัตถุดิบ (12 ตัวใหม่ ใน `EnumMaterialId` + `MATERIALS`)

ไม่ขาย ไม่มีราคา เก็บใน `inventory` เดิม (ไม่มีเพดานจำนวน)

| ระดับ | itemId | ได้จาก (ค่าเริ่มต้น) |
|---|---|---|
| Common ×6 | `craft_essence_flame` / `_tide` / `_leaf` / `_earth` / `_lightning` / `_holy` | ชนะ Adventure: โอกาส 6% ได้ 1–2 ชิ้น ของธาตุที่ตรงกับพื้นที่ (พื้นที่ไม่มีธาตุ = สุ่ม 1 ใน 6) · Expedition: เพิ่มเข้า `EXPEDITION_DROP_ITEMS` (สุ่ม 1 ชิ้นทุก 4 ชม. เหมือนของเดิม) |
| Rare ×2 | `craft_forge_core` (สายบุก) · `craft_rune_shard` (สายรับ/ดูแล) | Raid ชนะ: Normal 1 ก้อน · Hard 2 · Nightmare 3 (ก้อนแรกเป็น forge_core ก้อนที่เหลือสลับ rune_shard) |
| Unique ×3 | `craft_unique_verdant_heart` (Evergreen) · `craft_unique_reaper_edge` (Executioner) · `craft_unique_storm_sigil` (Tempest Binder) | World Boss รับรางวัลรายสัปดาห์: ผู้รับทุกคน 1 ชิ้น (ชนิดสุ่มด้วย `claimRolls` เหมือนการสุ่มชิ้นเซ็ต retry แล้วไม่เปลี่ยน) · อันดับ 1–3 ได้เพิ่มอีก 1 |
| Catalyst ×1 | `craft_catalyst` | World Boss รับรางวัลรายสัปดาห์: ผู้รับทุกคน 1 · อันดับ 1–3 เพิ่มอีก 1 |

ธาตุของเอสเซนซ์ต่อเซ็ต: flame = executioner, thornmail · tide = tempest_binder, mirage · leaf = evergreen, venomancer · earth = bulwark, wayfarer · lightning = tempo, marksman · holy = aegis_oracle, caretaker

## สูตร ราคา เวลา

สูตรต่อชิ้น (48 สูตร) id = `{setId}:{slot}` · **Standard**: essence ของเซ็ต ×3 + rare ×1 (บุก = forge_core, รับ/ดูแล = rune_shard) · **Flagship**: essence ×4 + rare ×2 + unique ของเซ็ต ×1

| | Coin | เวลา | เกรดตั้งต้น | เกรดสูงสุด (Catalyst) |
|---|---|---|---|---|
| Standard | 300 | 30 นาที | Epic | Legendary |
| Flagship | 800 | 4 ชั่วโมง | Legendary | Mythic |

- ข้ามเวลา: จ่าย Coin = `ceil(2 × coin × เวลาที่เหลือ / เวลาทั้งหมด)` (เวลาที่เหลือ 0 = ฟรี)
- ค่าคงที่ทั้งหมดอยู่ที่ `craft-data.ts` และเผยแพร่ผ่าน `GET /monster/wiki`

## Catalyst และ pity

- ใช้ตอนเริ่มคราฟต์ (เลือกได้ ใช้ 1 ก้อน/ชิ้น) · หมดไปไม่ว่าสำเร็จหรือไม่
- โอกาสอัปเกรดเกรด +1 ขั้น = **15%** (ไม่เกินเกรดสูงสุดของสูตร)
- **Pity:** ล้มเหลวติดกัน 8 ครั้ง ครั้งที่ 9 สำเร็จแน่นอน · นับแยกต่อผู้เล่นและต่อขั้น (`epic_legendary`, `legendary_mythic`) · สำเร็จแล้วรีเซ็ตขั้นนั้น
- สุ่มบนเซิร์ฟเวอร์ตอนรับ (claim) เท่านั้น

## คิวคราฟต์ (backend)

ตารางใหม่ (migration ใหม่ ต่อจาก `1793845949518`):

- `craft_jobs`: `id`, `user_id`, `recipe_id`, `use_catalyst`, `started_at`, `finish_at`, `claimed_at NULL`, + audit ตาม `BaseModelEntity` · unique partial index `(user_id) WHERE claimed_at IS NULL AND deleted_at IS NULL` = คิวเดียวต่อผู้เล่น
- `craft_pity`: `user_id`, `step`, `fails` · unique `(user_id, step)`
- เหตุผล wallet ใหม่: `CRAFT`, `CRAFT_SKIP` (ตรวจว่าคอลัมน์ `reason` เป็น enum ใน DB หรือ varchar แล้วทำ migration ให้ตรง)

กติกา (ตามแบบ World Boss `claim`: transaction + conditional UPDATE + เวลาจาก `new Date()` ฝั่งเซิร์ฟเวอร์ ไม่เชื่อ client):

- **start:** ตรวจกฎก่อน (สูตรมีจริง, ไม่มีงานค้าง, วัตถุดิบ/Catalyst/Coin พอ) แล้วค่อยตัด: `WalletService.change` (Coin) → `inventoryService.spend` (ทุกวัตถุดิบ) · ไม่พอ = ไม่ตัดอะไรเลย · ตัดก่อนสร้างงานเสมอ
- **skip:** คำนวณราคาจากเวลาที่เหลือ → ตัด Coin → ตั้ง `finish_at = now`
- **claim:** ต้อง `finish_at <= now`, `claimed_at IS NULL` (conditional UPDATE กันกดซ้ำ), **กระเป๋าไม่เต็ม** (เต็ม = 409 ข้อความชัดเจน งานยังอยู่ในคิว ไม่หาย) · สุ่มเกรด (Catalyst/pity) + ค่ารอง + Special ด้วยฟังก์ชันเดิม (`rollRandomStats`, `rollSpecialOptions`) · สร้างชิ้นผ่าน `grantItem` · บันทึก `equipment_logs` ประเภท `craft`
- ห้ามคืนวัตถุดิบ/Coin ถ้าผู้เล่นทิ้งงาน (ไม่มี cancel ใน v1)
- ไม่มี cron: ทุกอย่าง lazy ตอนอ่าน/กด

### API (ภายใต้ `/monster`, ต้องล็อกอิน ผู้เล่นเห็นเฉพาะของตัวเอง ไม่ส่ง `user_id` ใคร)

| Method | Path | Body | ผลลัพธ์ |
|---|---|---|---|
| GET | `/monster/craft` | – | `ICraftOverview` |
| POST | `/monster/craft/start` | `{ recipeId: string, useCatalyst: boolean }` | `ICraftOverview` |
| POST | `/monster/craft/skip` | – | `ICraftOverview` |
| POST | `/monster/craft/claim` | – | `{ item: <รูปแบบ item เดียวกับ GET /monster/equipment>, upgraded: boolean, overview: ICraftOverview }` |

```ts
interface ICraftRecipeView {
  id: string            // `${setId}:${slot}`
  setId: string
  slot: 'weapon' | 'armor' | 'helmet' | 'accessory'
  name: string          // ชื่อชิ้น
  flagship: boolean
  baseGrade: 'epic' | 'legendary'
  maxGrade: 'legendary' | 'mythic'
  coin: number
  minutes: number
  materials: { itemId: string; qty: number; owned: number }[]
  canStart: boolean     // วัตถุดิบ + Coin พอ และไม่มีงานค้าง
}
interface ICraftOverview {
  recipes: ICraftRecipeView[]
  queue: null | {
    recipeId: string
    useCatalyst: boolean
    startedAt: string   // ISO
    finishAt: string    // ISO
    status: 'running' | 'ready'
    skipCoin: number    // 0 เมื่อ ready
  }
  catalyst: {
    owned: number
    chance: number                       // 0.15
    pity: { step: 'epic_legendary' | 'legendary_mythic'; fails: number; guaranteeAfter: number }[]
  }
  coin: number          // ยอด Coin ปัจจุบัน
}
```

## กระเป๋า 200 และตัวกรองเซ็ต

- `EQUIPMENT_CAPACITY` 100 → **200** (ค่าเดียวใน `monster-rules.ts`; int-spec ที่อ้างค่านี้ใช้ตัวแปร ไม่ hardcode) · ผู้เล่นเดิมไม่กระทบ
- Frontend: ตัวกรอง dropdown เลือกชื่อเซ็ต (เซ็ตบอส 7 + เซ็ตคราฟต์ 12 + "ไม่มีเซ็ต") แสดงจำนวนต่อเซ็ต · เลือกได้ทีละหนึ่ง · ใช้ร่วมกับตัวกรองเดิม · อยู่ในหน้าอุปกรณ์

## แยกชิ้น และการแลก

- แยกชิ้นเซ็ตคราฟต์: ได้หินตีบวก/รีไฟน์ตามเกรดเดิม (`DISMANTLE_STONES` เติมแถว Mythic = ค่าของตำนาน) **ไม่ได้วัตถุดิบคราฟต์คืน**
- World Boss exchange ปฏิเสธ Mythic และชิ้นเซ็ต flagship (ตรวจที่ `world-boss.service.ts` ที่เดิมปฏิเสธ LEGENDARY)

## Balance gate (บังคับก่อนปล่อย เพราะเปิด PvP พร้อมกัน)

spec ใหม่ `craft-balance.spec.ts` (แนวเดียวกับ `passive-balance.spec.ts`) รันบน `simulateArena` แบบกำหนด seed:

- ตั้งเงื่อนไขแบบเดียวกับที่ใช้จูนเซ็ตบอส (อุปกรณ์ Epic +10, ร่าง Ultimate) ทุกสาย (line) ทุก seed ที่กำหนด
- แต่ละเซ็ตคราฟต์ (4 ชิ้น) สู้กับแต่ละเซ็ตบอส (4 ชิ้น) · **อัตราชนะเฉลี่ยของเซ็ตต้องอยู่ 47–53%** (flagship ได้ถึง 55%)
- ถ้าไม่ผ่าน = จูนตัวเลข 4 ชิ้นใน `SET_DEFINITIONS` ไม่ใช่ลดเกณฑ์
- ต้องเร็วพอรันใน `yarn test` ปกติ (จำกัดจำนวน seed); ตัวเลขอัตราชนะจริงบันทึกไว้ในคอมเมนต์ของ spec
- เซ็ต care (11, 12) ต้อง **ไม่แรงกว่าค่าเฉลี่ย** (ไม่บังคับให้ชนะ 47%) เพราะมีค่าตอบแทนฝั่งดูแลแล้ว: เกณฑ์ 40–50%

## Test plan

Backend (ทุกอย่างต้องผ่านก่อนเปิด PR): `yarn lint:ci`, `yarn build`, `yarn test` (รวม `battle-engine.golden.spec.ts` **โดยไม่ regenerate**, `arena-engine.spec.ts`), `craft-balance.spec.ts`, spec ใหม่ของ `craft-data`, `equipment-data` (Mythic, set ใหม่), `mergeEffects`/`capEffects`, และ `*.int-spec.ts` ของ craft (start/skip/claim, ไม่พอวัตถุดิบ, กระเป๋าเต็ม, กดซ้ำ, pity) · ถ้ารัน int-spec ไม่ได้ในเครื่อง (ต้องมี Postgres `test`) ให้บอกชัดเจนว่าไม่ได้รัน

Frontend: `yarn lint:ci`, `yarn build`, `yarn test` · test ของ helper (ตัวกรองเซ็ต, label/สี Mythic, คำอธิบายเอฟเฟกต์ใหม่)

## ขอบเขต Frontend

- เมนูใหม่ "คราฟต์" (`game-menu.ts` + panel `CraftPanel.tsx`) ตาม skill `new-frontend-page` · query/mutation hooks ใน `tamagotchi-service.tsx`, types ใน `tamagotchi-interface.ts` (เติม `MYTHIC` ใน enum)
- แสดง: รายการสูตรแยกตามเซ็ต (เห็นทุกสูตร, สูตรที่ขาดวัตถุดิบบอกว่าขาดอะไรและดรอปจากไหน) · คิว (นับถอยหลัง, ปุ่มข้าม + ราคา, ปุ่มรับ, เตือนเมื่อกระเป๋าเต็ม) · Catalyst (จำนวน, โอกาส, pity) · ผลที่ได้หลังรับ (เกรด, อัปเกรดหรือไม่) · ลิงก์ไปหน้าอุปกรณ์
- เกรด Mythic: ชื่อ/สีใน `tamagotchi-helper.ts`, สไตล์พิเศษใน `EquipmentPanel.tsx` (ตอนนี้เช็ก `LEGENDARY` ตรง ๆ)
- ตัวกรองเซ็ตในหน้าอุปกรณ์ · คำอธิบายเอฟเฟกต์ใหม่ + ชื่อวัตถุดิบ · Wiki แสดงค่าคงที่ craft จาก `GET /monster/wiki`
- ไม่มีกติกาเกมฝั่ง frontend: ราคา/โอกาส/เวลาอ่านจากเซิร์ฟเวอร์ทั้งหมด

## ลำดับงาน

1. เกรด Mythic + ตาราง `Record` + `costume` + World Boss exchange
2. เอฟเฟกต์ arena ใหม่ + 12 เซ็ต (`SET_DEFINITIONS`, `EQUIPMENT_TEMPLATES`, `care`) + `craft-balance.spec.ts` จนผ่าน
3. วัตถุดิบ + ดรอป (Adventure, Expedition, Raid, World Boss) + กระเป๋า 200
4. คิวคราฟต์ (entity, migration, service, controller, wiki) + int-spec
5. Frontend ทั้งหมด
6. อัปเดต roadmap เป็น ✅, เปิด PR เข้า `main` ทั้งสอง repo

## ที่ยังไม่รู้/ความเสี่ยง

- ตัวเลขทั้งหมดยังไม่ผ่านการเล่นจริง: เกณฑ์ balance gate เป็นเพียงตัวแทนของ "ไม่พัง" ไม่ใช่ "สนุก"
- ราคา/เวลา/อัตราดรอปต้องเทียบกับ Coin ต่อชั่วโมงจริงก่อนปล่อย
- PvP พร้อมกัน: เอฟเฟกต์คุม (slow/stun) เป็นจุดที่พังง่ายที่สุด จึงมีเพดาน stun 15% และพึ่ง DR ของ CC ใน arena ที่มีอยู่แล้ว
- กระเป๋า 200 ช่อง เพิ่มโหลดรายการในหน้าอุปกรณ์ ตรวจประสิทธิภาพ list ฝั่ง frontend
