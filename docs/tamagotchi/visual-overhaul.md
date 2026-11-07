# Monster visual overhaul (2.5D arena look)

Notes for the next session working on the monster game's new look. The work so far is a
standalone prototype, not yet in the game.

**Talk to the owner in Thai.** Every reply, progress note and question must be in Thai. They have
asked for this more than once.

## Where it lives

- Live prototype (claude.ai Artifact, private to the owner):
  https://claude.ai/artifact/CjvCJ453cPeJxVzQrsTTDj
  To change it from a new session, read it with the Artifact tool, edit, and republish to the same
  URL.
- Source copy: `docs/tamagotchi/prototypes/monster-arena-25d.html`. It is one self-contained page:
  open it in a browser to run it. Add a `<!doctype html>` wrapper if a browser renders it oddly.
- The page has a "ดูส่วน" dropdown at the top: all / fire / water / leaf / earth / lightning
  (each "monsters + skills") / holy / dark / plan. The battle scene always
  stays on top. Choosing an element also shows only that element's skill buttons under the arena
  and puts one of its monsters in the arena. On a phone (≤ 760 px) the arena is pinned under the
  picker so a skill button lower down still shows its action; on a wide screen pressing a button
  scrolls the arena into view if it is off screen.
- Egg cards only stand still (eggs cannot fight). Draft lines use still cards (`buildBoard(…,
  true)`, `buildLineup(…, true)`, `addCard(…, 8, true)`): one idle frame, no particles.

## How the owner wants to work (read this first)

- Reply in Thai, short and concrete. Say what changed and where to look on the page.
- **New line = still pictures first.** Draw the 11 forms, the fused form and the boss as still
  drafts (`buildBoard(…, true)`, `buildLineup(…, true)`, `addCard(…, 8, true)`), publish, and wait.
  Only after the owner approves: drop the still flags, animate, and do the line's 8 skills.
- When the owner rejects a design twice, stop guessing: offer **three options side by side** (as
  for ราชาวาฬผลึก and อสนีผู้ตื่น) and let them pick. When they send a reference picture, follow
  it closely (they may say "เป๊ะ"); if it faces the viewer, turn it to a side view facing right.
- Small sketches on a screenshot (a red line, a circle) are exact limits: keep to them.
- Flyers must move on their wings (the `FLY` rig), not walk.
- After every change: render the sprite sheet / run the skills in Playwright, look at the
  pictures, fix what looks wrong, then publish the Artifact, update this file, commit and push
  (`Update:` / `New:` / `Fix:` tags only).
- Renaming: the owner said to give skills new names that fit the new animals. Names on the page
  are proposals for when the art goes into the game; `species-data.ts` / `arena-data.ts` in
  `demo-app-backend` still have the old names (see "Names to apply in the game" below).

## Direction the owner approved

- Style: pixel art in a 3/4 top-down 2.5D arena, like a sprite-based monster battle clip the
  owner shared. Everything is drawn by code. Never copy characters or art from existing games;
  make original designs only.
- Arena: three times the screen in width and height. The camera follows the fight, and a minimap
  sits in the corner. In demo mode the monsters walk around freely.
- Animation: crisp pixel frames, sampled from continuous pose curves and baked lazily (idle 12,
  walk 12, attack 16, cast 16, hurt 6). The attack runs wind-up, rush, hit-hold, return. The walk
  phase follows the distance walked, so feet do not slide. Movement accelerates and decelerates.
  The world is drawn at screen resolution so positions move between pixels.
- Each line keeps one animal family. A form must be a creature, never an object or a person.
  Higher stages are bigger and grander: babies are small, perfect forms are 56–64 px, ultimate
  forms are 64–80 px, fused forms are 64–88 px with a twin aura, bosses are 96 px.
- Stages must be readable. Every card and the battle HUD show a stage badge with stars. All
  evolution cards draw at the same pixel scale. Each line has a line-up strip from egg to its top
  form.
- Water monsters float and swim; they don't walk. The owner found the first water set too plain.
  The redraw added saturated colours, patterns, pulsing bioluminescent glows and see-through fins.

## Status

| Part | State |
|---|---|
| Fire line, 11 forms | Done: distinct colour per form, rigged |
| Fire skills, all 8 from `arena-data.ts` | Done: each animation matches its mechanic (range, zone delay, beam, multi-hit, status) |
| Fire fused (อวตารสุริยะ) and world boss (มังกรเพลิงกัลป์) | Done (boss redesigned once: 4-legged dragon, raised wings) |
| Water line, 11 forms | Done (v2, more detail) |
| Water ultimate | The owner chose option C, adjusted: crystal-horn whale, whale flippers instead of "hands", thick armour plates on the back. Working name ราชาวาฬผลึก (replaces วาฬราชันตรีศูล). Options A and B remain on the page for comparison |
| Water skills, all 8 | Done: shields, cleanse and regen work in the prototype |
| Water fused (สมุทรผู้ตื่น) | Done, redrawn once: original roaring sea dragon in an S-curve. The gold belly always faces the front and bottom: the belly is on the right of the tail-to-head direction, the back on the left. It has a continuous see-through dorsal sail, shoulder fin-wings, a glowing lateral line, a long-snouted roaring head and swept-back crystal horns |
| Water world boss (เต่ายักษ์วารี) | Done |
| Plan table for all 8 lines | On the page: which forms to keep and which to replace, with reasons |
| Leaf line, 11 forms | Done. Deer main branch (กวางใบไม้ → กวางเขาพฤกษา → เทพพนาลัย, a jade elk carrying a small forest), wolf branch (หมาป่าไพร → หมาป่าเปลือกไม้ → ราชาหมาป่าพงไพร, a tall dark wolf with a thick silver neck ruff and vines wrapped round its body, legs and tail; the owner asked to drop the tree on its back). Poor forms stay funny: เห็ดง่วง is a sleepy critter with a red mushroom cap on its back, ตอไม้แก่ a sleepy stump with a carved face and moss beard |
| Leaf skills, all 8 | Done. New statuses in the prototype: root (`rootT`, can't walk, vines round the feet), silence (`silenceT`, crossed speech bubble, auto mode only basic-attacks), poison (`poisonT`, 2% HP a second), lifesteal (กรงเล็บไพร heals 30% of each hit), and the ent passive (`ent`: 1.2% regen a second, 8% less damage, bark flash) |
| Leaf fused (พนาผู้ตื่น) | Done: the awakened elk, mint-white body, gold armour on face/chest/back, gold branch antlers with glowing leaves, twin green/gold leaf rings |
| Leaf boss (พฤกษาโบราณ) | Done. The leaf line has no world boss (ต้นไม้โบราณ is earth), so this is the leaf raid boss `ancient_flora`: an ancient moss bear with a blossom tree and a small grove on its back. Choosing it switches the arena to the new forest theme, and the HUD says บอสเรด |
| Earth line, 11 forms | Done and animated (the owner approved the still drafts). Tortoise branch (เต่าศิลา → เต่าผาหิน with basalt pillars → เต่าภูเขา carrying a snowy mountain), rhino branch (แรดผา → แรดเกราะแร่ → ไททันแรดคริสตัล with a topaz horn). Poor forms: หนอนดินเกียจคร้าน, ก้อนหินขี้เกียจ |
| Earth skills, all 8 | Done. New statuses in the prototype: stun (`stunT`, spinning stars, can't walk, auto mode waits), stone shield (`bubbleStone` on the shared bubble shield), attack up (`atkUpT`, ×1.2 outgoing damage, orange arrow), and the boulder's stone skin (`stoneSkin`: 12% less damage, crowd control 40% shorter, 15% slower). Heavy forms walk up close before ธรณีสั่น because they are slow |
| Earth fused (ธรณีผู้ตื่น) | Done. After several rounds the owner picked the first redraw (a slim crouching rock beast in charcoal scale tufts with rust stripes, a tail curling up over its back, a three-lobed bone mask with one glowing cyan eye) and asked for it slimmer, with the amber belly kept to the lower part of the body (below y 66 in the 88 px grid) |
| Earth world boss | Done: ตัวนิ่มศิลาโบราณ, a stone pangolin with thorned scale rows (the game's ต้นไม้โบราณ is earth; the new name is only a proposal). Choosing it switches the arena to the new canyon theme |
| Lightning line, 11 forms + fused + boss | Done and animated (owner approved, with the cat branch turned into foxes). Bird branch (นกฟ้าผ่า → เหยี่ยวพายุ → วิหคราชาอสนี) flies on the `FLY` rig like the fused form; fox branch (จิ้งจอกพายุ → จิ้งจอกอสนี two tails → ราชาจิ้งจอกอสนี five tails, `boltTail`). Fused อสนีผู้ตื่น is the storm wyvern (owner's option C). World boss: storm bison (the game's จักรกลพายุ is a machine; กระทิงพายุคำราม is a proposed name), with a new storm arena theme |
| Lightning skills, all 8 | Done. New statuses in the prototype: static (`staticT`, crackling sparks, 30% a second to seize for 0.4 s, as `staticChance`/`staticStunSec` in the game), haste (`hasteT`, 30% faster walking, yellow after-images) and focus (`focusT`, basic-attack crit chance up, a crosshair over the head); `staticRetort` for แมวไฟสถิต's passive. Lightning is drawn with `boltLine`, a jagged line redrawn every frame so it flickers |
| Holy line, 11 forms + fused + boss | Done and animated (owner approved the drafts). Sheep → qilin main branch (ลูกแกะแสง → แกะปีกทิพย์ with feather wings and a halo → กิเลนรัศมี, one gold horn, gold back scales, cloud mane → กิเลนสุริยเทพ with a turning sun-wheel aura behind the head), lion branch (สิงห์น้อยรัศมี with a mane of light rays → ราชสีห์ปีกขาว with six wings → มหาราชสีห์เทวะ with a gold crown and light wings). Poor forms keep their names but became creatures: ทูตน้อยขี้เซา is a sleeping fluffball with tiny wings and a slipping halo, ระฆังแตก a sleepy hermit crab living in a cracked bronze bell. Fused ศักดิ์สิทธิ์ผู้ตื่น is the armoured sun qilin with light wings and twin rings (`twinh`). World boss: the game's เทวทูตรัศมี is an angel, so the proposal is a white celestial elephant, คชสารรัศมี (raised trunk, tiered gold headdress, crimson caparison, halo). New helpers: `haloRing`, `ray`, `lightMane`, `plumeWing` (a feathered wing at any angle), `scaleRow`, `qilinHead`, `lionFace` |
| Holy skills, all 8 | Done. New in the prototype: blind from light (`blindOn` sets `blindLight`: a white-gold glare instead of ink; any blind now makes 35% of basic attacks miss in `lungeHit`), the gold shield (`holyShield`, `bubbleHoly`), a shared `cleanse`, and the seraph lion's last stand (`ROSTER.winglion.lastStand`; `damage()` fires `lastStandFx` the first time HP drops below 35%: 28% shield, cleanse, `immuneT` 2 s). `rootOn`/`silenceOn`/`stunOn`/`staticOn`/`burnOn` now respect `immuneT`. The holy boss switches the arena to the new gold `temple` theme |
| Dark line, 11 forms + fused + boss | Done and animated (owner approved the drafts). Spider main branch (แมงมุมคำสาป with a curse rune → แมงมุมอสูรตาแดง, eight red eyes and a blood hourglass → ราชินีแมงมุมรัตติกาล, abdomen of night sky with stars and a crescent moon, horn crown), bat branch (ลูกค้างคาว → ค้างคาวเขี้ยวโลหิต → ค้างคาวอสูรราชันย์ with horns → จักรพรรดิค้างคาวคำสาป with torn wings and a skull breastplate); all bats fly on the `FLY` rig. Poor forms: หนูท่อมืด (grubby sleepy rat), หนูซากศพขี้เกียจ (stitched zombie rat, replaces ซอมบี้ขี้เกียจ). Fused รัตติกาลผู้ตื่น is the awakened spider queen (galaxy abdomen, black-gold armour, moon crown, twin rings `twind`). World boss: the game's จอมราตรี is a moon emoji, so the proposal is a giant translucent spirit hanging in front of a black eclipse, วิญญาณจันทร์ดับ (sprite id `darksoul`; the owner rejected the owl, then the version with arms and tail wisps: it must be a limbless ball of smoke with a face). Helpers: `memWing` (bat wing, `torn` cuts notches), `jLeg`, `spiderEyes`, `starDots` |
| Dark skills, all 8 | Done. New statuses in the prototype: curse (`curseT`, a turning violet sigil over the head; `cursed(e, n)` halves heals and shields, wired into the water, leaf and holy heals and `holyShield`), attack down (`atkDownT`, -20% damage dealt, red down arrow), defence down (reuses `defT`, +25% damage taken), and the zombie rat's passive (`ROSTER.zrat.undead`: `damage()` drains 15% of melee hits and sets `enraged`, +20% damage, below 50% HP). `cleanse` also clears curse and attack down. The dark boss switches the arena to the new purple `eclipse` theme |
| Shadow line | Choosing a direction. History: a cat/snake draft, then two attempts to redraw the owner's reference picture (hooded wraith, horned demon with a mace, armoured skeleton, crowned winged skull). The owner rejected the copies as "ประหลาด" (2026-11-07) and asked to use the picture only as a concept and design our own, e.g. a shadow knight. The page (`#shadow`) now shows three concept options side by side, three still forms each (baby 2 → adult → ultimate), in the simple chunky style of the approved bat and spider lines: A อัศวินเงา (`kbaby` floating helmet with a smoke tail → `knight` small armour with a violet-edged sword → `knightlord` horned helm, spiked pauldrons, violet chest core, smoke cape, greatsword), B ภูตฮู้ดเงา (`wbaby` round hooded wisp → `lantern` wraith with a violet lantern → `wraithlord` horned hood, torn cloak wings, scythe, floating violet flames), C อสูรเงา (`dbaby` round imp with tiny wings → `wingdemon` bat-winged demon → `demonlord` big horns, wide wings, violet flame mane and flaming hand). The owner may also mix them (one as the main branch, one as the alt). After the pick: draw all 11 forms, the fused form and the boss as stills, then animate and do the 8 skills. The rejected picture-based code is in git history (commits before this one); helpers `tf`, `shEye`, `ribbon`, `arc` stay |
| The other 16 fused forms and 8 bosses | Not started |
| Putting the art into the real game | Not started |

## Names to apply in the game (when the art goes in)

The prototype uses these; the game data still has the old ones.

| Kind | Game id | Old name | New name |
|---|---|---|---|
| Skill | `ltn_claw` | เล็บพายุ | ข่วนสายฟ้า |
| Skill | `ltn_hoof` | กีบอสนี | โฉบอสนี |
| Skill | `ltn_vajra` | วัชระผ่าฟ้า | หางปาอสนี |
| Species | see the plan table on the page | อัคนีพยัคฆ์, ราชาสุริยะ, … | อัคนีแผงคอ, ราชันมังกรสุริยะ, … |

Still to ask the owner (old animal names left on skills): ดาบรัศมี / ธนูรัศมี (holy: a knight's sword and a bow, now the lion cub's light claw and the qilin's horn arrow), ตรีศูลสมุทร (water), กรงเล็บไพร /
งวงพฤกษา / พิทักษ์พนา (leaf), อุ้งตีนผา / ขนแร่ (earth).

## Open items and known gaps

- Weapon/equipment sets: the boss-set arena rebalance (backend PR #27) and the 12 craft sets with the Mythic grade (backend PR #29, frontend PRs #29 and #30) are merged, released (backend 1.38.0, frontend 1.46.0) and deployed (Cloud Run and Cloudflare Pages) as of 2026-11-05. Frontend PR #31 (craft patch notes) is still open.

- The glow on the crystal whale's horn tip does not follow the head during the attack pose
  (`glows` are static sprite coordinates).
- The fire line is less detailed than water v2. Plan: raise it to the same level.
- New names (ราชาวาฬผลึก and the names in the plan table) are proposals only. The game data in
  `demo-app-backend` `species-data.ts` is unchanged.
- The skill name "ตรีศูลสมุทร" is still the game's name. Ask the owner before renaming it.
- Lightning skills renamed on the owner's word (see the table above).
- Earth skill names that still name old animals: อุ้งตีนผา (bear paw, now the pillar tortoise's
  stamp), ขนแร่ (hedgehog quills, now ore spines fired from the ore rhino's armour).
- Leaf skill names still name the old animals: กรงเล็บไพร (tiger claw, now the stag's three antler
  slashes), งวงพฤกษา (elephant trunk, now a thick vine that rears up from the bark wolf's back),
  พิทักษ์พนา (ent, now the wolf king's passive). Ask the owner before renaming them.
- `ROSTER` in the prototype gives the wolf king the ent passive from the start, so it regenerates in
  every fight there.
- Perfect forms have no aura yet. The idea is a small sparkle at the feet to tell them from
  adult forms.
- Guarding: the game has no manual guard. The prototype's guard pose stands for the "ปัดป้อง"
  parry dodge skill (50% damage cut, no dash).

## Next steps (suggested order)

1. Shadow line (last one): the still drafts are on the page (`#shadow`). Wait for the owner. If they reject a form
   twice, offer three options side by side. After approval: drop the still flags (`buildBoard(…, true)`,
   `buildLineup(…, true)`, `addCard(…, 8, true)`), animate, and do the 8 skills (`shd_*` in `arena-data.ts`:
   kunai spread of 3, flee = evasion + focus, silencing arrow shot, double-poison bite, blinding mist burst,
   sting passive = 30% poison on basic hits, execute strike, void passive = dodge bonus). Skill names that still
   name the old animals/people (คุไนเงา, ศรเงียบ, เหล็กในเงา, อวสานเงา, จักรวาลเงา) must be asked about first;
   the new forms are demons and skeletons, so the kunai/arrow/sting animations need new ideas (claw throw, bone arrow, mace strike).
2. Integration plan for the real game: replace the emoji in `ArenaReplay.tsx` with sprite frames.
   Positions come from the server replay, so poses map to replay events (walk while moving,
   attack/cast at skill events, the parry pose on dodge events with `parry`). Combat results stay
   unchanged.

## How the prototype code is organised (inside the HTML)

- `Spr`: draws shapes on a pixel grid (`E` ellipse, `P` polygon, `L` tapered line, `spike`, `d`
  detail pixel, `line`, `eye`). It shades automatically with light from the top-left, outlines
  automatically, and supports translucent palettes (`#rrggbbaa`).
- `MATS`: palettes, 5 tones each. `GLOW`: emissive materials.
- `SPRITES[id]`: `size`, `rig` (QUAD / BIPED / BLOB / SWIM), `draw(s, P)` with pose offsets,
  `emit` particle emitters, `mouth`, optional `hover`, `aura`, and `glows`.
- `ANIM` + `getFrame`: pose curves and lazy frame baking.
- `FIRE` / `WATER` / `LEAF`: game-skill animations (`useFire(id, att, def)` dispatches all of
  them; `skillEl(id)` picks the tag colour, `elCols(el)` the particle colours).
- Leaf helpers: `leafShape` (pointed leaf), `grove` (small tree), `flower`, `rootsUp` (ring of
  roots bursting from the ground), `drawRazorLeaf`. `LEAF_IDS` marks which sprites are leaf.
- `THEMES` / `floors`: cave, lava (fire boss) and forest (leaf boss) arenas.
- `STAGES` / `STAGE_OF`: the stage badges.
- `ROSTER`: what the battle selectors offer.
